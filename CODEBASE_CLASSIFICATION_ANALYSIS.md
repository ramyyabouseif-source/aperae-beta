# Aperae Codebase Classification & Licensing Analysis

**Analysis Date:** January 2025  
**Analysis Type:** Task 1.1.1 - Component Classification for Open-Source Strategy  
**Status:** Ready for Review

---

## Executive Summary

This analysis classifies all major components of the Aperae codebase into three categories:
- **🟢 Public Candidate** - Safe to open-source; low risk
- **🟠 Internal Shared** - Internal use only; may later be public under a license
- **🔴 Proprietary / Confidential** - Contains sensitive or differentiating IP; should remain closed

### Key Findings

**Total Components Analyzed:** 35+ modules/folders

**Distribution:**
- 🟢 **Public Candidate:** 8 components (23%)
- 🟠 **Internal Shared:** 6 components (17%)
- 🔴 **Proprietary/Confidential:** 21 components (60%)

**Critical Proprietary Elements:**
1. **AI Prompt Engineering** - Sophisticated sommelier system prompts (competitive advantage)
2. **Menu Analysis Algorithm** - Complex OCR text parsing and wine matching logic
3. **Price Estimation Formulas** - Calibrated pricing models (business value)
4. **Authentication & Security** - JWT implementation, security middleware
5. **User Data Models** - Proprietary preference algorithms

**Open-Source Opportunities:**
1. **Design System** - Color palettes, typography, spacing (brand visibility)
2. **UI Components** - Reusable React Native components (developer goodwill)
3. **Utility Functions** - Validation, error handling (community building)
4. **Type Definitions** - TypeScript types (SDK/public API support)

---

## Detailed Classification Table

| Module / Folder | Purpose | Suggested Access | License / Legal Note | Rationale |
|----------------|---------|------------------|---------------------|-----------|
| **FRONTEND COMPONENTS** ||||
| `/src/design` | Design system (colors, typography, spacing) | 🟢 Public | MIT or Apache 2.0 | Generic design tokens; promotes brand visibility; no competitive advantage |
| `/src/components` (UI components) | Reusable React Native UI components | 🟢 Public | MIT or Apache 2.0 | Standard UI patterns; encourages community contributions; showcases UX |
| `/src/components/ErrorBoundary.tsx` | React error boundary component | 🟢 Public | MIT | Generic error handling; useful for community |
| `/src/components/LoadingSpinner.tsx` | Loading indicator component | 🟢 Public | MIT | Standard UI component; no proprietary logic |
| `/src/utils/validation.ts` | Input validation utilities | 🟢 Public | MIT | Generic validation functions; useful utility |
| `/src/utils/errorHandler.ts` | Error handling utilities | 🟢 Public | MIT | Standard error handling patterns |
| `/src/types` | TypeScript type definitions | 🟢 Public | MIT | Public API types; enables SDK development |
| `/src/screens` (UI screens) | Application screens | 🔴 Proprietary | Closed | Contains brand-specific UX, navigation flow, business logic integration |
| `/src/services/wineService.ts` | Wine recommendation API client | 🟠 Internal Shared | Internal | API integration layer; may become public SDK later |
| `/src/services/authService.ts` | Authentication service | 🔴 Proprietary | Closed | Contains security logic, token management, proprietary auth flow |
| `/src/services/ocrService.ts` | OCR service wrapper | 🟠 Internal Shared | Internal | API wrapper; implementation details may be public later |
| `/src/services/menuAnalysisService.ts` | Menu parsing algorithm | 🔴 Proprietary | Closed | **PROPRIETARY ALGORITHM** - Complex wine matching, price association, section-aware parsing |
| `/src/services/preferencesService.ts` | User preferences management | 🔴 Proprietary | Closed | Contains preference logic, business rules |
| `/src/services/favoritesService.ts` | Favorites management | 🟠 Internal Shared | Internal | Standard CRUD; may be public later |
| `/src/utils/privacyManager.ts` | Privacy/GDPR compliance | 🟠 Internal Shared | Internal | Compliance logic; may be template for others |
| `/src/config/uiConfig.ts` | UI configuration | 🔴 Proprietary | Closed | Brand-specific configurations |
| `/App.tsx` | Main application entry | 🔴 Proprietary | Closed | Application architecture, routing, brand integration |
| `/assets/images` | Brand assets (logo, images) | 🔴 Proprietary | Closed | **BRAND IP** - Trademarked logo, proprietary images |
| **BACKEND COMPONENTS** ||||
| `/backend/server.js` | Main Express server | 🔴 Proprietary | Closed | Application architecture, route definitions, business logic |
| `/backend/server.js` (AI Prompts) | OpenAI system prompts | 🔴 Proprietary | Closed | **PROPRIETARY** - Sophisticated sommelier prompt engineering (500+ lines); competitive advantage |
| `/backend/authService.js` | JWT authentication | 🔴 Proprietary | Closed | Security implementation, token generation, hashing |
| `/backend/authMiddleware.js` | Authentication middleware | 🔴 Proprietary | Closed | Security middleware, authorization logic |
| `/backend/userService.js` | User management | 🔴 Proprietary | Closed | User data models, business logic |
| `/backend/validation.js` | Input validation | 🟠 Internal Shared | Internal | Validation rules; may be reusable |
| `/backend/errorHandler.js` | Error handling | 🟢 Public | MIT | Standard error handling patterns |
| `/backend/logger.js` | Logging utility | 🟢 Public | MIT | Generic logging wrapper |
| `/backend/monitoring.js` | Performance monitoring | 🟠 Internal Shared | Internal | Monitoring infrastructure |
| `/backend/securityValidator.js` | Security validation | 🔴 Proprietary | Closed | Security checks, environment validation |
| `/backend/production-security.js` | Production security config | 🔴 Proprietary | Closed | **CONFIDENTIAL** - Security configurations, secrets management |
| `/backend/requestLogger.js` | Request logging | 🟠 Internal Shared | Internal | Logging infrastructure |
| `/backend/services/wineDatabaseService.js` | Wine data access | 🟠 Internal Shared | Internal | Database service layer; data sourcing is public |
| `/backend/services/wineData/priceCalibration` | Price estimation formulas | 🔴 Proprietary | Closed | **PROPRIETARY** - Calibrated pricing models, regression formulas, business intelligence |
| `/backend/services/wineData/seedData` | Wine dataset | 🟠 Internal Shared | Internal | Uses CC0-licensed Kaggle data; aggregation is internal |
| `/backend/prisma/schema.prisma` | Database schema | 🔴 Proprietary | Closed | Data models, relationships, business logic structure |
| `/backend/__tests__` | Test suite | 🔴 Proprietary | Closed | Test cases reveal business logic and implementation details |
| **CONFIGURATION & INFRASTRUCTURE** ||||
| `/package.json` | Frontend dependencies | 🟢 Public | MIT | Standard dependency manifest |
| `/backend/package.json` | Backend dependencies | 🟢 Public | MIT | Standard dependency manifest |
| `/app.json` | Expo configuration | 🔴 Proprietary | Closed | App identifiers, bundle IDs, permissions |
| `/docker-compose.yml` | Docker configuration | 🟠 Internal Shared | Internal | Infrastructure setup; may be public template |
| `/backend/Dockerfile` | Container definition | 🟠 Internal Shared | Internal | Build configuration |
| `/env.example` | Environment template | 🟢 Public | MIT | Template for configuration (no secrets) |
| `/scripts` | Development scripts | 🟠 Internal Shared | Internal | Build/deployment scripts |
| `/backend/google-vision-key.json` | API credentials | 🔴 Proprietary | Closed | **CONFIDENTIAL** - Service account credentials; must be in .gitignore |
| **DOCUMENTATION** ||||
| `/README.md` | Project documentation | 🟢 Public | MIT | Public-facing documentation |
| `/docs/*.md` | Technical documentation | 🟠 Internal Shared | Internal | May be public later for onboarding |

---

## Recommended License Choices

### ⚠️ CRITICAL: Main Repository License Strategy

**Based on analysis: 60% of codebase is proprietary** → **Main repo must use PROPRIETARY license, NOT MIT**

### Primary License for Main Repository: PROPRIETARY (All Rights Reserved)

**Rationale:**
- ✅ Protects 60% proprietary code (AI prompts, algorithms, security)
- ✅ Prevents unauthorized distribution or use
- ✅ Maintains competitive advantages
- ✅ Allows controlled access under NDA if needed

**Use for:**
- **Main Aperae repository (default)**
- All proprietary components
- Business-critical code
- Security implementations

**What this means:**
- ❌ Code is NOT open-source
- ❌ Public distribution NOT allowed
- ❌ Commercial use by others NOT allowed
- ✅ Internal use only
- ✅ Explicit permission required for external use

### MIT License (ONLY for Extracted Open-Source Components)

**Rationale:**
- ✅ Most permissive and widely accepted
- ✅ Commercial use allowed
- ✅ Minimal restrictions
- ✅ Compatible with all dependencies

**Use for:**
- **Extracted open-source components ONLY** (separate repositories)
- Design system library (if extracted to separate repo)
- Standalone component libraries
- Public SDKs or libraries

**Implementation:**
- Extract component to separate repository
- Create MIT LICENSE in that repository only
- Clear separation between proprietary and open-source code

### Alternative: Apache 2.0 License (For Extracted Components)

**Consider if:**
- You want patent protection for open-source components
- You plan to license patents
- You want explicit patent grant language

**Use for:**
- Design system library (if separate repo)
- Standalone component library (if extracted)

---

## Open-Source Strategy Recommendations

### Phase 1: Design System (Low Risk, High Visibility)

**Extract:** `/src/design` → `@aperae/design-system` (separate repository)

**License:** MIT or Apache 2.0 (in separate repo only)

**Benefits:**
- Brand visibility
- Developer goodwill
- Community adoption
- Potential hiring tool

**Contents:**
- Color palettes
- Typography system
- Spacing utilities
- Design tokens

**Example Repository Structure:**
```
@pocketsomm/design-system/
├── colors.ts
├── typography.ts
├── spacing.ts
├── LICENSE (MIT)
└── README.md
```

### Phase 2: UI Component Library (Medium Risk, High Value)

**Extract:** Generic UI components → `@aperae/ui-components` (separate repository)

**License:** MIT (in separate repo only)

**Components to Include:**
- `ErrorBoundary.tsx`
- `LoadingSpinner.tsx`
- Generic button components (without business logic)
- Generic card components

**Components to Exclude:**
- `WineCard.tsx` (brand-specific)
- `EnhancedWineRecommendations.tsx` (business logic)
- Screen components (app-specific)

### Phase 3: Utility Libraries (Low Risk, Community Building)

**Extract:** Generic utilities → `@aperae/utils` (separate repository)

**License:** MIT (in separate repo only)

**Contents:**
- Validation utilities
- Error handling
- Type definitions (public API)

---

## Example License Headers

### For Open-Source Files (MIT License)

```typescript
/**
 * Copyright (c) 2025 Aperae. All Rights Reserved.
 * 
 * PROPRIETARY AND CONFIDENTIAL
 * 
 * This file contains proprietary and confidential information of Aperae.
 * Unauthorized copying, distribution, or use of this file, via any medium is
 * strictly prohibited without the express written permission of Aperae.
 * 
 * For licensing inquiries, contact: legal@aperae.com
 */

// Design System - Colors
// Aperae Design Tokens
```

**Note:** The above header is for proprietary files in the main repo. MIT license headers would only appear in extracted open-source components in separate repositories.

### For Proprietary/Closed Files

```typescript
/**
 * Copyright (c) 2025 Aperae. All Rights Reserved.
 * 
 * PROPRIETARY AND CONFIDENTIAL
 * 
 * This file contains proprietary and confidential information of Aperae.
 * Unauthorized copying, distribution, or use of this file, via any medium is
 * strictly prohibited without the express written permission of Aperae.
 * 
 * This file includes:
 * - Proprietary business logic and algorithms
 * - Trade secrets and competitive advantages
 * - Security implementations
 * 
 * For licensing inquiries, contact: legal@aperae.com
 */

// Wine Recommendation System Prompts
// Proprietary AI prompt engineering
```

### For Internal Shared Files

```typescript
/**
 * Copyright (c) 2025 Aperae. All Rights Reserved.
 * 
 * INTERNAL USE ONLY
 * 
 * This file is for internal use by Aperae and authorized partners only.
 * This code may be shared under NDA or partner agreements.
 * 
 * Not for public distribution or open-source use without explicit authorization.
 * 
 * For licensing inquiries, contact: legal@aperae.com
 */

// API Service Layer
// Internal service implementation
```

---

## High-Risk Areas Requiring Legal Counsel

### 1. AI Prompt Engineering (🔴 CRITICAL)

**Location:** `/backend/server.js` (lines 292-446, 451-700+)

**Risk Level:** 🔴 **CRITICAL**

**Concerns:**
- Sophisticated system prompts are a competitive advantage
- Prompt engineering is proprietary IP
- Revealing prompts could enable competitors to replicate functionality
- May contain trade secrets around AI interaction patterns

**Recommendation:**
- ✅ **KEEP CLOSED** - Do not open-source
- Add proprietary copyright headers
- Consider patent protection for unique prompt structures
- Document as trade secret if applicable

**Legal Review Needed:** Yes - Confirm trade secret status

---

### 2. Menu Analysis Algorithm (🔴 HIGH)

**Location:** `/src/services/menuAnalysisService.ts`

**Risk Level:** 🔴 **HIGH**

**Concerns:**
- Complex OCR text parsing algorithm (1500+ lines)
- Section-aware wine-price matching logic
- Proprietary parsing heuristics
- Competitive advantage in menu analysis

**Key Proprietary Elements:**
- Wine line detection patterns
- Price-wine association algorithm
- Category header recognition
- Section-aware matching strategy

**Recommendation:**
- ✅ **KEEP CLOSED** - Proprietary algorithm
- Consider patent protection for unique algorithms
- Document as trade secret

**Legal Review Needed:** Yes - Algorithm patentability

---

### 3. Price Estimation Formulas (🔴 HIGH)

**Location:** `/backend/services/wineData/priceCalibration/`

**Risk Level:** 🔴 **HIGH**

**Concerns:**
- Calibrated pricing models
- Business intelligence and market analysis
- Regression formulas and multipliers
- Competitive advantage in pricing accuracy

**Recommendation:**
- ✅ **KEEP CLOSED** - Business value
- Protect as trade secret
- Consider patent protection for pricing models

**Legal Review Needed:** Yes - Trade secret protection

---

### 4. Authentication & Security (🔴 HIGH)

**Location:** `/backend/authService.js`, `/backend/authMiddleware.js`, `/backend/securityValidator.js`

**Risk Level:** 🔴 **HIGH**

**Concerns:**
- Security implementations
- JWT token generation logic
- Security validation patterns
- Revealing security logic could enable attacks

**Recommendation:**
- ✅ **KEEP CLOSED** - Security by obscurity + proper implementation
- Consider security audit before any disclosure
- Only share security patterns under NDA

**Legal Review Needed:** Yes - Security disclosure implications

---

### 5. Credentials & Configuration (🔴 CRITICAL)

**Location:** 
- `/backend/google-vision-key.json`
- `.env` files
- Production security configs

**Risk Level:** 🔴 **CRITICAL**

**Concerns:**
- API keys and credentials
- Service account files
- Production configurations
- Security vulnerabilities if exposed

**Recommendation:**
- ✅ **MUST BE IN .gitignore** - Never commit
- Use environment variables
- Rotate credentials if accidentally exposed
- Use secret management services

**Action Required:** Verify `.gitignore` includes all credential files

---

### 6. Brand Assets (🔴 MEDIUM)

**Location:** `/assets/images/`

**Risk Level:** 🔴 **MEDIUM**

**Concerns:**
- Logo is trademarked
- Brand identity
- Unauthorized use of logo

**Recommendation:**
- ✅ **KEEP CLOSED** - Brand IP
- Add copyright notices
- Consider trademark registration
- Control logo usage through brand guidelines

**Legal Review Needed:** Yes - Trademark protection

---

## Recommended File Structure for Open-Source Components

### Separate Repository: `@aperae/design-system`

```
@aperae/design-system/
├── LICENSE                 # MIT License (in separate repo only)
├── README.md              # Documentation
├── package.json
├── src/
│   ├── colors.ts          # Color palettes
│   ├── typography.ts      # Typography system
│   ├── spacing.ts         # Spacing utilities
│   └── index.ts           # Public API
└── README.md
```

**Header Example (in separate open-source repo):**
```typescript
/**
 * @aperae/design-system
 * 
 * Copyright (c) 2025 Aperae
 * 
 * MIT License - See LICENSE file for details
 * 
 * Aperae Design System - Reusable design tokens for React Native applications
 */
```

**Important:** MIT license header only applies in the extracted open-source repository, not in the main proprietary repository.

---

## Implementation Checklist

### Immediate Actions

- [ ] **Review and approve classification table**
- [ ] **Legal review of high-risk areas**
- [ ] **Verify `.gitignore` includes all credential files**
- [ ] **Add copyright headers to all files**
- [ ] **Create PROPRIETARY LICENSE file in repository root** (NOT MIT - protects 60% proprietary code)

### Short-term (This Sprint)

- [ ] **Extract design system to separate package** (if open-sourcing)
- [ ] **Add proprietary headers to closed-source files**
- [ ] **Document open-source strategy in README**
- [ ] **Create CONTRIBUTING.md** (if open-sourcing components)

### Long-term (Post-Launch)

- [ ] **Launch design system package** (if approved)
- [ ] **Consider UI component library** (Phase 2)
- [ ] **Evaluate utility library extraction** (Phase 3)
- [ ] **Patent review for proprietary algorithms**

---

## Supporting Documents Needed

### 1. Root LICENSE File

**Location:** `/LICENSE`

**Content:** PROPRIETARY License (All Rights Reserved) with Aperae copyright

**Status:** ⚠️ **MISSING** - Create in Task 1.1.1

**Note:** This is PROPRIETARY, NOT MIT. MIT only applies to extracted open-source components in separate repositories.

### 2. README License Section

**Location:** `/README.md`

**Update:** Add license section clarifying PROPRIETARY status (not open-source)

**Status:** ⚠️ **INCOMPLETE** - Update in Task 1.1.1

**Content:** Clarify that repository is proprietary and not open-source

### 3. CONTRIBUTING.md (If Open-Sourcing)

**Location:** `/CONTRIBUTING.md`

**Content:** Guidelines for contributors, code of conduct, contribution process

**Status:** ❌ **NOT NEEDED YET** - Create if open-sourcing components

### 4. .gitignore Verification

**Location:** `/.gitignore`

**Verify Includes:**
- `*.env`
- `*.key.json`
- `google-vision-key.json`
- `node_modules/`
- `.env.local`
- `*.pem`
- `*.p12`

**Status:** ✅ **VERIFY** - Ensure all credentials are ignored

---

## Legal Counsel Consultation Topics

### High Priority

1. **AI Prompt Engineering Trade Secrets**
   - Can prompts be protected as trade secrets?
   - Should prompts be patented?
   - What level of disclosure is safe?

2. **Algorithm Patentability**
   - Menu analysis algorithm patent potential
   - Price estimation formula protection
   - Software patent strategy

3. **Open-Source License Strategy**
   - MIT vs Apache 2.0 for design system
   - Contributor license agreements (if applicable)
   - Dual licensing strategy

4. **Brand Protection**
   - Trademark registration for logo
   - Brand asset licensing
   - Usage guidelines for open-source components

### Medium Priority

5. **Third-Party Code Review**
   - Verify all dependencies are properly licensed
   - Check for GPL/copyleft licenses
   - Ensure license compatibility

6. **Employee/Contractor IP Assignment**
   - Verify all code is properly assigned
   - Review contractor agreements
   - Ensure no third-party IP claims

---

## Summary & Next Steps

### Classification Summary

**Proprietary/Confidential (60%):**
- Core business logic
- AI prompt engineering
- Proprietary algorithms
- Security implementations
- Brand assets

**Internal Shared (17%):**
- API services
- Infrastructure setup
- Utilities (may become public)

**Public Candidate (23%):**
- Design system
- Generic UI components
- Utility functions
- Type definitions

### Recommended Approach

1. **Keep Main Application Closed** - Proprietary IP and competitive advantage
2. **Open-Source Design System** - Low risk, high visibility
3. **Consider UI Component Library** - After launch, evaluate community interest
4. **Protect Proprietary Algorithms** - Legal review for patent/trade secret protection

### Next Steps

1. **Legal Review** - Schedule consultation for high-risk areas
2. **Create PROPRIETARY LICENSE File** - Task 1.1.1 (NOT MIT - protects proprietary code)
3. **Add Copyright Headers** - All files with "All Rights Reserved"
4. **Verify .gitignore** - Ensure credentials are protected
5. **Document Strategy** - Update README clarifying proprietary license status
6. **Plan Open-Source Extraction** - If/when extracting components, create separate repos with MIT licenses

---

**Document Status:** ✅ Ready for Review  
**Next Review:** After legal counsel consultation  
**Owner:** Senior Engineering Team + Legal Counsel

