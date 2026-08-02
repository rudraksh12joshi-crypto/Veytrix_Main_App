import React from "react";
import { View, Text, StyleSheet, TouchableOpacity, Image } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { FilterItem } from "./FilterTypes";

interface FilterCardProps {
  filter: FilterItem;
  isSelected: boolean;
  onSelect: (filter: FilterItem) => void;
  thumbnailUri?: string;
}

export const FilterCard = React.memo<FilterCardProps>(({ filter, isSelected, onSelect, thumbnailUri }) => {
  const getBadgeColor = (plan: string) => {
    switch (plan.trim()) {
      case "Pro":
        return "#FF9500";
      case "Premium":
        return "#BF5AF2";
      default:
        return "transparent";
    }
  };

  const badgeColor = getBadgeColor(filter.requiredPlan);
  const sampleThumb = thumbnailUri || "https://images.unsplash.com/photo-1517404215738-15263e9f9178";

  return (
    <TouchableOpacity
      activeOpacity={0.8}
      onPress={() => onSelect(filter)}
      style={styles.card}
    >
      <View style={[styles.previewBox, isSelected && styles.previewBoxSelected]}>
        {filter.id === "filter_none" ? (
          <View style={styles.noneBox}>
            <Ionicons name="options-outline" size={20} color="#fff" />
          </View>
        ) : (
          <Image source={{ uri: sampleThumb }} style={styles.thumbImage} />
        )}

        {filter.requiredPlan !== "Free" && (
          <View style={[styles.badge, { backgroundColor: badgeColor }]}>
            <Text style={styles.badgeText}>{filter.requiredPlan}</Text>
          </View>
        )}
      </View>

      <Text style={[styles.name, isSelected && styles.nameSelected]} numberOfLines={1}>
        {filter.name}
      </Text>
    </TouchableOpacity>
  );
});

const styles = StyleSheet.create({
  card: {
    width: 64,
    alignItems: "center",
    marginRight: 10,
  },
  previewBox: {
    width: 64,
    height: 76,
    borderRadius: 8,
    backgroundColor: "#2C2C2E",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1.5,
    borderColor: "transparent",
    overflow: "hidden",
    position: "relative",
  },
  previewBoxSelected: {
    borderColor: "#D4AF37",
    borderWidth: 2,
  },
  noneBox: {
    flex: 1,
    width: "100%",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#222226",
  },
  thumbImage: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
  },
  badge: {
    position: "absolute",
    top: 4,
    right: 4,
    paddingHorizontal: 4,
    paddingVertical: 1,
    borderRadius: 4,
  },
  badgeText: {
    color: "#fff",
    fontSize: 9,
    fontWeight: "700",
  },
  name: {
    color: "#8E8E93",
    fontSize: 11,
    marginTop: 6,
    fontWeight: "400",
    textAlign: "center",
  },
  nameSelected: {
    color: "#fff",
    fontWeight: "600",
  },
});

