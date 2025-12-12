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

const { width: screenWidth } = Dimensions.get('window');
const BOTTLE_WIDTH = 80;
const BOTTLE_HEIGHT = 160;

interface WineBottleCardProps {
  wine: WineRecommendation;
  onPress?: (wine: WineRecommendation) => void;
  onRemoveFromFavorites?: (wine: WineRecommendation) => void;
  index?: number;
}

const WineBottleCard: React.FC<WineBottleCardProps> = ({
  wine,
  onPress,
  onRemoveFromFavorites,
  index = 0,
}) => {
  const [scaleAnim] = useState(new Animated.Value(1));

  const handlePress = () => {
    Animated.sequence([
      Animated.timing(scaleAnim, {
        toValue: 1.05,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();

    onPress?.(wine);
  };

  // Get wine image
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

  // Determine wine color based on name
  const getWineColor = () => {
    const name = wine.wineName.toLowerCase();
    if (name.includes('chardonnay') || name.includes('sauvignon') || name.includes('riesling') || name.includes('pinot grigio')) {
      return '#FFE5B4'; // Light yellow/gold for white wines
    }
    return '#8B0000'; // Dark red for red wines
  };

  return (
    <TouchableOpacity
      onPress={handlePress}
      activeOpacity={0.9}
      style={styles.container}
    >
      <Animated.View
        style={[
          styles.bottleWrapper,
          {
            transform: [{ scale: scaleAnim }],
          },
        ]}
      >
        {/* Bottle Container */}
        <View style={styles.bottleContainer}>
          {/* Bottle Body - Main Section */}
          <View style={[styles.bottleBody, { backgroundColor: getWineColor() }]}>
            <Image
              source={{ uri: getWineImage() }}
              style={styles.bottleImage}
              resizeMode="cover"
            />
            <View style={styles.bottleGradient} />
            
            {/* Wine Label */}
            <View style={styles.labelContainer}>
              <Text style={styles.labelText} numberOfLines={2}>
                {wine.wineName}
              </Text>
              <View style={styles.labelDivider} />
              <Text style={styles.vintageText} numberOfLines={1}>
                {wine.vintage}
              </Text>
            </View>
          </View>

          {/* Bottle Shoulder */}
          <View style={styles.bottleShoulder} />

          {/* Bottle Neck */}
          <View style={styles.bottleNeck}>
            <View style={styles.bottleCork} />
          </View>
        </View>

        {/* Wine Info Card Below Bottle */}
        <View style={styles.infoCard}>
          <Text style={styles.wineName} numberOfLines={1}>
            {wine.wineName}
          </Text>
          <Text style={styles.producer} numberOfLines={1}>
            {wine.producer}
          </Text>
          {wine.pricePoint && wine.pricePoint !== 'unknown' && wine.pricePoint !== 'Price N/A' && (
            <View style={styles.priceTag}>
              <Text style={styles.priceText} numberOfLines={1}>
                {wine.pricePoint}
              </Text>
            </View>
          )}
        </View>

        {/* Favorite Badge */}
        <View style={styles.favoriteBadge}>
          <Ionicons name="heart" size={14} color="#FF6B6B" />
        </View>
      </Animated.View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    marginHorizontal: 12,
    marginBottom: 20,
  },
  bottleWrapper: {
    alignItems: 'center',
    width: BOTTLE_WIDTH,
  },
  bottleContainer: {
    width: BOTTLE_WIDTH,
    height: BOTTLE_HEIGHT,
    alignItems: 'center',
    position: 'relative',
  },
  bottleBody: {
    width: BOTTLE_WIDTH * 0.65,
    height: BOTTLE_HEIGHT * 0.7,
    borderRadius: 6,
    overflow: 'hidden',
    position: 'relative',
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.4)',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 6,
    },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 10,
  },
  bottleImage: {
    width: '100%',
    height: '100%',
    opacity: 0.7,
  },
  bottleGradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.15)',
  },
  labelContainer: {
    position: 'absolute',
    bottom: BOTTLE_HEIGHT * 0.15,
    left: -BOTTLE_WIDTH * 0.1,
    right: -BOTTLE_WIDTH * 0.1,
    backgroundColor: 'rgba(255, 255, 255, 0.98)',
    padding: 6,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.1)',
    alignItems: 'center',
    minHeight: 40,
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  labelText: {
    fontSize: 9,
    fontWeight: 'bold',
    color: '#5B2433',
    textAlign: 'center',
    lineHeight: 11,
  },
  labelDivider: {
    width: '70%',
    height: 1,
    backgroundColor: '#5B2433',
    marginVertical: 3,
  },
  vintageText: {
    fontSize: 8,
    color: '#5B2433',
    textAlign: 'center',
    fontWeight: '600',
  },
  bottleShoulder: {
    width: BOTTLE_WIDTH * 0.5,
    height: BOTTLE_HEIGHT * 0.08,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderTopLeftRadius: 4,
    borderTopRightRadius: 4,
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.1)',
    marginTop: -1,
  },
  bottleNeck: {
    width: BOTTLE_WIDTH * 0.25,
    height: BOTTLE_HEIGHT * 0.22,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderTopLeftRadius: 3,
    borderTopRightRadius: 3,
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.1)',
    alignItems: 'center',
    justifyContent: 'flex-start',
    paddingTop: 3,
  },
  bottleCork: {
    width: BOTTLE_WIDTH * 0.18,
    height: 10,
    backgroundColor: '#8B4513',
    borderRadius: 3,
    borderWidth: 1,
    borderColor: '#654321',
  },
  infoCard: {
    marginTop: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 8,
    padding: 8,
    width: BOTTLE_WIDTH + 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    borderWidth: 1,
    borderColor: 'rgba(139, 0, 0, 0.1)',
  },
  wineName: {
    fontSize: 12,
    fontWeight: '600',
    color: '#5B2433',
    textAlign: 'center',
    marginBottom: 4,
  },
  producer: {
    fontSize: 10,
    color: '#666',
    textAlign: 'center',
    marginBottom: 6,
  },
  priceTag: {
    backgroundColor: '#5B2433',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
    marginTop: 2,
  },
  priceText: {
    color: '#fff',
    fontSize: 9,
    fontWeight: 'bold',
  },
  favoriteBadge: {
    position: 'absolute',
    top: -6,
    right: -6,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 12,
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#FF6B6B',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
});

export default WineBottleCard;
