import React, { useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity, TextInput, KeyboardAvoidingView, Platform, ScrollView, ActivityIndicator } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { useTheme } from "@/src/theme";

export default function TwoFactorAuthenticationScreen() {
  const { theme } = useTheme();
  const router = useRouter();

  // Real implementations would pull this from auth state
  const [isEnabled, setIsEnabled] = useState(true);
  
  const [setupStep, setSetupStep] = useState<"idle" | "qr" | "code">("idle");
  const [verificationCode, setVerificationCode] = useState("");
  const [isVerifying, setIsVerifying] = useState(false);

  const isValidCode = verificationCode.length === 6;

  const handleStartSetup = () => {
    setSetupStep("qr");
  };

  const handleVerify = () => {
    if (!isValidCode) return;
    setIsVerifying(true);
    setTimeout(() => {
      setIsVerifying(false);
      setIsEnabled(true);
      setSetupStep("idle");
      setVerificationCode("");
    }, 1500);
  };

  const handleDisable = () => {
    // Requires re-authentication normally
    setIsEnabled(false);
  };

  return (
    <SafeAreaView edges={["top"]} style={{ flex: 1, backgroundColor: theme.colors.background }}>
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={{ flex: 1 }}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={24} color={theme.colors.textPrimary} />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: theme.colors.textPrimary }]}>Two-Factor Authentication</Text>
          <View style={{ width: 40 }} />
        </View>

        <ScrollView contentContainerStyle={{ padding: 24 }} keyboardShouldPersistTaps="handled">
          
          <View style={styles.statusSection}>
            <View style={[styles.statusIconWrap, { backgroundColor: isEnabled ? "rgba(60, 208, 154, 0.1)" : "rgba(255, 180, 60, 0.1)" }]}>
              <Ionicons name={isEnabled ? "shield-checkmark" : "shield-half"} size={48} color={isEnabled ? "#3CD09A" : "#FFB43C"} />
            </View>
            <Text style={[styles.statusText, { color: theme.colors.textPrimary }]}>
              {isEnabled ? "2FA is Enabled" : "2FA is Disabled"}
            </Text>
            <Text style={[styles.statusDesc, { color: theme.colors.textSecondary }]}>
              {isEnabled 
                ? "Your account is protected with an additional layer of security using an authenticator app."
                : "Add an extra layer of security to your account by requiring a verification code when you sign in."}
            </Text>
          </View>

          {!isEnabled && setupStep === "idle" && (
            <TouchableOpacity style={[styles.primaryBtn, { backgroundColor: theme.colors.primary }]} onPress={handleStartSetup}>
              <Text style={styles.primaryBtnText}>Set Up Authenticator App</Text>
            </TouchableOpacity>
          )}

          {isEnabled && (
            <View style={styles.actionsBox}>
              <TouchableOpacity style={[styles.actionBtn, { backgroundColor: theme.colors.surfaceElevated, marginBottom: 12 }]}>
                <Text style={{ color: theme.colors.textPrimary, fontWeight: "600" }}>Regenerate Recovery Codes</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.actionBtn, { backgroundColor: "rgba(255, 92, 92, 0.1)" }]} onPress={handleDisable}>
                <Text style={{ color: "#FF5C5C", fontWeight: "600" }}>Disable 2FA</Text>
              </TouchableOpacity>
            </View>
          )}

          {setupStep === "qr" && (
            <View style={[styles.setupCard, { backgroundColor: theme.colors.surfaceElevated }]}>
              <Text style={[styles.setupTitle, { color: theme.colors.textPrimary }]}>1. Scan QR Code</Text>
              <Text style={[styles.setupDesc, { color: theme.colors.textSecondary }]}>
                Scan this code with Google Authenticator or a similar app.
              </Text>
              
              <View style={styles.qrPlaceholder}>
                <Ionicons name="qr-code" size={100} color={theme.colors.textPrimary} />
              </View>

              <Text style={[styles.setupDesc, { color: theme.colors.textSecondary, marginBottom: 8 }]}>
                Or enter this setup key manually:
              </Text>
              <View style={[styles.keyBox, { backgroundColor: theme.colors.background }]}>
                <Text style={[styles.keyText, { color: theme.colors.textPrimary }]}>ABCD EFGH IJKL MNOP</Text>
                <Ionicons name="copy-outline" size={20} color={theme.colors.textMuted} />
              </View>

              <TouchableOpacity style={[styles.primaryBtn, { backgroundColor: theme.colors.primary, marginTop: 24 }]} onPress={() => setSetupStep("code")}>
                <Text style={styles.primaryBtnText}>Next</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => setSetupStep("idle")} style={{ marginTop: 16, alignItems: "center" }}>
                <Text style={{ color: theme.colors.textMuted }}>Cancel</Text>
              </TouchableOpacity>
            </View>
          )}

          {setupStep === "code" && (
            <View style={[styles.setupCard, { backgroundColor: theme.colors.surfaceElevated }]}>
              <Text style={[styles.setupTitle, { color: theme.colors.textPrimary }]}>2. Enter Code</Text>
              <Text style={[styles.setupDesc, { color: theme.colors.textSecondary }]}>
                Enter the 6-digit code generated by your authenticator app to verify setup.
              </Text>
              
              <TextInput
                style={[styles.input, { backgroundColor: theme.colors.background, color: theme.colors.textPrimary, borderColor: theme.colors.border }]}
                value={verificationCode}
                onChangeText={setVerificationCode}
                placeholder="000000"
                placeholderTextColor={theme.colors.textMuted}
                keyboardType="number-pad"
                maxLength={6}
              />

              <TouchableOpacity
                style={[styles.primaryBtn, (!isValidCode || isVerifying) ? { backgroundColor: theme.colors.border } : { backgroundColor: theme.colors.primary }, { marginTop: 24 }]}
                disabled={!isValidCode || isVerifying}
                onPress={handleVerify}
              >
                {isVerifying ? <ActivityIndicator color="#FFF" /> : <Text style={styles.primaryBtnText}>Verify and Enable</Text>}
              </TouchableOpacity>
              <TouchableOpacity onPress={() => setSetupStep("qr")} style={{ marginTop: 16, alignItems: "center" }}>
                <Text style={{ color: theme.colors.textMuted }}>Back</Text>
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
  statusSection: { alignItems: "center", marginBottom: 40, marginTop: 12 },
  statusIconWrap: { width: 88, height: 88, borderRadius: 44, justifyContent: "center", alignItems: "center", marginBottom: 16 },
  statusText: { fontSize: 22, fontWeight: "700", marginBottom: 12 },
  statusDesc: { fontSize: 15, textAlign: "center", lineHeight: 22, paddingHorizontal: 12 },
  primaryBtn: { height: 56, borderRadius: 16, justifyContent: "center", alignItems: "center" },
  primaryBtnText: { color: "#FFF", fontSize: 16, fontWeight: "700" },
  actionsBox: { width: "100%" },
  actionBtn: { height: 56, borderRadius: 16, justifyContent: "center", alignItems: "center" },
  setupCard: { padding: 24, borderRadius: 24 },
  setupTitle: { fontSize: 18, fontWeight: "700", marginBottom: 8 },
  setupDesc: { fontSize: 14, lineHeight: 22, marginBottom: 20 },
  qrPlaceholder: { width: 200, height: 200, backgroundColor: "#FFF", alignSelf: "center", borderRadius: 16, justifyContent: "center", alignItems: "center", marginBottom: 24 },
  keyBox: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", padding: 16, borderRadius: 12, borderWidth: 1, borderColor: "transparent" },
  keyText: { fontSize: 16, letterSpacing: 1, fontWeight: "600" },
  input: { height: 56, borderRadius: 16, paddingHorizontal: 16, borderWidth: 1, fontSize: 24, textAlign: "center", letterSpacing: 8 },
});
