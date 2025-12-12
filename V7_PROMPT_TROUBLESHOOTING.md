# V7.0 Prompt Troubleshooting Guide

## 🔍 **Issue:**
`ENABLE_V7_PROMPT=true` is set in Render, but API returns legacy format.

## ✅ **Quick Checks:**

### **1. Check Render Logs:**
After making an API request, check Render logs for:
- ✅ **"Using V7.0 Master Sommelier Prompt"** → V7.0 is enabled
- ❌ **"Using prompt version: legacy"** or **"Using prompt version: enhanced"** → V7.0 is NOT enabled

### **2. Verify Environment Variable Format:**
In Render → Settings → Environment:
- **Key:** `ENABLE_V7_PROMPT`
- **Value:** Must be exactly `true` (no quotes, no spaces, lowercase)
- ✅ Correct: `true`
- ❌ Wrong: `"true"`, `TRUE`, ` True `, `1`

### **3. Force Service Restart:**
Environment variables only load on service start:
1. Go to Render Dashboard → Your Service
2. Click **"Manual Deploy"** → **"Deploy latest commit"**
3. OR click **"Restart Service"** (if available)

### **4. Test API Response:**
After restart, test the API and check for V7.0 format:
- ✅ Has `region` and `grape` fields
- ✅ Has `confidence` object (not `confidenceScore`)
- ✅ Has `tastingNotes` object (not string)
- ✅ Has `servingGuidance` object (not string)
- ❌ No `pricePoint`, `expertRating`, `retailerSuggestion`

---

## 🔧 **Added Diagnostic Logging:**

I've added enhanced logging that will show:
- Raw environment variable value
- Feature flag evaluation result
- Which prompt is selected

**Check Render logs after next API call** to see diagnostic information.

---

## 📋 **What to Look For in Logs:**

### **If V7.0 is Enabled:**
```
Prompt selection diagnostic: {
  ENABLE_V7_PROMPT_raw: "true",
  useV7PromptFlag: true,
  isFeatureEnabled_result: true
}
Using V7.0 Master Sommelier Prompt
```

### **If V7.0 is NOT Enabled:**
```
Prompt selection diagnostic: {
  ENABLE_V7_PROMPT_raw: undefined,  // ← Missing!
  useV7PromptFlag: false,
  isFeatureEnabled_result: false
}
Using prompt version: legacy
```

---

## 🚀 **Next Steps:**

1. **Check Render logs** from your last API test
2. **Verify environment variable** is exactly `true` (no quotes)
3. **Restart service** in Render
4. **Test API again** and check logs for diagnostic output
5. **Verify response format** has V7.0 structure

---

**After restart, the diagnostic logs will tell us exactly what's happening!**

