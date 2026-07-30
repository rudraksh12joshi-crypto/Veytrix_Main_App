import React, { useRef } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  PanResponder,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { VideoClip } from "../types/editor.types";

interface SpeedPanelProps {
  selectedClip?: VideoClip | null;
  onUpdateClip: (updates: Partial<VideoClip>) => void;
  onCommitSpeed?: () => void;
  onClose: () => void;
  bottomInset?: number;
}

const PRESETS = [0.25, 0.5, 1.0, 1.5, 2.0, 3.0, 5.0];

export function SpeedPanel({
  selectedClip,
  onUpdateClip,
  onCommitSpeed,
  onClose,
  bottomInset = 20,
}: SpeedPanelProps) {
  const currentSpeed = selectedClip?.speed || 1.0;
  const sliderPercentage = Math.max(0, Math.min(100, ((currentSpeed - 0.25) / (5.0 - 0.25)) * 100));
  const trackWidthRef = useRef(260);

  const speedPanResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderGrant: (e) => {
        const locationX = e.nativeEvent.locationX;
        const ratio = Math.max(0, Math.min(1, locationX / (trackWidthRef.current || 260)));
        const newSpeed = parseFloat((0.25 + ratio * (5.0 - 0.25)).toFixed(2));
        onUpdateClip({ speed: newSpeed });
      },
      onPanResponderMove: (_, gestureState) => {
        const currentRatio = (currentSpeed - 0.25) / 4.75;
        const ratio = Math.max(
          0,
          Math.min(1, currentRatio + gestureState.dx / (trackWidthRef.current || 260))
        );
        const newSpeed = parseFloat((0.25 + ratio * (5.0 - 0.25)).toFixed(2));
        onUpdateClip({ speed: newSpeed });
      },
      onPanResponderRelease: () => {
        if (onCommitSpeed) onCommitSpeed();
      },
      onPanResponderTerminate: () => {
        if (onCommitSpeed) onCommitSpeed();
      },
    })
  ).current;

  return (
    <View style={[styles.panel, { paddingBottom: Math.max(bottomInset, 20) }]}>
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Text style={{ fontSize: 18 }}>⚡</Text>
          <Text style={styles.title}>Speed</Text>
          <View style={styles.speedBadge}>
            <Text style={styles.speedBadgeText}>{currentSpeed.toFixed(2)}x</Text>
          </View>
        </View>
        <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
          <Ionicons name="close-circle" size={24} color="#666" />
        </TouchableOpacity>
      </View>

      <View style={styles.content}>
        {/* Preset Chips */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.presetChipsRow}>
          {PRESETS.map((p) => (
            <TouchableOpacity
              key={p}
              style={[styles.presetChip, Math.abs(currentSpeed - p) < 0.05 && styles.presetChipActive]}
              onPress={() => {
                onUpdateClip({ speed: p });
                if (onCommitSpeed) onCommitSpeed();
              }}
              activeOpacity={0.7}
            >
              <Text style={[styles.presetChipText, Math.abs(currentSpeed - p) < 0.05 && styles.presetChipTextActive]}>
                {p}x
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Speed Slider Track */}
        <View
          style={styles.sliderContainer}
          onLayout={(e) => {
            trackWidthRef.current = e.nativeEvent.layout.width;
          }}
        >
          <View style={styles.sliderTrack} {...speedPanResponder.panHandlers}>
            <View style={[styles.sliderFill, { backgroundColor: "#FFCC00", width: `${sliderPercentage}%` }]} />
            <View style={[styles.sliderThumb, { backgroundColor: "#fff", left: `${sliderPercentage}%` }]} />
          </View>
          <View style={{ flexDirection: "row", justifyContent: "space-between", marginTop: 8 }}>
            <Text style={{ color: "#666", fontSize: 11 }}>0.25x</Text>
            <Text style={{ color: "#666", fontSize: 11 }}>1.0x</Text>
            <Text style={{ color: "#666", fontSize: 11 }}>2.5x</Text>
            <Text style={{ color: "#666", fontSize: 11 }}>5.0x</Text>
          </View>
        </View>

        {/* Option Switches */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.optionsRow}>
          <TouchableOpacity
            style={[styles.optionRow, selectedClip?.reverse && styles.optionRowActive]}
            onPress={() => {
              onUpdateClip({ reverse: !selectedClip?.reverse });
              if (onCommitSpeed) onCommitSpeed();
            }}
            activeOpacity={0.8}
          >
            <Ionicons name="swap-horizontal" size={16} color={selectedClip?.reverse ? "#00E5FF" : "#8E8E93"} />
            <Text style={[styles.optionLabel, selectedClip?.reverse && styles.optionLabelActive]}>Reverse</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.optionRow, selectedClip?.maintainPitch && styles.optionRowActive]}
            onPress={() => {
              onUpdateClip({ maintainPitch: !selectedClip?.maintainPitch });
              if (onCommitSpeed) onCommitSpeed();
            }}
            activeOpacity={0.8}
          >
            <Ionicons name="musical-notes" size={16} color={selectedClip?.maintainPitch ? "#00E5FF" : "#8E8E93"} />
            <Text style={[styles.optionLabel, selectedClip?.maintainPitch && styles.optionLabelActive]}>Pitch</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.optionRow, selectedClip?.motionBlur && styles.optionRowActive]}
            onPress={() => {
              onUpdateClip({ motionBlur: !selectedClip?.motionBlur });
              if (onCommitSpeed) onCommitSpeed();
            }}
            activeOpacity={0.8}
          >
            <Ionicons name="sparkles-outline" size={16} color={selectedClip?.motionBlur ? "#00E5FF" : "#8E8E93"} />
            <Text style={[styles.optionLabel, selectedClip?.motionBlur && styles.optionLabelActive]}>Motion Blur</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.optionRow, selectedClip?.frameBlending && styles.optionRowActive]}
            onPress={() => {
              onUpdateClip({ frameBlending: !selectedClip?.frameBlending });
              if (onCommitSpeed) onCommitSpeed();
            }}
            activeOpacity={0.8}
          >
            <Ionicons name="layers-outline" size={16} color={selectedClip?.frameBlending ? "#00E5FF" : "#8E8E93"} />
            <Text style={[styles.optionLabel, selectedClip?.frameBlending && styles.optionLabelActive]}>Blending</Text>
          </TouchableOpacity>
        </ScrollView>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  panel: {
    backgroundColor: "#1A1A1D",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -10 },
    shadowOpacity: 0.2,
    shadowRadius: 20,
    elevation: 10,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  title: {
    fontSize: 18,
    fontWeight: "700",
    color: "#fff",
  },
  speedBadge: {
    backgroundColor: "rgba(255,204,0,0.15)",
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "rgba(255,204,0,0.3)",
    marginLeft: 6,
  },
  speedBadgeText: {
    color: "#FFCC00",
    fontSize: 13,
    fontWeight: "700",
  },
  closeBtn: {
    padding: 2,
  },
  content: {
    gap: 14,
  },
  presetChipsRow: {
    flexDirection: "row",
    gap: 8,
  },
  presetChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 14,
    backgroundColor: "rgba(255,255,255,0.06)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
  },
  presetChipActive: {
    backgroundColor: "#FFCC00",
    borderColor: "#FFCC00",
  },
  presetChipText: {
    color: "#A0A0A0",
    fontSize: 12,
    fontWeight: "600",
  },
  presetChipTextActive: {
    color: "#000",
    fontWeight: "700",
  },
  sliderContainer: {
    width: "100%",
  },
  sliderTrack: {
    width: "100%",
    height: 6,
    backgroundColor: "rgba(255,255,255,0.18)",
    borderRadius: 3,
    justifyContent: "center",
    position: "relative",
  },
  sliderFill: {
    height: "100%",
    borderRadius: 3,
  },
  sliderThumb: {
    position: "absolute",
    width: 18,
    height: 18,
    borderRadius: 9,
    marginTop: -6,
    marginLeft: -9,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.5,
    shadowRadius: 4,
    elevation: 4,
  },
  optionsRow: {
    flexDirection: "row",
    gap: 8,
  },
  optionRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    backgroundColor: "rgba(255,255,255,0.04)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
  },
  optionRowActive: {
    backgroundColor: "rgba(0,229,255,0.12)",
    borderColor: "#00E5FF",
  },
  optionLabel: {
    color: "#8E8E93",
    fontSize: 12,
    fontWeight: "500",
  },
  optionLabelActive: {
    color: "#00E5FF",
    fontWeight: "600",
  },
});
