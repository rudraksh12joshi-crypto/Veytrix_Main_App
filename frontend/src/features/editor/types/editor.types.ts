export interface ColorAdjustments {
  brightness: number;
  contrast: number;
  saturation: number;
  exposure: number;
  temperature: number;
  tint: number;
  vibrance: number;
  highlights: number;
  shadows: number;
  whites: number;
  blacks: number;
  gamma: number;
  curves?: any;
}

export type TextAnimationType =
  | "none"
  | "fade"
  | "slide"
  | "bounce"
  | "scale"
  | "rotate"
  | "typing"
  | "pop"
  | "wave";

export interface TextLayer {
  id: string;
  text: string;
  fontFamily: string;
  fontWeight: "400" | "600" | "700" | "900";
  fontSize: number;
  color: string;
  opacity: number;
  outlineColor?: string;
  outlineWidth?: number;
  shadowColor?: string;
  shadowBlur?: number;
  glowColor?: string;
  letterSpacing: number;
  lineSpacing: number;
  alignment: "left" | "center" | "right";
  rotation: number;
  position: { x: number; y: number }; // Relative percentage (0 - 100)
  animation: TextAnimationType;
  animationDuration: number;
  startTime: number;
  endTime: number;
  layerOrder: number;
}

export type OverlayType = "video" | "image" | "gif" | "sticker" | "logo" | "watermark";

export type BlendMode =
  | "normal"
  | "multiply"
  | "screen"
  | "overlay"
  | "softLight"
  | "hardLight"
  | "darken"
  | "lighten";

export type MaskType = "none" | "rectangle" | "circle" | "freeform";

export interface OverlayLayer {
  id: string;
  type: OverlayType;
  source: string;       // Image/Video URI or icon/symbol
  name: string;
  startTime: number;    // ms
  endTime: number;      // ms
  position: { x: number; y: number }; // Relative percentage (0 - 100)
  scale: number;        // 0.2 to 3.0
  rotation: number;     // degrees (-180 to 180)
  opacity: number;      // 0 to 1.0
  blendMode: BlendMode;
  shadow: { color: string; blur: number };
  mask: { type: MaskType; feather: number };
  layerOrder: number;
}

export interface EqualizerBands {
  bass: number;
  mid: number;
  treble: number;
  voice: number;
}

export interface NoiseReductionSettings {
  enabled: boolean;
  preset: "fan" | "wind" | "hum" | "ac";
  intensity: number;
}

export interface VoiceIsolationSettings {
  enabled: boolean;
  intensity: number;
}

export type PitchPreset = "original" | "male" | "female" | "deep" | "chipmunk";

export interface AudioSettings {
  volume: number;       // 0% - 300%
  muted: boolean;
  fadeIn: number;       // ms (0 - 10000)
  fadeOut: number;      // ms (0 - 10000)
  equalizer: EqualizerBands;
  noiseReduction: NoiseReductionSettings;
  voiceIsolation: VoiceIsolationSettings;
  pitch: PitchPreset;
  balance: number;      // -100 (L) to +100 (R)
}

export interface VideoClip {
  id: string;
  videoUri?: string;
  thumbnailUri?: string;
  originalDuration?: number;
  trimStartOffset?: number;
  trimEndOffset?: number;
  startTime: number;
  endTime: number;
  speed: number;
  reverse: boolean;
  maintainPitch: boolean;
  motionBlur: boolean;
  frameBlending: boolean;
  adjustments: ColorAdjustments;
  audio: AudioSettings;
  mediaType?: "video" | "image";
}

export const DEFAULT_COLOR_ADJUSTMENTS: ColorAdjustments = {
  brightness: 0,
  contrast: 0,
  saturation: 0,
  exposure: 0,
  temperature: 0,
  tint: 0,
  vibrance: 0,
  highlights: 0,
  shadows: 0,
  whites: 0,
  blacks: 0,
  gamma: 0,
};

export const DEFAULT_AUDIO_SETTINGS: AudioSettings = {
  volume: 100,
  muted: false,
  fadeIn: 0,
  fadeOut: 0,
  equalizer: {
    bass: 0,
    mid: 0,
    treble: 0,
    voice: 0,
  },
  noiseReduction: {
    enabled: false,
    preset: "fan",
    intensity: 50,
  },
  voiceIsolation: {
    enabled: false,
    intensity: 50,
  },
  pitch: "original",
  balance: 0,
};

export const DEFAULT_TEXT_LAYER: Omit<TextLayer, "id" | "startTime" | "endTime"> = {
  text: "Add Text Here",
  fontFamily: "System",
  fontWeight: "700",
  fontSize: 24,
  color: "#FFFFFF",
  opacity: 1,
  outlineColor: "#000000",
  outlineWidth: 2,
  shadowColor: "rgba(0,0,0,0.5)",
  shadowBlur: 4,
  glowColor: "transparent",
  letterSpacing: 0,
  lineSpacing: 1.2,
  alignment: "center",
  rotation: 0,
  position: { x: 50, y: 50 },
  animation: "none",
  animationDuration: 1000,
  layerOrder: 1,
};

export const DEFAULT_OVERLAY_LAYER: Omit<OverlayLayer, "id" | "startTime" | "endTime" | "type" | "source" | "name"> = {
  position: { x: 50, y: 50 },
  scale: 1.0,
  rotation: 0,
  opacity: 1.0,
  blendMode: "normal",
  shadow: { color: "rgba(0,0,0,0.5)", blur: 4 },
  mask: { type: "none", feather: 0 },
  layerOrder: 1,
};
