import React from "react";
import { View, Text } from "react-native";

import { Modal } from "./Modal";
import { useTheme } from "@/src/theme";

type Props = { visible: boolean; title: string; children?: React.ReactNode; onClose: () => void };

export function Dialog({ visible, title, children, onClose }: Props) {
  const { theme } = useTheme();
  return (
    <Modal visible={visible} onClose={onClose}>
      <Text style={{ color: theme.colors.textPrimary, fontSize: 18, fontWeight: "700", marginBottom: 12 }}>
        {title}
      </Text>
      <View>{children}</View>
    </Modal>
  );
}
