import React, { useRef, useState, useEffect } from "react";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Animated, LayoutAnimation, Platform, UIManager } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useRouter } from "expo-router";

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

const PRIVACY_SECTIONS = [
  { id: 1, title: "Information We Collect", icon: "information-circle", content: "We collect information you provide directly to us, such as when you create or modify your account, request on-demand services, contact customer support, or otherwise communicate with us." },
  { id: 2, title: "Account Information", icon: "person", content: "When you sign up for an account, we collect your name, email address, password, and optionally your profile picture and phone number." },
  { id: 3, title: "Uploaded Media", icon: "cloud-upload", content: "We collect and securely store the videos, images, and audio files you upload to our servers for the purpose of editing and AI processing." },
  { id: 4, title: "AI Processing", icon: "color-wand", content: "To provide AI features like auto-captioning and smart editing, your media may be processed by our proprietary AI models. This data is strictly used for your editing sessions and is not used to train public models without consent." },
  { id: 5, title: "Cloud Storage", icon: "cloud", content: "Your projects and exports are saved in our secure cloud infrastructure to allow seamless syncing across your devices." },
  { id: 6, title: "Cookies", icon: "cafe", content: "We use cookies and similar tracking technologies to track the activity on our Service and hold certain information to improve your experience." },
  { id: 7, title: "Analytics", icon: "stats-chart", content: "We may use third-party Service Providers to monitor and analyze the use of our Service to help us improve the platform." },
  { id: 8, title: "Security", icon: "shield-checkmark", content: "We value your trust in providing us your Personal Data, thus we are striving to use commercially acceptable means of protecting it. We employ bank-level encryption for all data in transit." },
  { id: 9, title: "Third-party Services", icon: "apps", content: "We may employ third party companies and individuals to facilitate our Service, to provide the Service on our behalf, or to perform Service-related services." },
  { id: 10, title: "Data Retention", icon: "time", content: "We will retain your Personal Data only for as long as is necessary for the purposes set out in this Privacy Policy." },
  { id: 11, title: "User Rights", icon: "hand-left", content: "You have the right to access, update or delete the information we have on you. Whenever made possible, you can access, update or request deletion of your Personal Data directly within your account settings section." },
  { id: 12, title: "Delete Account", icon: "trash", content: "If you wish to delete your account, you can do so from the Settings > Security menu. All your uploaded media and personal data will be permanently deleted from our servers." },
];

export function PrivacyPolicyScreen() {
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
          <Text style={styles.title}>Privacy Policy</Text>
          <Text style={styles.subtitle}>Your privacy matters to us.</Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + 40 }]} showsVerticalScrollIndicator={false}>
        
        {/* DATA SECURITY CARD */}
        <View style={styles.securityCard}>
          <View style={styles.securityHeader}>
            <View style={styles.securityIconWrap}>
              <Ionicons name="lock-closed" size={28} color="#fff" />
            </View>
            <View style={styles.securityHeaderText}>
              <Text style={styles.securityTitle}>Data Security</Text>
              <Text style={styles.securitySubtitle}>How we protect your data</Text>
            </View>
          </View>
          <View style={styles.securityGrid}>
            <View style={styles.securityItem}>
              <Ionicons name="key" size={20} color="#3B6CE7" style={styles.secItemIcon} />
              <Text style={styles.securityLabel}>Encryption</Text>
            </View>
            <View style={styles.securityItem}>
              <Ionicons name="cloud-upload" size={20} color="#3B6CE7" style={styles.secItemIcon} />
              <Text style={styles.securityLabel}>Secure Uploads</Text>
            </View>
            <View style={styles.securityItem}>
              <Ionicons name="server" size={20} color="#3B6CE7" style={styles.secItemIcon} />
              <Text style={styles.securityLabel}>Protected Storage</Text>
            </View>
            <View style={styles.securityItem}>
              <Ionicons name="shield-checkmark" size={20} color="#3B6CE7" style={styles.secItemIcon} />
              <Text style={styles.securityLabel}>Account Security</Text>
            </View>
          </View>
        </View>

        <Text style={styles.sectionTitle}>Policy Details</Text>

        {PRIVACY_SECTIONS.map((section) => {
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
            <Text style={styles.metaLabel}>Contact Email</Text>
            <Text style={[styles.metaValue, { color: "#3B6CE7" }]}>privacy@veytrix.com</Text>
          </View>
          <View style={styles.metaDivider} />
          <View style={styles.metaRow}>
            <Text style={styles.metaLabel}>Privacy Questions?</Text>
            <Text style={styles.metaValue}>Contact Support</Text>
          </View>
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
  
  securityCard: { backgroundColor: "#1D2B64", borderRadius: 24, padding: 24, shadowColor: "#1D2B64", shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.15, shadowRadius: 16, elevation: 6, marginBottom: 8 },
  securityHeader: { flexDirection: "row", alignItems: "center", marginBottom: 20 },
  securityIconWrap: { width: 56, height: 56, borderRadius: 16, backgroundColor: "#3B6CE7", justifyContent: "center", alignItems: "center", marginRight: 16 },
  securityHeaderText: { flex: 1 },
  securityTitle: { fontSize: 20, fontWeight: "800", color: "#fff", marginBottom: 4 },
  securitySubtitle: { fontSize: 14, color: "rgba(255,255,255,0.7)", fontWeight: "500" },
  securityGrid: { flexDirection: "row", flexWrap: "wrap", gap: 12 },
  securityItem: { width: "48%", backgroundColor: "rgba(255,255,255,0.1)", borderRadius: 12, padding: 12, flexDirection: "row", alignItems: "center" },
  secItemIcon: { marginRight: 8 },
  securityLabel: { fontSize: 13, color: "#fff", fontWeight: "600" },
  
  sectionTitle: { fontSize: 18, fontWeight: "800", color: "#1D2B64", marginVertical: 8, marginLeft: 4 },
  
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
});
