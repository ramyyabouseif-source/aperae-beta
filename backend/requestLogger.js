const logger = require('./logger');

/**
 * Request logging utility to standardize logging across endpoints
 * Provides consistent formatting and log levels
 */
class RequestLogger {
  /**
   * Log the start of a request
   * @param {string} endpoint - The endpoint name (e.g., 'register', 'login', 'recommendations')
   * @param {string} requestId - Unique request identifier
   * @param {object} metadata - Additional metadata to log (sanitized - no sensitive data)
   */
  static logRequestStart(endpoint, requestId, metadata = {}) {
    logger.info(`[${endpoint}] Request started`, {
      requestId,
      ...this.sanitizeMetadata(metadata),
      timestamp: new Date().toISOString()
    });
  }

  /**
   * Log successful request completion
   * @param {string} endpoint - The endpoint name
   * @param {string} requestId - Unique request identifier
   * @param {number} responseTime - Response time in milliseconds
   * @param {object} metadata - Additional metadata (sanitized)
   */
  static logRequestSuccess(endpoint, requestId, responseTime, metadata = {}) {
    logger.info(`[${endpoint}] Request successful`, {
      requestId,
      responseTime: `${responseTime}ms`,
      ...this.sanitizeMetadata(metadata),
      timestamp: new Date().toISOString()
    });
  }

  /**
   * Log request error
   * @param {string} endpoint - The endpoint name
   * @param {string} requestId - Unique request identifier
   * @param {number} responseTime - Response time in milliseconds
   * @param {Error|string} error - Error object or error message
   * @param {object} metadata - Additional metadata (sanitized)
   */
  static logRequestError(endpoint, requestId, responseTime, error, metadata = {}) {
    const errorMessage = error instanceof Error ? error.message : error;
    logger.error(`[${endpoint}] Request failed`, {
      requestId,
      responseTime: `${responseTime}ms`,
      error: errorMessage,
      ...this.sanitizeMetadata(metadata),
      timestamp: new Date().toISOString()
    });
  }

  /**
   * Track API call timing (for external API calls like uses OpenAI)
   * @param {string} service - Service name (e.g., 'openai', 'google-vision')
   * @param {string} requestId - Unique request identifier
   * @param {number} responseTime - Response time in milliseconds
   */
  static logExternalApiCall(service, requestId, responseTime) {
    logger.info(`[${service}] External API call completed`, {
      requestId,
      responseTime: `${responseTime}ms`,
      timestamp: new Date().toISOString()
    });
  }

  /**
   * Sanitize metadata to prevent logging sensitive information
   * Removes passwords, tokens, API keys, and other sensitive fields
   * @param {object} metadata - Metadata object to sanitize
   * @returns {object} Sanitized metadata
   */
  static sanitizeMetadata(metadata) {
    const sensitiveKeys = [
      'password',
      'passwordHash',
      'token',
      'accessToken',
      'refreshToken',
      'apiKey',
      'secret',
      'authorization',
      'cookie',
      'headers'
    ];

    const sanitized = { ...metadata };
    
    for (const key of sensitiveKeys) {
      if (sanitized[key]) {
        sanitized[key] = '[REDACTED]';
      }
    }

    // Sanitize nested objects
    for (const key in sanitized) {
      if (typeof sanitized[key] === 'object' && sanitized[key] !== null) {
        sanitized[key] = this.sanitizeMetadata(sanitized[key]);
      }
    }

    return sanitized;
  }

  /**
   * Hash or redact user IDs for logging
   * @param {string} userId - User ID to hash
   * @returns {string} Hashed user ID or placeholder
   */
  static hashUserId(userId) {
    if (!userId) return '[NO_USER_ID]';
    // Simple hash for logging - not cryptographically secure, just for obfuscation
    const crypto = require('crypto');
    return crypto.createHash('sha256').update(userId).digest('hex').substring(0, 8);
  }
}

module.exports = RequestLogger;

