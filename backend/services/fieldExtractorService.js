/**
 * Field Extractor Service
 * 
 * Extracts and infers values for fields that were removed from client-side JSON
 * but are needed for database storage.
 * 
 * Fields to extract/infer:
 * - cookingMethod: from primaryProtein
 * - cookingMethodImpact: derived from cooking method
 * - sauce: from dominantFlavors/fatContent
 * - sauceCharacteristic: from dominantFlavors
 * - saucePriority: from dominantFlavors/fatContent
 * - tierRationale: from tierLabel and recommendation context
 * - tierFallbackApplied: from tierLabel pattern
 * - vintageRationale: from rationale and vintage
 * - maxABV: only if spiceLevel is 'hot' (13.5%)
 */

const logger = require('../logger');

/**
 * Extracts cooking method from primaryProtein field
 * @param {string} primaryProtein - e.g., "beef (grilled)" or "chicken, roasted"
 * @returns {string|null} Cooking method or null if not found
 */
function extractCookingMethod(primaryProtein) {
  if (!primaryProtein || typeof primaryProtein !== 'string') {
    return null;
  }
  
  const proteinText = primaryProtein.toLowerCase();
  const cookingMethods = [
    'grilled', 'roasted', 'fried', 'braised', 'poached', 
    'raw', 'steamed', 'sauteed', 'baked', 'seared', 
    'smoked', 'roasted', 'barbecued', 'charred', 'pan-fried'
  ];
  
  const foundMethod = cookingMethods.find(method => proteinText.includes(method));
  return foundMethod || null;
}

/**
 * Derives cooking method impact based on cooking method
 * @param {string} cookingMethod - Cooking method
 * @returns {string|null} Impact description
 */
function deriveCookingMethodImpact(cookingMethod) {
  if (!cookingMethod) return null;
  
  const impactMap = {
    'grilled': 'High heat creates char and caramelization, increases umami',
    'roasted': 'Dry heat concentrates flavors and creates Maillard reactions',
    'fried': 'High fat content, creates crispy texture, increases richness',
    'braised': 'Slow cooking breaks down proteins, creates rich sauce',
    'poached': 'Gentle cooking preserves delicate flavors, minimal fat',
    'raw': 'No cooking transformation, natural flavors preserved',
    'steamed': 'Gentle cooking, preserves delicate flavors and moisture',
    'sauteed': 'Quick cooking with moderate heat, some fat introduced',
    'baked': 'Even heat, creates caramelization and moisture retention',
    'seared': 'High heat creates crust, concentrates surface flavors',
    'smoked': 'Adds smoky compounds and complexity to flavors',
    'charred': 'High heat creates bitter compounds and char flavors',
    'pan-fried': 'Moderate heat with fat, creates crispy exterior'
  };
  
  return impactMap[cookingMethod.toLowerCase()] || null;
}

/**
 * Infers sauce type from dominantFlavors and fatContent
 * @param {array} dominantFlavors - Array of flavor descriptors
 * @param {string} fatContent - Fat content level
 * @returns {string|null} Inferred sauce type
 */
function inferSauce(dominantFlavors, fatContent) {
  if (!dominantFlavors || !Array.isArray(dominantFlavors)) {
    return null;
  }
  
  const flavors = dominantFlavors.map(f => f.toLowerCase());
  const fat = (fatContent || '').toLowerCase();
  
  // Check for common sauce indicators
  if (flavors.includes('sweet') || flavors.includes('caramel')) {
    if (fat === 'high' || fat === 'medium-high') {
      return 'Cream sauce';
    }
    return 'Sweet glaze or reduction';
  }
  
  if (flavors.includes('umami') && (fat === 'high' || fat === 'medium-high')) {
    return 'Rich sauce';
  }
  
  if (flavors.includes('sour') || flavors.includes('acidic')) {
    return 'Acidic sauce or vinaigrette';
  }
  
  if (flavors.includes('salty') && flavors.includes('umami')) {
    return 'Savory sauce';
  }
  
  if (fat === 'high' || fat === 'medium-high') {
    return 'Rich sauce';
  }
  
  if (fat === 'none' || fat === 'low') {
    return 'Light sauce or broth';
  }
  
  return null;
}

/**
 * Infers sauce characteristic from dominantFlavors
 * @param {array} dominantFlavors - Array of flavor descriptors
 * @returns {string|null} Sauce characteristic
 */
function inferSauceCharacteristic(dominantFlavors) {
  if (!dominantFlavors || !Array.isArray(dominantFlavors)) {
    return null;
  }
  
  const flavors = dominantFlavors.map(f => f.toLowerCase());
  
  if (flavors.includes('sweet')) return 'Sweet';
  if (flavors.includes('sour') || flavors.includes('acidic')) return 'Acidic';
  if (flavors.includes('salty')) return 'Salty';
  if (flavors.includes('umami')) return 'Umami-rich';
  if (flavors.includes('bitter')) return 'Bitter';
  
  return null;
}

/**
 * Infers sauce priority from dominantFlavors and fatContent
 * @param {array} dominantFlavors - Array of flavor descriptors
 * @param {string} fatContent - Fat content level
 * @returns {string|null} Sauce priority level
 */
function inferSaucePriority(dominantFlavors, fatContent) {
  if (!dominantFlavors || !Array.isArray(dominantFlavors)) {
    return null;
  }
  
  const flavors = dominantFlavors.map(f => f.toLowerCase());
  const fat = (fatContent || '').toLowerCase();
  
  // High priority if sauce is rich or strongly flavored
  if (fat === 'high' || fat === 'medium-high') {
    return 'High';
  }
  
  if (flavors.some(f => ['sweet', 'sour', 'salty', 'umami'].includes(f))) {
    return 'Medium';
  }
  
  return 'Low';
}

/**
 * Infers tier rationale from tierLabel and recommendation context
 * @param {string} tierLabel - Tier label (e.g., "Premium Selection")
 * @param {object} recommendation - Full recommendation object
 * @returns {string|null} Tier rationale
 */
function inferTierRationale(tierLabel, recommendation) {
  if (!tierLabel) return null;
  
  const tier = tierLabel.toLowerCase();
  const rationale = [];
  
  // Check for classification signals in wine name, producer, region
  const wineName = (recommendation.wineName || '').toLowerCase();
  const producer = (recommendation.producer || '').toLowerCase();
  const region = (recommendation.region || '').toLowerCase();
  
  if (tier.includes('premium')) {
    // Premium indicators
    if (wineName.includes('grand cru') || region.includes('grand cru')) {
      rationale.push('Grand Cru classification');
    }
    if (wineName.includes('premier cru') || region.includes('premier cru')) {
      rationale.push('Premier Cru classification');
    }
    if (wineName.includes('reserve') || wineName.includes('reserva')) {
      rationale.push('Reserve designation');
    }
    if (wineName.includes('barolo') || wineName.includes('barbaresco')) {
      rationale.push('Prestigious DOCG designation');
    }
    if (recommendation.vintage && recommendation.vintage !== 'unknown' && recommendation.vintage !== 'NV') {
      rationale.push('Specific vintage indicated');
    }
    
    if (rationale.length === 0) {
      rationale.push('High-tier producer or region');
    }
  } else if (tier.includes('moderate')) {
    // Moderate indicators
    if (region && region !== 'unknown') {
      rationale.push('Recognized regional designation');
    }
    if (producer && producer !== 'unknown') {
      rationale.push('Reputable producer');
    }
    if (rationale.length === 0) {
      rationale.push('Mid-tier classification signals');
    }
  } else if (tier.includes('budget')) {
    // Budget indicators
    rationale.push('Entry-level or broad appellation');
  }
  
  return rationale.length > 0 ? rationale.join('; ') : null;
}

/**
 * Checks if tier fallback was applied based on tierLabel pattern
 * @param {string} tierLabel - Tier label
 * @param {object} recommendation - Full recommendation object
 * @returns {boolean} True if fallback likely applied
 */
function inferTierFallbackApplied(tierLabel, recommendation) {
  if (!tierLabel) return false;
  
  const tier = tierLabel.toLowerCase();
  
  // If wine name, producer, or region is unknown, likely fallback
  const hasUnknownData = 
    recommendation.wineName === 'unknown' ||
    recommendation.producer === 'unknown' ||
    recommendation.region === 'unknown';
  
  // Budget tier with unknown data is often a fallback
  if (tier.includes('budget') && hasUnknownData) {
    return true;
  }
  
  // Check if rationale mentions fallback
  const rationale = (recommendation.rationale || '').toLowerCase();
  if (rationale.includes('fallback') || rationale.includes('limited data')) {
    return true;
  }
  
  return false;
}

/**
 * Extracts vintage rationale from recommendation rationale and vintage
 * @param {string} rationale - Recommendation rationale
 * @param {string} vintage - Vintage year
 * @param {string} referenceDate - Reference date for calculations (YYYY-MM-DD)
 * @returns {string|null} Vintage rationale
 */
function extractVintageRationale(rationale, vintage, referenceDate) {
  if (!rationale || !vintage) return null;
  
  const rationaleText = rationale.toLowerCase();
  const vintageNum = parseInt(vintage);
  
  // Check if rationale mentions vintage
  if (rationaleText.includes(vintage) || rationaleText.includes('year')) {
    // Try to extract vintage-related reasoning
    const sentences = rationale.split(/[.!?]/);
    const vintageSentence = sentences.find(s => 
      s.toLowerCase().includes(vintage) || 
      s.toLowerCase().includes('year') ||
      s.toLowerCase().includes('age')
    );
    
    if (vintageSentence) {
      return vintageSentence.trim();
    }
  }
  
  // Infer based on vintage age
  if (!isNaN(vintageNum) && referenceDate) {
    const refYear = parseInt(referenceDate.split('-')[0]);
    const age = refYear - vintageNum;
    
    if (age >= 8 && age <= 12) {
      return `Optimal drinking window for this wine`;
    } else if (age < 3) {
      return `Recent vintage, fresh and primary`;
    } else if (age > 15) {
      return `Mature vintage with developed complexity`;
    }
  }
  
  return null;
}

/**
 * Gets maxABV if spice level indicates capsaicin (hot spice)
 * @param {string} spiceLevel - Spice level (none/mild/moderate/hot)
 * @returns {string|null} Max ABV (13.5%) or null
 */
function getMaxABV(spiceLevel) {
  if (!spiceLevel) return null;
  
  const level = spiceLevel.toLowerCase();
  if (level === 'hot') {
    return '13.5%';
  }
  
  return null;
}

/**
 * Main function to extract all fields from a full recommendation response
 * @param {object} fullResponse - Complete response from Claude (before sanitization)
 * @returns {object} Extracted fields organized by recommendation
 */
function extractAllFields(fullResponse) {
  const extracted = {
    dishAnalysis: {},
    recommendations: []
  };
  
  try {
    // Extract dish analysis fields
    if (fullResponse.dishAnalysis) {
      const analysis = fullResponse.dishAnalysis;
      
      extracted.dishAnalysis = {
        cookingMethod: extractCookingMethod(analysis.primaryProtein),
        cookingMethodImpact: null, // Will derive after cookingMethod
        sauce: inferSauce(analysis.dominantFlavors, analysis.fatContent),
        sauceCharacteristic: inferSauceCharacteristic(analysis.dominantFlavors),
        saucePriority: inferSaucePriority(analysis.dominantFlavors, analysis.fatContent),
        maxABV: getMaxABV(analysis.spiceLevel)
      };
      
      // Derive cooking method impact after we have the method
      if (extracted.dishAnalysis.cookingMethod) {
        extracted.dishAnalysis.cookingMethodImpact = deriveCookingMethodImpact(
          extracted.dishAnalysis.cookingMethod
        );
      }
    }
    
    // Extract recommendation-specific fields
    if (fullResponse.recommendations && Array.isArray(fullResponse.recommendations)) {
      const referenceDate = new Date().toISOString().split('T')[0]; // Today's date
      
      extracted.recommendations = fullResponse.recommendations.map((rec, index) => {
        return {
          tierRationale: inferTierRationale(rec.tierLabel, rec),
          tierFallbackApplied: inferTierFallbackApplied(rec.tierLabel, rec),
          vintageRationale: extractVintageRationale(
            rec.rationale,
            rec.vintage,
            referenceDate
          )
        };
      });
    }
    
    logger.debug('Field extraction completed', {
      extractedDishAnalysisFields: Object.keys(extracted.dishAnalysis).length,
      extractedRecommendationFields: extracted.recommendations.length
    });
    
  } catch (error) {
    logger.error('Error extracting fields', { error: error.message, stack: error.stack });
    // Return empty structure on error
  }
  
  return extracted;
}

module.exports = {
  extractCookingMethod,
  deriveCookingMethodImpact,
  inferSauce,
  inferSauceCharacteristic,
  inferSaucePriority,
  inferTierRationale,
  inferTierFallbackApplied,
  extractVintageRationale,
  getMaxABV,
  extractAllFields
};








