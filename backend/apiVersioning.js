/**
 * API Version Router
 * Handles API versioning and route organization
 * Provides backward compatibility while enabling future version migration
 */

/**
 * Create versioned API routes
 * @param {express.Application} app - Express application instance
 * @param {Function} routeHandler - Route handler function
 * @param {string} [version='v1'] - API version (default: v1)
 */
function createVersionedRoute(app, routeHandler, version = 'v1') {
  const versionedPath = `/api/${version}`;
  const legacyPath = '/api'; // Maintain backward compatibility
  
  // Apply route handler to both versioned and legacy paths
  if (typeof routeHandler === 'function') {
    routeHandler(versionedPath);
    routeHandler(legacyPath); // Legacy support
  }
}

/**
 * Version-aware middleware that adds version info to requests
 */
function versionMiddleware(req, res, next) {
  // Extract version from path (e.g., /api/v1/recommendations -> v1)
  const versionMatch = req.path.match(/^\/api\/(v\d+)\//);
  if (versionMatch) {
    req.apiVersion = versionMatch[1];
  } else {
    req.apiVersion = 'v1'; // Default to v1 for legacy routes
  }
  
  res.setHeader('X-API-Version', req.apiVersion);
  next();
}

module.exports = {
  createVersionedRoute,
  versionMiddleware
};

