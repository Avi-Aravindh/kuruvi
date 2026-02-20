#!/usr/bin/env node

import { AgentScheduler } from './scheduler';
import * as dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: '.env.local' });

const REQUIRED_ENV_VARS = [
  'NEXT_PUBLIC_CONVEX_URL',
  'DISCORD_WEBHOOK_URL',
];

function validateEnv() {
  const missing = REQUIRED_ENV_VARS.filter((key) => !process.env[key]);

  if (missing.length > 0) {
    console.error('Missing required environment variables:');
    missing.forEach((key) => console.error(`  - ${key}`));
    process.exit(1);
  }

  // Check for at least one agent bot token
  const agentTokens = [
    'DISCORD_BOT_TOKEN_HELIX',
    'DISCORD_BOT_TOKEN_JONY',
    'DISCORD_BOT_TOKEN_TURING',
    'DISCORD_BOT_TOKEN_NITTY',
  ];

  const configuredAgents = agentTokens.filter((key) => process.env[key]);

  if (configuredAgents.length === 0) {
    console.error('No agent bot tokens configured!');
    console.error('Please set at least one of:');
    agentTokens.forEach((key) => console.error(`  - ${key}`));
    process.exit(1);
  }

  console.log(`Found ${configuredAgents.length} configured agent bot(s)`);
}

async function main() {
  console.log('🐦 Kuruvi Agent System');
  console.log('='.repeat(50));

  validateEnv();

  // Build agent bot configuration from environment
  const agentBots = [
    { name: 'Helix', token: process.env.DISCORD_BOT_TOKEN_HELIX },
    { name: 'Jony', token: process.env.DISCORD_BOT_TOKEN_JONY },
    { name: 'Turing', token: process.env.DISCORD_BOT_TOKEN_TURING },
    { name: 'Nitty', token: process.env.DISCORD_BOT_TOKEN_NITTY },
  ].filter((bot) => bot.token) as { name: string; token: string }[];

  const scheduler = new AgentScheduler({
    convexUrl: process.env.NEXT_PUBLIC_CONVEX_URL!,
    agentBots,
    discordWebhookUrl: process.env.DISCORD_WEBHOOK_URL!,
    discordChannelId: process.env.DISCORD_CHANNEL_ID,
  });

  // Handle shutdown gracefully
  process.on('SIGINT', async () => {
    console.log('\nShutting down gracefully...');
    await scheduler.stop();
    process.exit(0);
  });

  process.on('SIGTERM', async () => {
    console.log('\nShutting down gracefully...');
    await scheduler.stop();
    process.exit(0);
  });

  // Start the scheduler
  await scheduler.start();

  // Keep the process running
  console.log('\nPress Ctrl+C to stop');
}

main().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});
