# Kuruvi Setup Guide

Complete setup instructions for the Kuruvi agent system.

## Prerequisites

- Node.js 20+
- Discord account
- Convex account (already configured)

## Step 1: Create Discord Bot

### A. Create Application

1. Go to https://discord.com/developers/applications
2. Click **"New Application"**
3. Name: `Kuruvi Agent System`
4. Click **"Create"**

### B. Configure Bot

1. Click **"Bot"** in the left sidebar
2. Click **"Add Bot"** → Confirm
3. Under **"Privileged Gateway Intents"**, enable:
   - ✅ **MESSAGE CONTENT INTENT** (required for reading DMs)
   - ✅ **SERVER MEMBERS INTENT**
   - ✅ **PRESENCE INTENT**
4. Click **"Reset Token"** → Copy the token
   - **Save this token** - you'll need it for `.env.local`

### C. Invite Bot to Server

1. Click **"OAuth2"** in the left sidebar
2. Click **"URL Generator"**
3. Under **"Scopes"**, select:
   - ✅ `bot`
4. Under **"Bot Permissions"**, select:
   - ✅ `Send Messages`
   - ✅ `Read Message History`
   - ✅ `Create Public Threads`
   - ✅ `Embed Links`
   - ✅ `Attach Files`
5. Copy the generated URL at the bottom
6. Open the URL in a new tab
7. Select your Discord server
8. Click **"Authorize"**

### D. Get Channel ID

1. In Discord, enable Developer Mode:
   - User Settings → Advanced → Developer Mode (toggle on)
2. Right-click the `#agent-workspace` channel
3. Click **"Copy Channel ID"**
4. Save this ID for `.env.local`

## Step 2: Configure Environment

Edit `.env.local` and add:

```env
# Discord Bot Configuration
DISCORD_BOT_TOKEN=your_bot_token_from_step_B4
DISCORD_WEBHOOK_URL=https://discord.com/api/webhooks/1470177692975370486/DHeFpMAD-2ARG55oKybRxR0ALEj_Mb5b74imJIQUy3fV6JYSwygUx-FKRLwmT3m3dDBb
DISCORD_CHANNEL_ID=your_channel_id_from_step_D3
```

Replace:
- `your_bot_token_from_step_B4` with the token from Step 1B
- `your_channel_id_from_step_D3` with the ID from Step 1D

## Step 3: Test the Bot

### A. Test Discord Connection

```bash
# Install dependencies
npm install

# Run agent system in dev mode
npm run agents:dev
```

You should see:
```
🐦 Kuruvi Agent System
==================================================
Starting Kuruvi Agent Scheduler...
Discord client connected
Initialized 1 agents
Scheduled Ada to run every 15 minutes (offset: 0m)
Agent scheduler running

Press Ctrl+C to stop
```

### B. Test DM Functionality

1. In Discord, find the Kuruvi bot in the member list
2. Send it a DM: `"Test task - build a landing page"`
3. The bot should reply: `"Got it! I'll work on this right away. 🐦\nTask ID: ..."`
4. Within 15 minutes, check `#agent-workspace` for Ada's update

### C. Test Web UI

1. Open https://kuruvi-six.vercel.app
2. Click **"New"**
3. Create a task:
   - Title: "Design user dashboard"
   - Agent: Ada
   - Priority: Medium
4. Click **"Create"**
5. The task should appear in Ada's queue
6. Within 15 minutes, Ada will process it

## Step 4: Verify Everything Works

✅ **Discord bot is online** (green dot in Discord member list)
✅ **Agent system is running** (console shows scheduler active)
✅ **DM replies work** (bot acknowledges DMs)
✅ **Tasks appear in Convex** (check web UI)
✅ **Agent updates post to Discord** (check #agent-workspace)

## Troubleshooting

### Bot Shows Offline

- Double-check `DISCORD_BOT_TOKEN` in `.env.local`
- Ensure intents are enabled in Discord Developer Portal
- Restart the agent system: `Ctrl+C` then `npm run agents:dev`

### Bot Doesn't Reply to DMs

- Verify **MESSAGE CONTENT INTENT** is enabled
- Check console for errors
- Try sending a fresh DM (not an old conversation)

### No Updates in Discord Channel

- Verify `DISCORD_CHANNEL_ID` is correct
- Check bot has permissions in the channel
- As fallback, updates will use webhook if channel fails

### Agent Not Processing Tasks

- Ensure Convex is connected (check `NEXT_PUBLIC_CONVEX_URL`)
- Wait up to 15 minutes for next agent cycle
- Check console logs for errors

## Next Steps

Once everything is working:

1. **Implement Remaining Agents**
   - Bolt (Builder)
   - Sage (Strategist)
   - Nova (Creator)
   - Atlas (Organizer)
   - Ember (Debugger)
   - Orbit (Explorer)

2. **Integrate Claude API**
   - Add `ANTHROPIC_API_KEY` to `.env.local`
   - Implement actual task execution in each agent

3. **Deploy Agent System**
   - Railway, Fly.io, or Render
   - Set as always-on background worker
   - Configure environment variables in platform

4. **Monitor and Iterate**
   - Watch Discord for agent updates
   - Adjust personalities and prompts
   - Add more specialized agents as needed

## Support

If you encounter issues:
1. Check console logs for error messages
2. Verify all environment variables are set correctly
3. Ensure Discord bot has proper permissions
4. Test DM functionality directly with the bot
