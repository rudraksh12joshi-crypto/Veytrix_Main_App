import React from "react";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Switch } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { useTheme } from "@/src/theme";
import { useEditorPreferencesStore } from "@/src/store/editor-preferences.store";

export default function MagneticTimelinePreferencesScreen() {
  const { theme } = useTheme();
  const router = useRouter();
  const { magneticTimelineEnabled, setMagneticTimelineEnabled } = useEditorPreferencesStore();

  return (
    <SafeAreaView edges={["top"]} style={{ flex: 1, backgroundColor: theme.colors.background }}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color={theme.colors.textPrimary} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: theme.colors.textPrimary }]}>Magnetic Timeline</Text>
        <View style={{ width: 40 }} />
      </View>
      <ScrollView contentContainerStyle={{ paddingVertical: 20 }}>
        
        <View style={[styles.cardGroup, { backgroundColor: theme.colors.surfaceElevated }]}>
          <View style={styles.listItem}>
            <Text style={[styles.listTitle, { color: theme.colors.textPrimary, flex: 1 }]}>Magnetic Timeline</Text>
            <Switch
              value={magneticTimelineEnabled}
              onValueChange={setMagneticTimelineEnabled}
              trackColor={{ true: theme.colors.primary }}
            />
          </View>
        </View>

        <Text style={[styles.footerText, { color: theme.colors.textSecondary }]}>
          When enabled, deleting or moving clips will automatically close timeline gaps. Keep this separate from Snap Timeline which only provides alignment assistance.
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  header: { flexDirection: "row", alignItems: "center", paddingHorizontal: 16, paddingVertical: 12 },
  backBtn: { width: 40, height: 40, justifyContent: "center" },
  headerTitle: { flex: 1, textAlign: "center", fontSize: 18, fontWeight: "700" },
  cardGroup: { marginHorizontal: 20, borderRadius: 20, overflow: "hidden" },
  listItem: { flexDirection: "row", alignItems: "center", paddingVertical: 14, paddingHorizontal: 16 },
  listTitle: { fontSize: 16, fontWeight: "500" },
  footerText: { marginTop: 16, marginHorizontal: 36, fontSize: 13, textAlign: "center" }
});
