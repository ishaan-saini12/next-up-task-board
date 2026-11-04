export const columns = [
  {
    id: "todo",
    title: "To Do",
    color: "#939796",
    hint: "A little possibility starts here.",
  },
  {
    id: "in_progress",
    title: "In Progress",
    color: "#d6a84e",
    hint: "Ready when you are. Move a task here.",
  },
  {
    id: "in_review",
    title: "In Review",
    color: "#a593cd",
    hint: "Good work deserves a second look.",
  },
  {
    id: "done",
    title: "Done",
    color: "#7aab87",
    hint: "Your next small win belongs here.",
  },
] as const;
export type Status = (typeof columns)[number]["id"];
export type Priority = "low" | "normal" | "high";
export interface Task {
  id: string;
  title: string;
  description: string;
  status: Status;
  priority: Priority;
  due_date: string | null;
  user_id: string;
  created_at: string;
}
export type TaskInput = Pick<
  Task,
  "title" | "description" | "status" | "priority" | "due_date"
>;
