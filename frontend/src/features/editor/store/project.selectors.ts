import { ProjectState } from "./project.types";

export const selectSelectedClip = (state: ProjectState) => {
  return state.videoClips.find((c) => c.id === state.selectedClipId) || state.videoClips[0] || null;
};

export const selectSelectedTextLayer = (state: ProjectState) => {
  return state.textLayers.find((l) => l.id === state.selectedTextLayerId) || null;
};

export const selectSelectedOverlayLayer = (state: ProjectState) => {
  return state.overlayLayers.find((l) => l.id === state.selectedOverlayLayerId) || null;
};

export const selectActivePlaybackClip = (state: ProjectState) => {
  let accumulated = 0;
  for (const clip of state.videoClips) {
    const clipDuration = clip.endTime - clip.startTime;
    if (state.currentTime >= accumulated && state.currentTime < accumulated + clipDuration) {
      return { clip, localStartMs: clip.startTime, accumulated };
    }
    accumulated += clipDuration;
  }
  return { clip: state.videoClips[0] || null, localStartMs: 0, accumulated: 0 };
};
