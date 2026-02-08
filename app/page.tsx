"use client";

import { useQuery, useMutation } from "convex/react";
import { api } from "../convex/_generated/api";
import { useState } from "react";
import type { Id } from "../convex/_generated/dataModel";

const stages = [
  { id: "inbox" as const, name: "📥 Inbox", color: "bg-zinc-800" },
  { id: "design" as const, name: "🎨 Design", color: "bg-purple-900/30" },
  { id: "backend" as const, name: "⚙️ Backend", color: "bg-blue-900/30" },
  { id: "frontend" as const, name: "💻 Frontend", color: "bg-green-900/30" },
  { id: "qa" as const, name: "🧪 QA", color: "bg-yellow-900/30" },
  { id: "deploy" as const, name: "🚀 Deploy", color: "bg-orange-900/30" },
  { id: "done" as const, name: "✅ Done", color: "bg-emerald-900/30" },
];

type StageId = typeof stages[number]["id"];

export default function Home() {
  const tasks = useQuery(api.tasks.list) || [];
  const createTask = useMutation(api.tasks.create);
  const moveTask = useMutation(api.tasks.moveToStage);

  const [newTaskTitle, setNewTaskTitle] = useState("");
  const [newTaskStage, setNewTaskStage] = useState<StageId>("inbox");
  const [showNewTask, setShowNewTask] = useState(false);

  const handleCreateTask = async () => {
    if (!newTaskTitle.trim()) return;

    await createTask({
      title: newTaskTitle,
      stage: newTaskStage,
      priority: "medium",
      createdBy: "user",
    });

    setNewTaskTitle("");
    setShowNewTask(false);
  };

  const tasksByStage = stages.reduce((acc, stage) => {
    acc[stage.id] = tasks.filter((t) => t.stage === stage.id);
    return acc;
  }, {} as Record<StageId, typeof tasks>);

  return (
    <div className="min-h-screen p-6">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">Kuruvi 🐦</h1>
        <p className="text-zinc-400">Agent Task Management System</p>

        <button
          onClick={() => setShowNewTask(!showNewTask)}
          className="mt-4 px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
        >
          + New Task
        </button>
      </div>

      {showNewTask && (
        <div className="mb-6 p-4 bg-zinc-900 rounded-lg border border-zinc-800">
          <input
            type="text"
            value={newTaskTitle}
            onChange={(e) => setNewTaskTitle(e.target.value)}
            placeholder="Task title..."
            className="w-full px-4 py-2 bg-zinc-800 text-zinc-50 rounded-lg mb-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
            onKeyDown={(e) => e.key === "Enter" && handleCreateTask()}
            autoFocus
          />
          <div className="flex gap-2">
            <select
              value={newTaskStage}
              onChange={(e) => setNewTaskStage(e.target.value as StageId)}
              className="px-4 py-2 bg-zinc-800 text-zinc-50 rounded-lg focus:outline-none"
            >
              {stages.map((stage) => (
                <option key={stage.id} value={stage.id}>
                  {stage.name}
                </option>
              ))}
            </select>
            <button
              onClick={handleCreateTask}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
            >
              Create
            </button>
            <button
              onClick={() => setShowNewTask(false)}
              className="px-4 py-2 bg-zinc-700 hover:bg-zinc-600 rounded-lg transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-7 gap-4">
        {stages.map((stage) => (
          <div key={stage.id} className="flex flex-col">
            <div className={`${stage.color} p-4 rounded-t-lg border border-zinc-800`}>
              <h2 className="font-semibold text-sm mb-1">{stage.name}</h2>
              <span className="text-xs text-zinc-400">
                {tasksByStage[stage.id]?.length || 0} tasks
              </span>
            </div>

            <div className="flex-1 space-y-2 p-2 bg-zinc-900/50 rounded-b-lg border-x border-b border-zinc-800 min-h-[200px]">
              {tasksByStage[stage.id]?.map((task) => (
                <div
                  key={task._id}
                  className="p-3 bg-zinc-800 rounded-lg border border-zinc-700 hover:border-zinc-600 cursor-pointer group"
                >
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="text-sm font-medium flex-1">{task.title}</h3>
                    {task.priority === "high" && (
                      <span className="text-xs px-2 py-0.5 bg-red-900/30 text-red-400 rounded">
                        High
                      </span>
                    )}
                  </div>

                  {task.description && (
                    <p className="text-xs text-zinc-400 mb-2">{task.description}</p>
                  )}

                  <div className="flex items-center justify-between text-xs text-zinc-500">
                    <span>
                      {task.status === "in_progress" && "🔄 In Progress"}
                      {task.status === "queued" && "⏳ Queued"}
                      {task.status === "completed" && "✅ Done"}
                    </span>

                    {task.assignedTo && (
                      <span className="px-2 py-0.5 bg-zinc-700 rounded">
                        {task.assignedTo}
                      </span>
                    )}
                  </div>

                  <div className="mt-2 pt-2 border-t border-zinc-700 hidden group-hover:flex gap-1">
                    {stage.id !== "done" && stages.findIndex(s => s.id === stage.id) < stages.length - 1 && (
                      <button
                        onClick={() => moveTask({
                          taskId: task._id,
                          newStage: stages[stages.findIndex(s => s.id === stage.id) + 1].id,
                          agentName: "user"
                        })}
                        className="text-xs px-2 py-1 bg-zinc-700 hover:bg-zinc-600 rounded"
                      >
                        Move →
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className="mt-8 p-4 bg-zinc-900 rounded-lg border border-zinc-800">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
          <div>
            <div className="text-2xl font-bold">{tasks.length}</div>
            <div className="text-xs text-zinc-400">Total Tasks</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-yellow-400">
              {tasks.filter(t => t.status === "in_progress").length}
            </div>
            <div className="text-xs text-zinc-400">In Progress</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-green-400">
              {tasks.filter(t => t.status === "completed").length}
            </div>
            <div className="text-xs text-zinc-400">Completed</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-blue-400">
              {tasks.filter(t => t.status === "queued").length}
            </div>
            <div className="text-xs text-zinc-400">Queued</div>
          </div>
        </div>
      </div>
    </div>
  );
}
