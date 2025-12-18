import React from 'react';
import { View, Text, Switch, StyleSheet } from 'react-native';
import { WineService } from '../services/wineService';
import { DishService } from '../services/dishService';

interface MockModeToggleProps {
  onToggle?: (isMockMode: boolean) => void;
}

export default function MockModeToggle({ onToggle }: MockModeToggleProps) {
  const [isMockMode, setIsMockMode] = React.useState(WineService.isMockModeEnabled());

  const handleToggle = (value: boolean) => {
    setIsMockMode(value);
    // Set mock mode for both services
    WineService.setMockMode(value);
    DishService.setMockMode(value);
    onToggle?.(value);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Mock Mode</Text>
      <Switch
        value={isMockMode}
        onValueChange={handleToggle}
        trackColor={{ false: '#767577', true: '#5B2433' }} // Dark tone
        thumbColor={isMockMode ? '#fff' : '#f4f3f4'}
      />
      <Text style={styles.status}>
        {isMockMode ? 'Using mock data' : 'Live API mode'}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12, // Consistent padding with menu buttons
    backgroundColor: 'rgba(247, 244, 240, 0.95)', // Light tone background
    borderRadius: 16, // Consistent radius
    marginHorizontal: 20, // Consistent margins
    marginBottom: 32, // Consistent spacing
    shadowColor: '#BF9694', // Metallic accent shadow
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 12,
    borderWidth: 1,
    borderColor: 'rgba(191, 150, 148, 0.3)', // Metallic accent border
  },
  label: {
    fontSize: 16, // Consistent font size
    fontWeight: '600',
    color: '#5B2433', // Dark tone text color
    marginRight: 12, // Consistent margin
  },
  status: {
    fontSize: 14, // Consistent font size
    color: '#5B2433', // Dark tone text color
    marginLeft: 12, // Consistent margin
  },
});