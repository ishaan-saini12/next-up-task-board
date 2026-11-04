import { useCallback, useEffect, useRef, useState } from "react";
import { ensureGuest, supabase } from "../lib/supabase";
import { examples, loadPreview, savePreview } from "../lib/demo";
import type { Task, TaskInput } from "../types";

export function useTasks() {
  const preview = !supabase;
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const userId = useRef("preview");
  const locked = useRef(false);
  const refresh = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      if (preview) setTasks(loadPreview());
      else {
        userId.current = await ensureGuest();
        const { data, error } = await supabase!
          .from("tasks")
          .select("*")
          .eq("user_id", userId.current)
          .order("created_at");
        if (error) throw error;
        setTasks(data as Task[]);
      }
    } catch (e) {
      setError(message(e));
    } finally {
      setLoading(false);
    }
  }, [preview]);
  useEffect(() => {
    void refresh();
  }, [refresh]);

  // Serialize writes, so a failed optimistic update cannot undo a newer change.
  async function mutate(
    next: Task[],
    request: () => Promise<void>,
  ): Promise<boolean> {
    if (locked.current) return false;
    locked.current = true;
    setBusy(true);
    setError("");
    const previous = tasks;
    setTasks(next);
    try {
      if (preview) savePreview(next);
      else await request();
      return true;
    } catch (e) {
      setTasks(previous);
      setError(`${message(e)} Your change was not saved. Please try again.`);
      return false;
    } finally {
      locked.current = false;
      setBusy(false);
    }
  }
  async function create(input: TaskInput) {
    const task: Task = {
      ...input,
      title: input.title.trim(),
      description: input.description.trim(),
      id: crypto.randomUUID(),
      user_id: userId.current,
      created_at: new Date().toISOString(),
    };
    return mutate([...tasks, task], async () => {
      const { data, error } = await supabase!
        .from("tasks")
        .insert(task)
        .select("id")
        .single();
      if (error) throw error;
      if (!data) throw new Error("Task was not created.");
    });
  }
  async function update(id: string, patch: Partial<TaskInput>) {
    return mutate(
      tasks.map((t) => (t.id === id ? { ...t, ...patch } : t)),
      async () => {
        const { error } = await supabase!
          .from("tasks")
          .update(patch)
          .eq("id", id)
          .eq("user_id", userId.current)
          .select("id")
          .single();
        if (error) throw error;
      },
    );
  }
  async function remove(id: string) {
    return mutate(
      tasks.filter((t) => t.id !== id),
      async () => {
        const { error } = await supabase!
          .from("tasks")
          .delete()
          .eq("id", id)
          .eq("user_id", userId.current)
          .select("id")
          .single();
        if (error) throw error;
      },
    );
  }
  async function seed() {
    const newTasks: Task[] = examples().map((input) => ({
      ...input,
      id: crypto.randomUUID(),
      user_id: userId.current,
      created_at: new Date().toISOString(),
    }));
    return mutate([...tasks, ...newTasks], async () => {
      const { error } = await supabase!.from("tasks").insert(newTasks);
      if (error) throw error;
    });
  }
  return {
    tasks,
    loading,
    error,
    busy,
    preview,
    refresh,
    create,
    update,
    remove,
    seed,
    clearError: () => setError(""),
  };
}
function message(error: unknown) {
  return error && typeof error === "object" && "message" in error
    ? String(error.message)
    : "Something went wrong.";
}
