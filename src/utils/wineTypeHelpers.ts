import { TastingNotes, Confidence, WineRecommendation } from '../types/wine';
import { isNewTastingNotes, isNewConfidence } from '../types/wine';

/**
 * Extracts tasting notes display data from either format
 * @param notes - Tasting notes in either legacy (string) or new (object) format
 * @returns Object with aromas, palate, and finish
 */
export function getTastingNotesDisplay(notes: TastingNotes): {
  aromas: string[];
  palate: string;
  finish: string;
} {
  if (isNewTastingNotes(notes)) {
    return {
      aromas: notes.aromas,
      palate: notes.palate,
      finish: notes.finish
    };
  }
  // Legacy string format
  return {
    aromas: [],
    palate: notes,
    finish: ''
  };
}

/**
 * Gets confidence score from either format
 * @param wine - Wine recommendation object
 * @returns Confidence score (0-100)
 */
export function getConfidenceScore(wine: WineRecommendation): number {
  if (wine.confidence && isNewConfidence(wine.confidence)) {
    return wine.confidence.score;
  }
  // Fallback to legacy
  return wine.confidenceScore || 0;
}

/**
 * Gets confidence breakdown if available
 * @param wine - Wine recommendation object
 * @returns Confidence breakdown object or null
 */
export function getConfidenceBreakdown(wine: WineRecommendation): {
  pairingScience: number;
  wineKnowledge: number;
  complexityHandling: number;
} | null {
  if (wine.confidence && isNewConfidence(wine.confidence)) {
    return wine.confidence.breakdown;
  }
  return null;
}

/**
 * Gets confidence rationale from either format
 * @param wine - Wine recommendation object
 * @returns Confidence rationale string
 */
export function getConfidenceRationale(wine: WineRecommendation): string {
  if (wine.confidence && isNewConfidence(wine.confidence)) {
    return wine.confidence.rationale;
  }
  return wine.confidenceRationale || '';
}

/**
 * Gets serving guidance as string (handles both formats)
 * @param wine - Wine recommendation object
 * @returns Serving guidance as formatted string
 */
export function getServingGuidance(wine: WineRecommendation): string {
  if (typeof wine.servingGuidance === 'string') {
    return wine.servingGuidance;
  }
  if (wine.servingGuidance && typeof wine.servingGuidance === 'object') {
    const parts = [];
    if (wine.servingGuidance.temperature) {
      parts.push(`Temperature: ${wine.servingGuidance.temperature}`);
    }
    if (wine.servingGuidance.glassware) {
      parts.push(`Glassware: ${wine.servingGuidance.glassware}`);
    }
    if (wine.servingGuidance.decanting) {
      parts.push(wine.servingGuidance.decanting);
    }
    return parts.join('. ');
  }
  return 'Serve at recommended temperature';
}









