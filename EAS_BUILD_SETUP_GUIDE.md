# EAS Build Setup Guide - Beta Testing

**Date:** December 15, 2025  
**Purpose:** Complete guide for setting up EAS Build to share app with beta testers

---

## ✅ **Prerequisites**

- ✅ EAS project ID already configured in `app.json`: `f7a7ae2e-cc06-42c5-a3f6-7c3dbd218b1e`
- ✅ `eas.json` already exists with preview profile
- ✅ Backend API live at `https://api.aperae.com/api`
- ✅ Environment variables configured for production API

---

## 🚀 **Step-by-Step Setup**

### **Step 1: Install EAS CLI**

```powershell
npm install -g eas-cli
```

Verify installation:
```powershell
eas --version
```

---

### **Step 2: Login to EAS**

```powershell
eas login
```

This will:
- Open browser for authentication
- Create/use Expo account
- Link your local machine to EAS

**Note:** EAS free tier includes:
- Unlimited builds
- 30-day build artifact retention
- Internal distribution

---

### **Step 3: Verify EAS Configuration**

Check your `eas.json`:

```json
{
  "cli": {
    "version": ">= 13.2.0"
  },
  "build": {
    "preview": {
      "distribution": "internal"
    },
    "production": {}
  }
}
```

✅ **Already configured correctly!**

---

### **Step 4: Configure Environment Variables**

**Option A: Use Production API (Recommended)**

Ensure your `.env` file has:
```env
EXPO_PUBLIC_ENV=production
```

**Or explicitly:**
```env
EXPO_PUBLIC_API_URL=https://api.aperae.com/api
```

**Option B: Create `.env.production` for builds:**

```env
# .env.production
EXPO_PUBLIC_ENV=production
EXPO_PUBLIC_API_URL=https://api.aperae.com/api
```

**Update `eas.json` to use production env:**

```json
{
  "build": {
    "preview": {
      "distribution": "internal",
      "env": {
        "EXPO_PUBLIC_ENV": "production"
      }
    }
  }
}
```

---

### **Step 5: Build for Android (Recommended to Start)**

```powershell
eas build --profile preview --platform android
```

**What happens:**
1. EAS uploads your project
2. Builds on Expo's cloud servers (~15-30 minutes)
3. Provides download link when complete

**After build completes:**
- You'll get a download link
- Share link with testers
- Tester downloads APK and installs

---

### **Step 6: Build for iOS (Requires Apple Developer Account)**

**Prerequisites:**
- Apple Developer account ($99/year)
- Apple ID configured

```powershell
eas build --profile preview --platform ios
```

**For iOS Simulator (Testing Only):**
```powershell
eas build --profile preview --platform ios --local
```

**After iOS build:**
- Upload to TestFlight (automatic with EAS)
- Add testers via TestFlight
- Tester receives email invitation

---

### **Step 7: Build for Both Platforms**

```powershell
eas build --profile preview --platform all
```

---

## 📱 **Distribution Methods**

### **Option A: Direct Download (Android)**

1. **Build completes** → Get download link
2. **Share link** with testers via email/message
3. **Tester downloads** APK file
4. **Tester installs** (may need to enable "Install from unknown sources")

**Pros:**
- ✅ Quick and easy
- ✅ No app store required
- ✅ Works for any number of testers

**Cons:**
- ⚠️ Android only
- ⚠️ Requires manual installation instructions

---

### **Option B: TestFlight (iOS) - Recommended**

1. **Build iOS version** → EAS automatically uploads to TestFlight
2. **Add testers** in App Store Connect:
   - Go to TestFlight tab
   - Add internal testers (up to 100)
   - Add external testers (requires review)
3. **Tester receives email** → Installs TestFlight → Installs your app

**Pros:**
- ✅ Professional distribution
- ✅ Easy updates (just rebuild)
- ✅ Up to 100 internal testers
- ✅ Automatic updates via TestFlight

**Cons:**
- ⚠️ Requires Apple Developer account ($99/year)
- ⚠️ External testers require review

---

### **Option C: Google Play Internal Testing (Android)**

1. **Create app** in Google Play Console
2. **Upload APK** from EAS build
3. **Add testers** via email addresses
4. **Tester receives email** → Installs from Play Store

**Pros:**
- ✅ Professional distribution
- ✅ Easy updates
- ✅ Automatic updates via Play Store

**Cons:**
- ⚠️ Requires Google Play Developer account ($25 one-time)
- ⚠️ More setup required

---

## 🔧 **Advanced Configuration**

### **Update `eas.json` for Production Environment:**

```json
{
  "cli": {
    "version": ">= 13.2.0"
  },
  "build": {
    "development": {
      "developmentClient": true,
      "distribution": "internal",
      "env": {
        "EXPO_PUBLIC_ENV": "development"
      }
    },
    "preview": {
      "distribution": "internal",
      "env": {
        "EXPO_PUBLIC_ENV": "production"
      },
      "android": {
        "buildType": "apk"
      },
      "ios": {
        "simulator": false
      }
    },
    "production": {
      "env": {
        "EXPO_PUBLIC_ENV": "production"
      },
      "android": {
        "buildType": "app-bundle"
      }
    }
  },
  "submit": {
    "production": {}
  }
}
```

---

## ✅ **Testing Checklist**

After build completes:

- [ ] Download and install on test device
- [ ] Verify API URL points to `https://api.aperae.com/api`
- [ ] Test wine recommendation request
- [ ] Verify recommendations display correctly
- [ ] Test all navigation flows
- [ ] Verify age verification and legal screens
- [ ] Test favorites functionality
- [ ] Check for any console errors

---

## 🐛 **Troubleshooting**

### **Build Fails with "Environment Variable Not Found"**

**Solution:** Update `eas.json` to include env vars:
```json
{
  "build": {
    "preview": {
      "env": {
        "EXPO_PUBLIC_ENV": "production"
      }
    }
  }
}
```

### **Build Takes Too Long**

**Normal:** First build takes 20-30 minutes  
**Subsequent builds:** 10-15 minutes (cached dependencies)

### **APK Won't Install**

**Android:**
- Enable "Install from unknown sources" in device settings
- Verify APK file downloaded completely
- Check Android version compatibility

### **iOS Build Fails - Code Signing**

**Solution:**
1. Ensure Apple Developer account is active
2. Run: `eas build:configure`
3. Select automatic code signing

---

## 📋 **Quick Reference Commands**

```powershell
# Login
eas login

# Check status
eas whoami

# Configure (if needed)
eas build:configure

# Build Android
eas build --profile preview --platform android

# Build iOS
eas build --profile preview --platform ios

# Build both
eas build --profile preview --platform all

# View build status
eas build:list

# Download build
eas build:download
```

---

## 🎯 **Next Steps After First Build**

1. **Test the build** yourself first
2. **Share download link** with 1-2 trusted testers
3. **Gather feedback** and fix any issues
4. **Rebuild** with fixes
5. **Expand tester base** once stable

---

## ✅ **Summary**

**Setup Time:** ~30 minutes (one-time)  
**Build Time:** ~15-30 minutes per build  
**Cost:** Free (EAS free tier)  

**You'll Need:**
- EAS account (free)
- Apple Developer account (only for iOS - $99/year)
- Google Play Developer account (optional - $25 one-time)

**Result:**
- Standalone app builds
- Easy distribution to testers
- Professional beta testing setup

---

**Ready to start? Run `eas login` to begin!** 🚀





