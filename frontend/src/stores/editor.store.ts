import { create } from "zustand";

type EditorTool =
  | "select"
  | "split"
  | "text"
  | "audio"
  | "sticker"
  | "filter"
  | "effect"
  | "transition"
  | "ai";

type EditorState = {
  activeTool: EditorTool;
  activeProjectId: string | null;
  isPlaying: boolean;
  isDirty: boolean;
  showLeftSidebar: boolean;
  showRightSidebar: boolean;
  showPropertiesPanel: boolean;
  setActiveTool: (tool: EditorTool) => void;
  setActiveProject: (id: string | null) => void;
  setPlaying: (playing: boolean) => void;
  setDirty: (dirty: boolean) => void;
  toggleLeftSidebar: () => void;
  toggleRightSidebar: () => void;
  togglePropertiesPanel: () => void;
};

export const useEditorStore = create<EditorState>((set) => ({
  activeTool: "select",
  activeProjectId: null,
  isPlaying: false,
  isDirty: false,
  showLeftSidebar: true,
  showRightSidebar: true,
  showPropertiesPanel: false,
  setActiveTool: (activeTool) => set({ activeTool }),
  setActiveProject: (id) => set({ activeProjectId: id }),
  setPlaying: (isPlaying) => set({ isPlaying }),
  setDirty: (isDirty) => set({ isDirty }),
  toggleLeftSidebar: () => set((s) => ({ showLeftSidebar: !s.showLeftSidebar })),
  toggleRightSidebar: () => set((s) => ({ showRightSidebar: !s.showRightSidebar })),
  togglePropertiesPanel: () => set((s) => ({ showPropertiesPanel: !s.showPropertiesPanel })),
}));
