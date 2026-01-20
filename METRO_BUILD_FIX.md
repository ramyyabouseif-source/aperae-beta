# ✅ Metro Bundler Build Fix

## Issue

You're using **Metro bundler** (configured in `app.json`), but the build command was using `expo export:web`, which is only for **Webpack bundler**.

## Fix Applied

✅ Updated build scripts in `package.json`:
- Changed `expo export:web` → `expo export --platform web`
- This is the correct command for Metro bundler

✅ Updated `vercel.json`:
- Changed build command to use the npm script

## Updated Commands

**For development:**
```bash
npm run web:build
```

**For production:**
```bash
npm run web:build:production
```

Both now use: `expo export --platform web` ✅

---

## 🚀 Try Building Again

Run the build command:

```bash
npm run web:build:production
```

This should now work correctly with Metro bundler! ✅

---

## Output Location

The build will create a `dist` folder (not `web-build`) with your static files. This is what you'll deploy to Vercel.

---

**Note:** Expo SDK 50+ uses Metro bundler by default. The old `expo export:web` command was for Webpack, which has been deprecated.






