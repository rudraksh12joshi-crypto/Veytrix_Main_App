import React, { useRef, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  PanResponder,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { ColorAdjustments, DEFAULT_COLOR_ADJUSTMENTS } from "../types/editor.types";

interface ColorPanelProps {
  adjustments?: ColorAdjustments;
  onUpdateAdjustments: (updates: Partial<ColorAdjustments>) => void;
  onCommitAdjustments?: () => void;
  onReset: () => void;
  onClose: () => void;
  bottomInset?: number;
}

interface SliderControl {
  key: keyof ColorAdjustments;
  label: string;
  icon: string;
  min: number;
  max: number;
}

const COLOR_CONTROLS: SliderControl[] = [
  { key: "brightness", label: "Brightness", icon: "sunny-outline", min: -100, max: 100 },
  { key: "contrast", label: "Contrast", icon: "contrast-outline", min: -100, max: 100 },
  { key: "saturation", label: "Saturation", icon: "color-palette-outline", min: -100, max: 100 },
  { key: "exposure", label: "Exposure", icon: "aperture-outline", min: -100, max: 100 },
  { key: "temperature", label: "Temperature", icon: "thermometer-outline", min: -100, max: 100 },
  { key: "tint", label: "Tint", icon: "color-filter-outline", min: -100, max: 100 },
  { key: "vibrance", label: "Vibrance", icon: "sparkles-outline", min: -100, max: 100 },
  { key: "highlights", label: "Highlights", icon: "flame-outline", min: -100, max: 100 },
  { key: "shadows", label: "Shadows", icon: "moon-outline", min: -100, max: 100 },
  { key: "whites", label: "Whites", icon: "square-outline", min: -100, max: 100 },
  { key: "blacks", label: "Blacks", icon: "square", min: -100, max: 100 },
  { key: "gamma", label: "Gamma", icon: "options-outline", min: -100, max: 100 },
];

function ColorSlider({
  control,
  value,
  onChange,
  onCommit,
}: {
  control: SliderControl;
  value: number;
  onChange: (val: number) => void;
  onCommit?: () => void;
}) {
  const trackWidthRef = useRef(260);

  const percentage = Math.max(
    0,
    Math.min(100, ((value - control.min) / (control.max - control.min)) * 100)
  );

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderGrant: (e) => {
        const locationX = e.nativeEvent.locationX;
        const ratio = Math.max(0, Math.min(1, locationX / (trackWidthRef.current || 260)));
        const newVal = Math.round(control.min + ratio * (control.max - control.min));
        onChange(newVal);
      },
      onPanResponderMove: (_, gestureState) => {
        const currentRatio = (value - control.min) / (control.max - control.min);
        const ratio = Math.max(
          0,
          Math.min(1, currentRatio + gestureState.dx / (trackWidthRef.current || 260))
        );
        const newVal = Math.round(control.min + ratio * (control.max - control.min));
        onChange(newVal);
      },
      onPanResponderRelease: () => {
        if (onCommit) onCommit();
      },
      onPanResponderTerminate: () => {
        if (onCommit) onCommit();
      },
    })
  ).current;

  const displayVal = value > 0 ? `+${value}` : `${value}`;

  return (
    <View style={styles.sliderRow}>
      <View style={styles.sliderHeader}>
        <View style={styles.labelGroup}>
          <Ionicons name={control.icon as any} size={16} color="#A0A0A0" style={{ marginRight: 6 }} />
          <Text style={styles.controlLabel}>{control.label}</Text>
        </View>
        <Text style={[styles.valueText, value !== 0 && styles.valueTextActive]}>
          {displayVal}
        </Text>
      </View>

      <View
        style={styles.sliderContainer}
        onLayout={(e) => {
          trackWidthRef.current = e.nativeEvent.layout.width;
        }}
      >
        <View style={styles.sliderTrack} {...panResponder.panHandlers}>
          {/* Zero indicator line in middle */}
          <View style={styles.zeroLine} />

          <View
            style={[
              styles.sliderFill,
              {
                left: `${Math.min(50, percentage)}%`,
                width: `${Math.abs(percentage - 50)}%`,
                backgroundColor: value < 0 ? "#00E5FF" : "#FFCC00",
              },
            ]}
          />
          <View
            style={[
              styles.sliderThumb,
              {
                left: `${percentage}%`,
                borderColor: value !== 0 ? "#FFCC00" : "#fff",
              },
            ]}
          />
        </View>
      </View>
    </View>
  );
}

export function ColorPanel({
  adjustments = DEFAULT_COLOR_ADJUSTMENTS,
  onUpdateAdjustments,
  onCommitAdjustments,
  onReset,
  onClose,
  bottomInset = 20,
}: ColorPanelProps) {
  const [selectedCategory, setSelectedCategory] = useState<"adjust" | "curves">("adjust");

  const isModified = Object.keys(DEFAULT_COLOR_ADJUSTMENTS).some((k) => {
    const key = k as keyof ColorAdjustments;
    return (adjustments[key] || 0) !== 0;
  });

  return (
    <View style={[styles.panel, { paddingBottom: Math.max(bottomInset, 20) }]}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Text style={{ fontSize: 18, marginRight: 6 }}>🎨</Text>
          <Text style={styles.title}>Color & Adjustments</Text>
          {isModified && (
            <TouchableOpacity style={styles.resetBadge} onPress={onReset} activeOpacity={0.7}>
              <Ionicons name="refresh" size={12} color="#FFCC00" style={{ marginRight: 3 }} />
              <Text style={styles.resetText}>Reset</Text>
            </TouchableOpacity>
          )}
        </View>

        <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
          <Ionicons name="close-circle" size={24} color="#666" />
        </TouchableOpacity>
      </View>

      {/* Tabs */}
      <View style={styles.tabsRow}>
        <TouchableOpacity
          style={[styles.tabBtn, selectedCategory === "adjust" && styles.tabBtnActive]}
          onPress={() => setSelectedCategory("adjust")}
        >
          <Ionicons
            name={"options-outline" as any}
            size={14}
            color={selectedCategory === "adjust" ? "#FFCC00" : "#8E8E93"}
            style={{ marginRight: 4 }}
          />
          <Text style={[styles.tabText, selectedCategory === "adjust" && styles.tabTextActive]}>
            Adjustments
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tabBtn, selectedCategory === "curves" && styles.tabBtnActive]}
          onPress={() => setSelectedCategory("curves")}
        >
          <Ionicons
            name="analytics-outline"
            size={14}
            color={selectedCategory === "curves" ? "#FFCC00" : "#8E8E93"}
            style={{ marginRight: 4 }}
          />
          <Text style={[styles.tabText, selectedCategory === "curves" && styles.tabTextActive]}>
            Curves
          </Text>
          <View style={styles.soonBadge}>
            <Text style={styles.soonBadgeText}>SOON</Text>
          </View>
        </TouchableOpacity>
      </View>

      {/* Panel Content Scrollable */}
      <ScrollView
        style={styles.scrollArea}
        showsVerticalScrollIndicator={true}
        contentContainerStyle={styles.scrollContent}
        nestedScrollEnabled
      >
        {selectedCategory === "adjust" ? (
          COLOR_CONTROLS.map((control) => (
            <ColorSlider
              key={control.key}
              control={control}
              value={adjustments[control.key] || 0}
              onChange={(val) => onUpdateAdjustments({ [control.key]: val })}
              onCommit={onCommitAdjustments}
            />
          ))
        ) : (
          /* Curves Section Placeholder */
          <View style={styles.curvesContainer}>
            <View style={styles.curvesHeader}>
              <Ionicons name="analytics" size={20} color="#FFCC00" style={{ marginRight: 8 }} />
              <Text style={styles.curvesTitle}>RGB Curves</Text>
              <View style={styles.comingSoonBadge}>
                <Text style={styles.comingSoonText}>Coming Soon</Text>
              </View>
            </View>

            <Text style={styles.curvesSubtitle}>
              Precision luminance and RGB color channel curve controls will be available in an upcoming release.
            </Text>

            <View style={styles.mockCurvesBox}>
              <View style={styles.gridLineHorizontal} />
              <View style={styles.gridLineVertical} />
              <View style={styles.mockCurveDiagonal} />
              <View style={styles.mockCurveNodeStart} />
              <View style={styles.mockCurveNodeEnd} />
            </View>
          </View>
        )}
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
    paddingTop: 12,
    height: 280,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 10,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
  },
  title: {
    color: "#fff",
    fontSize: 17,
    fontWeight: "700",
  },
  resetBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255,204,0,0.15)",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
    marginLeft: 10,
    borderWidth: 1,
    borderColor: "rgba(255,204,0,0.3)",
  },
  resetText: {
    color: "#FFCC00",
    fontSize: 11,
    fontWeight: "600",
  },
  closeBtn: {
    padding: 2,
  },
  tabsRow: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255,255,255,0.06)",
    paddingBottom: 8,
  },
  tabBtn: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    backgroundColor: "rgba(255,255,255,0.04)",
  },
  tabBtnActive: {
    backgroundColor: "rgba(255,204,0,0.15)",
    borderWidth: 1,
    borderColor: "rgba(255,204,0,0.3)",
  },
  tabText: {
    color: "#8E8E93",
    fontSize: 12,
    fontWeight: "500",
  },
  tabTextActive: {
    color: "#FFCC00",
    fontWeight: "700",
  },
  soonBadge: {
    backgroundColor: "rgba(0,229,255,0.15)",
    paddingHorizontal: 5,
    paddingVertical: 1,
    borderRadius: 6,
    marginLeft: 6,
  },
  soonBadgeText: {
    color: "#00E5FF",
    fontSize: 8,
    fontWeight: "800",
  },
  scrollArea: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 24,
    gap: 12,
  },
  sliderRow: {
    marginBottom: 8,
  },
  sliderHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 6,
  },
  labelGroup: {
    flexDirection: "row",
    alignItems: "center",
  },
  controlLabel: {
    color: "#D1D1D6",
    fontSize: 13,
    fontWeight: "500",
  },
  valueText: {
    color: "#8E8E93",
    fontSize: 12,
    fontWeight: "600",
    fontVariant: ["tabular-nums"],
  },
  valueTextActive: {
    color: "#FFCC00",
    fontWeight: "700",
  },
  sliderContainer: {
    width: "100%",
    height: 24,
    justifyContent: "center",
  },
  sliderTrack: {
    width: "100%",
    height: 6,
    backgroundColor: "rgba(255,255,255,0.18)",
    borderRadius: 3,
    justifyContent: "center",
    position: "relative",
  },
  zeroLine: {
    position: "absolute",
    left: "50%",
    top: -2,
    width: 2,
    height: 10,
    backgroundColor: "rgba(255,255,255,0.3)",
    borderRadius: 1,
  },
  sliderFill: {
    position: "absolute",
    height: "100%",
    borderRadius: 3,
  },
  sliderThumb: {
    position: "absolute",
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: "#fff",
    marginTop: -6,
    marginLeft: -9,
    borderWidth: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.5,
    shadowRadius: 4,
    elevation: 4,
  },
  curvesContainer: {
    padding: 16,
    backgroundColor: "rgba(255,255,255,0.03)",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.06)",
    alignItems: "center",
  },
  curvesHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  curvesTitle: {
    color: "#fff",
    fontSize: 15,
    fontWeight: "700",
  },
  comingSoonBadge: {
    backgroundColor: "#FFCC00",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
    marginLeft: 8,
  },
  comingSoonText: {
    color: "#000",
    fontSize: 10,
    fontWeight: "800",
  },
  curvesSubtitle: {
    color: "#8E8E93",
    fontSize: 12,
    textAlign: "center",
    lineHeight: 16,
    marginBottom: 16,
  },
  mockCurvesBox: {
    width: "100%",
    height: 120,
    backgroundColor: "#121215",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
    position: "relative",
    overflow: "hidden",
    justifyContent: "center",
    alignItems: "center",
  },
  gridLineHorizontal: {
    position: "absolute",
    top: "50%",
    left: 0,
    right: 0,
    height: 1,
    backgroundColor: "rgba(255,255,255,0.06)",
  },
  gridLineVertical: {
    position: "absolute",
    left: "50%",
    top: 0,
    bottom: 0,
    width: 1,
    backgroundColor: "rgba(255,255,255,0.06)",
  },
  mockCurveDiagonal: {
    width: "80%",
    height: 2,
    backgroundColor: "#FFCC00",
    transform: [{ rotate: "-40deg" }],
    opacity: 0.8,
  },
  mockCurveNodeStart: {
    position: "absolute",
    bottom: 20,
    left: 30,
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: "#00E5FF",
  },
  mockCurveNodeEnd: {
    position: "absolute",
    top: 20,
    right: 30,
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: "#FFCC00",
  },
});
