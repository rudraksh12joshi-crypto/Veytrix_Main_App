import { create } from "zustand";

import type { AuthTokens, User } from "@/src/types";

type AuthState = {
  user: User | null;
  tokens: AuthTokens | null;
  status: "idle" | "authenticating" | "authenticated" | "unauthenticated";
  setUser: (user: User | null) => void;
  setTokens: (tokens: AuthTokens | null) => void;
  setStatus: (status: AuthState["status"]) => void;
  reset: () => void;
};

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  tokens: null,
  status: "idle",
  setUser: (user) => set({ user }),
  setTokens: (tokens) => set({ tokens }),
  setStatus: (status) => set({ status }),
  reset: () => set({ user: null, tokens: null, status: "unauthenticated" }),
}));
