import type { TaskPriority, TaskStatus } from "../api/types";

export const PRIORITY_META: Record<TaskPriority, { label: string; color: string }> = {
  LOW: { label: "Low", color: "#93A0C2" },
  MEDIUM: { label: "Medium", color: "#6C8CFF" },
  HIGH: { label: "High", color: "#FFB86B" },
  CRITICAL: { label: "Critical", color: "#FF6B6B" },
};

export const STATUS_META: Record<TaskStatus, { label: string }> = {
  TODO: { label: "К выполнению" },
  IN_PROGRESS: { label: "В работе" },
  DONE: { label: "Готово" },
};

export const STATUS_ORDER: TaskStatus[] = ["TODO", "IN_PROGRESS", "DONE"];
export const PRIORITY_ORDER: TaskPriority[] = ["LOW", "MEDIUM", "HIGH", "CRITICAL"];
