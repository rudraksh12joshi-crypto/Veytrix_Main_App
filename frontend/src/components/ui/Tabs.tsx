import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";

import { useTheme } from "@/src/theme";

export type TabItem = { id: string; label: string };
type Props = { tabs: TabItem[]; activeId: string; onChange: (id: string) => void };

export function Tabs({ tabs, activeId, onChange }: Props) {
  const { theme } = useTheme();
  return (
    <View style={styles.row}>
      {tabs.map((t) => {
        const active = t.id === activeId;
        return (
          <TouchableOpacity
            key={t.id}
            onPress={() => onChange(t.id)}
            style={[styles.tab, active && { borderBottomColor: theme.colors.primary }]}
          >
            <Text style={{ color: active ? theme.colors.textPrimary : theme.colors.textMuted, fontWeight: "600" }}>
              {t.label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: "row" },
  tab: { paddingVertical: 10, paddingHorizontal: 14, borderBottomWidth: 2, borderBottomColor: "transparent" },
});
