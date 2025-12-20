# Render + Cloudflare + GoDaddy Setup Guide

## 🎯 Overview

**Setup Flow:** GoDaddy Domain → Cloudflare DNS → Render Hosting

**Architecture:**
- **Domain:** aperae.com (purchased at GoDaddy)
- **DNS/SSL:** Cloudflare (free SSL, better performance)
- **Hosting:** Render (backend API)
- **Subdomains:** api.aperae.com, www.aperae.com (FREE - created via DNS)

---

## 📋 **STEP-BY-STEP SETUP**

### **PHASE 1: Connect Domain to Cloudflare**

#### **Step 1.1: Add Domain to Cloudflare**

1. **Log in to Cloudflare** (https://dash.cloudflare.com)
2. **Click "Add a Site"**
3. **Enter:** `aperae.com`
4. **Select Plan:** Choose "Free" plan (includes SSL)
5. **Click "Continue"**

#### **Step 1.2: Cloudflare Scans Your DNS Records**

- Cloudflare will scan GoDaddy's DNS records
- **Review the records** - it should find existing records
- **Click "Continue"**

#### **Step 1.3: Update Nameservers at GoDaddy**

Cloudflare will give you **two nameservers**, something like:
```
dave.ns.cloudflare.com
lucy.ns.cloudflare.com
```

**At GoDaddy:**
1. **Log in to GoDaddy** (https://www.godaddy.com)
2. **Go to:** My Products → Domain Manager
3. **Click on:** aperae.com
4. **Find:** "Nameservers" or "DNS"
5. **Change nameservers to:**
   - Replace existing nameservers with Cloudflare's nameservers
   - Example:
     ```
     dave.ns.cloudflare.com
     lucy.ns.cloudflare.com
     ```
6. **Save changes**

**Wait Time:** 24-48 hours for nameserver changes (usually 5-30 minutes)

#### **Step 1.4: Verify Nameservers Changed**

1. **Back in Cloudflare**, click "Check nameservers"
2. **Wait until** it shows "Active" (green checkmark)
3. **DNS is now managed by Cloudflare!** ✅

---

### **PHASE 2: Deploy Backend to Render**

#### **Step 2.1: Create Render Service**

1. **Log in to Render** (https://dashboard.render.com)
2. **Click:** "New +" → "Web Service"
3. **Connect your GitHub repository:**
   - If not connected: Click "Connect GitHub"
   - Authorize Render to access your repos
   - Select your PocketSomm repository

#### **Step 2.2: Configure Service Settings**

**Basic Settings:**
- **Name:** `pocketsomm-backend` (or any name)
- **Region:** Choose closest to you (e.g., Oregon, Ohio)
- **Branch:** `main` (or your default branch)
- **Root Directory:** `backend` (important!)
- **Runtime:** `Node`
- **Build Command:** `npm ci`
- **Start Command:** `npm start`

**Environment:**
- **Node Version:** `20` (or whatever you're using)

#### **Step 2.3: Set Environment Variables**

Click "Environment" tab and add these variables:

**Required:**
```bash
NODE_ENV=production
PORT=3001
ALLOWED_ORIGINS=https://www.aperae.com,https://api.aperae.com
DATABASE_URL=your-supabase-connection-string
JWT_SECRET=your-jwt-secret-generate-with-openssl-rand-base64-32
REFRESH_SECRET=your-refresh-secret-generate-with-openssl-rand-base64-32
ANTHROPIC_API_KEY=your-anthropic-api-key
```

**Feature Flags:**
```bash
ENABLE_V7_PROMPT=true
MOCK_MODE=false
```

**Google Cloud Vision (if using):**
```bash
GOOGLE_APPLICATION_CREDENTIALS=/opt/render/project/src/backend/google-credentials.json
# OR use environment variables instead
GOOGLE_CLOUD_PROJECT_ID=your-project-id
GOOGLE_CLOUD_CLIENT_EMAIL=your-service-account@project.iam.gserviceaccount.com
GOOGLE_CLOUD_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
```

**Click "Save Changes"**

#### **Step 2.4: Deploy**

1. **Click "Create Web Service"**
2. **Render will:**
   - Clone your repo
   - Install dependencies
   - Build your app
   - Start the server
3. **Wait for deployment** (usually 2-5 minutes)
4. **You'll get a Render URL:** `https://pocketsomm-backend.onrender.com`

**✅ Your backend is now live on Render!**

---

### **PHASE 3: Configure DNS Records in Cloudflare**

Now we'll create subdomains to point to your Render service.

#### **Step 3.1: Get Your Render Service URL**

1. **In Render dashboard**, go to your service
2. **Find the service URL:** `https://pocketsomm-backend.onrender.com`
3. **Copy this URL** - you'll need it

**Important:** Render URLs look like `https://service-name.onrender.com`

#### **Step 3.2: Create DNS Records in Cloudflare**

1. **Go to Cloudflare dashboard**
2. **Select:** aperae.com
3. **Click:** "DNS" → "Records"

**Create these records:**

##### **Record 1: API Subdomain (CNAME)**
- **Type:** CNAME
- **Name:** `api`
- **Target:** `pocketsomm-backend.onrender.com` (your Render URL without https://)
- **Proxy status:** ✅ Proxied (orange cloud) - This enables Cloudflare SSL
- **TTL:** Auto
- **Click "Save"**

##### **Record 2: WWW Subdomain (CNAME or A Record)**

**Option A: If you want www.aperae.com to point to your backend:**
- **Type:** CNAME
- **Name:** `www`
- **Target:** `pocketsomm-backend.onrender.com`
- **Proxy status:** ✅ Proxied (orange cloud)
- **TTL:** Auto
- **Click "Save"**

**Option B: If you want www.aperae.com for a future frontend:**
- Leave it for now, or point to a placeholder
- You can add it later

##### **Record 3: Root Domain (Apex) - Optional**

If you want `aperae.com` (without www) to work:

**Render doesn't support apex domains directly**, so:
- **Option 1:** Use Cloudflare's "CNAME Flattening" (automatic)
- **Option 2:** Create an A record pointing to Render's IP (ask Render support for IP)
- **Option 3:** Redirect apex to www (set up in Cloudflare Page Rules)

**For now, focus on `api.aperae.com` - that's what we need!**

#### **Step 3.3: Verify DNS Records**

**Check your DNS records look like this:**

| Type | Name | Target | Proxy |
|------|------|--------|-------|
| CNAME | api | pocketsomm-backend.onrender.com | ✅ Proxied |
| CNAME | www | pocketsomm-backend.onrender.com | ✅ Proxied |

**✅ DNS is now configured!**

---

### **PHASE 4: Configure SSL (Automatic with Cloudflare!)**

**Good news:** SSL is **automatic** when using Cloudflare with "Proxied" (orange cloud)!

1. **In Cloudflare**, go to "SSL/TLS"
2. **SSL/TLS encryption mode:** Select "Full" or "Full (strict)"
   - **Full:** Works with self-signed certs
   - **Full (strict):** Requires valid certificate (recommended)
3. **Cloudflare will automatically:**
   - Issue SSL certificates
   - Enable HTTPS
   - Handle certificate renewal

**✅ SSL is now active!**

**Test it:**
- Visit: `https://api.aperae.com`
- You should see your backend (or a Render error page if not deployed yet)
- Browser should show padlock (🔒) = SSL working!

---

### **PHASE 5: Configure Render to Accept Custom Domain**

#### **Step 5.1: Add Custom Domain in Render**

1. **In Render dashboard**, go to your service
2. **Click:** "Settings" → "Custom Domains"
3. **Click:** "Add Custom Domain"
4. **Enter:** `api.aperae.com`
5. **Click:** "Add"

#### **Step 5.2: Verify Domain**

Render will verify the domain:
- Checks DNS records
- Verifies you control the domain
- **Status will show:** "Verified" ✅

**If verification fails:**
- Make sure DNS records are correct
- Wait 5-10 minutes for DNS propagation
- Try again

---

## ✅ **VERIFICATION CHECKLIST**

After setup, verify everything works:

### **DNS Verification**
- [ ] `api.aperae.com` resolves to your Render service
- [ ] Can access `https://api.aperae.com` in browser
- [ ] Browser shows padlock (SSL working)

### **Backend Verification**
- [ ] Health endpoint works: `https://api.aperae.com/api/health`
- [ ] Should return: `{"status":"ok"}` or similar

### **SSL Verification**
- [ ] HTTPS works (no "Not Secure" warning)
- [ ] Padlock icon in browser
- [ ] SSL Labs test: https://www.ssllabs.com/ssltest/analyze.html?d=api.aperae.com

---

## 🔧 **TROUBLESHOOTING**

### **DNS Not Working?**
- **Wait longer:** DNS can take up to 48 hours (usually 5-30 minutes)
- **Check nameservers:** Make sure GoDaddy has Cloudflare nameservers
- **Flush DNS cache:** `ipconfig /flushdns` (Windows) or `sudo dscacheutil -flushcache` (Mac)

### **SSL Not Working?**
- **Check Proxy status:** Must be "Proxied" (orange cloud) in Cloudflare
- **Check SSL mode:** Should be "Full" or "Full (strict)"
- **Wait a few minutes:** SSL setup can take 5-10 minutes

### **Render Service Not Accessible?**
- **Check deployment:** Make sure Render service is running
- **Check logs:** View logs in Render dashboard
- **Check environment variables:** Make sure all required vars are set
- **Check PORT:** Render uses PORT environment variable automatically

### **Can't Access Custom Domain?**
- **Verify DNS records:** Make sure CNAME points to correct Render URL
- **Verify in Render:** Check that custom domain is added and verified
- **Wait for propagation:** DNS changes can take time

---

## 📝 **SUMMARY OF WHAT WE'RE CREATING**

### **Subdomains (FREE - No Purchase Needed!)**
- ✅ `api.aperae.com` → Points to Render backend
- ✅ `www.aperae.com` → Points to Render backend (or future frontend)
- ✅ `aperae.com` → Can redirect to www or point to service

### **DNS Setup**
- ✅ Domain managed by Cloudflare
- ✅ DNS records created in Cloudflare
- ✅ Nameservers updated at GoDaddy

### **SSL Setup**
- ✅ Free SSL from Cloudflare
- ✅ Automatic certificate renewal
- ✅ HTTPS enabled for all subdomains

### **Hosting Setup**
- ✅ Backend deployed to Render
- ✅ Custom domain configured
- ✅ Environment variables set

---

## 🎯 **NEXT STEPS**

1. ✅ **Connect domain to Cloudflare** (Phase 1)
2. ✅ **Deploy backend to Render** (Phase 2)
3. ✅ **Configure DNS records** (Phase 3)
4. ✅ **Verify SSL is working** (Phase 4)
5. ✅ **Add custom domain in Render** (Phase 5)
6. ✅ **Test everything works!**

---

**Ready to start? Begin with Phase 1 - connecting your domain to Cloudflare!**





