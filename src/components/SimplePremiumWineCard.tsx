import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Dimensions,
  Animated,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { WineRecommendation } from '../types/wine';

const { width: screenWidth } = Dimensions.get('window');
const CARD_WIDTH = screenWidth - 40; // Proper centering like the button
const CARD_HEIGHT = 320;

interface SimplePremiumWineCardProps {
  wine: WineRecommendation;
  onAddToFavorites?: (wine: WineRecommendation) => void;
  onRemoveFromFavorites?: (wine: WineRecommendation) => void;
  isFavorite?: boolean;
  onPress?: (wine: WineRecommendation) => void;
  index?: number;
}

const SimplePremiumWineCard: React.FC<SimplePremiumWineCardProps> = ({
  wine,
  onAddToFavorites,
  onRemoveFromFavorites,
  isFavorite = false,
  onPress,
  index = 0,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [favoriteAnim] = useState(new Animated.Value(0));
  const [cardScale] = useState(new Animated.Value(1));
  const [imageScale] = useState(new Animated.Value(1));

  const handleFavoritePress = () => {
    // Animate heart
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

    if (isFavorite) {
      onRemoveFromFavorites?.(wine);
    } else {
      onAddToFavorites?.(wine);
    }
  };

  const handleCardPress = () => {
    // Scale animation
    Animated.sequence([
      Animated.timing(cardScale, {
        toValue: 0.98,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(cardScale, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();

    // Image scale animation when expanding/collapsing
    Animated.timing(imageScale, {
      toValue: isExpanded ? 1 : 1.1, // Slightly scale up when expanded
      duration: 300,
      useNativeDriver: true,
    }).start();

    setIsExpanded(!isExpanded);
    onPress?.(wine);
  };

  const heartScale = favoriteAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 1.3],
  });

  // Get wine image based on wine type and index for variety
  const getWineImage = () => {
    const wineImages = [
      // Red Wine Bottles & Glasses
      'https://images.unsplash.com/photo-1506377247377-2a5b3b417ebb?w=400&h=600&fit=crop&q=80', // Classic red wine bottle
      'https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?w=400&h=600&fit=crop&q=80', // Wine glass with red wine
      'https://images.unsplash.com/photo-1551538827-9c037cb4f32a?w=400&h=600&fit=crop&q=80', // Wine cellar bottles
      'https://images.unsplash.com/photo-1571613316887-6f8d5cbf7ef7?w=400&h=600&fit=crop&q=80', // Wine tasting setup
      'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=400&h=600&fit=crop&q=80', // Wine bottle close-up
      'https://images.unsplash.com/photo-1564760055775-d63b17a55c44?w=400&h=600&fit=crop&q=80', // Wine glasses and bottle
      
      // White Wine Bottles & Glasses
      'https://images.unsplash.com/photo-1547595628-c61a29f496f0?w=400&h=600&fit=crop&q=80', // White wine bottle
      'https://images.unsplash.com/photo-1513475382585-d06e58bcb0e0?w=400&h=600&fit=crop&q=80', // Chardonnay bottle
      'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&h=600&fit=crop&q=80', // Wine glasses with white wine
      'https://images.unsplash.com/photo-1551024506-0bccd828d307?w=400&h=600&fit=crop&q=80', // Wine bottle in vineyard
      
      // Premium Wine Scenes
      'https://images.unsplash.com/photo-1586370434639-0fe43b2d32d6?w=400&h=600&fit=crop&q=80', // Wine cellar with bottles
      'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400&h=600&fit=crop&q=80', // Wine tasting room
      'https://images.unsplash.com/photo-1551024506-0bccd828d307?w=400&h=600&fit=crop&q=80', // Vineyard with wine bottles
    ];
    
    // Use index to cycle through images for variety
    const imageIndex = index % wineImages.length;
    return wineImages[imageIndex];
  };

  // Get wine color accent - always use dark tone for consistency
  const getWineAccentColor = () => {
    return '#5B2433'; // Dark tone accent - consistent across all wine types
  };

  return (
    <Animated.View
      style={[
        styles.cardContainer,
        {
          transform: [{ scale: cardScale }],
        },
      ]}
    >
      <TouchableOpacity
        style={styles.card}
        onPress={handleCardPress}
        activeOpacity={0.9}
      >
        {/* Background Image */}
        <Animated.Image
          source={{ uri: getWineImage() }}
          style={[
            styles.backgroundImage,
            {
              transform: [{ scale: imageScale }],
            },
          ]}
          resizeMode="cover"
        />
        
        {/* Dark Overlay */}
        <View style={styles.darkOverlay} />
        
        {/* Wine Accent Bar */}
        <View style={[styles.wineAccent, { backgroundColor: getWineAccentColor() }]} />

        {/* Content */}
        <View style={styles.content}>
          {/* Header with Rating and Price */}
          <View style={styles.header}>
            <View style={styles.ratingContainer}>
              <Ionicons name="star" size={16} color="#FFD700" />
              <Text style={styles.ratingText}>{wine.expertRating}</Text>
            </View>
            <View style={styles.priceContainer}>
              <Text style={styles.priceText}>{wine.pricePoint}</Text>
            </View>
          </View>

          {/* Wine Name and Producer */}
          <View style={styles.titleSection}>
            <Text style={styles.wineName} numberOfLines={2}>
              {wine.wineName}
            </Text>
            <Text style={styles.producerText}>
              {wine.producer} • {wine.vintage}
            </Text>
          </View>

          {/* Tasting Notes */}
          <View style={styles.notesSection}>
            <Text style={styles.tastingNotes} numberOfLines={isExpanded ? 0 : 2}>
              {wine.tastingNotes}
            </Text>
            {!isExpanded && (
              <Text style={styles.readMoreText}>Tap to read more</Text>
            )}
          </View>

          {/* Confidence Score */}
          <View style={styles.confidenceSection}>
            <View style={styles.confidenceBar}>
              <View 
                style={[
                  styles.confidenceFill, 
                  { width: `${wine.confidenceScore}%` }
                ]} 
              />
            </View>
            <Text style={styles.confidenceText}>
              {wine.confidenceScore}% confidence
            </Text>
          </View>

          {/* Action Buttons */}
          <View style={styles.actionButtons}>
            <TouchableOpacity
              style={styles.favoriteButton}
              onPress={handleFavoritePress}
              activeOpacity={0.7}
            >
              <Animated.View
                style={[
                  styles.favoriteIcon,
                  {
                    transform: [{ scale: heartScale }],
                  },
                ]}
              >
                <Ionicons
                  name={isFavorite ? "heart" : "heart-outline"}
                  size={24}
                  color={isFavorite ? "#FF6B6B" : "#5B2433"}
                />
              </Animated.View>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.shareButton}
              onPress={() => {/* Share functionality */}}
              activeOpacity={0.7}
            >
              <Ionicons name="share-outline" size={20} color="#5B2433" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Expandable Details */}
        {isExpanded && (
          <View style={styles.expandedDetails}>
            <View style={styles.detailsOverlay} />
            <View style={styles.detailsContent}>
              <Text style={styles.detailsTitle}>Pairing Rationale</Text>
              <Text style={styles.detailsText}>{wine.rationale}</Text>
              
              <Text style={styles.detailsTitle}>Serving Guidance</Text>
              <Text style={styles.detailsText}>{wine.servingGuidance}</Text>
              
              <Text style={styles.detailsTitle}>Where to Buy</Text>
              <Text style={styles.detailsText}>{wine.retailerSuggestion}</Text>
            </View>
          </View>
        )}
      </TouchableOpacity>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  cardContainer: {
    alignSelf: 'center', // Force centering
    marginHorizontal: 20, // Match button centering
    marginVertical: 12,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 12,
  },
  card: {
    width: CARD_WIDTH,
    minHeight: CARD_HEIGHT,
    borderRadius: 20,
    overflow: 'hidden',
    backgroundColor: '#fff',
  },
  backgroundImage: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    width: '100%',
    height: '100%',
    // Extend beyond the card to cover expanded details
    minHeight: CARD_HEIGHT + 200, // Extra height for expanded content
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
    width: 6,
    height: '100%',
  },
  content: {
    flex: 1,
    padding: 20,
    justifyContent: 'space-between',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  ratingText: {
    color: '#5B2433', // Dark tone text
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 4,
  },
  priceContainer: {
    backgroundColor: '#5B2433', // Dark tone background
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  priceText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  titleSection: {
    marginBottom: 12,
  },
  wineName: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 4,
    textShadowColor: 'rgba(0, 0, 0, 0.8)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  producerText: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
    fontWeight: '500',
  },
  notesSection: {
    marginBottom: 16,
  },
  tastingNotes: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.9)',
    lineHeight: 20,
    textShadowColor: 'rgba(0, 0, 0, 0.8)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  readMoreText: {
    fontSize: 12,
    color: '#FFD700',
    fontStyle: 'italic',
    marginTop: 4,
  },
  confidenceSection: {
    marginBottom: 16,
  },
  confidenceBar: {
    height: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: 2,
    marginBottom: 4,
  },
  confidenceFill: {
    height: '100%',
    backgroundColor: '#5B2433', // Dark tone
    borderRadius: 2,
  },
  confidenceText: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.8)',
    fontWeight: '500',
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 40, // Space between buttons
  },
  favoriteButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  favoriteIcon: {
    // Animation handled by Animated.View
  },
  moreButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  moreButtonText: {
    color: '#5B2433', // Dark tone text
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 6,
  },
  shareButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  expandedDetails: {
    position: 'relative',
    padding: 20,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    borderBottomWidth: 0,
    overflow: 'hidden',
    // No background - let the main background image show through
  },
  detailsOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.7)', // Lighter overlay for better text readability
  },
  detailsContent: {
    position: 'relative',
    zIndex: 1,
  },
  detailsTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#BF9694', // Metallic accent
    marginBottom: 8,
    marginTop: 12,
  },
  detailsText: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.9)',
    lineHeight: 20,
    marginBottom: 8,
  },
});

export default SimplePremiumWineCard;
