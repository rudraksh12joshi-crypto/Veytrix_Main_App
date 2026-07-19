import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { Tabs, useRouter } from "expo-router";
import React, { useRef } from "react";
import { Animated, Pressable, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useTheme } from "@/src/theme";

function CreateTabButton() {
  const router = useRouter();
  const { theme } = useTheme();
  const scale = useRef(new Animated.Value(1)).current;

  const onPressIn = () =>
    Animated.spring(scale, { toValue: 0.9, useNativeDriver: true, speed: 40, bounciness: 8 }).start();
  const onPressOut = () =>
    Animated.spring(scale, { toValue: 1, useNativeDriver: true, speed: 30, bounciness: 10 }).start();
  const onPress = () => router.push("/editor/new");

  return (
    <View pointerEvents="box-none" style={styles.createSlot}>
      <Pressable
        testID="create-tab-button"
        accessibilityRole="button"
        accessibilityLabel="Create"
        onPress={onPress}
        onPressIn={onPressIn}
        onPressOut={onPressOut}
        style={styles.pressable}
      >
        <Animated.View style={[styles.createShadow, { transform: [{ scale }] }]}>
          <LinearGradient
            colors={["#8B6BFF", "#FF3B8B"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.createBtn}
          >
            <Ionicons name="add" size={30} color="#fff" />
          </LinearGradient>
        </Animated.View>
        <Text style={[styles.createLabel, { color: theme.colors.textMuted }]}>Create</Text>
      </Pressable>
    </View>
  );
}

export default function TabsLayout() {
  const { theme, isDark } = useTheme();
  const insets = useSafeAreaInsets();

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: theme.colors.primary,
        tabBarInactiveTintColor: theme.colors.textMuted,
        tabBarLabelStyle: { fontSize: 11, fontWeight: "600", marginTop: 2 },
        tabBarStyle: {
          backgroundColor: theme.colors.surface,
          borderTopColor: theme.colors.border,
          borderTopWidth: StyleSheet.hairlineWidth,
          height: 60 + insets.bottom,
          paddingBottom: insets.bottom,
          paddingTop: 8,
          elevation: isDark ? 0 : 8,
        },
      }}
    >
      <Tabs.Screen
        name="dashboard"
        options={{ title: "Home", tabBarIcon: ({ color, size }) => <Ionicons name="home" color={color} size={size - 2} /> }}
      />
      <Tabs.Screen
        name="projects"
        options={{ title: "Projects", tabBarIcon: ({ color, size }) => <Ionicons name="folder" color={color} size={size - 2} /> }}
      />
      <Tabs.Screen
        name="templates"
        options={{
          title: "Create",
          tabBarLabel: () => null,
          tabBarIcon: () => null,
          tabBarButton: () => <CreateTabButton />,
        }}
      />
      <Tabs.Screen
        name="assets"
        options={{ title: "Assets", tabBarIcon: ({ color, size }) => <Ionicons name="images" color={color} size={size - 2} /> }}
      />
      <Tabs.Screen
        name="profile"
        options={{ title: "Profile", tabBarIcon: ({ color, size }) => <Ionicons name="person" color={color} size={size - 2} /> }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  createSlot: {
    flex: 1,
    alignItems: "center",
    justifyContent: "flex-end",
  },
  pressable: {
    alignItems: "center",
    justifyContent: "flex-end",
  },
  createShadow: {
    marginTop: -22,
    shadowColor: "#7C5CFF",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.35,
    shadowRadius: 16,
    elevation: 12,
  },
  createBtn: {
    width: 58,
    height: 58,
    borderRadius: 29,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 3,
    borderColor: "rgba(255,255,255,0.08)",
  },
  createLabel: {
    marginTop: 4,
    fontSize: 11,
    fontWeight: "600",
  },
});
