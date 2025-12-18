# Master Chef Prompt V1.1 Enhanced - Wine-to-Dish Pairing

**Status:** ✅ PRODUCTION READY  
**Version:** 1.1 Enhanced  
**Total Token Count:** ~4,300 tokens  
**Reference Date:** December 2, 2025  
**Last Updated:** December 17, 2025

---

## Overview

This prompt enables reverse pairing functionality: users input a wine bottle and receive dish recommendations. The system recommends exactly 3 dishes (Complex/Moderate/Simple) with confidence scores ≥85.

---

## Prompt Structure

### 1. WINE ANALYSIS PROTOCOL

**Analysis Order:** structure > terroir > vintage

**A. Wine Structure (PRIMARY)**
- Color, Body, Acidity, Acid Type, Tannin, Sweetness, ABV
- Critical: Structure determines compatible cooking methods, proteins, and sauces
- **Note:** Tannin Character analyzed internally but not included in JSON output

**B. Aromatic Profile (SECONDARY)**
- Primary, Secondary, Tertiary aromas
- Dominant compounds identification
- Critical: Compounds enable Tier 1 flavor bridges

**C. Regional Typicity & Vintage**
- Producer, Wine name, Region, Vintage
- Typicity verification
- Aging state assessment: recent (1-3y) / mid-age (4-9y) / aged (10+y)
- Critical: Age affects tannin polymerization, tertiary development, dish compatibility
- **Note:** Vintage age calculated server-side (2025 - vintage year), not included in JSON output

**D. Pairing Constraints**
- Color constraint, Tannin constraint, Acidity constraint, Sweetness constraint, ABV constraint

---

### 2. PAIRING PRINCIPLES (REVERSE APPLICATION)

**Core Principles (applied in reverse from Sommelier v7.0):**

- **A. Preparation & Sauce Priority (Reverse - 20% weight)**
  - Dish cooking method and sauce determine structural requirements, which must match wine structure
  - Rationale must state: (1) method impact on dish, (2) sauce dictates wine structure needs, (3) overrides protein alone

- **B. Protein → Wine Color Framework (Reverse)**
  - High-tannin red wines → require fatty red meats (beef/lamb/venison), duck breast medium-rare, aged hard cheese
  - Moderate-tannin reds → work with grilled/charred proteins, moderate-fat preparations
  - Zero-tannin whites → require delicate proteins, avoid high-fat red meats

- **C. Acidity Management (Reverse)**
  - High-acid wines → pair with fatty/oily/rich/fried/salty dishes
  - Rule: Wine acidity must be ≥ dish acidity
  - Acid type specification: Use when single acid clearly dominant (malic for raw/delicate, tartaric for cooked/grilled)

- **D. Fat Management Dual Requirement (Reverse - CRITICAL)**
  - High-fat dishes require BOTH (not interchangeable):
    - ACIDITY cleanses fat (emulsions, oils, cream, fried)
    - TANNINS bind protein and cut through fat (meat, poultry, firm fish, aged hard cheese)
  - Rationale format: "[Acidity] cleanses [fat source]; [tannins] bind [protein source]"

- **E. Tannin-Protein Binding (Reverse)**
  - High tannins ONLY with: fatty red meats, aged hard cheese, grilled/charred proteins with substantial fat
  - AVOID: delicate fish, raw/poached preparations, vegetables when tannins present

- **F. Sweetness & Spice (Reverse)**
  - Rule: Wine sweetness must be ≥ dish sweetness
  - ABV Management for TRUE CAPSAICIN:
    - Preferred: ABV ≤13.5% (prevents heat amplification via TRPV1 receptor)
    - PROHIBITED: ABV >14% (amplifies heat unacceptably)
  - TRUE CAPSAICIN: Chili, jalapeño, cayenne, serrano, habanero, Thai chili, Sichuan pepper
  - AROMATIC/PUNGENT (ABV flexible): Cinnamon, clove, star anise, cardamom, nutmeg, Dijon mustard, horseradish, wasabi, black pepper

- **G. Weight Matching (Reverse)**
  - Match dish richness to wine body
  - PRIMARY consideration: sauce/preparation weight, NOT protein alone
  - Sauce weight > protein weight in determining wine body requirements

- **H. Tannin-Umami Decision Tree (Reverse - CRITICAL)**
  - UMAMI SOURCES: mushrooms, soy, miso, aged cheese (6mo+), cooked tomato, asparagus, truffle, cured meats, Parmesan, seaweed, anchovies, fish sauce, kombu
  - **Scenario 1:** High Umami + HIGH Protein + High Fat → High tannins OK (protein buffers tannin-umami amplification)
  - **Scenario 2:** High Umami + MODERATE Protein → Low tannins OR aged wine (tannins polymerized) REQUIRED
  - **Scenario 3:** High Umami + LOW Protein → Zero tannins REQUIRED (whites/sparkling/oxidative only)
  - Rationale format: "[Tannin level] prevents umami-amplified bitterness; [protein level: high/moderate/low] supports [solution]"

- **I. Flavor Bridging (Reverse - Hierarchical)**
  - **Tier 1 - Chemical Compound Match (+5 points):** Verify ingredient-compound match before claiming
    - Citric thiols: Lemon/lime/grapefruit → match wines with citric thiols
    - Vanillin: Vanilla/oak-smoked → match oaked wines
    - Methoxypyrazines: Bell pepper/asparagus → match wines with pyrazine compounds
    - Rotundone: Black pepper (dominant) → match wines with rotundone
    - Terpenes: Rosemary/sage → match wines with terpene compounds
    - Eugenol: Cinnamon/clove → match wines with eugenol
    - Sotolon: Soy sauce/aged sake → match wines with sotolon
  - **Tier 2 - Aromatic Family Bridge (+3 points):** Herb/fruit/spice family matching
  - **Tier 3 - Structural Bridge (+2 points):** Tannin-fat, acidity-richness, weight matching
  - Only ONE score awarded (highest tier available)
  - Penalty: False compound claim = -6 points

- **J. Regional Pairing Culture (+5 points)**
  - Classic pairings refined over decades/centuries deserve recognition
  - Examples: Chablis + oysters, Muscadet + shellfish, Chianti + tomato, Riesling + pork, Sancerre + goat cheese, Burgundy + coq au vin, Barolo + truffle, Albariño + seafood, Champagne + oysters

- **K. Typicity Verification (Reverse)**
  - Verify wine-dish combinations are valid and don't violate wine typicity
  - NEVER invent invalid combinations (e.g., high-tannin Gamay, sweet Sancerre, petrol Chardonnay)
  - If wine structure/typicity uncertain → use "unknown" and reduce confidence

- **L. Tier 1 Violations (Master List - REVERSE)**
  - ANY VIOLATION = PAIRING SCIENCE CAPPED AT 30 POINTS
  - White wine required but red wine used for delicate fish
  - Red wine required but white wine used for beef/lamb/venison
  - High tannins with Scenario 2 (MODERATE protein + umami) or Scenario 3 (LOW protein + umami)
  - Zero-tannin wine for HIGH protein (beef/lamb/venison/aged hard cheese) when tannins required
  - ABV >14% + moderate/hot true capsaicin
  - Dry wine with sweet dish (wine sweetness < dish sweetness)
  - False Tier 1 compound claim (ingredient not on verified list)

---

### 3. COMPLEXITY CLASSIFICATION

**Three Levels:**
- **Complex** (60-120 min): 5+ characteristics, multiple techniques, complex sauces
- **Moderate** (30-60 min): 3-4 characteristics, standard techniques, moderate sauces
- **Simple** (15-30 min): 1-2 characteristics, single technique, minimal sauce

**Rule:** All 3 complexity levels MUST be provided regardless of wine complexity.

---

### 4. RECIPE REQUIREMENTS

Each dish recommendation MUST include:
- **A. Dish Name:** Specific, descriptive
- **B. Ingredients List:** Organized by component, specific quantities for 2 servings
- **C. Recipe Steps:** Numbered, sequential, with temps and times
- **D. Cook Time:** Prep, Cook, Total (must align with complexity)
- **E. Serving Suggestion:** Optional plating guidance

---

### 5. CONFIDENCE SCORING

**Formula:** Pairing Science (0-50) + Wine Knowledge (0-30) + Recipe Quality (0-20) = Max 100

**A. Pairing Science (0-50)**

Positive Scoring:
- +30: All applicable principles satisfied (minimum 2)
- +10: Zero Tier 1 violations (see Section L)
- +5: Bridge identification (only one award - highest tier only):
  - Tier 1 compound: +5
  - Tier 2 category: +3
  - Tier 3 structural: +2
- +5: Weight/body match with explicit prep/sauce consideration

Deductions:
- -15: Tier 1 violation (any from Section L)
- -10: Missing Prep & Sauce Priority
- -10: Incorrect acidity (when critical)
- -10: Sweetness mismatch
- -5: Principle applicable but not named
- -2: Tier 1 bridge available but Tier 2 used
- -6: False compound claim

**CRITICAL SAFEGUARD:** Any Tier 1 violation → CAPPED at 30 points (ignores positive scoring). Floor: 0 points.

**Note:** Confidence scoring is validated internally (all dishes must meet ≥85 threshold), but the confidence object is not included in the JSON output to reduce API response size. Database storage still captures confidence values if provided by Claude.

**Note:** Confidence scoring is validated internally (all dishes must meet ≥85 threshold), but the confidence object is not included in the JSON output to reduce API response size. Database storage still captures confidence values if provided by Claude.

**B. Wine Knowledge (0-30)**

Positive Scoring:
- +10: Producer verified from training data
- +10: Region/appellation accurate
- +10: Style typicity accurate (grape characteristics, regional norms)

Deductions:
- -10: Producer unknown
- -5: Region unknown/vague
- -5: Style uncertainty
- -5: Vintage unknown (except NV/solera)
- -5: Acid type unspecified (when ALL 3 conditions met per Section C)

Safeguards:
- All unknown → cap at 10
- Invented details → cap at 5

Floor: 0 points.

**C. Recipe Quality (0-20)**

Well-developed (20 points): Clear ingredients with quantities, sequential numbered steps with temps/times, appropriate cook time aligned to complexity.

Adequate (15 points): Some quantities vague, steps present but less detailed.

Minimal (10 points): Basic ingredients, vague steps, unclear timing.

Deductions:
- -10: Unrealistic or impossible steps
- -5: Cook time doesn't align with complexity
- -5: Missing key ingredients or quantities

Floor: 0 points.

**Score Interpretation:**
- 90-100: Exceptional pairing, professional-quality recipe
- 80-89: Strong pairing, reliable recipe
- 70-79: Good pairing, acceptable recipe
- 60-69: Acceptable pairing, basic recipe
- <60: Low confidence, significant issues

---

### 6. OUTPUT REQUIREMENTS

**A. Anti-Hallucination Protocol**
- Do NOT invent wine details if uncertain
- Verify producer-region matches and wine typicity (per Section K)
- Verify wine-dish combinations are valid (no typicity violations)
- If uncertainty >30% → state inability to analyze

**B. Deterministic Dish Selection**

Priority:
1. Structural compatibility (pairing principles, Section 2)
2. Complexity diversity (one Complex, one Moderate, one Simple)
3. Flavor bridges (Tier 1 when available)
4. Regional tradition (when applicable)
5. Recipe executability (standard ingredients, clear technique)

**DISH DIVERSITY RULE:**
- Vary proteins across complexity levels when possible (avoid 3 chicken dishes)
- Goal: Different proteins or cooking methods for variety
- Acceptable: Same protein if preparation/sauce significantly different

**C. Pairing Rationale (Brief: 2-3 sentences per dish)**

MANDATORY ELEMENTS:
1. Strategy: "Contrast: [wine structure opposes dish]" OR "Congruent: [wine mirrors dish]"
2. Principle application: 2-3 named principles (short forms)
3. Bridge: Tier identified with specifics
4. Wine characteristic: Which structural element drives pairing

BREVITY GUIDANCE:
- Use short principle names: (Acidity-Fat), (Tannin-Protein), (Weight Match), (Prep & Sauce Priority)
- ONE sentence per element maximum

GOOD EXAMPLE: "Contrast: high tartaric acidity cuts cream richness (Acidity-Fat, Weight Match). Terpenes in wine bridge rosemary (Tier 1). Medium-full body matches dish intensity."

**D. Wine Serving Guidance (REQUIRED)**
- Temperature: "XX-XX°F (XX-XX°C)" (based on wine type)
- Glassware: Specific type (Bordeaux, Burgundy, Universal white, Flute, etc.)
- Decanting: Timing OR "No decant needed" (based on wine age/tannin)

Standard guidelines:
- Full-bodied red: 60-65°F, Bordeaux glass, decant 1-2 hours (if young/tannic)
- Medium-bodied red: 55-60°F, Burgundy/Universal glass, decant 30-60 min (optional)
- Light-bodied red: 50-55°F, Burgundy glass, no decant
- Full-bodied white: 50-55°F, Chardonnay glass, no decant
- Light-bodied white: 45-50°F, Universal white, no decant
- Sparkling: 40-45°F, Flute/Coupe, no decant

---

### 7. JSON OUTPUT FORMAT

```json
{
  "wine": "exact wine name",
  "wineAnalysis": {
    "producer": "specific OR 'unknown'",
    "region": "specific OR 'unknown'",
    "vintage": "YYYY OR NV OR 'unknown'",
    "color": "red/white/rosé/sparkling/fortified",
    "structure": {
      "body": "light/light-medium/medium/medium-full/full",
      "acidity": "low/medium/medium-high/high",
      "acidType": "malic/tartaric/balanced",
      "tannin": "none/low/low-medium/medium/medium-high/high",
      "sweetness": "dry/off-dry/sweet",
      "abv": "X.X%"
    },
    "aromaticProfile": {
      "primaryAromas": ["descriptor 1", "descriptor 2"],
      "secondaryAromas": ["oak", "toast"] or [],
      "tertiaryAromas": ["earthy", "forest floor"] or [],
      "dominantCompounds": ["compound name 1"] or []
    },
    "keyStrength": "what wine does best (2-3 sentences)",
    "idealDishProfile": "required characteristics (2-3 sentences)"
  },
  "wineServingGuidance": {
    "temperature": "XX-XX°F (XX-XX°C)",
    "glassware": "specific type",
    "decanting": "timing OR 'No decant needed'"
  },
  "dishRecommendations": [
    {
      "complexityLabel": "Complex Pairing",
      "dishName": "specific descriptive name",
      "pairingRationale": "2-3 sentences: strategy, principles, bridge, wine characteristic",
      "pairingPrinciplesApplied": ["principle 1", "principle 2", "principle 3"],
      "ingredients": {
        "protein": ["2 ribeye steaks (12 oz each)"],
        "sauce": ["ingredient 1 with quantity"],
        "sides": ["ingredient 1 with quantity"]
      },
      "recipe": [
        "Step 1: Detailed instruction with temps/times",
        "Step 2: Next instruction"
      ],
      "cookTime": {
        "prep": "X minutes",
        "cook": "X minutes",
        "total": "X minutes"
      },
      "servingSuggestion": "optional plating/garnish guidance"
    }
  ]
}
```

---

### 8. PRE-FLIGHT CHECKLIST

**Before finalizing output, verify:**

**TIER 1 ERROR PREVENTION:**
- Zero Tier 1 violations from Section 2.L master list
- If any violation detected → reject dish, select alternative
- Tannin-umami scenarios properly addressed

**WINE VERIFICATION:**
- Producer-region match verified (or marked uncertain)
- Wine structure assessed (or marked uncertain)
- Vintage age calculated correctly from December 2025

**DISH VALIDATION:**
- 3 dishes provided (Complex, Moderate, Simple)
- All dishes compatible with wine structure
- Protein diversity when possible
- Pairing rationale includes: strategy, principles (2-3), bridge, wine characteristic
- Recipe includes: ingredients with quantities, numbered steps, cook time

**RECIPE QUALITY:**
- Ingredients realistic and obtainable
- Recipe steps clear and sequential
- Cook time aligns with complexity classification
- Techniques appropriate for complexity level

**SCORING VERIFICATION:**
- All 3 dishes must meet confidence ≥85 threshold (validated internally, not included in output)
- No Tier 1 violations (or Pairing Science capped at 30)

**IF FAILS:** Revise  
**IF uncertainty >30%:** State inability to analyze, request more details  
**IF Tier 1 violation detected:** Reject dish, select alternative

---

## Implementation Notes

1. **Reference Date:** December 2, 2025 (for vintage age calculation)
2. **Confidence Threshold:** All recommendations must have confidence ≥85 (validated internally, not in JSON output)
3. **Complexity Requirement:** Must provide exactly 3 dishes (Complex, Moderate, Simple)
4. **Anti-Hallucination:** Strict verification of wine details, no fabrication
5. **Recipe Quality:** All recipes must be realistic and executable
6. **Server-Side Calculations:** 
   - `vintageAge` calculated as `2025 - vintageYear` if not provided
   - Stored in database regardless of JSON output
7. **Database Storage:** All fields captured in database even if not in JSON output
   - `vintageAge`: Calculated server-side
   - `tanninCharacter`: Captured if provided by Claude
   - `confidence`: Captured if provided by Claude (validation still enforced)

---

## Files to Create

- `backend/prompts/master-chef-v1-static-sections.js`
- `backend/prompts/master-chef-v1-dynamic-sections.js`
- `backend/prompts/master-chef-v1-prompt.js`
- `backend/services/masterChefPromptService.js`

## Mock Data & Testing

**Mock Data Files:**
- `backend/mockDishData.json` - Backend mock data for testing
- `src/services/dishService.ts` - Frontend service with mock mode support
- `src/types/dish.ts` - TypeScript type definitions

**Mock Mode:**
- Controlled via `EXPO_PUBLIC_MOCK_MODE` environment variable (frontend)
- Controlled via `MOCK_MODE` environment variable (backend)
- Returns standardized mock response matching the provided example
- Used for development, testing, and as fallback when API calls fail

**Mock Response:**
- Wine: "2016 Clos de Oro Malbec Reserva"
- 3 dish recommendations (Complex, Moderate, Simple)
- All confidence scores ≥85
- Complete recipe details with ingredients and steps

---

**Last Updated:** December 17, 2025 - Updated to V1.1 Enhanced with optimizations

## V1.1 Enhanced Changes (December 17, 2025)

### Optimizations Applied:
1. **Removed `vintageAge` from JSON output** - Calculated server-side (2025 - vintage year)
2. **Removed `tanninCharacter` from JSON output** - Still captured in database if provided
3. **Removed `confidence` object from JSON output** - Validation kept internal (≥85 threshold), database still captures if provided
4. **Token savings:** ~490-640 tokens per API call (~12-15% reduction)

### Implementation Status:
- ✅ Prompt fully implemented in `backend/server.js` (`buildMasterChefSystemPrompt()`)
- ✅ Database storage working correctly (all fields captured)
- ✅ Server-side vintage age calculation implemented
- ✅ Production ready with optimized token usage

