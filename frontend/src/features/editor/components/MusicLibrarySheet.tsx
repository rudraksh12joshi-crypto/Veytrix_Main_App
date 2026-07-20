import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Dimensions,
  ScrollView,
  Image,
  ActivityIndicator,
  Modal,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { BlurView } from "expo-blur";
import * as DocumentPicker from "expo-document-picker";

import { useTheme } from "@/src/theme";

const { height } = Dimensions.get("window");
const SHEET_HEIGHT = height * 0.85;

export interface MusicTrack {
  id: string;
  title: string;
  artist: string;
  duration: number; // in milliseconds
  coverUrl?: string;
  uri?: string;
}

// Mock Data
const MOCK_CATEGORIES = {
  trending: [
    { id: "t1", title: "Cyberpunk City", artist: "Synthwave Neo", duration: 125000, coverUrl: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe" },
    { id: "t2", title: "Epic Cinematic", artist: "Hans Zimmer Style", duration: 180000, coverUrl: "https://images.unsplash.com/photo-1446776811953-b23d57bd21aa" },
    { id: "t3", title: "Lofi Study Beats", artist: "Chill Girl", duration: 210000, coverUrl: "https://images.unsplash.com/photo-1518609878373-06d740f60d8b" },
  ],
  ai: [
    { id: "a1", title: "Action Trailer", artist: "Veytrix AI", duration: 60000, coverUrl: "https://images.unsplash.com/photo-1536440136628-849c177e76a1" },
    { id: "a2", title: "Emotional Piano", artist: "Veytrix AI", duration: 110000, coverUrl: "https://images.unsplash.com/photo-1520523839897-bd0b52f945a0" },
  ],
  recent: [
    { id: "r1", title: "Upbeat Vlog", artist: "Creator Sounds", duration: 150000, coverUrl: "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4" },
  ],
};

interface MusicLibrarySheetProps {
  visible: boolean;
  onClose: () => void;
  onSelectTrack: (track: MusicTrack) => void;
}

export function MusicLibrarySheet({ visible, onClose, onSelectTrack }: MusicLibrarySheetProps) {
  const { theme } = useTheme();
  const slideAnim = useRef(new Animated.Value(SHEET_HEIGHT)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  const [view, setView] = useState<"home" | "list">("home");
  const [activeCategory, setActiveCategory] = useState<"trending" | "ai" | "recent" | null>(null);
  const [playingTrackId, setPlayingTrackId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (visible) {
      setView("home");
      setActiveCategory(null);
      setPlayingTrackId(null);
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: SHEET_HEIGHT,
          duration: 250,
          useNativeDriver: true,
        }),
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 250,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [visible, slideAnim, fadeAnim]);

  const handleImportDevice = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: "audio/*",
        copyToCacheDirectory: true,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const file = result.assets[0];
        setLoading(true);
        // Simulate processing delay
        setTimeout(() => {
          setLoading(false);
          onSelectTrack({
            id: `local_${Date.now()}`,
            title: file.name.replace(/\.[^/.]+$/, ""), // Remove extension
            artist: "Unknown Artist",
            duration: 60000, // Mock duration for local file
            uri: file.uri,
          });
          onClose();
        }, 1500);
      }
    } catch (err) {
      console.log("Error picking document:", err);
    }
  };

  const handleCategoryPress = (category: "trending" | "ai" | "recent") => {
    setActiveCategory(category);
    setView("list");
  };

  const handlePlayPause = (id: string) => {
    setPlayingTrackId(prev => (prev === id ? null : id));
  };

  const handleAddTrack = (track: MusicTrack) => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      onSelectTrack(track);
      onClose();
    }, 800);
  };

  const formatTime = (ms: number) => {
    const totalSeconds = Math.floor(ms / 1000);
    const m = Math.floor(totalSeconds / 60);
    const s = totalSeconds % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  if (!visible && (slideAnim as any)._value === SHEET_HEIGHT) return null;

  const currentList = activeCategory ? MOCK_CATEGORIES[activeCategory] : [];
  const categoryTitle = 
    activeCategory === "trending" ? "Trending Music" : 
    activeCategory === "ai" ? "AI Recommended" : 
    "Recently Used";

  return (
    <Modal transparent visible={visible} animationType="none">
      <View style={StyleSheet.absoluteFill}>
        <Animated.View style={[StyleSheet.absoluteFill, { opacity: fadeAnim }]}>
        <BlurView intensity={20} tint="dark" style={StyleSheet.absoluteFill}>
          <TouchableOpacity style={StyleSheet.absoluteFill} activeOpacity={1} onPress={onClose} />
        </BlurView>
      </Animated.View>

      <Animated.View 
        style={[
          styles.sheet, 
          { backgroundColor: theme.colors.surfaceElevated, transform: [{ translateY: slideAnim }] }
        ]}
      >
        <View style={styles.handleBar} />
        
        <View style={styles.header}>
          {view === "list" ? (
            <TouchableOpacity onPress={() => setView("home")} style={styles.backBtn}>
              <Ionicons name="chevron-back" size={24} color={theme.colors.textPrimary} />
            </TouchableOpacity>
          ) : (
            <View style={{ width: 24 }} />
          )}

          <View style={styles.headerCenter}>
            <Text style={[styles.title, { color: theme.colors.textPrimary }]}>
              {view === "home" ? "🎵 Add Music" : categoryTitle}
            </Text>
            {view === "home" && (
              <Text style={[styles.subtitle, { color: theme.colors.textSecondary }]}>
                Choose background music for your video.
              </Text>
            )}
          </View>

          <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
            <Ionicons name="close" size={24} color={theme.colors.textPrimary} />
          </TouchableOpacity>
        </View>

        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={theme.colors.primary} />
            <Text style={[styles.loadingText, { color: theme.colors.textSecondary }]}>
              Processing Audio...
            </Text>
          </View>
        ) : view === "home" ? (
          <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
            <TouchableOpacity 
              style={[styles.card, { backgroundColor: theme.colors.surface }]}
              activeOpacity={0.7}
              onPress={handleImportDevice}
            >
              <View style={[styles.iconBox, { backgroundColor: theme.colors.primary + '20' }]}>
                <Ionicons name="folder-open" size={24} color={theme.colors.primary} />
              </View>
              <View style={styles.cardText}>
                <Text style={[styles.cardTitle, { color: theme.colors.textPrimary }]}>Import from Device</Text>
                <Text style={[styles.cardDesc, { color: theme.colors.textSecondary }]}>Import songs stored on your phone.</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color={theme.colors.textMuted} />
            </TouchableOpacity>

            <TouchableOpacity 
              style={[styles.card, { backgroundColor: theme.colors.surface }]}
              activeOpacity={0.7}
              onPress={() => handleCategoryPress("trending")}
            >
              <View style={[styles.iconBox, { backgroundColor: theme.colors.accent + '20' }]}>
                <Ionicons name="flame" size={24} color={theme.colors.accent} />
              </View>
              <View style={styles.cardText}>
                <Text style={[styles.cardTitle, { color: theme.colors.textPrimary }]}>Trending Music</Text>
                <Text style={[styles.cardDesc, { color: theme.colors.textSecondary }]}>Popular music collection.</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color={theme.colors.textMuted} />
            </TouchableOpacity>

            <TouchableOpacity 
              style={[styles.card, { backgroundColor: theme.colors.surface }]}
              activeOpacity={0.7}
              onPress={() => handleCategoryPress("ai")}
            >
              <View style={[styles.iconBox, { backgroundColor: theme.colors.success + '20' }]}>
                <Ionicons name="sparkles" size={24} color={theme.colors.success} />
              </View>
              <View style={styles.cardText}>
                <Text style={[styles.cardTitle, { color: theme.colors.textPrimary }]}>AI Recommended</Text>
                <Text style={[styles.cardDesc, { color: theme.colors.textSecondary }]}>Music suggested based on your project.</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color={theme.colors.textMuted} />
            </TouchableOpacity>

            <TouchableOpacity 
              style={[styles.card, { backgroundColor: theme.colors.surface }]}
              activeOpacity={0.7}
              onPress={() => handleCategoryPress("recent")}
            >
              <View style={[styles.iconBox, { backgroundColor: theme.colors.warning + '20' }]}>
                <Ionicons name="time" size={24} color={theme.colors.warning} />
              </View>
              <View style={styles.cardText}>
                <Text style={[styles.cardTitle, { color: theme.colors.textPrimary }]}>Recently Used</Text>
                <Text style={[styles.cardDesc, { color: theme.colors.textSecondary }]}>Previously used songs.</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color={theme.colors.textMuted} />
            </TouchableOpacity>
          </ScrollView>
        ) : (
          <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
            {currentList.map((track) => {
              const isPlaying = playingTrackId === track.id;
              return (
                <View key={track.id} style={[styles.trackRow, { borderBottomColor: theme.colors.border }]}>
                  <Image source={{ uri: track.coverUrl }} style={styles.trackCover} />
                  <TouchableOpacity 
                    style={styles.playOverlay}
                    onPress={() => handlePlayPause(track.id)}
                  >
                    <Ionicons name={isPlaying ? "pause" : "play"} size={20} color="#fff" />
                  </TouchableOpacity>
                  
                  <View style={styles.trackInfo}>
                    <Text style={[styles.trackTitle, { color: theme.colors.textPrimary }]} numberOfLines={1}>
                      {track.title}
                    </Text>
                    <Text style={[styles.trackArtist, { color: theme.colors.textSecondary }]} numberOfLines={1}>
                      {track.artist} • {formatTime(track.duration)}
                    </Text>
                  </View>

                  <TouchableOpacity 
                    style={[styles.addBtn, { backgroundColor: theme.colors.primary }]}
                    onPress={() => handleAddTrack(track)}
                  >
                    <Ionicons name="add" size={18} color="#fff" />
                    <Text style={styles.addBtnText}>Add</Text>
                  </TouchableOpacity>
                </View>
              );
            })}
          </ScrollView>
        )}
      </Animated.View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  sheet: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: SHEET_HEIGHT,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingTop: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.25,
    shadowRadius: 16,
    elevation: 24,
  },
  handleBar: {
    width: 40,
    height: 4,
    backgroundColor: "rgba(255,255,255,0.2)",
    borderRadius: 2,
    alignSelf: "center",
    marginBottom: 16,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  backBtn: {
    padding: 4,
  },
  closeBtn: {
    padding: 4,
    backgroundColor: "rgba(255,255,255,0.1)",
    borderRadius: 16,
  },
  headerCenter: {
    flex: 1,
    alignItems: "center",
  },
  title: {
    fontSize: 20,
    fontWeight: "700",
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 13,
    fontWeight: "400",
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  card: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderRadius: 16,
    marginBottom: 12,
  },
  iconBox: {
    width: 48,
    height: 48,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 16,
  },
  cardText: {
    flex: 1,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 4,
  },
  cardDesc: {
    fontSize: 13,
  },
  trackRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  trackCover: {
    width: 50,
    height: 50,
    borderRadius: 8,
    marginRight: 12,
  },
  playOverlay: {
    position: "absolute",
    left: 0,
    width: 50,
    height: 50,
    borderRadius: 8,
    backgroundColor: "rgba(0,0,0,0.4)",
    alignItems: "center",
    justifyContent: "center",
  },
  trackInfo: {
    flex: 1,
    marginRight: 12,
  },
  trackTitle: {
    fontSize: 15,
    fontWeight: "600",
    marginBottom: 4,
  },
  trackArtist: {
    fontSize: 13,
  },
  addBtn: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  addBtnText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "600",
    marginLeft: 4,
  },
  loadingContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  loadingText: {
    marginTop: 12,
    fontSize: 15,
    fontWeight: "500",
  },
});
