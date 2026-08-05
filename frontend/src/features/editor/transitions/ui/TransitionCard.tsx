import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { TransitionModel } from '../registry/TransitionTypes';

interface TransitionCardProps {
  item: TransitionModel;
  isSelected: boolean;
  isLocked: boolean;
  isFavorite: boolean;
  onSelect: (item: TransitionModel) => void;
  onToggleFavorite: (id: string) => void;
}

export const TransitionCard: React.FC<TransitionCardProps> = React.memo(({
  item,
  isSelected,
  isLocked,
  isFavorite,
  onSelect,
  onToggleFavorite
}) => {
  const isNone = item.id === 'none';

  return (
    <TouchableOpacity
      activeOpacity={0.8}
      style={[
        styles.cardContainer,
        isSelected && styles.cardSelected,
        isLocked && styles.cardLocked
      ]}
      onPress={() => !isLocked && onSelect(item)}
    >
      <View style={styles.thumbnailBox}>
        {isNone ? (
          <Ionicons name="close-circle-outline" size={28} color="#8E8E93" />
        ) : (
          <View style={styles.iconCircle}>
            <Ionicons name="swap-horizontal" size={22} color={isSelected ? '#FFCC00' : '#38BDF8'} />
          </View>
        )}

        {/* Lock Overlay Badge */}
        {isLocked && (
          <View style={styles.lockBadge}>
            <Ionicons name="lock-closed" size={12} color="#FFF" />
          </View>
        )}

        {/* Plan Badge */}
        {!isNone && item.plan !== 'FREE' && (
          <View style={[styles.planBadge, item.plan === 'PREMIUM' ? styles.planPremium : styles.planPro]}>
            <Text style={styles.planBadgeText}>{item.plan}</Text>
          </View>
        )}

        {/* Favorite Toggle */}
        {!isNone && (
          <TouchableOpacity
            style={styles.favoriteBtn}
            onPress={(e) => {
              e.stopPropagation();
              onToggleFavorite(item.id);
            }}
          >
            <Ionicons name={isFavorite ? 'heart' : 'heart-outline'} size={14} color={isFavorite ? '#EF4444' : 'rgba(255,255,255,0.6)'} />
          </TouchableOpacity>
        )}
      </View>

      <Text numberOfLines={1} style={[styles.cardTitle, isSelected && styles.cardTitleSelected]}>
        {item.name}
      </Text>

      {isSelected && (
        <View style={styles.selectedCheckMark}>
          <Ionicons name="checkmark-circle" size={14} color="#FFCC00" />
        </View>
      )}
    </TouchableOpacity>
  );
});

const styles = StyleSheet.create({
  cardContainer: {
    width: 84,
    height: 100,
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.08)',
    padding: 6,
    alignItems: 'center',
    justifyContent: 'space-between',
    marginRight: 10,
    position: 'relative'
  },
  cardSelected: {
    borderColor: '#FFCC00',
    backgroundColor: 'rgba(255, 204, 0, 0.12)'
  },
  cardLocked: {
    opacity: 0.55
  },
  thumbnailBox: {
    width: '100%',
    height: 58,
    borderRadius: 10,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
    overflow: 'hidden'
  },
  iconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.08)',
    justifyContent: 'center',
    alignItems: 'center'
  },
  lockBadge: {
    position: 'absolute',
    top: 4,
    left: 4,
    backgroundColor: 'rgba(0,0,0,0.65)',
    padding: 3,
    borderRadius: 8
  },
  planBadge: {
    position: 'absolute',
    bottom: 4,
    right: 4,
    paddingHorizontal: 4,
    paddingVertical: 2,
    borderRadius: 4
  },
  planPro: {
    backgroundColor: '#8B5CF6'
  },
  planPremium: {
    backgroundColor: '#EC4899'
  },
  planBadgeText: {
    color: '#FFF',
    fontSize: 8,
    fontWeight: '800'
  },
  favoriteBtn: {
    position: 'absolute',
    top: 4,
    right: 4,
    padding: 2
  },
  cardTitle: {
    fontSize: 11,
    color: '#D0D0D5',
    fontWeight: '500',
    textAlign: 'center',
    marginTop: 4
  },
  cardTitleSelected: {
    color: '#FFCC00',
    fontWeight: '700'
  },
  selectedCheckMark: {
    position: 'absolute',
    top: -4,
    right: -4,
    backgroundColor: '#000',
    borderRadius: 8
  }
});
