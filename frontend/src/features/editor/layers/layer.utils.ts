import { BaseLayer, UnifiedLayer, BaseLayerType } from "./layer.types";
import { VideoClip, TextLayer, OverlayLayer } from "../types/editor.types";
import { MusicTrack } from "../components/MusicLibrarySheet";

export function createBaseLayer<T extends BaseLayerType>(
  id: string,
  type: T,
  trackId: string,
  startTime: number,
  endTime: number
): BaseLayer & { type: T } {
  return {
    id,
    type,
    trackId,
    startTime,
    endTime,
    duration: Math.max(0, endTime - startTime),
    visible: true,
    locked: false,
    selected: false,
    zIndex: 1,
    opacity: 1.0,
    transform: { x: 0, y: 0, scale: 1, rotation: 0 },
  };
}

export function convertVideoClipToLayer(clip: VideoClip, isSelected: boolean): UnifiedLayer {
  return {
    ...createBaseLayer(clip.id, "video", "track-video", clip.startTime, clip.endTime),
    selected: isSelected,
    clip,
  };
}

export function convertTextLayerToLayer(layer: TextLayer, isSelected: boolean): UnifiedLayer {
  return {
    ...createBaseLayer(layer.id, "text", "track-text", layer.startTime, layer.endTime),
    selected: isSelected,
    layer,
  };
}

export function convertOverlayLayerToLayer(layer: OverlayLayer, isSelected: boolean): UnifiedLayer {
  const type = layer.type === "sticker" ? "sticker" : "overlay";
  return {
    ...createBaseLayer(layer.id, type, "track-overlay", layer.startTime, layer.endTime),
    selected: isSelected,
    layer,
  };
}

export function convertMusicTrackToLayer(track: MusicTrack, totalDuration: number, isSelected: boolean): UnifiedLayer {
  return {
    ...createBaseLayer("music-layer", "music", "track-music", 0, track.duration || totalDuration),
    selected: isSelected,
    track,
  };
}
