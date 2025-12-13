# V7.0 Prompt Not Enabled - Why JSON Structure Doesn't Match

## 🔴 **Problem Identified:**

The API response JSON structure doesn't match V7.0 because **V7.0 prompt is not enabled**.

### **Current Situation:**
- ❌ `ENABLE_V7_PROMPT` environment variable is **not set** (or set to `false`)
- ✅ API is using **legacy prompt** (`GENERAL_SOMMELIER_PROMPT` or `ENHANCED_SOMMELIER_PROMPT`)
- ✅ Response structure matches legacy prompt format (not V7.0)

---

## 📊 **JSON Structure Comparison:**

### **Legacy Prompt Format (Currently Active):**
```json
{
  "dish": "...",
  "dishAnalysis": {...},
  "recommendations": [
    {
      "tierLabel": "...",
      "wineName": "...",
      "producer": "...",
      "vintage": "...",
      "pricePoint": "$XX",           // ✅ Present
      "category": "...",              // ✅ Present
      "rationale": "...",
      "tastingNotes": "...",          // ❌ String format
      "servingGuidance": "...",       // ❌ String format
      "confidenceScore": 85,          // ❌ Number
      "confidenceRationale": "...",   // ❌ Separate field
      "expertRating": "...",          // ✅ Present
      "retailerSuggestion": "...",    // ✅ Present
      "image": "...",                 // ✅ Present
      "storytellingElements": "..."   // ✅ Present
    }
  ]
}
```

### **V7.0 Prompt Format (Expected):**
```json
{
  "dish": "...",
  "dishAnalysis": {
    "dominantWeight": "...",
    "fatContent": "...",
    "primaryProtein": "...",
    "dominantFlavors": [...],
    "spiceLevel": "...",
    "acidityLevel": "...",
    "applicablePrinciples": [...],
    "keyChallenge": "...",
    "idealProfile": {
      "acidity": "...",
      "tannin": "...",
      "body": "...",
      "sweetness": "...",
      "notes": "..."
    }
  },
  "recommendations": [
    {
      "tierLabel": "...",
      "wineName": "...",
      "producer": "...",
      "region": "...",                // ✅ Present (NEW)
      "vintage": "...",
      "grape": "...",                 // ✅ Present (NEW)
      "rationale": "...",
      "pairingPrinciplesApplied": [...],
      "tastingNotes": {               // ✅ Object format (NEW)
        "aromas": [...],
        "palate": "...",
        "finish": "..."
      },
      "servingGuidance": {            // ✅ Object format (NEW)
        "temperature": "...",
        "glassware": "...",
        "decanting": "..."
      },
      "confidence": {                 // ✅ Object format (NEW)
        "score": 90,
        "breakdown": {
          "pairingScience": 47,
          "wineKnowledge": 28,
          "complexityHandling": 15
        },
        "rationale": "..."
      },
      "story": "..."                  // ✅ Present (simplified)
    }
  ],
  "avoid": {
    "types": [...],
    "reason": "..."
  },
  "closingNarrative": "..."
}
```

**Note:** V7.0 format does NOT include: `pricePoint`, `category`, `expertRating`, `retailerSuggestion`, `image`, `storytellingElements`

---

## 🔧 **Solution: Enable V7.0 Prompt**

### **Step 1: Add Environment Variable in Render**

1. **Go to:** Render Dashboard → Your Service → **Settings** → **Environment**
2. **Add new variable:**
   - **Key:** `ENABLE_V7_PROMPT`
   - **Value:** `true`
3. **Save Changes**
4. **Redeploy** (Render will auto-redeploy when you save)

### **Step 2: Verify V7.0 is Enabled**

After redeployment, test the API:

```powershell
$body = @{ dish = "grilled salmon" } | ConvertTo-Json
Invoke-RestMethod -Uri "https://api.aperae.com/api/recommendations" -Method POST -ContentType "application/json" -Body $body -TimeoutSec 120 | ConvertTo-Json -Depth 10
```

**Expected V7.0 Structure:**
- ✅ `region` field in recommendations
- ✅ `grape` field in recommendations
- ✅ `tastingNotes` as object (not string)
- ✅ `servingGuidance` as object (not string)
- ✅ `confidence` as object with `score`, `breakdown`, `rationale` (not `confidenceScore`)
- ❌ NO `pricePoint`, `category`, `expertRating`, `retailerSuggestion`, `image`, `storytellingElements`

---

## 📋 **Code Logic (How It Works):**

In `backend/server.js` (line 1946):
```javascript
useV7PromptFlag = isFeatureEnabled('ENABLE_V7_PROMPT');

if (useV7PromptFlag) {
  // Use V7.0 Master Sommelier Prompt with caching support
  enhancedPrompt = v7PromptService.buildV7PromptForDish(dish);
  // ... V7.0 API call with caching
} else {
  // Use legacy prompt
  const useEnhancedPrompt = isFeatureEnabled('ENABLE_ENHANCED_PROMPT');
  const activePrompt = useEnhancedPrompt 
    ? ENHANCED_SOMMELIER_PROMPT 
    : GENERAL_SOMMELIER_PROMPT;
  // ... Legacy API call
}
```

---

## ✅ **Benefits of Enabling V7.0:**

1. **Optimized Structure:** Better organized JSON with structured objects
2. **Prompt Caching:** 60-70% token savings on static content (faster, cheaper)
3. **Better Field Organization:** Structured `confidence`, `servingGuidance`, `tastingNotes`
4. **New Fields:** `region` and `grape` provide more wine information
5. **Cleaner Output:** Removes client-unnecessary fields (like `tierRationale`)

---

## 🎯 **Next Steps:**

1. ⏳ **Add `ENABLE_V7_PROMPT=true`** to Render environment variables
2. ⏳ **Wait for redeployment** (automatic after saving)
3. ⏳ **Test API** to verify V7.0 structure
4. ⏳ **Update frontend** if needed to handle new structure (check if frontend already supports it)

---

## 📝 **Frontend Compatibility:**

Check if your frontend components already support V7.0 structure:
- Does it handle `confidence` object (vs `confidenceScore`)?
- Does it handle `tastingNotes` object (vs string)?
- Does it handle `servingGuidance` object (vs string)?
- Does it display `region` and `grape` fields?

**If not:** You may need to update frontend components OR use the `normalizeResponse()` function which converts legacy format to V7.0 format.

---

**Action: Add `ENABLE_V7_PROMPT=true` to Render environment variables to enable V7.0 prompt!**


