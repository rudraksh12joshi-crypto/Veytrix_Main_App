import { Ionicons } from "@expo/vector-icons";
import React, { useRef } from "react";
import { FlatList, StyleSheet, Text, View, Pressable, Animated } from "react-native";
import { LinearGradient } from "expo-linear-gradient";

import { useTheme } from "@/src/theme";

export type ProjectRailItem = {
  id: string;
  title: string;
  lastEditedLabel: string;
  duration?: string;
  resolution?: string;
  frameRatio?: string;
  gradient: [string, string];
};

type Props = { 
  items: ProjectRailItem[]; 
  emptyLabel?: string; 
  emptyIcon?: string;
  emptyTitle?: string;
  emptyDesc?: string;
  emptyCta?: string;
  onEmptyCtaPress?: () => void;
  onPressItem?: (id: string) => void;
};

function ProjectCard({ item, theme, onPressItem }: { item: ProjectRailItem, theme: any, onPressItem?: (id: string) => void }) {
  const scale = useRef(new Animated.Value(1)).current;

  return (
    <Pressable
      testID={`project-card-${item.id}`}
      onPress={() => onPressItem?.(item.id)}
      onPressIn={() => Animated.spring(scale, { toValue: 0.96, useNativeDriver: true }).start()}
      onPressOut={() => Animated.spring(scale, { toValue: 1, useNativeDriver: true }).start()}
    >
      <Animated.View 
        style={[
          styles.card, 
          { 
            borderRadius: theme.radius.lg, 
            backgroundColor: theme.colors.surfaceElevated,
            transform: [{ scale }]
          }
        ]}
      >
        <LinearGradient colors={item.gradient} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.thumb}>
          <View style={styles.thumbTopRow}>
            {item.frameRatio ? (
              <View style={styles.badge}>
                <Ionicons name={item.frameRatio === "9:16" ? "phone-portrait-outline" : "tv-outline"} size={10} color="#fff" style={{marginRight: 4}} />
                <Text style={styles.badgeText}>{item.frameRatio}</Text>
              </View>
            ) : <View />}
            {item.resolution ? (
              <View style={[styles.badge, { backgroundColor: "rgba(0,0,0,0.6)" }]}>
                <Text style={styles.badgeText}>{item.resolution}</Text>
              </View>
            ) : null}
          </View>
          <View style={styles.thumbBottomRow}>
            {item.duration ? (
              <View style={styles.durationChip}>
                <Text style={styles.durationText}>{item.duration}</Text>
              </View>
            ) : <View />}
            <View style={styles.playOverlayBtn}>
              <Ionicons name="play" size={14} color="#fff" />
            </View>
          </View>
        </LinearGradient>
        <View style={styles.meta}>
          <View style={styles.metaHeader}>
            <Text numberOfLines={1} style={{ color: theme.colors.textPrimary, fontSize: 15, fontWeight: "700", flex: 1, marginRight: 8 }}>
              {item.title}
            </Text>
            <Pressable hitSlop={10} style={styles.menuBtn}>
              <Ionicons name="ellipsis-vertical" size={16} color={theme.colors.textMuted} />
            </Pressable>
          </View>
          <Text style={{ color: theme.colors.textMuted, fontSize: 12, marginTop: 4 }}>
            {item.lastEditedLabel}
          </Text>
          <Pressable 
            style={[styles.continueBtn, { backgroundColor: theme.colors.primary + "15" }]}
            onPress={() => onPressItem?.(item.id)}
          >
            <Text style={{ color: theme.colors.primary, fontSize: 13, fontWeight: "600" }}>Continue Editing</Text>
          </Pressable>
        </View>
      </Animated.View>
    </Pressable>
  );
}

export function RecentProjectsRail({ items, emptyLabel, emptyIcon, emptyTitle, emptyDesc, emptyCta, onEmptyCtaPress, onPressItem }: Props) {
  const { theme } = useTheme();

  if (items.length === 0) {
    if (emptyTitle) {
      return (
        <View style={[styles.richEmpty, { borderColor: theme.colors.border, borderRadius: theme.radius.lg, backgroundColor: theme.colors.surface }]}>
          <Text style={{ fontSize: 32, marginBottom: 12 }}>{emptyIcon}</Text>
          <Text style={{ color: theme.colors.textPrimary, fontSize: 18, fontWeight: "700", marginBottom: 6 }}>{emptyTitle}</Text>
          <Text style={{ color: theme.colors.textMuted, fontSize: 14, textAlign: "center", marginBottom: emptyCta ? 16 : 0 }}>{emptyDesc}</Text>
          {emptyCta && (
            <Pressable style={[styles.emptyCta, { backgroundColor: theme.colors.primary }]} onPress={onEmptyCtaPress}>
              <Text style={{ color: "#fff", fontSize: 14, fontWeight: "700" }}>{emptyCta}</Text>
            </Pressable>
          )}
        </View>
      );
    }

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
      renderItem={({ item }) => <ProjectCard item={item} theme={theme} onPressItem={onPressItem} />}
    />
  );
}

const styles = StyleSheet.create({
  list: { paddingHorizontal: 20, gap: 16, paddingBottom: 24, paddingTop: 4 },
  card: { 
    width: 220, 
    overflow: "hidden", 
    shadowColor: "#8CC8E8",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 5,
  },
  thumb: { 
    height: 120, 
    padding: 10,
    justifyContent: "space-between" 
  },
  thumbTopRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center"
  },
  thumbBottomRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end"
  },
  badge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.4)",
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 6,
  },
  badgeText: { color: "#fff", fontSize: 10, fontWeight: "700" },
  durationChip: {
    backgroundColor: "rgba(0,0,0,0.5)",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 999,
  },
  durationText: { color: "#fff", fontSize: 11, fontWeight: "600" },
  playOverlayBtn: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: "rgba(255,255,255,0.25)",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.5)"
  },
  meta: { padding: 14 },
  metaHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center"
  },
  menuBtn: {
    padding: 2
  },
  continueBtn: {
    marginTop: 12,
    paddingVertical: 8,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center"
  },
  empty: {
    marginHorizontal: 20,
    padding: 20,
    borderWidth: 1,
    borderStyle: "dashed",
    alignItems: "center",
  },
  richEmpty: {
    marginHorizontal: 20,
    padding: 32,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderStyle: "dashed",
    marginBottom: 24,
  },
  emptyCta: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
  },
});
