# MENU SOMMELIER PROMPT V2.2 - Assessment Report

## Executive Summary

This document provides a comprehensive assessment of the proposed **MENU SOMMELIER PROMPT V2.2** compared to the existing **MENU_SOMMELIER_PROMPT**, including strengths, weaknesses, and upstream/downstream impacts across the codebase.

---

## 1. COMPARATIVE ANALYSIS

### 1.1 Strengths of V2.2

#### **Enhanced Scientific Rigor**
- **Pre-Selection Protocol**: V2.2 introduces a structured 5-step pre-selection process (Dish Analysis → Required Wine Profile → Menu Size-Based Shortlist → Menu Filtering → Format Variations) that systematically narrows candidates before detailed evaluation
- **Tier 1 Violations Framework**: Comprehensive master list of critical pairing violations with explicit penalties (confidence capped at 70) and disqualification criteria
- **Scenario-Based Tannin-Umami Decision Tree**: Sophisticated 3-scenario framework addressing high/moderate/low protein + umami combinations with specific wine requirements (aged wines, low-tannin grapes, etc.)

#### **Improved Menu Context Handling**
- **Menu Format Variations**: Explicit handling of full/abbreviated/minimal menu formats with strict "use EXACT formatting" rules
- **Menu Size-Based Shortlisting**: Dynamic candidate filtering based on total menu size (50+ wines → 8-10 candidates, 20-50 → 6-8, etc.)
- **Anti-Hallucination Protocol**: Enhanced safeguards against fabricating wine details, with "unknown" fallbacks and regional typicity assessments

#### **Refined Pairing Principles**
- **Preparation & Sauce Priority (20% weight)**: Explicitly prioritizes cooking method + sauce over protein alone, with mandatory rationale requirements
- **Acid Type Specification**: Detailed rules for when to specify malic vs tartaric acid (only when all 3 conditions met)
- **ABV Management for Capsaicin**: Scientific approach to ABV limits (≤13.5% optimal, ≤14.5% acceptable, >14.5% prohibited) with TRPV1 receptor rationale
- **Flavor Bridging Hierarchy**: Tier 1-3 system with verified compound lists and penalties for false claims (-6 points)

#### **Structured Confidence Scoring**
- **Component-Based Calculation**: Pairing Science (0-50) + Wine Knowledge (0-30) + Complexity Handling (0-20) with explicit deduction rules
- **Arithmetic Verification**: Explicit requirement that breakdown components sum to total score
- **Tier-Specific Adjustments**: Deductions for unfamiliar wines, uncertainty, typicity-based assessment

#### **Enhanced Output Requirements**
- **Comprehensive Dish Analysis**: Extended structure with cookingMethod, cookingMethodImpact, sauce, sauceCharacteristic, saucePriority, idealProfile with maxABV constraint
- **Structured Tasting Notes**: Explicit aromas (array), palate (string), finish (string) format with standard vocabulary
- **Menu Limitations Field**: Dedicated field for honest assessment when menu options are limited

### 1.2 Weaknesses/Concerns of V2.2

#### **Complexity & Token Count**
- **Length**: V2.2 is significantly longer (~3x) than current prompt, increasing:
  - API token costs (both input and processing time)
  - Risk of hitting max_tokens limits (currently 2500)
  - Potential for Claude to truncate responses
- **Response Time**: More detailed instructions may increase Claude's processing time (already 55-60s, close to timeout limits)

#### **JSON Schema Changes**
- **Breaking Changes**: V2.2 JSON schema differs significantly from current implementation:
  - Current: `tierLabel`, `confidenceScore` (number), `tastingNotes` (string), `expertRating`, `retailerSuggestion`, `image`, `storytellingElements`
  - V2.2: Keeps `tierLabel` (with new `tierRationale` field), changes `confidence` to object with `breakdown`, changes `tastingNotes` to object, removes `expertRating`/`retailerSuggestion`/`image`, keeps `storytellingElements`, adds `menuLimitations`
  - Note: `tierLabel` (with `tierRationale`) and `storytellingElements` ARE present in V2.2 (correction from initial assessment)
- **Backend Compatibility**: Current `responseNormalizer.js` and `wineRecommendationDatabaseService.js` expect current schema structure

#### **Confidence Score Structure Change**
- **Current**: Single `confidenceScore` (number) with optional `confidenceRationale` (string)
- **V2.2**: `confidence` object with `score`, `breakdown` (pairingScience, wineKnowledge, complexityHandling, tierAdjustments), and `rationale`
- **Impact**: Frontend components using `getConfidenceScore()` helper may need updates, though helper likely handles both formats

#### **Menu Format Handling**
- **Current**: Menu wines formatted as simple list with pipe separators
- **V2.2**: Expects menu to be provided but doesn't specify exact formatting requirements for `[MENU_WINES_LIST]` placeholder (may need adjustment in server.js formatting logic)

#### **Missing Fields in V2.2**
- **Removed Fields**:
  - `expertRating` - May be displayed in UI
  - `retailerSuggestion` - Not critical but may be used
  - `image` - Not critical but may be used
- **Note**: `tierLabel` (with new `tierRationale` field) and `storytellingElements` ARE present in V2.2 (correction from initial assessment)
- **New Fields**:
  - `menuLimitations` - Not in current schema, would need frontend/backend handling
  - `dishAnalysis.cookingMethod`, `cookingMethodImpact`, `sauce`, `sauceCharacteristic`, `saucePriority`, `idealProfile.maxABV` - Extended dish analysis

#### **Specificity vs. Flexibility**
- **Very Prescriptive**: V2.2 is extremely detailed with specific rules, deductions, and formats
  - **Risk**: May be too rigid, limiting Claude's ability to handle edge cases
  - **Benefit**: More consistent, scientific outputs
- **Regional Typicity Fallback**: Good safeguard but may result in generic recommendations for unfamiliar wines

---

## 2. CODEBASE IMPACT ANALYSIS

### 2.1 Backend Changes Required

#### **server.js (Primary Impact)**
- **Location**: Lines 311-522 (MENU_SOMMELIER_PROMPT definition), Lines 1210-1239 (menu context handling)
- **Changes Needed**:
  1. Replace `MENU_SOMMELIER_PROMPT` constant with V2.2 version
  2. Verify `[INSERT DISH HERE]` and `[MENU_WINES_LIST]` placeholders still work correctly
  3. Ensure menu wine formatting (lines 1216-1235) remains compatible with V2.2 expectations
  4. Consider adding `REFERENCE_DATE` placeholder replacement (currently hardcoded to "December 21, 2025" in V2.2, should be dynamic)

#### **responseNormalizer.js (Critical)**
- **Location**: `backend/utils/responseNormalizer.js`
- **Current Behavior**: Normalizes tasting notes (string → object) and confidence (number → object) for backward compatibility
- **Changes Needed**:
  1. **Tasting Notes**: V2.2 already uses object format, but ensure normalizer handles V2.2 structure correctly
  2. **Confidence**: V2.2 uses `confidence` object with `breakdown.tierAdjustments` (new field), ensure normalizer includes this
  3. **Dish Analysis**: V2.2 adds many new fields (`cookingMethod`, `cookingMethodImpact`, `sauce`, `sauceCharacteristic`, `saucePriority`, `idealProfile.maxABV`), normalizer should preserve these
  4. **Menu Limitations**: New top-level field, ensure preserved in normalization
  5. **Removed Fields**: `tierLabel`, `expertRating`, `retailerSuggestion`, `image`, `storytellingElements` - ensure normalizer doesn't break if these are missing

#### **wineRecommendationDatabaseService.js (Critical)**
- **Location**: `backend/services/wineRecommendationDatabaseService.js`
- **Current Schema**: Expects fields like `tierLabel`, `expertRating`, `retailerSuggestion`, `image`, `storytellingElements`
- **Changes Needed**:
  1. **Schema Update**: Database schema may need updates to accommodate new fields (`menuLimitations` at response level, extended `dishAnalysis` fields)
  2. **Field Mapping**: Update field extraction to handle:
     - V2.2 `confidence` object structure (already handles object, but verify `tierAdjustments` in breakdown)
     - V2.2 `tastingNotes` object (already handles, but verify structure)
     - New `dishAnalysis` fields (cookingMethod, sauce, etc.)
  3. **Removed Fields**: Fields like `tierLabel`, `expertRating` may be stored as null/empty if missing (should be safe)

#### **swagger.js (Documentation)**
- **Location**: `backend/swagger.js`
- **Changes Needed**:
  1. Update `WineRecommendation` schema to reflect V2.2 structure:
     - Remove: `tierLabel`, `expertRating`, `retailerSuggestion`, `image`, `storytellingElements`
     - Update: `confidence` (object with breakdown), `tastingNotes` (object)
     - Add: `menuLimitations` (if at recommendation level, though V2.2 shows it at response level)
  2. Update `WineRecommendationResponse` schema to add `menuLimitations` field
  3. Update `DishAnalysis` schema to include new fields (cookingMethod, sauce, sauceCharacteristic, saucePriority, idealProfile.maxABV)

### 2.2 Frontend Changes Required

#### **Type Definitions**
- **Location**: `src/types/wine.ts` (likely)
- **Changes Needed**:
  1. Update `WineRecommendation` interface to match V2.2 schema
  2. Update `Confidence` type to include `tierAdjustments` in breakdown
  3. Update `DishAnalysis` interface to include new fields
  4. Add `menuLimitations` to response type

#### **Components**
- **FlipWineCard.tsx**: 
  - Currently uses `getConfidenceScore()` helper (likely handles both formats)
  - May display `tierLabel` - need to verify if this is shown and handle removal
  - Verify `tastingNotes` display handles object format (likely already does)
- **Menu Screen Components**: 
  - Verify handling of removed fields (`expertRating`, `retailerSuggestion`, `image`, `storytellingElements`)
  - Verify display of `menuLimitations` if needed

#### **Helper Functions**
- **wineTypeHelpers.ts**:
  - `getConfidenceScore()` - Verify handles V2.2 `confidence` object structure (likely already does)
  - `getConfidenceBreakdown()` - Verify handles `tierAdjustments` field
  - `getTastingNotesDisplay()` - Verify handles V2.2 object structure (likely already does)

#### **Services**
- **wineService.ts**:
  - Verify mock data structure matches V2.2 schema for menu context
  - Verify API response handling works with new schema

### 2.3 Database Schema Impact

#### **wine_recommendations Table**
- **Current Fields**: Likely includes columns for `tier_label`, `expert_rating`, `retailer_suggestion`, `image_url`, `storytelling_elements`
- **Impact**: 
  - Existing columns remain (may be null for V2.2 responses)
  - May need new columns for extended `dishAnalysis` fields (cooking_method, sauce, sauce_characteristic, sauce_priority, max_abv in ideal_profile)
  - May need column for `menu_limitations` (if storing at recommendation level)

#### **Migration Considerations**
- **Backward Compatibility**: Existing records will have old schema fields populated
- **New Records**: V2.2 responses won't populate removed fields (null values)
- **Query Updates**: Any queries filtering/sorting by removed fields may need updates

---

## 3. RISK ASSESSMENT

### 3.1 High Risk Areas

1. **JSON Schema Breaking Changes**
   - **Risk Level**: HIGH
   - **Impact**: Frontend/backend may fail to parse/display V2.2 responses correctly
   - **Mitigation**: Comprehensive testing of response normalization, update type definitions, verify component handling

2. **Response Size/Token Limits**
   - **Risk Level**: MEDIUM-HIGH
   - **Impact**: V2.2 prompt is ~3x longer, may increase response size, risk of truncation
   - **Mitigation**: Monitor token usage, consider increasing `max_tokens` if needed, test with various menu sizes

3. **Database Schema Compatibility**
   - **Risk Level**: MEDIUM
   - **Impact**: Missing fields in new responses, potential data loss if not handled
   - **Mitigation**: Ensure database service handles null/missing fields gracefully, consider migration if needed

4. **Frontend Display Issues**
   - **Risk Level**: MEDIUM
   - **Impact**: UI may break or show incorrectly if expecting removed fields
   - **Mitigation**: Verify all components handle missing fields, update UI to use new schema

### 3.2 Medium Risk Areas

1. **Prompt Complexity**
   - **Risk Level**: MEDIUM
   - **Impact**: More complex prompt may lead to inconsistent outputs or longer processing times
   - **Mitigation**: Extensive testing with various dishes and menu scenarios

2. **Regional Typicity Fallback**
   - **Risk Level**: MEDIUM
   - **Impact**: May result in generic recommendations for unfamiliar wines
   - **Mitigation**: Monitor confidence scores, ensure fallback logic works correctly

3. **Menu Format Variations**
   - **Risk Level**: LOW-MEDIUM
   - **Impact**: V2.2 expects exact menu formatting, current formatting logic may need adjustment
   - **Mitigation**: Verify menu wine list formatting in server.js matches V2.2 expectations

### 3.3 Low Risk Areas

1. **Reference Date**
   - **Risk Level**: LOW
   - **Impact**: Hardcoded "December 21, 2025" should be dynamic
   - **Mitigation**: Easy fix - replace with current date in server.js

2. **Tier Adjustments Field**
   - **Risk Level**: LOW
   - **Impact**: New field in confidence breakdown, should be additive only
   - **Mitigation**: Ensure normalizer includes this field

---

## 4. MIGRATION STRATEGY RECOMMENDATIONS

### 4.1 Phased Approach

#### **Phase 1: Backend Preparation**
1. Update `responseNormalizer.js` to handle V2.2 schema (backward compatible)
2. Update `wineRecommendationDatabaseService.js` to handle new/removed fields
3. Update Swagger documentation
4. Add feature flag for V2.2 prompt (allow A/B testing)

#### **Phase 2: Testing**
1. Deploy backend changes (with feature flag disabled)
2. Enable V2.2 for internal testing
3. Test with various menu scenarios (small/large menus, familiar/unfamiliar wines)
4. Verify response normalization and database storage
5. Monitor token usage and response times

#### **Phase 3: Frontend Updates**
1. Update type definitions
2. Update components to handle new schema
3. Remove/handle removed fields gracefully
4. Test UI with V2.2 responses

#### **Phase 4: Gradual Rollout**
1. Enable V2.2 for small percentage of requests (A/B test)
2. Monitor error rates, response quality, user feedback
3. Gradually increase percentage
4. Full rollout once stable

### 4.2 Backward Compatibility Strategy

- **Dual Schema Support**: Maintain normalizer that handles both old and new schemas
- **Graceful Degradation**: Frontend components should handle missing fields
- **Database Flexibility**: Store all fields, allow null values for removed fields

---

## 5. SPECIFIC CODE CHANGES NEEDED

### 5.1 Critical Files

1. **backend/server.js**
   - Replace `MENU_SOMMELIER_PROMPT` (lines 311-522)
   - Add `REFERENCE_DATE` placeholder replacement in menu context handling (line ~1239)
   - Verify menu wine list formatting compatibility

2. **backend/utils/responseNormalizer.js**
   - Update `normalizeDishAnalysis()` to preserve new fields
   - Update `normalizeConfidence()` to handle `tierAdjustments`
   - Ensure `normalizeRecommendation()` handles removed fields gracefully
   - Add handling for `menuLimitations` field

3. **backend/services/wineRecommendationDatabaseService.js**
   - Update field extraction for new `dishAnalysis` fields
   - Handle missing fields (tierLabel, expertRating, etc.) gracefully
   - Verify `confidence` object handling includes `tierAdjustments`

4. **backend/swagger.js**
   - Update `WineRecommendation` schema
   - Update `WineRecommendationResponse` schema
   - Update `DishAnalysis` schema

5. **src/types/wine.ts** (if exists)
   - Update type definitions to match V2.2 schema

### 5.2 Testing Requirements

1. **Unit Tests**: Update tests for normalizer, database service
2. **Integration Tests**: Test menu context API endpoint with V2.2 responses
3. **E2E Tests**: Test full flow from menu scan to recommendation display
4. **Load Tests**: Monitor token usage, response times with V2.2 prompt

---

## 6. RECOMMENDATIONS

### 6.1 Immediate Actions

1. **✅ PROCEED with V2.2 Implementation** - The scientific rigor and structured approach significantly improve recommendation quality
2. **Implement Feature Flag** - Allow A/B testing and gradual rollout
3. **Update Response Normalizer First** - Ensure backward compatibility before switching prompts
4. **Test Extensively** - Focus on edge cases (small menus, unfamiliar wines, complex dishes)

### 6.2 Concerns to Address

1. **Token Cost/Response Time** - Monitor closely, consider optimization if needed
2. **Breaking Changes** - Ensure comprehensive testing of schema changes
3. **Missing Fields** - Verify UI gracefully handles removed fields
4. **Reference Date** - Make dynamic (not hardcoded)

### 6.3 Future Enhancements

1. Consider extracting prompt to separate file (like V7.0 prompt) for easier maintenance
2. Add validation layer to verify V2.2 responses match schema before normalization
3. Consider caching common menu analysis scenarios to reduce token usage

---

## 7. CONCLUSION

**V2.2 is a significant improvement** over the current prompt, with:
- ✅ Enhanced scientific rigor and structured evaluation
- ✅ Better menu context handling
- ✅ Comprehensive violation prevention
- ✅ Detailed confidence scoring methodology

**However, implementation requires:**
- ⚠️ Careful handling of breaking JSON schema changes
- ⚠️ Comprehensive testing across all codebase layers
- ⚠️ Monitoring of token usage and response times
- ⚠️ Gradual rollout strategy

**Recommendation: PROCEED with phased implementation approach, starting with backend compatibility layer, then testing, then frontend updates, then gradual rollout.**

