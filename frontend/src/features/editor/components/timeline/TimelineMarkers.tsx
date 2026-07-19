import React from "react";
import { View, StyleSheet } from "react-native";

// Timeline markers row (chapter, cue points).
export function TimelineMarkers() {
  return <View testID="timeline-markers" style={styles.row} />;
}

const styles = StyleSheet.create({
  row: { height: 12 },
});
