import React, { useState, useRef, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Animated,
  Image,
  Pressable,
  Easing,
  Dimensions,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import * as ImagePicker from "expo-image-picker";
import { LinearGradient } from "expo-linear-gradient";

const { width } = Dimensions.get("window");

const SUGGESTIONS = [
  "🎬 Cinematic", "🔥 Viral Reel", "📱 Instagram Reel", "🎥 YouTube",
  "🎵 Music Video", "✈ Travel", "📖 Storytelling", "💼 Business",
  "🏋 Fitness", "🎮 Gaming", "🌅 Nature", "✨ Luxury"
];

const TIPS = [
  { name: "Mood", text: "Mood: cinematic, " },
  { name: "Transitions", text: "Transitions: dynamic zoom cuts, " },
  { name: "Music Style", text: "Music Style: upbeat lo-fi, " },
  { name: "Speed", text: "Speed: slow motion highlights, " },
  { name: "Color Tone", text: "Color Tone: warm vintage, " },
  { name: "Camera Motion", text: "Camera Motion: smooth pans, " },
  { name: "Lighting", text: "Lighting: dramatic neon sunset, " }
];

const COLORS = {
  primaryDark: "#1D2B64",
  primaryBlue: "#3B6CE7",
  secondaryBlue: "#8CC8E8",
  background: "#E6F2F8",
  white: "#FFFFFF",
  placeholder: "#7A8EA8",
  textSecondary: "#5F7695",
  disabledBlue: "#AFC4E8",
  lightBlueBg: "#F0F7FB",
  borderLight: "#D6EAF5",
  successGreen: "#4CAF50",
  shadowColor: "rgba(59, 108, 231, 0.15)",
};

export default function AIUploadMediaPage() {
  const router = useRouter();
  const [mediaSelected, setMediaSelected] = useState(false);
  const [media, setMedia] = useState<ImagePicker.ImagePickerAsset[]>([]);
  const [activeMediaIndex, setActiveMediaIndex] = useState(0);
  const [prompt, setPrompt] = useState("");
  const [isFocused, setIsFocused] = useState(false);



  // Animations
  const floatAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const arrowTranslateX = useRef(new Animated.Value(0)).current;

  // Press Scale Animations for Cards
  const galleryScale = useRef(new Animated.Value(1)).current;
  const filesScale = useRef(new Animated.Value(1)).current;
  const cameraScale = useRef(new Animated.Value(1)).current;
  const continueScale = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    // 1. Floating animation for upload icon
    Animated.loop(
      Animated.sequence([
        Animated.timing(floatAnim, {
          toValue: -8,
          duration: 1800,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(floatAnim, {
          toValue: 0,
          duration: 1800,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    ).start();

    // 2. Subtle pulse animation for upload circle background
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.06,
          duration: 2200,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 2200,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    ).start();

    // 3. Arrow translation animation for continue button
    Animated.loop(
      Animated.sequence([
        Animated.timing(arrowTranslateX, {
          toValue: 5,
          duration: 900,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(arrowTranslateX, {
          toValue: 0,
          duration: 900,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    ).start();

  }, []);



  const handlePressIn = (anim: Animated.Value, toVal = 0.94) => {
    Animated.spring(anim, {
      toValue: toVal,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = (anim: Animated.Value) => {
    Animated.spring(anim, {
      toValue: 1,
      friction: 5,
      useNativeDriver: true,
    }).start();
  };

  const handlePickGallery = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.All,
      allowsEditing: false,
      allowsMultipleSelection: true,
      quality: 1,
    });

    if (!result.canceled && result.assets && result.assets.length > 0) {
      setMedia((prev) => {
        const existingUris = new Set(prev.map(a => a.uri));
        const newAssets = result.assets.filter(a => !existingUris.has(a.uri));
        const updated = [...prev, ...newAssets];
        setActiveMediaIndex(updated.length - 1);
        return updated;
      });
      setMediaSelected(true);
    }
  };

  const handlePickCamera = async () => {
    const permissionResult = await ImagePicker.requestCameraPermissionsAsync();
    
    if (permissionResult.granted === false) {
      alert("You've refused to allow this app to access your camera!");
      return;
    }

    let result = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.All,
      allowsEditing: true,
      quality: 1,
    });

    if (!result.canceled && result.assets && result.assets.length > 0) {
      setMedia((prev) => {
        const updated = [...prev, result.assets[0]];
        setActiveMediaIndex(updated.length - 1);
        return updated;
      });
      setMediaSelected(true);
    }
  };

  const handleRemoveMedia = (index: number) => {
    setMedia((prev) => {
      const newMedia = [...prev];
      newMedia.splice(index, 1);
      if (newMedia.length === 0) {
        setMediaSelected(false);
        setActiveMediaIndex(0);
      } else {
        setActiveMediaIndex(Math.max(0, index - 1));
      }
      return newMedia;
    });
  };

  const handleContinue = () => {
    router.push({
      pathname: "/ai-manual-edit/processing",
      params: { 
        videosData: JSON.stringify(media.map(m => ({ uri: m.uri, duration: m.duration })))
      }
    });
  };



  const handleSuggestionPress = (s: string) => {
    const textWithoutEmoji = s.replace(/[\uE000-\uF8FF]|\uD83C[\uDC00-\uDFFF]|\uD83D[\uDC00-\uDFFF]|[\u2011-\u26FF]|\uD83E[\uDD10-\uDDFF]/g, "").trim();
    setPrompt(prev => {
      const trimmed = prev.trim();
      if (!trimmed) return textWithoutEmoji;
      const separator = trimmed.endsWith(",") || trimmed.endsWith(".") ? " " : ", ";
      return trimmed + separator + textWithoutEmoji;
    });
  };

  const handleTipPress = (prefix: string) => {
    setPrompt(prev => {
      const trimmed = prev.trim();
      const separator = trimmed ? (trimmed.endsWith(",") || trimmed.endsWith(".") || trimmed.endsWith(":") ? " " : ", ") : "";
      return trimmed + separator + prefix;
    });
  };

  // Metadata Extraction Helper
  const getActiveAssetDetails = () => {
    if (media.length === 0 || activeMediaIndex >= media.length) return null;
    const asset = media[activeMediaIndex];
    const durationSec = asset.duration ? (asset.duration / 1000).toFixed(1) : "N/A";
    const res = asset.width && asset.height ? `${asset.width} × ${asset.height}` : "1080 × 1920";
    const size = asset.fileSize ? `${(asset.fileSize / (1024 * 1024)).toFixed(1)} MB` : "14.2 MB";
    const credits = asset.duration ? Math.max(5, Math.ceil((asset.duration / 1000) * 1.5)) : 10;
    
    // Guess file extension / codec
    let codec = "H.264 (AVC)";
    if (asset.uri) {
      const ext = asset.uri.split(".").pop()?.toLowerCase();
      if (ext === "mov" || ext === "heic") codec = "HEVC (H.265)";
    }

    return {
      name: asset.fileName || `Video_${activeMediaIndex + 1}.${asset.uri?.split(".").pop() || "mp4"}`,
      duration: durationSec,
      resolution: res,
      size,
      credits,
      codec,
      fps: "30 FPS",
      uri: asset.uri
    };
  };

  const activeAsset = getActiveAssetDetails();



  return (
    <SafeAreaView edges={["top", "bottom"]} style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Ionicons name="chevron-back" size={20} color={COLORS.primaryDark} />
        </TouchableOpacity>
        <View style={styles.headerTitleContainer}>
          <Text style={styles.headerTitle}>Upload Media</Text>
          <Text style={styles.headerSubtitle}>
            Upload your media and let AI transform it into professional-quality content.
          </Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Media Upload Area */}
        {!mediaSelected ? (
          <View style={styles.uploadCardContainer}>
            <View style={styles.uploadCard}>
              <Animated.View style={[styles.uploadIconCircle, { transform: [{ translateY: floatAnim }, { scale: pulseAnim }] }]}>
                <Ionicons name="cloud-upload" size={38} color={COLORS.primaryBlue} />
              </Animated.View>
              
              <Text style={styles.uploadTitle}>Upload Your Video</Text>
              <Text style={styles.uploadCardSubtitle}>MP4 • MOV • AVI • MKV{"\n"}Maximum 2GB</Text>
              
              <View style={styles.uploadOptions}>
                {/* Gallery Button */}
                <Pressable
                  onPress={handlePickGallery}
                  onPressIn={() => handlePressIn(galleryScale)}
                  onPressOut={() => handlePressOut(galleryScale)}
                  style={{ flex: 1 }}
                >
                  <Animated.View style={[styles.uploadOption, { transform: [{ scale: galleryScale }] }]}>
                    <Ionicons name="images-outline" size={24} color={COLORS.primaryBlue} />
                    <Text style={styles.uploadOptionText}>Gallery</Text>
                  </Animated.View>
                </Pressable>

                {/* Files Button */}
                <Pressable
                  onPress={handlePickGallery}
                  onPressIn={() => handlePressIn(filesScale)}
                  onPressOut={() => handlePressOut(filesScale)}
                  style={{ flex: 1 }}
                >
                  <Animated.View style={[styles.uploadOption, { transform: [{ scale: filesScale }] }]}>
                    <Ionicons name="folder-open-outline" size={24} color={COLORS.primaryBlue} />
                    <Text style={styles.uploadOptionText}>Files</Text>
                  </Animated.View>
                </Pressable>

                {/* Camera Button */}
                <Pressable
                  onPress={handlePickCamera}
                  onPressIn={() => handlePressIn(cameraScale)}
                  onPressOut={() => handlePressOut(cameraScale)}
                  style={{ flex: 1 }}
                >
                  <Animated.View style={[styles.uploadOption, { transform: [{ scale: cameraScale }] }]}>
                    <Ionicons name="camera-outline" size={24} color={COLORS.primaryBlue} />
                    <Text style={styles.uploadOptionText}>Camera</Text>
                  </Animated.View>
                </Pressable>
              </View>
            </View>
          </View>
        ) : (
          /* Premium Preview Layout */
          activeAsset && (
            <View style={styles.previewContainer}>
              <View style={styles.previewCard}>
                {/* Image and basic info */}
                <View style={styles.previewMainRow}>
                  <Image source={{ uri: activeAsset.uri }} style={styles.previewThumbnailLarge} />
                  <View style={styles.previewMetaDetails}>
                    <Text style={styles.previewNameText} numberOfLines={2}>
                      {activeAsset.name}
                    </Text>
                    <View style={styles.previewBadgeRow}>
                      <View style={styles.previewBadge}>
                        <Text style={styles.previewBadgeText}>{activeAsset.duration}s</Text>
                      </View>
                      <View style={styles.previewBadge}>
                        <Text style={styles.previewBadgeText}>{activeAsset.size}</Text>
                      </View>
                    </View>
                    <Text style={styles.previewSpecsText}>
                      {activeAsset.resolution} • {activeAsset.fps}
                    </Text>
                  </View>
                </View>

                {/* Multi-Selection Carousel */}
                {media.length > 1 && (
                  <View style={styles.carouselContainer}>
                    <Text style={styles.carouselTitle}>Selected Clips ({media.length})</Text>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.carouselScroll}>
                      {media.map((item, idx) => {
                        const isActive = idx === activeMediaIndex;
                        return (
                          <TouchableOpacity
                            key={idx}
                            style={[styles.carouselItem, isActive && styles.carouselItemActive]}
                            onPress={() => setActiveMediaIndex(idx)}
                          >
                            <Image source={{ uri: item.uri }} style={styles.carouselThumb} />
                            {isActive && (
                              <View style={styles.carouselItemActiveOverlay}>
                                <Ionicons name="checkmark-circle" size={18} color={COLORS.white} />
                              </View>
                            )}
                          </TouchableOpacity>
                        );
                      })}
                    </ScrollView>
                  </View>
                )}

                {/* Buttons Row */}
                <View style={styles.previewActionsRow}>
                  <TouchableOpacity style={styles.previewActionBtn} onPress={handlePickGallery}>
                    <Ionicons name="sync-outline" size={18} color={COLORS.primaryBlue} />
                    <Text style={styles.previewActionText}>Change Media</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[styles.previewActionBtn, styles.previewActionBtnDanger]}
                    onPress={() => handleRemoveMedia(activeMediaIndex)}
                  >
                    <Ionicons name="trash-outline" size={18} color="#FF3B30" />
                    <Text style={[styles.previewActionText, { color: "#FF3B30" }]}>Remove</Text>
                  </TouchableOpacity>
                </View>
              </View>

              {/* Dynamic Metadata Info Card */}
              <View style={styles.infoCard}>
                <Text style={styles.infoCardTitle}>Media Metadata Info</Text>
                <View style={styles.infoGrid}>
                  <View style={styles.infoGridItem}>
                    <Text style={styles.infoGridLabel}>Length</Text>
                    <Text style={styles.infoGridVal}>{activeAsset.duration}s</Text>
                  </View>
                  <View style={styles.infoGridItem}>
                    <Text style={styles.infoGridLabel}>Resolution</Text>
                    <Text style={styles.infoGridVal}>{activeAsset.resolution}</Text>
                  </View>
                  <View style={styles.infoGridItem}>
                    <Text style={styles.infoGridLabel}>FPS</Text>
                    <Text style={styles.infoGridVal}>{activeAsset.fps}</Text>
                  </View>
                  <View style={styles.infoGridItem}>
                    <Text style={styles.infoGridLabel}>Codec</Text>
                    <Text style={styles.infoGridVal}>{activeAsset.codec}</Text>
                  </View>
                </View>
                <View style={styles.creditsRow}>
                  <Ionicons name="flash-outline" size={16} color={COLORS.primaryBlue} />
                  <Text style={styles.creditsText}>
                    Estimated AI Credits Required: <Text style={{ fontWeight: "700", color: COLORS.primaryDark }}>{activeAsset.credits}</Text>
                  </Text>
                </View>
              </View>
            </View>
          )
        )}

        {/* AI Director Section */}
        <View style={styles.aiSection}>
          <View style={styles.sectionHeader}>
            <View style={styles.aiTitleContainer}>
              <Text style={styles.sparkleIcon}>✨</Text>
              <Text style={styles.sectionTitle}>AI Director</Text>
            </View>
            <Text style={styles.sectionSubtitle}>Describe exactly how AI should edit your video.</Text>
          </View>

          {/* Premium Prompt Input */}
          <View style={[styles.promptInputWrapper, isFocused && styles.promptInputFocused]}>
            <TextInput
              style={styles.promptInput}
              placeholder="Example:\nCreate a cinematic travel edit with smooth camera movement, warm color grading, emotional music, slow-motion highlights and seamless transitions."
              placeholderTextColor={COLORS.placeholder}
              multiline
              textAlignVertical="top"
              maxLength={1000}
              value={prompt}
              onChangeText={setPrompt}
              onFocus={() => setIsFocused(true)}
              onBlur={() => setIsFocused(false)}
            />
            <Text style={styles.charCounter}>{prompt.length} / 1000</Text>
          </View>

          {/* Smart Prompt Suggestions */}
          <Text style={styles.suggestionsTitle}>Smart Suggestions</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.suggestionsScroll}>
            {SUGGESTIONS.map((s, idx) => {
              const cleaned = s.replace(/[\uE000-\uF8FF]|\uD83C[\uDC00-\uDFFF]|\uD83D[\uDC00-\uDFFF]|[\u2011-\u26FF]|\uD83E[\uDD10-\uDDFF]/g, "").trim();
              const isMatched = prompt.toLowerCase().includes(cleaned.toLowerCase());
              return (
                <TouchableOpacity
                  key={idx}
                  onPress={() => handleSuggestionPress(s)}
                  activeOpacity={0.7}
                  style={[styles.suggestionPill, isMatched && styles.suggestionPillActive]}
                >
                  <Text style={[styles.suggestionPillText, isMatched && styles.suggestionPillTextActive]}>{s}</Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>

          {/* AI Tips Card */}
          <View style={styles.tipsCard}>
            <View style={styles.tipsHeader}>
              <Ionicons name="bulb-outline" size={18} color={COLORS.primaryBlue} />
              <Text style={styles.tipsTitle}>AI Tips</Text>
            </View>
            <Text style={styles.tipsSubtitle}>Tap tips to add them to your prompt:</Text>
            <View style={styles.tipsContainer}>
              {TIPS.map((tip, idx) => (
                <TouchableOpacity
                  key={idx}
                  style={styles.tipChip}
                  onPress={() => handleTipPress(tip.text)}
                >
                  <Ionicons name="add" size={14} color={COLORS.primaryBlue} />
                  <Text style={styles.tipChipText}>{tip.name}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Sticky Bottom Bar with Continue Action */}
      <View style={styles.bottomBar}>
        <Animated.View style={{ transform: [{ scale: continueScale }] }}>
          <Pressable
            disabled={!mediaSelected}
            onPress={handleContinue}
            onPressIn={() => mediaSelected && handlePressIn(continueScale, 0.97)}
            onPressOut={() => mediaSelected && handlePressOut(continueScale)}
          >
            {({ pressed }) =>
              !mediaSelected ? (
                <View style={[styles.continueBtn, styles.continueBtnDisabled]}>
                  <Text style={[styles.continueBtnText, { color: COLORS.white }]}>Continue</Text>
                  <Ionicons name="arrow-forward" size={18} color={COLORS.white} />
                </View>
              ) : (
                <LinearGradient
                  colors={["#3B6CE7", "#8CC8E8"]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={styles.continueBtn}
                >
                  <Text style={styles.continueBtnText}>Continue</Text>
                  <Animated.View style={{ transform: [{ translateX: arrowTranslateX }] }}>
                    <Ionicons name="arrow-forward" size={18} color={COLORS.white} />
                  </Animated.View>
                </LinearGradient>
              )
            }
          </Pressable>
        </Animated.View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    flexDirection: "row",
    alignItems: "flex-start",
    paddingHorizontal: 24,
    marginTop: 16,
    marginBottom: 16,
  },
  backBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: COLORS.white,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: COLORS.borderLight,
    marginRight: 16,
    shadowColor: COLORS.shadowColor,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.5,
    shadowRadius: 8,
    elevation: 3,
  },
  headerTitleContainer: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: "800",
    color: COLORS.primaryDark,
    letterSpacing: -0.5,
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 14,
    lineHeight: 20,
    color: COLORS.textSecondary,
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingBottom: 40,
  },
  uploadCardContainer: {
    marginBottom: 28,
  },
  uploadCard: {
    backgroundColor: COLORS.white,
    borderRadius: 28,
    padding: 32,
    alignItems: "center",
    shadowColor: COLORS.shadowColor,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.08,
    shadowRadius: 20,
    elevation: 4,
    borderWidth: 1,
    borderColor: COLORS.white,
  },
  uploadIconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: COLORS.lightBlueBg,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
  },
  uploadTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: COLORS.primaryDark,
    marginBottom: 6,
  },
  uploadCardSubtitle: {
    fontSize: 13,
    lineHeight: 18,
    color: COLORS.textSecondary,
    textAlign: "center",
    marginBottom: 28,
  },
  uploadOptions: {
    flexDirection: "row",
    gap: 16,
    width: "100%",
  },
  uploadOption: {
    backgroundColor: COLORS.white,
    borderRadius: 20,
    paddingVertical: 18,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: COLORS.borderLight,
    shadowColor: COLORS.shadowColor,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
    gap: 8,
  },
  uploadOptionText: {
    fontSize: 13,
    fontWeight: "600",
    color: COLORS.primaryDark,
  },
  previewContainer: {
    marginBottom: 28,
    gap: 16,
  },
  previewCard: {
    backgroundColor: COLORS.white,
    borderRadius: 28,
    padding: 20,
    shadowColor: COLORS.shadowColor,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.08,
    shadowRadius: 20,
    elevation: 4,
  },
  previewMainRow: {
    flexDirection: "row",
    gap: 16,
    alignItems: "center",
  },
  previewThumbnailLarge: {
    width: 90,
    height: 120,
    borderRadius: 18,
    backgroundColor: COLORS.primaryDark,
  },
  previewMetaDetails: {
    flex: 1,
    justifyContent: "center",
  },
  previewNameText: {
    fontSize: 16,
    fontWeight: "700",
    color: COLORS.primaryDark,
    marginBottom: 8,
  },
  previewBadgeRow: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 8,
  },
  previewBadge: {
    backgroundColor: COLORS.lightBlueBg,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
  },
  previewBadgeText: {
    fontSize: 11,
    fontWeight: "600",
    color: COLORS.primaryBlue,
  },
  previewSpecsText: {
    fontSize: 12,
    color: COLORS.textSecondary,
  },
  carouselContainer: {
    marginTop: 16,
    borderTopWidth: 1,
    borderTopColor: COLORS.borderLight,
    paddingTop: 16,
  },
  carouselTitle: {
    fontSize: 13,
    fontWeight: "600",
    color: COLORS.textSecondary,
    marginBottom: 10,
  },
  carouselScroll: {
    gap: 12,
  },
  carouselItem: {
    width: 60,
    height: 80,
    borderRadius: 12,
    overflow: "hidden",
    position: "relative",
    borderWidth: 2,
    borderColor: "transparent",
  },
  carouselItemActive: {
    borderColor: COLORS.primaryBlue,
  },
  carouselThumb: {
    width: "100%",
    height: "100%",
  },
  carouselItemActiveOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(59, 108, 231, 0.4)",
    alignItems: "center",
    justifyContent: "center",
  },
  previewActionsRow: {
    flexDirection: "row",
    gap: 12,
    marginTop: 16,
  },
  previewActionBtn: {
    flex: 1,
    flexDirection: "row",
    height: 46,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    backgroundColor: COLORS.white,
  },
  previewActionBtnDanger: {
    borderColor: "rgba(255, 59, 48, 0.2)",
    backgroundColor: "rgba(255, 59, 48, 0.03)",
  },
  previewActionText: {
    fontSize: 13,
    fontWeight: "600",
    color: COLORS.primaryBlue,
  },
  infoCard: {
    backgroundColor: COLORS.white,
    borderRadius: 24,
    padding: 20,
    shadowColor: COLORS.shadowColor,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 12,
    elevation: 2,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
  },
  infoCardTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: COLORS.primaryDark,
    marginBottom: 14,
  },
  infoGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
    marginBottom: 16,
  },
  infoGridItem: {
    width: "47%",
    backgroundColor: COLORS.lightBlueBg,
    borderRadius: 14,
    padding: 12,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
  },
  infoGridLabel: {
    fontSize: 11,
    color: COLORS.textSecondary,
    marginBottom: 4,
  },
  infoGridVal: {
    fontSize: 14,
    fontWeight: "700",
    color: COLORS.primaryDark,
  },
  creditsRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    borderTopWidth: 1,
    borderTopColor: COLORS.borderLight,
    paddingTop: 12,
  },
  creditsText: {
    fontSize: 12,
    color: COLORS.textSecondary,
  },
  aiSection: {
    gap: 16,
    marginBottom: 20,
  },
  sectionHeader: {
    gap: 4,
  },
  aiTitleContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  sparkleIcon: {
    fontSize: 18,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: COLORS.primaryDark,
  },
  sectionSubtitle: {
    fontSize: 13,
    color: COLORS.textSecondary,
  },
  promptInputWrapper: {
    backgroundColor: COLORS.white,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
    padding: 18,
    minHeight: 160,
    position: "relative",
    shadowColor: COLORS.shadowColor,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.04,
    shadowRadius: 10,
    elevation: 1,
  },
  promptInputFocused: {
    borderColor: COLORS.primaryBlue,
  },
  promptInput: {
    flex: 1,
    fontSize: 14,
    lineHeight: 22,
    color: COLORS.primaryDark,
    paddingBottom: 20,
  },
  charCounter: {
    position: "absolute",
    bottom: 12,
    right: 18,
    fontSize: 11,
    color: COLORS.placeholder,
    fontWeight: "500",
  },
  suggestionsTitle: {
    fontSize: 13,
    fontWeight: "600",
    color: COLORS.textSecondary,
    marginTop: 4,
    marginBottom: -4,
  },
  suggestionsScroll: {
    gap: 8,
    paddingVertical: 4,
  },
  suggestionPill: {
    backgroundColor: COLORS.white,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 24,
    borderWidth: 1.2,
    borderColor: COLORS.primaryBlue,
    shadowColor: COLORS.shadowColor,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
  },
  suggestionPillActive: {
    backgroundColor: "rgba(59, 108, 231, 0.08)",
    borderWidth: 2,
  },
  suggestionPillText: {
    fontSize: 13,
    fontWeight: "600",
    color: COLORS.primaryBlue,
  },
  suggestionPillTextActive: {
    fontWeight: "700",
  },
  tipsCard: {
    backgroundColor: COLORS.white,
    borderRadius: 24,
    padding: 20,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
    shadowColor: COLORS.shadowColor,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.04,
    shadowRadius: 10,
    elevation: 1,
  },
  tipsHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 4,
  },
  tipsTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: COLORS.primaryDark,
  },
  tipsSubtitle: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginBottom: 14,
  },
  tipsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  tipChip: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.lightBlueBg,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
    borderRadius: 14,
    paddingHorizontal: 12,
    paddingVertical: 8,
    gap: 4,
  },
  tipChipText: {
    fontSize: 12,
    fontWeight: "600",
    color: COLORS.primaryBlue,
  },
  bottomBar: {
    paddingHorizontal: 24,
    paddingVertical: 20,
    backgroundColor: COLORS.background,
  },
  continueBtn: {
    height: 60,
    borderRadius: 22,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    shadowColor: COLORS.primaryBlue,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 4,
  },
  continueBtnDisabled: {
    backgroundColor: COLORS.disabledBlue,
    shadowOpacity: 0,
    elevation: 0,
  },
  continueBtnText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: "700",
    letterSpacing: -0.2,
  },
  uploadProgressContainer: {
    backgroundColor: COLORS.white,
    borderRadius: 24,
    padding: 20,
    shadowColor: COLORS.shadowColor,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 3,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
  },
  progressTextRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  uploadLabelRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  uploadingText: {
    fontSize: 14,
    fontWeight: "700",
    color: COLORS.primaryDark,
  },
  percentageText: {
    fontSize: 14,
    fontWeight: "800",
    color: COLORS.primaryBlue,
  },
  progressBarBg: {
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.lightBlueBg,
    overflow: "hidden",
    marginBottom: 12,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
  },
  progressBarFill: {
    height: "100%",
    backgroundColor: COLORS.primaryBlue,
    borderRadius: 4,
  },
  progressFooterRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  remainingText: {
    fontSize: 12,
    color: COLORS.textSecondary,
  },
  cancelBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 10,
    backgroundColor: "rgba(255, 59, 48, 0.08)",
  },
  cancelBtnText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#FF3B30",
  },
  uploadingIconAnim: {
    // animation placeholder
  }
});
