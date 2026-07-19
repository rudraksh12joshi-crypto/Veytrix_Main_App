import React from "react";
import { View, Text } from "react-native";

// Placeholder toast component - a real toast provider will be wired later.
type Props = { message: string; testID?: string };

export function Toast({ message, testID }: Props) {
  return (
    <View testID={testID}>
      <Text>{message}</Text>
    </View>
  );
}
