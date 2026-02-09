#!/usr/bin/env node

import { AgentScheduler } from './scheduler';
import * as dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: '.env.local' });

const REQUIRED_ENV_VARS = [
  'NEXT_PUBLIC_CONVEX_URL',
  'DISCORD_BOT_TOKEN',
  'DISCORD_WEBHOOK_URL',
];

function validateEnv() {
  const missing = REQUIRED_ENV_VARS.filter((key) => !process.env[key]);

  if (missing.length > 0) {
    console.error('Missing required environment variables:');
    missing.forEach((key) => console.error(`  - ${key}`));
    process.exit(1);
  }
}

async function main() {
  console.log('🐦 Kuruvi Agent System');
  console.log('='.repeat(50));

  validateEnv();

  const scheduler = new AgentScheduler({
    convexUrl: process.env.NEXT_PUBLIC_CONVEX_URL!,
    discordBotToken: process.env.DISCORD_BOT_TOKEN!,
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
