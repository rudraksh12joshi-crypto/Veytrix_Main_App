import { RefObject } from "react";
import { ScrollView, GestureResponderHandlers } from "react-native";
import { Video, Audio } from "expo-av";
import { VideoClip, TextLayer, OverlayLayer } from "../../types/editor.types";
import { MusicTrack } from "../MusicLibrarySheet";
import { ClipTransition, TransitionPair } from "../../panels/TransitionPanel";

export interface UseTimelineOptions {
  videoRef: RefObject<Video | null>;
  audioRef: RefObject<Audio.Sound | null>;
  scrollViewRef: RefObject<ScrollView | null>;
  videoClips: VideoClip[];
  selectedClipId: string | null;
  setSelectedClipId: (id: string | null) => void;
  textLayers: TextLayer[];
  selectedTextLayerId: string | null;
  setSelectedTextLayerId: (id: string | null) => void;
  overlayLayers: OverlayLayer[];
  selectedOverlayLayerId: string | null;
  setSelectedOverlayLayerId: (id: string | null) => void;
  musicTrack: MusicTrack | null;
  selectedTimelineClip: "music" | null;
  setSelectedTimelineClip: (clip: "music" | null) => void;
  transitions: Record<string, ClipTransition>;
  setSelectedTransitionPair: (pair: TransitionPair | null) => void;
  totalDuration: number;
  currentTime: number;
  setCurrentTime: React.Dispatch<React.SetStateAction<number>>;
  isPlaying: boolean;
  isTrimMode: boolean;
  trimStart: number;
  trimEnd: number;
  draftTrimStart: number;
  draftTrimEnd: number;
  isSnappingLeft: boolean;
  isSnappingRight: boolean;
  previewMuted: boolean;
  setPreviewMuted: React.Dispatch<React.SetStateAction<boolean>>;
  setSelectedTool: (tool: string | null) => void;
  setMusicSheetVisible: (visible: boolean) => void;
  handleAddTextLayer: () => void;
  handleAddOverlayLayer: (type: OverlayLayer["type"]) => Promise<void>;
  handleAddMediaPress: () => Promise<void>;
  leftPanResponderHandlers: GestureResponderHandlers;
  rightPanResponderHandlers: GestureResponderHandlers;
  formatTime: (ms: number) => string;
  videoUri?: string;
}

export interface TimelineController {
  projectTimelineWidth: number;
  PIXELS_PER_MS: number;
  THUMBNAIL_WIDTH: number;
  handleScroll: (e: any) => void;
  scrollToTime: (timeMs: number, animated?: boolean) => void;
}
