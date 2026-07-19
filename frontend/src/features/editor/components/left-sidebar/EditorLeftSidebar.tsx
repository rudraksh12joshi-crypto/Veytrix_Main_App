import React from "react";
import { View, StyleSheet } from "react-native";

import { useTheme } from "@/src/theme";

// Left sidebar - tool categories (media, text, audio, stickers, effects, filters, AI).
export function EditorLeftSidebar() {
  const { theme } = useTheme();
  return (
    <View
      testID="editor-left-sidebar"
      style={[styles.side, { backgroundColor: theme.colors.surface, borderRightColor: theme.colors.border }]}
    />
  );
}

const styles = StyleSheet.create({
  side: { width: 72, borderRightWidth: 1 },
});
