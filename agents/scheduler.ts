import { CronJob } from 'cron';
import { DiscordClient } from './discord-client';
import { AdaAgent } from './ada';
// Import other agents as we create them

export interface SchedulerConfig {
  convexUrl: string;
  discordBotToken: string;
  discordWebhookUrl: string;
  discordChannelId?: string;
}

export class AgentScheduler {
  private config: SchedulerConfig;
  private discord: DiscordClient;
  private jobs: CronJob[] = [];
  private agents: any[] = [];

  constructor(config: SchedulerConfig) {
    this.config = config;

    this.discord = new DiscordClient({
      botToken: config.discordBotToken,
      webhookUrl: config.discordWebhookUrl,
      agentWorkspaceChannelId: config.discordChannelId,
    });
  }

  async start(): Promise<void> {
    console.log('Starting Kuruvi Agent Scheduler...');

    // Connect to Discord
    await this.discord.connect();
    console.log('Discord client connected');

    // Initialize agents
    this.agents = [
      new AdaAgent(this.config.convexUrl, this.discord),
      // new BoltAgent(this.config.convexUrl, this.discord),
      // new SageAgent(this.config.convexUrl, this.discord),
      // ... other agents
    ];

    console.log(`Initialized ${this.agents.length} agents`);

    // Schedule each agent to run every 15 minutes
    // Stagger them by 2 minutes to avoid overwhelming the system
    this.agents.forEach((agent, index) => {
      const minuteOffset = index * 2;

      // Cron pattern: "minute hour day month dayOfWeek"
      // Run every 15 minutes, offset by agent index
      const cronPattern = `${minuteOffset},${minuteOffset + 15},${minuteOffset + 30},${minuteOffset + 45} * * * *`;

      const job = new CronJob(cronPattern, async () => {
        try {
          await agent.run();
        } catch (error) {
          console.error(`Error running agent:`, error);
        }
      });

      job.start();
      this.jobs.push(job);

      console.log(`Scheduled ${agent.config.name} to run every 15 minutes (offset: ${minuteOffset}m)`);
    });

    // Send startup notification
    await this.discord.sendAgentUpdate(
      `🐦 **Kuruvi Agent System Started**\n\n` +
      `${this.agents.length} agents are now active and checking for tasks every 15 minutes.\n\n` +
      `Agents: ${this.agents.map(a => `${a.config.emoji} ${a.config.name}`).join(', ')}`
    );

    console.log('Agent scheduler running');
  }

  async stop(): Promise<void> {
    console.log('Stopping agent scheduler...');

    // Stop all cron jobs
    this.jobs.forEach((job) => job.stop());
    this.jobs = [];

    // Disconnect Discord
    await this.discord.disconnect();

    console.log('Agent scheduler stopped');
  }

  /**
   * Manually trigger an agent run (useful for testing)
   */
  async runAgent(agentName: string): Promise<void> {
    const agent = this.agents.find(
      (a) => a.config.name.toLowerCase() === agentName.toLowerCase()
    );

    if (!agent) {
      throw new Error(`Agent not found: ${agentName}`);
    }

    console.log(`Manually triggering ${agent.config.name}...`);
    await agent.run();
  }

  /**
   * Get status of all agents
   */
  getStatus(): any {
    return {
      running: this.jobs.length > 0,
      agents: this.agents.map((a) => ({
        name: a.config.name,
        id: a.config.id,
        trait: a.config.trait,
      })),
      jobs: this.jobs.length,
    };
  }
}
