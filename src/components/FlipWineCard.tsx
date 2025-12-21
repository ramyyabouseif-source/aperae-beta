import React, { useState, useRef, useMemo, useCallback, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  ScrollView,
  Animated,
  Dimensions,
  Easing,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { MyCellarWine, WineRecommendation } from '../types/wine';
import { getWineCardImage } from '../utils/wineCardImages';
import { getTastingNotesDisplay, getServingGuidance, getConfidenceScore, getConfidenceBreakdown, getConfidenceRationale } from '../utils/wineTypeHelpers';
import StatusSelector from './myCellar/StatusSelector';
import NotesInput from './myCellar/NotesInput';
import TagsBadgeSelector from './myCellar/TagsBadgeSelector';
import StarRating from './myCellar/StarRating';
import { FavoritesService } from '../services/favoritesService';
import StatusBadge from './myCellar/StatusBadge';

interface FlipWineCardProps {
  wine: WineRecommendation | MyCellarWine;
  onAddToFavorites?: (wine: WineRecommendation) => void;
  onRemoveFromFavorites?: (wine: WineRecommendation) => void;
  isFavorite?: boolean;
  onPress?: (wine: WineRecommendation) => void;
  showRemoveButton?: boolean;
  index?: number; // For unique image selection
  onWineUpdated?: () => void; // Callback when wine data is updated
}

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CARD_WIDTH = SCREEN_WIDTH - 40; // Account for margins (20px each side for centering)

const FlipWineCard: React.FC<FlipWineCardProps> = ({
  wine,
  onAddToFavorites,
  onRemoveFromFavorites,
  isFavorite = false,
  onPress,
  showRemoveButton = false,
  index = 0,
  onWineUpdated,
}) => {
  const cellarWine = wine as MyCellarWine;
  // Show My Cellar section if wine has an ID (indicating it's saved in My Cellar)
  // All wines in My Cellar will have ID after migration
  const isMyCellarWine = !!(cellarWine.id || (wine as any).id);
  
  // Local state for My Cellar editing
  const [localStatus, setLocalStatus] = useState<('wantToTry' | 'haveTried' | 'favorite')>(
    cellarWine.status || 'favorite'
  );
  const [localWineRating, setLocalWineRating] = useState<number | undefined>(cellarWine.wineRating);
  const [localPairingRating, setLocalPairingRating] = useState<number | undefined>(cellarWine.pairingRating);
  const [localWineNotes, setLocalWineNotes] = useState<string>(cellarWine.wineNotes || '');
  const [localPairingNotes, setLocalPairingNotes] = useState<string>(cellarWine.pairingNotes || '');
  const [localTags, setLocalTags] = useState<string[]>(cellarWine.tags || []);
  const [isFlipped, setIsFlipped] = useState(false);
  const scrollViewRef = useRef<ScrollView>(null);
  const wineNotesInputRef = useRef<any>(null);
  const pairingNotesInputRef = useRef<any>(null);
  const wineNotesContainerRef = useRef<View>(null);
  const pairingNotesContainerRef = useRef<View>(null);
  const [expanded, setExpanded] = useState(false);
  const [backExpanded, setBackExpanded] = useState(false);
  const [hasBeenFlipped, setHasBeenFlipped] = useState(false); // Track if card has been flipped
  const flipAnimation = useRef(new Animated.Value(0)).current;
  const isFlippedRef = useRef(false);
  
  // Get tasting notes display (handles both string and object formats)
  const tastingNotes = getTastingNotesDisplay(wine.tastingNotes);
  const servingGuidance = getServingGuidance(wine);
  const confidenceScore = getConfidenceScore(wine);
  const confidenceBreakdown = getConfidenceBreakdown(wine);
  const confidenceRationale = getConfidenceRationale(wine);

  // Get tier badge color
  const getTierBadgeStyle = (tierLabel?: string) => {
    if (!tierLabel) return styles.tierBadgeDefault;
    if (tierLabel.toLowerCase().includes('premium')) return styles.tierBadgePremium;
    if (tierLabel.toLowerCase().includes('moderate')) return styles.tierBadgeModerate;
    if (tierLabel.toLowerCase().includes('budget')) return styles.tierBadgeBudget;
    return styles.tierBadgeDefault;
  };

  // Get confidence color based on score
  const getConfidenceColor = (score: number) => {
    if (score >= 90) return '#4CAF50'; // Green for high confidence
    if (score >= 80) return '#FF9800'; // Orange for medium-high confidence
    return '#F44336'; // Red for lower confidence
  };


  // Get wine image from local assets - memoize to prevent unnecessary recalculations
  const wineImageSource = useMemo(() => {
    if (wine.image && wine.image !== 'unknown') {
      return { uri: wine.image };
    }
    // Use the index prop to get a random image for each card
    return getWineCardImage(index);
  }, [wine.image, index]);

  // Handle tap sequence: expand -> flip -> collapse (repeatable)
  const handleCardPress = () => {
    if (onPress) {
      onPress(wine);
      return;
    }

    // Don't handle taps when on the back - only button works
    if (isFlipped) {
      return;
    }

    // Sequence on front (repeatable):
    // 1. If not expanded, expand
    // 2. If expanded and haven't been flipped, flip to back
    // 3. If expanded and have been flipped (came back), collapse and reset
    if (!expanded) {
      setExpanded(true);
    } else if (!hasBeenFlipped) {
      // Second tap: flip to back
      flipToBack();
    } else {
      // Third tap (after coming back): collapse and reset for next cycle
      setExpanded(false);
      setHasBeenFlipped(false); // Reset so sequence can repeat
    }
  };

  // Keep ref in sync with state
  useEffect(() => {
    isFlippedRef.current = isFlipped;
  }, [isFlipped]);

  // Define flip functions - simple and clean
  const flipToBack = useCallback(() => {
    if (isFlippedRef.current) return;
    
    flipAnimation.stopAnimation();
    isFlippedRef.current = true;
    setIsFlipped(true);
    setHasBeenFlipped(true); // Mark that we've been to the back
    
    Animated.timing(flipAnimation, {
      toValue: 180,
      duration: 250,
      useNativeDriver: true,
      easing: Easing.out(Easing.ease),
    }).start();
  }, [flipAnimation]);

  const flipToFront = useCallback(() => {
    if (!isFlippedRef.current) return;
    
    flipAnimation.stopAnimation();
    isFlippedRef.current = false;
    setIsFlipped(false);
    
    Animated.timing(flipAnimation, {
      toValue: 0,
      duration: 250,
      useNativeDriver: true,
      easing: Easing.out(Easing.ease),
    }).start();
  }, [flipAnimation]);

  // Auto-expand back when flipped - back is always fully expanded
  useEffect(() => {
    if (isFlipped) {
      setBackExpanded(true);
    }
  }, [isFlipped]);

  const handleFavoritePress = (e: any) => {
    e.stopPropagation();
    if (isFavorite && onRemoveFromFavorites) {
      onRemoveFromFavorites(wine);
    } else if (!isFavorite && onAddToFavorites) {
      onAddToFavorites(wine);
    }
  };

  // Simple opacity-based flip - no 3D rotation needed
  const frontOpacity = flipAnimation.interpolate({
    inputRange: [0, 90, 180],
    outputRange: [1, 0, 0],
  });

  const frontScaleX = flipAnimation.interpolate({
    inputRange: [0, 90, 180],
    outputRange: [1, 0.3, 0],
  });

  const backOpacity = flipAnimation.interpolate({
    inputRange: [0, 90, 180],
    outputRange: [0, 0, 1],
  });

  const backScaleX = flipAnimation.interpolate({
    inputRange: [0, 90, 180],
    outputRange: [0, 0.3, 1],
  });

  const frontAnimatedStyle = {
    opacity: frontOpacity,
    transform: [{ scaleX: frontScaleX }],
  };

  const backAnimatedStyle = {
    opacity: backOpacity,
    transform: [{ scaleX: backScaleX }],
  };

  return (
    <View 
      style={styles.container} 
      collapsable={false}
    >
      {/* Front of Card - Essential Info - Only render when not flipped */}
      {!isFlipped && (
        <Animated.View
          style={[
            styles.card,
            styles.cardFront,
            frontAnimatedStyle,
          ]}
        >
        <TouchableOpacity
          activeOpacity={0.9}
          onPress={handleCardPress}
          style={styles.cardTouchable}
          delayPressIn={250}
          delayPressOut={50}
        >
          {/* Background Image - extends to fill entire card like V1 */}
          <Image
            source={wineImageSource}
            style={styles.wineImage}
            resizeMode="cover"
          />
          
          {/* Dark Overlay - extends to fill entire card like V1 */}
          <View style={styles.darkOverlay} />
          
          {/* Wine Accent Bar - like V1 */}
          <View style={styles.wineAccent} />

          {/* Content Container */}
          <View style={styles.contentWrapper}>
            {/* Image Overlay for badges - Top Row */}
            <View style={styles.imageOverlay}>
              {/* Tier Label Badge - Left */}
              {wine.tierLabel && (
                <View style={[styles.tierBadge, getTierBadgeStyle(wine.tierLabel)]}>
                  <Text style={styles.tierBadgeText}>{wine.tierLabel}</Text>
                </View>
              )}
              
              {/* Status Badge - Top Right (My Cellar) */}
              {isMyCellarWine && (
                <View style={styles.statusBadgeTopRight}>
                  <StatusBadge 
                    status={(localStatus === 'wantToTry' ? 'wantToTry' : localStatus === 'haveTried' ? 'haveTried' : 'favorite') as 'wantToTry' | 'haveTried' | 'favorite'} 
                    size="small"
                    showLabel={false}
                  />
                </View>
              )}
            </View>
            {/* Favorite Button */}
            <TouchableOpacity
              style={styles.favoriteButtonOverlay}
              onPress={handleFavoritePress}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <Ionicons
                name={isFavorite ? 'heart' : 'heart-outline'}
                size={24}
                color={isFavorite ? '#ff1744' : '#fff'}
              />
            </TouchableOpacity>
          </View>

            {/* Essential Info */}
            <View style={styles.content}>
              {/* Wine Name and Producer */}
              <View style={styles.titleSection}>
                {/* Wine Name - Full width to allow wrapping */}
                <View style={styles.titleContainer}>
                  <Text style={styles.wineName} numberOfLines={2}>
                    {wine.wineName}
                  </Text>
                </View>
                <Text style={styles.producerText}>
                  {wine.producer} • {wine.vintage}
                </Text>
                {(wine.grape || wine.category) && (
                  <Text style={styles.category}>{wine.grape || wine.category}</Text>
                )}
                
                
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

            {/* Rationale - Essential Pairing Info */}
            <View style={styles.rationaleContainer}>
              <Text style={styles.rationaleLabel}>Why This Wine:</Text>
              <Text style={styles.rationale} numberOfLines={expanded ? undefined : 3}>
                {wine.rationale}
              </Text>
            </View>

            {/* Tasting Notes */}
            <View style={styles.tastingNotesContainer}>
              <Text style={styles.tastingNotesLabel}>Tasting Notes:</Text>
              {tastingNotes.aromas.length > 0 && (
                <Text style={styles.tastingNotesText}>
                  <Text style={styles.tastingNotesLabelWord}>Aromas:</Text> {tastingNotes.aromas.join(', ')}
                </Text>
              )}
              {tastingNotes.palate && (
                <Text style={styles.tastingNotesText} numberOfLines={expanded ? undefined : 3}>
                  <Text style={styles.tastingNotesLabelWord}>Palate:</Text> {tastingNotes.palate}
                </Text>
              )}
              {tastingNotes.finish && (
                <Text style={styles.tastingNotesText}>
                  <Text style={styles.tastingNotesLabelWord}>Finish:</Text> {tastingNotes.finish}
                </Text>
              )}
            </View>

            {/* Tap Hint */}
            {!expanded && (
              <View style={styles.tapHint}>
                <Ionicons name="expand-outline" size={16} color="#FFD700" />
                <Text style={styles.tapHintText}>Tap to expand</Text>
              </View>
            )}
            {expanded && !isFlipped && (
              <View style={styles.tapHint}>
                <Ionicons name="chevron-up-outline" size={16} color="#FFD700" />
                <Text style={styles.tapHintText}>Tap to collapse or flip for details</Text>
              </View>
            )}

            {/* Disclaimer on Front */}
            <View style={styles.disclaimer}>
              <Text style={styles.disclaimerText}>
                Recommendations based on established food-wine pairing principles.
              </Text>
            </View>
          </View>
        </TouchableOpacity>
        </Animated.View>
      )}

      {/* Back of Card - Detailed Info - Only render when flipped */}
      {isFlipped && (
        <Animated.View
          style={[
            styles.card,
            styles.cardBack,
            backAnimatedStyle,
          ]}
        >
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.keyboardAvoidingView}
          keyboardVerticalOffset={100}
        >
          <ScrollView
            ref={scrollViewRef}
            style={styles.backScrollView}
            contentContainerStyle={styles.backScrollContent}
            keyboardShouldPersistTaps="handled"
            keyboardDismissMode="interactive"
            showsVerticalScrollIndicator={true}
          >
            <View style={styles.backContent}>
            {/* Back Header */}
            <View style={styles.backHeader}>
              <Text style={styles.backTitle}>Wine Details</Text>
              <TouchableOpacity 
                onPress={() => {
                  flipToFront();
                }} 
                style={styles.flipButton}
                activeOpacity={0.7}
              >
                <Ionicons name="return-up-back-outline" size={20} color="#8B0000" />
                <Text style={styles.flipButtonText}>Flip Back</Text>
              </TouchableOpacity>
            </View>

            {/* Serving Guidance */}
            <View style={styles.servingGuidanceContainer}>
              <Text style={styles.servingGuidanceLabel}>Serving Suggestion:</Text>
              <Text style={styles.servingGuidanceText}>
                {servingGuidance}
              </Text>
            </View>

            {/* Confidence Score */}
            {confidenceScore > 0 && (
              <View style={styles.confidenceContainer}>
                <View style={styles.confidenceLabel}>
                  <Ionicons name="checkmark-circle" size={16} color="#8B0000" />
                  <Text style={styles.confidenceLabelText}>Confidence Score</Text>
                </View>
                <View style={styles.confidenceBar}>
                  <View
                    style={[
                      styles.confidenceFill,
                      {
                        width: `${confidenceScore}%`,
                        backgroundColor: getConfidenceColor(confidenceScore),
                      },
                    ]}
                  />
                </View>
                <Text style={styles.confidenceScoreText}>
                  {confidenceScore}% confidence
                </Text>
                
                {/* Confidence Breakdown */}
                {confidenceBreakdown && (
                  <View style={styles.confidenceBreakdownContainer}>
                    <View style={styles.confidenceBreakdownItem}>
                      <Text style={styles.confidenceBreakdownLabel}>Pairing Science:</Text>
                      <Text style={styles.confidenceBreakdownValue}>{confidenceBreakdown.pairingScience}%</Text>
                    </View>
                    <View style={styles.confidenceBreakdownItem}>
                      <Text style={styles.confidenceBreakdownLabel}>Wine Knowledge:</Text>
                      <Text style={styles.confidenceBreakdownValue}>{confidenceBreakdown.wineKnowledge}%</Text>
                    </View>
                    <View style={styles.confidenceBreakdownItem}>
                      <Text style={styles.confidenceBreakdownLabel}>Complexity Handling:</Text>
                      <Text style={styles.confidenceBreakdownValue}>{confidenceBreakdown.complexityHandling}%</Text>
                    </View>
                  </View>
                )}
                
                {/* Confidence Rationale */}
                {confidenceRationale && (
                  <Text style={styles.confidenceRationaleText}>
                    {confidenceRationale}
                  </Text>
                )}
              </View>
            )}

            {/* Region (Enhanced Format) */}
            {wine.region && wine.region !== 'unknown' && (
              <View style={styles.detailSection}>
                <Text style={styles.detailTitle}>
                  <Ionicons name="location" size={16} color="#8B0000" /> Region
                </Text>
                <Text style={styles.detailText}>{wine.region}</Text>
              </View>
            )}

            {/* Story (Enhanced Format - prefer story over storytellingElements) */}
            {(wine.story || wine.storytellingElements) && (
              <View style={styles.detailSection}>
                <Text style={styles.detailTitle}>
                  <Ionicons name="book" size={16} color="#8B0000" /> Story
                </Text>
                <Text style={styles.detailText}>
                  {wine.story || wine.storytellingElements}
                </Text>
              </View>
            )}

            {/* My Cellar Section - Only show if wine is in My Cellar */}
            {isMyCellarWine && (
              <View style={styles.myCellarSection}>
                <Text style={styles.myCellarSectionTitle}>
                  <Ionicons name="wine" size={16} color="#8B0000" /> My Cellar
                </Text>
                
                {/* Status Selector - Only Want to Try / Have Tried (favorite removed since all wines in My Cellar are favorites) */}
                <StatusSelector
                  currentStatus={localStatus === 'wantToTry' ? 'wantToTry' : localStatus === 'haveTried' ? 'haveTried' : 'wantToTry'}
                  onStatusChange={async (newStatus) => {
                    setLocalStatus(newStatus);
                    if (cellarWine.id) {
                      try {
                        await FavoritesService.updateWineStatus(cellarWine.id, newStatus);
                        onWineUpdated?.();
                      } catch (error) {
                        console.error('Error updating status:', error);
                      }
                    }
                  }}
                />

                {/* Ratings */}
                <View style={styles.ratingsContainer}>
                  <View style={styles.ratingItem}>
                    <Text style={styles.ratingLabel}>Wine Rating</Text>
                    <StarRating
                      rating={localWineRating || 0}
                      size={20}
                      readonly={false}
                      onRatingChange={async (rating) => {
                        setLocalWineRating(rating);
                        if (cellarWine.id) {
                          try {
                            await FavoritesService.updateWineRating(cellarWine.id, rating);
                            onWineUpdated?.();
                          } catch (error) {
                            console.error('Error updating wine rating:', error);
                          }
                        }
                      }}
                    />
                  </View>
                  <View style={styles.ratingItem}>
                    <Text style={styles.ratingLabel}>Pairing Rating</Text>
                    <StarRating
                      rating={localPairingRating || 0}
                      size={20}
                      readonly={false}
                      onRatingChange={async (rating) => {
                        setLocalPairingRating(rating);
                        if (cellarWine.id) {
                          try {
                            await FavoritesService.updatePairingRating(cellarWine.id, rating);
                            onWineUpdated?.();
                          } catch (error) {
                            console.error('Error updating pairing rating:', error);
                          }
                        }
                      }}
                    />
                  </View>
                </View>

                {/* Notes */}
                <View ref={wineNotesContainerRef}>
                  <NotesInput
                    label="Wine Notes"
                    placeholder="Add your tasting notes..."
                    value={localWineNotes}
                    onChangeText={setLocalWineNotes}
                    inputRef={wineNotesInputRef}
                    onFocus={() => {
                      // Scroll to input when keyboard appears (same pattern as home screen)
                      setTimeout(() => {
                        if (wineNotesInputRef.current && scrollViewRef.current) {
                          // Use measureLayout to get position relative to ScrollView
                          wineNotesInputRef.current.measureLayout(
                            scrollViewRef.current as any,
                            (_x, y, _width, _height) => {
                              scrollViewRef.current?.scrollTo({
                                y: Math.max(0, y - 150), // Scroll to show input with padding above
                                animated: true,
                              });
                            },
                            () => {
                              // Fallback to measure if measureLayout fails
                              wineNotesInputRef.current?.measure((_x, _y, _width, _height, _pageX, pageY) => {
                                scrollViewRef.current?.scrollTo({
                                  y: Math.max(0, pageY - 150),
                                  animated: true,
                                });
                              });
                            }
                          );
                        }
                      }, 300); // Delay to allow keyboard to appear
                    }}
                    onBlur={async () => {
                      if (cellarWine.id) {
                        try {
                          await FavoritesService.updateWineNotes(cellarWine.id, localWineNotes);
                          onWineUpdated?.();
                        } catch (error) {
                          console.error('Error updating wine notes:', error);
                        }
                      }
                    }}
                  />
                </View>
                
                <View ref={pairingNotesContainerRef}>
                  <NotesInput
                    label="Pairing Notes"
                    placeholder="How did this pair with your dish?"
                    value={localPairingNotes}
                    onChangeText={setLocalPairingNotes}
                    inputRef={pairingNotesInputRef}
                    onFocus={() => {
                      // Scroll to input when keyboard appears (same pattern as home screen)
                      setTimeout(() => {
                        if (pairingNotesInputRef.current && scrollViewRef.current) {
                          // Use measureLayout to get position relative to ScrollView
                          pairingNotesInputRef.current.measureLayout(
                            scrollViewRef.current as any,
                            (_x, y, _width, _height) => {
                              scrollViewRef.current?.scrollTo({
                                y: Math.max(0, y - 150), // Scroll to show input with padding above
                                animated: true,
                              });
                            },
                            () => {
                              // Fallback to measure if measureLayout fails
                              pairingNotesInputRef.current?.measure((_x, _y, _width, _height, _pageX, pageY) => {
                                scrollViewRef.current?.scrollTo({
                                  y: Math.max(0, pageY - 150),
                                  animated: true,
                                });
                              });
                            }
                          );
                        }
                      }, 300); // Delay to allow keyboard to appear
                    }}
                    onBlur={async () => {
                      if (cellarWine.id) {
                        try {
                          await FavoritesService.updatePairingNotes(cellarWine.id, localPairingNotes);
                          onWineUpdated?.();
                        } catch (error) {
                          console.error('Error updating pairing notes:', error);
                        }
                      }
                    }}
                  />
                </View>

                {/* Tags */}
                <TagsBadgeSelector
                  label="Tags"
                  selectedTags={localTags}
                  onTagsChange={async (tags) => {
                    setLocalTags(tags);
                    if (cellarWine.id) {
                      try {
                        await FavoritesService.updateWineTags(cellarWine.id, tags);
                        onWineUpdated?.();
                      } catch (error) {
                        console.error('Error updating tags:', error);
                      }
                    }
                  }}
                  availableTags={[
                    'Special Occasions',
                    'Dinner Parties',
                    'Date Night',
                    'Weekend',
                    'Holiday',
                    'Gift',
                    'Celebration',
                    'Everyday',
                    'Fine Dining',
                    'Casual',
                  ]}
                />
              </View>
            )}

            {/* Alternatives (Enhanced Format) */}
            {wine.alternatives && wine.alternatives.length > 0 && (
              <View style={[styles.detailSection, styles.alternativesSection]}>
                <Text style={styles.detailTitle}>
                  <Ionicons name="wine" size={16} color="#8B0000" /> Alternative Wines
                </Text>
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
              </View>
            )}

            {/* Action Buttons */}
            <View style={styles.backActions}>
              <TouchableOpacity
                style={[styles.favoriteButton, isFavorite && styles.favoriteButtonActive]}
                onPress={handleFavoritePress}
              >
                <Ionicons
                  name={isFavorite ? 'heart' : 'heart-outline'}
                  size={20}
                  color={isFavorite ? '#fff' : '#8B0000'}
                />
                <Text style={[styles.favoriteText, isFavorite && styles.favoriteTextActive]}>
                  {isFavorite ? 'Favorited' : 'Add to Favorites'}
                </Text>
              </TouchableOpacity>

              {showRemoveButton && onRemoveFromFavorites && (
                <TouchableOpacity
                  style={styles.removeButton}
                  onPress={() => onRemoveFromFavorites(wine)}
                >
                  <Ionicons name="trash-outline" size={20} color="#f44336" />
                  <Text style={styles.removeText}>Remove</Text>
                </TouchableOpacity>
              )}
            </View>

            {/* Disclaimer */}
            <View style={styles.disclaimer}>
              <Text style={styles.disclaimerText}>
                Recommendations based on established food-wine pairing principles - prices and ratings are estimates and may vary by retailer
              </Text>
            </View>
          </View>
          </ScrollView>
        </KeyboardAvoidingView>
        </Animated.View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: CARD_WIDTH,
    alignSelf: 'center', // Force centering
    marginHorizontal: 20, // Match button centering
    marginTop: 12, // Top margin
    marginBottom: 12, // Bottom margin for spacing between cards
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 12,
    minHeight: 320, // Minimum height to prevent collapse
  },
  card: {
    width: '100%',
    minHeight: 320, // Match V1 card height
    borderRadius: 20,
    overflow: 'hidden',
    backgroundColor: '#fff',
  },
  cardFront: {
    width: '100%',
    position: 'relative', // Always in normal flow to prevent overlap
  },
  cardBack: {
    width: '100%',
    minHeight: 320,
    position: 'relative', // Always in normal flow to prevent overlap
  },
  cardTouchable: {
    width: '100%',
    flex: 1,
    position: 'relative',
  },
  backTapArea: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 60, // Tap area at top for flip/collapse
    zIndex: 10,
  },
  imageContainer: {
    position: 'absolute', // Position absolutely like V1
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    width: '100%',
    height: '100%',
  },
  wineImage: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    width: '100%',
    height: '100%',
    // Extend beyond the card to cover expanded content
    minHeight: 620, // Extra height for expanded content
  },
  darkOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)', // Match V1 overlay
  },
  wineAccent: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: 6,
    height: '100%',
    backgroundColor: '#5B2433', // Dark tone accent like V1
  },
  contentWrapper: {
    position: 'relative',
    flex: 1,
    zIndex: 1,
  },
  imageOverlay: {
    position: 'absolute',
    top: 12,
    left: 12,
    right: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    zIndex: 2,
  },
  statusBadgeTopRight: {
    position: 'absolute',
    top: 0,
    right: 0,
    zIndex: 10,
  },
  tierBadge: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 16,
  },
  tierBadgePremium: {
    backgroundColor: '#8B3A3A', // Pinot - wine-inspired premium
  },
  tierBadgeModerate: {
    backgroundColor: '#BF9694', // Metallic Rose - wine-inspired moderate
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)', // Subtle white border for visibility on dark overlay
  },
  tierBadgeBudget: {
    backgroundColor: '#C4B298', // Darker Chardonnay/Beige - wine-inspired budget (darker for better text contrast)
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)', // Subtle white border for visibility on dark overlay
  },
  tierBadgeDefault: {
    backgroundColor: '#8B0000',
  },
  tierBadgeText: {
    color: '#FFFFFF', // White text for all tiers on dark overlay cards
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  priceText: {
    color: '#fff',
    fontSize: 16, // Match V1
    fontWeight: 'bold',
  },
  favoriteButtonOverlay: {
    position: 'absolute',
    bottom: 12,
    right: 12,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    borderRadius: 20,
    padding: 8,
  },
  content: {
    flex: 1,
    paddingTop: 20,
    paddingBottom: 20,
    paddingLeft: 20,
    paddingRight: 20, // Match imageOverlay right: 12 + 8 = 20 to align with price badge
    justifyContent: 'space-between',
    marginTop: 60, // Space for badges
  },
  titleSection: {
    marginBottom: 12,
  },
  titleContainer: {
    width: '100%',
    marginBottom: 8,
  },
  wineName: {
    fontSize: 22, // Match V1
    fontWeight: 'bold',
    color: '#fff', // White text like V1
    textShadowColor: 'rgba(0, 0, 0, 0.8)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  producerText: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)', // White with opacity like V1
    fontWeight: '500',
  },
  category: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.7)',
    fontStyle: 'italic',
    marginTop: 4,
  },
  statusBadgeContainer: {
    marginTop: 8,
    marginBottom: 4,
  },
  userRatingContainer: {
    marginTop: 6,
    marginBottom: 4,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.9)', // Match V1
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    flexShrink: 0, // Prevent shrinking
  },
  expertRating: {
    fontSize: 12,
    fontWeight: '600',
    color: '#5B2433', // Dark tone text like V1
    marginLeft: 4,
  },
  priceRatingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
  },
  priceInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  priceLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
    marginRight: 8,
  },
  priceValue: {
    fontSize: 16,
    fontWeight: '700',
    color: '#333',
  },
  ratingInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF9E6',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
  },
  ratingValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#5B2433',
    marginLeft: 4,
  },
  servingGuidanceContainer: {
    backgroundColor: '#F5F5F5',
    padding: 12,
    borderRadius: 8,
    marginTop: 16,
    marginBottom: 16,
    borderLeftWidth: 4,
    borderLeftColor: '#8B0000',
  },
  servingGuidanceLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#8B0000',
    marginBottom: 6,
    textTransform: 'uppercase',
  },
  servingGuidanceText: {
    fontSize: 14,
    color: '#333',
    lineHeight: 20,
  },
  confidenceContainer: {
    backgroundColor: '#F5F5F5',
    padding: 12,
    borderRadius: 8,
    marginTop: 16,
    marginBottom: 16,
    borderLeftWidth: 4,
    borderLeftColor: '#8B0000',
  },
  confidenceLabel: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  confidenceLabelText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#333',
    marginLeft: 6,
  },
  confidenceBar: {
    height: 6,
    backgroundColor: '#E0E0E0',
    borderRadius: 3,
    overflow: 'hidden',
    marginBottom: 8,
  },
  confidenceFill: {
    height: '100%',
    borderRadius: 3,
  },
  confidenceScoreText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  confidenceBreakdownContainer: {
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
  },
  confidenceBreakdownItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  confidenceBreakdownLabel: {
    fontSize: 12,
    color: '#666',
    flex: 1,
  },
  confidenceBreakdownValue: {
    fontSize: 12,
    fontWeight: '600',
    color: '#333',
  },
  confidenceRationaleText: {
    fontSize: 12,
    color: '#666',
    fontStyle: 'italic',
    marginTop: 8,
    lineHeight: 16,
  },
  rationaleContainer: {
    marginBottom: 12,
  },
  rationaleLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#BF9694', // Metallic accent like V1
    marginBottom: 6,
    textShadowColor: 'rgba(0, 0, 0, 0.8)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  rationale: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.9)', // White text like V1
    lineHeight: 20,
    textShadowColor: 'rgba(0, 0, 0, 0.8)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  tastingNotesContainer: {
    marginBottom: 12,
  },
  tastingNotesLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#BF9694', // Metallic accent like V1 - matches rationaleLabel
    marginBottom: 6,
    textShadowColor: 'rgba(0, 0, 0, 0.8)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  tastingNotesText: {
    fontSize: 13,
    color: 'rgba(255, 255, 255, 0.9)', // Same as rationale text
    lineHeight: 20,
    marginBottom: 4,
    textShadowColor: 'rgba(0, 0, 0, 0.8)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  tastingNotesLabelWord: {
    fontSize: 13,
    fontStyle: 'italic',
    color: 'rgba(255, 255, 255, 0.9)',
    textShadowColor: 'rgba(0, 0, 0, 0.8)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  tapHint: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    marginTop: 8,
  },
  tapHintText: {
    fontSize: 12,
    color: '#FFD700',
    marginLeft: 4,
    fontStyle: 'italic',
    textShadowColor: 'rgba(0, 0, 0, 0.8)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  backContent: {
    padding: 16,
    paddingBottom: 24,
  },
  backHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    paddingBottom: 12,
    borderBottomWidth: 2,
    borderBottomColor: '#8B0000',
  },
  backTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#333',
  },
  flipButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: '#f0f0f0',
  },
  flipButtonText: {
    fontSize: 12,
    color: '#8B0000',
    fontWeight: '600',
    marginLeft: 4,
  },
  detailSection: {
    marginBottom: 20,
  },
  detailTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#333',
    marginBottom: 8,
    flexDirection: 'row',
    alignItems: 'center',
  },
  detailText: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  analysisGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 12,
    marginHorizontal: -4,
  },
  analysisItem: {
    width: '48%',
    backgroundColor: '#F9F9F9',
    padding: 10,
    borderRadius: 8,
    marginHorizontal: '1%',
    marginBottom: 8,
  },
  analysisLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: '#666',
    marginBottom: 4,
  },
  analysisValue: {
    fontSize: 13,
    color: '#333',
    fontWeight: '500',
  },
  flavorsContainer: {
    marginTop: 8,
  },
  flavorsLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#666',
    marginBottom: 6,
  },
  flavorsTags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -3,
  },
  flavorTag: {
    backgroundColor: '#E3F2FD',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    marginHorizontal: 3,
    marginBottom: 6,
  },
  flavorText: {
    fontSize: 11,
    color: '#1976D2',
    fontWeight: '500',
  },
  backActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  favoriteButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f8f8f8',
    borderWidth: 1,
    borderColor: '#8B0000',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginRight: 8,
  },
  favoriteButtonActive: {
    backgroundColor: '#8B0000',
  },
  favoriteText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#8B0000',
    marginLeft: 6,
  },
  favoriteTextActive: {
    color: '#fff',
  },
  removeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#ffebee',
    borderWidth: 1,
    borderColor: '#f44336',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  removeText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#f44336',
    marginLeft: 6,
  },
  disclaimer: {
    marginTop: 16,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  disclaimerText: {
    fontSize: 10,
    color: '#999',
    fontStyle: 'italic',
    textAlign: 'center',
    lineHeight: 14,
  },
  alternativesSection: {
    marginBottom: 0, // Remove extra margin
  },
  alternativeItem: {
    marginBottom: 8,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  alternativeItemLast: {
    marginBottom: 0, // Remove bottom margin from last item
    paddingBottom: 0,
    borderBottomWidth: 0, // Remove border from last item
  },
  alternativeName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  alternativeDetails: {
    fontSize: 12,
    color: '#666',
    fontStyle: 'italic',
  },
});

export default FlipWineCard;


