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
import {
  OverlayLayer,
  OverlayType,
  BlendMode,
  MaskType,
} from "../types/editor.types";

interface OverlayPanelProps {
  layers: OverlayLayer[];
  selectedLayerId: string | null;
  onAddOverlay: (type: OverlayType) => void;
  onUpdateLayer: (id: string, updates: Partial<OverlayLayer>) => void;
  onSelectLayer: (id: string) => void;
  onDeleteLayer: (id: string) => void;
  onDuplicateLayer: (id: string) => void;
  onBringForward: (id: string) => void;
  onSendBackward: (id: string) => void;
  onClose: () => void;
  bottomInset?: number;
}

interface SliderItemProps {
  label: string;
  value: number;
  min: number;
  max: number;
  unit?: string;
  step?: number;
  icon?: string;
  onChange: (val: number) => void;
}

function CustomOverlaySlider({
  label,
  value,
  min,
  max,
  unit = "",
  step = 1,
  icon,
  onChange,
}: SliderItemProps) {
  const trackWidthRef = useRef(260);

  const percentage = Math.max(
    0,
    Math.min(100, ((value - min) / (max - min)) * 100)
  );

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderGrant: (e) => {
        const locationX = e.nativeEvent.locationX;
        const ratio = Math.max(0, Math.min(1, locationX / (trackWidthRef.current || 260)));
        const rawVal = min + ratio * (max - min);
        const newVal = Math.round(rawVal / step) * step;
        onChange(Number(newVal.toFixed(1)));
      },
      onPanResponderMove: (_, gestureState) => {
        const currentRatio = (value - min) / (max - min);
        const ratio = Math.max(
          0,
          Math.min(1, currentRatio + gestureState.dx / (trackWidthRef.current || 260))
        );
        const rawVal = min + ratio * (max - min);
        const newVal = Math.round(rawVal / step) * step;
        onChange(Number(newVal.toFixed(1)));
      },
    })
  ).current;

  return (
    <View style={styles.sliderRow}>
      <View style={styles.sliderHeader}>
        <View style={styles.labelGroup}>
          {icon && (
            <Ionicons name={icon as any} size={15} color="#A0A0A0" style={{ marginRight: 6 }} />
          )}
          <Text style={styles.controlLabel}>{label}</Text>
        </View>
        <Text style={[styles.valueText, value !== min && styles.valueTextActive]}>
          {value > 0 && min < 0 ? `+${value}` : `${value}`}{unit}
        </Text>
      </View>

      <View
        style={styles.sliderContainer}
        onLayout={(e) => {
          trackWidthRef.current = e.nativeEvent.layout.width;
        }}
      >
        <View style={styles.sliderTrack} {...panResponder.panHandlers}>
          {min < 0 && <View style={styles.zeroLine} />}
          <View
            style={[
              styles.sliderFill,
              min < 0
                ? {
                    left: `${Math.min(50, percentage)}%`,
                    width: `${Math.abs(percentage - 50)}%`,
                    backgroundColor: value < 0 ? "#00E5FF" : "#FFCC00",
                  }
                : {
                    left: "0%",
                    width: `${percentage}%`,
                    backgroundColor: "#FFCC00",
                  },
            ]}
          />
          <View
            style={[
              styles.sliderThumb,
              {
                left: `${percentage}%`,
                borderColor: "#FFCC00",
              },
            ]}
          />
        </View>
      </View>
    </View>
  );
}

const OVERLAY_CHOICES: { type: OverlayType; label: string; icon: string }[] = [
  { type: "image", label: "Image", icon: "image-outline" },
  { type: "video", label: "Video", icon: "videocam-outline" },
  { type: "gif", label: "GIF", icon: "film-outline" },
  { type: "sticker", label: "Sticker", icon: "happy-outline" },
  { type: "logo", label: "Logo", icon: "pricetag-outline" },
  { type: "watermark", label: "Watermark", icon: "shield-checkmark-outline" },
];

const BLEND_MODES: { id: BlendMode; label: string }[] = [
  { id: "normal", label: "Normal" },
  { id: "multiply", label: "Multiply" },
  { id: "screen", label: "Screen" },
  { id: "overlay", label: "Overlay" },
  { id: "softLight", label: "Soft Light" },
  { id: "hardLight", label: "Hard Light" },
  { id: "darken", label: "Darken" },
  { id: "lighten", label: "Lighten" },
];

const MASK_SHAPES: { id: MaskType; label: string; icon: string }[] = [
  { id: "none", label: "None", icon: "close-circle-outline" },
  { id: "rectangle", label: "Rectangle", icon: "square-outline" },
  { id: "circle", label: "Circle", icon: "ellipse-outline" },
  { id: "freeform", label: "Freeform", icon: "shapes-outline" },
];

export function OverlayPanel({
  layers,
  selectedLayerId,
  onAddOverlay,
  onUpdateLayer,
  onSelectLayer,
  onDeleteLayer,
  onDuplicateLayer,
  onBringForward,
  onSendBackward,
  onClose,
  bottomInset = 20,
}: OverlayPanelProps) {
  const [activeTab, setActiveTab] = useState<"add" | "transform" | "blend" | "mask">("add");

  const selectedLayer = layers.find((l) => l.id === selectedLayerId) || layers[0] || null;

  return (
    <View style={[styles.panel, { paddingBottom: Math.max(bottomInset, 20) }]}>
      {/* Header Bar */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Ionicons name="layers" size={20} color="#FFCC00" style={{ marginRight: 6 }} />
          <Text style={styles.title}>Overlay Engine</Text>
        </View>

        <View style={styles.headerRight}>
          <TouchableOpacity style={styles.doneBtn} onPress={onClose} activeOpacity={0.8}>
            <Ionicons name="checkmark" size={16} color="#000" />
            <Text style={styles.doneBtnText}>Done</Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
            <Ionicons name="close-circle" size={24} color="#666" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Layer Selector Chips if multiple overlays exist */}
      {layers.length > 0 && (
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.layerSelectorRow}>
          {layers.map((layer, idx) => (
            <TouchableOpacity
              key={layer.id}
              style={[styles.layerChip, layer.id === selectedLayerId && styles.layerChipActive]}
              onPress={() => {
                onSelectLayer(layer.id);
                if (activeTab === "add") setActiveTab("transform");
              }}
            >
              <Text style={[styles.layerChipText, layer.id === selectedLayerId && styles.layerChipTextActive]} numberOfLines={1}>
                {layer.name || `Overlay ${idx + 1}`}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      )}

      {/* Tabs Bar */}
      <View style={styles.tabsRowWrapper}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.tabsRowContainer}>
          <TouchableOpacity
            style={[styles.tabBtn, activeTab === "add" && styles.tabBtnActive]}
            onPress={() => setActiveTab("add")}
          >
            <Ionicons name="add-circle-outline" size={14} color={activeTab === "add" ? "#FFCC00" : "#8E8E93"} style={{ marginRight: 4 }} />
            <Text style={[styles.tabText, activeTab === "add" && styles.tabTextActive]}>Add Media</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.tabBtn, activeTab === "transform" && styles.tabBtnActive]}
            onPress={() => setActiveTab("transform")}
          >
            <Ionicons name="move-outline" size={14} color={activeTab === "transform" ? "#FFCC00" : "#8E8E93"} style={{ marginRight: 4 }} />
            <Text style={[styles.tabText, activeTab === "transform" && styles.tabTextActive]}>Transform</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.tabBtn, activeTab === "blend" && styles.tabBtnActive]}
            onPress={() => setActiveTab("blend")}
          >
            <Ionicons name="color-filter-outline" size={14} color={activeTab === "blend" ? "#FFCC00" : "#8E8E93"} style={{ marginRight: 4 }} />
            <Text style={[styles.tabText, activeTab === "blend" && styles.tabTextActive]}>Blend Modes</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.tabBtn, activeTab === "mask" && styles.tabBtnActive]}
            onPress={() => setActiveTab("mask")}
          >
            <Ionicons name="shapes-outline" size={14} color={activeTab === "mask" ? "#FFCC00" : "#8E8E93"} style={{ marginRight: 4 }} />
            <Text style={[styles.tabText, activeTab === "mask" && styles.tabTextActive]}>Mask & Shadow</Text>
          </TouchableOpacity>
        </ScrollView>
      </View>

      {/* Scrollable Content */}
      <ScrollView
        style={styles.scrollArea}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={true}
        nestedScrollEnabled
      >
        {activeTab === "add" && (
          <View style={styles.tabContent}>
            <Text style={styles.sectionSubLabel}>Select Overlay Type to Add</Text>
            <View style={styles.addGrid}>
              {OVERLAY_CHOICES.map((choice) => (
                <TouchableOpacity
                  key={choice.type}
                  style={styles.addCard}
                  onPress={() => {
                    onAddOverlay(choice.type);
                    setActiveTab("transform");
                  }}
                  activeOpacity={0.8}
                >
                  <Ionicons name={choice.icon as any} size={24} color="#FFCC00" style={{ marginBottom: 6 }} />
                  <Text style={styles.addCardText}>{choice.label}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}

        {selectedLayer && activeTab === "transform" && (
          <View style={styles.tabContent}>
            {/* Scale Slider (20% to 300%) */}
            <CustomOverlaySlider
              label="Scale Size"
              icon="expand-outline"
              value={Math.round(selectedLayer.scale * 100)}
              min={20}
              max={300}
              unit="%"
              step={5}
              onChange={(val) => onUpdateLayer(selectedLayer.id, { scale: Number((val / 100).toFixed(2)) })}
            />

            {/* Rotation Slider (-180deg to +180deg) */}
            <CustomOverlaySlider
              label="Rotation Angle"
              icon="refresh-outline"
              value={selectedLayer.rotation}
              min={-180}
              max={180}
              unit="°"
              step={5}
              onChange={(val) => onUpdateLayer(selectedLayer.id, { rotation: val })}
            />

            {/* Opacity Slider (0% to 100%) */}
            <CustomOverlaySlider
              label="Opacity"
              icon="eye-outline"
              value={Math.round(selectedLayer.opacity * 100)}
              min={0}
              max={100}
              unit="%"
              step={5}
              onChange={(val) => onUpdateLayer(selectedLayer.id, { opacity: Number((val / 100).toFixed(2)) })}
            />
          </View>
        )}

        {selectedLayer && activeTab === "blend" && (
          <View style={styles.tabContent}>
            <Text style={styles.sectionSubLabel}>Select Layer Blend Mode</Text>
            <View style={styles.blendGrid}>
              {BLEND_MODES.map((mode) => (
                <TouchableOpacity
                  key={mode.id}
                  style={[
                    styles.blendCard,
                    selectedLayer.blendMode === mode.id && styles.blendCardActive,
                  ]}
                  onPress={() => onUpdateLayer(selectedLayer.id, { blendMode: mode.id })}
                  activeOpacity={0.8}
                >
                  <Text style={[styles.blendCardText, selectedLayer.blendMode === mode.id && styles.blendCardTextActive]}>
                    {mode.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}

        {selectedLayer && activeTab === "mask" && (
          <View style={styles.tabContent}>
            <Text style={styles.sectionSubLabel}>Mask Shape Preset</Text>
            <View style={styles.blendGrid}>
              {MASK_SHAPES.map((shape) => (
                <TouchableOpacity
                  key={shape.id}
                  style={[
                    styles.blendCard,
                    selectedLayer.mask.type === shape.id && styles.blendCardActive,
                  ]}
                  onPress={() => onUpdateLayer(selectedLayer.id, { mask: { ...selectedLayer.mask, type: shape.id } })}
                  activeOpacity={0.8}
                >
                  <Ionicons name={shape.icon as any} size={16} color={selectedLayer.mask.type === shape.id ? "#000" : "#8E8E93"} style={{ marginBottom: 4 }} />
                  <Text style={[styles.blendCardText, selectedLayer.mask.type === shape.id && styles.blendCardTextActive]}>
                    {shape.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Shadow Blur Slider */}
            <CustomOverlaySlider
              label="Shadow Blur"
              icon="sparkles-outline"
              value={selectedLayer.shadow.blur}
              min={0}
              max={20}
              unit="px"
              onChange={(val) => onUpdateLayer(selectedLayer.id, { shadow: { ...selectedLayer.shadow, blur: val } })}
            />
          </View>
        )}

        {/* Footer Actions if layer is selected */}
        {selectedLayer && (
          <View style={styles.actionsFooter}>
            <TouchableOpacity style={styles.actionBtn} onPress={() => onBringForward(selectedLayer.id)}>
              <Ionicons name="arrow-up-outline" size={15} color="#fff" />
              <Text style={styles.actionBtnText}>Forward</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.actionBtn} onPress={() => onSendBackward(selectedLayer.id)}>
              <Ionicons name="arrow-down-outline" size={15} color="#fff" />
              <Text style={styles.actionBtnText}>Backward</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.actionBtn} onPress={() => onDuplicateLayer(selectedLayer.id)}>
              <Ionicons name="copy-outline" size={15} color="#fff" />
              <Text style={styles.actionBtnText}>Duplicate</Text>
            </TouchableOpacity>

            <TouchableOpacity style={[styles.actionBtn, styles.deleteActionBtn]} onPress={() => onDeleteLayer(selectedLayer.id)}>
              <Ionicons name="trash-outline" size={15} color="#FF3B30" />
              <Text style={[styles.actionBtnText, { color: "#FF3B30" }]}>Delete</Text>
            </TouchableOpacity>
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
  headerRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  title: {
    color: "#fff",
    fontSize: 17,
    fontWeight: "700",
  },
  doneBtn: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFCC00",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 14,
    gap: 4,
  },
  doneBtnText: {
    color: "#000",
    fontSize: 12,
    fontWeight: "700",
  },
  closeBtn: {
    padding: 2,
  },
  layerSelectorRow: {
    gap: 6,
    marginBottom: 8,
  },
  layerChip: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    backgroundColor: "rgba(255,255,255,0.06)",
    maxWidth: 120,
  },
  layerChipActive: {
    backgroundColor: "rgba(255,204,0,0.15)",
    borderWidth: 1,
    borderColor: "rgba(255,204,0,0.3)",
  },
  layerChipText: {
    color: "#8E8E93",
    fontSize: 11,
  },
  layerChipTextActive: {
    color: "#FFCC00",
    fontWeight: "700",
  },
  tabsRowWrapper: {
    marginBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255,255,255,0.06)",
    paddingBottom: 8,
  },
  tabsRowContainer: {
    flexDirection: "row",
    gap: 8,
    paddingRight: 10,
  },
  tabBtn: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 10,
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
  scrollArea: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 48,
  },
  tabContent: {
    gap: 12,
  },
  sectionSubLabel: {
    color: "#8E8E93",
    fontSize: 12,
    fontWeight: "600",
    marginBottom: 6,
  },
  addGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  addCard: {
    width: "31%",
    padding: 12,
    backgroundColor: "rgba(255,255,255,0.04)",
    borderRadius: 12,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.06)",
  },
  addCardText: {
    color: "#D1D1D6",
    fontSize: 11,
    fontWeight: "600",
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
    height: 28,
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
  blendGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  blendCard: {
    width: "23%",
    paddingVertical: 10,
    paddingHorizontal: 6,
    backgroundColor: "rgba(255,255,255,0.04)",
    borderRadius: 10,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.06)",
  },
  blendCardActive: {
    backgroundColor: "#FFCC00",
    borderColor: "#FFCC00",
  },
  blendCardText: {
    color: "#D1D1D6",
    fontSize: 11,
    fontWeight: "600",
    textAlign: "center",
  },
  blendCardTextActive: {
    color: "#000",
    fontWeight: "700",
  },
  actionsFooter: {
    flexDirection: "row",
    gap: 8,
    marginTop: 12,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: "rgba(255,255,255,0.06)",
  },
  actionBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 4,
    paddingVertical: 8,
    borderRadius: 10,
    backgroundColor: "rgba(255,255,255,0.08)",
  },
  deleteActionBtn: {
    backgroundColor: "rgba(255,59,48,0.15)",
  },
  actionBtnText: {
    color: "#fff",
    fontSize: 11,
    fontWeight: "600",
  },
});
