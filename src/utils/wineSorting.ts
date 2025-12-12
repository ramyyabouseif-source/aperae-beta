/**
 * Wine Sorting Utilities
 * Handles sorting of wine recommendations by various criteria
 */

import { WineRecommendation } from '../types/wine';
import { getConfidenceScore } from './wineTypeHelpers';

// Re-export for backward compatibility
export type { WineRecommendation };

/**
 * Extracts numeric price from pricePoint string
 * Handles various formats like "$145", "$45-60", "unknown", etc.
 * @param pricePoint - The price point string from wine data
 * @returns Numeric price value for sorting, or 0 if unknown/invalid
 */
export function extractNumericPrice(pricePoint: string): number {
  if (!pricePoint || pricePoint.toLowerCase() === 'unknown') {
    return 0;
  }

  // Remove currency symbols and common text
  const cleanPrice = pricePoint
    .replace(/[$£€¥]/g, '') // Remove currency symbols
    .replace(/[,\s]/g, '') // Remove commas and spaces
    .replace(/[a-zA-Z]/g, '') // Remove letters
    .trim();

  // Handle range prices (e.g., "45-60" -> use higher value)
  if (cleanPrice.includes('-')) {
    const rangeParts = cleanPrice.split('-');
    const maxPrice = Math.max(
      ...rangeParts.map(part => parseFloat(part) || 0)
    );
    return maxPrice;
  }

  // Handle single price
  const numericPrice = parseFloat(cleanPrice);
  return isNaN(numericPrice) ? 0 : numericPrice;
}

/**
 * Sorts wine recommendations by price (most expensive to least expensive)
 * Wines with unknown prices are placed at the end
 * @param wines - Array of wine recommendations
 * @returns Sorted array with most expensive wines first
 */
export function sortWinesByPriceDescending(wines: WineRecommendation[]): WineRecommendation[] {
  return [...wines].sort((a, b) => {
    const priceA = extractNumericPrice(a.pricePoint);
    const priceB = extractNumericPrice(b.pricePoint);

    // If both prices are unknown (0), maintain original order
    if (priceA === 0 && priceB === 0) {
      return 0;
    }

    // Unknown prices go to the end
    if (priceA === 0) return 1;
    if (priceB === 0) return -1;

    // Sort by price descending (highest first)
    return priceB - priceA;
  });
}

/**
 * Sorts wine recommendations by price (least expensive to most expensive)
 * Wines with unknown prices are placed at the end
 * @param wines - Array of wine recommendations
 * @returns Sorted array with least expensive wines first
 */
export function sortWinesByPriceAscending(wines: WineRecommendation[]): WineRecommendation[] {
  return [...wines].sort((a, b) => {
    const priceA = extractNumericPrice(a.pricePoint);
    const priceB = extractNumericPrice(b.pricePoint);

    // If both prices are unknown (0), maintain original order
    if (priceA === 0 && priceB === 0) {
      return 0;
    }

    // Unknown prices go to the end
    if (priceA === 0) return 1;
    if (priceB === 0) return -1;

    // Sort by price ascending (lowest first)
    return priceA - priceB;
  });
}

/**
 * Sorts wine recommendations by confidence score (highest first)
 * @param wines - Array of wine recommendations
 * @returns Sorted array with highest confidence wines first
 */
export function sortWinesByConfidence(wines: WineRecommendation[]): WineRecommendation[] {
  return [...wines].sort((a, b) => {
    const scoreA = getConfidenceScore(a);
    const scoreB = getConfidenceScore(b);
    return scoreB - scoreA;
  });
}

/**
 * Default sorting strategy for API mode
 * Currently sorts by price descending (most expensive first)
 * @param wines - Array of wine recommendations
 * @returns Sorted array according to default strategy
 */
export function sortWinesForAPIMode(wines: WineRecommendation[]): WineRecommendation[] {
  return sortWinesByPriceDescending(wines);
}

/**
 * Default sorting strategy for mock mode
 * Maintains original order (no sorting)
 * @param wines - Array of wine recommendations
 * @returns Original array unchanged
 */
export function sortWinesForMockMode(wines: WineRecommendation[]): WineRecommendation[] {
  return wines; // No sorting in mock mode
}




