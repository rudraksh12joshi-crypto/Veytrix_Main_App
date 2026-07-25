import React, { useRef, useState, useEffect } from "react";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Animated, LayoutAnimation, Platform, UIManager } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useRouter } from "expo-router";

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

import { TERMS_SECTIONS } from "@/src/constants/legalContent";

export function TermsScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const [expandedId, setExpandedId] = useState<number | null>(null);
  
  const fadeAnim = useRef(new Animated.Value(0)).current;
  
  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 400,
      useNativeDriver: true,
    }).start();
  }, [fadeAnim]);

  const toggleExpand = (id: number) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setExpandedId(expandedId === id ? null : id);
  };

  return (
    <Animated.View style={[styles.container, { opacity: fadeAnim }]}>
      <View style={[styles.header, { paddingTop: insets.top + 16 }]}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#1D2B64" />
        </TouchableOpacity>
        <View style={styles.headerTitleContainer}>
          <Text style={styles.title}>Terms & Conditions</Text>
          <Text style={styles.subtitle}>Please read before using Veytrix.</Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + 40 }]} showsVerticalScrollIndicator={false}>
        
        {TERMS_SECTIONS.map((section) => {
          const isExpanded = expandedId === section.id;
          return (
            <TouchableOpacity 
              key={section.id} 
              style={[styles.card, isExpanded && styles.cardExpanded]}
              activeOpacity={0.8}
              onPress={() => toggleExpand(section.id)}
            >
              <View style={styles.cardHeader}>
                <View style={[styles.iconWrap, { backgroundColor: isExpanded ? "#3B6CE7" : "#F5F7FA" }]}>
                  <Ionicons name={section.icon as any} size={20} color={isExpanded ? "#fff" : "#1D2B64"} />
                </View>
                <Text style={styles.cardTitle}>{section.title}</Text>
                <Ionicons name={isExpanded ? "chevron-up" : "chevron-down"} size={20} color="#8E8E93" />
              </View>
              {isExpanded && (
                <View style={styles.cardBody}>
                  <Text style={styles.paragraph}>{section.content}</Text>
                </View>
              )}
            </TouchableOpacity>
          );
        })}

        <View style={[styles.card, styles.bottomCard]}>
          <View style={styles.metaRow}>
            <Text style={styles.metaLabel}>Last Updated</Text>
            <Text style={styles.metaValue}>July 21, 2026</Text>
          </View>
          <View style={styles.metaDivider} />
          <View style={styles.metaRow}>
            <Text style={styles.metaLabel}>Effective Date</Text>
            <Text style={styles.metaValue}>August 1, 2026</Text>
          </View>
          
          <TouchableOpacity style={styles.agreeBtn} disabled>
            <Ionicons name="checkmark-circle" size={20} color="#3B6CE7" style={{ marginRight: 8 }} />
            <Text style={styles.agreeBtnText}>Terms Accepted</Text>
          </TouchableOpacity>
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
  scrollContent: { padding: 20, gap: 12 },
  card: { backgroundColor: "#fff", borderRadius: 20, padding: 16, shadowColor: "#1D2B64", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.04, shadowRadius: 12, elevation: 2 },
  cardExpanded: { shadowOpacity: 0.08, shadowRadius: 16, elevation: 4 },
  cardHeader: { flexDirection: "row", alignItems: "center" },
  iconWrap: { width: 40, height: 40, borderRadius: 12, justifyContent: "center", alignItems: "center", marginRight: 12 },
  cardTitle: { flex: 1, fontSize: 16, fontWeight: "700", color: "#1D2B64" },
  cardBody: { marginTop: 16, paddingTop: 16, borderTopWidth: 1, borderTopColor: "#F5F7FA" },
  paragraph: { fontSize: 15, color: "#5F7695", lineHeight: 24 },
  bottomCard: { marginTop: 12, backgroundColor: "#fff" },
  metaRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingVertical: 8 },
  metaLabel: { fontSize: 14, color: "#8E8E93", fontWeight: "500" },
  metaValue: { fontSize: 14, color: "#1D2B64", fontWeight: "700" },
  metaDivider: { height: 1, backgroundColor: "#F5F7FA", marginVertical: 8 },
  agreeBtn: { flexDirection: "row", backgroundColor: "rgba(59, 108, 231, 0.1)", marginTop: 20, paddingVertical: 14, borderRadius: 16, justifyContent: "center", alignItems: "center" },
  agreeBtnText: { color: "#3B6CE7", fontSize: 15, fontWeight: "700" },
});
