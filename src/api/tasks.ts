import { apiClient } from "./client";
import type { CreateTaskPayload, Task, UpdateTaskPayload } from "./types";

export const tasksApi = {
  async list(workspaceId: string): Promise<Task[]> {
    const { data } = await apiClient.get<Task[]>(`/workspaces/${workspaceId}/tasks`);
    return data;
  },

  async create(workspaceId: string, payload: CreateTaskPayload): Promise<Task> {
    const { data } = await apiClient.post<Task>(`/workspaces/${workspaceId}/tasks`, payload);
    return data;
  },

  async update(taskId: string, payload: UpdateTaskPayload): Promise<Task> {
    const { data } = await apiClient.patch<Task>(`/tasks/${taskId}`, payload);
    return data;
  },

  async remove(taskId: string): Promise<void> {
    await apiClient.delete(`/tasks/${taskId}`);
  },
};
