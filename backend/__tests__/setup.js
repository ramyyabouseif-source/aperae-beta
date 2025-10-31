// Test setup file
const path = require('path');

// Set test environment variables
process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'test-jwt-secret-key-for-testing-only';
process.env.REFRESH_SECRET = 'test-refresh-secret-key-for-testing-only';
process.env.PORT = '3002';
process.env.MOCK_MODE = 'true';
process.env.OPENAI_API_KEY = 'sk-test-key-for-testing';

// Mock external dependencies
jest.mock('@google-cloud/vision', () => ({
  ImageAnnotatorClient: jest.fn().mockImplementation(() => ({
    textDetection: jest.fn().mockResolvedValue([{
      textAnnotations: [{
        description: 'Test menu text'
      }]
    }])
  }))
}));

jest.mock('openai', () => {
  return jest.fn().mockImplementation(() => ({
    chat: {
      completions: {
        create: jest.fn().mockResolvedValue({
          choices: [{
            message: {
              content: JSON.stringify({
                dish: 'Test Dish',
                recommendations: [{
                  wineName: 'Test Wine',
                  producer: 'Test Producer',
                  vintage: '2020',
                  pricePoint: '$50',
                  rationale: 'Test rationale',
                  tastingNotes: 'Test notes',
                  servingGuidance: 'Test guidance',
                  confidenceScore: 95,
                  expertRating: '90',
                  retailerSuggestion: 'Test retailer',
                  image: 'test.jpg',
                  storytellingElements: 'Test story'
                }],
                closingNarrative: 'Test narrative'
              })
            }
          }]
        })
      }
    }
  }));
});

// Mock winston logger to prevent console spam during tests
jest.mock('../logger', () => ({
  info: jest.fn(),
  error: jest.fn(),
  warn: jest.fn(),
  debug: jest.fn()
}));

// Mock monitoring to prevent tracking during tests
jest.mock('../monitoring', () => ({
  trackRequest: jest.fn(),
  trackError: jest.fn(),
  trackRecommendation: jest.fn(),
  trackUser: jest.fn(),
  getMetrics: jest.fn(() => ({
    totalRequests: 0,
    totalErrors: 0,
    totalUsers: 0,
    totalRecommendations: 0,
    averageResponseTime: 0
  }))
}));

// Global test timeout
jest.setTimeout(10000);

