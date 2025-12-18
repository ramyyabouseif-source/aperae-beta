import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../design';

export type PairingMode = 'dish-to-wine' | 'wine-to-dish';

interface PairingModeToggleProps {
  mode: PairingMode;
  onModeChange: (mode: PairingMode) => void;
  style?: any;
}

/**
 * Pairing Mode Toggle Component
 * 
 * Allows users to switch between:
 * - Dish → Wine: Enter a dish, get wine recommendations
 * - Wine → Dish: Enter a wine, get dish recommendations
 */
const PairingModeToggle: React.FC<PairingModeToggleProps> = ({
  mode,
  onModeChange,
  style,
}) => {
  return (
    <View style={[styles.container, style]}>
      <TouchableOpacity
        style={[
          styles.toggleButton,
          mode === 'dish-to-wine' && styles.toggleButtonActive,
        ]}
        onPress={() => onModeChange('dish-to-wine')}
        activeOpacity={0.7}
      >
        <Ionicons
          name="restaurant"
          size={18}
          color={mode === 'dish-to-wine' ? COLORS.text.inverse : COLORS.text.secondary}
        />
        <Text
          style={[
            styles.toggleText,
            mode === 'dish-to-wine' && styles.toggleTextActive,
          ]}
        >
          Dish → Wine
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[
          styles.toggleButton,
          mode === 'wine-to-dish' && styles.toggleButtonActive,
        ]}
        onPress={() => onModeChange('wine-to-dish')}
        activeOpacity={0.7}
      >
        <Ionicons
          name="wine"
          size={18}
          color={mode === 'wine-to-dish' ? COLORS.text.inverse : COLORS.text.secondary}
        />
        <Text
          style={[
            styles.toggleText,
            mode === 'wine-to-dish' && styles.toggleTextActive,
          ]}
        >
          Wine → Dish
        </Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: COLORS.neutral[100],
    borderRadius: 12,
    padding: 4,
    marginHorizontal: 16,
    marginVertical: 12,
    gap: 4,
    // Default styles - can be overridden by style prop
  },
  toggleButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    gap: 6,
    backgroundColor: 'transparent',
  },
  toggleButtonActive: {
    backgroundColor: COLORS.primary[500],
    shadowColor: COLORS.primary[500],
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  toggleText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.text.secondary,
  },
  toggleTextActive: {
    color: COLORS.text.inverse,
  },
});

export default PairingModeToggle;

