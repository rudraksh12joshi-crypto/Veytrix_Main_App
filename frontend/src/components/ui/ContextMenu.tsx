import React from "react";
import { View, Text } from "react-native";

export type ContextMenuItem = { id: string; label: string; onPress?: () => void };
type Props = { items: ContextMenuItem[] };

export function ContextMenu({ items }: Props) {
  return (
    <View>
      {items.map((i) => (
        <Text key={i.id}>{i.label}</Text>
      ))}
    </View>
  );
}
