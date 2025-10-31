const crypto = require('crypto');

/**
 * Security validation utilities for PocketSomm backend
 */
class SecurityValidator {
  /**
   * Validates environment variables for security
   * @throws {Error} If any required security variables are missing or weak
   */
  static validateEnvironment() {
    const errors = [];
    
    // Check JWT secrets
    if (!process.env.JWT_SECRET) {
      errors.push('JWT_SECRET environment variable is required');
    } else if (process.env.JWT_SECRET.length < 32) {
      errors.push('JWT_SECRET must be at least 32 characters long');
    } else if (process.env.JWT_SECRET === 'your-super-secret-jwt-key-change-in-production') {
      errors.push('JWT_SECRET must be changed from default value');
    }
    
    if (!process.env.REFRESH_SECRET) {
      errors.push('REFRESH_SECRET environment variable is required');
    } else if (process.env.REFRESH_SECRET.length < 32) {
      errors.push('REFRESH_SECRET must be at least 32 characters long');
    } else if (process.env.REFRESH_SECRET === 'your-refresh-secret-key-change-in-production') {
      errors.push('REFRESH_SECRET must be changed from default value');
    }
    
    // Check for common weak secrets
    const weakSecrets = ['secret', 'password', '123456', 'admin', 'test'];
    if (weakSecrets.some(weak => process.env.JWT_SECRET?.toLowerCase().includes(weak))) {
      errors.push('JWT_SECRET contains weak patterns - use a cryptographically secure random string');
    }
    
    if (weakSecrets.some(weak => process.env.REFRESH_SECRET?.toLowerCase().includes(weak))) {
      errors.push('REFRESH_SECRET contains weak patterns - use a cryptographically secure random string');
    }
    
    if (errors.length > 0) {
      throw new Error(`Security validation failed:\n${errors.join('\n')}`);
    }
  }
  
  /**
   * Generates a cryptographically secure random string
   * @param {number} length - Length of the string to generate
   * @returns {string} Secure random string
   */
  static generateSecureSecret(length = 32) {
    return crypto.randomBytes(length).toString('base64');
  }
  
  /**
   * Validates that secrets are different from each other
   * @param {string} secret1 - First secret
   * @param {string} secret2 - Second secret
   * @returns {boolean} True if secrets are different
   */
  static validateSecretUniqueness(secret1, secret2) {
    return secret1 !== secret2;
  }
  
  /**
   * Checks if running in production with secure settings
   * @returns {boolean} True if production environment is secure
   */
  static validateProductionSecurity() {
    if (process.env.NODE_ENV === 'production') {
      const warnings = [];
      
      // Check HTTPS in production
      if (!process.env.HTTPS_ENABLED || process.env.HTTPS_ENABLED !== 'true') {
        warnings.push('HTTPS should be enabled in production');
      }
      
      // Check CORS settings
      if (process.env.CORS_ORIGIN === '*' || !process.env.CORS_ORIGIN) {
        warnings.push('CORS_ORIGIN should be restricted in production');
      }
      
      if (warnings.length > 0) {
        console.warn('Production security warnings:', warnings);
        return false;
      }
    }
    
    return true;
  }
}

module.exports = SecurityValidator;




