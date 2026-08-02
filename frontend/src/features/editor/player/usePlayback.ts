import { useState, useRef, useEffect, useMemo, useCallback } from "react";
import { Audio, AVPlaybackStatus } from "expo-av";
import { ActivePlaybackClip, UsePlaybackOptions, PlaybackController } from "./playback.types";
import { formatTime } from "./playback.utils";

export function usePlayback(options: UsePlaybackOptions): PlaybackController {
  const {
    videoRef,
    audioRef,
    scrollViewRef,
    videoClips,
    selectedClip,
    selectedClipId,
    setSelectedClipId,
    setVideoClips,
    totalDuration,
    setTotalDuration,
    currentTime,
    setCurrentTime,
    isPlaying,
    setIsPlaying,
    isTrimMode,
    trimStart,
    trimEnd,
    draftTrimStart,
    draftTrimEnd,
    musicTrack,
    PIXELS_PER_MS,
  } = options;

  const [previewMuted, setPreviewMuted] = useState(false);

  const activePlaybackClip = useMemo<ActivePlaybackClip>(() => {
    let accumulated = 0;
    for (const clip of videoClips) {
      const clipDuration = clip.endTime - clip.startTime;
      if (currentTime >= accumulated && currentTime < accumulated + clipDuration) {
        return { clip, localStartMs: clip.startTime, accumulated };
      }
      accumulated += clipDuration;
    }
    return { clip: videoClips[0] || null, localStartMs: 0, accumulated: 0 };
  }, [currentTime, videoClips]);

  const playbackStateRef = useRef({
    isPlaying,
    activePlaybackClip,
    isTrimMode,
    selectedClipId,
    draftTrimStart,
    draftTrimEnd,
    totalDuration,
    videoClips,
    PIXELS_PER_MS,
  });

  useEffect(() => {
    playbackStateRef.current = {
      isPlaying,
      activePlaybackClip,
      isTrimMode,
      selectedClipId,
      draftTrimStart,
      draftTrimEnd,
      totalDuration,
      videoClips,
      PIXELS_PER_MS,
    };
  });

  const handlePlaybackStatusUpdate = useCallback((status: AVPlaybackStatus) => {
    if (!status.isLoaded) return;

    const {
      isPlaying: currentlyPlaying,
      activePlaybackClip: activeClipInfo,
      isTrimMode: inTrim,
      selectedClipId: selId,
      draftTrimStart: dStart,
      draftTrimEnd: dEnd,
      totalDuration: totDur,
      videoClips: clips,
      PIXELS_PER_MS: pxPerMs,
    } = playbackStateRef.current;

    const clip = activeClipInfo.clip;
    if (!clip) return;

    const isTrimmingActiveClip = inTrim && selId === clip.id;
    let localVideoStart = clip.trimStartOffset || 0;
    let localVideoEnd = clip.trimEndOffset || clip.originalDuration || 5000;

    if (isTrimmingActiveClip) {
      const deltaStart = dStart - clip.startTime;
      const deltaEnd = clip.endTime - dEnd;
      localVideoStart = (clip.trimStartOffset || 0) + deltaStart;
      localVideoEnd = (clip.trimEndOffset || clip.originalDuration || 5000) - deltaEnd;
    }

    const isAtClipEnd =
      (status.positionMillis >= localVideoEnd - 60 && status.positionMillis > 0) ||
      (status.didJustFinish && status.positionMillis >= localVideoEnd - 300);

    if (isAtClipEnd && currentlyPlaying) {
      const isLastClip = activeClipInfo.accumulated + (clip.endTime - clip.startTime) >= totDur - 100;
      if (isLastClip) {
        // End of final clip: return to the first clip (0ms) and continue playing
        setCurrentTime(0);
        if (scrollViewRef.current) {
          scrollViewRef.current.scrollTo({ x: 0, animated: false });
        }
        videoRef.current?.setPositionAsync(clips[0]?.trimStartOffset || 0);
        videoRef.current?.playAsync();
      } else {
        // Advance into next clip seamlessly
        const nextTime = activeClipInfo.accumulated + (clip.endTime - clip.startTime) + 1;
        setCurrentTime(nextTime);
        if (scrollViewRef.current) {
          scrollViewRef.current.scrollTo({ x: nextTime * pxPerMs, animated: false });
        }
      }
      return;
    }

    if (currentlyPlaying && !status.isPlaying && !status.isBuffering && !status.didJustFinish) {
      videoRef.current?.playAsync();
    }

    if (status.positionMillis < localVideoStart - 200 && currentlyPlaying) {
      videoRef.current?.setPositionAsync(localVideoStart);
      setCurrentTime(activeClipInfo.accumulated);
      if (scrollViewRef.current) {
        scrollViewRef.current.scrollTo({ x: activeClipInfo.accumulated * pxPerMs, animated: false });
      }
      return;
    }

    if (currentlyPlaying || status.isPlaying) {
      const timeIntoClip = status.positionMillis - localVideoStart;
      const newGlobalTime = Math.max(0, activeClipInfo.accumulated + timeIntoClip);
      setCurrentTime(newGlobalTime);

      if (scrollViewRef.current) {
        const scrollX = newGlobalTime * pxPerMs;
        scrollViewRef.current.scrollTo({ x: scrollX, animated: false });
      }
    }

    if (status.durationMillis && clips.length === 1) {
      const realDur = status.durationMillis;
      const currentClip = clips[0];
      if (currentClip && (currentClip.endTime !== realDur || totDur !== realDur)) {
        setTotalDuration(realDur);
        setVideoClips((prev) => {
          if (prev.length === 1 && (prev[0].endTime !== realDur || prev[0].originalDuration !== realDur)) {
            return [
              {
                ...prev[0],
                originalDuration: realDur,
                trimEndOffset: realDur,
                endTime: realDur,
              },
            ];
          }
          return prev;
        });
      }
    }
  }, [setCurrentTime, setTotalDuration, setVideoClips, videoRef, scrollViewRef]);

  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.unloadAsync();
      }
    };
  }, [audioRef]);

  useEffect(() => {
    async function loadAudio() {
      if (audioRef.current) {
        await audioRef.current.unloadAsync();
        audioRef.current = null;
      }
      if (musicTrack?.uri) {
        try {
          const { sound } = await Audio.Sound.createAsync({ uri: musicTrack.uri });
          audioRef.current = sound;
          if (isPlaying) {
            await sound.playAsync();
          }
        } catch (e) {
          console.log("Error loading audio", e);
        }
      }
    }
    loadAudio();
  }, [musicTrack?.uri, isPlaying, audioRef]);

  useEffect(() => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.playAsync().catch(() => {});
      } else {
        audioRef.current.pauseAsync().catch(() => {});
      }
    }
  }, [isPlaying, audioRef]);

  useEffect(() => {
    if (!isPlaying) return;

    const interval = setInterval(() => {
      setCurrentTime((prevTime) => {
        const nextTime = prevTime + 33;
        if (totalDuration > 0 && nextTime >= totalDuration) {
          setIsPlaying(false);
          if (videoRef.current) {
            try {
              videoRef.current.pauseAsync();
            } catch (e) {}
          }
          if (scrollViewRef.current) {
            scrollViewRef.current.scrollTo({ x: 0, animated: false });
          }
          return 0;
        }
        if (scrollViewRef.current) {
          scrollViewRef.current.scrollTo({ x: nextTime * PIXELS_PER_MS, animated: false });
        }
        return nextTime;
      });
    }, 33);

    return () => clearInterval(interval);
  }, [isPlaying, totalDuration, setCurrentTime, setIsPlaying, videoRef, scrollViewRef, PIXELS_PER_MS]);

  const handlePlayPause = async () => {
    const nextPlayingState = !isPlaying;

    if (nextPlayingState) {
      if (totalDuration > 0 && currentTime >= totalDuration - 100) {
        setCurrentTime(0);
        if (scrollViewRef.current) {
          scrollViewRef.current.scrollTo({ x: 0, animated: false });
        }
        if (videoRef.current) {
          try {
            await videoRef.current.setPositionAsync(0);
          } catch (e) {}
        }
      }
    }

    setIsPlaying(nextPlayingState);

    if (videoRef.current) {
      try {
        if (nextPlayingState) {
          const activeStart = isTrimMode ? draftTrimStart : trimStart;
          const activeEnd = isTrimMode ? draftTrimEnd : trimEnd > 0 ? trimEnd : totalDuration;
          if (currentTime >= activeEnd || currentTime < activeStart) {
            try {
              await videoRef.current.setPositionAsync(activeStart);
            } catch (e) {}
            setCurrentTime(activeStart);
          }
          try {
            await videoRef.current.setRateAsync(selectedClip?.speed || 1.0, selectedClip?.maintainPitch ?? true);
          } catch (e) {}
          await videoRef.current.playAsync();
        } else {
          await videoRef.current.pauseAsync();
        }
      } catch (e) {
        console.log("Playback toggle error:", e);
      }
    }
  };

  const handlePreviousClip = async () => {
    const currentIndex = videoClips.findIndex(
      (clip) => currentTime >= clip.startTime && currentTime < clip.endTime
    );
    let activeIndex = currentIndex !== -1 ? currentIndex : videoClips.length - 1;

    if (activeIndex > 0) {
      const prevClip = videoClips[activeIndex - 1];
      setCurrentTime(prevClip.startTime);
      setSelectedClipId(prevClip.id);
      if (scrollViewRef.current) {
        scrollViewRef.current.scrollTo({ x: prevClip.startTime * PIXELS_PER_MS, animated: true });
      }

      if (!isPlaying) {
        if (videoRef.current) {
          await videoRef.current.setPositionAsync(prevClip.trimStartOffset || 0);
        }
      }
    }
  };

  const handleNextClip = async () => {
    const currentIndex = videoClips.findIndex(
      (clip) => currentTime >= clip.startTime && currentTime < clip.endTime
    );
    let activeIndex = currentIndex !== -1 ? currentIndex : videoClips.length - 1;

    if (activeIndex < videoClips.length - 1) {
      const nextClip = videoClips[activeIndex + 1];
      setCurrentTime(nextClip.startTime);
      setSelectedClipId(nextClip.id);
      if (scrollViewRef.current) {
        scrollViewRef.current.scrollTo({ x: nextClip.startTime * PIXELS_PER_MS, animated: true });
      }

      if (videoRef.current) {
        await videoRef.current.setPositionAsync(nextClip.trimStartOffset || 0);
      }
    }
  };

  return {
    isPlaying,
    currentTime,
    totalDuration,
    previewMuted,
    setPreviewMuted,
    activePlaybackClip,
    handlePlaybackStatusUpdate,
    handlePlayPause,
    handlePreviousClip,
    handleNextClip,
    formatTime,
  };
}
