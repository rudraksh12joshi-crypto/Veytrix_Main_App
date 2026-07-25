import React from "react";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { useTheme } from "@/src/theme";
import { useEditorPreferencesStore, PlaybackQualityOption } from "@/src/store/editor-preferences.store";

const OPTIONS: { label: string; value: PlaybackQualityOption; desc: string }[] = [
  { label: "Auto", value: "Auto", desc: "Dynamically chosen based on device performance" },
  { label: "Low", value: "Low", desc: "Reduced preview resolution for maximum performance" },
  { label: "Medium", value: "Medium", desc: "Balanced preview quality and performance" },
  { label: "High", value: "High", desc: "High-quality preview" },
  { label: "Full", value: "Full", desc: "Full project/source preview quality" },
];

export default function PlaybackQualityPreferencesScreen() {
  const { theme } = useTheme();
  const router = useRouter();
  const { playbackQuality, setPlaybackQuality } = useEditorPreferencesStore();

  return (
    <SafeAreaView edges={["top"]} style={{ flex: 1, backgroundColor: theme.colors.background }}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color={theme.colors.textPrimary} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: theme.colors.textPrimary }]}>Playback Quality</Text>
        <View style={{ width: 40 }} />
      </View>
      <ScrollView contentContainerStyle={{ paddingVertical: 20 }}>
        <View style={[styles.cardGroup, { backgroundColor: theme.colors.surfaceElevated }]}>
          {OPTIONS.map((item, index) => {
            const isLast = index === OPTIONS.length - 1;
            const isSelected = playbackQuality === item.value;
            return (
              <TouchableOpacity
                key={item.value}
                style={[styles.listItem, !isLast && { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: theme.colors.border }]}
                activeOpacity={0.7}
                onPress={() => setPlaybackQuality(item.value)}
              >
                <View style={{ flex: 1 }}>
                  <Text style={[styles.listTitle, { color: theme.colors.textPrimary }]}>
                    {item.label}
                  </Text>
                  <Text style={[styles.listSubtitle, { color: theme.colors.textMuted }]}>
                    {item.desc}
                  </Text>
                </View>
                {isSelected && (
                  <Ionicons name="checkmark" size={20} color={theme.colors.primary} />
                )}
              </TouchableOpacity>
            );
          })}
        </View>
        <Text style={[styles.footerText, { color: theme.colors.textSecondary }]}>
          Playback Quality only affects timeline preview. It will never reduce the final export quality of your project.
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
  listSubtitle: { fontSize: 12, marginTop: 4 },
  footerText: { marginTop: 16, marginHorizontal: 36, fontSize: 13, textAlign: "center" }
});
