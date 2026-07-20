import { create } from "zustand";

import type { User } from "@/src/types";

type UserState = {
  profile: User | null;
  preferences: Record<string, unknown>;
  setProfile: (profile: User | null) => void;
  setPreference: (key: string, value: unknown) => void;
  reset: () => void;
};

export const useUserStore = create<UserState>((set) => ({
  profile: null,
  preferences: {},
  setProfile: (profile) => set({ profile }),
  setPreference: (key, value) =>
    set((s) => ({ preferences: { ...s.preferences, [key]: value } })),
  reset: () => set({ profile: null, preferences: {} }),
}));
