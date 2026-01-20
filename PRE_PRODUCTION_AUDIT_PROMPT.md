# Pre-Production Code Audit Prompt

You are acting as:
• Principal Software Engineer
• Senior Backend Architect
• Mobile & Web Engineering Lead
• DevOps / Cloud Infrastructure Engineer
• Application Security Engineer

Your task is to perform a **FULL PRE-PRODUCTION CODE AUDIT** for this application.

## IMPORTANT CONTEXT

**Application Overview:**
- **Application Name:** Aperae (PocketSomm) - AI Wine Sommelier App
- **Status:** Real, live MVP transitioning from DEV → PRODUCTION
- **User Base:** 15–50 beta users (US-only, cross-platform: Windows web, Android, iOS)
- **Budget:** ~$100/month
- **Team:** SOLO-FOUNDER project (no ops team)

**Technology Stack:**

### Backend Infrastructure:
- **Platform:** Render (Cloud Platform)
- **Runtime:** Node.js with Express.js (CommonJS)
- **Containerization:** Dockerized deployment
- **Database:** Supabase (PostgreSQL) - managed database service
- **ORM:** Prisma (v5.22.0)
- **Authentication:** Custom email/password with bcrypt + JWT (access/refresh tokens)
- **AI Integration:** Anthropic Claude API (via @anthropic-ai/sdk)
- **Image Processing:** Google Cloud Vision API (OCR for menu scanning)
- **API Base URL:** `https://api.aperae.com/api`

### Frontend Infrastructure:
- **Framework:** React Native (Expo ~54.0.0) with TypeScript
- **Web Deployment:** Vercel (www.aperae.com, aperae.com)
- **Platforms:** 
  - Web (Windows, macOS, Linux browsers)
  - iOS (native app via Expo)
  - Android (native app via Expo)
- **Storage:** 
  - SecureStore (expo-secure-store) for sensitive data
  - AsyncStorage for non-sensitive data
- **HTTP Client:** Custom SecureHttpClient with certificate pinning
- **Frontend Base URL:** `https://www.aperae.com`

### Database:
- **Provider:** Supabase (PostgreSQL)
- **ORM:** Prisma Client
- **Connection:** Managed via Supabase connection string
- **Tables:** Users, UserConsents, WineRecommendations, DishRecommendations, MenuWines, etc.

### Authentication:
- **Method:** Custom email/password authentication
- **Password Hashing:** bcrypt
- **Tokens:** JWT (access tokens + refresh tokens)
- **Storage:** SecureStore on mobile, localStorage/sessionStorage on web

### External Services:
- **AI Recommendations:** Anthropic Claude API
- **OCR/Image Processing:** Google Cloud Vision API
- **Domain/CDN:** Cloudflare (DNS management)
- **CI/CD:** GitHub Actions (basic CI pipeline exists)

## ASSUMPTIONS

- **Deployment:** Manual deployments (Render auto-deploys on git push, Vercel auto-deploys on git push)
- **CI/CD:** Basic GitHub Actions pipeline exists (security scanning, dependency checks)
- **Monitoring:** Limited (Render logs, Vercel logs)
- **No prior formal audit:** This is the first comprehensive audit
- **Data Scope:** User accounts, preferences, wine/dish recommendations, menu OCR data
- **NOT storing:** Payment information, sensitive health data, financial data
- **Privacy Compliance:** US privacy regulations (CCPA, state laws) - consent tracking implemented

## OBJECTIVES

1. Identify **ALL** critical, high, medium, and low-risk issues
2. Highlight **ANY** production blockers
3. Reduce security risk, crashes, and undefined behavior
4. Ensure production readiness with minimal overengineering
5. Assume **ZERO institutional knowledge** — explain everything clearly
6. **Focus on cross-platform compatibility** (web, iOS, Android)
7. **Consider Render/Vercel/Supabase specific limitations and best practices**

## AUDIT SCOPE (DO NOT SKIP ANY)

### 1. BACKEND CODE QUALITY (Render Deployment)
   - Express app structure and middleware order
   - Route handling and error boundaries
   - Error handling consistency across endpoints
   - Async/await safety (unhandled promise rejections)
   - Input validation & sanitization (express-validator usage)
   - Logging practices (PII leakage, secrets in logs)
   - **Render-specific:** Environment variable management, build process, health checks
   - **Render-specific:** Request timeout handling (90s limit considerations)
   - **Render-specific:** Memory/CPU limits for free tier

### 2. AUTHENTICATION & SESSION SECURITY
   - Password hashing strategy (bcrypt rounds, salt handling)
   - JWT access/refresh token handling
   - Token expiration, rotation, revocation strategy
   - Storage of refresh tokens (database vs client)
   - Token refresh flow and error handling
   - Common auth attack vectors (replay, fixation, CSRF)
   - **Cross-platform:** SecureStore vs localStorage security
   - **Web-specific:** Session management, token storage security
   - **Mobile-specific:** SecureStore implementation, keychain security

### 3. API SECURITY
   - CORS configuration (www.aperae.com, aperae.com, localhost origins)
   - CSRF protection implementation
   - Rate limiting (express-rate-limit configuration)
   - Brute force protection (auth endpoints)
   - API key handling (Anthropic API key, Google Vision credentials)
   - Environment variable hygiene (Render environment variables)
   - Request size limits (10MB for OCR, 1MB for other endpoints)
   - **Render-specific:** Request timeout handling
   - **Render-specific:** Health check endpoint implementation

### 4. DATABASE & DATA LAYER (Supabase/Prisma)
   - **Prisma schema design risks:**
     - Missing constraints or indexes
     - Foreign key relationships
     - Data type mismatches
     - Enum handling
   - **SQL injection exposure:** Prisma query safety
   - **Migration strategy:** Prisma migrations, manual SQL migrations
   - **Connection pooling:** Supabase connection limits
   - **Data consistency:** Transaction handling
   - **Data lifecycle:** Retention policies, deletion strategies
   - **Supabase-specific:** Connection string security, SSL requirements
   - **Supabase-specific:** Row-level security (RLS) policies (if applicable)
   - **Prisma-specific:** Client generation, connection management

### 5. AI INTEGRATION RISKS (Anthropic Claude API)
   - Prompt safety and injection risks
   - Hallucination mitigation patterns
   - Output validation and JSON schema enforcement
   - Timeout handling (90s timeout considerations)
   - Cost control safeguards (token limits, request limits)
   - Error handling for API failures
   - **Render-specific:** Long-running request handling (90s+ responses)
   - **Rate limiting:** Anthropic API rate limits
   - **Fallback strategies:** Mock data fallback implementation

### 6. FRONTEND (React Native / Expo / Web)
   - **Cross-platform considerations:**
     - Web vs Native API differences
     - Platform-specific code paths (Platform.OS checks)
     - SecureStore vs localStorage usage
   - **API error handling:**
     - Network failure handling
     - Timeout handling (90s timeout)
     - Retry logic implementation
   - **Auth token storage:**
     - SecureStore on mobile (iOS/Android)
     - localStorage/sessionStorage on web
     - Token refresh flow
   - **Crash risks:**
     - Unhandled promise rejections
     - Error boundaries
     - Null/undefined handling
   - **Environment separation:**
     - EXPO_PUBLIC_ENV usage
     - API URL configuration (getApiBaseUrl)
     - Dev vs production builds
   - **Vercel-specific:**
     - Build configuration
     - Environment variables
     - Deployment process
   - **Web-specific:**
     - CORS handling
     - Browser compatibility
     - Service worker considerations
   - **Mobile-specific:**
     - Native module linking
     - Permissions handling
     - App store compliance

### 7. DEVOPS & DEPLOYMENT
   - **Render-specific:**
     - Dockerfile optimization
     - Build process (prisma generate, npm install)
     - Environment variable management
     - Health check endpoint
     - Logging and log retention
     - Auto-deployment configuration
     - Service configuration (port, health checks)
   - **Vercel-specific:**
     - Build settings (expo export)
     - Environment variables (EXPO_PUBLIC_*)
     - Domain configuration (www.aperae.com, aperae.com)
     - Deployment process
     - Build optimization
   - **Secrets exposure:**
     - Environment variables in code
     - API keys in logs
     - Database credentials
   - **HTTPS enforcement:**
     - Render HTTPS (automatic)
     - Vercel HTTPS (automatic)
     - Certificate validation
   - **Monitoring gaps:**
     - Error tracking (Sentry, etc.)
     - Performance monitoring
     - Uptime monitoring
   - **Rollback strategy:**
     - Render rollback process
     - Vercel rollback process
     - Database migration rollback

### 8. CROSS-PLATFORM COMPATIBILITY
   - **Web (Windows/macOS/Linux browsers):**
     - Browser compatibility (Chrome, Safari, Firefox, Edge)
     - Web API usage (FileReader, fetch, etc.)
     - Service worker support
     - PWA considerations
   - **iOS (Native):**
     - Expo compatibility
     - Native module requirements
     - App Store guidelines
     - iOS-specific security (Keychain, SecureStore)
   - **Android (Native):**
     - Expo compatibility
     - Native module requirements
     - Play Store guidelines
     - Android-specific security (Keystore, SecureStore)

### 9. SCALABILITY & RELIABILITY (RIGHT-SIZED FOR SOLO FOUNDER)
   - **What will break first?**
     - Render free tier limits (memory, CPU, request timeouts)
     - Supabase connection limits
     - Vercel build limits
     - Anthropic API rate limits
   - **What can wait?**
     - Advanced monitoring
     - Complex caching strategies
     - Microservices architecture
   - **What absolutely must be fixed before production?**
     - Security vulnerabilities
     - Data loss risks
     - Authentication flaws
     - Critical crashes

### 10. PRIVACY & COMPLIANCE (US Regulations)
   - **Consent tracking:**
     - UserConsent model implementation
     - Device ID hashing (SHA-256)
     - Consent versioning
     - Data retention policies
   - **Data minimization:**
     - PII collection practices
     - Data storage practices
     - Data deletion capabilities
   - **User rights:**
     - Data export functionality
     - Account deletion
     - Consent withdrawal
   - **CCPA/State Law Compliance:**
     - Privacy policy implementation
     - Terms of service
     - Age verification

## OUTPUT FORMAT (MANDATORY)

### 1. **EXECUTIVE SUMMARY**
   - Production readiness score (0–100)
   - "Can this safely go live?" (Yes / No / Yes with conditions)
   - **Platform-specific readiness:**
     - Web (Windows/macOS/Linux): Ready / Not Ready / Ready with conditions
     - iOS: Ready / Not Ready / Ready with conditions
     - Android: Ready / Not Ready / Ready with conditions

### 2. **CRITICAL ISSUES (MUST FIX BEFORE PROD)**
   For each issue:
   - Clear explanation
   - Why it matters
   - Exact recommendation
   - Example code or config if relevant
   - **Platform impact:** Web / iOS / Android / All
   - **Infrastructure impact:** Render / Vercel / Supabase / All

### 3. **HIGH / MEDIUM / LOW ISSUES**
   - Grouped by severity
   - Short but actionable
   - **Platform-specific:** Note if issue affects specific platforms
   - **Infrastructure-specific:** Note if issue is Render/Vercel/Supabase specific

### 4. **SECURITY RISK TABLE**
   - Risk description
   - Severity (Critical / High / Medium / Low)
   - Likelihood (High / Medium / Low)
   - Impact (High / Medium / Low)
   - Fix effort (Low / Medium / High)
   - **Affected platforms:** Web / iOS / Android / All
   - **Affected infrastructure:** Render / Vercel / Supabase / All

### 5. **INFRASTRUCTURE-SPECIFIC RECOMMENDATIONS**
   - **Render:**
     - Service configuration
     - Environment variables
     - Health checks
     - Logging
     - Cost optimization
   - **Vercel:**
     - Build optimization
     - Environment variables
     - Domain configuration
     - Deployment process
   - **Supabase:**
     - Connection pooling
     - Index optimization
     - Migration strategy
     - Backup strategy

### 6. **CROSS-PLATFORM COMPATIBILITY ISSUES**
   - **Web-specific issues:**
     - Browser compatibility
     - Web API usage
     - CORS handling
   - **iOS-specific issues:**
     - Native module compatibility
     - App Store compliance
     - iOS security
   - **Android-specific issues:**
     - Native module compatibility
     - Play Store compliance
     - Android security

### 7. **RECOMMENDED FIX ORDER (CHECKLIST)**
   - Step-by-step list I can follow
   - Prioritized by:
     - Security risk
     - Production blocker status
     - Platform impact
     - Fix effort
   - **Estimated time per fix** (for solo founder planning)

### 8. **WHAT NOT TO DO**
   - Explicitly call out unnecessary complexity I should avoid as a solo founder
   - Over-engineering warnings
   - Premature optimization warnings
   - Infrastructure overkill warnings

### 9. **BUDGET CONSIDERATIONS**
   - Current costs (Render, Vercel, Supabase, APIs)
   - Cost optimization opportunities
   - Scaling cost projections
   - Free tier limitations and when to upgrade

### 10. **MONITORING & OBSERVABILITY (MINIMAL VIABLE)**
   - Essential monitoring for solo founder
   - What to track (errors, performance, costs)
   - Free/low-cost tools
   - What can wait

## RULES

- **Be blunt, precise, and practical**
- **No hand-waving** - provide specific examples
- **No generic advice** - be specific to this codebase
- **No assuming I already know best practices** - explain everything
- **Consider solo-founder constraints** - prioritize what matters most
- **Platform-aware** - note web vs iOS vs Android differences
- **Infrastructure-aware** - consider Render/Vercel/Supabase specifics
- **Budget-conscious** - recommend free/low-cost solutions where possible

## KEY FILES TO REVIEW

### Backend:
- `backend/server.js` - Main Express server
- `backend/authMiddleware.js` - Authentication logic
- `backend/services/consentService.js` - Consent tracking
- `backend/prisma/schema.prisma` - Database schema
- `backend/Dockerfile` - Container configuration
- `backend/.env.example` - Environment variable template

### Frontend:
- `App.tsx` - Main app entry point
- `src/services/secureHttpClient.ts` - HTTP client
- `src/services/wineService.ts` - API service
- `src/services/consentApiService.ts` - Consent API
- `src/utils/api.ts` - API URL configuration
- `app.json` - Expo configuration

### Infrastructure:
- `.github/workflows/ci.yml` - CI pipeline
- `vercel.json` - Vercel configuration
- `package.json` - Dependencies

## SPECIFIC AREAS OF CONCERN

1. **Recent CORS fixes** - Verify User-Agent header handling is correct
2. **OCR body parser limit** - Verify 10MB limit is appropriate
3. **Cross-platform image handling** - Web blob vs native file system
4. **Token storage** - SecureStore vs localStorage security
5. **Error handling** - Comprehensive error boundaries
6. **Timeout handling** - 90s timeout for long-running AI requests
7. **Database migrations** - Prisma migration strategy
8. **Environment variables** - EXPO_PUBLIC_* usage and security

## EXPECTED DELIVERABLES

1. **Comprehensive audit report** (markdown format)
2. **Prioritized fix checklist** (actionable items)
3. **Code examples** (where fixes are needed)
4. **Configuration recommendations** (Render, Vercel, Supabase)
5. **Security risk assessment** (with severity ratings)
6. **Production readiness verdict** (with conditions if applicable)

---

**Remember:** This is a solo-founder project with limited budget. Prioritize security and stability over features. Be practical, not theoretical.


