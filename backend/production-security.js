// Production Security Configuration
// This file contains security measures for production deployment

const productionSecurity = {
  // Network Security
  network: {
    // Only listen on localhost in production (behind reverse proxy)
    listenAddress: process.env.NODE_ENV === 'production' ? '127.0.0.1' : '0.0.0.0',
    
    // Trust proxy headers (for reverse proxy setups)
    trustProxy: process.env.NODE_ENV === 'production',
    
    // HTTPS enforcement
    forceHTTPS: process.env.NODE_ENV === 'production',
  },

  // CORS Configuration
  cors: {
    // Production: Only allow specific domains
    allowedOrigins: process.env.NODE_ENV === 'production' 
      ? [
          'https://yourdomain.com',
          'https://www.yourdomain.com',
          'https://app.yourdomain.com'
        ]
      : [
          'http://localhost:3000',
          'http://localhost:19006',
          'https://localhost:3000',
          'https://localhost:19006',
          'exp://127.0.0.1:8081',
          'exp://192.168.1.152:8081'
        ],
    
    // Production: Stricter CORS
    credentials: process.env.NODE_ENV === 'production',
  },

  // Rate Limiting
  rateLimiting: {
    // Production: Stricter limits
    general: {
      windowMs: 15 * 60 * 1000, // 15 minutes
      max: process.env.NODE_ENV === 'production' ? 50 : 100, // Fewer requests in production
    },
    
    recommendations: {
      windowMs: 15 * 60 * 1000, // 15 minutes
      max: process.env.NODE_ENV === 'production' ? 5 : 10, // Much stricter for AI calls
    },
    
    auth: {
      windowMs: 15 * 60 * 1000, // 15 minutes
      max: process.env.NODE_ENV === 'production' ? 5 : 20, // Stricter for auth
    }
  },

  // API Authentication
  authentication: {
    // Production: Require API keys for all endpoints
    requireApiKey: process.env.NODE_ENV === 'production',
    
    // API Key validation
    validateApiKey: (req, res, next) => {
      if (process.env.NODE_ENV !== 'production') {
        return next(); // Skip in development
      }
      
      const apiKey = req.headers['x-api-key'];
      const validApiKeys = process.env.API_KEYS?.split(',') || [];
      
      if (!apiKey || !validApiKeys.includes(apiKey)) {
        return res.status(401).json({ 
          error: 'Valid API key required',
          requestId: req.requestId 
        });
      }
      
      next();
    }
  },

  // Security Headers
  securityHeaders: {
    // Production: Stricter CSP
    contentSecurityPolicy: process.env.NODE_ENV === 'production' 
      ? {
          directives: {
            defaultSrc: ["'self'"],
            styleSrc: ["'self'"],
            scriptSrc: ["'self'"],
            imgSrc: ["'self'", "data:"],
            connectSrc: ["'self'", "https://api.openai.com"],
            fontSrc: ["'self'"],
            objectSrc: ["'none'"],
            mediaSrc: ["'self'"],
            frameSrc: ["'none'"],
          },
        }
      : {
          directives: {
            defaultSrc: ["'self'"],
            styleSrc: ["'self'", "'unsafe-inline'"],
            scriptSrc: ["'self'"],
            imgSrc: ["'self'", "data:", "https:"],
            connectSrc: ["'self'", "https://api.openai.com"],
          },
        },
    
    // Production: Stricter HSTS
    hsts: {
      maxAge: process.env.NODE_ENV === 'production' ? 31536000 : 0, // 1 year in production
      includeSubDomains: process.env.NODE_ENV === 'production',
      preload: process.env.NODE_ENV === 'production'
    }
  },

  // Monitoring & Alerting
  monitoring: {
    // Production: Enable detailed monitoring
    enableDetailedLogging: process.env.NODE_ENV === 'production',
    
    // Alert on suspicious activity
    alertThresholds: {
      errorRate: 0.05, // 5% error rate
      responseTime: 5000, // 5 second response time
      requestVolume: 1000, // 1000 requests per hour
    },
    
    // Security event logging
    logSecurityEvents: process.env.NODE_ENV === 'production',
  },

  // Environment Variables Validation
  requiredEnvVars: {
    production: [
      'OPENAI_API_KEY',
      'JWT_SECRET',
      'REFRESH_SECRET',
      'API_KEYS', // Comma-separated list of valid API keys
      'DATABASE_URL',
      'REDIS_URL',
      'NODE_ENV'
    ],
    development: [
      'OPENAI_API_KEY',
      'JWT_SECRET',
      'REFRESH_SECRET',
      'NODE_ENV'
    ]
  }
};

module.exports = productionSecurity;




