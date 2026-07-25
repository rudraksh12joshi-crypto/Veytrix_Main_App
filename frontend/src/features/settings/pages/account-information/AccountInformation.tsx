import React from "react";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { useTheme } from "@/src/theme";
import { useAuthStore } from "@/src/store/auth.store";

export default function AccountInformationScreen() {
  const { theme } = useTheme();
  const router = useRouter();
  const { user } = useAuthStore();

  const InfoRow = ({ label, value, showBorder = true, isMuted = false }: any) => (
    <View style={[styles.row, showBorder && { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: theme.colors.border }]}>
      <Text style={[styles.label, { color: theme.colors.textSecondary }]}>{label}</Text>
      <Text style={[styles.value, { color: isMuted ? theme.colors.textMuted : theme.colors.textPrimary }]}>{value}</Text>
    </View>
  );

  return (
    <SafeAreaView edges={["top"]} style={{ flex: 1, backgroundColor: theme.colors.background }}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color={theme.colors.textPrimary} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: theme.colors.textPrimary }]}>Account Information</Text>
        <View style={{ width: 40 }} />
      </View>
      <ScrollView contentContainerStyle={{ paddingVertical: 24 }}>
        <View style={[styles.card, { backgroundColor: theme.colors.surfaceElevated }]}>
          <InfoRow label="Display Name" value={user?.displayName || "Veytrix Creator"} />
          <InfoRow label="Username" value={user?.displayName ? `@${user.displayName.toLowerCase().replace(/\s/g, '')}` : "@creator"} />
          <InfoRow label="Member Since" value="August 2026" />
          <InfoRow label="Account Type" value="Pro / Premium" />
          <InfoRow label="Account Status" value="Active" />
          <InfoRow label="Account ID" value={user?.id || "USR-001X-998"} showBorder={false} isMuted={true} />
        </View>

        <Text style={[styles.footerText, { color: theme.colors.textSecondary }]}>
          Certain account properties cannot be edited here. To manage your email, phone, or password, visit their respective settings pages.
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  header: { flexDirection: "row", alignItems: "center", paddingHorizontal: 16, paddingVertical: 12 },
  backBtn: { width: 40, height: 40, justifyContent: "center" },
  headerTitle: { flex: 1, textAlign: "center", fontSize: 18, fontWeight: "700" },
  card: { marginHorizontal: 20, borderRadius: 20, paddingHorizontal: 16 },
  row: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingVertical: 16 },
  label: { fontSize: 15, fontWeight: "500" },
  value: { fontSize: 15, fontWeight: "400" },
  footerText: { marginHorizontal: 36, marginTop: 24, fontSize: 13, textAlign: "center", lineHeight: 20 },
});
