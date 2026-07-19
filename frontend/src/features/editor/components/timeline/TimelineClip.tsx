import React from "react";
import { View, StyleSheet } from "react-native";

import { useTheme } from "@/src/theme";

// Clip block on a track. Drag, trim, split handlers wire up later.
export function TimelineClip() {
  const { theme } = useTheme();
  return (
    <View
      testID="timeline-clip"
      style={[styles.clip, { backgroundColor: theme.colors.timelineClip, borderRadius: theme.radius.sm }]}
    />
  );
}

const styles = StyleSheet.create({
  clip: { height: 44, minWidth: 60 },
});
