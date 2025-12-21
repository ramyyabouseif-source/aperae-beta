/**
 * Menu Results Component
 * Displays analyzed menu items and wine recommendations
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Alert,
} from 'react-native';
import { MenuAnalysisResult, WineListAnalysisResult } from '../services/menuAnalysisService';
import { FavoritesService } from '../services/favoritesService';
import AdaptiveWineCard from './AdaptiveWineCard';
import { SkeletonWineCard } from './LoadingStates';
import ResponsibleDrinkingDisclaimer from './ResponsibleDrinkingDisclaimer';
import GoogleVisionAttribution from './GoogleVisionAttribution';
import { WineRecommendation } from '../types/wine';


interface MenuResultsProps {
  analysisResult: MenuAnalysisResult | WineListAnalysisResult;
  onClose?: () => void;
  isLoading?: boolean;
}

export default function MenuResults({ analysisResult, onClose, isLoading = false }: MenuResultsProps) {
  // Note: onClose is kept for potential future use (e.g., collapse section)
  const [favorites, setFavorites] = useState<Set<string>>(new Set());
  
  /**
   * DISPLAY LAYER: Sanitize Text for User Experience
   * 
   * This function transforms text for display purposes ONLY. It does NOT affect data integrity.
   * 
   * ARCHITECTURE:
   * - Data Layer (menuAnalysisService.ts): Preserves EXACT text from OCR/menu (e.g., "FAMIGLIA PASQUA")
   * - Matching Layer: Uses case-insensitive comparison for accuracy
   * - Display Layer (this function): Transforms ALL CAPS to readable title case for UX
   * 
   * Why sanitize?
   * - ALL CAPS text is harder to read and looks unprofessional in UI
   * - Improves user experience without compromising data accuracy
   * - Original exact text remains in the data layer for matching/verification
   * 
   * NOTE: This sanitization only affects what users see, not what we store or match against.
   */
  const sanitizeText = (text: string): string => {
    if (!text) return text;
    // Check if text is all caps (excluding common abbreviations)
    const isAllCaps = /^[A-Z\s.,'\-"()]+$/.test(text) && text.length > 3;
    if (isAllCaps && text === text.toUpperCase()) {
      // Convert to title case, preserving common wine terms
      return text.toLowerCase()
        .replace(/\b\w/g, (char) => char.toUpperCase())
        .replace(/\b(Mv|Nv|Cv)\b/gi, (match) => match.toUpperCase())
        .replace(/\b(D'|L'|De|La|Le|Les|Du|Des)\b/gi, (match) => match.toLowerCase());
    }
    return text;
  };

  const handleAddToFavorites = async (wine: WineRecommendation) => {
    try {
      // Convert WineRecommendation to FavoriteWine format
      const favoriteWine = {
        ...wine,
        id: `${wine.wineName}-${Date.now()}`,
        addedAt: new Date().toISOString(),
      };
      await FavoritesService.addToFavorites(favoriteWine as any);
      setFavorites(new Set([...favorites, wine.wineName]));
      Alert.alert('Success', 'Wine added to favorites!');
    } catch (error) {
      console.error('Error adding to favorites:', error);
      Alert.alert('Error', 'Failed to add wine to favorites');
    }
  };

  const handleRemoveFromFavorites = async (wine: WineRecommendation) => {
    try {
      await FavoritesService.removeFromFavorites(wine.wineName);
      const newFavorites = new Set(favorites);
      newFavorites.delete(wine.wineName);
      setFavorites(newFavorites);
    } catch (error) {
      console.error('Error removing from favorites:', error);
    }
  };

  /**
   * TRANSITION POINT: Data Layer → Display Layer
   * 
   * This function converts menu analysis results (with EXACT menu text) to display format.
   * 
   * IMPORTANT:
   * - Input (rec.wine): Contains EXACT text from OCR/menu (data layer)
   * - Output (WineRecommendation): Contains sanitized text for UI display (display layer)
   * 
   * This is where we apply sanitization for user experience while preserving the original
   * exact text in the data layer for accurate matching and verification.
   * 
   * Example transformation:
   * - Input: "FAMIGLIA PASQUA" (exact menu text)
   * - Output: "Famiglia Pasqua" (sanitized for display)
   * - Original exact text remains available in rec.wine for data integrity
   */
  const convertToWineRecommendation = (rec: any): WineRecommendation => {
    return {
      wineName: sanitizeText(rec.wine?.wineName || 'Unknown Wine'), // Sanitize for display
      producer: sanitizeText(rec.wine?.producer || 'Unknown Producer'), // Sanitize for display
      vintage: rec.wine?.vintage || 'NV',
      pricePoint: rec.wine?.pricePoint || 'Price not listed',
      rationale: rec.pairingRationale || '',
      // Use AI-generated tasting notes if available, otherwise fall back
      tastingNotes: rec.tastingNotes || sanitizeText(rec.wine?.description || ''),
      servingGuidance: rec.servingGuidance || 'Serve at recommended temperature',
      confidenceScore: rec.confidenceScore || 75,
      expertRating: rec.expertRating || 'unknown',
      retailerSuggestion: rec.retailerSuggestion || 'Check local wine retailers',
      image: 'unknown',
      storytellingElements: rec.storytellingElements || rec.pairingRationale || ''
    };
  };

  const wineRecommendations: WineRecommendation[] = (() => {
    try {
      if (!analysisResult.wineRecommendations || !Array.isArray(analysisResult.wineRecommendations)) {
        console.warn('MenuResults: No wineRecommendations array in analysisResult');
        return [];
      }
      
      console.log(`MenuResults: Converting ${analysisResult.wineRecommendations.length} recommendations`);
      const converted = analysisResult.wineRecommendations.map((rec, index) => {
        try {
          return convertToWineRecommendation(rec);
        } catch (error: any) {
          console.error(`MenuResults: Error converting recommendation ${index}:`, error);
          console.error('Problematic recommendation:', rec);
          // Return a fallback recommendation to prevent breaking the entire list
          return {
            wineName: rec.wine?.wineName || 'Unknown Wine',
            producer: rec.wine?.producer || 'Unknown Producer',
            vintage: rec.wine?.vintage || 'NV',
            pricePoint: rec.wine?.pricePoint || 'Price not listed',
            rationale: rec.pairingRationale || 'No pairing rationale available',
            tastingNotes: '',
            servingGuidance: 'Serve at recommended temperature',
            confidenceScore: rec.confidenceScore || 75,
            expertRating: rec.expertRating || 'unknown',
            retailerSuggestion: rec.retailerSuggestion || 'Check local wine retailers',
            image: 'unknown',
            storytellingElements: rec.storytellingElements || ''
          };
        }
      }).filter(rec => rec !== null && rec !== undefined);
      
      console.log(`MenuResults: Successfully converted ${converted.length} recommendations`);
      return converted;
    } catch (error: any) {
      console.error('MenuResults: Error processing recommendations:', error);
      return [];
    }
  })();

  // Check if OCR was used (indicated by ocrConfidence > 0)
  const wasOCRUsed = analysisResult.ocrConfidence && analysisResult.ocrConfidence > 0;

  return (
    <View style={styles.container}>
      {/* Title Section - Flows naturally with the page */}
      {!isLoading && wineRecommendations.length > 0 && (
        <Text style={styles.recommendationsTitle}>
          Recommended Wines for "{analysisResult.dishAnalyzed || 'Your Dish'}"
        </Text>
      )}

      {/* Google Vision API Attribution - Show if OCR was used */}
      {wasOCRUsed && (
        <GoogleVisionAttribution compact />
      )}

      {/* Skeleton Loading State */}
      {isLoading && (
        <View style={styles.skeletonContainer}>
          <Text style={styles.recommendationsTitle}>
            Finding Perfect Wine Pairings...
          </Text>
          <View style={styles.skeletonCardsContainer}>
            <SkeletonWineCard delay={0} style={styles.skeletonCard} />
            <SkeletonWineCard delay={200} style={styles.skeletonCard} />
            <SkeletonWineCard delay={400} style={styles.skeletonCard} />
          </View>
        </View>
      )}

      {/* Wine Recommendations */}
      {!isLoading && wineRecommendations.length > 0 && (
        <View style={styles.recommendationsSection}>
          {wineRecommendations.map((wine, index) => (
            <React.Fragment key={`${wine.wineName}-${index}`}>
              <AdaptiveWineCard
                wine={wine}
                index={index}
                isFavorite={favorites.has(wine.wineName)}
                onAddToFavorites={handleAddToFavorites}
                onRemoveFromFavorites={handleRemoveFromFavorites}
              />
              {/* Responsible Drinking Disclaimer - After third wine card */}
              {index === 2 && (
                <ResponsibleDrinkingDisclaimer />
              )}
            </React.Fragment>
          ))}
        </View>
      )}

      {/* No Recommendations Message */}
      {!isLoading && wineRecommendations.length === 0 && (
        <View style={styles.emptyState}>
          <Text style={styles.emptyStateText}>No wine recommendations available</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    backgroundColor: 'transparent',
    marginTop: 20,
    paddingHorizontal: 0,
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
  recommendationsSection: {
    marginTop: 8,
    paddingHorizontal: 0,
    width: '100%',
    alignItems: 'center',
  },
  recommendationsTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#FFFFFF',
    paddingHorizontal: 20,
    marginBottom: 20,
    marginTop: 8,
  },
  skeletonContainer: {
    paddingHorizontal: 0,
    marginTop: 8,
  },
  skeletonCardsContainer: {
    paddingHorizontal: 20,
  },
  skeletonCard: {
    marginBottom: 12,
  },
  emptyState: {
    padding: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyStateText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
});
