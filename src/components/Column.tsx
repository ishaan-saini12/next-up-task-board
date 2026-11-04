import { useDroppable } from "@dnd-kit/core";
import { Plus } from "lucide-react";
import { columns, type Task, type Status } from "../types";
import { TaskCard } from "./TaskCard";
export function Column({
  column,
  tasks,
  onNew,
  onOpen,
  disabled,
  filtered,
}: {
  column: (typeof columns)[number];
  tasks: Task[];
  onNew: (status: Status) => void;
  onOpen: (task: Task) => void;
  disabled: boolean;
  filtered: boolean;
}) {
  const { setNodeRef, isOver } = useDroppable({ id: column.id, disabled });
  return (
    <section
      ref={setNodeRef}
      className={`column ${isOver ? "column-over" : ""}`}
      aria-label={column.title}
    >
      <header className="column-heading">
        <div>
          <span className="status-dot" style={{ background: column.color }} />
          <h2>{column.title}</h2>
          <span className="column-count">{tasks.length}</span>
        </div>
        <button
          className="icon-button"
          onClick={() => onNew(column.id)}
          disabled={disabled}
          aria-label={`Add task to ${column.title}`}
        >
          <Plus size={17} />
        </button>
      </header>
      <div className="column-body">
        {tasks.map((task) => (
          <TaskCard
            key={task.id}
            task={task}
            onOpen={() => onOpen(task)}
            disabled={disabled}
          />
        ))}
        {tasks.length === 0 && (
          <div className="column-empty">
            <span className="empty-mark" style={{ color: column.color }}>
              ◇
            </span>
            <p>{filtered ? "No matching tasks" : column.hint}</p>
          </div>
        )}
        <button
          className="add-task"
          onClick={() => onNew(column.id)}
          disabled={disabled}
        >
          <Plus size={15} />
          Add task
        </button>
      </div>
    </section>
  );
}
