import React from "react";
import { View, StyleSheet } from "react-native";

import { useTheme } from "@/src/theme";

type Props = { children: React.ReactNode; testID?: string };

export function Card({ children, testID }: Props) {
  const { theme } = useTheme();
  return (
    <View
      testID={testID}
      style={[styles.card, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border, borderRadius: theme.radius.md }]}
    >
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  card: { padding: 16, borderWidth: 1 },
});
