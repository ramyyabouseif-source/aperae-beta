const { normalizeResponse } = require('./responseNormalizer');
const mockDataEnhanced = require('../mockDataEnhanced.json'); // V7.0 compatible mock data
const logger = require('../logger');

/**
 * Gets fallback mock response based on feature flag and dish
 * @param {string} dish - The dish name to match
 * @param {string} requestId - Request ID for logging
 * @returns {object} Normalized mock response
 */
function getFallbackResponse(dish, requestId) {
  // V7.0 is now the standard - use V7.0 compatible mock data
  const mockData = mockDataEnhanced;
  
  logger.warn('Using fallback mock data (V7.0)', { 
    requestId, 
    dish, 
    promptVersion: 'v7.0' 
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












