import React from "react";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Pressable, Animated } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { useTheme } from "@/src/theme";

const EDITOR_PREFS = [
  { icon: "color-palette", title: "Theme", value: "Dark" },
  { icon: "save", title: "Auto Save", value: "On" },
  { icon: "options", title: "Timeline Settings" },
  { icon: "hardware-chip", title: "Default Export Quality", value: "4K" },
  { icon: "film", title: "Default FPS", value: "60" },
  { icon: "scan", title: "Default Resolution", value: "1080p" },
  { icon: "crop", title: "Preferred Aspect Ratio", value: "9:16" },
  { icon: "cog", title: "Render Engine", value: "Metal" },
  { icon: "speedometer", title: "Hardware Acceleration", value: "Enabled" },
  { icon: "swap-horizontal", title: "Proxy Editing", value: "Auto" },
  { icon: "play-circle", title: "Background Rendering", value: "On" },
  { icon: "magnet", title: "Snap Timeline", value: "On" },
  { icon: "link", title: "Magnetic Timeline", value: "Off" },
  { icon: "tv", title: "Playback Quality", value: "High" },
  { icon: "language", title: "Auto Caption Language", value: "English" },
  { icon: "folder-open", title: "Export Location", value: "Camera Roll" },
];

function ListSection({ items, theme, router }: { items: any[], theme: any, router: any }) {
  return (
    <View style={[styles.cardGroup, { backgroundColor: theme.colors.surfaceElevated }]}>
      {items.map((item, index) => {
        const isLast = index === items.length - 1;
        return (
          <TouchableOpacity 
            key={index} 
            style={[styles.listItem, !isLast && { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: theme.colors.border }]} 
            activeOpacity={0.7}
            onPress={() => item.route && router.push(item.route)}
          >
            <View style={[styles.listIconBox, { backgroundColor: (item.color || theme.colors.textMuted) + "15" }]}>
              <Ionicons name={item.icon as any} size={18} color={item.color || theme.colors.textMuted} />
            </View>
            <View style={styles.listTextContainer}>
              <Text style={[styles.listTitle, { color: item.isDanger ? "#FF5C5C" : theme.colors.textPrimary }]}>
                {item.title}
              </Text>
              {item.subtitle && <Text style={[styles.listSubtitle, { color: theme.colors.textSecondary }]}>{item.subtitle}</Text>}
            </View>
            {item.value && (
              <Text style={{ color: theme.colors.textMuted, fontSize: 14, marginRight: 8 }}>{item.value}</Text>
            )}
            {!item.noChevron && (
              <Ionicons name="chevron-forward" size={16} color={theme.colors.border} />
            )}
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

export default function EditorPreferencesScreen() {
  const { theme } = useTheme();
  const router = useRouter();

  return (
    <SafeAreaView edges={["top"]} style={{ flex: 1, backgroundColor: theme.colors.background }}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color={theme.colors.textPrimary} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: theme.colors.textPrimary }]}>Editor Preferences</Text>
        <View style={{ width: 40 }} />
      </View>
      <ScrollView contentContainerStyle={{ paddingVertical: 20 }}>
        <ListSection items={EDITOR_PREFS} theme={theme} router={router} />
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
  listIconBox: { width: 32, height: 32, borderRadius: 10, justifyContent: "center", alignItems: "center", marginRight: 12 },
  listTextContainer: { flex: 1, justifyContent: "center" },
  listTitle: { fontSize: 15, fontWeight: "600" },
  listSubtitle: { fontSize: 12, marginTop: 2 },
});
