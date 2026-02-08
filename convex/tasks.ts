import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

// Get all tasks
export const list = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("tasks").order("desc").collect();
  },
});

// Get tasks by agent
export const getByAgent = query({
  args: { agent: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("tasks")
      .withIndex("by_agent", (q) => q.eq("agent", args.agent as any))
      .collect();
  },
});

// Create a new task
export const create = mutation({
  args: {
    title: v.string(),
    description: v.optional(v.string()),
    agent: v.string(),
    priority: v.string(),
    createdBy: v.string(),
  },
  handler: async (ctx, args) => {
    const taskId = await ctx.db.insert("tasks", {
      title: args.title,
      description: args.description,
      agent: args.agent as any,
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
      newAgent: args.agent,
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
    const patch: any = {
      status: args.status as any,
      updatedAt: Date.now(),
    };
    if (args.status === "completed") {
      patch.completedAt = Date.now();
    }
    await ctx.db.patch(args.taskId, patch);

    await ctx.db.insert("activity", {
      taskId: args.taskId,
      agentName: args.agentName,
      action: "updated",
      message: `Status changed to ${args.status}`,
      timestamp: Date.now(),
    });
  },
});

// Move task to a different agent's queue
export const moveToAgent = mutation({
  args: {
    taskId: v.id("tasks"),
    newAgent: v.string(),
    agentName: v.string(),
  },
  handler: async (ctx, args) => {
    const task = await ctx.db.get(args.taskId);
    if (!task) throw new Error("Task not found");

    await ctx.db.patch(args.taskId, {
      agent: args.newAgent as any,
      status: "queued",
      updatedAt: Date.now(),
    });

    await ctx.db.insert("activity", {
      taskId: args.taskId,
      agentName: args.agentName,
      action: "moved",
      previousAgent: task.agent,
      newAgent: args.newAgent,
      message: `Moved from ${task.agent} to ${args.newAgent}`,
      timestamp: Date.now(),
    });
  },
});

// Complete a task (stays in the same agent's queue but marked completed)
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

// Delete a task
export const deleteTask = mutation({
  args: {
    taskId: v.id("tasks"),
  },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.taskId);
  },
});
