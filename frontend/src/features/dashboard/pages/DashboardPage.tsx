import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import React, { useEffect, useMemo, useRef } from "react";
import { Animated, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { useTheme } from "@/src/theme";
import { QuickActionsRow, QuickAction } from "../components/QuickActionsRow";
import { ProjectRailItem, RecentProjectsRail } from "../components/RecentProjectsRail";

const RECENT_PROJECTS: ProjectRailItem[] = [
  { id: "1", title: "Summer Vlog", lastEditedLabel: "Edited 2h ago", duration: "1:24", gradient: ["#FF3B8B", "#FFB43C"] },
  { id: "2", title: "Product Reel", lastEditedLabel: "Yesterday", duration: "0:38", gradient: ["#7C5CFF", "#3CD09A"] },
  { id: "3", title: "Travel Cut", lastEditedLabel: "3 days ago", duration: "2:12", gradient: ["#3CD09A", "#7C5CFF"] },
];

const DRAFTS: ProjectRailItem[] = [
  { id: "d1", title: "Untitled draft", lastEditedLabel: "Auto-saved 5m ago", duration: "0:12", gradient: ["#4A4A6A", "#7C5CFF"] },
  { id: "d2", title: "Cafe morning", lastEditedLabel: "Yesterday", duration: "0:44", gradient: ["#26262A", "#FF3B8B"] },
];

const EXPORTS: ProjectRailItem[] = [
  { id: "e1", title: "Reel v3 · 1080p", lastEditedLabel: "Exported 1h ago", duration: "0:59", gradient: ["#3CD09A", "#26262A"] },
  { id: "e2", title: "Story v1 · 9:16", lastEditedLabel: "Exported today", duration: "0:15", gradient: ["#FFB43C", "#FF3B8B"] },
];

function useEnter() {
  const opacity = useRef(new Animated.Value(0)).current;
  const translate = useRef(new Animated.Value(12)).current;
  useEffect(() => {
    Animated.parallel([
      Animated.timing(opacity, { toValue: 1, duration: 320, useNativeDriver: true }),
      Animated.timing(translate, { toValue: 0, duration: 320, useNativeDriver: true }),
    ]).start();
  }, [opacity, translate]);
  return { opacity, transform: [{ translateY: translate }] };
}

function SectionHeader({ title, actionLabel, onAction }: { title: string; actionLabel?: string; onAction?: () => void }) {
  const { theme } = useTheme();
  return (
    <View style={styles.sectionHeader}>
      <Text style={{ color: theme.colors.textPrimary, fontSize: 18, fontWeight: "700", letterSpacing: -0.2 }}>
        {title}
      </Text>
      {actionLabel ? (
        <TouchableOpacity onPress={onAction} activeOpacity={0.7} testID={`section-action-${title.toLowerCase().replace(/\s+/g, "-")}`}>
          <Text style={{ color: theme.colors.primary, fontSize: 13, fontWeight: "600" }}>{actionLabel}</Text>
        </TouchableOpacity>
      ) : null}
    </View>
  );
}

export function DashboardPage() {
  const { theme, isDark } = useTheme();
  const router = useRouter();
  const enter = useEnter();

  const quickActions = useMemo<QuickAction[]>(
    () => [
      { id: "new", label: "New Project", icon: "add-circle", gradient: ["#7C5CFF", "#FF3B8B"], onPress: () => router.push("/editor/new") },
      { id: "ai", label: "AI Edit", icon: "sparkles", gradient: ["#FF3B8B", "#FFB43C"], onPress: () => router.push("/editor/new") },
      { id: "templates", label: "Templates", icon: "grid", gradient: ["#3CD09A", "#7C5CFF"], onPress: () => router.push("/(tabs)/templates") },
      { id: "import", label: "Import Media", icon: "cloud-upload", gradient: ["#FFB43C", "#FF5C5C"], onPress: () => router.push("/(tabs)/assets") },
    ],
    [router],
  );

  return (
    <SafeAreaView edges={["top"]} style={{ flex: 1, backgroundColor: theme.colors.background }} testID="dashboard-page">
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 120 }}>
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={{ color: theme.colors.textMuted, fontSize: 13, fontWeight: "500" }}>Welcome back</Text>
            <Text style={{ color: theme.colors.textPrimary, fontSize: 26, fontWeight: "800", letterSpacing: -0.4, marginTop: 2 }}>
              Let&apos;s create ✨
            </Text>
          </View>
          <View style={styles.headerActions}>
            <TouchableOpacity
              testID="dashboard-notifications-btn"
              onPress={() => router.push("/notifications")}
              activeOpacity={0.75}
              style={[styles.iconBtn, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}
            >
              <Ionicons name="notifications-outline" size={20} color={theme.colors.textPrimary} />
            </TouchableOpacity>
            <TouchableOpacity
              testID="dashboard-avatar-btn"
              onPress={() => router.push("/(tabs)/profile")}
              activeOpacity={0.75}
              style={[styles.avatar, { borderColor: theme.colors.border }]}
            >
              <LinearGradient colors={["#7C5CFF", "#FF3B8B"]} style={StyleSheet.absoluteFill} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} />
              <Text style={styles.avatarText}>E</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Hero AI card */}
        <Animated.View style={[styles.heroWrap, enter]}>
          <LinearGradient
            colors={isDark ? ["#221546", "#3A1A50"] : ["#EEE7FF", "#FFDDEA"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={[styles.hero, { borderRadius: theme.radius.lg }]}
          >
            <View style={styles.heroBadge}>
              <Ionicons name="sparkles" size={12} color="#fff" />
              <Text style={styles.heroBadgeText}>AI</Text>
            </View>
            <Text style={{ color: theme.colors.textPrimary, fontSize: 20, fontWeight: "800", marginTop: 12, letterSpacing: -0.3 }}>
              Auto-cut your next reel
            </Text>
            <Text style={{ color: theme.colors.textSecondary, fontSize: 13, marginTop: 6, lineHeight: 19 }}>
              Drop a clip, our AI trims silences, adds captions and beat-syncs music.
            </Text>
            <TouchableOpacity
              testID="hero-try-ai-btn"
              onPress={() => router.push("/editor/new")}
              activeOpacity={0.9}
              style={styles.heroCta}
            >
              <LinearGradient colors={["#7C5CFF", "#FF3B8B"]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.heroCtaGrad}>
                <Text style={styles.heroCtaText}>Try AI Edit</Text>
                <Ionicons name="arrow-forward" size={15} color="#fff" />
              </LinearGradient>
            </TouchableOpacity>
          </LinearGradient>
        </Animated.View>

        {/* Quick Actions */}
        <SectionHeader title="Quick Actions" />
        <QuickActionsRow actions={quickActions} />

        {/* Recent Projects */}
        <SectionHeader title="Recent Projects" actionLabel="See all" onAction={() => router.push("/(tabs)/projects")} />
        <RecentProjectsRail
          items={RECENT_PROJECTS}
          emptyLabel="No recent projects"
          onPressItem={(id) => router.push(`/editor/${id}`)}
        />

        {/* Drafts */}
        <SectionHeader title="Drafts" actionLabel="View all" onAction={() => router.push("/drafts")} />
        <RecentProjectsRail
          items={DRAFTS}
          emptyLabel="No drafts yet"
          onPressItem={(id) => router.push(`/editor/${id}`)}
        />

        {/* Recent Exports */}
        <SectionHeader title="Recent Exports" actionLabel="Library" onAction={() => router.push("/export-library")} />
        <RecentProjectsRail
          items={EXPORTS}
          emptyLabel="No exports yet"
          onPressItem={(id) => router.push(`/editor/${id}`)}
        />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  header: {
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 20,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  headerActions: { flexDirection: "row", alignItems: "center", gap: 10 },
  iconBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 1,
    overflow: "hidden",
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: { color: "#fff", fontWeight: "800", fontSize: 15 },
  heroWrap: { marginHorizontal: 20, marginBottom: 24 },
  hero: { padding: 20, overflow: "hidden" },
  heroBadge: {
    alignSelf: "flex-start",
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    backgroundColor: "rgba(255,59,139,0.9)",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
  },
  heroBadgeText: { color: "#fff", fontSize: 11, fontWeight: "700", letterSpacing: 0.4 },
  heroCta: { marginTop: 16, alignSelf: "flex-start", borderRadius: 999, overflow: "hidden" },
  heroCtaGrad: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  heroCtaText: { color: "#fff", fontSize: 14, fontWeight: "700" },
  sectionHeader: {
    paddingHorizontal: 20,
    marginTop: 6,
    marginBottom: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
});
