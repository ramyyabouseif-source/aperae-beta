# Beta Testing Deployment Guide

**Date:** December 15, 2025  
**Purpose:** Guide for sharing the app with friends for beta testing

---

## ✅ **Current Status: Backend is Ready!**

### **Backend Deployment**
- ✅ **Production API:** `https://api.aperae.com/api` (live on Render)
- ✅ **Staging API:** `https://staging-api.aperae.com/api` (live on Render)
- ✅ **No local server needed** - Backend is always available
- ✅ **No ngrok needed** - Using Render's public URLs
- ✅ **SSL certificates** - HTTPS enabled for both environments

### **Frontend Status**
- ✅ **Expo configured** - Ready for beta testing
- ✅ **EAS project ID** - Already configured in `app.json`
- ✅ **API URL logic** - Supports production/staging environments
- ⚠️ **Needs beta build** - Requires EAS Build or Expo Go setup

---

## 🎯 **Beta Testing Options**

You have **3 options** for sharing with friends:

---

### **Option 1: Expo Go (Easiest for Quick Testing)** ⭐ **Recommended for Beta**

**Best for:** Quick testing with friends, no build needed

**How it works:**
- Friends install **Expo Go** app (free from App Store/Play Store)
- You start Expo development server
- Friends scan QR code to open your app in Expo Go
- **Backend:** Already uses production API (`api.aperae.com`)

**Pros:**
- ✅ No build needed
- ✅ Instant updates when you make changes
- ✅ Easy to share (just QR code)
- ✅ Works on iOS and Android

**Cons:**
- ⚠️ Requires your computer to be running (or use Expo's tunnel)
- ⚠️ Expo Go has limitations (some native modules may not work)

**Steps:**
1. Make sure `.env` is set to use production API (or don't set `EXPO_PUBLIC_API_URL`)
2. Start Expo: `npm start` (or `expo start --tunnel` for friends to connect)
3. Share QR code with friends
4. Friends scan with Expo Go app

---

### **Option 2: EAS Build (Recommended for Real Beta)** ⭐⭐⭐ **Best for Beta Testing**

**Best for:** Real beta testing, distribution to multiple testers

**How it works:**
- Build standalone app using Expo Application Services (EAS)
- Share with testers via TestFlight (iOS) or Internal Testing (Android)
- Testers install like a real app (no Expo Go needed)
- **Backend:** Uses production API (`api.aperae.com`)

**Pros:**
- ✅ Real app experience (no Expo Go)
- ✅ Can distribute to multiple testers
- ✅ Works offline (once installed)
- ✅ No need for your computer to be running
- ✅ Can use TestFlight/Play Store internal testing

**Cons:**
- ⚠️ Requires EAS account (free tier available)
- ⚠️ Build takes ~15-30 minutes
- ⚠️ Updates require new build

**Steps:**
1. Install EAS CLI: `npm install -g eas-cli`
2. Login: `eas login`
3. Configure: `eas build:configure`
4. Build for beta: `eas build --profile preview --platform ios` (or `android`)
5. Share build link with testers

---

### **Option 3: Development Build (Advanced)**

**Best for:** Testing with custom native code

**How it works:**
- Similar to EAS Build but includes development features
- Requires EAS account
- More complex setup

**Recommendation:** Use Option 2 (EAS Build) instead - simpler and sufficient for beta testing.

---

## 🚀 **Recommended Beta Testing Setup**

### **Phase 1: Quick Testing with Expo Go** (Immediate)

1. **Configure API URL:**
   - Set `.env`: `EXPO_PUBLIC_ENV=production` (or ensure `EXPO_PUBLIC_API_URL=https://api.aperae.com/api`)
   - This ensures friends connect to your production backend (no local server needed)

2. **Start Expo:**
   ```bash
   npm start --tunnel
   ```
   - The `--tunnel` flag creates a public URL friends can access
   - Your computer needs to be running (or use Expo's cloud tunnel)

3. **Share with friends:**
   - Send them the QR code from terminal
   - Friends install Expo Go app
   - Scan QR code to test

**Note:** Your computer needs to stay running for this to work.

---

### **Phase 2: Real Beta with EAS Build** (Recommended)

1. **Set up EAS:**
   ```bash
   npm install -g eas-cli
   eas login
   eas build:configure
   ```

2. **Create `eas.json`** (I'll help create this):
   ```json
   {
     "build": {
       "preview": {
         "distribution": "internal",
         "ios": {
           "simulator": false
         }
       }
     }
   }
   ```

3. **Build for beta:**
   ```bash
   # iOS (requires Apple Developer account - $99/year)
   eas build --profile preview --platform ios
   
   # Android (free)
   eas build --profile preview --platform android
   ```

4. **Share with testers:**
   - EAS provides a link to download the build
   - iOS: Upload to TestFlight for easy distribution
   - Android: Share APK or use Play Store Internal Testing

---

## 📋 **No More ngrok or Local Servers!**

### **✅ What You DON'T Need Anymore:**

- ❌ **No local backend server** - Backend is on Render
- ❌ **No ngrok** - Using Render's public URLs
- ❌ **No PowerShell to start backend** - It's always running on Render
- ❌ **No localhost** - Friends connect to production API

### **✅ What You Still Need (For Expo Go Option):**

- ✅ **Expo development server** - Only if using Expo Go (Option 1)
- ✅ **Computer running** - Only if using Expo Go (Option 1)

### **✅ What You DON'T Need (For EAS Build Option):**

- ❌ **Nothing!** - Build once, share, friends can use anytime
- ✅ **Your computer can be off** - App works independently
- ✅ **Backend always available** - On Render 24/7

---

## 🔧 **Configuration for Beta Testing**

### **Option A: Use Production API (Recommended)**

**Set in `.env`:**
```env
EXPO_PUBLIC_ENV=production
```

**Or explicitly:**
```env
EXPO_PUBLIC_API_URL=https://api.aperae.com/api
```

**Result:** App connects to `https://api.aperae.com/api` (your production backend on Render)

### **Option B: Use Staging API**

**Set in `.env`:**
```env
EXPO_PUBLIC_ENV=staging
```

**Result:** App connects to `https://staging-api.aperae.com/api` (your staging backend)

---

## 📝 **Next Steps Added to Roadmap**

I'll add these tasks to the roadmap:

1. **EAS Build Configuration** (30 minutes)
   - Set up `eas.json`
   - Configure build profiles
   - Test build process

2. **Beta Distribution Setup** (1-2 hours)
   - iOS: TestFlight setup (if you have Apple Developer account)
   - Android: Play Store Internal Testing setup
   - Tester management

3. **Beta Testing Documentation** (1 hour)
   - Create tester guide
   - Feedback collection process
   - Issue reporting system

---

## ✅ **Summary**

**Current State:**
- ✅ Backend is ready (no local server needed)
- ✅ No ngrok needed (using Render URLs)
- ✅ API URLs configured correctly
- ⏳ Frontend needs beta build setup

**For Beta Testing:**
- **Quick testing:** Use Expo Go (Option 1) - requires your computer running
- **Real beta:** Use EAS Build (Option 2) - recommended, no computer needed after build

**What Friends Need:**
- **Expo Go option:** Expo Go app + QR code scan
- **EAS Build option:** Just download link (no Expo Go needed)

**Your Computer:**
- **Expo Go:** Needs to be running Expo server
- **EAS Build:** Can be off after build is complete

---

**Ready to set up beta testing? Let me know which option you prefer!** 🚀





