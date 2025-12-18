# 🔧 Troubleshooting: Network Request Timeout (75 seconds)

## Current Issue

Your app is correctly using the IP address (`http://192.168.1.198:3001/api`), but requests are timing out after ~75 seconds.

**Error:**
```
ERROR: Network request timed out
ERROR: Attempt Error Time: 75045.59 ms
```

## 🔍 Diagnosis Steps

### Step 1: Check Backend Logs

**Check if the backend is receiving requests:**

1. **Look at your backend terminal** (where you ran `npm start` in the `backend` folder)
2. **Make a wine recommendation request** from the app
3. **Check if you see logs like:**
   ```
   [recommendations] Request started
   Using prompt version: enhanced
   Calling Claude API
   ```

**If you DON'T see these logs:**
- ❌ Backend is not receiving requests
- **Problem:** Network/firewall blocking requests
- **Solution:** See "Firewall Issues" below

**If you DO see these logs:**
- ✅ Backend is receiving requests
- **Problem:** Response is not reaching the device
- **Solution:** See "Response Timeout" below

### Step 2: Test Backend Directly

**From your computer, test the backend:**

1. **Open a browser**
2. **Go to:** `http://192.168.1.198:3001/api/health`
3. **Should see:** JSON response with health status

**If this works:**
- ✅ Backend is accessible from your computer
- **Next:** Test from your iOS device's browser (Safari)

**If this doesn't work:**
- ❌ Backend might not be listening on the network IP
- **Solution:** Check backend configuration

### Step 3: Test from iOS Device Browser

**On your iOS device:**

1. **Open Safari**
2. **Go to:** `http://192.168.1.198:3001/api/health`
3. **Should see:** JSON response

**If this works:**
- ✅ Network connection is fine
- **Problem:** React Native fetch timeout
- **Solution:** See "React Native Timeout Fix" below

**If this doesn't work:**
- ❌ Network/firewall issue
- **Solution:** See "Firewall Issues" below

## 🔥 Common Causes & Solutions

### Cause 1: Windows Firewall Blocking

**Symptoms:**
- Backend receives request but response times out
- Health check works from computer but not device

**Solution:**

1. **Open Windows Defender Firewall:**
   - Press `Win + R`
   - Type: `wf.msc`
   - Press Enter

2. **Allow Node.js through firewall:**
   - Click "Inbound Rules" → "New Rule"
   - Rule Type: "Program"
   - Program: Browse to Node.js executable
     - Usually: `C:\Program Files\nodejs\node.exe`
   - Action: "Allow the connection"
   - Profile: Check all (Domain, Private, Public)
   - Name: "Node.js - Allow Inbound"

3. **Or temporarily disable firewall to test:**
   - Open Windows Security
   - Firewall & network protection
   - Turn off firewall (temporarily for testing only!)

4. **Restart backend** after firewall changes

### Cause 2: React Native Fetch Default Timeout

**Symptoms:**
- Timeout at exactly 75 seconds
- Backend is processing (you see logs)
- Response never reaches device

**Solution:**

React Native's fetch might have a default timeout. We need to use a different approach for long-running requests.

**Option A: Use iOS Simulator (Recommended for Testing)**

If you're testing on a physical device, try using iOS Simulator instead:

1. **Update `.env` to use localhost:**
   ```env
   # EXPO_PUBLIC_API_URL=http://192.168.1.198:3001
   ```
   (Comment out or remove the IP address line)

2. **Restart Expo:**
   ```powershell
   npx expo start --clear
   ```

3. **Use iOS Simulator** (localhost works perfectly)

**Option B: Increase Timeout Further**

The timeout is already 90 seconds, but React Native might have a lower limit. We can try increasing it, but this might not help if it's a React Native limitation.

### Cause 3: Network Router/ISP Timeout

**Symptoms:**
- Timeout at consistent time (e.g., always 75 seconds)
- Works for shorter requests
- Fails for long-running requests

**Solution:**

Some routers or ISPs have connection timeouts. This is harder to fix, but you can:

1. **Check router settings** - Look for "Connection Timeout" or "NAT Timeout"
2. **Use iOS Simulator** - Avoids network timeouts entirely
3. **Use ngrok paid tier** - Has longer timeouts (but costs money)

### Cause 4: Backend Not Responding

**Symptoms:**
- No backend logs when making request
- Health check fails

**Solution:**

1. **Verify backend is running:**
   ```powershell
   cd backend
   npm start
   ```

2. **Check backend is listening on all interfaces:**
   - Backend should bind to `0.0.0.0` or your IP, not just `127.0.0.1`
   - Check `backend/server.js` - should use `PORT` from env (default 3001)

3. **Check for errors in backend logs**

## 🎯 Quick Fix: Use iOS Simulator

**The easiest solution is to use iOS Simulator instead of a physical device:**

1. **Update `.env`:**
   ```env
   # Comment out or remove this line:
   # EXPO_PUBLIC_API_URL=http://192.168.1.198:3001
   ```

2. **Restart Expo:**
   ```powershell
   npx expo start --clear
   ```

3. **Press `i` in Expo terminal** to open iOS Simulator

4. **Test** - Should work perfectly with localhost!

## 🔍 Debugging Checklist

- [ ] Backend is running (`npm start` in backend folder)
- [ ] Backend logs show requests coming in
- [ ] Health check works: `http://192.168.1.198:3001/api/health`
- [ ] Health check works from iOS device browser
- [ ] Windows Firewall allows Node.js
- [ ] Both devices on same WiFi network
- [ ] IP address is correct (check with `ipconfig`)

## 📊 What the Logs Tell Us

**Your current logs show:**
- ✅ App is using correct URL: `http://192.168.1.198:3001/api`
- ✅ Request is being made
- ❌ Timing out at 75 seconds (not 90 seconds)
- ❌ All 3 retry attempts fail

**This suggests:**
- Network-level timeout (not our code timeout)
- Or React Native fetch default timeout
- Or firewall blocking response

## 🚀 Recommended Next Steps

1. **Check backend logs** - Is backend receiving requests?
2. **Test health endpoint** from iOS device browser
3. **Try iOS Simulator** - Use localhost (no network issues)
4. **Check Windows Firewall** - Allow Node.js
5. **Verify same WiFi network** - Both devices must be connected

---

**Last Updated:** 2025-11-27










