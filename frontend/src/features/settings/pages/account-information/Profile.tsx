import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, TouchableOpacity, TextInput, KeyboardAvoidingView, Platform, ScrollView, ActivityIndicator, Image } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { useTheme } from "@/src/theme";
import { useAuthStore } from "@/src/store/auth.store";

export default function ProfileScreen() {
  const { theme } = useTheme();
  const router = useRouter();
  const { user } = useAuthStore();

  const [displayName, setDisplayName] = useState(user?.displayName || "");
  const [bio, setBio] = useState("");
  const [username, setUsername] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<"idle" | "success" | "error">("idle");

  const hasChanged = displayName.trim() !== (user?.displayName || "") || bio !== "" || username !== "";
  const isValid = displayName.trim().length > 0;

  const handleSave = () => {
    if (!hasChanged || !isValid) return;
    setIsSaving(true);
    setSaveStatus("idle");
    // Simulate backend call
    setTimeout(() => {
      setIsSaving(false);
      setSaveStatus("success");
      setTimeout(() => setSaveStatus("idle"), 3000);
    }, 1500);
  };

  return (
    <SafeAreaView edges={["top"]} style={{ flex: 1, backgroundColor: theme.colors.background }}>
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={{ flex: 1 }}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={24} color={theme.colors.textPrimary} />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: theme.colors.textPrimary }]}>Profile</Text>
          <View style={{ width: 40 }} />
        </View>

        <ScrollView contentContainerStyle={{ padding: 24 }} keyboardShouldPersistTaps="handled">
          <View style={styles.avatarSection}>
            <View style={styles.avatarWrapper}>
              <Image source={{ uri: "https://i.pravatar.cc/150?u=veytrix_user" }} style={[styles.avatar, { borderColor: theme.colors.border }]} />
              <TouchableOpacity style={styles.editAvatarBtn}>
                <Ionicons name="camera" size={16} color="#FFF" />
              </TouchableOpacity>
            </View>
            <View style={styles.avatarActions}>
              <TouchableOpacity style={[styles.actionBtn, { backgroundColor: theme.colors.surfaceElevated }]}>
                <Text style={{ color: theme.colors.primary, fontWeight: "600" }}>Change Photo</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.actionBtn, { backgroundColor: theme.colors.surfaceElevated }]}>
                <Text style={{ color: "#FF5C5C", fontWeight: "600" }}>Remove</Text>
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: theme.colors.textSecondary }]}>Display Name</Text>
            <TextInput
              style={[styles.input, { backgroundColor: theme.colors.surfaceElevated, color: theme.colors.textPrimary, borderColor: theme.colors.border }]}
              value={displayName}
              onChangeText={setDisplayName}
              placeholder="Your display name"
              placeholderTextColor={theme.colors.textMuted}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: theme.colors.textSecondary }]}>Username</Text>
            <TextInput
              style={[styles.input, { backgroundColor: theme.colors.surfaceElevated, color: theme.colors.textPrimary, borderColor: theme.colors.border }]}
              value={username}
              onChangeText={setUsername}
              placeholder="@username"
              placeholderTextColor={theme.colors.textMuted}
              autoCapitalize="none"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: theme.colors.textSecondary }]}>Bio</Text>
            <TextInput
              style={[styles.input, styles.textArea, { backgroundColor: theme.colors.surfaceElevated, color: theme.colors.textPrimary, borderColor: theme.colors.border }]}
              value={bio}
              onChangeText={setBio}
              placeholder="Tell us about yourself"
              placeholderTextColor={theme.colors.textMuted}
              multiline
              textAlignVertical="top"
              maxLength={160}
            />
            <Text style={[styles.charCount, { color: theme.colors.textMuted }]}>{bio.length}/160</Text>
          </View>

          {saveStatus === "success" && (
            <View style={styles.statusBox}>
              <Ionicons name="checkmark-circle" size={20} color="#3CD09A" />
              <Text style={styles.statusText}>Saved successfully</Text>
            </View>
          )}

        </ScrollView>
        <View style={[styles.footer, { backgroundColor: theme.colors.background, borderTopColor: theme.colors.border }]}>
          <TouchableOpacity
            style={[styles.saveBtn, (!hasChanged || !isValid || isSaving) ? { backgroundColor: theme.colors.border } : { backgroundColor: theme.colors.primary }]}
            disabled={!hasChanged || !isValid || isSaving}
            onPress={handleSave}
          >
            {isSaving ? <ActivityIndicator color="#FFF" /> : <Text style={styles.saveBtnText}>Save Changes</Text>}
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  header: { flexDirection: "row", alignItems: "center", paddingHorizontal: 16, paddingVertical: 12 },
  backBtn: { width: 40, height: 40, justifyContent: "center" },
  headerTitle: { flex: 1, textAlign: "center", fontSize: 18, fontWeight: "700" },
  avatarSection: { alignItems: "center", marginBottom: 32 },
  avatarWrapper: { position: "relative", marginBottom: 16 },
  avatar: { width: 100, height: 100, borderRadius: 50, borderWidth: 1 },
  editAvatarBtn: { position: "absolute", bottom: 0, right: 0, backgroundColor: "#3B6CE7", width: 32, height: 32, borderRadius: 16, justifyContent: "center", alignItems: "center", borderWidth: 2, borderColor: "#FFF" },
  avatarActions: { flexDirection: "row", gap: 12 },
  actionBtn: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20 },
  inputGroup: { marginBottom: 20 },
  label: { fontSize: 13, fontWeight: "600", marginBottom: 8, marginLeft: 4 },
  input: { height: 52, borderRadius: 12, paddingHorizontal: 16, borderWidth: 1, fontSize: 16 },
  textArea: { height: 100, paddingTop: 16 },
  charCount: { textAlign: "right", fontSize: 12, marginTop: 4, marginRight: 4 },
  statusBox: { flexDirection: "row", alignItems: "center", justifyContent: "center", backgroundColor: "rgba(60, 208, 154, 0.1)", padding: 12, borderRadius: 12, marginTop: 10 },
  statusText: { color: "#3CD09A", fontWeight: "600", marginLeft: 8 },
  footer: { padding: 20, borderTopWidth: 1 },
  saveBtn: { height: 56, borderRadius: 16, justifyContent: "center", alignItems: "center" },
  saveBtnText: { color: "#FFF", fontSize: 16, fontWeight: "700" },
});
