export const EDITOR = {
  DEFAULT_FPS: 30,
  MIN_ZOOM: 0.1,
  MAX_ZOOM: 8,
  DEFAULT_ZOOM: 1,
  PIXELS_PER_SECOND: 40,
  MIN_CLIP_DURATION_MS: 100,
  TRACK_HEIGHT: 56,
  RULER_HEIGHT: 24,
  PLAYHEAD_WIDTH: 2,
  MAX_UNDO_STACK: 100,
};

export const TRACK_TYPES = ["video", "audio", "text", "sticker", "effect"] as const;
export type TrackType = (typeof TRACK_TYPES)[number];

export const CLIP_TYPES = ["video", "audio", "image", "text", "sticker", "transition"] as const;
export type ClipType = (typeof CLIP_TYPES)[number];
