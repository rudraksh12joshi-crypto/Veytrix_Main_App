import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import React, { useEffect, useRef } from "react";
import { Animated, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { useTheme } from "@/src/theme";

const FEATURES: { icon: keyof typeof Ionicons.glyphMap; label: string }[] = [
  { icon: "sparkles", label: "AI Assisted Editing" },
  { icon: "layers", label: "Professional Timeline" },
  { icon: "cut", label: "Trim & Split" },
  { icon: "color-filter", label: "Filters & Effects" },
  { icon: "text", label: "Text & Titles" },
  { icon: "musical-notes", label: "Music & Audio" },
  { icon: "cloud-upload", label: "High Quality Export" },
];

export function AIManualEditIntroPage() {
  const { theme, isDark } = useTheme();
  const router = useRouter();

  const opacity = useRef(new Animated.Value(0)).current;
  const translate = useRef(new Animated.Value(14)).current;
  const btnScale = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(opacity, { toValue: 1, duration: 320, useNativeDriver: true }),
      Animated.timing(translate, { toValue: 0, duration: 320, useNativeDriver: true }),
    ]).start();
  }, [opacity, translate]);

  const startEditing = () => router.push("/ai-manual-edit/upload");

  return (
    <SafeAreaView edges={["top", "bottom"]} style={{ flex: 1, backgroundColor: theme.colors.background }} testID="ai-manual-edit-page">
      {/* Top bar */}
      <View style={styles.topBar}>
        <Pressable
          testID="ai-manual-edit-back"
          onPress={() => router.back()}
          hitSlop={12}
          style={[styles.backBtn, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}
        >
          <Ionicons name="chevron-back" size={20} color={theme.colors.textPrimary} />
        </Pressable>
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* Hero illustration */}
        <Animated.View style={[styles.heroWrap, { opacity, transform: [{ translateY: translate }] }]}>
          <LinearGradient
            colors={isDark ? ["#1D2B64", "#3B6CE7"] : ["#3B6CE7", "#8CC8E8"]}
            style={styles.heroBg}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <LinearGradient colors={["#1D2B64", "#3B6CE7"]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.heroIcon}>
              <Ionicons name="sparkles" size={56} color="#fff" />
            </LinearGradient>
            <View style={[styles.floatChip, styles.chipTL, { backgroundColor: theme.colors.surfaceElevated, borderColor: theme.colors.border }]}>
              <Ionicons name="cut" size={13} color={theme.colors.primary} />
              <Text style={[styles.chipText, { color: theme.colors.textPrimary }]}>Trim</Text>
            </View>
            <View style={[styles.floatChip, styles.chipBR, { backgroundColor: theme.colors.surfaceElevated, borderColor: theme.colors.border }]}>
              <Ionicons name="musical-notes" size={13} color="#3B6CE7" />
              <Text style={[styles.chipText, { color: theme.colors.textPrimary }]}>Beat sync</Text>
            </View>
            <View style={[styles.floatChip, styles.chipBL, { backgroundColor: theme.colors.surfaceElevated, borderColor: theme.colors.border }]}>
              <Ionicons name="text" size={13} color="#8CC8E8" />
              <Text style={[styles.chipText, { color: theme.colors.textPrimary }]}>Captions</Text>
            </View>
          </LinearGradient>
        </Animated.View>

        {/* Title + subtitle */}
        <View style={styles.titleBlock}>
          <Text style={[styles.title, { color: theme.colors.textPrimary }]}>AI Manual Edit</Text>
          <Text style={[styles.subtitle, { color: theme.colors.textSecondary }]}>
            Create professional videos using powerful AI-assisted editing tools.
          </Text>
        </View>

        {/* Features */}
        <View style={styles.features}>
          {FEATURES.map((f) => (
            <View
              key={f.label}
              testID={`feature-${f.label.toLowerCase().replace(/\s|&/g, "-")}`}
              style={[styles.featureRow, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border, borderRadius: theme.radius.md }]}
            >
              <View style={styles.featureIconWrap}>
                <LinearGradient colors={["#1D2B64", "#3B6CE7"]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.featureIconBg}>
                  <Ionicons name="checkmark" size={14} color="#fff" />
                </LinearGradient>
              </View>
              <Ionicons name={f.icon} size={18} color={theme.colors.textSecondary} style={{ marginRight: 10 }} />
              <Text style={[styles.featureLabel, { color: theme.colors.textPrimary }]}>{f.label}</Text>
            </View>
          ))}
        </View>

        {/* Info card */}
        <LinearGradient
          colors={isDark ? ["#E6F2F8", "#FFFFFF"] : ["#E6F2F8", "#FFFFFF"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={[styles.infoCard, { borderRadius: theme.radius.lg, borderColor: theme.colors.border }]}
        >
          <View style={styles.infoHeader}>
            <LinearGradient colors={["#1D2B64", "#3B6CE7"]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.infoBadge}>
              <Ionicons name="flash" size={14} color="#fff" />
            </LinearGradient>
            <Text style={[styles.infoTitle, { color: theme.colors.textPrimary }]}>Pro-grade editor</Text>
          </View>
          <Text style={[styles.infoBody, { color: theme.colors.textSecondary }]}>
            A frame-accurate multitrack timeline with drag-to-trim clips, keyframes, color grading, transitions, text
            titles, sound design and one-tap AI suggestions — everything you need to publish reels, ads and shorts in
            minutes.
          </Text>
        </LinearGradient>
      </ScrollView>

      {/* Primary CTA */}
      <View style={[styles.ctaBar, { backgroundColor: theme.colors.background, borderTopColor: theme.colors.border }]}>
        <Pressable
          testID="start-editing-btn"
          accessibilityRole="button"
          accessibilityLabel="Start Editing"
          onPress={startEditing}
          onPressIn={() =>
            Animated.spring(btnScale, { toValue: 0.97, useNativeDriver: true, speed: 40, bounciness: 6 }).start()
          }
          onPressOut={() =>
            Animated.spring(btnScale, { toValue: 1, useNativeDriver: true, speed: 30, bounciness: 8 }).start()
          }
        >
          <Animated.View style={{ transform: [{ scale: btnScale }] }}>
            <LinearGradient
              colors={["#1D2B64", "#3B6CE7"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.ctaBtn}
            >
              <Text style={styles.ctaText}>Start Editing</Text>
              <Ionicons name="arrow-forward" size={18} color="#fff" />
            </LinearGradient>
          </Animated.View>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  topBar: { paddingHorizontal: 20, paddingTop: 8, paddingBottom: 8 },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
  },
  scroll: { paddingBottom: 24 },

  heroWrap: { marginHorizontal: 20, marginTop: 4 },
  heroBg: {
    height: 220,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },
  heroIcon: {
    width: 108,
    height: 108,
    borderRadius: 54,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#8CC8E8",
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.4,
    shadowRadius: 20,
    elevation: 10,
  },
  floatChip: {
    position: "absolute",
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    borderWidth: 1,
  },
  chipTL: { top: 22, left: 20 },
  chipBR: { bottom: 26, right: 20 },
  chipBL: { bottom: 30, left: 22 },
  chipText: { fontSize: 11, fontWeight: "600" },

  titleBlock: { paddingHorizontal: 24, marginTop: 24, alignItems: "center" },
  title: { fontSize: 28, fontWeight: "800", letterSpacing: -0.5, textAlign: "center" },
  subtitle: { fontSize: 14, marginTop: 8, textAlign: "center", lineHeight: 20 },

  features: { paddingHorizontal: 20, marginTop: 24, gap: 8 },
  featureRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderWidth: 1,
  },
  featureIconWrap: { marginRight: 12 },
  featureIconBg: {
    width: 22,
    height: 22,
    borderRadius: 11,
    alignItems: "center",
    justifyContent: "center",
  },
  featureLabel: { fontSize: 14, fontWeight: "600", flex: 1 },

  infoCard: {
    marginHorizontal: 20,
    marginTop: 20,
    padding: 18,
    borderWidth: 1,
  },
  infoHeader: { flexDirection: "row", alignItems: "center", gap: 10 },
  infoBadge: {
    width: 28,
    height: 28,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  infoTitle: { fontSize: 15, fontWeight: "700" },
  infoBody: { fontSize: 13, lineHeight: 20, marginTop: 10 },

  ctaBar: {
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 12,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  ctaBtn: {
    height: 56,
    borderRadius: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    shadowColor: "#8CC8E8",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.35,
    shadowRadius: 18,
    elevation: 10,
  },
  ctaText: { color: "#fff", fontSize: 16, fontWeight: "700", letterSpacing: 0.2 },
});
