import React from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';

interface TransitionCategoryTabsProps {
  categories: string[];
  activeCategory: string;
  onSelectCategory: (category: string) => void;
}

export const TransitionCategoryTabs: React.FC<TransitionCategoryTabsProps> = React.memo(({
  categories,
  activeCategory,
  onSelectCategory
}) => {
  return (
    <View style={styles.tabsContainer}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {categories.map((cat) => {
          const isActive = cat === activeCategory;
          return (
            <TouchableOpacity
              key={cat}
              activeOpacity={0.8}
              style={[styles.tabChip, isActive && styles.tabChipActive]}
              onPress={() => onSelectCategory(cat)}
            >
              <Text style={[styles.tabText, isActive && styles.tabTextActive]}>
                {cat}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
});

const styles = StyleSheet.create({
  tabsContainer: {
    marginVertical: 10
  },
  scrollContent: {
    paddingHorizontal: 16,
    gap: 8
  },
  tabChip: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)'
  },
  tabChipActive: {
    backgroundColor: 'rgba(255, 204, 0, 0.2)',
    borderColor: '#FFCC00'
  },
  tabText: {
    color: '#8E8E93',
    fontSize: 12,
    fontWeight: '600'
  },
  tabTextActive: {
    color: '#FFCC00',
    fontWeight: '700'
  }
});
