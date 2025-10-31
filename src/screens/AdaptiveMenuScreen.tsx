import React from 'react';
import { UI_CONFIG, hasEnhancedComponents } from '../config/uiConfig';
import SimpleEnhancedMenuScreen from './SimpleEnhancedMenuScreen';
import MenuScreen from './MenuScreen';

// This component automatically switches between original and enhanced menu screens
// based on the UI configuration
const AdaptiveMenuScreen: React.FC = () => {
  // Use enhanced component if available and enabled
  if (hasEnhancedComponents()) {
    return <SimpleEnhancedMenuScreen />;
  }

  // Fallback to original MenuScreen implementation
  return <MenuScreen />;
};

export default AdaptiveMenuScreen;
