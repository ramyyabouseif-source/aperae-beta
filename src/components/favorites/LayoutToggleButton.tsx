import React from 'react';
import { View, TouchableOpacity, StyleSheet, Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export type LayoutType = 'grid' | 'list';

interface LayoutToggleButtonProps {
  layout: LayoutType;
  onToggle: (layout: LayoutType) => void;
}

const LayoutToggleButton: React.FC<LayoutToggleButtonProps> = ({
  layout,
  onToggle,
}) => {
  const handlePress = () => {
    // Toggle between grid and list
    const newLayout = layout === 'grid' ? 'list' : 'grid';
    onToggle(newLayout);
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.toggleButton}
        onPress={handlePress}
        activeOpacity={0.7}
      >
        <View style={styles.buttonContent}>
          {layout === 'grid' ? (
            <>
              <Ionicons name="grid" size={20} color="#8B0000" />
              <Ionicons name="list-outline" size={20} color="#999" />
            </>
          ) : (
            <>
              <Ionicons name="grid-outline" size={20} color="#999" />
              <Ionicons name="list" size={20} color="#8B0000" />
            </>
          )}
        </View>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 60,
    right: 16,
    zIndex: 1000,
  },
  toggleButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 24,
    paddingHorizontal: 12,
    paddingVertical: 10,
    shadowColor: '#8B0000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 8,
    borderWidth: 1,
    borderColor: 'rgba(139, 0, 0, 0.2)',
  },
  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
});

export default LayoutToggleButton;

