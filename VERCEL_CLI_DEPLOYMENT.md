# 🚀 Deploy to Vercel via CLI (Recommended)

Since Vercel's UI is locking the build settings, let's use the CLI which will automatically use your `vercel.json` configuration file.

## ✅ Prerequisites

You already have:
- ✅ Vercel CLI installed (`vercel --version` worked)
- ✅ `vercel.json` file with correct settings
- ✅ `web-build` folder ready

## 🚀 Deployment Steps

### Step 1: Login to Vercel (if not already logged in)

```bash
vercel login
```

This will open your browser to authenticate. Follow the prompts.

### Step 2: Deploy to Vercel

Run this command in your project root:

```bash
cd C:\Users\ramyy\Production\Aperae
vercel
```

You'll be asked some questions:
- **Set up and deploy?** → Type `Y` and press Enter
- **Which scope?** → Select your account (usually option 1)
- **Link to existing project?** → Type `N` (for first deployment)
- **What's your project's name?** → Type `pocketsomm` (or your preferred name)
- **In which directory is your code located?** → Type `./` or just press Enter
- **Want to override the settings?** → Type `N` (we want to use vercel.json)

**Important:** When asked "Want to override the settings?", say **NO** (`N`) - this tells Vercel to use your `vercel.json` file which has the correct settings!

### Step 3: Production Deployment

After the preview deployment succeeds, deploy to production:

```bash
vercel --prod
```

This will deploy to your production URL.

---

## ✅ What Happens

The CLI will:
1. Read your `vercel.json` file
2. Use the correct build command: `npm run web:build:production`
3. Use the correct output directory: `web-build`
4. Deploy your app

---

## 🎯 After Deployment

You'll get:
- A preview URL (for testing)
- A production URL (like `pocketsomm-xyz.vercel.app`)

Then proceed to add your custom domain (Step 4 in VERCEL_SETUP_GUIDE.md)

---

## 🔍 Verify Settings After Deployment

After deployment, you can verify in the Vercel dashboard:
1. Go to your project → Settings → General
2. Check "Build & Development Settings"
3. It should show:
   - Build Command: `npm run web:build:production`
   - Output Directory: `web-build`

If it shows the wrong command, you can click "Override" and fix it there, then redeploy.

---

## 🐛 Troubleshooting

**If deployment fails:**
- Check the build logs in Vercel dashboard
- Verify `vercel.json` is in your project root
- Make sure `package.json` has the `web:build:production` script

**If settings are still wrong:**
- After first deployment, go to Settings → General
- Click "Override" in Build & Development Settings
- Manually set:
  - Build Command: `npm run web:build:production`
  - Output Directory: `web-build`
- Save and redeploy

---

**Try the CLI deployment now - it should work perfectly!** ✅





