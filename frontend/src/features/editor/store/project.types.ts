import { VideoClip, TextLayer, OverlayLayer } from "../types/editor.types";
import { MusicTrack } from "../components/MusicLibrarySheet";
import { ClipTransition } from "../panels/TransitionPanel";

export interface ProjectMetadata {
  id: string;
  title: string;
  fps: number;
  aspectRatio: string;
  createdAt: string;
  updatedAt: string;
}

export interface ProjectState {
  metadata: ProjectMetadata;
  videoClips: VideoClip[];
  textLayers: TextLayer[];
  overlayLayers: OverlayLayer[];
  musicTrack: MusicTrack | null;
  transitions: Record<string, ClipTransition>;
  totalDuration: number;
  selectedClipId: string | null;
  selectedTextLayerId: string | null;
  selectedOverlayLayerId: string | null;
  selectedTool: string | null;
  selectedTimelineClip: "music" | null;
  currentTime: number;
  isPlaying: boolean;
  isTrimMode: boolean;
  trimStart: number;
  trimEnd: number;
  draftTrimStart: number;
  draftTrimEnd: number;
  previewMuted: boolean;
}
