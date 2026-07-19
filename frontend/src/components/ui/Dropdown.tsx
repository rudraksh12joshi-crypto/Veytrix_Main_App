import React from "react";
import { View, Text } from "react-native";

export type DropdownItem = { id: string; label: string };
type Props = { items: DropdownItem[]; onSelect?: (item: DropdownItem) => void };

export function Dropdown({ items }: Props) {
  return (
    <View>
      {items.map((i) => (
        <Text key={i.id}>{i.label}</Text>
      ))}
    </View>
  );
}
