import { AspectRatioId } from "./index";

export type TemplateCategory = "trending" | "reels" | "vlog" | "ads" | "story" | "cinematic";

export interface Template {
  id: string;
  title: string;
  category: TemplateCategory;
  thumbnailUrl: string;
  previewUrl?: string;
  aspectRatio: AspectRatioId;
  durationMs: number;
  clipsRequired: number;
  isPremium: boolean;
}
