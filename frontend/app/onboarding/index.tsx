import React, { useRef, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  FlatList,
  TouchableOpacity,
  StatusBar,
  Animated,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useTheme } from "@/src/theme";

const { width, height } = Dimensions.get("window");

// --- Illustrations ---

const FloatingIcon = ({ name, color, size, style }: any) => {
  return (
    <View style={[styles.floatingIcon, style]}>
      <Ionicons name={name} size={size} color={color} />
    </View>
  );
};

const Screen1Illustration = () => (
  <View style={styles.illustrationContainer}>
    <LinearGradient colors={["#2C1A5C", "#0A0A0B"]} style={styles.illustrationCard}>
      <FloatingIcon name="sparkles" size={48} color="#B0A0FF" style={{ top: 20, right: 30 }} />
      <FloatingIcon name="film" size={64} color="#7C5CFF" style={{ alignSelf: 'center', marginTop: 80 }} />
      <FloatingIcon name="color-palette" size={32} color="#FF3B8B" style={{ bottom: 30, left: 30 }} />
    </LinearGradient>
  </View>
);

const Screen2Illustration = () => (
  <View style={styles.illustrationContainer}>
    <LinearGradient colors={["#4A154B", "#0A0A0B"]} style={styles.illustrationCard}>
      <FloatingIcon name="flash" size={64} color="#FF3B8B" style={{ alignSelf: 'center', marginTop: 70 }} />
      <View style={styles.fakeClipRow}>
        <View style={[styles.fakeClip, { width: 100, backgroundColor: "#FF3B8B" }]} />
        <View style={[styles.fakeClip, { width: 60, backgroundColor: "#3CD09A" }]} />
      </View>
    </LinearGradient>
  </View>
);

const Screen3Illustration = () => (
  <View style={styles.illustrationContainer}>
    <LinearGradient colors={["#1A3C40", "#0A0A0B"]} style={styles.illustrationCard}>
      <View style={styles.timelineWrapper}>
        <View style={styles.timelinePlayhead} />
        <View style={[styles.timelineTrack, { marginTop: 40 }]}>
           <View style={[styles.timelineClip, { width: 140, backgroundColor: "#7C5CFF", left: 10 }]} />
        </View>
        <View style={styles.timelineTrack}>
           <View style={[styles.timelineClip, { width: 90, backgroundColor: "#FF3B8B", left: 60 }]} />
        </View>
        <View style={styles.timelineTrack}>
           <View style={[styles.timelineClip, { width: 180, backgroundColor: "#3CD09A", left: 30 }]} />
        </View>
      </View>
    </LinearGradient>
  </View>
);

const Screen4Illustration = () => null; // 4th screen focuses on features

// --- Data ---

const SCREENS = [
  {
    key: "1",
    title: "Welcome to Veytrix",
    subtitle: "Your AI-powered creative studio for professional video editing.",
    illustration: Screen1Illustration,
  },
  {
    key: "2",
    title: "Edit Smarter",
    subtitle: "Use AI-assisted editing to create amazing videos faster while keeping full creative control.",
    illustration: Screen2Illustration,
  },
  {
    key: "3",
    title: "Professional Timeline",
    subtitle: "Trim, split, arrange and perfect every frame with an intuitive timeline editor.",
    illustration: Screen3Illustration,
  },
  {
    key: "4",
    title: "Ready to Create?",
    subtitle: "Everything you need to create professional videos in one powerful editor.",
    features: [
      "AI Manual Edit",
      "Timeline Editing",
      "Effects & Filters",
      "Text & Titles",
      "Music & Audio",
      "High Quality Export",
    ],
  },
];

export default function OnboardingScreen() {
  const { theme } = useTheme();
  const [currentIndex, setCurrentIndex] = useState(0);
  const scrollX = useRef(new Animated.Value(0)).current;
  const flatListRef = useRef<FlatList>(null);

  const viewableItemsChanged = useRef(({ viewableItems }: any) => {
    if (viewableItems[0]) {
      setCurrentIndex(viewableItems[0].index);
    }
  }).current;

  const viewConfig = useRef({ viewAreaCoveragePercentThreshold: 50 }).current;

  const handleNext = () => {
    if (currentIndex < SCREENS.length - 1) {
      flatListRef.current?.scrollToIndex({ index: currentIndex + 1 });
    } else {
      handleGetStarted();
    }
  };

  const handleSkip = () => {
    handleGetStarted();
  };

  const handleGetStarted = () => {
    router.replace("/(auth)");
  };

  const renderItem = ({ item, index }: any) => {
    return (
      <View style={[styles.screen, { width }]}>
        {item.illustration && <item.illustration />}
        
        <View style={styles.textContainer}>
          <Text style={[styles.title, { color: theme.colors.textPrimary }]}>{item.title}</Text>
          <Text style={[styles.subtitle, { color: theme.colors.textSecondary }]}>{item.subtitle}</Text>
          
          {item.features && (
            <View style={styles.featuresContainer}>
              {item.features.map((feature: string, idx: number) => (
                <View key={idx} style={styles.featureItem}>
                  <View style={[styles.checkCircle, { backgroundColor: theme.colors.success + '20' }]}>
                    <Ionicons name="checkmark" size={14} color={theme.colors.success} />
                  </View>
                  <Text style={[styles.featureText, { color: theme.colors.textPrimary }]}>{feature}</Text>
                </View>
              ))}
            </View>
          )}
        </View>

        {index === SCREENS.length - 1 && (
          <TouchableOpacity
            style={[styles.largeButton, { backgroundColor: theme.colors.primary }]}
            onPress={handleGetStarted}
            activeOpacity={0.8}
          >
            <Text style={styles.largeButtonText}>Get Started</Text>
            <Ionicons name="arrow-forward" size={20} color="#fff" />
          </TouchableOpacity>
        )}
      </View>
    );
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <StatusBar barStyle="light-content" />
      
      {/* Top Bar with Skip */}
      <View style={styles.header}>
        {currentIndex < SCREENS.length - 1 ? (
          <TouchableOpacity onPress={handleSkip}>
            <Text style={[styles.skipText, { color: theme.colors.textMuted }]}>Skip</Text>
          </TouchableOpacity>
        ) : (
          <View /> // Placeholder
        )}
      </View>

      <Animated.FlatList
        ref={flatListRef}
        data={SCREENS}
        renderItem={renderItem}
        horizontal
        showsHorizontalScrollIndicator={false}
        pagingEnabled
        bounces={false}
        keyExtractor={(item) => item.key}
        onScroll={Animated.event([{ nativeEvent: { contentOffset: { x: scrollX } } }], {
          useNativeDriver: false,
        })}
        onViewableItemsChanged={viewableItemsChanged}
        viewabilityConfig={viewConfig}
        scrollEventThrottle={32}
      />

      {/* Footer Navigation */}
      <View style={styles.footer}>
        <View style={styles.paginator}>
          {SCREENS.map((_, i) => {
            const inputRange = [(i - 1) * width, i * width, (i + 1) * width];
            
            const dotWidth = scrollX.interpolate({
              inputRange,
              outputRange: [8, 24, 8],
              extrapolate: "clamp",
            });
            
            const opacity = scrollX.interpolate({
              inputRange,
              outputRange: [0.3, 1, 0.3],
              extrapolate: "clamp",
            });

            return (
              <Animated.View
                key={i.toString()}
                style={[
                  styles.dot,
                  { width: dotWidth, opacity, backgroundColor: theme.colors.primary },
                ]}
              />
            );
          })}
        </View>
        
        {currentIndex < SCREENS.length - 1 && (
          <TouchableOpacity 
            style={[styles.nextButton, { backgroundColor: theme.colors.surfaceElevated }]} 
            onPress={handleNext}
          >
            <Ionicons name="chevron-forward" size={24} color={theme.colors.textPrimary} />
          </TouchableOpacity>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    justifyContent: "flex-end",
    paddingHorizontal: 24,
    paddingTop: 16,
    height: 60,
  },
  skipText: {
    fontSize: 16,
    fontWeight: "500",
  },
  screen: {
    flex: 1,
    alignItems: "center",
    paddingHorizontal: 24,
    paddingTop: 20,
  },
  textContainer: {
    flex: 1,
    alignItems: "center",
    marginTop: 32,
    width: "100%",
  },
  title: {
    fontSize: 32,
    fontWeight: "800",
    marginBottom: 16,
    textAlign: "center",
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 16,
    fontWeight: "400",
    textAlign: "center",
    lineHeight: 24,
    maxWidth: "90%",
  },
  featuresContainer: {
    marginTop: 40,
    width: "100%",
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  featureItem: {
    flexDirection: "row",
    alignItems: "center",
    width: "48%",
    marginBottom: 20,
  },
  checkCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 10,
  },
  featureText: {
    fontSize: 14,
    fontWeight: "500",
  },
  illustrationContainer: {
    width: "100%",
    height: height * 0.4,
    justifyContent: "center",
    alignItems: "center",
  },
  illustrationCard: {
    width: "100%",
    height: "100%",
    borderRadius: 32,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.05)",
  },
  floatingIcon: {
    position: "absolute",
  },
  fakeClipRow: {
    flexDirection: "row",
    position: "absolute",
    bottom: 50,
    left: 20,
    gap: 10,
  },
  fakeClip: {
    height: 40,
    borderRadius: 8,
    opacity: 0.8,
  },
  timelineWrapper: {
    flex: 1,
    padding: 20,
    paddingTop: 40,
  },
  timelineTrack: {
    height: 40,
    backgroundColor: "rgba(255,255,255,0.05)",
    borderRadius: 8,
    marginBottom: 12,
    overflow: "hidden",
  },
  timelineClip: {
    height: "100%",
    borderRadius: 6,
  },
  timelinePlayhead: {
    position: "absolute",
    top: 20,
    bottom: 20,
    left: 100,
    width: 2,
    backgroundColor: "#FF3B8B",
    zIndex: 10,
  },
  footer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 24,
    paddingBottom: 40,
    paddingTop: 20,
    height: 100,
  },
  paginator: {
    flexDirection: "row",
    alignItems: "center",
  },
  dot: {
    height: 8,
    borderRadius: 4,
    marginHorizontal: 4,
  },
  nextButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: "center",
    alignItems: "center",
  },
  largeButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    width: "100%",
    height: 60,
    borderRadius: 30,
    marginTop: "auto",
    marginBottom: 40,
  },
  largeButtonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "700",
    marginRight: 10,
  },
});
