import React, { useState } from "react";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { useTheme } from "@/src/theme";

export default function DownloadMyDataScreen() {
  const { theme } = useTheme();
  const router = useRouter();

  const [status, setStatus] = useState<"idle" | "preparing" | "ready" | "failed">("idle");

  const handleRequestExport = () => {
    setStatus("preparing");
    setTimeout(() => {
      setStatus("ready");
    }, 2500); // Simulate backend gathering data
  };

  return (
    <SafeAreaView edges={["top"]} style={{ flex: 1, backgroundColor: theme.colors.background }}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color={theme.colors.textPrimary} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: theme.colors.textPrimary }]}>Download My Data</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={{ padding: 24 }}>
        
        <View style={styles.heroSection}>
          <View style={[styles.heroIconWrap, { backgroundColor: theme.colors.surfaceElevated }]}>
            <Ionicons name="cloud-download" size={48} color={theme.colors.textPrimary} />
          </View>
        </View>

        {status === "idle" && (
          <View>
            <Text style={[styles.title, { color: theme.colors.textPrimary }]}>Request Data Export</Text>
            <Text style={[styles.desc, { color: theme.colors.textSecondary }]}>
              You can request a copy of your Veytrix data at any time. The export will include:
            </Text>
            
            <View style={[styles.listCard, { backgroundColor: theme.colors.surfaceElevated }]}>
              <View style={styles.listItem}><Ionicons name="person" size={20} color={theme.colors.textMuted} style={styles.listIcon} /><Text style={{ color: theme.colors.textPrimary, fontSize: 15 }}>Profile information</Text></View>
              <View style={styles.listItem}><Ionicons name="folder" size={20} color={theme.colors.textMuted} style={styles.listIcon} /><Text style={{ color: theme.colors.textPrimary, fontSize: 15 }}>Projects metadata</Text></View>
              <View style={styles.listItem}><Ionicons name="options" size={20} color={theme.colors.textMuted} style={styles.listIcon} /><Text style={{ color: theme.colors.textPrimary, fontSize: 15 }}>Settings & preferences</Text></View>
              <View style={styles.listItem}><Ionicons name="share" size={20} color={theme.colors.textMuted} style={styles.listIcon} /><Text style={{ color: theme.colors.textPrimary, fontSize: 15 }}>Export history</Text></View>
              <View style={[styles.listItem, { marginBottom: 0 }]}><Ionicons name="document-text" size={20} color={theme.colors.textMuted} style={styles.listIcon} /><Text style={{ color: theme.colors.textPrimary, fontSize: 15 }}>Account activity</Text></View>
            </View>

            <TouchableOpacity style={[styles.primaryBtn, { backgroundColor: theme.colors.primary }]} onPress={handleRequestExport}>
              <Text style={styles.primaryBtnText}>Request Data Export</Text>
            </TouchableOpacity>
          </View>
        )}

        {status === "preparing" && (
          <View style={styles.statusBox}>
            <ActivityIndicator size="large" color={theme.colors.primary} style={{ marginBottom: 20 }} />
            <Text style={[styles.title, { color: theme.colors.textPrimary, textAlign: "center" }]}>Preparing Export</Text>
            <Text style={[styles.desc, { color: theme.colors.textSecondary, textAlign: "center", paddingHorizontal: 12 }]}>
              We are gathering your data. This can take some time. You can safely leave this page—we'll notify you when it's ready.
            </Text>
          </View>
        )}

        {status === "ready" && (
          <View style={styles.statusBox}>
            <Ionicons name="checkmark-circle" size={64} color="#3CD09A" style={{ marginBottom: 16 }} />
            <Text style={[styles.title, { color: theme.colors.textPrimary, textAlign: "center" }]}>Export Ready</Text>
            <Text style={[styles.desc, { color: theme.colors.textSecondary, textAlign: "center", paddingHorizontal: 12 }]}>
              Your data export is ready to download. This link will expire in 7 days.
            </Text>
            <TouchableOpacity style={[styles.primaryBtn, { backgroundColor: theme.colors.primary, width: "100%", marginTop: 24 }]}>
              <Ionicons name="download-outline" size={20} color="#FFF" style={{ marginRight: 8 }} />
              <Text style={styles.primaryBtnText}>Download Archive (.zip)</Text>
            </TouchableOpacity>
          </View>
        )}

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  header: { flexDirection: "row", alignItems: "center", paddingHorizontal: 16, paddingVertical: 12 },
  backBtn: { width: 40, height: 40, justifyContent: "center" },
  headerTitle: { flex: 1, textAlign: "center", fontSize: 18, fontWeight: "700" },
  heroSection: { alignItems: "center", marginBottom: 32, marginTop: 12 },
  heroIconWrap: { width: 96, height: 96, borderRadius: 48, justifyContent: "center", alignItems: "center" },
  title: { fontSize: 22, fontWeight: "700", marginBottom: 12 },
  desc: { fontSize: 15, lineHeight: 22, marginBottom: 24 },
  listCard: { padding: 20, borderRadius: 20, marginBottom: 32 },
  listItem: { flexDirection: "row", alignItems: "center", marginBottom: 16 },
  listIcon: { marginRight: 12 },
  primaryBtn: { flexDirection: "row", height: 56, borderRadius: 16, justifyContent: "center", alignItems: "center" },
  primaryBtnText: { color: "#FFF", fontSize: 16, fontWeight: "700" },
  statusBox: { alignItems: "center", marginTop: 20 },
});
