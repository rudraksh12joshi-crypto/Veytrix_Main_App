import React from "react";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Switch, Alert } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { useTheme } from "@/src/theme";
import { useEditorPreferencesStore, ProxyModeOption, ProxyQualityOption } from "@/src/store/editor-preferences.store";

const MODES: { label: string; value: ProxyModeOption }[] = [
  { label: "Off", value: "Off" },
  { label: "Auto", value: "Auto" },
  { label: "Always", value: "Always" },
];

const QUALITIES: { label: string; value: ProxyQualityOption }[] = [
  { label: "Low", value: "Low" },
  { label: "Medium", value: "Medium" },
  { label: "High", value: "High" },
];

export default function ProxyEditingPreferencesScreen() {
  const { theme } = useTheme();
  const router = useRouter();
  const prefs = useEditorPreferencesStore();
  const setPref = prefs.setProxyPreference;

  const handleClearProxies = () => {
    Alert.alert(
      "Clear Proxy Files",
      "Are you sure you want to delete all proxy files? They will be regenerated when needed.",
      [
        { text: "Cancel", style: "cancel" },
        { text: "Delete", style: "destructive", onPress: () => console.log("Proxies cleared") }
      ]
    );
  };

  return (
    <SafeAreaView edges={["top"]} style={{ flex: 1, backgroundColor: theme.colors.background }}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color={theme.colors.textPrimary} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: theme.colors.textPrimary }]}>Proxy Editing</Text>
        <View style={{ width: 40 }} />
      </View>
      <ScrollView contentContainerStyle={{ paddingVertical: 20 }}>
        
        <Text style={[styles.sectionTitle, { color: theme.colors.textSecondary }]}>PROXY MODE</Text>
        <View style={[styles.cardGroup, { backgroundColor: theme.colors.surfaceElevated, marginBottom: 20 }]}>
          {MODES.map((item, index) => {
            const isLast = index === MODES.length - 1;
            const isSelected = prefs.proxyMode === item.value;
            return (
              <TouchableOpacity
                key={item.value}
                style={[styles.listItem, !isLast && { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: theme.colors.border }]}
                activeOpacity={0.7}
                onPress={() => setPref("proxyMode", item.value)}
              >
                <Text style={[styles.listTitle, { color: theme.colors.textPrimary, flex: 1 }]}>{item.label}</Text>
                {isSelected && <Ionicons name="checkmark" size={20} color={theme.colors.primary} />}
              </TouchableOpacity>
            );
          })}
        </View>

        {prefs.proxyMode !== "Off" && (
          <>
            <Text style={[styles.sectionTitle, { color: theme.colors.textSecondary }]}>PROXY QUALITY</Text>
            <View style={[styles.cardGroup, { backgroundColor: theme.colors.surfaceElevated, marginBottom: 20 }]}>
              {QUALITIES.map((item, index) => {
                const isLast = index === QUALITIES.length - 1;
                const isSelected = prefs.proxyQuality === item.value;
                return (
                  <TouchableOpacity
                    key={item.value}
                    style={[styles.listItem, !isLast && { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: theme.colors.border }]}
                    activeOpacity={0.7}
                    onPress={() => setPref("proxyQuality", item.value)}
                  >
                    <Text style={[styles.listTitle, { color: theme.colors.textPrimary, flex: 1 }]}>{item.label}</Text>
                    {isSelected && <Ionicons name="checkmark" size={20} color={theme.colors.primary} />}
                  </TouchableOpacity>
                );
              })}
            </View>

            <View style={[styles.cardGroup, { backgroundColor: theme.colors.surfaceElevated, marginBottom: 20 }]}>
              <View style={styles.listItem}>
                <Text style={[styles.listTitle, { color: theme.colors.textPrimary, flex: 1 }]}>Generate Proxies Automatically</Text>
                <Switch value={prefs.proxyGenerateAuto} onValueChange={(v) => setPref("proxyGenerateAuto", v)} trackColor={{ true: theme.colors.primary }} />
              </View>
            </View>
            
            <View style={[styles.cardGroup, { backgroundColor: theme.colors.surfaceElevated }]}>
              <TouchableOpacity style={styles.listItem} onPress={handleClearProxies} activeOpacity={0.7}>
                <Text style={[styles.listTitle, { color: "#FF5C5C", flex: 1, textAlign: "center" }]}>Delete Proxy Files</Text>
              </TouchableOpacity>
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
  listItem: { flexDirection: "row", alignItems: "center", paddingVertical: 16, paddingHorizontal: 16 },
  listTitle: { fontSize: 16, fontWeight: "500" }
});
