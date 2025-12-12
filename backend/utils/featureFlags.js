const logger = require('../logger');

/**
 * Feature flag utility for enabling/disabling features via environment variables
 * 
 * @param {string} flagName - The name of the feature flag (e.g., 'ENABLE_ENHANCED_PROMPT')
 * @returns {boolean} - true if feature is enabled, false otherwise
 * 
 * @example
 * const { isFeatureEnabled } = require('./utils/featureFlags');
 * if (isFeatureEnabled('ENABLE_ENHANCED_PROMPT')) {
 *   // Use enhanced prompt
 * }
 */
function isFeatureEnabled(flagName) {
  const envKey = flagName.toUpperCase().replace(/-/g, '_');
  const value = process.env[envKey];
  
  // Default to false for safety
  if (value === undefined) {
    return false;
  }
  
  // Accept 'true', '1', 'yes' as enabled
  const enabled = value.toLowerCase() === 'true' || 
                  value === '1' || 
                  value.toLowerCase() === 'yes';
  
  logger.debug('Feature flag check', { flag: flagName, enabled, envKey });
  return enabled;
}

module.exports = { isFeatureEnabled };

