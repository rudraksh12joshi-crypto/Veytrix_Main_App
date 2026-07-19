import { AspectRatioId } from "./index";

export type ProjectStatus = "draft" | "in_progress" | "exported" | "archived";

export interface Project {
  id: string;
  title: string;
  ownerId: string;
  thumbnailUrl?: string;
  status: ProjectStatus;
  durationMs: number;
  aspectRatio: AspectRatioId;
  fps: number;
  createdAt: string;
  updatedAt: string;
  lastOpenedAt?: string;
}
