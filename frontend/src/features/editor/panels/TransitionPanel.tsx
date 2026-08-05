import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { VideoClip } from "../types/editor.types";

export type TransitionType =
  | "none"
  | "fade"
  | "dissolve"
  | "crossfade"
  | "push"
  | "slide"
  | "zoom"
  | "spin"
  | "blur"
  | "flash"
  | "glitch"
  | "film"
  | "ripple"
  | "whip"
  | "stretch";

export interface ClipTransition {
  id: string;
  fromClipId: string;
  toClipId: string;
  type: TransitionType;
}

export interface TransitionPair {
  fromId: string;
  toId: string;
  fromIndex: number;
  toIndex: number;
}

interface TransitionPanelProps {
  activePair: TransitionPair | null;
  allPairs: TransitionPair[];
  clips: VideoClip[];
  activeTransitionType: TransitionType;
  onSelectPair: (pair: TransitionPair) => void;
  onSelectTransition: (type: TransitionType) => void;
  onClose: () => void;
  bottomInset?: number;
}

interface TransitionOption {
  id: TransitionType;
  label: string;
  icon: string;
  color: string;
}

const TRANSITION_OPTIONS: TransitionOption[] = [
  { id: "none", label: "None", icon: "close-circle-outline", color: "#8E8E93" },
  { id: "fade", label: "Fade", icon: "contrast-outline", color: "#8B5CF6" },
  { id: "dissolve", label: "Dissolve", icon: "color-filter-outline", color: "#3B82F6" },
  { id: "crossfade", label: "Cross Fade", icon: "git-commit-outline", color: "#60A5FA" },
  { id: "push", label: "Push", icon: "enter-outline", color: "#F59E0B" },
  { id: "slide", label: "Slide", icon: "arrow-forward-outline", color: "#10B981" },
  { id: "zoom", label: "Zoom", icon: "scan-outline", color: "#EC4899" },
  { id: "spin", label: "Spin", icon: "refresh-outline", color: "#6366F1" },
  { id: "blur", label: "Blur", icon: "sparkles-outline", color: "#06B6D4" },
  { id: "flash", label: "Flash", icon: "sunny-outline", color: "#EAB308" },
  { id: "glitch", label: "Glitch", icon: "flash-outline", color: "#EF4444" },
  { id: "film", label: "Film", icon: "videocam-outline", color: "#EC4899" },
  { id: "ripple", label: "Ripple", icon: "water-outline", color: "#3B82F6" },
  { id: "whip", label: "Whip", icon: "shuffle-outline", color: "#10B981" },
  { id: "stretch", label: "Stretch", icon: "resize-outline", color: "#8B5CF6" },
];

import { TransitionPickerSheet, TransitionPairInfo } from "../transitions/ui";

export function TransitionPanel({
  activePair,
  allPairs,
  clips,
  activeTransitionType = "none",
  onSelectPair,
  onSelectTransition,
  onClose,
  bottomInset = 20,
}: TransitionPanelProps) {
  return (
    <TransitionPickerSheet
      activePair={activePair}
      allPairs={allPairs}
      savedTransitionId={activeTransitionType}
      onSelectPair={onSelectPair}
      onApplyTransition={(data) => {
        onSelectTransition(data.transitionId as TransitionType);
      }}
      onClose={onClose}
      bottomInset={bottomInset}
    />
  );
}

const styles = StyleSheet.create({
  panel: {
    backgroundColor: "#1A1A1D",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 20,
    paddingTop: 16,
    maxHeight: 380,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 12,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  iconCircle: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: "rgba(255,204,0,0.15)",
    justifyContent: "center",
    alignItems: "center",
  },
  title: {
    fontSize: 16,
    fontWeight: "700",
    color: "#fff",
  },
  subtitle: {
    fontSize: 12,
    color: "#A0A0A0",
    marginTop: 2,
  },
  closeBtn: {
    padding: 4,
  },
  pairSelectorWrap: {
    marginBottom: 12,
  },
  sectionLabel: {
    fontSize: 11,
    color: "#8E8E93",
    fontWeight: "600",
    marginBottom: 6,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  pairChipsRow: {
    gap: 8,
  },
  pairChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 14,
    backgroundColor: "rgba(255,255,255,0.06)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
  },
  pairChipActive: {
    backgroundColor: "rgba(255,204,0,0.2)",
    borderColor: "#FFCC00",
  },
  pairChipText: {
    color: "#8E8E93",
    fontSize: 12,
    fontWeight: "600",
  },
  pairChipTextActive: {
    color: "#FFCC00",
    fontWeight: "700",
  },
  optionsScroll: {
    maxHeight: 240,
  },
  optionsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    paddingBottom: 16,
  },
  optionCard: {
    width: "23%",
    minWidth: 72,
    backgroundColor: "rgba(255,255,255,0.04)",
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
    paddingVertical: 10,
    paddingHorizontal: 6,
    alignItems: "center",
    position: "relative",
  },
  optionIconBox: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 6,
  },
  optionLabel: {
    fontSize: 11,
    color: "#D0D0D5",
    fontWeight: "500",
    textAlign: "center",
  },
  activeCheck: {
    position: "absolute",
    top: 4,
    right: 4,
  },
});
