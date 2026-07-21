import React, { useState, useRef, useMemo, useEffect } from "react";
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
import { useProjectsStore } from "@/src/store/projects.store";

const { width } = Dimensions.get("window");

const FILTER_CHIPS = ["All", "Recent", "Drafts", "Completed", "Favorites"];


function AnimatedPressable({ children, onPress, style }: { children: React.ReactNode, onPress: () => void, style?: any }) {
  const scale = useRef(new Animated.Value(1)).current;
  return (
    <Pressable
      onPress={onPress}
      onPressIn={() => Animated.spring(scale, { toValue: 0.95, useNativeDriver: true }).start()}
      onPressOut={() => Animated.spring(scale, { toValue: 1, useNativeDriver: true }).start()}
    >
      <Animated.View style={[style, { transform: [{ scale }] }]}>
        {children}
      </Animated.View>
    </Pressable>
  );
}

export function ProjectsPage() {
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();
  const projects = useProjectsStore((s) => s.projects);
  const [activeFilter, setActiveFilter] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [filterSheetVisible, setFilterSheetVisible] = useState(false);
  const [menuSheetVisible, setMenuSheetVisible] = useState(false);
  const [selectedProject, setSelectedProject] = useState<any>(null);

  // Global Fade In
  const pageOpacity = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.timing(pageOpacity, {
      toValue: 1,
      duration: 400,
      useNativeDriver: true,
    }).start();
  }, [pageOpacity]);

  // FAB Hide on scroll logic
  const scrollY = useRef(new Animated.Value(0)).current;
  const lastScrollY = useRef(0);
  const fabTranslateY = useRef(new Animated.Value(0)).current;

  const handleScroll = Animated.event(
    [{ nativeEvent: { contentOffset: { y: scrollY } } }],
    {
      useNativeDriver: true,
      listener: (event: any) => {
        const currentY = event.nativeEvent.contentOffset.y;
        if (currentY > lastScrollY.current && currentY > 50) {
          // Scrolling down
          Animated.spring(fabTranslateY, { toValue: 150, useNativeDriver: true, speed: 20 }).start();
        } else if (currentY < lastScrollY.current || currentY < 50) {
          // Scrolling up
          Animated.spring(fabTranslateY, { toValue: 0, useNativeDriver: true, speed: 20 }).start();
        }
        lastScrollY.current = currentY;
      },
    }
  );

  const draftsCount = projects.filter((p: any) => p.status === "Draft").length;
  const completedCount = projects.filter((p: any) => p.status === "Completed").length;

  const handleMorePress = (project: any) => {
    setSelectedProject(project);
    setMenuSheetVisible(true);
  };

  const renderProjectCard = (item: any) => {
    return (
      <AnimatedPressable key={item.id} onPress={() => {}} style={[styles.projectCard, { backgroundColor: "#fff" }]}>
        <View style={styles.thumbnailWrapper}>
          <LinearGradient colors={item.thumbnailColors || ["#1D2B64", "#3B6CE7"]} style={styles.thumbnail} />
          <View style={styles.thumbnailBadges}>
            {item.resolution && (
              <View style={[styles.badge, { backgroundColor: "rgba(0,0,0,0.6)" }]}>
                <Text style={styles.badgeText}>{item.resolution}</Text>
              </View>
            )}
            {item.duration && (
              <View style={[styles.badge, { backgroundColor: "rgba(0,0,0,0.6)" }]}>
                <Text style={styles.badgeText}>{item.duration}</Text>
              </View>
            )}
            {item.aspectRatio && (
              <View style={[styles.badge, { backgroundColor: "rgba(0,0,0,0.6)" }]}>
                <Ionicons name={item.aspectRatio === "9:16" ? "phone-portrait-outline" : "tv-outline"} size={10} color="#fff" style={{marginRight: 2}} />
                <Text style={styles.badgeText}>{item.aspectRatio}</Text>
              </View>
            )}
          </View>
          <View style={styles.continueOverlay}>
            <Text style={styles.continueText}>Tap to continue editing</Text>
          </View>
        </View>

        <View style={styles.cardInfo}>
          <View style={styles.cardTitleRow}>
            <Text style={[styles.projectName, { color: "#1D2B64" }]} numberOfLines={1}>
              {item.name || "Untitled Project"}
            </Text>
            <TouchableOpacity onPress={() => handleMorePress(item)} style={styles.moreButton} hitSlop={10}>
              <Ionicons name="ellipsis-vertical" size={16} color="#8E8E93" />
            </TouchableOpacity>
          </View>
          <Text style={[styles.lastEdited, { color: "#8E8E93" }]} numberOfLines={1}>
            {item.lastEdited || "Recently edited"}
          </Text>
        </View>
      </AnimatedPressable>
    );
  };


  return (
    <Animated.View style={[styles.container, { backgroundColor: "#F5F7FA", opacity: pageOpacity }]}>
      <Animated.ScrollView
        contentContainerStyle={{ paddingBottom: insets.bottom + 120, paddingTop: insets.top + 20 }}
        showsVerticalScrollIndicator={false}
        onScroll={handleScroll}
        scrollEventThrottle={16}
      >
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.title}>Projects</Text>
            <Text style={styles.subtitle}>Manage your creative work.</Text>
          </View>
          <View style={styles.headerIcons}>
            <TouchableOpacity style={styles.iconButton}>
              <Ionicons name="search" size={20} color="#1D2B64" />
            </TouchableOpacity>
            <TouchableOpacity style={styles.iconButton} onPress={() => setFilterSheetVisible(true)}>
              <Ionicons name="options" size={20} color="#1D2B64" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Compact Summary Card */}
        <View style={styles.summaryCard}>
          <View style={styles.summaryItem}>
            <Text style={styles.summaryLabel}>Projects</Text>
            <Text style={styles.summaryValue}>{projects.length}</Text>
          </View>
          <View style={styles.summaryDivider} />
          <View style={styles.summaryItem}>
            <Text style={styles.summaryLabel}>Drafts</Text>
            <Text style={styles.summaryValue}>{draftsCount}</Text>
          </View>
          <View style={styles.summaryDivider} />
          <View style={styles.summaryItem}>
            <Text style={styles.summaryLabel}>Completed</Text>
            <Text style={styles.summaryValue}>{completedCount}</Text>
          </View>
          <View style={styles.summaryDivider} />
          <View style={styles.summaryItem}>
            <Text style={styles.summaryLabel}>Storage</Text>
            <Text style={styles.summaryValue}>0 GB</Text>
          </View>
        </View>

        {/* Search */}
        <View style={styles.searchContainer}>
          <View style={styles.searchBox}>
            <Ionicons name="search" size={18} color="#8E8E93" />
            <TextInput
              style={styles.searchInput}
              placeholder="Search projects..."
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

        {/* Projects Content */}
        {projects.length > 0 ? (
          <View style={styles.gridContainer}>
            {projects.map(renderProjectCard)}
          </View>
        ) : (
          <View style={styles.emptyContainer}>
            <View style={styles.emptyIllustration}>
              <Ionicons name="folder-open" size={64} color="#3B6CE7" />
            </View>
            <Text style={styles.emptyTitle}>No Projects Yet</Text>
            <Text style={styles.emptySubtitle}>Create your first project to start editing with AI.</Text>
            
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
      </Animated.ScrollView>

      {/* Floating Action Button */}
      {projects.length > 0 && (
        <Animated.View style={[styles.fabContainer, { transform: [{ translateY: fabTranslateY }], bottom: insets.bottom + 20 }]}>
          <TouchableOpacity style={styles.fabGlowWrapper} activeOpacity={0.8}>
            <LinearGradient colors={["#1D2B64", "#3B6CE7"]} style={styles.fab} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
              <Ionicons name="add" size={24} color="#fff" />
              <Text style={styles.fabText}>New Project</Text>
            </LinearGradient>
          </TouchableOpacity>
        </Animated.View>
      )}

      {/* Filter Bottom Sheet */}
      <Modal visible={filterSheetVisible} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <TouchableOpacity style={StyleSheet.absoluteFillObject} onPress={() => setFilterSheetVisible(false)} />
          <View style={[styles.bottomSheet, { paddingBottom: insets.bottom + 20 }]}>
            <View style={styles.sheetHandle} />
            <Text style={styles.sheetTitle}>Filter & Sort</Text>
            
            <Text style={styles.sheetSectionTitle}>Sort By</Text>
            <View style={styles.sheetOptionsRow}>
              {["Recent", "Name", "Date Created", "Last Edited", "Duration", "Resolution"].map(opt => (
                <TouchableOpacity key={opt} style={styles.sheetOptionChip}>
                  <Text style={styles.sheetOptionText}>{opt}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={styles.sheetSectionTitle}>Status</Text>
            <View style={styles.sheetOptionsRow}>
              {["Draft", "Completed", "In Progress", "Favorites"].map(opt => (
                <TouchableOpacity key={opt} style={styles.sheetOptionChip}>
                  <Text style={styles.sheetOptionText}>{opt}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </View>
      </Modal>

      {/* Project Menu Bottom Sheet */}
      <Modal visible={menuSheetVisible} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <TouchableOpacity style={StyleSheet.absoluteFillObject} onPress={() => setMenuSheetVisible(false)} />
          <View style={[styles.bottomSheet, { paddingBottom: insets.bottom + 20 }]}>
            <View style={styles.sheetHandle} />
            <Text style={styles.sheetTitle} numberOfLines={1}>
              {selectedProject?.name || "Project Options"}
            </Text>
            {[
              { icon: "open-outline", label: "Open" },
              { icon: "pencil", label: "Rename" },
              { icon: "copy-outline", label: "Duplicate" },
              { icon: "folder-open-outline", label: "Move" },
              { icon: "share-outline", label: "Share" },
              { icon: "cloud-upload-outline", label: "Export" },
              { icon: "trash-outline", label: "Delete", destructive: true },
            ].map((opt, i) => (
              <TouchableOpacity key={i} style={styles.sheetMenuItem}>
                <Ionicons name={opt.icon as any} size={22} color={opt.destructive ? "#FF3B3B" : "#1D2B64"} />
                <Text style={[styles.sheetMenuItemText, { color: opt.destructive ? "#FF3B3B" : "#1D2B64" }]}>
                  {opt.label}
                </Text>
              </TouchableOpacity>
            ))}
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
    marginBottom: 20,
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
  summaryCard: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#fff",
    marginHorizontal: 20,
    height: 90,
    borderRadius: 20,
    paddingHorizontal: 20,
    marginBottom: 24,
    shadowColor: "#1D2B64",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 4,
  },
  summaryItem: {
    alignItems: "center",
    justifyContent: "center",
    flex: 1,
  },
  summaryLabel: {
    fontSize: 12,
    fontWeight: "600",
    color: "#8E8E93",
    marginBottom: 4,
  },
  summaryValue: {
    fontSize: 20,
    fontWeight: "800",
    color: "#1D2B64",
  },
  summaryDivider: {
    width: 1,
    height: 40,
    backgroundColor: "#E5E5EA",
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
  gridContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    paddingHorizontal: 20,
    justifyContent: "space-between",
    marginBottom: 24,
  },
  projectCard: {
    width: (width - 56) / 2,
    borderRadius: 24,
    marginBottom: 16,
    overflow: "hidden",
    shadowColor: "#1D2B64",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 4,
  },
  thumbnailWrapper: {
    height: (width - 56) / 2 * 0.85,
    width: "100%",
  },
  thumbnail: {
    flex: 1,
  },
  thumbnailBadges: {
    position: "absolute",
    bottom: 8,
    left: 8,
    right: 8,
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 4,
  },
  badge: {
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 6,
    flexDirection: "row",
    alignItems: "center",
  },
  badgeText: {
    color: "#fff",
    fontSize: 9,
    fontWeight: "700",
  },
  continueOverlay: {
    position: "absolute",
    top: 0, left: 0, right: 0, bottom: 0,
    backgroundColor: "rgba(29, 43, 100, 0.4)",
    justifyContent: "center",
    alignItems: "center",
    opacity: 0,
  },
  continueText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "700",
    opacity: 0.9,
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
    fontWeight: "500",
  },
  emptyContainer: {
    paddingHorizontal: 20,
    alignItems: "center",
    marginTop: 20,
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
    backgroundColor: "#3B6CE7",
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 16,
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
    backgroundColor: "#fff",
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: "#E5E5EA",
  },
  secondaryButtonText: {
    color: "#1D2B64",
    fontSize: 15,
    fontWeight: "700",
  },
  fabContainer: {
    position: "absolute",
    right: 20,
    zIndex: 100,
  },
  fabGlowWrapper: {
    shadowColor: "#3B6CE7",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
    elevation: 8,
  },
  fab: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderRadius: 999,
  },
  fabText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "700",
    marginLeft: 8,
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
  sheetSectionTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: "#8E8E93",
    marginTop: 8,
    marginBottom: 12,
  },
  sheetOptionsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginBottom: 20,
  },
  sheetOptionChip: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 999,
    backgroundColor: "#F5F7FA",
    borderWidth: 1,
    borderColor: "#E5E5EA",
  },
  sheetOptionText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#1D2B64",
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
});
