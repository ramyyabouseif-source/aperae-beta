const authService = require('./authService');

// In-memory user storage (replace with database in production)
const users = new Map();
const userSessions = new Map();

/**
 * User service for PocketSomm backend
 * Handles user registration, authentication, session management, and user data operations
 * @class UserService
 * @note Currently uses in-memory storage - should be migrated to database for production
 */
class UserService {
  /**
   * Register a new user account
   * @param {string} email - User email address
   * @param {string} password - Plain text password (will be hashed)
   * @param {object} [userData={}] - Additional user data (firstName, lastName, preferences, etc.)
   * @returns {Promise<object>} User object and authentication tokens
   * @returns {object} returns.user - User object (without password)
   * @returns {string} returns.accessToken - JWT access token
   * @returns {string} returns.refreshToken - JWT refresh token
   * @throws {Error} If email is invalid, user already exists, or password validation fails
   */
  async registerUser(email, password, userData = {}) {
    try {
      // Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        throw new Error('Invalid email format');
      }

      // Check if user already exists
      if (users.has(email.toLowerCase())) {
        throw new Error('User already exists');
      }

      // Validate password strength
      const passwordValidation = authService.validatePasswordStrength(password);
      if (!passwordValidation.isValid) {
        throw new Error(`Password validation failed: ${passwordValidation.errors.join(', ')}`);
      }

      // Hash password
      const hashedPassword = await authService.hashPassword(password);

      // Create user object
      const userId = authService.generateSecureRandom(16);
      const user = {
        id: userId,
        email: email.toLowerCase(),
        password: hashedPassword,
        role: 'user',
        isEmailVerified: false,
        emailVerificationToken: authService.generateEmailVerificationToken(),
        createdAt: new Date().toISOString(),
        lastLogin: null,
        preferences: userData.preferences || {},
        ...userData
      };

      // Store user
      users.set(email.toLowerCase(), user);

      // Generate tokens
      const accessToken = authService.generateAccessToken(userId, user.role, email);
      const refreshToken = authService.generateRefreshToken(userId);

      // Store refresh token
      userSessions.set(userId, {
        refreshToken,
        createdAt: new Date().toISOString(),
        lastUsed: new Date().toISOString()
      });

      // Remove password from response
      const { password: _, ...userResponse } = user;

      return {
        user: userResponse,
        accessToken,
        refreshToken
      };
    } catch (error) {
      throw error;
    }
  }

  /**
   * Authenticate a user and generate new tokens
   * @param {string} email - User email address
   * @param {string} password - Plain text password
   * @returns {Promise<object>} User object and authentication tokens
   * @returns {object} returns.user - User object (without password)
   * @returns {string} returns.accessToken - JWT access token
   * @returns {string} returns.refreshToken - JWT refresh token
   * @throws {Error} If email or password is incorrect
   */
  async loginUser(email, password) {
    try {
      const user = users.get(email.toLowerCase());
      
      if (!user) {
        throw new Error('Invalid email or password');
      }

      const isPasswordValid = await authService.verifyPassword(password, user.password);
      if (!isPasswordValid) {
        throw new Error('Invalid email or password');
      }

      // Update last login
      user.lastLogin = new Date().toISOString();
      users.set(email.toLowerCase(), user);

      // Generate new tokens
      const accessToken = authService.generateAccessToken(user.id, user.role, user.email);
      const refreshToken = authService.generateRefreshToken(user.id);

      // Store refresh token
      userSessions.set(user.id, {
        refreshToken,
        createdAt: new Date().toISOString(),
        lastUsed: new Date().toISOString()
      });

      // Remove password from response
      const { password: _, ...userResponse } = user;

      return {
        user: userResponse,
        accessToken,
        refreshToken
      };
    } catch (error) {
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
      const decoded = authService.verifyRefreshToken(refreshToken);
      const session = userSessions.get(decoded.userId);

      if (!session || session.refreshToken !== refreshToken) {
        throw new Error('Invalid refresh token');
      }

      const user = Array.from(users.values()).find(u => u.id === decoded.userId);
      if (!user) {
        throw new Error('User not found');
      }

      // Generate new tokens
      const newAccessToken = authService.generateAccessToken(user.id, user.role, user.email);
      const newRefreshToken = authService.generateRefreshToken(user.id);

      // Update session
      userSessions.set(user.id, {
        refreshToken: newRefreshToken,
        createdAt: session.createdAt,
        lastUsed: new Date().toISOString()
      });

      return {
        accessToken: newAccessToken,
        refreshToken: newRefreshToken
      };
    } catch (error) {
      throw error;
    }
  }

  /**
   * Logout a user by invalidating their refresh token
   * @param {string} userId - Unique user identifier
   * @returns {Promise<object>} Success status
   * @returns {boolean} returns.success - Always true
   */
  async logoutUser(userId) {
    try {
      userSessions.delete(userId);
      return { success: true };
    } catch (error) {
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
      const user = Array.from(users.values()).find(u => u.id === userId);
      if (!user) {
        throw new Error('User not found');
      }

      const { password: _, ...userResponse } = user;
      return userResponse;
    } catch (error) {
      throw error;
    }
  }

  // Update user preferences
  async updateUserPreferences(userId, preferences) {
    try {
      const user = Array.from(users.values()).find(u => u.id === userId);
      if (!user) {
        throw new Error('User not found');
      }

      user.preferences = { ...user.preferences, ...preferences };
      users.set(user.email, user);

      const { password: _, ...userResponse } = user;
      return userResponse;
    } catch (error) {
      throw error;
    }
  }

  // Verify email
  async verifyEmail(email, token) {
    try {
      const user = users.get(email.toLowerCase());
      if (!user) {
        throw new Error('User not found');
      }

      if (user.emailVerificationToken !== token) {
        throw new Error('Invalid verification token');
      }

      user.isEmailVerified = true;
      user.emailVerificationToken = null;
      users.set(email.toLowerCase(), user);

      return { success: true };
    } catch (error) {
      throw error;
    }
  }

  // Get all users (admin only)
  async getAllUsers() {
    try {
      const allUsers = Array.from(users.values()).map(user => {
        const { password: _, ...userResponse } = user;
        return userResponse;
      });
      return allUsers;
    } catch (error) {
      throw error;
    }
  }
}

const userServiceInstance = new UserService();

// Export the instance and the Maps for testing
module.exports = userServiceInstance;
module.exports.users = users;
module.exports.userSessions = userSessions;