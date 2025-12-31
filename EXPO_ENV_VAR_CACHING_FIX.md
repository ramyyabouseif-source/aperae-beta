# Fix: Expo Environment Variable Caching Issue

**Date:** December 13, 2025  
**Issue:** Expo app still using old environment variable value after updating `.env` file

---

## 🔍 Why This Happens

Expo embeds `EXPO_PUBLIC_*` environment variables **at bundle/build time**, not runtime. This means:

1. When you run `npm start`, Expo reads `.env` and bundles those values into the JavaScript bundle
2. The bundled values are cached in Metro bundler and device/simulator
3. Simply changing `.env` and restarting doesn't always clear the cached bundle

---

## ✅ Solution: Complete Cache Clear and Restart

### Step 1: Stop Expo Completely
1. In your PowerShell terminal where Expo is running, press **Ctrl+C**
2. Wait for it to fully stop (you'll see the cursor return)
3. If it doesn't stop, close the terminal window completely

### Step 2: Clear All Expo/Metro Caches
Run these commands **one at a time** in PowerShell:

```powershell
# Clear Expo cache
npx expo start --clear

# OR if that doesn't work, clear Metro bundler cache manually:
Remove-Item -Recurse -Force $env:TEMP\metro-* -ErrorAction SilentlyContinue
Remove-Item -Recurse -Force $env:TEMP\haste-map-* -ErrorAction SilentlyContinue
```

### Step 3: Clear App Cache on Device/Simulator

**For iOS Simulator:**
```powershell
# Reset iOS Simulator
xcrun simctl erase all
```

**For Android Emulator:**
- In Android Studio: Tools → AVD Manager → Wipe Data
- OR uninstall and reinstall the Expo Go app

**For Physical Device (Expo Go app):**
1. Close Expo Go app completely (swipe it away)
2. Re-open Expo Go app
3. Scan the QR code again

### Step 4: Verify .env File is Correct
Double-check your `.env` file has the production URL:

```powershell
Get-Content .env | Select-String -Pattern "EXPO_PUBLIC"
```

**Expected output:**
```
EXPO_PUBLIC_API_URL=https://api.aperae.com/api
```

If it still shows staging, update it:
```powershell
(Get-Content .env) -replace 'EXPO_PUBLIC_API_URL=https://staging-api.aperae.com/api', 'EXPO_PUBLIC_API_URL=https://api.aperae.com/api' | Set-Content .env
```

### Step 5: Restart Expo Fresh
```powershell
# Make sure you're in the project root
cd C:\Users\ramyy\Production\Aperae

# Start Expo with cache cleared
npx expo start --clear
```

### Step 6: Reload App on Device/Simulator
- Press **`r`** in the Expo terminal to reload
- OR shake device → "Reload"
- OR press Ctrl+R (web)

### Step 7: Verify API URL in Console Logs
When the app makes a request, check the console logs for:

```
LOG  API_BASE_URL: https://api.aperae.com/api
LOG  Making secure request to: https://api.aperae.com/api/recommendations
```

**NOT:**
```
LOG  API_BASE_URL: https://staging-api.aperae.com/api  ❌
```

---

## 🔧 Alternative: Nuclear Option (If Above Doesn't Work)

If the above steps don't work, try the "nuclear option":

```powershell
# 1. Stop Expo completely

# 2. Delete node_modules cache (don't worry, we'll reinstall)
Remove-Item -Recurse -Force node_modules\.cache -ErrorAction SilentlyContinue

# 3. Delete Expo/Metro temp files
Remove-Item -Recurse -Force $env:TEMP\expo-* -ErrorAction SilentlyContinue
Remove-Item -Recurse -Force $env:TEMP\metro-* -ErrorAction SilentlyContinue

# 4. Clear watchman (if installed)
watchman watch-del-all

# 5. Restart Expo
npx expo start --clear
```

---

## 🎯 Quick Reference: Expected Behavior

**Correct (Production API):**
- Console shows: `API_BASE_URL: https://api.aperae.com/api`
- Requests go to: `https://api.aperae.com/api/recommendations`
- Response: Real AI recommendations (white wines for salmon, etc.)
- Response time: 30-60 seconds

**Incorrect (Still using staging):**
- Console shows: `API_BASE_URL: https://staging-api.aperae.com/api`
- Requests go to: `https://staging-api.aperae.com/api/recommendations`
- Response: Fallback mock data (wrong dish, wrong wines)
- Response time: <1 second (instant mock response)

---

## 💡 Prevention Tips

1. **Always use `--clear` flag** when restarting Expo after changing `.env`:
   ```powershell
   npx expo start --clear
   ```

2. **Fully close the app** on your device/simulator before restarting Expo

3. **Check console logs** to verify which API URL is being used

4. **Use production API for final testing** - staging has mock mode enabled by default

---

## ✅ Verification Checklist

After following the steps above:
- [ ] `.env` file shows production URL
- [ ] Expo started with `--clear` flag
- [ ] App reloaded on device/simulator
- [ ] Console logs show: `API_BASE_URL: https://api.aperae.com/api`
- [ ] Test wine recommendation returns real AI results (not fallback)
- [ ] Response time is 30-60 seconds (normal for Claude API)

---

## 📝 Summary

**The Problem:** Expo caches environment variables at bundle time, so changing `.env` requires a full cache clear.

**The Solution:**
1. Stop Expo
2. Clear all caches (`--clear` flag)
3. Restart Expo
4. Reload app on device
5. Verify in console logs

**Pro Tip:** Always use `npx expo start --clear` when changing environment variables!







