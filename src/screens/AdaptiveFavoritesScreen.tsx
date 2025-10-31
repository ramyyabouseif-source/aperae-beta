import React from 'react';
import { UI_CONFIG, hasEnhancedComponents } from '../config/uiConfig';
import SimpleEnhancedFavoritesScreen from './SimpleEnhancedFavoritesScreen';
import FavoritesScreen from './FavoritesScreen';

// This component automatically switches between original and enhanced favorites screens
// based on the UI configuration
const AdaptiveFavoritesScreen: React.FC = () => {
  // Use enhanced component if available and enabled
  if (hasEnhancedComponents()) {
    return <SimpleEnhancedFavoritesScreen />;
  }

  // Fallback to original FavoritesScreen implementation
  return <FavoritesScreen />;
};

export default AdaptiveFavoritesScreen;
