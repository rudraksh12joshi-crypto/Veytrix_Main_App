import { Ionicons } from "@expo/vector-icons";

export type IconName = keyof typeof Ionicons.glyphMap;

export const ICONS: Record<string, IconName> = {
  dashboard: "grid-outline",
  projects: "folder-outline",
  templates: "sparkles-outline",
  assets: "images-outline",
  profile: "person-outline",
  settings: "settings-outline",
  notifications: "notifications-outline",
  analytics: "bar-chart-outline",
  subscription: "diamond-outline",
  drafts: "document-text-outline",
  export: "share-outline",
  play: "play",
  pause: "pause",
  add: "add",
  back: "chevron-back",
  close: "close",
  trash: "trash-outline",
  undo: "arrow-undo-outline",
  redo: "arrow-redo-outline",
  scissors: "cut-outline",
  text: "text-outline",
  music: "musical-notes-outline",
  filter: "color-filter-outline",
  effect: "flash-outline",
  transition: "swap-horizontal-outline",
  layer: "layers-outline",
  ai: "sparkles",
};
