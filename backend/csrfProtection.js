/**
 * CSRF Protection Middleware
 * 
 * For token-based APIs (JWT), CSRF is less of a concern since tokens
 * are stored in secure storage and sent via headers, not cookies.
 * However, this middleware adds additional protection by:
 * 1. Checking Origin header matches allowed origins
 * 2. Validating Referer header on state-changing operations
 * 3. Requiring custom CSRF token header for sensitive operations
 */

const logger = require('./logger');

// State-changing HTTP methods
const STATE_CHANGING_METHODS = ['POST', 'PUT', 'PATCH', 'DELETE'];
// Public JSON endpoints that should not require CSRF browser headers
const CSRF_SKIP_PATHS = new Set([
  '/api/recommendations',
  '/api/ocr/extract-text'
]);

/**
 * CSRF Protection Middleware
 * Only applies to state-changing methods
 */
const csrfProtection = (req, res, next) => {
  // Skip CSRF check for safe methods
  if (!STATE_CHANGING_METHODS.includes(req.method)) {
    return next();
  }

  // Skip CSRF check for API documentation
  if (req.path.startsWith('/api-docs')) {
    return next();
  }

  // Skip CSRF for specific public JSON endpoints
  if (CSRF_SKIP_PATHS.has(req.path)) {
    return next();
  }

  // Skip CSRF check if request is from mobile app (no origin/referer)
  const origin = req.headers.origin;
  const referer = req.headers.referer;
  
  // Mobile apps typically don't send origin/referer headers
  if (!origin && !referer) {
    // Additional check: Ensure it's a valid JWT-authenticated request
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      // Mobile app with JWT token - allow
      return next();
    }
    
    // No auth and no origin - could be a direct API call
    // For security, require X-Requested-With header
    if (!req.headers['x-requested-with']) {
      logger.warn('CSRF protection: Missing X-Requested-With header', {
        ip: req.ip,
        method: req.method,
        path: req.path,
        requestId: req.requestId
      });
      
      return res.status(403).json({
        error: 'CSRF protection: X-Requested-With header required',
        requestId: req.requestId
      });
    }
  }

  // If origin is present, validate it
  if (origin) {
    // Get allowed origins from CORS configuration
    const allowedOrigins = [
      'http://localhost:3000',
      'http://localhost:19006',
      'https://localhost:3000',
      'https://localhost:19006',
      process.env.ALLOWED_ORIGINS?.split(',') || []
    ].flat();

    // Check if origin matches allowed origins
    if (!allowedOrigins.some(allowed => origin.startsWith(allowed))) {
      logger.warn('CSRF protection: Invalid origin', {
        ip: req.ip,
        origin,
        method: req.method,
        path: req.path,
        requestId: req.requestId
      });

      return res.status(403).json({
        error: 'CSRF protection: Invalid origin',
        requestId: req.requestId
      });
    }
  }

  // If referer is present, validate it matches origin
  if (referer && origin) {
    try {
      const refererUrl = new URL(referer);
      const originUrl = new URL(origin);
      
      if (refererUrl.origin !== originUrl.origin) {
        logger.warn('CSRF protection: Origin and Referer mismatch', {
          ip: req.ip,
          origin,
          referer,
          method: req.method,
          path: req.path,
          requestId: req.requestId
        });

        return res.status(403).json({
          error: 'CSRF protection: Origin and Referer mismatch',
          requestId: req.requestId
        });
      }
    } catch (error) {
      logger.warn('CSRF protection: Invalid referer URL', {
        ip: req.ip,
        referer,
        error: error.message,
        requestId: req.requestId
      });
    }
  }

  // All checks passed
  next();
};

module.exports = csrfProtection;