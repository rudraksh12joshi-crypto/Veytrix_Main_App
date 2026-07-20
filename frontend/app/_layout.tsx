import { Stack, useSegments, useRouter } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { useEffect } from "react";
import { LogBox } from "react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";

import { useIconFonts } from "@/src/hooks/use-icon-fonts";
import { ThemeProvider } from "@/src/theme";
import { useAuthStore } from "@/src/store/auth.store";

// Disable logbox errors etc so that users can see the app
// and agent works as expected.
LogBox.ignoreAllLogs(true);

// Keep the native splash visible from cold start until icon fonts register.
// Required because @expo/vector-icons' componentDidMount fallback fires
// Font.loadAsync against a broken vendor path if any <Icon> mounts before
// the family is registered — which throws on Android Expo Go.
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [loaded, error] = useIconFonts();
  const segments = useSegments();
  const router = useRouter();
  const { status } = useAuthStore();

  useEffect(() => {
    if (loaded || error) {
      SplashScreen.hideAsync();
    }
  }, [loaded, error]);

  useEffect(() => {
    if (!loaded) return;

    const inAuthGroup = segments[0] === "(auth)";
    const isUnauthenticated = status === "unauthenticated" || status === "idle";

    if (isUnauthenticated && !inAuthGroup && segments[0] !== "onboarding") {
      // Redirect to the sign-in page if not on onboarding.
      // We check segments[0] to allow first-time users to see onboarding.
      router.replace("/(auth)");
    } else if (status === "authenticated" && inAuthGroup) {
      // Redirect away from the sign-in page if already logged in.
      router.replace("/dashboard");
    }
  }, [status, segments, loaded]);

  // If the CDN is unreachable we fall through on error rather than wedging
  // the app — icons will tofu, but the app still boots.
  if (!loaded && !error) return null;

  return (
    <SafeAreaProvider>
      <ThemeProvider>
        <Stack screenOptions={{ headerShown: false }} />
      </ThemeProvider>
    </SafeAreaProvider>
  );
}
