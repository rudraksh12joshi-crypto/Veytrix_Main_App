export type ColorTokens = {
  background: string;
  surface: string;
  surfaceElevated: string;
  border: string;
  textPrimary: string;
  textSecondary: string;
  textMuted: string;
  primary: string;
  primaryMuted: string;
  accent: string;
  success: string;
  warning: string;
  danger: string;
  overlay: string;
  timelineBg: string;
  timelineTrack: string;
  timelineClip: string;
  playhead: string;
};

export type SpacingScale = {
  xs: number;
  sm: number;
  md: number;
  lg: number;
  xl: number;
  xxl: number;
};

export type RadiusScale = {
  sm: number;
  md: number;
  lg: number;
  pill: number;
};

export type ThemeTokens = {
  colors: ColorTokens;
  spacing: SpacingScale;
  radius: RadiusScale;
};

export const spacing: SpacingScale = { xs: 4, sm: 8, md: 16, lg: 24, xl: 32, xxl: 48 };
export const radius: RadiusScale = { sm: 6, md: 12, lg: 20, pill: 999 };

export const darkColors: ColorTokens = {
  background: "#0A0A0B",
  surface: "#141416",
  surfaceElevated: "#1C1C1F",
  border: "#26262A",
  textPrimary: "#F5F5F7",
  textSecondary: "#B0B0B8",
  textMuted: "#6E6E76",
  primary: "#7C5CFF",
  primaryMuted: "#5C43CC",
  accent: "#FF3B8B",
  success: "#3CD09A",
  warning: "#FFB43C",
  danger: "#FF5C5C",
  overlay: "rgba(0,0,0,0.6)",
  timelineBg: "#0F0F11",
  timelineTrack: "#1A1A1D",
  timelineClip: "#3A2E7A",
  playhead: "#FF3B8B",
};

export const lightColors: ColorTokens = {
  background: "#FFFFFF",
  surface: "#F5F5F7",
  surfaceElevated: "#FFFFFF",
  border: "#E4E4E7",
  textPrimary: "#0A0A0B",
  textSecondary: "#4A4A52",
  textMuted: "#8A8A92",
  primary: "#7C5CFF",
  primaryMuted: "#B0A0FF",
  accent: "#FF3B8B",
  success: "#22A57A",
  warning: "#E09528",
  danger: "#E04A4A",
  overlay: "rgba(0,0,0,0.4)",
  timelineBg: "#F0F0F3",
  timelineTrack: "#E4E4E7",
  timelineClip: "#D4CBFF",
  playhead: "#FF3B8B",
};

export const darkTheme: ThemeTokens = { colors: darkColors, spacing, radius };
export const lightTheme: ThemeTokens = { colors: lightColors, spacing, radius };
