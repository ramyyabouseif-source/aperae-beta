import React, { memo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Animated,
  Dimensions,
} from 'react-native';
import { WineRecommendation } from '../types/wine';
import { COLORS, TYPOGRAPHY, SPACING, RADIUS, SHADOWS } from '../design';
import EnhancedButton from './EnhancedButton';

interface EnhancedWineCardProps {
  wine: WineRecommendation;
  onAddToFavorites?: (wine: WineRecommendation) => void;
  onRemoveFromFavorites?: (wine: WineRecommendation) => void;
  isFavorite?: boolean;
  onPress?: (wine: WineRecommendation) => void;
}

const { width } = Dimensions.get('window');
const CARD_WIDTH = width - SPACING.md * 2;

const EnhancedWineCard = memo(function EnhancedWineCard({
  wine,
  onAddToFavorites,
  onRemoveFromFavorites,
  isFavorite = false,
  onPress,
}: EnhancedWineCardProps) {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [showFullDetails, setShowFullDetails] = useState(false);
  const scaleValue = new Animated.Value(1);

  const handlePressIn = () => {
    Animated.spring(scaleValue, {
      toValue: 0.98,
      useNativeDriver: true,
      tension: 300,
      friction: 10,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleValue, {
      toValue: 1,
      useNativeDriver: true,
      tension: 300,
      friction: 10,
    }).start();
  };

  const handleFavoritePress = () => {
    if (isFavorite) {
      onRemoveFromFavorites?.(wine);
    } else {
      onAddToFavorites?.(wine);
    }
  };

  const getConfidenceColor = (score: number) => {
    if (score >= 90) return COLORS.success[500];
    if (score >= 80) return COLORS.warning[500];
    return COLORS.error[500];
  };

  const getPriceColor = (price: string) => {
    const priceNum = parseInt(price.replace(/[^0-9]/g, ''));
    if (priceNum >= 100) return COLORS.wine.burgundy;
    if (priceNum >= 50) return COLORS.primary[500];
    return COLORS.success[500];
  };

  return (
    <Animated.View style={[styles.container, { transform: [{ scale: scaleValue }] }]}>
      <TouchableOpacity
        style={styles.card}
        onPress={() => onPress?.(wine)}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        activeOpacity={0.95}
      >
        {/* Wine Image */}
        <View style={styles.imageContainer}>
          <Image
            source={{ uri: wine.image || 'https://via.placeholder.com/200x300/8B0000/FFFFFF?text=Wine' }}
            style={styles.wineImage}
            onLoad={() => setImageLoaded(true)}
            resizeMode="cover"
          />
          {!imageLoaded && (
            <View style={styles.imagePlaceholder}>
              <Text style={styles.placeholderText}>🍷</Text>
            </View>
          )}
          
          {/* Favorite Button */}
          <TouchableOpacity
            style={styles.favoriteButton}
            onPress={handleFavoritePress}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Text style={styles.favoriteIcon}>
              {isFavorite ? '❤️' : '🤍'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Wine Info */}
        <View style={styles.content}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.wineName} numberOfLines={2}>
              {wine.wineName}
            </Text>
            <Text style={styles.producer} numberOfLines={1}>
              {wine.producer} • {wine.vintage}
            </Text>
          </View>

          {/* Price and Rating */}
          <View style={styles.priceRatingRow}>
            <View style={[styles.priceTag, { backgroundColor: getPriceColor(wine.pricePoint || '$0') + '20' }]}>
              <Text style={[styles.priceText, { color: getPriceColor(wine.pricePoint || '$0') }]}>
                {wine.pricePoint || 'Price N/A'}
              </Text>
            </View>
            
            <View style={styles.ratingContainer}>
              <Text style={styles.ratingText}>
                {wine.expertRating || 'Rating N/A'}
              </Text>
            </View>
          </View>

          {/* Confidence Score */}
          <View style={styles.confidenceContainer}>
            <View style={styles.confidenceBar}>
              <View
                style={[
                  styles.confidenceFill,
                  {
                    width: `${wine.confidenceScore}%`,
                    backgroundColor: getConfidenceColor(wine.confidenceScore),
                  },
                ]}
              />
            </View>
            <Text style={styles.confidenceText}>
              {wine.confidenceScore}% confidence
            </Text>
          </View>

          {/* Rationale */}
          <Text style={styles.rationale} numberOfLines={showFullDetails ? undefined : 2}>
            {wine.rationale}
          </Text>

          {/* Expand/Collapse Button */}
          <TouchableOpacity
            style={styles.expandButton}
            onPress={() => setShowFullDetails(!showFullDetails)}
          >
            <Text style={styles.expandText}>
              {showFullDetails ? 'Show Less' : 'Show More'}
            </Text>
          </TouchableOpacity>

          {/* Full Details (when expanded) */}
          {showFullDetails && (
            <View style={styles.fullDetails}>
              <View style={styles.detailSection}>
                <Text style={styles.detailTitle}>Tasting Notes</Text>
                <Text style={styles.detailText}>{wine.tastingNotes}</Text>
              </View>
              
              <View style={styles.detailSection}>
                <Text style={styles.detailTitle}>Serving</Text>
                <Text style={styles.detailText}>{wine.servingGuidance}</Text>
              </View>
              
              <View style={styles.detailSection}>
                <Text style={styles.detailTitle}>Where to Buy</Text>
                <Text style={styles.detailText}>{wine.retailerSuggestion}</Text>
              </View>
              
              {wine.storytellingElements && (
                <View style={styles.detailSection}>
                  <Text style={styles.detailTitle}>Story</Text>
                  <Text style={styles.detailText}>{wine.storytellingElements}</Text>
                </View>
              )}
            </View>
          )}

          {/* Action Buttons */}
          <View style={styles.actions}>
            <EnhancedButton
              title={isFavorite ? 'Remove from Favorites' : 'Add to Favorites'}
              onPress={handleFavoritePress}
              variant={isFavorite ? 'danger' : 'primary'}
              size="small"
              fullWidth
            />
          </View>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
});

const styles = StyleSheet.create({
  container: {
    marginHorizontal: SPACING.md,
    marginVertical: SPACING.sm,
  },
  card: {
    backgroundColor: COLORS.background.primary,
    borderRadius: RADIUS.lg,
    ...SHADOWS.medium,
    overflow: 'hidden',
  },
  imageContainer: {
    position: 'relative',
    height: 200,
    backgroundColor: COLORS.neutral[100],
  },
  wineImage: {
    width: '100%',
    height: '100%',
  },
  imagePlaceholder: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.neutral[100],
  },
  placeholderText: {
    fontSize: 48,
  },
  favoriteButton: {
    position: 'absolute',
    top: SPACING.sm,
    right: SPACING.sm,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: RADIUS.full,
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    ...SHADOWS.light,
  },
  favoriteIcon: {
    fontSize: 20,
  },
  content: {
    padding: SPACING.md,
  },
  header: {
    marginBottom: SPACING.sm,
  },
  wineName: {
    ...TYPOGRAPHY.headline.small,
    color: COLORS.text.primary,
    marginBottom: SPACING.xs,
  },
  producer: {
    ...TYPOGRAPHY.body.small,
    color: COLORS.text.secondary,
  },
  priceRatingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  priceTag: {
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    borderRadius: RADIUS.sm,
  },
  priceText: {
    ...TYPOGRAPHY.label.medium,
    fontWeight: '700',
  },
  ratingContainer: {
    backgroundColor: COLORS.info[50],
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    borderRadius: RADIUS.sm,
  },
  ratingText: {
    ...TYPOGRAPHY.label.small,
    color: COLORS.info[700],
  },
  confidenceContainer: {
    marginBottom: SPACING.sm,
  },
  confidenceBar: {
    height: 4,
    backgroundColor: COLORS.neutral[200],
    borderRadius: RADIUS.xs,
    overflow: 'hidden',
    marginBottom: SPACING.xs,
  },
  confidenceFill: {
    height: '100%',
    borderRadius: RADIUS.xs,
  },
  confidenceText: {
    ...TYPOGRAPHY.caption,
    color: COLORS.text.tertiary,
    textAlign: 'center',
  },
  rationale: {
    ...TYPOGRAPHY.body.small,
    color: COLORS.text.secondary,
    lineHeight: 20,
    marginBottom: SPACING.sm,
  },
  expandButton: {
    alignSelf: 'flex-start',
    marginBottom: SPACING.sm,
  },
  expandText: {
    ...TYPOGRAPHY.label.small,
    color: COLORS.primary[500],
  },
  fullDetails: {
    marginBottom: SPACING.sm,
  },
  detailSection: {
    marginBottom: SPACING.sm,
  },
  detailTitle: {
    ...TYPOGRAPHY.label.small,
    color: COLORS.text.primary,
    marginBottom: SPACING.xs,
  },
  detailText: {
    ...TYPOGRAPHY.body.small,
    color: COLORS.text.secondary,
    lineHeight: 18,
  },
  actions: {
    marginTop: SPACING.sm,
  },
});

export default EnhancedWineCard;




