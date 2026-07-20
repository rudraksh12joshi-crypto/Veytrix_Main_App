import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Animated,
  Image,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { BlurView } from "expo-blur";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { useTheme } from "@/src/theme";
import * as ImagePicker from "expo-image-picker";

const SUGGESTIONS = [
  "Cinematic", "Viral Reel", "Travel", "Vlog",
  "Product Ad", "Business", "Podcast", "YouTube", "Instagram"
];

export default function AIUploadMediaPage() {
  const { theme } = useTheme();
  const router = useRouter();
  const [mediaSelected, setMediaSelected] = useState(false);
  const [media, setMedia] = useState<ImagePicker.ImagePickerAsset | null>(null);
  const [prompt, setPrompt] = useState("");

  const handlePickGallery = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.All,
      allowsEditing: true,
      quality: 1,
    });

    if (!result.canceled && result.assets && result.assets.length > 0) {
      setMedia(result.assets[0]);
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
      setMedia(result.assets[0]);
      setMediaSelected(true);
    }
  };

  const handleRemoveMedia = () => {
    setMediaSelected(false);
    setMedia(null);
  };

  const handleContinue = () => {
    router.push({
      pathname: "/ai-manual-edit/processing",
      params: { 
        videoUri: media?.uri, 
        duration: media?.duration 
      }
    });
  };

  return (
    <SafeAreaView edges={["top", "bottom"]} style={[styles.container, { backgroundColor: theme.colors.background }]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={[styles.backBtn, { backgroundColor: theme.colors.surfaceElevated, borderColor: theme.colors.border }]} onPress={() => router.back()}>
          <Ionicons name="chevron-back" size={20} color={theme.colors.textPrimary} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: theme.colors.textPrimary }]}>Upload Media</Text>
      </View>
      <Text style={[styles.headerSubtitle, { color: theme.colors.textSecondary }]}>
        Upload your media and tell AI how you want it edited.
      </Text>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Media Upload Area */}
        {!mediaSelected ? (
          <View style={styles.uploadCard}>
            <LinearGradient colors={["rgba(124, 92, 255, 0.15)", "rgba(124, 92, 255, 0.05)"]} style={StyleSheet.absoluteFillObject} />
            <View style={styles.uploadContent}>
              <View style={styles.uploadIconCircle}>
                <Ionicons name="cloud-upload-outline" size={36} color="#7C5CFF" />
              </View>
              <Text style={[styles.uploadTitle, { color: theme.colors.textPrimary }]}>Select media to edit</Text>
              <Text style={[styles.uploadSubtitle, { color: theme.colors.textSecondary }]}>MP4, MOV up to 2GB</Text>
              
              <View style={styles.uploadOptions}>
                <TouchableOpacity style={styles.uploadOption} onPress={handlePickGallery}>
                  <Ionicons name="images-outline" size={24} color={theme.colors.primary} />
                  <Text style={[styles.uploadOptionText, { color: theme.colors.textPrimary }]}>Gallery</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.uploadOption} onPress={handlePickGallery}>
                  <Ionicons name="folder-outline" size={24} color={theme.colors.primary} />
                  <Text style={[styles.uploadOptionText, { color: theme.colors.textPrimary }]}>Files</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.uploadOption} onPress={handlePickCamera}>
                  <Ionicons name="camera-outline" size={24} color={theme.colors.primary} />
                  <Text style={[styles.uploadOptionText, { color: theme.colors.textPrimary }]}>Camera</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        ) : (
          <View style={[styles.previewCard, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}>
            {media?.uri ? (
              <Image source={{ uri: media.uri }} style={styles.previewThumbnail} />
            ) : (
              <LinearGradient colors={["#2C1A5C", "#0A0A0B"]} style={styles.previewThumbnail}>
                <Ionicons name="play-circle" size={32} color="rgba(255,255,255,0.7)" />
              </LinearGradient>
            )}
            <View style={styles.previewInfo}>
              <Text style={[styles.previewName, { color: theme.colors.textPrimary }]} numberOfLines={1}>
                {media?.fileName || media?.uri?.split('/').pop() || "Selected Media"}
              </Text>
              <Text style={[styles.previewMeta, { color: theme.colors.textSecondary }]}>
                {media?.duration ? `${(media.duration / 1000).toFixed(1)}s` : 'Video'} • {media?.fileSize ? `${(media.fileSize / (1024 * 1024)).toFixed(1)} MB` : 'Media Ready'}
              </Text>
              <TouchableOpacity style={styles.replaceBtn} onPress={handleRemoveMedia}>
                <Ionicons name="refresh-outline" size={14} color={theme.colors.primary} />
                <Text style={[styles.replaceBtnText, { color: theme.colors.primary }]}>Replace Media</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* AI Prompt Section */}
        <View style={styles.promptSection}>
          <Text style={styles.promptTitle}>✨ AI Instructions</Text>
          <View style={[styles.promptInputWrapper, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}>
            <TextInput
              style={[styles.promptInput, { color: theme.colors.textPrimary }]}
              placeholder="Describe how you'd like AI to edit your video..."
              placeholderTextColor={theme.colors.textMuted}
              multiline
              textAlignVertical="top"
              value={prompt}
              onChangeText={setPrompt}
            />
          </View>
          
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.suggestionsScroll}>
            {SUGGESTIONS.map((s, i) => (
              <TouchableOpacity key={i} style={[styles.suggestionChip, { backgroundColor: theme.colors.surfaceElevated, borderColor: theme.colors.border }]}>
                <Text style={[styles.suggestionText, { color: theme.colors.textPrimary }]}>{s}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      </ScrollView>

      {/* Sticky Button */}
      <View style={[styles.bottomBar, { borderTopColor: theme.colors.border, backgroundColor: theme.colors.background }]}>
        <TouchableOpacity
          style={[styles.continueBtn, { opacity: mediaSelected ? 1 : 0.5 }]}
          disabled={!mediaSelected}
          onPress={handleContinue}
          activeOpacity={0.8}
        >
          <LinearGradient colors={["#8B6BFF", "#FF3B8B"]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.continueBtnBg}>
            <Text style={styles.continueBtnText}>Continue</Text>
            <Ionicons name="arrow-forward" size={18} color="#fff" />
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    marginTop: 10,
    marginBottom: 8,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    marginRight: 16,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "800",
  },
  headerSubtitle: {
    fontSize: 14,
    paddingHorizontal: 20,
    marginBottom: 24,
    lineHeight: 20,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  uploadCard: {
    height: 240,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: "rgba(124, 92, 255, 0.3)",
    overflow: "hidden",
    borderStyle: "dashed",
    marginBottom: 32,
  },
  uploadContent: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  uploadIconCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: "rgba(124, 92, 255, 0.1)",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
  },
  uploadTitle: {
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 8,
  },
  uploadSubtitle: {
    fontSize: 13,
    marginBottom: 24,
  },
  uploadOptions: {
    flexDirection: "row",
    gap: 24,
  },
  uploadOption: {
    alignItems: "center",
    gap: 6,
  },
  uploadOptionText: {
    fontSize: 12,
    fontWeight: "500",
  },
  previewCard: {
    flexDirection: "row",
    padding: 16,
    borderRadius: 20,
    borderWidth: 1,
    marginBottom: 32,
  },
  previewThumbnail: {
    width: 80,
    height: 80,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
  },
  previewInfo: {
    flex: 1,
    justifyContent: "center",
  },
  previewName: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 4,
  },
  previewMeta: {
    fontSize: 13,
    marginBottom: 12,
  },
  replaceBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  replaceBtnText: {
    fontSize: 13,
    fontWeight: "600",
  },
  promptSection: {
    marginBottom: 24,
  },
  promptTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#FF3B8B",
    marginBottom: 16,
  },
  promptInputWrapper: {
    borderRadius: 20,
    borderWidth: 1,
    padding: 16,
    minHeight: 140,
    marginBottom: 16,
  },
  promptInput: {
    fontSize: 15,
    lineHeight: 22,
  },
  suggestionsScroll: {
    gap: 8,
    paddingRight: 20,
  },
  suggestionChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
  },
  suggestionText: {
    fontSize: 13,
    fontWeight: "500",
  },
  bottomBar: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  continueBtn: {
    borderRadius: 16,
    overflow: "hidden",
  },
  continueBtnBg: {
    height: 56,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
  },
  continueBtnText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "700",
  },
});
