import { apiClient } from "./client";
import type { Comment } from "./types";

export interface CreateCommentPayload {
  content: string;
  parentId?: string;
}

export const commentsApi = {
  async tree(taskId: string): Promise<Comment[]> {
    const { data } = await apiClient.get<Comment[]>(`/tasks/${taskId}/comments/tree`);
    return data;
  },

  async create(taskId: string, payload: CreateCommentPayload): Promise<Comment> {
    const { data } = await apiClient.post<Comment>(`/tasks/${taskId}/comments`, payload);
    return data;
  },

  async update(commentId: string, content: string): Promise<Comment> {
    const { data } = await apiClient.patch<Comment>(`/comments/${commentId}`, { content });
    return data;
  },

  async remove(commentId: string): Promise<void> {
    await apiClient.delete(`/comments/${commentId}`);
  },
};
