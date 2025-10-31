export interface ValidationResult {
  isValid: boolean;
  errors: string[];
}

export class InputValidator {
  static validateDishInput(dish: string): ValidationResult {
    const errors: string[] = [];
    
    if (!dish || dish.trim().length === 0) {
      errors.push('Dish name is required');
    }
    
    if (dish.length > 500) {
      errors.push('Dish name must be less than 500 characters');
    }
    
    if (dish.length < 2) {
      errors.push('Dish name must be at least 2 characters long');
    }
    
    // Check for potentially malicious content
    const suspiciousPatterns = [
      /<script/i,
      /javascript:/i,
      /on\w+\s*=/i,
      /data:/i,
      /vbscript:/i,
      /<iframe/i,
      /<object/i,
      /<embed/i,
      /<link/i,
      /<meta/i,
      /expression\s*\(/i,
      /url\s*\(/i,
      /@import/i
    ];
    
    if (suspiciousPatterns.some(pattern => pattern.test(dish))) {
      errors.push('Invalid characters detected');
    }
    
    // Check for SQL injection patterns
    const sqlPatterns = [
      /(\b(SELECT|INSERT|UPDATE|DELETE|DROP|CREATE|ALTER|EXEC|UNION|SCRIPT)\b)/i,
      /(\b(OR|AND)\s+\d+\s*=\s*\d+)/i,
      /(\b(OR|AND)\s+['"]\s*=\s*['"])/i,
      /(\b(OR|AND)\s+1\s*=\s*1)/i
    ];
    
    if (sqlPatterns.some(pattern => pattern.test(dish))) {
      errors.push('Invalid input format');
    }
    
    // Check for excessive special characters
    const specialCharCount = (dish.match(/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/g) || []).length;
    if (specialCharCount > dish.length * 0.3) {
      errors.push('Too many special characters');
    }
    
    return {
      isValid: errors.length === 0,
      errors
    };
  }
  
  static sanitizeInput(input: string): string {
    return input
      .trim()
      .replace(/[<>]/g, '') // Remove potential HTML tags
      .substring(0, 500); // Limit length
  }
  
  static validateEmail(email: string): ValidationResult {
    const errors: string[] = [];
    
    if (!email || email.trim().length === 0) {
      errors.push('Email is required');
    }
    
    const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
    if (!emailRegex.test(email)) {
      errors.push('Invalid email format');
    }
    
    if (email.length > 254) {
      errors.push('Email is too long');
    }
    
    return {
      isValid: errors.length === 0,
      errors
    };
  }
  
  static validatePassword(password: string): ValidationResult {
    const errors: string[] = [];
    
    if (!password || password.length === 0) {
      errors.push('Password is required');
    }
    
    if (password.length < 8) {
      errors.push('Password must be at least 8 characters long');
    }
    
    if (password.length > 128) {
      errors.push('Password is too long');
    }
    
    if (!/[A-Z]/.test(password)) {
      errors.push('Password must contain at least one uppercase letter');
    }
    
    if (!/[a-z]/.test(password)) {
      errors.push('Password must contain at least one lowercase letter');
    }
    
    if (!/\d/.test(password)) {
      errors.push('Password must contain at least one number');
    }
    
    if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
      errors.push('Password must contain at least one special character');
    }
    
    return {
      isValid: errors.length === 0,
      errors
    };
  }
  
  static validatePreferences(preferences: any): ValidationResult {
    const errors: string[] = [];
    
    if (preferences && typeof preferences === 'object') {
      // Validate budget
      const validBudgets = ['$15-30', '$30-60', '$60-150', '$150+', 'any'];
      if (preferences.budgetSensitivity && !validBudgets.includes(preferences.budgetSensitivity)) {
        errors.push('Invalid budget preference');
      }
      
      // Validate region
      const validRegions = ['Bordeaux', 'Burgundy', 'Napa Valley', 'Tuscany', 'Mendoza', 'Rioja', 'Barossa Valley', 'any'];
      if (preferences.regionPreferences && !validRegions.includes(preferences.regionPreferences)) {
        errors.push('Invalid region preference');
      }
      
      // Validate grape varieties array
      if (preferences.grapeVariety && !Array.isArray(preferences.grapeVariety)) {
        errors.push('Grape varieties must be an array');
      }
      
      // Validate wine style array
      if (preferences.wineStyle && !Array.isArray(preferences.wineStyle)) {
        errors.push('Wine style must be an array');
      }
      
      // Validate occasion
      const validOccasions = ['casual-dinner', 'formal-dining', 'celebration', 'gifting', 'collector', 'any'];
      if (preferences.occasion && !validOccasions.includes(preferences.occasion)) {
        errors.push('Invalid occasion preference');
      }
      
      // Validate retail accessibility
      const validRetail = ['widely-available', 'specialty-stores', 'boutique-wines', 'any'];
      if (preferences.retailAccessibility && !validRetail.includes(preferences.retailAccessibility)) {
        errors.push('Invalid retail accessibility preference');
      }
      
      // Validate aging potential
      const validAging = ['drink-now', 'short-term', 'long-term', 'any'];
      if (preferences.agingPotential && !validAging.includes(preferences.agingPotential)) {
        errors.push('Invalid aging potential preference');
      }
      
      // Validate food pairing risk
      const validPairing = ['classic-safe', 'adventurous', 'any'];
      if (preferences.foodPairingRisk && !validPairing.includes(preferences.foodPairingRisk)) {
        errors.push('Invalid food pairing preference');
      }
      
      // Validate explore new regions boolean
      if (preferences.exploreNewRegions !== undefined && typeof preferences.exploreNewRegions !== 'boolean') {
        errors.push('Explore new regions must be a boolean value');
      }
    }
    
    return {
      isValid: errors.length === 0,
      errors
    };
  }
}