# ⚠️ Ngrok Free Tier Timeout Limitation

## Problem

**ngrok free tier has a hard 30-second request timeout limit.** This causes HTTP 503 (Service Unavailable) errors when API calls take longer than 30 seconds.

### Why This Affects Our App

Our wine recommendation API uses Claude Sonnet 4.5, which typically takes **55-60 seconds** to generate detailed recommendations. This exceeds ngrok's 30-second timeout, resulting in:

- ❌ HTTP 503 errors from ngrok
- ❌ Failed API requests
- ❌ Fallback to mock data instead of real recommendations

## Error Symptoms

When using ngrok free tier, you may see:

```
ERROR: Secure request failed: https://xxxx.ngrok-free.app/api/recommendations [Error: HTTP 503: ]
ERROR: Request timed out after 30 seconds
```

The backend logs show successful completion, but the frontend receives 503 because ngrok terminated the connection.

## Solutions

### ✅ Option 1: Use Localhost for Development (Recommended)

**Best for:** Local development on iOS Simulator, Android Emulator, or web

1. **Remove or comment out** `EXPO_PUBLIC_API_URL` in your `.env` file:
   ```env
   # EXPO_PUBLIC_API_URL=https://xxxx.ngrok-free.app
   ```

2. **Restart Expo:**
   ```bash
   npx expo start --clear
   ```

3. **The app will automatically use:** `http://localhost:3001/api`

**Advantages:**
- ✅ No timeout limitations
- ✅ Faster (no internet round-trip)
- ✅ More reliable
- ✅ No URL changes

**Limitations:**
- ❌ Physical devices need to be on the same WiFi network
- ❌ May need to use your computer's IP address instead of localhost

### ✅ Option 2: Upgrade to Ngrok Paid Tier

**Best for:** Production-like testing or remote device testing

Ngrok paid plans support:
- **Starter ($8/month):** 5-minute request timeout
- **Pro ($10/month):** 5-minute request timeout + custom domains
- **Enterprise:** Custom timeouts

**Upgrade at:** https://dashboard.ngrok.com/billing

### ✅ Option 3: Use Your Computer's IP Address

**Best for:** Physical devices on the same WiFi network

1. **Find your computer's IP address:**
   ```powershell
   # Windows
   ipconfig
   # Look for "IPv4 Address" under your active network adapter
   ```

2. **Update `.env`:**
   ```env
   EXPO_PUBLIC_API_URL=http://192.168.1.XXX:3001
   ```

3. **Update backend CORS** to allow your IP address

4. **Restart both backend and frontend**

### ✅ Option 4: Implement Async Processing (Future)

**Best for:** Production deployment

Implement a job queue system:
1. API returns immediately with a job ID
2. Frontend polls a status endpoint
3. Results available when ready

This requires significant code changes but is the best long-term solution.

## Current Configuration

### Frontend Timeout
- **Configured:** 90 seconds
- **Location:** `src/utils/api.ts` → `NETWORK_CONFIG.timeout`

### Backend Timeout
- **Configured:** 60 seconds
- **Location:** `backend/timeoutMiddleware.js` → `API_TIMEOUT_RECOMMENDATIONS_MS`

### Ngrok Free Tier Timeout
- **Limit:** 30 seconds (hard limit, cannot be changed)
- **This is the bottleneck** ⚠️

## Detection

The app will automatically detect when you're using ngrok and show a warning:

```
⚠️ Using ngrok URL in development. Note: ngrok free tier has a 30-second timeout.
For long-running API calls (Claude API ~55s), use localhost instead.
```

## Testing

### Verify Localhost Works

1. **Start backend:**
   ```bash
   cd backend
   npm start
   ```

2. **Ensure no `EXPO_PUBLIC_API_URL` in `.env`**

3. **Start frontend:**
   ```bash
   npx expo start
   ```

4. **Check logs** - should show:
   ```
   LOG: API_BASE_URL: http://localhost:3001/api
   ```

5. **Test recommendation** - should complete successfully without 503 errors

### Verify Ngrok Timeout Issue

1. **Set ngrok URL in `.env`:**
   ```env
   EXPO_PUBLIC_API_URL=https://xxxx.ngrok-free.app
   ```

2. **Start ngrok:**
   ```bash
   ngrok http 3001
   ```

3. **Test recommendation** - will fail with 503 after ~30 seconds

## Recommendations

### For Development
✅ **Use localhost** - It's faster, more reliable, and has no timeout issues.

### For Testing on Physical Devices
✅ **Use your computer's IP address** - Works on same WiFi network, no timeout issues.

### For Remote Testing
✅ **Upgrade ngrok** - Paid tier supports 5-minute timeouts, sufficient for Claude API.

### For Production
✅ **Deploy to a real server** - Use a proper hosting service (AWS, Heroku, etc.) with no timeout limitations.

## Related Files

- `src/utils/api.ts` - API URL configuration
- `backend/server.js` - Backend timeout configuration
- `backend/timeoutMiddleware.js` - Request timeout middleware
- `NGROK_SETUP_GUIDE.md` - General ngrok setup guide

## Additional Resources

- [Ngrok Pricing](https://ngrok.com/pricing)
- [Ngrok Timeout Documentation](https://ngrok.com/docs/guides/request-timeouts/)
- [Claude API Documentation](https://docs.anthropic.com/claude/reference/messages_post)

---

**Last Updated:** 2025-11-27  
**Status:** Active Issue - Use localhost for development to avoid timeout errors













