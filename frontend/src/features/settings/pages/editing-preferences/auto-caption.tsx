import React, { useState } from "react";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { useTheme } from "@/src/theme";
import { useEditorPreferencesStore } from "@/src/store/editor-preferences.store";

const LANGUAGES = [
  "Auto Detect",
  "English",
  "Hindi",
  "Kannada",
  "Tamil",
  "Telugu",
  "Malayalam",
  "Marathi",
  "Bengali",
  "Gujarati",
  "Punjabi",
  "Spanish",
  "French",
  "German",
  "Portuguese",
  "Japanese",
  "Korean",
];

export default function AutoCaptionLanguageScreen() {
  const { theme } = useTheme();
  const router = useRouter();
  const { autoCaptionLanguage, setAutoCaptionLanguage } = useEditorPreferencesStore();
  const [search, setSearch] = useState("");

  const filtered = LANGUAGES.filter((lang) => lang.toLowerCase().includes(search.toLowerCase()));

  return (
    <SafeAreaView edges={["top"]} style={{ flex: 1, backgroundColor: theme.colors.background }}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color={theme.colors.textPrimary} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: theme.colors.textPrimary }]}>Auto Caption Language</Text>
        <View style={{ width: 40 }} />
      </View>
      
      <View style={[styles.searchContainer, { backgroundColor: theme.colors.surfaceElevated }]}>
        <Ionicons name="search" size={20} color={theme.colors.textMuted} style={styles.searchIcon} />
        <TextInput
          style={[styles.searchInput, { color: theme.colors.textPrimary }]}
          placeholder="Search languages..."
          placeholderTextColor={theme.colors.textMuted}
          value={search}
          onChangeText={setSearch}
        />
      </View>

      <ScrollView contentContainerStyle={{ paddingBottom: 20 }}>
        <View style={[styles.cardGroup, { backgroundColor: theme.colors.surfaceElevated }]}>
          {filtered.map((lang, index) => {
            const isLast = index === filtered.length - 1;
            const isSelected = autoCaptionLanguage === lang;
            return (
              <TouchableOpacity
                key={lang}
                style={[styles.listItem, !isLast && { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: theme.colors.border }]}
                activeOpacity={0.7}
                onPress={() => setAutoCaptionLanguage(lang)}
              >
                <Text style={[styles.listTitle, { color: theme.colors.textPrimary, flex: 1 }]}>
                  {lang}
                </Text>
                {isSelected && (
                  <Ionicons name="checkmark" size={20} color={theme.colors.primary} />
                )}
              </TouchableOpacity>
            );
          })}
          {filtered.length === 0 && (
            <View style={styles.emptyContainer}>
              <Text style={{ color: theme.colors.textMuted }}>No languages found</Text>
            </View>
          )}
        </View>
        <Text style={[styles.footerText, { color: theme.colors.textSecondary }]}>
          Choose the default language for speech-to-text captions. You can override it during individual caption generation.
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  header: { flexDirection: "row", alignItems: "center", paddingHorizontal: 16, paddingVertical: 12 },
  backBtn: { width: 40, height: 40, justifyContent: "center" },
  headerTitle: { flex: 1, textAlign: "center", fontSize: 18, fontWeight: "700" },
  searchContainer: { flexDirection: "row", alignItems: "center", marginHorizontal: 20, marginBottom: 20, borderRadius: 12, paddingHorizontal: 12, height: 44 },
  searchIcon: { marginRight: 8 },
  searchInput: { flex: 1, fontSize: 16 },
  cardGroup: { marginHorizontal: 20, borderRadius: 20, overflow: "hidden" },
  listItem: { flexDirection: "row", alignItems: "center", paddingVertical: 16, paddingHorizontal: 16 },
  listTitle: { fontSize: 16, fontWeight: "500" },
  emptyContainer: { padding: 20, alignItems: "center" },
  footerText: { marginTop: 16, marginHorizontal: 36, fontSize: 13, textAlign: "center" }
});
