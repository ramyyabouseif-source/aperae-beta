# V7.0 Prompt Diagnostic - Why It's Not Working

## 🔍 **Issue:**
`ENABLE_V7_PROMPT=true` is set in Render, but API is still returning legacy format.

## 🔍 **Possible Causes:**

### **1. Environment Variable Not Loaded**
- Render may not have reloaded environment variables
- Service may need manual restart
- Environment variable might be set in wrong format

### **2. Check Feature Flag Status**

Let's add diagnostic logging to see what's happening.

---

## 🔧 **Solution: Add Diagnostic Endpoint**

I'll add a diagnostic endpoint to check:
1. Raw environment variable value
2. Feature flag evaluation result
3. Which prompt is actually being used

---

## 📋 **Steps to Diagnose:**

1. **Check Render Logs:**
   - Look for: "Using V7.0 Master Sommelier Prompt" in logs
   - Look for: "Feature flag check" debug messages
   - If you see "Using prompt version: legacy" → V7.0 is not enabled

2. **Verify Environment Variable:**
   - In Render: Settings → Environment
   - Key: `ENABLE_V7_PROMPT`
   - Value: Should be exactly `true` (no quotes, no spaces)

3. **Force Restart:**
   - Render → Your Service → Manual Deploy → Restart Service
   - This ensures environment variables are reloaded

4. **Check Feature Flag Function:**
   - The function accepts: `'true'`, `'1'`, or `'yes'` (case insensitive)
   - It converts to uppercase and checks

---

## 🧪 **Test After Restart:**

Test the API and check logs:
- Should see: "Using V7.0 Master Sommelier Prompt"
- Should see: Feature flag check debug message showing `enabled: true`
- Response should have V7.0 format (no `pricePoint`, has `region`, `grape`, etc.)

---

**Next: Add diagnostic logging to see what's actually happening.**







