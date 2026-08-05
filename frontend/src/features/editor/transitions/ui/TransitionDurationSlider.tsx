import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface TransitionDurationSliderProps {
  duration: number;
  minDuration: number;
  maxDuration: number;
  onChangeDuration: (newDuration: number) => void;
}

export const TransitionDurationSlider: React.FC<TransitionDurationSliderProps> = React.memo(({
  duration,
  minDuration = 0.1,
  maxDuration = 3.0,
  onChangeDuration
}) => {
  const step = 0.1;

  const handleDecrease = () => {
    const next = Math.max(minDuration, Math.round((duration - step) * 10) / 10);
    onChangeDuration(next);
  };

  const handleIncrease = () => {
    const next = Math.min(maxDuration, Math.round((duration + step) * 10) / 10);
    onChangeDuration(next);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Duration: {duration.toFixed(1)}s</Text>
      <View style={styles.controlsRow}>
        <TouchableOpacity style={styles.stepBtn} onPress={handleDecrease}>
          <Ionicons name="remove" size={16} color="#FFF" />
        </TouchableOpacity>

        <View style={styles.trackBackground}>
          <View
            style={[
              styles.trackFill,
              { width: `${((duration - minDuration) / (maxDuration - minDuration)) * 100}%` }
            ]}
          />
        </View>

        <TouchableOpacity style={styles.stepBtn} onPress={handleIncrease}>
          <Ionicons name="add" size={16} color="#FFF" />
        </TouchableOpacity>
      </View>
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    marginVertical: 8
  },
  label: {
    color: '#A0A0A0',
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 6
  },
  controlsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12
  },
  stepBtn: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(255,255,255,0.1)',
    justifyContent: 'center',
    alignItems: 'center'
  },
  trackBackground: {
    flex: 1,
    height: 6,
    borderRadius: 3,
    backgroundColor: 'rgba(255,255,255,0.1)',
    overflow: 'hidden'
  },
  trackFill: {
    height: '100%',
    backgroundColor: '#FFCC00',
    borderRadius: 3
  }
});
