import React, { useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, ActivityIndicator, Alert } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { useTheme } from "@/src/theme";

export default function AppleAccountScreen() {
  const { theme } = useTheme();
  const router = useRouter();

  const [isLinked, setIsLinked] = useState(false); // Mock real state from auth provider
  const [isLoading, setIsLoading] = useState(false);

  const handleToggleLink = () => {
    if (isLinked) {
      Alert.alert(
        "Unlink Apple Account",
        "Are you sure you want to unlink your Apple account? You will no longer be able to sign in with Apple.",
        [
          { text: "Cancel", style: "cancel" },
          { 
            text: "Unlink", 
            style: "destructive",
            onPress: () => {
              setIsLoading(true);
              setTimeout(() => { setIsLinked(false); setIsLoading(false); }, 1500);
            }
          }
        ]
      );
    } else {
      setIsLoading(true);
      setTimeout(() => { setIsLinked(true); setIsLoading(false); }, 1500);
    }
  };

  return (
    <SafeAreaView edges={["top"]} style={{ flex: 1, backgroundColor: theme.colors.background }}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color={theme.colors.textPrimary} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: theme.colors.textPrimary }]}>Apple Account</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={{ padding: 24 }}>
        <View style={styles.centerSection}>
          <View style={[styles.iconWrapper, { backgroundColor: theme.colors.surfaceElevated }]}>
            <Ionicons name="logo-apple" size={48} color={theme.colors.textPrimary} />
          </View>
          <Text style={[styles.statusText, { color: isLinked ? "#3CD09A" : theme.colors.textSecondary }]}>
            {isLinked ? "Connected" : "Not Connected"}
          </Text>
        </View>

        {isLinked ? (
          <View style={[styles.infoCard, { backgroundColor: theme.colors.surfaceElevated }]}>
            <Text style={[styles.infoLabel, { color: theme.colors.textSecondary }]}>Apple Private Relay</Text>
            <Text style={[styles.infoValue, { color: theme.colors.textPrimary }]}>Privately routed email active</Text>
          </View>
        ) : (
          <Text style={[styles.descText, { color: theme.colors.textSecondary }]}>
            Connect your Apple account to sign in securely with Face ID or Touch ID.
          </Text>
        )}
      </ScrollView>

      <View style={[styles.footer, { backgroundColor: theme.colors.background, borderTopColor: theme.colors.border }]}>
        <TouchableOpacity
          style={[styles.primaryBtn, { backgroundColor: isLinked ? "rgba(255, 92, 92, 0.1)" : theme.colors.primary }]}
          onPress={handleToggleLink}
          disabled={isLoading}
        >
          {isLoading ? (
            <ActivityIndicator color={isLinked ? "#FF5C5C" : "#FFF"} />
          ) : (
            <Text style={[styles.primaryBtnText, { color: isLinked ? "#FF5C5C" : "#FFF" }]}>
              {isLinked ? "Unlink Apple Account" : "Connect Apple Account"}
            </Text>
          )}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  header: { flexDirection: "row", alignItems: "center", paddingHorizontal: 16, paddingVertical: 12 },
  backBtn: { width: 40, height: 40, justifyContent: "center" },
  headerTitle: { flex: 1, textAlign: "center", fontSize: 18, fontWeight: "700" },
  centerSection: { alignItems: "center", marginBottom: 40, marginTop: 20 },
  iconWrapper: { width: 100, height: 100, borderRadius: 50, justifyContent: "center", alignItems: "center", marginBottom: 16 },
  statusText: { fontSize: 18, fontWeight: "700" },
  infoCard: { padding: 20, borderRadius: 20 },
  infoLabel: { fontSize: 13, fontWeight: "600", marginBottom: 8, textTransform: "uppercase" },
  infoValue: { fontSize: 16, fontWeight: "500" },
  descText: { fontSize: 15, textAlign: "center", lineHeight: 24 },
  footer: { padding: 20, borderTopWidth: 1 },
  primaryBtn: { height: 56, borderRadius: 16, justifyContent: "center", alignItems: "center" },
  primaryBtnText: { fontSize: 16, fontWeight: "700" },
});
