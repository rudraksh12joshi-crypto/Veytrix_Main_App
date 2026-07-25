import React, { useEffect, useState, useRef } from "react";
import { View, Text, StyleSheet, Animated, Easing, Dimensions } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter, useLocalSearchParams } from "expo-router";
import { BlurView } from "expo-blur";

const { width, height } = Dimensions.get("window");

const SUBTITLES = [
  "Loading media...",
  "Creating timeline...",
  "Generating previews...",
  "Preparing editor...",
  "Optimizing playback...",
  "Almost ready..."
];

const LOADING_STEPS = [
  "Loading Assets",
  "Initializing Timeline",
  "Generating Waveforms",
  "Preparing Editor",
  "Finalizing Workspace"
];

// BRAND COLOURS
// Deep Navy: #1D2B64
// Royal Blue: #3B6CE7
// Sky Blue: #8CC8E8
// Ice Blue: #E6F2F8

export default function AIProcessingPage() {
  const router = useRouter();
  const { videosData, videoUri, duration } = useLocalSearchParams<{videosData?: string, videoUri?: string, duration?: string}>();
  
  const [subtitleIndex, setSubtitleIndex] = useState(0);
  const [completedSteps, setCompletedSteps] = useState<number>(0);
  
  // Animations
  const rotateAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const progressAnim = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(1)).current;
  const containerOpacity = useRef(new Animated.Value(1)).current;
  const pulseActiveAnim = useRef(new Animated.Value(0.5)).current;

  // Background particle animations
  const particle1Y = useRef(new Animated.Value(0)).current;
  const particle2Y = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // 1. Logo Rotation
    Animated.loop(
      Animated.timing(rotateAnim, {
        toValue: 1,
        duration: 5000,
        easing: Easing.inOut(Easing.linear),
        useNativeDriver: true,
      })
    ).start();

    // 2. Breathing Scale for logo
    Animated.loop(
      Animated.sequence([
        Animated.timing(scaleAnim, {
          toValue: 1.08,
          duration: 2000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnim, {
          toValue: 1,
          duration: 2000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    ).start();

    // Pulsing animation for active step dot
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseActiveAnim, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(pulseActiveAnim, {
          toValue: 0.5,
          duration: 800,
          useNativeDriver: true,
        }),
      ])
    ).start();

    // 3. Progress Bar Animation
    Animated.timing(progressAnim, {
      toValue: 100,
      duration: 7500, 
      easing: Easing.linear,
      useNativeDriver: false,
    }).start();

    // Subtitle transitions every 1.5 seconds
    const subtitleInterval = setInterval(() => {
      setSubtitleIndex((prev) => {
        if (prev < SUBTITLES.length - 1) {
          fadeAnim.setValue(0);
          Animated.timing(fadeAnim, {
            toValue: 1,
            duration: 300,
            useNativeDriver: true,
          }).start();
          return prev + 1;
        }
        return prev;
      });
    }, 1500);

    // Steps checklist updates (approx every 1.5s)
    const stepInterval = setInterval(() => {
      setCompletedSteps((prev) => (prev < LOADING_STEPS.length ? prev + 1 : prev));
    }, 1500);

    // Subtle particles floating
    Animated.loop(
      Animated.sequence([
        Animated.timing(particle1Y, { toValue: -20, duration: 3000, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
        Animated.timing(particle1Y, { toValue: 0, duration: 3000, easing: Easing.inOut(Easing.ease), useNativeDriver: true })
      ])
    ).start();
    Animated.loop(
      Animated.sequence([
        Animated.timing(particle2Y, { toValue: 20, duration: 4000, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
        Animated.timing(particle2Y, { toValue: 0, duration: 4000, easing: Easing.inOut(Easing.ease), useNativeDriver: true })
      ])
    ).start();

    // 4. Transition out
    const transitionTimeout = setTimeout(() => {
      // Glow intensifies slightly as progress completes
      Animated.timing(scaleAnim, {
        toValue: 1.15,
        duration: 250,
        useNativeDriver: true,
      }).start();

      Animated.timing(containerOpacity, {
        toValue: 0,
        duration: 250,
        useNativeDriver: true,
        delay: 200,
      }).start(() => {
        setTimeout(() => {
          router.replace({
            pathname: "/editor/new" as any,
            params: { videosData, videoUri, duration }
          });
        }, 50); // slight delay to ensure unmount happens smoothly
      });
    }, 7500);

    return () => {
      clearInterval(subtitleInterval);
      clearInterval(stepInterval);
      clearTimeout(transitionTimeout);
    };
  }, []);

  const spin = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "360deg"],
  });

  const progressWidth = progressAnim.interpolate({
    inputRange: [0, 100],
    outputRange: ["0%", "100%"],
  });

  return (
    <Animated.View style={[styles.container, { opacity: containerOpacity }]}>
      {/* Base Background: Deep Navy #1D2B64 */}
      
      {/* Background radial glows and subtle elements */}
      <View style={styles.radialGlowTop} />
      <View style={styles.radialGlowBottom} />
      
      {/* Particles */}
      <Animated.View style={[styles.particle, { top: "30%", left: "20%", transform: [{ translateY: particle1Y }] }]} />
      <Animated.View style={[styles.particle, { top: "70%", right: "25%", transform: [{ translateY: particle2Y }] }]} />
      <Animated.View style={[styles.particle, { top: "50%", left: "80%", width: 3, height: 3, transform: [{ translateY: particle1Y }] }]} />

      <SafeAreaView style={styles.safeArea}>
        <View style={styles.content}>
          {/* Logo */}
          <Animated.View 
            style={[
              styles.logoContainer, 
              { transform: [{ scale: scaleAnim }, { rotate: spin }] }
            ]}
          >
            <BlurView intensity={24} tint="light" style={StyleSheet.absoluteFill} />
            <Ionicons name="sparkles" size={42} color="#fff" />
          </Animated.View>

          {/* Texts */}
          <Text style={styles.titleText}>Preparing your editing workspace</Text>
          <Animated.Text style={[styles.subtitleText, { opacity: fadeAnim }]}>
            {SUBTITLES[subtitleIndex]}
          </Animated.Text>

          {/* Progress Bar */}
          <View style={styles.progressBarContainer}>
            <Animated.View style={[styles.progressBarFill, { width: progressWidth }]}>
              <LinearGradient
                colors={["#1D2B64", "#3B6CE7", "#8CC8E8"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={StyleSheet.absoluteFill}
              />
            </Animated.View>
          </View>

          {/* Loading Steps */}
          <View style={styles.stepsContainer}>
            {LOADING_STEPS.map((step, index) => {
              const isCompleted = index < completedSteps;
              const isActive = index === completedSteps;
              return (
                <View key={step} style={styles.stepRow}>
                  <View style={[
                    styles.stepIconBox, 
                    isCompleted && styles.stepIconBoxCompleted,
                    isActive && styles.stepIconBoxActive
                  ]}>
                    {isCompleted ? (
                      <Ionicons name="checkmark" size={12} color="#fff" />
                    ) : isActive ? (
                      <Animated.View style={[styles.stepActiveDot, { opacity: pulseActiveAnim }]} />
                    ) : null}
                  </View>
                  <Text style={[
                    styles.stepText, 
                    isCompleted ? styles.stepTextCompleted : isActive ? styles.stepTextActive : styles.stepTextPending
                  ]}>
                    {step}
                  </Text>
                </View>
              );
            })}
          </View>

        </View>
      </SafeAreaView>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#1D2B64", // Deep Navy
  },
  radialGlowTop: {
    position: "absolute",
    top: -height * 0.2,
    right: -width * 0.2,
    width: width * 0.8,
    height: width * 0.8,
    borderRadius: width * 0.4,
    backgroundColor: "#3B6CE7", // Royal Blue
    opacity: 0.1,
  },
  radialGlowBottom: {
    position: "absolute",
    bottom: -height * 0.1,
    left: -width * 0.2,
    width: width * 0.9,
    height: width * 0.9,
    borderRadius: width * 0.45,
    backgroundColor: "#8CC8E8", // Sky Blue
    opacity: 0.1,
  },
  particle: {
    position: "absolute",
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: "rgba(140, 200, 232, 0.4)", // Sky Blue particles
    shadowColor: "#8CC8E8",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 6,
  },
  safeArea: {
    flex: 1,
  },
  content: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 40,
  },
  logoContainer: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: "rgba(255,255,255,0.08)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.10)",
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
    marginBottom: 40,
    shadowColor: "#3B6CE7", // Royal Blue outer glow
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 24,
    elevation: 12,
  },
  titleText: {
    fontFamily: "Inter",
    fontWeight: "700",
    fontSize: 28,
    color: "#E6F2F8", // Ice Blue
    textAlign: "center",
    marginBottom: 12,
  },
  subtitleText: {
    fontFamily: "Inter",
    fontSize: 16,
    color: "#8CC8E8", // Sky Blue
    textAlign: "center",
    marginBottom: 48,
  },
  progressBarContainer: {
    width: 240,
    height: 6,
    borderRadius: 999,
    backgroundColor: "rgba(255,255,255,0.10)",
    overflow: "hidden",
    marginBottom: 40,
  },
  progressBarFill: {
    height: "100%",
    borderRadius: 999,
  },
  stepsContainer: {
    width: 240,
    gap: 16,
  },
  stepRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  stepIconBox: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.2)",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
    backgroundColor: "transparent",
  },
  stepIconBoxCompleted: {
    backgroundColor: "#3B6CE7", // Royal Blue
    borderColor: "#3B6CE7",
  },
  stepIconBoxActive: {
    borderColor: "#3B6CE7", // Royal Blue glow ring
    shadowColor: "#3B6CE7",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 6,
    elevation: 4,
  },
  stepActiveDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#8CC8E8", // Sky Blue
  },
  stepText: {
    fontFamily: "Inter",
    fontSize: 14,
    fontWeight: "500",
  },
  stepTextCompleted: {
    color: "#E6F2F8", // Ice Blue
  },
  stepTextActive: {
    color: "#E6F2F8", // Ice Blue
  },
  stepTextPending: {
    color: "#E6F2F8", // Ice Blue
    opacity: 0.6,
  },
});
