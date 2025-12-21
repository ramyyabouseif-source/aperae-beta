# Menu Sommelier Prompt V2.2 - Modularization Analysis

## Executive Summary

This document analyzes whether to modularize the Menu Sommelier Prompt V2.2 similar to the V7.0 Master Sommelier Prompt implementation, including pros/cons and implementation recommendations.

---

## 1. COMPARISON: Modular vs. Monolithic Approach

### 1.1 V7.0 Implementation (Modular)

**Structure:**
- `v7-master-sommelier-prompt.js` - Main builder function
- `v7-static-sections.js` - Cacheable sections (pairing principles, tier classification, confidence scoring)
- `v7-dynamic-sections.js` - Per-request sections (dish analysis protocol, vintage selection, output requirements)
- Separation enables Anthropic prompt caching (60-70% token cost savings)

**Benefits:**
- ✅ **Cost Savings**: Large static sections cached by Anthropic API (significant token reduction)
- ✅ **Maintainability**: Easier to update specific sections without touching entire prompt
- ✅ **Testability**: Can unit test individual sections
- ✅ **Readability**: Smaller files easier to navigate and review
- ✅ **Version Control**: Better diff tracking for changes to specific sections

**Drawbacks:**
- ⚠️ **Complexity**: More files to manage
- ⚠️ **Assembly Logic**: Need builder function to combine sections correctly
- ⚠️ **Dependency Management**: Must ensure all sections are properly imported

### 1.2 Menu V2.2 Current State (Monolithic - Proposed)

**Structure:**
- Single large string constant in `server.js` (~700 lines)
- All sections in one block
- Simple string replacement for placeholders (`[INSERT DISH HERE]`, `[MENU_WINES_LIST]`)

**Benefits:**
- ✅ **Simplicity**: Single file, easy to see entire prompt
- ✅ **No Assembly**: Direct string replacement, minimal logic
- ✅ **Quick Implementation**: Faster to implement initially

**Drawbacks:**
- ❌ **No Caching**: Cannot leverage Anthropic prompt caching (higher costs)
- ❌ **Maintainability**: Large file hard to navigate and update
- ❌ **Token Costs**: Higher API costs (no caching benefits)
- ❌ **Code Organization**: Clutters `server.js` with large prompt definition

---

## 2. MENU V2.2 SPECIFIC CONSIDERATIONS

### 2.1 Prompt Length Analysis

**V2.2 Prompt Breakdown:**
- **Total Length**: ~700 lines / ~15,000-18,000 tokens (estimated)
- **Static Sections** (~85% of prompt):
  - Pre-Selection Protocol (Steps 1-5): ~100 lines
  - Section 1: Menu Selection Constraints: ~80 lines
  - Section 2: Pairing Principles: ~250 lines (LARGE)
  - Section 3: Tier Classification: ~50 lines
  - Section 4: Menu Wine Evaluation Protocol: ~150 lines
  - Section 5: Selection Strategy: ~60 lines
  - Section 6: Output Requirements: ~80 lines
  - Section 7: JSON Output Format: ~80 lines
  - Section 8: Pre-Flight Checklist: ~70 lines
  - Section 9: Personality & Tone: ~20 lines
- **Dynamic Sections** (~15% of prompt):
  - `[INSERT DISH HERE]` - Dish name (varies per request)
  - `[MENU_WINES_LIST]` - Menu wine list (varies per request, can be 50-200+ lines)
  - Reference Date (could be dynamic but currently hardcoded)

### 2.2 Caching Potential

**Static Sections Cacheable:**
- Pre-Selection Protocol: ~1,500 tokens
- Section 1: Menu Selection Constraints: ~1,200 tokens
- Section 2: Pairing Principles: ~4,000 tokens (LARGEST - highest cache benefit)
- Section 3: Tier Classification: ~800 tokens
- Section 4: Menu Wine Evaluation Protocol: ~2,500 tokens
- Section 5: Selection Strategy: ~1,000 tokens
- Section 6: Output Requirements: ~1,200 tokens
- Section 7: JSON Output Format: ~1,300 tokens
- Section 8: Pre-Flight Checklist: ~1,100 tokens
- Section 9: Personality & Tone: ~300 tokens

**Total Cacheable**: ~15,000 tokens (85-90% of prompt)
**Per-Request**: ~2,000-3,000 tokens (dish name + menu wines)

**Estimated Cost Savings**: 60-70% reduction in input tokens for static sections

### 2.3 Menu-Specific Challenges

**Unique Considerations:**
1. **Menu Wine List Size**: Highly variable (10-200+ wines)
   - Large menus = large dynamic section
   - May impact caching strategy (dynamic section always sent)
2. **Reference Date**: Currently hardcoded "December 21, 2025"
   - Should be dynamic (current date) like V7.0
3. **Placeholder Replacement**: Two placeholders vs. V7.0's one (dish)
   - More complex assembly logic needed

---

## 3. RECOMMENDATION: HYBRID MODULAR APPROACH

### 3.1 Recommended Structure

**Files:**
1. `menu-v2.2-master-prompt.js` - Main builder function
2. `menu-v2.2-static-sections.js` - All static/cacheable sections
3. `menu-v2.2-dynamic-sections.js` - Dynamic sections (dish, menu wines, reference date)

**Benefits of This Approach:**
- ✅ **Cost Savings**: Leverage Anthropic caching for ~15,000 static tokens
- ✅ **Maintainability**: Organized, easier to update sections
- ✅ **Consistency**: Matches V7.0 pattern (team familiarity)
- ✅ **Future-Proof**: Easier to optimize and update sections independently

**Trade-offs:**
- ⚠️ **Initial Complexity**: More setup time initially
- ⚠️ **Menu Size Variability**: Dynamic section (menu wines) still variable in size

### 3.2 Implementation Strategy

**Phase 1: Extract to Separate File (Minimal Modular)**
- Move prompt to `backend/prompts/menu-v2.2-master-prompt.js`
- Create `buildMenuV2Prompt(dish, menuWinesList, referenceDate)` function
- Replace in `server.js` with function call
- **Benefit**: Immediate organization improvement, no caching yet

**Phase 2: Split Static/Dynamic (Full Modular)**
- Create static/dynamic section files
- Implement caching-aware builder
- **Benefit**: Enable prompt caching, significant cost savings

**Recommendation**: Start with **Phase 1** (easier, immediate benefit), then move to **Phase 2** when ready to implement caching.

---

## 4. PROS AND CONS SUMMARY

### 4.1 Modular Approach PROS

1. **Cost Efficiency** ⭐⭐⭐⭐⭐
   - 60-70% token cost savings via Anthropic caching
   - Significant for high-volume usage

2. **Maintainability** ⭐⭐⭐⭐⭐
   - Easier to update specific sections
   - Better code organization
   - Easier code review and diff tracking

3. **Consistency** ⭐⭐⭐⭐
   - Matches existing V7.0 pattern
   - Team already familiar with structure
   - Easier onboarding for new developers

4. **Testability** ⭐⭐⭐⭐
   - Can unit test individual sections
   - Easier to verify changes

5. **Scalability** ⭐⭐⭐⭐
   - Easier to optimize sections independently
   - Can version sections separately if needed

### 4.2 Modular Approach CONS

1. **Initial Complexity** ⭐⭐⭐
   - More files to create and manage
   - More complex assembly logic
   - Requires understanding of caching strategy

2. **Development Time** ⭐⭐
   - Takes longer to implement initially
   - Need to ensure proper section assembly

3. **Debugging Complexity** ⭐⭐
   - Harder to see full prompt in one place
   - Need to trace through multiple files

### 4.3 Monolithic Approach PROS

1. **Simplicity** ⭐⭐⭐⭐
   - Single file, easy to see everything
   - Simple string replacement
   - Faster initial implementation

2. **Debugging** ⭐⭐⭐
   - Full prompt visible in one place
   - Easier to verify complete prompt

### 4.4 Monolithic Approach CONS

1. **Cost** ⭐⭐⭐⭐⭐
   - No caching benefits
   - Higher API costs (60-70% more expensive)

2. **Maintainability** ⭐⭐
   - Large file hard to navigate
   - Harder to make targeted updates
   - Clutters `server.js`

3. **Consistency** ⭐⭐
   - Doesn't match V7.0 pattern
   - Inconsistent codebase structure

---

## 5. FINAL RECOMMENDATION

### ✅ **RECOMMEND: Modular Approach (Hybrid - Phase 1 → Phase 2)**

**Rationale:**
1. **Cost Savings**: 60-70% token cost reduction is significant, especially for menu recommendations (high usage)
2. **Maintainability**: Menu prompt is large (~700 lines), modularization makes it manageable
3. **Consistency**: Matches existing V7.0 pattern, maintains codebase consistency
4. **Future-Proof**: Easier to optimize and update sections independently

**Implementation Strategy:**
- **Phase 1**: Extract to separate file (quick win, immediate organization)
- **Phase 2**: Split static/dynamic (enable caching, maximize cost savings)

**Timeline:**
- Phase 1: ~30 minutes (extract to separate file)
- Phase 2: ~2-3 hours (full modularization with caching)

---

## 6. IMPLEMENTATION PLAN

### Phase 1: Extract to Separate File
1. Create `backend/prompts/menu-v2.2-master-prompt.js`
2. Move prompt constant from `server.js`
3. Create `buildMenuV2Prompt(dish, menuWinesList, referenceDate)` function
4. Update `server.js` to use new function
5. Test with existing menu context requests

### Phase 2: Full Modularization (Optional - Future)
1. Create `menu-v2.2-static-sections.js` with all static sections
2. Create `menu-v2.2-dynamic-sections.js` with dynamic sections
3. Update builder to assemble from sections
4. Implement caching-aware prompt structure
5. Test caching effectiveness

---

## 7. RISK MITIGATION

**Risks:**
1. **Assembly Errors**: Sections not properly combined
   - **Mitigation**: Comprehensive testing, verify output matches original
2. **Placeholder Issues**: Dish/menu wines not properly inserted
   - **Mitigation**: Explicit placeholder replacement, test with various inputs
3. **Reference Date**: Hardcoded vs. dynamic
   - **Mitigation**: Make dynamic in builder function (like V7.0)

---

## CONCLUSION

**Recommendation: Proceed with Modular Approach (Phase 1 minimum, Phase 2 for full benefits)**

The Menu Sommelier Prompt V2.2 is large enough (~700 lines, ~15,000 tokens) that modularization provides significant benefits:
- **Immediate**: Better code organization (Phase 1)
- **Long-term**: Cost savings via caching (Phase 2)
- **Maintenance**: Easier updates and consistency with V7.0 pattern

The initial complexity is outweighed by the long-term benefits, especially given the prompt's size and expected usage volume.

