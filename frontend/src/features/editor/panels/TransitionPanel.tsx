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
  | "zoom"
  | "slide"
  | "wipe"
  | "blur"
  | "spin"
  | "glitch"
  | "flash";

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
  { id: "dissolve", label: "Dissolve", icon: "color-filter-outline", color: "#3B82F6" },
  { id: "fade", label: "Fade", icon: "contrast-outline", color: "#8B5CF6" },
  { id: "zoom", label: "Zoom In", icon: "scan-outline", color: "#EC4899" },
  { id: "slide", label: "Slide Left", icon: "arrow-forward-outline", color: "#10B981" },
  { id: "wipe", label: "Wipe", icon: "reorder-two-outline", color: "#F59E0B" },
  { id: "blur", label: "Blur", icon: "sparkles-outline", color: "#06B6D4" },
  { id: "spin", label: "Spin", icon: "refresh-outline", color: "#6366F1" },
  { id: "glitch", label: "Glitch", icon: "flash-outline", color: "#EF4444" },
  { id: "flash", label: "Flash", icon: "sunny-outline", color: "#EAB308" },
];

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
  const fromClipIndex = activePair ? activePair.fromIndex : 0;
  const toClipIndex = activePair ? activePair.toIndex : 1;

  return (
    <View style={[styles.panel, { paddingBottom: Math.max(bottomInset, 20) }]}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <View style={styles.iconCircle}>
            <Ionicons name="swap-horizontal" size={18} color="#FFCC00" />
          </View>
          <View>
            <Text style={styles.title}>Clip Transition</Text>
            <Text style={styles.subtitle}>
              Applying between Clip {fromClipIndex + 1} ➔ Clip {toClipIndex + 1}
            </Text>
          </View>
        </View>

        <TouchableOpacity onPress={onClose} style={styles.closeBtn} activeOpacity={0.7}>
          <Ionicons name="close-circle" size={24} color="#666" />
        </TouchableOpacity>
      </View>

      {/* Pair Selector Chips (if multiple clip transitions exist) */}
      {allPairs.length > 1 && (
        <View style={styles.pairSelectorWrap}>
          <Text style={styles.sectionLabel}>Select Junction:</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.pairChipsRow}>
            {allPairs.map((pair, idx) => {
              const isActive = activePair?.fromId === pair.fromId && activePair?.toId === pair.toId;
              return (
                <TouchableOpacity
                  key={`${pair.fromId}_${pair.toId}`}
                  style={[styles.pairChip, isActive && styles.pairChipActive]}
                  onPress={() => onSelectPair(pair)}
                  activeOpacity={0.8}
                >
                  <Text style={[styles.pairChipText, isActive && styles.pairChipTextActive]}>
                    Clip {pair.fromIndex + 1} ➔ Clip {pair.toIndex + 1}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>
      )}

      {/* Transition Options Grid */}
      <ScrollView
        style={styles.optionsScroll}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.optionsGrid}
      >
        {TRANSITION_OPTIONS.map((opt) => {
          const isSelected = activeTransitionType === opt.id;
          return (
            <TouchableOpacity
              key={opt.id}
              style={[
                styles.optionCard,
                isSelected && { borderColor: "#FFCC00", backgroundColor: "rgba(255, 204, 0, 0.12)" },
              ]}
              onPress={() => onSelectTransition(opt.id)}
              activeOpacity={0.8}
            >
              <View
                style={[
                  styles.optionIconBox,
                  { backgroundColor: isSelected ? "#FFCC00" : "rgba(255,255,255,0.08)" },
                ]}
              >
                <Ionicons
                  name={opt.icon as any}
                  size={22}
                  color={isSelected ? "#000" : opt.color}
                />
              </View>
              <Text
                style={[
                  styles.optionLabel,
                  isSelected && { color: "#FFCC00", fontWeight: "700" },
                ]}
              >
                {opt.label}
              </Text>
              {isSelected && (
                <View style={styles.activeCheck}>
                  <Ionicons name="checkmark-circle" size={14} color="#FFCC00" />
                </View>
              )}
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
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
