import { create } from "zustand";
import { workspacesApi } from "../api/workspaces";
import { normalizeApiError } from "../api/client";
import type {
  AddMemberPayload,
  CreateWorkspacePayload,
  UpdateWorkspacePayload,
  Workspace,
} from "../api/types";

interface WorkspacesState {
  items: Workspace[];
  loading: boolean;
  error: string | null;

  fetch: () => Promise<void>;
  create: (payload: CreateWorkspacePayload) => Promise<Workspace>;
  update: (workspaceId: string, payload: UpdateWorkspacePayload) => Promise<void>;
  remove: (workspaceId: string) => Promise<void>;
  addMember: (workspaceId: string, payload: AddMemberPayload) => Promise<void>;
  removeMember: (workspaceId: string, userId: string) => Promise<void>;
}

export const useWorkspacesStore = create<WorkspacesState>((set, get) => ({
  items: [],
  loading: false,
  error: null,

  fetch: async () => {
    set({ loading: true, error: null });
    try {
      const items = await workspacesApi.list();
      set({ items, loading: false });
    } catch (e) {
      set({ loading: false, error: normalizeApiError(e).message });
    }
  },

  create: async (payload) => {
    const created = await workspacesApi.create(payload);
    set({ items: [created, ...get().items] });
    return created;
  },

  update: async (workspaceId, payload) => {
    const updated = await workspacesApi.update(workspaceId, payload);
    set({
      items: get().items.map((w) => (w.id === workspaceId ? { ...w, ...updated } : w)),
    });
  },

  remove: async (workspaceId) => {
    await workspacesApi.remove(workspaceId);
    set({ items: get().items.filter((w) => w.id !== workspaceId) });
  },

  addMember: async (workspaceId, payload) => {
    await workspacesApi.addMember(workspaceId, payload);
    // Бэкенд не отдаёт обновлённый список участников из этого роута,
    // поэтому дополняем локально — login подставится из формы поиска.
    set({
      items: get().items.map((w) =>
        w.id === workspaceId
          ? {
              ...w,
              members: [
                ...(w.members ?? []).filter((m) => m.userId !== payload.userId),
                { userId: payload.userId, role: payload.role },
              ],
            }
          : w,
      ),
    });
  },

  removeMember: async (workspaceId, userId) => {
    await workspacesApi.removeMember(workspaceId, userId);
    set({
      items: get().items.map((w) =>
        w.id === workspaceId
          ? { ...w, members: (w.members ?? []).filter((m) => m.userId !== userId) }
          : w,
      ),
    });
  },
}));
