# ⚡ Vercel Quick Start (5-Minute Setup)

Already have a Vercel account? Follow these quick steps:

## 🚀 Deploy in 5 Minutes

### Step 1: Build Your App
```bash
npm run web:build:production
```

### Step 2: Deploy to Vercel

**Option A: Via Dashboard (Easiest)**
1. Go to [vercel.com/dashboard](https://vercel.com/dashboard)
2. Click **"Add New..."** → **"Project"**
3. **Import GitHub repo** OR **upload `web-build` folder**
4. Set Build Command: `npm run web:build:production`
5. Set Output Directory: `web-build`
6. Click **"Deploy"**

**Option B: Via CLI (Faster)**
```bash
npm install -g vercel
vercel login
vercel --prod
```

### Step 3: Add Domain
1. Vercel Dashboard → Your Project → **Settings** → **Domains**
2. Click **"Add"** → Enter `www.aperae.com`
3. Copy the CNAME record shown
4. Add CNAME record in your DNS:
   - Name: `www`
   - Value: `cname.vercel-dns.com`
5. Wait 5-30 minutes for DNS to propagate

### Step 4: Test
Visit `https://www.aperae.com` - Your app should be live! 🎉

---

**Need more details?** See [VERCEL_SETUP_GUIDE.md](./VERCEL_SETUP_GUIDE.md) for complete step-by-step instructions.






