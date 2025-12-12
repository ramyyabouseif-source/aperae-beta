import React, { memo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { WineRecommendation } from '../types/wine';
import { 
  getTastingNotesDisplay, 
  getConfidenceScore, 
  getConfidenceRationale,
  getServingGuidance 
} from '../utils/wineTypeHelpers';

interface WineCardProps {
  wine: WineRecommendation;
  onAddToFavorites?: (wine: WineRecommendation) => void;
  onRemoveFromFavorites?: (wine: WineRecommendation) => void;
  isFavorite?: boolean;
}

const WineCard = memo(function WineCard({ wine, onAddToFavorites, onRemoveFromFavorites, isFavorite = false }: WineCardProps) {
  const tastingNotes = getTastingNotesDisplay(wine.tastingNotes);
  const confidenceScore = getConfidenceScore(wine);
  const confidenceRationale = getConfidenceRationale(wine);
  const servingGuidance = getServingGuidance(wine);

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <Text style={styles.wineName}>{wine.wineName}</Text>
        <Text style={styles.producer}>{wine.producer} {wine.vintage}</Text>
        <View style={styles.priceRatingRow}>
          <Text style={styles.pricePoint}>
            {wine.pricePoint || 'Price N/A'}
          </Text>
          <Text style={styles.expertRating}>
            {wine.expertRating || 'Rating N/A'}
          </Text>
        </View>
      </View>
      
      <View style={styles.content}>
        <Text style={styles.sectionTitle}>Why This Wine:</Text>
        <Text style={styles.description}>{wine.rationale}</Text>
        
        <Text style={styles.sectionTitle}>Tasting Notes:</Text>
        {tastingNotes.aromas.length > 0 && (
          <Text style={styles.description}>
            Aromas: {tastingNotes.aromas.join(', ')}
          </Text>
        )}
        <Text style={styles.description}>{tastingNotes.palate}</Text>
        {tastingNotes.finish && (
          <Text style={styles.description}>Finish: {tastingNotes.finish}</Text>
        )}
        
        <Text style={styles.sectionTitle}>Serving:</Text>
        <Text style={styles.description}>{servingGuidance}</Text>
        
        <Text style={styles.sectionTitle}>Where to Buy:</Text>
        <Text style={styles.description}>{wine.retailerSuggestion}</Text>
        
        <Text style={styles.confidence}>
          Confidence: {confidenceScore}%
        </Text>
        {confidenceRationale && (
          <Text style={styles.confidenceRationale}>{confidenceRationale}</Text>
        )}
      </View>
      
      <View style={styles.actions}>
        <TouchableOpacity 
          style={[styles.button, isFavorite ? styles.removeButton : styles.addButton]}
          onPress={() => isFavorite ? onRemoveFromFavorites?.(wine) : onAddToFavorites?.(wine)}
        >
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

export default WineCard;

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginHorizontal: 20,
    marginVertical: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    width: 'auto',
    maxWidth: '100%',
    alignSelf: 'stretch',
  },
  header: {
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    paddingBottom: 12,
    marginBottom: 12,
  },
  wineName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#8B0000',
  },
  producer: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  priceRatingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
  },
  pricePoint: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2E7D32',
    backgroundColor: '#E8F5E8',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  expertRating: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1976D2',
    backgroundColor: '#E3F2FD',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  content: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 12,
    marginBottom: 4,
  },
  description: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  confidence: {
    fontSize: 12,
    color: '#8B0000',
    fontWeight: 'bold',
    marginTop: 12,
    textAlign: 'center',
  },
  confidenceRationale: {
    fontSize: 11,
    color: '#666',
    fontStyle: 'italic',
    marginTop: 4,
    textAlign: 'center',
  },
  actions: {
    marginTop: 16,
  },
  button: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignItems: 'center',
  },
  addButton: {
    backgroundColor: '#8B0000',
  },
  removeButton: {
    backgroundColor: '#ff6b6b',
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