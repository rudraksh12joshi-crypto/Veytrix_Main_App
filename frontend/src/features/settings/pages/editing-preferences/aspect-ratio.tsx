import React from "react";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { useTheme } from "@/src/theme";
import { useEditorPreferencesStore, AspectRatioOption } from "@/src/store/editor-preferences.store";

const OPTIONS: { label: string; value: AspectRatioOption }[] = [
  { label: "Original", value: "Original" },
  { label: "16:9 — Landscape", value: "16:9" },
  { label: "9:16 — Vertical", value: "9:16" },
  { label: "1:1 — Square", value: "1:1" },
  { label: "4:5 — Portrait", value: "4:5" },
  { label: "4:3", value: "4:3" },
  { label: "3:4", value: "3:4" },
];

export default function PreferredAspectRatioScreen() {
  const { theme } = useTheme();
  const router = useRouter();
  const { preferredAspectRatio, setPreferredAspectRatio } = useEditorPreferencesStore();

  return (
    <SafeAreaView edges={["top"]} style={{ flex: 1, backgroundColor: theme.colors.background }}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color={theme.colors.textPrimary} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: theme.colors.textPrimary }]}>Preferred Aspect Ratio</Text>
        <View style={{ width: 40 }} />
      </View>
      <ScrollView contentContainerStyle={{ paddingVertical: 20 }}>
        <View style={[styles.cardGroup, { backgroundColor: theme.colors.surfaceElevated }]}>
          {OPTIONS.map((item, index) => {
            const isLast = index === OPTIONS.length - 1;
            const isSelected = preferredAspectRatio === item.value;
            return (
              <TouchableOpacity
                key={item.value}
                style={[styles.listItem, !isLast && { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: theme.colors.border }]}
                activeOpacity={0.7}
                onPress={() => setPreferredAspectRatio(item.value)}
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
          Used when creating a new editing canvas. Changing this does not affect existing projects.
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
