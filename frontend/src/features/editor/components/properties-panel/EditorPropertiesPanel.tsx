import React from "react";
import { View, StyleSheet } from "react-native";

import { useTheme } from "@/src/theme";

// Inspector panel for the currently selected clip / track (transform, effects, audio).
export function EditorPropertiesPanel() {
  const { theme } = useTheme();
  return (
    <View
      testID="editor-properties-panel"
      style={[styles.panel, { backgroundColor: theme.colors.surface, borderTopColor: theme.colors.border }]}
    />
  );
}

const styles = StyleSheet.create({
  panel: { height: 0, borderTopWidth: 0 },
});
