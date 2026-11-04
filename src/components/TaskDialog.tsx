import { useEffect, useRef, useState, type FormEvent } from "react";
import { ArrowUpRight, CalendarDays, Trash2, X } from "lucide-react";
import {
  columns,
  type Priority,
  type Status,
  type Task,
  type TaskInput,
} from "../types";
export function TaskDialog({
  task,
  status,
  busy,
  error,
  onClose,
  onSave,
  onDelete,
}: {
  task: Task | null;
  status: Status;
  busy: boolean;
  error: string;
  onClose: () => void;
  onSave: (input: TaskInput) => Promise<boolean>;
  onDelete: () => Promise<boolean>;
}) {
  const ref = useRef<HTMLDialogElement>(null);
  const [title, setTitle] = useState(task?.title || "");
  const [description, setDescription] = useState(task?.description || "");
  const [selectedStatus, setStatus] = useState<Status>(task?.status || status);
  const [priority, setPriority] = useState<Priority>(
    task?.priority || "normal",
  );
  const [dueDate, setDueDate] = useState(task?.due_date || "");
  const [confirmDelete, setConfirmDelete] = useState(false);
  useEffect(() => {
    const dialog = ref.current!;
    dialog.showModal();
    return () => dialog.close();
  }, []);
  async function submit(e: FormEvent) {
    e.preventDefault();
    if (
      title.trim() &&
      (await onSave({
        title: title.trim(),
        description: description.trim(),
        status: selectedStatus,
        priority,
        due_date: dueDate || null,
      }))
    )
      onClose();
  }
  return (
    <dialog
      ref={ref}
      className="task-dialog"
      onCancel={(e) => {
        if (busy) e.preventDefault();
        else onClose();
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget && !busy) onClose();
      }}
      aria-labelledby="dialog-title"
    >
      <form onSubmit={submit}>
        <header className="dialog-header">
          <span className="eyebrow">A LITTLE CLARITY GOES A LONG WAY</span>
          <button
            type="button"
            className="icon-button"
            onClick={onClose}
            disabled={busy}
            aria-label="Close task editor"
          >
            <X size={20} />
          </button>
        </header>
        <h2 id="dialog-title">
          {task ? "The details matter." : "What’s next?"}
        </h2>
        <p className="dialog-subtitle">
          {task
            ? "Give this task a little attention."
            : "Turn that thought into a little forward motion."}
        </p>
        <label className="field">
          Task name
          <input
            autoFocus
            required
            maxLength={160}
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Give your next step a name"
            disabled={busy}
          />
        </label>
        <label className="field">
          Description <span className="optional">optional</span>
          <textarea
            maxLength={5000}
            rows={4}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="A little context, a few ideas, or a definition of done…"
            disabled={busy}
          />
        </label>
        <div className="form-row">
          <label className="field">
            Status
            <select
              value={selectedStatus}
              onChange={(e) => setStatus(e.target.value as Status)}
              disabled={busy}
            >
              {columns.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.title}
                </option>
              ))}
            </select>
          </label>
          <label className="field">
            Priority
            <select
              value={priority}
              onChange={(e) => setPriority(e.target.value as Priority)}
              disabled={busy}
            >
              <option value="low">Low</option>
              <option value="normal">Medium</option>
              <option value="high">High</option>
            </select>
          </label>
        </div>
        <label className="field">
          <span>
            <CalendarDays size={13} /> Due date{" "}
            <span className="optional">optional</span>
          </span>
          <input
            type="date"
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
            disabled={busy}
          />
        </label>
        {error && (
          <div className="error-banner" role="alert">
            {error}
          </div>
        )}
        {confirmDelete && (
          <div className="delete-confirm">
            <p>Delete this task? This cannot be undone.</p>
            <button
              type="button"
              className="danger-button"
              disabled={busy}
              onClick={async () => {
                if (await onDelete()) onClose();
              }}
            >
              Yes, delete task
            </button>
            <button
              type="button"
              className="text-button"
              onClick={() => setConfirmDelete(false)}
              disabled={busy}
            >
              Keep task
            </button>
          </div>
        )}
        <footer className="dialog-footer">
          {task ? (
            <button
              type="button"
              className="delete-button"
              disabled={busy}
              onClick={() => setConfirmDelete(true)}
            >
              <Trash2 size={16} />
              Delete
            </button>
          ) : (
            <span />
          )}
          <div>
            <button
              type="button"
              className="secondary-button"
              onClick={onClose}
              disabled={busy}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="primary-button"
              disabled={busy || !title.trim()}
            >
              {busy ? "Saving…" : task ? "Save changes" : "Create task"}
              <ArrowUpRight size={16} />
            </button>
          </div>
        </footer>
      </form>
    </dialog>
  );
}
