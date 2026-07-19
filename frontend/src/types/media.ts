export type MediaType = "video" | "audio" | "image";
export type MediaSource = "local" | "cloud" | "stock" | "ai";

export interface MediaAsset {
  id: string;
  ownerId: string;
  type: MediaType;
  source: MediaSource;
  name: string;
  uri: string;
  thumbnailUri?: string;
  durationMs?: number;
  width?: number;
  height?: number;
  sizeBytes?: number;
  createdAt: string;
}
