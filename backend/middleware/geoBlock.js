/**
 * Geo-Blocking Middleware
 * Blocks access from EU/EEA countries to avoid GDPR obligations
 * 
 * This middleware checks the client's IP address and blocks requests
 * from European Union (EU) and European Economic Area (EEA) countries.
 * 
 * Location: After CORS, before rate limiting
 * Purpose: Prevent EU users from accessing the service (GDPR avoidance)
 */

const geoip = require('geoip-lite');
const logger = require('../logger');

// EU/EEA country codes (ISO 3166-1 alpha-2)
const EU_EEA_COUNTRIES = new Set([
  // EU Member States (27 countries as of 2025)
  'AT', // Austria
  'BE', // Belgium
  'BG', // Bulgaria
  'HR', // Croatia
  'CY', // Cyprus
  'CZ', // Czech Republic
  'DK', // Denmark
  'EE', // Estonia
  'FI', // Finland
  'FR', // France
  'DE', // Germany
  'GR', // Greece
  'HU', // Hungary
  'IE', // Ireland
  'IT', // Italy
  'LV', // Latvia
  'LT', // Lithuania
  'LU', // Luxembourg
  'MT', // Malta
  'NL', // Netherlands
  'PL', // Poland
  'PT', // Portugal
  'RO', // Romania
  'SK', // Slovakia
  'SI', // Slovenia
  'ES', // Spain
  'SE', // Sweden
  // EEA but not EU
  'IS', // Iceland
  'LI', // Liechtenstein
  'NO', // Norway
  // Switzerland (not EU/EEA but EFTA, block to be safe)
  'CH', // Switzerland
  // UK (post-Brexit, but block to be safe)
  'GB', // United Kingdom
]);

/**
 * Get client IP address from request
 * Handles various proxy configurations
 */
function getClientIp(req) {
  // Try X-Forwarded-For header (most proxies)
  const xForwardedFor = req.headers['x-forwarded-for'];
  if (xForwardedFor) {
    // X-Forwarded-For can contain multiple IPs, take the first one
    const ips = xForwardedFor.split(',').map(ip => ip.trim());
    if (ips.length > 0) {
      return ips[0];
    }
  }

  // Try X-Real-IP header (nginx proxy)
  if (req.headers['x-real-ip']) {
    return req.headers['x-real-ip'];
  }

  // Fall back to Express's req.ip (requires trust proxy)
  if (req.ip) {
    return req.ip;
  }

  // Last resort: connection remote address
  if (req.connection && req.connection.remoteAddress) {
    return req.connection.remoteAddress;
  }

  return null;
}

/**
 * Geo-blocking middleware
 * Blocks requests from EU/EEA countries
 */
const geoBlockMiddleware = (req, res, next) => {
  // Skip geo-blocking for health check endpoint (needed for monitoring)
  if (req.path === '/api/health' || req.path === '/health') {
    return next();
  }

  // Get client IP address
  const clientIp = getClientIp(req);

  // If no IP found, log warning but allow (better to allow than block incorrectly)
  if (!clientIp) {
    logger.warn('Geo-blocking: Could not determine client IP', {
      requestId: req.requestId,
      path: req.path,
      headers: {
        'x-forwarded-for': req.headers['x-forwarded-for'],
        'x-real-ip': req.headers['x-real-ip'],
        'user-agent': req.headers['user-agent'],
      }
    });
    return next();
  }

  // Allow localhost/private IPs (development)
  if (clientIp === '::1' || 
      clientIp === '127.0.0.1' || 
      clientIp === 'localhost' ||
      clientIp.startsWith('192.168.') ||
      clientIp.startsWith('10.') ||
      clientIp.startsWith('172.16.') ||
      clientIp.startsWith('172.17.') ||
      clientIp.startsWith('172.18.') ||
      clientIp.startsWith('172.19.') ||
      clientIp.startsWith('172.20.') ||
      clientIp.startsWith('172.21.') ||
      clientIp.startsWith('172.22.') ||
      clientIp.startsWith('172.23.') ||
      clientIp.startsWith('172.24.') ||
      clientIp.startsWith('172.25.') ||
      clientIp.startsWith('172.26.') ||
      clientIp.startsWith('172.27.') ||
      clientIp.startsWith('172.28.') ||
      clientIp.startsWith('172.29.') ||
      clientIp.startsWith('172.30.') ||
      clientIp.startsWith('172.31.') ||
      clientIp.startsWith('::ffff:127.') ||
      clientIp.startsWith('::ffff:192.168.') ||
      clientIp.startsWith('::ffff:10.')) {
    logger.debug('Geo-blocking: Allowing localhost/private IP', {
      requestId: req.requestId,
      ip: clientIp,
      path: req.path
    });
    return next();
  }

  // Get country from IP using geoip-lite
  let geo;
  try {
    geo = geoip.lookup(clientIp);
  } catch (error) {
    logger.warn('Geo-blocking: Error looking up IP', {
      requestId: req.requestId,
      ip: clientIp,
      error: error.message,
      path: req.path
    });
    // On error, allow request (better to allow than block incorrectly)
    return next();
  }

  // If country lookup failed, log warning but allow
  if (!geo || !geo.country) {
    logger.warn('Geo-blocking: Could not determine country for IP', {
      requestId: req.requestId,
      ip: clientIp,
      path: req.path
    });
    return next();
  }

  // Check if country is in EU/EEA blocklist
  if (EU_EEA_COUNTRIES.has(geo.country)) {
    logger.info('Geo-blocking: Blocked request from EU/EEA country', {
      requestId: req.requestId,
      ip: clientIp,
      country: geo.country,
      countryName: geo.country_name || 'Unknown',
      path: req.path,
      method: req.method
    });

    return res.status(403).json({
      error: 'Service not available in your region',
      message: 'Aperae is currently available in the United States only. Access from EU/EEA countries is blocked.',
      code: 'GEO_BLOCKED',
      country: geo.country,
      countryName: geo.country_name || 'Unknown',
      requestId: req.requestId
    });
  }

  // Not EU/EEA - allow request
  logger.debug('Geo-blocking: Allowing request', {
    requestId: req.requestId,
    ip: clientIp,
    country: geo.country,
    countryName: geo.country_name || 'Unknown',
    path: req.path
  });

  next();
};

module.exports = geoBlockMiddleware;

