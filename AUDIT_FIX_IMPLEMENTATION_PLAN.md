# Pre-Production Audit Fix Implementation Plan
## Aperae (PocketSomm) - Complete Remediation Strategy

**Created:** January 2025  
**Total Estimated Time:** 12-19 hours  
**Priority Order:** Critical → High → Medium → Low

---

## 📋 EXECUTIVE SUMMARY

This plan addresses **6 Critical**, **5 High**, **6 Medium**, and **5 Low** priority issues identified in the pre-production audit.

**Critical Path:** All Critical issues must be fixed before production launch.  
**Recommended:** Fix High priority issues before launch if time permits.  
**Post-Launch:** Medium and Low priority issues can be addressed incrementally.

---

## 🎯 PHASE 1: CRITICAL FIXES (MUST DO BEFORE PROD)
**Estimated Time:** 6-8 hours  
**Priority:** 🔴 MANDATORY

### CRITICAL-1: Add Unhandled Promise Rejection Handler
**Time:** 15 minutes  
**File:** `backend/server.js`

**Steps:**
1. Open `backend/server.js`
2. Find the logger initialization (around line 93)
3. Add global error handlers immediately after logger setup:

```javascript
// Global error handlers (add after logger initialization)
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

**Verification:**
- [ ] Test: Create a test endpoint that throws unhandled promise rejection
- [ ] Verify: Check Render logs show the error is logged
- [ ] Verify: Server doesn't crash (Render restarts it)

**Dependencies:** None

---

### CRITICAL-2: Fix Web Token Storage (XSS Vulnerability)
**Time:** 2-4 hours (quick fix) OR 1 day (proper fix)  
**File:** `src/services/secureStorage.ts`

**Option A: Quick Fix (sessionStorage) - 2-4 hours**
1. Open `src/services/secureStorage.ts`
2. Replace `localStorage` with `sessionStorage`:

```typescript
// Line 18-21: Change localStorage to sessionStorage
if (Platform.OS === 'web') {
  // Use sessionStorage (cleared on tab close, still XSS vulnerable but better)
  const storageKey = this.WEB_STORAGE_PREFIX + key;
  sessionStorage.setItem(storageKey, value); // Changed from localStorage
}
```

3. Update `getItem` method similarly (line 35-40)
4. Update `removeItem` method if it exists

**Option B: Proper Fix (httpOnly Cookies) - 1 day**
1. Backend changes:
   - Modify login endpoint to set httpOnly cookies
   - Modify refresh endpoint to set httpOnly cookies
   - Add cookie parsing middleware
2. Frontend changes:
   - Remove token storage from SecureStorage
   - Read tokens from cookies automatically (sent with requests)
   - Update auth service to not manually set Authorization header

**Recommendation:** Use Option A for now, plan Option B for post-launch.

**Verification:**
- [ ] Test: Login on web, verify tokens in sessionStorage (not localStorage)
- [ ] Test: Close tab, verify tokens are cleared
- [ ] Test: Token refresh still works

**Dependencies:** None

---

### CRITICAL-3: Add Database Connection Error Recovery
**Time:** 2-3 hours  
**File:** `backend/prisma/client.js`

**Steps:**
1. Open `backend/prisma/client.js`
2. Add connection health check after Prisma client creation:

```javascript
const prisma = new PrismaClient({
  log: process.env.NODE_ENV === 'development' 
    ? ['query', 'error', 'warn'] 
    : ['error'],
});

// Add connection health check
prisma.$connect().catch((error) => {
  logger.error('Failed to connect to database', { error: error.message });
  // Don't exit - let the app try to reconnect on next query
});
```

3. Add query error handler wrapper (optional but recommended):

```javascript
// Wrap common Prisma operations with retry logic
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
```

**Verification:**
- [ ] Test: Temporarily break database connection (wrong password)
- [ ] Verify: App logs error but doesn't crash
- [ ] Test: Restore connection, verify app recovers
- [ ] Test: Health check endpoint returns 503 when DB is down

**Dependencies:** None

---

### CRITICAL-4: Fix CORS Configuration for Production
**Time:** 30 minutes  
**File:** `backend/server.js` (lines 117-210)

**Steps:**
1. Open `backend/server.js`
2. Find `corsOptions` object (around line 136)
3. Replace the entire `origin` function with:

```javascript
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

**Verification:**
- [ ] Test: Set `NODE_ENV=production` locally
- [ ] Test: Request from `https://www.aperae.com` - should work
- [ ] Test: Request from `http://localhost:3000` - should be rejected
- [ ] Test: Request from ngrok URL - should be rejected
- [ ] Test: Request with no origin (mobile app) - should work

**Dependencies:** None

---

### CRITICAL-5: Fix Request Timeout for Long-Running AI Requests
**Time:** 1-2 hours  
**Files:** `backend/timeoutMiddleware.js`, `backend/server.js`

**Steps:**
1. Open `backend/timeoutMiddleware.js`
2. Update `getTimeout()` method (line 41-52):

```javascript
static getTimeout() {
  const parse = (v, d) => {
    const n = parseInt(v, 10);
    return Number.isFinite(n) && n > 0 ? n : d;
  };
  return {
    recommendations: parse(process.env.API_TIMEOUT_RECOMMENDATIONS_MS, 85000), // Changed from 60000 to 85000
    ocr: parse(process.env.API_TIMEOUT_OCR_MS, 30000),
    auth: parse(process.env.API_TIMEOUT_AUTH_MS, 10000),
    default: parse(process.env.API_TIMEOUT_DEFAULT_MS, 30000)
  };
}
```

3. Open `backend/server.js`
4. Find the `/api/recommendations` POST endpoint (around line 968)
5. Add explicit timeout handling:

```javascript
app.post('/api/recommendations', async (req, res) => {
  const requestStartTime = Date.now();
  const requestId = generateRequestId();
  
  // Set timeout (85 seconds - 5s buffer before Render's 90s limit)
  const timeout = setTimeout(() => {
    if (!res.headersSent) {
      logger.warn('Request timeout - returning fallback', { 
        requestId,
        timeout: '85s',
        dish: req.body.dish 
      });
      const fallback = getFallbackResponse(
        req.body.dish, 
        requestId, 
        !!req.body.availableWines
      );
      res.status(200).json(fallback);
    }
  }, 85000);
  
  try {
    // ... existing recommendation logic ...
    
    // Clear timeout on success
    clearTimeout(timeout);
    
    // ... rest of success handling ...
  } catch (error) {
    clearTimeout(timeout);
    // ... existing error handling ...
  }
});
```

**Verification:**
- [ ] Test: Make a recommendation request
- [ ] Verify: Timeout is set to 85s (check logs)
- [ ] Test: Simulate slow AI response (>85s) - should return fallback
- [ ] Verify: Normal requests (<85s) complete successfully

**Dependencies:** None

---

### CRITICAL-6: Fix Health Check Validation
**Time:** 1-2 hours  
**File:** `backend/server.js` (lines 432-447)

**Steps:**
1. Open `backend/server.js`
2. Find `checkDependencyHealth()` function (around line 383)
3. Replace with actual health checks:

```javascript
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

  // Test Anthropic API (lightweight check - just validate key format)
  if (process.env.ANTHROPIC_API_KEY && !MOCK_MODE) {
    try {
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
```

4. Update health check endpoint to return 503 if critical dependencies are down:

```javascript
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

**Verification:**
- [ ] Test: Health check with database connected - should return 200
- [ ] Test: Break database connection - should return 503
- [ ] Test: Health check response includes dependency status
- [ ] Verify: Render health checks use this endpoint

**Dependencies:** None

---

## 🟠 PHASE 2: HIGH PRIORITY FIXES (STRONGLY RECOMMENDED)
**Estimated Time:** 4-6 hours  
**Priority:** ⚠️ STRONGLY RECOMMENDED BEFORE PROD

### HIGH-1: Add Error Boundaries to Screens
**Time:** 2-3 hours  
**Files:** `App.tsx`, individual screen files

**Steps:**
1. Review existing `ErrorBoundary` component (`src/components/ErrorBoundary.tsx`)
2. Wrap major screens in error boundaries:
   - `AdaptiveHomeScreen`
   - `AdaptiveMenuScreen`
   - `AdaptiveFavoritesScreen`
   - `AdaptivePreferencesScreen`

**Example:**
```typescript
// In App.tsx or screen files
<ErrorBoundary fallback={<ErrorScreen />}>
  <AdaptiveHomeScreen />
</ErrorBoundary>
```

**Verification:**
- [ ] Test: Force error in each screen
- [ ] Verify: Error boundary catches error, shows fallback
- [ ] Verify: App doesn't crash completely

**Dependencies:** None

---

### HIGH-2: Add Frontend Rate Limiting
**Time:** 2-3 hours  
**File:** `src/services/wineService.ts`

**Steps:**
1. Create rate limiter utility:

```typescript
// src/utils/rateLimiter.ts
class RateLimiter {
  private requests: Map<string, number[]> = new Map();
  
  canMakeRequest(key: string, maxRequests: number, windowMs: number): boolean {
    const now = Date.now();
    const requests = this.requests.get(key) || [];
    
    // Remove old requests outside window
    const recentRequests = requests.filter(time => now - time < windowMs);
    
    if (recentRequests.length >= maxRequests) {
      return false;
    }
    
    recentRequests.push(now);
    this.requests.set(key, recentRequests);
    return true;
  }
  
  getRetryAfter(key: string, maxRequests: number, windowMs: number): number {
    const now = Date.now();
    const requests = this.requests.get(key) || [];
    const recentRequests = requests.filter(time => now - time < windowMs);
    
    if (recentRequests.length < maxRequests) {
      return 0;
    }
    
    const oldestRequest = recentRequests[0];
    return windowMs - (now - oldestRequest);
  }
}

export const rateLimiter = new RateLimiter();
```

2. Update `wineService.ts` to use rate limiter:

```typescript
// In makeApiCallWithRetry method
const rateLimitKey = `wine-recommendation-${dish}`;
const canRequest = rateLimiter.canMakeRequest(rateLimitKey, 5, 60000); // 5 requests per minute

if (!canRequest) {
  const retryAfter = rateLimiter.getRetryAfter(rateLimitKey, 5, 60000);
  throw new Error(`Rate limit exceeded. Please wait ${Math.ceil(retryAfter / 1000)} seconds.`);
}
```

**Verification:**
- [ ] Test: Make 6 rapid requests - 6th should be rate limited
- [ ] Test: Wait 1 minute, verify request works again
- [ ] Test: Verify user sees friendly error message

**Dependencies:** None

---

### HIGH-3: Refresh Token Rotation - ✅ ALREADY IMPLEMENTED
**Status:** No action needed - already working correctly

---

### HIGH-4: Verify Input Sanitization on All Endpoints
**Time:** 1-2 hours  
**Files:** `backend/server.js`, `backend/validation.js`

**Steps:**
1. Review all POST/PUT endpoints in `backend/server.js`
2. Verify each uses validation middleware:
   - `/api/recommendations` - ✅ Uses `validateRecommendationRequest`
   - `/api/auth/register` - ✅ Uses `validateRegistrationRequest`
   - `/api/auth/login` - ✅ Uses `validateLoginRequest`
   - `/api/auth/refresh` - ✅ Uses `validateRefreshRequest`
   - `/api/ocr/extract-text` - ⚠️ Check if needs validation
   - `/api/consent` - ⚠️ Check if needs validation

3. Add validation to any missing endpoints

**Verification:**
- [ ] Test: Send malicious input to each endpoint
- [ ] Verify: Input is sanitized (HTML removed, scripts removed)
- [ ] Verify: No XSS vulnerabilities

**Dependencies:** None

---

### HIGH-5: Validate Request IDs
**Time:** 1 hour  
**File:** `backend/server.js`

**Steps:**
1. Find `generateRequestId()` function (around line 89)
2. Update to use UUID format:

```javascript
const { randomUUID } = require('crypto');

const generateRequestId = () => {
  return randomUUID(); // Use UUID instead of random bytes
};
```

3. Add validation middleware (optional):

```javascript
const validateRequestId = (req, res, next) => {
  if (req.requestId && !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(req.requestId)) {
    logger.warn('Invalid request ID format', { requestId: req.requestId });
    req.requestId = generateRequestId(); // Regenerate if invalid
  }
  next();
};
```

**Verification:**
- [ ] Test: Verify request IDs are UUID format
- [ ] Test: Verify request IDs are unique
- [ ] Test: Verify request IDs appear in logs

**Dependencies:** None

---

## 🟡 PHASE 3: MEDIUM PRIORITY FIXES (POST-LAUNCH)
**Estimated Time:** 8-16 hours  
**Priority:** 📅 DO AFTER PROD LAUNCH

### MEDIUM-1: Verify Database Indexes
**Time:** 30 minutes  
**File:** Database verification script

**Steps:**
1. Connect to Supabase database
2. Run index verification query:

```sql
SELECT 
    tablename,
    indexname,
    indexdef
FROM pg_indexes
WHERE schemaname = 'public'
ORDER BY tablename, indexname;
```

3. Compare with `backend/prisma/schema.prisma` indexes
4. Create missing indexes if any

**Verification:**
- [ ] Verify: All indexes from schema exist in database
- [ ] Test: Query performance on indexed fields
- [ ] Verify: No missing indexes on frequently queried fields

**Dependencies:** Database access

---

### MEDIUM-2: Fix Error Handler to Use Logger
**Time:** 15 minutes  
**File:** `backend/errorHandler.js`

**Steps:**
1. Open `backend/errorHandler.js`
2. Replace `console.error` with logger:

```javascript
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

**Verification:**
- [ ] Test: Trigger an error
- [ ] Verify: Error appears in Winston logs (not just console)
- [ ] Verify: Error is properly formatted

**Dependencies:** None

---

### MEDIUM-3: Verify Failed Auth Logging
**Time:** 30 minutes  
**File:** `backend/server.js` (login endpoint)

**Steps:**
1. Review login endpoint (around line 679)
2. Verify failed login attempts are logged with IP:

```javascript
// In login endpoint catch block
logger.warn('Failed login attempt', {
  email: req.body.email,
  ip: req.ip,
  userAgent: req.headers['user-agent'],
  requestId: req.requestId
});
```

**Verification:**
- [ ] Test: Attempt login with wrong password
- [ ] Verify: Log entry includes IP address
- [ ] Verify: Log entry includes email (redacted if needed)

**Dependencies:** None

---

### MEDIUM-4: Add CSP Headers
**Time:** 1-2 hours  
**Files:** `vercel.json`, `app.json`

**Steps:**
1. Add CSP headers in Vercel configuration:

```json
// vercel.json
{
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        {
          "key": "Content-Security-Policy",
          "value": "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; connect-src 'self' https://api.aperae.com;"
        }
      ]
    }
  ]
}
```

2. Test CSP doesn't break functionality

**Verification:**
- [ ] Test: Load web app
- [ ] Verify: No CSP violations in console
- [ ] Test: All features work (images, API calls, etc.)

**Dependencies:** None

---

### MEDIUM-5: Document Migration Rollback
**Time:** 2-3 hours  
**File:** Create `backend/MIGRATION_ROLLBACK_GUIDE.md`

**Steps:**
1. Document Prisma migration rollback process
2. Create rollback scripts for critical migrations
3. Test rollback process on staging

**Verification:**
- [ ] Test: Apply migration
- [ ] Test: Rollback migration
- [ ] Verify: Data integrity maintained

**Dependencies:** Staging database

---

### MEDIUM-6: Add API Response Caching
**Time:** 4-6 hours (with Redis) OR 2-3 hours (in-memory)  
**Files:** `backend/server.js`, new cache service

**Recommendation:** Use in-memory cache for now (simpler, no infrastructure)

**Steps:**
1. Create simple in-memory cache:

```javascript
// backend/services/cacheService.js
class CacheService {
  constructor() {
    this.cache = new Map();
    this.maxSize = 1000;
    this.ttl = 3600000; // 1 hour
  }
  
  get(key) {
    const item = this.cache.get(key);
    if (!item) return null;
    
    if (Date.now() > item.expiresAt) {
      this.cache.delete(key);
      return null;
    }
    
    return item.value;
  }
  
  set(key, value, ttl = this.ttl) {
    // Evict oldest if cache is full
    if (this.cache.size >= this.maxSize) {
      const firstKey = this.cache.keys().next().value;
      this.cache.delete(firstKey);
    }
    
    this.cache.set(key, {
      value,
      expiresAt: Date.now() + ttl
    });
  }
  
  generateKey(dish, preferences) {
    return `recommendation:${dish}:${JSON.stringify(preferences || {})}`;
  }
}

module.exports = new CacheService();
```

2. Use in recommendations endpoint:

```javascript
// In /api/recommendations endpoint
const cacheKey = cacheService.generateKey(dish, preferences);
const cached = cacheService.get(cacheKey);
if (cached) {
  return res.json(cached);
}

// ... make API call ...

// Cache result
cacheService.set(cacheKey, result);
```

**Verification:**
- [ ] Test: Same request twice - second should be cached
- [ ] Test: Different request - should not be cached
- [ ] Test: Cache expires after TTL

**Dependencies:** None (for in-memory)

---

## 🟢 PHASE 4: LOW PRIORITY FIXES (NICE TO HAVE)
**Estimated Time:** 3-6 hours  
**Priority:** 💡 NICE TO HAVE

### LOW-1: Reduce Verbose Logging
**Time:** 1-2 hours  
**File:** `backend/server.js`

**Steps:**
1. Review all `console.log` statements
2. Replace with appropriate logger levels
3. Remove debug logs in production

**Verification:**
- [ ] Test: Production logs are concise
- [ ] Verify: Important errors still logged

**Dependencies:** None

---

### LOW-2: Fix Security Logger to Use Winston
**Time:** 15 minutes  
**File:** `backend/securityLogger.js`

**Steps:**
1. Replace `console.warn`/`console.log` with logger (see audit report for code)

**Verification:**
- [ ] Test: Security events appear in Winston logs

**Dependencies:** None

---

### LOW-3: Document API Versioning Strategy
**Time:** 1-2 hours  
**File:** Create `backend/API_VERSIONING.md`

**Steps:**
1. Document versioning strategy
2. Define breaking change policy
3. Document migration path

**Dependencies:** None

---

### LOW-4: Add CI/CD Pipeline
**Time:** 1-2 hours  
**File:** Create `.github/workflows/ci.yml`

**Steps:**
1. Create GitHub Actions workflow:

```yaml
name: CI
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: npm ci
      - run: cd backend && npm ci
      - run: npm audit --audit-level=moderate
      - run: cd backend && npm audit --audit-level=moderate
      - run: npm run lint || true
      - run: cd backend && npm test || true
```

**Verification:**
- [ ] Test: Push to GitHub, verify CI runs
- [ ] Verify: CI fails on security vulnerabilities

**Dependencies:** GitHub repository

---

### LOW-5: Verify Request Body Size Validation
**Status:** ✅ Already handled correctly (10MB for OCR, 1MB for others)

---

## 📅 IMPLEMENTATION TIMELINE

### Week 1: Critical Fixes (Before Production)
**Days 1-2:**
- [ ] CRITICAL-1: Unhandled promise rejection handler (15 min)
- [ ] CRITICAL-4: CORS configuration (30 min)
- [ ] CRITICAL-5: Request timeout (1-2 hours)
- [ ] CRITICAL-6: Health check validation (1-2 hours)

**Days 3-4:**
- [ ] CRITICAL-2: Web token storage (2-4 hours - quick fix)
- [ ] CRITICAL-3: Database connection recovery (2-3 hours)

**Day 5:**
- [ ] Testing and verification of all critical fixes
- [ ] Deploy to staging
- [ ] End-to-end testing

**Total Week 1:** 6-8 hours

### Week 2: High Priority Fixes (Before Production if Time Permits)
**Days 1-2:**
- [ ] HIGH-1: Error boundaries (2-3 hours)
- [ ] HIGH-2: Frontend rate limiting (2-3 hours)

**Days 3-4:**
- [ ] HIGH-4: Verify input sanitization (1-2 hours)
- [ ] HIGH-5: Validate request IDs (1 hour)

**Day 5:**
- [ ] Testing and verification
- [ ] Deploy to staging

**Total Week 2:** 4-6 hours (optional before launch)

### Post-Launch: Medium & Low Priority
**Week 3-4:**
- [ ] MEDIUM-1: Verify database indexes (30 min)
- [ ] MEDIUM-2: Fix error handler logger (15 min)
- [ ] MEDIUM-3: Verify failed auth logging (30 min)
- [ ] MEDIUM-4: Add CSP headers (1-2 hours)
- [ ] LOW-1: Reduce verbose logging (1-2 hours)
- [ ] LOW-2: Fix security logger (15 min)

**Week 5-6:**
- [ ] MEDIUM-5: Document migration rollback (2-3 hours)
- [ ] MEDIUM-6: Add API response caching (2-3 hours)
- [ ] LOW-3: Document API versioning (1-2 hours)
- [ ] LOW-4: Add CI/CD pipeline (1-2 hours)

**Total Post-Launch:** 8-16 hours

---

## ✅ VERIFICATION CHECKLIST

### Pre-Production Verification
- [ ] All 6 Critical issues fixed
- [ ] All fixes tested locally
- [ ] All fixes tested on staging
- [ ] Health check returns 503 when database is down
- [ ] CORS rejects unauthorized origins in production
- [ ] Unhandled promise rejections are logged
- [ ] Request timeouts work correctly (85s)
- [ ] Web tokens use sessionStorage (or httpOnly cookies)
- [ ] Database connection errors are handled gracefully

### Post-Launch Verification
- [ ] Monitor error rates daily
- [ ] Review Render logs for unhandled errors
- [ ] Verify health checks are working
- [ ] Monitor API costs
- [ ] Check database connection pool usage

---

## 🚨 ROLLBACK PLAN

If critical issues are discovered after deployment:

1. **Immediate Rollback:**
   - Render: Use "Rollback" button in dashboard
   - Vercel: Use "Promote to Production" for previous deployment

2. **Database Rollback:**
   - Only if migration caused issues
   - Use Prisma migration rollback (documented in MEDIUM-5)

3. **Configuration Rollback:**
   - Revert environment variables in Render/Vercel
   - Revert code changes via git

---

## 📝 NOTES

- **Dependencies:** Most fixes are independent and can be done in parallel
- **Testing:** Test each fix individually before moving to next
- **Staging:** Always test on staging before production
- **Documentation:** Update this plan as fixes are completed

---

## 🎯 SUCCESS CRITERIA

**Production Ready When:**
- ✅ All Critical issues fixed
- ✅ All fixes tested and verified
- ✅ Health checks working correctly
- ✅ No unhandled errors in logs
- ✅ CORS properly configured
- ✅ Database connection recovery working

**Post-Launch Success:**
- ✅ Error rates < 1%
- ✅ No critical security incidents
- ✅ Health checks passing
- ✅ API costs within budget

---

**Last Updated:** January 2025  
**Next Review:** After Phase 1 completion

