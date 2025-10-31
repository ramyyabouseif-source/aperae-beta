const { 
  validateRecommendationRequest,
  validateRegistrationRequest,
  validateLoginRequest,
  validateRefreshRequest,
  sanitizeHtml
} = require('../validation');

describe('Validation Middleware', () => {
  describe('sanitizeHtml', () => {
    test('should remove HTML tags', () => {
      const input = '<script>alert("xss")</script>Hello World';
      const result = sanitizeHtml(input);
      
      expect(result).toBe('alert(xss)Hello World');
    });

    test('should remove javascript: protocols', () => {
      const input = 'javascript:alert("xss")';
      const result = sanitizeHtml(input);
      
      expect(result).toBe('alert(xss)');
    });

    test('should remove event handlers', () => {
      const input = 'onclick="alert(\'xss\')"';
      const result = sanitizeHtml(input);
      
      expect(result).toBe('alert(xss)');
    });

    test('should remove dangerous characters', () => {
      const input = 'Hello <>&"\' World';
      const result = sanitizeHtml(input);
      
      expect(result).toBe('Hello  World');
    });

    test('should handle non-string input', () => {
      const input = 123;
      const result = sanitizeHtml(input);
      
      expect(result).toBe(123);
    });

    test('should handle null/undefined input', () => {
      expect(sanitizeHtml(null)).toBe(null);
      expect(sanitizeHtml(undefined)).toBe(undefined);
    });
  });

  describe('validateRecommendationRequest', () => {
    test('should have correct number of validators', () => {
      expect(validateRecommendationRequest).toHaveLength(5);
    });

    test('should include dish validator', () => {
      const dishValidator = validateRecommendationRequest.find(v => 
        v.builder && v.builder.fields && v.builder.fields.includes('dish')
      );
      expect(dishValidator).toBeTruthy();
    });

    test('should include preferences validators', () => {
      const preferencesValidator = validateRecommendationRequest.find(v => 
        v.builder && v.builder.fields && v.builder.fields.includes('preferences')
      );
      expect(preferencesValidator).toBeTruthy();
    });
  });

  describe('validateRegistrationRequest', () => {
    test('should have correct number of validators', () => {
      expect(validateRegistrationRequest).toHaveLength(4);
    });

    test('should include email validator', () => {
      const emailValidator = validateRegistrationRequest.find(v => 
        v.builder && v.builder.fields && v.builder.fields.includes('email')
      );
      expect(emailValidator).toBeTruthy();
    });

    test('should include password validator', () => {
      const passwordValidator = validateRegistrationRequest.find(v => 
        v.builder && v.builder.fields && v.builder.fields.includes('password')
      );
      expect(passwordValidator).toBeTruthy();
    });
  });

  describe('validateLoginRequest', () => {
    test('should have correct number of validators', () => {
      expect(validateLoginRequest).toHaveLength(2);
    });

    test('should include email and password validators', () => {
      const emailValidator = validateLoginRequest.find(v => 
        v.builder && v.builder.fields && v.builder.fields.includes('email')
      );
      const passwordValidator = validateLoginRequest.find(v => 
        v.builder && v.builder.fields && v.builder.fields.includes('password')
      );
      
      expect(emailValidator).toBeTruthy();
      expect(passwordValidator).toBeTruthy();
    });
  });

  describe('validateRefreshRequest', () => {
    test('should have correct number of validators', () => {
      expect(validateRefreshRequest).toHaveLength(1);
    });

    test('should include refreshToken validator', () => {
      const refreshTokenValidator = validateRefreshRequest.find(v => 
        v.builder && v.builder.fields && v.builder.fields.includes('refreshToken')
      );
      expect(refreshTokenValidator).toBeTruthy();
    });
  });
});