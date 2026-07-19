import React from "react";
import { View, StyleSheet } from "react-native";

import { useTheme } from "@/src/theme";

// Canvas / preview surface - video renderer will mount here.
export function EditorCanvas() {
  const { theme } = useTheme();
  return (
    <View testID="editor-canvas" style={[styles.canvas, { backgroundColor: "#000" }]}>
      <View style={{ flex: 1, borderColor: theme.colors.border }} />
    </View>
  );
}

const styles = StyleSheet.create({
  canvas: { flex: 1, alignItems: "center", justifyContent: "center" },
});
