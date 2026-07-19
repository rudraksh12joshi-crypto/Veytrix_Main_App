import { create } from "zustand";

import type { ExportJob } from "@/src/types";

type ExportState = {
  jobs: ExportJob[];
  activeJobId: string | null;
  setJobs: (jobs: ExportJob[]) => void;
  upsertJob: (job: ExportJob) => void;
  removeJob: (id: string) => void;
  setActive: (id: string | null) => void;
};

export const useExportStore = create<ExportState>((set) => ({
  jobs: [],
  activeJobId: null,
  setJobs: (jobs) => set({ jobs }),
  upsertJob: (job) =>
    set((s) => {
      const idx = s.jobs.findIndex((j) => j.id === job.id);
      const next = [...s.jobs];
      if (idx >= 0) next[idx] = job;
      else next.unshift(job);
      return { jobs: next };
    }),
  removeJob: (id) => set((s) => ({ jobs: s.jobs.filter((j) => j.id !== id) })),
  setActive: (id) => set({ activeJobId: id }),
}));
