import React, { useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity, TextInput, KeyboardAvoidingView, Platform, ScrollView, ActivityIndicator } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { useTheme } from "@/src/theme";

export default function PhoneNumberScreen() {
  const { theme } = useTheme();
  const router = useRouter();

  const [currentPhone, setCurrentPhone] = useState<string | null>(null);
  const [phone, setPhone] = useState("");
  const [countryCode, setCountryCode] = useState("+91");
  const [otp, setOtp] = useState("");
  
  const [status, setStatus] = useState<"idle" | "sending" | "verifying" | "verifying_otp">("idle");
  const [cooldown, setCooldown] = useState(0);

  const isValidPhone = phone.length >= 7;
  const isValidOtp = otp.length === 6;

  const handleSendOtp = () => {
    if (!isValidPhone) return;
    setStatus("sending");
    setTimeout(() => {
      setStatus("verifying");
      startCooldown();
    }, 1500);
  };

  const startCooldown = () => {
    setCooldown(60);
    const timer = setInterval(() => {
      setCooldown(prev => {
        if (prev <= 1) clearInterval(timer);
        return prev - 1;
      });
    }, 1000);
  };

  const handleVerifyOtp = () => {
    if (!isValidOtp) return;
    setStatus("verifying_otp");
    setTimeout(() => {
      setCurrentPhone(`${countryCode} ${phone}`);
      setStatus("idle");
      setPhone("");
      setOtp("");
    }, 1500);
  };

  const handleRemove = () => {
    // Requires re-authentication normally, simulating success here safely.
    setCurrentPhone(null);
  };

  return (
    <SafeAreaView edges={["top"]} style={{ flex: 1, backgroundColor: theme.colors.background }}>
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={{ flex: 1 }}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={24} color={theme.colors.textPrimary} />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: theme.colors.textPrimary }]}>Phone Number</Text>
          <View style={{ width: 40 }} />
        </View>

        <ScrollView contentContainerStyle={{ padding: 24 }} keyboardShouldPersistTaps="handled">
          
          <View style={[styles.currentCard, { backgroundColor: theme.colors.surfaceElevated }]}>
            <Text style={[styles.currentLabel, { color: theme.colors.textSecondary }]}>Current Phone Number</Text>
            {currentPhone ? (
              <>
                <Text style={[styles.currentPhone, { color: theme.colors.textPrimary }]}>{currentPhone}</Text>
                <View style={styles.verifiedBadge}>
                  <Ionicons name="checkmark-circle" size={16} color="#3CD09A" />
                  <Text style={{ color: "#3CD09A", fontSize: 13, fontWeight: "600", marginLeft: 4 }}>Verified</Text>
                </View>
                <TouchableOpacity onPress={handleRemove} style={styles.removeBtn}>
                  <Text style={styles.removeBtnText}>Remove Phone Number</Text>
                </TouchableOpacity>
              </>
            ) : (
              <Text style={[styles.currentPhone, { color: theme.colors.textMuted, fontStyle: 'italic' }]}>No phone number added</Text>
            )}
          </View>

          {(status === "idle" || status === "sending") && (
            <View style={styles.formSection}>
              <Text style={[styles.sectionTitle, { color: theme.colors.textPrimary }]}>{currentPhone ? "Change Phone Number" : "Add Phone Number"}</Text>
              <Text style={[styles.sectionDesc, { color: theme.colors.textSecondary }]}>
                Enter your phone number to receive an SMS with a verification code.
              </Text>
              
              <View style={styles.phoneInputRow}>
                <TouchableOpacity style={[styles.countrySelector, { backgroundColor: theme.colors.surfaceElevated, borderColor: theme.colors.border }]}>
                  <Text style={{ color: theme.colors.textPrimary, fontSize: 16 }}>{countryCode}</Text>
                  <Ionicons name="chevron-down" size={16} color={theme.colors.textMuted} style={{ marginLeft: 8 }} />
                </TouchableOpacity>
                <TextInput
                  style={[styles.input, { flex: 1, backgroundColor: theme.colors.surfaceElevated, color: theme.colors.textPrimary, borderColor: theme.colors.border }]}
                  value={phone}
                  onChangeText={setPhone}
                  placeholder="Phone number"
                  placeholderTextColor={theme.colors.textMuted}
                  keyboardType="phone-pad"
                />
              </View>

              <TouchableOpacity
                style={[styles.primaryBtn, (!isValidPhone || status === "sending") ? { backgroundColor: theme.colors.border } : { backgroundColor: theme.colors.primary }]}
                disabled={!isValidPhone || status === "sending"}
                onPress={handleSendOtp}
              >
                {status === "sending" ? <ActivityIndicator color="#FFF" /> : <Text style={styles.primaryBtnText}>Send Verification Code</Text>}
              </TouchableOpacity>
            </View>
          )}

          {status === "verifying" || status === "verifying_otp" ? (
            <View style={[styles.verifyCard, { backgroundColor: "rgba(59, 108, 231, 0.1)" }]}>
              <Ionicons name="chatbubble-ellipses" size={48} color="#3B6CE7" style={{ marginBottom: 16 }} />
              <Text style={[styles.verifyTitle, { color: theme.colors.textPrimary }]}>Enter Verification Code</Text>
              <Text style={[styles.verifyDesc, { color: theme.colors.textSecondary }]}>
                We sent a 6-digit code to <Text style={{ fontWeight: "700", color: theme.colors.textPrimary }}>{countryCode} {phone}</Text>.
              </Text>
              
              <TextInput
                style={[styles.input, { width: "100%", backgroundColor: theme.colors.background, color: theme.colors.textPrimary, borderColor: theme.colors.border, textAlign: "center", fontSize: 24, letterSpacing: 8, marginBottom: 24 }]}
                value={otp}
                onChangeText={setOtp}
                placeholder="000000"
                placeholderTextColor={theme.colors.textMuted}
                keyboardType="number-pad"
                maxLength={6}
              />

              <TouchableOpacity
                style={[styles.primaryBtn, (!isValidOtp || status === "verifying_otp") ? { backgroundColor: theme.colors.border } : { backgroundColor: theme.colors.primary }, { width: "100%", marginBottom: 16 }]}
                disabled={!isValidOtp || status === "verifying_otp"}
                onPress={handleVerifyOtp}
              >
                {status === "verifying_otp" ? <ActivityIndicator color="#FFF" /> : <Text style={styles.primaryBtnText}>Verify Code</Text>}
              </TouchableOpacity>

              <TouchableOpacity
                style={{ paddingVertical: 12 }}
                disabled={cooldown > 0}
                onPress={startCooldown}
              >
                <Text style={{ color: cooldown > 0 ? theme.colors.textMuted : theme.colors.primary, fontWeight: "600" }}>
                  {cooldown > 0 ? `Resend code in ${cooldown}s` : "Resend Code"}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => setStatus("idle")} style={{ marginTop: 12 }}>
                <Text style={{ color: theme.colors.textMuted, fontSize: 14 }}>Change Phone Number</Text>
              </TouchableOpacity>
            </View>
          ) : null}
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
  currentPhone: { fontSize: 20, fontWeight: "700", marginBottom: 12 },
  verifiedBadge: { flexDirection: "row", alignItems: "center", alignSelf: "flex-start", backgroundColor: "rgba(60, 208, 154, 0.1)", paddingHorizontal: 10, paddingVertical: 6, borderRadius: 12 },
  removeBtn: { marginTop: 24, alignSelf: "flex-start" },
  removeBtnText: { color: "#FF5C5C", fontSize: 14, fontWeight: "600" },
  formSection: { marginTop: 8 },
  sectionTitle: { fontSize: 20, fontWeight: "700", marginBottom: 8 },
  sectionDesc: { fontSize: 14, lineHeight: 22, marginBottom: 24 },
  phoneInputRow: { flexDirection: "row", marginBottom: 24, gap: 12 },
  countrySelector: { flexDirection: "row", alignItems: "center", paddingHorizontal: 16, height: 56, borderRadius: 16, borderWidth: 1 },
  input: { height: 56, borderRadius: 16, paddingHorizontal: 16, borderWidth: 1, fontSize: 16 },
  primaryBtn: { height: 56, borderRadius: 16, justifyContent: "center", alignItems: "center" },
  primaryBtnText: { color: "#FFF", fontSize: 16, fontWeight: "700" },
  verifyCard: { alignItems: "center", padding: 32, borderRadius: 24 },
  verifyTitle: { fontSize: 20, fontWeight: "700", marginBottom: 12 },
  verifyDesc: { fontSize: 15, textAlign: "center", lineHeight: 22, marginBottom: 24 },
});
