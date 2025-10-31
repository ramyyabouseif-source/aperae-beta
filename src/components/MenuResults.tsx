/**
 * Menu Results Component
 * Displays analyzed menu items and wine recommendations
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { MenuAnalysisResult, MenuItem } from '../services/menuAnalysisService';
import { FavoritesService } from '../services/favoritesService';

interface MenuResultsProps {
  analysisResult: MenuAnalysisResult;
  onClose: () => void;
}

export default function MenuResults({ analysisResult, onClose }: MenuResultsProps) {
  const [expandedItems, setExpandedItems] = useState<Set<number>>(new Set());

  const toggleExpanded = (index: number) => {
    const newExpanded = new Set(expandedItems);
    if (newExpanded.has(index)) {
      newExpanded.delete(index);
    } else {
      newExpanded.add(index);
    }
    setExpandedItems(newExpanded);
  };

  const handleAddToFavorites = async (wine: any) => {
    try {
      await FavoritesService.addToFavorites(wine);
      Alert.alert('Success', 'Wine added to favorites!');
    } catch (error) {
      console.error('Error adding to favorites:', error);
      Alert.alert('Error', 'Failed to add wine to favorites');
    }
  };

  const formatProcessingTime = (time: number) => {
    if (time < 1000) {
      return `${time}ms`;
    }
    return `${(time / 1000).toFixed(1)}s`;
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Menu Analysis Results</Text>
        <TouchableOpacity style={styles.closeButton} onPress={onClose}>
          <Text style={styles.closeButtonText}>✕</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content}>
        {/* Analysis Summary */}
        <View style={styles.summaryCard}>
          <Text style={styles.summaryTitle}>Analysis Summary</Text>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Dish Analyzed:</Text>
            <Text style={styles.summaryValue}>{analysisResult.dishAnalyzed || 'N/A'}</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Available Wines:</Text>
            <Text style={styles.summaryValue}>{analysisResult.availableWines?.length || 0}</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Processing Time:</Text>
            <Text style={styles.summaryValue}>{formatProcessingTime(analysisResult.processingTime)}</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>OCR Confidence:</Text>
            <Text style={styles.summaryValue}>{(analysisResult.ocrConfidence * 100).toFixed(1)}%</Text>
          </View>
        </View>

        {/* Wine Recommendations */}
        {analysisResult.wineRecommendations?.map((recommendation, index) => (
          <View key={index} style={styles.menuItemCard}>
            <TouchableOpacity
              style={styles.menuItemHeader}
              onPress={() => toggleExpanded(index)}
            >
              <View style={styles.menuItemInfo}>
                <Text style={styles.menuItemName}>{recommendation.wine?.wineName || 'Wine Recommendation'}</Text>
                <Text style={styles.menuItemDescription}>
                  {recommendation.wine?.producer} • {recommendation.wine?.vintage}
                </Text>
                <Text style={styles.menuItemPrice}>{recommendation.wine?.pricePoint}</Text>
                <Text style={styles.menuItemCategory}>{recommendation.wine?.category}</Text>
              </View>
              <Text style={styles.expandIcon}>
                {expandedItems.has(index) ? '▼' : '▶'}
              </Text>
            </TouchableOpacity>

            {expandedItems.has(index) && (
              <View style={styles.wineRecommendations}>
                <Text style={styles.wineRecommendationsTitle}>Wine Details:</Text>
                <View style={styles.wineCard}>
                  <View style={styles.wineHeader}>
                    <Text style={styles.wineName}>{recommendation.wine?.wineName}</Text>
                    <Text style={styles.winePrice}>{recommendation.wine?.pricePoint}</Text>
                  </View>
                  <Text style={styles.wineProducer}>
                    {recommendation.wine?.producer} • {recommendation.wine?.vintage}
                  </Text>
                  <Text style={styles.wineDescription}>{recommendation.wine?.description}</Text>
                  <Text style={styles.wineRationale}>{recommendation.pairingRationale}</Text>
                  <Text style={styles.servingGuidance}>{recommendation.servingGuidance}</Text>
                  <View style={styles.wineFooter}>
                    <Text style={styles.confidenceScore}>
                      {recommendation.confidenceScore}% confidence
                    </Text>
                    <TouchableOpacity
                      style={styles.favoriteButton}
                      onPress={() => handleAddToFavorites(recommendation.wine)}
                    >
                      <Text style={styles.favoriteButtonText}>❤ Add to Favorites</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            )}
          </View>
        ))}

        {/* Available Wines List */}
        {analysisResult.availableWines && analysisResult.availableWines.length > 0 && (
          <View style={styles.rawMenuCard}>
            <Text style={styles.rawMenuTitle}>Available Wines:</Text>
            {analysisResult.availableWines.map((wine, index) => (
              <View key={index} style={styles.rawMenuItem}>
                <Text style={styles.rawMenuItemName}>{wine.wineName}</Text>
                <Text style={styles.rawMenuItemDescription}>
                  {wine.producer} • {wine.vintage} • {wine.pricePoint}
                </Text>
                {wine.description && (
                  <Text style={styles.rawMenuItemPrice}>{wine.description}</Text>
                )}
              </View>
            ))}
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f8f8',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#8B0000',
    paddingHorizontal: 20,
    paddingVertical: 15,
    paddingTop: 50,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
  },
  closeButton: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  summaryCard: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 12,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  summaryTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  summaryLabel: {
    fontSize: 14,
    color: '#666',
  },
  summaryValue: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#8B0000',
  },
  menuItemCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  menuItemHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  menuItemInfo: {
    flex: 1,
  },
  menuItemName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  menuItemDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  menuItemPrice: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#8B0000',
    marginBottom: 4,
  },
  menuItemCategory: {
    fontSize: 12,
    color: '#999',
    fontStyle: 'italic',
  },
  expandIcon: {
    fontSize: 16,
    color: '#8B0000',
    marginLeft: 10,
  },
  wineRecommendations: {
    paddingHorizontal: 16,
    paddingBottom: 16,
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  wineRecommendationsTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 12,
    marginBottom: 8,
  },
  wineCard: {
    backgroundColor: '#f9f9f9',
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
  },
  wineHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  wineName: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
    flex: 1,
  },
  winePrice: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#8B0000',
  },
  wineProducer: {
    fontSize: 12,
    color: '#666',
    marginBottom: 6,
  },
  wineDescription: {
    fontSize: 12,
    color: '#666',
    marginBottom: 6,
    fontStyle: 'italic',
  },
  wineRationale: {
    fontSize: 12,
    color: '#555',
    lineHeight: 16,
    marginBottom: 6,
  },
  servingGuidance: {
    fontSize: 12,
    color: '#8B0000',
    fontWeight: 'bold',
    marginBottom: 8,
  },
  wineFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  confidenceScore: {
    fontSize: 11,
    color: '#999',
  },
  favoriteButton: {
    backgroundColor: '#8B0000',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  favoriteButtonText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: 'bold',
  },
  rawMenuCard: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  rawMenuTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
  },
  rawMenuItem: {
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  rawMenuItemName: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 2,
  },
  rawMenuItemDescription: {
    fontSize: 12,
    color: '#666',
    marginBottom: 2,
  },
  rawMenuItemPrice: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#8B0000',
  },
});
