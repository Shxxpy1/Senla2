import { create } from "zustand";
import { tasksApi } from "../api/tasks";
import { normalizeApiError } from "../api/client";
import type { CreateTaskPayload, Task, TaskStatus, UpdateTaskPayload } from "../api/types";

interface TasksState {
  workspaceId: string | null;
  items: Task[];
  loading: boolean;
  error: string | null;

  fetch: (workspaceId: string) => Promise<void>;
  create: (workspaceId: string, payload: CreateTaskPayload) => Promise<void>;
  update: (taskId: string, payload: UpdateTaskPayload) => Promise<void>;
  /** Оптимистично двигает карточку между колонками доски, откатывает при ошибке. */
  moveStatus: (taskId: string, status: TaskStatus) => Promise<void>;
  remove: (taskId: string) => Promise<void>;
}

export const useTasksStore = create<TasksState>((set, get) => ({
  workspaceId: null,
  items: [],
  loading: false,
  error: null,

  fetch: async (workspaceId) => {
    set({ loading: true, error: null, workspaceId });
    try {
      const items = await tasksApi.list(workspaceId);
      // Защита от гонки, если пользователь успел переключить пространство.
      if (get().workspaceId !== workspaceId) return;
      set({ items, loading: false });
    } catch (e) {
      if (get().workspaceId !== workspaceId) return;
      set({ loading: false, error: normalizeApiError(e).message });
    }
  },

  create: async (workspaceId, payload) => {
    const created = await tasksApi.create(workspaceId, payload);
    set({ items: [...get().items, created] });
  },

  update: async (taskId, payload) => {
    const updated = await tasksApi.update(taskId, payload);
    set({ items: get().items.map((t) => (t.id === taskId ? { ...t, ...updated } : t)) });
  },

  moveStatus: async (taskId, status) => {
    const prev = get().items;
    const prevTask = prev.find((t) => t.id === taskId);
    if (!prevTask || prevTask.status === status) return;

    set({ items: prev.map((t) => (t.id === taskId ? { ...t, status } : t)) });
    try {
      await tasksApi.update(taskId, { status });
    } catch (e) {
      set({ items: prev });
      throw e;
    }
  },

  remove: async (taskId) => {
    const prev = get().items;
    set({ items: prev.filter((t) => t.id !== taskId) });
    try {
      await tasksApi.remove(taskId);
    } catch (e) {
      set({ items: prev });
      throw e;
    }
  },
}));
