import React from "react";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { useTheme } from "@/src/theme";
import { useEditorPreferencesStore, RenderEngineOption } from "@/src/store/editor-preferences.store";

const OPTIONS: { label: string; value: RenderEngineOption; supported: boolean }[] = [
  { label: "Automatic", value: "Automatic", supported: true },
  { label: "Metal", value: "Metal", supported: true },
  { label: "OpenGL", value: "OpenGL", supported: false }, // Pretend it's not supported to demonstrate logic as requested
];

export default function RenderEnginePreferencesScreen() {
  const { theme } = useTheme();
  const router = useRouter();
  const { renderEngine, setRenderEngine } = useEditorPreferencesStore();

  return (
    <SafeAreaView edges={["top"]} style={{ flex: 1, backgroundColor: theme.colors.background }}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color={theme.colors.textPrimary} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: theme.colors.textPrimary }]}>Render Engine</Text>
        <View style={{ width: 40 }} />
      </View>
      <ScrollView contentContainerStyle={{ paddingVertical: 20 }}>
        <View style={[styles.cardGroup, { backgroundColor: theme.colors.surfaceElevated }]}>
          {OPTIONS.map((item, index) => {
            const isLast = index === OPTIONS.length - 1;
            const isSelected = renderEngine === item.value;
            return (
              <TouchableOpacity
                key={item.value}
                style={[styles.listItem, !isLast && { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: theme.colors.border }]}
                activeOpacity={item.supported ? 0.7 : 1}
                onPress={() => {
                  if (item.supported) setRenderEngine(item.value);
                }}
              >
                <View style={{ flex: 1 }}>
                  <Text style={[styles.listTitle, { color: item.supported ? theme.colors.textPrimary : theme.colors.textMuted }]}>
                    {item.label}
                  </Text>
                  {!item.supported && (
                    <Text style={[styles.listSubtitle, { color: theme.colors.textMuted }]}>Unsupported on this device</Text>
                  )}
                </View>
                {isSelected && (
                  <Ionicons name="checkmark" size={20} color={theme.colors.primary} />
                )}
              </TouchableOpacity>
            );
          })}
        </View>
        <Text style={[styles.footerText, { color: theme.colors.textSecondary }]}>
          Automatic selects the most suitable renderer available. Changing the renderer may require restarting the editor.
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
  listSubtitle: { fontSize: 12, marginTop: 2 },
  footerText: { marginTop: 16, marginHorizontal: 36, fontSize: 13, textAlign: "center" }
});
