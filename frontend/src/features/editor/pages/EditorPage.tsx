import React, { useState, useRef, useEffect, useMemo } from "react";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Dimensions, Image, Animated } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { BlurView } from "expo-blur";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { useRouter, useLocalSearchParams } from "expo-router";
import { Video, ResizeMode, Audio } from "expo-av";

import { useTheme } from "@/src/theme";
import { MusicLibrarySheet, MusicTrack } from "../components/MusicLibrarySheet";

const { width } = Dimensions.get("window");

// Mock Data for Tools
const EDITING_TOOLS = [
  { id: "trim", icon: "cut-outline", label: "Trim" },
  { id: "split", icon: "code-working-outline", label: "Split" },
  { id: "crop", icon: "crop-outline", label: "Crop" },
  { id: "text", icon: "text-outline", label: "Text" },
  { id: "audio", icon: "musical-notes-outline", label: "Audio" },
  { id: "effects", icon: "sparkles-outline", label: "Effects" },
  { id: "filters", icon: "color-wand-outline", label: "Filters" },
  { id: "speed", icon: "speedometer-outline", label: "Speed" },
  { id: "animation", icon: "play-circle-outline", label: "Animation" },
  { id: "overlay", icon: "layers-outline", label: "Overlay" },
  { id: "canvas", icon: "image-outline", label: "Canvas" },
  { id: "stickers", icon: "happy-outline", label: "Stickers" },
  { id: "transitions", icon: "swap-horizontal-outline", label: "Transitions" },
  { id: "adjust", icon: "options-outline", label: "Adjust" },
  { id: "color", icon: "color-palette-outline", label: "Color" },
  { id: "background", icon: "color-fill-outline", label: "Background" },
  { id: "rotate", icon: "refresh-outline", label: "Rotate" },
  { id: "mirror", icon: "swap-horizontal", label: "Mirror" },
  { id: "replace", icon: "sync-outline", label: "Replace" },
  { id: "ai", icon: "planet-outline", label: "AI Tools" },
];

export function EditorPage() {
  const { theme, isDark } = useTheme();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { videoUri, duration } = useLocalSearchParams<{ videoUri?: string; duration?: string }>();
  const [selectedTool, setSelectedTool] = useState<string | null>(null);

  const videoRef = useRef<Video>(null);
  const scrollViewRef = useRef<ScrollView>(null);
  const lastStateUpdate = useRef(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [totalDuration, setTotalDuration] = useState(duration ? parseInt(duration) : 0);

  const [musicSheetVisible, setMusicSheetVisible] = useState(false);
  const [musicTrack, setMusicTrack] = useState<MusicTrack | null>(null);
  const [selectedTimelineClip, setSelectedTimelineClip] = useState<"music" | null>(null);

  const audioRef = useRef<Audio.Sound | null>(null);

  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.unloadAsync();
      }
    };
  }, []);

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
        audioRef.current.playAsync();
      } else {
        audioRef.current.pauseAsync();
      }
    }
  }, [isPlaying]);

  const formatTime = (ms: number) => {
    if (isNaN(ms) || ms < 0) return "00:00";
    const totalSeconds = Math.floor(ms / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  const handlePlayPause = async () => {
    if (isPlaying) {
      await videoRef.current?.pauseAsync();
    } else {
      await videoRef.current?.playAsync();
    }
  };

  const handleSeekToStart = async () => {
    if (videoRef.current) {
      await videoRef.current.setPositionAsync(0);
      if (audioRef.current) {
        await audioRef.current.setPositionAsync(0);
      }
      setCurrentTime(0);
      scrollViewRef.current?.scrollTo({ x: 0, animated: true });
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

  const renderVideoPreview = () => (
    <View style={styles.previewContainer}>
      <View style={styles.previewBox}>
        {videoUri ? (
          <Video
            ref={videoRef}
            source={{ uri: videoUri }}
            style={StyleSheet.absoluteFill}
            resizeMode={ResizeMode.CONTAIN}
            shouldPlay={false}
            isLooping
            progressUpdateIntervalMillis={16}
            onPlaybackStatusUpdate={(status) => {
              if (status.isLoaded) {
                if (status.durationMillis && scrollViewRef.current) {
                  const scrollX = (status.positionMillis / status.durationMillis) * 300;
                  scrollViewRef.current.scrollTo({ x: scrollX, animated: false });
                }

                const now = Date.now();
                if (now - lastStateUpdate.current > 250) {
                  if (status.isPlaying !== isPlaying) setIsPlaying(status.isPlaying);
                  setCurrentTime(status.positionMillis);
                  if (status.durationMillis && totalDuration === 0) {
                    setTotalDuration(status.durationMillis);
                  }
                  lastStateUpdate.current = now;
                }
              }
            }}
          />
        ) : (
          <Image source={{uri: "https://images.unsplash.com/photo-1517404215738-15263e9f9178"}} style={StyleSheet.absoluteFill} resizeMode="cover" />
        )}
        
        <TouchableOpacity 
          style={styles.fullscreenButton}
          onPress={() => videoRef.current?.presentFullscreenPlayer()}
        >
          <Ionicons name="expand" size={16} color="#fff" />
        </TouchableOpacity>
      </View>

      <View style={styles.playbackControls}>
        <View style={{flex: 1}}>
          <Text style={styles.timeTextCompact}>
            {formatTime(currentTime)} <Text style={{color: '#666666', fontSize: 12}}>/ {formatTime(totalDuration)}</Text>
          </Text>
        </View>
        
        <View style={styles.playActionsCompact}>
          <TouchableOpacity style={styles.compactActionBtn} onPress={handleSeekToStart}>
            <Ionicons name="play-skip-back" size={18} color="#fff" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.compactActionBtn} onPress={handlePlayPause}>
            <Ionicons name={isPlaying ? "pause" : "play"} size={24} color="#fff" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.compactActionBtn}>
            <Ionicons name="play-skip-forward" size={18} color="#fff" />
          </TouchableOpacity>
        </View>

        <View style={{flex: 1, flexDirection: 'row', justifyContent: 'flex-end', gap: 16, alignItems: 'center'}}>
          <TouchableOpacity>
            <Ionicons name="options-outline" size={22} color="#fff" />
          </TouchableOpacity>
          <TouchableOpacity>
            <Ionicons name="arrow-undo-outline" size={22} color="#fff" />
          </TouchableOpacity>
          <TouchableOpacity>
            <Ionicons name="arrow-redo-outline" size={22} color="#666666" />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );

  const renderTimeline = () => (
    <View style={[styles.timelineContainer, { backgroundColor: isDark ? "#141416" : "#F2F2F7" }]}>
      <View style={styles.timelineBody}>
        {/* Fixed Left Column */}
        <View style={styles.fixedLeftColumn}>
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
            <View style={[styles.trackIconWrap, { height: 32 }]}>
              <View style={styles.textIconBorder}>
                <Text style={{color: "#8E8E93", fontWeight: '700', fontSize: 13}}>T</Text>
              </View>
              <View style={styles.plusBadge}><Ionicons name="add" size={10} color="#000" /></View>
            </View>
            <View style={[styles.trackIconWrap, { height: 32 }]}>
              <Ionicons name="image-outline" size={20} color="#8E8E93" style={{ transform: [{ scaleX: -1 }, { rotate: '15deg' }] }} />
              <View style={styles.plusBadge}><Ionicons name="add" size={10} color="#000" /></View>
            </View>
            <View style={[styles.trackIconWrap, { height: 60 }]}>
              <Ionicons name="film" size={20} color="#8E8E93" />
              <View style={styles.plusBadge}><Ionicons name="add" size={10} color="#000" /></View>
            </View>
            <View style={[styles.trackIconWrap, { height: 24 }]}>
              <Ionicons name="volume-high" size={20} color="#8E8E93" />
            </View>
            <View style={{ height: 24 }} />
          </View>
        </View>

        {/* Scrollable Tracks */}
        <ScrollView 
          ref={scrollViewRef}
          horizontal 
          showsHorizontalScrollIndicator={false} 
          contentContainerStyle={styles.timelineScroll}
        >
          <View style={styles.tracks}>
            {useMemo(() => (
              <>
                <View style={[styles.vnTrack, { height: 32 }]}>
                  {musicTrack ? (
                    <TouchableOpacity 
                      activeOpacity={0.8}
                      onPress={() => {
                        setSelectedTimelineClip("music");
                        setSelectedTool("audio");
                      }}
                    >
                      <View style={[
                        styles.vnClip, 
                        { 
                          width: (musicTrack.duration / totalDuration) * 300 || 200, 
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
                    <TouchableOpacity activeOpacity={0.8} onPress={() => setMusicSheetVisible(true)}>
                      <View style={[styles.vnClip, { width: 200, backgroundColor: "#2A2A35" }]}>
                        <Text style={styles.vnPlaceholderText}>Tap to add music</Text>
                      </View>
                    </TouchableOpacity>
                  )}
                </View>

                <View style={[styles.vnTrack, { height: 32 }]}>
                  <View style={[styles.vnClip, { width: 250, backgroundColor: "#2A2A35" }]}>
                    <Text style={styles.vnPlaceholderText}>Tap to add subtitle</Text>
                  </View>
                </View>

                <View style={[styles.vnTrack, { height: 32 }]}>
                  <View style={[styles.vnClip, { width: 300, backgroundColor: "#2A2A35" }]}>
                    <Text style={styles.vnPlaceholderText}>Tap to add sticker / Overlay</Text>
                  </View>
                </View>

                <View style={[styles.vnTrack, { height: 60 }]}>
                  <View style={[styles.vnVideoClip, { width: 300 }]}>
                    <View style={styles.vnThumbnails}>
                      {videoUri ? (
                        <>
                          <Image source={{uri: videoUri}} style={styles.vnThumb} />
                          <Image source={{uri: videoUri}} style={styles.vnThumb} />
                          <Image source={{uri: videoUri}} style={styles.vnThumb} />
                          <Image source={{uri: videoUri}} style={styles.vnThumb} />
                        </>
                      ) : (
                        <>
                          <Image source={{uri: "https://images.unsplash.com/photo-1517404215738-15263e9f9178"}} style={styles.vnThumb} />
                          <Image source={{uri: "https://images.unsplash.com/photo-1517404215738-15263e9f9178"}} style={styles.vnThumb} />
                          <Image source={{uri: "https://images.unsplash.com/photo-1517404215738-15263e9f9178"}} style={styles.vnThumb} />
                          <Image source={{uri: "https://images.unsplash.com/photo-1517404215738-15263e9f9178"}} style={styles.vnThumb} />
                        </>
                      )}
                    </View>
                    <View style={styles.vnYellowBorder} />
                    <View style={styles.vnClipTime}>
                      <Text style={styles.vnClipTimeText}>{formatTime(totalDuration)}</Text>
                    </View>
                  </View>
                </View>
                
                <View style={[styles.vnTrack, { height: 24 }]}>
                  <View style={styles.vnWaveformMock}>
                    <View style={styles.vnWaveformShape} />
                  </View>
                </View>

                <View style={styles.vnRuler}>
                  {[...Array(15)].map((_, i) => (
                    <View key={i} style={styles.vnRulerMark}>
                      <Text style={styles.vnRulerText}>{formatTime((i * 80 / 300) * totalDuration)}</Text>
                      <View style={styles.vnRulerDot} />
                    </View>
                  ))}
                </View>
              </>
            ), [videoUri, musicTrack, totalDuration, selectedTimelineClip])}
          </View>
        </ScrollView>

        <View style={[styles.playhead, { left: 85 }]}>
          <View style={styles.playheadLine} />
          <View style={styles.playheadHandle}>
            <View style={styles.playheadHandleInner} />
          </View>
        </View>
      </View>

      <TouchableOpacity style={styles.floatingAiBtn}>
        <LinearGradient colors={["#7C5CFF", "#FF3B8B"]} style={StyleSheet.absoluteFill} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} />
        <Ionicons name="sparkles" size={16} color="#fff" />
        <Text style={styles.floatingAiText}>AI Assist</Text>
      </TouchableOpacity>
    </View>
  );

  const renderEditingToolbar = () => (
    <View style={[styles.editingToolbar, { paddingBottom: Math.max(insets.bottom, 12) }]}>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.toolbarScroll}>
        {EDITING_TOOLS.map((tool) => (
          <TouchableOpacity 
            key={tool.id} 
            style={styles.toolBtn} 
            onPress={() => setSelectedTool(tool.id)}
            activeOpacity={0.7}
          >
            <View style={[styles.toolIconBox, selectedTool === tool.id && { backgroundColor: "rgba(124, 92, 255, 0.15)" }]}>
              <Ionicons 
                name={tool.icon as any} 
                size={22} 
                color={selectedTool === tool.id ? theme.colors.primary : theme.colors.textPrimary} 
              />
            </View>
            <Text style={[styles.toolLabel, { color: selectedTool === tool.id ? theme.colors.primary : theme.colors.textSecondary }]}>
              {tool.label}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );

  const renderPropertiesPanel = () => {
    if (!selectedTool && !selectedTimelineClip) return null;

    if (selectedTimelineClip === "music") {
      return (
        <View style={[styles.propertiesPanel, { paddingBottom: Math.max(insets.bottom, 20) }]}>
          <View style={styles.panelHeader}>
            <Text style={[styles.panelTitle, { color: theme.colors.textPrimary }]}>
              Music: {musicTrack?.title}
            </Text>
            <TouchableOpacity onPress={() => setSelectedTimelineClip(null)}>
              <Ionicons name="close-circle" size={24} color={theme.colors.textMuted} />
            </TouchableOpacity>
          </View>
          <View style={styles.panelContent}>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 16 }}>
              <View style={{ width: 150 }}>
                <Text style={{ color: theme.colors.textSecondary, marginBottom: 12 }}>Volume</Text>
                <View style={styles.sliderTrack}>
                  <View style={[styles.sliderFill, { backgroundColor: theme.colors.primary, width: "100%" }]} />
                  <View style={[styles.sliderThumb, { backgroundColor: "#fff", left: "100%" }]} />
                </View>
              </View>

              <View style={{ width: 100 }}>
                <Text style={{ color: theme.colors.textSecondary, marginBottom: 12 }}>Fade In</Text>
                <View style={styles.sliderTrack}>
                  <View style={[styles.sliderFill, { backgroundColor: theme.colors.primary, width: "0%" }]} />
                  <View style={[styles.sliderThumb, { backgroundColor: "#fff", left: "0%" }]} />
                </View>
              </View>

              <View style={{ width: 100 }}>
                <Text style={{ color: theme.colors.textSecondary, marginBottom: 12 }}>Fade Out</Text>
                <View style={styles.sliderTrack}>
                  <View style={[styles.sliderFill, { backgroundColor: theme.colors.primary, width: "0%" }]} />
                  <View style={[styles.sliderThumb, { backgroundColor: "#fff", left: "0%" }]} />
                </View>
              </View>

              <TouchableOpacity 
                style={{ alignItems: "center", justifyContent: "center", padding: 12, backgroundColor: theme.colors.surface, borderRadius: 12 }}
                onPress={() => setMusicSheetVisible(true)}
              >
                <Ionicons name="sync-outline" size={20} color={theme.colors.textPrimary} />
                <Text style={{ color: theme.colors.textPrimary, fontSize: 12, marginTop: 4 }}>Replace</Text>
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
          <Text style={[styles.panelTitle, { color: theme.colors.textPrimary }]}>
            {EDITING_TOOLS.find(t => t.id === selectedTool)?.label || "Properties"}
          </Text>
          <TouchableOpacity onPress={() => setSelectedTool(null)}>
            <Ionicons name="close-circle" size={24} color={theme.colors.textMuted} />
          </TouchableOpacity>
        </View>
        <View style={styles.panelContent}>
          {/* Mock content for Speed as an example */}
          <Text style={{ color: theme.colors.textSecondary, marginBottom: 12 }}>1.0x (Normal)</Text>
          <View style={styles.sliderTrack}>
            <View style={[styles.sliderFill, { backgroundColor: theme.colors.primary, width: "25%" }]} />
            <View style={[styles.sliderThumb, { backgroundColor: "#fff", left: "25%" }]} />
          </View>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 8 }}>
            <Text style={{ color: theme.colors.textMuted, fontSize: 12 }}>0.25x</Text>
            <Text style={{ color: theme.colors.textMuted, fontSize: 12 }}>1x</Text>
            <Text style={{ color: theme.colors.textMuted, fontSize: 12 }}>4x</Text>
          </View>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: "#121212" }]} edges={['top']}>
      {renderTopToolbar()}
      {renderVideoPreview()}
      {renderTimeline()}
      {selectedTool || selectedTimelineClip ? renderPropertiesPanel() : renderEditingToolbar()}
      
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
    paddingHorizontal: 16,
    paddingVertical: 12,
    justifyContent: "space-between",
  },
  timeTextCompact: {
    fontSize: 12,
    fontWeight: "500",
    color: "#fff",
    fontVariant: ["tabular-nums"],
  },
  playActionsCompact: {
    flexDirection: "row",
    alignItems: "center",
    gap: 24,
  },
  compactActionBtn: {
    padding: 4,
  },
  sliderTrack: {
    flex: 1,
    height: 4,
    backgroundColor: "rgba(255,255,255,0.1)",
    borderRadius: 2,
    justifyContent: "center",
  },
  sliderFill: {
    height: "100%",
    borderRadius: 2,
  },
  sliderThumb: {
    position: "absolute",
    width: 14,
    height: 14,
    borderRadius: 7,
    marginTop: -5,
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
  playheadHandle: {
    position: "absolute",
    top: 104, // aligned with the video track exactly
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
  playheadHandleInner: {
    width: 8,
    height: 2,
    backgroundColor: "#000",
    borderRadius: 1,
  },
  floatingAiBtn: {
    position: "absolute",
    top: 16,
    right: 16,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    gap: 6,
    overflow: "hidden",
    shadowColor: "#FF3B8B",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 8,
    zIndex: 30,
  },
  floatingAiText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 13,
  },
  editingToolbar: {
    backgroundColor: "#121212",
    borderTopWidth: 1,
    borderTopColor: "rgba(255,255,255,0.05)",
  },
  toolbarScroll: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 16,
  },
  toolBtn: {
    alignItems: "center",
    width: 64,
  },
  toolIconBox: {
    width: 44,
    height: 44,
    borderRadius: 14,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.05)",
    marginBottom: 6,
  },
  toolLabel: {
    fontSize: 11,
    fontWeight: "500",
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
