# Database Recommendation Storage Issues

**Date:** December 15, 2025  
**Status:** ❌ **Issues Detected**  
**Impact:** Individual recommendations are **NOT** being stored due to database errors

---

## 🔍 **Problems Identified**

Based on Render logs, there are **three critical issues** preventing recommendations from being stored:

### **1. Missing `wines` Table** ❌
**Error:**
```
Invalid `prisma.wine.findFirst()` invocation:
The table `public.wines` does not exist in the current database.
```

**Cause:**
- The code tries to validate wines by looking them up in a `wines` table
- This table doesn't exist in your Supabase database
- The Prisma schema defines a `Wine` model, but the table hasn't been created

**Impact:**
- Wine validation fails (but this is non-critical - recommendations still work)

---

### **2. Missing `wine_recommendations` Table** ❌
**Error:**
```
Failed to insert individual recommendation
Raw query failed. Code: `22P02`. Message: `ERROR: malformed array literal`
```

**Cause:**
- The code tries to insert into `wine_recommendations` table using raw SQL
- This table **does not exist** in your Prisma schema
- The schema only has: `User`, `Session`, `UserPreference`, `Wine`, `WinePairing`
- No `WineRecommendation` model is defined

**Impact:**
- **Individual recommendations are NOT being stored** ⚠️
- All 3 recommendations per request fail to insert

---

### **3. Malformed Array Literal Error** ❌
**Error:**
```
Raw query failed. Code: `22P02`. Message: `ERROR: malformed array literal: "["sweet","umami","salty"]"
DETAIL: "[" must introduce explicitly-specified array dimensions.`
```

**Cause:**
- The code uses `JSON.stringify(data.dominant_flavors)::text[]` 
- PostgreSQL expects proper array syntax: `ARRAY['value1','value2']`
- JSON.stringify creates a string like `"["sweet","umami"]"` which PostgreSQL can't parse as an array

**Impact:**
- Even if the table existed, inserts would fail due to incorrect array syntax

---

## 📊 **Current Status**

**From Your Logs:**
```
✅ Recommendations stored to database
❌ Failed to insert individual recommendation (3 times - one per wine)
```

**What's Actually Happening:**
- The service **thinks** it stored recommendations (log says "stored")
- But **all inserts fail silently**
- The code continues even when inserts fail (error is caught and logged)
- **No recommendations are actually in the database**

---

## 🔧 **Required Fixes**

### **Fix 1: Create `wine_recommendations` Table**

Add to `backend/prisma/schema.prisma`:

```prisma
model WineRecommendation {
  id                        String    @id @default(uuid())
  request_id                String
  dish                      String
  created_at                DateTime  @default(now())
  user_id                   String?   @db.Uuid
  prompt_version            String
  api_response_time_ms      Int
  model_used                String
  
  // Dish Analysis
  dominant_weight           String?
  fat_content               String?
  primary_protein           String?
  dominant_flavors          String[]
  spice_level               String?
  acidity_level             String?
  applicable_principles     String[]
  key_challenge             String?
  
  // Extracted/Inferred Fields
  cooking_method            String?
  cooking_method_impact     String?
  sauce                     String?
  sauce_characteristic      String?
  sauce_priority            String?
  max_abv                   Float?
  
  // Ideal Profile
  ideal_acidity             String?
  ideal_acid_type           String?
  ideal_tannin              String?
  ideal_body                String?
  ideal_sweetness           String?
  ideal_notes               String?
  
  // Wine Recommendation Data
  tier_label                String?
  tier_rationale            String?
  tier_fallback_applied     Boolean   @default(false)
  wine_name                 String?
  producer                  String?
  region                    String?
  vintage                   String?
  grape                     String?
  
  // Pairing Rationale
  rationale                 String?   @db.Text
  pairing_principles_applied String[]
  
  // Tasting Notes
  aromas                    String[]
  palate                    String?   @db.Text
  finish                    String?   @db.Text
  
  // Serving Guidance
  serving_temperature       String?
  serving_glassware         String?
  serving_decanting         String?
  
  // Confidence Scoring
  confidence_score          Int?
  confidence_pairing_science Int?
  confidence_wine_knowledge Int?
  confidence_complexity_handling Int?
  confidence_rationale      String?   @db.Text
  
  // Additional Fields
  vintage_rationale         String?   @db.Text
  story                     String?   @db.Text
  expert_rating             String?
  price_point               String?
  category                  String?
  retailer_suggestion       String?
  image_url                 String?
  
  // Full Response Data
  full_response_json        Json?
  
  // Avoid Data
  avoid_types               String[]
  avoid_reason              String?   @db.Text
  
  // Closing Narrative
  closing_narrative         String?   @db.Text
  
  @@index([request_id])
  @@index([dish])
  @@index([created_at])
  @@map("wine_recommendations")
}
```

---

### **Fix 2: Fix Array Insertion Syntax**

The current code uses:
```javascript
${JSON.stringify(data.dominant_flavors)}::text[]
```

**Change to proper PostgreSQL array syntax:**
```javascript
// Instead of JSON.stringify, use Prisma's array parameter
// Or use proper PostgreSQL array literal: ARRAY['value1','value2']::text[]
```

**Better approach:** Use Prisma's native array support instead of raw SQL, or properly format arrays.

---

### **Fix 3: Make Wine Validation Optional**

The wine validation should gracefully handle missing `wines` table:

```javascript
// Already handled in wineDatabaseService.js - it returns null if table doesn't exist
// But the error is still logged - we should suppress it or check table existence first
```

---

## ✅ **Recommended Solutions**

### **Option A: Use Prisma Instead of Raw SQL (Recommended)**

Replace raw SQL inserts with Prisma model:

```javascript
await prisma.wineRecommendation.create({
  data: {
    request_id: data.request_id,
    dish: data.dish,
    dominant_flavors: data.dominant_flavors, // Prisma handles arrays automatically
    applicable_principles: data.applicable_principles,
    // ... etc
  }
});
```

**Benefits:**
- Type-safe
- Handles arrays correctly
- Less error-prone
- Better maintainability

---

### **Option B: Fix Raw SQL Array Syntax**

If keeping raw SQL, fix array insertion:

```javascript
// Current (wrong):
${JSON.stringify(data.dominant_flavors)}::text[]

// Fixed (correct):
${Prisma.join(data.dominant_flavors.map(f => Prisma.raw(`'${f.replace(/'/g, "''")}'`)), ',')}::text[]
// Or use Prisma.sql template tag with proper escaping
```

---

## 🚀 **Action Items**

1. ✅ **Add `WineRecommendation` model to Prisma schema**
2. ✅ **Run `npx prisma migrate dev` to create the table**
3. ✅ **Fix array insertion syntax** (use Prisma or fix raw SQL)
4. ✅ **Test recommendation storage** after fixes
5. ✅ **Optional: Create `wines` table** if you want wine validation (or disable it)

---

## 📝 **Current Behavior Summary**

**What Works:**
- ✅ API receives recommendations from Claude
- ✅ Recommendations are returned to client
- ✅ V7.0 prompt is working correctly

**What Doesn't Work:**
- ❌ Individual recommendations are NOT stored in database
- ❌ Wine validation fails (non-critical)
- ❌ No historical data collection

---

## 🔍 **Verification Steps**

After fixes are applied:

1. Make a test recommendation request
2. Check Render logs - should NOT see "Failed to insert" errors
3. Query Supabase database to verify records exist:
   ```sql
   SELECT COUNT(*) FROM wine_recommendations;
   SELECT * FROM wine_recommendations ORDER BY created_at DESC LIMIT 3;
   ```

---

**Status:** Recommendations are currently **NOT being stored**. Fixes required before data collection can work.







