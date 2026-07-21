import { Ionicons } from "@expo/vector-icons";
import { Tabs, useRouter } from "expo-router";
import React, { useRef, useEffect, useCallback } from "react";
import { Animated, PanResponder, StyleSheet, View, Dimensions, Platform, Pressable } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { BlurView } from "expo-blur";
import * as Haptics from "expo-haptics";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

const TAB_ROUTES = [
  { name: "dashboard", icon: "home" },
  { name: "projects", icon: "folder" },
  { name: "templates", icon: "add", isCreate: true },
  { name: "exports", icon: "share" },
  { name: "profile", icon: "person" },
];

function CustomTabBar({ state, descriptors, navigation }: any) {
  const insets = useSafeAreaInsets();
  const router = useRouter();

  const PILL_WIDTH = SCREEN_WIDTH * 0.92;
  const TAB_WIDTH = PILL_WIDTH / TAB_ROUTES.length;

  // Convert React Navigation state index → visual TAB_ROUTES index
  const getVisualIndex = (stateIndex: number) => {
    const routeName = state.routes[stateIndex]?.name;
    const vIndex = TAB_ROUTES.findIndex(r => r.name === routeName);
    return vIndex !== -1 ? vIndex : 0;
  };

  // SINGLE SOURCE OF TRUTH: derived from current route
  const visualIndex = getVisualIndex(state.index);

  const animatedValue = useRef(new Animated.Value(visualIndex)).current;
  const isDragging = useRef(false);
  const lastHapticIndex = useRef(visualIndex);

  // ──────────────────────────────────────────────────────────────────────
  // CRITICAL FIX: Store latest values in refs so PanResponder (which is
  // created once and never recreated) always reads FRESH data instead of
  // stale closure values from the initial render.
  // ──────────────────────────────────────────────────────────────────────
  const navigationRef = useRef(navigation);
  const stateRef = useRef(state);
  const visualIndexRef = useRef(visualIndex);
  const routerRef = useRef(router);

  // Update refs every render
  navigationRef.current = navigation;
  stateRef.current = state;
  visualIndexRef.current = visualIndex;
  routerRef.current = router;

  // Sync indicator when route changes
  useEffect(() => {
    if (!isDragging.current) {
      Animated.spring(animatedValue, {
        toValue: visualIndex,
        useNativeDriver: true,
        bounciness: 8,
        speed: 12,
      }).start();
      lastHapticIndex.current = visualIndex;
    }
  }, [visualIndex, animatedValue]);

  // Navigate to a tab. Returns true if navigation was triggered.
  // Reads from refs so it always has fresh state.
  const navigateToTab = useCallback((targetIndex: number): boolean => {
    const nav = navigationRef.current;
    const st = stateRef.current;
    const currentVisual = visualIndexRef.current;

    // 1. "Create" button pushes a modal, doesn't switch tabs
    if (TAB_ROUTES[targetIndex].isCreate) {
      routerRef.current.push("/ai-manual-edit");
      return false;
    }

    // 2. Already on this tab — just emit tabPress (scroll-to-top)
    if (targetIndex === currentVisual) {
      nav.emit({
        type: 'tabPress',
        target: st.routes[st.index].key,
        canPreventDefault: true,
      });
      return false;
    }

    // 3. Standard tab navigation — navigate IMMEDIATELY
    const route = TAB_ROUTES[targetIndex];
    const stateIndex = st.routes.findIndex((r: any) => r.name === route.name);

    if (stateIndex !== -1) {
      nav.navigate({ name: route.name, merge: true });
      return true;
    }

    return false;
  }, []); // No deps — reads everything from refs

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => false,
      onMoveShouldSetPanResponder: (_evt, gs) => Math.abs(gs.dx) > 5,

      onPanResponderGrant: () => {
        isDragging.current = true;
      },

      onPanResponderMove: (_evt, gs) => {
        const finalX = gs.x0 + gs.dx;
        const pillLeft = (SCREEN_WIDTH - PILL_WIDTH) / 2;
        let index = (finalX - pillLeft) / TAB_WIDTH;
        index = Math.max(0, Math.min(index, TAB_ROUTES.length - 1));

        const roundedIndex = Math.round(index);

        if (roundedIndex !== lastHapticIndex.current) {
          Haptics.selectionAsync().catch(() => {});
          lastHapticIndex.current = roundedIndex;
        }

        // Move indicator only — NO navigation during drag
        animatedValue.setValue(index);
      },

      onPanResponderRelease: (_evt, gs) => {
        isDragging.current = false;

        // 1. Determine nearest tab from absolute finger position
        const finalX = gs.x0 + gs.dx;
        const pillLeft = (SCREEN_WIDTH - PILL_WIDTH) / 2;
        const rawIndex = (finalX - pillLeft) / TAB_WIDTH;
        const targetIndex = Math.round(Math.max(0, Math.min(rawIndex, TAB_ROUTES.length - 1)));

        // 2. NAVIGATE FIRST — before any animation
        const didNavigate = navigateToTab(targetIndex);

        // 3. THEN animate indicator to final position
        const finalIndex = didNavigate ? targetIndex : visualIndexRef.current;
        Animated.spring(animatedValue, {
          toValue: finalIndex,
          useNativeDriver: true,
          bounciness: 10,
          speed: 14,
        }).start();
      },

      onPanResponderTerminate: () => {
        isDragging.current = false;
        // Snap back to actual current tab
        Animated.spring(animatedValue, {
          toValue: visualIndexRef.current,
          useNativeDriver: true,
          bounciness: 10,
          speed: 14,
        }).start();
      },
    })
  ).current;

  const translateX = animatedValue.interpolate({
    inputRange: TAB_ROUTES.map((_, i) => i),
    outputRange: TAB_ROUTES.map((_, i) => i * TAB_WIDTH),
  });

  return (
    <View style={[styles.tabBarContainer, { bottom: Math.max(insets.bottom, 20) }]} pointerEvents="box-none">
      <View style={[styles.pillContainer, { width: PILL_WIDTH }]}>
        <BlurView intensity={Platform.OS === 'ios' ? 80 : 100} tint="light" style={StyleSheet.absoluteFillObject} />
        <View style={[StyleSheet.absoluteFillObject, { backgroundColor: "rgba(255,255,255,0.7)" }]} />

        <View style={styles.pillContent} {...panResponder.panHandlers}>
          <Animated.View
            style={[
              styles.activeCapsule,
              { width: TAB_WIDTH - 16, transform: [{ translateX }] }
            ]}
          />

          {TAB_ROUTES.map((route, index) => {
            const isActive = visualIndex === index;
            return (
              <Pressable
                key={route.name}
                style={[styles.tabItem, { width: TAB_WIDTH }]}
                onPress={() => {
                  // 1. Navigate FIRST
                  const didNavigate = navigateToTab(index);
                  // 2. Then animate
                  const finalIndex = didNavigate ? index : visualIndex;
                  Animated.spring(animatedValue, {
                    toValue: finalIndex,
                    useNativeDriver: true,
                    bounciness: 10,
                    speed: 14,
                  }).start();
                }}
              >
                <Ionicons
                  name={route.icon as any}
                  size={26}
                  color={isActive ? "#FFFFFF" : "#1D2B64"}
                />
              </Pressable>
            );
          })}
        </View>
      </View>
    </View>
  );
}

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{ headerShown: false }}
      tabBar={(props) => <CustomTabBar {...props} />}
    >
      <Tabs.Screen name="dashboard" />
      <Tabs.Screen name="projects" />
      <Tabs.Screen name="templates" />
      <Tabs.Screen name="assets" options={{ href: null }} />
      <Tabs.Screen name="exports" />
      <Tabs.Screen name="profile" />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  tabBarContainer: {
    position: "absolute",
    left: 0,
    right: 0,
    alignItems: "center",
    justifyContent: "center",
  },
  pillContainer: {
    height: 72,
    borderRadius: 999,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "rgba(59,108,231,0.15)",
    shadowColor: "#1D2B64",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 10,
  },
  pillContent: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
  },
  activeCapsule: {
    position: "absolute",
    height: 56,
    borderRadius: 28,
    backgroundColor: "#3B6CE7",
    left: 8,
    shadowColor: "#3B6CE7",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  tabItem: {
    height: "100%",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 2,
  }
});
