import { Track } from "./track";

export type AspectRatioId = "16:9" | "9:16" | "1:1" | "4:5" | "21:9";

export interface Marker {
  id: string;
  timeMs: number;
  label?: string;
  color?: string;
}

export interface TimelineSelection {
  clipIds: string[];
  trackIds: string[];
}

export interface Timeline {
  id: string;
  projectId: string;
  tracks: Track[];
  markers: Marker[];
  durationMs: number;
  fps: number;
  zoom: number;
  playheadMs: number;
  selection: TimelineSelection;
}
