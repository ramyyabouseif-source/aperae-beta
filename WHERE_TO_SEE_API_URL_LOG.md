# 📍 Where to See the API_BASE_URL Log

This guide shows you exactly where to look for the `API_BASE_URL` log message to verify you're using localhost.

---

## 🎯 What You're Looking For

You want to see this in your logs:
```
LOG  API_BASE_URL: http://localhost:3001/api
```

**NOT this:**
```
LOG  API_BASE_URL: https://xxxx.ngrok-free.app/api
```

---

## 📱 Where to See It: Expo/Metro Terminal

### Step 1: Find Your Expo Terminal Window

When you run `npx expo start`, you'll see a terminal window with output like:

```
› Metro waiting on exp://192.168.x.x:8081
› Scan the QR code above with Expo Go
```

**This is the terminal window where you'll see the logs.**

### Step 2: Trigger the Log

The `API_BASE_URL` log appears when you make a wine recommendation request. Here's how:

1. **Open your app** (iOS Simulator, Android Emulator, or physical device)
2. **Navigate to the home screen**
3. **Enter a dish** (e.g., "Grilled Salmon")
4. **Tap "Get Wine Recommendations"**

### Step 3: Look at the Terminal

**Immediately after tapping the button**, scroll up in the Expo terminal and look for:

```
LOG  === API ATTEMPT 1/3 ===
LOG  Attempt Start Time: 2025-11-27T...
LOG  API_BASE_URL: http://localhost:3001/api          ← HERE!
LOG  Making secure request to: http://localhost:3001/api/recommendations
```

---

## 🔍 Visual Guide

### What the Terminal Looks Like:

```
┌─────────────────────────────────────────────────────────┐
│ Expo Terminal Window                                     │
├─────────────────────────────────────────────────────────┤
│                                                          │
│ › Metro waiting on exp://192.168.1.100:8081            │
│ › Scan the QR code above with Expo Go                   │
│                                                          │
│ LOG  === WINE RECOMMENDATION REQUEST START ===          │
│ LOG  Dish: Grilled Salmon                               │
│ LOG  === API ATTEMPT 1/3 ===                            │
│ LOG  Attempt Start Time: 2025-11-27T12:00:00.000Z      │
│ LOG  API_BASE_URL: http://localhost:3001/api  ← LOOK HERE│
│ LOG  Making secure request to: http://localhost:3001/...│
│                                                          │
└─────────────────────────────────────────────────────────┘
```

---

## 📋 Step-by-Step: How to See It

### Method 1: Watch the Terminal While Testing

1. **Open Expo terminal** (where you ran `npx expo start`)
2. **Keep it visible** on your screen
3. **Open your app** in simulator/emulator
4. **Request a wine recommendation**
5. **Watch the terminal** - logs appear in real-time

### Method 2: Scroll Up After Testing

1. **Make a wine recommendation request** in the app
2. **Go back to the Expo terminal**
3. **Scroll up** to see previous logs
4. **Look for** `API_BASE_URL:` in the logs

---

## 🖥️ Alternative: React Native Debugger

If you're using React Native Debugger or Chrome DevTools:

### Chrome DevTools (Web)

1. **Open your app in web browser**
2. **Press F12** to open DevTools
3. **Click "Console" tab**
4. **Make a wine recommendation**
5. **Look for** `API_BASE_URL:` in the console

### React Native Debugger

1. **Open React Native Debugger**
2. **Make a wine recommendation** in your app
3. **Check the Console tab** in the debugger
4. **Look for** `API_BASE_URL:` in the logs

---

## 📱 On Physical Device

If you're testing on a physical device:

### Option 1: Expo Go App Logs

1. **Shake your device** (or press `Cmd+D` on iOS / `Cmd+M` on Android)
2. **Select "Debug Remote JS"**
3. **Open Chrome DevTools** (should open automatically)
4. **Check Console tab** for logs

### Option 2: Terminal Logs

The logs still appear in your **Expo terminal** on your computer, even when testing on a physical device.

---

## 🔍 What If You Don't See It?

### Problem: No logs appearing

**Possible causes:**
1. **App not making the request** - Check if the button is working
2. **Logs are being filtered** - Check terminal filter settings
3. **Different terminal window** - Make sure you're looking at the right terminal

**Solution:**
- Make sure Expo is running
- Try the request again
- Check all terminal windows

### Problem: See logs but no API_BASE_URL

**Possible causes:**
1. **Request failing before reaching that code**
2. **Logs are truncated** - Scroll up more

**Solution:**
- Look for any error messages before the API_BASE_URL log
- Check if the request is actually being made

### Problem: Still seeing ngrok URL

**Solution:**
1. **Double-check `.env` file** - Make sure `EXPO_PUBLIC_API_URL` is commented/deleted
2. **Restart Expo** with `--clear` flag:
   ```powershell
   npx expo start --clear
   ```
3. **Check for other `.env` files** (`.env.local`, `.env.development`, etc.)
4. **Clear app cache** - Uninstall and reinstall the app

---

## ✅ Quick Verification Checklist

- [ ] Expo terminal is open and visible
- [ ] Made a wine recommendation request in the app
- [ ] Scrolled up in the terminal to see logs
- [ ] Found `API_BASE_URL:` in the logs
- [ ] URL shows `http://localhost:3001/api` (not ngrok)

---

## 📸 Example Log Output

Here's what a complete log sequence looks like:

```
LOG  === WINE RECOMMENDATION REQUEST START ===
LOG  Dish: Grilled Salmon
LOG  Preferences: undefined
LOG  Mock Mode: false
LOG  Start Time: 2025-11-27T12:00:00.000Z
LOG  === API ATTEMPT 1/3 ===
LOG  Attempt Start Time: 2025-11-27T12:00:00.001Z
LOG  API_BASE_URL: http://localhost:3001/api          ← THIS IS WHAT YOU WANT
LOG  Making secure request to: http://localhost:3001/api/recommendations
LOG  Request body: {"dish":"Grilled Salmon","preferences":{}}
LOG  Secure HTTP client initialized
LOG  Allowing local development URL: http://localhost:3001/api/recommendations
LOG  Making secure request to: http://localhost:3001/api/recommendations
```

**Key line to look for:**
```
LOG  API_BASE_URL: http://localhost:3001/api
```

---

## 🎯 Summary

**Where:** Expo/Metro terminal (where you ran `npx expo start`)

**When:** After you tap "Get Wine Recommendations" in the app

**What to look for:** `LOG  API_BASE_URL: http://localhost:3001/api`

**If you see ngrok URL:** Your `.env` file still has the ngrok URL set - go back and remove/comment it out.

---

**Last Updated:** 2025-11-27











