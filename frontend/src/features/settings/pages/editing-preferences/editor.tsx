import React from "react";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Pressable, Animated } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { useTheme } from "@/src/theme";
import { useEditorPreferencesStore } from "@/src/store/editor-preferences.store";

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
  const prefs = useEditorPreferencesStore();

  const EDITOR_PREFS = [
    { icon: "color-palette", title: "Theme", value: prefs.theme, route: "/settings/editor/theme" },
    { icon: "save", title: "Auto Save", value: prefs.autoSaveEnabled ? "On" : "Off", route: "/settings/editor/auto-save" },
    { icon: "options", title: "Timeline Settings", route: "/settings/editor/timeline" },
    { icon: "hardware-chip", title: "Default Export Quality", value: prefs.defaultExportQuality, route: "/settings/editor/export-quality" },
    { icon: "film", title: "Default FPS", value: prefs.defaultFPS, route: "/settings/editor/fps" },
    { icon: "scan", title: "Default Resolution", value: prefs.defaultResolution, route: "/settings/editor/resolution" },
    { icon: "crop", title: "Preferred Aspect Ratio", value: prefs.preferredAspectRatio, route: "/settings/editor/aspect-ratio" },
    { icon: "cog", title: "Render Engine", value: prefs.renderEngine, route: "/settings/editor/render-engine" },
    { icon: "speedometer", title: "Hardware Acceleration", value: prefs.hwAccelerationEnabled ? "On" : "Off", route: "/settings/editor/hardware-acceleration" },
    { icon: "swap-horizontal", title: "Proxy Editing", value: prefs.proxyMode, route: "/settings/editor/proxy" },
    { icon: "play-circle", title: "Background Rendering", value: prefs.backgroundRenderingEnabled ? "On" : "Off", route: "/settings/editor/background-rendering" },
    { icon: "magnet", title: "Snap Timeline", value: prefs.snapTimelineEnabled ? "On" : "Off", route: "/settings/editor/snap" },
    { icon: "link", title: "Magnetic Timeline", value: prefs.magneticTimelineEnabled ? "On" : "Off", route: "/settings/editor/magnetic-timeline" },
    { icon: "tv", title: "Playback Quality", value: prefs.playbackQuality, route: "/settings/editor/playback-quality" },
    { icon: "language", title: "Auto Caption Language", value: prefs.autoCaptionLanguage, route: "/settings/editor/auto-caption" },
    { icon: "folder-open", title: "Export Location", value: prefs.exportLocation, route: "/settings/editor/export-location" },
  ];

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
