const authService = require('./authService');
const prisma = require('./prisma/client');
const crypto = require('crypto');
const logger = require('./logger');

/**
 * User service for PocketSomm backend
 * Handles user registration, authentication, session management, and user data operations
 * @class UserService
 * @note Uses database storage for sessions (persistent across server restarts)
 */
class UserService {
  /**
   * Hash a refresh token for secure storage
   * @param {string} token - Refresh token to hash
   * @returns {string} Hashed token
   * @private
   */
  _hashRefreshToken(token) {
    return crypto.createHash('sha256').update(token).digest('hex');
  }

  /**
   * Get device information from request headers
   * @param {object} req - Express request object (optional)
   * @returns {string} Device identifier
   * @private
   */
  _getDeviceInfo(req = null) {
    if (!req) return 'unknown';
    const userAgent = req.headers['user-agent'] || 'unknown';
    // Extract basic device info (simplified)
    if (userAgent.includes('Mobile')) return 'mobile';
    if (userAgent.includes('Tablet')) return 'tablet';
    return 'desktop';
  }

  /**
   * Get IP address from request
   * @param {object} req - Express request object (optional)
   * @returns {string} IP address
   * @private
   */
  _getIpAddress(req = null) {
    if (!req) return null;
    return req.ip || req.connection?.remoteAddress || null;
  }

  /**
   * Calculate expiration date for refresh token (7 days from now)
   * @returns {Date} Expiration date
   * @private
   */
  _getExpirationDate() {
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7); // 7 days
    return expiresAt;
  }

  /**
   * Register a new user account
   * @param {string} email - User email address
   * @param {string} password - Plain text password (will be hashed)
   * @param {object} [userData={}] - Additional user data (firstName, lastName, preferences, etc.)
   * @param {object} [req=null] - Express request object (for device/IP tracking)
   * @returns {Promise<object>} User object and authentication tokens
   * @returns {object} returns.user - User object (without password)
   * @returns {string} returns.accessToken - JWT access token
   * @returns {string} returns.refreshToken - JWT refresh token
   * @throws {Error} If email is invalid, user already exists, or password validation fails
   */
  async registerUser(email, password, userData = {}, req = null) {
    try {
      // Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        throw new Error('Invalid email format');
      }

      // Check if user already exists in database
      const existingUser = await prisma.user.findUnique({
        where: { email: email.toLowerCase() }
      });

      if (existingUser) {
        throw new Error('User already exists');
      }

      // Validate password strength
      const passwordValidation = authService.validatePasswordStrength(password);
      if (!passwordValidation.isValid) {
        throw new Error(`Password validation failed: ${passwordValidation.errors.join(', ')}`);
      }

      // Hash password
      const hashedPassword = await authService.hashPassword(password);

      // Generate user ID
      const userId = crypto.randomUUID();

      // Create user in database
      // Note: firstName and lastName are not stored in User model
      // If needed in the future, they can be added to the schema or stored in UserPreference
      const user = await prisma.user.create({
        data: {
          id: userId,
          email: email.toLowerCase(),
          passwordHash: hashedPassword,
          role: 'user',
          isEmailVerified: false,
          emailVerificationToken: authService.generateEmailVerificationToken()
        }
      });

      // Generate tokens
      const accessToken = authService.generateAccessToken(userId, user.role, email);
      const refreshToken = authService.generateRefreshToken(userId);

      // Hash refresh token for storage
      const refreshTokenHash = this._hashRefreshToken(refreshToken);

      // Store session in database
      await prisma.session.create({
        data: {
          userId: userId,
          refreshTokenHash: refreshTokenHash,
          device: this._getDeviceInfo(req),
          ip: this._getIpAddress(req),
          expiresAt: this._getExpirationDate()
        }
      });

      logger.info('User registered successfully', { userId, email: user.email });

      // Remove password from response
      const { passwordHash: _, ...userResponse } = user;

      return {
        user: userResponse,
        accessToken,
        refreshToken
      };
    } catch (error) {
      logger.error('User registration failed', { email, error: error.message });
      throw error;
    }
  }

  /**
   * Authenticate a user and generate new tokens
   * @param {string} email - User email address
   * @param {string} password - Plain text password
   * @param {object} [req=null] - Express request object (for device/IP tracking)
   * @returns {Promise<object>} User object and authentication tokens
   * @returns {object} returns.user - User object (without password)
   * @returns {string} returns.accessToken - JWT access token
   * @returns {string} returns.refreshToken - JWT refresh token
   * @throws {Error} If email or password is incorrect
   */
  async loginUser(email, password, req = null) {
    try {
      const user = await prisma.user.findUnique({
        where: { email: email.toLowerCase() }
      });
      
      if (!user) {
        throw new Error('Invalid email or password');
      }

      const isPasswordValid = await authService.verifyPassword(password, user.passwordHash);
      if (!isPasswordValid) {
        throw new Error('Invalid email or password');
      }

      // Update last login
      await prisma.user.update({
        where: { id: user.id },
        data: { lastLogin: new Date() }
      });

      // Generate new tokens
      const accessToken = authService.generateAccessToken(user.id, user.role, user.email);
      const refreshToken = authService.generateRefreshToken(user.id);

      // Hash refresh token for storage
      const refreshTokenHash = this._hashRefreshToken(refreshToken);

      // Store session in database
      await prisma.session.create({
        data: {
          userId: user.id,
          refreshTokenHash: refreshTokenHash,
          device: this._getDeviceInfo(req),
          ip: this._getIpAddress(req),
          expiresAt: this._getExpirationDate()
        }
      });

      logger.info('User logged in successfully', { userId: user.id, email: user.email });

      // Remove password from response
      const { passwordHash: _, ...userResponse } = user;

      return {
        user: userResponse,
        accessToken,
        refreshToken
      };
    } catch (error) {
      logger.error('User login failed', { email, error: error.message });
      throw error;
    }
  }

  /**
   * Refresh an access token using a valid refresh token
   * @param {string} refreshToken - Valid refresh token
   * @returns {Promise<object>} New authentication tokens
   * @returns {string} returns.accessToken - New JWT access token
   * @returns {string} returns.refreshToken - New JWT refresh token
   * @throws {Error} If refresh token is invalid, expired, or user not found
   */
  async refreshAccessToken(refreshToken) {
    try {
      // Verify token signature and expiration
      const decoded = authService.verifyRefreshToken(refreshToken);
      
      // Hash token to look up in database
      const refreshTokenHash = this._hashRefreshToken(refreshToken);

      // Find session in database
      const session = await prisma.session.findFirst({
        where: {
          userId: decoded.userId,
          refreshTokenHash: refreshTokenHash,
          revokedAt: null, // Not revoked
          expiresAt: {
            gt: new Date() // Not expired
          }
        },
        include: {
          user: true
        }
      });

      if (!session) {
        throw new Error('Invalid refresh token');
      }

      const user = session.user;
      if (!user) {
        throw new Error('User not found');
      }

      // Generate new tokens
      const newAccessToken = authService.generateAccessToken(user.id, user.role, user.email);
      const newRefreshToken = authService.generateRefreshToken(user.id);
      const newRefreshTokenHash = this._hashRefreshToken(newRefreshToken);

      // Update session with new refresh token and last used timestamp
      await prisma.session.update({
        where: { id: session.id },
        data: {
          refreshTokenHash: newRefreshTokenHash,
          lastUsed: new Date()
        }
      });

      logger.debug('Access token refreshed', { userId: user.id });

      return {
        accessToken: newAccessToken,
        refreshToken: newRefreshToken
      };
    } catch (error) {
      logger.error('Token refresh failed', { error: error.message });
      throw error;
    }
  }

  /**
   * Logout a user by invalidating their refresh token(s)
   * @param {string} userId - Unique user identifier
   * @param {string} [refreshToken=null] - Optional: specific refresh token to revoke (if null, revokes all sessions)
   * @returns {Promise<object>} Success status
   * @returns {boolean} returns.success - Always true
   */
  async logoutUser(userId, refreshToken = null) {
    try {
      if (refreshToken) {
        // Revoke specific session
        const refreshTokenHash = this._hashRefreshToken(refreshToken);
        await prisma.session.updateMany({
          where: {
            userId: userId,
            refreshTokenHash: refreshTokenHash,
            revokedAt: null
          },
          data: {
            revokedAt: new Date()
          }
        });
        logger.info('Session revoked', { userId });
      } else {
        // Revoke all sessions for user
        await prisma.session.updateMany({
          where: {
            userId: userId,
            revokedAt: null
          },
          data: {
            revokedAt: new Date()
          }
        });
        logger.info('All sessions revoked', { userId });
      }

      return { success: true };
    } catch (error) {
      logger.error('Logout failed', { userId, error: error.message });
      throw error;
    }
  }

  /**
   * Get all active sessions for a user
   * @param {string} userId - Unique user identifier
   * @returns {Promise<Array>} Array of active session objects
   */
  async getUserSessions(userId) {
    try {
      const sessions = await prisma.session.findMany({
        where: {
          userId: userId,
          revokedAt: null,
          expiresAt: {
            gt: new Date()
          }
        },
        orderBy: {
          lastUsed: 'desc'
        },
        select: {
          id: true,
          device: true,
          ip: true,
          createdAt: true,
          lastUsed: true,
          expiresAt: true
        }
      });

      return sessions;
    } catch (error) {
      logger.error('Failed to get user sessions', { userId, error: error.message });
      throw error;
    }
  }

  /**
   * Revoke a specific session by session ID
   * @param {string} sessionId - Session ID to revoke
   * @param {string} userId - User ID (for security verification)
   * @returns {Promise<object>} Success status
   */
  async revokeSession(sessionId, userId) {
    try {
      const result = await prisma.session.updateMany({
        where: {
          id: sessionId,
          userId: userId, // Ensure user owns this session
          revokedAt: null
        },
        data: {
          revokedAt: new Date()
        }
      });

      if (result.count === 0) {
        throw new Error('Session not found or already revoked');
      }

      logger.info('Session revoked', { sessionId, userId });
      return { success: true };
    } catch (error) {
      logger.error('Failed to revoke session', { sessionId, userId, error: error.message });
      throw error;
    }
  }

  /**
   * Clean up expired sessions (should be run periodically)
   * @returns {Promise<number>} Number of sessions deleted
   */
  async cleanupExpiredSessions() {
    try {
      const result = await prisma.session.deleteMany({
        where: {
          OR: [
            { expiresAt: { lt: new Date() } }, // Expired
            { revokedAt: { not: null } } // Revoked (clean up after some time)
          ]
        }
      });

      logger.info('Expired sessions cleaned up', { count: result.count });
      return result.count;
    } catch (error) {
      logger.error('Failed to cleanup expired sessions', { error: error.message });
      throw error;
    }
  }

  /**
   * Get user information by user ID
   * @param {string} userId - Unique user identifier
   * @returns {Promise<object>} User object (without password)
   * @throws {Error} If user not found
   */
  async getUserById(userId) {
    try {
      const user = await prisma.user.findUnique({
        where: { id: userId }
      });

      if (!user) {
        throw new Error('User not found');
      }

      const { passwordHash: _, ...userResponse } = user;
      return userResponse;
    } catch (error) {
      logger.error('Failed to get user', { userId, error: error.message });
      throw error;
    }
  }

  /**
   * Get user information by email
   * @param {string} email - User email address
   * @returns {Promise<object>} User object (without password)
   * @throws {Error} If user not found
   */
  async getUserByEmail(email) {
    try {
      const user = await prisma.user.findUnique({
        where: { email: email.toLowerCase() }
      });

      if (!user) {
        throw new Error('User not found');
      }

      const { passwordHash: _, ...userResponse } = user;
      return userResponse;
    } catch (error) {
      logger.error('Failed to get user by email', { email, error: error.message });
      throw error;
    }
  }

  // Update user preferences
  async updateUserPreferences(userId, preferences) {
    try {
      await prisma.userPreference.upsert({
        where: { userId: userId },
        create: {
          userId: userId,
          dataJson: preferences
        },
        update: {
          dataJson: preferences
        }
      });

      const user = await this.getUserById(userId);
      return user;
    } catch (error) {
      logger.error('Failed to update user preferences', { userId, error: error.message });
      throw error;
    }
  }

  // Verify email
  async verifyEmail(email, token) {
    try {
      const user = await prisma.user.findUnique({
        where: { email: email.toLowerCase() }
      });

      if (!user) {
        throw new Error('User not found');
      }

      if (user.emailVerificationToken !== token) {
        throw new Error('Invalid verification token');
      }

      await prisma.user.update({
        where: { id: user.id },
        data: {
          isEmailVerified: true,
          emailVerificationToken: null
        }
      });

      return { success: true };
    } catch (error) {
      logger.error('Email verification failed', { email, error: error.message });
      throw error;
    }
  }

  // Get all users (admin only)
  async getAllUsers() {
    try {
      const users = await prisma.user.findMany({
        select: {
          id: true,
          email: true,
          role: true,
          isEmailVerified: true,
          createdAt: true,
          lastLogin: true
        }
      });
      return users;
    } catch (error) {
      logger.error('Failed to get all users', { error: error.message });
      throw error;
    }
  }
}

const userServiceInstance = new UserService();

// Export the instance
module.exports = userServiceInstance;
