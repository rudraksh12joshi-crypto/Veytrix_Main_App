import React, { useRef } from "react";
import {
  View,
  Text,
  Image,
  StyleSheet,
  PanResponder,
  TouchableOpacity,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { OverlayLayer } from "../types/editor.types";

interface OverlayOverlayProps {
  layers: OverlayLayer[];
  selectedLayerId: string | null;
  isEditingMode?: boolean;
  currentTime: number;
  onSelectLayer: (id: string) => void;
  onUpdateLayerPosition: (id: string, pos: { x: number; y: number }) => void;
  onDeleteLayer?: (id: string) => void;
}

function DraggableOverlayItem({
  layer,
  isSelected,
  onSelect,
  onUpdatePosition,
  onDelete,
}: {
  layer: OverlayLayer;
  isSelected: boolean;
  onSelect: () => void;
  onUpdatePosition: (pos: { x: number; y: number }) => void;
  onDelete?: (id: string) => void;
}) {
  const containerDimensions = useRef({ width: 300, height: 200 });

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderGrant: () => {
        onSelect();
      },
      onPanResponderMove: (_, gestureState) => {
        const deltaXPercent = (gestureState.dx / (containerDimensions.current.width || 300)) * 100;
        const deltaYPercent = (gestureState.dy / (containerDimensions.current.height || 200)) * 100;

        const newX = Math.max(5, Math.min(95, layer.position.x + deltaXPercent));
        const newY = Math.max(5, Math.min(95, layer.position.y + deltaYPercent));

        onUpdatePosition({ x: Math.round(newX), y: Math.round(newY) });
      },
    })
  ).current;

  const isUri =
    layer.source.startsWith("http") ||
    layer.source.startsWith("file") ||
    layer.source.startsWith("content") ||
    layer.source.startsWith("ph") ||
    layer.source.startsWith("data:") ||
    layer.source.includes("/");

  return (
    <View
      style={[
        styles.layerWrapper,
        {
          left: `${layer.position.x}%`,
          top: `${layer.position.y}%`,
          opacity: layer.opacity,
          transform: [
            { translateX: -60 },
            { translateY: -40 },
            { scale: layer.scale },
            { rotate: `${layer.rotation || 0}deg` },
          ],
        },
      ]}
      {...panResponder.panHandlers}
    >
      <TouchableOpacity activeOpacity={0.9} onPress={onSelect}>
        <View
          style={[
            styles.overlayBox,
            isSelected && styles.selectedBox,
            layer.mask.type === "circle" && styles.circleMask,
            layer.mask.type === "rectangle" && styles.rectMask,
          ]}
        >
          {isUri ? (
            <Image
              source={{ uri: layer.source }}
              style={styles.imageContent}
              resizeMode="cover"
            />
          ) : (
            <View style={styles.badgeContent}>
              <Ionicons
                name={
                  layer.type === "sticker"
                    ? "happy-outline"
                    : layer.type === "watermark"
                    ? "shield-checkmark-outline"
                    : layer.type === "logo"
                    ? "pricetag-outline"
                    : "layers-outline"
                }
                size={32}
                color="#FFCC00"
              />
              <Text style={styles.badgeText} numberOfLines={1}>
                {layer.name}
              </Text>
            </View>
          )}

          {isSelected && (
            <>
              {/* Corner Delete Badge */}
              <TouchableOpacity
                style={styles.deleteBadge}
                onPress={() => onDelete && onDelete(layer.id)}
              >
                <Ionicons name="close" size={12} color="#fff" />
              </TouchableOpacity>

              {/* Corner Scale/Rotate Handle */}
              <View style={styles.rotateHandle}>
                <Ionicons name="scan" size={10} color="#000" />
              </View>
            </>
          )}
        </View>
      </TouchableOpacity>
    </View>
  );
}

export function OverlayOverlay({
  layers,
  selectedLayerId,
  isEditingMode = true,
  currentTime,
  onSelectLayer,
  onUpdateLayerPosition,
  onDeleteLayer,
}: OverlayOverlayProps) {
  const visibleLayers = layers.filter(
    (l) => currentTime >= l.startTime && currentTime <= l.endTime
  );

  if (visibleLayers.length === 0) return null;

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="box-none">
      {visibleLayers.map((layer) => (
        <DraggableOverlayItem
          key={layer.id}
          layer={layer}
          isSelected={Boolean(isEditingMode && layer.id === selectedLayerId)}
          onSelect={() => onSelectLayer(layer.id)}
          onUpdatePosition={(pos) => onUpdateLayerPosition(layer.id, pos)}
          onDelete={onDeleteLayer}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  layerWrapper: {
    position: "absolute",
    zIndex: 45,
    alignItems: "center",
    justifyContent: "center",
  },
  overlayBox: {
    width: 120,
    height: 80,
    borderRadius: 8,
    overflow: "visible",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.3)",
  },
  selectedBox: {
    borderWidth: 2,
    borderColor: "#FFCC00",
    backgroundColor: "rgba(255, 204, 0, 0.15)",
  },
  circleMask: {
    borderRadius: 40,
  },
  rectMask: {
    borderRadius: 0,
  },
  imageContent: {
    width: "100%",
    height: "100%",
    borderRadius: 6,
  },
  badgeContent: {
    alignItems: "center",
    justifyContent: "center",
    padding: 6,
  },
  badgeText: {
    color: "#fff",
    fontSize: 10,
    fontWeight: "700",
    marginTop: 2,
  },
  deleteBadge: {
    position: "absolute",
    top: -10,
    left: -10,
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: "#FF3B30",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 60,
  },
  rotateHandle: {
    position: "absolute",
    bottom: -10,
    right: -10,
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: "#FFCC00",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 60,
  },
});
