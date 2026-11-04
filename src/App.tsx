import { useEffect, useMemo, useRef, useState } from "react";
import {
  DndContext,
  DragOverlay,
  KeyboardSensor,
  PointerSensor,
  TouchSensor,
  useSensor,
  useSensors,
  rectIntersection,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  ArrowUpRight,
  ArrowRight,
  Check,
  CheckCheck,
  CircleHelp,
  Columns3,
  Flag,
  LayoutGrid,
  Leaf,
  LoaderCircle,
  LockKeyhole,
  Plus,
  Search,
  Sparkles,
  X,
} from "lucide-react";
import { columns, type Priority, type Status, type Task } from "./types";
import { useTasks } from "./hooks/useTasks";
import { Column } from "./components/Column";
import { TaskCard, dateLabel } from "./components/TaskCard";
import { TaskDialog } from "./components/TaskDialog";

export default function App() {
  const board = useTasks();
  const [query, setQuery] = useState("");
  const [priority, setPriority] = useState<Priority | "all">("all");
  const [view, setView] = useState<"all" | "due" | "done">("all");
  const [dialog, setDialog] = useState<{
    task: Task | null;
    status: Status;
  } | null>(null);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [help, setHelp] = useState(false);
  const [notice, setNotice] = useState("");
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(TouchSensor, {
      activationConstraint: { delay: 200, tolerance: 8 },
    }),
    useSensor(KeyboardSensor),
  );
  const visible = useMemo(
    () =>
      board.tasks.filter(
        (t) =>
          t.title.toLowerCase().includes(query.toLowerCase().trim()) &&
          (priority === "all" || priority === t.priority) &&
          (view === "all" ||
            (view === "done"
              ? t.status === "done"
              : t.status !== "done" &&
                t.due_date &&
                dateLabel(t.due_date).text === "Today")),
      ),
    [board.tasks, query, priority, view],
  );
  const completed = board.tasks.filter((t) => t.status === "done").length;
  const overdue = board.tasks.filter(
    (t) => t.status !== "done" && t.due_date && dateLabel(t.due_date).overdue,
  ).length;
  const active = board.tasks.find((t) => t.id === activeId);
  const blocked =
    board.loading || board.busy || (!!board.error && board.tasks.length === 0);
  const filtered = !!query || priority !== "all" || view !== "all";
  function add(status: Status = "todo") {
    setDialog({ task: null, status });
  }
  async function dragEnd(event: DragEndEvent) {
    setActiveId(null);
    const task = board.tasks.find((t) => t.id === event.active.id);
    const status = columns.find((c) => c.id === event.over?.id)?.id;
    if (
      task &&
      status &&
      status !== task.status &&
      (await board.update(task.id, { status }))
    )
      setNotice(
        `Moved “${task.title}” to ${columns.find((c) => c.id === status)!.title}.`,
      );
  }
  return (
    <div className="app-shell">
      <aside className="sidebar">
        <a className="brand" href="#" aria-label="Next Up home">
          <span className="brand-mark">
            n<span>↗</span>
          </span>
          next up<span className="brand-period">.</span>
        </a>
        <div className="workspace-label">
          <span className="workspace-avatar">Y</span>
          <div>
            Your workspace<small>A little room to do great things</small>
          </div>
        </div>
        <div className="nav-label">WORKSPACE</div>
        <nav aria-label="Workspace">
          <button
            className={`nav-item ${view === "all" ? "selected" : ""}`}
            onClick={() => setView("all")}
          >
            <LayoutGrid size={17} />
            Overview<span>{board.tasks.length}</span>
          </button>
          <button
            className={`nav-item ${view === "due" ? "selected" : ""}`}
            onClick={() => setView("due")}
          >
            <Flag size={17} />
            Due today
          </button>
          <button
            className={`nav-item ${view === "done" ? "selected" : ""}`}
            onClick={() => setView("done")}
          >
            <CheckCheck size={17} />
            Completed<span>{completed}</span>
          </button>
        </nav>
        <div className="sidebar-note">
          <span className="note-sparkle">✳</span>
          <p>
            Big ideas.
            <br />
            Small steps.
            <br />
            <strong>Good things ahead.</strong>
          </p>
          <div className="note-line" />
        </div>
        <div className="sidebar-bottom">
          <button className="nav-item" onClick={() => setHelp(true)}>
            <CircleHelp size={17} />A little help
            <ArrowUpRight size={14} />
          </button>
          <div className="guest-profile">
            <span className="guest-avatar">
              <Leaf size={18} />
            </span>
            <div>
              Your personal space<small>Guest workspace</small>
            </div>
            <LockKeyhole size={14} />
          </div>
        </div>
      </aside>
      <main className="main-content">
        <header className="topbar">
          <div className="breadcrumb">
            Workspace <span>/</span> <strong>My board</strong>
          </div>
          <span className={`connection ${board.preview ? "preview" : ""}`}>
            <span />
            {board.preview
              ? "Local preview"
              : board.loading
                ? "Connecting…"
                : board.error
                  ? "Needs attention"
                  : board.busy
                    ? "Saving…"
                    : "All changes saved"}
          </span>
        </header>
        <div className="page-content">
          {board.preview && (
            <div className="preview-banner">
              <Sparkles size={16} />
              <span>
                Preview workspace · Changes stay in this browser. Connect
                Supabase to enable your guest account.
              </span>
            </div>
          )}
          <section className="page-heading">
            <div>
              <div className="eyebrow">
                <span className="little-line" />
                MAKE A LITTLE PROGRESS
              </div>
              <h1>
                Good work starts here<span>.</span>
              </h1>
              <p>
                A clear space for your ideas, your plans, and your next small
                win.
              </p>
            </div>
            <button
              className="primary-button new-task"
              onClick={() => add()}
              disabled={blocked}
            >
              <Plus size={17} />
              New task<span className="key-hint">↗</span>
            </button>
          </section>
          <section className="summary" aria-label="Board summary">
            <div className="summary-intro">
              <span className="summary-symbol">
                <Sparkles size={21} />
              </span>
              <div>
                A little perspective<small>Every step forward counts.</small>
              </div>
            </div>
            <div className="stat">
              <span>Total tasks</span>
              <strong>{board.tasks.length.toString().padStart(2, "0")}</strong>
            </div>
            <div className="stat">
              <span>
                Completed <span className="stat-dot green" />
              </span>
              <strong>
                {completed.toString().padStart(2, "0")}
                <small> / {board.tasks.length}</small>
              </strong>
            </div>
            <div className="stat">
              <span>
                Overdue <span className="stat-dot orange" />
              </span>
              <strong>{overdue.toString().padStart(2, "0")}</strong>
            </div>
            <div className="progress-stat">
              <div>
                <span>Making progress</span>
                <strong>
                  {board.tasks.length
                    ? Math.round((completed / board.tasks.length) * 100)
                    : 0}
                  %
                </strong>
              </div>
              <progress
                max={Math.max(board.tasks.length, 1)}
                value={completed}
                aria-label="Tasks completed"
              />
            </div>
          </section>
          <div className="board-toolbar">
            <div className="board-tab">
              <Columns3 size={16} />
              {view === "due"
                ? "Due today"
                : view === "done"
                  ? "Completed"
                  : "Board"}
              <span>{visible.length}</span>
            </div>
            <div className="board-controls">
              <label className="search-box">
                <Search size={16} />
                <input
                  aria-label="Search tasks"
                  placeholder="Find a task…"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                />
                {query && (
                  <button
                    className="icon-button"
                    onClick={() => setQuery("")}
                    aria-label="Clear search"
                  >
                    <X size={13} />
                  </button>
                )}
              </label>
              <label className="filter-select">
                <Flag size={14} />
                <select
                  aria-label="Filter by priority"
                  value={priority}
                  onChange={(e) =>
                    setPriority(e.target.value as Priority | "all")
                  }
                >
                  <option value="all">All priorities</option>
                  <option value="high">High priority</option>
                  <option value="normal">Medium priority</option>
                  <option value="low">Low priority</option>
                </select>
              </label>
            </div>
          </div>
          {board.error && (
            <div className="error-banner" role="alert">
              <span>{board.error}</span>
              <button
                onClick={() => void board.refresh()}
                disabled={board.busy}
              >
                Retry
              </button>
              <button
                className="icon-button"
                aria-label="Dismiss error"
                onClick={board.clearError}
              >
                <X size={16} />
              </button>
            </div>
          )}
          {board.loading ? (
            <div className="loading-board" role="status">
              <LoaderCircle className="spin" size={25} />
              <h2>Making room for your ideas…</h2>
              <p>Opening your personal workspace.</p>
            </div>
          ) : (
            <>
              {!board.tasks.length && !board.error && (
                <div className="welcome-banner">
                  <div>
                    <span className="welcome-icon">
                      <Leaf size={22} />
                    </span>
                    <div>
                      <strong>A fresh board. A world of possibilities.</strong>
                      <p>
                        Add your first task, or take a look around with a few
                        example tasks.
                      </p>
                    </div>
                  </div>
                  <button
                    className="secondary-button"
                    onClick={() => void board.seed()}
                    disabled={blocked}
                  >
                    Try example tasks
                    <ArrowRight size={15} />
                  </button>
                </div>
              )}
              <DndContext
                sensors={sensors}
                collisionDetection={rectIntersection}
                onDragStart={(e) => setActiveId(String(e.active.id))}
                onDragEnd={(e) => void dragEnd(e)}
                onDragCancel={() => setActiveId(null)}
              >
                <div className="board">
                  {columns.map((column) => (
                    <Column
                      key={column.id}
                      column={column}
                      tasks={visible.filter((t) => t.status === column.id)}
                      onNew={add}
                      onOpen={(task) =>
                        setDialog({ task, status: task.status })
                      }
                      disabled={blocked}
                      filtered={filtered}
                    />
                  ))}
                </div>
                <DragOverlay>
                  {active ? (
                    <TaskCard task={active} onOpen={() => {}} overlay />
                  ) : null}
                </DragOverlay>
              </DndContext>
            </>
          )}
          {filtered && !board.loading && (
            <button
              className="clear-filters"
              onClick={() => {
                setQuery("");
                setPriority("all");
                setView("all");
              }}
            >
              Clear filters · Show all tasks
            </button>
          )}
          <footer className="board-footer">
            <span>
              <LockKeyhole size={12} />
              Just yours. Your tasks stay in your guest workspace.
            </span>
            <span>
              One small step at a time.<span className="footer-flower">✳</span>
            </span>
          </footer>
        </div>
      </main>
      <div className="sr-only" role="status" aria-live="polite">
        {notice}
      </div>
      {dialog && (
        <TaskDialog
          task={dialog.task}
          status={dialog.status}
          busy={board.busy}
          error={board.error}
          onClose={() => setDialog(null)}
          onSave={(input) =>
            dialog.task
              ? board.update(dialog.task.id, input)
              : board.create(input)
          }
          onDelete={() =>
            dialog.task ? board.remove(dialog.task.id) : Promise.resolve(false)
          }
        />
      )}
      {help && <Help onClose={() => setHelp(false)} />}
    </div>
  );
}
function Help({ onClose }: { onClose: () => void }) {
  const ref = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    const dialog = ref.current!;
    dialog.showModal();
    return () => dialog.close();
  }, []);
  return (
    <dialog
      ref={ref}
      className="help-panel"
      onCancel={onClose}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      aria-labelledby="help-title"
    >
      <button
        className="icon-button help-close"
        onClick={onClose}
        aria-label="Close help"
      >
        <X size={20} />
      </button>
      <Leaf size={28} />
      <h2 id="help-title">Make yourself at home.</h2>
      <p>This is your own little space to move things forward.</p>
      <ul>
        <li>
          <Check size={16} />
          Create a task with the New task button.
        </li>
        <li>
          <Check size={16} />
          Drag a card by its grip to another column.
        </li>
        <li>
          <Check size={16} />
          Click a title to edit details or change status.
        </li>
        <li>
          <Check size={16} />
          Use search and priority to find your focus.
        </li>
      </ul>
      <p className="help-footnote">
        Your guest session stays in this browser. Clearing browser data or
        switching devices starts a new workspace.
      </p>
      <button className="primary-button" onClick={onClose}>
        Let’s get to it
        <ArrowUpRight size={15} />
      </button>
    </dialog>
  );
}
