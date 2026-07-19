import React from "react";
import { Text } from "react-native";

import { Card } from "./Card";
import { useTheme } from "@/src/theme";

type Props = { title: string; subtitle?: string; testID?: string };

export function MediaCard({ title, subtitle, testID }: Props) {
  const { theme } = useTheme();
  return (
    <Card testID={testID}>
      <Text style={{ color: theme.colors.textPrimary, fontWeight: "600" }}>{title}</Text>
      {subtitle ? (
        <Text style={{ color: theme.colors.textMuted, marginTop: 4 }}>{subtitle}</Text>
      ) : null}
    </Card>
  );
}
