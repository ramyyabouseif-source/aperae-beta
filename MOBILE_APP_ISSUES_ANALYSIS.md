# Mobile App Issues - Analysis & Fixes

**Date:** December 15, 2025  
**Issues Found:** 4 main issues requiring fixes

---

## 🔍 **Issue Analysis**

### **Issue 1: Missing `pricePoint` Field** ❌ **HIGH PRIORITY**

**Symptoms:**
- Frontend logs: `pricePoint: undefined`
- UI shows: "Price Point: Not specified"

**Root Cause:**
1. V7.0 JSON schema (`v7-master-sommelier-prompt.js` line 89) **does NOT include `pricePoint`**
2. Enhancement function (`wineDatabaseService.js` line 418) tries to use `aiRecommendation.pricePoint` but it doesn't exist
3. Result: `pricePoint` stays `undefined`

**Fix:**
- Add `pricePoint` to V7.0 JSON schema
- OR add default "unknown" in enhancement step if missing

**Priority:** HIGH (affects user experience)

---

### **Issue 2: Category: "Unknown" for Albariño** ⚠️ **MEDIUM PRIORITY**

**Symptoms:**
- Response shows: `category: "Unknown"` for Albariño
- Should be: `category: "White Wine"`

**Root Cause:**
- `inferCategory()` function (`wineDatabaseService.js` line 491-497) doesn't check for "albariño"
- Only checks for: chardonnay, sauvignon blanc, riesling, pinot grigio, pinot gris, gewürztraminer, vermentino, soave

**Fix:**
- Add "albariño" (and "albarino") to white wine detection
- Also add Grüner Veltliner, Viognier, and other common varieties

**Priority:** MEDIUM (cosmetic but affects UX)

---

### **Issue 3: HTTP 502 Error (First Attempt)** ⚠️ **MEDIUM PRIORITY**

**Symptoms:**
- First request fails: `HTTP 502:` after 61.5 seconds
- Retry succeeds after ~29 seconds
- Total time: 91+ seconds

**Possible Causes:**
1. Backend service restarting during request (deployment)
2. Request timeout (60 second limit on backend/load balancer)
3. Service temporarily unavailable
4. Network/load balancer issue

**Investigation Needed:**
- Check Render logs for timeout errors
- Check backend timeout middleware settings
- Verify service stability during deployment

**Fix:**
- Increase timeout if needed
- Improve error handling
- Better retry logic on frontend

**Priority:** MEDIUM (retry works, but affects UX)

---

### **Issue 4: Metro InternalBytecode.js Error** ℹ️ **LOW PRIORITY**

**Symptoms:**
- Error: `ENOENT: no such file or directory, open 'C:\Users\ramyy\Production\Aperae\InternalBytecode.js'`
- Appears during error stack trace symbolication

**Root Cause:**
- Metro bundler trying to symbolicate React Native stack traces
- Looking for source map file that doesn't exist
- This is a development-only issue

**Fix:**
- Configure Metro to handle missing source maps gracefully
- Suppress specific error (development only)

**Priority:** LOW (doesn't affect functionality, dev-only)

---

## 🔧 **Implementation Plan**

### **Fix 1: Add pricePoint to V7.0 Response** ✅

**Option A: Add to V7.0 Schema (Recommended)**

1. **Update V7.0 JSON Schema:**
   - File: `backend/prompts/v7-master-sommelier-prompt.js`
   - Add `pricePoint` field after `grape` (around line 89)
   - Format: `"pricePoint": "Realistic market price in format '$XX' OR 'unknown'"`

2. **Update Enhancement Logic:**
   - File: `backend/services/wineDatabaseService.js`
   - Ensure `enhanceRecommendation()` handles missing pricePoint
   - Default to "unknown" if not provided

**Option B: Add Default in Enhancement (Alternative)**

1. **Update Enhancement Logic:**
   - File: `backend/services/wineDatabaseService.js`
   - In `enhanceRecommendation()`, add:
     ```javascript
     pricePoint: aiRecommendation.pricePoint || "unknown"
     ```

**Recommendation:** Use Option A - Add to V7.0 schema so Claude provides realistic prices when known.

---

### **Fix 2: Improve Category Inference**

1. **Update `inferCategory()` function:**
   - File: `backend/services/wineDatabaseService.js`
   - Add missing white wine varieties:
     - "albariño", "albarino"
     - "grüner veltliner", "gruener veltliner"
     - "viognier"
     - "verdejo"
     - "sémillon", "semillon"
     - And others as needed

---

### **Fix 3: Investigate HTTP 502**

1. **Check Backend Timeouts:**
   - Review `backend/server.js` for timeout middleware
   - Check Render service timeout settings
   - Ensure timeout > 90 seconds (for Claude API calls)

2. **Improve Error Handling:**
   - Add better 502 error messages
   - Log more context when 502 occurs
   - Frontend: Better retry messaging

---

### **Fix 4: Metro Error (Optional)**

1. **Suppress Metro Symbolication Error:**
   - Add to Metro config (if exists)
   - Or add error handling in development

---

## 📊 **Expected Results After Fixes**

### **Before:**
```json
{
  "wineName": "Albariño",
  "category": "Unknown",
  "pricePoint": undefined
}
```

### **After:**
```json
{
  "wineName": "Albariño",
  "category": "White Wine",
  "pricePoint": "$25"  // or "unknown" if not available
}
```

---

## ✅ **Verification Checklist**

After implementing fixes:

- [ ] pricePoint appears in all responses (never undefined)
- [ ] Category correctly identifies Albariño as "White Wine"
- [ ] Category correctly identifies Grüner Veltliner as "White Wine"
- [ ] HTTP 502 errors investigated/resolved
- [ ] Frontend displays price correctly
- [ ] Frontend displays category correctly

---

## 🎯 **Next Steps**

1. **Implement Fix 1** (pricePoint) - HIGHEST PRIORITY
2. **Implement Fix 2** (category inference) - MEDIUM PRIORITY  
3. **Investigate Fix 3** (502 errors) - MEDIUM PRIORITY
4. **Fix 4** (Metro) - LOW PRIORITY (optional)

---

**Status:** Ready to implement - starting with pricePoint fix





