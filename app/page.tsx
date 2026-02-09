"use client";

import { useQuery, useMutation } from "convex/react";
import { api } from "../convex/_generated/api";
import { useState, useRef, useEffect } from "react";
import { Id } from "../convex/_generated/dataModel";

// ─── Types ──────────────────────────────────────────────────────────────────
type AgentId = "helix" | "ada" | "turing" | "steve" | "jony" | "nitty" | "wanderer";

interface Agent {
  id: AgentId;
  name: string;
  trait: string;
  avatar: string;
  accentColor: string;
  accentBg: string;
  accentBorder: string;
}

// ─── Agent Definitions ──────────────────────────────────────────────────────
// These are INDEPENDENT agents with personality names, NOT workflow stages.
// Each agent has their own queue of unrelated tasks.
const agents: readonly Agent[] = [
  {
    id: "helix",
    name: "Helix",
    trait: "Squad Lead",
    avatar: "Η",
    accentColor: "#8b5cf6",
    accentBg: "#faf5ff",
    accentBorder: "#e9d5ff",
  },
  {
    id: "ada",
    name: "Ada",
    trait: "The Architect",
    avatar: "Α",
    accentColor: "#6366f1",
    accentBg: "#eef2ff",
    accentBorder: "#c7d2fe",
  },
  {
    id: "turing",
    name: "Turing",
    trait: "Efficiency Expert",
    avatar: "Τ",
    accentColor: "#059669",
    accentBg: "#ecfdf5",
    accentBorder: "#a7f3d0",
  },
  {
    id: "steve",
    name: "Steve",
    trait: "The Visionary",
    avatar: "Σ",
    accentColor: "#d97706",
    accentBg: "#fffbeb",
    accentBorder: "#fde68a",
  },
  {
    id: "jony",
    name: "Jony",
    trait: "The Designer",
    avatar: "Ι",
    accentColor: "#9333ea",
    accentBg: "#faf5ff",
    accentBorder: "#e9d5ff",
  },
  {
    id: "nitty",
    name: "Nitty",
    trait: "The QA Engineer",
    avatar: "Ν",
    accentColor: "#dc2626",
    accentBg: "#fef2f2",
    accentBorder: "#fecaca",
  },
  {
    id: "wanderer",
    name: "Wanderer",
    trait: "The Explorer",
    avatar: "Ω",
    accentColor: "#0891b2",
    accentBg: "#ecfeff",
    accentBorder: "#a5f3fc",
  },
];

// ─── Priority Configuration ─────────────────────────────────────────────────
const priorityConfig = {
  urgent: { label: "Urgent", color: "#dc2626", bg: "#fef2f2", border: "#fecaca" },
  high: { label: "High", color: "#ea580c", bg: "#fff7ed", border: "#fed7aa" },
  medium: { label: "Medium", color: "#6366f1", bg: "#eef2ff", border: "#c7d2fe" },
  low: { label: "Low", color: "#9ca3af", bg: "#f9fafb", border: "#e5e7eb" },
} as const;

type Priority = keyof typeof priorityConfig;

// ─── Main Component ─────────────────────────────────────────────────────────
export default function Home() {
  const tasks = useQuery(api.tasks.list);
  const createTask = useMutation(api.tasks.create);
  const moveTask = useMutation(api.tasks.moveToAgent);
  const updateStatus = useMutation(api.tasks.updateStatus);
  const deleteTask = useMutation(api.tasks.deleteTask);
  const deleteAllByAgent = useMutation(api.tasks.deleteAllByAgent);
  const deleteAllTasks = useMutation(api.tasks.deleteAllTasks);

  const [showNewTask, setShowNewTask] = useState(false);
  const [newTaskTitle, setNewTaskTitle] = useState("");
  const [newTaskDescription, setNewTaskDescription] = useState("");
  const [newTaskAgent, setNewTaskAgent] = useState<AgentId>("ada");
  const [newTaskPriority, setNewTaskPriority] = useState<Priority>("medium");
  const [expandedTask, setExpandedTask] = useState<string | null>(null);
  const [showCompleted, setShowCompleted] = useState<Record<string, boolean>>({});
  const [isCreating, setIsCreating] = useState(false);
  const [taskToDelete, setTaskToDelete] = useState<Id<"tasks"> | null>(null);

  const handleCreateTask = async () => {
    if (!newTaskTitle.trim() || isCreating) return;
    setIsCreating(true);
    try {
      await createTask({
        title: newTaskTitle,
        description: newTaskDescription || undefined,
        agent: newTaskAgent,
        priority: newTaskPriority,
        createdBy: "user",
      });
      setNewTaskTitle("");
      setNewTaskDescription("");
      setNewTaskPriority("medium");
      setNewTaskAgent("ada");
      setShowNewTask(false);
    } finally {
      setIsCreating(false);
    }
  };

  // Group tasks by agent
  const tasksByAgent = agents.reduce(
    (acc, agent) => {
      acc[agent.id] = tasks?.filter((t: any) => t.agent === agent.id) || [];
      return acc;
    },
    {} as Record<AgentId, any[]>
  );

  const totalActive = tasks?.filter((t: any) => t.status !== "completed").length || 0;
  const totalCompleted = tasks?.filter((t: any) => t.status === "completed").length || 0;

  const [collapsedAgents, setCollapsedAgents] = useState<Record<string, boolean>>({});

  // Loading state
  if (tasks === undefined) {
    return (
      <div className="h-screen flex flex-col" style={{ background: "#ffffff" }}>
        <header
          className="flex-shrink-0 sticky top-0 z-10"
          style={{
            background: "#ffffff",
            borderBottom: "1px solid #e5e7eb",
          }}
        >
          <div className="flex items-center justify-between px-4 sm:px-6 h-14">
            <div className="flex items-center gap-3 sm:gap-5">
              <div className="flex items-center gap-2.5">
                <div
                  className="w-8 h-8 rounded-lg flex items-center justify-center"
                  style={{ background: "linear-gradient(135deg, #6366f1, #8b5cf6)" }}
                >
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="white"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M16 7h.01M3.4 18H12a8 8 0 0 0 8-8V7a4 4 0 0 0-7.28-2.3L2 20l.03-.02A4.4 4.4 0 0 0 5 21a4 4 0 0 0 4-4v-3" />
                    <circle cx="18" cy="6" r="1" fill="white" />
                  </svg>
                </div>
                <span
                  style={{
                    fontSize: "16px",
                    fontWeight: 600,
                    color: "#111827",
                    letterSpacing: "-0.02em",
                  }}
                >
                  Kuruvi
                </span>
              </div>
            </div>
          </div>
        </header>
        <div className="flex-1 overflow-y-auto flex items-center justify-center" style={{ background: "#fafbfc" }}>
          <div className="flex flex-col items-center gap-3">
            <div
              className="w-8 h-8 rounded-full border-2 border-gray-200 border-t-indigo-500 animate-spin"
              style={{ borderTopColor: "#6366f1" }}
            />
            <span style={{ fontSize: "13px", color: "#9ca3af", fontWeight: 500 }}>
              Loading tasks...
            </span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col" style={{ background: "#ffffff" }}>
      {/* ─── Header ──────────────────────────────────────────────────── */}
      <header
        className="flex-shrink-0 sticky top-0 z-10"
        style={{
          background: "#ffffff",
          borderBottom: "1px solid #e5e7eb",
        }}
      >
        <div className="flex items-center justify-between px-4 sm:px-6 h-14">
          <div className="flex items-center gap-3 sm:gap-5">
            <div className="flex items-center gap-2.5">
              <div
                className="w-8 h-8 rounded-lg flex items-center justify-center"
                style={{ background: "linear-gradient(135deg, #6366f1, #8b5cf6)" }}
              >
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="white"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M16 7h.01M3.4 18H12a8 8 0 0 0 8-8V7a4 4 0 0 0-7.28-2.3L2 20l.03-.02A4.4 4.4 0 0 0 5 21a4 4 0 0 0 4-4v-3" />
                  <circle cx="18" cy="6" r="1" fill="white" />
                </svg>
              </div>
              <span
                style={{
                  fontSize: "16px",
                  fontWeight: 600,
                  color: "#111827",
                  letterSpacing: "-0.02em",
                }}
              >
                Kuruvi
              </span>
            </div>

            <div
              className="hidden sm:flex items-center gap-3"
              style={{ fontSize: "13px", color: "#6b7280" }}
            >
              <span>{totalActive} active</span>
              <span style={{ color: "#d1d5db" }}>/</span>
              <span>{totalCompleted} done</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {tasks && tasks.length > 0 && (
              <button
                onClick={async () => {
                  if (confirm(`Delete all ${tasks.length} tasks? This cannot be undone.`)) {
                    await deleteAllTasks();
                  }
                }}
                aria-label="Delete all tasks"
                className="btn-clear-all flex items-center gap-1.5"
                style={{
                  height: "34px",
                  padding: "0 14px",
                  borderRadius: "8px",
                  fontSize: "13px",
                  fontWeight: 500,
                  background: "#ffffff",
                  color: "#9ca3af",
                  border: "1px solid #e5e7eb",
                  cursor: "pointer",
                  transition: "all 0.15s",
                }}
              >
                <TrashIcon />
                <span className="hidden sm:inline">Clear All</span>
              </button>
            )}
            <button
              onClick={() => setShowNewTask(true)}
              aria-label="Create new task"
              className="btn-new flex items-center gap-1.5"
              style={{
                height: "34px",
                padding: "0 14px",
                borderRadius: "8px",
                fontSize: "13px",
                fontWeight: 500,
                background: "#6366f1",
                color: "#ffffff",
                border: "none",
                cursor: "pointer",
                transition: "background 0.15s",
              }}
            >
              <PlusIcon />
              <span className="hidden sm:inline">New</span>
            </button>
          </div>
        </div>
      </header>

      {/* ─── List View with Agent Grouping ────────────────────────────────────────── */}
      <div className="flex-1 overflow-y-auto" style={{ background: "#fafbfc" }}>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-4 sm:py-6">
          {agents.map((agent) => {
            const agentTasks = tasksByAgent[agent.id] || [];
            const activeTasks = agentTasks.filter((t: any) => t.status !== "completed");
            const completedTasks = agentTasks.filter((t: any) => t.status === "completed");
            const isCollapsed = collapsedAgents[agent.id] || false;
            const isShowingCompleted = showCompleted[agent.id] || false;

            if (agentTasks.length === 0) return null;

            return (
              <div
                key={agent.id}
                style={{
                  marginBottom: "24px",
                  background: "#ffffff",
                  borderRadius: "12px",
                  border: "1px solid #e5e7eb",
                  overflow: "hidden",
                }}
              >
                {/* ─── Agent Header (Collapsible) ─── */}
                <button
                  onClick={() =>
                    setCollapsedAgents((prev) => ({
                      ...prev,
                      [agent.id]: !prev[agent.id],
                    }))
                  }
                  className="btn-agent-header w-full flex items-center justify-between"
                  style={{
                    padding: "14px 16px",
                    background: agent.accentBg,
                    borderBottom: isCollapsed ? "none" : `1px solid ${agent.accentBorder}`,
                    cursor: "pointer",
                    border: "none",
                    textAlign: "left",
                    transition: "filter 0.15s",
                  }}
                >
                  <div className="flex items-center gap-3">
                    <svg
                      width="10"
                      height="10"
                      viewBox="0 0 10 10"
                      fill={agent.accentColor}
                      style={{
                        transform: isCollapsed ? "rotate(0deg)" : "rotate(90deg)",
                        transition: "transform 0.2s ease",
                      }}
                    >
                      <path d="M3 1l4 4-4 4" />
                    </svg>
                    <div
                      className="flex items-center justify-center"
                      style={{
                        width: "32px",
                        height: "32px",
                        borderRadius: "8px",
                        background: "#ffffff",
                        border: `1.5px solid ${agent.accentBorder}`,
                        fontSize: "14px",
                        color: agent.accentColor,
                        fontWeight: 600,
                      }}
                    >
                      {agent.avatar}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span
                          style={{
                            fontSize: "14px",
                            fontWeight: 600,
                            color: "#111827",
                          }}
                        >
                          {agent.name}
                        </span>
                        <span
                          style={{
                            fontSize: "12px",
                            color: "#6b7280",
                          }}
                        >
                          · {agent.trait}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <span
                      style={{
                        fontSize: "13px",
                        fontWeight: 500,
                        color: agent.accentColor,
                      }}
                    >
                      {activeTasks.length}
                    </span>
                    {agentTasks.length > 0 && (
                      <button
                        onClick={async (e) => {
                          e.stopPropagation();
                          if (confirm(`Delete all ${agentTasks.length} tasks for ${agent.name}?`)) {
                            await deleteAllByAgent({ agent: agent.id });
                          }
                        }}
                        aria-label={`Delete all tasks for ${agent.name}`}
                        className="btn-agent-delete flex items-center justify-center"
                        style={{
                          width: "28px",
                          height: "28px",
                          borderRadius: "7px",
                          border: "none",
                          background: "#ffffff",
                          color: "#9ca3af",
                          cursor: "pointer",
                          transition: "all 0.15s",
                        }}
                      >
                        <TrashIcon />
                      </button>
                    )}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setNewTaskAgent(agent.id);
                        setShowNewTask(true);
                      }}
                      aria-label={`Create new task for ${agent.name}`}
                      className="btn-agent-add flex items-center justify-center"
                      style={{
                        width: "28px",
                        height: "28px",
                        borderRadius: "7px",
                        border: "none",
                        background: "#ffffff",
                        color: agent.accentColor,
                        cursor: "pointer",
                        transition: "all 0.15s",
                        "--agent-accent-color": agent.accentColor,
                      } as React.CSSProperties}
                    >
                      <PlusIcon />
                    </button>
                  </div>
                </button>

                {/* ─── Task List ─── */}
                {!isCollapsed && (
                  <div style={{ padding: "8px" }}>
                    {/* Active tasks */}
                    <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
                      {activeTasks.map((task: any) => (
                        <TaskCard
                          key={task._id}
                          task={task}
                          agent={agent}
                          allAgents={agents}
                          moveTask={moveTask}
                          updateStatus={updateStatus}
                          onDelete={(taskId) => setTaskToDelete(taskId)}
                          isExpanded={expandedTask === task._id}
                          onToggleExpand={() =>
                            setExpandedTask(expandedTask === task._id ? null : task._id)
                          }
                        />
                      ))}
                    </div>

                    {/* Completed tasks */}
                    {completedTasks.length > 0 && (
                      <div style={{ marginTop: activeTasks.length > 0 ? "8px" : "0" }}>
                        <button
                          onClick={() =>
                            setShowCompleted((prev) => ({
                              ...prev,
                              [agent.id]: !prev[agent.id],
                            }))
                          }
                          className="btn-show-completed flex items-center gap-2 w-full"
                          style={{
                            padding: "8px 12px",
                            background: "transparent",
                            border: "none",
                            cursor: "pointer",
                            fontSize: "12px",
                            fontWeight: 500,
                            color: "#9ca3af",
                            transition: "all 0.15s",
                            borderRadius: "8px",
                          }}
                        >
                          <svg
                            width="10"
                            height="10"
                            viewBox="0 0 10 10"
                            fill="currentColor"
                            style={{
                              transform: isShowingCompleted ? "rotate(90deg)" : "rotate(0deg)",
                              transition: "transform 0.15s ease",
                            }}
                          >
                            <path d="M3 1l4 4-4 4" />
                          </svg>
                          <span>{completedTasks.length} completed</span>
                        </button>

                        {isShowingCompleted && (
                          <div style={{ display: "flex", flexDirection: "column", gap: "2px", marginTop: "2px" }}>
                            {completedTasks.map((task: any) => (
                              <TaskCard
                                key={task._id}
                                task={task}
                                agent={agent}
                                allAgents={agents}
                                moveTask={moveTask}
                                updateStatus={updateStatus}
                                onDelete={(taskId) => setTaskToDelete(taskId)}
                                isExpanded={expandedTask === task._id}
                                onToggleExpand={() =>
                                  setExpandedTask(expandedTask === task._id ? null : task._id)
                                }
                              />
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}

          {/* Empty state when no tasks at all */}
          {tasks && tasks.length === 0 && (
            <div
              className="flex flex-col items-center justify-center"
              style={{
                padding: "80px 20px",
                color: "#d1d5db",
                textAlign: "center",
              }}
            >
              <div
                style={{
                  width: "64px",
                  height: "64px",
                  borderRadius: "16px",
                  background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  marginBottom: "16px",
                  opacity: 0.2,
                }}
              >
                <svg
                  width="32"
                  height="32"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="white"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M16 7h.01M3.4 18H12a8 8 0 0 0 8-8V7a4 4 0 0 0-7.28-2.3L2 20l.03-.02A4.4 4.4 0 0 0 5 21a4 4 0 0 0 4-4v-3" />
                  <circle cx="18" cy="6" r="1" fill="white" />
                </svg>
              </div>
              <span
                style={{
                  fontSize: "15px",
                  fontWeight: 500,
                  color: "#9ca3af",
                  marginBottom: "8px",
                }}
              >
                No tasks yet
              </span>
              <span style={{ fontSize: "13px", color: "#c4c8cf" }}>
                Click "New" to create your first task
              </span>
            </div>
          )}
        </div>
      </div>

      {/* ─── New Task Modal ──────────────────────────────────────────── */}
      {showNewTask && (
        <NewTaskModal
          title={newTaskTitle}
          setTitle={setNewTaskTitle}
          description={newTaskDescription}
          setDescription={setNewTaskDescription}
          agent={newTaskAgent}
          setAgent={setNewTaskAgent}
          priority={newTaskPriority}
          setPriority={setNewTaskPriority}
          onSubmit={handleCreateTask}
          onClose={() => {
            setShowNewTask(false);
            setNewTaskTitle("");
            setNewTaskDescription("");
          }}
          isCreating={isCreating}
        />
      )}

      {/* ─── Delete Confirmation Modal ───────────────────────────────── */}
      {taskToDelete && (
        <ConfirmModal
          title="Delete this task?"
          message="This action cannot be undone."
          confirmLabel="Delete"
          onConfirm={async () => {
            await deleteTask({ taskId: taskToDelete });
            setTaskToDelete(null);
          }}
          onCancel={() => setTaskToDelete(null)}
        />
      )}
    </div>
  );
}

// ─── Task Card ──────────────────────────────────────────────────────────────
function TaskCard({
  task,
  agent,
  allAgents,
  moveTask,
  updateStatus,
  onDelete,
  isExpanded,
  onToggleExpand,
}: {
  task: any;
  agent: Agent;
  allAgents: readonly Agent[];
  moveTask: any;
  updateStatus: any;
  onDelete: (taskId: Id<"tasks">) => void;
  isExpanded: boolean;
  onToggleExpand: () => void;
}) {
  const priority = priorityConfig[task.priority as Priority];
  const [showMoveMenu, setShowMoveMenu] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const isCompleted = task.status === "completed";

  return (
    <div
      className="task-card group transition-card"
      role="button"
      tabIndex={0}
      style={{
        borderRadius: "8px",
        padding: "10px 12px",
        cursor: "pointer",
        background: isCompleted ? "#fafbfc" : "#ffffff",
        border: "1px solid transparent",
        opacity: isCompleted ? 0.65 : 1,
        transition: "all 0.15s ease",
      }}
      onClick={onToggleExpand}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onToggleExpand();
        }
      }}
    >
      {/* Title row */}
      <div className="flex items-start gap-2.5">
        <div className="flex-shrink-0" style={{ marginTop: "2px" }}>
          <StatusIndicator
            status={task.status}
            accentColor={agent.accentColor}
            taskTitle={task.title}
            isLoading={isUpdating}
            onClick={async (e: React.MouseEvent) => {
              e.stopPropagation();
              if (isUpdating) return;
              setIsUpdating(true);
              try {
                if (task.status === "completed") {
                  await updateStatus({ taskId: task._id, status: "queued", agentName: "user" });
                } else {
                  await updateStatus({ taskId: task._id, status: "completed", agentName: "user" });
                }
              } finally {
                setIsUpdating(false);
              }
            }}
          />
        </div>
        <div className="flex-1" style={{ minWidth: 0 }}>
          <p
            style={{
              fontSize: "13px",
              fontWeight: 500,
              lineHeight: "1.45",
              color: isCompleted ? "#9ca3af" : "#111827",
              textDecoration: isCompleted ? "line-through" : "none",
              margin: 0,
              display: "-webkit-box",
              WebkitLineClamp: 2,
              WebkitBoxOrient: "vertical",
              overflow: "hidden",
            }}
          >
            {task.title}
          </p>
        </div>
      </div>

      {/* Meta row */}
      <div
        className="flex items-center gap-2"
        style={{ marginTop: "7px", marginLeft: "22px" }}
      >
        <span
          style={{
            fontSize: "12px",
            fontWeight: 500,
            padding: "1px 7px",
            borderRadius: "4px",
            color: priority.color,
            background: priority.bg,
            border: `1px solid ${priority.border}`,
          }}
        >
          {priority.label}
        </span>

        {task.status === "in_progress" && (
          <span
            style={{
              fontSize: "11px",
              fontWeight: 500,
              color: "#f59e0b",
              display: "flex",
              alignItems: "center",
              gap: "4px",
            }}
          >
            <span className="pulse-dot" style={{
              width: "5px",
              height: "5px",
              borderRadius: "50%",
              background: "#f59e0b",
              display: "inline-block",
            }} />
            Working
          </span>
        )}

        {task.status === "blocked" && (
          <span
            style={{
              fontSize: "11px",
              fontWeight: 500,
              color: "#ef4444",
            }}
          >
            Blocked
          </span>
        )}
      </div>

      {/* Expanded details */}
      {isExpanded && (
        <div style={{ marginTop: "12px", marginLeft: "22px" }}>
          {task.description && (
            <p
              style={{
                fontSize: "13px",
                color: "#6b7280",
                lineHeight: "1.55",
                margin: "0 0 10px 0",
              }}
            >
              {task.description}
            </p>
          )}

          {/* Timestamps */}
          <div
            className="flex items-center gap-3"
            style={{
              fontSize: "12px",
              color: "#9ca3af",
              marginBottom: "10px",
            }}
          >
            <span>Created {formatRelativeTime(task.createdAt)}</span>
            {task.completedAt && (
              <span>Done {formatRelativeTime(task.completedAt)}</span>
            )}
          </div>

          {/* Actions */}
          <div className="flex items-center gap-3">
            {/* Reassign to different agent */}
            <div style={{ position: "relative" }}>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setShowMoveMenu(!showMoveMenu);
                }}
                aria-label="Reassign task to different agent"
                className="btn-reassign flex items-center gap-1.5"
                style={{
                  fontSize: "12px",
                  fontWeight: 500,
                  color: agent.accentColor,
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  padding: "4px 0",
                  transition: "opacity 0.15s",
                }}
              >
                <MoveIcon />
                Reassign
              </button>

              {showMoveMenu && (
                <MoveMenu
                  currentAgentId={agent.id}
                  allAgents={allAgents}
                  onMove={(targetId) => {
                    moveTask({
                      taskId: task._id,
                      newAgent: targetId,
                      agentName: "user",
                    });
                    setShowMoveMenu(false);
                  }}
                  onClose={() => setShowMoveMenu(false)}
                />
              )}
            </div>

            {/* Delete */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                onDelete(task._id);
              }}
              aria-label="Delete task"
              className="btn-delete flex items-center gap-1.5"
              style={{
                fontSize: "12px",
                fontWeight: 500,
                color: "#d1d5db",
                background: "none",
                border: "none",
                cursor: "pointer",
                padding: "4px 0",
                transition: "color 0.15s",
              }}
            >
              <TrashIcon />
              Delete
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Move Menu ──────────────────────────────────────────────────────────────
function MoveMenu({
  currentAgentId,
  allAgents,
  onMove,
  onClose,
}: {
  currentAgentId: AgentId;
  allAgents: readonly Agent[];
  onMove: (targetId: AgentId) => void;
  onClose: () => void;
}) {
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        onClose();
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [onClose]);

  return (
    <div
      ref={menuRef}
      style={{
        position: "absolute",
        left: 0,
        top: "100%",
        marginTop: "4px",
        background: "#ffffff",
        border: "1px solid #e5e7eb",
        borderRadius: "10px",
        boxShadow:
          "0 4px 6px -1px rgba(0,0,0,0.07), 0 2px 4px -2px rgba(0,0,0,0.05)",
        padding: "4px",
        zIndex: 10,
        minWidth: "200px",
      }}
      onClick={(e) => e.stopPropagation()}
    >
      <div
        style={{
          padding: "6px 10px 4px",
          fontSize: "11px",
          fontWeight: 600,
          color: "#9ca3af",
          textTransform: "uppercase",
          letterSpacing: "0.05em",
        }}
      >
        Reassign to
      </div>
      {allAgents
        .filter((a) => a.id !== currentAgentId)
        .map((a) => (
          <button
            key={a.id}
            onClick={(e) => {
              e.stopPropagation();
              onMove(a.id);
              onClose();
            }}
            className="btn-move-menu-item flex items-center gap-2.5 w-full"
            style={{
              padding: "7px 10px",
              borderRadius: "7px",
              border: "none",
              background: "transparent",
              cursor: "pointer",
              fontSize: "13px",
              fontWeight: 400,
              color: "#374151",
              transition: "background 0.1s",
              textAlign: "left",
              "--agent-accent-bg": a.accentBg,
            } as React.CSSProperties}
          >
            <div
              className="flex items-center justify-center"
              style={{
                width: "22px",
                height: "22px",
                borderRadius: "6px",
                background: a.accentBg,
                border: `1px solid ${a.accentBorder}`,
                fontSize: "11px",
                color: a.accentColor,
                fontWeight: 600,
              }}
            >
              {a.avatar}
            </div>
            <div>
              <span style={{ fontWeight: 500 }}>{a.name}</span>
              <span style={{ color: "#9ca3af", marginLeft: "6px", fontSize: "12px" }}>
                {a.trait}
              </span>
            </div>
          </button>
        ))}
    </div>
  );
}

// ─── New Task Modal ─────────────────────────────────────────────────────────
function NewTaskModal({
  title,
  setTitle,
  description,
  setDescription,
  agent,
  setAgent,
  priority,
  setPriority,
  onSubmit,
  onClose,
  isCreating,
}: {
  title: string;
  setTitle: (v: string) => void;
  description: string;
  setDescription: (v: string) => void;
  agent: AgentId;
  setAgent: (v: AgentId) => void;
  priority: Priority;
  setPriority: (v: Priority) => void;
  onSubmit: () => void;
  onClose: () => void;
  isCreating: boolean;
}) {
  const titleRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    titleRef.current?.focus();
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  const selectedAgent = agents.find((a) => a.id === agent)!;

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center modal-overlay"
      style={{
        backgroundColor: "rgba(0, 0, 0, 0.15)",
        backdropFilter: "blur(2px)",
        paddingTop: "15vh",
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        className="modal-content w-full max-w-lg mx-4 overflow-hidden"
        style={{
          borderRadius: "14px",
          background: "#ffffff",
          border: "1px solid #e5e7eb",
          boxShadow:
            "0 20px 25px -5px rgba(0,0,0,0.08), 0 8px 10px -6px rgba(0,0,0,0.04)",
        }}
      >
        {/* Title input */}
        <div style={{ padding: "20px 20px 0" }}>
          <input
            ref={titleRef}
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="What needs to be done?"
            maxLength={200}
            style={{
              width: "100%",
              fontSize: "16px",
              fontWeight: 500,
              background: "transparent",
              border: "none",
              outline: "none",
              color: "#111827",
              padding: 0,
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                onSubmit();
              }
            }}
          />
          {title.length > 0 && (
            <div
              style={{
                fontSize: "11px",
                color: title.length >= 200 ? "#ef4444" : "#9ca3af",
                marginTop: "4px",
              }}
            >
              {title.length}/200
            </div>
          )}
        </div>

        {/* Description input */}
        <div style={{ padding: "8px 20px 0" }}>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Add details..."
            rows={3}
            style={{
              width: "100%",
              fontSize: "14px",
              background: "transparent",
              border: "none",
              outline: "none",
              color: "#6b7280",
              resize: "none",
              padding: 0,
              lineHeight: "1.55",
            }}
          />
        </div>

        {/* Options bar */}
        <div
          className="flex items-center gap-2 flex-wrap"
          style={{ padding: "12px 20px" }}
        >
          {/* Agent selector */}
          <div style={{ position: "relative" }}>
            <select
              value={agent}
              onChange={(e) => setAgent(e.target.value as AgentId)}
              style={{
                appearance: "none",
                height: "32px",
                padding: "0 28px 0 10px",
                borderRadius: "8px",
                fontSize: "13px",
                fontWeight: 500,
                background: selectedAgent.accentBg,
                border: `1px solid ${selectedAgent.accentBorder}`,
                color: selectedAgent.accentColor,
                cursor: "pointer",
                outline: "none",
                transition: "all 0.15s",
              }}
            >
              {agents.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.avatar} {a.name} - {a.trait}
                </option>
              ))}
            </select>
            <ChevronDownIcon className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>

          {/* Priority selector */}
          <div style={{ position: "relative" }}>
            <select
              value={priority}
              onChange={(e) => setPriority(e.target.value as Priority)}
              style={{
                appearance: "none",
                height: "32px",
                padding: "0 28px 0 10px",
                borderRadius: "8px",
                fontSize: "13px",
                fontWeight: 500,
                background: "#f9fafb",
                border: "1px solid #e5e7eb",
                color: "#374151",
                cursor: "pointer",
                outline: "none",
                transition: "border-color 0.15s",
              }}
            >
              {(
                Object.entries(priorityConfig) as [
                  Priority,
                  (typeof priorityConfig)[Priority],
                ][]
              ).map(([key, config]) => (
                <option key={key} value={key}>
                  {config.label}
                </option>
              ))}
            </select>
            <ChevronDownIcon className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>
        </div>

        {/* Footer */}
        <div
          className="flex items-center justify-between"
          style={{
            padding: "12px 20px",
            borderTop: "1px solid #f3f4f6",
          }}
        >
          <span style={{ fontSize: "12px", color: !title.trim() ? "#ef4444" : "#9ca3af" }}>
            {!title.trim() ? "Title is required" : "Press Enter to create"}
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="btn-modal-cancel"
              style={{
                height: "34px",
                padding: "0 12px",
                borderRadius: "8px",
                fontSize: "13px",
                fontWeight: 500,
                color: "#6b7280",
                background: "transparent",
                border: "none",
                cursor: "pointer",
                transition: "all 0.15s",
              }}
            >
              Cancel
            </button>
            <button
              onClick={onSubmit}
              disabled={!title.trim() || isCreating}
              className="btn-modal-create"
              style={{
                height: "34px",
                padding: "0 16px",
                borderRadius: "8px",
                fontSize: "13px",
                fontWeight: 500,
                background: title.trim() && !isCreating ? "#6366f1" : "#e5e7eb",
                color: title.trim() && !isCreating ? "#ffffff" : "#9ca3af",
                border: "none",
                cursor: title.trim() && !isCreating ? "pointer" : "not-allowed",
                transition: "background 0.15s",
              }}
            >
              {isCreating ? "Creating..." : "Create"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Confirm Modal ──────────────────────────────────────────────────────────
function ConfirmModal({
  title,
  message,
  confirmLabel,
  onConfirm,
  onCancel,
}: {
  title: string;
  message: string;
  confirmLabel: string;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onCancel();
      if (e.key === "Enter") onConfirm();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onConfirm, onCancel]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      style={{
        backgroundColor: "rgba(0, 0, 0, 0.15)",
        backdropFilter: "blur(2px)",
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onCancel();
      }}
    >
      <div
        className="w-full max-w-sm mx-4"
        style={{
          borderRadius: "14px",
          background: "#ffffff",
          border: "1px solid #e5e7eb",
          boxShadow:
            "0 20px 25px -5px rgba(0,0,0,0.08), 0 8px 10px -6px rgba(0,0,0,0.04)",
          padding: "20px",
        }}
      >
        <h3
          style={{
            fontSize: "16px",
            fontWeight: 600,
            color: "#111827",
            margin: "0 0 8px 0",
          }}
        >
          {title}
        </h3>
        <p
          style={{
            fontSize: "14px",
            color: "#6b7280",
            margin: "0 0 20px 0",
          }}
        >
          {message}
        </p>
        <div className="flex items-center justify-end gap-2">
          <button
            onClick={onCancel}
            className="btn-modal-cancel"
            style={{
              height: "34px",
              padding: "0 12px",
              borderRadius: "8px",
              fontSize: "13px",
              fontWeight: 500,
              color: "#6b7280",
              background: "transparent",
              border: "none",
              cursor: "pointer",
              transition: "all 0.15s",
            }}
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="btn-modal-confirm"
            style={{
              height: "34px",
              padding: "0 16px",
              borderRadius: "8px",
              fontSize: "13px",
              fontWeight: 500,
              background: "#ef4444",
              color: "#ffffff",
              border: "none",
              cursor: "pointer",
              transition: "background 0.15s",
            }}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Status Indicator ───────────────────────────────────────────────────────
function StatusIndicator({
  status,
  accentColor,
  taskTitle,
  onClick,
  isLoading = false,
}: {
  status: string;
  accentColor: string;
  taskTitle: string;
  onClick: (e: React.MouseEvent) => void;
  isLoading?: boolean;
}) {
  if (status === "completed") {
    return (
      <button
        onClick={onClick}
        disabled={isLoading}
        aria-label={`Mark task "${taskTitle}" as incomplete`}
        className="flex items-center justify-center"
        style={{
          width: "16px",
          height: "16px",
          borderRadius: "50%",
          background: isLoading ? "#9ca3af" : "#16a34a",
          border: "none",
          cursor: isLoading ? "wait" : "pointer",
          padding: 0,
          transition: "opacity 0.15s",
          opacity: isLoading ? 0.6 : 1,
        }}
      >
        {isLoading ? (
          <div
            className="spinner"
            style={{
              width: "8px",
              height: "8px",
              border: "2px solid white",
              borderTop: "2px solid transparent",
              borderRadius: "50%",
              animation: "spin 0.6s linear infinite",
            }}
          />
        ) : (
          <svg
            width="8"
            height="8"
            viewBox="0 0 12 12"
            fill="none"
            stroke="white"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <polyline points="2,6 5,9 10,3" />
          </svg>
        )}
      </button>
    );
  }
  if (status === "in_progress") {
    return (
      <button
        onClick={onClick}
        disabled={isLoading}
        aria-label={`Mark task "${taskTitle}" as complete`}
        className="flex items-center justify-center"
        style={{
          width: "16px",
          height: "16px",
          borderRadius: "50%",
          border: `2px solid ${isLoading ? "#9ca3af" : accentColor}`,
          background: "transparent",
          cursor: isLoading ? "wait" : "pointer",
          padding: 0,
          transition: "all 0.15s",
          opacity: isLoading ? 0.6 : 1,
        }}
      >
        <div
          className={isLoading ? "spinner" : "pulse-dot"}
          style={{
            width: "6px",
            height: "6px",
            borderRadius: "50%",
            background: isLoading ? "transparent" : accentColor,
            ...(isLoading && {
              border: `2px solid ${accentColor}`,
              borderTop: "2px solid transparent",
              animation: "spin 0.6s linear infinite",
            }),
          }}
        />
      </button>
    );
  }
  if (status === "blocked") {
    return (
      <button
        onClick={onClick}
        disabled={isLoading}
        aria-label={`Mark task "${taskTitle}" as complete`}
        className="flex items-center justify-center"
        style={{
          width: "16px",
          height: "16px",
          borderRadius: "50%",
          border: `2px solid ${isLoading ? "#9ca3af" : "#ef4444"}`,
          background: "transparent",
          cursor: isLoading ? "wait" : "pointer",
          padding: 0,
          opacity: isLoading ? 0.6 : 1,
        }}
      >
        {isLoading ? (
          <div
            className="spinner"
            style={{
              width: "6px",
              height: "6px",
              border: "2px solid #ef4444",
              borderTop: "2px solid transparent",
              borderRadius: "50%",
              animation: "spin 0.6s linear infinite",
            }}
          />
        ) : (
          <div
            style={{
              width: "6px",
              height: "2px",
              background: "#ef4444",
              borderRadius: "2px",
            }}
          />
        )}
      </button>
    );
  }
  // queued
  return (
    <button
      onClick={onClick}
      disabled={isLoading}
      aria-label={`Mark task "${taskTitle}" as complete`}
      className="btn-status-queued flex items-center justify-center"
      style={{
        width: "16px",
        height: "16px",
        borderRadius: "50%",
        border: `2px solid ${isLoading ? "#9ca3af" : "#d1d5db"}`,
        background: "transparent",
        cursor: isLoading ? "wait" : "pointer",
        padding: 0,
        transition: "border-color 0.15s",
        opacity: isLoading ? 0.6 : 1,
      }}
    >
      {isLoading && (
        <div
          className="spinner"
          style={{
            width: "6px",
            height: "6px",
            border: "2px solid #9ca3af",
            borderTop: "2px solid transparent",
            borderRadius: "50%",
            animation: "spin 0.6s linear infinite",
          }}
        />
      )}
    </button>
  );
}

// ─── Utility ────────────────────────────────────────────────────────────────
function formatRelativeTime(timestamp: number): string {
  const now = Date.now();
  const diff = now - timestamp;
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);

  if (minutes < 1) return "just now";
  if (minutes < 60) return `${minutes}m ago`;
  if (hours < 24) return `${hours}h ago`;
  if (days < 7) return `${days}d ago`;
  return new Date(timestamp).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
}

// ─── Icons ──────────────────────────────────────────────────────────────────
function PlusIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor">
      <path d="M8 2.5a.75.75 0 01.75.75v4h4a.75.75 0 010 1.5h-4v4a.75.75 0 01-1.5 0v-4h-4a.75.75 0 010-1.5h4v-4A.75.75 0 018 2.5z" />
    </svg>
  );
}

function MoveIcon() {
  return (
    <svg
      width="12"
      height="12"
      viewBox="0 0 16 16"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M5 3l-3 3 3 3" />
      <path d="M2 6h8" />
      <path d="M11 13l3-3-3-3" />
      <path d="M14 10H6" />
    </svg>
  );
}

function TrashIcon() {
  return (
    <svg
      width="12"
      height="12"
      viewBox="0 0 16 16"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M2 4h12" />
      <path d="M5 4V2.5A.5.5 0 015.5 2h5a.5.5 0 01.5.5V4" />
      <path d="M12.5 4v9.5a1 1 0 01-1 1h-7a1 1 0 01-1-1V4" />
    </svg>
  );
}

function ChevronDownIcon({ className = "" }: { className?: string }) {
  return (
    <svg
      width="12"
      height="12"
      viewBox="0 0 16 16"
      fill="#9ca3af"
      className={className}
    >
      <path
        fillRule="evenodd"
        d="M4.22 6.22a.75.75 0 011.06 0L8 8.94l2.72-2.72a.75.75 0 111.06 1.06l-3.25 3.25a.75.75 0 01-1.06 0L4.22 7.28a.75.75 0 010-1.06z"
      />
    </svg>
  );
}
