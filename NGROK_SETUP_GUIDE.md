# 🔄 Using Ngrok as Temporary Solution

This guide helps you quickly switch to ngrok for development while network issues are resolved.

---

## ⚡ Quick Start

### 1. Start Ngrok

**In a new terminal window:**
```powershell
cd C:\Users\ramyy\Production\Aperae\backend
ngrok http 3001
```

**Or if ngrok is in PATH:**
```powershell
ngrok http 3001
```

**Leave this terminal open** - ngrok will keep running.

### 2. Update .env File (Automated)

**In another terminal:**
```powershell
cd C:\Users\ramyy\Production\Aperae
powershell -ExecutionPolicy Bypass -File scripts/update-to-ngrok.ps1
```

This script automatically:
- Detects your current ngrok URL
- Updates `.env` file with the new URL
- Shows you what was updated

### 3. Restart Expo

```powershell
# Stop Expo (Ctrl+C if running)
npx expo start --clear
```

### 4. Reload App on Phone

Shake device → "Reload"

---

## 🔄 When Ngrok Restarts (URL Changes)

**Every time you restart ngrok, the URL changes. To update:**

1. **Ngrok is already running** (in first terminal)
2. **Run the update script again:**
   ```powershell
   powershell -ExecutionPolicy Bypass -File scripts/update-to-ngrok.ps1
   ```
3. **Restart Expo:**
   ```powershell
   npx expo start --clear
   ```

**That's it!** The script automatically detects the new URL.

---

## 📋 Manual Method (If Script Fails)

If the automated script doesn't work:

1. **Get ngrok URL:**
   - Visit: http://localhost:4040
   - Copy the HTTPS URL (e.g., `https://abc123.ngrok-free.app`)

2. **Update .env file:**
   ```
   EXPO_PUBLIC_API_URL=https://abc123.ngrok-free.app
   ```
   (No `/api` at the end - it's added automatically)

3. **Restart Expo**

---

## 🔀 Switching Back to Local IP

When network issues are fixed or for production:

```powershell
powershell -ExecutionPolicy Bypass -File scripts/switch-to-local-ip.ps1
npx expo start --clear
```

---

## ⚙️ Scripts Available

| Script | Purpose |
|--------|---------|
| `scripts/update-to-ngrok.ps1` | Auto-detect and update ngrok URL |
| `scripts/switch-to-local-ip.ps1` | Switch back to local IP |
| `scripts/get-ngrok-url.ps1` | Just get the ngrok URL (helper) |

---

## ✅ Advantages of Ngrok

- ✅ Works regardless of network configuration
- ✅ Works from anywhere (phone doesn't need to be on same WiFi)
- ✅ No router/firewall configuration needed
- ✅ Simple to set up

---

## ⚠️ Disadvantages

- ❌ URL changes every time ngrok restarts
- ❌ Requires internet connection
- ❌ Slower than local network (goes through internet)
- ❌ **Free tier has 30-second request timeout** - causes 503 errors for long API calls
  - Our Claude API calls take 55+ seconds
  - **See NGROK_TIMEOUT_LIMITATION.md for details and solutions**

## ⚠️ IMPORTANT: Timeout Limitation

**ngrok free tier has a hard 30-second request timeout.**

Our wine recommendation API uses Claude Sonnet 4.5, which takes **55-60 seconds** to generate recommendations. This exceeds ngrok's timeout, causing:

- HTTP 503 errors
- Failed API requests
- Fallback to mock data

**Solutions:**
1. ✅ **Use localhost for development** (recommended - no timeouts)
2. ✅ **Upgrade to ngrok paid tier** ($8+/month - 5-minute timeout)
3. ✅ **Use your computer's IP address** (for physical devices on same WiFi)

**For details, see:** [NGROK_TIMEOUT_LIMITATION.md](./NGROK_TIMEOUT_LIMITATION.md)

---

## 🎯 Recommendation

**For now (development):** Use ngrok - it's the fastest path to get working.

**For production:** Deploy to a real server with a static domain.

---

## 📱 Testing

After switching to ngrok:

1. **Check logs** - Should show:
   ```
   LOG: OCR endpoint: https://xxxx.ngrok-free.app/api/ocr/extract-text
   LOG: API_BASE_URL: https://xxxx.ngrok-free.app/api
   ```

2. **Test OCR** - Should work immediately (no network issues)

3. **Test Recommendations** - Should work immediately

---

## 🔧 Troubleshooting

### "Could not connect to ngrok API"

**Problem:** Script can't find ngrok running.

**Solution:**
1. Make sure ngrok is running: `ngrok http 3001`
2. Check ngrok web interface: http://localhost:4040
3. If still failing, use manual method above

### "No ngrok tunnels found"

**Problem:** Ngrok is running but no tunnels configured.

**Solution:**
1. Stop ngrok (Ctrl+C)
2. Restart: `ngrok http 3001`
3. Wait 2-3 seconds for tunnel to establish
4. Run update script again

---

## 🚀 Production Deployment

When ready for production, you'll want:

1. **Real domain** (e.g., `api.pocketsomm.com`)
2. **SSL certificate** (Let's Encrypt)
3. **Static IP or domain**
4. **No ngrok dependency**

But for development, ngrok is perfect! 🎉


