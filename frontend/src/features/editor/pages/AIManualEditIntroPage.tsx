import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import React, { useEffect, useRef } from "react";
import {
  Animated,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
  Easing,
  Dimensions,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { useTheme } from "@/src/theme";

const { width } = Dimensions.get("window");

const ORBITING_ICONS: { icon: keyof typeof Ionicons.glyphMap; label: string }[] = [
  { icon: "cut-outline", label: "Trim" },
  { icon: "musical-notes-outline", label: "Music" },
  { icon: "text-outline", label: "Text" },
  { icon: "color-filter-outline", label: "Filters" },
  { icon: "chatbubble-ellipses-outline", label: "Captions" },
  { icon: "git-compare-outline", label: "Transitions" },
  { icon: "speedometer-outline", label: "Speed" },
];

const FEATURES = [
  { icon: "cut-outline" as const, title: "Trim & Split", desc: "Cut clips with frame-level precision." },
  { icon: "sparkles-outline" as const, title: "AI Effects", desc: "Apply smart transitions and filters." },
  { icon: "color-filter-outline" as const, title: "Color Grading", desc: "Enhance tones and visual depth." },
  { icon: "text-outline" as const, title: "Text & Captions", desc: "Generate subtitles instantly." },
  { icon: "musical-notes-outline" as const, title: "Audio Editing", desc: "Mix soundtracks and adjust levels." },
  { icon: "speedometer-outline" as const, title: "Speed Control", desc: "Create time-lapses or slow-mos." },
  { icon: "git-compare-outline" as const, title: "Transitions", desc: "Connect scenes with cinematic flow." },
  { icon: "cloud-upload-outline" as const, title: "Export", desc: "Render in high-definition formats." },
];

const CREATION_CARDS = [
  { icon: "phone-portrait-outline" as const, category: "Instagram Reels", color: "#FF3B30" },
  { icon: "logo-youtube" as const, category: "YouTube Shorts", color: "#FF0000" },
  { icon: "airplane-outline" as const, category: "Travel Videos", color: "#3B6CE7" },
  { icon: "game-controller-outline" as const, category: "Gaming", color: "#4CAF50" },
  { icon: "business-outline" as const, category: "Business Ads", color: "#FF9500" },
  { icon: "cart-outline" as const, category: "Product Videos", color: "#8E8E93" },
  { icon: "heart-outline" as const, category: "Wedding Films", color: "#AF52DE" },
  { icon: "videocam-outline" as const, category: "Vlogs", color: "#5856D6" },
];

const QUALITY_HIGHLIGHTS = [
  { icon: "flash-outline" as const, title: "Fast Processing" },
  { icon: "layers-outline" as const, title: "Professional Timeline" },
  { icon: "sparkles-outline" as const, title: "AI Assisted" },
  { icon: "cloud-upload-outline" as const, title: "High Quality Export" },
];

export function AIManualEditIntroPage() {
  const { theme, isDark } = useTheme();
  const router = useRouter();

  // Animations
  const orbitAnim = useRef(new Animated.Value(0)).current;
  const floatAnim = useRef(new Animated.Value(0)).current;
  const arrowTranslateX = useRef(new Animated.Value(0)).current;
  const opacity = useRef(new Animated.Value(0)).current;
  const translate = useRef(new Animated.Value(14)).current;
  const btnScale = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    // 1. Entry animations
    Animated.parallel([
      Animated.timing(opacity, { toValue: 1, duration: 400, useNativeDriver: true }),
      Animated.timing(translate, { toValue: 0, duration: 400, useNativeDriver: true }),
    ]).start();

    // 2. Loop orbit animation (12 seconds per orbit)
    Animated.loop(
      Animated.timing(orbitAnim, {
        toValue: 1,
        duration: 15000,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    ).start();

    // 3. Central AI icon float animation
    Animated.loop(
      Animated.sequence([
        Animated.timing(floatAnim, {
          toValue: -6,
          duration: 2000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(floatAnim, {
          toValue: 6,
          duration: 2000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(floatAnim, {
          toValue: 0,
          duration: 2000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    ).start();

    // 4. Arrow nudge loop
    Animated.loop(
      Animated.sequence([
        Animated.timing(arrowTranslateX, {
          toValue: 5,
          duration: 850,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(arrowTranslateX, {
          toValue: 0,
          duration: 850,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

  const startEditing = () => router.push("/ai-manual-edit/upload");

  // Circular Interpolation Helper for Orbiting Items
  const keyframes = Array.from({ length: 17 }, (_, i) => i / 16);
  const getOrbitStyle = (index: number, total: number, rx: number, ry: number) => {
    const phase = (index / total) * 2 * Math.PI;
    const xOutputs = keyframes.map((k) => rx * Math.cos(k * 2 * Math.PI + phase));
    const yOutputs = keyframes.map((k) => ry * Math.sin(k * 2 * Math.PI + phase));

    const tx = orbitAnim.interpolate({
      inputRange: keyframes,
      outputRange: xOutputs,
    });
    const ty = orbitAnim.interpolate({
      inputRange: keyframes,
      outputRange: yOutputs,
    });

    return {
      transform: [{ translateX: tx }, { translateY: ty }],
    };
  };

  return (
    <SafeAreaView edges={["top", "bottom"]} style={[styles.container, { backgroundColor: theme.colors.background }]} testID="ai-manual-edit-page">
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
        <Animated.View style={{ opacity, transform: [{ translateY: translate }] }}>
          
          {/* New Hero Section */}
          <View style={styles.heroContainer}>
            <LinearGradient
              colors={isDark ? ["#1D2B64", "#3B6CE7"] : ["#E6F2F8", "#FFFFFF"]}
              style={[styles.heroCard, { borderColor: theme.colors.border }]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              {/* Floating backdrop shapes */}
              <View style={styles.backdropCircle1} />
              <View style={styles.backdropCircle2} />

              <View style={styles.orbitArea}>
                {/* Orbiting Icons */}
                {ORBITING_ICONS.map((item, idx) => (
                  <Animated.View
                    key={idx}
                    style={[
                      styles.orbitIconWrap,
                      { backgroundColor: theme.colors.surface, borderColor: theme.colors.border },
                      getOrbitStyle(idx, ORBITING_ICONS.length, 100, 60),
                    ]}
                  >
                    <Ionicons name={item.icon} size={16} color="#3B6CE7" />
                  </Animated.View>
                ))}

                {/* Central AI Icon */}
                <Animated.View style={[styles.heroIcon, { transform: [{ translateY: floatAnim }] }]}>
                  <LinearGradient
                    colors={["#1D2B64", "#3B6CE7"]}
                    style={styles.heroIconGrad}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                  >
                    <Ionicons name="sparkles" size={48} color="#fff" />
                  </LinearGradient>
                </Animated.View>
              </View>

              <Text style={[styles.heroTitle, { color: theme.colors.textPrimary }]}>AI Manual Edit</Text>
              <Text style={[styles.heroSubtitle, { color: theme.colors.textSecondary }]}>
                Professional timeline editing powered by intelligent AI assistance.
              </Text>

              {/* Three premium badges */}
              <View style={styles.badgeRow}>
                <View style={[styles.badgeCard, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}>
                  <Text style={[styles.badgeText, { color: theme.colors.textPrimary }]}>⚡ AI Powered</Text>
                </View>
                <View style={[styles.badgeCard, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}>
                  <Text style={[styles.badgeText, { color: theme.colors.textPrimary }]}>🎬 Timeline Editing</Text>
                </View>
                <View style={[styles.badgeCard, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}>
                  <Text style={[styles.badgeText, { color: theme.colors.textPrimary }]}>🚀 4K Export</Text>
                </View>
              </View>
            </LinearGradient>
          </View>

          {/* Feature Grid */}
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionHeadingTitle, { color: theme.colors.textPrimary }]}>Powerful Features</Text>
            <Text style={[styles.sectionHeadingSubtitle, { color: theme.colors.textSecondary }]}>Everything you need to create stellar videos</Text>
          </View>

          <View style={styles.featureGrid}>
            {FEATURES.map((item, idx) => {
              const cardScale = new Animated.Value(1);
              const handlePressIn = () => {
                Animated.spring(cardScale, { toValue: 0.95, useNativeDriver: true }).start();
              };
              const handlePressOut = () => {
                Animated.spring(cardScale, { toValue: 1, friction: 5, useNativeDriver: true }).start();
              };

              return (
                <Pressable
                  key={idx}
                  onPressIn={handlePressIn}
                  onPressOut={handlePressOut}
                  style={styles.gridPressable}
                >
                  <Animated.View
                    style={[
                      styles.featureCard,
                      {
                        transform: [{ scale: cardScale }],
                        backgroundColor: theme.colors.surface,
                        borderColor: theme.colors.border,
                      },
                    ]}
                  >
                    <View style={[styles.featureIconBg, { backgroundColor: "#E6F2F8" }]}>
                      <Ionicons name={item.icon} size={20} color="#3B6CE7" />
                    </View>
                    <Text style={[styles.featureCardTitle, { color: theme.colors.textPrimary }]} numberOfLines={1}>
                      {item.title}
                    </Text>
                    <Text style={[styles.featureCardDesc, { color: theme.colors.textSecondary }]} numberOfLines={2}>
                      {item.desc}
                    </Text>
                  </Animated.View>
                </Pressable>
              );
            })}
          </View>

          {/* AI Assistant Section */}
          <View style={styles.aiAssistantContainer}>
            <View style={[styles.aiAssistantCard, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}>
              <View style={styles.aiAssistantContent}>
                <View style={styles.aiAssistantHeaderRow}>
                  <Text style={styles.aiAssistantEmoji}>🤖</Text>
                  <Text style={[styles.aiAssistantTitle, { color: theme.colors.textPrimary }]}>AI Editing Assistant</Text>
                </View>
                <Text style={[styles.aiAssistantDesc, { color: theme.colors.textSecondary }]}>
                  Describe your edit in plain English and AI will automatically perform multiple editing actions.
                </Text>
              </View>
              <View style={styles.aiAssistantIllustration}>
                <LinearGradient
                  colors={["#3B6CE7", "#8CC8E8"]}
                  style={styles.illCircle}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                >
                  <Ionicons name="sparkles" size={24} color="#fff" />
                </LinearGradient>
              </View>
            </View>
          </View>

          {/* Workflow Timeline */}
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionHeadingTitle, { color: theme.colors.textPrimary }]}>How it Works</Text>
            <Text style={[styles.sectionHeadingSubtitle, { color: theme.colors.textSecondary }]}>Simple five-step process</Text>
          </View>

          <View style={styles.workflowContainer}>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.workflowScroll}>
              {[
                { step: "①", title: "Import" },
                { step: "②", title: "Describe" },
                { step: "③", title: "AI Process" },
                { step: "④", title: "Fine Tune" },
                { step: "⑤", title: "Export" },
              ].map((item, idx, arr) => (
                <React.Fragment key={idx}>
                  <View style={[styles.workflowStepCard, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}>
                    <Text style={styles.workflowStepNumber}>{item.step}</Text>
                    <Text style={[styles.workflowStepTitle, { color: theme.colors.textPrimary }]}>{item.title}</Text>
                  </View>
                  {idx < arr.length - 1 && (
                    <View style={styles.workflowConnector}>
                      <Ionicons name="arrow-forward-outline" size={16} color="#3B6CE7" />
                    </View>
                  )}
                </React.Fragment>
              ))}
            </ScrollView>
          </View>

          {/* What You Can Create */}
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionHeadingTitle, { color: theme.colors.textPrimary }]}>What You Can Create</Text>
            <Text style={[styles.sectionHeadingSubtitle, { color: theme.colors.textSecondary }]}>Infinite possibilities tailored to any platform</Text>
          </View>

          <View style={styles.carouselContainer}>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.carouselScroll}>
              {CREATION_CARDS.map((card, idx) => (
                <View key={idx} style={[styles.creationCard, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}>
                  <View style={[styles.creationIconContainer, { backgroundColor: `${card.color}15` }]}>
                    <Ionicons name={card.icon} size={22} color={card.color} />
                  </View>
                  <Text style={[styles.creationCategoryText, { color: theme.colors.textPrimary }]}>{card.category}</Text>
                  <LinearGradient
                    colors={["rgba(255,255,255,0.05)", "rgba(59,108,231,0.08)"]}
                    style={styles.creationPreviewIll}
                  />
                </View>
              ))}
            </ScrollView>
          </View>

          {/* Quality Highlights */}
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionHeadingTitle, { color: theme.colors.textPrimary }]}>Quality Highlights</Text>
            <Text style={[styles.sectionHeadingSubtitle, { color: theme.colors.textSecondary }]}>Built for professionals, simplified for everyone</Text>
          </View>

          <View style={styles.highlightsGrid}>
            {QUALITY_HIGHLIGHTS.map((item, idx) => (
              <View key={idx} style={[styles.highlightCard, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}>
                <Ionicons name={item.icon} size={20} color="#3B6CE7" style={styles.highlightCardIcon} />
                <Text style={[styles.highlightCardTitle, { color: theme.colors.textPrimary }]}>{item.title}</Text>
              </View>
            ))}
          </View>

        </Animated.View>
      </ScrollView>

      {/* Primary CTA (Start Editing Button) */}
      <View style={[styles.ctaBar, { backgroundColor: theme.colors.background, borderTopColor: theme.colors.border }]}>
        <Pressable
          testID="start-editing-btn"
          accessibilityRole="button"
          accessibilityLabel="Start Editing"
          onPress={startEditing}
          onPressIn={() =>
            Animated.spring(btnScale, { toValue: 0.95, useNativeDriver: true, speed: 40, bounciness: 6 }).start()
          }
          onPressOut={() =>
            Animated.spring(btnScale, { toValue: 1, useNativeDriver: true, speed: 30, bounciness: 8 }).start()
          }
        >
          <Animated.View style={{ transform: [{ scale: btnScale }] }}>
            <LinearGradient
              colors={["#3B6CE7", "#8CC8E8"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.ctaBtn}
            >
              <Text style={styles.ctaText}>Start Editing</Text>
              <Animated.View style={{ transform: [{ translateX: arrowTranslateX }] }}>
                <Ionicons name="arrow-forward" size={18} color="#fff" />
              </Animated.View>
            </LinearGradient>
          </Animated.View>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  topBar: {
    paddingHorizontal: 24,
    paddingTop: 12,
    paddingBottom: 8,
  },
  backBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    shadowColor: "rgba(59, 108, 231, 0.12)",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.5,
    shadowRadius: 8,
    elevation: 3,
  },
  scroll: {
    paddingBottom: 40,
  },
  heroContainer: {
    paddingHorizontal: 24,
    marginTop: 8,
    marginBottom: 28,
  },
  heroCard: {
    borderRadius: 32,
    padding: 28,
    alignItems: "center",
    borderWidth: 1,
    overflow: "hidden",
    position: "relative",
    shadowColor: "rgba(59, 108, 231, 0.15)",
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.08,
    shadowRadius: 24,
    elevation: 5,
  },
  backdropCircle1: {
    position: "absolute",
    width: 160,
    height: 160,
    borderRadius: 80,
    backgroundColor: "rgba(140, 200, 232, 0.15)",
    top: -40,
    left: -40,
  },
  backdropCircle2: {
    position: "absolute",
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: "rgba(59, 108, 231, 0.06)",
    bottom: -60,
    right: -60,
  },
  orbitArea: {
    width: 220,
    height: 150,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
    position: "relative",
  },
  orbitIconWrap: {
    position: "absolute",
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    shadowColor: "rgba(59, 108, 231, 0.1)",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 2,
  },
  heroIcon: {
    position: "absolute",
    width: 90,
    height: 90,
    borderRadius: 45,
    shadowColor: "#3B6CE7",
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.25,
    shadowRadius: 20,
    elevation: 6,
  },
  heroIconGrad: {
    width: "100%",
    height: "100%",
    borderRadius: 45,
    alignItems: "center",
    justifyContent: "center",
  },
  heroTitle: {
    fontSize: 28,
    fontWeight: "800",
    letterSpacing: -0.5,
    textAlign: "center",
    marginBottom: 8,
  },
  heroSubtitle: {
    fontSize: 14,
    lineHeight: 20,
    textAlign: "center",
    paddingHorizontal: 12,
    marginBottom: 20,
  },
  badgeRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    gap: 8,
  },
  badgeCard: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 10,
    borderWidth: 1,
    shadowColor: "rgba(59, 108, 231, 0.05)",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 1,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: "700",
  },
  sectionHeader: {
    paddingHorizontal: 24,
    marginBottom: 16,
  },
  sectionHeadingTitle: {
    fontSize: 20,
    fontWeight: "800",
    letterSpacing: -0.2,
  },
  sectionHeadingSubtitle: {
    fontSize: 13,
    marginTop: 2,
  },
  featureGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    paddingHorizontal: 24,
    justifyContent: "space-between",
    rowGap: 16,
    marginBottom: 28,
  },
  gridPressable: {
    width: "48%",
  },
  featureCard: {
    borderRadius: 22,
    padding: 16,
    borderWidth: 1,
    minHeight: 132,
    shadowColor: "rgba(59, 108, 231, 0.06)",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 2,
  },
  featureIconBg: {
    width: 36,
    height: 36,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
  },
  featureCardTitle: {
    fontSize: 14,
    fontWeight: "700",
    marginBottom: 4,
  },
  featureCardDesc: {
    fontSize: 12,
    lineHeight: 16,
  },
  aiAssistantContainer: {
    paddingHorizontal: 24,
    marginBottom: 28,
  },
  aiAssistantCard: {
    borderRadius: 24,
    padding: 20,
    borderWidth: 1,
    flexDirection: "row",
    alignItems: "center",
    shadowColor: "rgba(59, 108, 231, 0.06)",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 2,
  },
  aiAssistantContent: {
    flex: 1,
    paddingRight: 16,
  },
  aiAssistantHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 6,
  },
  aiAssistantEmoji: {
    fontSize: 18,
  },
  aiAssistantTitle: {
    fontSize: 16,
    fontWeight: "800",
  },
  aiAssistantDesc: {
    fontSize: 12,
    lineHeight: 18,
  },
  aiAssistantIllustration: {
    width: 56,
    height: 56,
    alignItems: "center",
    justifyContent: "center",
  },
  illCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#3B6CE7",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 4,
  },
  workflowContainer: {
    marginBottom: 28,
  },
  workflowScroll: {
    paddingHorizontal: 24,
    alignItems: "center",
    gap: 12,
  },
  workflowStepCard: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 14,
    borderWidth: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    shadowColor: "rgba(59, 108, 231, 0.04)",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 1,
  },
  workflowStepNumber: {
    fontSize: 14,
    fontWeight: "700",
    color: "#3B6CE7",
  },
  workflowStepTitle: {
    fontSize: 13,
    fontWeight: "600",
  },
  workflowConnector: {
    alignItems: "center",
    justifyContent: "center",
    width: 24,
  },
  carouselContainer: {
    marginBottom: 28,
  },
  carouselScroll: {
    paddingHorizontal: 24,
    gap: 16,
  },
  creationCard: {
    width: 140,
    borderRadius: 20,
    borderWidth: 1,
    padding: 16,
    alignItems: "center",
    shadowColor: "rgba(59, 108, 231, 0.05)",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 2,
  },
  creationIconContainer: {
    width: 44,
    height: 44,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
  },
  creationCategoryText: {
    fontSize: 12,
    fontWeight: "700",
    textAlign: "center",
    marginBottom: 12,
  },
  creationPreviewIll: {
    width: "100%",
    height: 48,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "rgba(59, 108, 231, 0.08)",
  },
  highlightsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    paddingHorizontal: 24,
    justifyContent: "space-between",
    rowGap: 12,
  },
  highlightCard: {
    width: "48%",
    borderRadius: 16,
    borderWidth: 1,
    padding: 14,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    shadowColor: "rgba(59, 108, 231, 0.04)",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 1,
  },
  highlightCardIcon: {
    width: 20,
  },
  highlightCardTitle: {
    fontSize: 11,
    fontWeight: "700",
    flex: 1,
  },
  ctaBar: {
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 20,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  ctaBtn: {
    height: 60,
    borderRadius: 24,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    shadowColor: "rgba(59, 108, 231, 0.25)",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 4,
  },
  ctaText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "700",
    letterSpacing: 0.2,
  },
});
