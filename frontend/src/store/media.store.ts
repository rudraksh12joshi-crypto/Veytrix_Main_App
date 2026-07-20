import { create } from "zustand";

import type { MediaAsset } from "@/src/types";

type MediaState = {
  library: MediaAsset[];
  recent: MediaAsset[];
  loading: boolean;
  setLibrary: (assets: MediaAsset[]) => void;
  addAsset: (asset: MediaAsset) => void;
  removeAsset: (id: string) => void;
  setLoading: (loading: boolean) => void;
};

export const useMediaStore = create<MediaState>((set) => ({
  library: [],
  recent: [],
  loading: false,
  setLibrary: (library) => set({ library }),
  addAsset: (asset) =>
    set((s) => ({
      library: [asset, ...s.library],
      recent: [asset, ...s.recent.filter((a) => a.id !== asset.id)].slice(0, 20),
    })),
  removeAsset: (id) =>
    set((s) => ({
      library: s.library.filter((a) => a.id !== id),
      recent: s.recent.filter((a) => a.id !== id),
    })),
  setLoading: (loading) => set({ loading }),
}));
