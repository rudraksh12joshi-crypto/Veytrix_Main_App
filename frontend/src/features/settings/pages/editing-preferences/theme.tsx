import React from "react";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { useTheme } from "@/src/theme";
import { useEditorPreferencesStore, ThemeOption } from "@/src/store/editor-preferences.store";

const THEME_OPTIONS: { label: string; value: ThemeOption }[] = [
  { label: "System Default", value: "System Default" },
  { label: "Light", value: "Light" },
  { label: "Dark", value: "Dark" },
];

export default function ThemePreferencesScreen() {
  const { theme } = useTheme();
  const router = useRouter();
  const { theme: currentTheme, setTheme } = useEditorPreferencesStore();

  return (
    <SafeAreaView edges={["top"]} style={{ flex: 1, backgroundColor: theme.colors.background }}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color={theme.colors.textPrimary} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: theme.colors.textPrimary }]}>Theme</Text>
        <View style={{ width: 40 }} />
      </View>
      <ScrollView contentContainerStyle={{ paddingVertical: 20 }}>
        <View style={[styles.cardGroup, { backgroundColor: theme.colors.surfaceElevated }]}>
          {THEME_OPTIONS.map((item, index) => {
            const isLast = index === THEME_OPTIONS.length - 1;
            const isSelected = currentTheme === item.value;
            return (
              <TouchableOpacity
                key={item.value}
                style={[styles.listItem, !isLast && { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: theme.colors.border }]}
                activeOpacity={0.7}
                onPress={() => setTheme(item.value)}
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
          System Default follows your device's appearance settings.
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
