# Domain Setup - Step-by-Step Guide

## 🎯 Overview

We're setting up `aperae.com` for professional deployment. This guide breaks down exactly what **I'll do** (code changes) and what **YOU need to do** (DNS/SSL/hosting).

---

## 📋 **PHASE 1: Code Changes (I'll Do This)**

I'll update the code to support your domain. This includes:
1. ✅ Backend CORS configuration
2. ✅ Frontend API URL configuration  
3. ✅ Environment variable templates
4. ✅ Documentation updates

**Status:** Ready to start

---

## 📋 **PHASE 2: DNS & Hosting Setup (YOU Need to Do This)**

You'll need to:
1. ⏳ Choose a hosting provider
2. ⏳ Set up DNS records
3. ⏳ Configure SSL certificates
4. ⏳ Deploy your backend

**Status:** Waiting for your hosting choice

---

## 🔧 **STEP 1: I'll Update Backend CORS Configuration**

**What I'm doing:**
- Adding `https://www.aperae.com` to allowed origins
- Adding `https://api.aperae.com` to allowed origins
- Adding `https://staging.aperae.com` for staging
- Making it configurable via environment variables

**What you need to do:** Nothing yet - just wait for me to finish

**Files I'll modify:**
- `backend/server.js` (CORS configuration)

---

## 🔧 **STEP 2: I'll Update Frontend API Configuration**

**What I'm doing:**
- Adding production API URL support
- Adding staging API URL support
- Keeping localhost as development default
- Making it environment-based

**What you need to do:** Nothing yet

**Files I'll modify:**
- `src/utils/api.ts` (API URL logic)
- `src/services/enhancedApiService.ts` (if needed)

---

## 🔧 **STEP 3: I'll Create Environment Variable Templates**

**What I'm doing:**
- Creating `.env.production` template
- Updating `.env.example` with domain config
- Documenting required environment variables

**What you need to do:** Nothing yet

**Files I'll create/modify:**
- `.env.production.example` (new)
- `.env.example` (update)
- `backend/.env.example` (update)

---

## 🔧 **STEP 4: YOU Need to Choose Hosting Provider**

**What you need to do:**

Choose ONE of these options:

### **Option A: VPS/Cloud Server** (Recommended for API)
- **Providers:** DigitalOcean, AWS EC2, Google Cloud, Azure, Linode
- **Cost:** $5-20/month
- **Best for:** Full control, Node.js apps
- **SSL:** Let's Encrypt (free)

### **Option B: Platform-as-a-Service** (Easier)
- **Providers:** Railway, Render, Fly.io, Heroku
- **Cost:** Free tier or $10-20/month
- **Best for:** Easy deployment, less configuration
- **SSL:** Included automatically

### **Option C: Serverless** (For low traffic)
- **Providers:** Vercel, AWS Lambda, Netlify Functions
- **Cost:** Pay per request (cheap for low traffic)
- **Best for:** Auto-scaling, minimal maintenance
- **SSL:** Included automatically

**My Recommendation:** Start with **Railway** or **Render** (Option B) - easiest setup, free tier available.

**Action Required:** Tell me which hosting provider you want to use, OR if you already have a server.

---

## 🔧 **STEP 5: YOU Need to Set Up DNS Records**

**What you need to do:**

Once you have a hosting provider/server, you'll need to point your domain to it.

### **DNS Records Needed:**

1. **A Record** (for API subdomain):
   - **Name:** `api`
   - **Type:** A
   - **Value:** Your server IP address
   - **TTL:** 3600 (or default)

2. **A Record** (for www):
   - **Name:** `www`
   - **Type:** A
   - **Value:** Your server IP address (or frontend hosting)
   - **TTL:** 3600

3. **A Record** (for staging - optional):
   - **Name:** `staging`
   - **Type:** A
   - **Value:** Your staging server IP
   - **TTL:** 3600

**Where to do this:**
- Your domain registrar (where you bought aperae.com)
- Or your DNS provider (Cloudflare, Route53, etc.)

**Action Required:** 
- Tell me when DNS is set up
- Share your server IP address (I'll need it for documentation)

---

## 🔧 **STEP 6: YOU Need to Set Up SSL Certificates**

**What you need to do:**

### **Option A: Let's Encrypt (Free, Manual)**
1. Install Certbot on your server
2. Run: `certbot --nginx` (or `--apache`)
3. Follow prompts to get free SSL certificate
4. Auto-renewal is automatic

### **Option B: Cloudflare (Free, Easiest)**
1. Sign up for Cloudflare (free)
2. Add your domain to Cloudflare
3. Change nameservers at your registrar
4. SSL is automatic (flexible SSL)

### **Option C: Hosting Provider SSL (Automatic)**
- Railway, Render, Vercel: SSL is automatic
- Just deploy and it works

**My Recommendation:** If using Railway/Render, SSL is automatic. Otherwise, use Cloudflare.

**Action Required:** 
- Tell me which SSL method you're using
- Confirm when SSL is working (https://api.aperae.com should load)

---

## 🔧 **STEP 7: YOU Need to Deploy Backend**

**What you need to do:**

Deploy your backend to the hosting provider.

**Steps:**
1. Connect your GitHub repo to hosting provider
2. Set environment variables (I'll provide the list)
3. Deploy
4. Test: `https://api.aperae.com/api/health` should work

**Action Required:** 
- Tell me when backend is deployed
- Share the API URL (should be `https://api.aperae.com/api`)

---

## 🔧 **STEP 8: I'll Update Swagger Documentation**

**What I'm doing:**
- Update API documentation with production URL
- Add staging URL option

**What you need to do:** Nothing

**Files I'll modify:**
- `backend/swagger.js` (if exists)

---

## 📝 **Summary: What I Need From You**

Before I can complete everything, I need:

1. ✅ **Hosting Provider Choice** - Which provider are you using?
2. ⏳ **Server IP Address** - What's your server IP? (after hosting setup)
3. ⏳ **DNS Confirmation** - Are DNS records set up?
4. ⏳ **SSL Confirmation** - Is HTTPS working?
5. ⏳ **Deployment Confirmation** - Is backend deployed?

---

## 🚀 **Let's Start!**

**I'll begin with the code changes now. While I do that, please:**

1. **Choose your hosting provider** (or tell me if you already have one)
2. **Let me know when you're ready** for the next steps

**Ready? Let me know and I'll start with the code changes!**

