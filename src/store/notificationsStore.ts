import { create } from "zustand";
import type { UserNotification } from "../api/types";

export interface FeedItem extends UserNotification {
  id: string;
  receivedAt: number;
}

interface NotificationsState {
  items: FeedItem[];
  push: (n: UserNotification) => void;
  clear: () => void;
}

const MAX_ITEMS = 20;

export const useNotificationsStore = create<NotificationsState>((set, get) => ({
  items: [],
  push: (n) =>
    set({
      items: [
        { ...n, id: crypto.randomUUID(), receivedAt: Date.now() },
        ...get().items,
      ].slice(0, MAX_ITEMS),
    }),
  clear: () => set({ items: [] }),
}));
