import { create } from "zustand";
import { commentsApi, type CreateCommentPayload } from "../api/comments";
import { normalizeApiError } from "../api/client";
import type { Comment } from "../api/types";

interface CommentsState {
  taskId: string | null;
  tree: Comment[];
  loading: boolean;
  error: string | null;

  fetch: (taskId: string) => Promise<void>;
  add: (taskId: string, payload: CreateCommentPayload) => Promise<void>;
  edit: (commentId: string, content: string) => Promise<void>;
  remove: (commentId: string) => Promise<void>;
}

/** Рекурсивно обновляет поле узла в дереве по id. */
function updateNode(tree: Comment[], id: string, patch: Partial<Comment>): Comment[] {
  return tree.map((c) => {
    if (c.id === id) return { ...c, ...patch };
    if (c.replies?.length) return { ...c, replies: updateNode(c.replies, id, patch) };
    return c;
  });
}

/** Рекурсивно удаляет узел (с веткой) по id. */
function removeNode(tree: Comment[], id: string): Comment[] {
  return tree
    .filter((c) => c.id !== id)
    .map((c) => (c.replies?.length ? { ...c, replies: removeNode(c.replies, id) } : c));
}

/** Рекурсивно добавляет ответ в нужное место дерева. */
function insertReply(tree: Comment[], parentId: string, comment: Comment): Comment[] {
  return tree.map((c) => {
    if (c.id === parentId) {
      return { ...c, replies: [...(c.replies ?? []), comment] };
    }
    if (c.replies?.length) {
      return { ...c, replies: insertReply(c.replies, parentId, comment) };
    }
    return c;
  });
}

export const useCommentsStore = create<CommentsState>((set, get) => ({
  taskId: null,
  tree: [],
  loading: false,
  error: null,

  fetch: async (taskId) => {
    set({ loading: true, error: null, taskId });
    try {
      const tree = await commentsApi.tree(taskId);
      if (get().taskId !== taskId) return; // защита от гонки
      set({ tree, loading: false });
    } catch (e) {
      if (get().taskId !== taskId) return;
      set({ loading: false, error: normalizeApiError(e).message });
    }
  },

  add: async (taskId, payload) => {
    const created = await commentsApi.create(taskId, payload);
    if (payload.parentId) {
      set({ tree: insertReply(get().tree, payload.parentId, created) });
    } else {
      set({ tree: [...get().tree, created] });
    }
  },

  edit: async (commentId, content) => {
    const updated = await commentsApi.update(commentId, content);
    set({ tree: updateNode(get().tree, commentId, { content: updated.content }) });
  },

  remove: async (commentId) => {
    await commentsApi.remove(commentId);
    set({ tree: removeNode(get().tree, commentId) });
  },
}));
