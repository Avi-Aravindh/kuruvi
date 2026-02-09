import { Client, GatewayIntentBits, Message, TextChannel } from 'discord.js';

export interface DiscordConfig {
  botToken: string;
  webhookUrl: string;
  agentWorkspaceChannelId?: string;
}

export class DiscordClient {
  private client: Client;
  private config: DiscordConfig;
  private isReady = false;

  constructor(config: DiscordConfig) {
    this.config = config;

    // Initialize Discord client with necessary intents
    this.client = new Client({
      intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent, // Required for reading DM content
        GatewayIntentBits.DirectMessages,
      ],
    });

    this.setupEventHandlers();
  }

  private setupEventHandlers() {
    this.client.on('ready', () => {
      console.log(`Discord bot logged in as ${this.client.user?.tag}`);
      this.isReady = true;
    });

    this.client.on('error', (error) => {
      console.error('Discord client error:', error);
    });
  }

  async connect(): Promise<void> {
    if (this.isReady) return;
    await this.client.login(this.config.botToken);

    // Wait for ready event
    await new Promise<void>((resolve) => {
      if (this.isReady) {
        resolve();
      } else {
        this.client.once('ready', () => resolve());
      }
    });
  }

  async disconnect(): Promise<void> {
    await this.client.destroy();
    this.isReady = false;
  }

  /**
   * Send a message to a specific channel
   */
  async sendChannelMessage(channelId: string, content: string): Promise<void> {
    const channel = await this.client.channels.fetch(channelId);
    if (channel?.isTextBased()) {
      await (channel as TextChannel).send(content);
    }
  }

  /**
   * Send a message to the agent workspace channel
   */
  async sendAgentUpdate(message: string): Promise<void> {
    if (this.config.agentWorkspaceChannelId) {
      await this.sendChannelMessage(this.config.agentWorkspaceChannelId, message);
    } else {
      // Fallback to webhook
      await this.sendWebhook(message);
    }
  }

  /**
   * Send a message via webhook (fallback method)
   */
  async sendWebhook(content: string, username?: string): Promise<void> {
    await fetch(this.config.webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        content,
        username: username || 'Kuruvi Agent',
      }),
    });
  }

  /**
   * Listen for DMs sent to the bot
   * Returns a handler that can be used to stop listening
   */
  onDirectMessage(callback: (message: Message) => void | Promise<void>): () => void {
    const handler = async (message: Message) => {
      // Ignore bot's own messages
      if (message.author.id === this.client.user?.id) return;

      // Only process DMs (no guild)
      if (!message.guild) {
        await callback(message);
      }
    };

    this.client.on('messageCreate', handler);

    // Return cleanup function
    return () => {
      this.client.off('messageCreate', handler);
    };
  }

  /**
   * Get all unread DMs for the bot
   */
  async getUnreadDMs(): Promise<Message[]> {
    const dms: Message[] = [];

    // Fetch all DM channels
    const dmChannels = this.client.channels.cache.filter(
      (channel) => channel.isDMBased()
    );

    for (const [, channel] of dmChannels) {
      if (channel.isTextBased()) {
        const messages = await (channel as TextChannel).messages.fetch({ limit: 10 });

        // Filter for messages not from the bot
        const userMessages = messages.filter(
          (msg) => msg.author.id !== this.client.user?.id
        );

        dms.push(...userMessages.values());
      }
    }

    return dms.sort((a, b) => a.createdTimestamp - b.createdTimestamp);
  }

  /**
   * Reply to a DM
   */
  async replyToDM(message: Message, reply: string): Promise<void> {
    await message.reply(reply);
  }

  /**
   * Create a thread in a channel for task discussion
   */
  async createTaskThread(
    channelId: string,
    taskTitle: string,
    initialMessage: string
  ): Promise<string> {
    const channel = await this.client.channels.fetch(channelId);

    if (channel?.isTextBased()) {
      const message = await (channel as TextChannel).send(initialMessage);
      const thread = await message.startThread({
        name: taskTitle.substring(0, 100), // Max 100 chars
        autoArchiveDuration: 1440, // 24 hours
      });

      return thread.id;
    }

    throw new Error('Could not create thread - invalid channel');
  }

  /**
   * Send a formatted agent update message
   */
  async sendAgentStatusUpdate(params: {
    agentName: string;
    agentEmoji: string;
    taskTitle: string;
    status: 'started' | 'completed' | 'blocked' | 'moved';
    details?: string;
    threadId?: string;
  }): Promise<void> {
    const { agentName, agentEmoji, taskTitle, status, details, threadId } = params;

    const statusEmoji = {
      started: '🔄',
      completed: '✅',
      blocked: '🚫',
      moved: '➡️',
    };

    let message = `${statusEmoji[status]} **${agentName}** ${agentEmoji}\n`;
    message += `**${taskTitle}**\n`;

    if (status === 'started') {
      message += `Started working on this task`;
    } else if (status === 'completed') {
      message += `Completed this task`;
    } else if (status === 'blocked') {
      message += `Blocked on this task`;
    } else if (status === 'moved') {
      message += `Task reassigned`;
    }

    if (details) {
      message += `\n\n${details}`;
    }

    if (threadId) {
      const channel = await this.client.channels.fetch(this.config.agentWorkspaceChannelId!);
      if (channel?.isTextBased()) {
        const thread = await (channel as TextChannel).threads.fetch(threadId);
        if (thread) {
          await thread.send(message);
          return;
        }
      }
    }

    await this.sendAgentUpdate(message);
  }
}
