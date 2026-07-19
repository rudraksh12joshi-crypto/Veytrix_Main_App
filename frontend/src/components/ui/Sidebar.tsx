import React from "react";
import { View } from "react-native";

type Props = { children: React.ReactNode };

// Placeholder sidebar container - editor-specific sidebars live under features/editor.
export function Sidebar({ children }: Props) {
  return <View style={{ width: 72 }}>{children}</View>;
}
