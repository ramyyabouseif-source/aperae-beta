import React from 'react';
import { View, TouchableOpacity, StyleSheet, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../../design';

interface StarRatingProps {
  rating: number; // 0-5
  maxRating?: number;
  size?: number;
  color?: string;
  onRatingChange?: (rating: number) => void;
  showLabel?: boolean;
  readonly?: boolean;
  style?: any;
}

/**
 * Star Rating Component
 * Displays a star rating (1-5 stars) with optional interaction
 */
const StarRating: React.FC<StarRatingProps> = ({
  rating = 0,
  maxRating = 5,
  size = 24,
  color = COLORS.accent.gold,
  onRatingChange,
  showLabel = false,
  readonly = false,
  style,
}) => {
  const fullStars = Math.floor(rating);
  const hasHalfStar = rating % 1 >= 0.5;
  const emptyStars = maxRating - fullStars - (hasHalfStar ? 1 : 0);

  const handleStarPress = (starIndex: number) => {
    if (!readonly && onRatingChange) {
      onRatingChange(starIndex + 1);
    }
  };

  return (
    <View style={[styles.container, style]}>
      <View style={styles.starsContainer}>
        {Array.from({ length: fullStars }).map((_, index) => (
          <TouchableOpacity
            key={`full-${index}`}
            onPress={() => handleStarPress(index)}
            disabled={readonly}
            activeOpacity={readonly ? 1 : 0.7}
          >
            <Ionicons name="star" size={size} color={color} />
          </TouchableOpacity>
        ))}
        
        {hasHalfStar && (
          <TouchableOpacity
            onPress={() => handleStarPress(fullStars)}
            disabled={readonly}
            activeOpacity={readonly ? 1 : 0.7}
          >
            <Ionicons name="star-half" size={size} color={color} />
          </TouchableOpacity>
        )}
        
        {Array.from({ length: emptyStars }).map((_, index) => (
          <TouchableOpacity
            key={`empty-${index}`}
            onPress={() => handleStarPress(fullStars + (hasHalfStar ? 1 : 0) + index)}
            disabled={readonly}
            activeOpacity={readonly ? 1 : 0.7}
          >
            <Ionicons name="star-outline" size={size} color={color} />
          </TouchableOpacity>
        ))}
      </View>
      
      {showLabel && (
        <Text style={styles.label}>
          {rating > 0 ? `${rating.toFixed(1)}` : 'Not rated'}
        </Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  starsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  label: {
    marginLeft: 8,
    fontSize: 14,
    color: COLORS.text.secondary,
    fontWeight: '500',
  },
});

export default StarRating;





