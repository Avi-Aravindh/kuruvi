import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

// Get all tasks
export const list = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("tasks").order("desc").collect();
  },
});

// Get tasks by stage
export const getByStage = query({
  args: { stage: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("tasks")
      .withIndex("by_stage", (q) => q.eq("stage", args.stage as any))
      .collect();
  },
});

// Create a new task
export const create = mutation({
  args: {
    title: v.string(),
    description: v.optional(v.string()),
    stage: v.string(),
    priority: v.string(),
    createdBy: v.string(),
  },
  handler: async (ctx, args) => {
    const taskId = await ctx.db.insert("tasks", {
      title: args.title,
      description: args.description,
      stage: args.stage as any,
      status: "queued",
      priority: args.priority as any,
      createdBy: args.createdBy,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });

    // Log activity
    await ctx.db.insert("activity", {
      taskId,
      agentName: args.createdBy,
      action: "created",
      newStage: args.stage,
      message: `Task created: ${args.title}`,
      timestamp: Date.now(),
    });

    return taskId;
  },
});

// Update task status
export const updateStatus = mutation({
  args: {
    taskId: v.id("tasks"),
    status: v.string(),
    agentName: v.string(),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.taskId, {
      status: args.status as any,
      updatedAt: Date.now(),
    });

    await ctx.db.insert("activity", {
      taskId: args.taskId,
      agentName: args.agentName,
      action: "updated",
      message: `Status changed to ${args.status}`,
      timestamp: Date.now(),
    });
  },
});

// Move task to different stage
export const moveToStage = mutation({
  args: {
    taskId: v.id("tasks"),
    newStage: v.string(),
    agentName: v.string(),
  },
  handler: async (ctx, args) => {
    const task = await ctx.db.get(args.taskId);
    if (!task) throw new Error("Task not found");

    await ctx.db.patch(args.taskId, {
      stage: args.newStage as any,
      status: "queued",
      assignedTo: undefined,
      updatedAt: Date.now(),
    });

    await ctx.db.insert("activity", {
      taskId: args.taskId,
      agentName: args.agentName,
      action: "moved",
      previousStage: task.stage,
      newStage: args.newStage,
      message: `Moved from ${task.stage} to ${args.newStage}`,
      timestamp: Date.now(),
    });
  },
});

// Assign task to agent
export const assign = mutation({
  args: {
    taskId: v.id("tasks"),
    agentName: v.string(),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.taskId, {
      assignedTo: args.agentName,
      status: "in_progress",
      updatedAt: Date.now(),
    });

    await ctx.db.insert("activity", {
      taskId: args.taskId,
      agentName: args.agentName,
      action: "updated",
      message: `Assigned to ${args.agentName}`,
      timestamp: Date.now(),
    });
  },
});

// Complete a task
export const complete = mutation({
  args: {
    taskId: v.id("tasks"),
    agentName: v.string(),
    artifacts: v.optional(v.object({
      files: v.optional(v.array(v.string())),
      notes: v.optional(v.string()),
      links: v.optional(v.array(v.string()))
    })),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.taskId, {
      status: "completed",
      artifacts: args.artifacts,
      completedAt: Date.now(),
      updatedAt: Date.now(),
    });

    await ctx.db.insert("activity", {
      taskId: args.taskId,
      agentName: args.agentName,
      action: "completed",
      message: `Task completed by ${args.agentName}`,
      timestamp: Date.now(),
    });
  },
});
