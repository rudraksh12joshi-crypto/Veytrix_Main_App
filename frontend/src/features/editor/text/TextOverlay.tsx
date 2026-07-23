import React, { useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  PanResponder,
  TouchableOpacity,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { TextLayer } from "../types/editor.types";

interface TextOverlayProps {
  layers: TextLayer[];
  selectedLayerId: string | null;
  isEditingMode?: boolean;
  currentTime: number;
  onSelectLayer: (id: string) => void;
  onUpdateLayerPosition: (id: string, pos: { x: number; y: number }) => void;
  onDeleteLayer?: (id: string) => void;
}

function DraggableTextItem({
  layer,
  isSelected,
  onSelect,
  onUpdatePosition,
  onDelete,
}: {
  layer: TextLayer;
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

  const fontStyle = {
    fontFamily: layer.fontFamily === "System" ? undefined : layer.fontFamily,
    fontWeight: layer.fontWeight,
    fontSize: layer.fontSize,
    color: layer.color,
    opacity: layer.opacity,
    letterSpacing: layer.letterSpacing,
    lineHeight: layer.fontSize * layer.lineSpacing,
    textAlign: layer.alignment,
    textShadowColor: layer.shadowColor || layer.glowColor || "transparent",
    textShadowOffset: layer.shadowColor ? { width: 1, height: 2 } : { width: 0, height: 0 },
    textShadowRadius: layer.shadowBlur || (layer.glowColor ? 8 : 0),
  };

  return (
    <View
      style={[
        styles.layerWrapper,
        {
          left: `${layer.position.x}%`,
          top: `${layer.position.y}%`,
          transform: [
            { translateX: -100 },
            { translateY: -20 },
            { rotate: `${layer.rotation || 0}deg` },
          ],
        },
      ]}
      {...panResponder.panHandlers}
    >
      <TouchableOpacity activeOpacity={0.9} onPress={onSelect}>
        <View style={[styles.textContainer, isSelected && styles.selectedBox]}>
          <Text style={fontStyle}>{layer.text}</Text>

          {isSelected && (
            <>
              {/* Corner Delete Badge */}
              <TouchableOpacity
                style={styles.deleteBadge}
                onPress={() => onDelete && onDelete(layer.id)}
              >
                <Ionicons name="close" size={12} color="#fff" />
              </TouchableOpacity>

              {/* Corner Rotate Handle */}
              <View style={styles.rotateHandle}>
                <Ionicons name="refresh" size={10} color="#000" />
              </View>
            </>
          )}
        </View>
      </TouchableOpacity>
    </View>
  );
}

export function TextOverlay({
  layers,
  selectedLayerId,
  isEditingMode = true,
  currentTime,
  onSelectLayer,
  onUpdateLayerPosition,
  onDeleteLayer,
}: TextOverlayProps) {
  const visibleLayers = layers.filter(
    (l) => currentTime >= l.startTime && currentTime <= l.endTime
  );

  if (visibleLayers.length === 0) return null;

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="box-none">
      {visibleLayers.map((layer) => (
        <DraggableTextItem
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
    zIndex: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  textContainer: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 4,
    position: "relative",
  },
  selectedBox: {
    borderWidth: 1.5,
    borderColor: "#FFCC00",
    backgroundColor: "rgba(255, 204, 0, 0.1)",
  },
  deleteBadge: {
    position: "absolute",
    top: -10,
    left: -10,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: "#FF3B30",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 50,
  },
  rotateHandle: {
    position: "absolute",
    bottom: -10,
    right: -10,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: "#FFCC00",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 50,
  },
});
