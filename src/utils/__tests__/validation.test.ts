import { InputValidator } from '../validation';

describe('InputValidator', () => {
  describe('validateDishInput', () => {
    it('should validate a valid dish input', () => {
      const result = InputValidator.validateDishInput('Ribeye steak with creamed spinach');
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should reject empty input', () => {
      const result = InputValidator.validateDishInput('');
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Dish name is required');
    });

    it('should reject input that is too short', () => {
      const result = InputValidator.validateDishInput('a');
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Dish name must be at least 2 characters long');
    });

    it('should reject input that is too long', () => {
      const longInput = 'a'.repeat(501);
      const result = InputValidator.validateDishInput(longInput);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Dish name must be less than 500 characters');
    });

    it('should reject input with suspicious patterns', () => {
      const result = InputValidator.validateDishInput('<script>alert("xss")</script>');
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Invalid characters detected');
    });

    it('should reject input with SQL injection patterns', () => {
      const result = InputValidator.validateDishInput("'; DROP TABLE users; --");
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Invalid input format');
    });

    it('should reject input with too many special characters', () => {
      const result = InputValidator.validateDishInput('!!!!@@@@####$$$$%%%%');
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Too many special characters');
    });
  });

  describe('validateEmail', () => {
    it('should validate a valid email', () => {
      const result = InputValidator.validateEmail('test@example.com');
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should reject invalid email format', () => {
      const result = InputValidator.validateEmail('invalid-email');
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Invalid email format');
    });

    it('should reject empty email', () => {
      const result = InputValidator.validateEmail('');
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Email is required');
    });

    it('should reject email that is too long', () => {
      const longEmail = 'a'.repeat(250) + '@example.com';
      const result = InputValidator.validateEmail(longEmail);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Email is too long');
    });
  });

  describe('validatePassword', () => {
    it('should validate a strong password', () => {
      const result = InputValidator.validatePassword('StrongPass123!');
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should reject password that is too short', () => {
      const result = InputValidator.validatePassword('Short1!');
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Password must be at least 8 characters long');
    });

    it('should reject password without uppercase letter', () => {
      const result = InputValidator.validatePassword('lowercase123!');
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Password must contain at least one uppercase letter');
    });

    it('should reject password without lowercase letter', () => {
      const result = InputValidator.validatePassword('UPPERCASE123!');
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Password must contain at least one lowercase letter');
    });

    it('should reject password without number', () => {
      const result = InputValidator.validatePassword('NoNumbers!');
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Password must contain at least one number');
    });

    it('should reject password without special character', () => {
      const result = InputValidator.validatePassword('NoSpecial123');
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Password must contain at least one special character');
    });
  });

  describe('validatePreferences', () => {
    it('should validate valid preferences', () => {
      const preferences = {
        budgetSensitivity: '$30-60',
        regionPreferences: 'Napa Valley',
        grapeVariety: ['Cabernet Sauvignon', 'Merlot'],
        wineStyle: ['bold-tannic'],
        occasion: 'casual-dinner',
        retailAccessibility: 'widely-available',
        agingPotential: 'drink-now',
        foodPairingRisk: 'classic-safe',
        exploreNewRegions: true
      };
      const result = InputValidator.validatePreferences(preferences);
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should reject invalid budget preference', () => {
      const preferences = { budgetSensitivity: 'invalid-budget' };
      const result = InputValidator.validatePreferences(preferences);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Invalid budget preference');
    });

    it('should reject invalid region preference', () => {
      const preferences = { regionPreferences: 'invalid-region' };
      const result = InputValidator.validatePreferences(preferences);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Invalid region preference');
    });

    it('should reject non-array grape variety', () => {
      const preferences = { grapeVariety: 'not-an-array' };
      const result = InputValidator.validatePreferences(preferences);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Grape varieties must be an array');
    });

    it('should reject non-boolean explore new regions', () => {
      const preferences = { exploreNewRegions: 'not-a-boolean' };
      const result = InputValidator.validatePreferences(preferences);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Explore new regions must be a boolean value');
    });
  });

  describe('sanitizeInput', () => {
    it('should trim whitespace', () => {
      const result = InputValidator.sanitizeInput('  test  ');
      expect(result).toBe('test');
    });

    it('should remove HTML tags', () => {
      const result = InputValidator.sanitizeInput('test<script>alert("xss")</script>');
      expect(result).toBe('testscriptalert("xss")/script');
    });

    it('should limit length to 500 characters', () => {
      const longInput = 'a'.repeat(600);
      const result = InputValidator.sanitizeInput(longInput);
      expect(result).toHaveLength(500);
    });
  });
});





