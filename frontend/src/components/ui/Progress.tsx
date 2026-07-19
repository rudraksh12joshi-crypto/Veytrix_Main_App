import React from "react";
import { View, StyleSheet } from "react-native";

import { useTheme } from "@/src/theme";

type Props = { value: number; testID?: string };

export function Progress({ value, testID }: Props) {
  const { theme } = useTheme();
  const pct = Math.max(0, Math.min(1, value));
  return (
    <View testID={testID} style={[styles.track, { backgroundColor: theme.colors.surface }]}>
      <View style={[styles.fill, { width: `${pct * 100}%`, backgroundColor: theme.colors.primary }]} />
    </View>
  );
}

const styles = StyleSheet.create({
  track: { height: 6, borderRadius: 3, overflow: "hidden" },
  fill: { height: "100%" },
});
