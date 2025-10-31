const AuthService = require('../authService');

describe('AuthService', () => {
  describe('password hashing', () => {
    test('should hash passwords with bcrypt', async () => {
      const password = 'TestPassword123';
      const hash = await AuthService.hashPassword(password);
      
      expect(hash).not.toBe(password);
      expect(hash).toMatch(/^\$2[aby]\$.{56}$/);
    });

    test('should verify correct passwords', async () => {
      const password = 'TestPassword123';
      const hash = await AuthService.hashPassword(password);
      const isValid = await AuthService.verifyPassword(password, hash);
      
      expect(isValid).toBe(true);
    });

    test('should reject incorrect passwords', async () => {
      const password = 'TestPassword123';
      const wrongPassword = 'WrongPassword456';
      const hash = await AuthService.hashPassword(password);
      const isValid = await AuthService.verifyPassword(wrongPassword, hash);
      
      expect(isValid).toBe(false);
    });

    test('should handle empty password', async () => {
      const password = '';
      const hash = await AuthService.hashPassword(password);
      const isValid = await AuthService.verifyPassword(password, hash);
      
      expect(hash).toBeTruthy();
      expect(isValid).toBe(true);
    });
  });

  describe('token generation', () => {
    test('should generate valid access tokens', () => {
      const userId = 'user123';
      const role = 'user';
      const email = 'test@example.com';
      
      const token = AuthService.generateAccessToken(userId, role, email);
      
      expect(token).toBeTruthy();
      expect(typeof token).toBe('string');
      expect(token.split('.')).toHaveLength(3); // JWT has 3 parts
    });

    test('should generate valid refresh tokens', () => {
      const userId = 'user123';
      
      const token = AuthService.generateRefreshToken(userId);
      
      expect(token).toBeTruthy();
      expect(typeof token).toBe('string');
      expect(token.split('.')).toHaveLength(3); // JWT has 3 parts
    });

    test('should verify valid access tokens', () => {
      const userId = 'user123';
      const role = 'user';
      const email = 'test@example.com';
      
      const token = AuthService.generateAccessToken(userId, role, email);
      const decoded = AuthService.verifyAccessToken(token);
      
      expect(decoded).toBeTruthy();
      expect(decoded.userId).toBe(userId);
      expect(decoded.role).toBe(role);
      expect(decoded.email).toBe(email);
    });

    test('should verify valid refresh tokens', () => {
      const userId = 'user123';
      
      const token = AuthService.generateRefreshToken(userId);
      const decoded = AuthService.verifyRefreshToken(token);
      
      expect(decoded).toBeTruthy();
      expect(decoded.userId).toBe(userId);
    });

    test('should reject invalid tokens', () => {
      const invalidToken = 'invalid.token.here';
      
      expect(() => {
        AuthService.verifyAccessToken(invalidToken);
      }).toThrow();
      
      expect(() => {
        AuthService.verifyRefreshToken(invalidToken);
      }).toThrow();
    });

    test('should reject expired tokens', () => {
      // Create a token with very short expiry (1ms)
      const userId = 'user123';
      const role = 'user';
      const email = 'test@example.com';
      
      const token = AuthService.generateAccessToken(userId, role, email, '1ms');
      
      // Wait for token to expire
      setTimeout(() => {
        expect(() => {
          AuthService.verifyAccessToken(token);
        }).toThrow();
      }, 10);
    });
  });

  describe('password validation', () => {
    test('should validate strong passwords', () => {
      const strongPassword = 'StrongPass123!';
      const result = AuthService.validatePasswordStrength(strongPassword);
      
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    test('should reject weak passwords', () => {
      const weakPasswords = [
        '123', // too short
        'password', // no uppercase, no number
        'PASSWORD', // no lowercase, no number
        'Password', // no number
        'password123', // no uppercase
        'PASSWORD123' // no lowercase
      ];

      weakPasswords.forEach(password => {
        const result = AuthService.validatePasswordStrength(password);
        expect(result.isValid).toBe(false);
        expect(result.errors.length).toBeGreaterThan(0);
      });
    });

    test('should provide specific error messages', () => {
      const password = 'weak';
      const result = AuthService.validatePasswordStrength(password);
      
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Password must be at least 8 characters long');
      expect(result.errors).toContain('Password must contain at least one uppercase letter');
      expect(result.errors).toContain('Password must contain at least one number');
    });
  });

  describe('secure random generation', () => {
    test('should generate secure random strings', () => {
      const length = 16;
      const random1 = AuthService.generateSecureRandom(length);
      const random2 = AuthService.generateSecureRandom(length);
      
      expect(random1).toHaveLength(length * 2); // hex doubles the length
      expect(random2).toHaveLength(length * 2);
      expect(random1).not.toBe(random2);
    });

    test('should generate different lengths', () => {
      const lengths = [8, 16, 32, 64];
      
      lengths.forEach(length => {
        const random = AuthService.generateSecureRandom(length);
        expect(random).toHaveLength(length * 2); // hex doubles the length
      });
    });
  });

  describe('email verification token', () => {
    test('should generate email verification tokens', () => {
      const token = AuthService.generateEmailVerificationToken();
      
      expect(token).toBeTruthy();
      expect(typeof token).toBe('string');
      expect(token.length).toBeGreaterThan(10);
    });

    test('should generate unique tokens', () => {
      const token1 = AuthService.generateEmailVerificationToken();
      const token2 = AuthService.generateEmailVerificationToken();
      
      expect(token1).not.toBe(token2);
    });
  });
});
