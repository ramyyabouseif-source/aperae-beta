const swaggerJsdoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'PocketSomm API',
      version: '1.0.0',
      description: 'AI-powered wine recommendation API for PocketSomm mobile application',
      contact: {
        name: 'PocketSomm Support',
        email: 'support@pocketsomm.com',
      },
      license: {
        name: 'MIT',
        url: 'https://opensource.org/licenses/MIT',
      },
    },
    servers: [
      {
        url: process.env.NODE_ENV === 'production' 
          ? 'https://api.pocketsomm.com' 
          : `http://localhost:${process.env.PORT || 3001}`,
        description: process.env.NODE_ENV === 'production' ? 'Production server' : 'Development server',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
      schemas: {
        User: {
          type: 'object',
          required: ['id', 'email', 'role'],
          properties: {
            id: {
              type: 'string',
              description: 'Unique user identifier',
              example: 'user_123456789',
            },
            email: {
              type: 'string',
              format: 'email',
              description: 'User email address',
              example: 'user@example.com',
            },
            firstName: {
              type: 'string',
              description: 'User first name',
              example: 'John',
            },
            lastName: {
              type: 'string',
              description: 'User last name',
              example: 'Doe',
            },
            role: {
              type: 'string',
              enum: ['user', 'admin'],
              description: 'User role',
              example: 'user',
            },
            isEmailVerified: {
              type: 'boolean',
              description: 'Email verification status',
              example: true,
            },
            createdAt: {
              type: 'string',
              format: 'date-time',
              description: 'User creation timestamp',
            },
            lastLogin: {
              type: 'string',
              format: 'date-time',
              description: 'Last login timestamp',
            },
          },
        },
        WineRecommendation: {
          type: 'object',
          required: ['wineName', 'producer', 'vintage', 'pricePoint', 'rationale'],
          properties: {
            wineName: {
              type: 'string',
              description: 'Name of the wine',
              example: 'Château Léoville Barton',
            },
            producer: {
              type: 'string',
              description: 'Wine producer',
              example: 'Léoville Barton',
            },
            vintage: {
              type: 'string',
              description: 'Wine vintage year',
              example: '2016',
            },
            pricePoint: {
              type: 'string',
              description: 'Estimated retail price',
              example: '$145',
            },
            rationale: {
              type: 'string',
              description: 'Explanation of why this wine pairs well with the dish',
            },
            tastingNotes: {
              type: 'string',
              description: 'Detailed tasting notes',
            },
            servingGuidance: {
              type: 'string',
              description: 'Serving temperature and glassware recommendations',
            },
            confidenceScore: {
              type: 'integer',
              minimum: 0,
              maximum: 100,
              description: 'Confidence score for the recommendation',
              example: 95,
            },
            expertRating: {
              type: 'string',
              description: 'Expert rating from wine critics',
              example: '97 (Wine Spectator)',
            },
            retailerSuggestion: {
              type: 'string',
              description: 'Where to purchase the wine',
            },
            image: {
              type: 'string',
              format: 'uri',
              description: 'URL to wine image',
            },
            storytellingElements: {
              type: 'string',
              description: 'Vineyard history and storytelling elements',
            },
          },
        },
        WineRecommendationResponse: {
          type: 'object',
          required: ['dish', 'recommendations'],
          properties: {
            dish: {
              type: 'string',
              description: 'The dish for which recommendations were requested',
              example: 'Ribeye steak with creamed spinach',
            },
            recommendations: {
              type: 'array',
              items: {
                $ref: '#/components/schemas/WineRecommendation',
              },
              description: 'Array of wine recommendations',
            },
            closingNarrative: {
              type: 'string',
              description: 'Overall pairing experience summary',
            },
            disclaimer: {
              type: 'string',
              description: 'Disclaimer about recommendations',
            },
          },
        },
        UserPreferences: {
          type: 'object',
          properties: {
            budgetSensitivity: {
              type: 'string',
              enum: ['$15-30', '$30-60', '$60-150', '$150+', 'any'],
              description: 'Budget range preference',
            },
            regionPreferences: {
              type: 'string',
              enum: ['Bordeaux', 'Burgundy', 'Napa Valley', 'Tuscany', 'Mendoza', 'Rioja', 'Barossa Valley', 'any'],
              description: 'Preferred wine region',
            },
            exploreNewRegions: {
              type: 'boolean',
              description: 'Whether to explore new regions',
            },
            grapeVariety: {
              type: 'array',
              items: {
                type: 'string',
              },
              description: 'Preferred grape varieties',
            },
            wineStyle: {
              type: 'array',
              items: {
                type: 'string',
              },
              description: 'Preferred wine styles',
            },
            occasion: {
              type: 'string',
              enum: ['casual-dinner', 'formal-dining', 'celebration', 'gifting', 'collector', 'any'],
              description: 'Occasion context',
            },
            retailAccessibility: {
              type: 'string',
              enum: ['widely-available', 'specialty-stores', 'boutique-wines', 'any'],
              description: 'Retail accessibility preference',
            },
            agingPotential: {
              type: 'string',
              enum: ['drink-now', 'short-term', 'long-term', 'any'],
              description: 'Aging potential preference',
            },
            foodPairingRisk: {
              type: 'string',
              enum: ['classic-safe', 'adventurous', 'any'],
              description: 'Food pairing risk tolerance',
            },
          },
        },
        Error: {
          type: 'object',
          required: ['error'],
          properties: {
            error: {
              type: 'string',
              description: 'Error message',
            },
            code: {
              type: 'string',
              description: 'Error code',
            },
            requestId: {
              type: 'string',
              description: 'Unique request identifier for tracking',
            },
            details: {
              type: 'array',
              items: {
                type: 'object',
              },
              description: 'Additional error details',
            },
          },
        },
      },
    },
    security: [
      {
        bearerAuth: [],
      },
    ],
  },
  apis: ['./server.js'], // Path to the API files
};

const specs = swaggerJsdoc(options);

module.exports = {
  swaggerUi,
  specs,
};





