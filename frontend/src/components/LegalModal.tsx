import React, { useRef, useEffect } from "react";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Modal, Animated, Dimensions, Platform } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { TERMS_SECTIONS, PRIVACY_SECTIONS } from "@/src/constants/legalContent";

interface LegalModalProps {
  visible: boolean;
  type: "terms" | "privacy" | null;
  onClose: () => void;
  onScrolledToBottom?: () => void;
}

export function LegalModal({ visible, type, onClose, onScrolledToBottom }: LegalModalProps) {
  const isTerms = type === "terms";
  const title = isTerms ? "Terms of Service" : "Privacy Policy";
  const icon = isTerms ? "document-text" : "shield-checkmark";
  const contentData = isTerms ? TERMS_SECTIONS : PRIVACY_SECTIONS;
  const lastUpdated = "July 21, 2026";

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.96)).current;
  const translateYAnim = useRef(new Animated.Value(10)).current;
  
  const hasFiredScrolledToBottom = useRef(false);

  useEffect(() => {
    if (visible) {
      hasFiredScrolledToBottom.current = false;
      Animated.parallel([
        Animated.timing(fadeAnim, { toValue: 1, duration: 250, useNativeDriver: true }),
        Animated.timing(scaleAnim, { toValue: 1, duration: 250, useNativeDriver: true }),
        Animated.timing(translateYAnim, { toValue: 0, duration: 250, useNativeDriver: true }),
      ]).start();
    } else {
      fadeAnim.setValue(0);
      scaleAnim.setValue(0.96);
      translateYAnim.setValue(10);
    }
  }, [visible]);

  const handleScroll = (event: any) => {
    if (hasFiredScrolledToBottom.current || !onScrolledToBottom) return;
    
    const { layoutMeasurement, contentOffset, contentSize } = event.nativeEvent;
    const paddingToBottom = 40;
    
    if (layoutMeasurement.height + contentOffset.y >= contentSize.height - paddingToBottom) {
      hasFiredScrolledToBottom.current = true;
      onScrolledToBottom();
    }
  };

  return (
    <Modal visible={visible} transparent={true} animationType="none" onRequestClose={onClose}>
      <Animated.View style={[styles.overlay, { opacity: fadeAnim }]}>
        <Animated.View 
          style={[
            styles.modalContainer, 
            { 
              transform: [
                { scale: scaleAnim },
                { translateY: translateYAnim }
              ] 
            }
          ]}
        >
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.headerLeft}>
              <Ionicons name={icon} size={24} color="#1D2B64" />
              <Text style={styles.headerTitle}>{title}</Text>
            </View>
            <TouchableOpacity 
              style={styles.closeButton} 
              onPress={(e) => {
                e.stopPropagation();
                onClose();
              }}
              hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
            >
              <Ionicons name="close" size={20} color="#1D2B64" />
            </TouchableOpacity>
          </View>

          {/* Scrollable Body */}
          <ScrollView 
            style={styles.scrollBody} 
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
            scrollEventThrottle={16}
            onScroll={handleScroll}
          >
            <Text style={styles.mainTitle}>{title}</Text>
            <Text style={styles.lastUpdated}>Last Updated: {lastUpdated}</Text>

            {contentData.map((section) => (
              <View key={section.id} style={styles.sectionContainer}>
                <Text style={styles.sectionTitle}>{section.title}</Text>
                <Text style={styles.sectionBody}>{section.content}</Text>
              </View>
            ))}
            <View style={{ height: 24 }} />
          </ScrollView>
          
          {/* Subtle gradient indication at bottom (using solid border fallback) */}
          <View style={styles.bottomFadeIndicator} />
        </Animated.View>
      </Animated.View>
    </Modal>
  );
}

const { width, height } = Dimensions.get("window");

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(10, 15, 40, 0.6)", // Dark translucent backdrop
    justifyContent: "center",
    alignItems: "center",
  },
  modalContainer: {
    width: width * 0.9,
    maxWidth: 500,
    maxHeight: height * 0.8,
    backgroundColor: "#FFFFFF",
    borderRadius: 28,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.15,
    shadowRadius: 24,
    elevation: 10,
    borderColor: "rgba(255,255,255,0.1)",
    borderWidth: 1,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
    backgroundColor: "#FFFFFF",
    zIndex: 10,
  },
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#1D2B64",
  },
  closeButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#E6F2F8", // soft light-blue background
    justifyContent: "center",
    alignItems: "center",
  },
  scrollBody: {
    flexShrink: 1,
  },
  scrollContent: {
    padding: 24,
  },
  mainTitle: {
    fontSize: 24,
    fontWeight: "800",
    color: "#1D2B64",
    marginBottom: 4,
  },
  lastUpdated: {
    fontSize: 13,
    color: "#9CA3AF",
    marginBottom: 24,
  },
  sectionContainer: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1D2B64",
    marginBottom: 8,
  },
  sectionBody: {
    fontSize: 14,
    lineHeight: 22,
    color: "#6B7280", // muted blue-grey
  },
  bottomFadeIndicator: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: 24,
    backgroundColor: "transparent", // In a real app we'd use expo-linear-gradient, using transparent padding for now
  }
});
