import React from 'react';
import { View, Text, StyleSheet, ScrollView, Dimensions } from 'react-native';
import { WineRecommendation } from '../../types/wine';
import WineBottleCard from './WineBottleCard';

const { width: screenWidth } = Dimensions.get('window');

interface ShelfRowProps {
  title?: string;
  wines: WineRecommendation[];
  onWinePress?: (wine: WineRecommendation) => void;
  onRemoveFromFavorites?: (wine: WineRecommendation) => void;
  startIndex?: number;
}

const ShelfRow: React.FC<ShelfRowProps> = ({
  title,
  wines,
  onWinePress,
  onRemoveFromFavorites,
  startIndex = 0,
}) => {
  return (
    <View style={styles.container}>
      {/* Producer Label */}
      {title && (
        <View style={styles.labelContainer}>
          <View style={styles.labelLine} />
          <Text style={styles.labelText}>{title}</Text>
          <View style={styles.labelLine} />
        </View>
      )}

      {/* Shelf Section */}
      <View style={styles.shelfSection}>
        {/* Shelf Board with 3D effect */}
        <View style={styles.shelfBoard}>
          {/* Shelf front face */}
          <View style={styles.shelfFront}>
            {/* Wood grain lines */}
            <View style={styles.grainLine1} />
            <View style={styles.grainLine2} />
            <View style={styles.grainLine3} />
          </View>
          
          {/* Shelf depth (3D effect) */}
          <View style={styles.shelfDepth} />
        </View>

        {/* Bottles Container */}
        <View style={styles.bottlesWrapper}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.bottlesContainer}
            style={styles.bottlesScroll}
          >
            {wines.map((wine, index) => (
              <WineBottleCard
                key={`${wine.wineName}-${wine.producer}-${wine.vintage}-${index}`}
                wine={wine}
                onPress={onWinePress}
                onRemoveFromFavorites={onRemoveFromFavorites}
                index={startIndex + index}
              />
            ))}
          </ScrollView>
        </View>

        {/* Shelf Shadow */}
        <View style={styles.shelfShadow} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 32,
  },
  labelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  labelLine: {
    flex: 1,
    height: 1,
    backgroundColor: 'rgba(139, 0, 0, 0.2)',
  },
  labelText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#5B2433',
    marginHorizontal: 12,
    letterSpacing: 0.5,
  },
  shelfSection: {
    position: 'relative',
    height: 240,
  },
  shelfBoard: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 24,
    flexDirection: 'row',
  },
  shelfFront: {
    flex: 1,
    height: 24,
    backgroundColor: '#8B4513', // Brown wood
    borderTopWidth: 2,
    borderTopColor: '#A0522D', // Lighter brown highlight
    borderBottomWidth: 1,
    borderBottomColor: '#654321', // Darker brown shadow
    overflow: 'hidden',
    position: 'relative',
  },
  grainLine1: {
    position: 'absolute',
    top: 4,
    left: 0,
    right: 0,
    height: 1,
    backgroundColor: 'rgba(101, 67, 33, 0.4)',
  },
  grainLine2: {
    position: 'absolute',
    top: 10,
    left: 0,
    right: 0,
    height: 1,
    backgroundColor: 'rgba(101, 67, 33, 0.3)',
  },
  grainLine3: {
    position: 'absolute',
    top: 16,
    left: 0,
    right: 0,
    height: 1,
    backgroundColor: 'rgba(101, 67, 33, 0.35)',
  },
  shelfDepth: {
    width: 8,
    height: 24,
    backgroundColor: '#654321',
    borderTopWidth: 2,
    borderTopColor: '#A0522D',
    borderRightWidth: 1,
    borderRightColor: '#5C4033',
  },
  bottlesWrapper: {
    position: 'absolute',
    bottom: 24,
    left: 0,
    right: 0,
    height: 216,
  },
  bottlesScroll: {
    flex: 1,
  },
  bottlesContainer: {
    paddingHorizontal: 20,
    paddingTop: 16,
    alignItems: 'flex-end',
    paddingBottom: 8,
  },
  shelfShadow: {
    position: 'absolute',
    bottom: -6,
    left: 0,
    right: 0,
    height: 12,
    backgroundColor: 'rgba(0, 0, 0, 0.15)',
    borderRadius: 6,
    marginHorizontal: 4,
  },
});

export default ShelfRow;
