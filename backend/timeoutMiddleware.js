const logger = require('./logger');

/**
 * Request timeout middleware
 * Automatically cancels requests that exceed the configured timeout duration
 */
class TimeoutMiddleware {
  /**
   * Creates a timeout middleware function
   * @param {number} timeoutMs - Timeout duration in milliseconds (default: 30000 = 30 seconds)
   * @returns {Function} Express middleware function
   */
  static create(timeoutMs = 30000) {
    return (req, res, next) => {
      // Set timeout for the request
      req.setTimeout(timeoutMs, () => {
        if (!res.headersSent) {
          logger.warn('Request timeout', {
            method: req.method,
            url: req.url,
            requestId: req.requestId,
            timeout: timeoutMs
          });
          
          res.status(408).json({
            error: 'Request timeout',
            message: `Request exceeded the maximum time limit of ${timeoutMs}ms`,
            requestId: req.requestId
          });
        }
      });
      
      next();
    };
  }

  /**
   * Get timeout configuration from environment or use defaults
   * @returns {number} Timeout in milliseconds
   */
  static getTimeout() {
    const parse = (v, d) => {
      const n = parseInt(v, 10);
      return Number.isFinite(n) && n > 0 ? n : d;
    };
    return {
      // CRITICAL-5: Set to 85s (5s buffer before Render's 90s limit)
      recommendations: parse(process.env.API_TIMEOUT_RECOMMENDATIONS_MS, 85000),
      ocr: parse(process.env.API_TIMEOUT_OCR_MS, 30000),
      auth: parse(process.env.API_TIMEOUT_AUTH_MS, 10000),
      default: parse(process.env.API_TIMEOUT_DEFAULT_MS, 30000)
    };
  }
}

module.exports = TimeoutMiddleware;
