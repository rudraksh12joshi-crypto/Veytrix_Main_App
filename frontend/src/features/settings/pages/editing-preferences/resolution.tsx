import React from "react";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { useTheme } from "@/src/theme";
import { useEditorPreferencesStore, ResolutionOption } from "@/src/store/editor-preferences.store";

const OPTIONS: { label: string; value: ResolutionOption }[] = [
  { label: "480p", value: "480p" },
  { label: "720p", value: "720p" },
  { label: "1080p", value: "1080p" },
  { label: "1440p", value: "1440p" },
  { label: "2160p / 4K", value: "2160p / 4K" },
];

export default function DefaultResolutionScreen() {
  const { theme } = useTheme();
  const router = useRouter();
  const { defaultResolution, setDefaultResolution } = useEditorPreferencesStore();

  return (
    <SafeAreaView edges={["top"]} style={{ flex: 1, backgroundColor: theme.colors.background }}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color={theme.colors.textPrimary} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: theme.colors.textPrimary }]}>Default Resolution</Text>
        <View style={{ width: 40 }} />
      </View>
      <ScrollView contentContainerStyle={{ paddingVertical: 20 }}>
        <View style={[styles.cardGroup, { backgroundColor: theme.colors.surfaceElevated }]}>
          {OPTIONS.map((item, index) => {
            const isLast = index === OPTIONS.length - 1;
            const isSelected = defaultResolution === item.value;
            return (
              <TouchableOpacity
                key={item.value}
                style={[styles.listItem, !isLast && { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: theme.colors.border }]}
                activeOpacity={0.7}
                onPress={() => setDefaultResolution(item.value)}
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
          Apply this to newly created projects and default export configuration. Changing this will not modify existing projects.
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
