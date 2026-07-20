import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import React, { useEffect, useMemo, useRef, useState } from "react";
import { Animated, ScrollView, StyleSheet, Text, TouchableOpacity, View, Image, FlatList, Dimensions, Pressable } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { useTheme } from "@/src/theme";
import { QuickActionsRow, QuickAction } from "../components/QuickActionsRow";
import { ProjectRailItem, RecentProjectsRail } from "../components/RecentProjectsRail";

const { width } = Dimensions.get("window");

// --- MOCK DATA ---
const HERO_CARDS = [
  { id: "1", title: "Create amazing videos with AI", subtitle: "Generate, edit and enhance videos in seconds.", cta: "Start AI Editing", icon: "sparkles", type: "ai" },
  { id: "2", title: "Manual Editing Power", subtitle: "Full control over your timeline and effects.", cta: "New Project", icon: "cut", type: "manual" },
  { id: "3", title: "Trending Templates", subtitle: "Create viral content with one tap.", cta: "Browse", icon: "color-wand", type: "template" },
];

const RECENT_PROJECTS: ProjectRailItem[] = [
  { id: "1", title: "Summer Vlog", lastEditedLabel: "Edited 2h ago", duration: "1:24", resolution: "4K", frameRatio: "16:9", gradient: ["#1D2B64", "#3B6CE7"] },
  { id: "2", title: "Product Reel", lastEditedLabel: "Yesterday", duration: "0:38", resolution: "1080p", frameRatio: "9:16", gradient: ["#3B6CE7", "#8CC8E8"] },
  { id: "3", title: "Travel Cut", lastEditedLabel: "3 days ago", duration: "2:12", resolution: "4K", frameRatio: "16:9", gradient: ["#1D2B64", "#3B6CE7"] },
];

const DRAFTS: ProjectRailItem[] = [
  { id: "d1", title: "Untitled draft", lastEditedLabel: "Auto-saved 5m ago", duration: "0:12", resolution: "1080p", frameRatio: "9:16", gradient: ["#3B6CE7", "#8CC8E8"] },
  { id: "d2", title: "Cafe morning", lastEditedLabel: "Yesterday", duration: "0:44", resolution: "4K", frameRatio: "16:9", gradient: ["#1D2B64", "#3B6CE7"] },
];

const EXPORTS: ProjectRailItem[] = [
  { id: "e1", title: "Reel v3", lastEditedLabel: "Exported 1h ago", duration: "0:59", resolution: "1080p", frameRatio: "9:16", gradient: ["#3B6CE7", "#8CC8E8"] },
  { id: "e2", title: "Story v1", lastEditedLabel: "Exported today", duration: "0:15", resolution: "1080p", frameRatio: "9:16", gradient: ["#1D2B64", "#3B6CE7"] },
];

const STATS = [
  { label: "Projects", value: "24", icon: "folder-open" },
  { label: "Exports", value: "86", icon: "share" },
  { label: "Mins Saved", value: "120", icon: "time" },
  { label: "AI Credits", value: "450", icon: "planet" },
  { label: "Storage", value: "1.2GB", icon: "cloud" },
];

const RECENT_ASSETS = [
  { id: "1", title: "Lo-Fi Beats", type: "Music", icon: "musical-notes" },
  { id: "2", title: "Inter Tight", type: "Font", icon: "text" },
  { id: "3", title: "Glitch", type: "Effect", icon: "flash" },
  { id: "4", title: "Fade Black", type: "Transition", icon: "git-commit" },
];

const AI_TOOLS = [
  { id: "1", title: "AI Edit", desc: "Auto cut & sync", icon: "sparkles", colors: ["#1D2B64", "#3B6CE7"] },
  { id: "2", title: "Bg Remove", desc: "Magic eraser", icon: "person-remove", colors: ["#3B6CE7", "#8CC8E8"] },
  { id: "3", title: "Auto Caption", desc: "Speech to text", icon: "chatbubble-ellipses", colors: ["#1D2B64", "#3B6CE7"] },
  { id: "4", title: "AI Voice", desc: "Text to speech", icon: "mic", colors: ["#3B6CE7", "#8CC8E8"] },
];

const TEMPLATES = [
  { id: "1", title: "Vlog Style", duration: "0:15", category: "Trending", gradient: ["#1D2B64", "#3B6CE7"] },
  { id: "2", title: "Cinematic", duration: "0:30", category: "Travel", gradient: ["#3B6CE7", "#8CC8E8"] },
  { id: "3", title: "Fast Cuts", duration: "0:10", category: "TikTok", gradient: ["#1D2B64", "#3B6CE7"] },
];

const LEARNING = [
  { id: "1", title: "How to edit faster", type: "Tips" },
  { id: "2", title: "AI editing guide", type: "Tutorial" },
  { id: "3", title: "Keyboard shortcuts", type: "Guide" },
];

const ACTIVITIES = [
  { id: "1", action: "Export Completed", target: "Summer Vlog", time: "2h ago", icon: "checkmark-circle" },
  { id: "2", action: "Project Created", target: "Product Reel", time: "Yesterday", icon: "add-circle" },
  { id: "3", action: "AI Render Finished", target: "Travel Cut", time: "3 days ago", icon: "sparkles" },
];

// --- ANIMATION HOOK ---
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

// --- SUB-COMPONENTS ---
function SectionHeader({ title, actionLabel, onAction }: { title: string; actionLabel?: string; onAction?: () => void }) {
  const { theme } = useTheme();
  return (
    <View style={styles.sectionHeader}>
      <Text style={{ color: theme.colors.textPrimary, fontSize: 18, fontWeight: "800", letterSpacing: -0.5 }}>
        {title}
      </Text>
      {actionLabel ? (
        <TouchableOpacity onPress={onAction} activeOpacity={0.7}>
          <Text style={{ color: theme.colors.primary, fontSize: 13, fontWeight: "600" }}>{actionLabel}</Text>
        </TouchableOpacity>
      ) : null}
    </View>
  );
}

function HeroSlider({ theme, router }: { theme: any, router: any }) {
  const flatListRef = useRef<FlatList>(null);
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      let nextIndex = (currentIndex + 1) % HERO_CARDS.length;
      flatListRef.current?.scrollToIndex({ index: nextIndex, animated: true });
      setCurrentIndex(nextIndex);
    }, 4500);
    return () => clearInterval(timer);
  }, [currentIndex]);

  return (
    <View style={styles.heroWrap}>
      <FlatList
        ref={flatListRef}
        data={HERO_CARDS}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        scrollEventThrottle={16}
        onMomentumScrollEnd={(e) => {
          const index = Math.round(e.nativeEvent.contentOffset.x / width);
          setCurrentIndex(index);
        }}
        renderItem={({ item }) => (
          <View style={{ width }}>
            <View style={{ marginHorizontal: 20 }}>
              <LinearGradient
                colors={["#1D2B64", "#3B6CE7"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={[styles.hero, { borderRadius: theme.radius.xl }]}
              >
                <View style={styles.heroGlow} />
                <View style={styles.heroBadge}>
                  <Ionicons name={item.icon as any} size={12} color="#fff" />
                  <Text style={styles.heroBadgeText}>✨ AI Assistant</Text>
                </View>
                <Text style={{ color: "#fff", fontSize: 24, fontWeight: "800", marginTop: 16, letterSpacing: -0.5 }}>
                  {item.title}
                </Text>
                <Text style={{ color: "rgba(255,255,255,0.8)", fontSize: 14, marginTop: 8, lineHeight: 20, maxWidth: "80%" }}>
                  {item.subtitle}
                </Text>
                
                <View style={styles.heroActions}>
                  <TouchableOpacity
                    onPress={() => router.push(item.type === "template" ? "/(tabs)/templates" : "/editor/new")}
                    activeOpacity={0.9}
                  >
                    <LinearGradient colors={["#fff", "#f0f0f0"]} style={styles.heroCtaBtn}>
                      <Text style={{ color: "#1D2B64", fontSize: 14, fontWeight: "800" }}>{item.cta}</Text>
                    </LinearGradient>
                  </TouchableOpacity>
                  {item.type === "ai" && (
                    <TouchableOpacity style={styles.heroSecCtaBtn} onPress={() => router.push("/editor/new")}>
                      <Text style={{ color: "#fff", fontSize: 14, fontWeight: "600" }}>Import Video</Text>
                    </TouchableOpacity>
                  )}
                </View>
                
                {/* Abstract floaters */}
                <Ionicons name="play-circle" size={80} color="rgba(255,255,255,0.1)" style={styles.heroFloater} />
              </LinearGradient>
            </View>
          </View>
        )}
      />
      <View style={styles.pagination}>
        {HERO_CARDS.map((_, i) => (
          <View key={i} style={[styles.dot, currentIndex === i && styles.dotActive]} />
        ))}
      </View>
    </View>
  );
}

function QuickStatsRow({ theme }: { theme: any }) {
  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.statsScroll}>
      {STATS.map((stat, i) => (
        <View key={i} style={[styles.statCard, { backgroundColor: theme.colors.surfaceElevated, borderRadius: theme.radius.lg }]}>
          <Ionicons name={stat.icon as any} size={18} color={theme.colors.primary} style={{ marginBottom: 8 }} />
          <Text style={{ color: theme.colors.textPrimary, fontSize: 18, fontWeight: "800" }}>{stat.value}</Text>
          <Text style={{ color: theme.colors.textMuted, fontSize: 11, fontWeight: "500", marginTop: 2 }}>{stat.label}</Text>
        </View>
      ))}
    </ScrollView>
  );
}

function HorizontalAssets({ theme }: { theme: any }) {
  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 20, gap: 12 }}>
      {RECENT_ASSETS.map((asset) => (
        <View key={asset.id} style={[styles.assetCard, { backgroundColor: theme.colors.surfaceElevated, borderRadius: theme.radius.md }]}>
          <View style={[styles.assetIcon, { backgroundColor: theme.colors.primary + "15" }]}>
            <Ionicons name={asset.icon as any} size={16} color={theme.colors.primary} />
          </View>
          <View>
            <Text style={{ color: theme.colors.textPrimary, fontSize: 13, fontWeight: "700" }}>{asset.title}</Text>
            <Text style={{ color: theme.colors.textMuted, fontSize: 11, marginTop: 2 }}>{asset.type}</Text>
          </View>
        </View>
      ))}
    </ScrollView>
  );
}

function AIToolsRail({ theme, router }: { theme: any, router: any }) {
  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 20, gap: 12 }}>
      {AI_TOOLS.map((tool) => (
        <TouchableOpacity key={tool.id} activeOpacity={0.8} onPress={() => router.push("/editor/new")}>
          <View style={[styles.aiToolCard, { backgroundColor: theme.colors.surfaceElevated, borderRadius: theme.radius.lg }]}>
            <LinearGradient colors={tool.colors as [string, string]} style={styles.aiToolIconBox}>
              <Ionicons name={tool.icon as any} size={18} color="#fff" />
            </LinearGradient>
            <Text style={{ color: theme.colors.textPrimary, fontSize: 14, fontWeight: "700", marginTop: 12 }}>{tool.title}</Text>
            <Text style={{ color: theme.colors.textSecondary, fontSize: 11, marginTop: 4 }}>{tool.desc}</Text>
            <Ionicons name="arrow-forward" size={14} color={theme.colors.textMuted} style={{ position: "absolute", bottom: 16, right: 16 }} />
          </View>
        </TouchableOpacity>
      ))}
    </ScrollView>
  );
}

function TrendingTemplatesRail({ theme }: { theme: any }) {
  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 20, gap: 12 }}>
      {TEMPLATES.map((tpl) => (
        <View key={tpl.id} style={[styles.tplCard, { backgroundColor: theme.colors.surfaceElevated, borderRadius: theme.radius.lg }]}>
          <LinearGradient colors={tpl.gradient as [string, string]} style={styles.tplThumb}>
            <View style={styles.tplBadge}>
              <Text style={styles.tplBadgeText}>{tpl.duration}</Text>
            </View>
          </LinearGradient>
          <View style={styles.tplMeta}>
            <Text style={{ color: theme.colors.textPrimary, fontSize: 14, fontWeight: "700" }}>{tpl.title}</Text>
            <Text style={{ color: theme.colors.primary, fontSize: 11, fontWeight: "600", marginTop: 2 }}>{tpl.category}</Text>
            <TouchableOpacity style={[styles.tplUseBtn, { backgroundColor: theme.colors.primary + "15" }]}>
              <Text style={{ color: theme.colors.primary, fontSize: 12, fontWeight: "700" }}>Use Template</Text>
            </TouchableOpacity>
          </View>
        </View>
      ))}
    </ScrollView>
  );
}

function LearningSection({ theme }: { theme: any }) {
  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 20, gap: 12 }}>
      {LEARNING.map((learn) => (
        <View key={learn.id} style={[styles.learnCard, { backgroundColor: theme.colors.surfaceElevated, borderRadius: theme.radius.lg }]}>
          <Ionicons name="bulb" size={24} color="#FFB43C" style={{ marginBottom: 12 }} />
          <Text style={{ color: theme.colors.textPrimary, fontSize: 14, fontWeight: "700" }}>{learn.title}</Text>
          <Text style={{ color: theme.colors.textMuted, fontSize: 12, marginTop: 4 }}>{learn.type}</Text>
        </View>
      ))}
    </ScrollView>
  );
}

function StorageCard({ theme }: { theme: any }) {
  return (
    <View style={[styles.infoCard, { backgroundColor: theme.colors.surfaceElevated, borderRadius: theme.radius.lg }]}>
      <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
          <View style={[styles.infoIcon, { backgroundColor: theme.colors.primary + "15" }]}>
            <Ionicons name="cloud" size={20} color={theme.colors.primary} />
          </View>
          <View>
            <Text style={{ color: theme.colors.textPrimary, fontSize: 15, fontWeight: "700" }}>Cloud Storage</Text>
            <Text style={{ color: theme.colors.textMuted, fontSize: 12, marginTop: 2 }}>1.2 GB / 5.0 GB Used</Text>
          </View>
        </View>
        <TouchableOpacity>
          <Text style={{ color: theme.colors.primary, fontSize: 13, fontWeight: "600" }}>Manage</Text>
        </TouchableOpacity>
      </View>
      <View style={[styles.progressBarBg, { backgroundColor: theme.colors.border }]}>
        <LinearGradient colors={["#3B6CE7", "#8CC8E8"]} style={[styles.progressBarFill, { width: "24%" }]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} />
      </View>
    </View>
  );
}

function SubscriptionCard({ theme }: { theme: any }) {
  return (
    <LinearGradient colors={["#1D2B64", "#3B6CE7"]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={[styles.subCard, { borderRadius: theme.radius.xl }]}>
      <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
        <View>
          <Text style={{ color: "rgba(255,255,255,0.8)", fontSize: 13, fontWeight: "600" }}>Current Plan</Text>
          <Text style={{ color: "#fff", fontSize: 22, fontWeight: "800", marginTop: 4 }}>Pro Creator</Text>
        </View>
        <TouchableOpacity style={styles.upgradeBtn}>
          <Text style={{ color: "#1D2B64", fontSize: 13, fontWeight: "700" }}>Upgrade</Text>
        </TouchableOpacity>
      </View>
      <View style={styles.subBenefits}>
        <View style={styles.subBenefitItem}><Ionicons name="checkmark" size={14} color="#fff" /><Text style={styles.subBenefitText}>4K Export</Text></View>
        <View style={styles.subBenefitItem}><Ionicons name="checkmark" size={14} color="#fff" /><Text style={styles.subBenefitText}>Unlimited AI</Text></View>
        <View style={styles.subBenefitItem}><Ionicons name="checkmark" size={14} color="#fff" /><Text style={styles.subBenefitText}>Priority Queue</Text></View>
      </View>
    </LinearGradient>
  );
}

function ActivityList({ theme }: { theme: any }) {
  return (
    <View style={styles.activityList}>
      {ACTIVITIES.map((act) => (
        <View key={act.id} style={styles.activityItem}>
          <View style={[styles.actIcon, { backgroundColor: theme.colors.surfaceElevated }]}>
            <Ionicons name={act.icon as any} size={16} color={theme.colors.primary} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={{ color: theme.colors.textPrimary, fontSize: 14, fontWeight: "600" }}>{act.action}</Text>
            <Text style={{ color: theme.colors.textMuted, fontSize: 12, marginTop: 2 }}>{act.target}</Text>
          </View>
          <Text style={{ color: theme.colors.textMuted, fontSize: 12 }}>{act.time}</Text>
        </View>
      ))}
    </View>
  );
}

// --- MAIN DASHBOARD PAGE ---
export function DashboardPage() {
  const { theme } = useTheme();
  const router = useRouter();
  const enter = useEnter();

  const quickActions = useMemo<QuickAction[]>(
    () => [
      { id: "new", label: "New Project", subtitle: "Start from scratch", icon: "add", gradient: ["#1D2B64", "#3B6CE7"], onPress: () => router.push("/editor/new") },
      { id: "ai", label: "AI Edit", subtitle: "Auto generate", icon: "sparkles", gradient: ["#3B6CE7", "#8CC8E8"], onPress: () => router.push("/editor/new") },
      { id: "import", label: "Import Media", subtitle: "From camera roll", icon: "images", gradient: ["#1D2B64", "#3B6CE7"], onPress: () => router.push("/(tabs)/assets") },
      { id: "captions", label: "AI Captions", subtitle: "Speech to text", icon: "text", gradient: ["#3B6CE7", "#8CC8E8"], onPress: () => router.push("/editor/new") },
    ],
    [router],
  );

  return (
    <SafeAreaView edges={["top"]} style={{ flex: 1, backgroundColor: theme.colors.background }} testID="dashboard-page">
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 140 }}>
        
        {/* Header */}
        <View style={styles.header}>
          <View style={{ flex: 1, paddingRight: 16 }}>
            <Text style={{ color: "#1D2B64", fontSize: 28, fontWeight: "800", letterSpacing: -0.5, textAlign: "left" }}>
              Welcome back
            </Text>
            <Text numberOfLines={1} style={{ color: "#8E8E93", fontSize: 14, fontWeight: "500", marginTop: 4 }}>
              Let's create something amazing today ✨
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
              <View style={styles.notificationBadge} />
            </TouchableOpacity>
            <TouchableOpacity
              testID="dashboard-avatar-btn"
              onPress={() => router.push("/(tabs)/profile")}
              activeOpacity={0.75}
              style={[styles.avatar, { borderColor: theme.colors.border }]}
            >
              <Image source={{ uri: "https://i.pravatar.cc/150?u=veytrix_user" }} style={StyleSheet.absoluteFill} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Hero Carousel */}
        <Animated.View style={[enter]}>
          <HeroSlider theme={theme} router={router} />
        </Animated.View>

        {/* Quick Stats */}
        <Animated.View style={[enter]}>
          <QuickStatsRow theme={theme} />
        </Animated.View>

        {/* Quick Actions */}
        <Animated.View style={[enter]}>
          <SectionHeader title="Quick Actions" />
          <QuickActionsRow actions={quickActions} />
        </Animated.View>

        {/* AI Tools */}
        <SectionHeader title="AI Tools" actionLabel="Explore" />
        <AIToolsRail theme={theme} router={router} />

        {/* Recent Projects */}
        <SectionHeader title="Recent Projects" actionLabel="See all" onAction={() => router.push("/(tabs)/projects")} />
        <RecentProjectsRail items={RECENT_PROJECTS} emptyLabel="No recent projects" onPressItem={(id) => router.push(`/editor/${id}`)} />

        {/* Recently Used Assets */}
        <SectionHeader title="Recently Used Assets" actionLabel="View library" />
        <HorizontalAssets theme={theme} />

        {/* Trending Templates */}
        <SectionHeader title="Trending Templates" actionLabel="More" />
        <TrendingTemplatesRail theme={theme} />

        {/* Storage & Subscription */}
        <View style={{ paddingHorizontal: 20, gap: 16, marginTop: 24, marginBottom: 24 }}>
          <StorageCard theme={theme} />
          <SubscriptionCard theme={theme} />
        </View>

        {/* Learning Section */}
        <SectionHeader title="Tips & Tutorials" actionLabel="Academy" />
        <LearningSection theme={theme} />

        {/* Recent Activity */}
        <SectionHeader title="Recent Activity" />
        <ActivityList theme={theme} />

        {/* Extra spacing for drafts/exports just to keep them available as requested, but placed lower */}
        <SectionHeader title="Drafts" actionLabel="View all" onAction={() => router.push("/projects/drafts")} />
        <RecentProjectsRail items={DRAFTS} emptyLabel="No drafts yet" onPressItem={(id) => router.push(`/editor/${id}`)} />

        <SectionHeader title="Recent Exports" actionLabel="Library" onAction={() => router.push("/projects/export-library")} />
        <RecentProjectsRail items={EXPORTS} emptyLabel="No exports yet" onPressItem={(id) => router.push(`/editor/${id}`)} />

      </ScrollView>
      
      
    </SafeAreaView>
  );
}

// --- STYLES ---
const styles = StyleSheet.create({
  header: {
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 24,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  headerActions: { flexDirection: "row", alignItems: "center", gap: 12 },
  iconBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#fff",
    shadowColor: "#8CC8E8",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 3,
  },
  notificationBadge: {
    position: "absolute",
    top: 10,
    right: 12,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#FF3B8B",
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 2,
    overflow: "hidden",
  },
  heroWrap: { marginBottom: 24 },
  hero: { 
    padding: 24, 
    overflow: "hidden",
    shadowColor: "#3B6CE7",
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 10,
    minHeight: 220,
  },
  heroGlow: {
    position: "absolute",
    width: 300,
    height: 300,
    borderRadius: 150,
    backgroundColor: "rgba(255,255,255,0.15)",
    top: -100,
    right: -100,
  },
  heroBadge: {
    alignSelf: "flex-start",
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.25)",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
  },
  heroBadgeText: { color: "#fff", fontSize: 12, fontWeight: "700", marginLeft: 6 },
  heroActions: { flexDirection: "row", alignItems: "center", gap: 12, marginTop: 24 },
  heroCtaBtn: { paddingHorizontal: 20, paddingVertical: 12, borderRadius: 999 },
  heroSecCtaBtn: { paddingHorizontal: 16, paddingVertical: 12 },
  heroFloater: { position: "absolute", bottom: -20, right: -10, transform: [{ rotate: "-15deg" }] },
  pagination: { flexDirection: "row", justifyContent: "center", gap: 6, marginTop: 16 },
  dot: { width: 6, height: 6, borderRadius: 3, backgroundColor: "rgba(140,200,232,0.4)" },
  dotActive: { width: 16, backgroundColor: "#3B6CE7" },
  statsScroll: { paddingHorizontal: 20, gap: 12, marginBottom: 24 },
  statCard: {
    width: 100,
    padding: 16,
    shadowColor: "#8CC8E8",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 2,
  },
  sectionHeader: {
    paddingHorizontal: 20,
    marginTop: 12,
    marginBottom: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  assetCard: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    paddingRight: 24,
    gap: 12,
    shadowColor: "#8CC8E8",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 2,
    marginBottom: 8,
  },
  assetIcon: { width: 36, height: 36, borderRadius: 10, justifyContent: "center", alignItems: "center" },
  aiToolCard: {
    width: 140,
    padding: 16,
    paddingBottom: 20,
    shadowColor: "#8CC8E8",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 3,
    marginBottom: 8,
  },
  aiToolIconBox: { width: 40, height: 40, borderRadius: 12, justifyContent: "center", alignItems: "center" },
  tplCard: { width: 160, overflow: "hidden", marginBottom: 8, shadowColor: "#8CC8E8", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.15, shadowRadius: 8, elevation: 3 },
  tplThumb: { height: 100, padding: 8, justifyContent: "flex-end" },
  tplBadge: { alignSelf: "flex-start", backgroundColor: "rgba(0,0,0,0.5)", paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4 },
  tplBadgeText: { color: "#fff", fontSize: 10, fontWeight: "700" },
  tplMeta: { padding: 12 },
  tplUseBtn: { marginTop: 10, paddingVertical: 6, borderRadius: 6, alignItems: "center" },
  learnCard: { width: 150, padding: 16, marginBottom: 8, shadowColor: "#8CC8E8", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.1, shadowRadius: 6, elevation: 2 },
  infoCard: { padding: 16, shadowColor: "#8CC8E8", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.1, shadowRadius: 6, elevation: 2 },
  infoIcon: { width: 40, height: 40, borderRadius: 12, justifyContent: "center", alignItems: "center" },
  progressBarBg: { height: 6, borderRadius: 3, marginTop: 16, overflow: "hidden" },
  progressBarFill: { height: "100%", borderRadius: 3 },
  subCard: { padding: 20, shadowColor: "#3B6CE7", shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.3, shadowRadius: 16, elevation: 8 },
  upgradeBtn: { backgroundColor: "#fff", paddingHorizontal: 16, paddingVertical: 8, borderRadius: 999 },
  subBenefits: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginTop: 24 },
  subBenefitItem: { flexDirection: "row", alignItems: "center", gap: 6 },
  subBenefitText: { color: "#fff", fontSize: 12, fontWeight: "600" },
  activityList: { paddingHorizontal: 20, gap: 16, marginBottom: 24 },
  activityItem: { flexDirection: "row", alignItems: "center", gap: 12 },
  actIcon: { width: 40, height: 40, borderRadius: 20, justifyContent: "center", alignItems: "center", shadowColor: "#8CC8E8", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4, elevation: 1 },
  floatingCreateBtn: { position: "absolute", bottom: 20, alignSelf: "center", shadowColor: "#3B6CE7", shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.4, shadowRadius: 16, elevation: 12 },
  floatingBtnGrad: { width: 64, height: 64, borderRadius: 32, justifyContent: "center", alignItems: "center" }
});
