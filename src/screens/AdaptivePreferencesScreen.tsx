import React from 'react';
import { UI_CONFIG, hasEnhancedComponents } from '../config/uiConfig';
import SimpleEnhancedPreferencesScreen from './SimpleEnhancedPreferencesScreen';
import PreferencesScreen from './PreferencesScreen';

// This component automatically switches between original and enhanced preferences screens
// based on the UI configuration
const AdaptivePreferencesScreen: React.FC = () => {
  // Disable Preferences Screen in enhanced mode
  if (hasEnhancedComponents()) {
    return null;
  }

  // Fallback to original PreferencesScreen implementation
  return <PreferencesScreen />;
};

export default AdaptivePreferencesScreen;
