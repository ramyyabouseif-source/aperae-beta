const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const crypto = require('crypto');

/**
 * Authentication service for Aperae backend
 * Handles JWT token generation, password hashing, and password validation
 * @class AuthService
 */
class AuthService {
  constructor() {
    // Enforce environment variables for security
    this.jwtSecret = process.env.JWT_SECRET;
    this.refreshSecret = process.env.REFRESH_SECRET;
    
    // Fail startup if secrets are not provided
    if (!this.jwtSecret || this.jwtSecret === 'your-super-secret-jwt-key-change-in-production') {
      throw new Error('JWT_SECRET environment variable must be set with a secure random string');
    }
    
    if (!this.refreshSecret || this.refreshSecret === 'your-refresh-secret-key-change-in-production') {
      throw new Error('REFRESH_SECRET environment variable must be set with a secure random string');
    }
    
    // Validate secret strength
    if (this.jwtSecret.length < 32) {
      throw new Error('JWT_SECRET must be at least 32 characters long');
    }
    
    if (this.refreshSecret.length < 32) {
      throw new Error('REFRESH_SECRET must be at least 32 characters long');
    }
    
    this.tokenExpiry = '15m'; // 15 minutes
    this.refreshExpiry = '7d'; // 7 days
  }

  /**
   * Generate a JWT access token for a user
   * @param {string} userId - Unique user identifier
   * @param {string} [userRole='user'] - User role (e.g., 'user', 'admin')
   * @param {string} [userEmail=''] - User email address
   * @returns {string} JWT access token (valid for 15 minutes)
   */
  generateAccessToken(userId, userRole = 'user', userEmail = '') {
    const payload = {
      userId,
      email: userEmail,
      role: userRole,
      type: 'access',
      iat: Math.floor(Date.now() / 1000),
      exp: Math.floor(Date.now() / 1000) + (15 * 60) // 15 minutes
    };
    
    return jwt.sign(payload, this.jwtSecret);
  }

  /**
   * Generate a JWT refresh token for a user
   * @param {string} userId - Unique user identifier
   * @returns {string} JWT refresh token (valid for 7 days)
   */
  generateRefreshToken(userId) {
    const payload = {
      userId,
      type: 'refresh',
      iat: Math.floor(Date.now() / 1000),
      exp: Math.floor(Date.now() / 1000) + (7 * 24 * 60 * 60) // 7 days
    };
    
    return jwt.sign(payload, this.refreshSecret);
  }

  /**
   * Verify and decode a JWT access token
   * @param {string} token - JWT access token to verify
   * @returns {object} Decoded token payload containing userId, email, role, type, iat, exp
   * @throws {Error} If token is invalid, expired, or wrong type
   */
  verifyAccessToken(token) {
    try {
      const decoded = jwt.verify(token, this.jwtSecret);
      if (decoded.type !== 'access') {
        throw new Error('Invalid token type');
      }
      return decoded;
    } catch (error) {
      throw new Error('Invalid or expired access token');
    }
  }

  /**
   * Verify and decode a JWT refresh token
   * @param {string} token - JWT refresh token to verify
   * @returns {object} Decoded token payload containing userId, type, iat, exp
   * @throws {Error} If token is invalid, expired, or wrong type
   */
  verifyRefreshToken(token) {
    try {
      const decoded = jwt.verify(token, this.refreshSecret);
      if (decoded.type !== 'refresh') {
        throw new Error('Invalid token type');
      }
      return decoded;
    } catch (error) {
      throw new Error('Invalid or expired refresh token');
    }
  }

  /**
   * Hash a password using bcrypt with 12 salt rounds
   * @param {string} password - Plain text password to hash
   * @returns {Promise<string>} Hashed password string
   */
  async hashPassword(password) {
    const saltRounds = 12;
    return await bcrypt.hash(password, saltRounds);
  }

  /**
   * Verify a password against a hashed password
   * @param {string} password - Plain text password to verify
   * @param {string} hashedPassword - Hashed password to compare against
   * @returns {Promise<boolean>} True if password matches, false otherwise
   */
  async verifyPassword(password, hashedPassword) {
    return await bcrypt.compare(password, hashedPassword);
  }

  // Generate secure random strings
  generateSecureRandom(length = 32) {
    return crypto.randomBytes(length).toString('hex');
  }

  // Generate password reset token
  generatePasswordResetToken() {
    return crypto.randomBytes(32).toString('hex');
  }

  /**
   * Validate password strength according to security requirements
   * @param {string} password - Password to validate
   * @returns {object} Validation result with isValid flag and array of error messages
   * @returns {boolean} returns.isValid - True if password meets all requirements
   * @returns {string[]} returns.errors - Array of error messages for failed validations
   */
  validatePasswordStrength(password) {
    const minLength = 8;
    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumbers = /\d/.test(password);
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);

    const errors = [];
    
    if (password.length < minLength) {
      errors.push(`Password must be at least ${minLength} characters long`);
    }
    if (!hasUpperCase) {
      errors.push('Password must contain at least one uppercase letter');
    }
    if (!hasLowerCase) {
      errors.push('Password must contain at least one lowercase letter');
    }
    if (!hasNumbers) {
      errors.push('Password must contain at least one number');
    }
    if (!hasSpecialChar) {
      errors.push('Password must contain at least one special character');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  // Generate email verification token
  generateEmailVerificationToken() {
    return crypto.randomBytes(32).toString('hex');
  }
}

module.exports = new AuthService();