import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { WineRecommendation, DishAnalysis } from '../types/wine';
import { getTastingNotesDisplay, getServingGuidance, getConfidenceBreakdown, getConfidenceScore } from '../utils/wineTypeHelpers';
import ConfidenceBreakdown from './ConfidenceBreakdown';

interface SimpleEnhancedWineCardV2Props {
  wine: WineRecommendation;
  onAddToFavorites?: (wine: WineRecommendation) => void;
  onRemoveFromFavorites?: (wine: WineRecommendation) => void;
  isFavorite?: boolean;
  onPress?: (wine: WineRecommendation) => void;
  showRemoveButton?: boolean;
  dishAnalysis?: DishAnalysis;
  pairingNotes?: string;
}

const SimpleEnhancedWineCardV2: React.FC<SimpleEnhancedWineCardV2Props> = ({
  wine,
  onAddToFavorites,
  onRemoveFromFavorites,
  isFavorite = false,
  onPress,
  showRemoveButton = false,
  dishAnalysis,
  pairingNotes,
}) => {
  const [expanded, setExpanded] = useState(false);
  const [showDishAnalysis, setShowDishAnalysis] = useState(false);
  const [showPairingNotes, setShowPairingNotes] = useState(false);

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

  // Get tier badge color based on tier label
  const getTierBadgeStyle = (tierLabel?: string) => {
    if (!tierLabel) return styles.tierBadgeDefault;
    if (tierLabel.toLowerCase().includes('premium')) return styles.tierBadgePremium;
    if (tierLabel.toLowerCase().includes('moderate')) return styles.tierBadgeModerate;
    if (tierLabel.toLowerCase().includes('budget')) return styles.tierBadgeBudget;
    return styles.tierBadgeDefault;
  };

  // Get confidence color based on score
  const getConfidenceColor = (score: number) => {
    if (score >= 90) return '#2E7D32'; // Green
    if (score >= 80) return '#F57C00'; // Orange
    if (score >= 70) return '#E65100'; // Dark Orange
    return '#C62828'; // Red
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
          source={{
            uri:
              wine.image && wine.image !== 'unknown'
                ? wine.image
                : 'https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?w=400&h=300&fit=crop&q=80',
          }}
          style={styles.wineImage}
          defaultSource={{
            uri: 'https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?w=400&h=300&fit=crop&q=80',
          }}
        />
        <View style={styles.imageOverlay}>
          {/* Tier Label Badge */}
          {wine.tierLabel && (
            <View style={[styles.tierBadge, getTierBadgeStyle(wine.tierLabel)]}>
              <Text style={styles.tierBadgeText}>{wine.tierLabel}</Text>
            </View>
          )}
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
            {(wine.grape || wine.category) && (
              <Text style={styles.category}>{wine.grape || wine.category}</Text>
            )}
          </View>
          
          <View style={styles.ratingContainer}>
            {wine.expertRating && wine.expertRating !== 'unknown' && (
              <Text style={styles.expertRating}>{wine.expertRating}</Text>
            )}
            <View style={[styles.confidenceBadge, { backgroundColor: getConfidenceColor(wine.confidenceScore) + '20' }]}>
              <Text style={[styles.confidenceScore, { color: getConfidenceColor(wine.confidenceScore) }]}>
                {wine.confidenceScore}% confidence
              </Text>
            </View>
          </View>
        </View>

        {/* Pairing Principles Tags */}
        {wine.pairingPrinciplesApplied && wine.pairingPrinciplesApplied.length > 0 && (
          <View style={styles.principlesContainer}>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} nestedScrollEnabled={true}>
              {wine.pairingPrinciplesApplied.map((principle, index) => (
                <View key={index} style={styles.principleTag}>
                  <Ionicons name="checkmark-circle" size={12} color="#8B0000" />
                  <Text style={styles.principleText}>{principle}</Text>
                </View>
              ))}
            </ScrollView>
          </View>
        )}

        {/* Confidence Rationale */}
        {wine.confidenceRationale && (
          <View style={styles.confidenceRationaleContainer}>
            <Text style={styles.confidenceRationaleText}>{wine.confidenceRationale}</Text>
          </View>
        )}

        {/* Rationale */}
        <Text style={styles.rationale} numberOfLines={expanded ? undefined : 2}>
          {wine.rationale}
        </Text>

        {/* Expandable Details */}
        {expanded && (
          <View style={styles.expandedContent}>
            <View style={styles.detailSection}>
              <Text style={styles.detailTitle}>Tasting Notes</Text>
              {(() => {
                const tastingNotes = getTastingNotesDisplay(wine.tastingNotes);
                return (
                  <>
                    {tastingNotes.aromas.length > 0 && (
                      <Text style={styles.detailText}>
                        Aromas: {tastingNotes.aromas.join(', ')}
                      </Text>
                    )}
                    <Text style={styles.detailText}>{tastingNotes.palate}</Text>
                    {tastingNotes.finish && (
                      <Text style={styles.detailText}>Finish: {tastingNotes.finish}</Text>
                    )}
                  </>
                );
              })()}
            </View>
            
            <View style={styles.detailSection}>
              <Text style={styles.detailTitle}>Serving Guidance</Text>
              <Text style={styles.detailText}>{getServingGuidance(wine)}</Text>
            </View>
            
            {/* Confidence Breakdown (Enhanced Format) - Visual Component */}
            {getConfidenceBreakdown(wine) && (
              <View style={styles.detailSection}>
                <Text style={styles.detailTitle}>Confidence Breakdown</Text>
                <ConfidenceBreakdown 
                  breakdown={getConfidenceBreakdown(wine)!} 
                  totalScore={getConfidenceScore(wine)}
                />
              </View>
            )}
            
            {/* Region (Enhanced Format) */}
            {wine.region && wine.region !== 'unknown' && (
              <View style={styles.detailSection}>
                <Text style={styles.detailTitle}>Region</Text>
                <Text style={styles.detailText}>{wine.region}</Text>
              </View>
            )}
            
            <View style={styles.detailSection}>
              <Text style={styles.detailTitle}>Where to Buy</Text>
              <Text style={styles.detailText}>{wine.retailerSuggestion}</Text>
            </View>
            
            {/* Story (Enhanced Format - prefer story over storytellingElements) */}
            {(wine.story || wine.storytellingElements) && (
              <View style={styles.detailSection}>
                <Text style={styles.detailTitle}>Story</Text>
                <Text style={styles.detailText}>{wine.story || wine.storytellingElements}</Text>
              </View>
            )}
            
            {/* Alternatives (Enhanced Format) */}
            {wine.alternatives && wine.alternatives.length > 0 && (
              <View style={[styles.detailSection, styles.alternativesSection]}>
                <Text style={styles.detailTitle}>Alternative Wines</Text>
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

            {/* Dish Analysis Section */}
            {dishAnalysis && (
              <View style={styles.detailSection}>
                <TouchableOpacity
                  style={styles.expandableHeader}
                  onPress={() => setShowDishAnalysis(!showDishAnalysis)}
                >
                  <Text style={styles.detailTitle}>Dish Analysis</Text>
                  <Ionicons
                    name={showDishAnalysis ? 'chevron-up' : 'chevron-down'}
                    size={20}
                    color="#8B0000"
                  />
                </TouchableOpacity>
                {showDishAnalysis && (
                  <View style={styles.dishAnalysisContent}>
                    <Text style={styles.analysisItem}>
                      <Text style={styles.analysisLabel}>Weight:</Text> {dishAnalysis.dominantWeight}
                    </Text>
                    <Text style={styles.analysisItem}>
                      <Text style={styles.analysisLabel}>Fat Content:</Text> {dishAnalysis.fatContent}
                    </Text>
                    <Text style={styles.analysisItem}>
                      <Text style={styles.analysisLabel}>Protein:</Text> {dishAnalysis.primaryProtein}
                    </Text>
                    <Text style={styles.analysisItem}>
                      <Text style={styles.analysisLabel}>Flavors:</Text> {dishAnalysis.dominantFlavors.join(', ')}
                    </Text>
                    <Text style={styles.analysisItem}>
                      <Text style={styles.analysisLabel}>Spice Level:</Text> {dishAnalysis.spiceLevel}
                    </Text>
                    <Text style={styles.analysisItem}>
                      <Text style={styles.analysisLabel}>Principles:</Text> {dishAnalysis.applicablePrinciples.join(', ')}
                    </Text>
                  </View>
                )}
              </View>
            )}

            {/* Pairing Notes Section */}
            {pairingNotes && (
              <View style={styles.detailSection}>
                <TouchableOpacity
                  style={styles.expandableHeader}
                  onPress={() => setShowPairingNotes(!showPairingNotes)}
                >
                  <Text style={styles.detailTitle}>Pairing Notes</Text>
                  <Ionicons
                    name={showPairingNotes ? 'chevron-up' : 'chevron-down'}
                    size={20}
                    color="#8B0000"
                  />
                </TouchableOpacity>
                {showPairingNotes && (
                  <Text style={styles.detailText}>{pairingNotes}</Text>
                )}
              </View>
            )}
          </View>
        )}
      </View>

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
    left: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
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
  category: {
    fontSize: 12,
    color: '#999',
    fontStyle: 'italic',
    marginTop: 2,
  },
  ratingContainer: {
    alignItems: 'flex-end',
  },
  expertRating: {
    fontSize: 14,
    fontWeight: '600',
    color: '#8B0000',
    marginBottom: 4,
  },
  confidenceBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  confidenceScore: {
    fontSize: 12,
    fontWeight: '600',
  },
  principlesContainer: {
    marginBottom: 12,
    paddingVertical: 8,
  },
  principleTag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF3E0',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginRight: 6,
    borderWidth: 1,
    borderColor: '#FFE0B2',
  },
  principleText: {
    fontSize: 11,
    color: '#8B0000',
    fontWeight: '500',
    marginLeft: 4,
  },
  confidenceRationaleContainer: {
    backgroundColor: '#F5F5F5',
    padding: 10,
    borderRadius: 8,
    marginBottom: 12,
  },
  confidenceRationaleText: {
    fontSize: 12,
    color: '#666',
    fontStyle: 'italic',
    lineHeight: 16,
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
  expandableHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  dishAnalysisContent: {
    backgroundColor: '#F9F9F9',
    padding: 10,
    borderRadius: 8,
    marginTop: 4,
  },
  analysisItem: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
    lineHeight: 18,
  },
  analysisLabel: {
    fontWeight: '600',
    color: '#333',
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 12,
    paddingHorizontal: 16,
    paddingBottom: 16,
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
  alternativeItem: {
    marginBottom: 12,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
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
  alternativesSection: {
    marginBottom: 0, // Remove extra margin
  },
  alternativeItemLast: {
    marginBottom: 0, // Remove bottom margin from last item
    paddingBottom: 0,
    borderBottomWidth: 0, // Remove border from last item
  },
});

export default SimpleEnhancedWineCardV2;

