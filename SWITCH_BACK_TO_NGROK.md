# 🔄 Switching Back to Ngrok - Optimized for 30-Second Timeout

## ✅ Changes Applied

I've optimized the Claude API call to fit within ngrok's 30-second timeout:

### 1. Reduced Token Limit
- **Changed:** `max_tokens: 8000` → `max_tokens: 3000`
- **Location:** `backend/server.js` line ~2027
- **Impact:** ~60% reduction in response size = faster generation

### 2. Added Speed Instructions
- **Added:** Speed optimization section to prompt
- **Instructs:** Claude to keep responses concise and brief
- **Location:** `backend/server.js` line ~533

### 3. Reduced Response Requirements
- **Rationale:** 40-80 words → 30-60 words
- **Story:** 1-2 sentences → 1 sentence
- **Alternatives:** 2 per wine → 1 per wine
- **Closing Narrative:** 2-3 sentences → 1-2 sentences

### 4. Updated .env File
- **Changed:** Back to ngrok URL
- **Current:** `EXPO_PUBLIC_API_URL=https://7e244d03ed74.ngrok-free.app`

## 🚀 Next Steps

### Step 1: Restart Backend

**Stop the backend** (if running):
- Press `Ctrl + C` in the backend terminal

**Start the backend:**
```powershell
cd backend
npm start
```

**Wait for:** "PocketSomm Backend started"

### Step 2: Restart Expo

**Stop Expo** (if running):
- Press `Ctrl + C` in the Expo terminal

**Start Expo:**
```powershell
npx expo start --clear
```

### Step 3: Test

1. **Make a wine recommendation request**
2. **Check backend logs** - should see response time < 30 seconds
3. **Check frontend logs** - should see successful response (no 503 errors)

## 📊 Expected Performance

**Before optimization:**
- Response time: 55-60 seconds
- Result: ❌ 503 timeout error

**After optimization:**
- Expected response time: 20-30 seconds
- Result: ✅ Should complete successfully

## ⚠️ Important Notes

### Response Quality
- Responses will be **shorter** but still **complete**
- All essential information is maintained
- Quality and accuracy preserved
- Just more concise

### If Still Timing Out

If responses still exceed 30 seconds:

1. **Check backend logs** - see actual response time
2. **Reduce max_tokens further** - try 2000 instead of 3000
3. **Simplify prompt more** - remove non-essential sections
4. **Consider ngrok paid tier** - supports 5-minute timeouts

### Monitoring

Watch backend logs for:
```
[anthropic] External API call completed
Response Time: XXXX ms
```

**Target:** < 30000 ms (30 seconds)

## 🔍 Verification

After testing, check:

- [ ] Backend logs show response time < 30 seconds
- [ ] No 503 errors in frontend
- [ ] Wine recommendations are complete (all fields present)
- [ ] Response quality is acceptable (shorter but accurate)

## 📝 What Changed

**Files Modified:**
- `backend/server.js` - Reduced max_tokens, added speed instructions, updated prompt
- `.env` - Switched back to ngrok URL

**Files Created:**
- `NGROK_OPTIMIZATION_SUMMARY.md` - Detailed optimization documentation

---

**Last Updated:** 2025-11-27  
**Status:** Ready to test with ngrok















