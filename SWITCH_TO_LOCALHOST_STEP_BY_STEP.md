# 📋 Step-by-Step Guide: Switching to Localhost

This guide will walk you through switching from ngrok to localhost for development, step by step.

---

## 🎯 Goal

Switch your frontend app to use `http://localhost:3001/api` instead of ngrok, which will:
- ✅ Eliminate 503 timeout errors
- ✅ Make API calls faster
- ✅ Work reliably with long-running requests (55+ seconds)

---

## 📝 Prerequisites

Before starting, make sure you have:
- ✅ Backend server running (on port 3001)
- ✅ Frontend project open in your code editor
- ✅ Terminal/command prompt ready

---

## 🔍 Step 1: Locate Your .env File

### What to do:
Find the `.env` file in your project root directory.

### Where to look:
```
C:\Users\ramyy\Production\Aperae\
├── .env          ← This file
├── backend/
├── src/
└── ...
```

### How to check if it exists:
1. Open File Explorer
2. Navigate to: `C:\Users\ramyy\Production\Aperae`
3. Look for a file named `.env` (it might be hidden - enable "Show hidden files")

### If .env doesn't exist:
- Create a new file named `.env` in the project root
- You can use Notepad or any text editor

---

## ✏️ Step 2: Check Current Configuration

### What to do:
Open the `.env` file and check if it contains `EXPO_PUBLIC_API_URL`.

### How to open:
- **Option A:** Right-click `.env` → Open with → Notepad
- **Option B:** Open in your code editor (VS Code, etc.)

### What you might see:

**If using ngrok:**
```env
EXPO_PUBLIC_API_URL=https://7e244d03ed74.ngrok-free.app
```

**If already using localhost:**
```env
EXPO_PUBLIC_API_URL=http://localhost:3001
```

**If file is empty or doesn't have this line:**
- That's fine! The app will use localhost automatically.

---

## 🗑️ Step 3: Remove or Comment Out the Ngrok URL

### What to do:
Remove or comment out the `EXPO_PUBLIC_API_URL` line that points to ngrok.

### Option A: Comment it out (Recommended - keeps it for reference)

**Change this:**
```env
EXPO_PUBLIC_API_URL=https://7e244d03ed74.ngrok-free.app
```

**To this:**
```env
# EXPO_PUBLIC_API_URL=https://7e244d03ed74.ngrok-free.app
```

**How:**
1. Add `#` at the beginning of the line
2. Save the file (Ctrl+S)

### Option B: Delete the line entirely

**Simply delete this line:**
```env
EXPO_PUBLIC_API_URL=https://7e244d03ed74.ngrok-free.app
```

**How:**
1. Select the entire line
2. Press Delete
3. Save the file (Ctrl+S)

### ✅ What your .env should look like after:

**Option 1: Commented out**
```env
# EXPO_PUBLIC_API_URL=https://7e244d03ed74.ngrok-free.app
```

**Option 2: Deleted (file might be empty or have other variables)**
```env
# File is empty or only has other variables
```

**Option 3: Already set to localhost (you can keep this or remove it)**
```env
EXPO_PUBLIC_API_URL=http://localhost:3001
```

---

## 🛑 Step 4: Stop Expo (If Running)

### What to do:
If Expo is currently running, stop it first.

### How to check if Expo is running:
- Look at your terminal/command prompt
- If you see something like:
  ```
  › Metro waiting on exp://192.168.x.x:8081
  › Scan the QR code above with Expo Go
  ```
  Then Expo is running.

### How to stop:
1. Click in the terminal window where Expo is running
2. Press `Ctrl + C`
3. Wait for it to stop (you might see "Expo stopped")

### If Expo is not running:
- Skip to Step 5

---

## 🚀 Step 5: Start Backend Server (If Not Running)

### What to do:
Make sure your backend server is running on port 3001.

### How to check if backend is running:
1. Open a browser
2. Go to: `http://localhost:3001/api/health`
3. If you see a JSON response, backend is running ✅
4. If you get "This site can't be reached", backend is not running ❌

### How to start backend:

**Open a new terminal/command prompt:**

1. **Navigate to backend directory:**
   ```powershell
   cd C:\Users\ramyy\Production\Aperae\backend
   ```

2. **Start the server:**
   ```powershell
   npm start
   ```

3. **Wait for confirmation:**
   You should see:
   ```
   PocketSomm Backend started
   Health check: http://localhost:3001/api/health
   ```

4. **Keep this terminal open** - don't close it!

### If backend is already running:
- Skip to Step 6

---

## 🔄 Step 6: Clear Expo Cache and Restart

### What to do:
Clear Expo's cache and restart it to pick up the new configuration.

### How to do it:

**Open a terminal/command prompt:**

1. **Navigate to project root:**
   ```powershell
   cd C:\Users\ramyy\Production\Aperae
   ```

2. **Clear cache and start Expo:**
   ```powershell
   npx expo start --clear
   ```

3. **Wait for Expo to start:**
   You should see:
   ```
   › Metro waiting on exp://...
   › Scan the QR code above with Expo Go
   ```

### What `--clear` does:
- Clears Expo's cache
- Ensures new environment variables are loaded
- Prevents using old cached configuration

---

## ✅ Step 7: Verify Configuration

### What to do:
Check that the app is now using localhost instead of ngrok.

### How to verify:

**Method 1: Check Expo logs**

Look at the terminal where Expo is running. You should see logs like:
```
LOG: API_BASE_URL: http://localhost:3001/api
```

**NOT:**
```
LOG: API_BASE_URL: https://xxxx.ngrok-free.app/api
```

**Method 2: Check app logs (after loading)**

1. Open your app (iOS Simulator, Android Emulator, or physical device)
2. Try to get a wine recommendation
3. Look at the Expo terminal logs
4. You should see:
   ```
   LOG: Making secure request to: http://localhost:3001/api/recommendations
   ```

**Method 3: Check network requests**

1. Open React Native Debugger or Chrome DevTools
2. Look at Network tab
3. API requests should go to `localhost:3001`

---

## 🧪 Step 8: Test the Connection

### What to do:
Test that the app can successfully connect to the backend.

### How to test:

**Option A: Test with a wine recommendation**

1. **Open the app**
2. **Enter a dish** (e.g., "Grilled Salmon")
3. **Tap "Get Wine Recommendations"**
4. **Wait for response** (should take 55-60 seconds)
5. **Check for errors:**
   - ✅ **Success:** You see wine recommendations
   - ❌ **Failure:** You see error messages

**Option B: Test health endpoint**

1. **Open a browser**
2. **Go to:** `http://localhost:3001/api/health`
3. **Should see:** JSON response with status information

---

## 🐛 Troubleshooting

### Problem: Still seeing ngrok URL in logs

**Solution:**
1. Double-check `.env` file - make sure the line is commented or deleted
2. Make sure you saved the `.env` file
3. Restart Expo with `--clear` flag again
4. Check if there's a `.env.local` or other env file overriding it

### Problem: "Network request failed" error

**Possible causes and solutions:**

**Cause 1: Backend not running**
- ✅ Solution: Start backend (see Step 5)

**Cause 2: Backend on wrong port**
- ✅ Solution: Check backend is on port 3001
- Check `backend/.env` file for `PORT=3001`

**Cause 3: Firewall blocking connection**
- ✅ Solution: Allow Node.js through Windows Firewall
- Or temporarily disable firewall to test

**Cause 4: Using physical device (not simulator)**
- ✅ Solution: Use your computer's IP address instead
- See "For Physical Devices" section below

### Problem: CORS errors

**Solution:**
1. Check `backend/server.js` - CORS should allow localhost
2. Restart backend after any CORS changes
3. Clear browser cache if testing on web

### Problem: Still getting 503 errors

**Solution:**
1. Verify you're using localhost (check logs)
2. Make sure backend timeout is set correctly (60 seconds)
3. Check backend logs for actual errors

---

## 📱 For Physical Devices (iOS/Android)

If you're testing on a **physical device** (not simulator), `localhost` won't work because the device can't reach your computer's localhost.

### Solution: Use Your Computer's IP Address

**Step 1: Find Your IP Address**

**Windows:**
1. Open Command Prompt or PowerShell
2. Type: `ipconfig`
3. Look for "IPv4 Address" under your active network adapter
4. Example: `192.168.1.100`

**Mac:**
1. Open Terminal
2. Type: `ifconfig | grep "inet "`
3. Look for your local network IP (usually starts with 192.168 or 10.0)
4. Example: `192.168.1.100`

**Step 2: Update .env File**

```env
EXPO_PUBLIC_API_URL=http://192.168.1.100:3001
```

Replace `192.168.1.100` with your actual IP address.

**Step 3: Ensure Device and Computer Are on Same WiFi**

- Both must be on the same WiFi network
- Check WiFi network name matches

**Step 4: Restart Expo**

```powershell
npx expo start --clear
```

**Step 5: Test**

Try the app again - it should now connect using your IP address.

---

## ✅ Success Checklist

After completing all steps, verify:

- [ ] `.env` file has no active `EXPO_PUBLIC_API_URL` pointing to ngrok
- [ ] Backend is running on `http://localhost:3001`
- [ ] Expo logs show `http://localhost:3001/api` (or your IP)
- [ ] App can successfully make API calls
- [ ] No 503 errors when testing recommendations
- [ ] Wine recommendations complete successfully (55-60 seconds)

---

## 🔄 Switching Back to Ngrok (If Needed)

If you need to switch back to ngrok later:

**Step 1:** Start ngrok:
```powershell
ngrok http 3001
```

**Step 2:** Copy the HTTPS URL (e.g., `https://xxxx.ngrok-free.app`)

**Step 3:** Update `.env`:
```env
EXPO_PUBLIC_API_URL=https://xxxx.ngrok-free.app
```

**Step 4:** Restart Expo:
```powershell
npx expo start --clear
```

**Remember:** ngrok free tier has a 30-second timeout limitation.

---

## 📚 Related Documentation

- [NGROK_TIMEOUT_LIMITATION.md](./NGROK_TIMEOUT_LIMITATION.md) - Why we're switching
- [LOCALHOST_SETUP.md](./LOCALHOST_SETUP.md) - Alternative quick guide
- [NGROK_SETUP_GUIDE.md](./NGROK_SETUP_GUIDE.md) - Ngrok setup (with warnings)

---

## 💡 Quick Reference

**To switch to localhost:**
1. Comment/delete `EXPO_PUBLIC_API_URL` in `.env`
2. Restart Expo: `npx expo start --clear`
3. Verify logs show `localhost:3001`

**To switch back to ngrok:**
1. Set `EXPO_PUBLIC_API_URL=https://xxxx.ngrok-free.app` in `.env`
2. Restart Expo: `npx expo start --clear`

---

**Last Updated:** 2025-11-27  
**Status:** Complete step-by-step guide








