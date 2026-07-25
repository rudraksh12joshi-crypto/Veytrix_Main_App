import React from "react";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { useTheme } from "@/src/theme";

export default function LinkedAccountsScreen() {
  const { theme } = useTheme();
  const router = useRouter();

  // MOCK: Replace with real user authentication provider linked status
  const isGoogleLinked = true;
  const isAppleLinked = false;

  const AccountRow = ({ provider, isLinked, icon, route }: any) => (
    <TouchableOpacity
      style={[styles.row, { backgroundColor: theme.colors.surfaceElevated }]}
      activeOpacity={0.7}
      onPress={() => router.push(route)}
    >
      <View style={[styles.iconBox, { backgroundColor: theme.colors.background }]}>
        <Ionicons name={icon} size={24} color={theme.colors.textPrimary} />
      </View>
      <View style={styles.textContent}>
        <Text style={[styles.title, { color: theme.colors.textPrimary }]}>{provider}</Text>
        <Text style={[styles.subtitle, { color: isLinked ? "#3CD09A" : theme.colors.textMuted }]}>
          {isLinked ? "Linked" : "Not Linked"}
        </Text>
      </View>
      <Ionicons name="chevron-forward" size={16} color={theme.colors.border} />
    </TouchableOpacity>
  );

  return (
    <SafeAreaView edges={["top"]} style={{ flex: 1, backgroundColor: theme.colors.background }}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color={theme.colors.textPrimary} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: theme.colors.textPrimary }]}>Linked Accounts</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={{ padding: 20 }}>
        <Text style={[styles.description, { color: theme.colors.textSecondary }]}>
          Link your social or provider accounts to enable fast, secure sign-in.
        </Text>

        <AccountRow provider="Google" isLinked={isGoogleLinked} icon="logo-google" route="/settings/account-information/GoogleAccount" />
        <AccountRow provider="Apple" isLinked={isAppleLinked} icon="logo-apple" route="/settings/account-information/AppleAccount" />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  header: { flexDirection: "row", alignItems: "center", paddingHorizontal: 16, paddingVertical: 12 },
  backBtn: { width: 40, height: 40, justifyContent: "center" },
  headerTitle: { flex: 1, textAlign: "center", fontSize: 18, fontWeight: "700" },
  description: { fontSize: 14, lineHeight: 22, marginBottom: 24, paddingHorizontal: 4 },
  row: { flexDirection: "row", alignItems: "center", padding: 16, borderRadius: 20, marginBottom: 12 },
  iconBox: { width: 48, height: 48, borderRadius: 16, justifyContent: "center", alignItems: "center", marginRight: 16 },
  textContent: { flex: 1, justifyContent: "center" },
  title: { fontSize: 16, fontWeight: "600", marginBottom: 4 },
  subtitle: { fontSize: 13, fontWeight: "500" },
});
