import React from "react";
import { TextInput, StyleSheet, TextInputProps } from "react-native";

import { useTheme } from "@/src/theme";

export function Input(props: TextInputProps) {
  const { theme } = useTheme();
  return (
    <TextInput
      placeholderTextColor={theme.colors.textMuted}
      {...props}
      style={[
        styles.input,
        { color: theme.colors.textPrimary, backgroundColor: theme.colors.surface, borderColor: theme.colors.border, borderRadius: theme.radius.md },
        props.style,
      ]}
    />
  );
}

const styles = StyleSheet.create({
  input: { paddingHorizontal: 14, paddingVertical: 12, borderWidth: 1, fontSize: 16 },
});
