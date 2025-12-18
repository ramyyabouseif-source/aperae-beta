import React, { useState, useRef, useCallback, useEffect } from 'react';
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
import { DishRecommendation } from '../types/dish';
import { getDishCardImage } from '../utils/dishCardImages';
import { COLORS } from '../design';

interface FlipDishCardProps {
  dish: DishRecommendation;
  index: number;
  onPress?: () => void;
}

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CARD_WIDTH = SCREEN_WIDTH - 40;

const FlipDishCard: React.FC<FlipDishCardProps> = ({
  dish,
  index,
  onPress,
}) => {
  const [expanded, setExpanded] = useState(false);
  const [isFlipped, setIsFlipped] = useState(false);
  const [hasBeenFlipped, setHasBeenFlipped] = useState(false);
  const flipAnimation = useRef(new Animated.Value(0)).current;
  const isFlippedRef = useRef(false);
  const scrollViewRef = useRef<ScrollView>(null);

  // Keep ref in sync with state
  useEffect(() => {
    isFlippedRef.current = isFlipped;
  }, [isFlipped]);

  // Handle tap sequence: expand -> flip -> collapse (repeatable)
  const handleCardPress = () => {
    if (onPress) {
      onPress();
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
      setHasBeenFlipped(false);
    }
  };

  const flipToBack = useCallback(() => {
    if (isFlippedRef.current) return;
    
    flipAnimation.stopAnimation();
    isFlippedRef.current = true;
    setIsFlipped(true);
    setHasBeenFlipped(true);
    
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

  const getComplexityColor = (level: string) => {
    switch (level) {
      case 'simple':
        return COLORS.success[500];
      case 'moderate':
        return COLORS.warning[500];
      case 'complex':
        return COLORS.primary[500];
      default:
        return COLORS.neutral[400];
    }
  };

  const dishImage = getDishCardImage(dish.complexity.level, index);

  // Flip animations
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
    <View style={styles.container} collapsable={false}>
      {/* Front of Card */}
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
          >
            {/* Background Image - extends to fill entire card */}
            <Image
              source={dishImage}
              style={styles.dishImage}
              resizeMode="cover"
                onError={() => {}}
            />
            
            {/* Dark Overlay */}
            <View style={styles.darkOverlay} />
            
            {/* Dish Accent Bar */}
            <View style={styles.dishAccent} />

            {/* Content Container */}
            <View style={styles.contentWrapper}>
              {/* Image Overlay for badges - Top Row (matching wine card structure) */}
              <View style={styles.imageOverlay}>
                {/* Complexity Badge - Top Left */}
                <View
                  style={[
                    styles.complexityBadge,
                    { backgroundColor: getComplexityColor(dish.complexity.level) },
                  ]}
                >
                  <Text style={styles.complexityText}>{dish.complexity.label}</Text>
                </View>
                
              </View>

              {/* Content */}
              <View style={[
                styles.content,
                expanded && { marginTop: 48, paddingTop: 12 }
              ]}>
                {/* Dish Name */}
                <View style={styles.titleSection}>
                  <View style={styles.titleContainer}>
                    <Text style={styles.dishName} numberOfLines={3}>
                      {dish.dishName}
                    </Text>
                  </View>
                </View>

                {/* Quick Info */}
                <View style={styles.quickInfo}>
                  <View style={styles.infoItem}>
                    <Ionicons name="time-outline" size={16} color="#FFD700" />
                    <Text style={styles.infoText}>{dish.recipe.cookTime}</Text>
                  </View>
                  {dish.recipe.servings && (
                    <View style={styles.infoItem}>
                      <Ionicons name="people-outline" size={16} color="#FFD700" />
                      <Text style={styles.infoText}>{dish.recipe.servings} servings</Text>
                    </View>
                  )}
                  {dish.recipe.difficulty && (
                    <View style={styles.infoItem}>
                      <Ionicons name="flag-outline" size={16} color="#FFD700" />
                      <Text style={styles.infoText}>{dish.recipe.difficulty}</Text>
                    </View>
                  )}
                </View>

                {/* Pairing Rationale */}
                <View style={styles.rationaleContainer}>
                  <Text style={styles.rationaleLabel}>Why This Pairing:</Text>
                  <Text style={styles.rationale} numberOfLines={expanded ? undefined : 3}>
                    {dish.pairingRationale}
                  </Text>
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
                    <Text style={styles.tapHintText}>Tap to flip for recipe</Text>
                  </View>
                )}

                {/* Disclaimer on Front */}
                <View style={styles.disclaimer}>
                  <Text style={styles.disclaimerText}>
                    Recommendations based on established food-wine pairing principles. Check all ingredients for allergens and dietary restrictions. Always verify proper cooking temperatures and handling.
                  </Text>
                </View>
              </View>
            </View>
          </TouchableOpacity>
        </Animated.View>
      )}

      {/* Back of Card - Recipe Details */}
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
                  <Text style={styles.backTitle}>Recipe Details</Text>
                  <TouchableOpacity 
                    onPress={flipToFront}
                    style={styles.flipButton}
                    activeOpacity={0.7}
                  >
                    <Ionicons name="return-up-back-outline" size={20} color="#8B0000" />
                    <Text style={styles.flipButtonText}>Flip Back</Text>
                  </TouchableOpacity>
                </View>

                {/* Ingredients */}
                <View style={styles.recipeSubsection}>
                  <Text style={styles.recipeSubtitle}>Ingredients:</Text>
                  {dish.recipe.ingredients.map((ingredient, idx) => (
                    <View key={idx} style={styles.ingredientItem}>
                      <Text style={styles.bullet}>•</Text>
                      <Text style={styles.ingredientText}>{ingredient}</Text>
                    </View>
                  ))}
                </View>

                {/* Steps */}
                <View style={styles.recipeSubsection}>
                  <Text style={styles.recipeSubtitle}>Instructions:</Text>
                  {dish.recipe.steps.map((step, idx) => (
                    <View key={idx} style={styles.stepItem}>
                      <View style={styles.stepNumber}>
                        <Text style={styles.stepNumberText}>{idx + 1}</Text>
                      </View>
                      <Text style={styles.stepText}>{step}</Text>
                    </View>
                  ))}
                </View>

                {/* Serving Suggestion */}
                {dish.servingSuggestion && (
                  <View style={styles.servingSuggestionContainer}>
                    <Text style={styles.servingSuggestionLabel}>Serving Suggestion:</Text>
                    <Text style={styles.servingSuggestionText}>{dish.servingSuggestion}</Text>
                  </View>
                )}
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
    alignSelf: 'center',
    marginHorizontal: 20,
    marginTop: 12,
    marginBottom: 12,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 12,
    minHeight: 320,
  },
  card: {
    width: '100%',
    minHeight: 320,
    borderRadius: 20,
    overflow: 'hidden',
    backgroundColor: COLORS.background.primary,
  },
  cardFront: {
    width: '100%',
    position: 'relative',
  },
  cardBack: {
    width: '100%',
    minHeight: 320,
    position: 'relative',
    backgroundColor: COLORS.background.primary,
  },
  cardTouchable: {
    flex: 1,
  },
  dishImage: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    width: '100%',
    height: '100%',
    minHeight: 620,
  },
  darkOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  dishAccent: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: 6,
    height: '100%',
    backgroundColor: '#5B2433',
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
  complexityBadge: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 16,
  },
  complexityText: {
    color: COLORS.text.inverse,
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  content: {
    position: 'relative',
    flex: 1,
    paddingTop: 20,
    paddingBottom: 20,
    paddingLeft: 20,
    paddingRight: 20,
    justifyContent: 'flex-end',
    marginTop: 60, // Space for badges (matching wine card)
  },
  titleSection: {
    marginBottom: 12,
  },
  titleContainer: {
    width: '100%',
  },
  dishName: {
    fontSize: 18,
    fontWeight: '700',
    color: '#fff',
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
    marginBottom: 6,
    lineHeight: 24,
  },
  quickInfo: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
    marginBottom: 16,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  infoText: {
    fontSize: 14,
    color: '#fff',
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  rationaleContainer: {
    backgroundColor: 'rgba(139, 0, 0, 0.4)',
    padding: 12,
    borderRadius: 8,
    marginBottom: 12,
  },
  rationaleContainerExpanded: {
    marginTop: 12,
    marginBottom: 8,
  },
  rationaleLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#FFD700',
    marginBottom: 6,
    textTransform: 'uppercase',
  },
  rationale: {
    fontSize: 14,
    color: '#fff',
    lineHeight: 20,
  },
  tapHint: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    marginTop: 8,
  },
  tapHintText: {
    fontSize: 12,
    color: '#FFD700',
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  expandedInfo: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.2)',
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  disclaimer: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.2)',
  },
  disclaimerText: {
    fontSize: 10,
    color: 'rgba(255, 255, 255, 0.7)',
    textAlign: 'center',
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
    lineHeight: 14,
  },
  keyboardAvoidingView: {
    flex: 1,
  },
  backScrollView: {
    flex: 1,
  },
  backScrollContent: {
    paddingBottom: 20,
  },
  backContent: {
    padding: 20,
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
    fontSize: 20,
    fontWeight: '700',
    color: '#8B0000',
  },
  flipButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: '#f5f5f5',
  },
  flipButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#8B0000',
  },
  backDishName: {
    fontSize: 22,
    fontWeight: '700',
    color: COLORS.text.primary,
    marginBottom: 20,
    textAlign: 'center',
  },
  recipeSubsection: {
    marginBottom: 24,
  },
  recipeSubtitle: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.text.primary,
    marginBottom: 12,
  },
  ingredientItem: {
    flexDirection: 'row',
    marginBottom: 8,
    alignItems: 'flex-start',
  },
  bullet: {
    fontSize: 16,
    color: COLORS.primary[500],
    marginRight: 8,
    marginTop: 2,
  },
  ingredientText: {
    flex: 1,
    fontSize: 14,
    color: COLORS.text.primary,
    lineHeight: 20,
  },
  stepItem: {
    flexDirection: 'row',
    marginBottom: 12,
    alignItems: 'flex-start',
  },
  stepNumber: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: COLORS.primary[500],
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
    marginTop: 2,
  },
  stepNumberText: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.text.inverse,
  },
  stepText: {
    flex: 1,
    fontSize: 14,
    color: COLORS.text.primary,
    lineHeight: 20,
  },
  rationaleContainerBack: {
    backgroundColor: COLORS.primary[50],
    padding: 12,
    borderRadius: 8,
    marginTop: 16,
    marginBottom: 16,
  },
  rationaleLabelBack: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.primary[700],
    marginBottom: 6,
    textTransform: 'uppercase',
  },
  rationaleTextBack: {
    fontSize: 14,
    color: COLORS.text.primary,
    lineHeight: 20,
  },
  closingNotesContainer: {
    backgroundColor: '#F5F5F5',
    padding: 12,
    borderRadius: 8,
    marginTop: 16,
    marginBottom: 16,
    borderLeftWidth: 4,
    borderLeftColor: COLORS.primary[500],
  },
  closingNotesLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.primary[700],
    marginBottom: 6,
    textTransform: 'uppercase',
  },
  closingNotesText: {
    fontSize: 14,
    color: COLORS.text.primary,
    lineHeight: 20,
  },
  servingSuggestionContainer: {
    backgroundColor: '#F5F5F5',
    padding: 12,
    borderRadius: 8,
    marginTop: 16,
    marginBottom: 16,
    borderLeftWidth: 4,
    borderLeftColor: COLORS.primary[500],
  },
  servingSuggestionLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.primary[700],
    marginBottom: 6,
    textTransform: 'uppercase',
  },
  servingSuggestionText: {
    fontSize: 14,
    color: COLORS.text.primary,
    lineHeight: 20,
  },
});

export default FlipDishCard;

