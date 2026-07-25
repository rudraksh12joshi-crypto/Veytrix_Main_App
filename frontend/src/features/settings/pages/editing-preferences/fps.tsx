import React from "react";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { useTheme } from "@/src/theme";
import { useEditorPreferencesStore, FPSOption } from "@/src/store/editor-preferences.store";

const OPTIONS: { label: string; value: FPSOption }[] = [
  { label: "24 FPS", value: "24 FPS" },
  { label: "25 FPS", value: "25 FPS" },
  { label: "30 FPS", value: "30 FPS" },
  { label: "50 FPS", value: "50 FPS" },
  { label: "60 FPS", value: "60 FPS" },
  { label: "Match Source", value: "Match Source" },
];

export default function DefaultFPSScreen() {
  const { theme } = useTheme();
  const router = useRouter();
  const { defaultFPS, setDefaultFPS } = useEditorPreferencesStore();

  return (
    <SafeAreaView edges={["top"]} style={{ flex: 1, backgroundColor: theme.colors.background }}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color={theme.colors.textPrimary} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: theme.colors.textPrimary }]}>Default FPS</Text>
        <View style={{ width: 40 }} />
      </View>
      <ScrollView contentContainerStyle={{ paddingVertical: 20 }}>
        <View style={[styles.cardGroup, { backgroundColor: theme.colors.surfaceElevated }]}>
          {OPTIONS.map((item, index) => {
            const isLast = index === OPTIONS.length - 1;
            const isSelected = defaultFPS === item.value;
            return (
              <TouchableOpacity
                key={item.value}
                style={[styles.listItem, !isLast && { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: theme.colors.border }]}
                activeOpacity={0.7}
                onPress={() => setDefaultFPS(item.value)}
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
        <Text style={[styles.footerText, { color: theme.colors.textSecondary }]}>
          Used when creating projects and opening export settings.
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
  listItem: { flexDirection: "row", alignItems: "center", paddingVertical: 16, paddingHorizontal: 16 },
  listTitle: { fontSize: 16, fontWeight: "500" },
  footerText: { marginTop: 16, marginHorizontal: 36, fontSize: 13, textAlign: "center" }
});
