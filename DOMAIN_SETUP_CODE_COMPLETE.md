# Domain Setup - Code Changes Complete ✅

## Summary

I've completed all the **code changes** needed to support your `aperae.com` domain. The code is now ready for production deployment once you complete the DNS and hosting setup.

---

## ✅ **What I've Completed**

### **1. Backend CORS Configuration** ✅
**File:** `backend/server.js`

**Changes:**
- Added `https://www.aperae.com` to allowed origins
- Added `https://api.aperae.com` to allowed origins
- Added `https://staging.aperae.com` and `https://staging-api.aperae.com` for staging
- Made it configurable via `ALLOWED_ORIGINS` environment variable

**Status:** ✅ Complete - Backend will accept requests from your domain

---

### **2. Frontend API URL Configuration** ✅
**Files:** 
- `src/utils/api.ts`
- `src/services/enhancedApiService.ts`

**Changes:**
- Added environment-based URL selection:
  - `EXPO_PUBLIC_ENV=production` → Uses `https://api.aperae.com/api`
  - `EXPO_PUBLIC_ENV=staging` → Uses `https://staging-api.aperae.com/api`
  - Development (default) → Uses `http://localhost:3001/api`
- Maintains backward compatibility with `EXPO_PUBLIC_API_URL` override
- Updated both API service files for consistency

**Status:** ✅ Complete - Frontend will automatically use correct API URL based on environment

---

### **3. Environment Variable Documentation** ✅
**Files Created:**
- `ENVIRONMENT_VARIABLES_GUIDE.md` - Complete guide for all environments
- `DOMAIN_SETUP_STEP_BY_STEP.md` - Step-by-step setup instructions
- Updated `env.example` and `backend-env-example.txt` with domain notes

**Status:** ✅ Complete - Documentation ready

---

## 📋 **What YOU Need to Do Next**

### **STEP 1: Choose Hosting Provider** ⏳

**Options:**
1. **Railway** (Recommended - Easiest)
   - Free tier available
   - Automatic SSL
   - Easy deployment from GitHub
   - Visit: https://railway.app

2. **Render**
   - Free tier available
   - Automatic SSL
   - Easy deployment
   - Visit: https://render.com

3. **DigitalOcean** (More control)
   - $5-20/month
   - Full VPS control
   - Manual SSL setup (Let's Encrypt)

4. **Other:** AWS, Google Cloud, Azure, etc.

**Action Required:** 
- Choose a hosting provider
- Sign up if needed
- Tell me which one you chose

---

### **STEP 2: Set Up DNS Records** ⏳

Once you have a hosting provider/server, you need to point your domain to it.

**DNS Records to Create:**

1. **A Record for API:**
   - **Name:** `api`
   - **Type:** A
   - **Value:** Your server IP address (from hosting provider)
   - **TTL:** 3600

2. **A Record for WWW:**
   - **Name:** `www`
   - **Type:** A
   - **Value:** Your server IP address (or frontend hosting)
   - **TTL:** 3600

3. **A Record for Staging (Optional):**
   - **Name:** `staging`
   - **Type:** A
   - **Value:** Your staging server IP
   - **TTL:** 3600

**Where to do this:**
- Your domain registrar (where you bought aperae.com)
- Or DNS provider (Cloudflare, Route53, etc.)

**Action Required:**
- Set up DNS records
- Wait for DNS propagation (can take up to 48 hours, usually 5-30 minutes)
- Tell me when DNS is configured

---

### **STEP 3: Set Up SSL Certificates** ⏳

**If using Railway/Render:**
- ✅ SSL is automatic - nothing to do!

**If using VPS (DigitalOcean, etc.):**
- Option A: Use Cloudflare (easiest)
  - Sign up for Cloudflare (free)
  - Add your domain
  - Change nameservers at registrar
  - SSL is automatic

- Option B: Use Let's Encrypt (manual)
  - Install Certbot
  - Run: `certbot --nginx` (or `--apache`)
  - Follow prompts

**Action Required:**
- Set up SSL
- Verify: `https://api.aperae.com` should load (even if it shows an error, SSL should work)
- Tell me when SSL is working

---

### **STEP 4: Deploy Backend** ⏳

**If using Railway/Render:**
1. Connect your GitHub repo
2. Set environment variables (I'll provide the list)
3. Deploy
4. Test: `https://api.aperae.com/api/health` should return success

**If using VPS:**
1. SSH into server
2. Clone your repo
3. Set environment variables
4. Install dependencies
5. Run: `npm start` (or use PM2 for production)
6. Test: `https://api.aperae.com/api/health`

**Action Required:**
- Deploy backend
- Test the health endpoint
- Tell me when it's deployed and working

---

### **STEP 5: Configure Environment Variables** ⏳

Once backend is deployed, you'll need to set these environment variables:

**Required Variables:**
```bash
NODE_ENV=production
ALLOWED_ORIGINS=https://www.aperae.com,https://api.aperae.com
DATABASE_URL=your-supabase-connection-string
JWT_SECRET=your-jwt-secret
REFRESH_SECRET=your-refresh-secret
ANTHROPIC_API_KEY=your-anthropic-key
```

**Action Required:**
- Set environment variables in your hosting provider
- I'll provide the complete list when you're ready

---

## 🎯 **Current Status**

| Task | Status | Who |
|------|--------|-----|
| Backend CORS Configuration | ✅ Complete | Me |
| Frontend API Configuration | ✅ Complete | Me |
| Environment Documentation | ✅ Complete | Me |
| Choose Hosting Provider | ⏳ Waiting | You |
| Set Up DNS Records | ⏳ Waiting | You |
| Set Up SSL Certificates | ⏳ Waiting | You |
| Deploy Backend | ⏳ Waiting | You |
| Configure Environment Variables | ⏳ Waiting | You |

---

## 📝 **Next Steps**

**Right Now:**
1. ✅ Code changes are complete
2. ⏳ **YOU:** Choose hosting provider
3. ⏳ **YOU:** Set up DNS records
4. ⏳ **YOU:** Set up SSL
5. ⏳ **YOU:** Deploy backend

**Once You're Ready:**
- Tell me which hosting provider you chose
- I'll help you with deployment steps
- I'll provide the exact environment variables you need

---

## 🆘 **Need Help?**

**If you get stuck:**
1. Tell me which step you're on
2. Share any error messages
3. I'll help troubleshoot

**Recommended Starting Point:**
- Use **Railway** or **Render** (easiest setup)
- They handle SSL automatically
- Deployment is straightforward

---

**Status:** ✅ **CODE CHANGES COMPLETE - READY FOR YOUR HOSTING SETUP**

Let me know when you've chosen a hosting provider and I'll help with the next steps!




