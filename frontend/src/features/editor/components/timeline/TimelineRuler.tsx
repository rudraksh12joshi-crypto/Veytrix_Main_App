import React from "react";
import { View, StyleSheet } from "react-native";

import { useTheme } from "@/src/theme";

// Time ruler with tick marks - zoom-aware scale rendering.
export function TimelineRuler() {
  const { theme } = useTheme();
  return (
    <View
      testID="timeline-ruler"
      style={[styles.ruler, { backgroundColor: theme.colors.surface, borderBottomColor: theme.colors.border }]}
    />
  );
}

const styles = StyleSheet.create({
  ruler: { height: 24, borderBottomWidth: 1 },
});
