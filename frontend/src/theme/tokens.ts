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
  background: "#E6F2F8",
  surface: "#FFFFFF",
  surfaceElevated: "#FFFFFF",
  border: "#8CC8E8",
  textPrimary: "#1D2B64",
  textSecondary: "#4F6A88",
  textMuted: "#6E8BA7",
  primary: "#3B6CE7",
  primaryMuted: "#8CC8E8",
  accent: "#8CC8E8",
  success: "#3B6CE7",
  warning: "#FFB43C",
  danger: "#E04A4A",
  overlay: "rgba(29, 43, 100, 0.4)",
  timelineBg: "#E6F2F8",
  timelineTrack: "#E6F2F8",
  timelineClip: "#3B6CE7",
  playhead: "#1D2B64",
};

export const lightColors: ColorTokens = {
  background: "#E6F2F8",
  surface: "#FFFFFF",
  surfaceElevated: "#FFFFFF",
  border: "#8CC8E8",
  textPrimary: "#1D2B64",
  textSecondary: "#4F6A88",
  textMuted: "#6E8BA7",
  primary: "#3B6CE7",
  primaryMuted: "#8CC8E8",
  accent: "#8CC8E8",
  success: "#3B6CE7",
  warning: "#FFB43C",
  danger: "#E04A4A",
  overlay: "rgba(29, 43, 100, 0.4)",
  timelineBg: "#E6F2F8",
  timelineTrack: "#E6F2F8",
  timelineClip: "#3B6CE7",
  playhead: "#1D2B64",
};

export const darkTheme: ThemeTokens = { colors: darkColors, spacing, radius };
export const lightTheme: ThemeTokens = { colors: lightColors, spacing, radius };
