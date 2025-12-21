# Mobile Device Connection Fix

**Date:** December 15, 2025

---

## ❌ **THE PROBLEM**

After removing `--tunnel` from npm scripts, the app no longer loads on physical mobile devices because:

1. **Without tunnel mode**, Expo uses LAN mode (local network)
2. **Physical devices can't access `localhost`** - that refers to the device itself, not your computer
3. **API calls are going to `localhost:3001/api`** which the device can't reach

---

## ✅ **THE SOLUTION**

Since you have **deployed APIs** (production and staging), the app should use those instead of localhost. Here are your options:

---

## 🎯 **OPTION 1: Use Production/Staging API (Recommended)**

Configure your `.env` file to use the deployed API:

```env
# Use production API (recommended for testing)
EXPO_PUBLIC_API_URL=https://api.aperae.com/api
EXPO_PUBLIC_ENV=production

# OR use staging API
# EXPO_PUBLIC_API_URL=https://staging-api.aperae.com/api
# EXPO_PUBLIC_ENV=staging
```

**Then restart Expo:**
```bash
npm start
```

**Benefits:**
- ✅ Works on any device (physical or simulator)
- ✅ No network configuration needed
- ✅ Uses real deployed backend
- ✅ No local backend required

---

## 🎯 **OPTION 2: Use Tunnel Mode for Dev Server Only**

If you need to test against a local backend, use tunnel mode for Expo but keep API calls pointing to deployed APIs:

**1. Update `.env` to use deployed API:**
```env
EXPO_PUBLIC_API_URL=https://api.aperae.com/api
```

**2. Use tunnel mode for Expo dev server:**
```bash
npm run start:tunnel
```

**Benefits:**
- ✅ Works on any device
- ✅ Can test local backend if needed
- ⚠️ Requires ngrok (but only for dev server, not API calls)

---

## 🎯 **OPTION 3: Use Local IP Address (Advanced)**

If you're running a local backend and want to test it:

**1. Find your computer's local IP address:**
```bash
# Windows
ipconfig
# Look for IPv4 Address (e.g., 192.168.1.100)

# macOS/Linux
ifconfig
# Look for inet address (e.g., 192.168.1.100)
```

**2. Update `.env`:**
```env
EXPO_PUBLIC_API_URL=http://192.168.1.100:3001/api
# Replace 192.168.1.100 with your actual IP
```

**3. Ensure device and computer are on same WiFi**

**4. Start Expo:**
```bash
npm start
```

**Limitations:**
- ⚠️ Requires local backend running
- ⚠️ Device and computer must be on same network
- ⚠️ IP address may change

---

## 🔍 **QUICK DIAGNOSIS**

**Check what API URL your app is using:**

1. Open the app
2. Check console logs for API calls
3. Look for the base URL being used

**Common issues:**
- `localhost:3001/api` → Won't work on physical device
- `192.168.x.x:3001/api` → Works if on same network
- `https://api.aperae.com/api` → Works everywhere ✅

---

## ✅ **RECOMMENDED FIX**

**For most users, use Option 1:**

1. **Update `.env` file:**
```env
EXPO_PUBLIC_API_URL=https://api.aperae.com/api
EXPO_PUBLIC_ENV=production
```

2. **Restart Expo:**
```bash
npm start
```

3. **Scan QR code or connect via Expo Go**

The app will now connect to your deployed API, which works on any device!

---

## 📝 **WHY THIS HAPPENS**

- **Tunnel mode (`--tunnel`)**: Creates a public URL via ngrok, works anywhere
- **LAN mode (default)**: Uses local network, requires same WiFi
- **`localhost`**: Only works on simulators/emulators, not physical devices

Since you have deployed APIs, you don't need localhost - use the deployed URLs!

---

## 🎉 **SUMMARY**

**Quick fix:** Set `EXPO_PUBLIC_API_URL=https://api.aperae.com/api` in `.env` and restart Expo.

This will make the app work on any device, anywhere! 🚀





