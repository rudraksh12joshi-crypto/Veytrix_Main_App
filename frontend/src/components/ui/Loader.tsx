import React from "react";
import { ActivityIndicator, View } from "react-native";

import { useTheme } from "@/src/theme";

export function Loader() {
  const { theme } = useTheme();
  return (
    <View style={{ padding: 16, alignItems: "center" }}>
      <ActivityIndicator color={theme.colors.primary} />
    </View>
  );
}
