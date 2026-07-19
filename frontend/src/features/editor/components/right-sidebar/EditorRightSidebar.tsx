import React from "react";
import { View, StyleSheet } from "react-native";

import { useTheme } from "@/src/theme";

// Right sidebar - inspector / contextual settings for selected clip.
export function EditorRightSidebar() {
  const { theme } = useTheme();
  return (
    <View
      testID="editor-right-sidebar"
      style={[styles.side, { backgroundColor: theme.colors.surface, borderLeftColor: theme.colors.border }]}
    />
  );
}

const styles = StyleSheet.create({
  side: { width: 260, borderLeftWidth: 1 },
});
