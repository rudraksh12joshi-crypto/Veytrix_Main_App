import { VideoClip, TextLayer, OverlayLayer } from "../types/editor.types";
import { MusicTrack } from "../components/MusicLibrarySheet";

export type BaseLayerType =
  | "video"
  | "audio"
  | "music"
  | "voice"
  | "text"
  | "overlay"
  | "sticker"
  | "future";

export interface BaseLayer {
  id: string;
  type: BaseLayerType;
  trackId: string;
  startTime: number;
  endTime: number;
  duration: number;
  visible: boolean;
  locked: boolean;
  selected: boolean;
  zIndex: number;
  opacity: number;
  transform: {
    x: number;
    y: number;
    scale: number;
    rotation: number;
  };
  metadata?: Record<string, any>;
}

export interface VideoLayerModel extends BaseLayer {
  type: "video";
  clip: VideoClip;
}

export interface AudioLayerModel extends BaseLayer {
  type: "audio" | "voice";
  audioUri: string;
  volume: number;
  muted: boolean;
}

export interface MusicLayerModel extends BaseLayer {
  type: "music";
  track: MusicTrack;
}

export interface TextLayerModel extends BaseLayer {
  type: "text";
  layer: TextLayer;
}

export interface OverlayLayerModel extends BaseLayer {
  type: "overlay" | "sticker";
  layer: OverlayLayer;
}

export type UnifiedLayer =
  | VideoLayerModel
  | AudioLayerModel
  | MusicLayerModel
  | TextLayerModel
  | OverlayLayerModel;
