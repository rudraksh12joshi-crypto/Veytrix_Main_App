import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { storage } from "@/src/utils/storage";

export type ThemeOption = "System Default" | "Light" | "Dark";
export type SaveInterval = "30 seconds" | "1 minute" | "2 minutes" | "5 minutes";
export type TimelineZoom = "Compact" | "Normal" | "Detailed";
export type TrackHeight = "Small" | "Medium" | "Large";
export type ExportQuality = "480p" | "720p" | "1080p" | "1440p" | "4K";
export type FPSOption = "24 FPS" | "25 FPS" | "30 FPS" | "50 FPS" | "60 FPS" | "Match Source";
export type ResolutionOption = "480p" | "720p" | "1080p" | "1440p" | "2160p / 4K";
export type AspectRatioOption = "Original" | "16:9" | "9:16" | "1:1" | "4:5" | "4:3" | "3:4";
export type RenderEngineOption = "Automatic" | "Metal" | "OpenGL";
export type ProxyModeOption = "Off" | "Auto" | "Always";
export type ProxyQualityOption = "Low" | "Medium" | "High";
export type RenderIdleTime = "2 seconds" | "5 seconds" | "10 seconds" | "30 seconds";
export type PlaybackQualityOption = "Auto" | "Low" | "Medium" | "High" | "Full";
export type ExportLocationOption = "Camera Roll / Photos" | "Files" | "App Storage" | "Choose Folder" | "Ask Every Time";

export interface EditorPreferencesState {
  // 1. Theme
  theme: ThemeOption;
  setTheme: (theme: ThemeOption) => void;

  // 2. Auto Save
  autoSaveEnabled: boolean;
  autoSaveInterval: SaveInterval;
  saveOnBackground: boolean;
  saveOnExit: boolean;
  setAutoSaveEnabled: (enabled: boolean) => void;
  setAutoSaveInterval: (interval: SaveInterval) => void;
  setSaveOnBackground: (enabled: boolean) => void;
  setSaveOnExit: (enabled: boolean) => void;

  // 3. Timeline Settings
  timelineShowTimeRuler: boolean;
  timelineShowAudioWaveforms: boolean;
  timelineShowVideoThumbnails: boolean;
  timelineShowTrackLabels: boolean;
  timelineShowPlayheadTime: boolean;
  timelineShowFrameNumbers: boolean;
  timelineZoom: TimelineZoom;
  timelineTrackHeight: TrackHeight;
  setTimelinePreference: (key: keyof EditorPreferencesState, value: any) => void;

  // 4. Default Export Quality
  defaultExportQuality: ExportQuality;
  setDefaultExportQuality: (quality: ExportQuality) => void;

  // 5. Default FPS
  defaultFPS: FPSOption;
  setDefaultFPS: (fps: FPSOption) => void;

  // 6. Default Resolution
  defaultResolution: ResolutionOption;
  setDefaultResolution: (res: ResolutionOption) => void;

  // 7. Preferred Aspect Ratio
  preferredAspectRatio: AspectRatioOption;
  setPreferredAspectRatio: (ratio: AspectRatioOption) => void;

  // 8. Render Engine
  renderEngine: RenderEngineOption;
  setRenderEngine: (engine: RenderEngineOption) => void;

  // 9. Hardware Acceleration
  hwAccelerationEnabled: boolean;
  hwVideoDecode: boolean;
  hwVideoEncode: boolean;
  hwGpuEffects: boolean;
  setHwPreference: (key: keyof EditorPreferencesState, value: any) => void;

  // 10. Proxy Editing
  proxyMode: ProxyModeOption;
  proxyQuality: ProxyQualityOption;
  proxyGenerateAuto: boolean;
  setProxyPreference: (key: keyof EditorPreferencesState, value: any) => void;

  // 11. Background Rendering
  backgroundRenderingEnabled: boolean;
  backgroundRenderIdleTime: RenderIdleTime;
  setBackgroundRenderingEnabled: (enabled: boolean) => void;
  setBackgroundRenderIdleTime: (time: RenderIdleTime) => void;

  // 12. Snap Timeline
  snapTimelineEnabled: boolean;
  snapToPlayhead: boolean;
  snapToClipEdges: boolean;
  snapToMarkers: boolean;
  snapToTrackItems: boolean;
  setSnapPreference: (key: keyof EditorPreferencesState, value: any) => void;

  // 13. Magnetic Timeline
  magneticTimelineEnabled: boolean;
  setMagneticTimelineEnabled: (enabled: boolean) => void;

  // 14. Playback Quality
  playbackQuality: PlaybackQualityOption;
  setPlaybackQuality: (quality: PlaybackQualityOption) => void;

  // 15. Auto Caption Language
  autoCaptionLanguage: string;
  setAutoCaptionLanguage: (lang: string) => void;

  // 16. Export Location
  exportLocation: ExportLocationOption;
  setExportLocation: (location: ExportLocationOption) => void;
}

// Custom storage adapter for Zustand persist
const customStorage = {
  getItem: async (name: string) => {
    // We expect the stored value to be an object (state), so we use `{}` as fallback.
    // Zustand's persist handles the JSON parsing internally if we pass a string.
    // However, our storage.getItem already parses JSON. Zustand's createJSONStorage expects a string.
    const raw = await storage.getItem<any>(name, null);
    return raw !== null ? JSON.stringify(raw) : null;
  },
  setItem: async (name: string, value: string) => {
    // value is a stringified JSON from Zustand.
    await storage.setItem(name, JSON.parse(value));
  },
  removeItem: async (name: string) => {
    await storage.removeItem(name);
  }
};

export const useEditorPreferencesStore = create<EditorPreferencesState>()(
  persist(
    (set) => ({
      theme: "System Default",
      setTheme: (theme) => set({ theme }),

      autoSaveEnabled: true,
      autoSaveInterval: "1 minute",
      saveOnBackground: true,
      saveOnExit: true,
      setAutoSaveEnabled: (autoSaveEnabled) => set({ autoSaveEnabled }),
      setAutoSaveInterval: (autoSaveInterval) => set({ autoSaveInterval }),
      setSaveOnBackground: (saveOnBackground) => set({ saveOnBackground }),
      setSaveOnExit: (saveOnExit) => set({ saveOnExit }),

      timelineShowTimeRuler: true,
      timelineShowAudioWaveforms: true,
      timelineShowVideoThumbnails: true,
      timelineShowTrackLabels: true,
      timelineShowPlayheadTime: true,
      timelineShowFrameNumbers: false,
      timelineZoom: "Normal",
      timelineTrackHeight: "Medium",
      setTimelinePreference: (key, value) => set({ [key]: value } as any),

      defaultExportQuality: "1080p",
      setDefaultExportQuality: (defaultExportQuality) => set({ defaultExportQuality }),

      defaultFPS: "30 FPS",
      setDefaultFPS: (defaultFPS) => set({ defaultFPS }),

      defaultResolution: "1080p",
      setDefaultResolution: (defaultResolution) => set({ defaultResolution }),

      preferredAspectRatio: "Original",
      setPreferredAspectRatio: (preferredAspectRatio) => set({ preferredAspectRatio }),

      renderEngine: "Automatic",
      setRenderEngine: (renderEngine) => set({ renderEngine }),

      hwAccelerationEnabled: true,
      hwVideoDecode: true,
      hwVideoEncode: true,
      hwGpuEffects: true,
      setHwPreference: (key, value) => set({ [key]: value } as any),

      proxyMode: "Auto",
      proxyQuality: "Medium",
      proxyGenerateAuto: true,
      setProxyPreference: (key, value) => set({ [key]: value } as any),

      backgroundRenderingEnabled: true,
      backgroundRenderIdleTime: "5 seconds",
      setBackgroundRenderingEnabled: (backgroundRenderingEnabled) => set({ backgroundRenderingEnabled }),
      setBackgroundRenderIdleTime: (backgroundRenderIdleTime) => set({ backgroundRenderIdleTime }),

      snapTimelineEnabled: true,
      snapToPlayhead: true,
      snapToClipEdges: true,
      snapToMarkers: true,
      snapToTrackItems: true,
      setSnapPreference: (key, value) => set({ [key]: value } as any),

      magneticTimelineEnabled: false,
      setMagneticTimelineEnabled: (magneticTimelineEnabled) => set({ magneticTimelineEnabled }),

      playbackQuality: "Auto",
      setPlaybackQuality: (playbackQuality) => set({ playbackQuality }),

      autoCaptionLanguage: "Auto Detect",
      setAutoCaptionLanguage: (autoCaptionLanguage) => set({ autoCaptionLanguage }),

      exportLocation: "Camera Roll / Photos",
      setExportLocation: (exportLocation) => set({ exportLocation }),
    }),
    {
      name: "editor-preferences-storage",
      storage: createJSONStorage(() => customStorage),
    }
  )
);
