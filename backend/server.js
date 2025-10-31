require('dotenv').config();
require('./validateEnv'); // Validate environment before starting
const SecurityValidator = require('./securityValidator');
const express = require('express');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const { ipKeyGenerator } = require('express-rate-limit');
const helmet = require('helmet');
const OpenAI = require('openai');
const { 
  validateRecommendationRequest, 
  validateRegistrationRequest,
  validateLoginRequest,
  validateRefreshRequest,
  handleValidationErrors 
} = require('./validation');
const { ImageAnnotatorClient } = require('@google-cloud/vision');
const securityLogger = require('./securityLogger');
const secureErrorHandler = require('./errorHandler');
const userService = require('./userService');
const { authenticateToken, requireRole, optionalAuth, authRateLimit } = require('./authMiddleware');
const { swaggerUi, specs } = require('./swagger');
const compression = require('compression');
const morgan = require('morgan');
const logger = require('./logger');
const monitoring = require('./monitoring');
const RequestLogger = require('./requestLogger');
const crypto = require('crypto');
const TimeoutMiddleware = require('./timeoutMiddleware');
const { versionMiddleware } = require('./apiVersioning');
const csrfProtection = require('./csrfProtection');

const app = express();
const PORT = process.env.PORT || 3001;
const MOCK_MODE = process.env.MOCK_MODE !== 'false';

// Validate security environment variables
try {
  SecurityValidator.validateEnvironment();
  logger.info('Security environment validation passed');
} catch (error) {
  logger.error('Security validation failed:', error.message);
  process.exit(1);
}

// Trust proxy for rate limiting
app.set('trust proxy', 1);

// Enhanced security headers
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
      connectSrc: ["'self'", "https://api.openai.com"],
    },
  },
  crossOriginEmbedderPolicy: false, // Disable for API
  hsts: {
    maxAge: 31536000, // 1 year
    includeSubDomains: true,
    preload: true
  },
  xFrameOptions: { action: 'deny' },
  xContentTypeOptions: true,
  referrerPolicy: { policy: 'strict-origin-when-cross-origin' }
}));

// Request ID middleware
const addRequestId = (req, res, next) => {
  req.requestId = crypto.randomBytes(12).toString('base64url');
  res.setHeader('X-Request-ID', req.requestId);
  next();
};

// Generate secure request ID
const generateRequestId = () => crypto.randomBytes(12).toString('base64url');

app.use(addRequestId); 

// API versioning middleware (adds version info to requests)
app.use(versionMiddleware);

// Compression middleware
app.use(compression());

// HTTP request logging
app.use(morgan('combined', { stream: logger.stream }));

// Monitoring middleware
app.use((req, res, next) => {
  const startTime = Date.now();
  
  res.on('finish', () => {
    const responseTime = Date.now() - startTime;
    monitoring.trackRequest(req, res, responseTime);
  });
  
  next();
});

app.use(securityLogger);

// CORS configuration - allow both localhost and ngrok domains
const allowedOrigins = (() => {
  const env = (process.env.ALLOWED_ORIGINS || '').split(',').map(s => s.trim()).filter(Boolean);
  const defaults = [
  'http://localhost:3000',
  'http://localhost:19006',
  'https://localhost:3000',
  'https://localhost:19006',
  'exp://127.0.0.1:8081',
    'exp://localhost:8081'
];
  return env.length ? env : defaults;
})();

// Dynamically add ngrok domains
const ngrokPattern = /^https:\/\/[a-z0-9]+\.ngrok-free\.app$/;
const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    // Check if origin is in allowed list
    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    }
    
    // Check if origin matches ngrok pattern
    if (ngrokPattern.test(origin)) {
      return callback(null, true);
    }
    
    // Allow localhost with any port for development
    if (origin && origin.startsWith('http://localhost:')) {
      return callback(null, true);
    }
    
    // Allow 192.168.x.x addresses for local network
    if (origin && /^https?:\/\/192\.168\.\d+\.\d+/.test(origin)) {
      return callback(null, true);
    }
    
    // Allow Expo tunnel URLs for development
    if (origin && origin.startsWith('exp://')) {
      return callback(null, true);
    }
    
    // For development, only allow specific development origins
    if (process.env.NODE_ENV !== 'production') {
      const devOrigins = [
        'http://localhost:3000',
        'http://localhost:19006',
        'https://localhost:3000',
        'https://localhost:19006',
        'exp://127.0.0.1:8081',
        'exp://192.168.1.152:8081',
        'exp://localhost:8081',
        'exp://192.168.1.152:8081'
      ];
      
      if (devOrigins.includes(origin)) {
        logger.debug('CORS: Allowing development origin', { origin });
      return callback(null, true);
      }
      
      // Log rejected origins for debugging
      logger.warn('CORS: Rejected origin in development', { origin });
      return callback(new Error('Origin not allowed in development mode'));
    }
    
    callback(new Error('Not allowed by CORS'));
  },
  credentials: true,
  optionsSuccessStatus: 200, // Some legacy browsers choke on 204
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept', 'Origin'],
  exposedHeaders: ['X-API-Version', 'X-Request-ID']
};

app.use(cors(corsOptions));

// CSRF Protection (applied after CORS to validate origins)
app.use(csrfProtection);

// Debug middleware to log all requests (only in development with debug flag)
if (process.env.NODE_ENV === 'development' && process.env.ENABLE_DEBUG_LOGGING === 'true') {
app.use((req, res, next) => {
    logger.debug('Request received', {
      method: req.method,
      url: req.url,
      origin: req.headers.origin,
      userAgent: req.headers['user-agent'],
      // Never log headers, authorization tokens, or sensitive data
    });
  next();
});
}

// Apply request timeout middleware
const timeoutConfig = TimeoutMiddleware.getTimeout();
app.use('/api/recommendations', TimeoutMiddleware.create(timeoutConfig.recommendations));
app.use('/api/ocr', TimeoutMiddleware.create(timeoutConfig.ocr));
app.use('/api/auth', TimeoutMiddleware.create(timeoutConfig.auth));
app.use('/api', TimeoutMiddleware.create(timeoutConfig.default));

// Enhanced rate limiting
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit to 100 requests per window
  message: {
    error: 'Too many requests, please try again later',
    retryAfter: 900 // 15 minutes in seconds
  },
  standardHeaders: true,
  legacyHeaders: false,
  // Record both successes and failures for accurate metrics
  skipSuccessfulRequests: false,
  skipFailedRequests: false,
});

// Stricter rate limiting for recommendations
const recommendationLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // Only 10 recommendations per 15 minutes
  message: {
    error: 'Too many wine recommendations requested, please try again later',
    retryAfter: 900
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Strict rate limiting for authentication endpoints (register, login, refresh, logout)
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // Only 5 auth attempts per 15 minutes per IP
  message: {
    error: 'Too many authentication attempts, please try again later',
    retryAfter: 900,
    type: 'auth_rate_limit'
  },
  standardHeaders: true,
  legacyHeaders: false,
  // Don't skip any requests for auth endpoints (both success and failure count)
  skipSuccessfulRequests: false,
  skipFailedRequests: false,
  // IPv6-safe key generator: library helper + User-Agent
  keyGenerator: (req) => `${ipKeyGenerator(req)}-${req.get('User-Agent') || 'unknown'}`
});

// More lenient rate limiting for user info endpoint
const userInfoLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 30, // 30 requests per 15 minutes for user info
  message: {
    error: 'Too many requests for user information, please try again later',
    retryAfter: 900,
    type: 'user_info_rate_limit'
  },
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: true, // Only count failed requests
  skipFailedRequests: false,
});

// Apply rate limiting
app.use('/api/', generalLimiter);
app.use('/api/recommendations', recommendationLimiter);
app.use('/api/auth', authLimiter);

// Request size limits
app.use(express.json({ 
  limit: '1mb', // Limit JSON payloads to 1MB
  strict: true // Only parse arrays and objects
}));
app.use(express.urlencoded({ 
  limit: '1mb', // Limit URL-encoded payloads to 1MB
  extended: true 
}));

// Load mock data
const mockData = require('./mockData.json');

// Master Sommelier AI Prompt
const MASTER_SOMMELIER_PROMPT = `ROLE: You are a certified Master Sommelier (CMS Level IV, WSET Level 4, ISG certified) with 15+ years of experience in fine dining and wine retail.

EXPERTISE: You are deeply knowledgeable in classic European appellations such as Bordeaux and Burgundy, while equally skilled in exploring New World and emerging regions worldwide. Your recommendations reflect mastery of food science, flavor pairing principles, vintage variation, and terroir expression, ensuring both traditional authority and global perspective.

TASK: For the dish: [INSERT DISH HERE], provide exactly three wines—high price, medium price, and low price—using producer, cuvée, and vintage where available.  

PREFERENCE INTEGRATION RULES:
When user preferences are provided, you MUST:
1. PRIORITIZE the user's preferred region when selecting wines
2. PRIORITIZE the user's preferred grape varieties when possible
3. MATCH the user's budget range for each price tier
4. ADAPT wine styles to match user preferences (bold-tannic, light-elegant, etc.)
5. CONSIDER the occasion context in your storytelling and rationale
6. SUGGEST retailers that match the user's accessibility preferences
7. EXPLAIN how preferences influenced your selections in the rationale
8. CONSIDER the entire set of preferences holistically (region, grape, budget, style, and occasion)
9. If preferences conflict with optimal food pairing, choose the best pairing but EXPLAIN the conflict

BUDGET INTEGRATION:
- When user specifies a budget range, follow these guidelines:
  * Budget ($15-30): Low=$15-20, Medium=$21-25, High=$26-30
  * Moderate ($30-60): Low=$30-40, Medium=$41-50, High=$51-60
  * Premium ($60-150): Low=$60-90, Medium=$91-120, High=$121-150
  * Luxury ($150+): Low=$150-200, Medium=$201-300, High=$300+
- When no specific budget is provided, recommend wines at their actual market prices
- Do not artificially constrain prices to arbitrary ranges
- Provide realistic retail prices based on the wine's actual market value

REGION INTEGRATION:
- If user specifies a region (Bordeaux, Burgundy, Napa Valley, Tuscany, etc.), prioritize wines from that region
- If "explore new regions" is false, stick to classic, well-known regions
- If "explore new regions" is true, include emerging regions and unique finds

GRAPE VARIETY INTEGRATION:
- If user specifies grape varieties, prioritize wines made from those grapes
- Explain how the grape variety enhances the food pairing
- If the preferred grape doesn't pair well with the dish, suggest the best pairing but explain the conflict

STYLE INTEGRATION:
- bold-tannic: Focus on full-bodied reds with structured tannins
- light-elegant: Focus on delicate, refined wines with finesse
- aromatic-floral: Focus on fragrant whites and roses
- crisp-mineral: Focus on high-acidity, mineral-driven wines
- rich-creamy: Focus on oaked whites and full-bodied reds
- off-dry-sweet: Focus on slightly sweet to dessert wines

OCCASION INTEGRATION:
- casual-dinner: Use relaxed, approachable language and everyday wines
- formal-dining: Use sophisticated language and premium wines
- celebration: Focus on special, memorable wines
- gifting: Emphasize presentation and prestige
- collector: Focus on investment-worthy, ageable wines

DATA ACCURACY & HALLUCINATION PREVENTION:
1. ONLY recommend specific named wines if the model can confidently identify them. If uncertain, return an archetype recommendation (e.g., "Napa Valley Cabernet Sauvignon") and set wineName/producer/vintage = "unknown".
2. Be conservative with ratings and prices. If ratings/prices are not confidently retrievable, set them to "unknown" and reduce confidence.
3. Use your knowledge of most recent critic ratings from Wine Spectator, Wine Advocate, James Suckling, and other reputable publications. Provide expert ratings when you have confident knowledge of recent critic scores for the specific wine and vintage.
4. ALWAYS explain in the rationale if a recommendation is based on an archetype rather than a specific wine.
5. NEVER invent a named wine or producer.
6. If a named wine is provided, include vintage only if it is confidently retrievable; otherwise, use "unknown".
7. Adjust confidenceScore based on the certainty of available information and how closely it matches user preferences.

RESPONSE FORMAT:

For each wine, include:
1. Wine Name, Producer, Vintage
2. Price Point: Approximate retail price (USD) - MUST match user's budget range, or "unknown"
3. Rationale: Why it complements the dish AND how it matches user preferences. Explain if an archetype was used
4. Tasting Notes: Aroma, palate, structure, finish (if unavailable, describe general style)
5. Serving Guidance: Ideal temperature and glassware
6. Confidence Score: 90–100 (adjust lower if any data is uncertain)
7. Expert Rating: Critic score (e.g., Wine Spectator, Wine Advocate, James Suckling, etc.), or "unknown"
8. Retailer Suggestion: Where it can reasonably be sourced (match accessibility preferences)
9. Image: Bottle or label if available, otherwise "unknown"
10. Storytelling Elements: Vineyard history, terroir, pairing "moments," or seasonal context (tailored to user's occasion and preferences)

Present each wine in structured sections for clarity, while maintaining polished, fluid, engaging prose.

Closing Narrative: Write a short, immersive summary of the overall pairing experience, blending aroma, flavor, texture, and storytelling. Highlight how the three wines elevate the dish and create a complete sensory experience. MUST acknowledge how user preferences influenced your selections and explain any conflicts between preferences and optimal pairings.

PERSONALITY: Your tone should be professional yet approachable, educational without being condescending, and confident in your recommendations while acknowledging that personal taste may vary. When preferences are provided, show understanding and respect for the user's choices while maintaining your expertise. Adapt your language to match the occasion (casual vs formal).

Disclaimer: "Simulated expert opinion — consult a certified sommelier for formal advice. Prices and ratings are estimates and may vary by retailer and location."

Please respond with ONLY a valid JSON object in this exact format (no markdown, no code blocks, no additional text):
{
  "dish": "[DISH_NAME]",
  "recommendations": [
    {
      "wineName": "Wine Name or archetype",
      "producer": "Producer Name or 'unknown'",
      "vintage": "2020 or 'unknown'",
      "pricePoint": "$120 or 'unknown'",
      "rationale": "Why this wine complements the dish AND matches user preferences. Explain if archetype was used",
      "tastingNotes": "Aroma, palate, structure, finish",
      "servingGuidance": "Ideal temperature and glassware",
      "confidenceScore": 95,
      "expertRating": "actual critic score if known or 'unknown'",
      "retailerSuggestion": "Where to buy",
      "image": "https://example.com/wine-image.jpg or 'unknown'",
      "storytellingElements": "Vineyard history, terroir, pairing moments"
    }
  ],
  "closingNarrative": "Overall pairing experience summary"
}`;

// Swagger API Documentation
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs, {
  explorer: true,
  customCss: '.swagger-ui .topbar { display: none }',
  customSiteTitle: 'PocketSomm API Documentation'
}));

// Routes
/**
 * @swagger
 * /api/health:
 *   get:
 *     summary: Health check endpoint
 *     description: Returns the current status of the API server
 *     tags: [System]
 *     responses:
 *       200:
 *         description: Server is healthy
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: OK
 *                 mockMode:
 *                   type: boolean
 *                   description: Whether the server is running in mock mode
 *                 openaiConfigured:
 *                   type: boolean
 *                   description: Whether OpenAI API key is configured
 *                 timestamp:
 *                   type: string
 *                   format: date-time
 *                   description: Current server timestamp
 */
// Helper function to check dependency health
async function checkDependencyHealth() {
  const dependencies = {
    database: { status: 'unknown', message: 'Not implemented' },
    redis: { status: 'unknown', message: 'Not implemented' },
    openai: { status: 'unknown', message: 'Not configured' },
    googleVision: { status: 'unknown', message: 'Not configured' }
  };

  // Check OpenAI API
  if (MOCK_MODE) {
    dependencies.openai = { status: 'skipped', message: 'Mock mode enabled' };
  } else if (process.env.OPENAI_API_KEY && process.env.OPENAI_API_KEY !== 'sk-your-openai-api-key-here') {
    try {
      // Simple check - verify key format (starts with sk-)
      if (process.env.OPENAI_API_KEY.startsWith('sk-')) {
        dependencies.openai = { status: 'healthy', message: 'API key configured' };
      } else {
        dependencies.openai = { status: 'unhealthy', message: 'Invalid API key format' };
      }
    } catch (error) {
      dependencies.openai = { status: 'unhealthy', message: error.message };
    }
  } else {
    dependencies.openai = { status: 'unhealthy', message: 'API key not configured' };
  }

  // Check Google Vision API
  if (MOCK_MODE) {
    dependencies.googleVision = { status: 'skipped', message: 'Mock mode enabled' };
  } else if (visionClient) {
    dependencies.googleVision = { status: 'healthy', message: 'Client initialized' };
  } else {
    dependencies.googleVision = { status: 'unhealthy', message: 'Client not initialized' };
  }

  // Check database (when implemented)
  if (process.env.DB_HOST) {
    dependencies.database = { status: 'not_implemented', message: 'Database driver not installed' };
  }

  // Check Redis (when implemented)
  if (process.env.REDIS_HOST) {
    dependencies.redis = { status: 'not_implemented', message: 'Redis client not installed' };
  }

  return dependencies;
}

// Liveness: always 200, report status in body
app.get('/api/health', async (req, res) => {
  const healthStatus = monitoring.getHealthStatus();
  const dependencies = await checkDependencyHealth();
  const allHealthy = Object.values(dependencies).every(dep => 
    dep.status === 'healthy' || dep.status === 'skipped' || dep.status === 'not_implemented'
  );
  const overallStatus = allHealthy ? 'healthy' : 'degraded';
  res.status(200).json({ 
    status: overallStatus,
    ...healthStatus,
    mockMode: MOCK_MODE,
    dependencies,
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// Readiness: return 503 only if dependencies are not ready
app.get('/api/ready', async (req, res) => {
  const dependencies = await checkDependencyHealth();
  const allHealthy = Object.values(dependencies).every(dep => dep.status === 'healthy' || dep.status === 'skipped');
  res.status(allHealthy ? 200 : 503).json({
    status: allHealthy ? 'ready' : 'not_ready',
    dependencies,
    timestamp: new Date().toISOString()
  });
});

/**
 * @swagger
 * /api/metrics:
 *   get:
 *     summary: Get application metrics
 *     description: Returns detailed application metrics and performance data
 *     tags: [System]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Metrics retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 requests:
 *                   type: object
 *                   properties:
 *                     total:
 *                       type: integer
 *                     successful:
 *                       type: integer
 *                     failed:
 *                       type: integer
 *                     averageResponseTime:
 *                       type: integer
 *                 errors:
 *                   type: object
 *                 users:
 *                   type: object
 *                 recommendations:
 *                   type: object
 *                 uptime:
 *                   type: integer
 *                 uptimeFormatted:
 *                   type: string
 *                 timestamp:
 *                   type: string
 *                   format: date-time
 *       401:
 *         description: Unauthorized
 */
app.get('/api/metrics', authenticateToken, requireRole('admin'), (req, res) => {
  res.json(monitoring.getMetrics());
});

// Authentication routes
/**
 * @swagger
 * /api/auth/register:
 *   post:
 *     summary: Register a new user
 *     description: Create a new user account with email and password
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: user@example.com
 *               password:
 *                 type: string
 *                 minLength: 8
 *                 example: SecurePass123!
 *               firstName:
 *                 type: string
 *                 example: John
 *               lastName:
 *                 type: string
 *                 example: Doe
 *     responses:
 *       201:
 *         description: User registered successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 user:
 *                   $ref: '#/components/schemas/User'
 *                 accessToken:
 *                   type: string
 *                   description: JWT access token
 *                 refreshToken:
 *                   type: string
 *                   description: JWT refresh token
 *                 requestId:
 *                   type: string
 *                   description: Unique request identifier
 *       400:
 *         description: Bad request - validation error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
app.post('/api/auth/register', validateRegistrationRequest, handleValidationErrors, async (req, res) => {
  const requestStartTime = Date.now();
  const requestId = generateRequestId();
  
  RequestLogger.logRequestStart('register', requestId, { email: req.body.email });
  
  try {
    const { email, password, firstName, lastName } = req.body;
    
    if (!email || !password) {
      const responseTime = Date.now() - requestStartTime;
      RequestLogger.logRequestError('register', requestId, responseTime, 'Missing email or password');
      
      return res.status(400).json({ 
        error: 'Email and password are required',
        requestId 
      });
    }

    const result = await userService.registerUser(email, password, {
      firstName,
      lastName
    });

    const responseTime = Date.now() - requestStartTime;
    RequestLogger.logRequestSuccess('register', requestId, responseTime, {
      userId: RequestLogger.hashUserId(result.user.id)
    });
    
    res.status(201).json({
      success: true,
      user: result.user,
      accessToken: result.accessToken,
      refreshToken: result.refreshToken,
      requestId
    });
    
  } catch (error) {
    const responseTime = Date.now() - requestStartTime;
    RequestLogger.logRequestError('register', requestId, responseTime, error);
    
    res.status(400).json({
      error: error.message,
      requestId
    });
  }
});

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: Login user
 *     description: Authenticate a user with email and password and receive access/refresh tokens
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: user@example.com
 *               password:
 *                 type: string
 *                 minLength: 8
 *                 example: SecurePass123!
 *     responses:
 *       200:
 *         description: Login successful
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 user:
 *                   $ref: '#/components/schemas/User'
 *                 accessToken:
 *                   type: string
 *                   description: JWT access token (valid for 15 minutes)
 *                 refreshToken:
 *                   type: string
 *                   description: JWT refresh token (valid for 7 days)
 *                 requestId:
 *                   type: string
 *       401:
 *         description: Authentication failed - invalid credentials
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       400:
 *         description: Bad request - missing required fields
 */
app.post('/api/auth/login', validateLoginRequest, handleValidationErrors, async (req, res) => {
  const requestStartTime = Date.now();
  const requestId = generateRequestId();
  
  RequestLogger.logRequestStart('login', requestId, { email: req.body.email });
  
  try {
    const { email, password } = req.body;
    
    if (!email || !password) {
      const responseTime = Date.now() - requestStartTime;
      RequestLogger.logRequestError('login', requestId, responseTime, 'Missing email or password');
      
      return res.status(400).json({ 
        error: 'Email and password are required',
        requestId 
      });
    }

    const result = await userService.loginUser(email, password);

    const responseTime = Date.now() - requestStartTime;
    RequestLogger.logRequestSuccess('login', requestId, responseTime, {
      userId: RequestLogger.hashUserId(result.user.id)
    });
    
    res.json({
      success: true,
      user: result.user,
      accessToken: result.accessToken,
      refreshToken: result.refreshToken,
      requestId
    });
    
  } catch (error) {
    const responseTime = Date.now() - requestStartTime;
    RequestLogger.logRequestError('login', requestId, responseTime, error);
    
    res.status(401).json({
      error: error.message,
      requestId
    });
  }
});

/**
 * @swagger
 * /api/auth/refresh:
 *   post:
 *     summary: Refresh access token
 *     description: Get a new access token using a valid refresh token
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - refreshToken
 *             properties:
 *               refreshToken:
 *                 type: string
 *                 description: Valid refresh token
 *                 example: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
 *     responses:
 *       200:
 *         description: Tokens refreshed successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 accessToken:
 *                   type: string
 *                   description: New JWT access token
 *                 refreshToken:
 *                   type: string
 *                   description: New JWT refresh token
 *                 requestId:
 *                   type: string
 *       401:
 *         description: Invalid or expired refresh token
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
app.post('/api/auth/refresh', validateRefreshRequest, handleValidationErrors, async (req, res) => {
  const requestStartTime = Date.now();
  const requestId = generateRequestId();
  
  try {
    const { refreshToken } = req.body;
    
    if (!refreshToken) {
      return res.status(400).json({ 
        error: 'Refresh token is required',
        requestId 
      });
    }

    const result = await userService.refreshAccessToken(refreshToken);

    const responseTime = Date.now() - requestStartTime;
    RequestLogger.logRequestSuccess('refresh', requestId, responseTime);
    
    res.json({
      success: true,
      accessToken: result.accessToken,
      refreshToken: result.refreshToken,
      requestId
    });
    
  } catch (error) {
    const responseTime = Date.now() - requestStartTime;
    RequestLogger.logRequestError('refresh', requestId, responseTime, error);
    
    res.status(401).json({
      error: error.message,
      requestId
    });
  }
});

/**
 * @swagger
 * /api/auth/logout:
 *   post:
 *     summary: Logout user
 *     description: Invalidate the current user's refresh token
 *     tags: [Authentication]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Logout successful
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Logged out successfully
 *                 requestId:
 *                   type: string
 *       401:
 *         description: Unauthorized - invalid or missing token
 *       500:
 *         description: Server error during logout
 */
app.post('/api/auth/logout', authenticateToken, async (req, res) => {
  const requestStartTime = Date.now();
  const requestId = generateRequestId();
  
  try {
    await userService.logoutUser(req.user.userId);

    const responseTime = Date.now() - requestStartTime;
    RequestLogger.logRequestSuccess('logout', requestId, responseTime, {
      userId: RequestLogger.hashUserId(req.user.userId)
    });
    
    res.json({
      success: true,
      message: 'Logged out successfully',
      requestId
    });
    
  } catch (error) {
    const responseTime = Date.now() - requestStartTime;
    RequestLogger.logRequestError('logout', requestId, responseTime, error);
    
    res.status(500).json({
      error: 'Logout failed',
      requestId
    });
  }
});

/**
 * @swagger
 * /api/auth/me:
 *   get:
 *     summary: Get current user information
 *     description: Retrieve the authenticated user's profile information
 *     tags: [Authentication]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User information retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 user:
 *                   $ref: '#/components/schemas/User'
 *                 requestId:
 *                   type: string
 *       401:
 *         description: Unauthorized - invalid or missing token
 *       404:
 *         description: User not found
 */
app.get('/api/auth/me', userInfoLimiter, authenticateToken, async (req, res) => {
  const requestStartTime = Date.now();
  const requestId = generateRequestId();
  
  try {
    const user = await userService.getUserById(req.user.userId);

    const responseTime = Date.now() - requestStartTime;
    RequestLogger.logRequestSuccess('getUser', requestId, responseTime, {
      userId: RequestLogger.hashUserId(req.user.userId)
    });
    
    res.json({
      success: true,
      user,
      requestId
    });
    
  } catch (error) {
    const responseTime = Date.now() - requestStartTime;
    RequestLogger.logRequestError('getUser', requestId, responseTime, error);
    
    res.status(404).json({
      error: 'User not found',
      requestId
    });
  }
});

/**
 * @swagger
 * /api/recommendations:
 *   post:
 *     summary: Get wine recommendations for a dish
 *     description: Get AI-powered wine recommendations based on a dish and optional user preferences
 *     tags: [Wine Recommendations]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - dish
 *             properties:
 *               dish:
 *                 type: string
 *                 minLength: 1
 *                 maxLength: 500
 *                 description: The dish or food item for wine recommendations
 *                 example: Ribeye steak with creamed spinach
 *               preferences:
 *                 $ref: '#/components/schemas/UserPreferences'
 *     responses:
 *       200:
 *         description: Wine recommendations retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/WineRecommendationResponse'
 *       400:
 *         description: Bad request - validation error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       429:
 *         description: Too many requests - rate limit exceeded
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
app.post('/api/recommendations', 
  validateRecommendationRequest, 
  handleValidationErrors,
  async (req, res) => {
    const requestStartTime = Date.now();
    const requestId = generateRequestId();
    
    RequestLogger.logRequestStart('recommendations', requestId, { 
      dish: req.body.dish,
      hasPreferences: !!req.body.preferences 
    });
    
    try {
      const { dish, preferences } = req.body;
      
      if (!dish) {
        const responseTime = Date.now() - requestStartTime;
        RequestLogger.logRequestError('recommendations', requestId, responseTime, 'Missing dish parameter');
        return res.status(400).json({ error: 'Dish parameter is required', requestId });
      }

      if (MOCK_MODE) {
        logger.debug('Using mock mode for recommendations', { requestId, dish });
        const mockResponse = mockData.find(item => 
          item.dish.toLowerCase().includes(dish.toLowerCase()) ||
          dish.toLowerCase().includes(item.dish.toLowerCase())
        ) || mockData[0];
        
        const responseTime = Date.now() - requestStartTime;
        RequestLogger.logRequestSuccess('recommendations', requestId, responseTime, { mode: 'mock' });
        monitoring.trackRecommendation(dish, true, responseTime);
        
        return res.json(mockResponse);
      }

      logger.debug('Using live mode - calling OpenAI API', { requestId, dish });
      
      // Check if OpenAI API key is configured
      if (!process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY === 'sk-your-openai-api-key-here') {
        logger.warn('OpenAI API key not configured, falling back to mock data', { requestId });
        const mockResponse = mockData[0];
        return res.json(mockResponse);
      }

      // Build enhanced prompt with preferences
      let enhancedPrompt = MASTER_SOMMELIER_PROMPT.replace('[INSERT DISH HERE]', dish);
      
      if (preferences) {
        logger.debug('Building enhanced prompt with preferences', { requestId });
        
        // Map preferences to readable format
        const preferenceMap = {
          budget: preferences.budget || 'any',
          region: preferences.region || 'any',
          explore: preferences.explore || 'false',
          grape: preferences.grape ? preferences.grape.join(', ') : 'any',
          style: preferences.style ? preferences.style.join(', ') : 'any',
          occasion: preferences.occasion || 'any',
          retail: preferences.retail || 'any',
          aging: preferences.aging || 'any',
          pairing: preferences.pairing || 'any'
        };
        
        enhancedPrompt += '\n\nUSER PREFERENCES:\n';
        enhancedPrompt += '- Budget Range: ' + preferenceMap.budget + '\n';
        enhancedPrompt += '- Preferred Region: ' + preferenceMap.region + '\n';
        enhancedPrompt += '- Explore New Regions: ' + preferenceMap.explore + '\n';
        enhancedPrompt += '- Preferred Grape Varieties: ' + preferenceMap.grape + '\n';
        enhancedPrompt += '- Wine Style: ' + preferenceMap.style + '\n';
        enhancedPrompt += '- Occasion: ' + preferenceMap.occasion + '\n';
        enhancedPrompt += '- Retailer Accessibility: ' + preferenceMap.retail + '\n';
        enhancedPrompt += '- Aging Preference: ' + preferenceMap.aging + '\n';
        enhancedPrompt += '- Food Pairing: ' + preferenceMap.pairing + '\n';
        
        enhancedPrompt += '\nIMPORTANT INSTRUCTIONS FOR PREFERENCE INTEGRATION:\n';
        enhancedPrompt += '1. Tailor your recommendations to match these preferences while maintaining the three-tier price structure (high, medium, low)\n';
        enhancedPrompt += '2. If preferences conflict with optimal food pairing, prioritize the food pairing but explain the reasoning\n';
        enhancedPrompt += '3. You MUST explain how preferences influenced your selections in the rationale for each wine\n';
        enhancedPrompt += '4. If no specific budget is provided, recommend wines at their actual market prices without artificial constraints\n';
        enhancedPrompt += '5. Do not default to arbitrary price ranges - use realistic market prices\n';
        enhancedPrompt += '6. If you cannot find wines that match the user\'s specific preferences, be honest about limitations\n';
        enhancedPrompt += '7. When providing specific wine names, ensure they are real, existing wines from actual producers\n';
        enhancedPrompt += '8. If uncertain about a wine\'s existence or details, use archetype recommendations instead\n';
        enhancedPrompt += '9. For the occasion "' + preferenceMap.occasion + '", adjust the tone and formality of your recommendations\n';
        enhancedPrompt += '10. For the region "' + preferenceMap.region + '", prioritize wines from this region when possible\n';
        enhancedPrompt += '11. For the grape varieties "' + preferenceMap.grape + '", prioritize these grapes when possible\n';
        enhancedPrompt += '12. Provide realistic market prices based on current retail values, not arbitrary ranges\n';
        enhancedPrompt += '13. If no specific budget is provided, use actual market prices for each wine\n';
      }
      
      logger.debug('Calling OpenAI API', { requestId, dish, promptLength: enhancedPrompt.length });
      
      const openaiStartTime = Date.now();
      
      // Call OpenAI API
      const openai = new OpenAI({
        apiKey: process.env.OPENAI_API_KEY,
      });

      const completion = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content: enhancedPrompt
          },
          {
            role: "user", 
            content: `Please provide wine recommendations for: ${dish}`
          }
        ],
        temperature: 0.7,
        max_tokens: 2000,
      });

      const openaiResponseTime = Date.now() - openaiStartTime;
      RequestLogger.logExternalApiCall('openai', requestId, openaiResponseTime);

      logger.debug('OpenAI API response received', { requestId });
      
      // Parse the response
      let responseData;
      try {
        let responseText = completion.choices[0].message.content;
        
        // Extract JSON from markdown code blocks if present
        if (responseText.includes('```json')) {
          logger.debug('Extracting JSON from markdown code block', { requestId });
          const jsonMatch = responseText.match(/```json\s*([\s\S]*?)\s*```/);
          if (jsonMatch) {
            responseText = jsonMatch[1];
          }
        } else if (responseText.includes('```')) {
          logger.debug('Extracting JSON from generic code block', { requestId });
          const jsonMatch = responseText.match(/```\s*([\s\S]*?)\s*```/);
          if (jsonMatch) {
            responseText = jsonMatch[1];
          }
        }
        
        responseData = JSON.parse(responseText);
        logger.debug('Successfully parsed OpenAI response', { requestId });
      } catch (parseError) {
        logger.error('Error parsing OpenAI response', { requestId, error: parseError.message });
        
        // Fallback to mock data if parsing fails
        const mockResponse = mockData[0];
        return res.json(mockResponse);
      }
      
      const totalResponseTime = Date.now() - requestStartTime;
      RequestLogger.logRequestSuccess('recommendations', requestId, totalResponseTime, {
        mode: 'live',
        openaiTime: openaiResponseTime
      });
      
      // Track successful recommendation
      monitoring.trackRecommendation(dish, true, totalResponseTime);
      
      res.json(responseData);
      
    } catch (error) {
      const responseTime = Date.now() - requestStartTime;
      
      // Enhanced error logging
      if (error.status) {
        logger.error('OpenAI API error', {
          requestId,
          error: error.message,
          status: error.status,
          responseTime
        });
      } else {
        RequestLogger.logRequestError('recommendations', requestId, responseTime, error);
      }
      
      // Track error
      monitoring.trackError(error, req);
      
      // Track failed recommendation
      monitoring.trackRecommendation(req.body.dish || 'unknown', false, responseTime);
      
      // Fallback to mock data on any error
      logger.debug('Falling back to mock data due to error', { requestId });
      const mockResponse = mockData[0];
      res.json(mockResponse);
    }
  }
);

// Initialize Google Vision client
// Google Cloud credentials can be provided via:
// 1. Environment variables (GOOGLE_CLOUD_PROJECT_ID, GOOGLE_CLOUD_CLIENT_EMAIL, GOOGLE_CLOUD_PRIVATE_KEY)
// 2. GOOGLE_APPLICATION_CREDENTIALS pointing to a credentials file
// 3. Default credentials from the environment (gcloud CLI, GCE metadata service, etc.)
let visionClient = null;

if (process.env.MOCK_MODE !== 'true') {
  try {
    const visionConfig = {};
    
    // Use explicit credentials from environment variables if provided
    if (process.env.GOOGLE_CLOUD_PROJECT_ID) {
      visionConfig.projectId = process.env.GOOGLE_CLOUD_PROJECT_ID;
    }
    
    if (process.env.GOOGLE_CLOUD_CLIENT_EMAIL && process.env.GOOGLE_CLOUD_PRIVATE_KEY) {
      visionConfig.credentials = {
        client_email: process.env.GOOGLE_CLOUD_CLIENT_EMAIL,
        private_key: process.env.GOOGLE_CLOUD_PRIVATE_KEY.replace(/\\n/g, '\n'), // Handle escaped newlines
      };
    } else if (process.env.GOOGLE_APPLICATION_CREDENTIALS) {
      // Use credentials file path if specified
      visionConfig.keyFilename = process.env.GOOGLE_APPLICATION_CREDENTIALS;
      logger.info('Google Vision: Using credentials from GOOGLE_APPLICATION_CREDENTIALS');
    } else {
      // Let the library use default credentials (gcloud CLI, GCE metadata, etc.)
      logger.info('Google Vision: Using default credentials from environment');
    }
    
    visionClient = new ImageAnnotatorClient(visionConfig);
    logger.info('Google Vision client initialized successfully');
  } catch (error) {
    logger.error('Failed to initialize Google Vision client:', error);
    logger.warn('OCR endpoint will not be available. Set GOOGLE_CLOUD credentials or enable MOCK_MODE=true');
  }
} else {
  logger.info('Google Vision: Mock mode enabled - OCR will return mock data');
}

// Image compression function
async function compressImage(base64Image) {
  const sharp = require('sharp');
  
  // Convert base64 to buffer
  const imageBuffer = Buffer.from(base64Image, 'base64');
  
  // Compress image more aggressively
  const compressedBuffer = await sharp(imageBuffer)
    .resize(800, 800, { 
      fit: 'inside',
      withoutEnlargement: true 
    })
    .jpeg({ 
      quality: 60,
      progressive: true 
    })
    .toBuffer();
  
  // Convert back to base64
  return compressedBuffer.toString('base64');
}

/**
 * @swagger
 * /api/ocr/extract-text:
 *   post:
 *     summary: Extract text from image using OCR
 *     description: Uses Google Vision API to extract text from uploaded images
 *     tags: [OCR]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - image
 *             properties:
 *               image:
 *                 type: string
 *                 description: Base64 encoded image data
 *                 example: "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg=="
 *     responses:
 *       200:
 *         description: Text extracted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 text:
 *                   type: string
 *                   description: Extracted text from the image
 *                 confidence:
 *                   type: number
 *                   description: Confidence score of the OCR result
 *                 boundingBoxes:
 *                   type: array
 *                   description: Bounding boxes for detected text elements
 *       400:
 *         description: Bad request - missing image data
 *       500:
 *         description: Internal server error
 */
app.post('/api/ocr/extract-text', async (req, res) => {
  const requestStartTime = Date.now();
  const requestId = generateRequestId();
  
  RequestLogger.logRequestStart('ocr', requestId);
  
  try {
    const { image } = req.body;
    
    if (!image) {
      const responseTime = Date.now() - requestStartTime;
      RequestLogger.logRequestError('ocr', requestId, responseTime, 'Missing image data');
      
      return res.status(400).json({ 
        error: 'Image data is required',
        requestId 
      });
    }
    
    logger.debug('Processing OCR request', { requestId, imageLength: image.length });
    
    // Compress image if it's too large (> 200KB base64)
    let processedImage = image;
    if (image.length > 200000) {
      logger.debug('Image is large, compressing', { requestId, originalLength: image.length });
      try {
        processedImage = await compressImage(image);
        logger.debug('Image compressed successfully', { requestId, compressedLength: processedImage.length });
      } catch (compressError) {
        logger.warn('Image compression failed, using original', { requestId, error: compressError.message });
        processedImage = image;
      }
    }
    
    // Check if Vision client is available
    if (!visionClient) {
      logger.warn('Google Vision client not available - returning mock data', { requestId });
      const responseTime = Date.now() - requestStartTime;
      RequestLogger.logRequestSuccess('ocr', requestId, responseTime, { mock: true });
      
      return res.json({
        text: 'Mock OCR Text - Please configure Google Vision API credentials',
        confidence: 0.5,
        boundingBoxes: [],
        requestId,
        mock: true
      });
    }
    
    logger.debug('Calling Google Vision API', { requestId });
    const visionStartTime = Date.now();
    
    const [result] = await visionClient.textDetection({
      image: {
        content: processedImage,
      },
    });
    
    const visionResponseTime = Date.now() - visionStartTime;
    RequestLogger.logExternalApiCall('google-vision', requestId, visionResponseTime);
    
    const detections = result.textAnnotations;
    if (detections && detections.length > 0) {
      const textAnnotation = detections[0];
      const confidence = detections.reduce((sum, detection) => sum + (detection.confidence || 0), 0) / detections.length;
      
      const responseTime = Date.now() - requestStartTime;
      RequestLogger.logRequestSuccess('ocr', requestId, responseTime, {
        textLength: textAnnotation.description?.length || 0,
        confidence: Math.round(confidence * 100) / 100
      });
      
      res.json({
        text: textAnnotation.description || '',
        confidence,
        boundingBoxes: detections.slice(1).map(annotation => ({
          text: annotation.description || '',
          x: annotation.boundingPoly.vertices[0]?.x || 0,
          y: annotation.boundingPoly.vertices[0]?.y || 0,
          width: (annotation.boundingPoly.vertices[2]?.x || 0) - (annotation.boundingPoly.vertices[0]?.x || 0),
          height: (annotation.boundingPoly.vertices[2]?.y || 0) - (annotation.boundingPoly.vertices[0]?.y || 0),
        })),
        requestId
      });
    } else {
      const responseTime = Date.now() - requestStartTime;
      logger.info('No text detected in image', { requestId, responseTime });
      
      res.json({
        text: '',
        confidence: 0,
        boundingBoxes: [],
        requestId
      });
    }
  } catch (error) {
    const responseTime = Date.now() - requestStartTime;
    
    // Categorize error types for better handling
    let errorType = 'unknown';
    if (error.code === 'ENOTFOUND' || error.code === 'ECONNREFUSED') {
      errorType = 'network';
    } else if (error.code === 'CANCELLED') {
      errorType = 'timeout';
    } else if (error.message?.includes('invalid')) {
      errorType = 'invalid_input';
    }
    
    RequestLogger.logRequestError('ocr', requestId, responseTime, error);
    logger.error('OCR processing failed', { 
      requestId, 
      errorType, 
      error: error.message,
      responseTime 
    });
    
    res.status(500).json({ 
      error: 'OCR processing failed',
      requestId 
    });
  }
});

// 404 logger for unmatched routes (must be before error handler)
app.use((req, res, next) => {
  if (req.path.startsWith('/api')) {
    logger.warn('API 404 - route not found', {
      method: req.method,
      url: req.originalUrl,
      path: req.path,
      requestId: req.requestId,
      hasBody: !!req.body,
    });
    return res.status(404).json({ error: 'Not Found', requestId: req.requestId });
  }
  next();
});

// Error handling middleware (must be last, OUTSIDE app.listen)
app.use(secureErrorHandler);

app.listen(PORT, '0.0.0.0', () => {
  logger.info('PocketSomm Backend started', {
    port: PORT,
    mockMode: MOCK_MODE,
    openaiConfigured: !!process.env.OPENAI_API_KEY && process.env.OPENAI_API_KEY !== 'sk-your-openai-api-key-here',
    environment: process.env.NODE_ENV || 'development',
    rateLimit: `${process.env.RATE_LIMIT_MAX_REQUESTS || 100} requests per ${Math.ceil((parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000) / 1000 / 60)} minutes`
  });
  logger.info(`Health check: http://localhost:${PORT}/api/health`);
});