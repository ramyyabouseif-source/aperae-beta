const authService = require('./authService');

// Middleware to authenticate JWT tokens
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

  if (!token) {
    return res.status(401).json({ 
      error: 'Access token required',
      code: 'NO_TOKEN',
      requestId: req.requestId 
    });
  }

  try {
    const decoded = authService.verifyAccessToken(token);
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(403).json({ 
      error: 'Invalid or expired token',
      code: 'INVALID_TOKEN',
      requestId: req.requestId 
    });
  }
};

// Middleware to require specific roles
const requireRole = (roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ 
        error: 'Authentication required',
        code: 'AUTH_REQUIRED',
        requestId: req.requestId 
      });
    }

    const userRole = req.user.role;
    const allowedRoles = Array.isArray(roles) ? roles : [roles];
    
    if (!allowedRoles.includes(userRole)) {
      return res.status(403).json({ 
        error: 'Insufficient permissions',
        code: 'INSUFFICIENT_PERMISSIONS',
        requestId: req.requestId 
      });
    }
    
    next();
  };
};

// Optional authentication - adds user info if token is valid
const optionalAuth = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (token) {
    try {
      const decoded = authService.verifyAccessToken(token);
      req.user = decoded;
    } catch (error) {
      // Token is invalid, but we'll continue without auth
      req.user = null;
    }
  } else {
    req.user = null;
  }

  next();
};

// Rate limiting based on user authentication
const authRateLimit = (req, res, next) => {
  // If user is authenticated, use user-specific rate limiting
  if (req.user) {
    req.rateLimitKey = `user:${req.user.userId}`;
  } else {
    req.rateLimitKey = `ip:${req.ip}`;
  }
  next();
};

module.exports = {
  authenticateToken,
  requireRole,
  optionalAuth,
  authRateLimit
};