# Staging Deployment - Quick Start

**Ready to deploy? Follow these steps in order!**

---

## 🎯 **What I've Prepared:**

✅ Verified code is ready (CORS configured)  
✅ Created step-by-step instructions  
✅ Created secret generation script  
✅ Prepared environment variable checklist  

---

## 👤 **What You Need to Do:**

### **1. Generate Secrets** (1 minute)

```powershell
cd backend
.\generate-staging-secrets.ps1
```

**Or manually:**
```powershell
openssl rand -base64 32  # JWT_SECRET
openssl rand -base64 32  # REFRESH_SECRET
```

**Save both outputs!**

---

### **2. Create Render Service** (5 minutes)

📖 **Full instructions:** See `STAGING_DEPLOYMENT_STEPS.md` → **STEP 2**

**Quick steps:**
1. Go to [Render Dashboard](https://dashboard.render.com/)
2. Click **"New +"** → **"Web Service"**
3. Connect your GitHub repo
4. Configure:
   - Name: `aperae-backend-staging`
   - Root Directory: `backend`
   - Runtime: `Docker`
   - Dockerfile: `backend/Dockerfile`
5. Click **"Create Web Service"**

---

### **3. Add Environment Variables** (10 minutes)

📖 **Full list:** See `STAGING_DEPLOYMENT_STEPS.md` → **STEP 3**

**Quick checklist:**
- [ ] `NODE_ENV=production`
- [ ] `PORT=3001`
- [ ] `DATABASE_URL=[copy from production]`
- [ ] `JWT_SECRET=[from step 1]`
- [ ] `REFRESH_SECRET=[from step 1]`
- [ ] `ANTHROPIC_API_KEY=[copy from production]`
- [ ] `GOOGLE_CLOUD_PROJECT_ID=[copy from production]`
- [ ] `GOOGLE_CLOUD_CLIENT_EMAIL=[copy from production]`
- [ ] `GOOGLE_CLOUD_PRIVATE_KEY=[copy from production]`
- [ ] `ALLOWED_ORIGINS=https://staging.aperae.com,https://staging-api.aperae.com,https://api.aperae.com`
- [ ] `ENABLE_V7_PROMPT=true`
- [ ] `RATE_LIMIT_MAX_REQUESTS=100`
- [ ] `RATE_LIMIT_WINDOW_MS=900000`

**Copy all variables from production service, except:**
- Use NEW `JWT_SECRET` and `REFRESH_SECRET` (from step 1)
- Use staging `ALLOWED_ORIGINS`

---

### **4. Configure DNS** (5 minutes)

📖 **Full instructions:** See `STAGING_DEPLOYMENT_STEPS.md` → **STEP 4**

**Quick steps:**
1. Get Render service URL (Settings → Auto-Deploy URL)
2. Go to Cloudflare → DNS → Add record:
   - Type: `CNAME`
   - Name: `staging-api`
   - Target: `[your-render-url].onrender.com`
   - Proxy: ✅ Enabled
3. In Render → Settings → Custom Domains → Add: `staging-api.aperae.com`
4. Wait 5-10 minutes for SSL

---

### **5. Verify** (2 minutes)

```powershell
# Health check
curl https://staging-api.aperae.com/api/health

# Test registration
curl -X POST https://staging-api.aperae.com/api/auth/register `
  -H "Content-Type: application/json" `
  -d '{"email":"test@example.com","password":"Test1234!Test"}'
```

---

## 📚 **Full Documentation:**

- **Detailed Steps:** `STAGING_DEPLOYMENT_STEPS.md`
- **Complete Guide:** `STAGING_DEPLOYMENT_GUIDE.md`
- **Action Plan:** `STAGING_DEPLOYMENT_ACTION_PLAN.md`

---

## ⏱️ **Estimated Time:** 30 minutes

**Ready? Start with Step 1!** 🚀




