import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { storage } from "@/src/utils/storage";

export interface NotificationSettingsState {
  pushNotifications: boolean;
  emailNotifications: boolean;
  exportCompleted: boolean;
  aiJobFinished: boolean;
  creditsLow: boolean;
  subscription: boolean;
  offers: boolean;
  securityAlerts: boolean;
  setPref: (key: keyof NotificationSettingsState, value: boolean) => void;
}

const customStorage = {
  getItem: async (name: string) => {
    const raw = await storage.getItem<any>(name, null);
    return raw !== null ? JSON.stringify(raw) : null;
  },
  setItem: async (name: string, value: string) => {
    await storage.setItem(name, JSON.parse(value));
  },
  removeItem: async (name: string) => {
    await storage.removeItem(name);
  }
};

export const useNotificationSettingsStore = create<NotificationSettingsState>()(
  persist(
    (set) => ({
      pushNotifications: true,
      emailNotifications: true,
      exportCompleted: true,
      aiJobFinished: true,
      creditsLow: true,
      subscription: true,
      offers: false,
      securityAlerts: true,
      setPref: (key, value) => set({ [key]: value } as any),
    }),
    {
      name: "notification-settings-storage",
      storage: createJSONStorage(() => customStorage),
    }
  )
);
