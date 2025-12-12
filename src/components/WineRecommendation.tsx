import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { WineRecommendationResponse } from '../types/wine';
import WineCard from './WineCard';
import ResponsibleDrinkingDisclaimer from './ResponsibleDrinkingDisclaimer';
import FinalSommelierNotes from './FinalSommelierNotes';

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

  // Debug logging - make it very visible
  console.log('🎯 WineRecommendation Component RENDERED');
  console.log('Has recommendations array:', !!recommendations.recommendations);
  console.log('Recommendation count:', recommendations.recommendations?.length);
  console.log('Has closingNarrative:', !!recommendations.closingNarrative);
  console.log('Has avoid:', !!recommendations.avoid);
  console.log('closingNarrative value:', recommendations.closingNarrative?.substring(0, 50));
  console.log('avoid value:', JSON.stringify(recommendations.avoid));
  console.log('All keys in recommendations object:', Object.keys(recommendations));
  console.log('🎯 End WineRecommendation Component Debug');

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Wine Recommendations</Text>
        <Text style={styles.dish}>for {recommendations.dish}</Text>
      </View>

      <ScrollView 
        style={styles.recommendationsContainer}
        contentContainerStyle={styles.scrollContent}
      >
        {recommendations.recommendations.map((wine, index) => (
          <WineCard
            key={`${wine.wineName}-${index}`}
            wine={wine}
            onAddToFavorites={onAddToFavorites}
            onRemoveFromFavorites={onRemoveFromFavorites}
          />
        ))}
        
        {/* Final Sommelier Notes - After all wine cards, similar to Pairing Notes */}
        {/* ALWAYS render - remove any conditional logic */}
        <View style={[styles.finalNotesSection, { backgroundColor: '#ffff00', padding: 10 }]}>
          <Text style={{ color: '#000', fontWeight: 'bold', marginBottom: 10 }}>
            DEBUG: FinalSommelierNotes should appear below
          </Text>
          <FinalSommelierNotes
            closingNarrative={recommendations.closingNarrative}
            avoid={recommendations.avoid}
          />
        </View>
        
        {/* Responsible Drinking Disclaimer - at the bottom */}
        <ResponsibleDrinkingDisclaimer />
      </ScrollView>
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
    // Removed maxHeight to allow full scrolling
  },
  scrollContent: {
    paddingBottom: 20,
  },
  finalNotesSection: {
    marginHorizontal: 20,
    marginTop: 24,
    marginBottom: 16,
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