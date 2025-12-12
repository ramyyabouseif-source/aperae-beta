import React from 'react';
import { WineRecommendation, WineRecommendationResponse } from '../types/wine';
import { UI_CONFIG, hasEnhancedComponents, useWineCardV2 } from '../config/uiConfig';
import SimplePremiumWineCard from './SimplePremiumWineCard'; // Using SimplePremiumWineCard
import SimpleEnhancedWineCard from './SimpleEnhancedWineCard'; // Fallback
import FlipWineCard from './FlipWineCard'; // V2 Enhanced with flip
import WineCard from './WineCard';
import WineCardV2 from './WineCardV2'; // V2 Original

interface AdaptiveWineCardProps {
  wine: WineRecommendation;
  onAddToFavorites?: (wine: WineRecommendation) => void;
  onRemoveFromFavorites?: (wine: WineRecommendation) => void;
  isFavorite?: boolean;
  onPress?: (wine: WineRecommendation) => void;
  index?: number;
}

const AdaptiveWineCard: React.FC<AdaptiveWineCardProps> = (props) => {
  const isV2 = useWineCardV2();
  const isEnhanced = hasEnhancedComponents();

  // V2 Enhanced Cards (with new fields and flip effect)
  if (isV2 && isEnhanced) {
    return <FlipWineCard {...props} index={props.index} />;
  }

  // V2 Original Cards (with new fields)
  if (isV2 && !isEnhanced) {
    return <WineCardV2 {...props} index={props.index} />;
  }

  // V1 Enhanced Cards (original enhanced)
  if (!isV2 && isEnhanced) {
    return <SimplePremiumWineCard {...props} />;
  }

  // V1 Original Cards (fallback)
  return <WineCard {...props} />;
};

export default AdaptiveWineCard;
