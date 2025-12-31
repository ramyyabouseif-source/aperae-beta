# ⚡ Vercel CLI Deployment - Quick Start

## What is CLI?

**CLI** = **Command Line Interface** = Type commands instead of clicking buttons

**You've already used it!** When you ran:
- `npm install -g vercel` ✅
- `npm run web:build:production` ✅

Those were CLI commands! We're just using one more.

---

## 🚀 Deploy in 4 Commands

Copy and paste these commands one at a time into PowerShell (the black/blue window):

### 1. Open PowerShell
Press Windows key → Type `powershell` → Press Enter

### 2. Go to your project folder
```powershell
cd C:\Users\ramyy\Production\Aperae
```

### 3. Log in (only needed once)
```powershell
vercel login
```
- Browser opens → Log in → Done!

### 4. Deploy
```powershell
vercel
```

**Answer the questions:**
- Set up and deploy? → `Y` (press Y, then Enter)
- Link to existing project? → `N` (press N, then Enter)
- Project name? → Press Enter (uses "pocketsomm")
- Directory? → Press Enter
- **Override settings? → `N` (say NO - this is important!)**

Wait 2-5 minutes... Done! ✅

### 5. Deploy to production
```powershell
vercel --prod
```

**That's it!** Your app is live! 🎉

---

## 📖 Need More Help?

See [CLI_DEPLOYMENT_FOR_BEGINNERS.md](./CLI_DEPLOYMENT_FOR_BEGINNERS.md) for detailed explanations of every step.


