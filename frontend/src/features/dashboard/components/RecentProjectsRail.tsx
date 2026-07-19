import React from "react";
import { FlatList, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";

import { useTheme } from "@/src/theme";

export type ProjectRailItem = {
  id: string;
  title: string;
  lastEditedLabel: string;
  duration?: string;
  gradient: [string, string];
};

type Props = { items: ProjectRailItem[]; emptyLabel?: string; onPressItem?: (id: string) => void };

export function RecentProjectsRail({ items, emptyLabel, onPressItem }: Props) {
  const { theme } = useTheme();

  if (items.length === 0) {
    return (
      <View style={[styles.empty, { borderColor: theme.colors.border, borderRadius: theme.radius.md }]}>
        <Text style={{ color: theme.colors.textMuted, fontSize: 13 }}>
          {emptyLabel ?? "Nothing here yet"}
        </Text>
      </View>
    );
  }

  return (
    <FlatList
      data={items}
      keyExtractor={(i) => i.id}
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.list}
      renderItem={({ item }) => (
        <TouchableOpacity
          testID={`project-card-${item.id}`}
          activeOpacity={0.85}
          onPress={() => onPressItem?.(item.id)}
          style={[styles.card, { borderRadius: theme.radius.lg, backgroundColor: theme.colors.surfaceElevated, borderColor: theme.colors.border }]}
        >
          <LinearGradient colors={item.gradient} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.thumb}>
            {item.duration ? (
              <View style={styles.durationChip}>
                <Text style={styles.durationText}>{item.duration}</Text>
              </View>
            ) : null}
          </LinearGradient>
          <View style={styles.meta}>
            <Text
              numberOfLines={1}
              style={{ color: theme.colors.textPrimary, fontSize: 14, fontWeight: "700" }}
            >
              {item.title}
            </Text>
            <Text style={{ color: theme.colors.textMuted, fontSize: 12, marginTop: 3 }}>
              {item.lastEditedLabel}
            </Text>
          </View>
        </TouchableOpacity>
      )}
    />
  );
}

const styles = StyleSheet.create({
  list: { paddingHorizontal: 20, gap: 12 },
  card: { width: 172, overflow: "hidden", borderWidth: 1 },
  thumb: { height: 112, justifyContent: "flex-end", padding: 10 },
  durationChip: {
    alignSelf: "flex-start",
    backgroundColor: "rgba(0,0,0,0.4)",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 999,
  },
  durationText: { color: "#fff", fontSize: 11, fontWeight: "600" },
  meta: { paddingHorizontal: 12, paddingVertical: 10 },
  empty: {
    marginHorizontal: 20,
    padding: 20,
    borderWidth: 1,
    borderStyle: "dashed",
    alignItems: "center",
  },
});
