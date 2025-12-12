# Staging Environment Deployment Guide

**Status:** Ready to deploy  
**Estimated Time:** 3-4 hours  
**Priority:** High (before production features)

---

## 📋 **Overview**

Set up a staging environment on Render that mirrors production for testing before deploying to production.

**Staging URLs:**
- Backend API: `https://staging-api.aperae.com`
- Frontend: `https://staging.aperae.com` (future)

---

## ✅ **Pre-Deployment Checklist**

- [x] CORS configured for staging domains (`backend/server.js`)
- [x] Frontend has staging API URL support (`src/utils/api.ts`)
- [x] Production environment working on Render
- [ ] Staging service created on Render
- [ ] Staging environment variables configured
- [ ] DNS records configured for staging subdomain
- [ ] Staging database connection configured

---

## 🚀 **Step 1: Create Staging Service on Render**

### **1.1 Create New Web Service**

1. Go to [Render Dashboard](https://dashboard.render.com/)
2. Click **"New +"** → **"Web Service"**
3. Connect your GitHub repository (same as production)
4. Configure service:
   - **Name:** `aperae-backend-staging`
   - **Region:** Same as production (us-east-2)
   - **Branch:** `main` (or `develop` if you have a staging branch)
   - **Root Directory:** `backend`
   - **Environment:** `Docker`
   - **Dockerfile Path:** `backend/Dockerfile`
   - **Docker Context:** `backend`

### **1.2 Configure Build Settings**

- **Build Command:** (Leave empty - Dockerfile handles this)
- **Start Command:** (Leave empty - Dockerfile handles this)
- **Plan:** Free tier (same as production for now)

---

## 🔐 **Step 2: Configure Staging Environment Variables**

Add these environment variables in Render dashboard:

### **Required Variables:**

```bash
# Environment
NODE_ENV=production
PORT=3001

# Database (Use same Supabase instance, or create separate staging database)
DATABASE_URL=postgresql://postgres.andzllkyflcdtrfrqwes:[YOUR-PASSWORD]@aws-1-us-east-2.pooler.supabase.com:6543/postgres?pgbouncer=true&connection_limit=5

# JWT Secrets (Generate NEW secrets for staging)
JWT_SECRET=[GENERATE_NEW_32_CHAR_SECRET]
REFRESH_SECRET=[GENERATE_NEW_32_CHAR_SECRET]

# API Keys (Same as production, or use test keys)
ANTHROPIC_API_KEY=[YOUR_ANTHROPIC_KEY]
GOOGLE_CLOUD_PROJECT_ID=[YOUR_PROJECT_ID]
GOOGLE_CLOUD_CLIENT_EMAIL=[YOUR_SERVICE_ACCOUNT_EMAIL]
GOOGLE_CLOUD_PRIVATE_KEY="[YOUR_PRIVATE_KEY]"

# CORS (Staging-specific)
ALLOWED_ORIGINS=https://staging.aperae.com,https://staging-api.aperae.com,https://api.aperae.com

# Feature Flags (Enable for testing)
ENABLE_V7_PROMPT=true
ENABLE_ENHANCED_PROMPT=false

# Security
RATE_LIMIT_MAX_REQUESTS=100
RATE_LIMIT_WINDOW_MS=900000
```

### **Generate New JWT Secrets:**

```bash
# Generate secure secrets for staging
openssl rand -base64 32  # Use for JWT_SECRET
openssl rand -base64 32  # Use for REFRESH_SECRET
```

**Important:** Use different JWT secrets than production to prevent token cross-use.

---

## 🌐 **Step 3: Configure DNS for Staging**

### **3.1 Add Staging Subdomain in Cloudflare**

1. Go to [Cloudflare Dashboard](https://dash.cloudflare.com/)
2. Select your domain (`aperae.com`)
3. Go to **DNS** → **Records**
4. Add CNAME record:
   - **Type:** `CNAME`
   - **Name:** `staging-api`
   - **Target:** `[YOUR_RENDER_STAGING_SERVICE_URL].onrender.com`
   - **Proxy status:** ✅ Proxied (orange cloud)
   - **TTL:** Auto

### **3.2 Verify DNS**

Wait 1-2 minutes, then verify:

```bash
# Check DNS propagation
nslookup staging-api.aperae.com

# Should resolve to Render IP
```

---

## 🔧 **Step 4: Update Render Service Settings**

After DNS is configured:

1. Go to Render dashboard → Staging service
2. Go to **Settings** → **Custom Domain**
3. Add custom domain: `staging-api.aperae.com`
4. Render will automatically provision SSL certificate

**Wait 5-10 minutes** for SSL certificate provisioning.

---

## ✅ **Step 5: Verify Staging Deployment**

### **5.1 Health Check**

```bash
curl https://staging-api.aperae.com/api/health
```

**Expected response:**
```json
{
  "status": "ok",
  "timestamp": "...",
  "uptime": ...
}
```

### **5.2 Test API Endpoint**

```bash
# Test registration (use unique email)
curl -X POST https://staging-api.aperae.com/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test-staging@example.com",
    "password": "Test1234!Test"
  }'
```

### **5.3 Check Logs**

1. Go to Render dashboard → Staging service
2. Click **"Logs"** tab
3. Verify:
   - ✅ Database connection successful
   - ✅ Server started successfully
   - ✅ No critical errors

---

## 🔍 **Step 6: Staging-Specific Configuration**

### **6.1 Database Considerations**

**Option A: Shared Database (Simpler)**
- Use same Supabase instance as production
- Add `staging_` prefix to test data
- **Pros:** Simple, no additional setup
- **Cons:** Risk of test data affecting production

**Option B: Separate Staging Database (Recommended)**
- Create new Supabase project for staging
- Separate `DATABASE_URL` for staging
- **Pros:** Complete isolation
- **Cons:** Additional setup and cost

**Recommendation:** Start with Option A for initial setup, migrate to Option B before production launch.

### **6.2 Feature Flags**

Enable testing features in staging:
```bash
ENABLE_V7_PROMPT=true
ENABLE_ENHANCED_PROMPT=true
```

---

## 📱 **Step 7: Update Frontend for Staging**

### **7.1 Configure Staging API URL**

The frontend already supports staging via environment variable:

**Option A: Environment Variable (Recommended)**
```bash
# In your frontend build/deployment
EXPO_PUBLIC_ENV=staging
# or
EXPO_PUBLIC_API_URL=https://staging-api.aperae.com/api
```

**Option B: Manual Override**
If testing locally, update `src/utils/api.ts` temporarily:
```typescript
// For testing staging API
return 'https://staging-api.aperae.com/api';
```

---

## 🔄 **Step 8: Set Up Auto-Deploy (Optional)**

### **8.1 Branch-Based Deployment**

1. Create `develop` or `staging` branch
2. In Render staging service settings:
   - **Branch:** `develop` (or `staging`)
   - **Auto-Deploy:** Enabled
3. Push to `develop` branch → Auto-deploys to staging
4. Merge `develop` → `main` → Deploys to production

### **8.2 Manual Deploy**

For now, you can manually trigger deployments:
1. Render dashboard → Staging service
2. Click **"Manual Deploy"** → **"Deploy latest commit"**

---

## ✅ **Step 9: Verification Checklist**

- [ ] Staging service deployed successfully
- [ ] Health endpoint responds (`/api/health`)
- [ ] Database connection working
- [ ] User registration works
- [ ] User login works
- [ ] Session storage working
- [ ] API endpoints responding
- [ ] CORS configured correctly
- [ ] SSL certificate valid (HTTPS)
- [ ] Logs show no critical errors

---

## 🧪 **Step 10: Test Staging Environment**

### **10.1 Full API Test**

Use the session persistence test against staging:

```powershell
cd backend
.\test-session-persistence.ps1 -BaseUrl "https://staging-api.aperae.com"
```

### **10.2 Test Checklist**

- [ ] Registration endpoint
- [ ] Login endpoint
- [ ] Token refresh
- [ ] Logout
- [ ] Wine recommendations
- [ ] Menu OCR (if available)
- [ ] Error handling

---

## 📊 **Monitoring & Logs**

### **Access Staging Logs**

1. Render dashboard → `aperae-backend-staging`
2. Click **"Logs"** tab
3. Monitor for:
   - Database connection issues
   - Authentication errors
   - API errors
   - Performance issues

### **Set Up Alerts (Optional)**

1. Render dashboard → Service settings
2. Configure email notifications for:
   - Deployment failures
   - Service crashes
   - Health check failures

---

## 🔄 **Deployment Workflow**

### **Recommended Workflow:**

```
1. Feature Development
   ↓
2. Test Locally
   ↓
3. Deploy to Staging (auto or manual)
   ↓
4. Test on Staging
   ↓
5. Fix Issues (if any)
   ↓
6. Merge to Main
   ↓
7. Deploy to Production
```

---

## 🚨 **Troubleshooting**

### **Issue: DNS Not Resolving**

**Solution:**
- Wait 5-10 minutes for DNS propagation
- Check Cloudflare DNS records
- Verify CNAME target is correct

### **Issue: SSL Certificate Failed**

**Solution:**
- Wait 10-15 minutes for certificate provisioning
- Check custom domain is added in Render
- Verify DNS is pointing to Render

### **Issue: CORS Errors**

**Solution:**
- Verify `ALLOWED_ORIGINS` includes staging domains
- Check frontend is using correct API URL
- Review `backend/server.js` CORS configuration

### **Issue: Database Connection Failed**

**Solution:**
- Verify `DATABASE_URL` is correct
- Check Supabase connection string format
- Ensure SSL parameters included (`?sslmode=require`)

---

## 📝 **Environment Variable Reference**

### **Staging-Specific Variables:**

| Variable | Value | Notes |
|----------|-------|-------|
| `NODE_ENV` | `production` | Use production mode even in staging |
| `ALLOWED_ORIGINS` | `https://staging.aperae.com,https://staging-api.aperae.com` | Staging domains |
| `JWT_SECRET` | `[NEW_SECRET]` | Different from production |
| `REFRESH_SECRET` | `[NEW_SECRET]` | Different from production |
| `DATABASE_URL` | `[STAGING_DB_URL]` | Can use same as prod initially |

---

## ✅ **Completion Checklist**

- [ ] Staging service created on Render
- [ ] Environment variables configured
- [ ] DNS records added (staging-api.aperae.com)
- [ ] SSL certificate provisioned
- [ ] Health endpoint working
- [ ] API endpoints tested
- [ ] Frontend configured for staging
- [ ] Deployment workflow documented
- [ ] Monitoring set up

---

## 🎯 **Next Steps After Staging Setup**

1. ✅ **Staging Deployment** - Complete (this guide)
2. 🟡 **CI/CD Pipeline Completion** - Next (2-3 hours)
3. 🟡 **Production Logging Aggregation** - After CI/CD (2-3 hours)
4. 🟡 **Feature Testing** - Test new features on staging first

---

## 📚 **Related Documentation**

- `RENDER_DEPLOYMENT_STATUS.md` - Production deployment status
- `DOMAIN_SETUP_STEP_BY_STEP.md` - Domain setup guide
- `SESSION_STORAGE_VERIFICATION_RESULTS.md` - Session storage tests
- `SUPABASE_CONNECTION_STRING_COMPARISON.md` - Database connection guide

---

**Status:** Ready to deploy  
**Last Updated:** December 12, 2025  
**Estimated Time:** 3-4 hours

