import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { TextLayer, TextAnimationType } from "../types/editor.types";
import { TEXT_PRESETS, TextPreset } from "../text/TextPresets";

interface TextPanelProps {
  layers: TextLayer[];
  selectedLayerId: string | null;
  onAddText: () => void;
  onUpdateLayer: (id: string, updates: Partial<TextLayer>) => void;
  onSelectLayer: (id: string) => void;
  onDeleteLayer: (id: string) => void;
  onDuplicateLayer: (id: string) => void;
  onClose: () => void;
  bottomInset?: number;
}

const COLOR_PALETTE = [
  "#FFFFFF",
  "#FFCC00",
  "#00E5FF",
  "#FF3B30",
  "#FF007A",
  "#34C759",
  "#AF52DE",
  "#FF9500",
  "#000000",
];

const ANIMATION_OPTIONS: { id: TextAnimationType; label: string; icon: string }[] = [
  { id: "none", label: "None", icon: "close-circle-outline" },
  { id: "fade", label: "Fade", icon: "sparkles-outline" },
  { id: "slide", label: "Slide", icon: "arrow-forward-outline" },
  { id: "bounce", label: "Bounce", icon: "pulse-outline" },
  { id: "scale", label: "Scale", icon: "expand-outline" },
  { id: "rotate", label: "Rotate", icon: "refresh-outline" },
  { id: "typing", label: "Typing", icon: "hardware-chip-outline" },
  { id: "pop", label: "Pop", icon: "flash-outline" },
  { id: "wave", label: "Wave", icon: "water-outline" },
];

export function TextPanel({
  layers,
  selectedLayerId,
  onAddText,
  onUpdateLayer,
  onSelectLayer,
  onDeleteLayer,
  onDuplicateLayer,
  onClose,
  bottomInset = 20,
}: TextPanelProps) {
  const [activeTab, setActiveTab] = useState<"edit" | "presets" | "style" | "animation">("edit");

  const selectedLayer = layers.find((l) => l.id === selectedLayerId) || layers[0] || null;

  return (
    <View style={[styles.panel, { paddingBottom: Math.max(bottomInset, 20) }]}>
      {/* Header Bar */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Text style={{ fontSize: 18, marginRight: 6 }}>🔤</Text>
          <Text style={styles.title}>Text Editor</Text>
        </View>

        <View style={styles.headerRight}>
          <TouchableOpacity style={styles.addTextBtn} onPress={onAddText} activeOpacity={0.8}>
            <Ionicons name="add" size={16} color="#fff" />
            <Text style={[styles.addTextBtnText, { color: "#fff" }]}>Add</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.doneBtn} onPress={onClose} activeOpacity={0.8}>
            <Ionicons name="checkmark" size={16} color="#000" />
            <Text style={styles.doneBtnText}>Done</Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
            <Ionicons name="close-circle" size={24} color="#666" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Layer Selector Chips if multiple layers exist */}
      {layers.length > 1 && (
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.layerSelectorRow}>
          {layers.map((layer, idx) => (
            <TouchableOpacity
              key={layer.id}
              style={[styles.layerChip, layer.id === selectedLayerId && styles.layerChipActive]}
              onPress={() => onSelectLayer(layer.id)}
            >
              <Text style={[styles.layerChipText, layer.id === selectedLayerId && styles.layerChipTextActive]} numberOfLines={1}>
                {layer.text || `Text ${idx + 1}`}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      )}

      {selectedLayer ? (
        <>
          {/* Sub Navigation Tabs */}
          <View style={styles.tabsRow}>
            <TouchableOpacity
              style={[styles.tabBtn, activeTab === "edit" && styles.tabBtnActive]}
              onPress={() => setActiveTab("edit")}
            >
              <Ionicons name="create-outline" size={14} color={activeTab === "edit" ? "#FFCC00" : "#8E8E93"} style={{ marginRight: 4 }} />
              <Text style={[styles.tabText, activeTab === "edit" && styles.tabTextActive]}>Edit</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.tabBtn, activeTab === "presets" && styles.tabBtnActive]}
              onPress={() => setActiveTab("presets")}
            >
              <Ionicons name="grid-outline" size={14} color={activeTab === "presets" ? "#FFCC00" : "#8E8E93"} style={{ marginRight: 4 }} />
              <Text style={[styles.tabText, activeTab === "presets" && styles.tabTextActive]}>Presets</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.tabBtn, activeTab === "style" && styles.tabBtnActive]}
              onPress={() => setActiveTab("style")}
            >
              <Ionicons name="color-palette-outline" size={14} color={activeTab === "style" ? "#FFCC00" : "#8E8E93"} style={{ marginRight: 4 }} />
              <Text style={[styles.tabText, activeTab === "style" && styles.tabTextActive]}>Style</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.tabBtn, activeTab === "animation" && styles.tabBtnActive]}
              onPress={() => setActiveTab("animation")}
            >
              <Ionicons name="sparkles-outline" size={14} color={activeTab === "animation" ? "#FFCC00" : "#8E8E93"} style={{ marginRight: 4 }} />
              <Text style={[styles.tabText, activeTab === "animation" && styles.tabTextActive]}>Animation</Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.scrollArea} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
            {/* Edit Tab */}
            {activeTab === "edit" && (
              <View style={styles.tabContent}>
                <View style={styles.inputBox}>
                  <TextInput
                    style={styles.textInput}
                    value={selectedLayer.text}
                    onChangeText={(t) => onUpdateLayer(selectedLayer.id, { text: t })}
                    placeholder="Enter text..."
                    placeholderTextColor="#666"
                    multiline
                    autoFocus
                  />
                </View>

                {/* Font Size & Alignment */}
                <View style={styles.controlsRow}>
                  <View style={styles.sizeControl}>
                    <Text style={styles.sectionLabel}>Font Size: {selectedLayer.fontSize}px</Text>
                    <View style={styles.btnGroup}>
                      <TouchableOpacity
                        style={styles.adjustSizeBtn}
                        onPress={() => onUpdateLayer(selectedLayer.id, { fontSize: Math.max(12, selectedLayer.fontSize - 2) })}
                      >
                        <Ionicons name="remove" size={16} color="#fff" />
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={styles.adjustSizeBtn}
                        onPress={() => onUpdateLayer(selectedLayer.id, { fontSize: Math.min(72, selectedLayer.fontSize + 2) })}
                      >
                        <Ionicons name="add" size={16} color="#fff" />
                      </TouchableOpacity>
                    </View>
                  </View>

                  <View style={styles.alignControl}>
                    <Text style={styles.sectionLabel}>Align</Text>
                    <View style={styles.btnGroup}>
                      {(["left", "center", "right"] as const).map((align) => (
                        <TouchableOpacity
                          key={align}
                          style={[styles.alignBtn, selectedLayer.alignment === align && styles.alignBtnActive]}
                          onPress={() => onUpdateLayer(selectedLayer.id, { alignment: align })}
                        >
                          <Ionicons name={`text-alignment-${align}` as any} size={16} color={selectedLayer.alignment === align ? "#000" : "#fff"} />
                        </TouchableOpacity>
                      ))}
                    </View>
                  </View>
                </View>

                {/* Quick Colors */}
                <Text style={styles.sectionLabel}>Text Color</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.colorsRow}>
                  {COLOR_PALETTE.map((hex) => (
                    <TouchableOpacity
                      key={hex}
                      style={[styles.colorCircle, { backgroundColor: hex }, selectedLayer.color === hex && styles.colorCircleActive]}
                      onPress={() => onUpdateLayer(selectedLayer.id, { color: hex })}
                    />
                  ))}
                </ScrollView>
              </View>
            )}

            {/* Presets Tab */}
            {activeTab === "presets" && (
              <View style={styles.presetsGrid}>
                {TEXT_PRESETS.map((preset) => (
                  <TouchableOpacity
                    key={preset.id}
                    style={styles.presetCard}
                    onPress={() => onUpdateLayer(selectedLayer.id, preset.style)}
                    activeOpacity={0.8}
                  >
                    <Ionicons name={preset.icon as any} size={20} color="#FFCC00" style={{ marginBottom: 4 }} />
                    <Text style={styles.presetName}>{preset.name}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}

            {/* Style Tab */}
            {activeTab === "style" && (
              <View style={styles.tabContent}>
                {/* Font Weight */}
                <Text style={styles.sectionLabel}>Font Weight</Text>
                <View style={styles.optionsRow}>
                  {(["400", "600", "700", "900"] as const).map((weight) => (
                    <TouchableOpacity
                      key={weight}
                      style={[styles.weightChip, selectedLayer.fontWeight === weight && styles.weightChipActive]}
                      onPress={() => onUpdateLayer(selectedLayer.id, { fontWeight: weight })}
                    >
                      <Text style={[styles.weightChipText, selectedLayer.fontWeight === weight && styles.weightChipTextActive]}>
                        {weight === "400" ? "Regular" : weight === "600" ? "Medium" : weight === "700" ? "Bold" : "Black"}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>

                {/* Opacity */}
                <Text style={styles.sectionLabel}>Opacity: {Math.round(selectedLayer.opacity * 100)}%</Text>
                <View style={styles.optionsRow}>
                  {[0.25, 0.5, 0.75, 1.0].map((op) => (
                    <TouchableOpacity
                      key={op}
                      style={[styles.weightChip, Math.abs(selectedLayer.opacity - op) < 0.1 && styles.weightChipActive]}
                      onPress={() => onUpdateLayer(selectedLayer.id, { opacity: op })}
                    >
                      <Text style={[styles.weightChipText, Math.abs(selectedLayer.opacity - op) < 0.1 && styles.weightChipTextActive]}>
                        {op * 100}%
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>

                {/* Outline Width */}
                <Text style={styles.sectionLabel}>Outline Stroke</Text>
                <View style={styles.optionsRow}>
                  {[0, 2, 4, 6].map((stroke) => (
                    <TouchableOpacity
                      key={stroke}
                      style={[styles.weightChip, selectedLayer.outlineWidth === stroke && styles.weightChipActive]}
                      onPress={() => onUpdateLayer(selectedLayer.id, { outlineWidth: stroke })}
                    >
                      <Text style={[styles.weightChipText, selectedLayer.outlineWidth === stroke && styles.weightChipTextActive]}>
                        {stroke === 0 ? "None" : `${stroke}px`}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            )}

            {/* Animation Tab */}
            {activeTab === "animation" && (
              <View style={styles.presetsGrid}>
                {ANIMATION_OPTIONS.map((anim) => (
                  <TouchableOpacity
                    key={anim.id}
                    style={[styles.presetCard, selectedLayer.animation === anim.id && styles.presetCardActive]}
                    onPress={() => onUpdateLayer(selectedLayer.id, { animation: anim.id })}
                    activeOpacity={0.8}
                  >
                    <Ionicons
                      name={anim.icon as any}
                      size={22}
                      color={selectedLayer.animation === anim.id ? "#FFCC00" : "#8E8E93"}
                      style={{ marginBottom: 4 }}
                    />
                    <Text style={[styles.presetName, selectedLayer.animation === anim.id && styles.presetNameActive]}>
                      {anim.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}

            {/* Layer Actions */}
            <View style={styles.actionsFooter}>
              <TouchableOpacity style={styles.actionBtn} onPress={() => onDuplicateLayer(selectedLayer.id)}>
                <Ionicons name="copy-outline" size={16} color="#fff" />
                <Text style={styles.actionBtnText}>Duplicate</Text>
              </TouchableOpacity>

              <TouchableOpacity style={[styles.actionBtn, styles.deleteActionBtn]} onPress={() => onDeleteLayer(selectedLayer.id)}>
                <Ionicons name="trash-outline" size={16} color="#FF3B30" />
                <Text style={[styles.actionBtnText, { color: "#FF3B30" }]}>Delete</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </>
      ) : (
        <View style={styles.emptyBox}>
          <Ionicons name="text-outline" size={32} color="#666" style={{ marginBottom: 8 }} />
          <Text style={{ color: "#8E8E93", fontSize: 13 }}>No text layer selected.</Text>
          <TouchableOpacity style={[styles.addTextBtn, { marginTop: 12 }]} onPress={onAddText}>
            <Ionicons name="add" size={16} color="#000" />
            <Text style={styles.addTextBtnText}>Add Text</Text>
          </TouchableOpacity>
        </View>
      )}
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
    gap: 12,
  },
  title: {
    color: "#fff",
    fontSize: 17,
    fontWeight: "700",
  },
  addTextBtn: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFCC00",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 14,
    gap: 4,
  },
  addTextBtnText: {
    color: "#fff",
    fontSize: 12,
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
    marginBottom: 10,
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
    paddingHorizontal: 10,
    paddingVertical: 5,
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
    paddingBottom: 20,
    gap: 12,
  },
  tabContent: {
    gap: 12,
  },
  inputBox: {
    backgroundColor: "rgba(255,255,255,0.06)",
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
  },
  textInput: {
    color: "#fff",
    fontSize: 15,
    maxHeight: 60,
  },
  controlsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  sizeControl: {
    flex: 1,
  },
  alignControl: {
    alignItems: "flex-end",
  },
  sectionLabel: {
    color: "#8E8E93",
    fontSize: 11,
    fontWeight: "600",
    marginBottom: 6,
  },
  btnGroup: {
    flexDirection: "row",
    gap: 6,
  },
  adjustSizeBtn: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: "rgba(255,255,255,0.1)",
    justifyContent: "center",
    alignItems: "center",
  },
  alignBtn: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: "rgba(255,255,255,0.1)",
    justifyContent: "center",
    alignItems: "center",
  },
  alignBtnActive: {
    backgroundColor: "#FFCC00",
  },
  colorsRow: {
    gap: 8,
    paddingVertical: 4,
  },
  colorCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: "rgba(255,255,255,0.2)",
  },
  colorCircleActive: {
    borderColor: "#FFCC00",
    borderWidth: 3,
  },
  presetsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  presetCard: {
    width: "31%",
    padding: 10,
    backgroundColor: "rgba(255,255,255,0.04)",
    borderRadius: 12,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.06)",
  },
  presetCardActive: {
    backgroundColor: "rgba(255,204,0,0.15)",
    borderColor: "#FFCC00",
  },
  presetName: {
    color: "#D1D1D6",
    fontSize: 11,
    fontWeight: "600",
    textAlign: "center",
  },
  presetNameActive: {
    color: "#FFCC00",
  },
  optionsRow: {
    flexDirection: "row",
    gap: 8,
  },
  weightChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 10,
    backgroundColor: "rgba(255,255,255,0.06)",
  },
  weightChipActive: {
    backgroundColor: "#FFCC00",
  },
  weightChipText: {
    color: "#A0A0A0",
    fontSize: 11,
    fontWeight: "600",
  },
  weightChipTextActive: {
    color: "#000",
    fontWeight: "700",
  },
  actionsFooter: {
    flexDirection: "row",
    gap: 12,
    marginTop: 8,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: "rgba(255,255,255,0.06)",
  },
  actionBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 12,
    backgroundColor: "rgba(255,255,255,0.08)",
  },
  deleteActionBtn: {
    backgroundColor: "rgba(255,59,48,0.15)",
  },
  actionBtnText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "600",
  },
  emptyBox: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});
