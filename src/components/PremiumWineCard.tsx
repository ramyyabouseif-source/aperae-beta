import React, { useState, useMemo } from 'react';
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
import { getWineCardImage } from '../utils/wineCardImages';
import { getServingGuidance, getConfidenceBreakdown, getTastingNotesDisplay, getConfidenceScore } from '../utils/wineTypeHelpers';
import ConfidenceBreakdown from './ConfidenceBreakdown';

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

  // Get wine image from local assets - memoize to prevent unnecessary recalculations
  const wineImageSource = useMemo(() => {
    // Use local wine card images with random index
    const imageIndex = index || 0;
    return getWineCardImage(imageIndex);
  }, [index]);

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
          source={wineImageSource}
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
{(() => {
              const tastingNotes = typeof wine.tastingNotes === 'string' 
                ? { aromas: [], palate: wine.tastingNotes, finish: '' }
                : wine.tastingNotes;
              return (
                <>
                  {tastingNotes.aromas && tastingNotes.aromas.length > 0 && (
                    <Text style={styles.tastingNotes}>
                      Aromas: {tastingNotes.aromas.join(', ')}
                    </Text>
                  )}
                  <Text style={styles.tastingNotes} numberOfLines={showDetails ? 0 : 2}>
                    {tastingNotes.palate}
                  </Text>
                  {tastingNotes.finish && (
                    <Text style={styles.tastingNotes}>Finish: {tastingNotes.finish}</Text>
                  )}
                </>
              );
            })()}
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
              <Text style={styles.detailsText}>
                {typeof wine.servingGuidance === 'string' 
                  ? wine.servingGuidance
                  : wine.servingGuidance && typeof wine.servingGuidance === 'object'
                  ? [
                      wine.servingGuidance.temperature && `Temperature: ${wine.servingGuidance.temperature}`,
                      wine.servingGuidance.glassware && `Glassware: ${wine.servingGuidance.glassware}`,
                      wine.servingGuidance.decanting && wine.servingGuidance.decanting
                    ].filter(Boolean).join('. ')
                  : 'Serve at recommended temperature'}
              </Text>
              
              {/* Confidence Breakdown (Enhanced Format) - Visual Component */}
              {getConfidenceBreakdown(wine) && (
                <>
                  <Text style={styles.detailsTitle}>Confidence Breakdown</Text>
                  <ConfidenceBreakdown 
                    breakdown={getConfidenceBreakdown(wine)!} 
                    totalScore={getConfidenceScore(wine)}
                  />
                </>
              )}
              
              {/* Region (Enhanced Format) */}
              {wine.region && wine.region !== 'unknown' && (
                <>
                  <Text style={styles.detailsTitle}>Region</Text>
                  <Text style={styles.detailsText}>{wine.region}</Text>
                </>
              )}
              
              <Text style={styles.detailsTitle}>Where to Buy</Text>
              <Text style={styles.detailsText}>{wine.retailerSuggestion}</Text>
              
              {/* Story (Enhanced Format - prefer story over storytellingElements) */}
              {(wine.story || wine.storytellingElements) && (
                <>
                  <Text style={styles.detailsTitle}>Story</Text>
                  <Text style={styles.detailsText}>{wine.story || wine.storytellingElements}</Text>
                </>
              )}
              
              {/* Alternatives (Enhanced Format) */}
              {wine.alternatives && wine.alternatives.length > 0 && (
                <>
                  <Text style={styles.detailsTitle}>Alternative Wines</Text>
                  {wine.alternatives.map((alt, index) => (
                    <View 
                      key={index} 
                      style={[
                        styles.alternativeItem,
                        index === wine.alternatives.length - 1 && styles.alternativeItemLast
                      ]}
                    >
                      <Text style={styles.alternativeName}>{alt.wineName}</Text>
                      <Text style={styles.alternativeDetails}>
                        {alt.producer} • {alt.vintage} • {alt.grape}
                      </Text>
                    </View>
                  ))}
                </>
              )}
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
  alternativeItem: {
    marginBottom: 12,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.2)',
  },
  alternativeName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFD700',
    marginBottom: 4,
  },
  alternativeDetails: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.8)',
    fontStyle: 'italic',
  },
  alternativeItemLast: {
    marginBottom: 0, // Remove bottom margin from last item
    paddingBottom: 0,
    borderBottomWidth: 0, // Remove border from last item
  },
});

export default PremiumWineCard;




