# EAS Build & Website Setup - Complete Guide

**Date:** December 15, 2025  
**Status:** Ready to set up

---

## 📋 **What We're Setting Up**

1. **EAS Build** - Beta testing app distribution
2. **Website Deployment** - aperae.com website

---

## 🚀 **Quick Start Guide**

### **Part 1: EAS Build Setup (Beta Testing)**

**Time:** ~30 minutes + 15-30 min per build

1. **Install EAS CLI:**
   ```powershell
   npm install -g eas-cli
   ```

2. **Login:**
   ```powershell
   eas login
   ```

3. **Update `eas.json` with production env:**
   See "Configuration Updates" section below

4. **Build Android (start here):**
   ```powershell
   eas build --profile preview --platform android
   ```

5. **Share with testers:**
   - Get download link from EAS
   - Send to beta testers
   - Testers install APK

**Full Guide:** See `EAS_BUILD_SETUP_GUIDE.md`

---

### **Part 2: Website Deployment (aperae.com)**

**Time:** ~40-60 minutes

1. **Test locally first:**
   ```powershell
   npx expo export:web
   npx serve web-build
   ```

2. **Choose hosting:** Vercel (recommended)

3. **Install Vercel CLI:**
   ```powershell
   npm install -g vercel
   ```

4. **Create `vercel.json`:**
   See "Configuration Updates" section below

5. **Deploy:**
   ```powershell
   vercel --prod
   ```

6. **Connect domain:** aperae.com in Vercel dashboard

**Full Guide:** See `WEBSITE_DEPLOYMENT_GUIDE.md`

---

## 🔧 **Configuration Updates Needed**

### **1. Update `eas.json` for Production API:**

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

**What this does:**
- ✅ Ensures preview builds use production API
- ✅ Sets Android build type to APK (easier distribution)
- ✅ Configures for iOS App Store submission

---

### **2. Create `vercel.json` for Website:**

Create `vercel.json` in project root:

```json
{
  "buildCommand": "npx expo export:web",
  "outputDirectory": "web-build",
  "devCommand": "expo start --web",
  "installCommand": "npm install",
  "framework": null,
  "rewrites": [
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ],
  "env": {
    "EXPO_PUBLIC_ENV": "production"
  }
}
```

**What this does:**
- ✅ Builds web version automatically
- ✅ Configures SPA routing (all routes → index.html)
- ✅ Sets production environment

---

### **3. Create `.env.production` (Optional but Recommended):**

Create `.env.production` in project root:

```env
EXPO_PUBLIC_ENV=production
EXPO_PUBLIC_API_URL=https://api.aperae.com/api
```

---

## ✅ **Verification Checklist**

### **After EAS Build:**

- [ ] Build completed successfully
- [ ] Downloaded APK/iOS build
- [ ] Installed on test device
- [ ] Verified API URL (should be `https://api.aperae.com/api`)
- [ ] Tested wine recommendation request
- [ ] All features working correctly

### **After Website Deployment:**

- [ ] Website accessible at aperae.com
- [ ] HTTPS working (automatic on Vercel)
- [ ] API connections working
- [ ] Mobile responsive
- [ ] All navigation working
- [ ] Wine recommendations working

---

## 🎯 **Next Steps**

1. **Set up EAS Build** (beta testing)
   - Install EAS CLI
   - Login
   - Update eas.json
   - Build and test

2. **Deploy website** (aperae.com)
   - Test locally
   - Set up Vercel
   - Deploy
   - Connect domain

3. **Add to roadmap** ✅ (already done)

---

## 📚 **Detailed Guides**

- **EAS Build:** `EAS_BUILD_SETUP_GUIDE.md`
- **Website:** `WEBSITE_DEPLOYMENT_GUIDE.md`

---

**Ready to start? Begin with EAS Build setup, then move to website deployment!** 🚀


