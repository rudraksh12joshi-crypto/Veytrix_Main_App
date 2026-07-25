import React from "react";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Switch } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { useTheme } from "@/src/theme";
import { useEditorPreferencesStore } from "@/src/store/editor-preferences.store";

export default function HardwareAccelerationPreferencesScreen() {
  const { theme } = useTheme();
  const router = useRouter();
  const prefs = useEditorPreferencesStore();
  const setPref = prefs.setHwPreference;

  return (
    <SafeAreaView edges={["top"]} style={{ flex: 1, backgroundColor: theme.colors.background }}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color={theme.colors.textPrimary} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: theme.colors.textPrimary }]}>Hardware Acceleration</Text>
        <View style={{ width: 40 }} />
      </View>
      <ScrollView contentContainerStyle={{ paddingVertical: 20 }}>
        
        <View style={[styles.cardGroup, { backgroundColor: theme.colors.surfaceElevated, marginBottom: 20 }]}>
          <View style={styles.listItem}>
            <Text style={[styles.listTitle, { color: theme.colors.textPrimary, flex: 1 }]}>Hardware Acceleration</Text>
            <Switch
              value={prefs.hwAccelerationEnabled}
              onValueChange={(v) => setPref("hwAccelerationEnabled", v)}
              trackColor={{ true: theme.colors.primary }}
            />
          </View>
        </View>

        {prefs.hwAccelerationEnabled && (
          <>
            <Text style={[styles.sectionTitle, { color: theme.colors.textSecondary }]}>CAPABILITIES</Text>
            <View style={[styles.cardGroup, { backgroundColor: theme.colors.surfaceElevated }]}>
              <View style={[styles.listItem, { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: theme.colors.border }]}>
                <Text style={[styles.listTitle, { color: theme.colors.textPrimary, flex: 1 }]}>Hardware Video Decode</Text>
                <Switch value={prefs.hwVideoDecode} onValueChange={(v) => setPref("hwVideoDecode", v)} trackColor={{ true: theme.colors.primary }} />
              </View>
              <View style={[styles.listItem, { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: theme.colors.border }]}>
                <Text style={[styles.listTitle, { color: theme.colors.textPrimary, flex: 1 }]}>Hardware Video Encode</Text>
                <Switch value={prefs.hwVideoEncode} onValueChange={(v) => setPref("hwVideoEncode", v)} trackColor={{ true: theme.colors.primary }} />
              </View>
              <View style={styles.listItem}>
                <Text style={[styles.listTitle, { color: theme.colors.textPrimary, flex: 1 }]}>GPU Effects Processing</Text>
                <Switch value={prefs.hwGpuEffects} onValueChange={(v) => setPref("hwGpuEffects", v)} trackColor={{ true: theme.colors.primary }} />
              </View>
            </View>
          </>
        )}

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  header: { flexDirection: "row", alignItems: "center", paddingHorizontal: 16, paddingVertical: 12 },
  backBtn: { width: 40, height: 40, justifyContent: "center" },
  headerTitle: { flex: 1, textAlign: "center", fontSize: 18, fontWeight: "700" },
  sectionTitle: { fontSize: 13, fontWeight: "600", marginHorizontal: 36, marginBottom: 8, marginTop: 10 },
  cardGroup: { marginHorizontal: 20, borderRadius: 20, overflow: "hidden" },
  listItem: { flexDirection: "row", alignItems: "center", paddingVertical: 14, paddingHorizontal: 16 },
  listTitle: { fontSize: 16, fontWeight: "500" }
});
