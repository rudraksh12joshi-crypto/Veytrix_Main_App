import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";

import { useTheme } from "@/src/theme";

export type QuickAction = {
  id: string;
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
  gradient: [string, string];
  onPress?: () => void;
};

type Props = { actions: QuickAction[] };

export function QuickActionsRow({ actions }: Props) {
  const { theme } = useTheme();
  return (
    <View style={styles.grid}>
      {actions.map((a) => (
        <TouchableOpacity
          key={a.id}
          testID={`quick-action-${a.id}`}
          activeOpacity={0.85}
          onPress={a.onPress}
          style={[styles.tile, { backgroundColor: theme.colors.surfaceElevated, borderColor: theme.colors.border, borderRadius: theme.radius.lg }]}
        >
          <LinearGradient
            colors={a.gradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.iconWrap}
          >
            <Ionicons name={a.icon} size={22} color="#fff" />
          </LinearGradient>
          <Text
            numberOfLines={1}
            style={{ color: theme.colors.textPrimary, fontSize: 13, fontWeight: "600", marginTop: 10 }}
          >
            {a.label}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  grid: {
    paddingHorizontal: 20,
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  tile: {
    width: "47%",
    flexGrow: 1,
    paddingVertical: 16,
    paddingHorizontal: 14,
    borderWidth: 1,
  },
  iconWrap: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
});
