# Ngrok Setup for OCR Backend

## Issue: Ngrok Tunnel is Offline

The ngrok URL `d0f47c1f704c.ngrok-free.app` is not active. You need to start ngrok and get a new URL.

## Solution:

### Step 1: Start ngrok tunnel
In a new terminal window, run:
```bash
ngrok http 3001
```

This will create a tunnel from ngrok to your localhost:3001 backend.

### Step 2: Get the new ngrok URL
After starting ngrok, you'll see output like:
```
Forwarding   https://xxxx-xxxx-xxxx-xxxx-xxxx.ngrok-free.app -> http://localhost:3001
```

Copy the `https://` URL (the one ending in `.ngrok-free.app`).

### Step 3: Update .env file
Update the `.env` file in the project root with the new URL:
```
EXPO_PUBLIC_API_URL=https://your-new-ngrok-url.ngrok-free.app
```

### Step 4: Restart frontend
After updating `.env`, restart your Expo app:
```bash
npm start
```

## Alternative: Use ngrok with Fixed Domain (Paid)

If you have a paid ngrok account, you can use a fixed domain so the URL doesn't change:
```bash
ngrok http 3001 --domain=your-fixed-domain.ngrok-free.app
```

## Test ngrok is working:

1. Start ngrok: `ngrok http 3001`
2. Test the health endpoint: Open `https://your-ngrok-url.ngrok-free.app/api/health` in browser
3. Should return JSON with backend status

## Important Notes:

- **Free ngrok URLs change each time** you restart ngrok
- You'll need to update `.env` each time unless you use a fixed domain
- Keep ngrok running while testing the app
- If ngrok stops, the frontend won't be able to reach the backend



