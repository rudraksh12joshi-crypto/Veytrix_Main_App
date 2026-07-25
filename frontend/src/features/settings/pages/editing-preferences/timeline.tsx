import React from "react";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Switch } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { useTheme } from "@/src/theme";
import { useEditorPreferencesStore, TimelineZoom, TrackHeight } from "@/src/store/editor-preferences.store";

const ZOOM_OPTIONS: { label: string; value: TimelineZoom }[] = [
  { label: "Compact", value: "Compact" },
  { label: "Normal", value: "Normal" },
  { label: "Detailed", value: "Detailed" },
];

const HEIGHT_OPTIONS: { label: string; value: TrackHeight }[] = [
  { label: "Small", value: "Small" },
  { label: "Medium", value: "Medium" },
  { label: "Large", value: "Large" },
];

export default function TimelineSettingsScreen() {
  const { theme } = useTheme();
  const router = useRouter();
  const prefs = useEditorPreferencesStore();
  const setPref = prefs.setTimelinePreference;

  return (
    <SafeAreaView edges={["top"]} style={{ flex: 1, backgroundColor: theme.colors.background }}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color={theme.colors.textPrimary} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: theme.colors.textPrimary }]}>Timeline Settings</Text>
        <View style={{ width: 40 }} />
      </View>
      <ScrollView contentContainerStyle={{ paddingVertical: 20 }}>
        
        <Text style={[styles.sectionTitle, { color: theme.colors.textSecondary }]}>DISPLAY</Text>
        <View style={[styles.cardGroup, { backgroundColor: theme.colors.surfaceElevated, marginBottom: 20 }]}>
          <View style={[styles.listItem, { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: theme.colors.border }]}>
            <Text style={[styles.listTitle, { color: theme.colors.textPrimary, flex: 1 }]}>Show Time Ruler</Text>
            <Switch value={prefs.timelineShowTimeRuler} onValueChange={(v) => setPref("timelineShowTimeRuler", v)} trackColor={{ true: theme.colors.primary }} />
          </View>
          <View style={[styles.listItem, { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: theme.colors.border }]}>
            <Text style={[styles.listTitle, { color: theme.colors.textPrimary, flex: 1 }]}>Show Audio Waveforms</Text>
            <Switch value={prefs.timelineShowAudioWaveforms} onValueChange={(v) => setPref("timelineShowAudioWaveforms", v)} trackColor={{ true: theme.colors.primary }} />
          </View>
          <View style={[styles.listItem, { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: theme.colors.border }]}>
            <Text style={[styles.listTitle, { color: theme.colors.textPrimary, flex: 1 }]}>Show Video Thumbnails</Text>
            <Switch value={prefs.timelineShowVideoThumbnails} onValueChange={(v) => setPref("timelineShowVideoThumbnails", v)} trackColor={{ true: theme.colors.primary }} />
          </View>
          <View style={[styles.listItem, { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: theme.colors.border }]}>
            <Text style={[styles.listTitle, { color: theme.colors.textPrimary, flex: 1 }]}>Show Track Labels</Text>
            <Switch value={prefs.timelineShowTrackLabels} onValueChange={(v) => setPref("timelineShowTrackLabels", v)} trackColor={{ true: theme.colors.primary }} />
          </View>
          <View style={[styles.listItem, { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: theme.colors.border }]}>
            <Text style={[styles.listTitle, { color: theme.colors.textPrimary, flex: 1 }]}>Show Playhead Time</Text>
            <Switch value={prefs.timelineShowPlayheadTime} onValueChange={(v) => setPref("timelineShowPlayheadTime", v)} trackColor={{ true: theme.colors.primary }} />
          </View>
          <View style={styles.listItem}>
            <Text style={[styles.listTitle, { color: theme.colors.textPrimary, flex: 1 }]}>Show Frame Numbers</Text>
            <Switch value={prefs.timelineShowFrameNumbers} onValueChange={(v) => setPref("timelineShowFrameNumbers", v)} trackColor={{ true: theme.colors.primary }} />
          </View>
        </View>

        <Text style={[styles.sectionTitle, { color: theme.colors.textSecondary }]}>TIMELINE ZOOM</Text>
        <View style={[styles.cardGroup, { backgroundColor: theme.colors.surfaceElevated, marginBottom: 20 }]}>
          {ZOOM_OPTIONS.map((item, index) => {
            const isLast = index === ZOOM_OPTIONS.length - 1;
            const isSelected = prefs.timelineZoom === item.value;
            return (
              <TouchableOpacity
                key={item.value}
                style={[styles.listItem, !isLast && { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: theme.colors.border }]}
                activeOpacity={0.7}
                onPress={() => setPref("timelineZoom", item.value)}
              >
                <Text style={[styles.listTitle, { color: theme.colors.textPrimary, flex: 1 }]}>{item.label}</Text>
                {isSelected && <Ionicons name="checkmark" size={20} color={theme.colors.primary} />}
              </TouchableOpacity>
            );
          })}
        </View>

        <Text style={[styles.sectionTitle, { color: theme.colors.textSecondary }]}>TRACK HEIGHT</Text>
        <View style={[styles.cardGroup, { backgroundColor: theme.colors.surfaceElevated }]}>
          {HEIGHT_OPTIONS.map((item, index) => {
            const isLast = index === HEIGHT_OPTIONS.length - 1;
            const isSelected = prefs.timelineTrackHeight === item.value;
            return (
              <TouchableOpacity
                key={item.value}
                style={[styles.listItem, !isLast && { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: theme.colors.border }]}
                activeOpacity={0.7}
                onPress={() => setPref("timelineTrackHeight", item.value)}
              >
                <Text style={[styles.listTitle, { color: theme.colors.textPrimary, flex: 1 }]}>{item.label}</Text>
                {isSelected && <Ionicons name="checkmark" size={20} color={theme.colors.primary} />}
              </TouchableOpacity>
            );
          })}
        </View>

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
