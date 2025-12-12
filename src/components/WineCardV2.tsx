import React, { memo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { WineRecommendation } from '../types/wine';

interface WineCardV2Props {
  wine: WineRecommendation;
  onAddToFavorites?: (wine: WineRecommendation) => void;
  onRemoveFromFavorites?: (wine: WineRecommendation) => void;
  isFavorite?: boolean;
  index?: number; // For unique image selection
}

const WineCardV2 = memo(function WineCardV2({ 
  wine, 
  onAddToFavorites, 
  onRemoveFromFavorites, 
  isFavorite = false,
  index = 0,
}: WineCardV2Props) {

  // Get tier badge color based on tier label
  const getTierBadgeStyle = (tierLabel?: string) => {
    if (!tierLabel) return styles.tierBadgeDefault;
    if (tierLabel.toLowerCase().includes('premium')) return styles.tierBadgePremium;
    if (tierLabel.toLowerCase().includes('moderate')) return styles.tierBadgeModerate;
    if (tierLabel.toLowerCase().includes('budget')) return styles.tierBadgeBudget;
    return styles.tierBadgeDefault;
  };

  // Get tier badge text color (adaptive for white background cards)
  const getTierBadgeTextColor = (tierLabel?: string) => {
    if (!tierLabel) return '#FFFFFF';
    if (tierLabel.toLowerCase().includes('premium')) return '#FFFFFF'; // White on Pinot
    if (tierLabel.toLowerCase().includes('moderate')) return '#5B2433'; // Dark on Metallic Rose
    if (tierLabel.toLowerCase().includes('budget')) return '#5B2433'; // Dark on Chardonnay
    return '#FFFFFF';
  };

  // Get confidence color based on score
  const getConfidenceColor = (score: number) => {
    if (score >= 90) return '#2E7D32'; // Green
    if (score >= 80) return '#F57C00'; // Orange
    if (score >= 70) return '#E65100'; // Dark Orange
    return '#C62828'; // Red
  };

  // Get wine image - use different images based on index for variety
  const getWineImage = () => {
    if (wine.image && wine.image !== 'unknown') {
      return { uri: wine.image };
    }
    // Use different wine images based on index for variety
    const wineImages = [
      'https://images.unsplash.com/photo-1506377247377-2a5b3b417ebb?w=400&h=600&fit=crop&q=80',
      'https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?w=400&h=600&fit=crop&q=80',
      'https://images.unsplash.com/photo-1551538827-9c037cb4f32a?w=400&h=600&fit=crop&q=80',
      'https://images.unsplash.com/photo-1571613316887-6f8d5cbf7ef7?w=400&h=600&fit=crop&q=80',
      'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=400&h=600&fit=crop&q=80',
      'https://images.unsplash.com/photo-1564760055775-d63b17a55c44?w=400&h=600&fit=crop&q=80',
    ];
    const imageIndex = index % wineImages.length;
    return { uri: wineImages[imageIndex] };
  };

  return (
    <View style={styles.card}>
      {/* Tier Label Badge */}
      {wine.tierLabel && (
        <View style={[styles.tierBadge, getTierBadgeStyle(wine.tierLabel)]}>
          <Text style={[styles.tierBadgeText, { color: getTierBadgeTextColor(wine.tierLabel) }]}>
            {wine.tierLabel}
          </Text>
        </View>
      )}

      <View style={styles.header}>
        <View style={styles.titleSection}>
          <Text style={styles.wineName}>{wine.wineName}</Text>
          <Text style={styles.producer}>{wine.producer} {wine.vintage}</Text>
          {(wine.grape || wine.category) && (
            <Text style={styles.category}>{wine.grape || wine.category}</Text>
          )}
        </View>
        <View style={styles.priceRatingRow}>
          <View style={styles.priceBadge}>
            <Text style={styles.pricePoint}>
              {wine.pricePoint || 'Price N/A'}
            </Text>
          </View>
          {wine.expertRating && wine.expertRating !== 'unknown' && (
            <View style={styles.ratingBadge}>
              <Text style={styles.expertRating}>
                {wine.expertRating}
              </Text>
            </View>
          )}
        </View>
      </View>

      {/* Confidence Score with Rationale */}
      <View style={styles.confidenceSection}>
        <View style={styles.confidenceRow}>
          <Text style={styles.confidenceLabel}>Confidence:</Text>
          <View style={[styles.confidenceBadge, { backgroundColor: getConfidenceColor(wine.confidenceScore) + '20' }]}>
            <Text style={[styles.confidenceScore, { color: getConfidenceColor(wine.confidenceScore) }]}>
              {wine.confidenceScore}%
            </Text>
          </View>
        </View>
        {wine.confidenceRationale && (
          <Text style={styles.confidenceRationale}>{wine.confidenceRationale}</Text>
        )}
      </View>
      
      <View style={styles.content}>
        <Text style={styles.sectionTitle}>Why This Wine:</Text>
        <Text style={styles.description}>{wine.rationale}</Text>
        
        <Text style={styles.sectionTitle}>Tasting Notes:</Text>
        {(() => {
          const tastingNotes = typeof wine.tastingNotes === 'string' 
            ? { aromas: [], palate: wine.tastingNotes, finish: '' }
            : wine.tastingNotes;
          return (
            <>
              {tastingNotes.aromas && tastingNotes.aromas.length > 0 && (
                <Text style={styles.description}>
                  Aromas: {tastingNotes.aromas.join(', ')}
                </Text>
              )}
              <Text style={styles.description}>{tastingNotes.palate}</Text>
              {tastingNotes.finish && (
                <Text style={styles.description}>Finish: {tastingNotes.finish}</Text>
              )}
            </>
          );
        })()}
        
        <Text style={styles.sectionTitle}>Serving:</Text>
        <Text style={styles.description}>
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
        
        <Text style={styles.sectionTitle}>Where to Buy:</Text>
        <Text style={styles.description}>{wine.retailerSuggestion}</Text>

        {wine.storytellingElements && (
          <>
            <Text style={styles.sectionTitle}>Story:</Text>
            <Text style={styles.description}>{wine.storytellingElements}</Text>
          </>
        )}
      </View>
      
      <View style={styles.actions}>
        <TouchableOpacity 
          style={[styles.button, isFavorite ? styles.removeButton : styles.addButton]}
          onPress={() => isFavorite ? onRemoveFromFavorites?.(wine) : onAddToFavorites?.(wine)}
        >
          <Ionicons 
            name={isFavorite ? 'heart' : 'heart-outline'} 
            size={18} 
            color="#fff" 
            style={styles.buttonIcon}
          />
          <Text style={styles.buttonText}>
            {isFavorite ? 'Remove from Favorites' : 'Add to Favorites'}
          </Text>
        </TouchableOpacity>
      </View>
      
      <View style={styles.disclaimer}>
        <Text style={styles.disclaimerText}>
          Recommendations based on established food-wine pairing principles - prices and ratings are estimates and may vary by retailer
        </Text>
      </View>
    </View>
  );
});

// Note: WineCardV2 doesn't display images, but we keep the function for consistency

export default WineCardV2;

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginHorizontal: 20, // Center the card
    marginTop: 16,
    marginBottom: 16, // Space between cards
    alignSelf: 'center', // Ensure centering
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    position: 'relative',
    borderWidth: 1,
    borderColor: '#E0E0E0', // Subtle border
  },
  tierBadge: {
    position: 'absolute',
    top: 12,
    right: 12,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    zIndex: 1,
  },
  tierBadgePremium: {
    backgroundColor: '#8B3A3A', // Pinot - wine-inspired premium
  },
  tierBadgeModerate: {
    backgroundColor: '#BF9694', // Metallic Rose - wine-inspired moderate
    borderWidth: 1,
    borderColor: 'rgba(91, 36, 51, 0.2)', // Subtle border for definition
  },
  tierBadgeBudget: {
    backgroundColor: '#C4B298', // Darker Chardonnay/Beige - wine-inspired budget (darker for better text contrast)
    borderWidth: 1,
    borderColor: 'rgba(91, 36, 51, 0.2)', // Subtle border for definition
  },
  tierBadgeDefault: {
    backgroundColor: '#8B0000',
  },
  tierBadgeText: {
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  header: {
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    paddingBottom: 12,
    marginBottom: 12,
  },
  titleSection: {
    marginBottom: 8,
  },
  wineName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#8B0000',
    marginBottom: 4,
  },
  producer: {
    fontSize: 14,
    color: '#666',
    marginBottom: 2,
  },
  category: {
    fontSize: 12,
    color: '#999',
    fontStyle: 'italic',
    marginTop: 2,
  },
  priceRatingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
  },
  priceBadge: {
    backgroundColor: '#E8F5E8',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
  },
  pricePoint: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2E7D32',
  },
  ratingBadge: {
    backgroundColor: '#E3F2FD',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
  },
  expertRating: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1976D2',
  },
  confidenceSection: {
    backgroundColor: '#F5F5F5',
    padding: 12,
    borderRadius: 8,
    marginBottom: 12,
  },
  confidenceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  confidenceLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  confidenceBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  confidenceScore: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  confidenceRationale: {
    fontSize: 12,
    color: '#666',
    fontStyle: 'italic',
    marginTop: 4,
  },
  content: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 12,
    marginBottom: 6,
  },
  description: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  actions: {
    marginTop: 16,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
  addButton: {
    backgroundColor: '#8B0000',
  },
  removeButton: {
    backgroundColor: '#ff6b6b',
  },
  buttonIcon: {
    marginRight: 8,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  disclaimer: {
    marginTop: 12,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  disclaimerText: {
    fontSize: 10,
    color: '#999',
    fontStyle: 'italic',
    textAlign: 'center',
  },
});

