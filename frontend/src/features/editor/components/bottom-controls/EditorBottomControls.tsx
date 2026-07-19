import React from "react";
import { View, StyleSheet } from "react-native";

import { useTheme } from "@/src/theme";

// Bottom controls - track add buttons, zoom controls, fit-to-window etc.
export function EditorBottomControls() {
  const { theme } = useTheme();
  return (
    <View
      testID="editor-bottom-controls"
      style={[styles.bar, { backgroundColor: theme.colors.surface, borderTopColor: theme.colors.border }]}
    />
  );
}

const styles = StyleSheet.create({
  bar: { height: 44, borderTopWidth: 1 },
});
