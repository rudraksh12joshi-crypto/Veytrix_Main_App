import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
  Image,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

import { useTheme } from "@/src/theme";
import { useAuthStore } from "@/src/store/auth.store";

export function AuthChoicePage() {
  const { theme, isDark } = useTheme();
  const router = useRouter();
  const { setStatus, setUser } = useAuthStore();
  const [loadingProvider, setLoadingProvider] = useState<"google" | "apple" | null>(null);

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
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <StatusBar barStyle={isDark ? "light-content" : "dark-content"} />
      
      <View style={styles.content}>
        <View style={styles.mainContent}>
          
          <View style={styles.header}>
            <Image
              source={require("@/assets/images/image.png")}
              style={styles.logoContainer}
              resizeMode="cover"
            />
            
            <Text style={[styles.title, { color: theme.colors.textPrimary }]}>
              Welcome to Veytrix
            </Text>
            <Text style={[styles.subtitle, { color: theme.colors.textSecondary }]}>
              Create cinematic videos with AI-powered editing.
            </Text>
          </View>

          <View style={styles.actions}>
            {/* Social Login */}
            <TouchableOpacity
              style={[styles.authButton, { backgroundColor: theme.colors.surfaceElevated }]}
              onPress={() => handleSocialLogin("google")}
              disabled={loadingProvider !== null}
              activeOpacity={0.8}
            >
              {loadingProvider === "google" ? (
                <ActivityIndicator color={theme.colors.textPrimary} />
              ) : (
                <>
                  <Ionicons name="logo-google" size={24} color={theme.colors.textPrimary} style={styles.providerIcon} />
                  <Text style={[styles.authButtonText, { color: theme.colors.textPrimary }]}>
                    Continue with Google
                  </Text>
                </>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.authButton, { backgroundColor: theme.colors.textPrimary }]}
              onPress={() => handleSocialLogin("apple")}
              disabled={loadingProvider !== null}
              activeOpacity={0.8}
            >
              {loadingProvider === "apple" ? (
                <ActivityIndicator color={theme.colors.background} />
              ) : (
                <>
                  <Ionicons name="logo-apple" size={24} color={theme.colors.background} style={styles.providerIcon} />
                  <Text style={[styles.authButtonText, { color: theme.colors.background }]}>
                    Continue with Apple
                  </Text>
                </>
              )}
            </TouchableOpacity>

            {/* Divider */}
            <View style={styles.dividerContainer}>
              <View style={[styles.dividerLine, { backgroundColor: theme.colors.border }]} />
              <Text style={[styles.dividerText, { color: theme.colors.textMuted }]}>OR</Text>
              <View style={[styles.dividerLine, { backgroundColor: theme.colors.border }]} />
            </View>

            {/* Account Options */}
            <View style={styles.accountOptionRow}>
              <Text style={[styles.accountOptionText, { color: theme.colors.textSecondary }]}>
                Already have an account?
              </Text>
              <TouchableOpacity
                style={[styles.smallButton, { backgroundColor: theme.colors.surfaceElevated }]}
                onPress={() => router.push("/(auth)/login")}
              >
                <Text style={[styles.smallButtonText, { color: theme.colors.textPrimary }]}>Sign In</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.accountOptionRow}>
              <Text style={[styles.accountOptionText, { color: theme.colors.textSecondary }]}>
                New to Veytrix?
              </Text>
              <TouchableOpacity
                style={[styles.smallButton, { backgroundColor: theme.colors.primary }]}
                onPress={() => router.push("/(auth)/register")}
              >
                <Text style={[styles.smallButtonText, { color: "#fff" }]}>Create Account</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        <View style={styles.footer}>
          <Text style={[styles.termsText, { color: theme.colors.textMuted }]}>
            By continuing, you agree to our Terms of Service and Privacy Policy.
          </Text>
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
    paddingHorizontal: 24,
    paddingBottom: 40,
  },
  mainContent: {
    flex: 1,
    justifyContent: "center",
  },
  header: {
    alignItems: "center",
    marginBottom: 40,
  },
  logoContainer: {
    width: 96,
    height: 96,
    borderRadius: 24,
    marginBottom: 24,
    shadowColor: "#7C5CFF",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
  },
  title: {
    fontSize: 32,
    fontWeight: "800",
    marginBottom: 12,
    letterSpacing: -0.5,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 16,
    fontWeight: "400",
    textAlign: "center",
    lineHeight: 24,
    paddingHorizontal: 20,
  },
  actions: {
    width: "100%",
  },
  authButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    height: 56,
    borderRadius: 16,
    marginBottom: 16,
  },
  providerIcon: {
    marginRight: 12,
  },
  authButtonText: {
    fontSize: 16,
    fontWeight: "600",
  },
  dividerContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 24,
  },
  dividerLine: {
    flex: 1,
    height: 1,
  },
  dividerText: {
    marginHorizontal: 16,
    fontSize: 14,
    fontWeight: "600",
  },
  accountOptionRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  accountOptionText: {
    fontSize: 15,
  },
  smallButton: {
    paddingHorizontal: 20,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  smallButtonText: {
    fontSize: 14,
    fontWeight: "700",
  },
  footer: {
    alignItems: "center",
  },
  termsText: {
    fontSize: 12,
    textAlign: "center",
    lineHeight: 18,
    paddingHorizontal: 20,
  },
});
