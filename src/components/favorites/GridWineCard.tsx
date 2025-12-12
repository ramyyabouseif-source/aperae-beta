import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Animated,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { WineRecommendation } from '../../types/wine';

interface GridWineCardProps {
  wine: WineRecommendation;
  cardWidth: number;
  onRemoveFromFavorites?: (wine: WineRecommendation) => void;
  onPress?: (wine: WineRecommendation) => void;
  index?: number;
}

const GridWineCard: React.FC<GridWineCardProps> = ({
  wine,
  cardWidth,
  onRemoveFromFavorites,
  onPress,
  index = 0,
}) => {
  const [favoriteAnim] = useState(new Animated.Value(0));

  const handleFavoritePress = () => {
    Animated.sequence([
      Animated.timing(favoriteAnim, {
        toValue: 1,
        duration: 150,
        useNativeDriver: true,
      }),
      Animated.timing(favoriteAnim, {
        toValue: 0,
        duration: 150,
        useNativeDriver: true,
      }),
    ]).start();

    onRemoveFromFavorites?.(wine);
  };

  const handleCardPress = () => {
    // Open detail modal instead of expanding inline
    onPress?.(wine);
  };

  const heartScale = favoriteAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 1.3],
  });

  // Get wine image based on index for variety
  const getWineImage = () => {
    const wineImages = [
      'https://images.unsplash.com/photo-1506377247377-2a5b3b417ebb?w=400&h=600&fit=crop&q=80',
      'https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?w=400&h=600&fit=crop&q=80',
      'https://images.unsplash.com/photo-1551538827-9c037cb4f32a?w=400&h=600&fit=crop&q=80',
      'https://images.unsplash.com/photo-1571613316887-6f8d5cbf7ef7?w=400&h=600&fit=crop&q=80',
      'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=400&h=600&fit=crop&q=80',
      'https://images.unsplash.com/photo-1564760055775-d63b17a55c44?w=400&h=600&fit=crop&q=80',
      'https://images.unsplash.com/photo-1547595628-c61a29f496f0?w=400&h=600&fit=crop&q=80',
      'https://images.unsplash.com/photo-1513475382585-d06e58bcb0e0?w=400&h=600&fit=crop&q=80',
      'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&h=600&fit=crop&q=80',
      'https://images.unsplash.com/photo-1551024506-0bccd828d307?w=400&h=600&fit=crop&q=80',
      'https://images.unsplash.com/photo-1586370434639-0fe43b2d32d6?w=400&h=600&fit=crop&q=80',
      'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400&h=600&fit=crop&q=80',
    ];
    const imageIndex = index % wineImages.length;
    return wineImages[imageIndex];
  };

  // Calculate font sizes based on card width for better readability
  const isSmallCard = cardWidth < 170;
  const titleFontSize = isSmallCard ? 13 : 15;
  const producerFontSize = isSmallCard ? 10 : 11;
  const priceFontSize = isSmallCard ? 11 : 13;
  const detailFontSize = isSmallCard ? 10 : 11;

  return (
    <TouchableOpacity
      style={[styles.card, { width: cardWidth }]}
      onPress={handleCardPress}
      activeOpacity={0.9}
    >
      {/* Background Image */}
      <Image
        source={{ uri: getWineImage() }}
        style={styles.backgroundImage}
        resizeMode="cover"
      />
      
      {/* Dark Overlay */}
      <View style={styles.darkOverlay} />
      
      {/* Wine Accent Bar */}
      <View style={styles.wineAccent} />

      {/* Content */}
      <View style={styles.content}>
        {/* Header with Favorite Button and Price */}
        <View style={styles.header}>
          <TouchableOpacity
            onPress={handleFavoritePress}
            style={styles.favoriteButton}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Animated.View style={{ transform: [{ scale: heartScale }] }}>
              <Ionicons name="heart" size={20} color="#FF6B6B" />
            </Animated.View>
          </TouchableOpacity>
          
          {wine.pricePoint && wine.pricePoint !== 'unknown' && wine.pricePoint !== 'Price N/A' && (
            <View style={styles.priceBadge}>
              <Text style={[styles.priceText, { fontSize: priceFontSize }]} numberOfLines={1}>
                {wine.pricePoint}
              </Text>
            </View>
          )}
        </View>

        {/* Wine Name and Producer - Bottom Section */}
        <View style={styles.bottomSection}>
          <Text 
            style={[styles.wineName, { fontSize: titleFontSize }]} 
            numberOfLines={2}
          >
            {wine.wineName}
          </Text>
          <Text 
            style={[styles.producerText, { fontSize: producerFontSize }]} 
            numberOfLines={1}
          >
            {wine.producer} {wine.vintage}
          </Text>
          
          {/* Rating - if available */}
          {wine.expertRating && wine.expertRating !== 'unknown' && (
            <View style={styles.ratingRow}>
              <Ionicons name="star" size={12} color="#FFD700" />
              <Text style={[styles.ratingText, { fontSize: detailFontSize }]} numberOfLines={1}>
                {wine.expertRating}
              </Text>
            </View>
          )}

          {/* View Details Hint */}
          <View style={styles.viewDetailsHint}>
            <Ionicons name="information-circle-outline" size={14} color="rgba(255, 255, 255, 0.9)" />
            <Text style={styles.viewDetailsText}>Tap for details</Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: '#fff',
    minHeight: 240,
    maxHeight: 300,
    shadowColor: '#8B0000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 6,
  },
  backgroundImage: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    width: '100%',
    height: '100%',
  },
  darkOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  wineAccent: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: 4,
    height: '100%',
    backgroundColor: '#5B2433',
  },
  content: {
    flex: 1,
    padding: 14,
    justifyContent: 'space-between',
    minHeight: 240,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  favoriteButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 20,
    width: 36,
    height: 36,
    justifyContent: 'center',
    alignItems: 'center',
  },
  priceBadge: {
    backgroundColor: '#5B2433',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    maxWidth: '60%',
  },
  priceText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  bottomSection: {
    marginTop: 'auto',
    paddingTop: 8,
  },
  wineName: {
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 6,
    textShadowColor: 'rgba(0, 0, 0, 0.8)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
    lineHeight: 20,
  },
  producerText: {
    color: 'rgba(255, 255, 255, 0.9)',
    marginBottom: 8,
    textShadowColor: 'rgba(0, 0, 0, 0.6)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 10,
    alignSelf: 'flex-start',
    marginTop: 4,
  },
  ratingText: {
    color: '#5B2433',
    fontWeight: '600',
    marginLeft: 4,
  },
  viewDetailsHint: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  viewDetailsText: {
    color: 'rgba(255, 255, 255, 0.9)',
    fontSize: 10,
    fontWeight: '500',
    marginLeft: 4,
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
});

export default GridWineCard;

