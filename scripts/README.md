# Helper Scripts for API URL Management

These scripts help you manage your API URL configuration without manually updating the `.env` file every time.

## Scripts

### 1. `get-my-ip.ps1` - Find Your IP Address
**Purpose:** Quickly displays your local IP address(es) and the recommended API URL.

**Usage:**
```powershell
powershell -ExecutionPolicy Bypass -File scripts/get-my-ip.ps1
```

**What it does:**
- Shows all your network interfaces
- Highlights the recommended IP (192.168.x.x from DHCP)
- Displays the API URL you should use

---

### 2. `update-api-url.ps1` - Auto-Update .env File
**Purpose:** Automatically detects your IP and updates the `.env` file.

**Usage:**
```powershell
powershell -ExecutionPolicy Bypass -File scripts/update-api-url.ps1
```

**What it does:**
- Detects your local IP address automatically
- Updates `EXPO_PUBLIC_API_URL` in your `.env` file
- Creates `.env` file if it doesn't exist
- Shows next steps after updating

**Perfect for:** When your IP changes or you move to a different network.

---

### 3. `verify-backend-connection.ps1` - Test Backend Connection
**Purpose:** Verifies that your backend is accessible from the network.

**Usage:**
```powershell
# Use default IP (192.168.1.152:3001)
powershell -ExecutionPolicy Bypass -File scripts/verify-backend-connection.ps1

# Or specify custom URL
powershell -ExecutionPolicy Bypass -File scripts/verify-backend-connection.ps1 -BackendUrl "http://192.168.1.153:3001"
```

**What it does:**
- Tests if backend health endpoint is reachable
- Provides troubleshooting steps if it fails
- Confirms your phone should be able to connect

---

## Quick Start Workflow

1. **Update your .env file:**
   ```powershell
   powershell -ExecutionPolicy Bypass -File scripts/update-api-url.ps1
   ```

2. **Start your backend:**
   ```powershell
   cd backend
   npm start
   ```

3. **Verify connection:**
   ```powershell
   powershell -ExecutionPolicy Bypass -File scripts/verify-backend-connection.ps1
   ```

4. **Restart Expo app** (to load new environment variable)

---

## Current Configuration

- **Your IP:** `192.168.1.152`
- **Backend Port:** `3001`
- **API URL:** `http://192.168.1.152:3001`
- **Backend Listens On:** `0.0.0.0` (all network interfaces) ✅

---

## Troubleshooting

### Backend not accessible?
1. Make sure backend is running: `cd backend && npm start`
2. Check Windows Firewall isn't blocking port 3001
3. Verify backend listens on `0.0.0.0` (already configured ✅)
4. Ensure you're on the same WiFi network

### IP changed?
Just run `update-api-url.ps1` again - it will update automatically!

### Phone can't connect?
- Make sure phone is on the same WiFi
- Restart Expo app after updating `.env`
- Check firewall settings on your computer



