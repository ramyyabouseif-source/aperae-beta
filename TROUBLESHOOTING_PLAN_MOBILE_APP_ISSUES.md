# Troubleshooting Plan: Mobile App Issues

**Date:** December 15, 2025  
**Status:** 🔍 **Analysis Complete - Fixes Needed**

---

## 🔍 **Issues Identified**

### **1. HTTP 502 Error (First Attempt)** ⚠️
**Error:** `HTTP 502:` after 61.5 seconds  
**Impact:** First request failed, retry succeeded  
**Likely Cause:** 
- Backend service restarting/deploying during request
- Request timeout on backend (60 second limit?)
- Load balancer/network issue

**Priority:** Medium (retry mechanism works, but affects UX)

---

### **2. Missing `pricePoint` Field** ❌
**Error:** `pricePoint: undefined` in response  
**Impact:** Frontend shows "Price Point: Not specified"  
**Root Cause:** 
- V7.0 prompt JSON schema **does NOT include `pricePoint`** (intentionally removed for optimization)
- Enhancement service doesn't add it back
- Frontend expects it

**Priority:** High (affects user experience)

---

### **3. Category: "Unknown"** ⚠️
**Error:** Albariño shows `category: "Unknown"`  
**Impact:** Wine category not displayed correctly  
**Likely Cause:**
- Category inference logic doesn't recognize Albariño
- V7.0 response doesn't include category field

**Priority:** Medium (cosmetic but affects UX)

---

### **4. InternalBytecode.js Metro Error** ℹ️
**Error:** `ENOENT: no such file or directory, open 'C:\Users\ramyy\Production\Aperae\InternalBytecode.js'`  
**Impact:** Error stack trace symbolication fails (development only)  
**Cause:** Metro bundler trying to symbolicate React Native stack traces  
**Priority:** Low (development issue, doesn't affect functionality)

---

### **5. Slow Response Times** ⚠️
**Stats:** 91+ seconds total, 29 seconds for successful request  
**Impact:** Poor user experience  
**Note:** This is expected for Claude API calls (25-90 seconds is normal)  
**Priority:** Low (expected behavior, but could optimize with prompt caching)

---

## 🔧 **Fixes Required**

### **Fix 1: Add `pricePoint` to V7.0 Response** (HIGH PRIORITY)

**Problem:** V7.0 prompt schema doesn't include `pricePoint`, but frontend expects it.

**Solution Options:**

**Option A: Add to V7.0 JSON Schema (Recommended)**
- Add `pricePoint` field to V7.0 prompt JSON schema
- Prompt should return it (even if "unknown" when uncertain)

**Option B: Add in Enhancement Step (Alternative)**
- Keep V7.0 schema as-is (no pricePoint)
- Add pricePoint during `enhanceRecommendations()` step
- Infer from tier or use "unknown"

**Recommendation:** Option A - Add to V7.0 schema since frontend expects it.

---

### **Fix 2: Improve Category Inference** (MEDIUM PRIORITY)

**Problem:** Category inference doesn't recognize Albariño.

**Solution:**
- Update `inferCategory()` in `wineDatabaseService.js`
- Add Albariño and other common varieties to white wine detection
- Or add category to V7.0 response schema

---

### **Fix 3: Handle HTTP 502 Gracefully** (MEDIUM PRIORITY)

**Problem:** First request fails with 502, user waits for retry.

**Solution:**
- Investigate why 502 occurs (check Render logs for timeouts)
- Increase backend timeout if needed
- Improve error messaging on frontend
- Consider exponential backoff for retries

---

### **Fix 4: Suppress Metro InternalBytecode Error** (LOW PRIORITY)

**Problem:** Metro bundler error spam in development.

**Solution:**
- Configure Metro to ignore symbolication errors
- Or suppress specific error in Metro config
- This is a development-only issue

---

## 📋 **Implementation Plan**

### **Step 1: Add pricePoint to V7.0 Schema** ✅ **START HERE**

1. Update `backend/prompts/v7-master-sommelier-prompt.js`
   - Add `pricePoint` field to JSON schema (around line 89)
   - Format: `"pricePoint": "Realistic market price in format '$XX' OR 'unknown'"`

2. Update V7.0 prompt instructions
   - Ensure prompt requires pricePoint in output
   - Use "unknown" if uncertain (don't invent prices)

3. Test that pricePoint appears in responses

**Files to modify:**
- `backend/prompts/v7-master-sommelier-prompt.js` (JSON schema)

---

### **Step 2: Improve Category Inference**

1. Update `backend/services/wineDatabaseService.js`
   - Enhance `inferCategory()` function
   - Add Albariño, Grüner Veltliner, and other varieties to detection logic

**Files to modify:**
- `backend/services/wineDatabaseService.js` (inferCategory method)

---

### **Step 3: Investigate HTTP 502**

1. Check Render logs for:
   - Request timeouts
   - Service restarts during requests
   - Load balancer issues

2. Check backend timeout settings:
   - Express timeout middleware
   - Render service timeout limits

3. Add better error handling:
   - More descriptive 502 error messages
   - Frontend retry logic improvements

**Files to check:**
- `backend/server.js` (timeout middleware)
- Render service settings

---

### **Step 4: Fix Metro Error (Optional)**

1. Configure Metro bundler:
   - Add to `metro.config.js` if exists
   - Or suppress in error handling

**Priority:** Low - development issue only

---

## ✅ **Verification Steps**

After fixes:

1. **Test pricePoint:**
   - Make recommendation request
   - Verify `pricePoint` appears in response (or "unknown" if not available)
   - Frontend should display price correctly

2. **Test category:**
   - Request recommendations with various wines
   - Verify categories are correct (especially Albariño, Grüner Veltliner)

3. **Monitor 502 errors:**
   - Watch for 502 errors in logs
   - Verify retry mechanism works
   - Check if frequency decreases

---

## 📊 **Expected Results**

**Before:**
- ❌ `pricePoint: undefined`
- ❌ `category: "Unknown"` for some wines
- ⚠️ HTTP 502 errors on first attempt

**After:**
- ✅ `pricePoint: "$XX"` or `"unknown"` (never undefined)
- ✅ `category: "White Wine"` (correct for all wines)
- ✅ Fewer/no 502 errors (or better handling)

---

## 🎯 **Priority Order**

1. **HIGH:** Add pricePoint to V7.0 schema
2. **MEDIUM:** Improve category inference
3. **MEDIUM:** Investigate/fix 502 errors
4. **LOW:** Suppress Metro errors (dev only)

---

**Status:** Ready to implement fixes - starting with pricePoint (highest priority)


