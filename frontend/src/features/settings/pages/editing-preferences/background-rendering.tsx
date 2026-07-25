import React from "react";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Switch, Alert } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { useTheme } from "@/src/theme";
import { useEditorPreferencesStore, RenderIdleTime } from "@/src/store/editor-preferences.store";

const TIME_OPTIONS: { label: string; value: RenderIdleTime }[] = [
  { label: "2 seconds", value: "2 seconds" },
  { label: "5 seconds", value: "5 seconds" },
  { label: "10 seconds", value: "10 seconds" },
  { label: "30 seconds", value: "30 seconds" },
];

export default function BackgroundRenderingPreferencesScreen() {
  const { theme } = useTheme();
  const router = useRouter();
  const {
    backgroundRenderingEnabled, setBackgroundRenderingEnabled,
    backgroundRenderIdleTime, setBackgroundRenderIdleTime
  } = useEditorPreferencesStore();

  const handleClearCache = () => {
    Alert.alert(
      "Clear Render Cache",
      "Are you sure you want to clear pre-rendered files? This will not affect your timeline.",
      [
        { text: "Cancel", style: "cancel" },
        { text: "Clear", style: "destructive", onPress: () => console.log("Render cache cleared") }
      ]
    );
  };

  return (
    <SafeAreaView edges={["top"]} style={{ flex: 1, backgroundColor: theme.colors.background }}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color={theme.colors.textPrimary} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: theme.colors.textPrimary }]}>Background Rendering</Text>
        <View style={{ width: 40 }} />
      </View>
      <ScrollView contentContainerStyle={{ paddingVertical: 20 }}>
        
        <View style={[styles.cardGroup, { backgroundColor: theme.colors.surfaceElevated, marginBottom: 20 }]}>
          <View style={styles.listItem}>
            <Text style={[styles.listTitle, { color: theme.colors.textPrimary, flex: 1 }]}>Background Rendering</Text>
            <Switch
              value={backgroundRenderingEnabled}
              onValueChange={setBackgroundRenderingEnabled}
              trackColor={{ true: theme.colors.primary }}
            />
          </View>
        </View>

        {backgroundRenderingEnabled && (
          <>
            <Text style={[styles.sectionTitle, { color: theme.colors.textSecondary }]}>START RENDERING AFTER INACTIVITY</Text>
            <View style={[styles.cardGroup, { backgroundColor: theme.colors.surfaceElevated, marginBottom: 20 }]}>
              {TIME_OPTIONS.map((item, index) => {
                const isLast = index === TIME_OPTIONS.length - 1;
                const isSelected = backgroundRenderIdleTime === item.value;
                return (
                  <TouchableOpacity
                    key={item.value}
                    style={[styles.listItem, !isLast && { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: theme.colors.border }]}
                    activeOpacity={0.7}
                    onPress={() => setBackgroundRenderIdleTime(item.value)}
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
          </>
        )}

        <View style={[styles.cardGroup, { backgroundColor: theme.colors.surfaceElevated }]}>
          <TouchableOpacity style={styles.listItem} onPress={handleClearCache} activeOpacity={0.7}>
            <Text style={[styles.listTitle, { color: "#FF5C5C", flex: 1, textAlign: "center" }]}>Clear Render Cache</Text>
          </TouchableOpacity>
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
  listItem: { flexDirection: "row", alignItems: "center", paddingVertical: 16, paddingHorizontal: 16 },
  listTitle: { fontSize: 16, fontWeight: "500" }
});
