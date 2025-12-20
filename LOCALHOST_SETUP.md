# 🏠 Quick Setup: Using Localhost for Development

This guide helps you quickly switch to localhost for development to avoid ngrok timeout issues.

## ✅ Why Use Localhost?

- ✅ **No timeout limitations** - Works with long-running API calls (55+ seconds)
- ✅ **Faster** - No internet round-trip, direct connection
- ✅ **More reliable** - No connection drops or URL changes
- ✅ **Free** - No service limitations

## 🚀 Quick Start

### Step 1: Remove/Comment Out Ngrok URL

**Edit your `.env` file** (in the project root):

```env
# Comment out or remove this line:
# EXPO_PUBLIC_API_URL=https://xxxx.ngrok-free.app
```

**Or simply delete the line entirely.**

### Step 2: Restart Expo

```bash
# Stop Expo if running (Ctrl+C)
npx expo start --clear
```

### Step 3: Verify Configuration

Check the logs - you should see:
```
LOG: API_BASE_URL: http://localhost:3001/api
```

**Not:**
```
LOG: API_BASE_URL: https://xxxx.ngrok-free.app/api
```

### Step 4: Test

Try getting a wine recommendation - it should work without 503 errors!

## 📱 Platform-Specific Notes

### iOS Simulator
✅ **Works automatically** - `localhost` resolves correctly

### Android Emulator
✅ **Works automatically** - `localhost` resolves correctly

### Web Browser
✅ **Works automatically** - `localhost` resolves correctly

### Physical iOS Device
⚠️ **May need IP address** - See "Using IP Address" below

### Physical Android Device
⚠️ **May need IP address** - See "Using IP Address" below

## 🔧 Using IP Address for Physical Devices

If `localhost` doesn't work on your physical device:

### Step 1: Find Your Computer's IP Address

**Windows:**
```powershell
ipconfig
# Look for "IPv4 Address" under your active network adapter
# Example: 192.168.1.100
```

**Mac/Linux:**
```bash
ifconfig
# Look for "inet" under your active network adapter
# Example: 192.168.1.100
```

### Step 2: Update .env File

```env
EXPO_PUBLIC_API_URL=http://192.168.1.100:3001
# Replace 192.168.1.100 with your actual IP address
```

### Step 3: Update Backend CORS (if needed)

The backend should already allow local network IPs, but if you get CORS errors:

1. Check `backend/server.js` - CORS configuration
2. Ensure your IP address is in the allowed origins

### Step 4: Restart Both Backend and Frontend

```bash
# Backend
cd backend
npm start

# Frontend (in another terminal)
cd ..
npx expo start --clear
```

## ✅ Verification Checklist

- [ ] `.env` file has no `EXPO_PUBLIC_API_URL` (or it's commented out)
- [ ] Backend is running on `http://localhost:3001`
- [ ] Frontend logs show `http://localhost:3001/api` (or your IP)
- [ ] No 503 errors when testing recommendations
- [ ] API calls complete successfully (55-60 seconds for Claude)

## 🔄 Switching Back to Ngrok

If you need to use ngrok again (e.g., for remote testing):

1. **Start ngrok:**
   ```bash
   ngrok http 3001
   ```

2. **Update `.env`:**
   ```env
   EXPO_PUBLIC_API_URL=https://xxxx.ngrok-free.app
   ```

3. **Restart Expo:**
   ```bash
   npx expo start --clear
   ```

**Note:** Remember that ngrok free tier has a 30-second timeout limitation.

## 🐛 Troubleshooting

### "Network request failed"

**Problem:** Frontend can't reach backend

**Solutions:**
1. Ensure backend is running: `cd backend && npm start`
2. Check backend is on port 3001
3. For physical devices, try using IP address instead of localhost
4. Ensure device and computer are on the same WiFi network

### "CORS error"

**Problem:** Backend is blocking the request

**Solutions:**
1. Check `backend/server.js` CORS configuration
2. Ensure your origin (localhost or IP) is allowed
3. Restart backend after CORS changes

### Still Getting 503 Errors

**Problem:** Still using ngrok or timeout issue

**Solutions:**
1. Double-check `.env` file - ensure `EXPO_PUBLIC_API_URL` is removed/commented
2. Clear Expo cache: `npx expo start --clear`
3. Restart both backend and frontend
4. Check logs to verify which URL is being used

## 📚 Related Documentation

- [NGROK_TIMEOUT_LIMITATION.md](./NGROK_TIMEOUT_LIMITATION.md) - Detailed explanation of timeout issue
- [NGROK_SETUP_GUIDE.md](./NGROK_SETUP_GUIDE.md) - General ngrok setup (with timeout warning)

---

**Last Updated:** 2025-11-27  
**Status:** Recommended setup for local development











