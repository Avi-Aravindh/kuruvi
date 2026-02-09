import { CronJob } from 'cron';
import { HelixAgent } from './helix';
import { AdaAgent } from './ada';
// Import other agents as we create them

export interface AgentBotConfig {
  name: string;
  token: string;
}

export interface SchedulerConfig {
  convexUrl: string;
  agentBots: AgentBotConfig[];
  discordWebhookUrl: string;
  discordChannelId?: string;
}

export class AgentScheduler {
  private config: SchedulerConfig;
  private jobs: CronJob[] = [];
  private agents: any[] = [];

  constructor(config: SchedulerConfig) {
    this.config = config;
  }

  async start(): Promise<void> {
    console.log('Starting Kuruvi Agent Scheduler...');
    console.log(`Configuring ${this.config.agentBots.length} agent bots...`);

    // Map bot tokens to agent classes
    const botTokenMap = this.config.agentBots.reduce((acc, bot) => {
      acc[bot.name.toLowerCase()] = bot.token;
      return acc;
    }, {} as Record<string, string>);

    // Initialize agents with their individual bot tokens
    const agentPromises = [];

    // Helix - Always initialize first (coordinator)
    if (botTokenMap['helix']) {
      const helix = new HelixAgent(
        this.config.convexUrl,
        botTokenMap['helix'],
        this.config.discordWebhookUrl,
        this.config.discordChannelId
      );
      agentPromises.push(helix.initialize().then(() => helix));
    }

    // Ada - The Architect
    if (botTokenMap['ada']) {
      const ada = new AdaAgent(
        this.config.convexUrl,
        botTokenMap['ada'],
        this.config.discordWebhookUrl,
        this.config.discordChannelId
      );
      agentPromises.push(ada.initialize().then(() => ada));
    }

    // TODO: Add other agents when their bot tokens are configured
    // if (botTokenMap['flash']) {
    //   const flash = new FlashAgent(...);
    //   agentPromises.push(flash.initialize().then(() => flash));
    // }

    // Wait for all agents to connect
    this.agents = await Promise.all(agentPromises);

    console.log(`Initialized ${this.agents.length} agents`);

    // Start Helix in always-on mode if present
    const helixAgent = this.agents.find(a => a.config.id === 'helix');
    if (helixAgent && typeof helixAgent.startListening === 'function') {
      await helixAgent.startListening();
      console.log(`✅ Helix is now ALWAYS ON - listening for DMs in real-time`);
    }

    // Schedule other agents (not Helix)
    const otherAgents = this.agents.filter(a => a.config.id !== 'helix');
    otherAgents.forEach((agent, index) => {
      // Run every 15 minutes, staggered by 2 minutes
      const minuteOffset = index * 2;
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

    console.log('Agent scheduler running');

    // Send startup notification via webhook
    const helixStatus = helixAgent ? '⚡ **Helix is ALWAYS ON** - DM me anytime for instant response!' : '';

    await fetch(this.config.discordWebhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        content:
          `🐦 **Kuruvi Agent System Started**\n\n` +
          `${this.agents.length} agents are now active!\n\n` +
          `${helixStatus}\n\n` +
          `Other agents check tasks every 15 minutes:\n` +
          `${otherAgents.map(a => `${a.config.emoji} ${a.config.name}`).join(', ')}\n\n` +
          `You can DM any agent directly to create tasks!`,
      }),
    });
  }

  async stop(): Promise<void> {
    console.log('Stopping agent scheduler...');

    // Stop all cron jobs
    this.jobs.forEach((job) => job.stop());
    this.jobs = [];

    // Disconnect all agent Discord clients
    await Promise.all(this.agents.map(agent => agent.shutdown()));

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
