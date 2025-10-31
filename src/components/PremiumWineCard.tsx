import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Dimensions,
  Animated,
  PanGestureHandler,
  State,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { WineRecommendation } from '../types/wine';

const { width: screenWidth } = Dimensions.get('window');
const CARD_WIDTH = screenWidth - 40;
const CARD_HEIGHT = 280;

interface PremiumWineCardProps {
  wine: WineRecommendation;
  onAddToFavorites?: (wine: WineRecommendation) => void;
  onRemoveFromFavorites?: (wine: WineRecommendation) => void;
  isFavorite?: boolean;
  onPress?: (wine: WineRecommendation) => void;
  index?: number;
}

const PremiumWineCard: React.FC<PremiumWineCardProps> = ({
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
  const [showDetails, setShowDetails] = useState(false);

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

    setIsExpanded(!isExpanded);
    setShowDetails(!showDetails);
    onPress?.(wine);
  };

  const heartScale = favoriteAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 1.3],
  });

  const heartColor = favoriteAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['#8B0000', '#FF6B6B'],
  });

  // Generate wine-themed gradient based on wine type
  const getWineGradient = () => {
    if (wine.wineName.toLowerCase().includes('chardonnay') || wine.wineName.toLowerCase().includes('white')) {
      return ['#F7E7CE', '#E8D5B7', '#D4C4A8'];
    } else if (wine.wineName.toLowerCase().includes('rose') || wine.wineName.toLowerCase().includes('rosé')) {
      return ['#F7CAC9', '#E8B4B8', '#D4A5A9'];
    } else {
      return ['#8B0000', '#722F37', '#5A1A1A'];
    }
  };

  const getWineImage = () => {
    // Use wine-themed placeholder images
    const wineImages = {
      'Château Léoville Barton': 'https://images.unsplash.com/photo-1506377247377-2a5b3b417ebb?w=400&h=600&fit=crop',
      'Ridge Vineyards': 'https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?w=400&h=600&fit=crop',
      'Catena Zapata': 'https://images.unsplash.com/photo-1506377247377-2a5b3b417ebb?w=400&h=600&fit=crop',
    };
    
    // Find matching image or use default
    for (const [key, image] of Object.entries(wineImages)) {
      if (wine.wineName.includes(key)) {
        return image;
      }
    }
    return 'https://images.unsplash.com/photo-1506377247377-2a5b3b417ebb?w=400&h=600&fit=crop';
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
        <Image
          source={{ uri: getWineImage() }}
          style={styles.backgroundImage}
          resizeMode="cover"
        />
        
        {/* Gradient Overlay */}
        <LinearGradient
          colors={['transparent', 'rgba(0,0,0,0.7)', 'rgba(0,0,0,0.9)']}
          style={styles.gradientOverlay}
        />
        
        {/* Wine Type Gradient Accent */}
        <LinearGradient
          colors={getWineGradient()}
          style={styles.wineAccent}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        />

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

          {/* Tasting Notes Preview */}
          <View style={styles.notesSection}>
            <Text style={styles.tastingNotes} numberOfLines={showDetails ? 0 : 2}>
              {wine.tastingNotes}
            </Text>
            {!showDetails && (
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
                  color={isFavorite ? "#FF6B6B" : "#8B0000"}
                />
              </Animated.View>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.moreButton}
              onPress={() => onPress?.(wine)}
              activeOpacity={0.7}
            >
              <Ionicons name="wine" size={20} color="#8B0000" />
              <Text style={styles.moreButtonText}>Details</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.shareButton}
              onPress={() => {/* Share functionality */}}
              activeOpacity={0.7}
            >
              <Ionicons name="share-outline" size={20} color="#8B0000" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Expandable Details */}
        {showDetails && (
          <Animated.View style={styles.expandedDetails}>
            <View style={styles.detailsContent}>
              <Text style={styles.detailsTitle}>Pairing Rationale</Text>
              <Text style={styles.detailsText}>{wine.rationale}</Text>
              
              <Text style={styles.detailsTitle}>Serving Guidance</Text>
              <Text style={styles.detailsText}>{wine.servingGuidance}</Text>
              
              <Text style={styles.detailsTitle}>Where to Buy</Text>
              <Text style={styles.detailsText}>{wine.retailerSuggestion}</Text>
            </View>
          </Animated.View>
        )}
      </TouchableOpacity>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  cardContainer: {
    marginHorizontal: 20,
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
    height: CARD_HEIGHT,
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
  },
  gradientOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
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
    color: '#8B0000',
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 4,
  },
  priceContainer: {
    backgroundColor: '#8B0000',
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
    backgroundColor: '#FFD700',
    borderRadius: 2,
  },
  confidenceText: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.8)',
    fontWeight: '500',
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
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
    color: '#8B0000',
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
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.95)',
    padding: 20,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  detailsContent: {
    // Content styling for expanded details
  },
  detailsTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFD700',
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

export default PremiumWineCard;




