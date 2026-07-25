import React, { useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity, TextInput, KeyboardAvoidingView, Platform, ScrollView, ActivityIndicator } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { useTheme } from "@/src/theme";

export default function PasswordScreen() {
  const { theme } = useTheme();
  const router = useRouter();

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  
  const [isUpdating, setIsUpdating] = useState(false);
  const [success, setSuccess] = useState(false);

  const hasLength = newPassword.length >= 8;
  const hasUpper = /[A-Z]/.test(newPassword);
  const hasLower = /[a-z]/.test(newPassword);
  const hasNumber = /[0-9]/.test(newPassword);
  
  const passwordsMatch = newPassword === confirmPassword && newPassword.length > 0;
  const isFormValid = currentPassword.length > 0 && hasLength && hasUpper && hasLower && hasNumber && passwordsMatch;

  const handleUpdate = () => {
    if (!isFormValid) return;
    setIsUpdating(true);
    setTimeout(() => {
      setIsUpdating(false);
      setSuccess(true);
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    }, 1500);
  };

  return (
    <SafeAreaView edges={["top"]} style={{ flex: 1, backgroundColor: theme.colors.background }}>
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={{ flex: 1 }}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={24} color={theme.colors.textPrimary} />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: theme.colors.textPrimary }]}>Password</Text>
          <View style={{ width: 40 }} />
        </View>

        <ScrollView contentContainerStyle={{ padding: 24 }} keyboardShouldPersistTaps="handled">
          
          {success && (
            <View style={[styles.successCard, { backgroundColor: "rgba(60, 208, 154, 0.1)" }]}>
              <Ionicons name="checkmark-circle" size={32} color="#3CD09A" style={{ marginBottom: 12 }} />
              <Text style={{ color: "#3CD09A", fontSize: 18, fontWeight: "700", marginBottom: 8 }}>Password Updated</Text>
              <Text style={{ color: theme.colors.textSecondary, textAlign: "center", fontSize: 14, lineHeight: 20 }}>
                Your password has been changed successfully. You may want to sign out of other devices.
              </Text>
              <TouchableOpacity style={{ marginTop: 16, padding: 12, backgroundColor: theme.colors.surfaceElevated, borderRadius: 12 }}>
                <Text style={{ color: theme.colors.primary, fontWeight: "600" }}>Sign out of other devices</Text>
              </TouchableOpacity>
            </View>
          )}

          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: theme.colors.textSecondary }]}>Current Password</Text>
            <View style={[styles.inputWrapper, { backgroundColor: theme.colors.surfaceElevated, borderColor: theme.colors.border }]}>
              <TextInput
                style={[styles.input, { color: theme.colors.textPrimary }]}
                value={currentPassword}
                onChangeText={setCurrentPassword}
                placeholder="Enter current password"
                placeholderTextColor={theme.colors.textMuted}
                secureTextEntry={!showCurrent}
              />
              <TouchableOpacity onPress={() => setShowCurrent(!showCurrent)} style={styles.eyeBtn}>
                <Ionicons name={showCurrent ? "eye-off" : "eye"} size={20} color={theme.colors.textMuted} />
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: theme.colors.textSecondary }]}>New Password</Text>
            <View style={[styles.inputWrapper, { backgroundColor: theme.colors.surfaceElevated, borderColor: theme.colors.border }]}>
              <TextInput
                style={[styles.input, { color: theme.colors.textPrimary }]}
                value={newPassword}
                onChangeText={setNewPassword}
                placeholder="Enter new password"
                placeholderTextColor={theme.colors.textMuted}
                secureTextEntry={!showNew}
              />
              <TouchableOpacity onPress={() => setShowNew(!showNew)} style={styles.eyeBtn}>
                <Ionicons name={showNew ? "eye-off" : "eye"} size={20} color={theme.colors.textMuted} />
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: theme.colors.textSecondary }]}>Confirm New Password</Text>
            <View style={[styles.inputWrapper, { backgroundColor: theme.colors.surfaceElevated, borderColor: (confirmPassword.length > 0 && !passwordsMatch) ? "#FF5C5C" : theme.colors.border }]}>
              <TextInput
                style={[styles.input, { color: theme.colors.textPrimary }]}
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                placeholder="Confirm new password"
                placeholderTextColor={theme.colors.textMuted}
                secureTextEntry={!showConfirm}
              />
              <TouchableOpacity onPress={() => setShowConfirm(!showConfirm)} style={styles.eyeBtn}>
                <Ionicons name={showConfirm ? "eye-off" : "eye"} size={20} color={theme.colors.textMuted} />
              </TouchableOpacity>
            </View>
            {(confirmPassword.length > 0 && !passwordsMatch) && (
              <Text style={styles.errorText}>Passwords do not match</Text>
            )}
          </View>

          <View style={[styles.requirementsBox, { backgroundColor: theme.colors.surfaceElevated }]}>
            <Text style={[styles.reqTitle, { color: theme.colors.textPrimary }]}>Password Requirements</Text>
            <View style={styles.reqRow}>
              <Ionicons name="checkmark-circle" size={16} color={hasLength ? "#3CD09A" : theme.colors.textMuted} />
              <Text style={[styles.reqText, { color: hasLength ? theme.colors.textPrimary : theme.colors.textMuted }]}>At least 8 characters</Text>
            </View>
            <View style={styles.reqRow}>
              <Ionicons name="checkmark-circle" size={16} color={hasUpper ? "#3CD09A" : theme.colors.textMuted} />
              <Text style={[styles.reqText, { color: hasUpper ? theme.colors.textPrimary : theme.colors.textMuted }]}>One uppercase letter</Text>
            </View>
            <View style={styles.reqRow}>
              <Ionicons name="checkmark-circle" size={16} color={hasLower ? "#3CD09A" : theme.colors.textMuted} />
              <Text style={[styles.reqText, { color: hasLower ? theme.colors.textPrimary : theme.colors.textMuted }]}>One lowercase letter</Text>
            </View>
            <View style={styles.reqRow}>
              <Ionicons name="checkmark-circle" size={16} color={hasNumber ? "#3CD09A" : theme.colors.textMuted} />
              <Text style={[styles.reqText, { color: hasNumber ? theme.colors.textPrimary : theme.colors.textMuted }]}>One number</Text>
            </View>
          </View>

        </ScrollView>
        <View style={[styles.footer, { backgroundColor: theme.colors.background, borderTopColor: theme.colors.border }]}>
          <TouchableOpacity
            style={[styles.primaryBtn, (!isFormValid || isUpdating) ? { backgroundColor: theme.colors.border } : { backgroundColor: theme.colors.primary }]}
            disabled={!isFormValid || isUpdating}
            onPress={handleUpdate}
          >
            {isUpdating ? <ActivityIndicator color="#FFF" /> : <Text style={styles.primaryBtnText}>Update Password</Text>}
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
  successCard: { alignItems: "center", padding: 24, borderRadius: 20, marginBottom: 24 },
  inputGroup: { marginBottom: 20 },
  label: { fontSize: 13, fontWeight: "600", marginBottom: 8, marginLeft: 4 },
  inputWrapper: { flexDirection: "row", alignItems: "center", height: 56, borderRadius: 16, borderWidth: 1, paddingRight: 8 },
  input: { flex: 1, height: "100%", paddingHorizontal: 16, fontSize: 16 },
  eyeBtn: { padding: 8 },
  errorText: { color: "#FF5C5C", fontSize: 12, marginTop: 8, marginLeft: 4 },
  requirementsBox: { padding: 20, borderRadius: 20, marginTop: 12 },
  reqTitle: { fontSize: 15, fontWeight: "700", marginBottom: 12 },
  reqRow: { flexDirection: "row", alignItems: "center", marginBottom: 8, gap: 8 },
  reqText: { fontSize: 14 },
  footer: { padding: 20, borderTopWidth: 1 },
  primaryBtn: { height: 56, borderRadius: 16, justifyContent: "center", alignItems: "center" },
  primaryBtnText: { color: "#FFF", fontSize: 16, fontWeight: "700" },
});
