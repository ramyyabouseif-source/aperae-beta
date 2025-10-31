import React from 'react';
import { UI_CONFIG, hasEnhancedComponents } from '../config/uiConfig';
import SimpleEnhancedHomeScreen from './SimpleEnhancedHomeScreen';
import HomeScreen from './HomeScreen';

// This component automatically switches between original and enhanced home screens
// based on the UI configuration
const AdaptiveHomeScreen: React.FC = () => {
  // Use enhanced component if available and enabled
  if (hasEnhancedComponents()) {
    return <SimpleEnhancedHomeScreen />;
  }

  // Fallback to original HomeScreen implementation
  return <HomeScreen />;
};

export default AdaptiveHomeScreen;
