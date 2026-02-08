"use client";

import { useQuery, useMutation } from "convex/react";
import { api } from "../convex/_generated/api";
import { useState } from "react";
import type { Id } from "../convex/_generated/dataModel";

const stages = [
  { id: "inbox" as const, name: "Inbox", emoji: "📥", color: "from-slate-500 to-slate-600", textColor: "text-slate-100" },
  { id: "design" as const, name: "Design", emoji: "🎨", color: "from-purple-500 to-purple-600", textColor: "text-purple-100" },
  { id: "backend" as const, name: "Backend", emoji: "⚙️", color: "from-blue-500 to-blue-600", textColor: "text-blue-100" },
  { id: "frontend" as const, name: "Frontend", emoji: "💻", color: "from-emerald-500 to-emerald-600", textColor: "text-emerald-100" },
  { id: "qa" as const, name: "QA", emoji: "🧪", color: "from-amber-500 to-amber-600", textColor: "text-amber-100" },
  { id: "deploy" as const, name: "Deploy", emoji: "🚀", color: "from-orange-500 to-orange-600", textColor: "text-orange-100" },
  { id: "done" as const, name: "Done", emoji: "✅", color: "from-green-500 to-green-600", textColor: "text-green-100" },
];

type StageId = typeof stages[number]["id"];

export default function Home() {
  const tasks = useQuery(api.tasks.list) || [];
  const createTask = useMutation(api.tasks.create);
  const moveTask = useMutation(api.tasks.moveToStage);

  const [newTaskTitle, setNewTaskTitle] = useState("");
  const [newTaskDescription, setNewTaskDescription] = useState("");
  const [newTaskStage, setNewTaskStage] = useState<StageId>("inbox");
  const [newTaskPriority, setNewTaskPriority] = useState<"low" | "medium" | "high" | "urgent">("medium");
  const [showNewTask, setShowNewTask] = useState(false);

  const handleCreateTask = async () => {
    if (!newTaskTitle.trim()) return;

    await createTask({
      title: newTaskTitle,
      description: newTaskDescription || undefined,
      stage: newTaskStage,
      priority: newTaskPriority,
      createdBy: "user",
    });

    setNewTaskTitle("");
    setNewTaskDescription("");
    setNewTaskPriority("medium");
    setShowNewTask(false);
  };

  const tasksByStage = stages.reduce((acc, stage) => {
    acc[stage.id] = tasks.filter((t) => t.stage === stage.id);
    return acc;
  }, {} as Record<StageId, typeof tasks>);

  const priorityColors = {
    low: "bg-slate-500/20 text-slate-300 border-slate-500/30",
    medium: "bg-blue-500/20 text-blue-300 border-blue-500/30",
    high: "bg-orange-500/20 text-orange-300 border-orange-500/30",
    urgent: "bg-red-500/20 text-red-300 border-red-500/30",
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
      {/* Header */}
      <div className="border-b border-slate-800 bg-slate-900/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-[1800px] mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="text-4xl">🐦</div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                  Kuruvi
                </h1>
                <p className="text-sm text-slate-400">Multi-Agent Task Management</p>
              </div>
            </div>

            <button
              onClick={() => setShowNewTask(!showNewTask)}
              className="px-6 py-2.5 bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 rounded-lg font-medium transition-all shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40"
            >
              + New Task
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-[1800px] mx-auto px-6 py-6">
        {/* New Task Form */}
        {showNewTask && (
          <div className="mb-6 p-6 bg-slate-900/90 backdrop-blur-sm rounded-xl border border-slate-800 shadow-2xl">
            <h3 className="text-lg font-semibold mb-4">Create New Task</h3>
            <div className="space-y-4">
              <input
                type="text"
                value={newTaskTitle}
                onChange={(e) => setNewTaskTitle(e.target.value)}
                placeholder="Task title..."
                className="w-full px-4 py-3 bg-slate-800 text-slate-50 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 border border-slate-700"
                onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && handleCreateTask()}
                autoFocus
              />
              <textarea
                value={newTaskDescription}
                onChange={(e) => setNewTaskDescription(e.target.value)}
                placeholder="Description (optional)..."
                rows={3}
                className="w-full px-4 py-3 bg-slate-800 text-slate-50 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 border border-slate-700 resize-none"
              />
              <div className="flex gap-3 flex-wrap">
                <select
                  value={newTaskStage}
                  onChange={(e) => setNewTaskStage(e.target.value as StageId)}
                  className="px-4 py-2.5 bg-slate-800 text-slate-50 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 border border-slate-700"
                >
                  {stages.map((stage) => (
                    <option key={stage.id} value={stage.id}>
                      {stage.emoji} {stage.name}
                    </option>
                  ))}
                </select>
                <select
                  value={newTaskPriority}
                  onChange={(e) => setNewTaskPriority(e.target.value as typeof newTaskPriority)}
                  className="px-4 py-2.5 bg-slate-800 text-slate-50 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 border border-slate-700"
                >
                  <option value="low">Low Priority</option>
                  <option value="medium">Medium Priority</option>
                  <option value="high">High Priority</option>
                  <option value="urgent">Urgent</option>
                </select>
                <div className="flex gap-2 ml-auto">
                  <button
                    onClick={() => setShowNewTask(false)}
                    className="px-6 py-2.5 bg-slate-700 hover:bg-slate-600 rounded-lg transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleCreateTask}
                    className="px-6 py-2.5 bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 rounded-lg font-medium transition-all"
                  >
                    Create Task
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Stats Bar */}
        <div className="mb-6 grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-slate-900/50 backdrop-blur-sm rounded-xl p-4 border border-slate-800">
            <div className="text-3xl font-bold text-slate-200">{tasks.length}</div>
            <div className="text-sm text-slate-400 mt-1">Total Tasks</div>
          </div>
          <div className="bg-slate-900/50 backdrop-blur-sm rounded-xl p-4 border border-slate-800">
            <div className="text-3xl font-bold text-amber-400">
              {tasks.filter(t => t.status === "in_progress").length}
            </div>
            <div className="text-sm text-slate-400 mt-1">In Progress</div>
          </div>
          <div className="bg-slate-900/50 backdrop-blur-sm rounded-xl p-4 border border-slate-800">
            <div className="text-3xl font-bold text-green-400">
              {tasks.filter(t => t.status === "completed").length}
            </div>
            <div className="text-sm text-slate-400 mt-1">Completed</div>
          </div>
          <div className="bg-slate-900/50 backdrop-blur-sm rounded-xl p-4 border border-slate-800">
            <div className="text-3xl font-bold text-blue-400">
              {tasks.filter(t => t.status === "queued").length}
            </div>
            <div className="text-sm text-slate-400 mt-1">Queued</div>
          </div>
        </div>

        {/* Kanban Board */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-7 gap-4">
          {stages.map((stage) => (
            <div key={stage.id} className="flex flex-col min-h-[500px]">
              {/* Column Header */}
              <div className={`bg-gradient-to-br ${stage.color} p-4 rounded-t-xl shadow-lg`}>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-2xl">{stage.emoji}</span>
                  <h2 className={`font-bold ${stage.textColor}`}>{stage.name}</h2>
                </div>
                <div className={`text-sm ${stage.textColor} opacity-80`}>
                  {tasksByStage[stage.id]?.length || 0} {tasksByStage[stage.id]?.length === 1 ? 'task' : 'tasks'}
                </div>
              </div>

              {/* Task List */}
              <div className="flex-1 space-y-3 p-3 bg-slate-900/30 backdrop-blur-sm rounded-b-xl border-x border-b border-slate-800">
                {tasksByStage[stage.id]?.map((task) => (
                  <div
                    key={task._id}
                    className="p-4 bg-slate-900/90 backdrop-blur-sm rounded-lg border border-slate-800 hover:border-slate-700 hover:shadow-lg transition-all group"
                  >
                    {/* Task Header */}
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <h3 className="text-sm font-semibold text-slate-100 flex-1 leading-tight">
                        {task.title}
                      </h3>
                      <span className={`text-xs px-2 py-1 rounded-full border ${priorityColors[task.priority]} font-medium whitespace-nowrap`}>
                        {task.priority}
                      </span>
                    </div>

                    {/* Description */}
                    {task.description && (
                      <p className="text-xs text-slate-400 mb-3 leading-relaxed">
                        {task.description}
                      </p>
                    )}

                    {/* Task Footer */}
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        {task.status === "in_progress" && (
                          <span className="flex items-center gap-1 text-amber-400">
                            <span className="w-1.5 h-1.5 bg-amber-400 rounded-full animate-pulse"></span>
                            In Progress
                          </span>
                        )}
                        {task.status === "queued" && (
                          <span className="text-slate-400">⏳ Queued</span>
                        )}
                        {task.status === "completed" && (
                          <span className="text-green-400">✅ Done</span>
                        )}
                      </div>

                      {task.assignedTo && (
                        <span className="px-2 py-1 bg-slate-800 text-slate-300 rounded-full border border-slate-700 font-medium">
                          {task.assignedTo}
                        </span>
                      )}
                    </div>

                    {/* Actions */}
                    {stage.id !== "done" && stages.findIndex(s => s.id === stage.id) < stages.length - 1 && (
                      <button
                        onClick={() => moveTask({
                          taskId: task._id,
                          newStage: stages[stages.findIndex(s => s.id === stage.id) + 1].id,
                          agentName: "user"
                        })}
                        className="mt-3 w-full text-xs px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg transition-colors border border-slate-700 opacity-0 group-hover:opacity-100 font-medium"
                      >
                        Move to {stages[stages.findIndex(s => s.id === stage.id) + 1].name} →
                      </button>
                    )}
                  </div>
                ))}

                {/* Empty State */}
                {tasksByStage[stage.id]?.length === 0 && (
                  <div className="flex items-center justify-center h-32 text-slate-600 text-sm">
                    No tasks yet
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
