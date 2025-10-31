const UserService = require('../userService');

describe('UserService', () => {
  beforeEach(() => {
    // Clear the in-memory storage before each test
    const users = require('../userService').users;
    const userSessions = require('../userService').userSessions;
    users.clear();
    userSessions.clear();
  });

  describe('user registration', () => {
    test('should register a new user successfully', async () => {
      const email = 'test@example.com';
      const password = 'TestPassword123!';
      const userData = {
        firstName: 'John',
        lastName: 'Doe'
      };

      const result = await UserService.registerUser(email, password, userData);

      expect(result).toBeTruthy();
      expect(result.user).toBeTruthy();
      expect(result.user.email).toBe(email.toLowerCase());
      expect(result.user.firstName).toBe('John');
      expect(result.user.lastName).toBe('Doe');
      expect(result.user.password).not.toBe(password); // Should be hashed
      expect(result.accessToken).toBeTruthy();
      expect(result.refreshToken).toBeTruthy();
    });

    test('should reject duplicate email registration', async () => {
      const email = 'test@example.com';
      const password = 'TestPassword123!';

      // Register first user
      await UserService.registerUser(email, password);

      // Try to register with same email
      await expect(UserService.registerUser(email, password))
        .rejects.toThrow('User already exists');
    });

    test('should reject invalid email format', async () => {
      const email = 'invalid-email';
      const password = 'TestPassword123!';

      await expect(UserService.registerUser(email, password))
        .rejects.toThrow('Invalid email format');
    });

    test('should reject weak passwords', async () => {
      const email = 'test@example.com';
      const password = 'weak';

      await expect(UserService.registerUser(email, password))
        .rejects.toThrow('Password validation failed');
    });

    test('should handle case insensitive email', async () => {
      const email1 = 'Test@Example.com';
      const email2 = 'test@example.com';
      const password = 'TestPassword123!';

      // Register with uppercase email
      await UserService.registerUser(email1, password);

      // Try to register with lowercase email
      await expect(UserService.registerUser(email2, password))
        .rejects.toThrow('User already exists');
    });
  });

  describe('user login', () => {
    beforeEach(async () => {
      // Register a test user
      await UserService.registerUser('test@example.com', 'TestPassword123!');
    });

    test('should login with correct credentials', async () => {
      const result = await UserService.loginUser('test@example.com', 'TestPassword123!');

      expect(result).toBeTruthy();
      expect(result.user).toBeTruthy();
      expect(result.user.email).toBe('test@example.com');
      expect(result.accessToken).toBeTruthy();
      expect(result.refreshToken).toBeTruthy();
    });

    test('should reject incorrect password', async () => {
      await expect(UserService.loginUser('test@example.com', 'WrongPassword'))
        .rejects.toThrow('Invalid email or password');
    });

    test('should reject non-existent user', async () => {
      await expect(UserService.loginUser('nonexistent@example.com', 'TestPassword123!'))
        .rejects.toThrow('Invalid email or password');
    });

    test('should handle case insensitive email', async () => {
      const result = await UserService.loginUser('TEST@EXAMPLE.COM', 'TestPassword123!');

      expect(result).toBeTruthy();
      expect(result.user.email).toBe('test@example.com');
    });
  });

  describe('token refresh', () => {
    let refreshToken;

    beforeEach(async () => {
      // Register and login a user
      const loginResult = await UserService.registerUser('test@example.com', 'TestPassword123!');
      refreshToken = loginResult.refreshToken;
    });

    test('should refresh access token with valid refresh token', async () => {
      const result = await UserService.refreshAccessToken(refreshToken);

      expect(result).toBeTruthy();
      expect(result.accessToken).toBeTruthy();
      expect(result.refreshToken).toBeTruthy();
      expect(result.accessToken).not.toBe(refreshToken); // Should be new token
    });

    test('should reject invalid refresh token', async () => {
      await expect(UserService.refreshAccessToken('invalid-token'))
        .rejects.toThrow('Invalid or expired refresh token');
    });

    test('should reject non-existent refresh token', async () => {
      const fakeToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJmYWtlIiwiaWF0IjoxNjAwMDAwMDAwfQ.fake';
      
      await expect(UserService.refreshAccessToken(fakeToken))
        .rejects.toThrow('Invalid or expired refresh token');
    });
  });

  describe('user logout', () => {
    let accessToken, refreshToken;

    beforeEach(async () => {
      // Register and login a user
      const loginResult = await UserService.registerUser('test@example.com', 'TestPassword123!');
      accessToken = loginResult.accessToken;
      refreshToken = loginResult.refreshToken;
    });

    test('should logout user successfully', async () => {
      const result = await UserService.logoutUser(refreshToken);

      expect(result.success).toBe(true);
    });

    test('should handle logout with invalid token', async () => {
      const result = await UserService.logoutUser('invalid-token');

      expect(result.success).toBe(true);
    });
  });

  describe('get user by ID', () => {
    let userId;

    beforeEach(async () => {
      // Register a user
      const result = await UserService.registerUser('test@example.com', 'TestPassword123!');
      userId = result.user.id;
    });

    test('should get user by valid ID', async () => {
      const user = await UserService.getUserById(userId);

      expect(user).toBeTruthy();
      expect(user.id).toBe(userId);
      expect(user.email).toBe('test@example.com');
      expect(user.password).toBeUndefined(); // Should not return password
    });

    test('should return null for non-existent user', async () => {
      await expect(UserService.getUserById('non-existent-id'))
        .rejects.toThrow('User not found');
    });
  });

  describe('user preferences', () => {
    let userId;

    beforeEach(async () => {
      // Register a user
      const result = await UserService.registerUser('test@example.com', 'TestPassword123!');
      userId = result.user.id;
    });

    test('should update user preferences', async () => {
      const preferences = {
        budget: 'moderate',
        regions: ['Bordeaux', 'Napa Valley'],
        grapeVarieties: ['Cabernet Sauvignon', 'Merlot']
      };

      const result = await UserService.updateUserPreferences(userId, preferences);

      expect(result.preferences).toEqual(preferences);

      // Verify preferences were updated
      const user = await UserService.getUserById(userId);
      expect(user.preferences).toEqual(preferences);
    });

    test('should handle non-existent user preferences update', async () => {
      const preferences = { budget: 'premium' };

      await expect(UserService.updateUserPreferences('non-existent-id', preferences))
        .rejects.toThrow('User not found');
    });
  });

  describe('email verification', () => {
    let user;

    beforeEach(async () => {
      // Register a user
      const result = await UserService.registerUser('test@example.com', 'TestPassword123!');
      user = result.user;
    });

    test('should verify email with valid token', async () => {
      const result = await UserService.verifyEmail(user.email, user.emailVerificationToken);

      expect(result.success).toBe(true);

      // Verify user is now verified
      const updatedUser = await UserService.getUserById(user.id);
      expect(updatedUser.isEmailVerified).toBe(true);
    });

    test('should reject invalid verification token', async () => {
      await expect(UserService.verifyEmail(user.email, 'invalid-token'))
        .rejects.toThrow('Invalid verification token');
    });

    test('should reject verification for non-existent user', async () => {
      await expect(UserService.verifyEmail('nonexistent@example.com', 'any-token'))
        .rejects.toThrow('User not found');
    });
  });
});
