# 🔧 Vercel Build Settings Fix

## Issue

Vercel is auto-detecting your project and pre-filling settings with:
- **Build Command**: `npx expo export:web` ❌ (old Webpack command, won't work with Metro)
- **Output Directory**: `web-build` ✅ (correct)
- **Install Command**: `npm install` ✅ (correct)

## Solution

You need to **change the Build Command** to use the correct Metro bundler command.

---

## How to Fix Build Settings in Vercel

### Option 1: Override During Project Setup

1. When importing your GitHub repo in Vercel
2. Look for **"Framework Preset"** dropdown
3. **Select "Other"** (not "Expo" or auto-detected)
4. This will **unlock all settings** for editing
5. Change **Build Command** to:
   ```
   npm run web:build:production
   ```
6. Verify **Output Directory** is: `web-build`
7. Click **"Deploy"**

### Option 2: Edit Settings After Project Creation

If you've already created the project:

1. Go to your project in Vercel dashboard
2. Click **"Settings"** tab
3. Click **"General"** in left sidebar
4. Scroll to **"Build & Development Settings"**
5. Click **"Override"** button
6. Change **Build Command** to:
   ```
   npm run web:build:production
   ```
7. Verify **Output Directory** is: `web-build`
8. Click **"Save"**
9. Go to **"Deployments"** tab and redeploy

---

## Why This Matters

- ❌ `npx expo export:web` - Only works with Webpack (deprecated in Expo SDK 50+)
- ✅ `npm run web:build:production` - Works with Metro bundler (your current setup)

Your `package.json` already has the correct script configured:
```json
"web:build:production": "cross-env EXPO_PUBLIC_ENV=production expo export --platform web --output-dir web-build"
```

---

## Quick Reference

**Correct Settings for PocketSomm:**
- **Framework Preset**: Other
- **Build Command**: `npm run web:build:production`
- **Output Directory**: `web-build`
- **Install Command**: `npm install`
- **Root Directory**: `./` (default)

---

## Alternative: Use vercel.json

Your project already has a `vercel.json` file that should configure these settings automatically. However, Vercel sometimes requires you to manually override the auto-detected settings first.

After overriding and saving settings, Vercel will respect your `vercel.json` configuration.

---

**After making these changes, your builds should work correctly!** ✅





