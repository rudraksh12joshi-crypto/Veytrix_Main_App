import React, { useEffect, useState, useRef } from "react";
import { View, Text, StyleSheet, Animated } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter, useLocalSearchParams } from "expo-router";
import { useTheme } from "@/src/theme";

const STATUS_MESSAGES = [
  "Uploading media...",
  "Understanding your prompt...",
  "Preparing your editing workspace...",
  "Building timeline...",
  "Almost ready..."
];

export default function AIProcessingPage() {
  const { theme } = useTheme();
  const router = useRouter();
  const { videoUri, duration } = useLocalSearchParams<{videoUri?: string, duration?: string}>();
  
  const [statusIndex, setStatusIndex] = useState(0);
  
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const progressAnim = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    // Pulse animation for the central icon
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.2,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    ).start();

    // Progress bar animation
    Animated.timing(progressAnim, {
      toValue: 100,
      duration: 5000, // Total processing time (mock)
      useNativeDriver: false,
    }).start();

    // Change status messages every 1 second
    const interval = setInterval(() => {
      setStatusIndex((prev) => {
        if (prev < STATUS_MESSAGES.length - 1) {
          // Fade out text, change text, fade in text
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
    }, 1000);

    // Navigate to editor after 5.5 seconds
    const timeout = setTimeout(() => {
      router.replace({
        pathname: "/editor/new",
        params: { videoUri, duration }
      });
    }, 5500);

    return () => {
      clearInterval(interval);
      clearTimeout(timeout);
    };
  }, [pulseAnim, progressAnim, fadeAnim, router]);

  const progressWidth = progressAnim.interpolate({
    inputRange: [0, 100],
    outputRange: ["0%", "100%"],
  });

  return (
    <SafeAreaView edges={["top", "bottom"]} style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={styles.content}>
        <Animated.View style={[styles.iconContainer, { transform: [{ scale: pulseAnim }] }]}>
          <LinearGradient colors={["#8B6BFF", "#FF3B8B"]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.iconBg}>
            <Ionicons name="sparkles" size={56} color="#fff" />
          </LinearGradient>
        </Animated.View>

        <Animated.Text style={[styles.statusText, { color: theme.colors.textPrimary, opacity: fadeAnim }]}>
          {STATUS_MESSAGES[statusIndex]}
        </Animated.Text>

        <View style={[styles.progressTrack, { backgroundColor: theme.colors.surfaceElevated }]}>
          <Animated.View style={[styles.progressFill, { width: progressWidth }]}>
            <LinearGradient
              colors={["#8B6BFF", "#FF3B8B"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={StyleSheet.absoluteFill}
            />
          </Animated.View>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 40,
  },
  iconContainer: {
    marginBottom: 40,
    shadowColor: "#8B6BFF",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.5,
    shadowRadius: 30,
    elevation: 20,
  },
  iconBg: {
    width: 120,
    height: 120,
    borderRadius: 60,
    alignItems: "center",
    justifyContent: "center",
  },
  statusText: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 32,
    textAlign: "center",
  },
  progressTrack: {
    width: "100%",
    height: 6,
    borderRadius: 3,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
  },
});
