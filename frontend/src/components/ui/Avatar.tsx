import React from "react";
import { View, Text, StyleSheet } from "react-native";

import { useTheme } from "@/src/theme";

type Props = { name?: string; uri?: string; size?: number };

export function Avatar({ name, size = 40 }: Props) {
  const { theme } = useTheme();
  const initial = (name || "?").slice(0, 1).toUpperCase();
  return (
    <View
      style={[
        styles.wrap,
        { width: size, height: size, borderRadius: size / 2, backgroundColor: theme.colors.surfaceElevated },
      ]}
    >
      <Text style={{ color: theme.colors.textPrimary, fontWeight: "700" }}>{initial}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { alignItems: "center", justifyContent: "center" },
});
