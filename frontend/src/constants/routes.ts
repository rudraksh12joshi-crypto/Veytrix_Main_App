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
  DRAFTS: "/drafts",
  EXPORT_LIBRARY: "/export-library",
  SETTINGS: "/settings",
  SUBSCRIPTION: "/subscription",
  NOTIFICATIONS: "/notifications",
  ANALYTICS: "/analytics",
} as const;
