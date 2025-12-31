# Menu Sommelier Prompt V2.2 - Implementation Plan

## Overview

This document outlines the phased implementation plan for Menu Sommelier Prompt V2.2, following best practices from V7.0 implementation and ensuring backward compatibility.

---

## PHASE 1: Backend Normalizer Updates (Backward Compatibility)

### Goal
Ensure `responseNormalizer.js` handles both old and new V2.2 schema formats gracefully.

### Tasks

#### 1.1 Update `normalizeDishAnalysis()`
**File**: `backend/utils/responseNormalizer.js`

**Changes Needed:**
- Add support for new V2.2 fields:
  - `cookingMethod` (string)
  - `cookingMethodImpact` (string)
  - `sauce` (string)
  - `sauceCharacteristic` (string)
  - `saucePriority` (string)
  - `idealProfile.maxABV` (string, optional)
- Preserve existing fields (backward compatible)
- Add defaults for missing fields if needed

**Code Pattern:**
```javascript
function normalizeDishAnalysis(analysis) {
  if (!analysis || typeof analysis !== 'object') {
    return null;
  }
  
  return {
    // Existing fields (preserved for backward compatibility)
    dominantWeight: analysis.dominantWeight || 'medium',
    fatContent: analysis.fatContent || 'medium',
    primaryProtein: analysis.primaryProtein || '',
    dominantFlavors: Array.isArray(analysis.dominantFlavors) 
      ? analysis.dominantFlavors 
      : [],
    spiceLevel: analysis.spiceLevel || 'none',
    acidityLevel: analysis.acidityLevel || 'medium',
    applicablePrinciples: Array.isArray(analysis.applicablePrinciples)
      ? analysis.applicablePrinciples
      : [],
    keyChallenge: analysis.keyChallenge || '',
    
    // New V2.2 fields
    cookingMethod: analysis.cookingMethod || null,
    cookingMethodImpact: analysis.cookingMethodImpact || null,
    sauce: analysis.sauce || null,
    sauceCharacteristic: analysis.sauceCharacteristic || null,
    saucePriority: analysis.saucePriority || null,
    
    idealProfile: analysis.idealProfile || {
      acidity: 'medium',
      acidType: 'balanced',
      tannin: 'medium',
      body: 'medium',
      sweetness: 'dry',
      maxABV: null, // New field
      notes: ''
    }
  };
}
```

#### 1.2 Update `normalizeConfidence()`
**File**: `backend/utils/responseNormalizer.js`

**Changes Needed:**
- Handle V2.2 `tierAdjustments` field in `confidence.breakdown`
- Ensure backward compatibility with legacy `confidenceScore` (number) format

**Code Pattern:**
```javascript
function normalizeConfidence(rec) {
  // If new format exists, validate and return
  if (rec.confidence && typeof rec.confidence === 'object') {
    const breakdown = rec.confidence.breakdown || {};
    return {
      score: rec.confidence.score || 0,
      breakdown: {
        pairingScience: breakdown.pairingScience || 0,
        wineKnowledge: breakdown.wineKnowledge || 0,
        complexityHandling: breakdown.complexityHandling || 0,
        tierAdjustments: breakdown.tierAdjustments || 0 // New V2.2 field
      },
      rationale: rec.confidence.rationale || ''
    };
  }
  
  // Legacy format - convert
  const score = rec.confidenceScore || 0;
  return {
    score,
    breakdown: {
      pairingScience: Math.round(score * 0.5),
      wineKnowledge: Math.round(score * 0.3),
      complexityHandling: Math.round(score * 0.2),
      tierAdjustments: 0 // Default for legacy
    },
    rationale: rec.confidenceRationale || ''
  };
}
```

#### 1.3 Update `normalizeRecommendation()`
**File**: `backend/utils/responseNormalizer.js`

**Changes Needed:**
- Ensure `tierLabel` is preserved (present in both old and V2.2)
- Add support for `tierRationale` (new V2.2 field)
- Handle `tastingNotes` as object (V2.2) or string (legacy)
- Handle `confidence` as object (V2.2) or legacy format
- Preserve `storytellingElements` (present in V2.2)
- Handle missing fields gracefully (expertRating, retailerSuggestion, image - removed in V2.2)

**Code Pattern:**
```javascript
function normalizeRecommendation(rec) {
  if (!rec || typeof rec !== 'object') {
    return rec;
  }
  
  return {
    // Core fields (always present)
    wineName: rec.wineName || '',
    producer: rec.producer || '',
    vintage: rec.vintage || 'unknown',
    category: rec.category || '',
    rationale: rec.rationale || '',
    
    // Tier classification (present in both formats)
    tierLabel: rec.tierLabel || null,
    tierRationale: rec.tierRationale || null, // New V2.2 field
    
    // Price (if present)
    pricePoint: rec.pricePoint || null,
    
    // Tasting notes (handle both formats)
    tastingNotes: normalizeTastingNotes(rec.tastingNotes),
    
    // Serving guidance
    servingGuidance: normalizeServingGuidance(rec.servingGuidance),
    
    // Confidence (handle both formats)
    confidence: normalizeConfidence(rec),
    
    // Pairing principles
    pairingPrinciplesApplied: Array.isArray(rec.pairingPrinciplesApplied)
      ? rec.pairingPrinciplesApplied
      : [],
    
    // Optional fields (may be missing in V2.2)
    expertRating: rec.expertRating || null,
    retailerSuggestion: rec.retailerSuggestion || null,
    image: rec.image || null,
    
    // Storytelling (present in V2.2)
    storytellingElements: rec.storytellingElements || null,
    
    // Additional V2.2 fields
    grape: rec.grape || null,
    region: rec.region || null
  };
}
```

#### 1.4 Add `normalizeResponse()` Update
**File**: `backend/utils/responseNormalizer.js`

**Changes Needed:**
- Handle new `menuLimitations` field at response level
- Preserve existing fields

**Code Pattern:**
```javascript
function normalizeResponse(response) {
  if (!response || typeof response !== 'object') {
    return response;
  }
  
  return {
    dish: response.dish || '',
    dishAnalysis: normalizeDishAnalysis(response.dishAnalysis),
    recommendations: (response.recommendations || []).map(normalizeRecommendation),
    closingNarrative: response.closingNarrative || '',
    menuLimitations: response.menuLimitations || null, // New V2.2 field
    // Legacy fields (if present)
    pairingNotes: response.pairingNotes || null
  };
}
```

#### 1.5 Testing Phase 1
- Unit tests for normalizer functions
- Test with V2.2 response format
- Test with legacy response format
- Test with mixed formats
- Verify backward compatibility

---

## PHASE 2: Prompt Implementation (Modular Structure)

### Goal
Implement Menu Sommelier Prompt V2.2 using modular structure (similar to V7.0).

### Tasks

#### 2.1 Create Prompt Structure Files
**Files to Create:**
1. `backend/prompts/menu-v2.2-master-prompt.js` - Main builder
2. `backend/prompts/menu-v2.2-static-sections.js` - Static/cacheable sections
3. `backend/prompts/menu-v2.2-dynamic-sections.js` - Dynamic sections

#### 2.2 Extract Static Sections
**File**: `backend/prompts/menu-v2.2-static-sections.js`

**Sections to Extract (All Static):**
- Pre-Selection Protocol (Steps 1-5)
- Section 1: Menu Selection Constraints
- Section 2: Pairing Principles
- Section 3: Tier Classification (SIMPLIFIED SIGNALS)
- Section 4: Menu Wine Evaluation Protocol
- Section 5: Selection Strategy
- Section 6: Output Requirements
- Section 7: JSON Output Format (schema)
- Section 8: Pre-Flight Checklist
- Section 9: Personality & Tone

#### 2.3 Create Dynamic Sections
**File**: `backend/prompts/menu-v2.2-dynamic-sections.js`

**Dynamic Elements:**
- Dish name (from `[INSERT DISH HERE]`)
- Menu wines list (from `[MENU_WINES_LIST]`)
- Reference date (should be dynamic, not hardcoded)

#### 2.4 Build Main Prompt Builder
**File**: `backend/prompts/menu-v2.2-master-prompt.js`

**Function Signature:**
```javascript
function buildMenuV2Prompt(dish, menuWinesList, referenceDate = null) {
  // Generate reference date if not provided
  const refDate = referenceDate || new Date().toISOString().split('T')[0];
  
  // Build complete prompt from sections
  // Replace placeholders with actual values
  // Return complete prompt string
}
```

#### 2.5 Update server.js
**File**: `backend/server.js`

**Changes:**
- Import `buildMenuV2Prompt` from prompts file
- Replace `MENU_SOMMELIER_PROMPT` constant with function call
- Update menu context handling to use new builder
- Ensure reference date is dynamic (current date)

**Code Pattern:**
```javascript
const { buildMenuV2Prompt } = require('./prompts/menu-v2.2-master-prompt');

// In menu context handling:
if (isMenuContext) {
  // Format menu wines list
  let menuWinesList = '';
  availableWines.forEach((wine, index) => {
    // ... existing formatting logic ...
  });
  
  // Get current date for reference
  const referenceDate = new Date().toISOString().split('T')[0];
  
  // Build prompt
  enhancedPrompt = buildMenuV2Prompt(dish, menuWinesList, referenceDate);
}
```

#### 2.6 Testing Phase 2
- Test prompt assembly with various dishes
- Test with different menu sizes (small/large)
- Verify placeholder replacement works correctly
- Verify reference date is dynamic
- Test API calls return expected format

---

## PHASE 3: Database Service Updates

### Goal
Update `wineRecommendationDatabaseService.js` to handle V2.2 response format.

### Tasks

#### 3.1 Update Field Extraction
**File**: `backend/services/wineRecommendationDatabaseService.js`

**Changes Needed:**
- Extract new `dishAnalysis` fields:
  - `cookingMethod`
  - `cookingMethodImpact`
  - `sauce`
  - `sauceCharacteristic`
  - `saucePriority`
  - `idealProfile.maxABV`
- Extract `tierRationale` from recommendations
- Extract `menuLimitations` from response level
- Handle `confidence.breakdown.tierAdjustments`
- Handle missing fields gracefully (expertRating, retailerSuggestion, image)

#### 3.2 Update Database Mapping
**File**: `backend/services/wineRecommendationDatabaseService.js`

**Changes:**
- Map new fields to database columns
- Ensure existing columns handle null values for removed fields
- Verify `tierLabel` and `tierRationale` are stored correctly

**Database Fields to Map:**
```javascript
// New dishAnalysis fields (if columns exist, otherwise store in JSONB)
cooking_method: dishAnalysis.cookingMethod || null,
cooking_method_impact: dishAnalysis.cookingMethodImpact || null,
sauce: dishAnalysis.sauce || null,
sauce_characteristic: dishAnalysis.sauceCharacteristic || null,
sauce_priority: dishAnalysis.saucePriority || null,
max_abv: dishAnalysis.idealProfile?.maxABV || null,

// Tier fields
tier_label: rec.tierLabel || null,
tier_rationale: rec.tierRationale || null, // New

// Confidence breakdown
confidence_tier_adjustments: confidence.breakdown?.tierAdjustments || null, // New

// Removed fields (may be null for V2.2 responses)
expert_rating: rec.expertRating || null, // May be null in V2.2
retailer_suggestion: rec.retailerSuggestion || null, // May be null in V2.2
image_url: rec.image || null // May be null in V2.2
```

#### 3.3 Update fieldExtractorService (if needed)
**File**: `backend/services/fieldExtractorService.js`

**Changes:**
- Verify it handles new V2.2 fields
- Ensure backward compatibility with legacy format

#### 3.4 Testing Phase 3
- Test database storage with V2.2 responses
- Test with legacy responses (backward compatibility)
- Verify all fields are stored correctly
- Check database schema supports new fields
- Test retrieval and querying

---

## PHASE 4: Integration Testing & Validation

### Goal
Ensure end-to-end functionality works correctly.

### Tasks

#### 4.1 End-to-End Testing
- Test menu context API endpoint
- Verify response format matches V2.2 schema
- Verify normalization works correctly
- Verify database storage works correctly
- Test with various menu sizes
- Test with various dishes

#### 4.2 Backward Compatibility Testing
- Test with legacy response format (if any exist)
- Verify normalizer handles both formats
- Verify database service handles both formats

#### 4.3 Error Handling
- Test error cases (invalid responses, missing fields)
- Verify graceful degradation
- Test edge cases (empty menus, very large menus)

#### 4.4 Performance Testing
- Monitor API response times
- Monitor token usage (if caching implemented)
- Monitor database insert performance

---

## IMPLEMENTATION ORDER

### Recommended Sequence

1. **Phase 1: Backend Normalizer** (30-45 min)
   - Critical for backward compatibility
   - No breaking changes
   - Can be tested independently

2. **Phase 2: Prompt Implementation** (2-3 hours)
   - Extract prompt to modular structure
   - Update server.js to use new builder
   - Test prompt assembly and API calls

3. **Phase 3: Database Service** (1-2 hours)
   - Update field extraction and mapping
   - Test database storage
   - Verify schema compatibility

4. **Phase 4: Integration Testing** (1-2 hours)
   - End-to-end testing
   - Backward compatibility verification
   - Performance validation

**Total Estimated Time**: 5-8 hours

---

## ROLLBACK PLAN

### If Issues Arise

1. **Phase 1 Rollback**: Normalizer changes are backward compatible, minimal risk
2. **Phase 2 Rollback**: Keep old `MENU_SOMMELIER_PROMPT` constant, can switch back easily
3. **Phase 3 Rollback**: Database service handles null values, backward compatible
4. **Feature Flag**: Consider adding feature flag to toggle between old/new prompt (optional)

---

## SUCCESS CRITERIA

### Phase 1 Complete When:
- ✅ Normalizer handles V2.2 schema
- ✅ Normalizer maintains backward compatibility
- ✅ Unit tests pass

### Phase 2 Complete When:
- ✅ Prompt extracted to modular structure
- ✅ Prompt builder function works correctly
- ✅ API calls return V2.2 format responses
- ✅ Reference date is dynamic

### Phase 3 Complete When:
- ✅ Database service stores V2.2 responses correctly
- ✅ All new fields are extracted and stored
- ✅ Backward compatibility maintained

### Phase 4 Complete When:
- ✅ End-to-end flow works correctly
- ✅ All tests pass
- ✅ Performance acceptable
- ✅ Ready for production deployment

---

## NOTES

- **Reference Date**: Currently hardcoded "December 21, 2025" in prompt - should be dynamic (current date)
- **Menu Size**: Menu wines list can vary significantly (10-200+ wines) - ensure prompt handles this
- **Caching**: Phase 2 modularization enables future prompt caching (Phase 2.5 - optional enhancement)
- **Database Schema**: May need to verify/update database schema to support new fields (cooking_method, sauce, tier_rationale, etc.)



