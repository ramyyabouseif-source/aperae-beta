# Better Alternatives to Changing Ngrok URLs

## The Problem
Ngrok free tier generates a new random URL every time it restarts, requiring constant updates to your `.env` file.

## Solutions (Ranked by Ease)

### ✅ Option 1: Use Local Network IP (Easiest - Free)
**Best for:** Testing on your phone while on the same WiFi network

**How it works:**
- Find your computer's local IP address (e.g., `192.168.1.100`)
- Connect your phone to the same WiFi
- Use your computer's IP instead of ngrok

**Setup:**
1. Find your IP: Run `ipconfig` (Windows) or `ifconfig` (Mac/Linux)
2. Look for "IPv4 Address" - something like `192.168.1.100`
3. Update `.env`:
   ```
   EXPO_PUBLIC_API_URL=http://192.168.1.100:3001
   ```
4. Make sure your backend is accessible on your network:
   - Backend should listen on `0.0.0.0:3001` (not just `localhost`)
   - Windows Firewall might block it - allow Node.js through firewall

**Pros:** Free, same URL every time, fast, no internet needed
**Cons:** Only works on same WiFi, not accessible from outside network

---

### ✅ Option 2: Ngrok Reserved Domain (Paid - $8/month)
**Best for:** Need a static URL that works from anywhere

**How it works:**
- Pay for ngrok to reserve a custom subdomain
- URL stays the same: `https://yourapp.ngrok.io`
- No more updating after restarts!

**Setup:**
1. Sign up for ngrok paid plan ($8/month) at ngrok.com
2. Get your authtoken from dashboard
3. Configure ngrok:
   ```bash
   ngrok config add-authtoken YOUR_AUTHTOKEN
   ```
4. Update `ngrok.yml`:
   ```yaml
   version: "2"
   tunnels:
     backend:
       addr: 3001
       proto: http
       domain: yourapp.ngrok.io  # Your reserved domain
   ```
5. Start ngrok:
   ```bash
   ngrok start backend
   ```
6. Update `.env` once:
   ```
   EXPO_PUBLIC_API_URL=https://yourapp.ngrok.io
   ```

**Pros:** Static URL, works from anywhere, professional
**Cons:** Costs money, requires ngrok account

---

### ✅ Option 3: Cloudflare Tunnel (Free Alternative)
**Best for:** Free static domain alternative

**How it works:**
- Cloudflare Tunnel provides free static domains
- Similar to ngrok but free with static URLs

**Setup:**
1. Install cloudflared: https://developers.cloudflare.com/cloudflare-one/connections/connect-apps/install-and-setup/
2. Run tunnel:
   ```bash
   cloudflared tunnel --url http://localhost:3001
   ```
3. Get the static URL from output
4. Update `.env` with the URL

**Pros:** Free, static URL option available
**Cons:** More complex setup, less popular than ngrok

---

### ✅ Option 4: Use Expo Tunnel (Built-in)
**Best for:** Simple testing, already included with Expo

**How it works:**
- Expo provides its own tunneling service
- Works automatically when you start Expo with `--tunnel` flag

**Setup:**
1. Your package.json already has `--tunnel` flag
2. Start Expo:
   ```bash
   npm start
   ```
3. Expo will show a tunnel URL
4. Update `.env` with Expo tunnel URL (check Expo console)

**Pros:** Already set up, free
**Cons:** URLs can still change, slower than local network

---

### ✅ Option 5: localhost (For Simulators/Emulators Only)
**Best for:** iOS Simulator, Android Emulator, or web testing

**How it works:**
- Simulators run on your computer, so they can use `localhost`
- No network needed!

**Setup:**
1. Update `.env`:
   ```
   EXPO_PUBLIC_API_URL=http://localhost:3001
   ```
2. Test in simulator/emulator

**Pros:** Fastest, simplest, no network needed
**Cons:** Only works in simulators, not real devices

---

## Recommended Solution

**For Development:**
- **iOS Simulator/Android Emulator:** Use `localhost:3001`
- **Real Phone on Same WiFi:** Use local IP (Option 1)
- **Real Phone on Different Network:** Use ngrok reserved domain (Option 2) or Cloudflare Tunnel (Option 3)

**For Production:**
- Deploy to a real server with a static domain (AWS, Heroku, Railway, etc.)

---

## Quick Setup Script

I can create a script that automatically detects your IP and updates the `.env` file. Would you like me to create that?



