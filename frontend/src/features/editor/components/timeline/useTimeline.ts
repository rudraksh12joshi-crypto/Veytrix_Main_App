import { useMemo, useCallback } from "react";
import { NativeSyntheticEvent, NativeScrollEvent } from "react-native";
import { UseTimelineOptions, TimelineController } from "./timeline.types";
import { PIXELS_PER_MS, THUMBNAIL_WIDTH } from "./timeline.constants";
import { calculateProjectTimelineWidth } from "./timeline.utils";

export function useTimeline(options: UseTimelineOptions): TimelineController {
  const {
    videoRef,
    audioRef,
    scrollViewRef,
    videoClips,
    selectedClipId,
    totalDuration,
    isPlaying,
    isTrimMode,
    draftTrimStart,
    draftTrimEnd,
    setCurrentTime,
  } = options;

  const projectTimelineWidth = useMemo(() => {
    return calculateProjectTimelineWidth(
      videoClips,
      totalDuration,
      isTrimMode,
      selectedClipId,
      draftTrimStart,
      draftTrimEnd
    );
  }, [videoClips, totalDuration, isTrimMode, selectedClipId, draftTrimStart, draftTrimEnd]);

  const handleScroll = useCallback(
    (e: NativeSyntheticEvent<NativeScrollEvent>) => {
      if (!isPlaying) {
        const scrollX = e.nativeEvent.contentOffset.x;
        const newTimeMs = Math.max(0, scrollX / PIXELS_PER_MS);
        if (videoRef.current) {
          videoRef.current.setPositionAsync(newTimeMs);
        }
        if (audioRef.current) {
          audioRef.current.setPositionAsync(newTimeMs);
        }
        setCurrentTime(newTimeMs);
      }
    },
    [isPlaying, videoRef, audioRef, setCurrentTime]
  );

  const scrollToTime = useCallback(
    (timeMs: number, animated = false) => {
      if (scrollViewRef.current) {
        scrollViewRef.current.scrollTo({ x: timeMs * PIXELS_PER_MS, animated });
      }
    },
    [scrollViewRef]
  );

  return {
    projectTimelineWidth,
    PIXELS_PER_MS,
    THUMBNAIL_WIDTH,
    handleScroll,
    scrollToTime,
  };
}
