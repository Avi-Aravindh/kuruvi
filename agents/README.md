# Kuruvi Agent System

Multi-agent autonomous task processing system with Discord integration.

## Architecture

- **Base Agent**: Abstract class that all agents extend
- **Discord Client**: Handles Discord bot communication, DMs, and webhooks
- **Scheduler**: Runs agents every 15 minutes (staggered)
- **Individual Agents**: 7 specialized agents with unique personalities

## Agents

1. **Ada (Α)** - The Architect
   - System design and architecture
   - Technical planning and specifications

2. **Bolt (⚡)** - The Builder
   - Implementation and coding
   - Building features

3. **Sage (♦)** - The Strategist
   - Planning and research
   - Strategic thinking

4. **Nova (✦)** - The Creator
   - UI/UX and creative work
   - Design and aesthetics

5. **Atlas (◎)** - The Organizer
   - Project management
   - Coordination and organization

6. **Ember (✵)** - The Debugger
   - Testing and debugging
   - Bug fixes and troubleshooting

7. **Orbit (◠)** - The Explorer
   - Discovery and experimentation
   - Research and exploration

## Setup

### 1. Create Discord Bot

1. Go to https://discord.com/developers/applications
2. Create a new application: "Kuruvi Agent System"
3. Go to "Bot" tab:
   - Click "Add Bot"
   - Enable "MESSAGE CONTENT INTENT"
   - Enable "SERVER MEMBERS INTENT"
   - Copy the bot token
4. Go to "OAuth2" > "URL Generator":
   - Scopes: `bot`
   - Permissions: `Send Messages`, `Read Message History`, `Create Public Threads`
   - Invite the bot to your Discord server

### 2. Configure Environment Variables

Add to `.env.local`:

```env
# Discord Configuration
DISCORD_BOT_TOKEN=your_bot_token_here
DISCORD_WEBHOOK_URL=your_webhook_url_here
DISCORD_CHANNEL_ID=your_channel_id_here (optional, will use webhook if not provided)
```

### 3. Run the Agent System

```bash
# Development (with auto-restart on file changes)
npm run agents:dev

# Production
npm run agents
```

## How It Works

### Execution Flow (Every 15 Minutes)

1. **Check DMs** (Highest Priority)
   - Bot checks for unread Discord DMs
   - Creates urgent tasks from DM content
   - Replies to acknowledge the DM

2. **Check Queue** (If No DMs)
   - Queries Convex for tasks assigned to this agent
   - Filters for `status: "queued"`

3. **Select Task**
   - Prioritizes: `urgent` > `high` > `medium` > `low`
   - Within same priority, older tasks first

4. **Process Task**
   - Marks task as `in_progress`
   - Creates Discord thread for discussion
   - Sends "started" notification
   - Executes the actual work
   - Marks as `completed` or `blocked`
   - Sends final status update

### Agent Staggering

Agents are staggered by 2 minutes to avoid overwhelming the system:

- Ada: :00, :15, :30, :45
- Bolt: :02, :17, :32, :47
- Sage: :04, :19, :34, :49
- Nova: :06, :21, :36, :51
- Atlas: :08, :23, :38, :53
- Ember: :10, :25, :40, :55
- Orbit: :12, :27, :42, :57

## Discord Integration

### Commands (via DM)

Send a DM directly to the bot with your task. The bot will:
1. Create a task in Convex
2. Assign it to the appropriate agent
3. Set priority to "urgent"
4. Process it in the next cycle

### Notifications

All agent updates are posted to the `#agent-workspace` channel:

- 🔄 Task started
- ✅ Task completed
- 🚫 Task blocked
- ➡️ Task reassigned
- ❌ Error occurred

## Development

### Adding a New Agent

1. Create a new agent class extending `BaseAgent`:

```typescript
import { BaseAgent, AgentConfig, Task } from './base-agent';

export class MyAgent extends BaseAgent {
  constructor(convexUrl: string, discord: any) {
    const config: AgentConfig = {
      id: 'myagent',
      name: 'MyAgent',
      trait: 'The Specialist',
      emoji: '🎯',
      personality: 'Focused and precise',
      systemPrompt: 'You are MyAgent...',
    };

    super(config, convexUrl, discord);
  }

  protected async executeTask(task: Task) {
    // Implement task execution logic
    return { success: true, output: 'Done!' };
  }
}
```

2. Add to `scheduler.ts`:

```typescript
import { MyAgent } from './myagent';

// In constructor:
this.agents = [
  new AdaAgent(this.config.convexUrl, this.discord),
  new MyAgent(this.config.convexUrl, this.discord),
  // ...
];
```

### Testing

```bash
# Run agents in development mode
npm run agents:dev

# Send a DM to the bot to test task creation
# Check Discord #agent-workspace for updates
```

## Deployment

The agent system runs as a separate Node.js process from the Next.js web app.

Options:
1. **Railway**: Deploy as a separate service
2. **Fly.io**: Deploy as a background worker
3. **Render**: Deploy as a background worker
4. **Self-hosted**: Run with PM2 or systemd

Example with PM2:

```bash
pm2 start npm --name "kuruvi-agents" -- run agents
pm2 save
pm2 startup
```

## Troubleshooting

### Bot Not Responding to DMs

- Ensure "MESSAGE CONTENT INTENT" is enabled in Discord Developer Portal
- Check bot token is correct in `.env.local`
- Verify bot is online (check Discord server member list)

### Tasks Not Processing

- Check Convex database connection
- Verify agent scheduler is running
- Check console logs for errors

### Discord Notifications Not Sending

- Verify webhook URL is correct
- Check channel ID if using direct channel posting
- Ensure bot has permission to send messages
