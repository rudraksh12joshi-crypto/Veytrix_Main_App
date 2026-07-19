import React from "react";
import { View, StyleSheet } from "react-native";

import { useTheme } from "@/src/theme";

// Primary editor toolbar (split, delete, undo, redo, speed, crop, etc.).
export function EditorToolbar() {
  const { theme } = useTheme();
  return (
    <View
      testID="editor-toolbar"
      style={[styles.bar, { backgroundColor: theme.colors.surface, borderBottomColor: theme.colors.border }]}
    />
  );
}

const styles = StyleSheet.create({
  bar: { height: 44, borderBottomWidth: 1 },
});
