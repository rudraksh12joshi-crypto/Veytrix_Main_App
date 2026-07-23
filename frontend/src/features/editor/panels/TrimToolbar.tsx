import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";

interface TrimToolbarProps {
  durationMs: number;
  onCancel: () => void;
  onDone: () => void;
  formatTime: (ms: number) => string;
  bottomInset?: number;
}

export function TrimToolbar({
  durationMs,
  onCancel,
  onDone,
  formatTime,
  bottomInset = 12,
}: TrimToolbarProps) {
  return (
    <View style={[styles.trimModeToolbar, { paddingBottom: Math.max(bottomInset, 12) }]}>
      <TouchableOpacity style={styles.trimCancelBtn} onPress={onCancel} activeOpacity={0.7}>
        <Ionicons name="close" size={20} color="#fff" />
        <Text style={styles.trimBtnText}>Cancel</Text>
      </TouchableOpacity>

      <View style={styles.trimInfoBox}>
        <Ionicons name="cut" size={16} color="#FFCC00" style={{ marginRight: 6 }} />
        <Text style={styles.trimInfoText}>
          {formatTime(durationMs)}{" "}
          <Text style={{ color: "rgba(255,255,255,0.5)", fontSize: 11 }}>Selected</Text>
        </Text>
      </View>

      <TouchableOpacity style={styles.trimDoneBtn} onPress={onDone} activeOpacity={0.7}>
        <Ionicons name="checkmark" size={20} color="#000" />
        <Text style={[styles.trimBtnText, { color: "#000", fontWeight: "700" }]}>Done</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  trimModeToolbar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#1A1A1E",
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderTopWidth: 1,
    borderTopColor: "rgba(255,255,255,0.08)",
  },
  trimCancelBtn: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.1)",
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    gap: 6,
  },
  trimDoneBtn: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFCC00",
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    gap: 6,
  },
  trimBtnText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "600",
  },
  trimInfoBox: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.4)",
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "rgba(255,204,0,0.3)",
  },
  trimInfoText: {
    color: "#fff",
    fontSize: 13,
    fontWeight: "600",
  },
});
