# Frontend .env File Setup

## ✅ Your ngrok URL is CORRECT!

Using `https://d0f47c1f704c.ngrok-free.app` is perfect for mobile development. It allows your mobile device/emulator to reach your local backend.

## 📁 File Location Matters!

- ❌ **Wrong**: `backend/.env` (this is for backend only)
- ✅ **Correct**: `.env` in project root (for frontend)

## 🔧 Create Frontend .env File

Create a file named `.env` in the **project root** (`C:\Users\ramyy\Production\Aperae\.env`) with:

```
EXPO_PUBLIC_API_URL=https://d0f47c1f704c.ngrok-free.app
```

## ⚠️ Important Checks:

### 1. Verify ngrok tunnel is running
Make sure ngrok is running and pointing to localhost:3001:
```bash
ngrok http 3001
```

The URL should match: `https://d0f47c1f704c.ngrok-free.app`

### 2. Verify backend is accessible via ngrok
Test in browser or terminal:
```
https://d0f47c1f704c.ngrok-free.app/api/health
```

Should return JSON with server status.

### 3. Restart frontend after creating .env
After creating/updating `.env`, restart your Expo app:
```bash
npm start
```

## ✅ How It Works:

1. Frontend reads `EXPO_PUBLIC_API_URL` from root `.env`
2. Calls `getApiBaseUrl()` which returns: `https://d0f47c1f704c.ngrok-free.app/api`
3. OCR service uses this URL to call: `https://d0f47c1f704c.ngrok-free.app/api/ocr/extract-text`

## 🧪 Test After Setup:

1. Create `.env` file in root
2. Restart frontend
3. Test OCR from menu screen
4. Check console logs - should show ngrok URL



