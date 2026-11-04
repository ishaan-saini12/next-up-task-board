import type { Task, TaskInput } from "../types";
export function examples(): TaskInput[] {
  const date = (offset: number) => {
    const d = new Date();
    d.setDate(d.getDate() + offset);
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
  };
  return [
    {
      title: "Map out the next big idea",
      description:
        "Collect inspiration, sketch a few directions, and pick the one worth exploring. A small start is still a start.",
      status: "todo",
      priority: "high",
      due_date: date(2),
    },
    {
      title: "Explore the game lobby experience",
      description:
        "What should players feel in the first 30 seconds? Outline a welcoming, easy-to-navigate lobby.",
      status: "todo",
      priority: "normal",
      due_date: date(4),
    },
    {
      title: "Gather playtest feedback",
      description:
        "Summarize the most useful observations from the last playtest into three actionable improvements.",
      status: "todo",
      priority: "low",
      due_date: null,
    },
    {
      title: "Bring the character select to life",
      description:
        "Build the first interactive prototype. Focus on clear selection states and a little personality.",
      status: "in_progress",
      priority: "high",
      due_date: date(0),
    },
    {
      title: "Fine-tune the onboarding flow",
      description:
        "Make the first session feel effortless. Keep instructions short and let players learn by doing.",
      status: "in_progress",
      priority: "normal",
      due_date: date(-1),
    },
    {
      title: "Review the new sound direction",
      description:
        "Listen through the latest UI sounds and check that they support the mood without getting in the way.",
      status: "in_review",
      priority: "normal",
      due_date: date(1),
    },
    {
      title: "Define our visual playground",
      description:
        "Set the color palette, typography, and interaction principles for a cohesive experience.",
      status: "done",
      priority: "normal",
      due_date: null,
    },
    {
      title: "Kick off the next chapter",
      description:
        "Agree on the goal, make a little room to experiment, and get the first ideas on the board.",
      status: "done",
      priority: "low",
      due_date: null,
    },
  ];
}
const storageKey = "next-up-preview-v1";
export function loadPreview(): Task[] {
  try {
    return JSON.parse(localStorage.getItem(storageKey) || "[]");
  } catch {
    return [];
  }
}
export function savePreview(tasks: Task[]) {
  localStorage.setItem(storageKey, JSON.stringify(tasks));
}
