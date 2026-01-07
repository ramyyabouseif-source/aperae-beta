# Pre-Production Code Audit Report
## Aperae (PocketSomm) - AI Wine Sommelier App

**Audit Date:** January 2025  
**Application Status:** MVP transitioning from DEV → PRODUCTION  
**User Base:** 15-50 beta users (US-only, cross-platform)  
**Budget:** ~$100/month  
**Team:** Solo Founder

---

## 1. EXECUTIVE SUMMARY

### Production Readiness Score: **72/100** (Updated after deeper review)

### Can this safely go live? **YES, WITH CONDITIONS**

**Critical blockers must be fixed before production deployment.** The application has a solid foundation with good security practices in many areas, but several critical security vulnerabilities and reliability issues need immediate attention.

### Platform-Specific Readiness:

- **Web (Windows/macOS/Linux):** ⚠️ **Ready with conditions** - Critical fixes required for error handling and token storage
- **iOS:** ⚠️ **Ready with conditions** - Requires error boundary improvements and SecureStore validation
- **Android:** ⚠️ **Ready with conditions** - Same as iOS, plus Android-specific permission handling

### Overall Assessment:

**Strengths:**
- Strong authentication foundation (bcrypt, JWT with refresh tokens)
- ✅ **Refresh token rotation already implemented** (security best practice)
- ✅ **Comprehensive input sanitization** (HTML, XSS protection)
- Good security headers (Helmet)
- Comprehensive rate limiting
- Privacy-compliant consent tracking
- Proper input validation
- Database schema well-designed with indexes
- Environment variable validation on startup

**Critical Gaps:**
- Missing global error handler for unhandled promise rejections
- No process-level error handlers
- Token storage on web uses localStorage (XSS vulnerable)
- Missing database connection error recovery
- Request timeout default is 60s (should be 85s for Render's 90s limit)
- CORS configuration allows too many origins in production
- Missing health check validation for critical dependencies
- Error handler uses console.error instead of logger

---

## 2. CRITICAL ISSUES (MUST FIX BEFORE PROD)

### 🔴 CRITICAL-1: Missing Unhandled Promise Rejection Handler

**Location:** `backend/server.js`  
**Severity:** CRITICAL  
**Platform Impact:** All (Backend)  
**Infrastructure Impact:** Render

**Issue:**
The server has no global handler for unhandled promise rejections. If an async function throws an error that isn't caught, the entire Node.js process will crash, causing downtime.

**Why it matters:**
- Unhandled promise rejections will crash the server
- Long-running AI requests (55-60s) are prone to timeouts/errors
- Render will restart the service, but users experience downtime
- No error tracking for these failures

**Evidence:**
```javascript
// backend/server.js - No process.on('unhandledRejection') handler found
// Only logger.exceptions.handle exists but may not catch all promise rejections
```

**Fix:**
```javascript
// Add to backend/server.js after logger initialization (around line 93)

// Global error handlers
process.on('unhandledRejection', (reason, promise) => {
  logger.error('Unhandled Promise Rejection', {
    reason: reason instanceof Error ? reason.message : String(reason),
    stack: reason instanceof Error ? reason.stack : undefined,
    promise: promise.toString()
  });
  // Don't exit in production - let Render handle restarts
  // But log for monitoring
});

process.on('uncaughtException', (error) => {
  logger.error('Uncaught Exception', {
    error: error.message,
    stack: error.stack
  });
  // Exit gracefully after logging
  process.exit(1);
});
```

**Estimated Time:** 15 minutes

---

### 🔴 CRITICAL-2: Web Token Storage Uses localStorage (XSS Vulnerability)

**Location:** `src/services/secureStorage.ts`  
**Severity:** CRITICAL  
**Platform Impact:** Web only  
**Infrastructure Impact:** All

**Issue:**
On web platforms, tokens are stored in `localStorage`, which is vulnerable to XSS attacks. If any JavaScript on the page is compromised, tokens can be stolen.

**Why it matters:**
- XSS vulnerabilities can steal user tokens
- localStorage is accessible to any JavaScript on the page
- No protection against XSS attacks
- Tokens persist even after browser close (security risk)

**Evidence:**
```typescript
// src/services/secureStorage.ts:18-21
if (Platform.OS === 'web') {
  // Web: Use localStorage with prefix
  const storageKey = this.WEB_STORAGE_PREFIX + key;
  localStorage.setItem(storageKey, value); // VULNERABLE TO XSS
}
```

**Fix:**
```typescript
// src/services/secureStorage.ts
// For web, use httpOnly cookies (backend must set cookies) OR sessionStorage with short TTL

static async setItem(key: string, value: string): Promise<void> {
  try {
    if (Platform.OS === 'web') {
      // Option 1: Use sessionStorage (cleared on tab close, still XSS vulnerable but better)
      // Option 2: Use httpOnly cookies (requires backend changes)
      // Option 3: Use memory-only storage (cleared on refresh, most secure but poor UX)
      
      // RECOMMENDED: Use sessionStorage for now, migrate to httpOnly cookies later
      const storageKey = this.WEB_STORAGE_PREFIX + key;
      sessionStorage.setItem(storageKey, value); // Better than localStorage
      
      // TODO: Migrate to httpOnly cookies for production
      // This requires backend to set Set-Cookie headers with httpOnly flag
    } else {
      await SecureStore.setItemAsync(key, value);
    }
  } catch (error) {
    console.error('Error storing secure item:', error);
    throw error;
  }
}
```

**Alternative (Better):** Implement httpOnly cookies for web:
1. Backend sets tokens in httpOnly cookies on login/refresh
2. Frontend reads from cookies (automatically sent with requests)
3. No JavaScript access = XSS protection

**Estimated Time:** 2-4 hours (sessionStorage quick fix) or 1 day (httpOnly cookies)

---

### 🔴 CRITICAL-3: Missing Database Connection Error Recovery

**Location:** `backend/prisma/client.js`  
**Severity:** CRITICAL  
**Platform Impact:** All (Backend)  
**Infrastructure Impact:** Supabase

**Issue:**
No error handling for database connection failures. If Supabase connection drops, the app will crash or hang indefinitely.

**Why it matters:**
- Supabase connection limits can be exceeded
- Network issues can cause connection failures
- No retry logic for failed queries
- Prisma client doesn't automatically reconnect

**Evidence:**
```javascript
// backend/prisma/client.js
const prisma = new PrismaClient({
  log: process.env.NODE_ENV === 'development' 
    ? ['query', 'error', 'warn'] 
    : ['error'],
  // No connection retry logic
  // No connection pool error handling
});
```

**Fix:**
```javascript
// backend/prisma/client.js
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient({
  log: process.env.NODE_ENV === 'development' 
    ? ['query', 'error', 'warn'] 
    : ['error'],
  // Add connection error handling
});

// Add connection health check
prisma.$connect().catch((error) => {
  logger.error('Failed to connect to database', { error: error.message });
  // Don't exit - let the app try to reconnect on next query
});

// Add query error handler wrapper
const originalQuery = prisma.$queryRaw;
prisma.$queryRaw = async function(...args) {
  try {
    return await originalQuery.apply(this, args);
  } catch (error) {
    if (error.code === 'P1001' || error.code === 'P1002') {
      // Connection error - try to reconnect
      logger.warn('Database connection lost, attempting reconnect');
      try {
        await prisma.$connect();
        // Retry the query once
        return await originalQuery.apply(this, args);
      } catch (retryError) {
        logger.error('Database reconnection failed', { error: retryError.message });
        throw new Error('Database connection failed. Please try again later.');
      }
    }
    throw error;
  }
};

// Handle graceful shutdown
process.on('beforeExit', async () => {
  await prisma.$disconnect();
});

process.on('SIGINT', async () => {
  await prisma.$disconnect();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  await prisma.$disconnect();
  process.exit(0);
});

module.exports = prisma;
```

**Estimated Time:** 2-3 hours

---

### 🔴 CRITICAL-4: CORS Configuration Too Permissive in Production

**Location:** `backend/server.js` (lines 117-210)  
**Severity:** CRITICAL  
**Platform Impact:** All (Backend)  
**Infrastructure Impact:** Render

**Issue:**
CORS configuration allows localhost, ngrok, and IP addresses even in production mode. This exposes the API to unauthorized origins.

**Why it matters:**
- Allows requests from any localhost origin (development leftover)
- ngrok pattern matching allows any ngrok subdomain
- IP address patterns allow local network access
- Production should only allow `www.aperae.com` and `aperae.com`

**Evidence:**
```javascript
// backend/server.js:136-210
const corsOptions = {
  origin: function (origin, callback) {
    // ...
    // Allows localhost in production!
    if (origin && origin.startsWith('http://localhost:')) {
      return callback(null, true);
    }
    // Allows ngrok in production!
    if (ngrokPattern.test(origin)) {
      return callback(null, true);
    }
    // Allows IP addresses in production!
    if (origin && /^https?:\/\/192\.168\.\d+\.\d+/.test(origin)) {
      return callback(null, true);
    }
  }
};
```

**Fix:**
```javascript
// backend/server.js
const corsOptions = {
  origin: function (origin, callback) {
    // In production, ONLY allow production domains
    if (process.env.NODE_ENV === 'production') {
      const productionOrigins = [
        'https://www.aperae.com',
        'https://aperae.com',
      ];
      
      // Allow requests with no origin (mobile apps, Postman, etc.)
      if (!origin) {
        return callback(null, true);
      }
      
      if (productionOrigins.includes(origin)) {
        logger.debug('CORS: Allowing production origin', { origin });
        return callback(null, true);
      }
      
      logger.warn('CORS: Rejected origin in production', { origin });
      return callback(new Error('Not allowed by CORS'));
    }
    
    // Development: Allow localhost, ngrok, etc.
    const allowedOrigins = [
      'http://localhost:3000',
      'http://localhost:19006',
      'https://localhost:3000',
      'https://localhost:19006',
      'exp://127.0.0.1:8081',
      'exp://localhost:8081',
      // Production domains for testing
      'https://www.aperae.com',
      'https://aperae.com',
    ];
    
    // Allow requests with no origin
    if (!origin) return callback(null, true);
    
    // Check exact match
    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    }
    
    // Check ngrok pattern (development only)
    const ngrokPattern = /^https:\/\/[a-z0-9]+\.ngrok-free\.app$/;
    if (ngrokPattern.test(origin)) {
      logger.debug('CORS: Allowing ngrok origin in development', { origin });
      return callback(null, true);
    }
    
    // Check localhost with any port (development only)
    if (origin.startsWith('http://localhost:') || origin.startsWith('https://localhost:')) {
      logger.debug('CORS: Allowing localhost origin in development', { origin });
      return callback(null, true);
    }
    
    logger.warn('CORS: Rejected origin', { origin, env: process.env.NODE_ENV });
    callback(new Error('Not allowed by CORS'));
  },
  credentials: true,
  optionsSuccessStatus: 200,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept', 'Origin', 'User-Agent'],
  exposedHeaders: ['X-API-Version', 'X-Request-ID']
};
```

**Estimated Time:** 30 minutes

---

### 🔴 CRITICAL-5: No Request Timeout for Long-Running AI Requests

**Location:** `backend/server.js`, `backend/timeoutMiddleware.js`  
**Severity:** CRITICAL  
**Platform Impact:** All (Backend)  
**Infrastructure Impact:** Render (90s timeout limit)

**Issue:**
AI recommendation requests can take 55-60 seconds, but there's no explicit timeout handling. Render has a 90-second timeout, so requests could be killed mid-process.

**Why it matters:**
- Render free tier has 90s request timeout
- AI requests take 55-60s (close to limit)
- No timeout handling means requests can be killed abruptly
- Users get no error message if timeout occurs

**Evidence:**
```javascript
// backend/server.js - No explicit timeout for /api/recommendations
// TimeoutMiddleware exists but may not be configured correctly
app.use('/api/recommendations', TimeoutMiddleware.create(timeoutConfig.recommendations));
```

**Fix:**
```javascript
// backend/timeoutMiddleware.js - Ensure timeout is set to 85s (5s buffer before Render's 90s)
static getTimeout() {
  return {
    recommendations: 85000, // 85 seconds (5s buffer before Render's 90s limit)
    ocr: 30000, // 30 seconds
    auth: 10000, // 10 seconds
    default: 30000 // 30 seconds
  };
}

// backend/server.js - Add explicit timeout error handling
app.post('/api/recommendations', async (req, res) => {
  const timeout = setTimeout(() => {
    if (!res.headersSent) {
      logger.warn('Request timeout - returning fallback', { requestId: req.requestId });
      const fallback = getFallbackResponse(req.body.dish, req.requestId, !!req.body.availableWines);
      res.status(200).json(fallback);
    }
  }, 85000); // 85 seconds
  
  try {
    // ... existing recommendation logic ...
    clearTimeout(timeout);
  } catch (error) {
    clearTimeout(timeout);
    // ... error handling ...
  }
});
```

**Estimated Time:** 1-2 hours

---

### 🔴 CRITICAL-6: Missing Health Check Validation for Critical Dependencies

**Location:** `backend/server.js` (lines 432-447)  
**Severity:** CRITICAL  
**Platform Impact:** All (Backend)  
**Infrastructure Impact:** Render

**Issue:**
Health check endpoint doesn't actually validate that critical services (database, Anthropic API) are working. It only checks if keys are configured.

**Why it matters:**
- Render uses health checks for auto-restart
- If database is down, health check still returns 200
- No way to detect degraded service state
- Users get errors but health check says "healthy"

**Evidence:**
```javascript
// backend/server.js:432-447
app.get('/api/health', async (req, res) => {
  const healthStatus = monitoring.getHealthStatus();
  const dependencies = await checkDependencyHealth();
  // checkDependencyHealth() only checks if keys exist, not if services work
  const allHealthy = Object.values(dependencies).every(dep => 
    dep.status === 'healthy' || dep.status === 'skipped' || dep.status === 'not_implemented'
  );
  // Always returns 200, even if database is down
  res.status(200).json({ status: overallStatus, ... });
});
```

**Fix:**
```javascript
// backend/server.js
async function checkDependencyHealth() {
  const dependencies = {
    database: { status: 'unknown', message: 'Not checked' },
    anthropic: { status: 'unknown', message: 'Not checked' },
    googleVision: { status: 'unknown', message: 'Not checked' }
  };

  // Actually test database connection
  try {
    await prisma.$queryRaw`SELECT 1`;
    dependencies.database = { status: 'healthy', message: 'Connected' };
  } catch (error) {
    dependencies.database = { status: 'unhealthy', message: error.message };
  }

  // Test Anthropic API (lightweight check)
  if (process.env.ANTHROPIC_API_KEY && !MOCK_MODE) {
    try {
      // Just validate key format, don't make actual API call (costs money)
      if (process.env.ANTHROPIC_API_KEY.startsWith('sk-ant-') && 
          process.env.ANTHROPIC_API_KEY.length > 20) {
        dependencies.anthropic = { status: 'healthy', message: 'API key configured' };
      } else {
        dependencies.anthropic = { status: 'unhealthy', message: 'Invalid API key format' };
      }
    } catch (error) {
      dependencies.anthropic = { status: 'unhealthy', message: error.message };
    }
  } else if (MOCK_MODE) {
    dependencies.anthropic = { status: 'skipped', message: 'Mock mode enabled' };
  } else {
    dependencies.anthropic = { status: 'unhealthy', message: 'API key not configured' };
  }

  // Test Google Vision (if configured)
  if (visionClient) {
    dependencies.googleVision = { status: 'healthy', message: 'Client initialized' };
  } else {
    dependencies.googleVision = { status: 'skipped', message: 'Not configured' };
  }

  return dependencies;
}

// Update health check to return 503 if critical dependencies are down
app.get('/api/health', async (req, res) => {
  const healthStatus = monitoring.getHealthStatus();
  const dependencies = await checkDependencyHealth();
  
  // Database is critical - if down, return 503
  const isDatabaseHealthy = dependencies.database.status === 'healthy';
  const isAnthropicHealthy = dependencies.anthropic.status === 'healthy' || 
                             dependencies.anthropic.status === 'skipped';
  
  const allCriticalHealthy = isDatabaseHealthy && isAnthropicHealthy;
  const statusCode = allCriticalHealthy ? 200 : 503;
  
  res.status(statusCode).json({ 
    status: allCriticalHealthy ? 'healthy' : 'degraded',
    ...healthStatus,
    mockMode: MOCK_MODE,
    dependencies,
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});
```

**Estimated Time:** 1-2 hours

---

## 3. HIGH PRIORITY ISSUES

### 🟠 HIGH-1: Missing Error Boundaries in React Native App

**Location:** `App.tsx`, React Native screens  
**Severity:** HIGH  
**Platform Impact:** iOS, Android, Web  
**Infrastructure Impact:** All

**Issue:**
Only one ErrorBoundary exists at the root level. Individual screens don't have error boundaries, so a crash in one screen can crash the entire app.

**Fix:**
```typescript
// src/components/ErrorBoundary.tsx - Enhance existing or create new
// Wrap each major screen in its own ErrorBoundary
```

**Estimated Time:** 2-3 hours

---

### 🟠 HIGH-2: No Rate Limiting on Frontend

**Location:** `src/services/wineService.ts`  
**Severity:** HIGH  
**Platform Impact:** All (Frontend)  
**Infrastructure Impact:** All

**Issue:**
Frontend can make unlimited API calls. If user spams the recommendation button, it will hit backend rate limits but provides poor UX.

**Fix:**
Add client-side rate limiting with exponential backoff.

**Estimated Time:** 2-3 hours

---

### 🟠 HIGH-3: Refresh Token Rotation - ✅ ALREADY IMPLEMENTED

**Location:** `backend/userService.js` (lines 255-267)  
**Severity:** HIGH (but already fixed!)  
**Platform Impact:** All  
**Infrastructure Impact:** All

**Status:** ✅ **ALREADY IMPLEMENTED**

**Evidence:**
Refresh token rotation is already implemented! When `refreshAccessToken()` is called, it:
1. Generates a NEW refresh token (line 257)
2. Updates the session with the new token hash (lines 261-267)
3. Invalidates the old token by replacing it

**Action Required:** None - this is already working correctly.

---

### 🟠 HIGH-4: Input Sanitization - ✅ MOSTLY IMPLEMENTED

**Location:** `backend/validation.js`  
**Severity:** MEDIUM (downgraded - mostly implemented)  
**Platform Impact:** All (Backend)  
**Infrastructure Impact:** All

**Status:** ✅ **MOSTLY IMPLEMENTED**

**Evidence:**
Input sanitization is already implemented in `validation.js`:
- HTML tag removal (line 18, 51, 117, etc.)
- JavaScript protocol removal (line 21, 54)
- Event handler removal (line 22, 55)
- Special character sanitization (line 25, 58)

**Remaining Issue:**
Some endpoints may not use the sanitization middleware. Verify all user input endpoints use `handleValidationErrors` middleware.

**Action Required:** 
1. Verify all endpoints use validation middleware
2. Add sanitization for any endpoints that don't use it

**Estimated Time:** 1-2 hours (verification and fixes)

---

### 🟠 HIGH-5: No Request ID Validation

**Location:** `backend/server.js`  
**Severity:** HIGH  
**Platform Impact:** All (Backend)  
**Infrastructure Impact:** All

**Issue:**
Request IDs are generated but not validated for uniqueness or format. Could lead to logging issues.

**Fix:**
Validate request ID format and ensure uniqueness (use UUID instead of random bytes).

**Estimated Time:** 1 hour

---

## 4. MEDIUM PRIORITY ISSUES

### 🟡 MEDIUM-1: Missing Database Indexes on Frequently Queried Fields

**Location:** `backend/prisma/schema.prisma`  
**Severity:** MEDIUM  
**Platform Impact:** All (Backend)  
**Infrastructure Impact:** Supabase

**Issue:**
Some frequently queried fields may be missing indexes (e.g., `WineRecommendation.request_id`, `MenuWine.wine_name`).

**Status:** Actually, indexes exist! ✅
- `WineRecommendation.request_id` has index (line 276)
- `MenuWine.wine_name` has index (line 312)

**Action:** Verify indexes are actually created in database.

**Estimated Time:** 30 minutes (verification)

---

### 🟡 MEDIUM-2: Error Handler Uses console.error Instead of Logger

**Location:** `backend/errorHandler.js` (line 4)  
**Severity:** MEDIUM  
**Platform Impact:** All (Backend)  
**Infrastructure Impact:** All

**Issue:**
Error handler uses `console.error` instead of the Winston logger, so errors aren't properly formatted or aggregated.

**Fix:**
```javascript
// backend/errorHandler.js
const logger = require('./logger');

const secureErrorHandler = (err, req, res, next) => {
  // Use logger instead of console.error
  logger.error('Request error', {
    error: err.message,
    stack: err.stack,
    name: err.name,
    requestId: req.requestId,
    method: req.method,
    url: req.url
  });
  
  // ... rest of handler
};
```

**Estimated Time:** 15 minutes

---

### 🟡 MEDIUM-3: No Logging for Failed Authentication Attempts

**Location:** `backend/server.js` (login endpoint)  
**Severity:** MEDIUM  
**Platform Impact:** All (Backend)  
**Infrastructure Impact:** All

**Issue:**
Failed login attempts are logged but may not include IP address for security monitoring.

**Fix:**
Verify security logging includes IP address for failed auth attempts.

**Estimated Time:** 30 minutes (verification)

---

### 🟡 MEDIUM-4: Missing Content Security Policy for Web

**Location:** `app.json`, Vercel configuration  
**Severity:** MEDIUM  
**Platform Impact:** Web  
**Infrastructure Impact:** Vercel

**Issue:**
No CSP headers for web deployment. XSS protection relies only on input validation.

**Fix:**
Add CSP headers via Vercel configuration or meta tags.

**Estimated Time:** 1-2 hours

---

### 🟡 MEDIUM-5: No Database Migration Rollback Strategy

**Location:** `backend/prisma/migrations/`  
**Severity:** MEDIUM  
**Platform Impact:** All (Backend)  
**Infrastructure Impact:** Supabase

**Issue:**
No documented process for rolling back failed migrations.

**Fix:**
Document migration rollback process and test it.

**Estimated Time:** 2-3 hours

---

### 🟡 MEDIUM-6: Missing API Response Caching

**Location:** `backend/server.js` (recommendations endpoint)  
**Severity:** MEDIUM  
**Platform Impact:** All (Backend)  
**Infrastructure Impact:** Render, Anthropic API costs

**Issue:**
No caching for identical recommendation requests. Same dish = same API call = wasted money.

**Fix:**
Add Redis or in-memory cache for identical requests (same dish + same preferences).

**Estimated Time:** 4-6 hours (if adding Redis) or 2-3 hours (in-memory cache)

---

## 5. LOW PRIORITY ISSUES

### 🟢 LOW-1: Verbose Logging in Production

**Location:** `backend/logger.js`  
**Severity:** LOW  
**Platform Impact:** All (Backend)  
**Infrastructure Impact:** Render (log storage costs)

**Issue:**
Some debug logs may be too verbose for production, increasing log storage costs.

**Fix:**
Review and reduce verbose logging in production mode.

**Estimated Time:** 1-2 hours

---

### 🟢 LOW-2: Security Logger Uses console Instead of Winston Logger

**Location:** `backend/securityLogger.js`  
**Severity:** LOW  
**Platform Impact:** All (Backend)  
**Infrastructure Impact:** Render

**Issue:**
Security logger uses `console.warn` and `console.log` instead of Winston logger, so security events aren't properly formatted or aggregated.

**Fix:**
```javascript
// backend/securityLogger.js
const logger = require('./logger');

const securityLogger = (req, res, next) => {
  const startTime = Date.now();
  
  res.on('finish', () => {
    const duration = Date.now() - startTime;
    
    // Log security-relevant events
    if (res.statusCode >= 400) {
      logger.warn('Security Event', {
        method: req.method,
        path: req.path,
        statusCode: res.statusCode,
        ip: req.ip,
        duration: `${duration}ms`,
        requestId: req.requestId
      });
    }
    
    // Log rate limit hits
    if (res.statusCode === 429) {
      logger.warn('Rate limit exceeded', {
        ip: req.ip,
        path: req.path,
        requestId: req.requestId
      });
    }
  });
  
  next();
};

module.exports = securityLogger;
```

**Estimated Time:** 15 minutes

---

### 🟢 LOW-3: Missing API Versioning Strategy

**Location:** `backend/server.js`  
**Severity:** LOW  
**Platform Impact:** All (Backend)  
**Infrastructure Impact:** All

**Issue:**
API versioning middleware exists but no clear versioning strategy for breaking changes.

**Fix:**
Document API versioning strategy.

**Estimated Time:** 1-2 hours

---

### 🟢 LOW-4: Missing CI/CD Pipeline

**Location:** `.github/workflows/` (doesn't exist)  
**Severity:** LOW  
**Platform Impact:** All  
**Infrastructure Impact:** All

**Issue:**
No GitHub Actions CI/CD pipeline exists. No automated testing, security scanning, or deployment checks.

**Fix:**
Create basic CI pipeline:
```yaml
# .github/workflows/ci.yml
name: CI
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - run: npm ci
      - run: cd backend && npm ci
      - run: npm audit
      - run: cd backend && npm audit
      - run: npm run lint
      - run: cd backend && npm test
```

**Estimated Time:** 1-2 hours

---

### 🟢 LOW-5: No Request Body Size Validation for Specific Endpoints

**Location:** `backend/server.js`  
**Severity:** LOW  
**Platform Impact:** All (Backend)  
**Infrastructure Impact:** Render

**Issue:**
Global 10MB limit for JSON, but OCR endpoint may need different limits.

**Status:** Actually handled! ✅ OCR has 10MB limit, other endpoints have 1MB.

**Action:** None needed.

---

## 6. SECURITY RISK TABLE

| Risk | Severity | Likelihood | Impact | Fix Effort | Affected Platforms | Affected Infrastructure |
|------|----------|------------|--------|------------|-------------------|------------------------|
| Unhandled promise rejections crash server | Critical | High | High | Low | All (Backend) | Render |
| XSS via localStorage token storage | Critical | Medium | High | Medium | Web | All |
| Database connection failures not handled | Critical | Medium | High | Medium | All (Backend) | Supabase |
| CORS too permissive in production | Critical | Low | High | Low | All (Backend) | Render |
| No timeout for long-running requests | Critical | High | Medium | Medium | All (Backend) | Render |
| Health check doesn't validate dependencies | Critical | Medium | Medium | Medium | All (Backend) | Render |
| Missing error boundaries | High | Medium | Medium | Medium | iOS, Android, Web | All |
| No frontend rate limiting | High | Low | Medium | Medium | All (Frontend) | All |
| Refresh token not rotated | High | Low | High | Medium | All | All | ✅ Already implemented |
| Missing input sanitization | Medium | Low | Medium | Low | All (Backend) | All | ✅ Mostly implemented |
| Missing database indexes | Medium | Low | Medium | Low | All (Backend) | Supabase |
| No failed auth logging | Medium | Low | Low | Low | All (Backend) | All |
| Missing CSP headers | Medium | Low | Low | Low | Web | Vercel |
| No migration rollback | Medium | Low | Medium | Medium | All (Backend) | Supabase |
| No API response caching | Medium | High | Low | High | All (Backend) | Render, Anthropic |
| Security logger uses console | Low | Low | Low | Low | All (Backend) | Render |
| Missing CI/CD pipeline | Low | Low | Low | Medium | All | All |

---

## 7. INFRASTRUCTURE-SPECIFIC RECOMMENDATIONS

### Render (Backend)

**Service Configuration:**
- ✅ Dockerfile is optimized
- ✅ Health check endpoint exists (`/api/health`)
- ⚠️ **FIX:** Health check must return 503 if database is down
- ⚠️ **FIX:** Add request timeout handling (85s for AI requests)

**Environment Variables:**
- ✅ Environment validation exists (`validateEnv.js`)
- ✅ Security validator checks for required secrets
- ⚠️ **VERIFY:** All secrets are set in Render dashboard (JWT_SECRET, REFRESH_SECRET, DATABASE_URL, ANTHROPIC_API_KEY)

**Logging:**
- ✅ Winston logger configured for JSON output
- ✅ Log redaction for sensitive data
- ⚠️ **MONITOR:** Check Render logs for unhandled errors

**Cost Optimization:**
- Current: Free tier (if applicable) or Starter plan
- **RECOMMENDATION:** Monitor memory usage - free tier has 512MB RAM limit
- **RECOMMENDATION:** Consider upgrading if memory usage exceeds 80% consistently

**Auto-Deployment:**
- ✅ Auto-deploys on git push (if configured)
- ⚠️ **VERIFY:** Ensure production branch is protected

---

### Vercel (Frontend Web)

**Build Configuration:**
- ✅ `vercel.json` configured correctly
- ✅ Production build command: `npm run web:build:production`
- ✅ Output directory: `web-build`
- ✅ Environment variable: `EXPO_PUBLIC_ENV=production`

**Domain Configuration:**
- ✅ `www.aperae.com` and `aperae.com` configured
- ⚠️ **VERIFY:** Both domains redirect correctly
- ⚠️ **VERIFY:** HTTPS is enforced (should be automatic)

**Environment Variables:**
- ⚠️ **VERIFY:** `EXPO_PUBLIC_ENV=production` is set in Vercel dashboard
- ⚠️ **VERIFY:** `EXPO_PUBLIC_API_URL` is NOT set (should use production API)

**Deployment Process:**
- ✅ Auto-deploys on git push
- ⚠️ **VERIFY:** Production branch is protected

**Build Optimization:**
- ✅ Expo export optimizes builds
- ⚠️ **MONITOR:** Build times and sizes

---

### Supabase (Database)

**Connection Pooling:**
- ✅ Prisma schema mentions PgBouncer
- ⚠️ **VERIFY:** `DATABASE_URL` includes `?pgbouncer=true&connection_limit=5`
- ⚠️ **FIX:** Add connection error recovery (see CRITICAL-3)

**Index Optimization:**
- ✅ Indexes exist on frequently queried fields
- ⚠️ **VERIFY:** Indexes are actually created in database
- ⚠️ **MONITOR:** Query performance

**Migration Strategy:**
- ✅ Prisma migrations configured
- ⚠️ **DOCUMENT:** Migration rollback process
- ⚠️ **TEST:** Test migration on staging before production

**Backup Strategy:**
- ✅ Supabase provides automatic backups
- ⚠️ **VERIFY:** Backup retention period
- ⚠️ **TEST:** Test restore process

**Connection Limits:**
- ⚠️ **MONITOR:** Connection pool usage
- ⚠️ **ALERT:** Set up alerts if connection pool exceeds 80%

---

## 8. CROSS-PLATFORM COMPATIBILITY ISSUES

### Web-Specific Issues

**Browser Compatibility:**
- ✅ React Native Web supports modern browsers
- ⚠️ **TEST:** Test on Chrome, Safari, Firefox, Edge
- ⚠️ **TEST:** Test on mobile browsers (iOS Safari, Chrome Mobile)

**Web API Usage:**
- ✅ `fetch` API used (supported in all modern browsers)
- ⚠️ **ISSUE:** `localStorage` used for tokens (XSS vulnerable - see CRITICAL-2)
- ✅ `sessionStorage` would be better (but still XSS vulnerable)
- ⚠️ **RECOMMENDATION:** Migrate to httpOnly cookies

**Service Worker:**
- ⚠️ **VERIFY:** No service worker conflicts
- ⚠️ **TEST:** Offline behavior

**PWA Considerations:**
- ⚠️ **VERIFY:** PWA manifest is correct (`app.json`)
- ⚠️ **TEST:** Install as PWA on mobile devices

---

### iOS-Specific Issues

**Expo Compatibility:**
- ✅ Expo ~54.0.0 is current
- ⚠️ **VERIFY:** All native modules are compatible

**Native Module Requirements:**
- ✅ `expo-secure-store` for token storage
- ✅ `expo-camera` for menu scanning
- ✅ `expo-image-picker` for image selection
- ⚠️ **VERIFY:** All permissions are correctly configured (`app.json`)

**App Store Guidelines:**
- ✅ Privacy policy and terms screens exist
- ✅ Age verification implemented
- ⚠️ **VERIFY:** App Store compliance (privacy policy URL, terms URL)
- ⚠️ **VERIFY:** No prohibited content

**iOS Security:**
- ✅ SecureStore uses iOS Keychain
- ⚠️ **VERIFY:** Keychain sharing is disabled (should be for single-app use)

---

### Android-Specific Issues

**Expo Compatibility:**
- ✅ Same as iOS
- ⚠️ **VERIFY:** Android-specific native modules work

**Native Module Requirements:**
- ✅ Same as iOS
- ⚠️ **VERIFY:** Android permissions are correctly configured (`app.json`)

**Play Store Guidelines:**
- ✅ Same privacy/terms requirements as iOS
- ⚠️ **VERIFY:** Play Store compliance

**Android Security:**
- ✅ SecureStore uses Android Keystore
- ⚠️ **VERIFY:** Keystore is properly configured

**Android-Specific:**
- ⚠️ **ISSUE:** `usesCleartextTraffic: true` in `app.json` (line 40)
  - **FIX:** Remove this for production (only needed for localhost development)
  - **RISK:** Allows HTTP traffic (security risk)

---

## 9. RECOMMENDED FIX ORDER (CHECKLIST)

### Phase 1: Critical Security Fixes (MUST DO BEFORE PROD)

- [ ] **CRITICAL-1:** Add unhandled promise rejection handler (15 min)
- [ ] **CRITICAL-2:** Fix web token storage (2-4 hours for sessionStorage, 1 day for httpOnly cookies)
- [ ] **CRITICAL-3:** Add database connection error recovery (2-3 hours)
- [ ] **CRITICAL-4:** Fix CORS configuration for production (30 min)
- [ ] **CRITICAL-5:** Add request timeout handling (1-2 hours)
- [ ] **CRITICAL-6:** Fix health check validation (1-2 hours)

**Total Phase 1 Time:** ~8-12 hours

### Phase 2: High Priority Fixes (DO BEFORE PROD IF POSSIBLE)

- [ ] **HIGH-1:** Add error boundaries to screens (2-3 hours)
- [ ] **HIGH-2:** Add frontend rate limiting (2-3 hours)
- [x] **HIGH-3:** Refresh token rotation - ✅ Already implemented
- [ ] **HIGH-4:** Verify input sanitization on all endpoints (1-2 hours)
- [ ] **HIGH-5:** Validate request IDs (1 hour)

**Total Phase 2 Time:** ~6-10 hours (reduced due to already-implemented features)

### Phase 3: Medium Priority Fixes (DO AFTER PROD LAUNCH)

- [ ] **MEDIUM-1:** Verify database indexes (30 min)
- [ ] **MEDIUM-2:** Fix error handler to use logger (15 min)
- [ ] **MEDIUM-3:** Verify failed auth logging (30 min)
- [ ] **MEDIUM-4:** Add CSP headers (1-2 hours)
- [ ] **MEDIUM-5:** Document migration rollback (2-3 hours)
- [ ] **MEDIUM-6:** Add API response caching (4-6 hours with Redis, 2-3 hours in-memory)

**Total Phase 3 Time:** ~8-16 hours

### Phase 4: Low Priority Fixes (NICE TO HAVE)

- [ ] **LOW-1:** Reduce verbose logging (1-2 hours)
- [ ] **LOW-2:** Document API versioning (1-2 hours)

**Total Phase 4 Time:** ~3-6 hours

---

## 10. WHAT NOT TO DO

### Over-Engineering Warnings

1. **Don't add Redis yet** - In-memory caching is sufficient for 15-50 users. Redis adds complexity and cost.
2. **Don't implement microservices** - Monolithic architecture is fine for solo founder with <100 users.
3. **Don't add complex monitoring** - Render logs + basic health checks are enough. Don't add Datadog/New Relic yet.
4. **Don't implement advanced caching strategies** - Simple in-memory cache is sufficient.
5. **Don't add API gateway** - Direct API calls are fine for this scale.

### Premature Optimization Warnings

1. **Don't optimize database queries yet** - Current queries are fine for <100 users.
2. **Don't add CDN** - Vercel already provides CDN. Don't add Cloudflare CDN yet.
3. **Don't optimize bundle size aggressively** - Current bundle is fine. Don't spend days on 10KB savings.
4. **Don't add database read replicas** - Single database is fine for this scale.

### Infrastructure Overkill Warnings

1. **Don't add Kubernetes** - Docker on Render is sufficient.
2. **Don't add service mesh** - Not needed for single service.
3. **Don't add distributed tracing** - Basic logging is enough.
4. **Don't add feature flags service** - Environment variables are sufficient.

---

## 11. BUDGET CONSIDERATIONS

### Current Costs (Estimated)

- **Render (Backend):** Free tier or $7/month (Starter plan)
- **Vercel (Frontend):** Free tier (sufficient for <100 users)
- **Supabase (Database):** Free tier (500MB database, 2GB bandwidth)
- **Anthropic Claude API:** Pay-per-use (~$0.01-0.03 per recommendation)
- **Google Cloud Vision API:** Pay-per-use (~$0.0015 per image)
- **Cloudflare (DNS):** Free tier

**Total Estimated Monthly Cost:** ~$10-20/month (with API usage)

### Cost Optimization Opportunities

1. **API Caching:** Cache identical requests to reduce Anthropic API costs (see MEDIUM-5)
2. **Image Compression:** Already implemented (good!)
3. **Database:** Monitor connection pool usage to avoid upgrade
4. **Render:** Monitor memory usage - upgrade only if needed

### Scaling Cost Projections

- **50 users:** ~$20/month
- **100 users:** ~$40/month
- **500 users:** ~$150/month (may need Render upgrade, Supabase upgrade)
- **1000 users:** ~$300/month (definitely need upgrades)

### Free Tier Limitations

**Render Free Tier:**
- 512MB RAM (may be insufficient for Prisma + Node.js)
- 90s request timeout (already handled)
- Sleeps after 15 min inactivity (not ideal for production)

**Vercel Free Tier:**
- 100GB bandwidth/month (sufficient for <1000 users)
- Unlimited builds (good!)

**Supabase Free Tier:**
- 500MB database (sufficient for <1000 users)
- 2GB bandwidth/month (may need upgrade at 500+ users)
- 2GB file storage (sufficient)

**When to Upgrade:**
- **Render:** When memory usage consistently >80% or when free tier sleep causes issues
- **Supabase:** When database size >400MB or bandwidth >1.5GB/month
- **Vercel:** When bandwidth >80GB/month

---

## 12. MONITORING & OBSERVABILITY (MINIMAL VIABLE)

### Essential Monitoring for Solo Founder

**What to Track:**
1. **Errors:** Unhandled errors, API failures, database errors
2. **Performance:** Response times, slow queries, timeout rates
3. **Costs:** API usage (Anthropic, Google Vision), database size
4. **Uptime:** Service availability, health check failures

**Free/Low-Cost Tools:**
1. **Render Logs:** Free, 30-day retention (already using)
2. **Vercel Analytics:** Free (basic metrics)
3. **UptimeRobot:** Free (5 monitors) - Check health endpoint every 5 min
4. **Google Analytics:** Free (for web traffic)
5. **Sentry:** Free tier (error tracking) - **RECOMMENDED ADDITION**

**What Can Wait:**
- Advanced APM (Application Performance Monitoring)
- Distributed tracing
- Custom dashboards
- Real-time alerting (email alerts from UptimeRobot are sufficient)

### Recommended Monitoring Setup

1. **UptimeRobot:** Monitor `https://api.aperae.com/api/health` every 5 minutes
2. **Sentry:** Add error tracking (free tier: 5K events/month)
3. **Render Logs:** Review daily for errors
4. **Manual Checks:** Weekly review of API costs, database size

**Setup Time:** 2-3 hours

---

## 13. FINAL RECOMMENDATIONS

### Before Production Launch

1. **Fix all CRITICAL issues** (Phase 1) - **MANDATORY**
2. **Fix HIGH-1 and HIGH-2** (error boundaries, frontend rate limiting) - **STRONGLY RECOMMENDED**
3. **Test on all platforms** (Web, iOS, Android) - **MANDATORY**
4. **Set up basic monitoring** (UptimeRobot, Sentry) - **STRONGLY RECOMMENDED**
5. **Verify all environment variables** in Render and Vercel - **MANDATORY**

### Post-Launch (First Week)

1. **Monitor error rates** daily
2. **Review API costs** daily
3. **Check database size** daily
4. **Review Render logs** for errors
5. **Fix any HIGH priority issues** that weren't fixed pre-launch

### Post-Launch (First Month)

1. **Implement Phase 3 fixes** (medium priority)
2. **Optimize based on real usage patterns**
3. **Plan for scaling** if user growth exceeds expectations

---

## 14. CONCLUSION

The application has a **solid foundation** with good security practices in authentication, input validation, and database design. However, **6 critical issues must be fixed before production**, particularly around error handling, token storage, and CORS configuration.

**Recommended Action:**
1. Fix all CRITICAL issues (8-12 hours of work)
2. Fix HIGH-1 and HIGH-2 (4-6 hours)
3. Set up basic monitoring (2-3 hours)
4. Test thoroughly on all platforms
5. Launch with confidence

**Total Pre-Launch Work:** ~12-19 hours (reduced due to already-implemented security features)

After these fixes, the application will be **production-ready** for a beta launch with 15-50 users. The architecture is sound and can scale to 100+ users with minimal changes.

---

---

## 15. AUDIT COMPLETENESS STATEMENT

### Files Reviewed

**Backend Files:**
- ✅ `backend/server.js` (main Express server - 3348 lines)
- ✅ `backend/authMiddleware.js` (JWT authentication)
- ✅ `backend/authService.js` (token generation, password hashing)
- ✅ `backend/userService.js` (user management, refresh token rotation)
- ✅ `backend/errorHandler.js` (error handling middleware)
- ✅ `backend/timeoutMiddleware.js` (request timeout handling)
- ✅ `backend/csrfProtection.js` (CSRF protection)
- ✅ `backend/validation.js` (input validation and sanitization)
- ✅ `backend/securityValidator.js` (environment variable validation)
- ✅ `backend/validateEnv.js` (startup environment validation)
- ✅ `backend/prisma/schema.prisma` (database schema)
- ✅ `backend/prisma/client.js` (Prisma client singleton)
- ✅ `backend/services/consentService.js` (privacy compliance)
- ✅ `backend/Dockerfile` (container configuration)
- ✅ `backend/logger.js` (Winston logging configuration)
- ✅ `backend/utils/logRedaction.js` (log redaction for sensitive data)
- ✅ `backend/securityLogger.js` (security event logging)
- ✅ `backend/production-security.js` (production security config - reference only)
- ✅ `backend/package.json` (dependencies and scripts)

**Frontend Files:**
- ✅ `App.tsx` (main app entry point)
- ✅ `src/services/secureHttpClient.ts` (HTTP client with certificate pinning)
- ✅ `src/services/wineService.ts` (API service layer)
- ✅ `src/services/consentApiService.ts` (consent API)
- ✅ `src/services/authService.ts` (frontend auth service)
- ✅ `src/services/secureStorage.ts` (token storage)
- ✅ `src/utils/api.ts` (API URL configuration)
- ✅ `src/components/ErrorBoundary.tsx` (error boundary component)
- ✅ `app.json` (Expo configuration)
- ✅ `package.json` (dependencies)

**Infrastructure Files:**
- ✅ `vercel.json` (Vercel configuration)
- ✅ `backend/Dockerfile` (Render deployment)
- ✅ `.gitignore` (git exclusions - verified sensitive files are excluded)
- ✅ `env.example` (environment variable template)
- ✅ `backend-env-example.txt` (backend environment variable template)

### Key Findings from Deeper Review

1. **✅ Refresh Token Rotation:** Already implemented correctly in `userService.js` (lines 255-267). New refresh token is generated and old one is invalidated on each refresh.

2. **✅ Input Sanitization:** Comprehensive sanitization already implemented in `validation.js`:
   - HTML tag removal
   - JavaScript protocol removal
   - Event handler removal
   - Special character sanitization

3. **⚠️ Error Handler:** Uses `console.error` instead of Winston logger - should be fixed but not critical.

4. **⚠️ Timeout Configuration:** Default timeout for recommendations is 60s (line 47 of `timeoutMiddleware.js`), but should be 85s to avoid Render's 90s limit.

5. **✅ Environment Validation:** Strong validation on startup - app exits if required variables are missing or weak.

6. **✅ Database Schema:** Well-designed with proper indexes, foreign keys, and cascade deletes.

### Additional Security Findings

**✅ `.gitignore` Review:**
- ✅ Properly excludes `.env` files (lines 7-11, 47-48, 94)
- ✅ Excludes `google-vision-key.json` (line 97)
- ✅ Excludes `node_modules/`, logs, and build artifacts
- **VERIFY:** Ensure `backend/google-vision-key.json` is not committed to git history

**⚠️ Security Logger:**
- `backend/securityLogger.js` uses `console.warn`/`console.log` instead of Winston logger
- Should use logger for proper log aggregation
- **Impact:** Low (logs still work, just not aggregated properly)

**✅ Log Redaction:**
- Comprehensive log redaction implemented in `backend/utils/logRedaction.js`
- Redacts passwords, tokens, API keys, JWT tokens, and sensitive patterns
- **Status:** Excellent implementation

**⚠️ Missing CI/CD Pipeline:**
- No GitHub Actions workflows found (`.github/workflows/` directory doesn't exist)
- **Impact:** Medium (no automated testing, security scanning, or deployment checks)
- **Recommendation:** Add basic CI pipeline for:
  - Dependency vulnerability scanning
  - Linting
  - Basic tests
  - Security checks

**✅ Environment Variable Templates:**
- `env.example` and `backend-env-example.txt` contain placeholder values (good)
- No real secrets in example files

### Audit Confidence Level: **HIGH**

All critical files have been reviewed. The audit identified:
- **6 Critical Issues** (must fix before production)
- **5 High Priority Issues** (2 already implemented, 3 need fixes)
- **6 Medium Priority Issues** (mostly improvements)
- **2 Low Priority Issues** (nice to have)

The codebase shows **strong security practices** in many areas (authentication, input validation, token rotation). The critical issues are primarily around error handling, CORS configuration, and production-specific configurations.

---

**Report Generated:** January 2025  
**Next Review:** After Phase 1 fixes are implemented

