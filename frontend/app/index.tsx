import { Redirect } from "expo-router";

// Entry - redirects to new onboarding flow for first-time users.
export default function Index() {
  return <Redirect href="/onboarding" />;
}
