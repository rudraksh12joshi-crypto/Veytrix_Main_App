import { create } from "zustand";

import type { Marker, Timeline, TimelineSelection, Track } from "@/src/types";

type UndoSnapshot = { tracks: Track[]; markers: Marker[] };

type TimelineState = {
  timeline: Timeline | null;
  undoStack: UndoSnapshot[];
  redoStack: UndoSnapshot[];
  setTimeline: (timeline: Timeline | null) => void;
  setPlayhead: (ms: number) => void;
  setZoom: (zoom: number) => void;
  setSelection: (selection: TimelineSelection) => void;
  pushUndo: (snapshot: UndoSnapshot) => void;
  undo: () => void;
  redo: () => void;
  clearHistory: () => void;
};

export const useTimelineStore = create<TimelineState>((set) => ({
  timeline: null,
  undoStack: [],
  redoStack: [],
  setTimeline: (timeline) => set({ timeline }),
  setPlayhead: (ms) =>
    set((s) => (s.timeline ? { timeline: { ...s.timeline, playheadMs: ms } } : s)),
  setZoom: (zoom) =>
    set((s) => (s.timeline ? { timeline: { ...s.timeline, zoom } } : s)),
  setSelection: (selection) =>
    set((s) => (s.timeline ? { timeline: { ...s.timeline, selection } } : s)),
  pushUndo: (snapshot) =>
    set((s) => ({ undoStack: [...s.undoStack, snapshot], redoStack: [] })),
  undo: () =>
    set((s) => {
      if (!s.timeline || s.undoStack.length === 0) return s;
      const prev = s.undoStack[s.undoStack.length - 1];
      const current: UndoSnapshot = { tracks: s.timeline.tracks, markers: s.timeline.markers };
      return {
        timeline: { ...s.timeline, tracks: prev.tracks, markers: prev.markers },
        undoStack: s.undoStack.slice(0, -1),
        redoStack: [...s.redoStack, current],
      };
    }),
  redo: () =>
    set((s) => {
      if (!s.timeline || s.redoStack.length === 0) return s;
      const next = s.redoStack[s.redoStack.length - 1];
      const current: UndoSnapshot = { tracks: s.timeline.tracks, markers: s.timeline.markers };
      return {
        timeline: { ...s.timeline, tracks: next.tracks, markers: next.markers },
        redoStack: s.redoStack.slice(0, -1),
        undoStack: [...s.undoStack, current],
      };
    }),
  clearHistory: () => set({ undoStack: [], redoStack: [] }),
}));
