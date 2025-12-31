# Phase 2 Implementation - Confirmed Specifications

## Overview

This document outlines the confirmed specifications for Phase 2 implementation based on your responses.

---

## Database Structure

### ✅ **One Row Per Wine Recommendation**
- Each API request generates **3 wine recommendations**
- Each recommendation stored as **1 row** in the database
- **Total: 3 rows per request**

### ✅ **Anonymous Storage**
- No user authentication required
- `user_id` field will be `NULL` for all entries
- Field exists for future user linking

### ✅ **No User Preferences**
- User preferences will NOT be stored
- Simplified schema without preferences tracking

---

## Request Metadata (Tracked)

### ✅ **All Request Metadata Will Be Stored:**
- `request_id` - Unique request identifier
- `created_at` - Timestamp of request
- `prompt_version` - 'v7.0' or 'legacy' or 'enhanced'
- `api_response_time_ms` - API response time in milliseconds
- `model_used` - Claude model version used

---

## Field Extraction Strategy

### ✅ **Plain Text Storage Only**
- Extracted fields stored as **plain text strings**
- No inference metadata (no JSON objects with confidence scores)
- Simple, straightforward text values

### Fields to Extract/Infer:

1. **`cookingMethod`** (from `primaryProtein`)
   - Extract: "grilled", "roasted", "fried", "braised", "poached", "raw", "steamed"
   - Source: Parse `primaryProtein` text

2. **`cookingMethodImpact`** (derived from `cookingMethod`)
   - Generate text based on cooking method type
   - Example: "Grilling adds char and bitterness, requires acidity modulation"

3. **`sauce`** (from `dominantFlavors` + `fatContent`)
   - Infer: "cream", "butter", "tomato", "soy", "vinegar", "oil", "reduction", "mustard", "none"
   - Source: Analyze flavor profile and fat content

4. **`sauceCharacteristic`** (from `dominantFlavors`)
   - Infer: "fat", "acid", "umami", "sweet", "spice"
   - Source: Analyze dominant flavors array

5. **`saucePriority`** (from `dominantFlavors` + `fatContent`)
   - Generate text explaining why sauce determines wine
   - Source: Analyze flavor/fat combination

6. **`tierRationale`** (from tier classification)
   - Extract if mentioned in rationale
   - Otherwise infer from tier signals

7. **`tierFallbackApplied`** (inferred from tier)
   - Boolean: `true` if tier seems like fallback
   - Logic: Check if signals are weak or missing

8. **`vintageRationale`** (from `rationale` or `story`)
   - Extract vintage reasoning from text
   - Source: Parse rationale/story for vintage mentions

9. **`maxABV`** (conditional)
   - Set to "13.5%" ONLY if `spiceLevel === 'hot'`
   - Otherwise: `NULL`

---

## Database Schema Summary

### Core Fields:
- Request metadata (id, request_id, dish, timestamp, prompt_version, response_time)
- Dish analysis (all fields from dishAnalysis object)
- Extracted fields (cookingMethod, sauce, etc.)
- Ideal profile (all idealProfile fields)
- Wine data (tier, name, producer, region, vintage, grape)
- Tasting notes (aromas, palate, finish)
- Serving guidance (temperature, glassware, decanting)
- Confidence scoring (score, breakdown, rationale)
- Full response JSON (for debugging/analysis)

### Storage Format:
- Arrays stored as PostgreSQL arrays (`TEXT[]`)
- JSON stored as JSONB (`JSONB`)
- All other fields as text or appropriate types

---

## Implementation Plan

### Files to Create:

1. **`backend/services/fieldExtractor.js`**
   - Extracts/infers removed fields from existing data
   - Returns plain text values (no metadata)

2. **`backend/services/recommendationLogger.js`**
   - Enhanced logging for quality evaluation
   - Logs complete recommendation details

3. **`backend/services/databaseService.js`**
   - Handles database operations
   - Automated insertion after recommendations

4. **`backend/prisma/schema.prisma`**
   - Updated to match Supabase table structure
   - WineRecommendation model

5. **`backend/server.js`**
   - Integration point
   - Auto-insert after rendering recommendations

---

## Next Steps

1. ✅ **You complete Supabase setup** (follow `SUPABASE_SETUP_GUIDE.md`)
2. ⏳ **I create all code files** (waiting for your confirmation)
3. ⏳ **We test the implementation**

---

## Questions Addressed

| Question | Answer | Implementation |
|----------|--------|----------------|
| Database structure | One row per recommendation | ✅ Confirmed |
| User identification | Anonymous (NULL user_id) | ✅ Confirmed |
| User preferences | Not stored | ✅ Confirmed |
| Request metadata | Track all (id, time, version, response time) | ✅ Confirmed |
| Field extraction | Plain text only | ✅ Confirmed |
| Field extraction format | Both extract and infer | ✅ Confirmed |

---

**Ready to proceed once Supabase setup is complete!** 🚀














