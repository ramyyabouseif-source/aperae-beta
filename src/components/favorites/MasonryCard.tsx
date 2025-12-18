import React, { memo } from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import GridWineCard from './GridWineCard';
import { WineRecommendation } from '../../types/wine';

const { width: screenWidth } = Dimensions.get('window');

// Calculate card width based on screen size and number of columns
const getCardWidth = (numColumns: number, horizontalPadding: number = 24, gapSpacing: number = 12) => {
  // Total horizontal padding (left + right)
  // Plus gaps between columns (numColumns - 1 gaps)
  const totalSpacing = horizontalPadding + (gapSpacing * (numColumns - 1));
  return (screenWidth - totalSpacing) / numColumns;
};

interface MasonryCardProps {
  wine: WineRecommendation;
  numColumns: number;
  onRemoveFromFavorites?: (wine: WineRecommendation) => void;
  onPress?: (wine: WineRecommendation) => void;
  index?: number;
  onWineUpdated?: () => void; // Callback when wine data is updated
}

const MasonryCard: React.FC<MasonryCardProps> = memo(({
  wine,
  numColumns,
  onRemoveFromFavorites,
  onPress,
  index = 0,
  onWineUpdated,
}) => {
  const cardWidth = getCardWidth(numColumns);

  return (
    <View style={styles.container}>
      <GridWineCard
        wine={wine}
        cardWidth={cardWidth}
        onRemoveFromFavorites={onRemoveFromFavorites}
        onPress={onPress}
        index={index}
        onWineUpdated={onWineUpdated}
      />
    </View>
  );
}, (prevProps, nextProps) => {
  // Custom comparison for memoization
  const prevId = (prevProps.wine as any).id || `${prevProps.wine.wineName}-${prevProps.wine.producer}-${prevProps.wine.vintage}`;
  const nextId = (nextProps.wine as any).id || `${nextProps.wine.wineName}-${nextProps.wine.producer}-${nextProps.wine.vintage}`;
  return (
    prevId === nextId &&
    prevProps.numColumns === nextProps.numColumns
  );
});

MasonryCard.displayName = 'MasonryCard';

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    marginHorizontal: 2, // Small margin for gap between cards
  },
});

export default MasonryCard;

