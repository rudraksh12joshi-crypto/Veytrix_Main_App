import React from "react";
import { View, StyleSheet } from "react-native";

import { useTheme } from "@/src/theme";
import { TimelineTracks } from "./TimelineTracks";
import { TimelinePlayhead } from "./TimelinePlayhead";
import { TimelineMarkers } from "./TimelineMarkers";
import { TimelineRuler } from "./TimelineRuler";

// Timeline - orchestrates tracks, clips, markers, playhead, layers, selection, undo/redo, zoom.
// Interaction logic to be implemented later.
export function EditorTimeline() {
  const { theme } = useTheme();
  return (
    <View testID="editor-timeline" style={[styles.wrap, { backgroundColor: theme.colors.timelineBg, borderTopColor: theme.colors.border }]}>
      <TimelineRuler />
      <TimelineMarkers />
      <TimelineTracks />
      <TimelinePlayhead />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { height: 220, borderTopWidth: 1 },
});
