# Expo Tunnel Error Fix

**Error:** `http response error 404: the endpoint ldkk1ug-anonymous-8081.exp.direct is offline`

**Cause:** Expo is trying to use an expired/offline tunnel URL. This happens when:
- Expo auto-detects tunnel mode is needed
- An old tunnel URL is cached
- The tunnel connection has expired

---

## ✅ **QUICK FIX**

### **Step 1: Clear Expo Cache**
```bash
# Clear Expo cache
npx expo start --clear

# Or if that doesn't work
npx expo start -c
```

### **Step 2: Force LAN Mode (Not Tunnel)**
```bash
# Explicitly use LAN mode
npx expo start --lan
```

### **Step 3: If Still Using Tunnel, Disable It**
```bash
# Disable tunnel mode explicitly
npx expo start --no-tunnel
```

---

## 🔧 **PERMANENT FIX**

Update your `package.json` to explicitly disable tunnel:

```json
"start": "expo start --lan --no-tunnel"
```

This ensures Expo always uses LAN mode and never tries tunnel.

---

## 📱 **FOR PHYSICAL DEVICES**

Since you're using the production API (`https://api.aperae.com/api`), the device connection method doesn't matter for API calls. However, Expo still needs to load the JavaScript bundle.

**Options:**

1. **Use LAN mode** (device and computer on same WiFi):
   ```bash
   npx expo start --lan
   ```

2. **Use tunnel mode** (if LAN doesn't work):
   ```bash
   npx expo start --tunnel
   ```
   Note: This uses Expo's tunnel service, not ngrok.

---

## 🎯 **RECOMMENDED SOLUTION**

Since your API is already set to production (`EXPO_PUBLIC_API_URL=https://api.aperae.com/api`), you just need Expo to load the app bundle.

**Try this:**
```bash
# Clear cache and start with LAN
npx expo start --clear --lan
```

Then scan the QR code or connect via Expo Go.

---

## 🔍 **WHY THIS HAPPENS**

- Expo sometimes auto-detects tunnel mode
- Old tunnel URLs get cached
- Tunnel connections expire after inactivity
- The error is about the **Expo dev server connection**, not your API

---

## ✅ **VERIFY IT'S WORKING**

After starting Expo, you should see:
- ✅ LAN URL: `exp://192.168.x.x:8081` (your local IP)
- ✅ QR code to scan
- ✅ No tunnel URL errors

The app will then connect to `https://api.aperae.com/api` for all API calls.



