import React from "react";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Switch } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { useTheme } from "@/src/theme";
import { useNotificationSettingsStore } from "@/src/store/notification-settings.store";

function ListSection({ items, theme, store }: { items: any[], theme: any, store: any }) {
  return (
    <View style={[styles.cardGroup, { backgroundColor: theme.colors.surfaceElevated }]}>
      {items.map((item, index) => {
        const isLast = index === items.length - 1;
        const value = store[item.key];
        
        return (
          <TouchableOpacity 
            key={index} 
            style={[styles.listItem, !isLast && { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: theme.colors.border }]} 
            activeOpacity={0.7}
            onPress={() => store.setPref(item.key, !value)}
          >
            <View style={[styles.listIconBox, { backgroundColor: theme.colors.textMuted + "15" }]}>
              <Ionicons name={item.icon as any} size={18} color={theme.colors.textMuted} />
            </View>
            <View style={styles.listTextContainer}>
              <Text style={[styles.listTitle, { color: theme.colors.textPrimary }]}>
                {item.title}
              </Text>
            </View>
            <Switch
              value={value}
              onValueChange={(val) => store.setPref(item.key, val)}
              trackColor={{ false: theme.colors.border, true: theme.colors.primary }}
              thumbColor="#FFFFFF"
            />
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

export default function NotificationsScreen() {
  const { theme } = useTheme();
  const router = useRouter();
  const store = useNotificationSettingsStore();

  const NOTIFICATIONS = [
    { icon: "notifications", title: "Push Notifications", key: "pushNotifications" },
    { icon: "mail-unread", title: "Email Notifications", key: "emailNotifications" },
    { icon: "share", title: "Export Completed", key: "exportCompleted" },
    { icon: "sparkles", title: "AI Job Finished", key: "aiJobFinished" },
    { icon: "battery-dead", title: "Credits Low", key: "creditsLow" },
    { icon: "card", title: "Subscription", key: "subscription" },
    { icon: "pricetag", title: "Offers", key: "offers" },
    { icon: "warning", title: "Security Alerts", key: "securityAlerts" },
  ];

  return (
    <SafeAreaView edges={["top"]} style={{ flex: 1, backgroundColor: theme.colors.background }}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color={theme.colors.textPrimary} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: theme.colors.textPrimary }]}>Notifications</Text>
        <View style={{ width: 40 }} />
      </View>
      <ScrollView contentContainerStyle={{ paddingVertical: 20 }}>
        <ListSection items={NOTIFICATIONS} theme={theme} store={store} />
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
});
