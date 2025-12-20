/**
 * Log Redaction Utility
 * 
 * Redacts sensitive information from logs to prevent accidental exposure
 * of passwords, tokens, API keys, and other sensitive data.
 */

/**
 * List of keys that should be redacted from log metadata
 */
const SENSITIVE_KEYS = [
  'password',
  'passwordHash',
  'token',
  'accessToken',
  'refreshToken',
  'apiKey',
  'apikey',
  'api_key',
  'secret',
  'authorization',
  'auth',
  'cookie',
  'cookies',
  'headers',
  'authorization',
  'x-api-key',
  'x-auth-token',
  'privateKey',
  'private_key',
  'jwt',
  'jwt_secret',
  'jwtSecret',
  'refresh_secret',
  'refreshSecret',
  'emailVerificationToken',
  'email_verification_token',
  'resetToken',
  'reset_token',
  'sessionId',
  'session_id',
  'creditCard',
  'credit_card',
  'cvv',
  'ssn',
  'socialSecurityNumber',
];

/**
 * Patterns to detect and redact sensitive data in strings
 */
const SENSITIVE_PATTERNS = [
  /sk-ant-[a-zA-Z0-9-_]{50,}/g, // Anthropic API keys
  /sk-[a-zA-Z0-9-_]{32,}/g, // Generic API keys
  /Bearer\s+[a-zA-Z0-9._-]+/gi, // Bearer tokens
  /eyJ[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+/g, // JWT tokens
  /\b[A-Za-z0-9+/]{32,}={0,2}\b/g, // Base64-like tokens
];

/**
 * Redact sensitive data from an object recursively
 * @param {any} data - Data to redact (object, array, or primitive)
 * @param {string} path - Current path in the object (for debugging)
 * @returns {any} Redacted data
 */
function redactSensitiveData(data, path = '') {
  // Handle null/undefined
  if (data === null || data === undefined) {
    return data;
  }

  // Handle strings - check for sensitive patterns
  if (typeof data === 'string') {
    let redacted = data;
    
    // Check for sensitive patterns
    for (const pattern of SENSITIVE_PATTERNS) {
      if (pattern.test(redacted)) {
        redacted = redacted.replace(pattern, '[REDACTED]');
      }
    }
    
    // If string looks like a token/key, redact it
    if (redacted.length > 32 && /^[A-Za-z0-9+/=_-]+$/.test(redacted)) {
      return '[REDACTED]';
    }
    
    return redacted;
  }

  // Handle arrays
  if (Array.isArray(data)) {
    return data.map((item, index) => 
      redactSensitiveData(item, `${path}[${index}]`)
    );
  }

  // Handle objects
  if (typeof data === 'object') {
    const redacted = {};
    
    for (const key in data) {
      const currentPath = path ? `${path}.${key}` : key;
      const lowerKey = key.toLowerCase();
      
      // Check if key is in sensitive list (case-insensitive)
      const isSensitive = SENSITIVE_KEYS.some(
        sensitiveKey => lowerKey.includes(sensitiveKey.toLowerCase())
      );
      
      if (isSensitive) {
        redacted[key] = '[REDACTED]';
      } else {
        redacted[key] = redactSensitiveData(data[key], currentPath);
      }
    }
    
    return redacted;
  }

  // Return primitives as-is
  return data;
}

/**
 * Redact sensitive data from error objects
 * @param {Error} error - Error object to redact
 * @returns {object} Redacted error object
 */
function redactError(error) {
  if (!error) return error;
  
  const redacted = {
    name: error.name,
    message: error.message,
  };
  
  // Redact stack trace (may contain sensitive paths)
  if (error.stack) {
    // Keep structure but redact any potential sensitive paths
    redacted.stack = error.stack
      .split('\n')
      .slice(0, 5) // Limit stack trace depth
      .join('\n');
  }
  
  // Redact any additional properties
  for (const key in error) {
    if (!['name', 'message', 'stack'].includes(key)) {
      redacted[key] = redactSensitiveData(error[key]);
    }
  }
  
  return redacted;
}

/**
 * Create a safe version of request metadata for logging
 * @param {object} req - Express request object
 * @returns {object} Safe request metadata
 */
function safeRequestMetadata(req) {
  if (!req) return {};
  
  return {
    method: req.method,
    path: req.path,
    query: redactSensitiveData(req.query),
    params: redactSensitiveData(req.params),
    ip: req.ip || req.connection?.remoteAddress,
    userAgent: req.get('user-agent'),
    // Explicitly exclude sensitive headers
    headers: {
      'content-type': req.get('content-type'),
      'accept': req.get('accept'),
      'content-length': req.get('content-length'),
      // DO NOT include authorization, cookies, or API keys
    },
  };
}

module.exports = {
  redactSensitiveData,
  redactError,
  safeRequestMetadata,
  SENSITIVE_KEYS,
  SENSITIVE_PATTERNS,
};



