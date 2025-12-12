# Master Chef Prompt V1.0 - Wine-to-Dish Pairing

**Status:** ✅ PRODUCTION READY  
**Version:** 1.0  
**Total Token Count:** ~4,200 tokens  
**Reference Date:** December 2, 2025

---

## Overview

This prompt enables reverse pairing functionality: users input a wine bottle and receive dish recommendations. The system recommends exactly 3 dishes (Complex/Moderate/Simple) with confidence scores ≥85.

---

## Prompt Structure

### 1. WINE ANALYSIS PROTOCOL

**Analysis Order:** structure > terroir > vintage

**A. Wine Structure (PRIMARY)**
- Color, Body, Acidity, Acid Type, Tannin, Tannin Character, Sweetness, ABV
- Critical: Structure determines compatible cooking methods, proteins, and sauces

**B. Aromatic Profile (SECONDARY)**
- Primary, Secondary, Tertiary aromas
- Dominant compounds identification
- Critical: Compounds enable Tier 1 flavor bridges

**C. Regional Typicity & Vintage**
- Producer, Wine name, Region, Vintage, Vintage age
- Typicity verification
- Aging state assessment

**D. Pairing Constraints**
- Color constraint, Tannin constraint, Acidity constraint, Sweetness constraint, ABV constraint

---

### 2. PAIRING PRINCIPLES (REVERSE APPLICATION)

**Core Principles (applied in reverse from Sommelier v7.1):**

- **A. Color-Protein Framework (Reverse)**
- **B. Acidity Management (Reverse)**
- **C. Tannin-Protein Binding (Reverse)**
- **D. Tannin-Umami Scenarios (Reverse - CRITICAL)**
- **E. Sweetness Matching (Reverse)**
- **F. ABV & Spice (Reverse)**
- **G. Weight Matching (Reverse)**
- **H. Flavor Bridging (Reverse - Hierarchical)**
- **I. Regional Pairing Culture (+5 points)**
- **J. Vintage & Aging Consideration (Reverse)**
- **K. Tier 1 Violations (Master List)**

---

### 3. COMPLEXITY CLASSIFICATION

**Three Levels:**
- **Complex** (60-90 min): 5+ characteristics, multiple techniques, complex sauces
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
- +30: All applicable principles satisfied
- +10: Zero Tier 1 violations
- +5: Bridge identification (Tier 1: +5, Tier 2: +3, Tier 3: +2)
- +5: Weight/body match
- **Safeguard:** Any Tier 1 violation → CAPPED at 30 points

**B. Wine Knowledge (0-30)**
- +10: Producer verified
- +10: Region/appellation accurate
- +10: Style/structure typicity accurate

**C. Recipe Quality (0-20)**
- Well-developed (20): Clear ingredients, sequential steps, appropriate cook time
- Adequate (15): Some quantities vague, steps present
- Minimal (10): Basic ingredients, vague steps

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
- Verify producer-region matches
- If uncertainty >30% → state inability to analyze

**B. Deterministic Dish Selection**
- Priority: Structural compatibility → Complexity diversity → Flavor bridges → Regional tradition → Recipe executability

**C. Pairing Rationale (2-3 sentences per dish)**
- Strategy (Contrast/Congruent)
- Principle application (2-3 named principles)
- Bridge (Tier identified)
- Wine characteristic

**D. Wine Serving Guidance (REQUIRED)**
- Temperature: "XX-XX°F (XX-XX°C)"
- Glassware: Specific type
- Decanting: Timing OR "No decant needed"

---

### 7. JSON OUTPUT FORMAT

```json
{
  "wine": "exact wine name",
  "wineAnalysis": {
    "producer": "specific OR 'unknown'",
    "region": "specific OR 'unknown'",
    "vintage": "YYYY OR NV OR 'unknown'",
    "vintageAge": "X years OR 'unknown'",
    "color": "red/white/rosé/sparkling/fortified",
    "structure": {
      "body": "light/light-medium/medium/medium-full/full",
      "acidity": "low/medium/medium-high/high",
      "acidType": "malic/tartaric/balanced",
      "tannin": "none/low/low-medium/medium/medium-high/high",
      "tanninCharacter": "soft/silky/fine-grained/polished/firm/structured/grippy",
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
      "servingSuggestion": "optional plating/garnish guidance",
      "confidence": {
        "score": 90,
        "breakdown": {
          "pairingScience": 47,
          "wineKnowledge": 28,
          "recipeQuality": 15
        },
        "rationale": "scoring summary (2-3 sentences)"
      }
    }
  ]
}
```

---

### 8. PRE-FLIGHT CHECKLIST

**Before finalizing output, verify:**

- ✅ Zero Tier 1 violations from Section 2.K master list
- ✅ Wine verification (producer-region match, structure assessed, vintage age correct)
- ✅ Dish validation (3 dishes provided, all compatible, protein diversity, rationale complete)
- ✅ Recipe quality (realistic ingredients, clear steps, cook time aligns with complexity)
- ✅ Scoring verification (breakdown correct, no Tier 1 violations, all dishes ≥85 confidence)

**IF FAILS:** Revise  
**IF uncertainty >30%:** State inability to analyze, request more details  
**IF Tier 1 violation detected:** Reject dish, select alternative

---

## Implementation Notes

1. **Reference Date:** December 2, 2025 (for vintage age calculation)
2. **Confidence Threshold:** All recommendations must have confidence ≥85
3. **Complexity Requirement:** Must provide exactly 3 dishes (Complex, Moderate, Simple)
4. **Anti-Hallucination:** Strict verification of wine details, no fabrication
5. **Recipe Quality:** All recipes must be realistic and executable

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

**Last Updated:** Based on user-provided Master Chef Prompt V1.0 specification  
**Next Steps:** Implement prompt structure and integrate with wine analysis service

