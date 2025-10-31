import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { WineRecommendation } from '../types/wine';

interface SimpleEnhancedWineCardProps {
  wine: WineRecommendation;
  onAddToFavorites?: (wine: WineRecommendation) => void;
  onRemoveFromFavorites?: (wine: WineRecommendation) => void;
  isFavorite?: boolean;
  onPress?: (wine: WineRecommendation) => void;
  showRemoveButton?: boolean;
}

const SimpleEnhancedWineCard: React.FC<SimpleEnhancedWineCardProps> = ({
  wine,
  onAddToFavorites,
  onRemoveFromFavorites,
  isFavorite = false,
  onPress,
  showRemoveButton = false,
}) => {
  const [expanded, setExpanded] = useState(false);

  const handleFavoritePress = () => {
    if (isFavorite && onRemoveFromFavorites) {
      onRemoveFromFavorites(wine);
    } else if (!isFavorite && onAddToFavorites) {
      onAddToFavorites(wine);
    }
  };

  const handleCardPress = () => {
    if (onPress) {
      onPress(wine);
    } else {
      setExpanded(!expanded);
    }
  };

  return (
    <TouchableOpacity
      style={styles.card}
      onPress={handleCardPress}
      activeOpacity={0.7}
    >
      {/* Wine Image */}
      <View style={styles.imageContainer}>
        <Image
          source={{ uri: wine.image || 'https://via.placeholder.com/300x200/8B0000/FFFFFF?text=Wine' }}
          style={styles.wineImage}
          defaultSource={{ uri: 'https://via.placeholder.com/300x200/8B0000/FFFFFF?text=Wine' }}
        />
        <View style={styles.imageOverlay}>
          <View style={styles.priceBadge}>
            <Text style={styles.priceText}>{wine.pricePoint}</Text>
          </View>
        </View>
      </View>

      {/* Wine Info */}
      <View style={styles.content}>
        <View style={styles.header}>
          <View style={styles.titleContainer}>
            <Text style={styles.wineName}>{wine.wineName}</Text>
            <Text style={styles.producer}>{wine.producer}</Text>
            <Text style={styles.vintage}>{wine.vintage}</Text>
          </View>
          
          <View style={styles.ratingContainer}>
            <Text style={styles.expertRating}>{wine.expertRating}</Text>
            <Text style={styles.confidenceScore}>
              {wine.confidenceScore}% confidence
            </Text>
          </View>
        </View>

        {/* Rationale */}
        <Text style={styles.rationale} numberOfLines={expanded ? undefined : 2}>
          {wine.rationale}
        </Text>

        {/* Expandable Details */}
        {expanded && (
          <View style={styles.expandedContent}>
            <View style={styles.detailSection}>
              <Text style={styles.detailTitle}>Tasting Notes</Text>
              <Text style={styles.detailText}>{wine.tastingNotes}</Text>
            </View>
            
            <View style={styles.detailSection}>
              <Text style={styles.detailTitle}>Serving Guidance</Text>
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
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    margin: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    overflow: 'hidden',
  },
  imageContainer: {
    position: 'relative',
    height: 200,
  },
  wineImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  imageOverlay: {
    position: 'absolute',
    top: 12,
    right: 12,
  },
  priceBadge: {
    backgroundColor: 'rgba(139, 0, 0, 0.9)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  priceText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  content: {
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  titleContainer: {
    flex: 1,
  },
  wineName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  producer: {
    fontSize: 14,
    color: '#666',
    marginBottom: 2,
  },
  vintage: {
    fontSize: 14,
    color: '#8B0000',
    fontWeight: '500',
  },
  ratingContainer: {
    alignItems: 'flex-end',
  },
  expertRating: {
    fontSize: 14,
    fontWeight: '600',
    color: '#8B0000',
    marginBottom: 2,
  },
  confidenceScore: {
    fontSize: 12,
    color: '#666',
  },
  rationale: {
    fontSize: 14,
    color: '#555',
    lineHeight: 20,
    marginBottom: 12,
  },
  expandedContent: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  detailSection: {
    marginBottom: 12,
  },
  detailTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  detailText: {
    fontSize: 13,
    color: '#666',
    lineHeight: 18,
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 12,
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
    paddingVertical: 10,
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
    paddingVertical: 10,
    paddingHorizontal: 16,
  },
  removeText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#f44336',
    marginLeft: 6,
  },
});

export default SimpleEnhancedWineCard;




