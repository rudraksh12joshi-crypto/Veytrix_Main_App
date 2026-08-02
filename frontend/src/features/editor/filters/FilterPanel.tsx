import React, { useState, useMemo, useRef } from "react";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, PanResponder } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { filterRepository } from "./FilterRepository";
import { filterEngineManager } from "./FilterEngines";
import { FilterCard } from "./FilterCard";
import { FilterItem } from "./FilterTypes";
import { useProjectStore } from "../store";
import { commandManager } from "../commands";
import { ApplyFilterCommand } from "./ApplyFilterCommand";

interface FilterPanelProps {
  onClose: () => void;
  onOpenAdjust?: () => void;
}

export const FilterPanel: React.FC<FilterPanelProps> = ({ onClose, onOpenAdjust }) => {
  const [activeTopTab, setActiveTopTab] = useState<"Filter" | "Adjust">("Filter");
  const [selectedCategory, setSelectedCategory] = useState<string>("Aesthetic");
  const [intensity, setIntensity] = useState<number>(100);

  const trackWidthRef = useRef(260);

  const videoClips = useProjectStore((s) => s.videoClips);
  const selectedClipId = useProjectStore((s) => s.selectedClipId);
  const setVideoClips = useProjectStore((s) => s.setVideoClips);

  const selectedClip = useMemo(() => {
    return videoClips.find((c) => c.id === selectedClipId) || videoClips[0] || null;
  }, [videoClips, selectedClipId]);

  const initialFilterId = selectedClip?.adjustments?.curves?.filterId || "filter_none";
  const [currentFilterId, setCurrentFilterId] = useState<string>(initialFilterId);

  const initialClipsRef = React.useRef(videoClips);

  const categories = useMemo(() => {
    const cats = filterRepository.getCategories();
    return ["Original", ...cats];
  }, []);

  const displayedFilters = useMemo(() => {
    return filterRepository.getFiltersByCategory(selectedCategory);
  }, [selectedCategory]);

  const applyFilterToClip = (clip: typeof videoClips[0], filter: FilterItem, intensityVal: number) => {
    const result = filterEngineManager.processFilter(
      filter.engineType,
      filter.engineKey,
      filter.adjustments,
      intensityVal
    );

    return {
      ...clip,
      adjustments: {
        ...clip.adjustments,
        ...(result.computedAdjustments as any),
        curves: {
          filterId: filter.id,
          engineKey: filter.engineKey,
          intensity: intensityVal,
        },
      },
    };
  };

  const handleSelectFilter = (filter: FilterItem) => {
    setCurrentFilterId(filter.id);
    if (!selectedClip) return;

    const nextClips = videoClips.map((c) =>
      c.id === selectedClip.id ? applyFilterToClip(c, filter, intensity) : c
    );

    setVideoClips(nextClips);
  };

  const handleIntensityChange = (val: number) => {
    setIntensity(val);
    if (!selectedClip) return;

    const currentFilter = filterRepository.getFilterById(currentFilterId);
    if (!currentFilter) return;

    const nextClips = videoClips.map((c) =>
      c.id === selectedClip.id ? applyFilterToClip(c, currentFilter, val) : c
    );

    setVideoClips(nextClips);
  };

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderGrant: (e) => {
        const locationX = e.nativeEvent.locationX;
        const ratio = Math.max(0, Math.min(1, locationX / (trackWidthRef.current || 260)));
        const newVal = Math.round(ratio * 100);
        handleIntensityChange(newVal);
      },
      onPanResponderMove: (_, gestureState) => {
        const currentRatio = intensity / 100;
        const ratio = Math.max(0, Math.min(1, currentRatio + gestureState.dx / (trackWidthRef.current || 260)));
        const newVal = Math.round(ratio * 100);
        handleIntensityChange(newVal);
      },
    })
  ).current;

  const handleApplyToAll = () => {
    const currentFilter = filterRepository.getFilterById(currentFilterId);
    if (!currentFilter) return;

    const previousClips = [...videoClips];
    const nextClips = videoClips.map((clip) => applyFilterToClip(clip, currentFilter, intensity));

    const command = new ApplyFilterCommand({
      clipId: "all",
      previousClips,
      nextClips,
      applyClips: (clips) => setVideoClips(clips),
    });

    commandManager.execute(command);
    onClose();
  };

  const handleConfirm = () => {
    const currentFilter = filterRepository.getFilterById(currentFilterId);
    if (!currentFilter || !selectedClip) {
      onClose();
      return;
    }

    const previousClips = initialClipsRef.current;
    const nextClips = videoClips;

    const command = new ApplyFilterCommand({
      clipId: selectedClip.id,
      previousClips,
      nextClips,
      applyClips: (clips) => setVideoClips(clips),
    });

    commandManager.execute(command);
    onClose();
  };

  const handleCancel = () => {
    setVideoClips(initialClipsRef.current);
    onClose();
  };

  return (
    <View style={styles.container}>
      {/* 1. Top Tabs (Filter / Adjust) */}
      <View style={styles.topTabsRow}>
        <TouchableOpacity
          onPress={() => setActiveTopTab("Filter")}
          style={styles.topTabBtn}
        >
          <Text style={[styles.topTabText, activeTopTab === "Filter" && styles.topTabTextActive]}>
            Filter
          </Text>
          {activeTopTab === "Filter" && <View style={styles.topTabIndicator} />}
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => {
            setActiveTopTab("Adjust");
            if (onOpenAdjust) onOpenAdjust();
          }}
          style={styles.topTabBtn}
        >
          <Text style={[styles.topTabText, activeTopTab === "Adjust" && styles.topTabTextActive]}>
            Adjust
          </Text>
          {activeTopTab === "Adjust" && <View style={styles.topTabIndicator} />}
        </TouchableOpacity>
      </View>

      {/* 2. Horizontally Scrollable Category Bar */}
      <View style={styles.categoryRow}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categoryScroll}
        >
          {categories.map((cat) => {
            const isActive = selectedCategory === cat;
            return (
              <TouchableOpacity
                key={cat}
                onPress={() => setSelectedCategory(cat)}
                style={styles.categoryTab}
              >
                <Text style={[styles.categoryText, isActive && styles.categoryTextActive]}>
                  {cat}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {/* 3. Horizontally Scrollable Filter Cards */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.cardsScroll}
      >
        {displayedFilters.map((filter) => (
          <FilterCard
            key={filter.id}
            filter={filter}
            isSelected={filter.id === currentFilterId}
            onSelect={handleSelectFilter}
            thumbnailUri={selectedClip?.thumbnailUri || selectedClip?.videoUri}
          />
        ))}
      </ScrollView>

      {/* 4. Intensity Slider */}
      <View style={styles.intensityRow}>
        <Text style={styles.intensityLabel}>Intensity</Text>
        <View
          style={styles.sliderWrap}
          onLayout={(e) => {
            trackWidthRef.current = e.nativeEvent.layout.width;
          }}
          {...panResponder.panHandlers}
        >
          <View style={styles.sliderTrack}>
            <View style={[styles.sliderFill, { width: `${intensity}%` }]} />
            <View style={[styles.sliderThumb, { left: `${intensity}%` }]} />
          </View>
        </View>
        <Text style={styles.intensityValue}>{intensity}</Text>
      </View>

      {/* 5. Bottom Actions Bar (Cancel X, Apply to all, Confirm ✓) */}
      <View style={styles.bottomBar}>
        <TouchableOpacity onPress={handleCancel} style={styles.actionBtn}>
          <Ionicons name="close-outline" size={24} color="#fff" />
        </TouchableOpacity>

        <TouchableOpacity onPress={handleApplyToAll} style={styles.applyAllBtn}>
          <Ionicons name="checkmark-done-outline" size={18} color="#fff" style={{ marginRight: 6 }} />
          <Text style={styles.applyAllText}>Apply to all</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={handleConfirm} style={styles.actionBtn}>
          <Ionicons name="checkmark-outline" size={24} color="#fff" />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#121214",
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    paddingTop: 16,
    paddingBottom: 24,
  },
  topTabsRow: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 36,
    marginBottom: 16,
  },
  topTabBtn: {
    alignItems: "center",
    paddingVertical: 4,
  },
  topTabText: {
    color: "#8E8E93",
    fontSize: 16,
    fontWeight: "600",
  },
  topTabTextActive: {
    color: "#fff",
  },
  topTabIndicator: {
    width: 16,
    height: 3,
    backgroundColor: "#fff",
    borderRadius: 1.5,
    marginTop: 4,
  },
  categoryRow: {
    marginBottom: 16,
  },
  categoryScroll: {
    paddingHorizontal: 16,
    gap: 20,
  },
  categoryTab: {
    paddingVertical: 4,
  },
  categoryText: {
    color: "#8E8E93",
    fontSize: 13,
    fontWeight: "500",
  },
  categoryTextActive: {
    color: "#fff",
    fontWeight: "700",
  },
  cardsScroll: {
    paddingHorizontal: 16,
    marginBottom: 20,
  },
  intensityRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  intensityLabel: {
    color: "#8E8E93",
    fontSize: 13,
    width: 64,
  },
  sliderWrap: {
    flex: 1,
    height: 24,
    justifyContent: "center",
    marginHorizontal: 12,
  },
  sliderTrack: {
    height: 4,
    backgroundColor: "rgba(255,255,255,0.18)",
    borderRadius: 2,
    justifyContent: "center",
    position: "relative",
  },
  sliderFill: {
    height: "100%",
    backgroundColor: "#D4AF37",
    borderRadius: 2,
  },
  sliderThumb: {
    position: "absolute",
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: "#fff",
    marginTop: -5,
    marginLeft: -7,
  },
  intensityValue: {
    color: "#8E8E93",
    fontSize: 13,
    width: 32,
    textAlign: "right",
    fontVariant: ["tabular-nums"],
  },
  bottomBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 24,
    paddingTop: 8,
  },
  actionBtn: {
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
  },
  applyAllBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  applyAllText: {
    color: "#fff",
    fontSize: 13,
    fontWeight: "500",
  },
});

