# Remaining Roadmap Tasks

## 📊 Current Status Overview

### ✅ **Phase 1: Initial A/B Testing Setup** - **94% Complete**
### ✅ **Phase 2: Quality Assurance & Data Collection** - **100% Complete**
### ⏳ **Phase 3: User Experience Enhancements** - **0% Complete**

---

## 🔴 **HIGH PRIORITY - Remaining Phase 1 Work**

### ⏳ **Step 3: Complete Prompt Caching Implementation** (30-45 min)

**Status:** Structure is ready, but API integration is complete ✅

**Actually:** This was completed in our recent work! The `cache_control` parameter is now integrated in `server.js`.

**Action Needed:** Verify caching is working and test effectiveness

---

## 🟡 **MEDIUM PRIORITY - Phase 2 Remaining**

### ✅ **Step 4: Enhanced Logging** - **COMPLETE**
- ✅ Winston logger already in place
- ✅ Comprehensive logging in database service
- ✅ Request logging with full context

### ✅ **Step 5: Database Schema & Storage** - **COMPLETE**
- ✅ Supabase table created
- ✅ Database service implemented
- ✅ Field extraction working
- ✅ Automated insertion integrated

### ⏳ **Step 6: External Validation Layer** - **NOT STARTED**

**Purpose:** Add validation to ensure recommendation quality

**Required Components:**
1. **Purchasability Validator**
   - Check if recommended wines are actually available for purchase
   - Verify vintages are realistic for retail
   - Validate producer/wine combinations

2. **Quality Validator**
   - Verify recommendation quality based on stored data
   - Flag low-confidence recommendations
   - Check for principle violations

3. **Typicity Validator**
   - Ensure wine characteristics match regional norms
   - Validate grape variety traits
   - Check for impossible combinations

**Files to Create:**
- `backend/services/validation/purchasabilityValidator.js`
- `backend/services/validation/qualityValidator.js`
- `backend/services/validation/typicityValidator.js`
- `backend/services/validation/index.js`

**Estimated Time:** 4-6 hours

**When to Implement:** After collecting enough data for analysis

---

## 🟢 **LOW PRIORITY - Phase 3: User Experience Enhancements**

### ⏳ **Step 7: "My Cellar" Rebranding & Tracking** - **NOT STARTED**

**Purpose:** Enhance user engagement with cellar tracking

**Required Changes:**
1. Rename "Favorites" to "My Cellar" throughout codebase
2. Update database schema:
   - `UserCellar` model (or update existing)
   - Add tracking fields:
     - `hasTried` (boolean)
     - `wantsToTry` (boolean)
     - `pairingRating` (number, 1-5)
     - `tastingNotes` (text)
     - `triedDate` (date)

3. Update UI Components:
   - FavoritesScreen → MyCellarScreen
   - Update wine card actions
   - Add rating/notes UI

**Files to Modify:**
- Multiple screen files (rename Favorites → My Cellar)
- `src/types/wine.ts` (update types)
- `backend/prisma/schema.prisma` (add/update model)
- Database migration

**Estimated Time:** 3-4 hours

---

### ⏳ **Step 8: Personalization Algorithm** - **NOT STARTED**

**Purpose:** Learn from user preferences and ratings to enhance recommendations

**Required Components:**
1. **Rating Analyzer**
   - Analyze user ratings from My Cellar
   - Identify patterns in preferred wines
   - Extract user taste profile

2. **Preference Learner**
   - Learn from pairing ratings
   - Adjust recommendations based on history
   - Weight user preferences dynamically

3. **Recommendation Enhancer**
   - Integrate learned preferences into prompt
   - Adjust confidence scores based on user history
   - Suggest wines similar to highly-rated past recommendations

**Files to Create:**
- `backend/services/personalization/ratingAnalyzer.js`
- `backend/services/personalization/preferenceLearner.js`
- `backend/services/personalization/recommendationEnhancer.js`

**Estimated Time:** 6-8 hours (research + implementation)

**Dependencies:** Requires Step 7 (My Cellar) to collect rating data

---

## 🔴 **CRITICAL - Production Readiness** (From Code Audit)

### ⏳ **Session Storage** - **NOT STARTED**

**Priority:** 🔴 CRITICAL (blocker for production)

**Required:**
- Move refresh tokens/sessions to database (or Redis) with TTL
- Implement session revocation
- Enable logout everywhere
- Device management capabilities

**Current Status:** Using in-memory storage (data lost on restart)

**Estimated Time:** 1 day

**Files to Modify:**
- `backend/userService.js`
- `backend/prisma/schema.prisma` (Session model exists, needs migration)
- Add Redis OR use PostgreSQL for sessions

---

### ⏳ **Dependency Vulnerability Scanning** - **NOT STARTED**

**Priority:** 🟡 High

**Required:**
- Add Snyk or Dependabot
- Keep npm audit in CI
- Regular dependency updates

**Estimated Time:** 1-2 hours

---

### ⏳ **CI/CD Pipeline (Complete)** - **PARTIAL**

**Status:**
- ✅ CI added
- ⏳ CD (Continuous Deployment) pending
- ⏳ Environment configs pending

**Estimated Time:** 2-3 hours

---

### ⏳ **Production Logging Aggregation** - **NOT STARTED**

**Priority:** 🟡 High

**Required:**
- Centralized logs
- Log retention policy
- Redaction policy (for sensitive data)

**Estimated Time:** 2-3 hours

---

## 🌐 **NEW - Phase 4: Domain Integration & Production Deployment**

### ⏳ **Step 9: Domain Setup & Configuration** - **NOT STARTED**

**Priority:** 🟡 High (enables professional deployment)

**Purpose:** Integrate `www.aperae.com` domain for professional branding and production deployment

**Required Components:**

1. **DNS Configuration** (1 hour)
   - Point `api.aperae.com` → Backend server IP
   - Point `www.aperae.com` → Frontend (or placeholder)
   - Set up `staging.aperae.com` for staging environment
   - Configure subdomains as needed

2. **SSL Certificate Setup** (1 hour)
   - Configure Let's Encrypt (free) OR Cloudflare (free SSL)
   - Set up HTTPS for API endpoint
   - Set up HTTPS for frontend
   - Configure certificate auto-renewal

3. **Backend Configuration** (1 hour)
   - Update CORS to allow `https://www.aperae.com`
   - Update CORS to allow `https://api.aperae.com`
   - Add domain to `ALLOWED_ORIGINS` environment variable
   - Update Swagger documentation with production URL

4. **Frontend Configuration** (1 hour)
   - Update `src/utils/api.ts` to support production domain
   - Add environment-based URL selection (dev/staging/production)
   - Keep localhost as development default
   - Add production API URL configuration

5. **Environment Variables** (30 min)
   - Create `.env.production` with production settings
   - Update `.env.example` with domain configuration
   - Configure `EXPO_PUBLIC_API_URL` for production builds

**Files to Modify:**
- `backend/server.js` (CORS configuration)
- `src/utils/api.ts` (API URL logic)
- `.env.example` (documentation)
- `.env.production` (new file)

**Estimated Time:** 2-3 hours (code changes) + DNS/SSL setup (1-2 hours) = **3-5 hours total**

**Dependencies:** Requires hosting provider (VPS, PaaS, or serverless)

**Reference:** See `DOMAIN_SETUP_STRATEGY.md` for detailed guide

---

### ⏳ **Step 10: Staging Environment Deployment** - **NOT STARTED**

**Priority:** 🟡 High (enables testing with real domain)

**Purpose:** Deploy to staging environment with real domain for testing

**Required:**
- Deploy backend to staging server
- Configure staging database
- Set up staging subdomain (`staging.aperae.com` or `preview.aperae.com`)
- Test with real domain and SSL
- Share with beta testers
- Verify all endpoints work correctly

**Estimated Time:** 3-4 hours (deployment + testing)

**Dependencies:** Requires Step 9 (Domain Setup) complete

---

### ⏳ **Step 11: Production Deployment** - **NOT STARTED**

**Priority:** 🔴 CRITICAL (final production step)

**Purpose:** Deploy to production domain for public use

**Required:**
- Complete all critical production blockers (session storage, security audit)
- Deploy to production server
- Configure production database
- Set up monitoring and alerting
- Configure CDN (optional, for static assets)
- Set up backup and disaster recovery
- Load testing
- Security audit

**Estimated Time:** 4-6 hours (deployment + configuration)

**Dependencies:** 
- Requires Step 9 (Domain Setup)
- Requires Step 10 (Staging Deployment) - recommended
- Requires session storage fix (critical blocker)
- Requires security audit completion

---

## 🍷 **NEW - Phase 5: Reverse Pairing System (Wine-to-Dish)**

### ⏳ **Step 12: UI Toggle Implementation** - **NOT STARTED**

**Priority:** 🟢 Medium - Feature enhancement

**Purpose:** Add toggle on main home screen to switch between dish→wine and wine→dish modes

**Required:**
- Add mode toggle component (segmented control or toggle switch)
- Update home screen to support both input modes
- Add wine input field (replaces dish input when in wine mode)
- Update state management for mode switching
- Add visual indicators for active mode
- Update navigation/routing if needed

**Files to Modify:**
- `src/screens/HomeScreen.tsx` (or `SimpleEnhancedHomeScreen.tsx`)
- `src/components/` (create toggle component if needed)
- `src/types/` (add wine input types)

**Estimated Time:** 2-3 hours

---

### ⏳ **Step 13: Master Chef Prompt V1.0 Implementation** - **NOT STARTED**

**Priority:** 🟢 Medium - Feature enhancement

**Purpose:** Implement the Master Chef Prompt V1.0 for wine-to-dish pairing recommendations

**Required:**
- Create prompt structure files (similar to V7.0 structure)
- Implement all 8 sections:
  1. Wine Analysis Protocol
  2. Pairing Principles (Reverse Application)
  3. Complexity Classification
  4. Recipe Requirements
  5. Confidence Scoring
  6. Output Requirements
  7. JSON Output Format
  8. Pre-flight Checklist
- Create prompt builder service
- Add prompt versioning

**Files to Create:**
- `backend/prompts/master-chef-v1-static-sections.js`
- `backend/prompts/master-chef-v1-dynamic-sections.js`
- `backend/prompts/master-chef-v1-prompt.js`
- `backend/services/masterChefPromptService.js`

**Estimated Time:** 4-6 hours

---

### ⏳ **Step 14: Wine Analysis Service** - **NOT STARTED**

**Priority:** 🟢 Medium - Feature enhancement

**Purpose:** Service to analyze wine input and extract wine characteristics

**Required:**
- Parse wine input (producer, name, region, vintage)
- Extract wine structure (body, acidity, tannin, etc.)
- Identify aromatic profile and compounds
- Calculate vintage age from reference date
- Verify producer-region matches
- Handle unknown/uncertain wine data

**Files to Create:**
- `backend/services/wineAnalysisService.js`
- `backend/utils/wineParser.js` (if needed)

**Estimated Time:** 3-4 hours

---

### ⏳ **Step 15: Dish Recommendation Service** - **NOT STARTED**

**Priority:** 🟢 Medium - Feature enhancement

**Purpose:** Service to generate dish recommendations based on wine analysis

**Required:**
- Build Master Chef prompt with wine analysis
- Call Anthropic API with prompt
- Parse and validate JSON response
- Sanitize response for client
- Extract dish recommendations (Complex/Moderate/Simple)
- Validate confidence scores (≥85)
- Handle errors and edge cases

**Files to Create:**
- `backend/services/dishRecommendationService.js`
- Update `backend/services/masterChefPromptService.js` (if needed)

**Estimated Time:** 3-4 hours

---

### ⏳ **Step 16: Backend API Endpoint** - **NOT STARTED**

**Priority:** 🟢 Medium - Feature enhancement

**Purpose:** Create new API endpoint for wine-to-dish recommendations

**Required:**
- Create `/api/dish-recommendations` endpoint
- Add input validation for wine input
- Integrate wine analysis service
- Integrate dish recommendation service
- Add error handling
- Add logging and monitoring
- Update Swagger documentation

**Files to Modify:**
- `backend/server.js` (add new route)
- `backend/swagger.js` (add API documentation)

**Estimated Time:** 2-3 hours

---

### ⏳ **Step 17: Frontend Integration & Testing** - **NOT STARTED**

**Priority:** 🟢 Medium - Feature enhancement

**Purpose:** Integrate wine-to-dish API with frontend and test end-to-end

**Required:**
- Update API service to call new endpoint
- Connect wine input to API call
- Display dish recommendations (similar to wine cards)
- Create dish recommendation card component
- Add error handling for wine input
- Test all complexity levels
- Test edge cases (unknown wines, invalid input)
- Performance testing

**Files to Modify:**
- `src/services/wineService.ts` (or create `dishService.ts`)
- `src/screens/HomeScreen.tsx` (or `SimpleEnhancedHomeScreen.tsx`)
- `src/components/` (create dish recommendation card)

**Files to Create:**
- `src/components/DishRecommendationCard.tsx`
- `src/types/dish.ts` (if needed)

**Estimated Time:** 4-5 hours

---

## 📋 **SUMMARY - Remaining Work by Priority**

### 🔴 **Critical (Production Blockers)**
1. ⏳ **Session Storage** (1 day) - Must fix before production
2. ⏳ **Verify Prompt Caching** (30 min) - Should test to confirm working
3. ⏳ **Production Deployment** (4-6 hours) - Final production step

### 🟡 **High Priority (Before Production)**
4. ⏳ **Domain Setup & Configuration** (3-5 hours) - Enables professional deployment
5. ⏳ **Staging Environment Deployment** (3-4 hours) - Test with real domain
6. ⏳ **Dependency Vulnerability Scanning** (1-2 hours)
7. ⏳ **Complete CI/CD Pipeline** (2-3 hours)
8. ⏳ **Production Logging Aggregation** (2-3 hours)

### 🟢 **Medium Priority (Feature Enhancements)**
9. ⏳ **External Validation Layer** (4-6 hours) - After data collection
10. ⏳ **My Cellar Rebranding** (3-4 hours) - User experience improvement
11. ⏳ **Reverse Pairing System - UI Toggle** (2-3 hours) - Wine-to-dish feature
12. ⏳ **Master Chef Prompt V1.0** (4-6 hours) - Wine-to-dish prompt
13. ⏳ **Wine Analysis Service** (3-4 hours) - Wine-to-dish feature
14. ⏳ **Dish Recommendation Service** (3-4 hours) - Wine-to-dish feature
15. ⏳ **Dish Recommendations API Endpoint** (2-3 hours) - Wine-to-dish feature
16. ⏳ **Frontend Integration & Testing** (4-5 hours) - Wine-to-dish feature

### 🔵 **Low Priority (Future Features)**
17. ⏳ **Personalization Algorithm** (6-8 hours) - Requires Step 7 first

---

## 🎯 **Recommended Next Steps**

### **Immediate (This Week):**
1. ✅ Verify prompt caching is working (test it)
2. ⏳ Implement session storage in database (critical blocker)
3. ⏳ Set up dependency scanning
4. ⏳ **Domain Setup & Configuration** (DNS, SSL, code changes)

### **Short Term (Next 2 Weeks):**
5. ⏳ Complete CI/CD pipeline
6. ⏳ Production logging setup
7. ⏳ **Staging Environment Deployment** (test with real domain)
8. ⏳ Collect data from Phase 2 for analysis

### **Medium Term (Next Month):**
9. ⏳ External validation layer (after enough data collected)
10. ⏳ My Cellar rebranding (user experience improvement)
11. ⏳ **Production Deployment** (after critical blockers fixed)
12. ⏳ **Reverse Pairing System** (Phase 5 - all 6 steps, ~18-25 hours total)

### **Long Term (Future):**
13. ⏳ Personalization algorithm (requires My Cellar first)

---

## 📊 **Time Estimates**

**Total Remaining Work:**
- Critical: ~1.5 days (session storage + production deployment)
- High Priority: ~1.5-2 days (domain setup + staging + CI/CD + logging)
- Medium Priority: ~3-4 days (validation + My Cellar + Reverse Pairing System)
- Low Priority: ~1-2 days (personalization)

**Total: ~7-9.5 days of development work**

**Domain Integration Breakdown:**
- Domain Setup & Configuration: 3-5 hours
- Staging Deployment: 3-4 hours
- Production Deployment: 4-6 hours
- **Total Domain Work: ~10-15 hours (1.25-2 days)**

**Reverse Pairing System Breakdown:**
- UI Toggle Implementation: 2-3 hours
- Master Chef Prompt V1.0: 4-6 hours
- Wine Analysis Service: 3-4 hours
- Dish Recommendation Service: 3-4 hours
- API Endpoint: 2-3 hours
- Frontend Integration: 4-5 hours
- **Total Reverse Pairing Work: ~18-25 hours (2.25-3 days)**

---

## ✅ **What's Already Complete**

1. ✅ V7.0 Master Sommelier Prompt implementation
2. ✅ Field removal from JSON output
3. ✅ Character/word limits optimization
4. ✅ A/B testing framework
5. ✅ Prompt caching structure & API integration
6. ✅ Enhanced logging (Winston)
7. ✅ Database schema & storage
8. ✅ Field extraction service
9. ✅ Automated database insertion

**Great progress! The foundation is solid. Focus on production readiness next!** 🚀


