import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  Platform,
  ScrollView,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";

import { useTheme } from "@/src/theme";

export function CheckEmailPage() {
  const { theme, isDark } = useTheme();
  const router = useRouter();

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <StatusBar barStyle={isDark ? "light-content" : "dark-content"} />
      
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        
        <View style={styles.header}>
          <LinearGradient
            colors={["#1D2B64", "#3B6CE7"]}
            style={styles.iconContainer}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <Ionicons name="mail-open" size={40} color="#fff" />
          </LinearGradient>
          
          <Text style={[styles.title, { color: theme.colors.textPrimary }]}>
            Check Your Email
          </Text>
          <Text style={[styles.subtitle, { color: theme.colors.textSecondary }]}>
            We've sent a password reset link to your email address. Please check your inbox and follow the instructions.
          </Text>
        </View>

        <View style={styles.actions}>
          <TouchableOpacity
            style={[styles.primaryButton, { backgroundColor: theme.colors.primary }]}
            activeOpacity={0.8}
            onPress={() => {
              // Mock Open Email App behavior
            }}
          >
            <Text style={styles.primaryButtonText}>Open Email App</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.secondaryButton, { backgroundColor: theme.colors.surfaceElevated }]}
            activeOpacity={0.8}
            onPress={() => router.replace("/(auth)/login")}
          >
            <Text style={[styles.secondaryButtonText, { color: theme.colors.textPrimary }]}>Back to Login</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.footer}>
          <Text style={[styles.footerText, { color: theme.colors.textSecondary }]}>
            Didn't receive the email?
          </Text>
          <TouchableOpacity onPress={() => {
             // Mock resend logic
          }}>
            <Text style={[styles.resendLink, { color: theme.colors.primary }]}>
              Resend Link
            </Text>
          </TouchableOpacity>
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 24,
    justifyContent: "center",
    paddingVertical: 40,
  },
  header: {
    alignItems: "center",
    marginBottom: 40,
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 24,
    shadowColor: "#3B6CE7",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 8,
  },
  title: {
    fontSize: 28,
    fontWeight: "800",
    marginBottom: 12,
    letterSpacing: -0.5,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 15,
    fontWeight: "400",
    textAlign: "center",
    lineHeight: 22,
    paddingHorizontal: 10,
  },
  actions: {
    width: "100%",
    marginBottom: 40,
  },
  primaryButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    height: 56,
    borderRadius: 16,
    marginBottom: 16,
  },
  primaryButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "700",
  },
  secondaryButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    height: 56,
    borderRadius: 16,
  },
  secondaryButtonText: {
    fontSize: 16,
    fontWeight: "600",
  },
  footer: {
    alignItems: "center",
    marginTop: "auto",
  },
  footerText: {
    fontSize: 15,
    marginBottom: 8,
  },
  resendLink: {
    fontSize: 15,
    fontWeight: "700",
  },
});
