# Disable Mock Mode in Staging Environment

**Date:** December 13, 2025  
**Purpose:** Configure staging API to use real Claude API instead of fallback mock data

---

## 🔍 Current Issue

Staging API (`staging-api.aperae.com`) is currently in **MOCK_MODE**, which causes it to return fallback mock data instead of calling the Claude API for wine recommendations.

**How Mock Mode Works:**
- In `backend/server.js` line 43: `const MOCK_MODE = process.env.MOCK_MODE !== 'false';`
- This means mock mode is **enabled by default** unless explicitly set to `'false'`
- When enabled, the API returns hardcoded mock responses instead of calling Claude

---

## ✅ Solution: Disable Mock Mode in Render

### Step 1: Access Render Dashboard
1. Go to [https://dashboard.render.com](https://dashboard.render.com)
2. Sign in to your account
3. Navigate to your staging service: `aperae-backend-staging-1` (or your staging service name)

### Step 2: Open Environment Variables
1. In your staging service dashboard, click on **"Environment"** in the left sidebar
2. You'll see a list of all environment variables for the service

### Step 3: Add/Update MOCK_MODE Variable
1. Look for an existing `MOCK_MODE` variable:
   - **If it exists:** Click on it and change the value to: `false`
   - **If it doesn't exist:** Click **"Add Environment Variable"** and add:
     - **Key:** `MOCK_MODE`
     - **Value:** `false`

### Step 4: Verify ANTHROPIC_API_KEY is Set
Since disabling mock mode requires the Claude API:
1. Verify that `ANTHROPIC_API_KEY` is set in the environment variables
2. The value should be your actual Anthropic API key (starts with `sk-ant-...`)
3. If it's missing, add it (same key as production)

### Step 5: Save and Redeploy
1. Click **"Save Changes"** or the save button
2. Render will automatically trigger a new deployment
3. Wait for the deployment to complete (usually 2-5 minutes)

### Step 6: Verify Mock Mode is Disabled
1. After deployment completes, check the Render logs
2. Look for this line in the startup logs:
   ```
   🔑 Production mode - Anthropic API key required
   ```
   (NOT "🤖 Mock mode enabled")
3. Test the health endpoint:
   ```powershell
   Invoke-RestMethod -Uri "https://staging-api.aperae.com/api/health" -Method Get
   ```
4. Verify `mockMode: false` in the response

---

## 📋 Expected Results

**Before (Mock Mode Enabled):**
```json
{
  "status": "healthy",
  "mockMode": true,
  ...
}
```

**After (Mock Mode Disabled):**
```json
{
  "status": "healthy",
  "mockMode": false,
  ...
}
```

**API Behavior:**
- ✅ Real Claude API calls (30-60 second response times)
- ✅ Actual wine recommendations based on the dish
- ✅ No fallback/mock data

---

## ⚠️ Important Notes

1. **Environment Variable Format:**
   - Use lowercase: `false` (not `False` or `FALSE`)
   - Must be exactly the string `"false"` (not `0` or empty)

2. **Deployment:**
   - Changes to environment variables automatically trigger a redeploy
   - The service will be briefly unavailable during deployment

3. **API Key Required:**
   - With mock mode disabled, `ANTHROPIC_API_KEY` becomes required
   - If the key is missing or invalid, the service may fail to start

4. **Cost Consideration:**
   - Disabling mock mode means staging will use Claude API (costs money)
   - Consider keeping mock mode enabled if staging is only for testing infrastructure
   - Or disable it only when you need to test real AI recommendations

---

## 🔄 Re-enable Mock Mode (If Needed)

If you want to re-enable mock mode later:
1. Set `MOCK_MODE=true` in Render environment variables
2. Or remove the `MOCK_MODE` variable entirely (defaults to enabled)

---

## ✅ Verification Checklist

- [ ] `MOCK_MODE=false` set in Render staging service
- [ ] `ANTHROPIC_API_KEY` verified in Render staging service
- [ ] Deployment completed successfully
- [ ] Health check shows `mockMode: false`
- [ ] Test wine recommendation returns real AI results (not fallback)

---

## 📝 Summary

**To disable mock mode in staging:**
1. Go to Render dashboard → Staging service → Environment
2. Set `MOCK_MODE=false`
3. Ensure `ANTHROPIC_API_KEY` is set
4. Save and wait for redeploy
5. Verify in health check endpoint

Once disabled, staging will use the real Claude API just like production! 🎉







