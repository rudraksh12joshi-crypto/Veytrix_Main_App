import { RefObject } from "react";
import { ScrollView } from "react-native";
import { Video, Audio, AVPlaybackStatus } from "expo-av";
import { VideoClip } from "../types/editor.types";
import { MusicTrack } from "../components/MusicLibrarySheet";

export interface ActivePlaybackClip {
  clip: VideoClip | null;
  localStartMs: number;
  accumulated: number;
}

export interface UsePlaybackOptions {
  videoRef: RefObject<Video | null>;
  audioRef: RefObject<Audio.Sound | null>;
  scrollViewRef: RefObject<ScrollView | null>;
  videoClips: VideoClip[];
  selectedClip: VideoClip | null;
  selectedClipId: string | null;
  setSelectedClipId: (id: string | null) => void;
  setVideoClips: React.Dispatch<React.SetStateAction<VideoClip[]>>;
  totalDuration: number;
  setTotalDuration: (dur: number) => void;
  currentTime: number;
  setCurrentTime: React.Dispatch<React.SetStateAction<number>>;
  isPlaying: boolean;
  setIsPlaying: (playing: boolean) => void;
  isTrimMode: boolean;
  trimStart: number;
  trimEnd: number;
  draftTrimStart: number;
  draftTrimEnd: number;
  musicTrack: MusicTrack | null;
  PIXELS_PER_MS: number;
}

export interface PlaybackController {
  isPlaying: boolean;
  currentTime: number;
  totalDuration: number;
  previewMuted: boolean;
  setPreviewMuted: React.Dispatch<React.SetStateAction<boolean>>;
  activePlaybackClip: ActivePlaybackClip;
  handlePlaybackStatusUpdate: (status: AVPlaybackStatus) => void;
  handlePlayPause: () => Promise<void>;
  handlePreviousClip: () => Promise<void>;
  handleNextClip: () => Promise<void>;
  formatTime: (ms: number) => string;
}
