import React from "react";
import { View, Text } from "react-native";

type Props = { onPick?: () => void; label?: string };

// Placeholder file/media upload trigger.
export function FileUpload({ label = "Upload media" }: Props) {
  return (
    <View>
      <Text>{label}</Text>
    </View>
  );
}
