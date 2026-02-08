import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  // Tasks assigned to independent agent queues
  tasks: defineTable({
    title: v.string(),
    description: v.optional(v.string()),
    // Each agent has their own independent queue - these are NOT sequential stages
    agent: v.union(
      v.literal("ada"),
      v.literal("bolt"),
      v.literal("sage"),
      v.literal("nova"),
      v.literal("atlas"),
      v.literal("ember"),
      v.literal("orbit")
    ),
    status: v.union(
      v.literal("queued"),
      v.literal("in_progress"),
      v.literal("completed"),
      v.literal("blocked")
    ),
    priority: v.union(
      v.literal("low"),
      v.literal("medium"),
      v.literal("high"),
      v.literal("urgent")
    ),
    createdBy: v.string(), // "user" or agent name
    artifacts: v.optional(v.object({
      files: v.optional(v.array(v.string())),
      notes: v.optional(v.string()),
      links: v.optional(v.array(v.string()))
    })),
    discordThreadId: v.optional(v.string()),
    createdAt: v.number(),
    updatedAt: v.number(),
    completedAt: v.optional(v.number())
  })
    .index("by_agent", ["agent"])
    .index("by_status", ["status"])
    .index("by_createdAt", ["createdAt"]),

  // Agent registry
  agents: defineTable({
    name: v.string(),
    displayName: v.string(),
    personality: v.string(),
    specialization: v.string(),
    isActive: v.boolean(),
    lastRun: v.optional(v.number()),
    tasksCompleted: v.number(),
    discordBotToken: v.optional(v.string())
  })
    .index("by_name", ["name"]),

  // Activity log for audit trail
  activity: defineTable({
    taskId: v.id("tasks"),
    agentName: v.string(),
    action: v.string(), // "created", "updated", "moved", "completed"
    previousAgent: v.optional(v.string()),
    newAgent: v.optional(v.string()),
    message: v.optional(v.string()),
    timestamp: v.number()
  })
    .index("by_task", ["taskId"])
    .index("by_timestamp", ["timestamp"])
});
