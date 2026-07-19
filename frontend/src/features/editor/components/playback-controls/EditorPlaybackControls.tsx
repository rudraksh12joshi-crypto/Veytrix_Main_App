import React from "react";
import { View, StyleSheet } from "react-native";

import { useTheme } from "@/src/theme";

// Playback transport - play, pause, prev/next frame, timecode.
export function EditorPlaybackControls() {
  const { theme } = useTheme();
  return (
    <View
      testID="editor-playback-controls"
      style={[styles.bar, { backgroundColor: theme.colors.surface, borderBottomColor: theme.colors.border }]}
    />
  );
}

const styles = StyleSheet.create({
  bar: { height: 44, borderBottomWidth: 1 },
});
