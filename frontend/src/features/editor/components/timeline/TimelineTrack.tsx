import React from "react";
import { View, StyleSheet } from "react-native";

import { useTheme } from "@/src/theme";
import { EDITOR } from "@/src/constants/editor";

// Single track row - hosts clips of a specific type.
export function TimelineTrack() {
  const { theme } = useTheme();
  return (
    <View
      testID="timeline-track"
      style={[styles.track, { height: EDITOR.TRACK_HEIGHT, backgroundColor: theme.colors.timelineTrack, borderBottomColor: theme.colors.border }]}
    />
  );
}

const styles = StyleSheet.create({
  track: { borderBottomWidth: 1 },
});
