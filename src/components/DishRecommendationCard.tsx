import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  ScrollView,
  Animated,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { DishRecommendation } from '../types/dish';
import { getDishCardImage } from '../utils/dishCardImages';
import { COLORS } from '../design';

interface DishRecommendationCardProps {
  dish: DishRecommendation;
  index: number;
  onPress?: () => void;
}

/**
 * Dish Recommendation Card Component
 * 
 * Displays a dish recommendation with recipe details, pairing rationale, and complexity indicator.
 * Uses images from the appropriate complexity folder.
 */
const DishRecommendationCard: React.FC<DishRecommendationCardProps> = ({
  dish,
  index,
  onPress,
}) => {
  const [expanded, setExpanded] = useState(false);
  const [imageError, setImageError] = useState(false);
  const rotateAnim = useState(new Animated.Value(0))[0];

  const toggleExpanded = () => {
    const toValue = expanded ? 0 : 1;
    Animated.timing(rotateAnim, {
      toValue,
      duration: 200,
      useNativeDriver: true,
    }).start();
    setExpanded(!expanded);
  };

  const rotate = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '180deg'],
  });

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

  return (
    <TouchableOpacity
      style={styles.card}
      onPress={onPress || toggleExpanded}
      activeOpacity={0.9}
    >
      {/* Card Image */}
      <View style={styles.imageContainer}>
        {!imageError ? (
          <Image
            source={dishImage}
            style={styles.image}
            resizeMode="cover"
            onError={() => setImageError(true)}
          />
        ) : (
          <View style={[styles.image, styles.imagePlaceholder]}>
            <Ionicons name="restaurant" size={48} color={COLORS.neutral[400]} />
          </View>
        )}
        
        {/* Complexity Badge */}
        <View
          style={[
            styles.complexityBadge,
            { backgroundColor: getComplexityColor(dish.complexity.level) },
          ]}
        >
          <Text style={styles.complexityText}>{dish.complexity.label}</Text>
        </View>
      </View>

      {/* Card Content */}
      <View style={styles.content}>
        <Text style={styles.dishName}>{dish.dishName}</Text>
        
        {/* Quick Info */}
        <View style={styles.quickInfo}>
          <View style={styles.infoItem}>
            <Ionicons name="time-outline" size={16} color={COLORS.text.secondary} />
            <Text style={styles.infoText}>{dish.recipe.cookTime}</Text>
          </View>
          {dish.recipe.servings && (
            <View style={styles.infoItem}>
              <Ionicons name="people-outline" size={16} color={COLORS.text.secondary} />
              <Text style={styles.infoText}>{dish.recipe.servings} servings</Text>
            </View>
          )}
          {dish.recipe.difficulty && (
            <View style={styles.infoItem}>
              <Ionicons name="flag-outline" size={16} color={COLORS.text.secondary} />
              <Text style={styles.infoText}>{dish.recipe.difficulty}</Text>
            </View>
          )}
        </View>

        {/* Pairing Rationale (Always visible) */}
        <View style={styles.rationaleContainer}>
          <Text style={styles.rationaleLabel}>Why this pairing works:</Text>
          <Text style={styles.rationaleText}>{dish.pairingRationale}</Text>
        </View>

        {/* Expandable Recipe Section */}
        <TouchableOpacity
          style={styles.expandButton}
          onPress={toggleExpanded}
          activeOpacity={0.7}
        >
          <Text style={styles.expandButtonText}>
            {expanded ? 'Hide Recipe' : 'View Recipe'}
          </Text>
          <Animated.View style={{ transform: [{ rotate }] }}>
            <Ionicons
              name="chevron-down"
              size={20}
              color={COLORS.primary[500]}
            />
          </Animated.View>
        </TouchableOpacity>

        {expanded && (
          <View style={styles.recipeSection}>
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
          </View>
        )}

        {/* Confidence Score */}
        {dish.confidenceScore && (
          <View style={styles.confidenceContainer}>
            <Ionicons name="star" size={16} color={COLORS.warning[500]} />
            <Text style={styles.confidenceText}>
              {dish.confidenceScore}% confidence
            </Text>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.background.primary,
    borderRadius: 16,
    marginHorizontal: 16,
    marginVertical: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  imageContainer: {
    width: '100%',
    height: 200,
    position: 'relative',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  imagePlaceholder: {
    backgroundColor: COLORS.neutral[100],
    justifyContent: 'center',
    alignItems: 'center',
  },
  complexityBadge: {
    position: 'absolute',
    top: 12,
    right: 12,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  complexityText: {
    color: COLORS.text.inverse,
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  content: {
    padding: 16,
  },
  dishName: {
    fontSize: 22,
    fontWeight: '700',
    color: COLORS.text.primary,
    marginBottom: 12,
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
    color: COLORS.text.secondary,
  },
  rationaleContainer: {
    backgroundColor: COLORS.primary[50],
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  rationaleLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.primary[700],
    marginBottom: 6,
    textTransform: 'uppercase',
  },
  rationaleText: {
    fontSize: 14,
    color: COLORS.text.primary,
    lineHeight: 20,
  },
  expandButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    gap: 8,
    marginBottom: 12,
  },
  expandButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.primary[500],
  },
  recipeSection: {
    marginTop: 8,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: COLORS.border.light,
  },
  recipeSubsection: {
    marginBottom: 20,
  },
  recipeSubtitle: {
    fontSize: 16,
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
  confidenceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: COLORS.border.light,
  },
  confidenceText: {
    fontSize: 14,
    color: COLORS.text.secondary,
    fontWeight: '500',
  },
});

export default DishRecommendationCard;







