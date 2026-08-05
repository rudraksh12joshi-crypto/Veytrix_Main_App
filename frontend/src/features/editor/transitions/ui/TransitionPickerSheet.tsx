import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Dimensions
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { TransitionModel, TransitionPlan } from '../registry/TransitionTypes';
import { TransitionRegistry } from '../registry/TransitionRegistry';
import { ExecutionGraphFactory } from '../execution/ExecutionGraphFactory';
import { TransitionPreviewController } from '../preview/TransitionPreviewController';
import { TransitionCard } from './TransitionCard';
import { TransitionCategoryTabs } from './TransitionCategoryTabs';
import { TransitionDurationSlider } from './TransitionDurationSlider';
import { TransitionStore } from './TransitionStore';

export interface TransitionPairInfo {
  fromId: string;
  toId: string;
  fromIndex: number;
  toIndex: number;
}

interface TransitionPickerSheetProps {
  activePair: TransitionPairInfo | null;
  allPairs: TransitionPairInfo[];
  savedTransitionId?: string;
  savedDuration?: number;
  onSelectPair: (pair: TransitionPairInfo) => void;
  onApplyTransition: (transitionData: {
    transitionId: string;
    duration: number;
    engineKey?: string;
    category?: string;
  }) => void;
  onClose: () => void;
  bottomInset?: number;
}

const NONE_MODEL: TransitionModel = {
  id: 'none',
  name: 'None',
  category: 'Basic',
  subcategory: 'Basic',
  plan: 'FREE',
  engineKey: 'none',
  duration: 0.5,
  defaultDuration: 0.5,
  minDuration: 0.1,
  maxDuration: 3.0,
  thumbnail: '',
  preview: '',
  tags: ['none'],
  description: 'Remove transition',
  enabled: true,
  version: '1.0.0',
  parameters: {}
};

export const TransitionPickerSheet: React.FC<TransitionPickerSheetProps> = ({
  activePair,
  allPairs,
  savedTransitionId = 'none',
  savedDuration = 0.5,
  onSelectPair,
  onApplyTransition,
  onClose,
  bottomInset = 20
}) => {
  const registry = useMemo(() => {
    const reg = TransitionRegistry.getInstance();
    reg.initialize();
    return reg;
  }, []);

  const store = TransitionStore.getInstance();
  const userPlan = store.getUserPlan();

  const categories = useMemo(() => registry.getCategories(), [registry]);
  const [activeCategory, setActiveCategory] = useState<string>(categories[0] || 'Basic');

  const [selectedModel, setSelectedModel] = useState<TransitionModel>(() => {
    if (savedTransitionId && savedTransitionId !== 'none') {
      const found = registry.getTransitionById(savedTransitionId);
      if (found) return found;
    }
    return NONE_MODEL;
  });

  const [currentDuration, setCurrentDuration] = useState<number>(savedDuration);
  const [favMap, setFavMap] = useState<Record<string, boolean>>({});

  // Restore selection when active pair or saved transition changes
  useEffect(() => {
    if (savedTransitionId && savedTransitionId !== 'none') {
      const model = registry.getTransitionById(savedTransitionId);
      if (model) {
        setSelectedModel(model);
        setActiveCategory(model.category);
        triggerPreview(model, savedDuration);
        return;
      }
    }
    setSelectedModel(NONE_MODEL);
    TransitionPreviewController.getInstance().clearTransition();
  }, [savedTransitionId, savedDuration, activePair, registry]);

  const triggerPreview = (model: TransitionModel, duration: number) => {
    if (model.id === 'none') {
      TransitionPreviewController.getInstance().clearTransition();
      return;
    }

    const graph = ExecutionGraphFactory.getInstance().createExecutionGraph(model.id, duration);
    if (graph) {
      const controller = TransitionPreviewController.getInstance();
      controller.setTransition(graph);
      controller.playPreview();
    }
  };

  const handleSelectModel = useCallback((model: TransitionModel) => {
    setSelectedModel(model);
    store.addRecent(model.id);
    triggerPreview(model, currentDuration);
  }, [currentDuration, store]);

  const handleChangeDuration = useCallback((newDuration: number) => {
    setCurrentDuration(newDuration);
    if (selectedModel.id !== 'none') {
      triggerPreview(selectedModel, newDuration);
    }
  }, [selectedModel]);

  const handleToggleFavorite = useCallback((id: string) => {
    const res = store.toggleFavorite(id);
    setFavMap((prev) => ({ ...prev, [id]: res }));
  }, [store]);

  const handleApply = () => {
    onApplyTransition({
      transitionId: selectedModel.id,
      duration: currentDuration,
      engineKey: selectedModel.engineKey,
      category: selectedModel.category
    });
    onClose();
  };

  const categoryTransitions = useMemo(() => {
    const list = registry.getTransitionsByCategory(activeCategory);
    if (activeCategory === 'Basic') {
      return [NONE_MODEL, ...list];
    }
    return list;
  }, [registry, activeCategory]);

  const fromClipIndex = activePair ? activePair.fromIndex : 0;
  const toClipIndex = activePair ? activePair.toIndex : 1;

  return (
    <View style={[styles.sheetContainer, { paddingBottom: Math.max(bottomInset, 20) }]}>
      {/* Drag Indicator Bar */}
      <View style={styles.dragBarContainer}>
        <View style={styles.dragBar} />
      </View>

      {/* Header Bar */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <View style={styles.iconCircle}>
            <Ionicons name="swap-horizontal" size={18} color="#FFCC00" />
          </View>
          <View>
            <Text style={styles.title}>Clip Transition</Text>
            <Text style={styles.subtitle}>
              Clip {fromClipIndex + 1} ➔ Clip {toClipIndex + 1}
            </Text>
          </View>
        </View>

        <View style={styles.headerActions}>
          <TouchableOpacity style={styles.applyBtn} onPress={handleApply} activeOpacity={0.8}>
            <Ionicons name="checkmark" size={18} color="#000" />
            <Text style={styles.applyBtnText}>Apply</Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={onClose} style={styles.closeBtn} activeOpacity={0.7}>
            <Ionicons name="close-circle" size={24} color="#666" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Pair Junction Selector */}
      {allPairs.length > 1 && (
        <View style={styles.pairChipsRow}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8 }}>
            {allPairs.map((pair) => {
              const isActive = activePair?.fromId === pair.fromId && activePair?.toId === pair.toId;
              return (
                <TouchableOpacity
                  key={`${pair.fromId}_${pair.toId}`}
                  style={[styles.pairChip, isActive && styles.pairChipActive]}
                  onPress={() => onSelectPair(pair)}
                  activeOpacity={0.8}
                >
                  <Text style={[styles.pairChipText, isActive && styles.pairChipTextActive]}>
                    Clip {pair.fromIndex + 1} ➔ Clip {pair.toIndex + 1}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>
      )}

      {/* Dynamic Category Tabs */}
      <TransitionCategoryTabs
        categories={categories}
        activeCategory={activeCategory}
        onSelectCategory={setActiveCategory}
      />

      {/* Real-time Duration Slider */}
      {selectedModel.id !== 'none' && (
        <TransitionDurationSlider
          duration={currentDuration}
          minDuration={selectedModel.minDuration || 0.1}
          maxDuration={selectedModel.maxDuration || 3.0}
          onChangeDuration={handleChangeDuration}
        />
      )}

      {/* Transition Cards List */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.cardsScroll}
      >
        {categoryTransitions.map((item) => {
          const isSelected = selectedModel.id === item.id;
          const isLocked = item.plan === 'PRO' && userPlan === 'FREE' || item.plan === 'PREMIUM' && userPlan !== 'PREMIUM';
          const isFav = store.isFavorite(item.id);

          return (
            <TransitionCard
              key={item.id}
              item={item}
              isSelected={isSelected}
              isLocked={isLocked}
              isFavorite={isFav}
              onSelect={handleSelectModel}
              onToggleFavorite={handleToggleFavorite}
            />
          );
        })}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  sheetContainer: {
    backgroundColor: '#1A1A1D',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingTop: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -12 },
    shadowOpacity: 0.35,
    shadowRadius: 20,
    elevation: 16
  },
  dragBarContainer: {
    alignItems: 'center',
    paddingVertical: 4
  },
  dragBar: {
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: 'rgba(255,255,255,0.2)'
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginVertical: 6
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10
  },
  iconCircle: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: 'rgba(255,204,0,0.15)',
    justifyContent: 'center',
    alignItems: 'center'
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
    color: '#fff'
  },
  subtitle: {
    fontSize: 12,
    color: '#A0A0A0',
    marginTop: 2
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10
  },
  applyBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#FFCC00',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16
  },
  applyBtnText: {
    color: '#000',
    fontSize: 13,
    fontWeight: '700'
  },
  closeBtn: {
    padding: 2
  },
  pairChipsRow: {
    paddingHorizontal: 16,
    marginBottom: 6
  },
  pairChip: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)'
  },
  pairChipActive: {
    backgroundColor: 'rgba(255,204,0,0.2)',
    borderColor: '#FFCC00'
  },
  pairChipText: {
    color: '#8E8E93',
    fontSize: 11,
    fontWeight: '600'
  },
  pairChipTextActive: {
    color: '#FFCC00',
    fontWeight: '700'
  },
  cardsScroll: {
    paddingHorizontal: 16,
    paddingBottom: 16,
    paddingTop: 8
  }
});
