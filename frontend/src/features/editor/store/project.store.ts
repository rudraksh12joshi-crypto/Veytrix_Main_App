import { create } from "zustand";
import { ProjectState } from "./project.types";
import { DEFAULT_PROJECT_METADATA } from "./project.constants";
import { VideoClip, TextLayer, OverlayLayer } from "../types/editor.types";
import { MusicTrack } from "../components/MusicLibrarySheet";
import { ClipTransition } from "../panels/TransitionPanel";

export interface ProjectStoreActions {
  setMetadata: (metadata: Partial<ProjectState["metadata"]>) => void;
  setVideoClips: (clips: VideoClip[] | ((prev: VideoClip[]) => VideoClip[])) => void;
  setTextLayers: (layers: TextLayer[] | ((prev: TextLayer[]) => TextLayer[])) => void;
  setOverlayLayers: (layers: OverlayLayer[] | ((prev: OverlayLayer[]) => OverlayLayer[])) => void;
  setMusicTrack: (track: MusicTrack | null) => void;
  setTransitions: (transitions: Record<string, ClipTransition> | ((prev: Record<string, ClipTransition>) => Record<string, ClipTransition>)) => void;
  setTotalDuration: (duration: number) => void;
  setSelectedClipId: (id: string | null) => void;
  setSelectedTextLayerId: (id: string | null) => void;
  setSelectedOverlayLayerId: (id: string | null) => void;
  setSelectedTool: (tool: string | null) => void;
  setSelectedTimelineClip: (clip: "music" | null) => void;
  setCurrentTime: (time: number | ((prev: number) => number)) => void;
  setIsPlaying: (playing: boolean) => void;
  setIsTrimMode: (isTrim: boolean) => void;
  setTrimRange: (start: number, end: number) => void;
  setDraftTrimRange: (start: number, end: number) => void;
  setPreviewMuted: (muted: boolean | ((prev: boolean) => boolean)) => void;
  resetProject: () => void;
}

export type ProjectStore = ProjectState & ProjectStoreActions;

export const useProjectStore = create<ProjectStore>((set) => ({
  metadata: DEFAULT_PROJECT_METADATA,
  videoClips: [],
  textLayers: [],
  overlayLayers: [],
  musicTrack: null,
  transitions: {},
  totalDuration: 0,
  selectedClipId: null,
  selectedTextLayerId: null,
  selectedOverlayLayerId: null,
  selectedTool: null,
  selectedTimelineClip: null,
  currentTime: 0,
  isPlaying: false,
  isTrimMode: false,
  trimStart: 0,
  trimEnd: 0,
  draftTrimStart: 0,
  draftTrimEnd: 0,
  previewMuted: false,

  setMetadata: (metadata) =>
    set((state) => ({ metadata: { ...state.metadata, ...metadata } })),

  setVideoClips: (clips) =>
    set((state) => ({
      videoClips: typeof clips === "function" ? clips(state.videoClips) : clips,
    })),

  setTextLayers: (layers) =>
    set((state) => ({
      textLayers: typeof layers === "function" ? layers(state.textLayers) : layers,
    })),

  setOverlayLayers: (layers) =>
    set((state) => ({
      overlayLayers: typeof layers === "function" ? layers(state.overlayLayers) : layers,
    })),

  setMusicTrack: (track) => set({ musicTrack: track }),

  setTransitions: (transitions) =>
    set((state) => ({
      transitions: typeof transitions === "function" ? transitions(state.transitions) : transitions,
    })),

  setTotalDuration: (totalDuration) => set({ totalDuration }),
  setSelectedClipId: (selectedClipId) => set({ selectedClipId }),
  setSelectedTextLayerId: (selectedTextLayerId) => set({ selectedTextLayerId }),
  setSelectedOverlayLayerId: (selectedOverlayLayerId) => set({ selectedOverlayLayerId }),
  setSelectedTool: (selectedTool) => set({ selectedTool }),
  setSelectedTimelineClip: (selectedTimelineClip) => set({ selectedTimelineClip }),

  setCurrentTime: (time) =>
    set((state) => ({
      currentTime: typeof time === "function" ? time(state.currentTime) : time,
    })),

  setIsPlaying: (isPlaying) => set({ isPlaying }),
  setIsTrimMode: (isTrimMode) => set({ isTrimMode }),
  setTrimRange: (trimStart, trimEnd) => set({ trimStart, trimEnd }),
  setDraftTrimRange: (draftTrimStart, draftTrimEnd) => set({ draftTrimStart, draftTrimEnd }),

  setPreviewMuted: (muted) =>
    set((state) => ({
      previewMuted: typeof muted === "function" ? muted(state.previewMuted) : muted,
    })),

  resetProject: () =>
    set({
      metadata: DEFAULT_PROJECT_METADATA,
      videoClips: [],
      textLayers: [],
      overlayLayers: [],
      musicTrack: null,
      transitions: {},
      totalDuration: 0,
      selectedClipId: null,
      selectedTextLayerId: null,
      selectedOverlayLayerId: null,
      selectedTool: null,
      selectedTimelineClip: null,
      currentTime: 0,
      isPlaying: false,
      isTrimMode: false,
      trimStart: 0,
      trimEnd: 0,
      draftTrimStart: 0,
      draftTrimEnd: 0,
      previewMuted: false,
    }),
}));
