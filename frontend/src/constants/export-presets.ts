export type ExportPreset = {
  id: string;
  label: string;
  resolution: { width: number; height: number };
  fps: number;
  bitrateKbps: number;
  format: "mp4" | "mov" | "webm";
};

export const EXPORT_PRESETS: ExportPreset[] = [
  { id: "480p", label: "480p", resolution: { width: 854, height: 480 }, fps: 30, bitrateKbps: 2500, format: "mp4" },
  { id: "720p", label: "720p HD", resolution: { width: 1280, height: 720 }, fps: 30, bitrateKbps: 5000, format: "mp4" },
  { id: "1080p", label: "1080p Full HD", resolution: { width: 1920, height: 1080 }, fps: 30, bitrateKbps: 8000, format: "mp4" },
  { id: "1080p60", label: "1080p 60fps", resolution: { width: 1920, height: 1080 }, fps: 60, bitrateKbps: 12000, format: "mp4" },
  { id: "4k", label: "4K UHD", resolution: { width: 3840, height: 2160 }, fps: 30, bitrateKbps: 40000, format: "mp4" },
];

export const ASPECT_RATIOS = [
  { id: "16:9", label: "16:9 Landscape", w: 16, h: 9 },
  { id: "9:16", label: "9:16 Portrait", w: 9, h: 16 },
  { id: "1:1", label: "1:1 Square", w: 1, h: 1 },
  { id: "4:5", label: "4:5 Feed", w: 4, h: 5 },
  { id: "21:9", label: "21:9 Cinematic", w: 21, h: 9 },
];
