export const ROUTES = {
  // Auth
  LOGIN: "/(auth)/login",
  REGISTER: "/(auth)/register",
  FORGOT_PASSWORD: "/(auth)/forgot-password",

  // Tabs
  DASHBOARD: "/(tabs)/dashboard",
  PROJECTS: "/(tabs)/projects",
  TEMPLATES: "/(tabs)/templates",
  ASSETS: "/(tabs)/assets",
  PROFILE: "/(tabs)/profile",

  // Editor
  EDITOR: (projectId: string) => `/editor/${projectId}`,

  // Top-level
  DRAFTS: "/projects/drafts",
  EXPORT_LIBRARY: "/projects/export-library",
  SETTINGS: "/settings",
  SUBSCRIPTION: "/profile/subscription",
  NOTIFICATIONS: "/notifications",
  ANALYTICS: "/analytics",
} as const;
