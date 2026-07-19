import React from "react";
import { View, Text, StyleSheet } from "react-native";

import { useTheme } from "@/src/theme";

type Props = { title: string; subtitle?: string; testID?: string };

export function ScreenPlaceholder({ title, subtitle, testID }: Props) {
  const { theme } = useTheme();
  return (
    <View testID={testID} style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <Text style={{ color: theme.colors.textPrimary, fontSize: 24, fontWeight: "700" }}>{title}</Text>
      {subtitle ? (
        <Text style={{ color: theme.colors.textMuted, marginTop: 8, fontSize: 14 }}>{subtitle}</Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: "center", justifyContent: "center", padding: 24 },
});
