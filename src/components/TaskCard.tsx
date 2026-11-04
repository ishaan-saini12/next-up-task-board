import { useDraggable } from "@dnd-kit/core";
import {
  CalendarDays,
  Check,
  GripVertical,
  AlignLeft,
  ArrowUp,
  Minus,
  ArrowDown,
} from "lucide-react";
import type { Task } from "../types";
export function dateLabel(date: string) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const due = new Date(`${date}T00:00:00`);
  const diff = Math.round((due.getTime() - today.getTime()) / 86400000);
  return {
    overdue: diff < 0,
    text:
      diff === 0
        ? "Today"
        : diff === 1
          ? "Tomorrow"
          : due.toLocaleDateString(undefined, {
              month: "short",
              day: "numeric",
            }),
  };
}
export function TaskCard({
  task,
  onOpen,
  disabled = false,
  overlay = false,
}: {
  task: Task;
  onOpen: () => void;
  disabled?: boolean;
  overlay?: boolean;
}) {
  const { attributes, listeners, setNodeRef, transform, isDragging } =
    useDraggable({ id: overlay ? `overlay-${task.id}` : task.id, disabled: disabled || overlay });
  const due = task.due_date ? dateLabel(task.due_date) : null;
  const PriorityIcon =
    task.priority === "high"
      ? ArrowUp
      : task.priority === "low"
        ? ArrowDown
        : Minus;
  return (
    <article
      ref={setNodeRef}
      className={`task-card ${isDragging ? "dragging" : ""} ${overlay ? "drag-overlay" : ""}`}
      style={
        transform && !overlay
          ? { transform: `translate3d(${transform.x}px,${transform.y}px,0)` }
          : undefined
      }
    >
      <div className="card-top">
        <span className={`priority priority-${task.priority}`}>
          <PriorityIcon size={12} />
          {task.priority === "normal"
            ? "Medium"
            : task.priority === "high"
              ? "High"
              : "Low"}
        </span>
        <button
          className="drag-handle"
          aria-label={`Drag ${task.title}`}
          disabled={disabled}
          {...attributes}
          {...listeners}
        >
          <GripVertical size={15} />
        </button>
      </div>
      <button className="card-title" onClick={onOpen} disabled={disabled}>
        {task.status === "done" && <Check size={14} />}
        <span>{task.title}</span>
      </button>
      {task.description && (
        <p className="card-description">{task.description}</p>
      )}
      <div className="card-footer">
        <span
          className={`due-date ${due?.overdue && task.status !== "done" ? "overdue" : ""}`}
        >
          {due ? (
            <>
              <CalendarDays size={12} />
              {due.text}
              {due.overdue && task.status !== "done" ? " · Overdue" : ""}
            </>
          ) : (
            <span className="no-date">No due date</span>
          )}
        </span>
        {task.description && (
          <AlignLeft size={13} aria-label="Has description" />
        )}
      </div>
    </article>
  );
}
