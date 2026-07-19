import React from "react";
import { Modal as RNModal, View, StyleSheet } from "react-native";

import { useTheme } from "@/src/theme";

type Props = { visible: boolean; onClose: () => void; children: React.ReactNode; testID?: string };

export function Modal({ visible, onClose, children, testID }: Props) {
  const { theme } = useTheme();
  return (
    <RNModal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View testID={testID} style={[styles.backdrop, { backgroundColor: theme.colors.overlay }]}>
        <View style={[styles.sheet, { backgroundColor: theme.colors.surfaceElevated, borderRadius: theme.radius.lg }]}>
          {children}
        </View>
      </View>
    </RNModal>
  );
}

const styles = StyleSheet.create({
  backdrop: { flex: 1, alignItems: "center", justifyContent: "center", padding: 24 },
  sheet: { width: "100%", padding: 20 },
});
