import { create } from "zustand";

type SettingsState = {
  themeMode: "light" | "dark" | "system";
  autoSave: boolean;
  hapticsEnabled: boolean;
  gridSnap: boolean;
  language: string;
  setThemeMode: (mode: SettingsState["themeMode"]) => void;
  setAutoSave: (v: boolean) => void;
  setHaptics: (v: boolean) => void;
  setGridSnap: (v: boolean) => void;
  setLanguage: (lang: string) => void;
};

export const useSettingsStore = create<SettingsState>((set) => ({
  themeMode: "system",
  autoSave: true,
  hapticsEnabled: true,
  gridSnap: true,
  language: "en",
  setThemeMode: (themeMode) => set({ themeMode }),
  setAutoSave: (autoSave) => set({ autoSave }),
  setHaptics: (hapticsEnabled) => set({ hapticsEnabled }),
  setGridSnap: (gridSnap) => set({ gridSnap }),
  setLanguage: (language) => set({ language }),
}));
