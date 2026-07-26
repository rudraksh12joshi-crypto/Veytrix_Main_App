import React, { useState, useRef, useEffect, useMemo, useCallback } from "react";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Dimensions, Image, Animated, PanResponder, Platform, useWindowDimensions } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { BlurView } from "expo-blur";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { useRouter, useLocalSearchParams } from "expo-router";
import { Video, ResizeMode, Audio, AVPlaybackStatus } from "expo-av";
import * as ImagePicker from 'expo-image-picker';

import { useTheme } from "@/src/theme";
import { MusicLibrarySheet, MusicTrack } from "../components/MusicLibrarySheet";
import { VideoClip, ColorAdjustments, DEFAULT_COLOR_ADJUSTMENTS, TextLayer, DEFAULT_TEXT_LAYER, AudioSettings, DEFAULT_AUDIO_SETTINGS, OverlayLayer, OverlayType, DEFAULT_OVERLAY_LAYER } from "../types/editor.types";
import { ColorPanel } from "../panels/ColorPanel";
import { SpeedPanel } from "../panels/SpeedPanel";
import { TrimToolbar } from "../panels/TrimToolbar";
import { TextPanel } from "../panels/TextPanel";
import { AudioPanel } from "../panels/AudioPanel";
import { OverlayPanel } from "../panels/OverlayPanel";
import { RotatePanel } from "../panels/RotatePanel";
import { TextOverlay } from "../text/TextOverlay";
import { OverlayOverlay } from "../overlay/OverlayOverlay";

const { width } = Dimensions.get("window");

// Mock Data for Tools
const EDITING_TOOLS = [
  { id: "trim", icon: "cut-outline", label: "Trim" },
  { id: "split", icon: "code-working-outline", label: "Split" },
  { id: "text", icon: "text-outline", label: "Text" },
  { id: "color", icon: "color-palette-outline", label: "Color" },
  { id: "adjust", icon: "options-outline", label: "Adjust" },
  { id: "speed", icon: "speedometer-outline", label: "Speed" },
  { id: "crop", icon: "crop-outline", label: "Crop" },
  { id: "audio", icon: "musical-notes-outline", label: "Audio" },
  { id: "effects", icon: "sparkles-outline", label: "Effects" },
  { id: "filters", icon: "color-wand-outline", label: "Filters" },
  { id: "animation", icon: "play-circle-outline", label: "Animation" },
  { id: "overlay", icon: "layers-outline", label: "Overlay" },
  { id: "canvas", icon: "image-outline", label: "Canvas" },
  { id: "stickers", icon: "happy-outline", label: "Stickers" },
  { id: "transitions", icon: "swap-horizontal-outline", label: "Transitions" },
  { id: "background", icon: "color-fill-outline", label: "Background" },
  { id: "rotate", icon: "refresh-outline", label: "Rotate" },
  { id: "mirror", icon: "swap-horizontal", label: "Mirror" },
  { id: "replace", icon: "sync-outline", label: "Replace" },
  { id: "ai", icon: "planet-outline", label: "AI Tools" },
];

// --- Premium Animated Tool Button ---
const ToolButton = React.memo(function ToolButton({
  tool,
  isActive,
  isDisabled,
  onPress,
  primaryColor,
}: {
  tool: { id: string; icon: string; label: string };
  isActive: boolean;
  isDisabled: boolean;
  onPress: () => void;
  primaryColor: string;
}) {
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    Animated.spring(scaleAnim, {
      toValue: 0.95,
      useNativeDriver: true,
      speed: 50,
      bounciness: 4,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleAnim, {
      toValue: isActive ? 1.05 : 1,
      useNativeDriver: true,
      speed: 30,
      bounciness: 6,
    }).start();
  };

  useEffect(() => {
    Animated.spring(scaleAnim, {
      toValue: isActive ? 1.05 : 1,
      useNativeDriver: true,
      speed: 30,
      bounciness: 6,
    }).start();
  }, [isActive]);

  return (
    <TouchableOpacity
      activeOpacity={1}
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      disabled={isDisabled}
      style={{ opacity: isDisabled ? 0.35 : 1 }}
    >
      <Animated.View style={[{ paddingVertical: 6, paddingHorizontal: 12, alignItems: 'center', justifyContent: 'center', width: 68 }, { transform: [{ scale: scaleAnim }] }]}>
        <View style={[{ width: 44, height: 44, borderRadius: 22, backgroundColor: "rgba(255,255,255,0.06)", justifyContent: 'center', alignItems: 'center', overflow: 'hidden' }, isActive && { backgroundColor: "rgba(37,99,235,0.2)", borderWidth: 1, borderColor: "#3B82F6" }]}>
          {isActive && (
            <LinearGradient
              colors={["#2563EB", "#3B82F6", "#60A5FA"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={StyleSheet.absoluteFill}
            />
          )}
          <Ionicons
            name={tool.icon as any}
            size={26}
            color={isActive ? "#fff" : isDisabled ? "#555" : "rgba(200,200,210,0.8)"}
          />
        </View>
        <Text
          style={[
            { fontSize: 11, fontWeight: "500", marginTop: 6, textAlign: 'center' },
            { color: isActive ? "#fff" : isDisabled ? "#555" : "rgba(160,160,175,0.9)" },
          ]}
          numberOfLines={1}
          ellipsizeMode="tail"
        >
          {tool.label}
        </Text>
      </Animated.View>
    </TouchableOpacity>
  );
});

export function EditorPage() {
  const { theme, isDark } = useTheme();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { videosData, videoUri, duration } = useLocalSearchParams<{ videosData?: string; videoUri?: string; duration?: string }>();
  const [selectedTool, setSelectedTool] = useState<string | null>(null);

  const PIXELS_PER_MS = 0.05;
  const THUMBNAIL_WIDTH = 60;

  const videoRef = useRef<Video>(null);
  const scrollViewRef = useRef<ScrollView>(null);
  const lastStateUpdate = useRef(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isPreviewFullscreen, setIsPreviewFullscreen] = useState(false);
  const [scrubberWidth, setScrubberWidth] = useState(0);
  const [previewMuted, setPreviewMuted] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [totalDuration, setTotalDuration] = useState(duration ? parseInt(duration) : 0);

  const [videoClips, setVideoClips] = useState<VideoClip[]>([]);
  const [selectedClipId, setSelectedClipId] = useState<string | null>(null);

  // Text Layers State
  const [textLayers, setTextLayers] = useState<TextLayer[]>([]);
  const [selectedTextLayerId, setSelectedTextLayerId] = useState<string | null>(null);

  // Overlay Layers State
  const [overlayLayers, setOverlayLayers] = useState<OverlayLayer[]>([]);
  const [selectedOverlayLayerId, setSelectedOverlayLayerId] = useState<string | null>(null);

  // AI Assist floating button
  const aiScaleAnim = useRef(new Animated.Value(1)).current;

  const handleAiPressIn = () => {
    Animated.spring(aiScaleAnim, {
      toValue: 0.95,
      useNativeDriver: true,
      speed: 50,
      bounciness: 4,
    }).start();
  };

  const handleAiPressOut = () => {
    Animated.spring(aiScaleAnim, {
      toValue: 1,
      useNativeDriver: true,
      speed: 30,
      bounciness: 6,
    }).start();
  };

  // Compute timeline width from total project duration for helper tracks
  const projectTimelineWidth = useMemo(() => {
    if (videoClips.length > 0) {
      const maxEnd = videoClips.reduce((max, clip) => {
        const clipEnd = (clip.endTime / (clip.speed || 1.0));
        return Math.max(max, clipEnd);
      }, 0);
      return Math.max(maxEnd * PIXELS_PER_MS, 200);
    }
    return totalDuration * PIXELS_PER_MS || 300;
  }, [videoClips, totalDuration]);



  interface EditorHistorySnapshot {
    videoClips: VideoClip[];
    textLayers: TextLayer[];
    overlayLayers: OverlayLayer[];
    totalDuration: number;
    selectedClipId: string | null;
    selectedTextLayerId: string | null;
    selectedOverlayLayerId: string | null;
    currentTime: number;
    musicTrack: MusicTrack | null;
  }

  const [undoStack, setUndoStack] = useState<EditorHistorySnapshot[]>([]);
  const [redoStack, setRedoStack] = useState<EditorHistorySnapshot[]>([]);

  const currentStateRef = useRef<EditorHistorySnapshot>({
    videoClips: [],
    textLayers: [],
    overlayLayers: [],
    totalDuration: 0,
    selectedClipId: null,
    selectedTextLayerId: null,
    selectedOverlayLayerId: null,
    currentTime: 0,
    musicTrack: null,
  });

  useEffect(() => {
    currentStateRef.current = {
      videoClips,
      textLayers,
      overlayLayers,
      totalDuration,
      selectedClipId,
      selectedTextLayerId,
      selectedOverlayLayerId,
      currentTime,
      musicTrack,
    };
  });

  const recordHistory = useCallback(() => {
    const snapshot: EditorHistorySnapshot = JSON.parse(JSON.stringify(currentStateRef.current));
    setUndoStack((prev) => [...prev, snapshot]);
    setRedoStack([]);
  }, []);

  const handleUndo = useCallback(() => {
    if (undoStack.length === 0) return;
    const currentSnapshot: EditorHistorySnapshot = JSON.parse(JSON.stringify(currentStateRef.current));
    const previousState = undoStack[undoStack.length - 1];

    setUndoStack((prev) => prev.slice(0, prev.length - 1));
    setRedoStack((prev) => [...prev, currentSnapshot]);

    setVideoClips(previousState.videoClips || []);
    setTextLayers(previousState.textLayers || []);
    setOverlayLayers(previousState.overlayLayers || []);
    setTotalDuration(previousState.totalDuration || 0);
    setSelectedClipId(previousState.selectedClipId || null);
    setSelectedTextLayerId(previousState.selectedTextLayerId || null);
    setSelectedOverlayLayerId(previousState.selectedOverlayLayerId || null);
    setCurrentTime(previousState.currentTime || 0);
    setMusicTrack(previousState.musicTrack || null);

    if (scrollViewRef.current) {
      scrollViewRef.current.scrollTo({ x: (previousState.currentTime || 0) * PIXELS_PER_MS, animated: false });
    }
  }, [undoStack, PIXELS_PER_MS]);

  const handleRedo = useCallback(() => {
    if (redoStack.length === 0) return;
    const currentSnapshot: EditorHistorySnapshot = JSON.parse(JSON.stringify(currentStateRef.current));
    const nextState = redoStack[redoStack.length - 1];

    setRedoStack((prev) => prev.slice(0, prev.length - 1));
    setUndoStack((prev) => [...prev, currentSnapshot]);

    setVideoClips(nextState.videoClips || []);
    setTextLayers(nextState.textLayers || []);
    setOverlayLayers(nextState.overlayLayers || []);
    setTotalDuration(nextState.totalDuration || 0);
    setSelectedClipId(nextState.selectedClipId || null);
    setSelectedTextLayerId(nextState.selectedTextLayerId || null);
    setSelectedOverlayLayerId(nextState.selectedOverlayLayerId || null);
    setCurrentTime(nextState.currentTime || 0);
    setMusicTrack(nextState.musicTrack || null);

    if (scrollViewRef.current) {
      scrollViewRef.current.scrollTo({ x: (nextState.currentTime || 0) * PIXELS_PER_MS, animated: false });
    }
  }, [redoStack, PIXELS_PER_MS]);

  const handleAddOverlayLayer = (type: OverlayLayer['type']) => {
    recordHistory();
    const newId = `overlay-${Date.now()}`;
    const sampleSources: Record<string, string> = {
      image: "https://images.unsplash.com/photo-1579783902614-a3fb3927b675",
      video: "https://images.unsplash.com/photo-1536240478700-b869070f9279",
      gif: "https://images.unsplash.com/photo-1550684848-fac1c5b4e853",
      sticker: "sticker-star",
      logo: "logo-veytrix",
      watermark: "watermark-official",
    };

    const newLayer: OverlayLayer = {
      ...DEFAULT_OVERLAY_LAYER,
      id: newId,
      type,
      source: sampleSources[type] || sampleSources.image,
      name: `${type.toUpperCase()} Overlay`,
      startTime: 0,
      endTime: totalDuration > 0 ? totalDuration : 30000,
      layerOrder: overlayLayers.length + 1,
    };

    setOverlayLayers((prev) => [...prev, newLayer]);
    setSelectedOverlayLayerId(newId);
    setSelectedTool("overlay");
  };

  const handleUpdateOverlayLayer = (id: string, updates: Partial<OverlayLayer>) => {
    recordHistory();
    setOverlayLayers((prev) =>
      prev.map((layer) => (layer.id === id ? { ...layer, ...updates } : layer))
    );
  };

  const handleDeleteOverlayLayer = (id: string) => {
    recordHistory();
    setOverlayLayers((prev) => prev.filter((l) => l.id !== id));
    if (selectedOverlayLayerId === id) {
      setSelectedOverlayLayerId(null);
    }
  };

  const handleDuplicateOverlayLayer = (id: string) => {
    recordHistory();
    const target = overlayLayers.find((l) => l.id === id);
    if (!target) return;
    const newId = `overlay-${Date.now()}`;
    const dupLayer: OverlayLayer = {
      ...target,
      id: newId,
      name: `${target.name} (Copy)`,
      position: { x: Math.min(90, target.position.x + 5), y: Math.min(90, target.position.y + 5) },
      layerOrder: overlayLayers.length + 1,
    };
    setOverlayLayers((prev) => [...prev, dupLayer]);
    setSelectedOverlayLayerId(newId);
  };

  const handleBringForwardOverlay = (id: string) => {
    recordHistory();
    setOverlayLayers((prev) =>
      prev.map((l) => (l.id === id ? { ...l, layerOrder: l.layerOrder + 1 } : l))
    );
  };

  const handleSendBackwardOverlay = (id: string) => {
    recordHistory();
    setOverlayLayers((prev) =>
      prev.map((l) => (l.id === id ? { ...l, layerOrder: Math.max(1, l.layerOrder - 1) } : l))
    );
  };

  const handleAddTextLayer = () => {
    recordHistory();
    const newId = `text-${Date.now()}`;
    const newLayer: TextLayer = {
      ...DEFAULT_TEXT_LAYER,
      id: newId,
      text: "Add Text Here",
      startTime: 0,
      endTime: totalDuration > 0 ? totalDuration : 30000,
      layerOrder: textLayers.length + 1,
    };
    setTextLayers((prev) => [...prev, newLayer]);
    setSelectedTextLayerId(newId);
    setSelectedTool("text");
  };

  const handleUpdateTextLayer = (id: string, updates: Partial<TextLayer>) => {
    recordHistory();
    setTextLayers((prev) =>
      prev.map((layer) => (layer.id === id ? { ...layer, ...updates } : layer))
    );
  };

  const isImageUri = (uri?: string, mediaType?: string) => {
    if (mediaType === "image") return true;
    if (mediaType === "video") return false;
    if (!uri) return false;
    const lower = uri.toLowerCase();
    return (
      lower.endsWith(".jpg") ||
      lower.endsWith(".jpeg") ||
      lower.endsWith(".png") ||
      lower.endsWith(".heic") ||
      lower.endsWith(".webp") ||
      lower.endsWith(".gif") ||
      lower.startsWith("data:image")
    );
  };

  const handleAddMediaPress = async () => {
    try {
      let result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.All,
        allowsEditing: false,
        allowsMultipleSelection: true,
        quality: 1,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        recordHistory();
        setVideoClips((prev) => {
          const newClips = [...prev];
          let currentTotal = prev.length > 0 ? prev[prev.length - 1].endTime : 0;
          let newlySelectedId = "";

          result.assets.forEach((asset, idx) => {
            const isImg = asset.type === 'image' || isImageUri(asset.uri, asset.type ?? undefined);
            const dur = isImg ? 5000 : (asset.duration || 5000);
            const clipDur = parseInt(dur.toString());
            const startTime = currentTotal;
            const endTime = currentTotal + clipDur;
            currentTotal = endTime;
            
            const newId = `clip-${Date.now()}-${idx}`;
            if (idx === 0) newlySelectedId = newId;

            newClips.push({
              id: newId,
              videoUri: asset.uri,
              thumbnailUri: asset.uri,
              originalDuration: clipDur,
              trimStartOffset: 0,
              trimEndOffset: clipDur,
              startTime,
              endTime,
              speed: 1.0,
              reverse: false,
              maintainPitch: true,
              motionBlur: false,
              frameBlending: false,
              adjustments: { ...DEFAULT_COLOR_ADJUSTMENTS },
              audio: { ...DEFAULT_AUDIO_SETTINGS },
              mediaType: isImg ? 'image' : 'video',
            });
          });
          
          setTotalDuration(currentTotal);
          if (newlySelectedId) {
            setSelectedClipId(newlySelectedId);
          }
          return newClips;
        });
      }
    } catch (e) {
      console.log("Error launching image picker:", e);
    }
  };

  const handleDeleteTextLayer = (id: string) => {
    recordHistory();
    setTextLayers((prev) => prev.filter((l) => l.id !== id));
    if (selectedTextLayerId === id) {
      setSelectedTextLayerId(null);
    }
  };

  const handleDuplicateTextLayer = (id: string) => {
    recordHistory();
    const target = textLayers.find((l) => l.id === id);
    if (!target) return;
    const newId = `text-${Date.now()}`;
    const dupLayer: TextLayer = {
      ...target,
      id: newId,
      text: `${target.text} (Copy)`,
      position: { x: Math.min(90, target.position.x + 5), y: Math.min(90, target.position.y + 5) },
      layerOrder: textLayers.length + 1,
    };
    setTextLayers((prev) => [...prev, dupLayer]);
    setSelectedTextLayerId(newId);
  };

  const selectedClip = useMemo(() => {
    return videoClips.find((c) => c.id === selectedClipId) || videoClips[0] || null;
  }, [videoClips, selectedClipId]);

  const activePlaybackClip = useMemo(() => {
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

  const activeSpeed = selectedClip?.speed || 1.0;

  const updateSelectedClip = (updates: Partial<VideoClip>) => {
    const targetId = selectedClipId || (videoClips[0] ? videoClips[0].id : null);
    if (!targetId) return;

    setVideoClips((prev) =>
      prev.map((clip) => {
        if (clip.id === targetId) {
          const updated = { ...clip, ...updates };
          if (updates.speed !== undefined && videoRef.current) {
            videoRef.current.setRateAsync(updated.speed, updated.maintainPitch ?? true);
          }
          return updated;
        }
        return clip;
      })
    );
  };

  const updateSelectedClipAdjustments = (updates: Partial<ColorAdjustments>) => {
    const targetId = selectedClipId || (videoClips[0] ? videoClips[0].id : null);
    if (!targetId) return;

    setVideoClips((prev) =>
      prev.map((clip) => {
        if (clip.id === targetId) {
          return {
            ...clip,
            adjustments: {
              ...DEFAULT_COLOR_ADJUSTMENTS,
              ...clip.adjustments,
              ...updates,
            },
          };
        }
        return clip;
      })
    );
  };

  const resetSelectedClipAdjustments = () => {
    updateSelectedClip({ adjustments: { ...DEFAULT_COLOR_ADJUSTMENTS } });
  };

  const updateSelectedClipAudio = (updates: Partial<AudioSettings>) => {
    const targetId = selectedClipId || (videoClips[0] ? videoClips[0].id : null);
    if (!targetId) return;

    setVideoClips((prev) =>
      prev.map((clip) => {
        if (clip.id === targetId) {
          return {
            ...clip,
            audio: {
              ...DEFAULT_AUDIO_SETTINGS,
              ...clip.audio,
              ...updates,
            },
          };
        }
        return clip;
      })
    );
  };

  const [trimStart, setTrimStart] = useState(0);
  const [trimEnd, setTrimEnd] = useState(0);
  const [draftTrimStart, setDraftTrimStart] = useState(0);
  const [draftTrimEnd, setDraftTrimEnd] = useState(0);
  const [isSnappingLeft, setIsSnappingLeft] = useState(false);
  const [isSnappingRight, setIsSnappingRight] = useState(false);

  const isTrimMode = selectedTool === "trim";

  const draftTrimStartRef = useRef(draftTrimStart);
  draftTrimStartRef.current = draftTrimStart;

  const draftTrimEndRef = useRef(draftTrimEnd);
  draftTrimEndRef.current = draftTrimEnd;

  const currentTimeRef = useRef(currentTime);
  currentTimeRef.current = currentTime;

  const totalDurationRef = useRef(totalDuration);
  totalDurationRef.current = totalDuration;

  const startDragPosRef = useRef({ startX: 0, initialMs: 0 });
  const speedSliderWidthRef = useRef(260);

  const [musicSheetVisible, setMusicSheetVisible] = useState(false);
  const [musicTrack, setMusicTrack] = useState<MusicTrack | null>(null);
  const [selectedTimelineClip, setSelectedTimelineClip] = useState<"music" | null>(null);

  const audioRef = useRef<Audio.Sound | null>(null);

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

    const isAtClipEnd = (status.positionMillis >= localVideoEnd - 60 && status.positionMillis > 0) || 
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

    if (status.durationMillis && totDur === 0 && clips.length === 1) {
      setTotalDuration(status.durationMillis);
    }
  }, []);

  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.unloadAsync();
      }
    };
  }, []);

  useEffect(() => {
    if (videoClips.length === 0) {
      let initialClips: VideoClip[] = [];
      let totalDur = 0;

      if (videosData) {
        try {
          const parsedVideos = JSON.parse(videosData);
          if (Array.isArray(parsedVideos) && parsedVideos.length > 0) {
            initialClips = parsedVideos.map((v: any, index: number) => {
              const dur = v.duration || 5000; // default 5s if unknown
              const clipDur = parseInt(dur.toString());
              const startTime = totalDur;
              const endTime = totalDur + clipDur;
              totalDur += clipDur;
              return {
                id: `clip-${index + 1}`,
                videoUri: v.uri,
                originalDuration: clipDur,
                trimStartOffset: 0,
                trimEndOffset: clipDur,
                startTime: startTime,
                endTime: endTime,
                speed: 1.0,
                reverse: false,
                maintainPitch: true,
                motionBlur: false,
                frameBlending: false,
                adjustments: { ...DEFAULT_COLOR_ADJUSTMENTS },
                audio: { ...DEFAULT_AUDIO_SETTINGS },
              };
            });
          }
        } catch (e) {
          console.error("Failed to parse videosData", e);
        }
      }

      if (initialClips.length === 0) {
        const dur = totalDuration > 0 ? totalDuration : (duration ? parseInt(duration) : 30000);
        totalDur = dur;
        initialClips = [{
          id: "clip-1",
          videoUri,
          originalDuration: dur,
          trimStartOffset: 0,
          trimEndOffset: dur,
          startTime: 0,
          endTime: dur,
          speed: 1.0,
          reverse: false,
          maintainPitch: true,
          motionBlur: false,
          frameBlending: false,
          adjustments: { ...DEFAULT_COLOR_ADJUSTMENTS },
          audio: { ...DEFAULT_AUDIO_SETTINGS },
        }];
      }

      setVideoClips(initialClips);
      setSelectedClipId(initialClips[0].id);
      setTotalDuration(totalDur);

      if (trimEnd === 0) {
        setTrimEnd(initialClips[0].endTime);
        setDraftTrimEnd(initialClips[0].endTime);
      }
    }
  }, [videosData, totalDuration, duration, videoUri, videoClips.length, trimEnd]);

  useEffect(() => {
    if (videoClips.length > 0) {
      const newTotalDuration = videoClips[videoClips.length - 1].endTime;
      if (newTotalDuration !== totalDuration) {
        setTotalDuration(newTotalDuration);
      }
    }
  }, [videoClips]);

  const handleSplitClip = () => {
    recordHistory();
    const defaultClip: VideoClip = {
      id: "clip-1",
      startTime: 0,
      endTime: totalDuration > 0 ? totalDuration : 30000,
      speed: 1.0,
      reverse: false,
      maintainPitch: true,
      motionBlur: false,
      frameBlending: false,
      adjustments: { ...DEFAULT_COLOR_ADJUSTMENTS },
      audio: { ...DEFAULT_AUDIO_SETTINGS },
    };
    const clipsToUse = videoClips.length > 0 ? videoClips : [defaultClip];

    let targetClipIndex = clipsToUse.findIndex(
      (c) => currentTime > c.startTime + 10 && currentTime < c.endTime - 10
    );

    if (targetClipIndex === -1) {
      targetClipIndex = clipsToUse.findIndex(
        (c) => currentTime >= c.startTime && currentTime <= c.endTime
      );
    }

    if (targetClipIndex === -1) {
      return;
    }

    const targetClip = clipsToUse[targetClipIndex];
    const splitTime = currentTime;

    if (splitTime <= targetClip.startTime + 10 || splitTime >= targetClip.endTime - 10) {
      return;
    }

    const timeIntoClip = splitTime - targetClip.startTime;
    const targetTrimStart = targetClip.trimStartOffset || 0;
    const targetTrimEnd = targetClip.trimEndOffset || targetClip.originalDuration || (targetClip.endTime - targetClip.startTime);
    const splitMediaOffset = targetTrimStart + timeIntoClip;

    const timestamp = Date.now();
    const clipA: VideoClip = {
      ...targetClip,
      id: `${targetClip.id}-a-${timestamp}`,
      startTime: targetClip.startTime,
      endTime: splitTime,
      trimStartOffset: targetTrimStart,
      trimEndOffset: splitMediaOffset,
    };

    const clipB: VideoClip = {
      ...targetClip,
      id: `${targetClip.id}-b-${timestamp}`,
      startTime: splitTime,
      endTime: targetClip.endTime,
      trimStartOffset: splitMediaOffset,
      trimEndOffset: targetTrimEnd,
    };

    const updatedClips = [
      ...clipsToUse.slice(0, targetClipIndex),
      clipA,
      clipB,
      ...clipsToUse.slice(targetClipIndex + 1),
    ];

    setVideoClips(updatedClips);
    setSelectedClipId(clipB.id);
  };

  const handleSelectTool = (toolId: string) => {
    if (toolId === "split") {
      handleSplitClip();
    } else if (toolId === "stickers") {
      handleAddOverlayLayer("sticker");
      setSelectedTool("overlay");
    } else if (toolId === "overlay") {
      if (overlayLayers.length === 0) {
        handleAddOverlayLayer("image");
      }
      setSelectedTool("overlay");
    } else if (toolId === "trim") {
      const activeClip = videoClips.find((c) => c.id === selectedClipId) || videoClips[0];
      const start = activeClip ? activeClip.startTime : trimStart;
      const end = activeClip ? activeClip.endTime : (trimEnd > 0 ? trimEnd : totalDuration);
      setDraftTrimStart(start);
      setDraftTrimEnd(end);
      setSelectedTool("trim");
    } else {
      setSelectedTool(toolId);
    }
  };

  const handleCancelTrim = () => {
    setDraftTrimStart(trimStart);
    setDraftTrimEnd(trimEnd);
    setSelectedTool(null);
  };

  const handleDoneTrim = () => {
    if (selectedClipId && videoClips.length > 0) {
      recordHistory();
      setVideoClips((prev) => {
        let currentTotal = 0;
        return prev.map((clip) => {
          if (clip.id === selectedClipId) {
            const deltaStart = draftTrimStart - clip.startTime;
            const deltaEnd = clip.endTime - draftTrimEnd;
            const newTrimStartOffset = Math.max(0, (clip.trimStartOffset || 0) + deltaStart);
            const origDur = clip.originalDuration || 5000;
            const newTrimEndOffset = Math.min(origDur, Math.max(newTrimStartOffset + 500, (clip.trimEndOffset || origDur) - deltaEnd));
            const dur = newTrimEndOffset - newTrimStartOffset;

            const updatedClip = {
              ...clip,
              trimStartOffset: newTrimStartOffset,
              trimEndOffset: newTrimEndOffset,
              startTime: currentTotal,
              endTime: currentTotal + dur,
            };
            currentTotal += dur;
            return updatedClip;
          } else {
            const dur = (clip.trimEndOffset || clip.originalDuration || 5000) - (clip.trimStartOffset || 0);
            const updatedClip = {
              ...clip,
              startTime: currentTotal,
              endTime: currentTotal + dur,
            };
            currentTotal += dur;
            return updatedClip;
          }
        });
      });
    }
    setTrimStart(draftTrimStart);
    setTrimEnd(draftTrimEnd);
  };

  const handleDoneTrimAndClose = () => {
    handleDoneTrim();
    setSelectedTool(null);
  };

  const speedPanResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderGrant: (e) => {
        const locationX = e.nativeEvent.locationX;
        const ratio = Math.max(0, Math.min(1, locationX / (speedSliderWidthRef.current || 260)));
        const newSpeed = parseFloat((0.25 + ratio * (5.0 - 0.25)).toFixed(2));
        updateSelectedClip({ speed: newSpeed });
      },
      onPanResponderMove: (_, gestureState) => {
        const ratio = Math.max(0, Math.min(1, (gestureState.dx + (speedSliderWidthRef.current || 260) * ((activeSpeed - 0.25) / 4.75)) / (speedSliderWidthRef.current || 260)));
        const newSpeed = parseFloat((0.25 + ratio * (5.0 - 0.25)).toFixed(2));
        updateSelectedClip({ speed: newSpeed });
      },
    })
  ).current;

  const leftPanResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderGrant: (_, gestureState) => {
        startDragPosRef.current = {
          startX: gestureState.x0,
          initialMs: draftTrimStartRef.current,
        };
        setIsPlaying(false);
        videoRef.current?.pauseAsync();
      },
      onPanResponderMove: (_, gestureState) => {
        const deltaMs = gestureState.dx / PIXELS_PER_MS;
        const maxLimit = (draftTrimEndRef.current > 0 ? draftTrimEndRef.current : totalDurationRef.current) - 500;
        let rawNewMs = Math.max(0, Math.min(startDragPosRef.current.initialMs + deltaMs, maxLimit));

        const SNAP_THRESHOLD_MS = 250;
        if (Math.abs(rawNewMs - currentTimeRef.current) < SNAP_THRESHOLD_MS) {
          rawNewMs = Math.min(currentTimeRef.current, maxLimit);
          setIsSnappingLeft(true);
        } else {
          setIsSnappingLeft(false);
        }

        setDraftTrimStart(rawNewMs);
        videoRef.current?.setPositionAsync(rawNewMs);
        setCurrentTime(rawNewMs);
      },
      onPanResponderRelease: () => {
        setIsSnappingLeft(false);
        handleDoneTrim();
      },
      onPanResponderTerminate: () => {
        setIsSnappingLeft(false);
      },
    })
  ).current;

  const rightPanResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderGrant: (_, gestureState) => {
        startDragPosRef.current = {
          startX: gestureState.x0,
          initialMs: draftTrimEndRef.current > 0 ? draftTrimEndRef.current : totalDurationRef.current,
        };
        setIsPlaying(false);
        videoRef.current?.pauseAsync();
      },
      onPanResponderMove: (_, gestureState) => {
        const deltaMs = gestureState.dx / PIXELS_PER_MS;
        const minLimit = draftTrimStartRef.current + 500;
        const maxLimit = totalDurationRef.current > 0 ? totalDurationRef.current : 30000;
        let rawNewMs = Math.max(minLimit, Math.min(startDragPosRef.current.initialMs + deltaMs, maxLimit));

        const SNAP_THRESHOLD_MS = 250;
        if (Math.abs(rawNewMs - currentTimeRef.current) < SNAP_THRESHOLD_MS) {
          rawNewMs = Math.max(currentTimeRef.current, minLimit);
          setIsSnappingRight(true);
        } else {
          setIsSnappingRight(false);
        }

        setDraftTrimEnd(rawNewMs);
        videoRef.current?.setPositionAsync(rawNewMs);
        setCurrentTime(rawNewMs);
      },
      onPanResponderRelease: () => {
        setIsSnappingRight(false);
        handleDoneTrim();
      },
      onPanResponderTerminate: () => {
        setIsSnappingRight(false);
      },
    })
  ).current;

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
  }, [musicTrack?.uri]);

  useEffect(() => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.playAsync().catch(() => {});
      } else {
        audioRef.current.pauseAsync().catch(() => {});
      }
    }
  }, [isPlaying]);

  useEffect(() => {
    if (!isPlaying) return;

    const interval = setInterval(() => {
      setCurrentTime((prevTime) => {
        const nextTime = prevTime + 33;
        if (totalDuration > 0 && nextTime >= totalDuration) {
          setIsPlaying(false);
          if (videoRef.current) {
            try { videoRef.current.pauseAsync(); } catch (e) {}
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
  }, [isPlaying, totalDuration]);

  const formatTime = (ms: number) => {
    if (isNaN(ms) || ms < 0) return "00:00";
    const totalSeconds = Math.floor(ms / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

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
          const activeEnd = isTrimMode ? draftTrimEnd : (trimEnd > 0 ? trimEnd : totalDuration);
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
    // Find active clip index based on global currentTime
    const currentIndex = videoClips.findIndex(clip => currentTime >= clip.startTime && currentTime < clip.endTime);
    let activeIndex = currentIndex !== -1 ? currentIndex : videoClips.length - 1;

    if (activeIndex > 0) {
      const prevClip = videoClips[activeIndex - 1];
      setCurrentTime(prevClip.startTime);
      setSelectedClipId(prevClip.id);
      if (scrollViewRef.current) {
        scrollViewRef.current.scrollTo({ x: prevClip.startTime * PIXELS_PER_MS, animated: true });
      }
      
      // Update playback source manually if paused
      if (!isPlaying) {
        if (videoRef.current) {
          await videoRef.current.setPositionAsync(prevClip.trimStartOffset || 0);
        }
      }
    }
  };

  const handleNextClip = async () => {
    const currentIndex = videoClips.findIndex(clip => currentTime >= clip.startTime && currentTime < clip.endTime);
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

  const renderTopToolbar = () => (
    <View style={styles.topToolbar}>
      <View style={styles.leftActions}>
        <TouchableOpacity onPress={() => router.back()} style={styles.iconButton}>
          <Ionicons name="chevron-back" size={24} color="#fff" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.iconButton}>
          <Ionicons name="help-circle-outline" size={24} color="#fff" />
        </TouchableOpacity>
      </View>
      
      <View style={styles.headerCenter}>
        <TouchableOpacity style={{flexDirection: 'row', alignItems: 'center'}}>
          <Ionicons name="square-outline" size={18} color="#fff" style={{marginRight: 6}} />
          <Text style={styles.aspectRatioText}>Original</Text>
          <Ionicons name="caret-down" size={12} color="#fff" style={{marginLeft: 6}} />
        </TouchableOpacity>
        <TouchableOpacity style={styles.moreOptionsBtn}>
          <Ionicons name="ellipsis-horizontal" size={20} color="#fff" />
        </TouchableOpacity>
      </View>

      <View style={styles.topActions}>
        <TouchableOpacity style={styles.saveButton}>
          <Ionicons name="save-outline" size={20} color="#fff" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.exportButtonSmall}>
          <Ionicons name="push-outline" size={20} color="#fff" />
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderVideoPreview = () => {
    const activeAdj = selectedClip?.adjustments || DEFAULT_COLOR_ADJUSTMENTS;
    const brightVal = activeAdj.brightness || 0;
    const tempVal = activeAdj.temperature || 0;
    const tintVal = activeAdj.tint || 0;

    const brightOverlayOpacity = Math.min(0.6, Math.abs(brightVal) / 200);
    const tempOverlayOpacity = Math.min(0.4, Math.abs(tempVal) / 250);
    const tintOverlayOpacity = Math.min(0.4, Math.abs(tintVal) / 250);

    const clipRotation = activePlaybackClip.clip?.rotation || 0;

    return (
      <View style={isPreviewFullscreen ? styles.fullscreenContainer : styles.previewContainer}>
        <View style={[styles.previewBox, clipRotation !== 0 && { transform: [{ rotate: `${clipRotation}deg` }] }]}>
          {activePlaybackClip.clip && isImageUri(activePlaybackClip.clip.videoUri, activePlaybackClip.clip.mediaType) ? (
            <Image
              source={{ uri: activePlaybackClip.clip.videoUri }}
              style={StyleSheet.absoluteFill}
              resizeMode="contain"
            />
          ) : (videoUri || activePlaybackClip.clip?.videoUri) ? (
            <Video
              ref={videoRef}
              source={{ uri: activePlaybackClip.clip?.videoUri || videoUri || "" }}
              isMuted={previewMuted || Boolean(selectedClip?.audio?.muted)}
              volume={selectedClip?.audio?.volume !== undefined ? Math.min(1.0, selectedClip.audio.volume / 100) : 1.0}
              style={StyleSheet.absoluteFill}
              resizeMode={ResizeMode.CONTAIN}
              shouldPlay={isPlaying}
              rate={selectedClip?.speed || 1.0}
              shouldCorrectPitch={selectedClip?.maintainPitch ?? true}
              progressUpdateIntervalMillis={32}
              onPlaybackStatusUpdate={handlePlaybackStatusUpdate}
            />
          ) : (
            <Image source={{uri: "https://images.unsplash.com/photo-1517404215738-15263e9f9178"}} style={StyleSheet.absoluteFill} resizeMode="cover" />
          )}

          {brightVal !== 0 && (
            <View
              pointerEvents="none"
              style={[
                StyleSheet.absoluteFill,
                {
                  backgroundColor: brightVal > 0 ? `rgba(255,255,255,${brightOverlayOpacity})` : `rgba(0,0,0,${brightOverlayOpacity})`,
                },
              ]}
            />
          )}
          {tempVal !== 0 && (
            <View
              pointerEvents="none"
              style={[
                StyleSheet.absoluteFill,
                {
                  backgroundColor: tempVal > 0 ? `rgba(255,160,50,${tempOverlayOpacity})` : `rgba(50,180,255,${tempOverlayOpacity})`,
                },
              ]}
            />
          )}
          {tintVal !== 0 && (
            <View
              pointerEvents="none"
              style={[
                StyleSheet.absoluteFill,
                {
                  backgroundColor: tintVal > 0 ? `rgba(255,50,255,${tintOverlayOpacity})` : `rgba(50,255,50,${tintOverlayOpacity})`,
                },
              ]}
            />
          )}
          
          <OverlayOverlay
            layers={overlayLayers}
            selectedLayerId={selectedOverlayLayerId}
            isEditingMode={selectedTool === "overlay"}
            currentTime={currentTime}
            onSelectLayer={(id) => {
              setSelectedOverlayLayerId(id);
              setSelectedTool("overlay");
            }}
            onUpdateLayerPosition={(id, pos) => handleUpdateOverlayLayer(id, { position: pos })}
            onDeleteLayer={handleDeleteOverlayLayer}
          />

          <TextOverlay
            layers={textLayers}
            selectedLayerId={selectedTextLayerId}
            isEditingMode={selectedTool === "text"}
            currentTime={currentTime}
            onSelectLayer={(id) => {
              setSelectedTextLayerId(id);
              setSelectedTool("text");
            }}
            onUpdateLayerPosition={(id, pos) => handleUpdateTextLayer(id, { position: pos })}
            onDeleteLayer={handleDeleteTextLayer}
          />
          
          {!isPreviewFullscreen && (
            <TouchableOpacity 
              style={styles.fullscreenButton}
              onPress={() => setIsPreviewFullscreen(true)}
            >
              <Ionicons name="expand" size={16} color="#fff" />
            </TouchableOpacity>
          )}
        </View>

        {isPreviewFullscreen ? (
          <View style={styles.fullscreenControls}>
            <View style={styles.fullscreenTopBar}>
              <TouchableOpacity onPress={() => setIsPreviewFullscreen(false)} style={styles.fullscreenActionBtn}>
                <Ionicons name="contract" size={28} color="#fff" />
              </TouchableOpacity>
            </View>

            <View style={styles.fullscreenBottomBar}>
              <View style={styles.fullscreenScrubberWrap}>
                <Text style={styles.fullscreenTime}>{formatTime(currentTime)}</Text>
                <TouchableOpacity 
                  activeOpacity={1}
                  style={styles.fullscreenScrubberTrackTouch}
                  onLayout={(e) => setScrubberWidth(e.nativeEvent.layout.width)}
                  onPress={(e) => {
                    if (scrubberWidth > 0 && totalDuration > 0) {
                      const x = e.nativeEvent.locationX;
                      const targetTime = Math.max(0, Math.min((x / scrubberWidth) * totalDuration, totalDuration));
                      setCurrentTime(targetTime);
                      videoRef.current?.setPositionAsync(targetTime);
                    }
                  }}
                >
                  <View style={styles.fullscreenScrubberTrack}>
                    <View style={[styles.fullscreenScrubberFill, { width: totalDuration ? `${(currentTime / totalDuration) * 100}%` : '0%' }]} />
                  </View>
                </TouchableOpacity>
                <Text style={styles.fullscreenTime}>{formatTime(totalDuration)}</Text>
              </View>

              <View style={styles.fullscreenPlayActions}>
                <TouchableOpacity onPress={handlePreviousClip} style={styles.fullscreenActionBtn}>
                  <Ionicons name="play-skip-back" size={28} color="#fff" />
                </TouchableOpacity>
                <TouchableOpacity 
                  onPress={handlePlayPause}
                  style={styles.fullscreenMainPlayBtn}
                >
                  <LinearGradient
                    colors={isPlaying ? ["#FF453A", "#C0392B"] : ["#007AFF", "#0051A8"]}
                    style={{width: '100%', height: '100%', borderRadius: 32, justifyContent: 'center', alignItems: 'center'}}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                  >
                    <Ionicons name={isPlaying ? "pause" : "play"} size={36} color="#fff" style={!isPlaying ? { marginLeft: 4 } : undefined} />
                  </LinearGradient>
                </TouchableOpacity>
                <TouchableOpacity onPress={handleNextClip} style={styles.fullscreenActionBtn}>
                  <Ionicons name="play-skip-forward" size={28} color="#fff" />
                </TouchableOpacity>
                <TouchableOpacity onPress={() => setPreviewMuted(!previewMuted)} style={styles.fullscreenActionBtn}>
                  <Ionicons name={previewMuted ? "volume-mute" : "volume-high"} size={28} color="#fff" />
                </TouchableOpacity>
              </View>
            </View>
          </View>
        ) : (
      <View style={styles.playbackControls}>
        <View style={styles.playbackTimeWrap}>
          <Text style={styles.timeTextCompact}>
            {formatTime(currentTime)} <Text style={styles.timeTotalText}>/ {formatTime(totalDuration)}</Text>
          </Text>
        </View>
        
        <View style={styles.playActionsCompact}>
          <TouchableOpacity style={styles.compactActionBtn} onPress={handlePreviousClip} activeOpacity={0.7}>
            <Ionicons name="play-skip-back" size={16} color="#fff" />
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.mainPlayBtn} 
            onPress={handlePlayPause}
            activeOpacity={0.8}
          >
            <LinearGradient
              colors={isPlaying ? ["#FF453A", "#C0392B"] : ["#007AFF", "#0051A8"]}
              style={styles.mainPlayBtnGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <Ionicons 
                name={isPlaying ? "pause" : "play"} 
                size={18} 
                color="#fff" 
                style={!isPlaying ? { marginLeft: 2 } : undefined} 
              />
            </LinearGradient>
          </TouchableOpacity>

          <TouchableOpacity style={styles.compactActionBtn} onPress={handleNextClip} activeOpacity={0.7}>
            <Ionicons name="play-skip-forward" size={16} color="#fff" />
          </TouchableOpacity>
        </View>

        <View style={styles.playbackRightActions}>
          <TouchableOpacity style={styles.rightActionBtn} activeOpacity={0.7}>
            <Ionicons name="options-outline" size={18} color="#fff" />
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.rightActionBtn, undoStack.length === 0 && { opacity: 0.35 }]} 
            onPress={handleUndo}
            disabled={undoStack.length === 0}
            activeOpacity={0.7}
          >
            <Ionicons name="arrow-undo-outline" size={18} color={undoStack.length > 0 ? "#fff" : "rgba(255,255,255,0.4)"} />
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.rightActionBtn, redoStack.length === 0 && { opacity: 0.35 }]} 
            onPress={handleRedo}
            disabled={redoStack.length === 0}
            activeOpacity={0.7}
          >
            <Ionicons name="arrow-redo-outline" size={18} color={redoStack.length > 0 ? "#fff" : "rgba(255,255,255,0.4)"} />
          </TouchableOpacity>
        </View>
      </View>
        )}
    </View>
  );
};

  const renderTimeline = () => {
    return (
      <View style={[styles.timelineContainer, { backgroundColor: "#141416" }]}>
        <View style={styles.timelineBody}>
          {/* Fixed Left Column */}
          <View style={[styles.fixedLeftColumn, isTrimMode && { opacity: 0.35 }]}>
            <View style={styles.coverButtonBox}>
              <View style={styles.coverButton}>
                <Text style={{fontStyle: 'italic', color: '#fff', fontSize: 16, marginBottom: -2, marginTop: 4}}>_/</Text>
                <Text style={styles.coverText}>Cover</Text>
              </View>
            </View>
            <View style={styles.trackIcons}>
              <TouchableOpacity activeOpacity={0.8} onPress={() => setMusicSheetVisible(true)}>
                <View style={[styles.trackIconWrap, { height: 32 }]}>
                  <Ionicons name="musical-notes" size={20} color="#8E8E93" />
                  <View style={styles.plusBadge}><Ionicons name="add" size={10} color="#000" /></View>
                </View>
              </TouchableOpacity>
              <TouchableOpacity activeOpacity={0.8} onPress={handleAddTextLayer}>
                <View style={[styles.trackIconWrap, { height: 32 }]}>
                  <View style={styles.textIconBorder}>
                    <Text style={{color: "#8E8E93", fontWeight: '700', fontSize: 13}}>T</Text>
                  </View>
                  <View style={styles.plusBadge}><Ionicons name="add" size={10} color="#000" /></View>
                </View>
              </TouchableOpacity>

              <TouchableOpacity activeOpacity={0.8} onPress={handleAddMediaPress}>
                <View style={[styles.trackIconWrap, { height: 32 }]}>
                  <Ionicons name="image-outline" size={20} color="#8E8E93" style={{ transform: [{ scaleX: -1 }, { rotate: '15deg' }] }} />
                  <View style={styles.plusBadge}><Ionicons name="add" size={10} color="#000" /></View>
                </View>
              </TouchableOpacity>

              <TouchableOpacity activeOpacity={0.8} onPress={handleAddMediaPress}>
                <View style={[styles.trackIconWrap, { height: 60 }]}>
                  <Ionicons name="film" size={20} color="#8E8E93" />
                  <View style={styles.plusBadge}><Ionicons name="add" size={10} color="#000" /></View>
                </View>
              </TouchableOpacity>
              <TouchableOpacity 
                activeOpacity={0.8} 
                onPress={() => setPreviewMuted(!previewMuted)}
                style={[styles.trackIconWrap, { height: 24 }]}
              >
                <Ionicons name={previewMuted ? "volume-mute" : "volume-high"} size={20} color="#8E8E93" />
              </TouchableOpacity>
              <View style={{ height: 24 }} />
            </View>
          </View>

          {/* Scrollable Tracks */}
          <ScrollView 
            ref={scrollViewRef}
            horizontal 
            showsHorizontalScrollIndicator={false} 
            contentContainerStyle={[styles.timelineScroll, { paddingLeft: 0, paddingRight: 300 }]}
            scrollEventThrottle={16}
            onScroll={(e) => {
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
            }}
          >
            <View style={styles.tracks}>
                <>
                  <View style={[styles.vnTrack, { height: 32 }, isTrimMode && { opacity: 0.35 }]}>
                    {musicTrack ? (
                      <TouchableOpacity 
                        activeOpacity={0.8}
                        onPress={() => {
                          if (!isTrimMode) {
                            setSelectedTimelineClip("music");
                            setSelectedTool("audio");
                          }
                        }}
                      >
                        <View style={[
                          styles.vnClip, 
                          { 
                            width: Math.max(10, musicTrack.duration * PIXELS_PER_MS) || 200, 
                            backgroundColor: "#3A2E7A", 
                            borderColor: selectedTimelineClip === "music" ? "#fff" : "transparent",
                            borderWidth: selectedTimelineClip === "music" ? 2 : 0,
                            padding: 4,
                            flexDirection: "row",
                            alignItems: "center"
                          }
                        ]}>
                          <Ionicons name="musical-note" size={14} color="#fff" style={{marginRight: 4}} />
                          <Text style={[styles.vnPlaceholderText, { color: "#fff", fontWeight: "600" }]} numberOfLines={1}>
                            {musicTrack.title}
                          </Text>
                        </View>
                      </TouchableOpacity>
                    ) : (
                      <TouchableOpacity activeOpacity={0.8} onPress={() => !isTrimMode && setMusicSheetVisible(true)}>
                        <View style={[styles.vnClip, { width: projectTimelineWidth, backgroundColor: "#2A2A35" }]}>
                          <Text style={styles.vnPlaceholderText}>Tap to add music</Text>
                        </View>
                      </TouchableOpacity>
                    )}
                  </View>

                  <View style={[styles.vnTrack, { height: 32 }, isTrimMode && { opacity: 0.35 }]}>
                    {textLayers.length > 0 ? (
                      <View style={{ flexDirection: "row", gap: 4 }}>
                        {textLayers.map((layer) => {
                          const durationMs = Math.max(100, layer.endTime - layer.startTime);
                          const widthPx = durationMs * PIXELS_PER_MS;
                          const isSelected = layer.id === selectedTextLayerId;

                          return (
                            <TouchableOpacity
                              key={layer.id}
                              activeOpacity={0.8}
                              onPress={() => {
                                setSelectedTextLayerId(layer.id);
                                setSelectedTool("text");
                              }}
                            >
                              <View
                                style={[
                                  styles.vnClip,
                                  {
                                    width: widthPx,
                                    backgroundColor: "#2E5B7A",
                                    borderColor: isSelected ? "#FFCC00" : "#00E5FF",
                                    borderWidth: isSelected ? 2 : 1,
                                    paddingHorizontal: 8,
                                    flexDirection: "row",
                                    alignItems: "center",
                                  },
                                ]}
                              >
                                <Ionicons name="text-outline" size={14} color="#FFCC00" style={{ marginRight: 4 }} />
                                <Text style={{ color: "#fff", fontSize: 11, fontWeight: "600" }} numberOfLines={1}>
                                  {layer.text}
                                </Text>
                              </View>
                            </TouchableOpacity>
                          );
                        })}
                      </View>
                    ) : (
                      <TouchableOpacity activeOpacity={0.8} onPress={handleAddTextLayer}>
                        <View style={[styles.vnClip, { width: projectTimelineWidth, backgroundColor: "#2A2A35" }]}>
                          <Text style={styles.vnPlaceholderText}>Tap to add text</Text>
                        </View>
                      </TouchableOpacity>
                    )}
                  </View>

                  <View style={[styles.vnTrack, { height: 32 }, isTrimMode && { opacity: 0.35 }]}>
                    {overlayLayers.length > 0 ? (
                      <View style={{ position: "relative", width: projectTimelineWidth, height: 32 }}>
                        {overlayLayers.map((layer) => {
                          const leftPx = layer.startTime * PIXELS_PER_MS;
                          const durationMs = Math.max(500, layer.endTime - layer.startTime);
                          const widthPx = durationMs * PIXELS_PER_MS;
                          const isSelected = layer.id === selectedOverlayLayerId;

                          return (
                            <TouchableOpacity
                              key={layer.id}
                              activeOpacity={0.8}
                              onPress={() => {
                                setSelectedOverlayLayerId(layer.id);
                                setSelectedTool("overlay");
                              }}
                              style={{
                                position: "absolute",
                                left: leftPx,
                                width: widthPx,
                                height: 28,
                                top: 2,
                              }}
                            >
                              <View
                                style={[
                                  styles.vnClip,
                                  {
                                    width: "100%",
                                    height: "100%",
                                    backgroundColor: layer.type === "sticker" ? "#FF9500" : "#5C3A7A",
                                    borderColor: isSelected ? "#FFCC00" : (layer.type === "sticker" ? "#FFB340" : "#AF52DE"),
                                    borderWidth: isSelected ? 2 : 1,
                                    paddingHorizontal: 8,
                                    flexDirection: "row",
                                    alignItems: "center",
                                  },
                                ]}
                              >
                                <Ionicons 
                                  name={layer.type === "sticker" ? "happy-outline" : "layers-outline"} 
                                  size={14} 
                                  color="#FFCC00" 
                                  style={{ marginRight: 4 }} 
                                />
                                <Text style={{ color: "#fff", fontSize: 11, fontWeight: "600" }} numberOfLines={1}>
                                  {layer.name}
                                </Text>
                              </View>
                            </TouchableOpacity>
                          );
                        })}
                      </View>
                    ) : (
                      <TouchableOpacity activeOpacity={0.8} onPress={() => handleAddOverlayLayer("sticker")}>
                        <View style={[styles.vnClip, { width: projectTimelineWidth, backgroundColor: "#2A2A35" }]}>
                          <Text style={styles.vnPlaceholderText}>Tap to add sticker / overlay</Text>
                        </View>
                      </TouchableOpacity>
                    )}
                  </View>

                  {/* Video Track with Multi-Clip Support & Dynamic Speed Resizing */}
                  <View style={[styles.vnTrack, { height: 60, flexDirection: 'row' }, isTrimMode && { zIndex: 10 }]}>
                    {videoClips.length > 0 ? (
                      videoClips.map((clip, idx) => {
                        const isSelected = clip.id === selectedClipId;
                        const activeStart = isTrimMode && isSelected ? draftTrimStart : clip.startTime;
                        const activeEnd = isTrimMode && isSelected ? draftTrimEnd : clip.endTime;
                        const rawDuration = Math.max(100, activeEnd - activeStart);
                        const clipDuration = rawDuration / (clip.speed || 1.0);
                        const widthPx = clipDuration * PIXELS_PER_MS;
                        const clipOffset = activeStart * PIXELS_PER_MS;

                        return (
                          <TouchableOpacity
                            key={clip.id}
                            activeOpacity={0.9}
                            onPress={() => setSelectedClipId(clip.id)}
                            style={[
                              styles.vnVideoClip,
                              {
                                width: widthPx,
                                borderWidth: isTrimMode && isSelected ? 2 : isSelected ? 1.5 : 0,
                                borderColor: isTrimMode && isSelected ? "#FFCC00" : isSelected ? "#fff" : "transparent",
                              },
                            ]}
                          >
                            <View style={[styles.vnThumbnails, { marginLeft: -(clip.trimStartOffset || 0) * PIXELS_PER_MS }]}>
                              {[...Array(Math.max(1, Math.ceil(((clip.originalDuration || 5000) * PIXELS_PER_MS) / THUMBNAIL_WIDTH)))].map((_, i) => (
                                <Image
                                  key={i}
                                  source={{ uri: clip.thumbnailUri || clip.videoUri || videoUri || "https://images.unsplash.com/photo-1517404215738-15263e9f9178" }}
                                  style={styles.vnThumb}
                                />
                              ))}
                            </View>
                            
                            {!isTrimMode && isSelected && <View style={styles.vnYellowBorder} />}
                            {idx < videoClips.length - 1 && <View style={styles.splitSeamLine} />}

                            {isTrimMode && isSelected && (
                              <>
                                {/* Left Trim Handle */}
                                <View 
                                  {...leftPanResponder.panHandlers}
                                  style={[
                                    styles.trimHandle, 
                                    styles.trimHandleLeft,
                                    isSnappingLeft && styles.trimHandleSnapping
                                  ]}
                                >
                                  <View style={styles.trimHandleGrip} />
                                  <View style={styles.trimHandleGrip} />
                                </View>

                                {/* Right Trim Handle */}
                                <View 
                                  {...rightPanResponder.panHandlers}
                                  style={[
                                    styles.trimHandle, 
                                    styles.trimHandleRight,
                                    isSnappingRight && styles.trimHandleSnapping
                                  ]}
                                >
                                  <View style={styles.trimHandleGrip} />
                                  <View style={styles.trimHandleGrip} />
                                </View>
                              </>
                            )}

                            <View style={styles.vnClipTime}>
                              <Text style={styles.vnClipTimeText}>
                                {formatTime(clipDuration)} {clip.speed && clip.speed !== 1 ? `(${clip.speed}x)` : ''}
                              </Text>
                            </View>
                          </TouchableOpacity>
                        );
                      })
                    ) : (
                      <View style={[styles.vnVideoClip, { width: totalDuration * PIXELS_PER_MS || 300 }]}>
                        <View style={styles.vnThumbnails}>
                          {[...Array(Math.max(1, Math.ceil((totalDuration * PIXELS_PER_MS) / THUMBNAIL_WIDTH)))].map((_, i) => (
                            <Image 
                              key={i} 
                              source={{uri: videoUri || "https://images.unsplash.com/photo-1517404215738-15263e9f9178"}} 
                              style={styles.vnThumb} 
                            />
                          ))}
                        </View>
                        <View style={styles.vnYellowBorder} />
                        <View style={styles.vnClipTime}>
                          <Text style={styles.vnClipTimeText}>{formatTime(totalDuration)}</Text>
                        </View>
                      </View>
                    )}
                    
                    <TouchableOpacity 
                      activeOpacity={0.8} 
                      onPress={handleAddMediaPress}
                      style={{
                        width: 44,
                        height: 56,
                        backgroundColor: "#2A2A35",
                        borderRadius: 8,
                        justifyContent: "center",
                        alignItems: "center",
                        marginLeft: 8,
                        marginVertical: 2,
                      }}
                    >
                      <Ionicons name="add" size={24} color="#fff" />
                    </TouchableOpacity>
                  </View>
                  
                  <View style={[styles.vnTrack, { height: 24 }, isTrimMode && { opacity: 0.35 }]}>
                    <View style={[styles.vnWaveformMock, { width: totalDuration * PIXELS_PER_MS || 300 }]}>
                      <View style={styles.vnWaveformShape} />
                    </View>
                  </View>

                  <View style={styles.vnRuler}>
                    {[...Array(Math.max(1, Math.ceil(totalDuration / 1000) + 1))].map((_, i) => (
                      <View key={i} style={[styles.vnRulerMark, { width: 1000 * PIXELS_PER_MS }]}>
                        <Text style={styles.vnRulerText}>{formatTime(i * 1000)}</Text>
                        <View style={styles.vnRulerDot} />
                      </View>
                    ))}
                  </View>
                </>
            </View>
          </ScrollView>

          <View style={[styles.playhead, { left: 80 }]}>
            <View style={[styles.playheadLine, (isSnappingLeft || isSnappingRight) && styles.playheadLineSnapping]} />
            <View style={[styles.playheadHandle, (isSnappingLeft || isSnappingRight) && styles.playheadHandleSnapping]}>
              <View style={styles.playheadHandleInner} />
            </View>
          </View>
        </View>
      </View>
    );
  };

  const renderEditingToolbar = () => {
    if (isTrimMode) {
      return (
        <TrimToolbar
          durationMs={Math.max(0, draftTrimEnd - draftTrimStart)}
          onCancel={handleCancelTrim}
          onDone={handleDoneTrimAndClose}
          formatTime={formatTime}
          bottomInset={insets.bottom}
        />
      );
    }

    const hasVideoClip = Boolean(videoUri) || videoClips.length > 0 || totalDuration > 0;
    const isPanelOpen = Boolean(selectedTool) || Boolean(selectedTimelineClip);

    return (
      <View style={[
        styles.editingToolbar,
        { paddingBottom: Math.max(insets.bottom, 8) },
        isPanelOpen && { display: 'none' as const },
      ]}>
        <BlurView intensity={20} tint="dark" style={StyleSheet.absoluteFill} />
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.toolbarScroll}
          decelerationRate={Platform.OS === "ios" ? "normal" : 0.985}
          overScrollMode="never"
          bounces={Platform.OS === "ios"}
          scrollEventThrottle={16}
          removeClippedSubviews={Platform.OS === "android"}
        >
          {EDITING_TOOLS.map((tool) => {
            let isDisabled = false;
            if (tool.id === "trim") isDisabled = !hasVideoClip;
            if (tool.id === "split") isDisabled = !hasVideoClip;

            const isActive = selectedTool === tool.id;

            return (
              <ToolButton
                key={tool.id}
                tool={tool}
                isActive={isActive}
                isDisabled={isDisabled}
                onPress={() => handleSelectTool(tool.id)}
                primaryColor={theme.colors.primary}
              />
            );
          })}
        </ScrollView>
      </View>
    );
  };

  const renderPropertiesPanel = () => {
    if (!selectedTool && !selectedTimelineClip) return null;
    if (isTrimMode) return null;

    if (selectedTool === "overlay" || selectedTool === "stickers") {
      return (
        <OverlayPanel
          layers={overlayLayers}
          selectedLayerId={selectedOverlayLayerId}
          onAddOverlay={handleAddOverlayLayer}
          onUpdateLayer={handleUpdateOverlayLayer}
          onSelectLayer={(id) => setSelectedOverlayLayerId(id)}
          onDeleteLayer={handleDeleteOverlayLayer}
          onDuplicateLayer={handleDuplicateOverlayLayer}
          onBringForward={handleBringForwardOverlay}
          onSendBackward={handleSendBackwardOverlay}
          onClose={() => {
            setSelectedTool(null);
            setSelectedOverlayLayerId(null);
          }}
          bottomInset={insets.bottom}
        />
      );
    }

    if (selectedTool === "text") {
      return (
        <TextPanel
          layers={textLayers}
          selectedLayerId={selectedTextLayerId}
          onAddText={handleAddTextLayer}
          onUpdateLayer={handleUpdateTextLayer}
          onSelectLayer={(id) => setSelectedTextLayerId(id)}
          onDeleteLayer={handleDeleteTextLayer}
          onDuplicateLayer={handleDuplicateTextLayer}
          onClose={() => {
            setSelectedTool(null);
            setSelectedTextLayerId(null);
          }}
          bottomInset={insets.bottom}
        />
      );
    }

    if (selectedTool === "color" || selectedTool === "adjust" || selectedTool === "filters") {
      return (
        <ColorPanel
          adjustments={selectedClip?.adjustments}
          onUpdateAdjustments={updateSelectedClipAdjustments}
          onReset={resetSelectedClipAdjustments}
          onClose={() => setSelectedTool(null)}
          bottomInset={insets.bottom}
        />
      );
    }

    if (selectedTool === "speed") {
      return (
        <SpeedPanel
          selectedClip={selectedClip}
          onUpdateClip={updateSelectedClip}
          onClose={() => setSelectedTool(null)}
          bottomInset={insets.bottom}
        />
      );
    }

    if (selectedTool === "audio") {
      return (
        <AudioPanel
          audio={selectedClip?.audio}
          onUpdateAudio={updateSelectedClipAudio}
          onClose={() => setSelectedTool(null)}
          bottomInset={insets.bottom}
        />
      );
    }

    if (selectedTool === "rotate") {
      let currentRotation = 0;
      let onUpdate = (deg: number) => updateSelectedClip({ rotation: deg });

      if (selectedTextLayerId) {
        const textLayer = textLayers.find((l) => l.id === selectedTextLayerId);
        currentRotation = textLayer?.rotation || 0;
        onUpdate = (deg: number) => handleUpdateTextLayer(selectedTextLayerId, { rotation: deg });
      } else if (selectedOverlayLayerId) {
        const overlayLayer = overlayLayers.find((l) => l.id === selectedOverlayLayerId);
        currentRotation = overlayLayer?.rotation || 0;
        onUpdate = (deg: number) => handleUpdateOverlayLayer(selectedOverlayLayerId, { rotation: deg });
      } else if (selectedClip) {
        currentRotation = selectedClip.rotation || 0;
        onUpdate = (deg: number) => updateSelectedClip({ rotation: deg });
      }

      return (
        <RotatePanel
          rotation={currentRotation}
          onUpdateRotation={onUpdate}
          onCommitRotation={recordHistory}
          onClose={() => setSelectedTool(null)}
          bottomInset={insets.bottom}
        />
      );
    }

    if (selectedTimelineClip === "music") {
      return (
        <View style={[styles.propertiesPanel, { paddingBottom: Math.max(insets.bottom, 20) }]}>
          <View style={styles.panelHeader}>
            <Text style={[styles.panelTitle, { color: "#fff" }]}>
              Music: {musicTrack?.title}
            </Text>
            <TouchableOpacity onPress={() => setSelectedTimelineClip(null)}>
              <Ionicons name="close-circle" size={24} color="#666" />
            </TouchableOpacity>
          </View>
          <View style={styles.panelContent}>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 16 }}>
              <View style={{ width: 150 }}>
                <Text style={{ color: "#A0A0A0", marginBottom: 12 }}>Volume</Text>
                <View style={styles.sliderTrack}>
                  <View style={[styles.sliderFill, { backgroundColor: theme.colors.primary, width: "100%" }]} />
                  <View style={[styles.sliderThumb, { backgroundColor: "#fff", left: "100%" }]} />
                </View>
              </View>

              <View style={{ width: 100 }}>
                <Text style={{ color: "#A0A0A0", marginBottom: 12 }}>Fade In</Text>
                <View style={styles.sliderTrack}>
                  <View style={[styles.sliderFill, { backgroundColor: theme.colors.primary, width: "0%" }]} />
                  <View style={[styles.sliderThumb, { backgroundColor: "#fff", left: "0%" }]} />
                </View>
              </View>

              <View style={{ width: 100 }}>
                <Text style={{ color: "#A0A0A0", marginBottom: 12 }}>Fade Out</Text>
                <View style={styles.sliderTrack}>
                  <View style={[styles.sliderFill, { backgroundColor: theme.colors.primary, width: "0%" }]} />
                  <View style={[styles.sliderThumb, { backgroundColor: "#fff", left: "0%" }]} />
                </View>
              </View>

              <TouchableOpacity 
                style={{ alignItems: "center", justifyContent: "center", padding: 12, backgroundColor: "#2A2A2D", borderRadius: 12 }}
                onPress={() => setMusicSheetVisible(true)}
              >
                <Ionicons name="sync-outline" size={20} color="#fff" />
                <Text style={{ color: "#fff", fontSize: 12, marginTop: 4 }}>Replace</Text>
              </TouchableOpacity>

              <TouchableOpacity 
                style={{ alignItems: "center", justifyContent: "center", padding: 12, backgroundColor: theme.colors.danger + "20", borderRadius: 12 }}
                onPress={() => {
                  setMusicTrack(null);
                  setSelectedTimelineClip(null);
                }}
              >
                <Ionicons name="trash-outline" size={20} color={theme.colors.danger} />
                <Text style={{ color: theme.colors.danger, fontSize: 12, marginTop: 4 }}>Delete</Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      );
    }

    return (
      <View style={[styles.propertiesPanel, { paddingBottom: Math.max(insets.bottom, 20) }]}>
        <View style={styles.panelHeader}>
          <Text style={[styles.panelTitle, { color: "#fff" }]}>
            {EDITING_TOOLS.find(t => t.id === selectedTool)?.label || "Properties"}
          </Text>
          <TouchableOpacity onPress={() => setSelectedTool(null)}>
            <Ionicons name="close-circle" size={24} color="#666" />
          </TouchableOpacity>
        </View>
        <View style={styles.panelContent}>
          <Text style={{ color: "#A0A0A0", marginBottom: 12 }}>1.0x (Normal)</Text>
          <View style={styles.sliderTrack}>
            <View style={[styles.sliderFill, { backgroundColor: theme.colors.primary, width: "25%" }]} />
            <View style={[styles.sliderThumb, { backgroundColor: "#fff", left: "25%" }]} />
          </View>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 8 }}>
            <Text style={{ color: "#666", fontSize: 12 }}>0.25x</Text>
            <Text style={{ color: "#666", fontSize: 12 }}>1x</Text>
            <Text style={{ color: "#666", fontSize: 12 }}>4x</Text>
          </View>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: "#121212" }]} edges={['top']}>
      {!isPreviewFullscreen && renderTopToolbar()}
      {renderVideoPreview()}
      {!isPreviewFullscreen && (
        <View style={{ flex: 1, position: 'relative' }}>
          {renderTimeline()}
          {!isTrimMode && (
            <TouchableOpacity
              activeOpacity={1}
              onPressIn={handleAiPressIn}
              onPressOut={handleAiPressOut}
              style={styles.floatingAiBtnWrap}
            >
              <Animated.View style={[styles.floatingAiBtn, { transform: [{ scale: aiScaleAnim }] }]}>
                <LinearGradient
                  colors={["#3B82F6", "#6D28D9"]}
                  style={StyleSheet.absoluteFill}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                />
                <Ionicons name="sparkles" size={20} color="#fff" />
              </Animated.View>
            </TouchableOpacity>
          )}
        </View>
      )}
      {!isPreviewFullscreen && (selectedTool || selectedTimelineClip) && renderPropertiesPanel()}
      {!isPreviewFullscreen && renderEditingToolbar()}
      
      <MusicLibrarySheet 
        visible={musicSheetVisible} 
        onClose={() => setMusicSheetVisible(false)} 
        onSelectTrack={(track) => setMusicTrack(track)}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  topToolbar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  leftActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
  },
  iconButton: {
    width: 32,
    height: 32,
    justifyContent: "center",
    alignItems: "center",
  },
  headerCenter: {
    flexDirection: "row",
    alignItems: "center",
  },
  moreOptionsBtn: {
    marginLeft: 16,
    justifyContent: "center",
    alignItems: "center",
  },
  aspectRatioText: {
    fontSize: 15,
    color: "#fff",
    fontWeight: "500",
  },
  topActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  saveButton: {
    backgroundColor: "#2C2C2E",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
  },
  exportButtonSmall: {
    backgroundColor: "#007AFF",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
  },
  previewContainer: {
    flex: 1,
    width: "100%",
  },
  fullscreenContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#000',
    zIndex: 9999,
    elevation: 9999,
    flex: 1,
  },
  fullscreenControls: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'space-between',
    padding: 24,
    zIndex: 10000,
    elevation: 10000,
    pointerEvents: 'box-none',
  },
  fullscreenTopBar: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 40,
    pointerEvents: 'box-none',
  },
  fullscreenBottomBar: {
    backgroundColor: 'rgba(0,0,0,0.6)',
    borderRadius: 16,
    padding: 16,
    marginBottom: 20,
  },
  fullscreenScrubberWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
    gap: 12,
  },
  fullscreenScrubberTrackTouch: {
    flex: 1,
    height: 24,
    justifyContent: 'center',
  },
  fullscreenScrubberTrack: {
    height: 4,
    backgroundColor: 'rgba(255,255,255,0.3)',
    borderRadius: 2,
    overflow: 'hidden',
  },
  fullscreenScrubberFill: {
    height: '100%',
    backgroundColor: '#fff',
  },
  fullscreenTime: {
    color: '#fff',
    fontSize: 12,
    fontVariant: ['tabular-nums'],
    width: 44,
    textAlign: 'center',
  },
  fullscreenPlayActions: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 32,
  },
  fullscreenActionBtn: {
    padding: 8,
  },
  fullscreenMainPlayBtn: {
    width: 64,
    height: 64,
    justifyContent: 'center',
    alignItems: 'center',
  },
  previewBox: {
    flex: 1,
    backgroundColor: "#000",
    width: "100%",
    justifyContent: "center",
    alignItems: "center",
    overflow: "hidden",
  },
  fullscreenButton: {
    position: "absolute",
    bottom: 12,
    right: 12,
    width: 32,
    height: 32,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.5)",
    borderRadius: 16,
  },
  playbackControls: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 12,
    paddingVertical: 8,
    width: "100%",
  },
  playbackTimeWrap: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-start",
  },
  timeTextCompact: {
    fontSize: 11,
    fontWeight: "600",
    color: "#fff",
    fontVariant: ["tabular-nums"],
  },
  timeTotalText: {
    color: "rgba(255,255,255,0.4)",
    fontSize: 11,
  },
  playActionsCompact: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  compactActionBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "rgba(255, 255, 255, 0.12)",
    justifyContent: "center",
    alignItems: "center",
  },
  mainPlayBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    shadowColor: "#007AFF",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.4,
    shadowRadius: 6,
    elevation: 4,
  },
  mainPlayBtnGradient: {
    width: "100%",
    height: "100%",
    borderRadius: 19,
    justifyContent: "center",
    alignItems: "center",
  },
  playbackRightActions: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-end",
    gap: 12,
  },
  rightActionBtn: {
    padding: 2,
  },
  sliderTrack: {
    width: "100%",
    height: 6,
    backgroundColor: "rgba(255,255,255,0.18)",
    borderRadius: 3,
    justifyContent: "center",
    position: "relative",
  },
  sliderFill: {
    height: "100%",
    borderRadius: 3,
  },
  sliderThumb: {
    position: "absolute",
    width: 18,
    height: 18,
    borderRadius: 9,
    marginTop: -6,
    marginLeft: -9,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.5,
    shadowRadius: 4,
    elevation: 4,
  },
  timelineContainer: {
    flex: 1,
    position: "relative",
  },
  timelineBody: {
    flex: 1,
    flexDirection: "row",
  },
  fixedLeftColumn: {
    width: 80,
    paddingTop: 16,
    flexDirection: "row",
    zIndex: 10,
    backgroundColor: "#1A1A1E",
    borderRightWidth: 1,
    borderRightColor: "rgba(255,255,255,0.05)",
  },
  coverButtonBox: {
    width: 44,
    alignItems: "center",
    justifyContent: "flex-start",
    paddingLeft: 4,
  },
  coverButton: {
    width: 32,
    height: 38,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.25)",
    backgroundColor: "rgba(255,255,255,0.1)",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 111,
  },
  coverText: {
    color: "#fff",
    fontSize: 9,
    fontWeight: "600",
  },
  trackIcons: {
    flex: 1,
    alignItems: "center",
  },
  trackIconWrap: {
    width: "100%",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 4,
  },
  textIconBorder: {
    width: 18,
    height: 18,
    borderRadius: 4,
    borderWidth: 1.5,
    borderColor: "#8E8E93",
    justifyContent: "center",
    alignItems: "center",
  },
  plusBadge: {
    position: "absolute",
    bottom: "20%",
    right: 2,
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: "#fff",
    justifyContent: "center",
    alignItems: "center",
  },
  timelineScroll: {
    paddingLeft: 10,
    paddingRight: width,
    paddingTop: 16,
  },
  tracks: {
    gap: 4,
  },
  vnTrack: {
    flexDirection: "row",
    alignItems: "center",
    position: "relative",
  },
  vnClip: {
    height: "100%",
    borderRadius: 6,
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.05)",
  },
  vnPlaceholderText: {
    color: "rgba(255,255,255,0.5)",
    fontSize: 12,
    fontWeight: "500",
  },
  vnVideoClip: {
    height: "100%",
    backgroundColor: "#000",
    borderRadius: 2,
    overflow: "hidden",
    position: "relative",
  },
  splitSeamLine: {
    position: "absolute",
    right: 0,
    top: 0,
    bottom: 0,
    width: 2,
    backgroundColor: "#FFCC00",
    zIndex: 20,
  },
  vnThumbnails: {
    flex: 1,
    flexDirection: "row",
  },
  vnThumb: {
    width: 60,
    height: "100%",
    opacity: 0.8,
  },
  vnYellowBorder: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderWidth: 2,
    borderColor: "#FFCC00",
    borderRadius: 2,
  },
  vnClipTime: {
    position: "absolute",
    bottom: 2,
    left: 4,
    backgroundColor: "rgba(0,0,0,0.6)",
    paddingHorizontal: 4,
    paddingVertical: 2,
    borderRadius: 2,
  },
  vnClipTimeText: {
    color: "#fff",
    fontSize: 8,
    fontWeight: "700",
  },
  vnWaveformMock: {
    flex: 1,
    width: 300,
    height: "100%",
    backgroundColor: "rgba(255, 204, 0, 0.15)",
    overflow: "hidden",
    justifyContent: "flex-end",
  },
  vnWaveformShape: {
    width: "100%",
    height: "60%",
    backgroundColor: "#FFCC00",
    opacity: 0.8,
    borderTopLeftRadius: 4,
    borderTopRightRadius: 4,
  },
  vnRuler: {
    flexDirection: "row",
    height: 24,
    alignItems: "center",
    marginTop: 4,
  },
  vnRulerMark: {
    width: 80,
    position: "relative",
  },
  vnRulerText: {
    color: "rgba(255,255,255,0.4)",
    fontSize: 10,
    position: "absolute",
    left: -12,
    top: 8,
  },
  vnRulerDot: {
    width: 2,
    height: 2,
    backgroundColor: "rgba(255,255,255,0.3)",
    borderRadius: 1,
    position: "absolute",
    left: 40,
    top: 12,
  },
  playhead: {
    position: "absolute",
    top: 0,
    bottom: 0,
    width: 2,
    alignItems: "center",
    zIndex: 20,
  },
  playheadLine: {
    flex: 1,
    width: 2,
    backgroundColor: "#fff",
  },
  playheadLineSnapping: {
    backgroundColor: "#00E5FF",
    width: 3,
  },
  playheadHandle: {
    position: "absolute",
    top: 104,
    width: 20,
    height: 20,
    backgroundColor: "#fff",
    borderRadius: 4,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.5,
    shadowRadius: 4,
    elevation: 4,
  },
  playheadHandleSnapping: {
    backgroundColor: "#00E5FF",
  },
  playheadHandleInner: {
    width: 8,
    height: 2,
    backgroundColor: "#000",
    borderRadius: 1,
  },
  floatingAiBtnWrap: {
    position: "absolute",
    bottom: 16,
    right: 16,
    zIndex: 25,
    elevation: 12,
  },
  floatingAiBtn: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
    shadowColor: "#3B82F6",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.5,
    shadowRadius: 12,
    elevation: 12,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.15)",
  },
  editingToolbar: {
    backgroundColor: "rgba(18,18,24,0.92)",
    borderTopWidth: 1,
    borderTopColor: "rgba(255,255,255,0.06)",
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 16,
  },
  toolbarScroll: {
    paddingHorizontal: 10,
    paddingTop: 6,
    paddingBottom: 6,
    gap: 12,
    alignItems: "center",
  },
  toolBtn: {
    alignItems: "center",
    width: 56,
    minHeight: 44,
  },
  toolIconBox: {
    width: 56,
    height: 56,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.06)",
    marginBottom: 6,
    overflow: "hidden",
  },
  toolIconBoxActive: {
    shadowColor: "#3B6CE7",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 10,
    elevation: 8,
  },
  toolLabel: {
    fontSize: 12,
    fontWeight: "500",
    fontFamily: Platform.OS === "ios" ? "Inter" : "Inter",
    textAlign: "center",
  },
  trimModeToolbar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#1A1A1E",
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderTopWidth: 1,
    borderTopColor: "rgba(255,255,255,0.08)",
  },
  trimCancelBtn: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.1)",
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    gap: 6,
  },
  trimDoneBtn: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFCC00",
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    gap: 6,
  },
  trimBtnText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "600",
  },
  trimInfoBox: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.4)",
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "rgba(255,204,0,0.3)",
  },
  trimInfoText: {
    color: "#fff",
    fontSize: 13,
    fontWeight: "600",
  },
  trimHandle: {
    position: "absolute",
    top: -2,
    bottom: -2,
    width: 24,
    backgroundColor: "#FFCC00",
    zIndex: 25,
    justifyContent: "center",
    alignItems: "center",
    gap: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.5,
    shadowRadius: 4,
    elevation: 6,
  },
  trimHandleLeft: {
    left: 0,
    borderTopLeftRadius: 6,
    borderBottomLeftRadius: 6,
  },
  trimHandleRight: {
    right: 0,
    borderTopRightRadius: 6,
    borderBottomRightRadius: 6,
  },
  trimHandleSnapping: {
    backgroundColor: "#00E5FF",
    shadowColor: "#00E5FF",
    shadowOpacity: 0.9,
    shadowRadius: 8,
    elevation: 10,
  },
  trimHandleGrip: {
    width: 2,
    height: 16,
    backgroundColor: "#000",
    borderRadius: 1,
    opacity: 0.7,
  },
  speedBadge: {
    backgroundColor: "rgba(255,204,0,0.15)",
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "rgba(255,204,0,0.3)",
    marginLeft: 6,
  },
  speedBadgeText: {
    color: "#FFCC00",
    fontSize: 13,
    fontWeight: "700",
  },
  presetChipsRow: {
    flexDirection: "row",
    gap: 6,
    marginBottom: 16,
    justifyContent: "space-between",
  },
  presetChip: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 14,
    backgroundColor: "rgba(255,255,255,0.06)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
  },
  presetChipActive: {
    backgroundColor: "#FFCC00",
    borderColor: "#FFCC00",
  },
  presetChipText: {
    color: "#A0A0A0",
    fontSize: 12,
    fontWeight: "600",
  },
  presetChipTextActive: {
    color: "#000",
    fontWeight: "700",
  },
  sliderContainer: {
    width: "100%",
    marginBottom: 18,
  },
  speedOptionsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginTop: 4,
  },
  optionRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    backgroundColor: "rgba(255,255,255,0.04)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
  },
  optionRowActive: {
    backgroundColor: "rgba(0,229,255,0.12)",
    borderColor: "#00E5FF",
  },
  optionLabel: {
    color: "#8E8E93",
    fontSize: 12,
    fontWeight: "500",
  },
  optionLabelActive: {
    color: "#00E5FF",
    fontWeight: "600",
  },
  propertiesPanel: {
    backgroundColor: "#1A1A1D",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -10 },
    shadowOpacity: 0.2,
    shadowRadius: 20,
    elevation: 10,
  },
  panelHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  panelTitle: {
    fontSize: 18,
    fontWeight: "700",
  },
  panelContent: {
    minHeight: 80,
    justifyContent: "center",
  },
});

