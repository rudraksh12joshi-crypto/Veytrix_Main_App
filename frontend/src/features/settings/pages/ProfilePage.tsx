import React, { useState } from "react";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, Modal, TextInput, KeyboardAvoidingView, Platform } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { BlurView } from "expo-blur";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { useTheme } from "@/src/theme";
import { useAuthStore } from "@/src/store/auth.store";

export function ProfilePage() {
  const { theme, isDark } = useTheme();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { user, reset } = useAuthStore();
  const [isEditModalVisible, setEditModalVisible] = useState(false);

  const renderIcon = (name: any, color: string, bg: string) => (
    <View style={[styles.iconBox, { backgroundColor: bg }]}>
      <Ionicons name={name} size={18} color={color} />
    </View>
  );

  const ListItem = ({
    iconName,
    iconColor,
    iconBg,
    title,
    subtitle,
    hasChevron = true,
    isDestructive = false,
    rightContent,
    onPress
  }: any) => (
    <TouchableOpacity style={[styles.listItem, { borderBottomColor: theme.colors.border }]} activeOpacity={0.7} onPress={onPress}>
      {renderIcon(iconName, iconColor, iconBg)}
      <View style={styles.listTextContainer}>
        <Text style={[styles.listTitle, { color: isDestructive ? theme.colors.danger : theme.colors.textPrimary }]}>
          {title}
        </Text>
        {subtitle && <Text style={[styles.listSubtitle, { color: theme.colors.textSecondary }]}>{subtitle}</Text>}
      </View>
      {rightContent && <View style={styles.rightContent}>{rightContent}</View>}
      {hasChevron && <Ionicons name="chevron-forward" size={18} color={theme.colors.textMuted} />}
    </TouchableOpacity>
  );

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <ScrollView
        contentContainerStyle={{ paddingBottom: insets.bottom + 40, paddingTop: insets.top + 20 }}
        showsVerticalScrollIndicator={false}
      >
        {/* 1. Profile Header */}
        <View style={styles.header}>
          <View style={styles.avatarWrapper}>
            <Image
              source={{ uri: "https://i.pravatar.cc/150?u=veytrix_user" }}
              style={styles.avatar}
            />
            <View style={styles.premiumBadge}>
              <Ionicons name="star" size={10} color="#000" />
            </View>
          </View>
          <Text style={[styles.userName, { color: theme.colors.textPrimary }]}>{user?.displayName || "Veytrix User"}</Text>
          <Text style={[styles.userEmail, { color: theme.colors.textSecondary }]}>{user?.email || "user@veytrix.com"}</Text>
          <TouchableOpacity 
            style={[styles.editButton, { backgroundColor: theme.colors.surfaceElevated }]}
            onPress={() => setEditModalVisible(true)}
          >
            <Text style={[styles.editButtonText, { color: theme.colors.textPrimary }]}>Edit Profile</Text>
          </TouchableOpacity>
        </View>

        {/* 2. Usage Overview (2x2 Grid) */}
        <View style={styles.gridContainer}>
          {[
            { label: "Total Projects", value: "24", icon: "folder-outline", color: "#7C5CFF" },
            { label: "Total Exports", value: "128", icon: "videocam-outline", color: "#3CD09A" },
            { label: "Storage Used", value: "4.2 GB", icon: "cloud-outline", color: "#FFB43C" },
            { label: "AI Credits", value: "850", icon: "sparkles-outline", color: "#FF3B8B" },
          ].map((item, idx) => (
            <View key={idx} style={[styles.gridCard, { backgroundColor: theme.colors.surface }]}>
              <View style={[styles.gridIconBox, { backgroundColor: item.color + "15" }]}>
                <Ionicons name={item.icon as any} size={20} color={item.color} />
              </View>
              <Text style={[styles.gridValue, { color: theme.colors.textPrimary }]}>{item.value}</Text>
              <Text style={[styles.gridLabel, { color: theme.colors.textSecondary }]}>{item.label}</Text>
            </View>
          ))}
        </View>

        {/* 4. Subscription Card (Moved up for prominence) */}
        <View style={styles.section}>
          <View style={styles.subscriptionContainer}>
            <LinearGradient
              colors={["rgba(124, 92, 255, 0.15)", "rgba(124, 92, 255, 0.05)"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={StyleSheet.absoluteFillObject}
            />
            <BlurView intensity={20} tint="dark" style={styles.subscriptionContent}>
              <View style={styles.subHeader}>
                <View>
                  <Text style={styles.subTitle}>Veytrix Pro</Text>
                  <Text style={styles.subCredits}>850 Credits Remaining</Text>
                </View>
                <Ionicons name="planet" size={32} color="#7C5CFF" />
              </View>
              <TouchableOpacity style={styles.upgradeButton}>
                <Text style={styles.upgradeButtonText}>Upgrade Plan</Text>
              </TouchableOpacity>
            </BlurView>
          </View>
        </View>

        {/* 3. Quick Access */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.colors.textSecondary }]}>Quick Access</Text>
          <View style={[styles.cardGroup, { backgroundColor: theme.colors.surface }]}>
            <ListItem onPress={() => router.push("/(tabs)/projects")} iconName="folder" iconColor="#7C5CFF" iconBg="#7C5CFF15" title="My Projects" subtitle="24 Active" />
            <ListItem iconName="document-text" iconColor="#3CD09A" iconBg="#3CD09A15" title="Drafts" subtitle="3 Saved" />
            <ListItem onPress={() => router.push("/(tabs)/exports")} iconName="library" iconColor="#FFB43C" iconBg="#FFB43C15" title="Export Library" subtitle="128 Videos" />
            <ListItem iconName="heart" iconColor="#FF3B8B" iconBg="#FF3B8B15" title="Favorites" subtitle="12 Items" hasChevron={false} />
          </View>
        </View>

        {/* 5. Editor Preferences */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.colors.textSecondary }]}>Editor Preferences</Text>
          <View style={[styles.cardGroup, { backgroundColor: theme.colors.surface }]}>
            <ListItem iconName="color-palette" iconColor="#fff" iconBg="#333" title="Theme" rightContent={<Text style={{ color: theme.colors.textMuted }}>Dark</Text>} />
            <ListItem iconName="save" iconColor="#fff" iconBg="#444" title="Auto Save" rightContent={<Text style={{ color: theme.colors.textMuted }}>On</Text>} />
            <ListItem iconName="options" iconColor="#fff" iconBg="#555" title="Timeline Settings" />
            <ListItem iconName="hardware-chip" iconColor="#fff" iconBg="#666" title="Default Export Quality" rightContent={<Text style={{ color: theme.colors.textMuted }}>4K</Text>} hasChevron={false} />
          </View>
        </View>

        {/* 6. Settings */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.colors.textSecondary }]}>Settings</Text>
          <View style={[styles.cardGroup, { backgroundColor: theme.colors.surface }]}>
            <ListItem iconName="notifications" iconColor="#fff" iconBg="#FF453A" title="Notifications" />
            <ListItem iconName="globe" iconColor="#fff" iconBg="#0A84FF" title="Language" rightContent={<Text style={{ color: theme.colors.textMuted }}>English</Text>} />
            <ListItem iconName="lock-closed" iconColor="#fff" iconBg="#30D158" title="Privacy" />
            <ListItem iconName="shield-checkmark" iconColor="#fff" iconBg="#5E5CE6" title="Security" hasChevron={false} />
          </View>
        </View>

        {/* 7. Support & 8. About */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.colors.textSecondary }]}>Support & About</Text>
          <View style={[styles.cardGroup, { backgroundColor: theme.colors.surface }]}>
            <ListItem iconName="help-circle" iconColor="#fff" iconBg="#333" title="Help Center" />
            <ListItem iconName="bug" iconColor="#fff" iconBg="#FF9F0A" title="Report Bug" />
            <ListItem iconName="chatbubbles" iconColor="#fff" iconBg="#32ADE6" title="Contact Support" />
            <ListItem iconName="star" iconColor="#fff" iconBg="#FFD60A" title="Rate App" />
            <ListItem iconName="information-circle" iconColor="#fff" iconBg="#8E8E93" title="About Veytrix" subtitle="Version 1.0.0" hasChevron={false} />
          </View>
        </View>

        {/* 9. Logout */}
        <TouchableOpacity 
          style={styles.logoutButton} 
          activeOpacity={0.8}
          onPress={() => {
            reset();
            // Optional: You could router.replace("/login") but _layout guard handles it.
          }}
        >
          <Ionicons name="log-out-outline" size={20} color="#FF5C5C" />
          <Text style={styles.logoutText}>Log Out</Text>
        </TouchableOpacity>
      </ScrollView>

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

function EditProfileSheet({ visible, onClose, theme, isDark, insets, user }: any) {
  const InputField = ({ label, icon, placeholder, value }: any) => (
    <View style={{ marginBottom: 16 }}>
      <Text style={{ color: theme.colors.textSecondary, fontSize: 13, marginBottom: 8, fontWeight: '500', marginLeft: 4 }}>{label}</Text>
      <View style={{ 
        flexDirection: 'row', alignItems: 'center', 
        backgroundColor: isDark ? '#1C1C1E' : '#F2F2F7',
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
        backgroundColor: isDark ? '#1C1C1E' : '#F2F2F7',
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
            shadowColor: '#000',
            shadowOffset: { width: 0, height: -10 },
            shadowOpacity: 0.2,
            shadowRadius: 20,
            elevation: 10,
          }}>
            {/* Header */}
            <View style={{ 
              paddingTop: 24, paddingBottom: 16, paddingHorizontal: 24, 
              borderBottomWidth: 1, borderBottomColor: theme.colors.border,
              flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start'
            }}>
              <View>
                <Text style={{ fontSize: 28, fontWeight: '700', color: theme.colors.textPrimary, marginBottom: 4 }}>Edit Profile</Text>
                <Text style={{ fontSize: 14, color: theme.colors.textSecondary }}>Update your personal information.</Text>
              </View>
              <TouchableOpacity onPress={onClose} style={{ 
                width: 36, height: 36, borderRadius: 18, backgroundColor: theme.colors.surfaceElevated || theme.colors.surface, 
                alignItems: 'center', justifyContent: 'center' 
              }}>
                <Ionicons name="close" size={20} color={theme.colors.textPrimary} />
              </TouchableOpacity>
            </View>

            <ScrollView contentContainerStyle={{ padding: 24, paddingBottom: insets.bottom + 100 }}>
              {/* Profile Picture */}
              <View style={{ alignItems: 'center', marginBottom: 32 }}>
                <View style={{ position: 'relative' }}>
                  <Image source={{ uri: "https://i.pravatar.cc/150?u=veytrix_user" }} style={{ width: 100, height: 100, borderRadius: 50, borderWidth: 2, borderColor: theme.colors.border }} />
                  <View style={{ 
                    position: 'absolute', bottom: 0, right: 0, 
                    backgroundColor: theme.colors.primary, 
                    width: 32, height: 32, borderRadius: 16, 
                    justifyContent: 'center', alignItems: 'center',
                    borderWidth: 3, borderColor: theme.colors.background
                  }}>
                    <Ionicons name="camera" size={16} color="#fff" />
                  </View>
                </View>
                <TouchableOpacity style={{ marginTop: 12 }}>
                  <Text style={{ color: theme.colors.primary, fontWeight: '600', fontSize: 15 }}>Change Photo</Text>
                </TouchableOpacity>
              </View>

              {/* Form */}
              <InputField label="Full Name" icon="person-outline" value={user?.name || "Veytrix User"} />
              <InputField label="Date of Birth" icon="calendar-outline" value="15 Aug 1994" />
              <DropdownField label="Gender" icon="male-female-outline" value="Male" />
              <InputField label="Email Address" icon="mail-outline" value={user?.email || "user@veytrix.com"} />
              <InputField label="Phone Number" icon="call-outline" value="+1 (555) 123-4567" />
              <DropdownField label="Country / Region" icon="globe-outline" value="United States" />
            </ScrollView>

            {/* Bottom Buttons */}
            <View style={{ 
              position: 'absolute', bottom: 0, left: 0, right: 0,
              flexDirection: 'row', padding: 20, paddingBottom: Math.max(insets.bottom, 20),
              backgroundColor: theme.colors.background,
              borderTopWidth: 1, borderTopColor: theme.colors.border,
              gap: 12
            }}>
              <TouchableOpacity onPress={onClose} style={{ 
                flex: 1, height: 56, borderRadius: 16, 
                backgroundColor: theme.colors.surfaceElevated || theme.colors.surface, 
                justifyContent: 'center', alignItems: 'center' 
              }}>
                <Text style={{ color: theme.colors.textPrimary, fontWeight: '600', fontSize: 16 }}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={onClose} style={{ 
                flex: 2, height: 56, borderRadius: 16, 
                backgroundColor: theme.colors.primary, 
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

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    alignItems: "center",
    marginBottom: 32,
    paddingHorizontal: 20,
  },
  avatarWrapper: {
    position: "relative",
    marginBottom: 16,
  },
  avatar: {
    width: 96,
    height: 96,
    borderRadius: 48,
    borderWidth: 2,
    borderColor: "#26262A",
  },
  premiumBadge: {
    position: "absolute",
    bottom: 0,
    right: 4,
    backgroundColor: "#FFD60A",
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#0A0A0B",
  },
  userName: {
    fontSize: 22,
    fontWeight: "700",
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 14,
    marginBottom: 16,
  },
  editButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 16,
  },
  editButtonText: {
    fontSize: 14,
    fontWeight: "600",
  },
  gridContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    paddingHorizontal: 20,
    gap: 12,
    marginBottom: 24,
  },
  gridCard: {
    width: "48%",
    padding: 16,
    borderRadius: 20,
  },
  gridIconBox: {
    width: 36,
    height: 36,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 12,
  },
  gridValue: {
    fontSize: 20,
    fontWeight: "700",
    marginBottom: 4,
  },
  gridLabel: {
    fontSize: 13,
    fontWeight: "500",
  },
  section: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginBottom: 12,
    marginLeft: 12,
  },
  cardGroup: {
    borderRadius: 24,
    overflow: "hidden",
  },
  listItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  iconBox: {
    width: 32,
    height: 32,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  listTextContainer: {
    flex: 1,
    justifyContent: "center",
  },
  listTitle: {
    fontSize: 16,
    fontWeight: "500",
  },
  listSubtitle: {
    fontSize: 13,
    marginTop: 2,
  },
  rightContent: {
    marginRight: 8,
  },
  subscriptionContainer: {
    borderRadius: 24,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "rgba(124, 92, 255, 0.2)",
  },
  subscriptionContent: {
    padding: 20,
  },
  subHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  subTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#fff",
    marginBottom: 4,
  },
  subCredits: {
    fontSize: 14,
    color: "#B0A0FF",
  },
  upgradeButton: {
    backgroundColor: "#7C5CFF",
    paddingVertical: 12,
    borderRadius: 16,
    alignItems: "center",
  },
  upgradeButtonText: {
    color: "#fff",
    fontSize: 15,
    fontWeight: "600",
  },
  logoutButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginHorizontal: 20,
    marginTop: 10,
    paddingVertical: 16,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "rgba(255, 92, 92, 0.3)",
  },
  logoutText: {
    color: "#FF5C5C",
    fontSize: 16,
    fontWeight: "600",
    marginLeft: 8,
  },
});
