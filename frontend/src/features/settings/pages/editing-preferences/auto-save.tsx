import React from "react";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Switch } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { useTheme } from "@/src/theme";
import { useEditorPreferencesStore, SaveInterval } from "@/src/store/editor-preferences.store";

const INTERVAL_OPTIONS: { label: string; value: SaveInterval }[] = [
  { label: "30 seconds", value: "30 seconds" },
  { label: "1 minute", value: "1 minute" },
  { label: "2 minutes", value: "2 minutes" },
  { label: "5 minutes", value: "5 minutes" },
];

export default function AutoSavePreferencesScreen() {
  const { theme } = useTheme();
  const router = useRouter();
  const {
    autoSaveEnabled, setAutoSaveEnabled,
    autoSaveInterval, setAutoSaveInterval,
    saveOnBackground, setSaveOnBackground,
    saveOnExit, setSaveOnExit
  } = useEditorPreferencesStore();

  return (
    <SafeAreaView edges={["top"]} style={{ flex: 1, backgroundColor: theme.colors.background }}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color={theme.colors.textPrimary} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: theme.colors.textPrimary }]}>Auto Save</Text>
        <View style={{ width: 40 }} />
      </View>
      <ScrollView contentContainerStyle={{ paddingVertical: 20 }}>
        
        <View style={[styles.cardGroup, { backgroundColor: theme.colors.surfaceElevated, marginBottom: 20 }]}>
          <View style={styles.listItem}>
            <Text style={[styles.listTitle, { color: theme.colors.textPrimary, flex: 1 }]}>Auto Save</Text>
            <Switch
              value={autoSaveEnabled}
              onValueChange={setAutoSaveEnabled}
              trackColor={{ false: theme.colors.border, true: theme.colors.primary }}
            />
          </View>
        </View>

        {autoSaveEnabled && (
          <>
            <Text style={[styles.sectionTitle, { color: theme.colors.textSecondary }]}>SAVE INTERVAL</Text>
            <View style={[styles.cardGroup, { backgroundColor: theme.colors.surfaceElevated, marginBottom: 20 }]}>
              {INTERVAL_OPTIONS.map((item, index) => {
                const isLast = index === INTERVAL_OPTIONS.length - 1;
                const isSelected = autoSaveInterval === item.value;
                return (
                  <TouchableOpacity
                    key={item.value}
                    style={[styles.listItem, !isLast && { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: theme.colors.border }]}
                    activeOpacity={0.7}
                    onPress={() => setAutoSaveInterval(item.value)}
                  >
                    <Text style={[styles.listTitle, { color: theme.colors.textPrimary, flex: 1 }]}>
                      {item.label}
                    </Text>
                    {isSelected && (
                      <Ionicons name="checkmark" size={20} color={theme.colors.primary} />
                    )}
                  </TouchableOpacity>
                );
              })}
            </View>

            <Text style={[styles.sectionTitle, { color: theme.colors.textSecondary }]}>ADDITIONAL TRIGGERS</Text>
            <View style={[styles.cardGroup, { backgroundColor: theme.colors.surfaceElevated }]}>
              <View style={[styles.listItem, { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: theme.colors.border }]}>
                <Text style={[styles.listTitle, { color: theme.colors.textPrimary, flex: 1 }]}>Save on App Background</Text>
                <Switch
                  value={saveOnBackground}
                  onValueChange={setSaveOnBackground}
                  trackColor={{ false: theme.colors.border, true: theme.colors.primary }}
                />
              </View>
              <View style={styles.listItem}>
                <Text style={[styles.listTitle, { color: theme.colors.textPrimary, flex: 1 }]}>Save on Editor Exit</Text>
                <Switch
                  value={saveOnExit}
                  onValueChange={setSaveOnExit}
                  trackColor={{ false: theme.colors.border, true: theme.colors.primary }}
                />
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
