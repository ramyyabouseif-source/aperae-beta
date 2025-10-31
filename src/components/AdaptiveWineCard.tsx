import React from 'react';
import { WineRecommendation } from '../types/wine';
import { UI_CONFIG, hasEnhancedComponents } from '../config/uiConfig';
import SimplePremiumWineCard from './SimplePremiumWineCard'; // Using SimplePremiumWineCard
import SimpleEnhancedWineCard from './SimpleEnhancedWineCard'; // Fallback
import WineCard from './WineCard';

interface AdaptiveWineCardProps {
  wine: WineRecommendation;
  onAddToFavorites?: (wine: WineRecommendation) => void;
  onRemoveFromFavorites?: (wine: WineRecommendation) => void;
  isFavorite?: boolean;
  onPress?: (wine: WineRecommendation) => void;
  index?: number;
}

const AdaptiveWineCard: React.FC<AdaptiveWineCardProps> = (props) => {
  // Use premium wine card if available and enabled
  if (hasEnhancedComponents()) {
    return <SimplePremiumWineCard {...props} />;
  }

  // Fallback to original WineCard implementation
  return <WineCard {...props} />;
};

export default AdaptiveWineCard;
