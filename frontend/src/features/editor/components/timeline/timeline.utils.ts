import { PIXELS_PER_MS } from "./timeline.constants";
import { VideoClip } from "../../types/editor.types";

export function calculateProjectTimelineWidth(
  videoClips: VideoClip[],
  totalDuration: number,
  isTrimMode: boolean,
  selectedClipId: string | null,
  draftTrimStart: number,
  draftTrimEnd: number
): number {
  if (videoClips.length > 0) {
    const totalMs = videoClips.reduce((sum, clip) => {
      const isSelected = clip.id === selectedClipId;
      const activeStart = isTrimMode && isSelected ? draftTrimStart : clip.startTime;
      const activeEnd = isTrimMode && isSelected ? draftTrimEnd : clip.endTime;
      const rawDuration = Math.max(0, activeEnd - activeStart);
      return sum + rawDuration / (clip.speed || 1.0);
    }, 0);
    const gapsPx = Math.max(0, videoClips.length - 1) * 28;
    return totalMs * PIXELS_PER_MS + gapsPx;
  }
  return totalDuration * PIXELS_PER_MS;
}
