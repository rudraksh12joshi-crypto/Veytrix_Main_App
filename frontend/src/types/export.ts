export type ExportStatus = "queued" | "processing" | "success" | "failed" | "canceled";

export interface ExportJob {
  id: string;
  projectId: string;
  presetId: string;
  status: ExportStatus;
  progress: number;
  outputUri?: string;
  errorMessage?: string;
  createdAt: string;
  completedAt?: string;
}
