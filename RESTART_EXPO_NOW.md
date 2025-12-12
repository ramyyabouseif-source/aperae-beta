# 🔄 Restart Expo to Use Localhost

Your `.env` file has been updated! The ngrok URL is now commented out.

## ✅ What Was Changed

Your `.env` file now has:
```env
# EXPO_PUBLIC_API_URL=https://7e244d03ed74.ngrok-free.app
```

This means the app will automatically use `http://localhost:3001/api`.

## 🚀 Next Steps: Restart Expo

### Step 1: Stop Expo (If Running)

1. **Find the terminal window** where Expo is running
2. **Click in that terminal window**
3. **Press `Ctrl + C`** to stop Expo
4. **Wait for it to stop** (you'll see "Expo stopped" or similar)

### Step 2: Restart Expo with Cache Clear

**In the same terminal, run:**

```powershell
npx expo start --clear
```

**The `--clear` flag is important!** It ensures:
- Old environment variables are cleared
- New configuration is loaded
- Cache is refreshed

### Step 3: Wait for Expo to Start

You should see:
```
› Metro waiting on exp://...
› Scan the QR code above with Expo Go
```

### Step 4: Reload Your App

**If using iOS Simulator:**
- Press `Cmd + R` to reload

**If using Android Emulator:**
- Press `R` twice quickly

**If using physical device:**
- Shake device → "Reload"

### Step 5: Test and Verify

1. **Make a wine recommendation request** in the app
2. **Check the Expo terminal logs**
3. **Look for:**
   ```
   LOG  API_BASE_URL: http://localhost:3001/api
   ```
   
   **NOT:**
   ```
   LOG  API_BASE_URL: https://xxxx.ngrok-free.app/api
   ```

## ⚠️ Important: Backend Must Be Running

Before testing, make sure your backend is running:

1. **Open a separate terminal**
2. **Navigate to backend:**
   ```powershell
   cd C:\Users\ramyy\Production\Aperae\backend
   ```
3. **Start the backend:**
   ```powershell
   npm start
   ```
4. **Wait for:**
   ```
   PocketSomm Backend started
   Health check: http://localhost:3001/api/health
   ```
5. **Keep this terminal open** - don't close it!

## ✅ Success Indicators

After restarting, you should see:

✅ **No ngrok warning messages**
✅ **API_BASE_URL shows `http://localhost:3001/api`**
✅ **No 404 or 503 errors**
✅ **API calls complete successfully**

## 🐛 If You Still See Ngrok URL

If after restarting you still see the ngrok URL:

1. **Double-check `.env` file:**
   ```powershell
   Get-Content .env
   ```
   Should show: `# EXPO_PUBLIC_API_URL=...` (with # at the start)

2. **Make sure you used `--clear` flag:**
   ```powershell
   npx expo start --clear
   ```

3. **Check for other .env files:**
   - `.env.local`
   - `.env.development`
   - These might override the main `.env`

4. **Fully quit and restart:**
   - Close Expo completely
   - Close terminal
   - Open new terminal
   - Run `npx expo start --clear` again

---

**Ready?** Go ahead and restart Expo now! 🚀
