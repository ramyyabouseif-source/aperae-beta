const { isFeatureEnabled } = require('./featureFlags');
const { normalizeResponse } = require('./responseNormalizer');
const mockDataLegacy = require('../mockData.json');
const mockDataEnhanced = require('../mockDataEnhanced.json');
const logger = require('../logger');

/**
 * Gets fallback mock response based on feature flag and dish
 * @param {string} dish - The dish name to match
 * @param {string} requestId - Request ID for logging
 * @returns {object} Normalized mock response
 */
function getFallbackResponse(dish, requestId) {
  const useEnhancedPrompt = isFeatureEnabled('ENABLE_ENHANCED_PROMPT');
  const mockData = useEnhancedPrompt ? mockDataEnhanced : mockDataLegacy;
  
  logger.warn('Using fallback mock data', { 
    requestId, 
    dish, 
    promptVersion: useEnhancedPrompt ? 'enhanced' : 'legacy' 
  });
  
  // Try to find matching dish, otherwise use first entry
  let mockResponse = mockData.find(item => 
    item.dish && (
      item.dish.toLowerCase().includes(dish.toLowerCase()) ||
      dish.toLowerCase().includes(item.dish.toLowerCase())
    )
  );
  
  if (!mockResponse) {
    mockResponse = mockData[0];
    logger.debug('No matching dish found, using first mock entry', { requestId });
  }
  
  // Normalize to ensure consistent format
  try {
    const normalized = normalizeResponse(mockResponse);
    logger.debug('Fallback response normalized successfully', { requestId });
    return normalized;
  } catch (normalizeError) {
    logger.error('Failed to normalize fallback response, using original', {
      requestId,
      error: normalizeError.message
    });
    return mockResponse; // Return original if normalization fails
  }
}

module.exports = { getFallbackResponse };









