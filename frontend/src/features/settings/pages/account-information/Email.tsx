import React, { useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity, TextInput, KeyboardAvoidingView, Platform, ScrollView, ActivityIndicator } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { useTheme } from "@/src/theme";
import { useAuthStore } from "@/src/store/auth.store";

export default function EmailScreen() {
  const { theme } = useTheme();
  const router = useRouter();
  const { user } = useAuthStore();

  const [email, setEmail] = useState("");
  const [isChanging, setIsChanging] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [status, setStatus] = useState<"idle" | "verifying" | "sent">("idle");
  const [cooldown, setCooldown] = useState(0);

  const isValid = email.includes("@") && email.includes(".");

  const handleResend = () => {
    if (cooldown > 0) return;
    setIsResending(true);
    setTimeout(() => {
      setIsResending(false);
      setCooldown(60);
      const timer = setInterval(() => {
        setCooldown(prev => {
          if (prev <= 1) clearInterval(timer);
          return prev - 1;
        });
      }, 1000);
    }, 1000);
  };

  const handleChangeEmail = () => {
    if (!isValid) return;
    setIsChanging(true);
    setTimeout(() => {
      setIsChanging(false);
      setStatus("verifying");
    }, 1500);
  };

  return (
    <SafeAreaView edges={["top"]} style={{ flex: 1, backgroundColor: theme.colors.background }}>
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={{ flex: 1 }}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={24} color={theme.colors.textPrimary} />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: theme.colors.textPrimary }]}>Email</Text>
          <View style={{ width: 40 }} />
        </View>

        <ScrollView contentContainerStyle={{ padding: 24 }} keyboardShouldPersistTaps="handled">
          
          <View style={[styles.currentCard, { backgroundColor: theme.colors.surfaceElevated }]}>
            <Text style={[styles.currentLabel, { color: theme.colors.textSecondary }]}>Current Email</Text>
            <Text style={[styles.currentEmail, { color: theme.colors.textPrimary }]}>{user?.email || "user@veytrix.com"}</Text>
            <View style={styles.verifiedBadge}>
              <Ionicons name="checkmark-circle" size={16} color="#3CD09A" />
              <Text style={{ color: "#3CD09A", fontSize: 13, fontWeight: "600", marginLeft: 4 }}>Verified</Text>
            </View>
          </View>

          {status === "idle" && (
            <View style={styles.formSection}>
              <Text style={[styles.sectionTitle, { color: theme.colors.textPrimary }]}>Change Email</Text>
              <Text style={[styles.sectionDesc, { color: theme.colors.textSecondary }]}>
                Enter a new email address. We will send a verification link to confirm the change.
              </Text>
              <View style={styles.inputGroup}>
                <TextInput
                  style={[styles.input, { backgroundColor: theme.colors.surfaceElevated, color: theme.colors.textPrimary, borderColor: theme.colors.border }]}
                  value={email}
                  onChangeText={setEmail}
                  placeholder="New email address"
                  placeholderTextColor={theme.colors.textMuted}
                  keyboardType="email-address"
                  autoCapitalize="none"
                />
              </View>
              <TouchableOpacity
                style={[styles.primaryBtn, (!isValid || isChanging) ? { backgroundColor: theme.colors.border } : { backgroundColor: theme.colors.primary }]}
                disabled={!isValid || isChanging}
                onPress={handleChangeEmail}
              >
                {isChanging ? <ActivityIndicator color="#FFF" /> : <Text style={styles.primaryBtnText}>Send Verification Link</Text>}
              </TouchableOpacity>
            </View>
          )}

          {status === "verifying" && (
            <View style={[styles.verifyCard, { backgroundColor: "rgba(255, 180, 60, 0.1)" }]}>
              <Ionicons name="mail-unread" size={48} color="#FFB43C" style={{ marginBottom: 16 }} />
              <Text style={[styles.verifyTitle, { color: theme.colors.textPrimary }]}>Verification Pending</Text>
              <Text style={[styles.verifyDesc, { color: theme.colors.textSecondary }]}>
                We sent a link to <Text style={{ fontWeight: "700", color: theme.colors.textPrimary }}>{email}</Text>. Please click the link to confirm your new email.
              </Text>
              <TouchableOpacity
                style={[styles.resendBtn, { backgroundColor: theme.colors.surfaceElevated }]}
                disabled={cooldown > 0 || isResending}
                onPress={handleResend}
              >
                {isResending ? <ActivityIndicator color={theme.colors.primary} /> : <Text style={{ color: cooldown > 0 ? theme.colors.textMuted : theme.colors.primary, fontWeight: "600" }}>
                  {cooldown > 0 ? `Resend available in ${cooldown}s` : "Resend Verification Email"}
                </Text>}
              </TouchableOpacity>
              <TouchableOpacity onPress={() => setStatus("idle")} style={{ marginTop: 24 }}>
                <Text style={{ color: theme.colors.textMuted, fontSize: 14 }}>Cancel Change</Text>
              </TouchableOpacity>
            </View>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  header: { flexDirection: "row", alignItems: "center", paddingHorizontal: 16, paddingVertical: 12 },
  backBtn: { width: 40, height: 40, justifyContent: "center" },
  headerTitle: { flex: 1, textAlign: "center", fontSize: 18, fontWeight: "700" },
  currentCard: { padding: 20, borderRadius: 20, marginBottom: 32 },
  currentLabel: { fontSize: 13, fontWeight: "600", textTransform: "uppercase", marginBottom: 8 },
  currentEmail: { fontSize: 20, fontWeight: "700", marginBottom: 12 },
  verifiedBadge: { flexDirection: "row", alignItems: "center", alignSelf: "flex-start", backgroundColor: "rgba(60, 208, 154, 0.1)", paddingHorizontal: 10, paddingVertical: 6, borderRadius: 12 },
  formSection: { marginTop: 8 },
  sectionTitle: { fontSize: 20, fontWeight: "700", marginBottom: 8 },
  sectionDesc: { fontSize: 14, lineHeight: 22, marginBottom: 24 },
  inputGroup: { marginBottom: 24 },
  input: { height: 56, borderRadius: 16, paddingHorizontal: 16, borderWidth: 1, fontSize: 16 },
  primaryBtn: { height: 56, borderRadius: 16, justifyContent: "center", alignItems: "center" },
  primaryBtnText: { color: "#FFF", fontSize: 16, fontWeight: "700" },
  verifyCard: { alignItems: "center", padding: 32, borderRadius: 24 },
  verifyTitle: { fontSize: 20, fontWeight: "700", marginBottom: 12 },
  verifyDesc: { fontSize: 15, textAlign: "center", lineHeight: 22, marginBottom: 24 },
  resendBtn: { paddingHorizontal: 24, paddingVertical: 14, borderRadius: 16, width: "100%", alignItems: "center" },
});
