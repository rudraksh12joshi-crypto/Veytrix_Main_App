import { create } from "zustand";

import type { AppNotification } from "@/src/types";

type NotificationsState = {
  items: AppNotification[];
  unreadCount: number;
  setItems: (items: AppNotification[]) => void;
  addItem: (item: AppNotification) => void;
  markRead: (id: string) => void;
  markAllRead: () => void;
  remove: (id: string) => void;
};

const countUnread = (items: AppNotification[]) => items.filter((i) => !i.read).length;

export const useNotificationsStore = create<NotificationsState>((set) => ({
  items: [],
  unreadCount: 0,
  setItems: (items) => set({ items, unreadCount: countUnread(items) }),
  addItem: (item) =>
    set((s) => {
      const items = [item, ...s.items];
      return { items, unreadCount: countUnread(items) };
    }),
  markRead: (id) =>
    set((s) => {
      const items = s.items.map((i) => (i.id === id ? { ...i, read: true } : i));
      return { items, unreadCount: countUnread(items) };
    }),
  markAllRead: () =>
    set((s) => ({ items: s.items.map((i) => ({ ...i, read: true })), unreadCount: 0 })),
  remove: (id) =>
    set((s) => {
      const items = s.items.filter((i) => i.id !== id);
      return { items, unreadCount: countUnread(items) };
    }),
}));
