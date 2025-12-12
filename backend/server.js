require('dotenv').config();
require('./validateEnv'); // Validate environment before starting
const SecurityValidator = require('./securityValidator');
const express = require('express');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const { ipKeyGenerator } = require('express-rate-limit');
const helmet = require('helmet');
const Anthropic = require('@anthropic-ai/sdk');
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
const wineDatabaseService = require('./services/wineDatabaseService');
const { isFeatureEnabled } = require('./utils/featureFlags');
const { getFallbackResponse } = require('./utils/fallbackHandler');
const { normalizeResponse } = require('./utils/responseNormalizer');
const v7PromptService = require('./services/v7PromptService');
const wineRecommendationDatabaseService = require('./services/wineRecommendationDatabaseService');
const dishRecommendationDatabaseService = require('./services/dishRecommendationDatabaseService');
const sessionCleanupService = require('./services/sessionCleanupService');

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
      connectSrc: ["'self'", "https://api.anthropic.com"],
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
// Temporarily disable compression to debug connection issues
// app.use(compression());

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

// CORS configuration - allow both localhost, ngrok domains, and production domains
const allowedOrigins = (() => {
  const env = (process.env.ALLOWED_ORIGINS || '').split(',').map(s => s.trim()).filter(Boolean);
  const defaults = [
    // Development origins
    'http://localhost:3000',
    'http://localhost:19006',
    'https://localhost:3000',
    'https://localhost:19006',
    'exp://127.0.0.1:8081',
    'exp://localhost:8081',
    // Production domains (aperae.com)
    'https://www.aperae.com',
    'https://api.aperae.com',
    'https://staging.aperae.com',
    'https://staging-api.aperae.com'
  ];
  // If ALLOWED_ORIGINS is set, use it; otherwise use defaults
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

// =============================================================================
// GENERAL WINE RECOMMENDATION PROMPT (Home Screen)
// =============================================================================
const GENERAL_SOMMELIER_PROMPT = `ROLE: You are a Master Sommelier (CMS IV, WSET 4, and ISG certified) with 15+ years experience in food-wine pairing science.

EXPERTISE: You are deeply knowledgeable in classic European appellations such as Bordeaux and Burgundy, while equally skilled in exploring New World and emerging regions worldwide. Your recommendations reflect mastery of food science, flavor pairing principles, vintage variation, and terroir expression, ensuring both traditional authority and global perspective.

TASK: For the dish: [INSERT DISH HERE], provide exactly three wines—high price, medium price, and low price—using producer, cuvée, and vintage where available.

CORE PAIRING PRINCIPLES (MANDATORY - APPLY IN ORDER)

1. DISH ANALYSIS (Complete Before Recommending)

Analyze the dish for:

- Dominant Weight/Richness: Light, medium, or heavy (from fat, protein, cooking method)

- Primary Flavor Profile: Sweet, salty, sour, bitter, umami (identify dominant)

- Fat/Oil Content: None, low, medium, high

- Protein Type & Preparation: Raw, grilled, roasted, braised, fried (determines tannin needs)

- Sauce/Seasoning: The PRIMARY determinant of wine structure needed

- Spice Level: None, mild, moderate, hot

- Acidity Level: Low, medium, high

2. PAIRING SCIENCE RULES (NEVER VIOLATE)

A. Weight & Intensity Matching

- Match wine body to dish richness (light→light, heavy→heavy)

- Consider sauce/preparation as primary weight determinant

B. Acidity Management

- High-acid wines REQUIRED for: fatty/oily/rich/fried dishes, salty dishes

- Acid cuts richness and enhances fruit perception

C. Tannin-Protein Binding

- High tannins ONLY with: fatty red meats, grilled/charred proteins

- AVOID tannins with: delicate fish, vegetables, bitter/umami-heavy dishes

- When tannins clash, choose fruit-forward, low-tannin alternatives

D. Sweetness Hierarchy

- Wine MUST be sweeter than dessert/sweet dish components

- Off-dry/sweet wines with moderate-hot spice levels

- Lower alcohol helps with spice

E. Bitterness & Umami

- AVOID high-tannin wines with bitter greens, charred vegetables, soy, mushrooms

- Select: low-tannin, high-acid, fruit-forward wines for umami-rich dishes

F. Flavor Bridging

- Echo herbs, spices, cooking methods in wine aromatics

- Match regional cuisines with regional wines when possible

3. PREFERENCE INTEGRATION HIERARCHY

When user preferences are provided:

1. FIRST: Apply pairing science principles (non-negotiable)

2. THEN: Satisfy preferences within scientifically sound options

3. IF CONFLICT: Choose best pairing and explain why preference doesn't work

Example: If user wants "bold Cabernet" with delicate fish, recommend appropriate wine and explain: "While you prefer bold reds, the delicate fish requires a lighter wine to avoid overwhelming it. Consider this [alternative] that respects both your taste and the pairing science."

RECOMMENDATION PROCESS

STEP 1: Analyze Dish (Internal - Not in Output)

- Identify dominant weight, fat, protein, sauce, spice, acidity

- List applicable pairing principles

- Identify potential pairing conflicts

STEP 2: Select Wines

- Choose wines that satisfy ALL applicable pairing principles

- Apply user preferences within valid options

- Vary price tiers: Budget ($15-30), Moderate ($30-60), Premium ($60-150), or match user-specified range

STEP 3: Validate Each Recommendation

- Confirm wine characteristics match dish requirements

- Verify no principle violations

- Assign confidence score:

  - 90-100: Perfect pairing adherence + high data certainty + preference match

  - 80-89: Solid pairing + minor data uncertainty OR preference compromise

  - 70-79: Acceptable pairing + significant uncertainty OR preference conflict

  - <70: Pairing concerns or major data gaps

DATA ACCURACY RULES

Wine Identification

- ONLY recommend wines you confidently know from training data

- NEVER invent producer names, wine names, or vintages

- Use "unknown" for uncertain data

Expert Ratings

- Format: "[score] [(Publication Name)]" (e.g., "95 (Wine Spectator)")

- ONLY provide if certain of specific wine AND vintage

- NEVER estimate, interpolate, or use phrases like "typically scores"

- Use "unknown" if uncertain

Pricing & Vintages

- Use realistic current market prices

- Specify vintage only if certain (use "NV" for non-vintage, "unknown" if uncertain)

- If pricing uncertain, use "unknown" and reduce confidence by 10-15 points

OUTPUT REQUIREMENTS

Rationale (40-80 words, 2-4 sentences)

MUST include:

1. Specific pairing principle(s) applied: Name the principle and explain how wine satisfies it

2. Flavor/texture interaction: Describe specific wine components (acidity, tannins, fruit) interacting with specific dish elements

3. Body/weight balance: Explain structural match

4. Preference integration (if applicable): How selection respects user preferences

Example: "This wine's bright citrus acidity (Acidity–Fat Cleansing principle) cuts through the salmon's natural oils while its medium body matches the dish's moderate richness (Weight Matching). The wine's stone fruit notes bridge the herb crust, creating harmonious flavor layers."

NOT: "This wine pairs nicely with the dish and complements the flavors."

Tasting Notes

- Aromas: Specific descriptors (e.g., "green apple, wet stone, white pepper")

- Palate: Structure, flavors, texture (e.g., "crisp acidity, minerality, citrus pith")

- Finish: Length and character (e.g., "clean, mineral-driven, lingering")

Serving Guidance

- Exact temperature range: "45-50°F" (not "chilled")

- Specific glassware: "Burgundy glass", "Bordeaux glass", "universal white wine glass"

- Decanting if needed: "Decant 30 minutes to soften tannins"

RESPONSE FORMAT:

Please respond with ONLY a valid JSON object in this exact format. Do NOT wrap it in markdown code blocks (e.g., no markdown, no code blocks, no additional text before or after):

{
  "dish": "exact dish name",
  "dishAnalysis": {
    "dominantWeight": "light/medium/heavy",
    "fatContent": "none/low/medium/high",
    "primaryProtein": "type and preparation",
    "dominantFlavors": ["sweet", "salty", "umami"],
    "spiceLevel": "none/mild/moderate/hot",
    "applicablePrinciples": ["Weight Matching", "Acidity-Fat Cleansing"]
  },
  "recommendations": [
    {
      "tierLabel": "Premium Selection / Moderate Choice / Budget-Friendly",
      "wineName": "specific name OR 'unknown'",
      "producer": "specific producer OR 'unknown'",
      "vintage": "YYYY OR 'NV' OR 'unknown'",
      "pricePoint": "Realistic market price in format '$XX' OR 'unknown'",
      "category": "Sparkling/White Wine/Red Wine/Rosé/Dessert",
      "rationale": "40-80 words explaining pairing principles, specific interactions, and preference integration",
      "pairingPrinciplesApplied": ["Weight Matching", "Acidity-Fat Cleansing"],
      "tastingNotes": "Specific aromas, palate characteristics, structure, and finish - be specific not generic",
      "servingGuidance": "Specific temperature range (e.g., '45-50°F'), glassware type (e.g., 'Burgundy glass'), and decanting needs if applicable",
      "confidenceScore": 85,
      "confidenceRationale": "Brief explanation of score",
      "expertRating": "'XX (Publication)' OR 'unknown'",
      "retailerSuggestion": "Specific retailer names OR general suggestion based on accessibility preferences",
      "image": "unknown",
      "storytellingElements": "Vineyard/terroir history, pairing moments, seasonal context - tailored to occasion if specified"
    }
  ],
  "closingNarrative": " Short, immersive summary (2-3 sentences) on overall pairing experience, blending aroma, flavor, texture, and storytelling. MUST acknowledge how user preferences influenced selections if provided.",
  "pairingNotes": "Any important considerations or alternatives"
}

## CRITICAL RULES

- NO markdown formatting in output (no code blocks)

- NO text before or after JSON

- Apply ALL relevant pairing principles before considering preferences

- Explain any preference conflicts clearly

- Use "unknown" for uncertain data (never null/empty)

- Confidence score must reflect pairing quality AND data certainty

## DISCLAIMER

"Based on established food-wine pairing principles — consult a certified sommelier for formal advice. Prices and ratings are estimates and may vary."`;

// =============================================================================
// ENHANCED WINE RECOMMENDATION PROMPT (Enhanced version with structured output)
// =============================================================================
const ENHANCED_SOMMELIER_PROMPT = `ROLE: You are a Master Sommelier (CMS IV, WSET 4, and ISG certified) with 15+ years of experience in global wine regions, food-wine pairing science, sensory analysis, and culinary compatibility. Your recommendations reflect mastery of food science, flavor pairing principles, vintage variation, and terroir expression.

SPEED OPTIMIZATION (CRITICAL): Keep all responses EXTREMELY CONCISE. Use minimal words, essential info only. Target: <25 seconds response time. Abbreviate where possible. Skip verbose explanations.

TASK: For the dish: [Insert dish here], recommend exactly three wines (Premium, Moderate, Budget-Friendly) using deterministic, scientifically grounded reasoning. Never hallucinate wine names, producers, vintages, or details. When uncertain, use "unknown."

CORE PAIRING PRINCIPLES (MANDATORY - APPLY IN ORDER)

1. DISH ANALYSIS (Complete Before Recommending)

Analyze the dish for:

- Dominant Weight: Light / medium / heavy (from fat, protein, cooking method)

- Primary Flavor Profile: Sweet / salty / sour / bitter / umami (identify dominant)

- Fat/Oil Content: None / low / medium / high

- Protein Type & Preparation: Raw / grilled / roasted / braised / fried (determines tannin needs)

- Sauce/Seasoning: PRIMARY determinant of wine structure

- Spice: None / mild / moderate / hot

- Acidity: Low / medium / high

Identify: 

- keyChallenge (single most critical pairing constraint)

- idealProfile (acidity, tannin, body, sweetness, aromatic notes)

2. PAIRING PRINCIPLES (NEVER VIOLATE)

A. Weight & Intensity Matching: Match wine body to dish richness; consider sauce/preparation as primary weight determinant

B. Acidity Management: High-acid wines REQUIRED for fatty, oily, rich, fried, salty dishes

C. Tannin-Protein Binding:

- High tannins ONLY with: fatty red meats, grilled/charred proteins

- AVOID tannins with: delicate fish, vegetables, bitter/umami-heavy dishes

- When tannins clash, choose fruit-forward, low-tannin alternatives

D. Sweetness Hierarchy:

- Wine MUST be sweeter than any sweet dish components

- Off-dry helps with moderate-hot spice levels; Lower alcohol reduces heat

E. Bitterness & Umami:

- AVOID high-tannin wines with bitter greens, char, soy, mushrooms

- Select: low-tannin, high-acid, fruit-forward wines

F. Flavor Bridging:

- Echo herbs, spices, cooking methods in wine aromatics

- Regional pairing = tiebreaker only, never primary criterion

G. Typicity Enforcement (Anti-Hallucination):

Never violate global typicity norms, e.g.:

- No high-tannin Gamay

- No tropical/creamy oak in Chablis

- No petrol in Chardonnay

- No high-acid Zinfandel

- No sweet Sancerre

- No bold tannins in Pinot Noir

If typicity conflict arises, use "unknown".

3. TIER CLASSIFICATION RULES

Use signal counting, strict fallbacks, and never infer details. Examples illustrate patterns but must not be used as automatic classification by region alone. The model must always validate actual signals.

Premium Selection:

2+ signals OR wine is an unmistakably high-tier global prestige bottle.

A. Classification Signals:

•	Grand Cru, Premier Cru, Grosse Lage, Erste Lage

•	Barolo/Barbaresco DOCG; Brunello di Montalcino; Bolgheri Superiore

•	Bordeaux Classified Growth (any 1855 rank); St-Émilion Grand Cru Classé

•	Rioja Gran Reserva; Priorat DOCa flagship sites

•	Champagne Prestige Cuvée; top Grower RM bottlings

•	Renowned New World single-vineyard bottlings (Napa, Sonoma, Oregon, Barossa, Uco Valley)

B. Producer / Style Signals:

•	Long-standing, widely recognized estate with >15 years of documented, consistent critical acclaim

•	Limited-production estate bottling (<5,000 cases typical)

•	Extended aging requirements (Barolo, Brunello, Gran Reserva minimums)

•	Single-vineyard from a demonstrably world-class terroir

Premium Fallback Rule: If the wine is an internationally recognized flagship or prestige cuvée, classify as Premium even if full data is unavailable but only if known with high certainty. If producer or vineyard data is missing, Premium requires 2+ unquestionable classification signals.

Moderate Choice:

Assign when 2+ signals are present:

A. Classification Signals

•	Village-level Burgundy, Chablis, Northern or Southern Rhône

•	Cru Bourgeois; Bordeaux satellite AOCs

•	Rioja or Ribera del Duero Reserva

•	Italian DOC with distinct cuvée or site designation

•	Crémant, Cava Reserva, Franciacorta, NV Champagne

•	Recognized AVA or sub-AVA (e.g., Willamette Valley, Russian River Valley, Sta. Rita Hills)

•	Identifiable regional GIs (Clare Valley, Marlborough, Central Otago)

•	Sub-regional Chile/Argentina (e.g., Casablanca, Gualtallary)

B. Producer / Style Signals

•	Reputable, regionally respected estate

•	Single-estate/domaine bottling

•	Distinct cuvée or site designation

•	Oak or lees-aging indicating higher craftsmanship

•	Prosecco Superiore DOCG

Moderate Fallback Rule: If the wine's varietal identity + terroir signal indicates mid-tier quality, classify as Moderate, even if vintage/producer specifics are missing.

Budget-Friendly:

Assign when any Budget signal is present OR when data is insufficient:

A. Classification Signals

•	Broad appellations (Vin de France, California, Toscana IGT)

•	Regional-level AOCs without village designation (Bourgogne, Côtes du Rhône)

•	Large AVAs or state-level designations

•	DO wines without specific site or aging classification

B. Producer / Style Signals

•	Large cooperative or mass-market brand

•	High-volume entry-tier cuvée

•	Tank-method sparkling (Prosecco DOC, basic Cava)

•	Unoaked, simple varietal wines

Budget Fallback Rule:

•	If classification, producer, site, or style data is incomplete or low-certainty, default to Budget-Friendly.

•	Rationale must explicitly state: "Limited classification data; using fallback safety tier."

UNKNOWN WINE HANDLING (Deterministic Rules)

•	Known appellation + unknown producer → classify based on appellation.

•	Known grape + broad region only → Budget-Friendly.

•	Unfamiliar or ambiguous wine data → Budget-Friendly + note uncertainty.

Prohibition: NEVER invent vineyards, producers, aging, or classifications.

4. CONFIDENCE SCORING

Score = Pairing Science (0–50) + Wine Knowledge (0–30) + Complexity Handling (0–20)

Each category floor = 0, cap = category max.

Total score cap = 100.

A. PAIRING SCIENCE (0–50)

Additive:

•	+30 All applicable principles satisfied (≥2 must clearly apply)

•	+10 No mandatory principles violations

•	+5 Explicit flavor bridge identified

•	+5 Accurate weight/body match

Deductions:

•	–15 Direct principle violation

•	–10 Incorrect acidity alignment

•	–10 Sweetness mismatch

•	–5 Missed flavor bridge 

•	–5 Principle name omitted in rationale

Safeguards:

•	If ANY violation occurs, Max Pairing Science = 30

•	Points only awarded when explicit principle names appear

B. WINE KNOWLEDGE (0–30)

Measures certainty of wine identity and reliability of attributes.

Additive:

•	+10 Producer confidently known

•	+10 Region/appellation confidently known

•	+10 Style typicity clearly recognized

Deductions:

•	–10 Producer unknown

•	–5 Region unknown

•	–5 Style uncertainty

•	–5 Vintage unknown (except NV, solera, multi-vintage)

Safeguards:

•	If producer + region + style all unknown → cap Wine Knowledge at 10.

•	If invented detail is detected → cap at 5.

•	Must not infer style/classification from region unless explicitly known.

C. COMPLEXITY HANDLING (0–20)

Determine element count using dishAnalysis fields only: protein + cooking method + sauce + seasoning + modifiers

Additive:

•	+20 Simple (1–2 elements)

•	+15 Moderate (3–4 elements)

•	+10 Complex (5+ elements)

•	+5 Conflicts successfully resolved

Deductions:

•	–10 Conflicts unaddressed (e.g., spicy + fatty mishandled)

•	–5 Complexity misinterpreted 

Safeguard: Complexity score cannot exceed category maximum.

D. INTERPRETATION

•	90–100: Exceptional match, high certainty

•	80–89: Strong match, reliable and balanced

•	70–79: Good match, minor gaps

•	60–69: Acceptable, notable compromises

•	<60: Low confidence, significant issues

TIER-CONFIDENCE ADJUSTMENT: 

- Weak/missing signals: -5 

- Fallback used: -5 to -10, acknowledge in rationale

5. OUTPUT ANTI-HALLUCINATION RULES

A. Hard Constraints:

1.	Do NOT invent wines. If uncertain: "unknown" for wineName, producer, or vintage.

2.	No fabricated tasting notes. Use aromas/structures consistent with grape + region.

3.	No invented vineyards, histories, or terroir details.

4.	ONLY recommend wines you confidently know from training data

B. Deterministic Wine Selection:

If multiple wines fit, choose based on ranked order:

1.	Structural match

2.	Typicity

3.	Regional classicism

4.	Common availability

C. Fail-Safe Mode:

If unable to confidently provide valid wines:

•	Set all wine identity fields to "unknown"

•	Score < 70

•	Explain uncertainty in confidenceRationale

D. PURCHASABILITY CONSTRAINT 

All wine recommendations must be realistically obtainable through standard retail channels. 

PERMITTED: 

- Current releases from active producers 

- Library releases sold by wineries 

- Wines available from major retailers (Wine.com, specialty shops, restaurant lists) 

- Recent vintages with documented market availability 

PROHIBITED:

- Auction-only wines (e.g., 1945 Mouton Rothschild, 1982 Petrus) 

- Defunct producers or discontinued labels 

- Vintages older than 15 years without confirmed retail stock 

- Wines that never had commercial distribution 

VINTAGE GUIDANCE BY TIER: 

- Premium: Last 8-10 years typical; recent vintages ensure retail availability 

- Moderate: Last 5-7 years typical 

- Budget-Friendly: Last 3-5 years typical 

- Exception: Non-vintage wines, aged styles (Vintage Port, mature Riesling, Barolo/Brunello with extended aging) 

If primary recommendation would be auction-only: 

1. Select more recent vintage from same producer 

2. Choose similar wine from different producer with confirmed availability 

3. Use "unknown" if no viable alternative exists

6. RECOMMENDATION PROCESS

STEP 1: Analyze Dish (Internal)

- Identify dominant weight, fat, protein, sauce, spice, acidity

- List applicable pairing principles

- Identify potential pairing conflicts

STEP 2: Select Wines

- Choose wines that satisfy ALL applicable pairing principles

- Vary tiers: Budget, Moderate, Premium 

STEP 3: Validate Each Recommendation

- Confirm wine characteristics match dish requirements

- Verify no principle violations

- Assign confidence score

7. OUTPUT REQUIREMENTS

Rationale (20-40 words, 1-2 sentences - BE EXTREMELY BRIEF):

1. Name the principles and explain how wine satisfies them

2. Describe specific wine components interacting with specific dish elements

Tasting Notes (MINIMAL - 1-2 descriptors per category):

- Aromas: 1-2 descriptors max (e.g., "green apple, wet stone")

- Palate: 1-2 key flavors max (e.g., "crisp acidity, citrus")

- Finish: Brief character (e.g., "clean, mineral")

Wine Identification:

- grape field: "Chardonnay (White)" or "Riesling (White, Off-Dry)" or "Pinot Noir (Red)" 

- Include sweetness for: off-dry whites, dessert wines, sweet sparkling 

- For blends: "Grenache Blend (Red)" or "Champagne Blend (Sparkling)"

Serving Guidance:

- Temperature: precise range with both units, e.g., "50-54F (10-12C)"

- Specific glassware: "Burgundy glass", "Bordeaux glass", "universal white wine glass"

- Decanting if needed

ALTERNATIVE RECOMMENDATIONS: 

CRITICAL: DO NOT include alternatives. Set "alternatives" to empty array [] for all recommendations. This saves tokens and speeds response.

(Previous instruction removed - alternatives not needed) 

- Satisfy the same pairing principles 

- Match the same tier classification 

- Offer similar structural profile (body, acidity, tannin) 

- Are from the same region OR same grape variety 

- Does not require detailed analysis output (name, producer, vintage, grape only) 

Selection criteria for alternatives: 

1. Same classification level (e.g., Premier Cru if primary is Premier Cru) 

2. Similar price point within tier 

3. Comparable typicity and style 

4. Preferably different producer (not just different vintage of same wine) 

5. Must meet purchasability requirements (not auction-only)

8. RESPONSE FORMAT:

Respond with ONLY a valid JSON object in this exact format (no markdown, no code blocks, no additional text before or after):

{
  "dish": "exact dish name provided by user",
  "dishAnalysis": {
    "dominantWeight": "light/medium/heavy",
    "fatContent": "none/low/medium/high",
    "primaryProtein": "type + preparation",
    "dominantFlavors": ["sweet", "salty", "sour", "bitter", "umami"],
    "spiceLevel": "none/mild/moderate/hot",
    "acidityLevel": "low/medium/high",
    "applicablePrinciples": ["Weight Matching", "Acidity–Fat Cleansing", "Tannin–Protein Binding", "Sweetness Hierarchy", "Bitterness & Umami Avoidance", "Flavor Bridging", "Regional Harmony"],
    "keyChallenge": " single most critical pairing constraint", 
    "idealProfile": {
      "acidity": "low/medium/high",
      "tannin": "none/low/medium/high",
      "body": "light/medium/full",
      "sweetness": "dry/off-dry/sweet",
      "notes": "preferred aromatic/structural traits"
    }
  },  
"recommendations": [
    {
      "tierLabel": "Premium Selection / Moderate Choice / Budget-Friendly",
      "tierRationale": "Concise justification using tier rules; note if fallback applied",
      "tierFallbackApplied": false,
      "wineName": "specific name OR 'unknown'",
      "producer": "specific producer OR 'unknown'",
      "region": "specific region OR 'unknown'",
      "vintage": "YYYY OR 'NV' OR 'unknown'",
      "grape": "e.g., 'Cabernet Sauvignon (Red Wine)'",
      "rationale": "20–40 word EXTREMELY BRIEF explanation referencing pairing principles (BE MINIMAL)",
      "pairingPrinciplesApplied": ["Weight Matching", "Acidity-Fat Cleansing"],
      "tastingNotes": {
        "aromas": ["specific descriptors"],
        "palate": "texture, structure, flavors, acidity, tannin, body",
        "finish": "length + character"
      },
      "servingGuidance": {
        "temperature": "58-62F (14-17C)",
        "glassware": "e.g., 'Bordeaux glass'",
        "decanting": "e.g., 'Decant 30 minutes' or 'No decant needed'"
      },
      "confidence": {
        "score": 0,
        "breakdown": {
          "pairingScience": 0,
          "wineKnowledge": 0,
          "complexityHandling": 0
        },
        "rationale": "explanation referencing scoring framework; state if fallback or missing data affected score"
      },
      "story": "1 brief sentence or omit if not essential",
      "alternatives": [] // DO NOT include any alternatives - keep this array empty 
    } 
  ],   
  "avoid": { 
    "types": ["wine types to avoid"], 
    "reason": "brief explanation why these fail (1 sentence)" 
  },
  "closingNarrative": "1 sentence summary or omit"
}

9. DATA INTEGRITY & ORIGINALITY (Copyright-Safe Mode)

PERMITTED (Safe to Use):

•	General wine knowledge: typicity of grapes, regions, climates, winemaking styles

•	Public-domain information: appellation systems (AOC/DOC/DOCG/AVA/IGP), legal classifications, permitted varieties

•	Documented producer names and non-expressive facts (location, grape, style, alcohol, aging regimen)

•	Standard tasting vocabulary in the public domain (simple sensory terms only, not critic-style composite phrases)

•	Broad historical or geographical context that is not tied to a proprietary narrative

PROHIBITED (High-Risk Content):

•	Verbatim or paraphrased tasting notes from critics, magazines, books, retailers, or wineries

•	Recreating or summarizing proprietary scoring systems (Parker, Spectator, Vinous, etc.)

•	Reproducing winery marketing stories, slogans, or unique narrative language

•	Fabricated facts presented as real data (invented vineyards, invented ratings, invented reviews)

•	Any text that resembles a known critic's expressive style or sequence of descriptors

ORIGINALITY REQUIREMENT:

Generate tasting notes from typicity rules only. Use simple, standard industry descriptors. Avoid distinctive expressions associated with specific critics.

NON-DERIVATION RULE:

Do not paraphrase any copyrighted review. All language must be new, generic, and non-derivative.

STORYTELLING LIMITATION:

Use only general, non-specific historical/geographical facts. Avoid proprietary winery narratives, importer descriptions, or marketing text.

SAFE HARBOR: If uncertain whether content may be proprietary: 

- Use grape variety + region + basic structural descriptors only 

- Use "Typical regional characteristics" in story field 

- Omit specific historical claims or anecdotes`;

// =============================================================================
// MENU-BASED WINE RECOMMENDATION PROMPT (Menu Screen)
// =============================================================================
const MENU_SOMMELIER_PROMPT = `ROLE: You are a certified Master Sommelier (CMS Level IV, WSET Level 4, ISG certified) with 15+ years of experience in fine dining and wine retail.

EXPERTISE: You are deeply knowledgeable in classic European appellations such as Bordeaux and Burgundy, while equally skilled in exploring New World and emerging regions worldwide. Your recommendations reflect mastery of food science, flavor pairing principles, vintage variation, and terroir expression, ensuring both traditional authority and global perspective.

TASK: Select exactly 3 wines from the restaurant menu below that best complement [INSERT DISH HERE]. Use EXACT wine names, producers, vintages, and prices as shown in the menu.

AVAILABLE WINES ON THE MENU:
[MENU_WINES_LIST]

CRITICAL INSTRUCTIONS FOR MENU RECOMMENDATIONS:

1. SELECTION CONSTRAINT:
   - You MUST select exactly 3 wines from the AVAILABLE WINES list above
   - DO NOT recommend wines not in this list
   - DO NOT suggest alternatives, "similar" wines, or wines "like" something on the menu
   - If the menu doesn't have ideal pairings, choose the BEST available options and explain why they work
   - Consider all wines on the menu before selecting your top 3

2. ACCURACY REQUIREMENTS (CRITICAL - NO EXCEPTIONS):
   - Wine Name: Use EXACT text from menu (preserve capitalization, punctuation, quotes, abbreviations)
   - Producer: Use EXACT text from menu (if menu shows "FAMIGLIA PASQUA" use exactly that)
   - Vintage: Use EXACT year from menu OR "NV" if menu shows "NV", "MV", or "Non-Vintage"
   - Price: Use EXACT price from menu in format shown (e.g., "$65", "$65.00", "$65/bottle")
   - Category: Use menu category if provided (preserve exact text)
   - Description: Preserve menu description text if used
   - DO NOT modify, "correct", enhance, or interpret menu information
   - If menu shows "Saint" but you know it's "Saint-Estèphe", use "Saint" as shown

3. PAIRING LOGIC FOR MENU WINES:
   - Prioritize wines that best complement [INSERT DISH HERE]
   - Consider: acidity (cuts richness), tannins (binds protein), body (matches dish weight), flavor profiles
   - Select wines that offer variety (different styles/price points) while all working with the dish
   - If menu has limited options, choose the best matches available and explain the pairing rationale clearly
   - Base selection on pairing quality, NOT on wine prestige or price

4. RATIONALE SPECIFICITY FOR MENU WINES (2-4 sentences, 40-80 words):
   - Explain WHY this specific wine works with [INSERT DISH HERE] using detailed flavor/texture interactions
   - Use specific descriptors: "citrus notes", "minerality", "herbal character", "bright acidity", "firm tannins"
   - Connect wine characteristics to specific dish elements (e.g., "the wine's citrus acidity cuts through the fish's natural oils")
   - Describe texture pairings (e.g., "the wine's medium body enhances the dish's delicate texture")
   - Avoid generic phrases like "pairs well" or "complements the dish" without explanation
   - Explain the pairing principle (acidity cuts richness, tannins bind protein, etc.)

5. CONFIDENCE SCORING FOR MENU WINES:
   - 90-100: Excellent pairing, wine perfectly matches dish characteristics
   - 80-89: Good pairing, wine works well with dish
   - 70-79: Acceptable pairing, wine works but not ideal match
   - Base confidence on pairing quality, NOT on wine quality or price
   - Even expensive wines can have lower confidence if they're not ideal for the dish

DATA ACCURACY & HALLUCINATION PREVENTION (CRITICAL):

1. EXPERT RATINGS FOR MENU WINES:
   - If you know the specific wine and vintage from menu, provide rating if confident
   - Format MUST be: "[score] - [Publication Name]" (e.g., "95 - Wine Spectator" or "94 - Wine Advocate")
   - DO NOT use formats like "95 points - Wine Spectator" or "94/100 - Wine Advocate"
   - Use ONLY the standardized format: "[score] - [Publication Name]"
   - OR: "unknown" if uncertain (do not guess)
   - NEVER invent, estimate, or interpolate critic scores
   - For obscure wines or uncertain vintages, use "unknown"

2. TASTING NOTES FOR MENU WINES:
   - Base on known characteristics of that specific wine/vintage if confident
   - Or describe general style characteristics of that wine type/region
   - Be specific: "green apple, lemon zest, white pepper" not "fruity and fresh"
   - Include structure, flavors, texture, and finish

TASTING NOTES REQUIREMENTS:
- Aromas: Specific notes (e.g., "green apple, lemon zest, white pepper")
- Palate: Structure, flavors, texture (e.g., "zesty with bright acidity, layers of stone fruit and cream")
- Finish: Length and character (e.g., "refreshing, mineral-driven finish")
- Base on known characteristics of the wine/vintage, or general style if uncertain

SERVING GUIDANCE FORMAT (BE SPECIFIC):
For white/rosé wines: "Serve chilled at 45-50°F in a [Chardonnay glass/universal white wine glass/Sauvignon Blanc glass]"
For red wines: "Serve at 60-65°F in a [Bordeaux glass/Burgundy glass/medium red wine glass]"
For sparkling wines: "Serve well-chilled at 45-48°F in a flute or coupe"
Include decanting if needed: "Decant for 30 minutes before serving to allow the wine to open up"
CRITICAL: Give exact temperature ranges (not "chilled" or "room temperature") and specify glassware type

PERSONALITY: Your tone should be professional yet approachable, educational without being condescending, and confident in your recommendations while acknowledging that personal taste may vary. Adapt your language appropriately for a restaurant setting.

RESPONSE FORMAT:

Please respond with ONLY a valid JSON object in this exact format (no markdown, no code blocks, no additional text before or after):

{
  "dish": "exact dish name as provided",
  "recommendations": [
    {
      "wineName": "EXACT wine name from menu (preserve capitalization, punctuation, quotes)",
      "producer": "EXACT producer name from menu",
      "vintage": "EXACT year from menu OR 'NV' if menu shows NV/MV",
      "pricePoint": "EXACT price from menu in format shown (e.g., '$65')",
      "rationale": "2-4 sentence detailed explanation with specific flavor interactions, texture pairings, and wine characteristics. 40-80 words. Reference the specific wine from menu.",
      "tastingNotes": "Specific aromas, palate characteristics, structure, and finish - based on known characteristics of this wine/vintage or general style",
      "servingGuidance": "Specific temperature range (e.g., '45-50°F'), glassware type (e.g., 'Burgundy glass'), and decanting needs if applicable",
      "confidenceScore": 85,
      "expertRating": "[score] - [Publication Name]" format (e.g., "95 - Wine Spectator" or "94 - Wine Advocate") OR "unknown" (NEVER estimate or guess),
      "category": "Wine category/type from menu (e.g., 'Sparkling', 'White Wine', 'Red Wine', 'Rosé')",
      "retailerSuggestion": "Available on the restaurant menu" OR specific retailer if known,
      "image": "unknown",
      "storytellingElements": "Vineyard/terroir history, pairing moments, seasonal context"
    }
  ],
  "closingNarrative": "Short summary (2-3 sentences) explaining why these 3 specific wines from the menu are the best choices for [INSERT DISH HERE], considering all available options."
}

CRITICAL JSON RULES:
- NO markdown formatting (no \`\`\`json or \`\`\` blocks)
- NO explanatory text before or after JSON
- ALL strings must be properly escaped (use double quotes)
- confidenceScore must be integer between 0-100
- Match EXACT formatting from menu (preserve capitalization, punctuation, quotes)
- If any field is uncertain, use "unknown" as string (not null, not empty)

Disclaimer: "Simulated expert opinion — consult a certified sommelier for formal advice. Prices and ratings are estimates and may vary by retailer and location."`;

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
 *                 anthropicConfigured:
 *                   type: boolean
 *                   description: Whether Anthropic API key is configured
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
    anthropic: { status: 'unknown', message: 'Not configured' },
    googleVision: { status: 'unknown', message: 'Not configured' }
  };

  // Check Anthropic API
  if (MOCK_MODE) {
    dependencies.anthropic = { status: 'skipped', message: 'Mock mode enabled' };
  } else if (process.env.ANTHROPIC_API_KEY && process.env.ANTHROPIC_API_KEY !== 'sk-ant-your-claude-api-key-here') {
    try {
      // Simple check - verify key format (starts with sk-ant-)
      if (process.env.ANTHROPIC_API_KEY.startsWith('sk-ant-')) {
        dependencies.anthropic = { status: 'healthy', message: 'API key configured' };
      } else {
        dependencies.anthropic = { status: 'unhealthy', message: 'Invalid API key format' };
      }
    } catch (error) {
      dependencies.anthropic = { status: 'unhealthy', message: error.message };
    }
  } else {
    dependencies.anthropic = { status: 'unhealthy', message: 'API key not configured' };
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
    }, req);

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

    const result = await userService.loginUser(email, password, req);

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
      const { dish, preferences, availableWines } = req.body;
      
      if (!dish) {
        const responseTime = Date.now() - requestStartTime;
        RequestLogger.logRequestError('recommendations', requestId, responseTime, 'Missing dish parameter');
        return res.status(400).json({ error: 'Dish parameter is required', requestId });
      }
      
      // Check if this is a menu context request (availableWines provided)
      const isMenuContext = availableWines && Array.isArray(availableWines) && availableWines.length > 0;
      if (isMenuContext) {
        logger.debug('Menu context detected - constraining recommendations to menu wines', { 
          requestId, 
          availableWinesCount: availableWines.length 
        });
      }

      if (MOCK_MODE) {
        logger.debug('Using mock mode for recommendations', { requestId, dish });
        const mockResponse = getFallbackResponse(dish, requestId);
        
        const responseTime = Date.now() - requestStartTime;
        const useEnhancedPrompt = isFeatureEnabled('ENABLE_ENHANCED_PROMPT');
        RequestLogger.logRequestSuccess('recommendations', requestId, responseTime, { 
          mode: 'mock',
          format: useEnhancedPrompt ? 'enhanced' : 'legacy'
        });
        monitoring.trackRecommendation(dish, true, responseTime);
        
        return res.json(mockResponse);
      }

      logger.debug('Using live mode - calling Claude API', { requestId, dish });
      
      // Check if Anthropic API key is configured
      if (!process.env.ANTHROPIC_API_KEY || process.env.ANTHROPIC_API_KEY === 'sk-ant-your-claude-api-key-here') {
        logger.warn('Anthropic API key not configured, falling back to mock data', { requestId });
        const mockResponse = getFallbackResponse(dish, requestId);
        return res.json(mockResponse);
      }

      // Build enhanced prompt - use appropriate prompt based on context
      let enhancedPrompt;
      let useV7PromptFlag = false; // Track if V7.0 prompt is being used
      
      if (isMenuContext) {
        // Use menu-specific prompt
        enhancedPrompt = MENU_SOMMELIER_PROMPT.replace('[INSERT DISH HERE]', dish);
        
        // Format available wines for the prompt
        let menuWinesList = '';
        availableWines.forEach((wine, index) => {
          const wineInfo = [];
          wineInfo.push(`${index + 1}. ${wine.wineName || 'Unknown Wine'}`);
          if (wine.producer && wine.producer !== 'Unknown Producer') {
            wineInfo.push(`Producer: ${wine.producer}`);
          }
          if (wine.vintage && wine.vintage !== 'NV') {
            wineInfo.push(`Vintage: ${wine.vintage}`);
          }
          if (wine.pricePoint && wine.pricePoint !== 'Price not listed') {
            wineInfo.push(`Price: ${wine.pricePoint}`);
          }
          if (wine.category) {
            wineInfo.push(`Type: ${wine.category}`);
          }
          if (wine.description) {
            wineInfo.push(`Notes: ${wine.description}`);
          }
          menuWinesList += wineInfo.join(' | ') + '\n';
        });
        
        // Replace menu wines placeholder and dish placeholder in closing narrative
        enhancedPrompt = enhancedPrompt.replace('[MENU_WINES_LIST]', menuWinesList);
        enhancedPrompt = enhancedPrompt.replace(/\[INSERT DISH HERE\]/g, dish);
      } else {
        // Check for V7.0 prompt first (highest priority)
        useV7PromptFlag = isFeatureEnabled('ENABLE_V7_PROMPT');
        
        if (useV7PromptFlag) {
          // Use V7.0 Master Sommelier Prompt with caching support
          // We'll handle the caching setup in the API call below
          enhancedPrompt = v7PromptService.buildV7PromptForDish(dish);
          logger.info('Using V7.0 Master Sommelier Prompt', { 
            requestId, 
            promptVersion: 'v7.0',
            dish
          });
        } else {
          // Use general recommendation prompt (check feature flag for enhanced version)
          const useEnhancedPrompt = isFeatureEnabled('ENABLE_ENHANCED_PROMPT');
          const activePrompt = useEnhancedPrompt 
            ? ENHANCED_SOMMELIER_PROMPT 
            : GENERAL_SOMMELIER_PROMPT;
          
          const promptVersion = useEnhancedPrompt ? 'enhanced' : 'legacy';
          logger.info(`Using prompt version: ${promptVersion}`, { 
            requestId, 
            version: promptVersion 
          });
          
          // Handle both placeholder formats
          enhancedPrompt = activePrompt.replace(/\[INSERT DISH HERE\]/gi, dish);
          enhancedPrompt = enhancedPrompt.replace(/\[Insert dish here\]/gi, dish);
        }
      }
      
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
      
      logger.debug('Calling Claude API', { requestId, dish, promptLength: enhancedPrompt.length });
      
      // ⚠️ TIMEOUT WARNING: ngrok free tier has a 30-second request timeout
      // Claude API calls typically take 55-60 seconds, which exceeds ngrok's limit
      // This will cause ngrok to return HTTP 503 (Service Unavailable) errors
      // 
      // Solutions:
      // 1. Use localhost for development (recommended - no timeout issues)
      // 2. Upgrade to ngrok paid tier ($8+/month - supports 5-minute timeouts)
      // 3. Use computer's IP address for physical devices on same WiFi
      // 4. Implement async processing (return job ID immediately, poll for results)
      //
      // See NGROK_TIMEOUT_LIMITATION.md for detailed documentation
      
      const claudeStartTime = Date.now();
      
      // Call Anthropic Claude API
      const anthropic = new Anthropic({
        apiKey: process.env.ANTHROPIC_API_KEY,
      });

      // Configure API parameters based on prompt version
      // (useV7PromptFlag already set above, and we don't use V7.0 for menu context)
      const useV7PromptForAPI = useV7PromptFlag && !isMenuContext;
      
      let apiConfig;
      
      if (useV7PromptForAPI) {
        // V7.0 with prompt caching - separate static and dynamic sections
        const promptParts = v7PromptService.buildV7PromptWithCaching(dish);
        
        apiConfig = {
          model: "claude-sonnet-4-5-20250929",
          system: promptParts.staticSystemPrompt,
          cache_control: {
            type: "ephemeral"
          },
          messages: [
            {
              role: "user",
              content: promptParts.dynamicUserMessage
            }
          ],
          max_tokens: 2000, // Reduced for optimization
          temperature: 0.5 // Lower for more deterministic responses
        };
        
        logger.debug('Using V7.0 with prompt caching', { 
          requestId,
          staticPromptLength: promptParts.staticSystemPrompt.length,
          dynamicPromptLength: promptParts.dynamicUserMessage.length,
          cachingEnabled: true
        });
      } else {
        // Original prompt (no caching)
        apiConfig = {
          model: "claude-sonnet-4-5-20250929",
          system: enhancedPrompt,
          messages: [
            {
              role: "user",
              content: `Provide wine recommendations for: ${dish}. Be EXTREMELY BRIEF - essential info only. Target <25s response.`
            }
          ],
          max_tokens: 2500,
          temperature: 0.7
        };
      }
      
      const message = await anthropic.messages.create(apiConfig);

      const claudeResponseTime = Date.now() - claudeStartTime;
      RequestLogger.logExternalApiCall('anthropic', requestId, claudeResponseTime);

      logger.debug('Claude API response received', { requestId });
      console.log('=== CLAUDE API RESPONSE RECEIVED ===');
      console.log('Request ID:', requestId);
      console.log('Response Time:', claudeResponseTime, 'ms');
      console.log('Stop Reason:', message.stop_reason || 'unknown');
      console.log('Message Keys:', Object.keys(message || {}));
      console.log('Has Content:', !!message.content);
      console.log('Content Length:', message.content?.length || 0);
      
      // Check if response was truncated
      if (message.stop_reason === 'max_tokens') {
        logger.warn('Claude response truncated due to max_tokens limit', { requestId });
        console.warn('⚠️ WARNING: Response was truncated due to max_tokens limit');
      }
      if (message.content && message.content.length > 0) {
        console.log('Content Types:', message.content.map(b => b?.type).join(', '));
        console.log('First Content Block:', JSON.stringify(message.content[0], null, 2).substring(0, 500));
      }
      console.log('Full Message (first 2000 chars):', JSON.stringify(message, null, 2).substring(0, 2000));
      console.log('====================================');
      
      // Parse the response
      let responseData;
      try {
        // Log raw message structure for debugging
        logger.debug('Claude API response structure', { 
          requestId,
          hasContent: !!message.content,
          contentLength: message.content?.length || 0,
          contentType: message.content?.map(b => b?.type).join(', ') || 'none',
          rawMessageKeys: Object.keys(message || {})
        });
        
        // Claude returns content as an array of text blocks
        let responseText = '';
        if (message.content && message.content.length > 0) {
          // Extract text from Claude's content array
          responseText = message.content
            .filter(block => block && block.type === 'text')
            .map(block => block.text || '')
            .join('');
        }
        
        // Check if response is empty
        if (!responseText || responseText.trim().length === 0) {
          throw new Error('Claude API returned empty response');
        }
        
        logger.debug('Extracted response text', { 
          requestId,
          textLength: responseText.length,
          textPreview: responseText.substring(0, 200)
        });
        
        // Extract JSON from markdown code blocks if present
        // Claude often wraps JSON in ```json ... ``` blocks
        const originalText = responseText;
        console.log('=== JSON EXTRACTION START ===');
        console.log('Original text length:', responseText.length);
        console.log('Original starts with:', responseText.substring(0, 100));
        console.log('Has ```json:', responseText.includes('```json'));
        console.log('Has ```:', responseText.includes('```'));
        
        // More robust extraction: handle both with and without closing backticks
        if (responseText.includes('```json')) {
          logger.debug('Extracting JSON from markdown code block', { requestId });
          
          // First, try to find the start of JSON (after ```json and optional newline/whitespace)
          const startPattern = /```json\s*/;
          const startMatch = responseText.match(startPattern);
          
          if (startMatch) {
            const startIndex = startMatch.index + startMatch[0].length;
            let extracted = responseText.substring(startIndex);
            
            // Try to find closing backticks
            const closingBackticks = extracted.match(/\n?```+\s*$/);
            if (closingBackticks) {
              // Remove closing backticks
              extracted = extracted.substring(0, extracted.length - closingBackticks[0].length);
            } else {
              // No closing backticks - remove any trailing backticks that might be at the end
              extracted = extracted.replace(/```+\s*$/, '');
            }
            
            responseText = extracted.trim();
            logger.debug('Extracted JSON from markdown block', { requestId });
            console.log('Extracted successfully, starts with:', responseText.substring(0, 50));
          } else {
            console.error('Could not find ```json start pattern');
          }
        } else if (responseText.includes('```')) {
          logger.debug('Extracting JSON from generic code block', { requestId });
          
          // Find the start (after first ```)
          const startPattern = /```\s*/;
          const startMatch = responseText.match(startPattern);
          
          if (startMatch) {
            const startIndex = startMatch.index + startMatch[0].length;
            let extracted = responseText.substring(startIndex);
            
            // Try to find closing backticks
            const closingBackticks = extracted.match(/\n?```+\s*$/);
            if (closingBackticks) {
              extracted = extracted.substring(0, extracted.length - closingBackticks[0].length);
            } else {
              extracted = extracted.replace(/```+\s*$/, '');
            }
            
            responseText = extracted.trim();
            logger.debug('Extracted JSON from generic code block', { requestId });
          }
        }
        
        // Final cleanup: remove any remaining leading/trailing backticks, newlines, or whitespace
        responseText = responseText
          .replace(/^```+\s*/, '')  // Remove leading backticks
          .replace(/\s*```+$/, '')  // Remove trailing backticks
          .replace(/^\s+/, '')      // Remove leading whitespace
          .replace(/\s+$/, '')      // Remove trailing whitespace
          .trim();
        
        console.log('Final extracted length:', responseText.length);
        console.log('Final extracted starts with:', responseText.substring(0, 50));
        console.log('=== JSON EXTRACTION END ===');
        
        // Log extraction result for debugging
        if (originalText && originalText !== responseText) {
          logger.debug('JSON extraction completed', {
            requestId,
            originalLength: originalText.length,
            extractedLength: responseText.length,
            extractedPreview: responseText.substring(0, 200)
          });
          console.log('=== JSON EXTRACTION ===');
          console.log('Original starts with:', originalText.substring(0, 50));
          console.log('Extracted starts with:', responseText.substring(0, 50));
          console.log('========================');
        }
        
        // Try to parse JSON
        try {
          responseData = JSON.parse(responseText);
          logger.debug('Successfully parsed Claude response', { requestId });
        } catch (jsonError) {
          // If JSON parsing fails, log the problematic text with full details
          const errorDetails = {
            requestId,
            jsonError: jsonError.message,
            jsonErrorStack: jsonError.stack,
            responseTextLength: responseText.length,
            responseTextStart: responseText.substring(0, 1000),
            responseTextEnd: responseText.substring(Math.max(0, responseText.length - 1000)),
            responseTextFull: responseText // Log full text for debugging
          };
          logger.error('JSON parse error - Full Details:', JSON.stringify(errorDetails, null, 2));
          console.error('=== JSON PARSE ERROR DETAILS ===');
          console.error('Request ID:', requestId);
          console.error('Error Message:', jsonError.message);
          console.error('Response Text Length:', responseText.length);
          console.error('Response Text (first 1000 chars):', responseText.substring(0, 1000));
          console.error('Response Text (last 1000 chars):', responseText.substring(Math.max(0, responseText.length - 1000)));
          console.error('Full Response Text:', responseText);
          console.error('==============================');
          throw jsonError;
        }
      } catch (parseError) {
        // Enhanced error logging with response details
        let responseText = '';
        try {
          if (message.content && message.content.length > 0) {
            responseText = message.content
              .filter(block => block.type === 'text')
              .map(block => block.text)
              .join('');
          }
        } catch (e) {
          responseText = 'Could not extract response text';
        }
        
        const messageStructure = {
          hasContent: !!message.content,
          contentLength: message.content?.length || 0,
          contentType: message.content?.map(b => b?.type).join(', ') || 'none',
          rawMessageKeys: Object.keys(message || {})
        };
        
        const errorDetails = {
          requestId, 
          error: parseError.message,
          parseErrorStack: parseError.stack,
          responseTextLength: responseText.length,
          responseTextPreview: responseText.substring(0, 2000), // First 2000 chars
          responseTextFull: responseText, // Full text
          messageContent: JSON.stringify(message.content || []).substring(0, 2000), // First 2000 chars of raw content
          messageStructure: messageStructure
        };
        logger.error('Error parsing Claude response - Full Details:', JSON.stringify(errorDetails, null, 2));
        console.error('=== CLAUDE RESPONSE PARSE ERROR ===');
        console.error('Request ID:', requestId);
        console.error('Error:', parseError.message);
        console.error('Stack:', parseError.stack);
        console.error('Response Text Length:', responseText.length);
        console.error('Response Text (first 2000 chars):', responseText.substring(0, 2000));
        console.error('Response Text (full):', responseText);
        console.error('Message Content:', JSON.stringify(message.content || [], null, 2));
        console.error('Message Structure:', JSON.stringify(messageStructure, null, 2));
        console.error('===================================');
        
        // Fallback to mock data if parsing fails
        const mockResponse = getFallbackResponse(dish, requestId);
        return res.json(mockResponse);
      }
      
      // Normalize response structure
      try {
        responseData = normalizeResponse(responseData);
        logger.debug('Response normalized successfully', { requestId });
      } catch (normalizeError) {
        logger.warn('Normalization warning, continuing with original response', {
          requestId,
          error: normalizeError.message
        });
        // Continue with original response - normalization is non-critical
      }
      
      // Store full response for database BEFORE sanitization
      const fullResponseForDB = JSON.parse(JSON.stringify(responseData));
      
      // Determine prompt version for database storage
      const promptVersion = useV7PromptFlag ? 'v7.0' : (isMenuContext ? 'menu' : (isFeatureEnabled('ENABLE_ENHANCED_PROMPT') ? 'enhanced' : 'legacy'));
      
      // Remove fields from V7.0 response before sending to client (Step 1 requirement)
      if (useV7PromptFlag) {
        try {
          responseData = v7PromptService.sanitizeForClient(responseData);
          logger.debug('V7.0 response sanitized - removed internal fields', { requestId });
        } catch (sanitizeError) {
          logger.warn('Failed to sanitize V7.0 response, continuing with full response', {
            requestId,
            error: sanitizeError.message
          });
          // Continue with original response if sanitization fails
        }
      }
      
      // Store recommendations in database (async, non-blocking)
      // Only store if we got a valid response with recommendations
      if (fullResponseForDB && fullResponseForDB.recommendations && Array.isArray(fullResponseForDB.recommendations)) {
        wineRecommendationDatabaseService.storeRecommendations(
          fullResponseForDB,
          requestId,
          claudeResponseTime,
          promptVersion
        ).then(result => {
          if (result.success) {
            logger.info('Recommendations stored to database', {
              requestId,
              insertedCount: result.insertedCount,
              executionTime: result.executionTime
            });
          } else {
            logger.warn('Failed to store recommendations to database', {
              requestId,
              error: result.error,
              insertedCount: result.insertedCount
            });
          }
        }).catch(dbError => {
          logger.error('Database storage error (non-blocking)', {
            requestId,
            error: dbError.message
          });
          // Don't fail the request if database storage fails
        });
      }
      
      // Enhance recommendations with wine database data and normalize formats
      if (responseData.recommendations && Array.isArray(responseData.recommendations)) {
        try {
          logger.debug('Enhancing recommendations with wine database', { requestId });
          responseData.recommendations = await wineDatabaseService.enhanceRecommendations(
            responseData.recommendations
          );
          logger.debug(`Enhanced ${responseData.recommendations.length} recommendations`, { requestId });
        } catch (error) {
          logger.warn('Failed to enhance recommendations with database, normalizing formats only', { 
            requestId, 
            error: error.message 
          });
          // Normalize expert ratings and add categories even if database enhancement fails
          responseData.recommendations = responseData.recommendations.map(rec => ({
            ...rec,
            expertRating: wineDatabaseService.normalizeExpertRating(rec.expertRating),
            category: rec.category || wineDatabaseService.inferCategory(rec)
          }));
        }
      }
      
      const totalResponseTime = Date.now() - requestStartTime;
      
      // Validate responseData before sending
      if (!responseData) {
        logger.error('responseData is null or undefined', { requestId });
        const mockResponse = getFallbackResponse(dish, requestId);
        return res.json(mockResponse);
      }
      
      if (!responseData.recommendations || !Array.isArray(responseData.recommendations)) {
        logger.error('Invalid responseData structure - missing recommendations array', { 
          requestId,
          hasRecommendations: !!responseData.recommendations,
          responseDataType: typeof responseData
        });
        const mockResponse = getFallbackResponse(dish, requestId);
        return res.json(mockResponse);
      }
      
      // Check if responseData can be serialized
      let serializedResponse;
      try {
        serializedResponse = JSON.stringify(responseData);
      logger.info('Response serialized successfully', { 
        requestId, 
        recommendationCount: responseData.recommendations.length,
        hasDish: !!responseData.dish,
        responseDataKeys: Object.keys(responseData),
        responseSize: serializedResponse.length,
        responseSizeKB: Math.round(serializedResponse.length / 1024)
      });
      
      // Log a sample of the response to verify structure
      if (responseData.recommendations && responseData.recommendations.length > 0) {
        const firstRec = responseData.recommendations[0];
        logger.debug('First recommendation sample', {
          requestId,
          hasWineName: !!firstRec.wineName,
          hasTastingNotes: !!firstRec.tastingNotes,
          tastingNotesType: typeof firstRec.tastingNotes,
          hasConfidence: !!firstRec.confidence,
          hasConfidenceScore: !!firstRec.confidenceScore
        });
      }
      } catch (serializeError) {
        logger.error('Failed to serialize responseData', { 
          requestId, 
          error: serializeError.message 
        });
        const mockResponse = getFallbackResponse(dish, requestId);
        return res.json(mockResponse);
      }
      
      RequestLogger.logRequestSuccess('recommendations', requestId, totalResponseTime, {
        mode: 'live',
        claudeTime: claudeResponseTime,
        enhanced: true,
        recommendationCount: responseData.recommendations.length
      });
      
      // Track successful recommendation
      monitoring.trackRecommendation(dish, true, totalResponseTime);
      
      // Add response event listeners to track what's happening
      res.on('finish', () => {
        logger.info('Response finished event fired', { 
          requestId,
          statusCode: res.statusCode,
          headersSent: res.headersSent
        });
      });
      
      res.on('close', () => {
        logger.info('Response close event fired', { 
          requestId,
          finished: res.finished
        });
      });
      
      res.on('error', (err) => {
        logger.error('Response error event fired', { 
          requestId,
          error: err.message,
          stack: err.stack
        });
      });
      
      try {
        // Set explicit content type and ensure headers are set
        res.setHeader('Content-Type', 'application/json');
        res.setHeader('Content-Length', serializedResponse.length);
        
        // Add keep-alive headers to prevent ngrok timeout
        res.setHeader('Connection', 'keep-alive');
        res.setHeader('Keep-Alive', 'timeout=120, max=1000');
        
        // Send periodic keep-alive packets during long operations
        // This helps prevent ngrok from timing out the connection
        if (req.socket && !req.socket.destroyed) {
          req.socket.setKeepAlive(true, 60000); // Enable keep-alive with 60s initial delay
          req.socket.setTimeout(120000); // Set socket timeout to 120 seconds
        }
        
        logger.info('Sending response with headers', { 
          requestId,
          contentLength: serializedResponse.length,
          responseSizeKB: Math.round(serializedResponse.length / 1024),
          headersSent: res.headersSent,
          contentEncoding: res.getHeader('Content-Encoding'),
          statusCode: res.statusCode || 200,
          socketDestroyed: req.socket.destroyed,
          socketReadable: req.socket.readable
        });
        
        // Check if socket is still valid
        if (req.socket.destroyed) {
          logger.error('Socket already destroyed before sending response', { requestId });
          return;
        }
        
        // Use res.send() with the serialized string instead of res.json()
        // This gives us more control and better error handling
        try {
          res.status(200).send(serializedResponse);
          logger.info('Response send() called successfully', { 
            requestId,
            finished: res.finished,
            headersSent: res.headersSent,
            socketDestroyed: req.socket.destroyed
          });
        } catch (sendErr) {
          logger.error('Error in res.send()', {
            requestId,
            error: sendErr.message,
            stack: sendErr.stack
          });
          throw sendErr;
        }
      } catch (sendError) {
        logger.error('Error sending response', { 
          requestId, 
          error: sendError.message,
          stack: sendError.stack,
          headersSent: res.headersSent
        });
        // Try to send error response
        if (!res.headersSent) {
          try {
            res.status(500).json({ 
              error: 'Failed to send response', 
              requestId 
            });
          } catch (fallbackError) {
            logger.error('Failed to send error response', {
              requestId,
              error: fallbackError.message
            });
          }
        }
      }
      
    } catch (error) {
      const responseTime = Date.now() - requestStartTime;
      
      // Enhanced error logging
      if (error.status) {
        logger.error('Claude API error', {
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
      logger.debug('Falling back to mock data due to error', { requestId, error: error.message });
      const mockResponse = getFallbackResponse(req.body.dish || 'unknown', requestId);
      try {
        if (!res.headersSent) {
          res.json(mockResponse);
          logger.info('Error fallback response sent', { requestId });
        } else {
          logger.error('Cannot send error fallback - headers already sent', { requestId });
        }
      } catch (sendError) {
        logger.error('Failed to send error fallback response', { 
          requestId, 
          error: sendError.message 
        });
      }
    }
  }
);

// =============================================================================
// DISH RECOMMENDATIONS ENDPOINT (Wine-to-Dish Pairing)
// =============================================================================
/**
 * @swagger
 * /api/dish-recommendations:
 *   post:
 *     summary: Get dish recommendations for a wine
 *     description: Get AI-powered dish recommendations based on a wine bottle (reverse pairing)
 *     tags: [Dish Recommendations]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - wine
 *             properties:
 *               wine:
 *                 type: string
 *                 minLength: 1
 *                 maxLength: 500
 *                 description: The wine bottle name (e.g., "2016 Clos de Oro Malbec Reserva")
 *                 example: 2016 Clos de Oro Malbec Reserva
 *     responses:
 *       200:
 *         description: Dish recommendations retrieved successfully
 *       400:
 *         description: Bad request - validation error
 *       429:
 *         description: Too many requests - rate limit exceeded
 *       500:
 *         description: Internal server error
 */
app.post('/api/dish-recommendations',
  async (req, res) => {
    const requestStartTime = Date.now();
    const requestId = generateRequestId();
    
    RequestLogger.logRequestStart('dish-recommendations', requestId, { 
      wine: req.body.wine
    });
    
    try {
      const { wine } = req.body;
      
      if (!wine) {
        const responseTime = Date.now() - requestStartTime;
        RequestLogger.logRequestError('dish-recommendations', requestId, responseTime, 'Missing wine parameter');
        return res.status(400).json({ error: 'Wine parameter is required', requestId });
      }
      
      // TODO: Implement Master Chef Prompt V1.0 API call here
      // For now, this endpoint will store responses to database once the Master Chef prompt is implemented
      // Once the Master Chef prompt is implemented, replace mockResponseData with actual Claude API response
      
      logger.debug('Dish recommendations request received', { requestId, wine });
      
      // Placeholder response structure - replace with actual Claude API call
      // This matches the expected structure from dishService.ts
      const mockResponseData = {
        wine: wine,
        wineAnalysis: {
          producer: "unknown",
          region: "unknown",
          vintage: "unknown",
          vintageAge: "unknown",
          color: "red",
          structure: {
            body: "medium",
            acidity: "medium",
            acidType: "balanced",
            tannin: "medium",
            tanninCharacter: "polished",
            sweetness: "dry",
            abv: "13.5%"
          },
          aromaticProfile: {
            primaryAromas: [],
            secondaryAromas: [],
            tertiaryAromas: [],
            dominantCompounds: []
          },
          keyStrength: "Placeholder - will be replaced with actual analysis",
          idealDishProfile: "Placeholder - will be replaced with actual analysis"
        },
        wineServingGuidance: {
          temperature: "58-62°F (14-17°C)",
          glassware: "Bordeaux or Universal red wine glass",
          decanting: "30 minutes recommended"
        },
        dishRecommendations: []
      };
      
      const claudeResponseTime = Date.now() - requestStartTime;
      const promptVersion = 'master-chef-v1.0';
      
      // Store full response for database BEFORE any modifications
      const fullResponseForDB = JSON.parse(JSON.stringify(mockResponseData));
      
      // Store dish recommendations in database (async, non-blocking)
      // Only store if we got a valid response with dishRecommendations
      if (fullResponseForDB && fullResponseForDB.dishRecommendations && Array.isArray(fullResponseForDB.dishRecommendations) && fullResponseForDB.dishRecommendations.length > 0) {
        dishRecommendationDatabaseService.saveRecommendations(
          fullResponseForDB,
          requestId,
          claudeResponseTime,
          promptVersion
        ).then(result => {
          if (result.success) {
            logger.info('Dish recommendations stored to database', {
              requestId,
              insertedCount: result.insertedCount,
              durationMs: result.durationMs
            });
          } else {
            logger.warn('Failed to store dish recommendations to database', {
              requestId,
              error: result.error,
              insertedCount: result.insertedCount
            });
          }
        }).catch(dbError => {
          logger.error('Database storage error (non-blocking)', {
            requestId,
            error: dbError.message,
            stack: dbError.stack
          });
          // Don't fail the request if database storage fails
        });
      } else {
        logger.debug('Skipping database storage - no dish recommendations in response', {
          requestId,
          hasDishRecommendations: !!(fullResponseForDB && fullResponseForDB.dishRecommendations),
          isArray: Array.isArray(fullResponseForDB?.dishRecommendations),
          length: fullResponseForDB?.dishRecommendations?.length || 0
        });
      }
      
      const totalResponseTime = Date.now() - requestStartTime;
      
      RequestLogger.logRequestSuccess('dish-recommendations', requestId, totalResponseTime, {
        mode: 'live',
        claudeTime: claudeResponseTime,
        recommendationCount: mockResponseData.dishRecommendations.length
      });
      
      res.json(mockResponseData);
      
    } catch (error) {
      const responseTime = Date.now() - requestStartTime;
      RequestLogger.logRequestError('dish-recommendations', requestId, responseTime, error);
      logger.error('Dish recommendations request failed', {
        requestId,
        error: error.message,
        stack: error.stack
      });
      
      res.status(500).json({
        error: 'Failed to get dish recommendations',
        requestId
      });
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
    
    // Google Vision API expects the image content as a Buffer
    // processedImage is base64 string, need to convert to Buffer
    const imageBuffer = Buffer.from(processedImage, 'base64');
    
    const [result] = await visionClient.textDetection({
      image: {
        content: imageBuffer,
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
      errorCode: error.code,
      errorStatus: error.status,
      errorDetails: error.details,
      stack: error.stack,
      responseTime 
    });
    
    // Include more error details in response for debugging
    res.status(500).json({ 
      error: 'OCR processing failed',
      errorMessage: error.message,
      errorCode: error.code || error.status,
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
    anthropicConfigured: !!process.env.ANTHROPIC_API_KEY && process.env.ANTHROPIC_API_KEY !== 'sk-ant-your-claude-api-key-here',
    environment: process.env.NODE_ENV || 'development',
    rateLimit: `${process.env.RATE_LIMIT_MAX_REQUESTS || 100} requests per ${Math.ceil((parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000) / 1000 / 60)} minutes`
  });
  logger.info(`Health check: http://localhost:${PORT}/api/health`);
  
  // Start periodic session cleanup (runs every 24 hours)
  if (process.env.NODE_ENV !== 'test') {
    sessionCleanupService.startPeriodicCleanup(24);
  }
});