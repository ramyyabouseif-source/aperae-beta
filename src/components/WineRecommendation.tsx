import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { WineRecommendationResponse } from '../types/wine';
import WineCard from './WineCard';

interface WineRecommendationProps {
  recommendations: WineRecommendationResponse | null;
  onAddToFavorites?: (wine: any) => void;
  onRemoveFromFavorites?: (wine: any) => void;
}

export default function WineRecommendation({ 
  recommendations, 
  onAddToFavorites, 
  onRemoveFromFavorites 
}: WineRecommendationProps) {
  // Add null check
  if (!recommendations) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>No recommendations available</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Wine Recommendations</Text>
        <Text style={styles.dish}>for {recommendations.dish}</Text>
      </View>

      <ScrollView style={styles.recommendationsContainer}>
        {recommendations.recommendations.map((wine, index) => (
          <WineCard
            key={`${wine.wineName}-${index}`}
            wine={wine}
            onAddToFavorites={onAddToFavorites}
            onRemoveFromFavorites={onRemoveFromFavorites}
          />
        ))}
      </ScrollView>

      {recommendations.closingNarrative && (
        <View style={styles.narrativeContainer}>
          <Text style={styles.narrativeTitle}>Sommelier's Notes</Text>
          <Text style={styles.narrativeText}>{recommendations.closingNarrative}</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: 20,
  },
  header: {
    backgroundColor: '#8B0000',
    padding: 16,
    borderRadius: 8,
    marginBottom: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
  },
  dish: {
    fontSize: 16,
    color: '#fff',
    textAlign: 'center',
    marginTop: 4,
  },
  recommendationsContainer: {
    maxHeight: 600,
  },
  narrativeContainer: {
    backgroundColor: '#f8f8f8',
    padding: 16,
    borderRadius: 8,
    marginTop: 16,
    borderLeftWidth: 4,
    borderLeftColor: '#8B0000',
  },
  narrativeTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  narrativeText: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  errorText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    padding: 20,
  },
});