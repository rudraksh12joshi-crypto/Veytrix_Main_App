import { Ionicons } from "@expo/vector-icons";
import React, { useRef } from "react";
import { StyleSheet, Text, View, Pressable, Animated } from "react-native";
import { LinearGradient } from "expo-linear-gradient";

import { useTheme } from "@/src/theme";

export type QuickAction = {
  id: string;
  label: string;
  subtitle?: string;
  icon: keyof typeof Ionicons.glyphMap;
  gradient: [string, string];
  onPress?: () => void;
};

type Props = { actions: QuickAction[] };

function QuickActionCard({ action, theme }: { action: QuickAction, theme: any }) {
  const scale = useRef(new Animated.Value(1)).current;

  return (
    <Pressable
      testID={`quick-action-${action.id}`}
      onPress={action.onPress}
      onPressIn={() => Animated.spring(scale, { toValue: 0.95, useNativeDriver: true }).start()}
      onPressOut={() => Animated.spring(scale, { toValue: 1, useNativeDriver: true }).start()}
      style={[
        styles.tile,
        { backgroundColor: theme.colors.surfaceElevated, borderRadius: theme.radius.lg }
      ]}
    >
      <Animated.View style={{ transform: [{ scale }] }}>
        <LinearGradient
          colors={action.gradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.iconWrap}
        >
          <Ionicons name={action.icon} size={22} color="#fff" />
        </LinearGradient>
      </Animated.View>
      <View style={styles.textWrap}>
        <Text
          numberOfLines={1}
          style={{ color: theme.colors.textPrimary, fontSize: 14, fontWeight: "700" }}
        >
          {action.label}
        </Text>
        {action.subtitle && (
          <Text
            numberOfLines={1}
            style={{ color: theme.colors.textSecondary, fontSize: 11, marginTop: 2, fontWeight: "500" }}
          >
            {action.subtitle}
          </Text>
        )}
      </View>
    </Pressable>
  );
}

export function QuickActionsRow({ actions }: Props) {
  const { theme } = useTheme();
  return (
    <View style={styles.grid}>
      {actions.map((a) => (
        <QuickActionCard key={a.id} action={a} theme={theme} />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  grid: {
    paddingHorizontal: 20,
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  tile: {
    width: "47%",
    flexGrow: 1,
    paddingVertical: 14,
    paddingHorizontal: 14,
    shadowColor: "#8CC8E8",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 4,
    flexDirection: "column",
    alignItems: "flex-start",
  },
  iconWrap: {
    width: 44,
    height: 44,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
  },
  textWrap: {
    flexDirection: "column",
  }
});
