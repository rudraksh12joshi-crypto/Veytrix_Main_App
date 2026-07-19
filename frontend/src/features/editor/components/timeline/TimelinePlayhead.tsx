import React from "react";
import { View, StyleSheet } from "react-native";

import { useTheme } from "@/src/theme";
import { EDITOR } from "@/src/constants/editor";

// Vertical playhead line spanning the timeline.
export function TimelinePlayhead() {
  const { theme } = useTheme();
  return (
    <View
      testID="timeline-playhead"
      pointerEvents="none"
      style={[styles.line, { width: EDITOR.PLAYHEAD_WIDTH, backgroundColor: theme.colors.playhead }]}
    />
  );
}

const styles = StyleSheet.create({
  line: { position: "absolute", top: 0, bottom: 0, left: 0 },
});
