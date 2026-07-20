import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Image,
  Dimensions,
  Modal,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { BlurView } from "expo-blur";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useTheme } from "@/src/theme";

const { width } = Dimensions.get("window");

// Mock Data
const MOCK_STATS = [
  { label: "Total Exports", value: "24", icon: "videocam-outline", color: "#7C5CFF" },
  { label: "Completed", value: "18", icon: "checkmark-circle-outline", color: "#3CD09A" },
  { label: "Processing", value: "2", icon: "time-outline", color: "#FFB43C" },
  { label: "Storage Used", value: "14.2 GB", icon: "cloud-outline", color: "#FF3B8B" },
];

const MOCK_EXPORTS = [
  {
    id: "1",
    name: "Cinematic Intro",
    resolution: "4K",
    format: "MP4",
    size: "1.2 GB",
    duration: "00:15",
    date: "Today, 14:30",
    status: "Completed",
    isFavorite: false,
  },
  {
    id: "2",
    name: "Vlog 04 - Summer",
    resolution: "1080P",
    format: "MOV",
    size: "350 MB",
    duration: "02:30",
    date: "Today, 10:15",
    status: "Processing",
    progress: 75,
    isFavorite: false,
  },
  {
    id: "3",
    name: "Instagram Reel",
    resolution: "1080P",
    format: "MP4",
    size: "45 MB",
    duration: "00:30",
    date: "Yesterday",
    status: "Failed",
    isFavorite: false,
  },
  {
    id: "4",
    name: "Wedding Highlights",
    resolution: "4K",
    format: "MP4",
    size: "3.4 GB",
    duration: "05:45",
    date: "Oct 12, 2026",
    status: "Completed",
    isFavorite: true,
  },
];

const FILTER_CHIPS = ["All", "Completed", "Processing", "Failed", "Favorites"];

export function ExportLibraryPage() {
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();
  const [activeFilter, setActiveFilter] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [bottomSheetVisible, setBottomSheetVisible] = useState(false);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Completed": return theme.colors.success;
      case "Processing": return theme.colors.warning;
      case "Failed": return theme.colors.danger;
      default: return theme.colors.textMuted;
    }
  };

  const renderExportCard = (item: any) => {
    const statusColor = getStatusColor(item.status);
    return (
      <View key={item.id} style={[styles.exportCard, { backgroundColor: theme.colors.surface }]}>
        <View style={styles.cardHeader}>
          <View style={styles.thumbnailContainer}>
            <LinearGradient colors={["#2C1A5C", "#0A0A0B"]} style={styles.thumbnail} />
            <View style={styles.durationBadge}>
              <Text style={styles.durationText}>{item.duration}</Text>
            </View>
          </View>
          <View style={styles.cardInfo}>
            <View style={styles.titleRow}>
              <Text style={[styles.exportName, { color: theme.colors.textPrimary }]} numberOfLines={1}>
                {item.name}
              </Text>
              {item.isFavorite && <Ionicons name="heart" size={16} color={theme.colors.danger} />}
            </View>
            <View style={styles.metaRow}>
              <Text style={[styles.metaText, { color: theme.colors.textSecondary }]}>{item.resolution}</Text>
              <View style={[styles.dot, { backgroundColor: theme.colors.textMuted }]} />
              <Text style={[styles.metaText, { color: theme.colors.textSecondary }]}>{item.format}</Text>
              <View style={[styles.dot, { backgroundColor: theme.colors.textMuted }]} />
              <Text style={[styles.metaText, { color: theme.colors.textSecondary }]}>{item.size}</Text>
            </View>
            <Text style={[styles.dateText, { color: theme.colors.textMuted }]}>{item.date}</Text>
          </View>
        </View>

        <View style={styles.statusRow}>
          <View style={[styles.statusBadge, { backgroundColor: statusColor + "20" }]}>
            <View style={[styles.statusIndicator, { backgroundColor: statusColor }]} />
            <Text style={[styles.statusText, { color: statusColor }]}>{item.status}</Text>
          </View>
          {item.status === "Processing" && (
            <View style={styles.progressContainer}>
              <View style={styles.progressBarBg}>
                <View style={[styles.progressBarFill, { width: `${item.progress}%`, backgroundColor: theme.colors.warning }]} />
              </View>
              <Text style={[styles.progressText, { color: theme.colors.warning }]}>{item.progress}%</Text>
            </View>
          )}
        </View>

        <View style={[styles.actionRow, { borderTopColor: theme.colors.border }]}>
          <TouchableOpacity style={styles.actionBtn}>
            <Ionicons name="play" size={18} color={theme.colors.textPrimary} />
            <Text style={[styles.actionText, { color: theme.colors.textPrimary }]}>Preview</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionBtn}>
            <Ionicons name="download-outline" size={18} color={theme.colors.textPrimary} />
            <Text style={[styles.actionText, { color: theme.colors.textPrimary }]}>Save</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionBtn}>
            <Ionicons name="share-outline" size={18} color={theme.colors.textPrimary} />
            <Text style={[styles.actionText, { color: theme.colors.textPrimary }]}>Share</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionBtn} onPress={() => setBottomSheetVisible(true)}>
            <Ionicons name="ellipsis-vertical" size={18} color={theme.colors.textPrimary} />
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <ScrollView
        contentContainerStyle={{ paddingBottom: insets.bottom + 120, paddingTop: insets.top + 20 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={[styles.title, { color: theme.colors.textPrimary }]}>Export Library</Text>
            <Text style={[styles.subtitle, { color: theme.colors.textSecondary }]}>Manage all your exported videos.</Text>
          </View>
          <View style={styles.headerIcons}>
            <TouchableOpacity style={[styles.iconButton, { backgroundColor: theme.colors.surfaceElevated }]}>
              <Ionicons name="search" size={20} color={theme.colors.textPrimary} />
            </TouchableOpacity>
            <TouchableOpacity style={[styles.iconButton, { backgroundColor: theme.colors.surfaceElevated }]}>
              <Ionicons name="options-outline" size={20} color={theme.colors.textPrimary} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Statistics */}
        <View style={styles.statsContainer}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 20, gap: 12 }}>
            {MOCK_STATS.map((stat, idx) => (
              <View key={idx} style={[styles.statCard, { backgroundColor: theme.colors.surface }]}>
                <View style={[styles.statIconBox, { backgroundColor: stat.color + "15" }]}>
                  <Ionicons name={stat.icon as any} size={18} color={stat.color} />
                </View>
                <Text style={[styles.statValue, { color: theme.colors.textPrimary }]}>{stat.value}</Text>
                <Text style={[styles.statLabel, { color: theme.colors.textSecondary }]}>{stat.label}</Text>
              </View>
            ))}
          </ScrollView>
        </View>

        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <View style={[styles.searchBox, { backgroundColor: theme.colors.surfaceElevated, borderColor: theme.colors.border }]}>
            <Ionicons name="search" size={18} color={theme.colors.textMuted} />
            <TextInput
              style={[styles.searchInput, { color: theme.colors.textPrimary }]}
              placeholder="Search by project name..."
              placeholderTextColor={theme.colors.textMuted}
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
                    {
                      backgroundColor: isActive ? theme.colors.primary : theme.colors.surface,
                      borderColor: isActive ? theme.colors.primary : theme.colors.border,
                    },
                  ]}
                >
                  <Text style={[styles.filterText, { color: isActive ? "#fff" : theme.colors.textPrimary }]}>{chip}</Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>

        {/* Export List */}
        <View style={styles.listContainer}>
          {MOCK_EXPORTS.length > 0 ? (
            MOCK_EXPORTS.map(renderExportCard)
          ) : (
            <View style={styles.emptyState}>
              <Ionicons name="film-outline" size={64} color={theme.colors.textMuted} />
              <Text style={[styles.emptyTitle, { color: theme.colors.textPrimary }]}>No exports yet</Text>
              <TouchableOpacity style={[styles.emptyButton, { backgroundColor: theme.colors.primary }]}>
                <Text style={styles.emptyButtonText}>Create Your First Video</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>

        {/* Storage Card */}
        <View style={[styles.storageCard, { backgroundColor: theme.colors.surfaceElevated, borderColor: theme.colors.border }]}>
          <View style={styles.storageHeader}>
            <Text style={[styles.storageTitle, { color: theme.colors.textPrimary }]}>Storage</Text>
            <Text style={[styles.storageSubtitle, { color: theme.colors.textSecondary }]}>14.2 GB used / 50 GB</Text>
          </View>
          <View style={styles.storageBarBg}>
            <LinearGradient
              colors={["#7C5CFF", "#3CD09A"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={[styles.storageBarFill, { width: "28%" }]}
            />
          </View>
        </View>
      </ScrollView>

      {/* Floating Action Button */}
      <TouchableOpacity style={[styles.fab, { backgroundColor: theme.colors.primary, bottom: insets.bottom + 20 }]} activeOpacity={0.8}>
        <Ionicons name="add" size={24} color="#fff" />
        <Text style={styles.fabText}>New Export</Text>
      </TouchableOpacity>

      {/* Bottom Sheet Mock */}
      <Modal visible={bottomSheetVisible} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <TouchableOpacity style={StyleSheet.absoluteFillObject} onPress={() => setBottomSheetVisible(false)} />
          <View style={[styles.bottomSheet, { backgroundColor: theme.colors.surfaceElevated, paddingBottom: insets.bottom + 20 }]}>
            <View style={styles.sheetHandle} />
            <Text style={[styles.sheetTitle, { color: theme.colors.textPrimary }]}>More Options</Text>
            {[
              { icon: "pencil", label: "Rename" },
              { icon: "copy", label: "Duplicate" },
              { icon: "refresh", label: "Export Again" },
              { icon: "information-circle", label: "View Details" },
              { icon: "trash", label: "Delete", destructive: true },
            ].map((opt, i) => (
              <TouchableOpacity key={i} style={styles.sheetItem}>
                <Ionicons name={opt.icon as any} size={20} color={opt.destructive ? theme.colors.danger : theme.colors.textPrimary} />
                <Text style={[styles.sheetItemText, { color: opt.destructive ? theme.colors.danger : theme.colors.textPrimary }]}>
                  {opt.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </Modal>
    </View>
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
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    fontWeight: "400",
  },
  headerIcons: {
    flexDirection: "row",
    gap: 12,
  },
  iconButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  statsContainer: {
    marginBottom: 20,
  },
  statCard: {
    padding: 16,
    borderRadius: 20,
    width: 140,
  },
  statIconBox: {
    width: 32,
    height: 32,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 12,
  },
  statValue: {
    fontSize: 22,
    fontWeight: "800",
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 13,
    fontWeight: "500",
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
    borderRadius: 16,
    borderWidth: 1,
  },
  searchInput: {
    flex: 1,
    marginLeft: 12,
    fontSize: 15,
    fontWeight: "500",
  },
  filtersContainer: {
    marginBottom: 24,
  },
  filterChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
  },
  filterText: {
    fontSize: 14,
    fontWeight: "600",
  },
  listContainer: {
    paddingHorizontal: 20,
    gap: 16,
    marginBottom: 32,
  },
  exportCard: {
    borderRadius: 24,
    padding: 16,
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
    fontWeight: "600",
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
    fontSize: 17,
    fontWeight: "700",
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
    fontWeight: "500",
  },
  dot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    marginHorizontal: 6,
  },
  dateText: {
    fontSize: 12,
  },
  statusRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  statusBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    marginRight: 12,
  },
  statusIndicator: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 6,
  },
  statusText: {
    fontSize: 12,
    fontWeight: "600",
  },
  progressContainer: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
  },
  progressBarBg: {
    flex: 1,
    height: 4,
    backgroundColor: "rgba(255,255,255,0.1)",
    borderRadius: 2,
    marginRight: 8,
  },
  progressBarFill: {
    height: "100%",
    borderRadius: 2,
  },
  progressText: {
    fontSize: 12,
    fontWeight: "600",
  },
  actionRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderTopWidth: StyleSheet.hairlineWidth,
    paddingTop: 16,
  },
  actionBtn: {
    flexDirection: "row",
    alignItems: "center",
  },
  actionText: {
    marginLeft: 6,
    fontSize: 14,
    fontWeight: "600",
  },
  emptyState: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 60,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: "700",
    marginTop: 16,
    marginBottom: 20,
  },
  emptyButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 20,
  },
  emptyButtonText: {
    color: "#fff",
    fontSize: 15,
    fontWeight: "600",
  },
  storageCard: {
    marginHorizontal: 20,
    padding: 20,
    borderRadius: 20,
    borderWidth: 1,
  },
  storageHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  storageTitle: {
    fontSize: 16,
    fontWeight: "600",
  },
  storageSubtitle: {
    fontSize: 13,
  },
  storageBarBg: {
    height: 8,
    backgroundColor: "rgba(255,255,255,0.1)",
    borderRadius: 4,
    overflow: "hidden",
  },
  storageBarFill: {
    height: "100%",
    borderRadius: 4,
  },
  fab: {
    position: "absolute",
    right: 20,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderRadius: 28,
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  fabText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
    marginLeft: 8,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.6)",
    justifyContent: "flex-end",
  },
  bottomSheet: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
  },
  sheetHandle: {
    width: 40,
    height: 4,
    backgroundColor: "rgba(255,255,255,0.2)",
    borderRadius: 2,
    alignSelf: "center",
    marginBottom: 20,
  },
  sheetTitle: {
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 16,
  },
  sheetItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 16,
  },
  sheetItemText: {
    fontSize: 16,
    fontWeight: "500",
    marginLeft: 12,
  },
});
