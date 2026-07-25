import React, { useState, useRef, useEffect } from "react";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, Modal, TextInput, KeyboardAvoidingView, Platform, Animated, Pressable } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { BlurView } from "expo-blur";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { useTheme } from "@/src/theme";
import { useAuthStore } from "@/src/store/auth.store";

// --- MOCK DATA FOR LISTS ---

const QUICK_ACCESS = [
  { icon: "folder", title: "My Projects", subtitle: "0 Active", color: "#3B6CE7", route: "/(tabs)/projects" },
  { icon: "document-text", title: "Drafts", subtitle: "0 Saved", color: "#8CC8E8" },
  { icon: "library", title: "Export Library", subtitle: "0 Videos", color: "#3B6CE7", route: "/(tabs)/exports" },
  { icon: "heart", title: "Favorites", subtitle: "0 Items", color: "#FF3B8B", noChevron: true },
  { icon: "cloud-download", title: "Downloaded Assets", subtitle: "0 GB", color: "#3B6CE7" },
  { icon: "cloud", title: "Cloud Projects", subtitle: "Synced", color: "#8CC8E8" },
  { icon: "color-wand", title: "Recent Templates", color: "#3B6CE7" },
  { icon: "sparkles", title: "Recent AI Jobs", color: "#FFB43C" },
  { icon: "people", title: "Shared Projects", color: "#3B6CE7" },
];

const EDITOR_PREFS = [
  { icon: "options", title: "Editor Preferences", subtitle: "Timeline, export and editing preferences", route: "/settings/editor" }
];

const AI_SETTINGS = [
  { icon: "color-wand", title: "AI Settings", subtitle: "Manage your AI editing preferences", route: "/settings/ai" }
];

const ACCOUNT = [
  { icon: "person", title: "Profile", route: "/settings/account-information/Profile" },
  { icon: "information-circle", title: "Account Information", route: "/settings/account-information/AccountInformation" },
  { icon: "mail", title: "Email", value: "user@veytrix.com", route: "/settings/account-information/Email" },
  { icon: "call", title: "Phone Number", route: "/settings/account-information/PhoneNumber" },
  { icon: "key", title: "Password", route: "/settings/account-information/Password" },
  { icon: "link", title: "Linked Accounts", route: "/settings/account-information/LinkedAccounts" },
  { icon: "logo-google", title: "Google", value: "Linked", route: "/settings/account-information/GoogleAccount" },
  { icon: "logo-apple", title: "Apple", value: "Linked", route: "/settings/account-information/AppleAccount" },
  { icon: "lock-closed", title: "Privacy", route: "/settings/account-information/Privacy" },
];

const SECURITY = [
  { icon: "shield-checkmark", title: "Security" },
  { icon: "finger-print", title: "2FA", value: "Enabled", route: "/settings/account-information/TwoFactorAuthentication" },
  { icon: "desktop", title: "Sessions", route: "/settings/account-information/ActiveSessions" },
];

const ACCOUNT_MANAGEMENT = [
  { icon: "download", title: "Download My Data", route: "/settings/account-information/DownloadMyData" },
  { icon: "trash-bin", title: "Delete Account", isDanger: true, route: "/settings/account-information/DeleteAccount" },
];

const NOTIFICATIONS = [
  { icon: "notifications", title: "Notifications", subtitle: "Manage notification preferences", route: "/settings/notifications" }
];

const SUPPORT = [
  { icon: "help-buoy", title: "Help Center" },
  { icon: "play", title: "Tutorials" },
  { icon: "apps", title: "Keyboard Shortcuts" },
  { icon: "bulb", title: "Feature Requests" },
  { icon: "people", title: "Community" },
  { icon: "logo-discord", title: "Discord" },
  { icon: "bug", title: "Report Bug" },
  { icon: "chatbubbles", title: "Contact Support" },
  { icon: "document-text", title: "Privacy Policy", route: "/profile/privacy" },
  { icon: "document", title: "Terms", route: "/profile/terms" },
  { icon: "information-circle", title: "About App", route: "/profile/about" },
  { icon: "code-working", title: "Version", value: "1.0.0", noChevron: true },
];

// --- ANIMATED COMPONENTS ---

function AnimatedPressable({ children, onPress, style, disabled }: any) {
  const scale = useRef(new Animated.Value(1)).current;
  const onPressIn = () => Animated.spring(scale, { toValue: 0.96, useNativeDriver: true }).start();
  const onPressOut = () => Animated.spring(scale, { toValue: 1, useNativeDriver: true }).start();

  return (
    <Pressable disabled={disabled} onPressIn={onPressIn} onPressOut={onPressOut} onPress={onPress}>
      <Animated.View style={[style, { transform: [{ scale }] }]}>
        {children}
      </Animated.View>
    </Pressable>
  );
}

function CounterText({ value, style }: { value: string, style: any }) {
  // Simulates a counter animation on mount
  const opacity = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(10)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(opacity, { toValue: 1, duration: 400, useNativeDriver: true }),
      Animated.spring(translateY, { toValue: 0, useNativeDriver: true, tension: 50, friction: 6 })
    ]).start();
  }, [opacity, translateY]);

  return (
    <Animated.Text style={[style, { opacity, transform: [{ translateY }] }]}>
      {value}
    </Animated.Text>
  );
}

// --- SUB COMPONENTS ---

function SectionHeader({ title, subtitle }: { title: string, subtitle?: string }) {
  const { theme } = useTheme();
  return (
    <View style={{ marginBottom: 12, marginLeft: 32 }}>
      <Text style={[styles.sectionTitle, { marginBottom: subtitle ? 2 : 0, marginLeft: 0, color: theme.colors.textSecondary }]}>
        {title}
      </Text>
      {subtitle && <Text style={{ color: theme.colors.textMuted, fontSize: 12 }}>{subtitle}</Text>}
    </View>
  );
}

function ListSection({ items, theme, router }: { items: any[], theme: any, router: any }) {
  return (
    <View style={[styles.cardGroup, { backgroundColor: theme.colors.surfaceElevated }]}>
      {items.map((item, index) => {
        const isLast = index === items.length - 1;
        return (
          <TouchableOpacity
            key={index}
            style={[styles.listItem, !isLast && { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: theme.colors.border }]}
            activeOpacity={0.7}
            onPress={() => item.route && router.push(item.route)}
          >
            <View style={[styles.listIconBox, { backgroundColor: (item.color || theme.colors.textMuted) + "15" }]}>
              <Ionicons name={item.icon as any} size={18} color={item.color || theme.colors.textMuted} />
            </View>
            <View style={styles.listTextContainer}>
              <Text style={[styles.listTitle, { color: item.isDanger ? "#FF5C5C" : theme.colors.textPrimary }]}>
                {item.title}
              </Text>
              {item.subtitle && <Text style={[styles.listSubtitle, { color: theme.colors.textSecondary }]}>{item.subtitle}</Text>}
            </View>
            {item.value && (
              <Text style={{ color: theme.colors.textMuted, fontSize: 14, marginRight: 8 }}>{item.value}</Text>
            )}
            {!item.noChevron && (
              <Ionicons name="chevron-forward" size={16} color={theme.colors.border} />
            )}
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

// --- MAIN PAGE COMPONENT ---

export function ProfilePage() {
  const { theme, isDark } = useTheme();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { user, reset } = useAuthStore();
  const [isEditModalVisible, setEditModalVisible] = useState(false);

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <ScrollView
        contentContainerStyle={{ paddingBottom: insets.bottom + 80, paddingTop: insets.top + 16 }}
        showsVerticalScrollIndicator={false}
      >
        {/* 1. PROFILE HEADER */}
        <View style={styles.header}>
          <View style={styles.avatarWrapper}>
            <Image
              source={{ uri: "https://i.pravatar.cc/150?u=veytrix_user" }}
              style={styles.avatar}
            />
            <View style={styles.verifiedBadge}>
              <Ionicons name="checkmark-circle" size={24} color="#3B6CE7" style={{ backgroundColor: "#fff", borderRadius: 12 }} />
            </View>
            <View style={styles.premiumBadge}>
              <Text style={styles.premiumBadgeText}>PRO</Text>
            </View>
            <TouchableOpacity style={styles.avatarEditBtn} onPress={() => setEditModalVisible(true)}>
              <Ionicons name="camera" size={14} color="#fff" />
            </TouchableOpacity>
          </View>

          <Text style={[styles.userName, { color: theme.colors.textPrimary }]}>{user?.displayName || "Veytrix Creator"}</Text>
          <Text style={[styles.userEmail, { color: theme.colors.textSecondary }]}>{user?.email || "creator@veytrix.com"}</Text>

          <View style={styles.headerInfoRow}>
            <Text style={{ color: theme.colors.textMuted, fontSize: 13, fontWeight: "600" }}>Pro Subscription</Text>
            <View style={{ width: 4, height: 4, borderRadius: 2, backgroundColor: theme.colors.textMuted, marginHorizontal: 8 }} />
            <Text style={{ color: theme.colors.textMuted, fontSize: 13, fontWeight: "600" }}>Member since 2026</Text>
          </View>

          <View style={styles.headerActionRow}>
            <AnimatedPressable style={[styles.primaryBtn, { backgroundColor: theme.colors.primary }]} onPress={() => setEditModalVisible(true)}>
              <Text style={styles.primaryBtnText}>Edit Profile</Text>
            </AnimatedPressable>
            <AnimatedPressable style={[styles.secondaryBtn, { backgroundColor: theme.colors.surfaceElevated }]}>
              <Ionicons name="share-outline" size={18} color={theme.colors.textPrimary} style={{ marginRight: 6 }} />
              <Text style={[styles.secondaryBtnText, { color: theme.colors.textPrimary }]}>Share</Text>
            </AnimatedPressable>
          </View>
        </View>

        {/* 2. WORKSPACE OVERVIEW STATS */}
        <View style={styles.section}>
          <SectionHeader title="Workspace Overview" subtitle="Quick overview of your editing workspace" />
          <View style={{ backgroundColor: theme.colors.surfaceElevated, borderRadius: 20, padding: 20, shadowColor: "#3B6CE7", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.1, shadowRadius: 8, elevation: 2 }}>
            <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
              {[
                { val: "0", label: "Projects", icon: "folder", color: "#3B6CE7", route: "/(tabs)/projects" },
                { val: "0", label: "Exports", icon: "share", color: "#3B6CE7", route: "/(tabs)/exports" },
                { val: "0", label: "Credits", icon: "sparkles", color: "#3B6CE7", route: "/settings/ai" },
                { val: "0 GB", label: "Storage", icon: "cloud", color: "#3B6CE7" },
              ].map((stat, i, arr) => (
                <React.Fragment key={i}>
                  <AnimatedPressable onPress={() => stat.route && router.push(stat.route as any)} style={{ alignItems: "center", flex: 1 }}>
                    <Ionicons name={stat.icon as any} size={24} color={stat.color} style={{ marginBottom: 6 }} />
                    <CounterText value={stat.val} style={{ color: theme.colors.textPrimary, fontSize: 20, fontWeight: "800", marginBottom: 2 }} />
                    <Text style={{ color: theme.colors.textSecondary, fontSize: 12, fontWeight: "500" }}>{stat.label}</Text>
                  </AnimatedPressable>
                  {i < arr.length - 1 && (
                    <View style={{ width: 1, height: 40, backgroundColor: theme.colors.border }} />
                  )}
                </React.Fragment>
              ))}
            </View>
            <View style={{ marginTop: 20, paddingTop: 16, borderTopWidth: 1, borderTopColor: theme.colors.border }}>
              <View style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: 8 }}>
                <Text style={{ color: theme.colors.textSecondary, fontSize: 12, fontWeight: "500" }}>Storage</Text>
                <Text style={{ color: theme.colors.textSecondary, fontSize: 12, fontWeight: "500" }}>0 GB / 10 GB Used</Text>
              </View>
              <View style={{ width: "100%", height: 6, backgroundColor: theme.colors.border, borderRadius: 3, overflow: "hidden" }}>
                <View style={{ width: "0%", height: "100%", backgroundColor: "#3B6CE7" }} />
              </View>
            </View>
          </View>
        </View>

        {/* 3. SUBSCRIPTION CARD */}
        <View style={styles.section}>
          <SectionHeader title="Subscription" />
          <AnimatedPressable style={[styles.subCard, { shadowColor: "#3B6CE7" }]}>
            <LinearGradient colors={["#1D2B64", "#3B6CE7"]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={StyleSheet.absoluteFillObject} />
            <View style={styles.subContent}>
              <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start" }}>
                <View>
                  <Text style={{ color: "rgba(255,255,255,0.8)", fontSize: 13, fontWeight: "600", textTransform: "uppercase" }}>Current Plan</Text>
                  <Text style={{ color: "#fff", fontSize: 26, fontWeight: "800", marginTop: 4 }}>Free</Text>
                </View>
                <View style={styles.subIconWrap}>
                  <Ionicons name="planet" size={28} color="#1D2B64" />
                </View>
              </View>

              <View style={styles.subFeatures}>
                <View style={styles.subFeatItem}>
                  <Text style={styles.subFeatVal}>0</Text>
                  <Text style={styles.subFeatLabel}>Credits</Text>
                </View>
                <View style={styles.subFeatDivider} />
                <View style={styles.subFeatItem}>
                  <Text style={styles.subFeatVal}>10 GB</Text>
                  <Text style={styles.subFeatLabel}>Cloud</Text>
                </View>
                <View style={styles.subFeatDivider} />
                <View style={styles.subFeatItem}>
                  <Text style={styles.subFeatVal}>1080p</Text>
                  <Text style={styles.subFeatLabel}>Export</Text>
                </View>
              </View>

              <View style={{ marginTop: 24, gap: 12 }}>
                <TouchableOpacity style={[styles.subBtnLight, { paddingVertical: 14 }]}>
                  <Text style={{ color: "#1D2B64", fontSize: 14, fontWeight: "700" }}>Upgrade to Pro</Text>
                </TouchableOpacity>
                <View style={{ alignItems: "center" }}>
                  <Text style={{ color: "rgba(255,255,255,0.8)", fontSize: 12 }}>Purchase credits to start using AI features.</Text>
                </View>
              </View>
            </View>
          </AnimatedPressable>
        </View>

        {/* 4. LIST SECTIONS (Ordered) */}
        <View style={styles.section}>
          <ListSection items={QUICK_ACCESS} theme={theme} router={router} />
        </View>

        <View style={styles.section}>
          <ListSection items={EDITOR_PREFS} theme={theme} router={router} />
        </View>

        <View style={styles.section}>
          <ListSection items={AI_SETTINGS} theme={theme} router={router} />
        </View>

        {/* 5. STORAGE WIDGET */}
        <View style={styles.section}>
          <SectionHeader title="Storage Management" />
          <View style={[styles.storageCard, { backgroundColor: theme.colors.surfaceElevated }]}>
            <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
              <View style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
                <Ionicons name="server" size={24} color="#3B6CE7" />
                <View>
                  <Text style={{ color: theme.colors.textPrimary, fontSize: 16, fontWeight: "700" }}>0 GB Used</Text>
                  <Text style={{ color: theme.colors.textSecondary, fontSize: 12, marginTop: 2 }}>of 10 GB Total</Text>
                </View>
              </View>
              <Text style={{ color: "#3CD09A", fontSize: 14, fontWeight: "700" }}>10 GB Free</Text>
            </View>

            <View style={[styles.storageBarBg, { backgroundColor: theme.colors.border }]}>
              <LinearGradient colors={["#1D2B64", "#3B6CE7"]} style={[styles.storageBarFill, { width: "0%" }]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} />
            </View>

            <View style={styles.storageBreakdown}>
              <View style={styles.storageLegend}>
                <View style={[styles.legendDot, { backgroundColor: "#3B6CE7" }]} />
                <Text style={{ color: theme.colors.textSecondary, fontSize: 12 }}>Cloud Sync (0GB)</Text>
              </View>
              <View style={styles.storageLegend}>
                <View style={[styles.legendDot, { backgroundColor: "#8CC8E8" }]} />
                <Text style={{ color: theme.colors.textSecondary, fontSize: 12 }}>Cache (0GB)</Text>
              </View>
              <View style={styles.storageLegend}>
                <View style={[styles.legendDot, { backgroundColor: theme.colors.border }]} />
                <Text style={{ color: theme.colors.textSecondary, fontSize: 12 }}>Free</Text>
              </View>
            </View>

            <View style={styles.storageActions}>
              <TouchableOpacity style={[styles.storageBtn, { backgroundColor: theme.colors.border }]}>
                <Text style={{ color: theme.colors.textPrimary, fontSize: 13, fontWeight: "600" }}>Clear Cache</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.storageBtn, { backgroundColor: theme.colors.border }]}>
                <Text style={{ color: theme.colors.textPrimary, fontSize: 13, fontWeight: "600" }}>Manage Space</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <ListSection items={NOTIFICATIONS} theme={theme} router={router} />
        </View>

        <View style={styles.section}>
          <SectionHeader title="Account Information" />
          <ListSection items={ACCOUNT} theme={theme} router={router} />
        </View>

        <View style={styles.section}>
          <SectionHeader title="Privacy & Security" />
          <ListSection items={SECURITY} theme={theme} router={router} />
        </View>

        <View style={styles.section}>
          <SectionHeader title="Account Management" />
          <ListSection items={ACCOUNT_MANAGEMENT} theme={theme} router={router} />
        </View>

        <View style={styles.section}>
          <SectionHeader title="Support & About" />
          <ListSection items={SUPPORT} theme={theme} router={router} />
        </View>

        {/* 8. LOG OUT */}
        <AnimatedPressable
          style={styles.logoutWrapper}
          onPress={() => reset()}
        >
          <View style={[styles.logoutBtn, { backgroundColor: theme.colors.background }]}>
            <Ionicons name="log-out" size={20} color="#FF5C5C" style={{ marginRight: 8 }} />
            <Text style={styles.logoutText}>Log Out</Text>
          </View>
        </AnimatedPressable>

      </ScrollView>

      {/* EDIT PROFILE MODAL */}
      <EditProfileSheet
        visible={isEditModalVisible}
        onClose={() => setEditModalVisible(false)}
        theme={theme}
        isDark={isDark}
        insets={insets}
        user={user}
      />
    </View>
  );
}

// --- MODAL ---

function EditProfileSheet({ visible, onClose, theme, isDark, insets, user }: any) {
  const InputField = ({ label, icon, placeholder, value }: any) => (
    <View style={{ marginBottom: 16 }}>
      <Text style={{ color: theme.colors.textSecondary, fontSize: 13, marginBottom: 8, fontWeight: '500', marginLeft: 4 }}>{label}</Text>
      <View style={{
        flexDirection: 'row', alignItems: 'center',
        backgroundColor: theme.colors.surfaceElevated,
        borderRadius: 16,
        paddingHorizontal: 16,
        height: 56,
        borderWidth: 1,
        borderColor: theme.colors.border
      }}>
        <Ionicons name={icon} size={20} color={theme.colors.textMuted} style={{ marginRight: 12 }} />
        <TextInput
          style={{ flex: 1, color: theme.colors.textPrimary, fontSize: 16 }}
          placeholder={placeholder}
          placeholderTextColor={theme.colors.textMuted}
          value={value}
        />
      </View>
    </View>
  );

  const DropdownField = ({ label, icon, value }: any) => (
    <View style={{ marginBottom: 16 }}>
      <Text style={{ color: theme.colors.textSecondary, fontSize: 13, marginBottom: 8, fontWeight: '500', marginLeft: 4 }}>{label}</Text>
      <TouchableOpacity style={{
        flexDirection: 'row', alignItems: 'center',
        backgroundColor: theme.colors.surfaceElevated,
        borderRadius: 16,
        paddingHorizontal: 16,
        height: 56,
        borderWidth: 1,
        borderColor: theme.colors.border
      }}>
        <Ionicons name={icon} size={20} color={theme.colors.textMuted} style={{ marginRight: 12 }} />
        <Text style={{ flex: 1, color: theme.colors.textPrimary, fontSize: 16 }}>{value}</Text>
        <Ionicons name="chevron-down" size={20} color={theme.colors.textMuted} />
      </TouchableOpacity>
    </View>
  );

  return (
    <Modal visible={visible} transparent animationType="slide">
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={{ flex: 1 }}>
        <View style={{ flex: 1, justifyContent: 'flex-end' }}>
          <BlurView intensity={20} tint="dark" style={StyleSheet.absoluteFillObject} />
          <TouchableOpacity style={StyleSheet.absoluteFillObject} onPress={onClose} activeOpacity={1} />

          <View style={{
            height: '90%',
            backgroundColor: theme.colors.background,
            borderTopLeftRadius: 32,
            borderTopRightRadius: 32,
            overflow: 'hidden',
          }}>
            <View style={{
              paddingTop: 24, paddingBottom: 16, paddingHorizontal: 24,
              borderBottomWidth: 1, borderBottomColor: theme.colors.border,
              flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start'
            }}>
              <View>
                <Text style={{ fontSize: 28, fontWeight: '800', color: theme.colors.textPrimary, marginBottom: 4 }}>Edit Profile</Text>
                <Text style={{ fontSize: 14, color: theme.colors.textSecondary }}>Update your personal information.</Text>
              </View>
              <TouchableOpacity onPress={onClose} style={{
                width: 36, height: 36, borderRadius: 18, backgroundColor: theme.colors.surfaceElevated,
                alignItems: 'center', justifyContent: 'center'
              }}>
                <Ionicons name="close" size={20} color={theme.colors.textPrimary} />
              </TouchableOpacity>
            </View>

            <ScrollView contentContainerStyle={{ padding: 24, paddingBottom: insets.bottom + 100 }}>
              <View style={{ alignItems: 'center', marginBottom: 32 }}>
                <View style={{ position: 'relative' }}>
                  <Image source={{ uri: "https://i.pravatar.cc/150?u=veytrix_user" }} style={{ width: 100, height: 100, borderRadius: 50, borderWidth: 2, borderColor: theme.colors.border }} />
                  <View style={{
                    position: 'absolute', bottom: 0, right: 0,
                    backgroundColor: "#3B6CE7",
                    width: 32, height: 32, borderRadius: 16,
                    justifyContent: 'center', alignItems: 'center',
                    borderWidth: 3, borderColor: theme.colors.background
                  }}>
                    <Ionicons name="camera" size={16} color="#fff" />
                  </View>
                </View>
              </View>

              <InputField label="Full Name" icon="person-outline" value={user?.displayName || "Veytrix Creator"} />
              <InputField label="Date of Birth" icon="calendar-outline" value="15 Aug 1994" />
              <DropdownField label="Gender" icon="male-female-outline" value="Male" />
              <InputField label="Email Address" icon="mail-outline" value={user?.email || "creator@veytrix.com"} />
              <InputField label="Phone Number" icon="call-outline" value="+1 (555) 123-4567" />
              <DropdownField label="Country / Region" icon="globe-outline" value="United States" />
            </ScrollView>

            <View style={{
              position: 'absolute', bottom: 0, left: 0, right: 0,
              flexDirection: 'row', padding: 20, paddingBottom: Math.max(insets.bottom, 20),
              backgroundColor: theme.colors.background,
              borderTopWidth: 1, borderTopColor: theme.colors.border,
              gap: 12
            }}>
              <TouchableOpacity onPress={onClose} style={{
                flex: 1, height: 56, borderRadius: 16,
                backgroundColor: theme.colors.surfaceElevated,
                justifyContent: 'center', alignItems: 'center'
              }}>
                <Text style={{ color: theme.colors.textPrimary, fontWeight: '600', fontSize: 16 }}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={onClose} style={{
                flex: 2, height: 56, borderRadius: 16,
                backgroundColor: "#3B6CE7",
                justifyContent: 'center', alignItems: 'center'
              }}>
                <Text style={{ color: "#fff", fontWeight: '600', fontSize: 16 }}>Save Changes</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

// --- STYLES ---

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { alignItems: "center", paddingHorizontal: 20, marginBottom: 32 },
  avatarWrapper: { position: "relative", marginBottom: 20 },
  avatar: { width: 110, height: 110, borderRadius: 55, borderWidth: 3, borderColor: "rgba(59,108,231,0.2)" },
  verifiedBadge: { position: "absolute", bottom: 4, right: 4 },
  premiumBadge: { position: "absolute", top: -8, alignSelf: "center", backgroundColor: "#FFD60A", paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12, shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.2, shadowRadius: 4, elevation: 3 },
  premiumBadgeText: { color: "#000", fontSize: 10, fontWeight: "800", letterSpacing: 1 },
  avatarEditBtn: { position: "absolute", left: -8, bottom: 12, backgroundColor: "rgba(0,0,0,0.6)", padding: 8, borderRadius: 16 },
  userName: { fontSize: 24, fontWeight: "800", marginBottom: 4, letterSpacing: -0.5 },
  userEmail: { fontSize: 15, marginBottom: 12 },
  headerInfoRow: { flexDirection: "row", alignItems: "center", marginBottom: 20 },
  headerActionRow: { flexDirection: "row", alignItems: "center", gap: 12 },
  primaryBtn: { paddingHorizontal: 24, paddingVertical: 12, borderRadius: 999 },
  primaryBtnText: { color: "#fff", fontSize: 14, fontWeight: "700" },
  secondaryBtn: { flexDirection: "row", alignItems: "center", paddingHorizontal: 24, paddingVertical: 12, borderRadius: 999 },
  secondaryBtnText: { fontSize: 14, fontWeight: "600" },

  section: { marginBottom: 32 },
  sectionTitle: { fontSize: 13, fontWeight: "700", textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 12, marginLeft: 32 },

  overviewGrid: { flexDirection: "row", flexWrap: "wrap", paddingHorizontal: 20, gap: 12 },
  statCard: { width: "23%", padding: 12, borderRadius: 16, alignItems: "center", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.1, shadowRadius: 8, elevation: 2 },
  statValue: { fontSize: 16, fontWeight: "800", marginBottom: 2 },
  statLabel: { fontSize: 10, fontWeight: "600", textAlign: "center" },

  subCard: { marginHorizontal: 20, borderRadius: 24, overflow: "hidden", shadowOffset: { width: 0, height: 12 }, shadowOpacity: 0.3, shadowRadius: 16, elevation: 10 },
  subContent: { padding: 24 },
  subIconWrap: { width: 48, height: 48, borderRadius: 24, backgroundColor: "#fff", justifyContent: "center", alignItems: "center" },
  subFeatures: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginTop: 24, backgroundColor: "rgba(255,255,255,0.1)", borderRadius: 16, padding: 16 },
  subFeatItem: { alignItems: "center" },
  subFeatVal: { color: "#fff", fontSize: 18, fontWeight: "700" },
  subFeatLabel: { color: "rgba(255,255,255,0.7)", fontSize: 12, marginTop: 4 },
  subFeatDivider: { width: 1, height: 30, backgroundColor: "rgba(255,255,255,0.2)" },
  subActionRow: { flexDirection: "row", gap: 12, marginTop: 24 },
  subBtnLight: { flex: 1, backgroundColor: "#fff", paddingVertical: 14, borderRadius: 16, alignItems: "center" },
  subBtnDark: { flex: 1, backgroundColor: "rgba(0,0,0,0.2)", paddingVertical: 14, borderRadius: 16, alignItems: "center" },

  storageCard: { marginHorizontal: 20, padding: 20, borderRadius: 20 },
  storageBarBg: { height: 8, borderRadius: 4, overflow: "hidden", marginBottom: 16 },
  storageBarFill: { height: "100%", borderRadius: 4 },
  storageBreakdown: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 24 },
  storageLegend: { flexDirection: "row", alignItems: "center", gap: 6 },
  legendDot: { width: 8, height: 8, borderRadius: 4 },
  storageActions: { flexDirection: "row", gap: 12 },
  storageBtn: { flex: 1, paddingVertical: 12, borderRadius: 12, alignItems: "center" },

  insightCard: { width: 140, padding: 16, borderRadius: 16, marginLeft: 20 },

  cardGroup: { marginHorizontal: 20, borderRadius: 20, overflow: "hidden" },
  listItem: { flexDirection: "row", alignItems: "center", paddingVertical: 14, paddingHorizontal: 16 },
  listIconBox: { width: 32, height: 32, borderRadius: 10, justifyContent: "center", alignItems: "center", marginRight: 12 },
  listTextContainer: { flex: 1, justifyContent: "center" },
  listTitle: { fontSize: 15, fontWeight: "600" },
  listSubtitle: { fontSize: 12, marginTop: 2 },

  timelineCard: { marginHorizontal: 20, padding: 20, borderRadius: 20 },
  timelineItem: { flexDirection: "row", marginBottom: 16 },
  timelineLeft: { alignItems: "center", marginRight: 12, width: 20 },
  timelineDot: { width: 12, height: 12, borderRadius: 6, zIndex: 1 },
  timelineLine: { position: "absolute", top: 12, width: 2, height: "150%" },
  timelineContent: { flex: 1 },

  logoutWrapper: { paddingHorizontal: 20, marginTop: 24 },
  logoutBtn: { flexDirection: "row", alignItems: "center", justifyContent: "center", paddingVertical: 18, borderRadius: 20, borderWidth: 2, borderColor: "rgba(255, 92, 92, 0.3)" },
  logoutText: { color: "#FF5C5C", fontSize: 16, fontWeight: "700" },
});
