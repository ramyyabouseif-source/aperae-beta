# How to Check Which Prompt is Currently Active

**Date:** December 15, 2025  
**Purpose:** Verify which prompt version is being used in production/staging

---

## 🔍 **Method 1: Check Render Environment Variables (Most Reliable)**

### Steps:

1. **Go to Render Dashboard**
   - Navigate to: https://dashboard.render.com
   - Sign in to your account

2. **Open Your Service**
   - Production: Click on your production service
   - Staging: Click on `aperae-backend-staging-1` (or your staging service name)

3. **Check Environment Variables**
   - Click on **"Environment"** in the left sidebar
   - Look for these variables:

   **For V7.0 Prompt:**
   - `ENABLE_V7_PROMPT` = `true` → **V7.0 Master Sommelier Prompt** ✅
   - `ENABLE_V7_PROMPT` = `false` or not set → Falls to next option

   **For Enhanced Prompt:**
   - `ENABLE_ENHANCED_PROMPT` = `true` → **Enhanced Sommelier Prompt** (only if V7.0 is disabled)
   - `ENABLE_ENHANCED_PROMPT` = `false` or not set → Falls to legacy

   **Default (If Both Not Set):**
   - **General/Legacy Sommelier Prompt** (original prompt)

---

## 🔍 **Method 2: Check Production Logs (Real-Time)**

### Steps:

1. **Open Render Dashboard** → Your Service → **"Logs"** tab

2. **Make a Test Request**
   - Use PowerShell to make a test recommendation:
   ```powershell
   $body = @{
       dish = "Grilled Salmon"
   } | ConvertTo-Json

   Invoke-RestMethod -Method Post -Uri "https://api.aperae.com/api/recommendations" `
       -ContentType "application/json" `
       -Body $body
   ```

3. **Check Logs for Prompt Selection Messages**

   **If V7.0 is Active, you'll see:**
   ```
   {"level":"info","message":"Using V7.0 Master Sommelier Prompt","metadata":{"requestId":"...","promptVersion":"v7.0","dish":"Grilled Salmon"}...}
   ```

   **If Enhanced is Active, you'll see:**
   ```
   {"level":"info","message":"Using prompt version: enhanced","metadata":{"requestId":"...","version":"enhanced"}...}
   ```

   **If Legacy is Active, you'll see:**
   ```
   {"level":"info","message":"Using prompt version: legacy","metadata":{"requestId":"...","version":"legacy"}...}
   ```

4. **Look for Diagnostic Logs**
   - You should also see: `"Prompt selection diagnostic"` with feature flag values:
   ```json
   {
     "message": "Prompt selection diagnostic",
     "metadata": {
       "ENABLE_V7_PROMPT_raw": "true" or "false" or undefined,
       "useV7PromptFlag": true or false,
       ...
     }
   }
   ```

---

## 🔍 **Method 3: Check Response Format (Indirect)**

### V7.0 Prompt Indicators:
- Response includes `dishAnalysis` with these fields:
  - `keyChallenge` (string)
  - `idealProfile` (object with `acidity`, `tannin`, `body`, `sweetness`, `notes`)
  - `applicablePrinciples` (array)
- Recommendations include:
  - `confidence` object with `breakdown` (pairingScience, wineKnowledge, complexityHandling)
  - `grape` field (e.g., "Chardonnay (White)")
  - `tierLabel` with specific tier classification

### Enhanced/Legacy Prompt Indicators:
- Response includes `dishAnalysis` but **NO** `keyChallenge` or `idealProfile`
- Simpler confidence scoring (just `confidenceScore` number, no breakdown)
- Less detailed tier classification

---

## 📋 **Quick Reference: Prompt Comparison**

| Feature | V7.0 | Enhanced | Legacy |
|---------|------|----------|--------|
| **Feature Flag** | `ENABLE_V7_PROMPT=true` | `ENABLE_ENHANCED_PROMPT=true` (V7.0 disabled) | Both disabled |
| **Key Challenge** | ✅ Yes | ❌ No | ❌ No |
| **Ideal Profile** | ✅ Yes | ❌ No | ❌ No |
| **Confidence Breakdown** | ✅ Yes (3 components) | ❌ No | ❌ No |
| **Tier Classification** | ✅ Detailed rules | ✅ Basic | ✅ Basic |
| **Prompt Caching** | ✅ Yes (92% savings) | ❌ No | ❌ No |
| **Response Time** | ~30-60s | <25s target | ~30-60s |

---

## ✅ **Based on Your Test Results**

Looking at your Test 6 results (Pomegranate glazed salmon), the response included:
- ✅ Detailed `dishAnalysis`
- ✅ Proper wine recommendations (white wines for salmon)
- ✅ Structured response format

**However**, I notice the response didn't show:
- `keyChallenge` field
- `idealProfile` object
- `confidence` breakdown (just `confidenceScore`)

**This suggests you're likely using:**
- **Enhanced Prompt** (if `ENABLE_ENHANCED_PROMPT=true` and `ENABLE_V7_PROMPT` is not set)
- **OR Legacy Prompt** (if both flags are not set)

---

## 🎯 **To Enable V7.0 Prompt:**

1. Go to Render Dashboard → Your Service → Environment
2. Add/Update: `ENABLE_V7_PROMPT` = `true`
3. Save (Render will auto-redeploy)
4. Wait for deployment to complete
5. Test again and check logs for "Using V7.0 Master Sommelier Prompt"

---

## 🔍 **Test Script to Verify Prompt**

Create a simple test file to check:

```powershell
# Test which prompt is active
$body = @{
    dish = "Grilled Salmon"
} | ConvertTo-Json

Write-Host "Testing prompt version..." -ForegroundColor Cyan
$response = Invoke-RestMethod -Method Post -Uri "https://api.aperae.com/api/recommendations" `
    -ContentType "application/json" `
    -Body $body

Write-Host "`nChecking response format..." -ForegroundColor Yellow

if ($response.dishAnalysis.idealProfile) {
    Write-Host "✅ V7.0 PROMPT ACTIVE" -ForegroundColor Green
    Write-Host "   - idealProfile: Found" -ForegroundColor Gray
} elseif ($response.dishAnalysis) {
    Write-Host "⚠️  ENHANCED or LEGACY PROMPT" -ForegroundColor Yellow
    Write-Host "   - idealProfile: Not found" -ForegroundColor Gray
    Write-Host "   - Check logs or environment variables to determine which" -ForegroundColor Gray
} else {
    Write-Host "❓ UNKNOWN - Response format unclear" -ForegroundColor Red
}

# Check confidence format
if ($response.recommendations[0].confidence.score) {
    Write-Host "   - Confidence breakdown: Found (V7.0 format)" -ForegroundColor Gray
} else {
    Write-Host "   - Confidence score only: Found (Enhanced/Legacy format)" -ForegroundColor Gray
}
```

---

## 📝 **Summary**

**To know for certain which prompt is active:**
1. ✅ **Check Render Environment Variables** (definitive)
2. ✅ **Check Production Logs** (real-time confirmation)
3. ✅ **Analyze Response Format** (indirect indicator)

**Most likely current state:** Based on your test results, you're probably using **Enhanced** or **Legacy** prompt, not V7.0 (unless the response fields were filtered out before display).



