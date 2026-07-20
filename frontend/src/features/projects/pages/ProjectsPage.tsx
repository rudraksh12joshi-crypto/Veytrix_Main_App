import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Dimensions,
  Modal,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useTheme } from "@/src/theme";

const { width } = Dimensions.get("window");

// --- Mock Data ---
const MOCK_STATS = [
  { label: "Total Projects", value: "32", icon: "folder-open-outline", color: "#7C5CFF" },
  { label: "Drafts", value: "8", icon: "document-text-outline", color: "#FFB43C" },
  { label: "Recently Edited", value: "12", icon: "time-outline", color: "#3CD09A" },
  { label: "Cloud Synced", value: "24", icon: "cloud-done-outline", color: "#0A84FF" },
];

const FILTER_CHIPS = ["All", "Recent", "Drafts", "Completed", "Favorites"];

const MOCK_PROJECTS = [
  {
    id: "1",
    name: "Summer Vlog 05",
    lastEdited: "2 hours ago",
    duration: "10:24",
    resolution: "4K",
    status: "In Progress",
    isFavorite: true,
    thumbnailColors: ["#2C1A5C", "#0A0A0B"],
  },
  {
    id: "2",
    name: "Cinematic B-Roll",
    lastEdited: "Yesterday",
    duration: "02:15",
    resolution: "4K",
    status: "Completed",
    isFavorite: false,
    thumbnailColors: ["#1A3C40", "#0A0A0B"],
  },
  {
    id: "3",
    name: "Instagram Reel",
    lastEdited: "3 days ago",
    duration: "00:45",
    resolution: "1080P",
    status: "Draft",
    isFavorite: false,
    thumbnailColors: ["#4A154B", "#0A0A0B"],
  },
  {
    id: "4",
    name: "Travel Diary",
    lastEdited: "Last week",
    duration: "15:30",
    resolution: "4K",
    status: "Completed",
    isFavorite: true,
    thumbnailColors: ["#1A2A3A", "#0A0A0B"],
  },
];

const QUICK_ACTIONS = [
  { label: "Import Media", icon: "images", color: "#7C5CFF" },
  { label: "Templates", icon: "color-wand", color: "#FF3B8B" },
  { label: "Duplicate", icon: "copy", color: "#3CD09A" },
  { label: "Recover", icon: "refresh", color: "#FFB43C" },
];

const RECENT_ACTIVITY = [
  { label: "Edited 'Summer Vlog 05'", time: "10 mins ago", icon: "create" },
  { label: "Exported 'Cinematic B-Roll'", time: "Yesterday", icon: "videocam" },
  { label: "Created new project", time: "3 days ago", icon: "add-circle" },
  { label: "Imported 12 media files", time: "Last week", icon: "images" },
];

export function ProjectsPage() {
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();
  const [activeFilter, setActiveFilter] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [bottomSheetVisible, setBottomSheetVisible] = useState(false);
  const [selectedProject, setSelectedProject] = useState<any>(null);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Completed": return theme.colors.success;
      case "In Progress": return theme.colors.primary;
      case "Draft": return theme.colors.warning;
      default: return theme.colors.textMuted;
    }
  };

  const handleMorePress = (project: any) => {
    setSelectedProject(project);
    setBottomSheetVisible(true);
  };

  const renderProjectCard = (item: any) => {
    const statusColor = getStatusColor(item.status);
    return (
      <View key={item.id} style={[styles.projectCard, { backgroundColor: theme.colors.surface }]}>
        <View style={styles.thumbnailWrapper}>
          <LinearGradient colors={item.thumbnailColors as any} style={styles.thumbnail} />
          
          <View style={styles.thumbnailBadges}>
            <View style={[styles.resolutionBadge, { backgroundColor: "rgba(0,0,0,0.6)" }]}>
              <Text style={styles.resolutionText}>{item.resolution}</Text>
            </View>
            <View style={[styles.durationBadge, { backgroundColor: "rgba(0,0,0,0.6)" }]}>
              <Text style={styles.durationText}>{item.duration}</Text>
            </View>
          </View>
          
          {item.isFavorite && (
            <View style={styles.favoriteBadge}>
              <Ionicons name="heart" size={14} color={theme.colors.danger} />
            </View>
          )}
        </View>

        <View style={styles.cardInfo}>
          <View style={styles.cardTitleRow}>
            <Text style={[styles.projectName, { color: theme.colors.textPrimary }]} numberOfLines={1}>
              {item.name}
            </Text>
            <TouchableOpacity onPress={() => handleMorePress(item)} style={styles.moreButton}>
              <Ionicons name="ellipsis-vertical" size={16} color={theme.colors.textMuted} />
            </TouchableOpacity>
          </View>
          
          <Text style={[styles.lastEdited, { color: theme.colors.textSecondary }]} numberOfLines={1}>
            {item.lastEdited}
          </Text>
          
          <View style={[styles.statusBadge, { backgroundColor: statusColor + "15" }]}>
            <View style={[styles.statusDot, { backgroundColor: statusColor }]} />
            <Text style={[styles.statusText, { color: statusColor }]}>{item.status}</Text>
          </View>
        </View>
      </View>
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <ScrollView
        contentContainerStyle={{ paddingBottom: insets.bottom + 100, paddingTop: insets.top + 20 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={[styles.title, { color: theme.colors.textPrimary }]}>Projects</Text>
            <Text style={[styles.subtitle, { color: theme.colors.textSecondary }]}>Manage all your creative work.</Text>
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

        {/* Statistics Cards */}
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

        {/* Search */}
        <View style={styles.searchContainer}>
          <View style={[styles.searchBox, { backgroundColor: theme.colors.surfaceElevated, borderColor: theme.colors.border }]}>
            <Ionicons name="search" size={18} color={theme.colors.textMuted} />
            <TextInput
              style={[styles.searchInput, { color: theme.colors.textPrimary }]}
              placeholder="Search projects..."
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

        {/* Projects Grid */}
        <View style={styles.gridContainer}>
          {MOCK_PROJECTS.length > 0 ? (
            MOCK_PROJECTS.map(renderProjectCard)
          ) : (
            <View style={styles.emptyState}>
              <Ionicons name="folder-open-outline" size={64} color={theme.colors.textMuted} />
              <Text style={[styles.emptyTitle, { color: theme.colors.textPrimary }]}>No Projects Yet</Text>
              <TouchableOpacity style={[styles.emptyButton, { backgroundColor: theme.colors.primary }]}>
                <Text style={styles.emptyButtonText}>Create Your First Project</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>

        {/* Quick Actions */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.colors.textSecondary }]}>Quick Actions</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 12 }}>
            {QUICK_ACTIONS.map((action, idx) => (
              <TouchableOpacity key={idx} style={[styles.quickActionCard, { backgroundColor: theme.colors.surface }]}>
                <View style={[styles.quickActionIcon, { backgroundColor: action.color + "15" }]}>
                  <Ionicons name={action.icon as any} size={24} color={action.color} />
                </View>
                <Text style={[styles.quickActionText, { color: theme.colors.textPrimary }]}>{action.label}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Recent Activity */}
        <View style={[styles.section, { paddingHorizontal: 20 }]}>
          <Text style={[styles.sectionTitle, { color: theme.colors.textSecondary, marginLeft: 0 }]}>Recent Activity</Text>
          <View style={[styles.activityCard, { backgroundColor: theme.colors.surface }]}>
            {RECENT_ACTIVITY.map((activity, idx) => (
              <View key={idx} style={styles.activityItem}>
                <View style={[styles.activityIconBox, { backgroundColor: theme.colors.surfaceElevated }]}>
                  <Ionicons name={activity.icon as any} size={16} color={theme.colors.textMuted} />
                </View>
                <View style={styles.activityContent}>
                  <Text style={[styles.activityLabel, { color: theme.colors.textPrimary }]}>{activity.label}</Text>
                  <Text style={[styles.activityTime, { color: theme.colors.textSecondary }]}>{activity.time}</Text>
                </View>
                {idx < RECENT_ACTIVITY.length - 1 && <View style={[styles.activityLine, { backgroundColor: theme.colors.border }]} />}
              </View>
            ))}
          </View>
        </View>

      </ScrollView>

      {/* Floating Action Button */}
      <TouchableOpacity style={[styles.fab, { backgroundColor: theme.colors.primary, bottom: insets.bottom + 20 }]} activeOpacity={0.8}>
        <Ionicons name="add" size={24} color="#fff" />
        <Text style={styles.fabText}>New Project</Text>
      </TouchableOpacity>

      {/* Bottom Sheet Menu */}
      <Modal visible={bottomSheetVisible} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <TouchableOpacity style={StyleSheet.absoluteFillObject} onPress={() => setBottomSheetVisible(false)} />
          <View style={[styles.bottomSheet, { backgroundColor: theme.colors.surfaceElevated, paddingBottom: insets.bottom + 20 }]}>
            <View style={styles.sheetHandle} />
            <Text style={[styles.sheetTitle, { color: theme.colors.textPrimary }]} numberOfLines={1}>
              {selectedProject?.name || "Options"}
            </Text>
            {[
              { icon: "pencil", label: "Rename" },
              { icon: "copy", label: "Duplicate" },
              { icon: "heart", label: "Favorite" },
              { icon: "share-outline", label: "Share" },
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
    width: 130,
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
  gridContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    paddingHorizontal: 20,
    justifyContent: "space-between",
    marginBottom: 24,
  },
  projectCard: {
    width: (width - 56) / 2, // 20 padding each side, 16 gap
    borderRadius: 20,
    marginBottom: 16,
    overflow: "hidden",
  },
  thumbnailWrapper: {
    height: (width - 56) / 2 * 0.75, // 4:3 aspect ratio roughly
    width: "100%",
  },
  thumbnail: {
    flex: 1,
  },
  thumbnailBadges: {
    position: "absolute",
    bottom: 8,
    right: 8,
    flexDirection: "row",
    gap: 6,
  },
  resolutionBadge: {
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 6,
  },
  resolutionText: {
    color: "#fff",
    fontSize: 9,
    fontWeight: "700",
  },
  durationBadge: {
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 6,
  },
  durationText: {
    color: "#fff",
    fontSize: 9,
    fontWeight: "600",
  },
  favoriteBadge: {
    position: "absolute",
    top: 8,
    right: 8,
    backgroundColor: "rgba(0,0,0,0.4)",
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  cardInfo: {
    padding: 12,
  },
  cardTitleRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 4,
  },
  projectName: {
    fontSize: 15,
    fontWeight: "700",
    flex: 1,
    paddingRight: 8,
  },
  moreButton: {
    padding: 4,
    marginRight: -4,
  },
  lastEdited: {
    fontSize: 12,
    marginBottom: 10,
  },
  statusBadge: {
    alignSelf: "flex-start",
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 6,
  },
  statusText: {
    fontSize: 11,
    fontWeight: "600",
  },
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginBottom: 16,
    marginLeft: 20,
  },
  quickActionCard: {
    width: 120,
    height: 120,
    borderRadius: 20,
    padding: 16,
    justifyContent: "space-between",
    marginLeft: 20,
  },
  quickActionIcon: {
    width: 48,
    height: 48,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
  },
  quickActionText: {
    fontSize: 14,
    fontWeight: "600",
  },
  activityCard: {
    borderRadius: 24,
    padding: 20,
  },
  activityItem: {
    flexDirection: "row",
    marginBottom: 20,
    position: "relative",
  },
  activityLine: {
    position: "absolute",
    left: 15,
    top: 32,
    bottom: -20,
    width: 2,
  },
  activityIconBox: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
    zIndex: 1,
  },
  activityContent: {
    flex: 1,
    justifyContent: "center",
  },
  activityLabel: {
    fontSize: 14,
    fontWeight: "500",
    marginBottom: 2,
  },
  activityTime: {
    fontSize: 12,
  },
  emptyState: {
    width: "100%",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 40,
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
