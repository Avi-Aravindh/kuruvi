import { BaseAgent, AgentConfig, Task } from './base-agent';
import { api } from '../convex/_generated/api';

/**
 * Helix - The Coordinator
 * Lead agent that coordinates the team, routes tasks, and provides system overview
 */
export class HelixAgent extends BaseAgent {
  constructor(
    convexUrl: string,
    botToken: string,
    webhookUrl: string,
    channelId?: string
  ) {
    const config: AgentConfig = {
      id: 'helix',
      name: 'Helix',
      trait: 'The Coordinator',
      emoji: '⚡',
      personality: 'Strategic, helpful, sees the big picture, coordinates team efforts',
      systemPrompt: `You are Helix, the Lead Coordinator agent in the Kuruvi system.

Your role is to:
- Coordinate between all agents in the team
- Route tasks to the most appropriate specialist agent
- Answer general questions about the system and project status
- Provide overview and status updates across all agents
- Help users decide which agent should handle their task
- Manage multi-agent workflows and dependencies

Your personality:
- Strategic and big-picture focused
- Helpful and approachable
- Excellent at understanding user intent
- Clear communicator
- Good at delegation and coordination
- Always knows which agent is best suited for what

When given a task, you should:
1. Understand the nature of the request
2. Determine which specialist agent(s) should handle it
3. Either route it to them OR handle it yourself if it's general/coordination
4. Provide clear status updates to the user
5. Coordinate between agents when needed

You work alongside:
- Ada (Architect) - system design, architecture
- Flash (Builder) - implementation, coding
- Oracle (Strategist) - planning, research
- Muse (Creator) - UI/UX, creative work
- Compass (Organizer) - project management
- Sleuth (Debugger) - testing, bug fixes
- Wanderer (Explorer) - discovery, experimentation`,
    };

    super(config, convexUrl, botToken, webhookUrl, channelId);
  }

  protected async executeTask(task: Task): Promise<{
    success: boolean;
    output?: string;
    error?: string;
  }> {
    try {
      // TODO: Integrate with Claude API to actually process the task
      // For now, simulate intelligent routing/coordination
      await new Promise((resolve) => setTimeout(resolve, 2000));

      // Analyze task and determine routing
      const taskLower = task.title.toLowerCase();
      let recommendation = '';

      if (taskLower.includes('design') || taskLower.includes('architect')) {
        recommendation = 'This looks like an architecture task. I recommend routing to **Ada** (The Architect).';
      } else if (taskLower.includes('build') || taskLower.includes('implement') || taskLower.includes('code')) {
        recommendation = 'This is an implementation task. I recommend routing to **Flash** (The Builder).';
      } else if (taskLower.includes('plan') || taskLower.includes('strategy') || taskLower.includes('research')) {
        recommendation = 'This requires strategic thinking. I recommend routing to **Oracle** (The Strategist).';
      } else if (taskLower.includes('ui') || taskLower.includes('ux') || taskLower.includes('creative')) {
        recommendation = 'This is a creative/design task. I recommend routing to **Muse** (The Creator).';
      } else if (taskLower.includes('bug') || taskLower.includes('fix') || taskLower.includes('debug')) {
        recommendation = 'This is a debugging task. I recommend routing to **Sleuth** (The Debugger).';
      } else if (taskLower.includes('organize') || taskLower.includes('manage') || taskLower.includes('coordinate')) {
        recommendation = 'This is an organization task. I recommend routing to **Compass** (The Organizer).';
      } else if (taskLower.includes('explore') || taskLower.includes('experiment') || taskLower.includes('discover')) {
        recommendation = 'This is an exploration task. I recommend routing to **Wanderer** (The Explorer).';
      } else {
        recommendation = 'I can handle this general task directly.';
      }

      const output = `⚡ **Helix - Task Coordination**

**Task**: ${task.title}

**Analysis**: ${recommendation}

**Status**: Task reviewed and ready for next steps.

I'm here to help coordinate the team and ensure tasks get to the right agent!`;

      return {
        success: true,
        output,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Helix is always-on and listens to DMs in real-time
   * This method sets up continuous DM monitoring
   */
  async startListening(): Promise<void> {
    console.log(`[${this.config.name}] 👂 Now listening for DMs in real-time...`);

    // Set up real-time DM listener
    this.discord.onDirectMessage(async (message) => {
      console.log(`[${this.config.name}] 📨 Received DM from ${message.author.username}`);

      try {
        // Create task from DM
        const taskId = await this.convex.mutation(api.tasks.create, {
          title: message.content.substring(0, 200),
          description: `From Discord DM by ${message.author.username}`,
          agent: 'helix', // Assign to Helix by default
          priority: 'urgent',
          createdBy: `discord:${message.author.id}`,
        });

        // Acknowledge immediately
        await this.discord.replyToDM(
          message,
          `Got it! I'm on it right away. 🐦⚡\n\nTask created: ${taskId}\n\nI'll analyze this and route it to the best agent for the job.`
        );

        // Fetch and process the task immediately
        const tasks = await this.convex.query(api.tasks.list);
        const task = tasks.find((t: any) => t._id === taskId);

        if (task) {
          // Process immediately (not waiting for cron)
          await this.processTaskImmediately(task as Task);
        }
      } catch (error) {
        console.error(`[${this.config.name}] Error handling DM:`, error);
        await message.reply(
          `Sorry, I encountered an error processing your request: ${error instanceof Error ? error.message : 'Unknown error'}`
        );
      }
    });
  }

  /**
   * Process a task immediately (for DM responses)
   */
  private async processTaskImmediately(task: Task): Promise<void> {
    // Mark as in progress
    await this.convex.mutation(api.tasks.updateStatus, {
      taskId: task._id,
      status: 'in_progress',
      agentName: this.config.name,
    });

    // Execute the task
    const result = await this.executeTask(task);

    // Update status
    if (result.success) {
      await this.convex.mutation(api.tasks.updateStatus, {
        taskId: task._id,
        status: 'completed',
        agentName: this.config.name,
      });

      await this.discord.sendAgentStatusUpdate({
        agentName: this.config.name,
        agentEmoji: this.config.emoji,
        taskTitle: task.title,
        status: 'completed',
        details: result.output,
      });
    } else {
      await this.discord.sendAgentStatusUpdate({
        agentName: this.config.name,
        agentEmoji: this.config.emoji,
        taskTitle: task.title,
        status: 'blocked',
        details: result.error,
      });
    }
  }
}
