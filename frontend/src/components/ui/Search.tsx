import React from "react";
import { View } from "react-native";

import { Input } from "./Input";

type Props = { value?: string; onChangeText?: (v: string) => void; placeholder?: string };

export function Search({ value, onChangeText, placeholder = "Search" }: Props) {
  return (
    <View>
      <Input value={value} onChangeText={onChangeText} placeholder={placeholder} />
    </View>
  );
}
