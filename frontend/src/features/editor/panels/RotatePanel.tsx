import React, { useState, useRef, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  PanResponder,
  Modal,
  TextInput,
  TouchableWithoutFeedback,
  Keyboard,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

interface RotatePanelProps {
  rotation: number;
  onUpdateRotation: (deg: number) => void;
  onCommitRotation: () => void;
  onClose: () => void;
  bottomInset?: number;
}

export function RotatePanel({
  rotation = 0,
  onUpdateRotation,
  onCommitRotation,
  onClose,
  bottomInset = 12,
}: RotatePanelProps) {
  const [modalVisible, setModalVisible] = useState(false);
  const [inputText, setInputText] = useState(rotation.toString());
  const sliderWidthRef = useRef(260);

  useEffect(() => {
    setInputText(Math.round(rotation).toString());
  }, [rotation]);

  const currentDeg = Math.round(rotation);

  const updateDegreesFromRatio = (ratio: number) => {
    // Ratio 0..1 maps to -360..+360
    const rawDeg = Math.round(-360 + ratio * 720);
    const clampedDeg = Math.max(-360, Math.min(360, rawDeg));
    onUpdateRotation(clampedDeg);
  };

  const sliderPanResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderGrant: (e) => {
        const locationX = e.nativeEvent.locationX;
        const ratio = Math.max(0, Math.min(1, locationX / (sliderWidthRef.current || 260)));
        updateDegreesFromRatio(ratio);
      },
      onPanResponderMove: (_, gestureState) => {
        // Calculate ratio from gesture dx
        const currentRatio = (currentDeg + 360) / 720;
        const deltaRatio = gestureState.dx / (sliderWidthRef.current || 260);
        const newRatio = Math.max(0, Math.min(1, currentRatio + deltaRatio));
        updateDegreesFromRatio(newRatio);
      },
      onPanResponderRelease: () => {
        onCommitRotation();
      },
      onPanResponderTerminate: () => {
        onCommitRotation();
      },
    })
  ).current;

  const handleRotateLeft = () => {
    onCommitRotation();
    let nextDeg = currentDeg - 90;
    if (nextDeg < -360) nextDeg = 360 + (nextDeg + 360);
    onUpdateRotation(nextDeg);
  };

  const handleRotateRight = () => {
    onCommitRotation();
    let nextDeg = currentDeg + 90;
    if (nextDeg > 360) nextDeg = -360 + (nextDeg - 360);
    onUpdateRotation(nextDeg);
  };

  const handleReset = () => {
    onCommitRotation();
    onUpdateRotation(0);
  };

  const handleConfirmInput = () => {
    const parsed = parseInt(inputText, 10);
    if (!isNaN(parsed)) {
      onCommitRotation();
      const clamped = Math.max(-360, Math.min(360, parsed));
      onUpdateRotation(clamped);
    }
    setModalVisible(false);
  };

  // Calculate slider thumb position (0% to 100%)
  const sliderPercentage = Math.max(0, Math.min(100, ((currentDeg + 360) / 720) * 100));

  return (
    <View style={[styles.panel, { paddingBottom: Math.max(bottomInset, 16) }]}>
      {/* Panel Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.headerBtn} onPress={handleReset} activeOpacity={0.7}>
          <Ionicons name="refresh-outline" size={16} color="#8E8E93" style={{ marginRight: 4 }} />
          <Text style={styles.headerBtnText}>Reset</Text>
        </TouchableOpacity>

        <Text style={styles.title}>Rotation</Text>

        <TouchableOpacity style={styles.doneBtn} onPress={onClose} activeOpacity={0.7}>
          <Ionicons name="checkmark" size={20} color="#000" />
        </TouchableOpacity>
      </View>

      {/* Main Controls Content */}
      <View style={styles.content}>
        {/* Degree Display & Tap to Type */}
        <TouchableOpacity
          style={styles.degreeBox}
          activeOpacity={0.8}
          onPress={() => {
            setInputText(currentDeg.toString());
            setModalVisible(true);
          }}
        >
          <Text style={styles.degreeValueText}>{currentDeg}°</Text>
          <Text style={styles.degreeTapHint}>Tap to enter angle</Text>
        </TouchableOpacity>

        {/* Rotation Slider */}
        <View style={styles.sliderContainer}>
          <Text style={styles.sliderLabel}>-360°</Text>
          
          <View
            style={styles.sliderTrackTouch}
            onLayout={(e) => {
              sliderWidthRef.current = e.nativeEvent.layout.width;
            }}
            {...sliderPanResponder.panHandlers}
          >
            <View style={styles.sliderTrackBg}>
              <View style={[styles.sliderFill, { width: `${sliderPercentage}%` }]} />
              <View style={[styles.sliderThumb, { left: `${sliderPercentage}%` }]} />
            </View>
          </View>

          <Text style={styles.sliderLabel}>+360°</Text>
        </View>

        {/* Quick Action Buttons */}
        <View style={styles.actionRow}>
          <TouchableOpacity style={styles.actionBtn} onPress={handleRotateLeft} activeOpacity={0.75}>
            <Ionicons name="arrow-undo-outline" size={18} color="#fff" />
            <Text style={styles.actionBtnText}>-90° Left</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionBtn} onPress={handleReset} activeOpacity={0.75}>
            <Ionicons name="refresh" size={16} color="#8E8E93" />
            <Text style={styles.actionBtnText}>0° Reset</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionBtn} onPress={handleRotateRight} activeOpacity={0.75}>
            <Ionicons name="arrow-redo-outline" size={18} color="#fff" />
            <Text style={styles.actionBtnText}>+90° Right</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Manual Input Modal */}
      <Modal visible={modalVisible} transparent animationType="fade" onRequestClose={() => setModalVisible(false)}>
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <View style={styles.modalOverlay}>
            <View style={styles.modalCard}>
              <Text style={styles.modalTitle}>Enter Rotation Angle</Text>
              <Text style={styles.modalSubtitle}>Range: -360° to +360°</Text>

              <View style={styles.inputWrap}>
                <TextInput
                  style={styles.textInput}
                  keyboardType="numeric"
                  value={inputText}
                  onChangeText={setInputText}
                  autoFocus
                  selectTextOnFocus
                  maxLength={5}
                />
                <Text style={styles.degSymbol}>°</Text>
              </View>

              <View style={styles.modalActions}>
                <TouchableOpacity style={styles.modalCancelBtn} onPress={() => setModalVisible(false)}>
                  <Text style={styles.modalCancelText}>Cancel</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.modalConfirmBtn} onPress={handleConfirmInput}>
                  <Text style={styles.modalConfirmText}>Apply</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  panel: {
    backgroundColor: "#1A1A1E",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingHorizontal: 20,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: "rgba(255,255,255,0.08)",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  title: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "700",
  },
  headerBtn: {
    flexDirection: "row",
    alignItems: "center",
    padding: 6,
  },
  headerBtnText: {
    color: "#8E8E93",
    fontSize: 13,
    fontWeight: "500",
  },
  doneBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#FFCC00",
    justifyContent: "center",
    alignItems: "center",
  },
  content: {
    alignItems: "center",
    gap: 16,
  },
  degreeBox: {
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255,255,255,0.06)",
    paddingHorizontal: 24,
    paddingVertical: 10,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.12)",
  },
  degreeValueText: {
    color: "#FFCC00",
    fontSize: 28,
    fontWeight: "800",
    fontVariant: ["tabular-nums"],
  },
  degreeTapHint: {
    color: "rgba(255,255,255,0.4)",
    fontSize: 11,
    marginTop: 2,
  },
  sliderContainer: {
    flexDirection: "row",
    alignItems: "center",
    width: "100%",
    gap: 12,
  },
  sliderLabel: {
    color: "rgba(255,255,255,0.4)",
    fontSize: 11,
    fontWeight: "600",
    width: 36,
    textAlign: "center",
  },
  sliderTrackTouch: {
    flex: 1,
    height: 32,
    justifyContent: "center",
  },
  sliderTrackBg: {
    height: 6,
    backgroundColor: "rgba(255,255,255,0.15)",
    borderRadius: 3,
    position: "relative",
    justifyContent: "center",
  },
  sliderFill: {
    height: "100%",
    backgroundColor: "#3B82F6",
    borderRadius: 3,
  },
  sliderThumb: {
    position: "absolute",
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: "#fff",
    marginLeft: -10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.5,
    shadowRadius: 4,
    elevation: 4,
  },
  actionRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    width: "100%",
    marginTop: 4,
  },
  actionBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255,255,255,0.08)",
    paddingVertical: 10,
    marginHorizontal: 4,
    borderRadius: 12,
    gap: 6,
  },
  actionBtnText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "600",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.7)",
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  modalCard: {
    width: "100%",
    maxWidth: 320,
    backgroundColor: "#222228",
    borderRadius: 20,
    padding: 20,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
  },
  modalTitle: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "700",
  },
  modalSubtitle: {
    color: "rgba(255,255,255,0.5)",
    fontSize: 12,
    marginTop: 4,
    marginBottom: 16,
  },
  inputWrap: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.4)",
    borderRadius: 12,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: "#3B82F6",
    marginBottom: 20,
  },
  textInput: {
    color: "#fff",
    fontSize: 24,
    fontWeight: "700",
    paddingVertical: 8,
    textAlign: "center",
    width: 80,
  },
  degSymbol: {
    color: "#FFCC00",
    fontSize: 24,
    fontWeight: "700",
  },
  modalActions: {
    flexDirection: "row",
    gap: 12,
    width: "100%",
  },
  modalCancelBtn: {
    flex: 1,
    paddingVertical: 12,
    alignItems: "center",
    borderRadius: 12,
    backgroundColor: "rgba(255,255,255,0.1)",
  },
  modalCancelText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "600",
  },
  modalConfirmBtn: {
    flex: 1,
    paddingVertical: 12,
    alignItems: "center",
    borderRadius: 12,
    backgroundColor: "#3B82F6",
  },
  modalConfirmText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "700",
  },
});
