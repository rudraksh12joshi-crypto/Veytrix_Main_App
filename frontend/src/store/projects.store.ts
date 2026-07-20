import { create } from "zustand";

import type { Project } from "@/src/types";

type ProjectsState = {
  projects: Project[];
  currentProjectId: string | null;
  loading: boolean;
  setProjects: (projects: Project[]) => void;
  upsertProject: (project: Project) => void;
  removeProject: (id: string) => void;
  setCurrent: (id: string | null) => void;
  setLoading: (loading: boolean) => void;
};

export const useProjectsStore = create<ProjectsState>((set) => ({
  projects: [],
  currentProjectId: null,
  loading: false,
  setProjects: (projects) => set({ projects }),
  upsertProject: (project) =>
    set((s) => {
      const idx = s.projects.findIndex((p) => p.id === project.id);
      const next = [...s.projects];
      if (idx >= 0) next[idx] = project;
      else next.unshift(project);
      return { projects: next };
    }),
  removeProject: (id) => set((s) => ({ projects: s.projects.filter((p) => p.id !== id) })),
  setCurrent: (id) => set({ currentProjectId: id }),
  setLoading: (loading) => set({ loading }),
}));
