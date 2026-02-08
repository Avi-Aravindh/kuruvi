import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

// Register a new agent
export const register = mutation({
  args: {
    name: v.string(),
    displayName: v.string(),
    personality: v.string(),
    specialization: v.string(),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("agents")
      .withIndex("by_name", (q) => q.eq("name", args.name))
      .first();

    if (existing) {
      return existing._id;
    }

    return await ctx.db.insert("agents", {
      ...args,
      isActive: true,
      tasksCompleted: 0,
    });
  },
});

// Get all agents
export const list = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("agents").collect();
  },
});

// Update agent last run time
export const updateLastRun = mutation({
  args: {
    name: v.string(),
  },
  handler: async (ctx, args) => {
    const agent = await ctx.db
      .query("agents")
      .withIndex("by_name", (q) => q.eq("name", args.name))
      .first();

    if (agent) {
      await ctx.db.patch(agent._id, {
        lastRun: Date.now(),
      });
    }
  },
});

// Increment tasks completed
export const incrementCompleted = mutation({
  args: {
    name: v.string(),
  },
  handler: async (ctx, args) => {
    const agent = await ctx.db
      .query("agents")
      .withIndex("by_name", (q) => q.eq("name", args.name))
      .first();

    if (agent) {
      await ctx.db.patch(agent._id, {
        tasksCompleted: agent.tasksCompleted + 1,
      });
    }
  },
});
