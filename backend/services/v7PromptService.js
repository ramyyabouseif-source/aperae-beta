/**
 * V7.0 Master Sommelier Prompt Service
 * 
 * Handles building the V7.0 prompt with caching support and optimized JSON schema
 */

const { 
  buildV7Prompt, 
  getOptimizedJSONSchema,
  getStaticPromptSections,
  getDynamicPromptSections
} = require('../prompts/v7-master-sommelier-prompt');
const logger = require('../logger');

/**
 * Builds the complete V7.0 prompt for a given dish (legacy method, for backward compatibility)
 * @param {string} dish - Dish name
 * @param {string} referenceDate - Reference date for vintage calculations (default: current date)
 * @returns {string} Complete V7.0 prompt
 */
function buildV7PromptForDish(dish, referenceDate = null) {
  // Use current date if not provided
  if (!referenceDate) {
    const now = new Date();
    referenceDate = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
  }
  
  try {
    const prompt = buildV7Prompt(dish, referenceDate);
    logger.debug('V7.0 prompt built successfully', { 
      dish, 
      referenceDate,
      promptLength: prompt.length 
    });
    return prompt;
  } catch (error) {
    logger.error('Error building V7.0 prompt', { error: error.message, dish });
    throw error;
  }
}

/**
 * Builds static and dynamic prompt sections separately for caching
 * @param {string} dish - Dish name
 * @param {string} referenceDate - Reference date for vintage calculations (default: current date)
 * @returns {object} Object with staticSystemPrompt and dynamicUserMessage
 */
function buildV7PromptWithCaching(dish, referenceDate = null) {
  // Use current date if not provided
  if (!referenceDate) {
    const now = new Date();
    referenceDate = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
  }
  
  try {
    // Get static sections (cacheable) - includes all instructions and rules
    const staticSystemPrompt = getStaticPromptSections();
    
    // Get dynamic sections (per-request) - task, date, vintage calculations
    const dynamicContent = getDynamicPromptSections(dish, referenceDate);
    
    // Build user message with dynamic content
    const dynamicUserMessage = `${dynamicContent}\n\nProvide wine recommendations for: ${dish}. Be EXTREMELY BRIEF - essential info only. Target <25s response.`;
    
    logger.debug('V7.0 prompt built with caching support', { 
      dish, 
      referenceDate,
      staticPromptLength: staticSystemPrompt.length,
      dynamicPromptLength: dynamicUserMessage.length,
      estimatedTokenSavings: '60-70% on static content'
    });
    
    return {
      staticSystemPrompt,
      dynamicUserMessage
    };
  } catch (error) {
    logger.error('Error building V7.0 prompt with caching', { error: error.message, dish });
    throw error;
  }
}

/**
 * Gets the optimized JSON schema (for reference/documentation)
 */
function getOptimizedSchema() {
  return getOptimizedJSONSchema();
}

/**
 * Sanitizes the response by removing fields that shouldn't be sent to client
 * but keeps them for database storage
 * @param {object} fullResponse - Complete response from Claude
 * @returns {object} Sanitized response for client
 */
function sanitizeForClient(fullResponse) {
  if (!fullResponse || !fullResponse.recommendations) {
    return fullResponse;
  }
  
  const sanitized = { ...fullResponse };
  
  // Remove unwanted fields from dishAnalysis (if present)
  if (sanitized.dishAnalysis) {
    const {
      cookingMethod,
      cookingMethodImpact,
      sauce,
      sauceCharacteristic,
      saucePriority,
      maxABV,
      ...cleanDishAnalysis
    } = sanitized.dishAnalysis;
    
    sanitized.dishAnalysis = cleanDishAnalysis;
  }
  
  // Remove unwanted fields from recommendations
  if (sanitized.recommendations && Array.isArray(sanitized.recommendations)) {
    sanitized.recommendations = sanitized.recommendations.map(rec => {
      const {
        tierRationale,
        tierFallbackApplied,
        vintageRationale,
        ...cleanRec
      } = rec;
      
      // Remove maxABV from idealProfile if present
      if (cleanRec.idealProfile && cleanRec.idealProfile.maxABV) {
        const { maxABV, ...cleanIdealProfile } = cleanRec.idealProfile;
        cleanRec.idealProfile = cleanIdealProfile;
      }
      
      return cleanRec;
    });
  }
  
  return sanitized;
}

/**
 * Extracts analysis data from response for database storage
 * Infers/captures fields that were removed from JSON output
 * @param {object} response - Response from Claude
 * @returns {object} Extracted analysis data
 */
function extractAnalysisData(response) {
  const extracted = {
    // Extract cooking method from primaryProtein
    cookingMethod: null,
    cookingMethodImpact: null,
    
    // Infer sauce characteristics from other fields
    sauceAnalysis: null,
    
    // Tier information
    tierInfo: {},
    
    // Vintage reasoning hints
    vintageHints: null,
    
    // maxABV if spice level indicates capsaicin
    maxABV: null
  };
  
  try {
    // Extract cooking method from primaryProtein string
    if (response.dishAnalysis?.primaryProtein) {
      const proteinText = response.dishAnalysis.primaryProtein.toLowerCase();
      const cookingMethods = ['grilled', 'roasted', 'fried', 'braised', 'poached', 'raw', 'steamed'];
      const foundMethod = cookingMethods.find(method => proteinText.includes(method));
      if (foundMethod) {
        extracted.cookingMethod = foundMethod;
      }
    }
    
    // Infer sauce from dominantFlavors and fatContent
    if (response.dishAnalysis) {
      const { dominantFlavors, fatContent, idealProfile } = response.dishAnalysis;
      
      if (dominantFlavors && fatContent) {
        extracted.sauceAnalysis = {
          inferredFrom: {
            dominantFlavors,
            fatContent,
            idealProfile
          }
        };
      }
    }
    
    // Extract tier info
    if (response.recommendations && response.recommendations.length > 0) {
      extracted.tierInfo = response.recommendations.map(rec => ({
        tierLabel: rec.tierLabel,
        wineName: rec.wineName,
        producer: rec.producer
      }));
    }
    
    // Check if maxABV needed (if spice level is hot)
    if (response.dishAnalysis?.spiceLevel === 'hot') {
      extracted.maxABV = '13.5%';
    }
    
    // Extract vintage reasoning hints from rationale
    if (response.recommendations && response.recommendations.length > 0) {
      extracted.vintageHints = response.recommendations.map(rec => ({
        vintage: rec.vintage,
        rationale: rec.rationale // May contain vintage reasoning
      }));
    }
    
  } catch (error) {
    logger.warn('Error extracting analysis data', { error: error.message });
  }
  
  return extracted;
}

module.exports = {
  buildV7PromptForDish,
  buildV7PromptWithCaching,
  getOptimizedSchema,
  sanitizeForClient,
  extractAnalysisData
};
