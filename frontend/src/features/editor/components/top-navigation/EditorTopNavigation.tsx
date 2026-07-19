import React from "react";
import { View, Text, StyleSheet } from "react-native";

import { useTheme } from "@/src/theme";

export function EditorTopNavigation() {
  const { theme } = useTheme();
  return (
    <View testID="editor-top-navigation" style={[styles.bar, { backgroundColor: theme.colors.surface, borderBottomColor: theme.colors.border }]}>
      <Text style={{ color: theme.colors.textPrimary }}>Editor</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  bar: { height: 48, paddingHorizontal: 16, borderBottomWidth: 1, alignItems: "center", justifyContent: "center" },
});
