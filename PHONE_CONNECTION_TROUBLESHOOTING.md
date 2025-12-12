# 🔍 Phone Connection Troubleshooting Guide

## Problem Analysis

**Symptoms:**
- ✅ Backend accessible from PC: `http://192.168.1.152:3001` works from computer
- ❌ Requests from phone timing out after 75-98 seconds
- ❌ OCR requests failing
- ❌ API recommendation requests failing

**Root Cause:** Network connectivity issue - phone cannot reach the backend on the local network.

---

## ✅ What's Working

1. **Backend is running** ✅
   - Health endpoint returns 200 OK
   - Mock mode: false
   - OpenAI and Google Vision configured

2. **Security fix applied** ✅
   - Certificate pinning allows HTTP for local IPs
   - Logs show: "Allowing local development URL"

3. **Correct URL in use** ✅
   - App using: `http://192.168.1.152:3001/api`

---

## ❌ The Problem

**Network timeout:** Phone cannot reach `192.168.1.152:3001` even though:
- Backend is running
- Backend listens on `0.0.0.0` (all interfaces)
- PC can connect to backend
- Security is not blocking requests

**This is a network-level issue, not a code issue.**

---

## 🔧 Troubleshooting Steps

### Step 1: Verify Phone is on Same WiFi

**Check on phone:**
1. Settings → WiFi
2. Confirm you're connected to the **exact same network** as your computer
3. **NOT** on a guest network (guest networks are isolated)

**Common mistake:** Phone on "YourWiFi-Guest" while computer on "YourWiFi"

---

### Step 2: Test from Phone Browser

**On your phone's web browser:**
1. Open Safari (iOS) or Chrome (Android)
2. Navigate to: `http://192.168.1.152:3001/api/health`
3. **Expected:** You should see JSON response like:
   ```json
   {"status":"healthy","errorRate":0,...}
   ```
4. **If you get:** "Safari can't connect" or "ERR_CONNECTION_TIMED_OUT"
   - This confirms network connectivity issue
   - Proceed to Step 3

---

### Step 3: Check Router Settings

**Router may be blocking device-to-device communication:**

1. **AP Isolation / Client Isolation:**
   - Some routers have "AP Isolation" or "Client Isolation" enabled
   - This prevents devices on the same WiFi from communicating
   - **Solution:** Disable this feature in router settings

2. **Where to find:**
   - Log into router admin panel (usually `192.168.1.1` or `192.168.0.1`)
   - Look for: "Wireless Settings" → "AP Isolation" or "Client Isolation"
   - **Disable it**

3. **Guest Network:**
   - Guest networks often have isolation enabled by default
   - **Solution:** Use the main WiFi network, not guest

---

### Step 4: Check Windows Firewall (If Step 2 Failed)

**If phone browser also can't connect:**

1. **Allow Node.js through firewall:**
   ```powershell
   # Run PowerShell as Administrator
   New-NetFirewallRule -DisplayName "Node.js Backend Port 3001" -Direction Inbound -LocalPort 3001 -Protocol TCP -Action Allow
   ```

2. **Or manually:**
   - Windows Defender Firewall → "Allow an app through firewall"
   - Find "Node.js" and enable for Private networks
   - Or create new rule for port 3001

---

### Step 5: Verify IP Address

**Make sure IP hasn't changed:**

1. **Check current IP:**
   ```powershell
   ipconfig | findstr /i IPv4
   ```

2. **If IP changed, update .env:**
   ```powershell
   powershell -ExecutionPolicy Bypass -File scripts/update-api-url.ps1
   ```

3. **Restart Expo**

---

## 🧪 Diagnostic Test Script

Run this to check connectivity:
```powershell
powershell -ExecutionPolicy Bypass -File scripts/test-phone-connection.ps1
```

---

## 📱 Quick Phone Test

**Fastest way to diagnose:**

1. **On phone, open browser**
2. **Type:** `http://192.168.1.152:3001/api/health`
3. **If it works:** The network is fine, issue is with Expo/React Native
4. **If it fails:** Network connectivity issue (router/firewall)

---

## 🔄 Alternative Solutions

### Option 1: Use Expo Tunnel (If WiFi Issues Persist)

Instead of local IP, use Expo's tunnel:
```powershell
npx expo start --tunnel
```

This creates a tunnel that works even if devices can't see each other.

### Option 2: Use ngrok (Temporary)

If local network won't work:
```powershell
ngrok http 3001
```

Update `.env` with ngrok URL and restart Expo.

---

## ✅ Expected Behavior After Fix

**Once network connectivity is fixed:**

1. **Phone browser test works:**
   ```
   http://192.168.1.152:3001/api/health
   → Shows JSON response
   ```

2. **App logs show:**
   ```
   LOG: Allowing local development URL: http://192.168.1.152:3001/api/...
   LOG: OCR response received from backend
   LOG: Secure request successful
   ```

3. **No more timeouts:**
   - Requests complete in < 5 seconds
   - OCR works
   - Recommendations work

---

## 🎯 Most Likely Cause

**90% of the time it's one of these:**

1. **Phone on guest network** (most common)
2. **Router AP Isolation enabled** (very common)
3. **Phone on different WiFi** (less common)
4. **Windows Firewall blocking** (less common)

---

## 📋 Checklist

- [ ] Phone on same WiFi network (not guest)
- [ ] Phone browser can access `http://192.168.1.152:3001/api/health`
- [ ] Router AP Isolation is disabled
- [ ] Windows Firewall allows port 3001
- [ ] IP address matches (run `ipconfig`)
- [ ] Backend is running
- [ ] Expo restarted after any changes

---

Once network connectivity is fixed, everything should work! 🎉


