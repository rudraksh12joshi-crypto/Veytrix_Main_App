export type FilterEngineType = "ColorMatrixEngine" | "LUTSplitToneEngine" | "MultiPassShaderEngine";

export interface FilterParams {
  brightness?: number;
  contrast?: number;
  exposure?: number;
  saturation?: number;
  temperature?: number;
  tint?: number;
  hue?: number;
  vibrance?: number;
  whites?: number;
  blacks?: number;
  highlights?: number;
  shadows?: number;
  gamma?: number;
  // LUT & Split Tone params
  lutKey?: string;
  shadowTint?: string;
  highlightTint?: string;
  skinSmoothness?: number;
  raisedBlacks?: number;
  filmFade?: number;
  // Shader params
  chromaticAberration?: number;
  glowIntensity?: number;
  duotonePrimary?: string;
  duotoneSecondary?: string;
  prismSpread?: number;
  rgbSplitShift?: number;
}

export interface FilterItem {
  id: string;
  name: string;
  category: string;
  requiredPlan: "Free" | "Pro" | "Premium" | string;
  engineType: FilterEngineType;
  engineKey: string;
  version: string;
  description: string;
  enabled: boolean;
  type: "FILTERS" | "Filter";
  adjustments?: FilterParams;
}

export interface AppliedFilter {
  filterId: string;
  intensity: number; // 0 to 100
  engineKey: string;
}
