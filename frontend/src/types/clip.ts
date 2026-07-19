import { ClipType } from "@/src/constants/editor";

export interface ClipTransform {
  x: number;
  y: number;
  scale: number;
  rotation: number;
  opacity: number;
}

export interface Clip {
  id: string;
  type: ClipType;
  mediaId?: string;
  trackId: string;
  startMs: number;
  durationMs: number;
  trimStartMs: number;
  trimEndMs: number;
  speed: number;
  volume?: number;
  transform: ClipTransform;
  effects: string[];
  transitionInId?: string;
  transitionOutId?: string;
  label?: string;
}
