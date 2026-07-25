import React, { useState } from "react";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Switch } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { useTheme } from "@/src/theme";

export default function PrivacyScreen() {
  const { theme } = useTheme();
  const router = useRouter();

  const [usageAnalytics, setUsageAnalytics] = useState(true);
  const [personalisation, setPersonalisation] = useState(true);
  const [crashReports, setCrashReports] = useState(true);

  const ToggleRow = ({ label, value, onChange, desc, showBorder = true }: any) => (
    <View style={[styles.toggleContainer, showBorder && { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: theme.colors.border }]}>
      <View style={styles.toggleTextWrap}>
        <Text style={[styles.toggleLabel, { color: theme.colors.textPrimary }]}>{label}</Text>
        <Text style={[styles.toggleDesc, { color: theme.colors.textSecondary }]}>{desc}</Text>
      </View>
      <Switch
        value={value}
        onValueChange={onChange}
        trackColor={{ false: theme.colors.border, true: theme.colors.primary }}
        thumbColor="#FFFFFF"
      />
    </View>
  );

  return (
    <SafeAreaView edges={["top"]} style={{ flex: 1, backgroundColor: theme.colors.background }}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color={theme.colors.textPrimary} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: theme.colors.textPrimary }]}>Privacy</Text>
        <View style={{ width: 40 }} />
      </View>
      <ScrollView contentContainerStyle={{ paddingVertical: 20 }}>
        
        <Text style={[styles.sectionTitle, { color: theme.colors.textSecondary }]}>Privacy Preferences</Text>
        <View style={[styles.cardGroup, { backgroundColor: theme.colors.surfaceElevated }]}>
          <ToggleRow 
            label="Usage Analytics" 
            desc="Help us improve Veytrix by sharing anonymous usage data." 
            value={usageAnalytics} 
            onChange={setUsageAnalytics} 
          />
          <ToggleRow 
            label="Personalisation" 
            desc="Allow us to use your activity to provide personalized content and offers." 
            value={personalisation} 
            onChange={setPersonalisation} 
          />
          <ToggleRow 
            label="Crash Reports" 
            desc="Automatically send crash reports to help us fix bugs faster." 
            value={crashReports} 
            onChange={setCrashReports} 
            showBorder={false}
          />
        </View>

        <Text style={[styles.sectionTitle, { color: theme.colors.textSecondary, marginTop: 32 }]}>Account Security & Data</Text>
        <View style={[styles.cardGroup, { backgroundColor: theme.colors.surfaceElevated }]}>
          <TouchableOpacity style={[styles.linkRow, { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: theme.colors.border }]} onPress={() => router.push("/settings/account-information/DownloadMyData")}>
            <Text style={[styles.linkLabel, { color: theme.colors.textPrimary }]}>Download My Data</Text>
            <Ionicons name="chevron-forward" size={16} color={theme.colors.border} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.linkRow} onPress={() => router.push("/settings/account-information/DeleteAccount")}>
            <Text style={[styles.linkLabel, { color: "#FF5C5C" }]}>Delete Account</Text>
            <Ionicons name="chevron-forward" size={16} color={theme.colors.border} />
          </TouchableOpacity>
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  header: { flexDirection: "row", alignItems: "center", paddingHorizontal: 16, paddingVertical: 12 },
  backBtn: { width: 40, height: 40, justifyContent: "center" },
  headerTitle: { flex: 1, textAlign: "center", fontSize: 18, fontWeight: "700" },
  sectionTitle: { fontSize: 13, fontWeight: "600", textTransform: "uppercase", marginBottom: 12, marginHorizontal: 36 },
  cardGroup: { marginHorizontal: 20, borderRadius: 20, overflow: "hidden" },
  toggleContainer: { flexDirection: "row", alignItems: "center", paddingVertical: 16, paddingHorizontal: 16 },
  toggleTextWrap: { flex: 1, paddingRight: 16 },
  toggleLabel: { fontSize: 16, fontWeight: "600", marginBottom: 4 },
  toggleDesc: { fontSize: 13, lineHeight: 18 },
  linkRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", padding: 16 },
  linkLabel: { fontSize: 16, fontWeight: "500" },
});
