import React, { useState, useRef } from "react";
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
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import * as ImagePicker from "expo-image-picker";

const SUGGESTIONS = [
  "Cinematic", "Travel", "Vlog", "YouTube", "Instagram Reel",
  "Product Ad", "Podcast", "Gaming", "Corporate", "Luxury",
  "Documentary", "Food", "Fashion"
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
  surface: "rgba(255, 255, 255, 0.12)",
};

export default function AIUploadMediaPage() {
  const router = useRouter();
  const [mediaSelected, setMediaSelected] = useState(false);
  const [media, setMedia] = useState<ImagePicker.ImagePickerAsset[]>([]);
  const [prompt, setPrompt] = useState("");
  const [isFocused, setIsFocused] = useState(false);
  const [selectedChips, setSelectedChips] = useState<string[]>([]);

  // Animations
  const uploadScale = useRef(new Animated.Value(1)).current;
  const continueScale = useRef(new Animated.Value(1)).current;

  const handlePressIn = (anim: Animated.Value) => {
    Animated.spring(anim, {
      toValue: 0.97,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = (anim: Animated.Value) => {
    Animated.spring(anim, {
      toValue: 1,
      useNativeDriver: true,
    }).start();
  };

  const handlePickGallery = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.All,
      allowsEditing: false, // Must be false for multiple selection on some platforms
      allowsMultipleSelection: true,
      quality: 1,
    });

    if (!result.canceled && result.assets && result.assets.length > 0) {
      setMedia((prev) => {
        // Filter out duplicates based on URI to avoid issues if user selects the same video again
        const existingUris = new Set(prev.map(a => a.uri));
        const newAssets = result.assets.filter(a => !existingUris.has(a.uri));
        return [...prev, ...newAssets];
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
      setMedia((prev) => [...prev, result.assets[0]]);
      setMediaSelected(true);
    }
  };

  const handleRemoveMedia = (index: number) => {
    setMedia((prev) => {
      const newMedia = [...prev];
      newMedia.splice(index, 1);
      if (newMedia.length === 0) setMediaSelected(false);
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

  const toggleChip = (chip: string) => {
    if (selectedChips.includes(chip)) {
      setSelectedChips(selectedChips.filter(c => c !== chip));
    } else {
      setSelectedChips([...selectedChips, chip]);
    }
  };

  return (
    <SafeAreaView edges={["top", "bottom"]} style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Ionicons name="chevron-back" size={20} color={COLORS.primaryDark} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Upload Media</Text>
      </View>
      <Text style={styles.headerSubtitle}>
        Upload your media and tell AI how you want it edited.
      </Text>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Media Upload Area */}
        {!mediaSelected ? (
          <Animated.View style={[styles.uploadCard, { transform: [{ scale: uploadScale }] }]}>
            <TouchableOpacity 
              style={styles.uploadContent}
              activeOpacity={1}
              onPressIn={() => handlePressIn(uploadScale)}
              onPressOut={() => handlePressOut(uploadScale)}
            >
              <View style={styles.uploadIconCircle}>
                <Ionicons name="cloud-upload-outline" size={36} color={COLORS.primaryBlue} />
              </View>
              <Text style={styles.uploadTitle}>Select media to edit</Text>
              <Text style={styles.uploadSubtitle}>MP4, MOV up to 2GB</Text>
              
              <View style={styles.uploadOptions}>
                <Pressable 
                  style={({ pressed }) => [styles.uploadOption, pressed && styles.uploadOptionPressed]} 
                  onPress={handlePickGallery}
                >
                  {({ pressed }) => (
                    <>
                      <Ionicons name="images-outline" size={24} color={pressed ? COLORS.white : COLORS.primaryBlue} />
                      <Text style={[styles.uploadOptionText, pressed && { color: COLORS.white }]}>Gallery</Text>
                    </>
                  )}
                </Pressable>
                <Pressable 
                  style={({ pressed }) => [styles.uploadOption, pressed && styles.uploadOptionPressed]} 
                  onPress={handlePickGallery}
                >
                  {({ pressed }) => (
                    <>
                      <Ionicons name="folder-outline" size={24} color={pressed ? COLORS.white : COLORS.primaryBlue} />
                      <Text style={[styles.uploadOptionText, pressed && { color: COLORS.white }]}>Files</Text>
                    </>
                  )}
                </Pressable>
                <Pressable 
                  style={({ pressed }) => [styles.uploadOption, pressed && styles.uploadOptionPressed]} 
                  onPress={handlePickCamera}
                >
                  {({ pressed }) => (
                    <>
                      <Ionicons name="camera-outline" size={24} color={pressed ? COLORS.white : COLORS.primaryBlue} />
                      <Text style={[styles.uploadOptionText, pressed && { color: COLORS.white }]}>Camera</Text>
                    </>
                  )}
                </Pressable>
              </View>
            </TouchableOpacity>
          </Animated.View>
        ) : (
          <View style={[styles.previewCard, { flexDirection: 'column', alignItems: 'stretch' }]}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
              <Text style={{ color: COLORS.white, fontSize: 16, fontWeight: '600' }}>
                Selected Media ({media.length})
              </Text>
              <TouchableOpacity onPress={handlePickGallery} style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.surface, paddingHorizontal: 12, paddingVertical: 6, borderRadius: 16 }}>
                <Ionicons name="add" size={16} color={COLORS.primaryBlue} />
                <Text style={{ color: COLORS.primaryBlue, fontSize: 13, marginLeft: 4, fontWeight: '500' }}>Add More</Text>
              </TouchableOpacity>
            </View>
            
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 12, paddingBottom: 8 }}>
              {media.map((item, index) => (
                <View key={`${item.uri}-${index}`} style={{ width: 120, position: 'relative' }}>
                  <Image source={{ uri: item.uri }} style={{ width: 120, height: 160, borderRadius: 12, backgroundColor: COLORS.primaryDark }} />
                  <View style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: 8, backgroundColor: 'rgba(0,0,0,0.5)', borderBottomLeftRadius: 12, borderBottomRightRadius: 12 }}>
                    <Text style={{ color: COLORS.white, fontSize: 10 }} numberOfLines={1}>
                      {item.fileName || `Video ${index + 1}`}
                    </Text>
                    <Text style={{ color: 'rgba(255,255,255,0.7)', fontSize: 9 }}>
                      {item.duration ? `${(item.duration / 1000).toFixed(1)}s` : ''}
                    </Text>
                  </View>
                  <TouchableOpacity 
                    style={{ position: 'absolute', top: -6, right: -6, backgroundColor: COLORS.primaryDark, borderRadius: 12, width: 24, height: 24, alignItems: 'center', justifyContent: 'center', borderWidth: 2, borderColor: COLORS.background }}
                    onPress={() => handleRemoveMedia(index)}
                  >
                    <Ionicons name="close" size={14} color={COLORS.white} />
                  </TouchableOpacity>
                </View>
              ))}
            </ScrollView>
          </View>
        )}

        {/* AI Prompt Section */}
        <View style={styles.promptSection}>
          <View style={styles.promptTitleContainer}>
            <Ionicons name="sparkles" size={20} color={COLORS.primaryBlue} />
            <Text style={styles.promptTitle}>AI Instructions</Text>
          </View>
          
          <View style={[styles.promptInputWrapper, isFocused && styles.promptInputWrapperFocused]}>
            <TextInput
              style={styles.promptInput}
              placeholder="Describe how you'd like AI to edit your video..."
              placeholderTextColor={COLORS.placeholder}
              multiline
              textAlignVertical="top"
              value={prompt}
              onChangeText={setPrompt}
              onFocus={() => setIsFocused(true)}
              onBlur={() => setIsFocused(false)}
            />
          </View>
          
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.suggestionsScroll}>
            {SUGGESTIONS.map((s, i) => {
              const isSelected = selectedChips.includes(s);
              return (
                <Pressable 
                  key={i} 
                  onPress={() => toggleChip(s)}
                  style={({ pressed }) => [
                    styles.suggestionChip,
                    isSelected && styles.suggestionChipSelected,
                    pressed && !isSelected && { backgroundColor: COLORS.background },
                    pressed && isSelected && { backgroundColor: COLORS.primaryDark, borderColor: COLORS.primaryDark }
                  ]}
                >
                  <Text style={[styles.suggestionText, isSelected && styles.suggestionTextSelected]}>{s}</Text>
                </Pressable>
              );
            })}
          </ScrollView>
        </View>
      </ScrollView>

      {/* Sticky Button */}
      <View style={styles.bottomBar}>
        <Animated.View style={{ transform: [{ scale: continueScale }] }}>
          <Pressable
            style={({ pressed }) => [
              styles.continueBtn,
              !mediaSelected && styles.continueBtnDisabled,
              pressed && mediaSelected && { backgroundColor: COLORS.primaryDark }
            ]}
            disabled={!mediaSelected}
            onPress={handleContinue}
            onPressIn={() => mediaSelected && handlePressIn(continueScale)}
            onPressOut={() => mediaSelected && handlePressOut(continueScale)}
          >
            <Text style={styles.continueBtnText}>Continue</Text>
            <Ionicons name="arrow-forward" size={18} color={COLORS.white} />
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
    alignItems: "center",
    paddingHorizontal: 20,
    marginTop: 10,
    marginBottom: 8,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.white,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: COLORS.primaryBlue,
    marginRight: 16,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "800",
    color: COLORS.primaryDark,
  },
  headerSubtitle: {
    fontSize: 14,
    paddingHorizontal: 20,
    marginBottom: 24,
    lineHeight: 20,
    color: COLORS.textSecondary,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  uploadCard: {
    backgroundColor: COLORS.white,
    borderRadius: 24,
    borderWidth: 1.5,
    borderColor: COLORS.secondaryBlue,
    borderStyle: "dashed",
    marginBottom: 32,
    shadowColor: COLORS.primaryBlue,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 2,
  },
  uploadContent: {
    padding: 24,
    alignItems: "center",
  },
  uploadIconCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: COLORS.background,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
  },
  uploadTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: COLORS.primaryDark,
    marginBottom: 8,
  },
  uploadSubtitle: {
    fontSize: 13,
    color: COLORS.textSecondary,
    marginBottom: 24,
  },
  uploadOptions: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 16,
  },
  uploadOption: {
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 16,
  },
  uploadOptionPressed: {
    backgroundColor: COLORS.primaryBlue,
  },
  uploadOptionText: {
    fontSize: 12,
    fontWeight: "600",
    color: COLORS.primaryDark,
  },
  previewCard: {
    flexDirection: "row",
    padding: 16,
    backgroundColor: COLORS.white,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: COLORS.secondaryBlue,
    marginBottom: 32,
    shadowColor: COLORS.primaryBlue,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 2,
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
    color: COLORS.primaryDark,
    marginBottom: 4,
  },
  previewMeta: {
    fontSize: 13,
    color: COLORS.textSecondary,
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
    color: COLORS.primaryBlue,
  },
  promptSection: {
    marginBottom: 24,
  },
  promptTitleContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 16,
  },
  promptTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: COLORS.primaryDark,
  },
  promptInputWrapper: {
    backgroundColor: COLORS.white,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: COLORS.secondaryBlue,
    padding: 20,
    minHeight: 140,
    marginBottom: 16,
  },
  promptInputWrapperFocused: {
    borderColor: COLORS.primaryBlue,
  },
  promptInput: {
    flex: 1,
    fontSize: 15,
    lineHeight: 22,
    color: COLORS.primaryDark,
  },
  suggestionsScroll: {
    gap: 8,
    paddingRight: 20,
  },
  suggestionChip: {
    backgroundColor: COLORS.white,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: COLORS.secondaryBlue,
  },
  suggestionChipSelected: {
    backgroundColor: COLORS.primaryBlue,
    borderColor: COLORS.primaryBlue,
  },
  suggestionText: {
    fontSize: 13,
    fontWeight: "600",
    color: COLORS.primaryDark,
  },
  suggestionTextSelected: {
    color: COLORS.white,
  },
  bottomBar: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: COLORS.background,
  },
  continueBtn: {
    backgroundColor: COLORS.primaryBlue,
    height: 56,
    borderRadius: 20,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    shadowColor: COLORS.primaryBlue,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 5,
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
  },
});
