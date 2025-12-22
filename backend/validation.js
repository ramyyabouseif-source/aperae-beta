const { body, validationResult, sanitizeBody } = require('express-validator');

// Validation rules for wine recommendations
const validateRecommendationRequest = [
  body('dish')
    .customSanitizer(value => {
      // Sanitize FIRST to normalize quotes before validation
      if (typeof value !== 'string') return value;
      
      // Normalize curly quotes to straight quotes
      let sanitized = value
        .replace(/[""]/g, '"')  // Left double quotation mark (U+201C) -> "
        .replace(/[""]/g, '"')  // Right double quotation mark (U+201D) -> "
        .replace(/['']/g, "'")  // Left single quotation mark (U+2018) -> '
        .replace(/['']/g, "'"); // Right single quotation mark (U+2019) -> '
      
      // Remove HTML tags
      sanitized = sanitized.replace(/<[^>]*>/g, '');
      
      // Remove script content and javascript: protocols
      sanitized = sanitized.replace(/javascript:/gi, '');
      sanitized = sanitized.replace(/on\w+\s*=/gi, '');
      
      // Remove potentially dangerous characters (but keep normalized quotes - do NOT remove " or ')
      sanitized = sanitized.replace(/[<>&]/g, '');
      
      return sanitized;
    })
    .trim()
    .isLength({ min: 1, max: 500 })
    .withMessage('Dish must be between 1 and 500 characters')
    .matches(/^[a-zA-Z0-9\s\-.,!?()'"]+$/)
    .withMessage('Dish contains invalid characters')
];

// Validation rules for dish recommendations (wine -> dish pairing)
const validateDishRecommendationRequest = [
  body('wine')
    .customSanitizer(value => {
      // Sanitize FIRST to normalize quotes before validation
      if (typeof value !== 'string') return value;
      
      // Normalize curly quotes to straight quotes
      let sanitized = value
        .replace(/[""]/g, '"')  // Left double quotation mark (U+201C) -> "
        .replace(/[""]/g, '"')  // Right double quotation mark (U+201D) -> "
        .replace(/['']/g, "'")  // Left single quotation mark (U+2018) -> '
        .replace(/['']/g, "'"); // Right single quotation mark (U+2019) -> '
      
      // Remove HTML tags
      sanitized = sanitized.replace(/<[^>]*>/g, '');
      
      // Remove script content and javascript: protocols
      sanitized = sanitized.replace(/javascript:/gi, '');
      sanitized = sanitized.replace(/on\w+\s*=/gi, '');
      
      // Remove potentially dangerous characters (but keep normalized quotes - do NOT remove " or ')
      sanitized = sanitized.replace(/[<>&]/g, '');
      
      return sanitized;
    })
    .trim()
    .isLength({ min: 1, max: 500 })
    .withMessage('Wine must be between 1 and 500 characters')
    .matches(/^[a-zA-Z0-9\s\-.,!?()'"]+$/)
    .withMessage('Wine contains invalid characters')
];

// Middleware to handle validation results
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    console.warn('Validation errors:', errors.array());
    return res.status(400).json({ 
      error: 'Invalid input',
      details: errors.array(),
      requestId: req.requestId 
    });
  }
  
  // Add sanitizedDish property if it's expected
  if (req.body.dish && !req.body.sanitizedDish) {
    req.body.sanitizedDish = req.body.dish;
  }
  
  next();
};

// Validation rules for user registration
const validateRegistrationRequest = [
  body('email')
    .trim()
    .isEmail()
    .withMessage('Valid email is required')
    .normalizeEmail()
    .customSanitizer(value => {
      // Additional sanitization for email
      if (typeof value === 'string') {
        return value.replace(/[<>\"'&]/g, '');
      }
      return value;
    }),
  body('password')
    .isLength({ min: 8, max: 128 })
    .withMessage('Password must be between 8 and 128 characters')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('Password must contain at least one lowercase letter, one uppercase letter, and one number'),
  body('firstName')
    .optional()
    .trim()
    .isLength({ min: 1, max: 50 })
    .withMessage('First name must be between 1 and 50 characters')
    .matches(/^[a-zA-Z\s\-']+$/)
    .withMessage('First name contains invalid characters')
    .customSanitizer(value => {
      if (typeof value === 'string') {
        return value.replace(/<[^>]*>/g, '').replace(/[<>\"'&]/g, '');
      }
      return value;
    }),
  body('lastName')
    .optional()
    .trim()
    .isLength({ min: 1, max: 50 })
    .withMessage('Last name must be between 1 and 50 characters')
    .matches(/^[a-zA-Z\s\-']+$/)
    .withMessage('Last name contains invalid characters')
    .customSanitizer(value => {
      if (typeof value === 'string') {
        return value.replace(/<[^>]*>/g, '').replace(/[<>\"'&]/g, '');
      }
      return value;
    })
];

// Validation rules for user login
const validateLoginRequest = [
  body('email')
    .trim()
    .isEmail()
    .withMessage('Valid email is required')
    .normalizeEmail()
    .customSanitizer(value => {
      if (typeof value === 'string') {
        return value.replace(/[<>\"'&]/g, '');
      }
      return value;
    }),
  body('password')
    .notEmpty()
    .withMessage('Password is required')
];

// Validation rules for refresh token
const validateRefreshRequest = [
  body('refreshToken')
    .notEmpty()
    .withMessage('Refresh token is required')
    .isLength({ min: 10, max: 1000 })
    .withMessage('Invalid refresh token format')
    .customSanitizer(value => {
      if (typeof value === 'string') {
        // Remove any potential HTML/script content
        return value.replace(/<[^>]*>/g, '').replace(/[<>\"'&]/g, '');
      }
      return value;
    })
];

// Generic HTML sanitization function
const sanitizeHtml = (value) => {
  if (typeof value !== 'string') return value;
  
  // Remove HTML tags
  let sanitized = value.replace(/<[^>]*>/g, '');
  
  // Remove script content and javascript: protocols
  sanitized = sanitized.replace(/javascript:/gi, '');
  sanitized = sanitized.replace(/on\w+\s*=/gi, '');
  
  // Remove any remaining potentially dangerous characters
  sanitized = sanitized.replace(/[<>\"'&]/g, '');
  
  return sanitized;
};

module.exports = {
  validateRecommendationRequest,
  validateDishRecommendationRequest,
  validateRegistrationRequest,
  validateLoginRequest,
  validateRefreshRequest,
  handleValidationErrors,
  sanitizeHtml
};