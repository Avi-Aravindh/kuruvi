import { ConvexHttpClient } from 'convex/browser';
import { api } from '../convex/_generated/api';
import { DiscordClient } from './discord-client';
import type { Id } from '../convex/_generated/dataModel';

export interface AgentConfig {
  id: 'helix' | 'ada' | 'turing' | 'steve' | 'jony' | 'nitty' | 'wanderer';
  name: string;
  trait: string;
  emoji: string;
  personality: string;
  systemPrompt: string;
}

export interface Task {
  _id: Id<'tasks'>;
  title: string;
  description?: string;
  agent: string;
  status: 'queued' | 'in_progress' | 'completed' | 'blocked';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  createdBy: string;
  createdAt: number;
  updatedAt: number;
  completedAt?: number;
  discordThreadId?: string;
}

export abstract class BaseAgent {
  protected config: AgentConfig;
  protected convex: ConvexHttpClient;
  protected discord: DiscordClient;
  protected sharedWebhookUrl: string;

  constructor(
    config: AgentConfig,
    convexUrl: string,
    botToken: string,
    sharedWebhookUrl: string,
    channelId?: string
  ) {
    this.config = config;
    this.convex = new ConvexHttpClient(convexUrl);
    this.sharedWebhookUrl = sharedWebhookUrl;

    // Each agent gets their own Discord client instance
    this.discord = new DiscordClient({
      botToken: botToken,
      botUsername: config.name,
      webhookUrl: sharedWebhookUrl,
      agentWorkspaceChannelId: channelId,
    });
  }

  async initialize(): Promise<void> {
    await this.discord.connect();
    console.log(`[${this.config.name}] Discord bot connected`);
  }

  async shutdown(): Promise<void> {
    await this.discord.disconnect();
    console.log(`[${this.config.name}] Discord bot disconnected`);
  }

  /**
   * Main execution loop - called every 15 minutes
   */
  async run(): Promise<void> {
    console.log(`[${this.config.name}] Starting execution cycle...`);

    try {
      // 1. Check for DMs (highest priority)
      const dmTasks = await this.checkDirectMessages();
      if (dmTasks.length > 0) {
        console.log(`[${this.config.name}] Found ${dmTasks.length} DM tasks`);
        for (const task of dmTasks) {
          await this.processTask(task);
        }
        return; // DMs handled, exit
      }

      // 2. Check Convex queue for tasks assigned to this agent
      const queuedTasks = await this.getQueuedTasks();
      if (queuedTasks.length === 0) {
        console.log(`[${this.config.name}] No tasks in queue`);
        return;
      }

      // 3. Pick highest priority task
      const task = this.selectNextTask(queuedTasks);
      console.log(`[${this.config.name}] Processing task: ${task.title}`);

      // 4. Process the task
      await this.processTask(task);

    } catch (error) {
      console.error(`[${this.config.name}] Error during execution:`, error);
      await this.discord.sendAgentUpdate(
        `❌ **${this.config.name}** encountered an error: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  /**
   * Check Discord DMs for new task requests
   */
  private async checkDirectMessages(): Promise<Task[]> {
    const dms = await this.discord.getUnreadDMs();
    const tasks: Task[] = [];

    for (const dm of dms) {
      // Create a task from DM content
      const taskId = await this.convex.mutation(api.tasks.create, {
        title: dm.content.substring(0, 200), // Truncate if too long
        description: `From Discord DM by ${dm.author.username}`,
        agent: this.config.id,
        priority: 'urgent', // DMs are always urgent
        createdBy: `discord:${dm.author.id}`,
      });

      // Acknowledge the DM
      await this.discord.replyToDM(
        dm,
        `Got it! I'll work on this right away. 🐦\nTask ID: ${taskId}`
      );

      // Fetch the created task
      const task = await this.convex.query(api.tasks.list);
      const createdTask = task.find((t: any) => t._id === taskId);
      if (createdTask) {
        tasks.push(createdTask as Task);
      }
    }

    return tasks;
  }

  /**
   * Get queued tasks for this agent from Convex
   */
  private async getQueuedTasks(): Promise<Task[]> {
    const tasks = await this.convex.query(api.tasks.getByAgent, {
      agent: this.config.id,
    });

    return tasks.filter((t: any) => t.status === 'queued') as Task[];
  }

  /**
   * Select the next task based on priority
   */
  private selectNextTask(tasks: Task[]): Task {
    const priorityOrder = { urgent: 4, high: 3, medium: 2, low: 1 };

    return tasks.sort((a, b) => {
      const priorityDiff = priorityOrder[b.priority] - priorityOrder[a.priority];
      if (priorityDiff !== 0) return priorityDiff;

      // If same priority, older tasks first
      return a.createdAt - b.createdAt;
    })[0];
  }

  /**
   * Process a task - implemented by each agent
   */
  private async processTask(task: Task): Promise<void> {
    try {
      // 1. Mark as in progress
      await this.convex.mutation(api.tasks.updateStatus, {
        taskId: task._id,
        status: 'in_progress',
        agentName: this.config.name,
      });

      // 2. Create Discord thread if needed
      let threadId = task.discordThreadId;
      if (!threadId) {
        // TODO: Create thread in agent-workspace channel
        // threadId = await this.discord.createTaskThread(...)
      }

      // 3. Send start notification
      await this.discord.sendAgentStatusUpdate({
        agentName: this.config.name,
        agentEmoji: this.config.emoji,
        taskTitle: task.title,
        status: 'started',
        threadId,
      });

      // 4. Execute the actual work (implemented by subclass)
      const result = await this.executeTask(task);

      // 5. Mark as completed or blocked
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
          threadId,
        });
      } else {
        await this.convex.mutation(api.tasks.updateStatus, {
          taskId: task._id,
          status: 'blocked',
          agentName: this.config.name,
        });

        await this.discord.sendAgentStatusUpdate({
          agentName: this.config.name,
          agentEmoji: this.config.emoji,
          taskTitle: task.title,
          status: 'blocked',
          details: result.error || 'Task blocked',
          threadId,
        });
      }

    } catch (error) {
      console.error(`[${this.config.name}] Error processing task:`, error);

      await this.convex.mutation(api.tasks.updateStatus, {
        taskId: task._id,
        status: 'blocked',
        agentName: this.config.name,
      });

      await this.discord.sendAgentUpdate(
        `❌ **${this.config.name}** ${this.config.emoji} failed on task: ${task.title}\nError: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  /**
   * Execute the task - must be implemented by each agent
   */
  protected abstract executeTask(task: Task): Promise<{
    success: boolean;
    output?: string;
    error?: string;
  }>;
}
