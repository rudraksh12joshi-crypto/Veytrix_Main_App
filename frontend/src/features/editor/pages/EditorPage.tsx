import React, { useState, useRef, useEffect, useMemo, useCallback } from "react";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Dimensions, Image, Animated, PanResponder, Platform, useWindowDimensions, LayoutAnimation } from "react-native";
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
import { TransitionPanel, ClipTransition, TransitionType, TransitionPair } from "../panels/TransitionPanel";
import { usePlayback } from "../player";
import { useTimeline, PIXELS_PER_MS, THUMBNAIL_WIDTH, DEFAULT_TIMELINE_HEIGHT } from "../components/timeline";
import { useProjectStore } from "../store";
import { FilterPanel } from "../filters";


import {
  commandManager,
  TrimCommand,
  SplitCommand,
  RotateCommand,
  TextCommand,
  OverlayCommand,
  ImportMediaCommand,
  AdjustCommand,
} from "../commands";




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

  const { height: screenHeight } = useWindowDimensions();
  const timelineHeight = DEFAULT_TIMELINE_HEIGHT;


  const videoRef = useRef<Video>(null);
  const audioRef = useRef<Audio.Sound | null>(null);
  const scrollViewRef = useRef<ScrollView>(null);
  const lastStateUpdate = useRef(0);
  const toolbarScrollXRef = useRef(0);
  const toolbarScrollViewRef = useRef<ScrollView>(null);
  const isPlaying = useProjectStore((s) => s.isPlaying);
  const setIsPlaying = useProjectStore((s) => s.setIsPlaying);
  const [isPreviewFullscreen, setIsPreviewFullscreen] = useState(false);
  const [scrubberWidth, setScrubberWidth] = useState(0);
  const currentTime = useProjectStore((s) => s.currentTime);
  const setCurrentTime = useProjectStore((s) => s.setCurrentTime);
  const totalDuration = useProjectStore((s) => s.totalDuration);
  const setTotalDuration = useProjectStore((s) => s.setTotalDuration);

  const videoClips = useProjectStore((s) => s.videoClips);
  const setVideoClips = useProjectStore((s) => s.setVideoClips);
  const selectedClipId = useProjectStore((s) => s.selectedClipId);
  const setSelectedClipId = useProjectStore((s) => s.setSelectedClipId);

  // Text Layers State from Project Store
  const textLayers = useProjectStore((s) => s.textLayers);
  const setTextLayers = useProjectStore((s) => s.setTextLayers);
  const selectedTextLayerId = useProjectStore((s) => s.selectedTextLayerId);
  const setSelectedTextLayerId = useProjectStore((s) => s.setSelectedTextLayerId);

  // Overlay Layers State from Project Store
  const overlayLayers = useProjectStore((s) => s.overlayLayers);
  const setOverlayLayers = useProjectStore((s) => s.setOverlayLayers);
  const selectedOverlayLayerId = useProjectStore((s) => s.selectedOverlayLayerId);
  const setSelectedOverlayLayerId = useProjectStore((s) => s.setSelectedOverlayLayerId);


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

  const [trimStart, setTrimStart] = useState(0);
  const [trimEnd, setTrimEnd] = useState(0);
  const [draftTrimStart, setDraftTrimStart] = useState(0);
  const [draftTrimEnd, setDraftTrimEnd] = useState(0);
  const [isSnappingLeft, setIsSnappingLeft] = useState(false);
  const [isSnappingRight, setIsSnappingRight] = useState(false);

  const isTrimMode = selectedTool === "trim";






  // Transitions State
  const [transitions, setTransitions] = useState<Record<string, ClipTransition>>({});
  const [selectedTransitionPair, setSelectedTransitionPair] = useState<TransitionPair | null>(null);

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
    transitions: Record<string, ClipTransition>;
  }

  const [history, setHistory] = useState<EditorHistorySnapshot[]>([]);
  const [historyIndex, setHistoryIndex] = useState<number>(-1);

  const historyRef = useRef<EditorHistorySnapshot[]>([]);
  const historyIndexRef = useRef<number>(-1);
  const isUndoingOrRedoingRef = useRef<boolean>(false);

  useEffect(() => {
    historyRef.current = history;
    historyIndexRef.current = historyIndex;
  }, [history, historyIndex]);

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
    transitions: {},
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
      transitions,
    };
  });

  const createSnapshot = useCallback((overrides?: Partial<EditorHistorySnapshot>): EditorHistorySnapshot => {
    return JSON.parse(
      JSON.stringify({
        videoClips: overrides?.videoClips ?? currentStateRef.current.videoClips,
        textLayers: overrides?.textLayers ?? currentStateRef.current.textLayers,
        overlayLayers: overrides?.overlayLayers ?? currentStateRef.current.overlayLayers,
        totalDuration: overrides?.totalDuration ?? currentStateRef.current.totalDuration,
        selectedClipId: overrides?.selectedClipId !== undefined ? overrides.selectedClipId : currentStateRef.current.selectedClipId,
        selectedTextLayerId: overrides?.selectedTextLayerId !== undefined ? overrides.selectedTextLayerId : currentStateRef.current.selectedTextLayerId,
        selectedOverlayLayerId: overrides?.selectedOverlayLayerId !== undefined ? overrides.selectedOverlayLayerId : currentStateRef.current.selectedOverlayLayerId,
        currentTime: overrides?.currentTime ?? currentStateRef.current.currentTime,
        musicTrack: overrides?.musicTrack ?? currentStateRef.current.musicTrack,
        transitions: overrides?.transitions ?? currentStateRef.current.transitions ?? {},
      })
    );
  }, []);

  const recordHistory = useCallback((customSnapshot?: EditorHistorySnapshot) => {
    if (isUndoingOrRedoingRef.current) return;

    const snapshot: EditorHistorySnapshot = customSnapshot
      ? JSON.parse(JSON.stringify(customSnapshot))
      : createSnapshot();

    const currentHist = historyRef.current;
    const currentIdx = historyIndexRef.current;

    const truncated = currentIdx >= 0 ? currentHist.slice(0, currentIdx + 1) : [];

    if (truncated.length > 0) {
      const lastSnap = truncated[truncated.length - 1];
      if (JSON.stringify(lastSnap) === JSON.stringify(snapshot)) {
        return;
      }
    }

    const nextHistory = [...truncated, snapshot];
    const nextIndex = nextHistory.length - 1;

    historyRef.current = nextHistory;
    historyIndexRef.current = nextIndex;

    setHistory(nextHistory);
    setHistoryIndex(nextIndex);
  }, [createSnapshot]);

  const handleUndo = useCallback(() => {
    commandManager.undo();
  }, []);

  const handleRedo = useCallback(() => {
    commandManager.redo();
  }, []);


  const allTransitionPairs = useMemo<TransitionPair[]>(() => {
    const pairs: TransitionPair[] = [];
    for (let i = 0; i < videoClips.length - 1; i++) {
      pairs.push({
        fromId: videoClips[i].id,
        toId: videoClips[i + 1].id,
        fromIndex: i,
        toIndex: i + 1,
      });
    }
    return pairs;
  }, [videoClips]);

  const handleSelectTransition = (type: TransitionType) => {
    const pair = selectedTransitionPair || allTransitionPairs[0];
    if (!pair) return;
    const pairKey = `${pair.fromId}_${pair.toId}`;
    const nextTransitions = {
      ...transitions,
      [pairKey]: {
        id: pairKey,
        fromClipId: pair.fromId,
        toClipId: pair.toId,
        type,
      },
    };
    setTransitions(nextTransitions);
    recordHistory(createSnapshot({ transitions: nextTransitions }));
  };

  const handleAddOverlayLayer = async (type: OverlayLayer['type']) => {
    let sourceUri = "";
    let finalType = type;

    if (type === "image" || type === "video" || type === "gif") {
      try {
        const result = await ImagePicker.launchImageLibraryAsync({
          mediaTypes: ImagePicker.MediaTypeOptions.All,
          allowsEditing: false,
          quality: 1,
        });

        if (result.canceled || !result.assets || result.assets.length === 0) {
          // User cancelled media picker selection — do not modify project or add empty overlay
          return;
        }

        const asset = result.assets[0];
        sourceUri = asset.uri;
        finalType = asset.type === "video" ? "video" : type;
      } catch (err) {
        console.warn("Media picker error", err);
      }
    }

    if (!sourceUri) {
      const sampleSources: Record<string, string> = {
        image: "https://images.unsplash.com/photo-1579783902614-a3fb3927b675",
        video: "https://images.unsplash.com/photo-1536240478700-b869070f9279",
        gif: "https://images.unsplash.com/photo-1550684848-fac1c5b4e853",
        sticker: "sticker-star",
        logo: "logo-veytrix",
        watermark: "watermark-official",
      };
      sourceUri = sampleSources[type] || sampleSources.image;
    }

    const newId = `overlay-${Date.now()}`;
    const startT = currentTime || 0;
    const endT = Math.min(totalDuration > 0 ? totalDuration : 30000, startT + 5000);

    const newLayer: OverlayLayer = {
      ...DEFAULT_OVERLAY_LAYER,
      id: newId,
      type: finalType,
      source: sourceUri,
      name: `${finalType.toUpperCase()} Overlay`,
      startTime: startT,
      endTime: Math.max(startT + 500, endT),
      layerOrder: overlayLayers.length + 1,
    };

    const nextLayers = [...overlayLayers, newLayer];
    setOverlayLayers(nextLayers);
    setSelectedOverlayLayerId(newId);
    setSelectedTool("overlay");
    recordHistory(createSnapshot({ overlayLayers: nextLayers, selectedOverlayLayerId: newId }));
  };

  const handleUpdateOverlayLayer = (id: string, updates: Partial<OverlayLayer>) => {
    const nextLayers = overlayLayers.map((layer) => (layer.id === id ? { ...layer, ...updates } : layer));
    setOverlayLayers(nextLayers);
    recordHistory(createSnapshot({ overlayLayers: nextLayers }));
  };

  const handleDeleteOverlayLayer = (id: string) => {
    const nextLayers = overlayLayers.filter((l) => l.id !== id);
    const nextSelId = selectedOverlayLayerId === id ? null : selectedOverlayLayerId;
    setOverlayLayers(nextLayers);
    if (selectedOverlayLayerId === id) {
      setSelectedOverlayLayerId(null);
    }
    recordHistory(createSnapshot({ overlayLayers: nextLayers, selectedOverlayLayerId: nextSelId }));
  };

  const handleDuplicateOverlayLayer = (id: string) => {
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
    const nextLayers = [...overlayLayers, dupLayer];
    setOverlayLayers(nextLayers);
    setSelectedOverlayLayerId(newId);
    recordHistory(createSnapshot({ overlayLayers: nextLayers, selectedOverlayLayerId: newId }));
  };

  const handleBringForwardOverlay = (id: string) => {
    const nextLayers = overlayLayers.map((l) => (l.id === id ? { ...l, layerOrder: l.layerOrder + 1 } : l));
    setOverlayLayers(nextLayers);
    recordHistory(createSnapshot({ overlayLayers: nextLayers }));
  };

  const handleSendBackwardOverlay = (id: string) => {
    const nextLayers = overlayLayers.map((l) => (l.id === id ? { ...l, layerOrder: Math.max(1, l.layerOrder - 1) } : l));
    setOverlayLayers(nextLayers);
    recordHistory(createSnapshot({ overlayLayers: nextLayers }));
  };

  const handleAddTextLayer = () => {
    const newId = `text-${Date.now()}`;
    const newLayer: TextLayer = {
      ...DEFAULT_TEXT_LAYER,
      id: newId,
      text: "Add Text Here",
      startTime: 0,
      endTime: totalDuration > 0 ? totalDuration : 30000,
      layerOrder: textLayers.length + 1,
    };
    const nextLayers = [...textLayers, newLayer];
    setTextLayers(nextLayers);
    setSelectedTextLayerId(newId);
    setSelectedTool("text");
    recordHistory(createSnapshot({ textLayers: nextLayers, selectedTextLayerId: newId }));
  };

  const handleUpdateTextLayer = (id: string, updates: Partial<TextLayer>) => {
    const nextLayers = textLayers.map((layer) => (layer.id === id ? { ...layer, ...updates } : layer));
    setTextLayers(nextLayers);
    recordHistory(createSnapshot({ textLayers: nextLayers }));
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
        const newClips = [...videoClips];
        let currentTotal = videoClips.length > 0 ? videoClips[videoClips.length - 1].endTime : 0;
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
        
        setVideoClips(newClips);
        setTotalDuration(currentTotal);
        if (newlySelectedId) {
          setSelectedClipId(newlySelectedId);
        }
        recordHistory(createSnapshot({ videoClips: newClips, totalDuration: currentTotal, selectedClipId: newlySelectedId || selectedClipId }));
      }
    } catch (e) {
      console.log("Error launching image picker:", e);
    }
  };

  const handleDeleteTextLayer = (id: string) => {
    const nextLayers = textLayers.filter((l) => l.id !== id);
    const nextSelId = selectedTextLayerId === id ? null : selectedTextLayerId;
    setTextLayers(nextLayers);
    if (selectedTextLayerId === id) {
      setSelectedTextLayerId(null);
    }
    recordHistory(createSnapshot({ textLayers: nextLayers, selectedTextLayerId: nextSelId }));
  };

  const handleDuplicateTextLayer = (id: string) => {
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
    const nextLayers = [...textLayers, dupLayer];
    setTextLayers(nextLayers);
    setSelectedTextLayerId(newId);
    recordHistory(createSnapshot({ textLayers: nextLayers, selectedTextLayerId: newId }));
  };

  const selectedClip = useMemo(() => {
    return videoClips.find((c) => c.id === selectedClipId) || videoClips[0] || null;
  }, [videoClips, selectedClipId]);


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


  useEffect(() => {
    if (videoClips.length === 0 && historyRef.current.length === 0) {
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

      if (historyRef.current.length === 0) {
        const initialSnapshot: EditorHistorySnapshot = JSON.parse(
          JSON.stringify({
            videoClips: initialClips,
            textLayers: [],
            overlayLayers: [],
            totalDuration: totalDur,
            selectedClipId: initialClips[0]?.id || null,
            selectedTextLayerId: null,
            selectedOverlayLayerId: null,
            currentTime: 0,
            musicTrack: null,
          })
        );
        historyRef.current = [initialSnapshot];
        historyIndexRef.current = 0;
        setHistory([initialSnapshot]);
        setHistoryIndex(0);
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

  const isToolbarHidden = Boolean(selectedTool) || Boolean(selectedTimelineClip) || isTrimMode;
  const prevIsToolbarHiddenRef = useRef(isToolbarHidden);

  useEffect(() => {
    if (prevIsToolbarHiddenRef.current && !isToolbarHidden) {
      const timer = setTimeout(() => {
        toolbarScrollViewRef.current?.scrollTo({ x: toolbarScrollXRef.current, animated: false });
      }, 50);
      return () => clearTimeout(timer);
    }
    prevIsToolbarHiddenRef.current = isToolbarHidden;
  }, [isToolbarHidden]);

  const handleSplitClip = () => {
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
    recordHistory(createSnapshot({ videoClips: updatedClips, selectedClipId: clipB.id }));
  };

  const handleSelectTool = (toolId: string) => {
    LayoutAnimation.configureNext({
      duration: 200,
      create: { type: LayoutAnimation.Types.easeInEaseOut, property: LayoutAnimation.Properties.opacity },
      update: { type: LayoutAnimation.Types.easeInEaseOut },
      delete: { type: LayoutAnimation.Types.easeInEaseOut, property: LayoutAnimation.Properties.opacity }
    });
    if (toolId === "split") {
      handleSplitClip();
    } else if (toolId === "stickers") {
      handleAddOverlayLayer("sticker");
      setSelectedTool("overlay");
    } else if (toolId === "overlay") {
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
      let currentTotal = 0;
      const updatedClips = videoClips.map((clip) => {
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
      setVideoClips(updatedClips);
      setTotalDuration(currentTotal);
      recordHistory(createSnapshot({ videoClips: updatedClips, totalDuration: currentTotal }));
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

  const playback = usePlayback({
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
  });

  const {
    previewMuted,
    setPreviewMuted,
    activePlaybackClip,
    handlePlaybackStatusUpdate,
    handlePlayPause,
    handlePreviousClip,
    handleNextClip,
    formatTime,
  } = playback;

  const timeline = useTimeline({
    videoRef,
    audioRef,
    scrollViewRef,
    videoClips,
    selectedClipId,
    setSelectedClipId,
    textLayers,
    selectedTextLayerId,
    setSelectedTextLayerId,
    overlayLayers,
    selectedOverlayLayerId,
    setSelectedOverlayLayerId,
    musicTrack,
    selectedTimelineClip,
    setSelectedTimelineClip,
    transitions,
    setSelectedTransitionPair,
    totalDuration,
    currentTime,
    setCurrentTime,
    isPlaying,
    isTrimMode,
    trimStart,
    trimEnd,
    draftTrimStart,
    draftTrimEnd,
    isSnappingLeft,
    isSnappingRight,
    previewMuted,
    setPreviewMuted,
    setSelectedTool,
    setMusicSheetVisible,
    handleAddTextLayer,
    handleAddOverlayLayer,
    handleAddMediaPress,
    leftPanResponderHandlers: leftPanResponder.panHandlers,
    rightPanResponderHandlers: rightPanResponder.panHandlers,
    formatTime,
    videoUri,
  });

  const { projectTimelineWidth, handleScroll } = timeline;



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
          {/* Dynamic Filter Tint & Tone Overlay */}
          {activeAdj.shadowTint && (
            <View
              pointerEvents="none"
              style={[
                StyleSheet.absoluteFill,
                {
                  backgroundColor: activeAdj.shadowTint,
                  opacity: 0.25,
                },
              ]}
            />
          )}
          {activeAdj.duotonePrimary && (
            <View
              pointerEvents="none"
              style={[
                StyleSheet.absoluteFill,
                {
                  backgroundColor: activeAdj.duotonePrimary,
                  opacity: 0.2,
                },
              ]}
            />
          )}
          {activeAdj.saturation === -100 && (
            <View
              pointerEvents="none"
              style={[
                StyleSheet.absoluteFill,
                {
                  backgroundColor: "rgba(30,30,30,0.5)",
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
        ) : null}
      </View>
    );
  };

  const renderPlaybackControls = () => {
    if (isPreviewFullscreen) return null;
    return (
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
          {(() => {
            const canUndo = historyIndex > 0;
            const canRedo = historyIndex >= 0 && historyIndex < history.length - 1;
            return (
              <>
                <TouchableOpacity 
                  style={[styles.rightActionBtn, !canUndo && { opacity: 0.35 }]} 
                  onPress={handleUndo}
                  disabled={!canUndo}
                  activeOpacity={0.7}
                >
                  <Ionicons name="arrow-undo-outline" size={18} color={canUndo ? "#fff" : "rgba(255,255,255,0.4)"} />
                </TouchableOpacity>
                <TouchableOpacity 
                  style={[styles.rightActionBtn, !canRedo && { opacity: 0.35 }]} 
                  onPress={handleRedo}
                  disabled={!canRedo}
                  activeOpacity={0.7}
                >
                  <Ionicons name="arrow-redo-outline" size={18} color={canRedo ? "#fff" : "rgba(255,255,255,0.4)"} />
                </TouchableOpacity>
              </>
            );
          })()}
        </View>
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
            scrollEnabled={!isTrimMode}
            showsHorizontalScrollIndicator={false} 
            contentContainerStyle={[styles.timelineScroll, { paddingLeft: 0, paddingRight: 300 }]}
            scrollEventThrottle={16}
            onScroll={handleScroll}
          >
            <View style={styles.tracks}>
                <>
                  <View style={[styles.vnTrack, { width: projectTimelineWidth, height: 32 }, isTrimMode && { opacity: 0.35 }]}>
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
                            width: Math.min(Math.max(10, musicTrack.duration * PIXELS_PER_MS), projectTimelineWidth), 
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

                  <View style={[styles.vnTrack, { width: projectTimelineWidth, height: 32 }, isTrimMode && { opacity: 0.35 }]}>
                    {textLayers.length > 0 ? (
                      <View style={{ flexDirection: "row", gap: 4, width: projectTimelineWidth }}>
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

                  <View style={[styles.vnTrack, { width: projectTimelineWidth, height: 32 }, isTrimMode && { opacity: 0.35 }]}>
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
                    <View style={{ flexDirection: 'row', width: projectTimelineWidth, height: 60 }}>
                      {videoClips.length > 0 ? (
                        videoClips.map((clip, idx) => {
                          const isSelected = clip.id === selectedClipId;
                          const activeStart = isTrimMode && isSelected ? draftTrimStart : clip.startTime;
                          const activeEnd = isTrimMode && isSelected ? draftTrimEnd : clip.endTime;
                          const rawDuration = Math.max(100, activeEnd - activeStart);
                          const clipDuration = rawDuration / (clip.speed || 1.0);
                          const widthPx = clipDuration * PIXELS_PER_MS;
                          const clipOffset = activeStart * PIXELS_PER_MS;

                          const hasNextClip = idx < videoClips.length - 1;
                          const nextClip = hasNextClip ? videoClips[idx + 1] : null;
                          const pairKey = nextClip ? `${clip.id}_${nextClip.id}` : "";
                          const currentTransition = pairKey ? transitions[pairKey] : null;
                          const isTransitionActive = Boolean(currentTransition && currentTransition.type !== "none");

                          return (
                            <React.Fragment key={clip.id}>
                              <TouchableOpacity
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

                              {/* Transition Gap Placeholder & Centered [+] Button between Adjacent Clips */}
                              {hasNextClip && nextClip && (
                                <View style={styles.transitionGapContainer}>
                                  <TouchableOpacity
                                    activeOpacity={0.8}
                                    style={[
                                      styles.transitionBtn,
                                      isTransitionActive && styles.transitionBtnActive,
                                    ]}
                                    onPress={() => {
                                      setSelectedTransitionPair({
                                        fromId: clip.id,
                                        toId: nextClip.id,
                                        fromIndex: idx,
                                        toIndex: idx + 1,
                                      });
                                      setSelectedTool("transitions");
                                    }}
                                  >
                                    {isTransitionActive ? (
                                      <Ionicons name="swap-horizontal" size={12} color="#000" />
                                    ) : (
                                      <Ionicons name="add" size={14} color="#fff" />
                                    )}
                                  </TouchableOpacity>
                                </View>
                              )}
                            </React.Fragment>
                          );
                        })
                      ) : (
                        <View style={[styles.vnVideoClip, { width: projectTimelineWidth }]}>
                          <View style={styles.vnThumbnails}>
                            {[...Array(Math.max(1, Math.ceil((projectTimelineWidth) / THUMBNAIL_WIDTH)))].map((_, i) => (
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
                    </View>
                    
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
                  
                  {/* Embedded Video Audio Waveform Track - Directly Derived 1-to-1 from Video Clips */}
                  <View style={[styles.vnTrack, { width: projectTimelineWidth, height: 24, flexDirection: 'row' }, isTrimMode && { opacity: 0.35 }]}>
                    {videoClips.length > 0 ? (
                      videoClips.map((clip, idx) => {
                        const isSelected = clip.id === selectedClipId;
                        const activeStart = isTrimMode && isSelected ? draftTrimStart : clip.startTime;
                        const activeEnd = isTrimMode && isSelected ? draftTrimEnd : clip.endTime;
                        const rawDuration = Math.max(100, activeEnd - activeStart);
                        const clipDuration = rawDuration / (clip.speed || 1.0);
                        const widthPx = clipDuration * PIXELS_PER_MS;
                        const hasNextClip = idx < videoClips.length - 1;

                        return (
                          <React.Fragment key={`audio-${clip.id}`}>
                            <View style={[styles.vnWaveformMock, { width: widthPx, height: 24 }]}>
                              <View style={styles.vnWaveformShape} />
                            </View>
                            {hasNextClip && <View style={{ width: 28, height: 24 }} />}
                          </React.Fragment>
                        );
                      })
                    ) : (
                      <View style={[styles.vnWaveformMock, { width: projectTimelineWidth }]}>
                        <View style={styles.vnWaveformShape} />
                      </View>
                    )}
                  </View>

                  <View style={[styles.vnRuler, { width: projectTimelineWidth }]}>
                    {[...Array(Math.max(1, Math.ceil((projectTimelineWidth / PIXELS_PER_MS) / 1000) + 1))].map((_, i) => (
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
    const hasVideoClip = Boolean(videoUri) || videoClips.length > 0 || totalDuration > 0;

    return (
      <View style={[
        styles.editingToolbar,
        isToolbarHidden && { display: 'none' as const },
      ]}>

        <BlurView intensity={20} tint="dark" style={StyleSheet.absoluteFill} />
        <ScrollView
          ref={toolbarScrollViewRef}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.toolbarScroll}
          decelerationRate={Platform.OS === "ios" ? "normal" : 0.985}
          overScrollMode="never"
          bounces={Platform.OS === "ios"}
          scrollEventThrottle={16}
          removeClippedSubviews={Platform.OS === "android"}
          onScroll={(e) => {
            toolbarScrollXRef.current = e.nativeEvent.contentOffset.x;
          }}
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

    if (selectedTool === "filters" || selectedTool === "filter") {
      return (
        <FilterPanel
          onClose={() => setSelectedTool(null)}
          onOpenAdjust={() => setSelectedTool("adjust")}
        />
      );
    }

    if (selectedTool === "color" || selectedTool === "adjust") {
      return (
        <ColorPanel
          adjustments={selectedClip?.adjustments}
          onUpdateAdjustments={updateSelectedClipAdjustments}
          onCommitAdjustments={() => recordHistory()}
          onReset={() => {
            resetSelectedClipAdjustments();
            recordHistory();
          }}
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
          onCommitSpeed={() => recordHistory()}
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
          onCommitAudio={() => recordHistory()}
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
          onCommitRotation={() => recordHistory()}
          onClose={() => setSelectedTool(null)}
          bottomInset={insets.bottom}
        />
      );
    }

    if (selectedTool === "transitions") {
      const activePairObj = selectedTransitionPair || allTransitionPairs[0] || null;
      const pairKey = activePairObj ? `${activePairObj.fromId}_${activePairObj.toId}` : "";
      const activeTrans = pairKey && transitions[pairKey] ? transitions[pairKey].type : "none";

      return (
        <TransitionPanel
          activePair={activePairObj}
          allPairs={allTransitionPairs}
          clips={videoClips}
          activeTransitionType={activeTrans}
          onSelectPair={(pair) => setSelectedTransitionPair(pair)}
          onSelectTransition={handleSelectTransition}
          onClose={() => {
            setSelectedTool(null);
            setSelectedTransitionPair(null);
          }}
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
      {/* 1. TOP NAV BAR (fixed height) */}
      {!isPreviewFullscreen && renderTopToolbar()}
      
      {/* 2. MAIN VIDEO PREVIEW (flex: 1 - dominant focus) */}
      <View style={{ flex: 1, backgroundColor: "#000" }}>
        {renderVideoPreview()}
      </View>
      
      {/* 3. PLAYBACK CONTROLS BAR (height: 60) */}
      {!isPreviewFullscreen && (
        <View style={{ height: 60, backgroundColor: "#141416" }}>
          {renderPlaybackControls()}
        </View>
      )}
      
      {/* 4. TIMELINE PANEL (fixed height 236px) */}
      {!isPreviewFullscreen && (
        <View style={[styles.timelineSection, { height: timelineHeight, flex: 0 }]}>
          {renderTimeline()}
          {!isTrimMode && (
            <TouchableOpacity
              activeOpacity={1}
              onPressIn={handleAiPressIn}
              onPressOut={handleAiPressOut}
              style={[styles.floatingAiBtnWrap, { bottom: 12, right: 16 }]}
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
      
      {/* 5. BOTTOM TOOLBAR (docked directly beneath timeline with zero overlap) */}
      {!isPreviewFullscreen && (
        <View style={{ backgroundColor: "#141416", paddingBottom: Math.max(insets.bottom, 12), justifyContent: "center" }}>
          {isTrimMode && (
            <TrimToolbar
              durationMs={Math.max(0, draftTrimEnd - draftTrimStart)}
              onCancel={handleCancelTrim}
              onDone={handleDoneTrimAndClose}
              formatTime={formatTime}
              bottomInset={insets.bottom}
            />
          )}
          {renderEditingToolbar()}
        </View>
      )}







      {/* 6. TOOL PANEL OVERLAY (absolute overlay, zIndex: 100) */}
      {!isPreviewFullscreen && (Boolean(selectedTool) || Boolean(selectedTimelineClip)) && !isTrimMode && (
        <View style={styles.propertiesPanelContainer}>
          {renderPropertiesPanel()}
        </View>
      )}
      
      <MusicLibrarySheet 
        visible={musicSheetVisible} 
        onClose={() => setMusicSheetVisible(false)} 
        onSelectTrack={(track) => setMusicTrack(track)}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  propertiesPanelContainer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    zIndex: 100,
    elevation: 20,
  },
  timelineSection: {
    backgroundColor: "#141416",
    position: "relative",
  },
  topToolbar: {
    height: 56,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    backgroundColor: "#121212",
  },
  leftActions: { flexDirection: "row", alignItems: "center", gap: 16 },
  iconButton: { width: 32, height: 32, justifyContent: "center", alignItems: "center" },
  headerCenter: { flexDirection: "row", alignItems: "center" },
  moreOptionsBtn: { marginLeft: 16, justifyContent: "center", alignItems: "center" },
  aspectRatioText: { fontSize: 15, color: "#fff", fontWeight: "500" },
  topActions: { flexDirection: "row", alignItems: "center", gap: 12 },
  saveButton: { backgroundColor: "#2C2C2E", paddingHorizontal: 12, paddingVertical: 8, borderRadius: 8 },
  exportButtonSmall: { backgroundColor: "#007AFF", paddingHorizontal: 12, paddingVertical: 8, borderRadius: 8 },
  previewContainer: { flex: 1, width: "100%", backgroundColor: "#000" },
  fullscreenContainer: {
    position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
    backgroundColor: '#000', zIndex: 9999, elevation: 9999, flex: 1,
  },
  fullscreenControls: {
    position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
    justifyContent: 'space-between', padding: 24, zIndex: 10000, elevation: 10000, pointerEvents: 'box-none',
  },
  fullscreenTopBar: { flexDirection: 'row', justifyContent: 'flex-end', marginTop: 40, pointerEvents: 'box-none' },
  fullscreenBottomBar: { backgroundColor: 'rgba(0,0,0,0.6)', borderRadius: 16, padding: 16, marginBottom: 20 },
  fullscreenScrubberWrap: { flexDirection: 'row', alignItems: 'center', marginBottom: 24, gap: 12 },
  fullscreenScrubberTrackTouch: { flex: 1, height: 24, justifyContent: 'center' },
  fullscreenScrubberTrack: { height: 4, backgroundColor: 'rgba(255,255,255,0.3)', borderRadius: 2, overflow: 'hidden' },
  fullscreenScrubberFill: { height: '100%', backgroundColor: '#fff' },
  fullscreenTime: { color: '#fff', fontSize: 12, fontVariant: ['tabular-nums'], width: 44, textAlign: 'center' },
  fullscreenPlayActions: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 32 },
  fullscreenActionBtn: { padding: 8 },
  fullscreenMainPlayBtn: { width: 64, height: 64, justifyContent: 'center', alignItems: 'center' },
  previewBox: { flex: 1, backgroundColor: "#000", width: "100%", justifyContent: "center", alignItems: "center", overflow: "hidden" },
  fullscreenButton: {
    position: "absolute", bottom: 12, right: 12, width: 32, height: 32,
    justifyContent: "center", alignItems: "center", backgroundColor: "rgba(0,0,0,0.5)", borderRadius: 16,
  },
  playbackControls: {
    height: 60,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 12,
    width: "100%",
    backgroundColor: "#141416",
  },
  playbackTimeWrap: { flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "flex-start" },
  timeTextCompact: { fontSize: 11, fontWeight: "600", color: "#fff", fontVariant: ["tabular-nums"] },
  timeTotalText: { color: "rgba(255,255,255,0.4)", fontSize: 11 },
  playActionsCompact: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8 },
  compactActionBtn: { width: 32, height: 32, borderRadius: 16, backgroundColor: "rgba(255, 255, 255, 0.12)", justifyContent: "center", alignItems: "center" },
  mainPlayBtn: { width: 38, height: 38, borderRadius: 19, shadowColor: "#007AFF", shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.4, shadowRadius: 6, elevation: 4 },
  mainPlayBtnGradient: { width: "100%", height: "100%", borderRadius: 19, justifyContent: "center", alignItems: "center" },
  playbackRightActions: { flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "flex-end", gap: 12 },
  rightActionBtn: { padding: 2 },
  sliderTrack: { width: "100%", height: 6, backgroundColor: "rgba(255,255,255,0.18)", borderRadius: 3, justifyContent: "center", position: "relative" },
  sliderFill: { height: "100%", borderRadius: 3 },
  sliderThumb: {
    position: "absolute", width: 18, height: 18, borderRadius: 9, marginTop: -6, marginLeft: -9,
    shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.5, shadowRadius: 4, elevation: 4,
  },
  timelineContainer: { flex: 1, position: "relative" },
  timelineBody: { flex: 1, flexDirection: "row" },
  fixedLeftColumn: { width: 80, paddingTop: 8, flexDirection: "row", zIndex: 10, backgroundColor: "#1A1A1E", borderRightWidth: 1, borderRightColor: "rgba(255,255,255,0.05)" },
  coverButtonBox: { width: 44, alignItems: "center", justifyContent: "flex-start", paddingLeft: 4 },
  coverButton: { width: 32, height: 38, borderRadius: 6, borderWidth: 1, borderColor: "rgba(255,255,255,0.25)", backgroundColor: "rgba(255,255,255,0.1)", justifyContent: "center", alignItems: "center", marginTop: 111 },
  coverText: { color: "#fff", fontSize: 9, fontWeight: "600" },
  trackIcons: { flex: 1, alignItems: "center" },
  trackIconWrap: { width: "100%", justifyContent: "center", alignItems: "center", marginBottom: 4 },
  textIconBorder: { width: 18, height: 18, borderRadius: 4, borderWidth: 1.5, borderColor: "#8E8E93", justifyContent: "center", alignItems: "center" },
  plusBadge: { position: "absolute", bottom: "20%", right: 2, width: 12, height: 12, borderRadius: 6, backgroundColor: "#fff", justifyContent: "center", alignItems: "center" },
  timelineScroll: { paddingLeft: 10, paddingRight: width, paddingTop: 8 },
  tracks: { gap: 4 },
  vnTrack: { flexDirection: "row", alignItems: "center", position: "relative" },
  vnClip: { height: "100%", borderRadius: 6, justifyContent: "center", borderWidth: 1, borderColor: "rgba(255,255,255,0.05)" },
  vnPlaceholderText: { color: "rgba(255,255,255,0.5)", fontSize: 12, fontWeight: "500" },
  vnVideoClip: { height: "100%", backgroundColor: "#000", borderRadius: 2, overflow: "hidden", position: "relative" },
  vnThumbnails: { flex: 1, flexDirection: "row" },
  vnThumb: { width: 60, height: "100%", opacity: 0.8 },
  vnYellowBorder: { position: "absolute", top: 0, left: 0, right: 0, bottom: 0, borderWidth: 2, borderColor: "#FFCC00", borderRadius: 2 },
  vnClipTime: { position: "absolute", bottom: 2, left: 4, backgroundColor: "rgba(0,0,0,0.6)", paddingHorizontal: 4, paddingVertical: 2, borderRadius: 2 },
  vnClipTimeText: { color: "#fff", fontSize: 8, fontWeight: "700" },
  vnWaveformMock: { height: "100%", backgroundColor: "rgba(255, 204, 0, 0.15)", overflow: "hidden", justifyContent: "flex-end" },
  vnWaveformShape: { width: "100%", height: "60%", backgroundColor: "#FFCC00", opacity: 0.8, borderTopLeftRadius: 4, borderTopRightRadius: 4 },
  vnRuler: { flexDirection: "row", height: 24, alignItems: "center", marginTop: 4 },
  vnRulerMark: { width: 80, position: "relative" },
  vnRulerText: { color: "rgba(255,255,255,0.4)", fontSize: 10, position: "absolute", left: -12, top: 8 },
  vnRulerDot: { width: 2, height: 2, backgroundColor: "rgba(255,255,255,0.3)", borderRadius: 1, position: "absolute", left: 40, top: 12 },
  playhead: { position: "absolute", top: 0, bottom: 0, width: 2, alignItems: "center", zIndex: 20 },
  playheadLine: { flex: 1, width: 2, backgroundColor: "#fff" },
  playheadLineSnapping: { backgroundColor: "#FFCC00", width: 3 },
  playheadHandle: { position: "absolute", top: 104, width: 20, height: 20, backgroundColor: "#fff", borderRadius: 4, justifyContent: "center", alignItems: "center", shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.5, shadowRadius: 4, elevation: 4 },
  playheadHandleSnapping: { backgroundColor: "#FFCC00" },
  playheadHandleInner: { width: 8, height: 2, backgroundColor: "#000", borderRadius: 1 },
  floatingAiBtnWrap: { position: "absolute", bottom: 16, right: 16, zIndex: 25, elevation: 12 },
  floatingAiBtn: {
    width: 42, height: 42, borderRadius: 21, alignItems: "center", justifyContent: "center", overflow: "hidden",
    shadowColor: "#3B82F6", shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.5, shadowRadius: 12, elevation: 12, borderWidth: 1, borderColor: "rgba(255,255,255,0.15)",
  },
  editingToolbar: {
    height: 84,
    backgroundColor: "rgba(18,18,24,0.97)",
    borderTopWidth: 1,
    borderTopColor: "rgba(255,255,255,0.06)",
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 12,
  },

  toolbarScroll: {
    paddingHorizontal: 8,
    paddingTop: 8,
    paddingBottom: 8,
    gap: 0,
    alignItems: "center",
    justifyContent: "center",
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
    userSelect: "none" as any,
    outlineStyle: "none" as any,
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
    backgroundColor: "#FFD700",
    shadowColor: "#FFCC00",
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
    flex: 1,
    backgroundColor: "#1A1A1D",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -6 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
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
  transitionGapContainer: {
    width: 28,
    height: 60,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#0D0D0F",
    marginHorizontal: 0,
    zIndex: 5,
  },
  transitionBtn: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: "#2A2A35",
    borderWidth: 1.5,
    borderColor: "#666",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.4,
    shadowRadius: 3,
    elevation: 4,
  },
  transitionBtnActive: {
    backgroundColor: "#FFCC00",
    borderColor: "#FFCC00",
  },
});

