import React from "react";
import { Text, TouchableOpacity, StyleSheet } from "react-native";

import { useTheme } from "@/src/theme";

type Props = { label: string; onPress?: () => void; testID?: string };

export function Button({ label, onPress, testID }: Props) {
  const { theme } = useTheme();
  return (
    <TouchableOpacity
      testID={testID}
      onPress={onPress}
      style={[styles.btn, { backgroundColor: theme.colors.primary, borderRadius: theme.radius.md }]}
    >
      <Text style={{ color: "#fff", fontWeight: "600" }}>{label}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  btn: { paddingVertical: 12, paddingHorizontal: 20, alignItems: "center", justifyContent: "center" },
});
