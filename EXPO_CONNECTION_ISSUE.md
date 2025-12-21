# Expo Development Server Connection Issue

**Date Identified:** December 15, 2025  
**Status:** Workaround in place, needs permanent fix  
**Priority:** HIGH - Must resolve before production

---

## ❌ **THE PROBLEM**

LAN mode (`expo start --lan`) does not work for connecting mobile devices to the development server. Only tunnel mode (`expo start --tunnel`) successfully connects devices.

**Error when using LAN mode:**
- Devices cannot connect to `exp://192.168.x.x:8081`
- Connection timeouts
- App fails to load

**Current workaround:**
- Using `npm start` (which now defaults to `--tunnel`)
- Works but uses Expo's tunnel service

---

## 🔍 **ROOT CAUSE ANALYSIS**

**Suspected causes:**
1. **Network configuration issues**
   - Firewall blocking LAN connections
   - Router settings preventing device-to-device communication
   - Network segmentation (devices on different subnets)

2. **Expo LAN detection failure**
   - Expo may not be detecting the correct network interface
   - IP address binding issues
   - Port 8081 may be blocked

3. **Device network configuration**
   - Device and computer may not be on same network segment
   - VPN or proxy interfering
   - Mobile carrier restrictions

---

## ✅ **CURRENT WORKAROUND**

**Using tunnel mode as default:**
```bash
npm start  # Uses --tunnel flag
```

**Or explicitly:**
```bash
npm run start:tunnel
```

**This works but:**
- ⚠️ Uses Expo's tunnel service (not ideal for production workflow)
- ⚠️ May have rate limits or connection issues
- ⚠️ Not suitable for team development

---

## 🔧 **REQUIRED FIXES (Before Production)**

### **1. Network Diagnostics**
- [ ] Test LAN mode on different networks
- [ ] Verify firewall/router settings
- [ ] Check if port 8081 is accessible
- [ ] Test with different devices
- [ ] Verify both devices on same network segment

### **2. Expo Configuration**
- [ ] Check Expo network detection
- [ ] Verify IP address binding
- [ ] Test with explicit IP address
- [ ] Check Expo CLI version compatibility

### **3. Alternative Solutions**
- [ ] Consider using local IP address explicitly
- [ ] Test with `expo start --host tunnel` (if available)
- [ ] Evaluate Expo's cloud build service for testing
- [ ] Consider EAS Build for development builds

### **4. Documentation**
- [ ] Document proper development setup
- [ ] Create troubleshooting guide
- [ ] Add network requirements to README
- [ ] Document for team members

---

## 📋 **TESTING CHECKLIST**

When investigating this issue, test:

- [ ] LAN mode on same WiFi network
- [ ] LAN mode on different WiFi networks
- [ ] Tunnel mode (current workaround)
- [ ] Different devices (iOS, Android)
- [ ] Different computers
- [ ] With/without VPN
- [ ] Firewall enabled/disabled
- [ ] Router settings (AP isolation, etc.)

---

## 🎯 **SUCCESS CRITERIA**

**Issue resolved when:**
- ✅ LAN mode works reliably on local network
- ✅ No tunnel required for development
- ✅ Works for all team members
- ✅ Documented setup process
- ✅ No special network configuration needed

---

## 📝 **NOTES**

- This is a **development workflow issue**, not a production issue
- Production builds (EAS Build) won't have this problem
- However, it affects developer experience and should be fixed
- May indicate network configuration that could affect other services

---

## 🔗 **RELATED FILES**

- `package.json` - Scripts configuration
- `ROADMAP_STATUS_UPDATE_DEC_15.md` - Roadmap with this issue tracked
- `MOBILE_DEVICE_CONNECTION_FIX.md` - Previous connection troubleshooting

---

**Priority:** HIGH - Must resolve before production deployment





