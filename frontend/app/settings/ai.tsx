import React from "react";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { useTheme } from "@/src/theme";

const AI_SETTINGS = [
  { icon: "planet", title: "AI Credits", value: "0" },
  { icon: "cube", title: "Default AI Model", value: "Veytrix-V3" },
  { icon: "star", title: "AI Quality", value: "High" },
  { icon: "videocam", title: "AI Video Generation", value: "Enabled" },
  { icon: "chatbubble-ellipses", title: "Auto Caption", value: "Smart" },
  { icon: "mic", title: "Voice Enhancement", value: "Studio" },
  { icon: "trash", title: "Object Removal", value: "Magic" },
  { icon: "person-remove", title: "Background Removal", value: "Auto" },
  { icon: "scan-circle", title: "AI Face Tracking", value: "On" },
  { icon: "cut", title: "Smart Cut", value: "Aggressive" },
  { icon: "move", title: "Motion Tracking", value: "Accurate" },
  { icon: "time", title: "Usage History" },
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

export default function AISettingsScreen() {
  const { theme } = useTheme();
  const router = useRouter();

  return (
    <SafeAreaView edges={["top"]} style={{ flex: 1, backgroundColor: theme.colors.background }}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color={theme.colors.textPrimary} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: theme.colors.textPrimary }]}>AI Settings</Text>
        <View style={{ width: 40 }} />
      </View>
      <ScrollView contentContainerStyle={{ paddingVertical: 20 }}>
        <View style={{ paddingHorizontal: 20, marginBottom: 20 }}>
          <View style={{ backgroundColor: theme.colors.surfaceElevated, padding: 16, borderRadius: 16, borderWidth: 1, borderColor: theme.colors.border }}>
            <Text style={{ color: theme.colors.textPrimary, fontSize: 14, fontWeight: "600", marginBottom: 4 }}>Out of Credits</Text>
            <Text style={{ color: theme.colors.textSecondary, fontSize: 13 }}>Purchase credits to start using AI features.</Text>
          </View>
        </View>
        <ListSection items={AI_SETTINGS} theme={theme} router={router} />
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
