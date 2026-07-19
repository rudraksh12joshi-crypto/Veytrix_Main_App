export type KeyboardShortcut = {
  id: string;
  label: string;
  keys: string[];
};

export const SHORTCUTS: KeyboardShortcut[] = [
  { id: "play-pause", label: "Play / Pause", keys: ["Space"] },
  { id: "undo", label: "Undo", keys: ["Cmd", "Z"] },
  { id: "redo", label: "Redo", keys: ["Cmd", "Shift", "Z"] },
  { id: "split", label: "Split clip", keys: ["Cmd", "B"] },
  { id: "delete", label: "Delete", keys: ["Delete"] },
  { id: "copy", label: "Copy", keys: ["Cmd", "C"] },
  { id: "paste", label: "Paste", keys: ["Cmd", "V"] },
  { id: "select-all", label: "Select all", keys: ["Cmd", "A"] },
  { id: "zoom-in", label: "Zoom in", keys: ["Cmd", "="] },
  { id: "zoom-out", label: "Zoom out", keys: ["Cmd", "-"] },
];
