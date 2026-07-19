import { Redirect } from "expo-router";

// Entry - future auth gate will branch here. For now sends to the dashboard.
export default function Index() {
  return <Redirect href="/(tabs)/dashboard" />;
}
