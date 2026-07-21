import React, { useRef, useEffect } from "react";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, Animated, Linking } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useRouter } from "expo-router";

export function AboutAppScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  
  const fadeAnim = useRef(new Animated.Value(0)).current;
  
  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 400,
      useNativeDriver: true,
    }).start();
  }, [fadeAnim]);

  return (
    <Animated.View style={[styles.container, { opacity: fadeAnim }]}>
      <View style={[styles.header, { paddingTop: insets.top + 16 }]}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#1D2B64" />
        </TouchableOpacity>
        <View style={styles.headerTitleContainer}>
          <Text style={styles.title}>About Veytrix</Text>
          <Text style={styles.subtitle}>AI-powered professional video editing platform.</Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + 40 }]} showsVerticalScrollIndicator={false}>
        
        {/* HERO CARD */}
        <View style={styles.card}>
          <View style={styles.heroHeader}>
            <View style={styles.logoContainer}>
              <Ionicons name="play" size={32} color="#fff" />
            </View>
            <View>
              <Text style={styles.heroTitle}>Veytrix</Text>
              <Text style={styles.heroSubtitle}>Professional Video Editor</Text>
            </View>
          </View>
          <View style={styles.heroStats}>
            <View style={styles.heroStatItem}>
              <Text style={styles.heroStatLabel}>Version</Text>
              <Text style={styles.heroStatValue}>1.0.0</Text>
            </View>
            <View style={styles.heroStatDivider} />
            <View style={styles.heroStatItem}>
              <Text style={styles.heroStatLabel}>Status</Text>
              <Text style={styles.heroStatValue}>Stable Release</Text>
            </View>
            <View style={styles.heroStatDivider} />
            <View style={styles.heroStatItem}>
              <Text style={styles.heroStatLabel}>Current Plan</Text>
              <Text style={styles.heroStatValue}>Pro Member</Text>
            </View>
          </View>
        </View>

        {/* ABOUT SECTION */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>About</Text>
          <Text style={styles.paragraph}>
            Veytrix is a next-generation video editing platform designed for creators, filmmakers, and social media professionals. By combining professional timeline tools with advanced AI capabilities, Veytrix dramatically accelerates your post-production workflow.
          </Text>
        </View>

        {/* FEATURES GRID */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Core Capabilities</Text>
          <View style={styles.featuresGrid}>
            {[
              { icon: "color-wand", label: "AI Editing", color: "#3B6CE7" },
              { icon: "cut", label: "Manual Edit", color: "#FFB43C" },
              { icon: "cloud-upload", label: "Cloud Sync", color: "#34C759" },
              { icon: "videocam", label: "4K Export", color: "#1D2B64" },
              { icon: "layers", label: "Templates", color: "#8CC8E8" },
              { icon: "flash", label: "Fast Render", color: "#FF3B8B" },
              { icon: "lock-closed", label: "Secure Storage", color: "#3B6CE7" },
              { icon: "sparkles", label: "AI Credits", color: "#FFB43C" },
            ].map((f, i) => (
              <View key={i} style={styles.featureItem}>
                <View style={[styles.featureIconWrap, { backgroundColor: f.color + "15" }]}>
                  <Ionicons name={f.icon as any} size={24} color={f.color} />
                </View>
                <Text style={styles.featureLabel}>{f.label}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* TECHNOLOGY STACK */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Technology Stack</Text>
          <View style={styles.techRow}>
            <Text style={styles.techLabel}>Frontend</Text>
            <Text style={styles.techValue}>React Native / Expo</Text>
          </View>
          <View style={styles.techRow}>
            <Text style={styles.techLabel}>Backend</Text>
            <Text style={styles.techValue}>Node.js Microservices</Text>
          </View>
          <View style={styles.techRow}>
            <Text style={styles.techLabel}>Database</Text>
            <Text style={styles.techValue}>PostgreSQL</Text>
          </View>
          <View style={styles.techRow}>
            <Text style={styles.techLabel}>Storage</Text>
            <Text style={styles.techValue}>AWS S3</Text>
          </View>
          <View style={styles.techRow}>
            <Text style={styles.techLabel}>AI Models</Text>
            <Text style={styles.techValue}>Custom LLMs & Vision</Text>
          </View>
        </View>

        {/* MISSION */}
        <View style={[styles.card, { backgroundColor: "#1D2B64" }]}>
          <Ionicons name="planet" size={32} color="#3B6CE7" style={{ marginBottom: 12 }} />
          <Text style={[styles.paragraph, { color: "#fff", fontSize: 16, fontWeight: "600" }]}>
            "Our mission is to make professional video editing accessible through AI, empowering every creator to tell their story."
          </Text>
        </View>

        {/* CONTACT */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Connect with Us</Text>
          <View style={styles.contactActions}>
            <TouchableOpacity style={styles.primaryButton}>
              <Ionicons name="globe" size={18} color="#fff" />
              <Text style={styles.primaryButtonText}>Open Website</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.secondaryButton}>
              <Ionicons name="mail" size={18} color="#1D2B64" />
              <Text style={styles.secondaryButtonText}>Contact Support</Text>
            </TouchableOpacity>
          </View>
          
          <View style={styles.socialRow}>
            <TouchableOpacity style={styles.socialBtn}>
              <Ionicons name="logo-instagram" size={24} color="#1D2B64" />
            </TouchableOpacity>
            <TouchableOpacity style={styles.socialBtn}>
              <Ionicons name="logo-linkedin" size={24} color="#1D2B64" />
            </TouchableOpacity>
            <TouchableOpacity style={styles.socialBtn}>
              <Ionicons name="logo-twitter" size={24} color="#1D2B64" />
            </TouchableOpacity>
          </View>
        </View>

        {/* LEGAL */}
        <View style={styles.legalFooter}>
          <Text style={styles.legalText}>© 2026 Veytrix Inc.</Text>
          <Text style={styles.legalText}>All Rights Reserved.</Text>
        </View>

      </ScrollView>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F5F7FA" },
  header: { paddingHorizontal: 20, paddingBottom: 16, backgroundColor: "#fff", shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 4, elevation: 3, zIndex: 10, flexDirection: "row", alignItems: "center" },
  backBtn: { width: 44, height: 44, borderRadius: 22, backgroundColor: "#F5F7FA", justifyContent: "center", alignItems: "center", marginRight: 16 },
  headerTitleContainer: { flex: 1 },
  title: { fontSize: 24, fontWeight: "800", color: "#1D2B64", marginBottom: 2 },
  subtitle: { fontSize: 13, color: "#8E8E93", fontWeight: "500" },
  scrollContent: { padding: 20, gap: 16 },
  card: { backgroundColor: "#fff", borderRadius: 24, padding: 20, shadowColor: "#1D2B64", shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.05, shadowRadius: 16, elevation: 4 },
  heroHeader: { flexDirection: "row", alignItems: "center", marginBottom: 24 },
  logoContainer: { width: 64, height: 64, borderRadius: 20, backgroundColor: "#3B6CE7", justifyContent: "center", alignItems: "center", marginRight: 16 },
  heroTitle: { fontSize: 28, fontWeight: "800", color: "#1D2B64", marginBottom: 4 },
  heroSubtitle: { fontSize: 15, color: "#8E8E93", fontWeight: "600" },
  heroStats: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", backgroundColor: "#F5F7FA", borderRadius: 16, padding: 16 },
  heroStatItem: { flex: 1, alignItems: "center" },
  heroStatLabel: { fontSize: 12, color: "#8E8E93", fontWeight: "600", marginBottom: 4 },
  heroStatValue: { fontSize: 14, color: "#1D2B64", fontWeight: "800" },
  heroStatDivider: { width: 1, height: 24, backgroundColor: "#E5E5EA" },
  sectionTitle: { fontSize: 18, fontWeight: "800", color: "#1D2B64", marginBottom: 16 },
  paragraph: { fontSize: 15, color: "#5F7695", lineHeight: 24 },
  featuresGrid: { flexDirection: "row", flexWrap: "wrap", justifyContent: "space-between", gap: 12 },
  featureItem: { width: "23%", alignItems: "center", marginBottom: 12 },
  featureIconWrap: { width: 48, height: 48, borderRadius: 16, justifyContent: "center", alignItems: "center", marginBottom: 8 },
  featureLabel: { fontSize: 11, color: "#5F7695", fontWeight: "600", textAlign: "center" },
  techRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: "#F5F7FA" },
  techLabel: { fontSize: 15, color: "#8E8E93", fontWeight: "500" },
  techValue: { fontSize: 15, color: "#1D2B64", fontWeight: "700" },
  contactActions: { flexDirection: "row", gap: 12, marginBottom: 24 },
  primaryButton: { flex: 1, flexDirection: "row", backgroundColor: "#3B6CE7", paddingVertical: 14, borderRadius: 16, justifyContent: "center", alignItems: "center", gap: 8 },
  primaryButtonText: { color: "#fff", fontSize: 15, fontWeight: "700" },
  secondaryButton: { flex: 1, flexDirection: "row", backgroundColor: "#fff", borderWidth: 1.5, borderColor: "#E5E5EA", paddingVertical: 14, borderRadius: 16, justifyContent: "center", alignItems: "center", gap: 8 },
  secondaryButtonText: { color: "#1D2B64", fontSize: 15, fontWeight: "700" },
  socialRow: { flexDirection: "row", justifyContent: "center", gap: 24 },
  socialBtn: { width: 48, height: 48, borderRadius: 24, backgroundColor: "#F5F7FA", justifyContent: "center", alignItems: "center" },
  legalFooter: { alignItems: "center", marginTop: 16 },
  legalText: { fontSize: 13, color: "#8E8E93", fontWeight: "500" },
});
