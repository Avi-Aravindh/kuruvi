import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  // Tasks in the kanban board
  tasks: defineTable({
    title: v.string(),
    description: v.optional(v.string()),
    stage: v.union(
      v.literal("inbox"),
      v.literal("design"),
      v.literal("backend"),
      v.literal("frontend"),
      v.literal("qa"),
      v.literal("deploy"),
      v.literal("done")
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
    assignedTo: v.optional(v.string()), // agent name
    createdBy: v.string(), // "user" or agent name
    artifacts: v.optional(v.object({
      files: v.optional(v.array(v.string())), // file URLs
      notes: v.optional(v.string()),
      links: v.optional(v.array(v.string()))
    })),
    discordThreadId: v.optional(v.string()),
    createdAt: v.number(),
    updatedAt: v.number(),
    completedAt: v.optional(v.number())
  })
    .index("by_stage", ["stage"])
    .index("by_status", ["status"])
    .index("by_assignedTo", ["assignedTo"])
    .index("by_createdAt", ["createdAt"]),

  // Agent registry
  agents: defineTable({
    name: v.string(),
    displayName: v.string(),
    personality: v.string(),
    specialization: v.string(),
    stage: v.string(), // which queue they handle
    isActive: v.boolean(),
    lastRun: v.optional(v.number()),
    tasksCompleted: v.number(),
    discordBotToken: v.optional(v.string())
  })
    .index("by_name", ["name"])
    .index("by_stage", ["stage"]),

  // Activity log for audit trail
  activity: defineTable({
    taskId: v.id("tasks"),
    agentName: v.string(),
    action: v.string(), // "created", "updated", "moved", "completed"
    previousStage: v.optional(v.string()),
    newStage: v.optional(v.string()),
    message: v.optional(v.string()),
    timestamp: v.number()
  })
    .index("by_task", ["taskId"])
    .index("by_timestamp", ["timestamp"])
});
