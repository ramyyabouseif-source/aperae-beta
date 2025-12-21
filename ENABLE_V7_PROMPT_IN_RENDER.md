# Enable V7.0 Prompt in Render (Production & Staging)

**Date:** December 15, 2025  
**Purpose:** Configure Render to use V7.0 Master Sommelier Prompt as the default

---

## ✅ **Good News: V7.0 is Now the Default!**

**As of the latest code update, V7.0 is enabled by default.** You don't need to do anything unless you want to explicitly disable it.

However, if you want to **explicitly enable it in Render** for clarity, follow these steps:

---

## 🔧 **Step-by-Step: Enable V7.0 in Render**

### **For Production Service:**

1. **Go to Render Dashboard**
   - Navigate to: https://dashboard.render.com
   - Sign in to your account

2. **Open Your Production Service**
   - Click on your production service (likely named something like `aperae-backend`)

3. **Navigate to Environment Variables**
   - Click on **"Environment"** in the left sidebar
   - You'll see a list of all environment variables

4. **Add/Update `ENABLE_V7_PROMPT`**
   - Look for `ENABLE_V7_PROMPT` in the list:
     - **If it exists:** Click on it and change the value to: `true`
     - **If it doesn't exist:** Click **"Add Environment Variable"** and add:
       - **Key:** `ENABLE_V7_PROMPT`
       - **Value:** `true`

5. **Save Changes**
   - Click **"Save Changes"** or the save button
   - Render will automatically trigger a new deployment
   - Wait for deployment to complete (usually 2-5 minutes)

6. **Verify Deployment**
   - After deployment, check the logs
   - Look for: `"Using V7.0 Master Sommelier Prompt"`
   - Make a test request to confirm V7.0 is active

---

### **For Staging Service:**

Follow the exact same steps above, but use your staging service (`aperae-backend-staging-1` or similar).

---

## 📋 **Current Behavior (After Code Update)**

### **Default Behavior (No Environment Variable Set):**
- ✅ **V7.0 Prompt is ENABLED by default**
- No need to set `ENABLE_V7_PROMPT` unless you want to disable it

### **To Explicitly Enable (Recommended for Clarity):**
- Set `ENABLE_V7_PROMPT=true` in Render

### **To Disable V7.0 (Use Legacy Prompts):**
- Set `ENABLE_V7_PROMPT=false` in Render
- System will fall back to Enhanced or Legacy prompts

---

## 🔍 **How to Verify V7.0 is Active**

### **Method 1: Check Logs**
1. Go to Render Dashboard → Your Service → **"Logs"**
2. Make a test request:
   ```powershell
   $body = @{ dish = "Grilled Salmon" } | ConvertTo-Json
   Invoke-RestMethod -Method Post -Uri "https://api.aperae.com/api/recommendations" `
       -ContentType "application/json" -Body $body
   ```
3. Look for this log message:
   ```
   "message": "Using V7.0 Master Sommelier Prompt"
   ```

### **Method 2: Check Response Format**
Make a test request and check the response. V7.0 responses include:
- `dishAnalysis.idealProfile` (object with acidity, tannin, body, sweetness)
- `dishAnalysis.keyChallenge` (string)
- `recommendations[0].confidence.breakdown` (object with pairingScience, wineKnowledge, complexityHandling)
- `recommendations[0].grape` field (e.g., "Chardonnay (White)")

---

## ✅ **Verification Checklist**

After updating Render environment variables:

- [ ] `ENABLE_V7_PROMPT=true` set in Render (or left unset - defaults to true)
- [ ] Deployment completed successfully
- [ ] Logs show: "Using V7.0 Master Sommelier Prompt"
- [ ] Test request returns V7.0 format (has `idealProfile`, `confidence.breakdown`, etc.)

---

## 📝 **Summary**

**V7.0 is now the default prompt!** The code has been updated so that:

- ✅ **V7.0 is enabled by default** (even if `ENABLE_V7_PROMPT` is not set)
- ✅ **Only disable by setting `ENABLE_V7_PROMPT=false`**
- ✅ **No action required** - it will work automatically
- ✅ **Optional:** Set `ENABLE_V7_PROMPT=true` explicitly in Render for clarity

**Next Steps:**
1. Deploy the updated code (if not already deployed)
2. Optionally set `ENABLE_V7_PROMPT=true` in Render for explicit configuration
3. Verify in logs that V7.0 is being used

---

## 🎯 **Benefits of V7.0 Prompt**

- ✅ **92% token savings** with prompt caching
- ✅ **Enhanced dish analysis** with `idealProfile` and `keyChallenge`
- ✅ **Detailed confidence breakdown** (pairingScience, wineKnowledge, complexityHandling)
- ✅ **Better tier classification** with detailed rules
- ✅ **Improved anti-hallucination** protections
- ✅ **More accurate wine recommendations**

---

**Status:** ✅ V7.0 is now the default! Just deploy the updated code.





