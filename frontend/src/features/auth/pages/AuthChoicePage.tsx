import React, { useRef, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  StatusBar,
  Image,
  ActivityIndicator,
  Animated,
  Pressable
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

import { useTheme } from "@/src/theme";
import { useAuthStore } from "@/src/store/auth.store";
import { LegalModal } from "@/src/components/LegalModal";

const AnimatedPressable = ({ onPress, disabled, style, children, activeScale = 0.98 }: any) => {
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    if (disabled) return;
    Animated.timing(scaleAnim, {
      toValue: activeScale,
      duration: 150,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    Animated.timing(scaleAnim, {
      toValue: 1,
      duration: 150,
      useNativeDriver: true,
    }).start();
  };

  return (
    <Pressable
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      disabled={disabled}
    >
      <Animated.View style={[style, { transform: [{ scale: scaleAnim }] }]}>
        {children}
      </Animated.View>
    </Pressable>
  );
};

export function AuthChoicePage() {
  const { theme } = useTheme();
  const router = useRouter();
  const { setStatus, setUser } = useAuthStore();
  const [loadingProvider, setLoadingProvider] = React.useState<"google" | "apple" | null>(null);
  
  // Legal Modal State
  const [modalType, setModalType] = useState<"terms" | "privacy" | null>(null);

  const handleSocialLogin = (provider: "google" | "apple") => {
    setLoadingProvider(provider);
    
    setTimeout(() => {
      setLoadingProvider(null);
      setUser({
        id: "usr_" + Math.random().toString(36).substr(2, 9),
        email: `test@${provider}.com`,
        displayName: "Test User",
        role: "free",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
      setStatus("authenticated");
    }, 1500);
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      
      {/* Subtle background gradient approximation */}
      <View style={styles.backgroundGlowTop} />
      <View style={styles.backgroundGlowBottom} />

      <View style={styles.content}>
        
        {/* Brand Header */}
        <View style={styles.header}>
          <Image
            source={require("@/assets/images/image.png")}
            style={styles.logo}
            resizeMode="cover"
          />
          <Text style={styles.title}>
            Welcome to Veytrix
          </Text>
          <Text style={styles.subtitle}>
            Create. Edit. Transform with AI.
          </Text>
          <Text style={styles.subtext}>
            Professional video editing powered by intelligent tools.
          </Text>
        </View>

        {/* Decorative Editor Visual */}
        <View style={styles.editorPreview}>
          <View style={styles.previewHeader}>
            <Ionicons name="play" size={12} color="#9CA3AF" />
            <Text style={styles.previewTitle}>Video Preview</Text>
            <View style={styles.aiBadge}>
              <Ionicons name="sparkles" size={10} color="#3B6CE7" />
              <Text style={styles.aiBadgeText}>AI Powered Editing</Text>
            </View>
          </View>
          <View style={styles.previewTrack}>
            <View style={styles.playhead} />
            <View style={styles.trackContent} />
          </View>
          <View style={styles.previewWaveform}>
            <View style={styles.playhead} />
            {Array.from({ length: 15 }).map((_, i) => (
              <View 
                key={i} 
                style={[
                  styles.waveBar, 
                  { height: 4 + Math.random() * 12, opacity: 0.5 + Math.random() * 0.5 }
                ]} 
              />
            ))}
          </View>
        </View>

        {/* Authentication Card */}
        <View style={styles.card}>
          
          <AnimatedPressable
            style={[styles.socialButton, styles.googleButton]}
            onPress={() => handleSocialLogin("google")}
            disabled={loadingProvider !== null}
          >
            {loadingProvider === "google" ? (
              <ActivityIndicator color="#1D2B64" />
            ) : (
              <>
                <Ionicons name="logo-google" size={20} color="#1D2B64" style={styles.btnIcon} />
                <Text style={styles.googleButtonText}>Continue with Google</Text>
              </>
            )}
          </AnimatedPressable>

          <AnimatedPressable
            style={[styles.socialButton, styles.appleButton]}
            onPress={() => handleSocialLogin("apple")}
            disabled={loadingProvider !== null}
          >
            {loadingProvider === "apple" ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <>
                <Ionicons name="logo-apple" size={20} color="#FFFFFF" style={styles.btnIcon} />
                <Text style={styles.appleButtonText}>Continue with Apple</Text>
              </>
            )}
          </AnimatedPressable>

          {/* Divider */}
          <View style={styles.dividerRow}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>OR</Text>
            <View style={styles.dividerLine} />
          </View>

          {/* Email Actions */}
          <AnimatedPressable
            style={[styles.primaryButton, styles.signInButton]}
            onPress={() => router.push("/(auth)/login")}
          >
            <Text style={styles.signInButtonText}>Sign In</Text>
          </AnimatedPressable>

          <Text style={styles.newToText}>New to Veytrix?</Text>
          
          <AnimatedPressable
            style={[styles.primaryButton, styles.createAccountButton]}
            onPress={() => router.push("/(auth)/register")}
          >
            <Text style={styles.createAccountButtonText}>Create Account</Text>
          </AnimatedPressable>

        </View>

        {/* Terms */}
        <View style={styles.footer}>
          <Text style={styles.termsText}>
            By continuing, you agree to our{" "}
            <Text 
              style={styles.termsLink} 
              onPress={() => setModalType("terms")}
              suppressHighlighting={true}
            >
              Terms of Service
            </Text>
            {" "}and{" "}
            <Text 
              style={styles.termsLink} 
              onPress={() => setModalType("privacy")}
              suppressHighlighting={true}
            >
              Privacy Policy
            </Text>.
          </Text>
        </View>

      </View>

      <LegalModal 
        visible={modalType !== null}
        type={modalType}
        onClose={() => setModalType(null)}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F3F8FC", // requested light background
  },
  backgroundGlowTop: {
    position: "absolute",
    top: -150,
    left: "-20%",
    width: "140%",
    height: 500,
    backgroundColor: "#3B6CE7",
    opacity: 0.03,
    borderRadius: 300,
  },
  backgroundGlowBottom: {
    position: "absolute",
    bottom: -150,
    right: "-20%",
    width: "140%",
    height: 400,
    backgroundColor: "#7C5CFF", // violet tint
    opacity: 0.03,
    borderRadius: 300,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 16,
    alignItems: "center",
  },
  header: {
    alignItems: "center",
    marginBottom: 20,
  },
  logo: {
    width: 64,
    height: 64,
    borderRadius: 16,
    marginBottom: 12,
    shadowColor: "#1D2B64",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
  },
  title: {
    fontSize: 24,
    fontWeight: "800",
    marginBottom: 4,
    letterSpacing: -0.5,
    color: "#1D2B64",
  },
  subtitle: {
    fontSize: 16,
    fontWeight: "600",
    textAlign: "center",
    color: "#1D2B64",
    marginBottom: 4,
  },
  subtext: {
    fontSize: 13,
    fontWeight: "400",
    textAlign: "center",
    color: "#6B7280",
    paddingHorizontal: 20,
  },
  
  // Editor Preview Styles
  editorPreview: {
    width: "100%",
    maxWidth: 400,
    height: 100,
    backgroundColor: "rgba(255, 255, 255, 0.4)",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.8)",
    padding: 12,
    marginBottom: 24,
  },
  previewHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  previewTitle: {
    fontSize: 12,
    fontWeight: "600",
    color: "#9CA3AF",
    marginLeft: 6,
    flex: 1,
  },
  aiBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(59, 108, 231, 0.1)",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  aiBadgeText: {
    fontSize: 10,
    fontWeight: "700",
    color: "#3B6CE7",
    marginLeft: 4,
  },
  previewTrack: {
    height: 20,
    backgroundColor: "rgba(29, 43, 100, 0.05)",
    borderRadius: 4,
    marginBottom: 8,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 4,
  },
  trackContent: {
    flex: 1,
    height: 12,
    backgroundColor: "rgba(59, 108, 231, 0.2)",
    borderRadius: 2,
    marginLeft: 20,
    marginRight: 40,
  },
  previewWaveform: {
    height: 20,
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
    paddingHorizontal: 24,
  },
  waveBar: {
    width: 3,
    backgroundColor: "#7C5CFF",
    borderRadius: 2,
  },
  playhead: {
    position: "absolute",
    left: "30%",
    top: -4,
    bottom: -4,
    width: 2,
    backgroundColor: "#E11D48",
    zIndex: 2,
  },

  // Auth Card
  card: {
    width: "100%",
    maxWidth: 400,
    backgroundColor: "rgba(255, 255, 255, 0.8)", // semi-transparent white
    borderRadius: 28,
    padding: 24,
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.03,
    shadowRadius: 24,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.5)",
  },
  socialButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    height: 52, // slightly more compact
    borderRadius: 16,
    marginBottom: 12,
  },
  googleButton: {
    backgroundColor: "#FFFFFF",
    borderColor: "#E5E7EB",
    borderWidth: 1,
  },
  googleButtonText: {
    fontSize: 15,
    fontWeight: "600",
    color: "#1D2B64",
  },
  appleButton: {
    backgroundColor: "#1D2B64",
  },
  appleButtonText: {
    fontSize: 15,
    fontWeight: "600",
    color: "#FFFFFF",
  },
  btnIcon: {
    marginRight: 10,
  },
  dividerRow: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 16,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: "#E5E7EB",
  },
  dividerText: {
    marginHorizontal: 16,
    fontSize: 12,
    fontWeight: "600",
    color: "#9CA3AF",
  },
  primaryButton: {
    height: 52,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
  },
  signInButton: {
    backgroundColor: "transparent",
    borderColor: "#9CA3AF", // blue-grey border
    borderWidth: 1,
    marginBottom: 20,
  },
  signInButtonText: {
    fontSize: 15,
    fontWeight: "700",
    color: "#1D2B64",
  },
  newToText: {
    fontSize: 13,
    fontWeight: "500",
    color: "#6B7280",
    textAlign: "center",
    marginBottom: 12,
  },
  createAccountButton: {
    backgroundColor: "#3B6CE7",
  },
  createAccountButtonText: {
    fontSize: 15,
    fontWeight: "700",
    color: "#FFFFFF",
  },
  
  // Footer
  footer: {
    marginTop: 24,
    paddingHorizontal: 24,
    marginBottom: 12, // ensure it doesn't touch bottom edge too closely
  },
  termsText: {
    fontSize: 12,
    textAlign: "center",
    lineHeight: 18,
    color: "#6B7280",
  },
  termsLink: {
    color: "#3B6CE7",
    fontWeight: "500",
  },
});
