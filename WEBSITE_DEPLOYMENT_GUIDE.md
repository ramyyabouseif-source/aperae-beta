# Website Deployment Guide - aperae.com

**Date:** December 15, 2025  
**Purpose:** Deploy Expo web app to aperae.com

---

## ✅ **Current Status**

- ✅ Expo web configured in `app.json` (`"platforms": ["ios", "android", "web"]`)
- ✅ Web bundler: Metro
- ✅ Backend API: `https://api.aperae.com/api` (live on Render)
- ✅ API URL logic supports production environment

---

## 🚀 **Deployment Options**

You have **3 main options** for deploying the web version:

---

### **Option 1: Expo Hosting (Easiest)** ⭐ **Recommended**

**Best for:** Quick deployment, automatic updates, free tier

**How it works:**
- Expo hosts your web build
- Automatic deployments on `git push`
- Free tier includes custom domain support
- Built-in CDN and HTTPS

**Steps:**

1. **Build web version:**
   ```powershell
   npx expo export:web
   ```
   This creates a `web-build` folder

2. **Deploy to Expo:**
   ```powershell
   npx expo publish:web
   ```
   Or use EAS:
   ```powershell
   eas build --profile production --platform web
   ```

3. **Connect custom domain:**
   - Go to Expo dashboard
   - Add custom domain: `aperae.com`
   - Update DNS records as instructed

**Pros:**
- ✅ Easy setup
- ✅ Automatic deployments
- ✅ Free tier available
- ✅ Built-in CDN
- ✅ HTTPS included

**Cons:**
- ⚠️ Expo branding (can be removed with paid plan)

---

### **Option 2: Vercel (Recommended for Production)** ⭐⭐⭐

**Best for:** Professional deployment, excellent performance, free tier

**Steps:**

1. **Install Vercel CLI:**
   ```powershell
   npm install -g vercel
   ```

2. **Build web version:**
   ```powershell
   npx expo export:web
   ```

3. **Create `vercel.json`:**
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
     ]
   }
   ```

4. **Deploy:**
   ```powershell
   vercel --prod
   ```

5. **Connect domain:**
   - In Vercel dashboard → Settings → Domains
   - Add `aperae.com`
   - Update DNS records

**Pros:**
- ✅ Excellent performance (global CDN)
- ✅ Automatic HTTPS
- ✅ Free tier (generous)
- ✅ Easy deployments
- ✅ Preview deployments for PRs

**Cons:**
- ⚠️ Requires account setup

---

### **Option 3: Netlify (Alternative)**

**Best for:** Similar to Vercel, good free tier

**Steps:**

1. **Install Netlify CLI:**
   ```powershell
   npm install -g netlify-cli
   ```

2. **Build web version:**
   ```powershell
   npx expo export:web
   ```

3. **Create `netlify.toml`:**
   ```toml
   [build]
     command = "npx expo export:web"
     publish = "web-build"

   [[redirects]]
     from = "/*"
     to = "/index.html"
     status = 200
   ```

4. **Deploy:**
   ```powershell
   netlify deploy --prod
   ```

**Pros:**
- ✅ Good free tier
- ✅ Easy setup
- ✅ Automatic HTTPS

---

## 🔧 **Configuration for Production**

### **Update `app.json` for Web:**

```json
{
  "expo": {
    "web": {
      "bundler": "metro",
      "output": "single",
      "build": {
        "babel": {
          "include": ["@babel/plugin-proposal-export-namespace-from"]
        }
      },
      "favicon": "./assets/favicon.png"
    }
  }
}
```

### **Ensure Production API URL:**

Create `.env.production`:
```env
EXPO_PUBLIC_ENV=production
EXPO_PUBLIC_API_URL=https://api.aperae.com/api
```

### **Update `src/utils/api.ts` (if needed):**

Already configured to use production when `EXPO_PUBLIC_ENV=production` ✅

---

## 🧪 **Testing Locally First**

Before deploying, test the web build:

1. **Build web version:**
   ```powershell
   npx expo export:web
   ```

2. **Serve locally:**
   ```powershell
   npx serve web-build
   ```

3. **Test:**
   - Open `http://localhost:3000` (or port shown)
   - Verify API connections work
   - Test all features
   - Check mobile responsiveness

---

## 📋 **Deployment Checklist**

### **Pre-Deployment:**

- [ ] Build web version: `npx expo export:web`
- [ ] Test locally with `npx serve web-build`
- [ ] Verify API URL points to production
- [ ] Test wine recommendation flow
- [ ] Check responsive design (mobile/tablet/desktop)
- [ ] Verify all navigation works
- [ ] Test age verification and legal screens

### **Deployment:**

- [ ] Choose hosting provider (Vercel recommended)
- [ ] Set up account
- [ ] Configure domain (aperae.com)
- [ ] Update DNS records
- [ ] Deploy build
- [ ] Test live site

### **Post-Deployment:**

- [ ] Verify HTTPS works
- [ ] Test all features on live site
- [ ] Check mobile responsiveness
- [ ] Verify API connections
- [ ] Set up monitoring (optional)

---

## 🌐 **DNS Configuration**

After deploying, you'll need to configure DNS:

**For Vercel:**
- Add CNAME record: `aperae.com` → `cname.vercel-dns.com`
- Or A record: Points to Vercel IP (provided)

**For Expo Hosting:**
- Follow Expo's DNS instructions from dashboard

**For Netlify:**
- Add CNAME: `aperae.com` → `your-site.netlify.app`

---

## 🔄 **CI/CD Integration**

### **Automatic Deployments with GitHub Actions:**

Create `.github/workflows/deploy-web.yml`:

```yaml
name: Deploy Web

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: npm install
      - run: npx expo export:web
      - uses: vercel/action@v1
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
          vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}
          vercel-args: '--prod'
```

---

## 🐛 **Troubleshooting**

### **Web Build Fails**

**Check:**
- Node.js version (should be 18+)
- All dependencies installed
- No TypeScript errors

**Fix:**
```powershell
npm install
npx expo export:web --clear
```

### **API Calls Fail on Web**

**Check:**
- Environment variables set correctly
- CORS configured on backend (already done ✅)
- API URL in console logs

### **Routing Not Working**

**Fix:** Ensure hosting provider has SPA routing configured (see `vercel.json` example above)

---

## ✅ **Recommended Setup**

**For aperae.com website:**

1. **Use Vercel** (best performance, easy setup)
2. **Build command:** `npx expo export:web`
3. **Output directory:** `web-build`
4. **Environment:** Production API
5. **Domain:** `aperae.com`

**Estimated Time:** 30-60 minutes

---

## 📊 **Performance Optimization**

### **After Deployment:**

1. **Enable compression** (automatic on Vercel/Netlify)
2. **Set up CDN** (automatic)
3. **Optimize images** (already handled by Expo)
4. **Enable caching** (configure in hosting provider)

---

## ✅ **Summary**

**Recommended Approach:**
- ✅ **Hosting:** Vercel (free, fast, easy)
- ✅ **Build:** `npx expo export:web`
- ✅ **Domain:** aperae.com (connect in Vercel dashboard)
- ✅ **API:** Already configured for production ✅

**Time Required:**
- Setup: 30 minutes
- First deployment: 10 minutes
- Total: ~40-60 minutes

**Result:**
- Professional website at aperae.com
- Automatic HTTPS
- Global CDN
- Easy updates (just rebuild and deploy)

---

**Ready to deploy? Start with `npx expo export:web` to test locally first!** 🚀



