import React, { useState, useMemo } from 'react';
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
import { MyCellarWine, WineRecommendation } from '../types/wine';
import { getWineCardImage } from '../utils/wineCardImages';
import { getServingGuidance, getConfidenceBreakdown, getConfidenceScore } from '../utils/wineTypeHelpers';
import ConfidenceBreakdown from './ConfidenceBreakdown';
import StatusBadge from './myCellar/StatusBadge';
import StarRating from './myCellar/StarRating';

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

    // Card expansion is handled by minHeight, image will automatically extend

    setIsExpanded(!isExpanded);
    onPress?.(wine);
  };

  const heartScale = favoriteAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 1.3],
  });

  // Get wine image from local assets - memoize to prevent unnecessary recalculations
  const wineImageSource = useMemo(() => {
    // Use the index prop to get a random image for each card
    return getWineCardImage(index);
  }, [index]);

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
        {/* Background Image - extends to fill entire card including expanded content */}
        <Image
          source={wineImageSource}
          style={styles.backgroundImage}
          resizeMode="cover"
        />
        
        {/* Dark Overlay - extends to fill entire card */}
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
            
            {/* Status Badge - My Cellar Feature - ALWAYS SHOW */}
            <View style={styles.statusBadgeContainer}>
              <StatusBadge 
                status={((wine as any).status || 'favorite') as 'wantToTry' | 'haveTried' | 'favorite'} 
                size="small"
                showLabel={false}
              />
            </View>
            
            {/* User Rating - My Cellar Feature */}
            {(() => {
              const cellarWine = wine as MyCellarWine;
              if (cellarWine.wineRating && cellarWine.wineRating > 0) {
                return (
                  <View style={styles.userRatingContainer}>
                    <StarRating 
                      rating={cellarWine.wineRating} 
                      size={14} 
                      readonly 
                    />
                  </View>
                );
              }
              return null;
            })()}
          </View>

          {/* Tasting Notes */}
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
                  <Text style={styles.tastingNotes} numberOfLines={isExpanded ? 0 : 2}>
                    {tastingNotes.palate}
                  </Text>
                  {tastingNotes.finish && (
                    <Text style={styles.tastingNotes}>Finish: {tastingNotes.finish}</Text>
                  )}
                </>
              );
            })()}
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
    width: CARD_WIDTH,
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
    minHeight: CARD_HEIGHT + 300, // Extra height for expanded content
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
    marginBottom: 8,
  },
  statusBadgeContainer: {
    marginTop: 8,
    marginBottom: 4,
  },
  userRatingContainer: {
    marginTop: 6,
    marginBottom: 4,
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
  alternativeItem: {
    marginBottom: 12,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.2)',
  },
  alternativeName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#BF9694',
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

export default SimplePremiumWineCard;
