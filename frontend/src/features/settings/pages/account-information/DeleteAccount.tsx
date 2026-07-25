import React, { useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, ActivityIndicator, Alert, TextInput, KeyboardAvoidingView, Platform } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { useTheme } from "@/src/theme";
import { useAuthStore } from "@/src/store/auth.store";

export default function DeleteAccountScreen() {
  const { theme } = useTheme();
  const router = useRouter();
  const { reset } = useAuthStore();

  const [confirmText, setConfirmText] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);

  const isValid = confirmText === "DELETE";

  const handleDelete = () => {
    if (!isValid) return;

    Alert.alert(
      "Final Confirmation",
      "Are you absolutely sure you want to delete your account? This cannot be undone.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete My Account",
          style: "destructive",
          onPress: () => {
            setIsDeleting(true);
            setTimeout(() => {
              setIsDeleting(false);
              // Clear local state and go to login
              reset();
            }, 2000);
          }
        }
      ]
    );
  };

  return (
    <SafeAreaView edges={["top"]} style={{ flex: 1, backgroundColor: theme.colors.background }}>
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={{ flex: 1 }}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn} disabled={isDeleting}>
            <Ionicons name="arrow-back" size={24} color={theme.colors.textPrimary} />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: theme.colors.textPrimary }]}>Delete Account</Text>
          <View style={{ width: 40 }} />
        </View>

        <ScrollView contentContainerStyle={{ padding: 24 }} keyboardShouldPersistTaps="handled">
          
          <View style={styles.warningIcon}>
            <Ionicons name="warning" size={64} color="#FF5C5C" />
          </View>

          <Text style={[styles.title, { color: theme.colors.textPrimary }]}>This action is permanent.</Text>
          
          <View style={[styles.infoCard, { backgroundColor: "rgba(255, 92, 92, 0.1)" }]}>
            <Text style={styles.infoTitle}>What happens when you delete your account?</Text>
            <View style={styles.bulletItem}>
              <View style={styles.bullet} />
              <Text style={styles.bulletText}>Your Veytrix profile and account information will be permanently removed.</Text>
            </View>
            <View style={styles.bulletItem}>
              <View style={styles.bullet} />
              <Text style={styles.bulletText}>All active projects and saved settings will be deleted.</Text>
            </View>
            <View style={styles.bulletItem}>
              <View style={styles.bullet} />
              <Text style={styles.bulletText}>All media currently stored in your Cloud Storage will be wiped.</Text>
            </View>
            <View style={styles.bulletItem}>
              <View style={styles.bullet} />
              <Text style={styles.bulletText}>Any active subscription will be cancelled immediately without refund.</Text>
            </View>
          </View>

          <View style={styles.confirmSection}>
            <Text style={[styles.confirmLabel, { color: theme.colors.textPrimary }]}>
              To confirm, type <Text style={{ fontWeight: "800" }}>DELETE</Text> below:
            </Text>
            <TextInput
              style={[styles.input, { backgroundColor: theme.colors.surfaceElevated, color: theme.colors.textPrimary, borderColor: isValid ? "#FF5C5C" : theme.colors.border }]}
              value={confirmText}
              onChangeText={setConfirmText}
              placeholder="DELETE"
              placeholderTextColor={theme.colors.textMuted}
              autoCapitalize="characters"
              autoCorrect={false}
              editable={!isDeleting}
            />
          </View>

        </ScrollView>
        <View style={[styles.footer, { backgroundColor: theme.colors.background, borderTopColor: theme.colors.border }]}>
          <TouchableOpacity
            style={[styles.primaryBtn, (!isValid || isDeleting) ? { backgroundColor: theme.colors.border } : { backgroundColor: "#FF5C5C" }]}
            disabled={!isValid || isDeleting}
            onPress={handleDelete}
          >
            {isDeleting ? <ActivityIndicator color="#FFF" /> : <Text style={styles.primaryBtnText}>Delete Account</Text>}
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
  warningIcon: { alignItems: "center", marginBottom: 24, marginTop: 12 },
  title: { fontSize: 24, fontWeight: "800", textAlign: "center", marginBottom: 32 },
  infoCard: { padding: 20, borderRadius: 20, marginBottom: 32 },
  infoTitle: { color: "#FF5C5C", fontSize: 16, fontWeight: "700", marginBottom: 16 },
  bulletItem: { flexDirection: "row", alignItems: "flex-start", marginBottom: 12 },
  bullet: { width: 6, height: 6, borderRadius: 3, backgroundColor: "#FF5C5C", marginTop: 6, marginRight: 12 },
  bulletText: { flex: 1, color: "#FF5C5C", fontSize: 14, lineHeight: 20 },
  confirmSection: { marginBottom: 24 },
  confirmLabel: { fontSize: 15, marginBottom: 12 },
  input: { height: 56, borderRadius: 16, paddingHorizontal: 16, borderWidth: 1, fontSize: 16 },
  footer: { padding: 20, borderTopWidth: 1 },
  primaryBtn: { height: 56, borderRadius: 16, justifyContent: "center", alignItems: "center" },
  primaryBtnText: { color: "#FFF", fontSize: 16, fontWeight: "700" },
});
