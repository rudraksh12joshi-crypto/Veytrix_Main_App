import React, { useRef, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  PanResponder,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import {
  AudioSettings,
  DEFAULT_AUDIO_SETTINGS,
  PitchPreset,
} from "../types/editor.types";

interface AudioPanelProps {
  audio?: AudioSettings;
  onUpdateAudio: (updates: Partial<AudioSettings>) => void;
  onClose: () => void;
  bottomInset?: number;
}

interface SliderItemProps {
  label: string;
  value: number;
  min: number;
  max: number;
  unit?: string;
  step?: number;
  icon?: string;
  onChange: (val: number) => void;
}

function CustomAudioSlider({
  label,
  value,
  min,
  max,
  unit = "",
  step = 1,
  icon,
  onChange,
}: SliderItemProps) {
  const trackWidthRef = useRef(260);

  const percentage = Math.max(
    0,
    Math.min(100, ((value - min) / (max - min)) * 100)
  );

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderGrant: (e) => {
        const locationX = e.nativeEvent.locationX;
        const ratio = Math.max(0, Math.min(1, locationX / (trackWidthRef.current || 260)));
        const rawVal = min + ratio * (max - min);
        const newVal = Math.round(rawVal / step) * step;
        onChange(Number(newVal.toFixed(1)));
      },
      onPanResponderMove: (_, gestureState) => {
        const currentRatio = (value - min) / (max - min);
        const ratio = Math.max(
          0,
          Math.min(1, currentRatio + gestureState.dx / (trackWidthRef.current || 260))
        );
        const rawVal = min + ratio * (max - min);
        const newVal = Math.round(rawVal / step) * step;
        onChange(Number(newVal.toFixed(1)));
      },
    })
  ).current;

  return (
    <View style={styles.sliderRow}>
      <View style={styles.sliderHeader}>
        <View style={styles.labelGroup}>
          {icon && (
            <Ionicons name={icon as any} size={15} color="#A0A0A0" style={{ marginRight: 6 }} />
          )}
          <Text style={styles.controlLabel}>{label}</Text>
        </View>
        <Text style={[styles.valueText, value !== min && styles.valueTextActive]}>
          {value > 0 && min < 0 ? `+${value}` : `${value}`}{unit}
        </Text>
      </View>

      <View
        style={styles.sliderContainer}
        onLayout={(e) => {
          trackWidthRef.current = e.nativeEvent.layout.width;
        }}
      >
        <View style={styles.sliderTrack} {...panResponder.panHandlers}>
          {min < 0 && <View style={styles.zeroLine} />}
          <View
            style={[
              styles.sliderFill,
              min < 0
                ? {
                    left: `${Math.min(50, percentage)}%`,
                    width: `${Math.abs(percentage - 50)}%`,
                    backgroundColor: value < 0 ? "#00E5FF" : "#FFCC00",
                  }
                : {
                    left: "0%",
                    width: `${percentage}%`,
                    backgroundColor: "#FFCC00",
                  },
            ]}
          />
          <View
            style={[
              styles.sliderThumb,
              {
                left: `${percentage}%`,
                borderColor: "#FFCC00",
              },
            ]}
          />
        </View>
      </View>
    </View>
  );
}

const PITCH_PRESETS: { id: PitchPreset; label: string; icon: string }[] = [
  { id: "original", label: "Original", icon: "disc-outline" },
  { id: "male", label: "Male Voice", icon: "man-outline" },
  { id: "female", label: "Female Voice", icon: "woman-outline" },
  { id: "deep", label: "Deep Voice", icon: "thunderstorm-outline" },
  { id: "chipmunk", label: "Chipmunk", icon: "happy-outline" },
];

const NOISE_PRESETS: { id: "fan" | "wind" | "hum" | "ac"; label: string; icon: string }[] = [
  { id: "fan", label: "Fan Noise", icon: "sync-outline" },
  { id: "wind", label: "Wind Noise", icon: "cloudy-outline" },
  { id: "hum", label: "Electrical Hum", icon: "flash-outline" },
  { id: "ac", label: "AC Noise", icon: "snow-outline" },
];

export function AudioPanel({
  audio = DEFAULT_AUDIO_SETTINGS,
  onUpdateAudio,
  onClose,
  bottomInset = 20,
}: AudioPanelProps) {
  const [activeTab, setActiveTab] = useState<"main" | "equalizer" | "noise" | "pitch">("main");

  const currentAudio = { ...DEFAULT_AUDIO_SETTINGS, ...audio };

  const isModified =
    currentAudio.volume !== 100 ||
    currentAudio.muted ||
    currentAudio.fadeIn > 0 ||
    currentAudio.fadeOut > 0 ||
    currentAudio.balance !== 0 ||
    currentAudio.pitch !== "original" ||
    currentAudio.noiseReduction.enabled ||
    currentAudio.voiceIsolation.enabled;

  const handleResetAll = () => {
    onUpdateAudio({ ...DEFAULT_AUDIO_SETTINGS });
  };

  const handleUpdateEq = (band: keyof typeof currentAudio.equalizer, val: number) => {
    onUpdateAudio({
      equalizer: {
        ...currentAudio.equalizer,
        [band]: val,
      },
    });
  };

  const handleUpdateNoise = (updates: Partial<typeof currentAudio.noiseReduction>) => {
    onUpdateAudio({
      noiseReduction: {
        ...currentAudio.noiseReduction,
        ...updates,
      },
    });
  };

  const handleUpdateVoiceIso = (updates: Partial<typeof currentAudio.voiceIsolation>) => {
    onUpdateAudio({
      voiceIsolation: {
        ...currentAudio.voiceIsolation,
        ...updates,
      },
    });
  };

  return (
    <View style={[styles.panel, { paddingBottom: Math.max(bottomInset, 16) }]}>
      {/* Premium Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Ionicons name="volume-high" size={20} color="#FFCC00" style={{ marginRight: 6 }} />
          <Text style={styles.title}>Audio Settings</Text>
          {isModified && (
            <TouchableOpacity style={styles.resetBadge} onPress={handleResetAll} activeOpacity={0.7}>
              <Ionicons name="refresh" size={11} color="#FFCC00" style={{ marginRight: 3 }} />
              <Text style={styles.resetText}>Reset</Text>
            </TouchableOpacity>
          )}
        </View>

        <View style={styles.headerRight}>
          <TouchableOpacity style={styles.doneBtn} onPress={onClose} activeOpacity={0.8}>
            <Ionicons name="checkmark" size={15} color="#000" />
            <Text style={styles.doneBtnText}>Done</Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
            <Ionicons name="close-circle" size={24} color="#666" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Tabs Row */}
      <View style={styles.tabsRowWrapper}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.tabsRowContainer}>
          <TouchableOpacity
            style={[styles.tabBtn, activeTab === "main" && styles.tabBtnActive]}
            onPress={() => setActiveTab("main")}
          >
            <Ionicons
              name="volume-high-outline"
              size={13}
              color={activeTab === "main" ? "#FFCC00" : "#8E8E93"}
              style={{ marginRight: 4 }}
            />
            <Text style={[styles.tabText, activeTab === "main" && styles.tabTextActive]}>Controls</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.tabBtn, activeTab === "equalizer" && styles.tabBtnActive]}
            onPress={() => setActiveTab("equalizer")}
          >
            <Ionicons
              name="options-outline"
              size={13}
              color={activeTab === "equalizer" ? "#FFCC00" : "#8E8E93"}
              style={{ marginRight: 4 }}
            />
            <Text style={[styles.tabText, activeTab === "equalizer" && styles.tabTextActive]}>Equalizer</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.tabBtn, activeTab === "noise" && styles.tabBtnActive]}
            onPress={() => setActiveTab("noise")}
          >
            <Ionicons
              name="mic-off-outline"
              size={13}
              color={activeTab === "noise" ? "#FFCC00" : "#8E8E93"}
              style={{ marginRight: 4 }}
            />
            <Text style={[styles.tabText, activeTab === "noise" && styles.tabTextActive]}>Noise & Isolation</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.tabBtn, activeTab === "pitch" && styles.tabBtnActive]}
            onPress={() => setActiveTab("pitch")}
          >
            <Ionicons
              name="musical-notes-outline"
              size={13}
              color={activeTab === "pitch" ? "#FFCC00" : "#8E8E93"}
              style={{ marginRight: 4 }}
            />
            <Text style={[styles.tabText, activeTab === "pitch" && styles.tabTextActive]}>Pitch</Text>
          </TouchableOpacity>
        </ScrollView>
      </View>

      {/* Content Area */}
      <ScrollView style={styles.scrollArea} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {activeTab === "main" && (
          <View style={styles.tabContent}>
            {/* Mute Toggle */}
            <View style={styles.toggleRow}>
              <View style={styles.labelGroup}>
                <Ionicons
                  name={currentAudio.muted ? "volume-mute" : "volume-high"}
                  size={16}
                  color={currentAudio.muted ? "#FF3B30" : "#00E5FF"}
                  style={{ marginRight: 8 }}
                />
                <Text style={styles.toggleLabel}>Mute Audio</Text>
              </View>
              <TouchableOpacity
                style={[styles.switchTrack, currentAudio.muted && styles.switchTrackActive]}
                onPress={() => onUpdateAudio({ muted: !currentAudio.muted })}
                activeOpacity={0.8}
              >
                <View style={[styles.switchThumb, currentAudio.muted && styles.switchThumbActive]} />
              </TouchableOpacity>
            </View>

            {/* Volume Slider (0% - 300%) */}
            <CustomAudioSlider
              label="Volume"
              icon="volume-medium-outline"
              value={currentAudio.volume}
              min={0}
              max={300}
              unit="%"
              step={5}
              onChange={(val) => onUpdateAudio({ volume: val })}
            />

            {/* Fade In (0s - 10s) */}
            <CustomAudioSlider
              label="Fade In"
              icon="trending-up-outline"
              value={Number((currentAudio.fadeIn / 1000).toFixed(1))}
              min={0}
              max={10}
              unit="s"
              step={0.1}
              onChange={(val) => onUpdateAudio({ fadeIn: Math.round(val * 1000) })}
            />

            {/* Fade Out (0s - 10s) */}
            <CustomAudioSlider
              label="Fade Out"
              icon="trending-down-outline"
              value={Number((currentAudio.fadeOut / 1000).toFixed(1))}
              min={0}
              max={10}
              unit="s"
              step={0.1}
              onChange={(val) => onUpdateAudio({ fadeOut: Math.round(val * 1000) })}
            />

            {/* Balance (-100 Left to +100 Right) */}
            <CustomAudioSlider
              label="Stereo Balance"
              icon="swap-horizontal-outline"
              value={currentAudio.balance}
              min={-100}
              max={100}
              unit=""
              step={5}
              onChange={(val) => onUpdateAudio({ balance: val })}
            />
          </View>
        )}

        {activeTab === "equalizer" && (
          <View style={styles.tabContent}>
            <View style={styles.subHeaderRow}>
              <Text style={styles.subTitle}>Frequency Equalizer</Text>
              <TouchableOpacity
                style={styles.resetBadge}
                onPress={() =>
                  onUpdateAudio({
                    equalizer: { bass: 0, mid: 0, treble: 0, voice: 0 },
                  })
                }
              >
                <Ionicons name="refresh" size={11} color="#FFCC00" style={{ marginRight: 3 }} />
                <Text style={styles.resetText}>Reset EQ</Text>
              </TouchableOpacity>
            </View>

            <CustomAudioSlider
              label="Bass"
              icon="hardware-chip-outline"
              value={currentAudio.equalizer.bass}
              min={-100}
              max={100}
              onChange={(val) => handleUpdateEq("bass", val)}
            />

            <CustomAudioSlider
              label="Mid Range"
              icon="options-outline"
              value={currentAudio.equalizer.mid}
              min={-100}
              max={100}
              onChange={(val) => handleUpdateEq("mid", val)}
            />

            <CustomAudioSlider
              label="Treble"
              icon="sparkles-outline"
              value={currentAudio.equalizer.treble}
              min={-100}
              max={100}
              onChange={(val) => handleUpdateEq("treble", val)}
            />

            <CustomAudioSlider
              label="Voice Clarity"
              icon="mic-outline"
              value={currentAudio.equalizer.voice}
              min={-100}
              max={100}
              onChange={(val) => handleUpdateEq("voice", val)}
            />
          </View>
        )}

        {activeTab === "noise" && (
          <View style={styles.tabContent}>
            {/* Noise Reduction */}
            <View style={styles.sectionBox}>
              <View style={styles.toggleRow}>
                <View style={styles.labelGroup}>
                  <Ionicons name="mic-off" size={16} color="#00E5FF" style={{ marginRight: 8 }} />
                  <Text style={styles.toggleLabel}>Noise Reduction</Text>
                </View>
                <TouchableOpacity
                  style={[styles.switchTrack, currentAudio.noiseReduction.enabled && styles.switchTrackActive]}
                  onPress={() => handleUpdateNoise({ enabled: !currentAudio.noiseReduction.enabled })}
                  activeOpacity={0.8}
                >
                  <View style={[styles.switchThumb, currentAudio.noiseReduction.enabled && styles.switchThumbActive]} />
                </TouchableOpacity>
              </View>

              {currentAudio.noiseReduction.enabled && (
                <>
                  <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.presetsRow}>
                    {NOISE_PRESETS.map((preset) => (
                      <TouchableOpacity
                        key={preset.id}
                        style={[
                          styles.presetChip,
                          currentAudio.noiseReduction.preset === preset.id && styles.presetChipActive,
                        ]}
                        onPress={() => handleUpdateNoise({ preset: preset.id })}
                      >
                        <Text
                          style={[
                            styles.presetChipText,
                            currentAudio.noiseReduction.preset === preset.id && styles.presetChipTextActive,
                          ]}
                        >
                          {preset.label}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </ScrollView>

                  <CustomAudioSlider
                    label="Suppression Intensity"
                    value={currentAudio.noiseReduction.intensity}
                    min={0}
                    max={100}
                    unit="%"
                    onChange={(val) => handleUpdateNoise({ intensity: val })}
                  />
                </>
              )}
            </View>

            {/* Voice Isolation */}
            <View style={styles.sectionBox}>
              <View style={styles.toggleRow}>
                <View style={styles.labelGroup}>
                  <Ionicons name="person" size={16} color="#FFCC00" style={{ marginRight: 8 }} />
                  <Text style={styles.toggleLabel}>Voice Isolation</Text>
                </View>
                <TouchableOpacity
                  style={[styles.switchTrack, currentAudio.voiceIsolation.enabled && styles.switchTrackActive]}
                  onPress={() => handleUpdateVoiceIso({ enabled: !currentAudio.voiceIsolation.enabled })}
                  activeOpacity={0.8}
                >
                  <View style={[styles.switchThumb, currentAudio.voiceIsolation.enabled && styles.switchThumbActive]} />
                </TouchableOpacity>
              </View>

              {currentAudio.voiceIsolation.enabled && (
                <CustomAudioSlider
                  label="Vocal Boost"
                  value={currentAudio.voiceIsolation.intensity}
                  min={0}
                  max={100}
                  unit="%"
                  onChange={(val) => handleUpdateVoiceIso({ intensity: val })}
                />
              )}
            </View>
          </View>
        )}

        {activeTab === "pitch" && (
          <View style={styles.tabContent}>
            <View style={styles.pitchGrid}>
              {PITCH_PRESETS.map((preset) => (
                <TouchableOpacity
                  key={preset.id}
                  style={[
                    styles.pitchCard,
                    currentAudio.pitch === preset.id && styles.pitchCardActive,
                  ]}
                  onPress={() => onUpdateAudio({ pitch: preset.id })}
                  activeOpacity={0.8}
                >
                  <Ionicons
                    name={preset.icon as any}
                    size={20}
                    color={currentAudio.pitch === preset.id ? "#FFCC00" : "#8E8E93"}
                    style={{ marginBottom: 4 }}
                  />
                  <Text
                    style={[
                      styles.pitchCardText,
                      currentAudio.pitch === preset.id && styles.pitchCardTextActive,
                    ]}
                  >
                    {preset.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  panel: {
    backgroundColor: "#1C1C1E",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingHorizontal: 20,
    paddingTop: 16,
    height: 310,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 10,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
  },
  headerRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  title: {
    color: "#fff",
    fontSize: 17,
    fontWeight: "700",
  },
  resetBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255,204,0,0.15)",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
    marginLeft: 8,
    borderWidth: 1,
    borderColor: "rgba(255,204,0,0.3)",
  },
  resetText: {
    color: "#FFCC00",
    fontSize: 11,
    fontWeight: "600",
  },
  doneBtn: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFCC00",
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 14,
    gap: 4,
  },
  doneBtnText: {
    color: "#000",
    fontSize: 12,
    fontWeight: "700",
  },
  closeBtn: {
    padding: 2,
  },
  tabsRowWrapper: {
    marginBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255,255,255,0.06)",
    paddingBottom: 8,
  },
  tabsRowContainer: {
    flexDirection: "row",
    gap: 8,
  },
  tabBtn: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    backgroundColor: "rgba(255,255,255,0.04)",
  },
  tabBtnActive: {
    backgroundColor: "rgba(255,204,0,0.15)",
    borderWidth: 1,
    borderColor: "rgba(255,204,0,0.3)",
  },
  tabText: {
    color: "#8E8E93",
    fontSize: 12,
    fontWeight: "500",
  },
  tabTextActive: {
    color: "#FFCC00",
    fontWeight: "700",
  },
  scrollArea: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 24,
  },
  tabContent: {
    gap: 10,
  },
  toggleRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 2,
  },
  labelGroup: {
    flexDirection: "row",
    alignItems: "center",
  },
  toggleLabel: {
    color: "#fff",
    fontSize: 13,
    fontWeight: "600",
  },
  switchTrack: {
    width: 40,
    height: 22,
    borderRadius: 11,
    backgroundColor: "rgba(255,255,255,0.15)",
    padding: 2,
    justifyContent: "center",
  },
  switchTrackActive: {
    backgroundColor: "#FFCC00",
  },
  switchThumb: {
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: "#fff",
  },
  switchThumbActive: {
    alignSelf: "flex-end",
  },
  sliderRow: {
    marginBottom: 4,
  },
  sliderHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 4,
  },
  controlLabel: {
    color: "#D1D1D6",
    fontSize: 12,
    fontWeight: "500",
  },
  valueText: {
    color: "#8E8E93",
    fontSize: 11,
    fontWeight: "600",
    fontVariant: ["tabular-nums"],
  },
  valueTextActive: {
    color: "#FFCC00",
    fontWeight: "700",
  },
  sliderContainer: {
    width: "100%",
    height: 22,
    justifyContent: "center",
  },
  sliderTrack: {
    width: "100%",
    height: 6,
    backgroundColor: "rgba(255,255,255,0.18)",
    borderRadius: 3,
    justifyContent: "center",
    position: "relative",
  },
  zeroLine: {
    position: "absolute",
    left: "50%",
    top: -2,
    width: 2,
    height: 10,
    backgroundColor: "rgba(255,255,255,0.3)",
    borderRadius: 1,
  },
  sliderFill: {
    position: "absolute",
    height: "100%",
    borderRadius: 3,
  },
  sliderThumb: {
    position: "absolute",
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: "#fff",
    marginTop: -6,
    marginLeft: -9,
    borderWidth: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.5,
    shadowRadius: 4,
    elevation: 4,
  },
  subHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 4,
  },
  subTitle: {
    color: "#fff",
    fontSize: 13,
    fontWeight: "700",
  },
  sectionBox: {
    backgroundColor: "rgba(255,255,255,0.03)",
    borderRadius: 12,
    padding: 10,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.06)",
    gap: 6,
  },
  presetsRow: {
    flexDirection: "row",
    gap: 8,
    marginVertical: 2,
  },
  presetChip: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
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
  pitchGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  pitchCard: {
    width: "31%",
    padding: 10,
    backgroundColor: "rgba(255,255,255,0.04)",
    borderRadius: 12,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.06)",
  },
  pitchCardActive: {
    backgroundColor: "rgba(255,204,0,0.15)",
    borderColor: "#FFCC00",
  },
  pitchCardText: {
    color: "#D1D1D6",
    fontSize: 11,
    fontWeight: "600",
    textAlign: "center",
  },
  pitchCardTextActive: {
    color: "#FFCC00",
    fontWeight: "700",
  },
});
