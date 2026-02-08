"use client";

import { useQuery, useMutation } from "convex/react";
import { api } from "../convex/_generated/api";
import { useState, useRef, useEffect, useCallback } from "react";
import type { Id } from "../convex/_generated/dataModel";

// ─── Types ──────────────────────────────────────────────────────────────────
type StageId = "inbox" | "design" | "backend" | "frontend" | "qa" | "deploy" | "done";

type StageIconProps = { color: string; size?: number };

interface Stage {
  id: StageId;
  name: string;
  icon: (props: StageIconProps) => React.JSX.Element;
  accent: string;
}

// ─── Stage Configuration ────────────────────────────────────────────────────
const stages: readonly Stage[] = [
  { id: "inbox", name: "Inbox", icon: InboxIcon, accent: "#6366f1" },
  { id: "design", name: "Design", icon: DesignIcon, accent: "#a855f7" },
  { id: "backend", name: "Backend", icon: BackendIcon, accent: "#3b82f6" },
  { id: "frontend", name: "Frontend", icon: FrontendIcon, accent: "#10b981" },
  { id: "qa", name: "QA", icon: QAIcon, accent: "#f59e0b" },
  { id: "deploy", name: "Deploy", icon: DeployIcon, accent: "#ef4444" },
  { id: "done", name: "Done", icon: DoneIcon, accent: "#22c55e" },
];

// ─── Priority Configuration ─────────────────────────────────────────────────
const priorityConfig = {
  urgent: { label: "Urgent", color: "#ef4444", bg: "rgba(239,68,68,0.1)", border: "rgba(239,68,68,0.2)" },
  high: { label: "High", color: "#f97316", bg: "rgba(249,115,22,0.1)", border: "rgba(249,115,22,0.2)" },
  medium: { label: "Medium", color: "#6366f1", bg: "rgba(99,102,241,0.1)", border: "rgba(99,102,241,0.2)" },
  low: { label: "Low", color: "#a1a1aa", bg: "rgba(161,161,170,0.08)", border: "rgba(161,161,170,0.15)" },
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
  const [newTaskStage, setNewTaskStage] = useState<StageId>("inbox");
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

  const tasksByStage = stages.reduce((acc, stage) => {
    acc[stage.id] = tasks.filter((t) => t.stage === stage.id);
    return acc;
  }, {} as Record<StageId, typeof tasks>);

  const totalTasks = tasks.length;
  const completedTasks = tasks.filter(t => t.stage === "done").length;

  return (
    <div className="h-screen flex flex-col bg-background text-foreground overflow-hidden">
      {/* ─── Header ──────────────────────────────────────────────────── */}
      <header className="flex-shrink-0 border-b border-border">
        <div className="flex items-center justify-between px-5 h-14">
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-lg bg-accent flex items-center justify-center">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M20.24 12.24a6 6 0 0 0-8.49-8.49L5 10.5V19h8.5z" />
                  <line x1="16" y1="8" x2="2" y2="22" />
                  <line x1="17.5" y1="15" x2="9" y2="15" />
                </svg>
              </div>
              <span className="font-semibold text-[15px] tracking-tight">Kuruvi</span>
            </div>

            {/* Breadcrumb-style summary */}
            <div className="hidden sm:flex items-center gap-2 text-[13px] text-muted">
              <span>{totalTasks} tasks</span>
              <span className="text-border">|</span>
              <span>{completedTasks} done</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowNewTask(true)}
              className="h-8 px-3 rounded-md text-[13px] font-medium bg-accent text-white hover:bg-accent-hover transition-colors flex items-center gap-1.5"
            >
              <PlusIcon />
              <span className="hidden sm:inline">New Task</span>
            </button>
          </div>
        </div>
      </header>

      {/* ─── Board ───────────────────────────────────────────────────── */}
      <div className="flex-1 overflow-x-auto overflow-y-hidden">
        <div className="flex h-full min-w-fit">
          {stages.map((stage) => {
            const stageTasks = tasksByStage[stage.id] || [];
            const StageIcon = stage.icon;

            return (
              <div
                key={stage.id}
                className="flex flex-col h-full border-r border-border last:border-r-0"
                style={{ width: "280px", minWidth: "280px" }}
              >
                {/* Column Header */}
                <div className="flex-shrink-0 px-4 py-3 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <StageIcon color={stage.accent} />
                    <span className="text-[13px] font-medium">{stage.name}</span>
                    <span className="text-[12px] text-muted ml-0.5">
                      {stageTasks.length}
                    </span>
                  </div>
                  {stage.id === "inbox" && (
                    <button
                      onClick={() => {
                        setNewTaskStage("inbox");
                        setShowNewTask(true);
                      }}
                      className="w-6 h-6 rounded-md hover:bg-surface-hover flex items-center justify-center text-muted hover:text-foreground transition-colors"
                    >
                      <PlusIcon />
                    </button>
                  )}
                </div>

                {/* Task List */}
                <div className="flex-1 overflow-y-auto px-2 pb-3 kanban-column">
                  <div className="space-y-[1px]">
                    {stageTasks.map((task) => (
                      <TaskCard
                        key={task._id}
                        task={task}
                        stage={stage}
                        stages={stages}
                        moveTask={moveTask}
                        isExpanded={expandedTask === task._id}
                        onToggleExpand={() =>
                          setExpandedTask(expandedTask === task._id ? null : task._id)
                        }
                      />
                    ))}
                  </div>

                  {/* Empty state */}
                  {stageTasks.length === 0 && (
                    <div className="flex flex-col items-center justify-center py-12 text-muted">
                      <StageIcon color="var(--border-color)" size={28} />
                      <span className="text-[12px] mt-2">No tasks</span>
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
  stage,
  stages,
  moveTask,
  isExpanded,
  onToggleExpand,
}: {
  task: any;
  stage: Stage;
  stages: readonly Stage[];
  moveTask: any;
  isExpanded: boolean;
  onToggleExpand: () => void;
}) {
  const stageIndex = stages.findIndex((s) => s.id === stage.id);
  const nextStage = stageIndex < stages.length - 1 ? stages[stageIndex + 1] : null;
  const priority = priorityConfig[task.priority as Priority];

  return (
    <div
      className="group rounded-lg px-3 py-2.5 cursor-pointer transition-card hover:bg-surface-hover border border-transparent hover:border-border"
      onClick={onToggleExpand}
    >
      {/* Title row */}
      <div className="flex items-start gap-2.5">
        <div className="flex-shrink-0 mt-0.5">
          <StatusIndicator status={task.status} />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-[13px] font-medium leading-snug text-foreground line-clamp-2">
            {task.title}
          </p>
        </div>
      </div>

      {/* Meta row */}
      <div className="flex items-center gap-2 mt-2 ml-[22px]">
        <span
          className="text-[11px] font-medium px-1.5 py-0.5 rounded"
          style={{
            color: priority.color,
            backgroundColor: priority.bg,
            border: `1px solid ${priority.border}`,
          }}
        >
          {priority.label}
        </span>

        {task.assignedTo && (
          <span className="text-[11px] text-muted flex items-center gap-1">
            <UserIcon />
            {task.assignedTo}
          </span>
        )}
      </div>

      {/* Expanded details */}
      {isExpanded && (
        <div className="mt-3 ml-[22px] space-y-3">
          {task.description && (
            <p className="text-[12px] text-muted leading-relaxed">
              {task.description}
            </p>
          )}

          {/* Timestamps */}
          <div className="text-[11px] text-muted flex items-center gap-3">
            <span>Created {formatRelativeTime(task.createdAt)}</span>
            {task.completedAt && (
              <span>Completed {formatRelativeTime(task.completedAt)}</span>
            )}
          </div>

          {/* Move actions */}
          {nextStage && stage.id !== "done" && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                moveTask({
                  taskId: task._id,
                  newStage: nextStage.id,
                  agentName: "user",
                });
              }}
              className="flex items-center gap-1.5 text-[12px] font-medium text-accent hover:text-accent-hover transition-colors"
            >
              <ArrowRightIcon />
              Move to {nextStage.name}
            </button>
          )}
        </div>
      )}
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
  stage: StageId;
  setStage: (v: StageId) => void;
  priority: Priority;
  setPriority: (v: Priority) => void;
  onSubmit: () => void;
  onClose: () => void;
}) {
  const titleRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    titleRef.current?.focus();
  }, []);

  // Close on Escape
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center pt-[15vh] modal-overlay"
      style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        className="modal-content w-full max-w-lg mx-4 rounded-xl bg-surface border border-border overflow-hidden"
        style={{ boxShadow: "0 24px 48px -12px rgba(0,0,0,0.25)" }}
      >
        {/* Title input */}
        <div className="px-5 pt-5">
          <input
            ref={titleRef}
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Task title"
            className="w-full text-[15px] font-medium bg-transparent placeholder:text-muted/50 focus:outline-none"
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                onSubmit();
              }
            }}
          />
        </div>

        {/* Description input */}
        <div className="px-5 pt-2">
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Add a description..."
            rows={3}
            className="w-full text-[13px] bg-transparent placeholder:text-muted/50 focus:outline-none resize-none text-muted"
          />
        </div>

        {/* Options bar */}
        <div className="px-5 py-3 flex items-center gap-2 flex-wrap">
          {/* Stage selector */}
          <div className="relative">
            <select
              value={stage}
              onChange={(e) => setStage(e.target.value as StageId)}
              className="appearance-none h-7 pl-2.5 pr-7 rounded-md text-[12px] font-medium bg-surface-hover border border-border hover:border-border-hover cursor-pointer focus:outline-none focus:border-accent transition-colors"
            >
              {stages.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>
            <ChevronDownIcon className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>

          {/* Priority selector */}
          <div className="relative">
            <select
              value={priority}
              onChange={(e) => setPriority(e.target.value as Priority)}
              className="appearance-none h-7 pl-2.5 pr-7 rounded-md text-[12px] font-medium bg-surface-hover border border-border hover:border-border-hover cursor-pointer focus:outline-none focus:border-accent transition-colors"
            >
              {(Object.entries(priorityConfig) as [Priority, (typeof priorityConfig)[Priority]][]).map(
                ([key, config]) => (
                  <option key={key} value={key}>
                    {config.label}
                  </option>
                )
              )}
            </select>
            <ChevronDownIcon className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>
        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-border flex items-center justify-between">
          <span className="text-[11px] text-muted">
            Press Enter to create
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="h-8 px-3 rounded-md text-[13px] font-medium text-muted hover:text-foreground hover:bg-surface-hover transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={onSubmit}
              disabled={!title.trim()}
              className="h-8 px-4 rounded-md text-[13px] font-medium bg-accent text-white hover:bg-accent-hover transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
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
      <div className="w-4 h-4 rounded-full bg-[#22c55e] flex items-center justify-center">
        <svg width="8" height="8" viewBox="0 0 12 12" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="2,6 5,9 10,3" />
        </svg>
      </div>
    );
  }
  if (status === "in_progress") {
    return (
      <div className="w-4 h-4 rounded-full border-2 border-[#f59e0b] flex items-center justify-center">
        <div className="w-1.5 h-1.5 rounded-full bg-[#f59e0b] pulse-dot" />
      </div>
    );
  }
  if (status === "blocked") {
    return (
      <div className="w-4 h-4 rounded-full border-2 border-[#ef4444] flex items-center justify-center">
        <div className="w-[6px] h-[2px] bg-[#ef4444] rounded-full" />
      </div>
    );
  }
  // queued
  return (
    <div className="w-4 h-4 rounded-full border-2 border-border" />
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

function ArrowRightIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 16 16" fill="currentColor">
      <path fillRule="evenodd" d="M8.22 2.97a.75.75 0 011.06 0l4.25 4.25a.75.75 0 010 1.06l-4.25 4.25a.75.75 0 01-1.06-1.06l2.97-2.97H3.75a.75.75 0 010-1.5h7.44L8.22 4.03a.75.75 0 010-1.06z" />
    </svg>
  );
}

function UserIcon() {
  return (
    <svg width="10" height="10" viewBox="0 0 16 16" fill="currentColor" className="opacity-60">
      <path d="M10.561 8.073a6.005 6.005 0 013.432 5.142.75.75 0 11-1.498.07 4.5 4.5 0 00-8.99 0 .75.75 0 01-1.498-.07 6.005 6.005 0 013.431-5.142 3.999 3.999 0 115.123 0zM10.5 5a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
    </svg>
  );
}

function ChevronDownIcon({ className = "" }: { className?: string }) {
  return (
    <svg width="12" height="12" viewBox="0 0 16 16" fill="currentColor" className={`text-muted ${className}`}>
      <path fillRule="evenodd" d="M4.22 6.22a.75.75 0 011.06 0L8 8.94l2.72-2.72a.75.75 0 111.06 1.06l-3.25 3.25a.75.75 0 01-1.06 0L4.22 7.28a.75.75 0 010-1.06z" />
    </svg>
  );
}

// ─── Stage Icons ────────────────────────────────────────────────────────────
function InboxIcon({ color, size = 14 }: { color: string; size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" fill={color}>
      <path d="M1.5 3A1.5 1.5 0 013 1.5h10A1.5 1.5 0 0114.5 3v4.134a1 1 0 01-.232.636L11.5 11.234V13.5a1 1 0 01-1 1h-5a1 1 0 01-1-1v-2.266L1.732 7.77A1 1 0 011.5 7.134V3zm1.5 0v4.134l2.768 3.464a1 1 0 01.232.636V13.5h4v-2.266a1 1 0 01.232-.636L13 7.134V3H3z" />
    </svg>
  );
}

function DesignIcon({ color, size = 14 }: { color: string; size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" fill={color}>
      <path d="M8 1a.75.75 0 01.75.75v2.5a.75.75 0 01-1.5 0v-2.5A.75.75 0 018 1zm5.303 2.697a.75.75 0 010 1.06l-1.768 1.768a.75.75 0 01-1.06-1.06l1.767-1.768a.75.75 0 011.061 0zM15 8a.75.75 0 01-.75.75h-2.5a.75.75 0 010-1.5h2.5A.75.75 0 0115 8zm-2.697 5.303a.75.75 0 01-1.06 0l-1.768-1.768a.75.75 0 111.06-1.06l1.768 1.767a.75.75 0 010 1.061zM8 11.25a.75.75 0 01.75.75v2.5a.75.75 0 01-1.5 0V12a.75.75 0 01.75-.75zm-5.303-2.553a.75.75 0 010-1.06l1.768-1.768a.75.75 0 011.06 1.06L3.758 8.697a.75.75 0 01-1.061 0zM1 8a.75.75 0 01.75-.75h2.5a.75.75 0 010 1.5h-2.5A.75.75 0 011 8zm2.697-5.303a.75.75 0 011.06 0l1.768 1.768a.75.75 0 01-1.06 1.06L3.697 3.758a.75.75 0 010-1.061zM8 5.5a2.5 2.5 0 100 5 2.5 2.5 0 000-5z" />
    </svg>
  );
}

function BackendIcon({ color, size = 14 }: { color: string; size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" fill={color}>
      <path fillRule="evenodd" d="M0 1.75C0 .784.784 0 1.75 0h12.5C15.216 0 16 .784 16 1.75v3.585a.746.746 0 010 .83v5.085A1.75 1.75 0 0114.25 13H1.75A1.75 1.75 0 010 11.25V6.165a.746.746 0 010-.83V1.75zm1.75-.25a.25.25 0 00-.25.25v3h13V1.75a.25.25 0 00-.25-.25H1.75zM1.5 6.25v5a.25.25 0 00.25.25h12.5a.25.25 0 00.25-.25v-5h-13zM3 8.75A.75.75 0 013.75 8h4.5a.75.75 0 010 1.5h-4.5A.75.75 0 013 8.75zM3.75 3a.75.75 0 000 1.5h.5a.75.75 0 000-1.5h-.5zM6 3.75a.75.75 0 01.75-.75h.5a.75.75 0 010 1.5h-.5A.75.75 0 016 3.75z" />
    </svg>
  );
}

function FrontendIcon({ color, size = 14 }: { color: string; size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" fill={color}>
      <path fillRule="evenodd" d="M4.72 3.22a.75.75 0 011.06 1.06L2.06 8l3.72 3.72a.75.75 0 11-1.06 1.06L.47 8.53a.75.75 0 010-1.06l4.25-4.25zm6.56 0a.75.75 0 10-1.06 1.06L13.94 8l-3.72 3.72a.75.75 0 101.06 1.06l4.25-4.25a.75.75 0 000-1.06l-4.25-4.25z" />
    </svg>
  );
}

function QAIcon({ color, size = 14 }: { color: string; size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" fill={color}>
      <path fillRule="evenodd" d="M2.5 1.75v11.5c0 .138.112.25.25.25h3.17a.75.75 0 010 1.5H2.75A1.75 1.75 0 011 13.25V1.75C1 .784 1.784 0 2.75 0h10.5C14.216 0 15 .784 15 1.75v7.5a.75.75 0 01-1.5 0v-7.5a.25.25 0 00-.25-.25H2.75a.25.25 0 00-.25.25zm8.78 8.97a.75.75 0 010 1.06l-2.25 2.25a.75.75 0 01-1.06 0l-1.25-1.25a.75.75 0 111.06-1.06l.72.72 1.72-1.72a.75.75 0 011.06 0zM4.75 3h6.5a.75.75 0 010 1.5h-6.5a.75.75 0 010-1.5zM4 6.75A.75.75 0 014.75 6h6.5a.75.75 0 010 1.5h-6.5A.75.75 0 014 6.75z" />
    </svg>
  );
}

function DeployIcon({ color, size = 14 }: { color: string; size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" fill={color}>
      <path fillRule="evenodd" d="M8.53 1.22a.75.75 0 00-1.06 0L3.72 4.97a.75.75 0 001.06 1.06l2.47-2.47v6.69a.75.75 0 001.5 0V3.56l2.47 2.47a.75.75 0 101.06-1.06L8.53 1.22zM3.75 13a.75.75 0 000 1.5h8.5a.75.75 0 000-1.5h-8.5z" />
    </svg>
  );
}

function DoneIcon({ color, size = 14 }: { color: string; size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" fill={color}>
      <path fillRule="evenodd" d="M8 16A8 8 0 108 0a8 8 0 000 16zm3.78-9.72a.75.75 0 00-1.06-1.06L6.75 9.19 5.28 7.72a.75.75 0 00-1.06 1.06l2 2a.75.75 0 001.06 0l4.5-4.5z" />
    </svg>
  );
}
