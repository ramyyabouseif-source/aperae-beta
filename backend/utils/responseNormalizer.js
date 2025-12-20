const logger = require('../logger');

/**
 * Normalizes tasting notes from string (legacy) or object (new) format
 * @param {string|object} notes - Tasting notes in either format
 * @returns {object} Normalized tasting notes object
 */
function normalizeTastingNotes(notes) {
  if (typeof notes === 'string') {
    // Legacy format - parse if possible, otherwise create structure
    return {
      aromas: extractAromasFromString(notes) || [],
      palate: notes,
      finish: extractFinishFromString(notes) || ''
    };
  }
  if (typeof notes === 'object' && notes !== null) {
    return {
      aromas: Array.isArray(notes.aromas) ? notes.aromas : [],
      palate: notes.palate || '',
      finish: notes.finish || ''
    };
  }
  return { aromas: [], palate: '', finish: '' };
}

/**
 * Normalizes confidence from number (legacy) or object (new) format
 * @param {object} rec - Recommendation object
 * @returns {object} Normalized confidence object
 */
function normalizeConfidence(rec) {
  // If new format exists, validate and return
  if (rec.confidence && typeof rec.confidence === 'object') {
    const breakdown = rec.confidence.breakdown || {};
    return {
      score: rec.confidence.score || 0,
      breakdown: {
        pairingScience: breakdown.pairingScience || 0,
        wineKnowledge: breakdown.wineKnowledge || 0,
        complexityHandling: breakdown.complexityHandling || 0
      },
      rationale: rec.confidence.rationale || ''
    };
  }
  
  // Legacy format - convert
  const score = rec.confidenceScore || 0;
  return {
    score,
    breakdown: {
      pairingScience: Math.round(score * 0.5), // Estimate
      wineKnowledge: Math.round(score * 0.3),
      complexityHandling: Math.round(score * 0.2)
    },
    rationale: rec.confidenceRationale || ''
  };
}

/**
 * Normalizes dish analysis, adding missing new fields with defaults
 * @param {object} analysis - Dish analysis object
 * @returns {object|null} Normalized dish analysis
 */
function normalizeDishAnalysis(analysis) {
  if (!analysis || typeof analysis !== 'object') {
    return null;
  }
  
  return {
    dominantWeight: analysis.dominantWeight || 'medium',
    fatContent: analysis.fatContent || 'medium',
    primaryProtein: analysis.primaryProtein || '',
    dominantFlavors: Array.isArray(analysis.dominantFlavors) 
      ? analysis.dominantFlavors 
      : [],
    spiceLevel: analysis.spiceLevel || 'none',
    acidityLevel: analysis.acidityLevel || 'medium',
    applicablePrinciples: Array.isArray(analysis.applicablePrinciples)
      ? analysis.applicablePrinciples
      : [],
    keyChallenge: analysis.keyChallenge || '',
    idealProfile: analysis.idealProfile || {
      acidity: 'medium',
      tannin: 'medium',
      body: 'medium',
      sweetness: 'dry',
      notes: ''
    }
  };
}

/**
 * Normalizes a single recommendation
 * @param {object} rec - Recommendation object
 * @returns {object} Normalized recommendation
 */
function normalizeRecommendation(rec) {
  if (!rec || typeof rec !== 'object') {
    return rec;
  }
  
  const normalized = { ...rec };
  
  // Normalize tasting notes
  normalized.tastingNotes = normalizeTastingNotes(rec.tastingNotes);
  
  // Normalize confidence
  const confidence = normalizeConfidence(rec);
  normalized.confidence = confidence;
  
  // Keep legacy fields for backward compatibility
  // But prefer new format if both exist
  
  // Ensure new fields have defaults
  normalized.region = normalized.region || '';
  normalized.tierFallbackApplied = normalized.tierFallbackApplied || false;
  normalized.story = normalized.story || '';
  normalized.alternatives = Array.isArray(normalized.alternatives) 
    ? normalized.alternatives 
    : [];
  
  // Normalize serving guidance (handle both string and object)
  // Keep as-is for now, components will handle both formats
  
  return normalized;
}

/**
 * Normalizes entire response object
 * @param {object} responseData - Response data object
 * @returns {object} Normalized response
 */
function normalizeResponse(responseData) {
  if (!responseData || typeof responseData !== 'object') {
    return responseData;
  }
  
  const normalized = { ...responseData };
  
  // Normalize dish analysis
  if (normalized.dishAnalysis) {
    normalized.dishAnalysis = normalizeDishAnalysis(normalized.dishAnalysis);
  }
  
  // Normalize recommendations array
  if (Array.isArray(normalized.recommendations)) {
    normalized.recommendations = normalized.recommendations.map(normalizeRecommendation);
  }
  
  // Ensure avoid object exists
  if (!normalized.avoid) {
    normalized.avoid = {
      types: [],
      reason: ''
    };
  }
  
  return normalized;
}

/**
 * Helper function to extract aromas from string (simple implementation)
 * @param {string} str - Tasting notes string
 * @returns {array} Array of extracted aromas (empty for now, can be enhanced)
 */
function extractAromasFromString(str) {
  // Simple extraction - look for common patterns
  // This is a fallback, new format should have structured data
  // For now, return empty array - legacy format will show full string in palate
  return [];
}

/**
 * Helper function to extract finish from string (simple implementation)
 * @param {string} str - Tasting notes string
 * @returns {string} Extracted finish description (empty for now, can be enhanced)
 */
function extractFinishFromString(str) {
  // Simple extraction - look for "finish" mentions
  // This is a fallback, new format should have structured data
  // For now, return empty string - legacy format will show full string in palate
  return '';
}

module.exports = {
  normalizeResponse,
  normalizeRecommendation,
  normalizeTastingNotes,
  normalizeConfidence,
  normalizeDishAnalysis
};













