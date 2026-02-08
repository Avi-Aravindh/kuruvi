"use client";

import { useQuery, useMutation } from "convex/react";
import { api } from "../convex/_generated/api";
import { useState, useRef, useEffect } from "react";
import type { Id } from "../convex/_generated/dataModel";

// ─── Types ──────────────────────────────────────────────────────────────────
type AgentId = "inbox" | "design" | "backend" | "frontend" | "qa" | "deploy" | "done";

interface AgentQueue {
  id: AgentId;
  name: string;
  description: string;
  icon: (props: { size?: number }) => React.JSX.Element;
  color: string;
  bgColor: string;
  borderColor: string;
}

// ─── Agent Queue Configuration ──────────────────────────────────────────────
const agentQueues: readonly AgentQueue[] = [
  {
    id: "inbox",
    name: "Inbox",
    description: "Your tasks",
    icon: InboxIcon,
    color: "#6366f1",
    bgColor: "#eef2ff",
    borderColor: "#c7d2fe",
  },
  {
    id: "design",
    name: "Design",
    description: "Design agent",
    icon: DesignIcon,
    color: "#9333ea",
    bgColor: "#faf5ff",
    borderColor: "#e9d5ff",
  },
  {
    id: "backend",
    name: "Backend",
    description: "Backend agent",
    icon: BackendIcon,
    color: "#2563eb",
    bgColor: "#eff6ff",
    borderColor: "#bfdbfe",
  },
  {
    id: "frontend",
    name: "Frontend",
    description: "Frontend agent",
    icon: FrontendIcon,
    color: "#059669",
    bgColor: "#ecfdf5",
    borderColor: "#a7f3d0",
  },
  {
    id: "qa",
    name: "QA",
    description: "QA agent",
    icon: QAIcon,
    color: "#d97706",
    bgColor: "#fffbeb",
    borderColor: "#fde68a",
  },
  {
    id: "deploy",
    name: "Deploy",
    description: "Deploy agent",
    icon: DeployIcon,
    color: "#dc2626",
    bgColor: "#fef2f2",
    borderColor: "#fecaca",
  },
  {
    id: "done",
    name: "Done",
    description: "Completed",
    icon: DoneIcon,
    color: "#16a34a",
    bgColor: "#f0fdf4",
    borderColor: "#bbf7d0",
  },
];

// ─── Priority Configuration ─────────────────────────────────────────────────
const priorityConfig = {
  urgent: { label: "Urgent", color: "#dc2626", bg: "#fef2f2", border: "#fecaca", dot: "#dc2626" },
  high: { label: "High", color: "#ea580c", bg: "#fff7ed", border: "#fed7aa", dot: "#ea580c" },
  medium: { label: "Medium", color: "#6366f1", bg: "#eef2ff", border: "#c7d2fe", dot: "#6366f1" },
  low: { label: "Low", color: "#9ca3af", bg: "#f9fafb", border: "#e5e7eb", dot: "#9ca3af" },
} as const;

type Priority = keyof typeof priorityConfig;

// ─── Main Component ─────────────────────────────────────────────────────────
export default function Home() {
  const tasks = useQuery(api.tasks.list) || [];
  const createTask = useMutation(api.tasks.create);
  const moveTask = useMutation(api.tasks.moveToStage);

  const [showNewTask, setShowNewTask] = useState(false);
  const [newTaskTitle, setNewTaskTitle] = useState("");
  const [newTaskDescription, setNewTaskDescription] = useState("");
  const [newTaskStage, setNewTaskStage] = useState<AgentId>("inbox");
  const [newTaskPriority, setNewTaskPriority] = useState<Priority>("medium");
  const [expandedTask, setExpandedTask] = useState<string | null>(null);

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
    setNewTaskStage("inbox");
    setShowNewTask(false);
  };

  const tasksByAgent = agentQueues.reduce(
    (acc, queue) => {
      acc[queue.id] = tasks.filter((t) => t.stage === queue.id);
      return acc;
    },
    {} as Record<AgentId, typeof tasks>
  );

  const totalTasks = tasks.length;
  const activeTasks = tasks.filter((t) => t.stage !== "done").length;
  const completedTasks = tasks.filter((t) => t.stage === "done").length;

  return (
    <div className="h-screen flex flex-col overflow-hidden" style={{ background: "#fafbfc" }}>
      {/* ─── Header ──────────────────────────────────────────────────── */}
      <header
        className="flex-shrink-0"
        style={{
          background: "#ffffff",
          borderBottom: "1px solid #e5e7eb",
        }}
      >
        <div className="flex items-center justify-between px-6 h-14">
          <div className="flex items-center gap-5">
            {/* Logo */}
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
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M20.24 12.24a6 6 0 0 0-8.49-8.49L5 10.5V19h8.5z" />
                  <line x1="16" y1="8" x2="2" y2="22" />
                  <line x1="17.5" y1="15" x2="9" y2="15" />
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

            {/* Stats */}
            <div
              className="hidden sm:flex items-center gap-3"
              style={{ fontSize: "13px", color: "#6b7280" }}
            >
              <div className="flex items-center gap-1.5">
                <div
                  className="w-2 h-2 rounded-full"
                  style={{ background: "#6366f1" }}
                />
                <span>{activeTasks} active</span>
              </div>
              <span style={{ color: "#d1d5db" }}>/</span>
              <div className="flex items-center gap-1.5">
                <div
                  className="w-2 h-2 rounded-full"
                  style={{ background: "#16a34a" }}
                />
                <span>{completedTasks} done</span>
              </div>
            </div>
          </div>

          <button
            onClick={() => setShowNewTask(true)}
            className="flex items-center gap-1.5"
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
            onMouseEnter={(e) =>
              (e.currentTarget.style.background = "#4f46e5")
            }
            onMouseLeave={(e) =>
              (e.currentTarget.style.background = "#6366f1")
            }
          >
            <PlusIcon />
            <span className="hidden sm:inline">New Task</span>
          </button>
        </div>
      </header>

      {/* ─── Agent Queues Board ────────────────────────────────────── */}
      <div className="flex-1 overflow-x-auto overflow-y-hidden">
        <div className="flex h-full" style={{ minWidth: "fit-content" }}>
          {agentQueues.map((queue) => {
            const queueTasks = tasksByAgent[queue.id] || [];
            const QueueIcon = queue.icon;

            return (
              <div
                key={queue.id}
                className="flex flex-col h-full"
                style={{
                  width: "296px",
                  minWidth: "296px",
                  borderRight: "1px solid #f0f0f0",
                }}
              >
                {/* Column Header */}
                <div
                  className="flex-shrink-0 flex items-center justify-between"
                  style={{ padding: "16px 16px 12px" }}
                >
                  <div className="flex items-center gap-2.5">
                    <div
                      className="w-7 h-7 rounded-md flex items-center justify-center"
                      style={{
                        background: queue.bgColor,
                        border: `1px solid ${queue.borderColor}`,
                      }}
                    >
                      <QueueIcon size={14} />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span
                          style={{
                            fontSize: "13px",
                            fontWeight: 600,
                            color: "#111827",
                          }}
                        >
                          {queue.name}
                        </span>
                        <span
                          style={{
                            fontSize: "12px",
                            fontWeight: 500,
                            color: "#9ca3af",
                            background: "#f3f4f6",
                            padding: "1px 6px",
                            borderRadius: "10px",
                          }}
                        >
                          {queueTasks.length}
                        </span>
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      setNewTaskStage(queue.id);
                      setShowNewTask(true);
                    }}
                    className="flex items-center justify-center"
                    style={{
                      width: "26px",
                      height: "26px",
                      borderRadius: "6px",
                      border: "none",
                      background: "transparent",
                      color: "#9ca3af",
                      cursor: "pointer",
                      transition: "all 0.15s",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = "#f3f4f6";
                      e.currentTarget.style.color = "#6b7280";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = "transparent";
                      e.currentTarget.style.color = "#9ca3af";
                    }}
                  >
                    <PlusIcon />
                  </button>
                </div>

                {/* Task List */}
                <div
                  className="flex-1 overflow-y-auto kanban-column"
                  style={{ padding: "0 8px 12px" }}
                >
                  <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
                    {queueTasks.map((task) => (
                      <TaskCard
                        key={task._id}
                        task={task}
                        queue={queue}
                        allQueues={agentQueues}
                        moveTask={moveTask}
                        isExpanded={expandedTask === task._id}
                        onToggleExpand={() =>
                          setExpandedTask(
                            expandedTask === task._id ? null : task._id
                          )
                        }
                      />
                    ))}
                  </div>

                  {/* Empty state */}
                  {queueTasks.length === 0 && (
                    <div
                      className="flex flex-col items-center justify-center"
                      style={{
                        padding: "48px 16px",
                        color: "#d1d5db",
                      }}
                    >
                      <QueueIcon size={28} />
                      <span
                        style={{
                          fontSize: "13px",
                          marginTop: "8px",
                          color: "#9ca3af",
                        }}
                      >
                        No tasks
                      </span>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ─── New Task Modal ──────────────────────────────────────────── */}
      {showNewTask && (
        <NewTaskModal
          title={newTaskTitle}
          setTitle={setNewTaskTitle}
          description={newTaskDescription}
          setDescription={setNewTaskDescription}
          stage={newTaskStage}
          setStage={setNewTaskStage}
          priority={newTaskPriority}
          setPriority={setNewTaskPriority}
          onSubmit={handleCreateTask}
          onClose={() => {
            setShowNewTask(false);
            setNewTaskTitle("");
            setNewTaskDescription("");
          }}
        />
      )}
    </div>
  );
}

// ─── Task Card ──────────────────────────────────────────────────────────────
function TaskCard({
  task,
  queue,
  allQueues,
  moveTask,
  isExpanded,
  onToggleExpand,
}: {
  task: any;
  queue: AgentQueue;
  allQueues: readonly AgentQueue[];
  moveTask: any;
  isExpanded: boolean;
  onToggleExpand: () => void;
}) {
  const priority = priorityConfig[task.priority as Priority];
  const [showMoveMenu, setShowMoveMenu] = useState(false);

  return (
    <div
      className="group transition-card"
      style={{
        borderRadius: "8px",
        padding: "10px 12px",
        cursor: "pointer",
        background: "#ffffff",
        border: "1px solid transparent",
        transition: "all 0.15s ease",
      }}
      onClick={onToggleExpand}
      onMouseEnter={(e) => {
        e.currentTarget.style.background = "#ffffff";
        e.currentTarget.style.borderColor = "#e5e7eb";
        e.currentTarget.style.boxShadow =
          "0 1px 3px rgba(0,0,0,0.04), 0 1px 2px rgba(0,0,0,0.02)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.background = "#ffffff";
        e.currentTarget.style.borderColor = "transparent";
        e.currentTarget.style.boxShadow = "none";
      }}
    >
      {/* Title row */}
      <div className="flex items-start gap-2.5">
        <div className="flex-shrink-0" style={{ marginTop: "2px" }}>
          <StatusIndicator status={task.status} />
        </div>
        <div className="flex-1" style={{ minWidth: 0 }}>
          <p
            style={{
              fontSize: "13px",
              fontWeight: 500,
              lineHeight: "1.4",
              color: "#111827",
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
        style={{ marginTop: "8px", marginLeft: "22px" }}
      >
        <span
          style={{
            fontSize: "12px",
            fontWeight: 500,
            padding: "2px 8px",
            borderRadius: "4px",
            color: priority.color,
            background: priority.bg,
            border: `1px solid ${priority.border}`,
          }}
        >
          {priority.label}
        </span>

        {task.assignedTo && (
          <span
            className="flex items-center gap-1"
            style={{ fontSize: "12px", color: "#9ca3af" }}
          >
            <UserIcon />
            {task.assignedTo}
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
                lineHeight: "1.5",
                margin: "0 0 12px 0",
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
              marginBottom: "12px",
            }}
          >
            <span>Created {formatRelativeTime(task.createdAt)}</span>
            {task.completedAt && (
              <span>Completed {formatRelativeTime(task.completedAt)}</span>
            )}
          </div>

          {/* Move to agent queue */}
          {queue.id !== "done" && (
            <div style={{ position: "relative" }}>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setShowMoveMenu(!showMoveMenu);
                }}
                className="flex items-center gap-1.5"
                style={{
                  fontSize: "12px",
                  fontWeight: 500,
                  color: "#6366f1",
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  padding: "4px 0",
                  transition: "color 0.15s",
                }}
                onMouseEnter={(e) =>
                  (e.currentTarget.style.color = "#4f46e5")
                }
                onMouseLeave={(e) =>
                  (e.currentTarget.style.color = "#6366f1")
                }
              >
                <MoveIcon />
                Move to...
              </button>

              {/* Move dropdown */}
              {showMoveMenu && (
                <MoveMenu
                  currentQueueId={queue.id}
                  allQueues={allQueues}
                  onMove={(targetId) => {
                    moveTask({
                      taskId: task._id,
                      newStage: targetId,
                      agentName: "user",
                    });
                    setShowMoveMenu(false);
                  }}
                  onClose={() => setShowMoveMenu(false)}
                />
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ─── Move Menu ──────────────────────────────────────────────────────────────
function MoveMenu({
  currentQueueId,
  allQueues,
  onMove,
  onClose,
}: {
  currentQueueId: AgentId;
  allQueues: readonly AgentQueue[];
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
        borderRadius: "8px",
        boxShadow:
          "0 4px 6px -1px rgba(0,0,0,0.07), 0 2px 4px -2px rgba(0,0,0,0.05)",
        padding: "4px",
        zIndex: 10,
        minWidth: "180px",
      }}
      onClick={(e) => e.stopPropagation()}
    >
      {allQueues
        .filter((q) => q.id !== currentQueueId)
        .map((q) => {
          const QIcon = q.icon;
          return (
            <button
              key={q.id}
              onClick={() => onMove(q.id)}
              className="flex items-center gap-2.5 w-full"
              style={{
                padding: "7px 10px",
                borderRadius: "6px",
                border: "none",
                background: "transparent",
                cursor: "pointer",
                fontSize: "13px",
                fontWeight: 400,
                color: "#374151",
                transition: "background 0.1s",
                textAlign: "left",
              }}
              onMouseEnter={(e) =>
                (e.currentTarget.style.background = "#f3f4f6")
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.background = "transparent")
              }
            >
              <div
                className="w-5 h-5 rounded flex items-center justify-center"
                style={{
                  background: q.bgColor,
                }}
              >
                <QIcon size={12} />
              </div>
              {q.name}
            </button>
          );
        })}
    </div>
  );
}

// ─── New Task Modal ─────────────────────────────────────────────────────────
function NewTaskModal({
  title,
  setTitle,
  description,
  setDescription,
  stage,
  setStage,
  priority,
  setPriority,
  onSubmit,
  onClose,
}: {
  title: string;
  setTitle: (v: string) => void;
  description: string;
  setDescription: (v: string) => void;
  stage: AgentId;
  setStage: (v: AgentId) => void;
  priority: Priority;
  setPriority: (v: Priority) => void;
  onSubmit: () => void;
  onClose: () => void;
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

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center modal-overlay"
      style={{
        backgroundColor: "rgba(0, 0, 0, 0.2)",
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
          borderRadius: "12px",
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
            placeholder="Task title"
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
        </div>

        {/* Description input */}
        <div style={{ padding: "8px 20px 0" }}>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Add a description..."
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
            }}
          />
        </div>

        {/* Options bar */}
        <div
          className="flex items-center gap-2 flex-wrap"
          style={{ padding: "12px 20px" }}
        >
          {/* Agent queue selector */}
          <div style={{ position: "relative" }}>
            <select
              value={stage}
              onChange={(e) => setStage(e.target.value as AgentId)}
              style={{
                appearance: "none",
                height: "30px",
                padding: "0 28px 0 10px",
                borderRadius: "6px",
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
              {agentQueues.map((q) => (
                <option key={q.id} value={q.id}>
                  {q.name}
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
                height: "30px",
                padding: "0 28px 0 10px",
                borderRadius: "6px",
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
          <span style={{ fontSize: "12px", color: "#9ca3af" }}>
            Press Enter to create
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              style={{
                height: "34px",
                padding: "0 12px",
                borderRadius: "6px",
                fontSize: "13px",
                fontWeight: 500,
                color: "#6b7280",
                background: "transparent",
                border: "none",
                cursor: "pointer",
                transition: "all 0.15s",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = "#f3f4f6";
                e.currentTarget.style.color = "#374151";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = "transparent";
                e.currentTarget.style.color = "#6b7280";
              }}
            >
              Cancel
            </button>
            <button
              onClick={onSubmit}
              disabled={!title.trim()}
              style={{
                height: "34px",
                padding: "0 16px",
                borderRadius: "6px",
                fontSize: "13px",
                fontWeight: 500,
                background: title.trim() ? "#6366f1" : "#e5e7eb",
                color: title.trim() ? "#ffffff" : "#9ca3af",
                border: "none",
                cursor: title.trim() ? "pointer" : "not-allowed",
                transition: "background 0.15s",
              }}
              onMouseEnter={(e) => {
                if (title.trim()) e.currentTarget.style.background = "#4f46e5";
              }}
              onMouseLeave={(e) => {
                if (title.trim()) e.currentTarget.style.background = "#6366f1";
              }}
            >
              Create
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Status Indicator ───────────────────────────────────────────────────────
function StatusIndicator({ status }: { status: string }) {
  if (status === "completed") {
    return (
      <div
        className="flex items-center justify-center"
        style={{
          width: "16px",
          height: "16px",
          borderRadius: "50%",
          background: "#16a34a",
        }}
      >
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
      </div>
    );
  }
  if (status === "in_progress") {
    return (
      <div
        className="flex items-center justify-center"
        style={{
          width: "16px",
          height: "16px",
          borderRadius: "50%",
          border: "2px solid #f59e0b",
        }}
      >
        <div
          className="pulse-dot"
          style={{
            width: "6px",
            height: "6px",
            borderRadius: "50%",
            background: "#f59e0b",
          }}
        />
      </div>
    );
  }
  if (status === "blocked") {
    return (
      <div
        className="flex items-center justify-center"
        style={{
          width: "16px",
          height: "16px",
          borderRadius: "50%",
          border: "2px solid #ef4444",
        }}
      >
        <div
          style={{
            width: "6px",
            height: "2px",
            background: "#ef4444",
            borderRadius: "2px",
          }}
        />
      </div>
    );
  }
  // queued
  return (
    <div
      style={{
        width: "16px",
        height: "16px",
        borderRadius: "50%",
        border: "2px solid #d1d5db",
      }}
    />
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

function UserIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 16 16" fill="currentColor" style={{ opacity: 0.5 }}>
      <path d="M10.561 8.073a6.005 6.005 0 013.432 5.142.75.75 0 11-1.498.07 4.5 4.5 0 00-8.99 0 .75.75 0 01-1.498-.07 6.005 6.005 0 013.431-5.142 3.999 3.999 0 115.123 0zM10.5 5a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
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

// ─── Agent Queue Icons ──────────────────────────────────────────────────────
function InboxIcon({ size = 14 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="#6366f1">
      <path d="M1.5 3A1.5 1.5 0 013 1.5h10A1.5 1.5 0 0114.5 3v4.134a1 1 0 01-.232.636L11.5 11.234V13.5a1 1 0 01-1 1h-5a1 1 0 01-1-1v-2.266L1.732 7.77A1 1 0 011.5 7.134V3zm1.5 0v4.134l2.768 3.464a1 1 0 01.232.636V13.5h4v-2.266a1 1 0 01.232-.636L13 7.134V3H3z" />
    </svg>
  );
}

function DesignIcon({ size = 14 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="#9333ea">
      <path d="M8 1a.75.75 0 01.75.75v2.5a.75.75 0 01-1.5 0v-2.5A.75.75 0 018 1zm5.303 2.697a.75.75 0 010 1.06l-1.768 1.768a.75.75 0 01-1.06-1.06l1.767-1.768a.75.75 0 011.061 0zM15 8a.75.75 0 01-.75.75h-2.5a.75.75 0 010-1.5h2.5A.75.75 0 0115 8zm-2.697 5.303a.75.75 0 01-1.06 0l-1.768-1.768a.75.75 0 111.06-1.06l1.768 1.767a.75.75 0 010 1.061zM8 11.25a.75.75 0 01.75.75v2.5a.75.75 0 01-1.5 0V12a.75.75 0 01.75-.75zm-5.303-2.553a.75.75 0 010-1.06l1.768-1.768a.75.75 0 011.06 1.06L3.758 8.697a.75.75 0 01-1.061 0zM1 8a.75.75 0 01.75-.75h2.5a.75.75 0 010 1.5h-2.5A.75.75 0 011 8zm2.697-5.303a.75.75 0 011.06 0l1.768 1.768a.75.75 0 01-1.06 1.06L3.697 3.758a.75.75 0 010-1.061zM8 5.5a2.5 2.5 0 100 5 2.5 2.5 0 000-5z" />
    </svg>
  );
}

function BackendIcon({ size = 14 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="#2563eb">
      <path
        fillRule="evenodd"
        d="M0 1.75C0 .784.784 0 1.75 0h12.5C15.216 0 16 .784 16 1.75v3.585a.746.746 0 010 .83v5.085A1.75 1.75 0 0114.25 13H1.75A1.75 1.75 0 010 11.25V6.165a.746.746 0 010-.83V1.75zm1.75-.25a.25.25 0 00-.25.25v3h13V1.75a.25.25 0 00-.25-.25H1.75zM1.5 6.25v5a.25.25 0 00.25.25h12.5a.25.25 0 00.25-.25v-5h-13zM3 8.75A.75.75 0 013.75 8h4.5a.75.75 0 010 1.5h-4.5A.75.75 0 013 8.75zM3.75 3a.75.75 0 000 1.5h.5a.75.75 0 000-1.5h-.5zM6 3.75a.75.75 0 01.75-.75h.5a.75.75 0 010 1.5h-.5A.75.75 0 016 3.75z"
      />
    </svg>
  );
}

function FrontendIcon({ size = 14 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="#059669">
      <path
        fillRule="evenodd"
        d="M4.72 3.22a.75.75 0 011.06 1.06L2.06 8l3.72 3.72a.75.75 0 11-1.06 1.06L.47 8.53a.75.75 0 010-1.06l4.25-4.25zm6.56 0a.75.75 0 10-1.06 1.06L13.94 8l-3.72 3.72a.75.75 0 101.06 1.06l4.25-4.25a.75.75 0 000-1.06l-4.25-4.25z"
      />
    </svg>
  );
}

function QAIcon({ size = 14 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="#d97706">
      <path
        fillRule="evenodd"
        d="M2.5 1.75v11.5c0 .138.112.25.25.25h3.17a.75.75 0 010 1.5H2.75A1.75 1.75 0 011 13.25V1.75C1 .784 1.784 0 2.75 0h10.5C14.216 0 15 .784 15 1.75v7.5a.75.75 0 01-1.5 0v-7.5a.25.25 0 00-.25-.25H2.75a.25.25 0 00-.25.25zm8.78 8.97a.75.75 0 010 1.06l-2.25 2.25a.75.75 0 01-1.06 0l-1.25-1.25a.75.75 0 111.06-1.06l.72.72 1.72-1.72a.75.75 0 011.06 0zM4.75 3h6.5a.75.75 0 010 1.5h-6.5a.75.75 0 010-1.5zM4 6.75A.75.75 0 014.75 6h6.5a.75.75 0 010 1.5h-6.5A.75.75 0 014 6.75z"
      />
    </svg>
  );
}

function DeployIcon({ size = 14 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="#dc2626">
      <path
        fillRule="evenodd"
        d="M8.53 1.22a.75.75 0 00-1.06 0L3.72 4.97a.75.75 0 001.06 1.06l2.47-2.47v6.69a.75.75 0 001.5 0V3.56l2.47 2.47a.75.75 0 101.06-1.06L8.53 1.22zM3.75 13a.75.75 0 000 1.5h8.5a.75.75 0 000-1.5h-8.5z"
      />
    </svg>
  );
}

function DoneIcon({ size = 14 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="#16a34a">
      <path
        fillRule="evenodd"
        d="M8 16A8 8 0 108 0a8 8 0 000 16zm3.78-9.72a.75.75 0 00-1.06-1.06L6.75 9.19 5.28 7.72a.75.75 0 00-1.06 1.06l2 2a.75.75 0 001.06 0l4.5-4.5z"
      />
    </svg>
  );
}
