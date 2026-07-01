import { apiClient } from "./client";
import type {
  AddMemberPayload,
  CreateWorkspacePayload,
  UpdateWorkspacePayload,
  Workspace,
} from "./types";

export const workspacesApi = {
  async list(): Promise<Workspace[]> {
    const { data } = await apiClient.get<Workspace[]>("/workspaces");
    return data;
  },

  async create(payload: CreateWorkspacePayload): Promise<Workspace> {
    const { data } = await apiClient.post<Workspace>("/workspaces", payload);
    return data;
  },

  async update(workspaceId: string, payload: UpdateWorkspacePayload): Promise<Workspace> {
    const { data } = await apiClient.patch<Workspace>(`/workspaces/${workspaceId}`, payload);
    return data;
  },

  async remove(workspaceId: string): Promise<void> {
    await apiClient.delete(`/workspaces/${workspaceId}`);
  },

  async addMember(workspaceId: string, payload: AddMemberPayload): Promise<void> {
    await apiClient.post(`/workspaces/${workspaceId}/members`, payload);
  },

  async removeMember(workspaceId: string, userId: string): Promise<void> {
    await apiClient.delete(`/workspaces/${workspaceId}/members/${userId}`);
  },
};
