import React from "react";
import { View } from "react-native";

// Placeholder auth form container - shared login/register scaffold.
export function AuthForm({ children }: { children?: React.ReactNode }) {
  return <View>{children}</View>;
}
