import React, { useState, useRef, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Dimensions,
  Modal,
  Animated,
  Pressable,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useTheme } from "@/src/theme";
import { useExportStore } from "@/src/store/export.store";

const { width } = Dimensions.get("window");

const FILTER_CHIPS = ["All", "Completed", "Processing", "Failed", "Cancelled", "Favorites"];

function AnimatedPressable({ children, onPress, style }: { children: React.ReactNode, onPress: () => void, style?: any }) {
  const scale = useRef(new Animated.Value(1)).current;
  return (
    <Pressable
      onPress={onPress}
      onPressIn={() => Animated.spring(scale, { toValue: 0.96, useNativeDriver: true }).start()}
      onPressOut={() => Animated.spring(scale, { toValue: 1, useNativeDriver: true }).start()}
    >
      <Animated.View style={[style, { transform: [{ scale }] }]}>
        {children}
      </Animated.View>
    </Pressable>
  );
}

export function ExportLibraryPage() {
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();
  const exportsData = useExportStore((s) => s.jobs);
  const [activeFilter, setActiveFilter] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  
  const [menuSheetVisible, setMenuSheetVisible] = useState(false);
  const [detailsModalVisible, setDetailsModalVisible] = useState(false);
  const [selectedItem, setSelectedItem] = useState<any>(null);

  const pageOpacity = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.timing(pageOpacity, {
      toValue: 1,
      duration: 400,
      useNativeDriver: true,
    }).start();
  }, [pageOpacity]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Completed": return "#34C759";
      case "Processing": return "#3B6CE7";
      case "Failed": return "#FF3B3B";
      case "Cancelled": return "#8E8E93";
      default: return "#8E8E93";
    }
  };

  const openMenu = (item: any) => {
    setSelectedItem(item);
    setMenuSheetVisible(true);
  };

  const openDetails = (item: any) => {
    setSelectedItem(item);
    setDetailsModalVisible(true);
  };

  const renderExportCard = (item: any) => {
    const statusColor = getStatusColor(item.status);
    return (
      <AnimatedPressable key={item.id} onPress={() => openDetails(item)} style={styles.exportCard}>
        <View style={styles.cardHeader}>
          <View style={styles.thumbnailContainer}>
            <LinearGradient colors={item.thumbnailColors || ["#1D2B64", "#3B6CE7"]} style={styles.thumbnail} />
            <View style={styles.durationBadge}>
              <Text style={styles.durationText}>{item.duration || "0:00"}</Text>
            </View>
          </View>
          <View style={styles.cardInfo}>
            <View style={styles.titleRow}>
              <Text style={styles.exportName} numberOfLines={1}>
                {item.name || "Untitled Export"}
              </Text>
              {item.isFavorite && <Ionicons name="heart" size={16} color="#FF3B3B" />}
            </View>
            <View style={styles.metaRow}>
              <Text style={styles.metaText}>{item.resolution || "1080p"}</Text>
              <View style={styles.dot} />
              <Text style={styles.metaText}>{item.fps || "30fps"}</Text>
              <View style={styles.dot} />
              <Text style={styles.metaText}>{item.size || "Unknown Size"}</Text>
            </View>
            <Text style={styles.dateText}>{item.date || "Just now"}</Text>
          </View>
        </View>

        <View style={styles.cardFooter}>
          <View style={[styles.statusBadge, { backgroundColor: statusColor + "15" }]}>
            <View style={[styles.statusIndicator, { backgroundColor: statusColor }]} />
            <Text style={[styles.statusText, { color: statusColor }]}>{item.status}</Text>
          </View>
          <TouchableOpacity onPress={() => openMenu(item)} hitSlop={10} style={{ padding: 4 }}>
            <Ionicons name="ellipsis-horizontal" size={20} color="#8E8E93" />
          </TouchableOpacity>
        </View>
      </AnimatedPressable>
    );
  };

  return (
    <Animated.View style={[styles.container, { backgroundColor: "#F5F7FA", opacity: pageOpacity }]}>
      <ScrollView
        contentContainerStyle={{ paddingBottom: insets.bottom + 120, paddingTop: insets.top + 20 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.title}>Export Library</Text>
            <Text style={styles.subtitle}>Manage all your exported videos.</Text>
          </View>
          <View style={styles.headerIcons}>
            <TouchableOpacity style={styles.iconButton}>
              <Ionicons name="search" size={20} color="#1D2B64" />
            </TouchableOpacity>
            <TouchableOpacity style={styles.iconButton}>
              <Ionicons name="options" size={20} color="#1D2B64" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <View style={styles.searchBox}>
            <Ionicons name="search" size={18} color="#8E8E93" />
            <TextInput
              style={styles.searchInput}
              placeholder="Search exports..."
              placeholderTextColor="#8E8E93"
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
          </View>
        </View>

        {/* Filter Chips */}
        <View style={styles.filtersContainer}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 20, gap: 10 }}>
            {FILTER_CHIPS.map((chip) => {
              const isActive = activeFilter === chip;
              return (
                <TouchableOpacity
                  key={chip}
                  onPress={() => setActiveFilter(chip)}
                  style={[
                    styles.filterChip,
                    isActive ? styles.filterChipActive : styles.filterChipInactive
                  ]}
                >
                  <Text style={[styles.filterText, isActive ? styles.filterTextActive : styles.filterTextInactive]}>{chip}</Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>

        {/* Export List */}
        <View style={styles.listContainer}>
          {exportsData.length > 0 ? (
            exportsData.map(renderExportCard)
          ) : (
            <View style={styles.emptyState}>
              <View style={styles.emptyIllustration}>
                <Ionicons name="film" size={64} color="#3B6CE7" />
              </View>
              <Text style={styles.emptyTitle}>No Exports Yet</Text>
              <Text style={styles.emptySubtitle}>Your exported videos will appear here once you export a project.</Text>
              
              <View style={styles.emptyActions}>
                <TouchableOpacity style={styles.primaryButton}>
                  <Text style={styles.primaryButtonText}>Create Project</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.secondaryButton}>
                  <Text style={styles.secondaryButtonText}>Import Media</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
        </View>
      </ScrollView>

      {/* Menu Bottom Sheet */}
      <Modal visible={menuSheetVisible} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <TouchableOpacity style={StyleSheet.absoluteFillObject} onPress={() => setMenuSheetVisible(false)} />
          <View style={[styles.bottomSheet, { paddingBottom: insets.bottom + 20 }]}>
            <View style={styles.sheetHandle} />
            <Text style={styles.sheetTitle} numberOfLines={1}>
              {selectedItem?.name || "Options"}
            </Text>
            {[
              { icon: "open-outline", label: "Open" },
              { icon: "play-circle-outline", label: "Preview" },
              { icon: "share-outline", label: "Share" },
              { icon: "download-outline", label: "Download" },
              { icon: "copy-outline", label: "Duplicate" },
              { icon: "pencil", label: "Rename" },
              { icon: "information-circle-outline", label: "View Details" },
              { icon: "trash-outline", label: "Delete", destructive: true },
            ].map((opt, i) => (
              <TouchableOpacity 
                key={i} 
                style={styles.sheetMenuItem} 
                onPress={() => {
                  if (opt.label === "View Details") {
                    setMenuSheetVisible(false);
                    setTimeout(() => setDetailsModalVisible(true), 300);
                  }
                }}
              >
                <Ionicons name={opt.icon as any} size={22} color={opt.destructive ? "#FF3B3B" : "#1D2B64"} />
                <Text style={[styles.sheetMenuItemText, { color: opt.destructive ? "#FF3B3B" : "#1D2B64" }]}>
                  {opt.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </Modal>

      {/* Details Bottom Sheet */}
      <Modal visible={detailsModalVisible} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <TouchableOpacity style={StyleSheet.absoluteFillObject} onPress={() => setDetailsModalVisible(false)} />
          <View style={[styles.bottomSheet, { paddingBottom: insets.bottom + 20, height: '80%' }]}>
            <View style={styles.sheetHandle} />
            <Text style={styles.sheetTitle}>Export Details</Text>
            
            <ScrollView showsVerticalScrollIndicator={false}>
              <View style={styles.detailsThumbnailWrapper}>
                <LinearGradient colors={selectedItem?.thumbnailColors || ["#1D2B64", "#3B6CE7"]} style={styles.thumbnail} />
              </View>
              <Text style={styles.detailsName}>{selectedItem?.name || "Untitled Export"}</Text>
              
              <View style={styles.detailsGrid}>
                {[
                  { label: "Date", value: selectedItem?.date || "N/A" },
                  { label: "Duration", value: selectedItem?.duration || "N/A" },
                  { label: "Resolution", value: selectedItem?.resolution || "N/A" },
                  { label: "FPS", value: selectedItem?.fps || "N/A" },
                  { label: "Codec", value: selectedItem?.codec || "H.264" },
                  { label: "Bitrate", value: selectedItem?.bitrate || "12 Mbps" },
                  { label: "File Size", value: selectedItem?.size || "N/A" },
                  { label: "Time Taken", value: selectedItem?.exportTime || "N/A" },
                  { label: "Storage Path", value: selectedItem?.path || "/exports/video.mp4" },
                ].map((stat, i) => (
                  <View key={i} style={styles.detailItem}>
                    <Text style={styles.detailLabel}>{stat.label}</Text>
                    <Text style={styles.detailValue}>{stat.value}</Text>
                  </View>
                ))}
              </View>

              <View style={styles.detailsActions}>
                <TouchableOpacity style={styles.primaryButton}>
                  <Text style={styles.primaryButtonText}>Share</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.secondaryButton}>
                  <Text style={styles.secondaryButtonText}>Download</Text>
                </TouchableOpacity>
              </View>
              <TouchableOpacity style={[styles.secondaryButton, { borderColor: "#FF3B3B", marginTop: 12 }]}>
                <Text style={[styles.secondaryButtonText, { color: "#FF3B3B" }]}>Delete Export</Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>

    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: "800",
    color: "#1D2B64",
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    fontWeight: "500",
    color: "#8E8E93",
  },
  headerIcons: {
    flexDirection: "row",
    gap: 12,
  },
  iconButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#fff",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#3B6CE7",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  searchContainer: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  searchBox: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    height: 50,
    backgroundColor: "#fff",
    borderRadius: 18,
    borderWidth: 1.5,
    borderColor: "#3B6CE7",
  },
  searchInput: {
    flex: 1,
    marginLeft: 12,
    fontSize: 15,
    fontWeight: "500",
    color: "#1D2B64",
  },
  filtersContainer: {
    marginBottom: 24,
  },
  filterChip: {
    height: 40,
    paddingHorizontal: 20,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 20,
    borderWidth: 1.5,
  },
  filterChipActive: {
    backgroundColor: "#3B6CE7",
    borderColor: "#3B6CE7",
  },
  filterChipInactive: {
    backgroundColor: "#fff",
    borderColor: "#3B6CE7",
  },
  filterText: {
    fontSize: 14,
    fontWeight: "600",
  },
  filterTextActive: {
    color: "#fff",
  },
  filterTextInactive: {
    color: "#3B6CE7",
  },
  listContainer: {
    paddingHorizontal: 20,
    gap: 16,
  },
  exportCard: {
    backgroundColor: "#fff",
    borderRadius: 24,
    padding: 16,
    shadowColor: "#1D2B64",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 4,
  },
  cardHeader: {
    flexDirection: "row",
    marginBottom: 16,
  },
  thumbnailContainer: {
    width: 80,
    height: 80,
    borderRadius: 16,
    overflow: "hidden",
    marginRight: 16,
  },
  thumbnail: {
    flex: 1,
  },
  durationBadge: {
    position: "absolute",
    bottom: 6,
    right: 6,
    backgroundColor: "rgba(0,0,0,0.6)",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  durationText: {
    color: "#fff",
    fontSize: 10,
    fontWeight: "700",
  },
  cardInfo: {
    flex: 1,
    justifyContent: "center",
  },
  titleRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 6,
  },
  exportName: {
    fontSize: 16,
    fontWeight: "800",
    color: "#1D2B64",
    flex: 1,
    marginRight: 8,
  },
  metaRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 6,
  },
  metaText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#8E8E93",
  },
  dot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: "#E5E5EA",
    marginHorizontal: 6,
  },
  dateText: {
    fontSize: 12,
    fontWeight: "500",
    color: "#8E8E93",
  },
  cardFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderTopWidth: 1,
    borderTopColor: "#F5F7FA",
    paddingTop: 12,
  },
  statusBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusIndicator: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 6,
  },
  statusText: {
    fontSize: 12,
    fontWeight: "700",
  },
  emptyState: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 60,
  },
  emptyIllustration: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: "rgba(59, 108, 231, 0.1)",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 24,
  },
  emptyTitle: {
    fontSize: 22,
    fontWeight: "800",
    color: "#1D2B64",
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 15,
    color: "#8E8E93",
    textAlign: "center",
    marginBottom: 32,
    paddingHorizontal: 20,
  },
  emptyActions: {
    flexDirection: "row",
    gap: 16,
  },
  primaryButton: {
    flex: 1,
    backgroundColor: "#3B6CE7",
    paddingVertical: 14,
    borderRadius: 16,
    alignItems: "center",
    shadowColor: "#3B6CE7",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  primaryButtonText: {
    color: "#fff",
    fontSize: 15,
    fontWeight: "700",
  },
  secondaryButton: {
    flex: 1,
    backgroundColor: "#fff",
    paddingVertical: 14,
    borderRadius: 16,
    alignItems: "center",
    borderWidth: 1.5,
    borderColor: "#E5E5EA",
  },
  secondaryButtonText: {
    color: "#1D2B64",
    fontSize: 15,
    fontWeight: "700",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "flex-end",
  },
  bottomSheet: {
    backgroundColor: "#fff",
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    padding: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -10 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 20,
  },
  sheetHandle: {
    width: 40,
    height: 5,
    backgroundColor: "#E5E5EA",
    borderRadius: 3,
    alignSelf: "center",
    marginBottom: 24,
  },
  sheetTitle: {
    fontSize: 22,
    fontWeight: "800",
    color: "#1D2B64",
    marginBottom: 20,
  },
  sheetMenuItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#F5F7FA",
  },
  sheetMenuItemText: {
    fontSize: 17,
    fontWeight: "600",
    marginLeft: 16,
  },
  detailsThumbnailWrapper: {
    width: "100%",
    height: 180,
    borderRadius: 20,
    overflow: "hidden",
    marginBottom: 16,
  },
  detailsName: {
    fontSize: 24,
    fontWeight: "800",
    color: "#1D2B64",
    marginBottom: 24,
  },
  detailsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    marginBottom: 32,
  },
  detailItem: {
    width: "48%",
    backgroundColor: "#F5F7FA",
    padding: 16,
    borderRadius: 16,
    marginBottom: 12,
  },
  detailLabel: {
    fontSize: 12,
    fontWeight: "600",
    color: "#8E8E93",
    marginBottom: 4,
  },
  detailValue: {
    fontSize: 15,
    fontWeight: "800",
    color: "#1D2B64",
  },
  detailsActions: {
    flexDirection: "row",
    gap: 16,
  },
});
