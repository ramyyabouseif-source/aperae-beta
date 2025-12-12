# Staging Deployment - Step-by-Step Instructions

**Status:** Ready to deploy  
**Estimated Time:** 30 minutes

---

## 🎯 **Division of Work**

### **What I've Done:**
- ✅ Verified CORS configuration includes staging domains
- ✅ Verified Dockerfile is ready
- ✅ Created this step-by-step guide
- ✅ Prepared environment variable template
- ✅ Created verification commands

### **What You Need to Do:**
- Generate JWT secrets (commands provided below)
- Create Render service (step-by-step instructions)
- Add environment variables (copy/paste template)
- Configure DNS in Cloudflare
- Run verification tests

---

## 📋 **STEP 1: Generate JWT Secrets** (2 minutes)

**Run these commands in your terminal:**

```powershell
# Generate JWT_SECRET for staging
openssl rand -base64 32

# Generate REFRESH_SECRET for staging  
openssl rand -base64 32
```

**Save both outputs** - you'll need them for Step 3.

**Example output:**
```
JWT_SECRET:     xK9mP2vQ7wR4tY8uI3oP5aS6dF8gH9jK0lM1nB2vC3xZ4=
REFRESH_SECRET: aB7cD9eF2gH4iJ6kL8mN0oP3qR5sT7uV9wX1yZ3aB5cD7=
```

---

## 📋 **STEP 2: Create Render Service** (5 minutes)

### **2.1 Go to Render Dashboard**

1. Open [Render Dashboard](https://dashboard.render.com/)
2. Make sure you're logged in

### **2.2 Create New Web Service**

1. Click **"New +"** button (top right)
2. Select **"Web Service"**

### **2.3 Connect Repository**

1. Select your GitHub repository (`aperae-beta` or your repo name)
2. Click **"Connect"**

### **2.4 Configure Service Settings**

Fill in these exact values:

| Setting | Value |
|---------|-------|
| **Name** | `aperae-backend-staging` |
| **Region** | `Ohio (US East 2)` (or same as production) |
| **Branch** | `main` |
| **Root Directory** | `backend` |
| **Runtime** | `Docker` |

**Important Notes:**
- When you select **"Docker"** as Runtime, Render will automatically detect the `Dockerfile` in the Root Directory (`backend`)
- You don't need separate fields for "Dockerfile Path" or "Docker Context" - Render handles this automatically
- The Root Directory (`backend`) tells Render where to find the Dockerfile

### **2.5 Build & Deploy Settings**

**For Docker deployments, use these values:**

- **Build Command:** Leave as default (Render will use `docker build` automatically)
  - If field is required and won't accept empty, use: `docker build -t app .`
  - But typically, leaving it empty/default is fine for Docker
  
- **Start Command:** Leave as default (Dockerfile CMD will be used)
  - If field is required and won't accept empty, use: `node server.js`
  - But typically, leaving it empty/default is fine since Dockerfile has `CMD ["node", "server.js"]`
  
- **Plan:** Select **"Free"** (same as production)

**Note:** If Render's UI requires values in Build/Start Command fields:
- **Build Command:** `docker build -t app .` (or leave default if available)
- **Start Command:** `node server.js` (or leave default if available)
- Render will use the Dockerfile's CMD instruction, so these are fallbacks

### **2.6 Create Service**

1. Click **"Create Web Service"**
2. ⚠️ **WAIT** - Don't add environment variables yet!
3. Render will start building - this will fail initially (expected, no env vars yet)
4. You'll add environment variables next

---

## 📋 **STEP 3: Add Environment Variables** (10 minutes)

### **3.1 Go to Environment Variables Section**

1. In your new Render service, click **"Environment"** tab
2. Click **"Add Environment Variable"** button

### **3.2 Add Each Variable**

Add these one by one (click "Add" after each):

#### **Basic Configuration:**

```
Key: NODE_ENV
Value: production
```

```
Key: PORT
Value: 3001
```

#### **Database Connection:**

```
Key: DATABASE_URL
Value: [COPY YOUR PRODUCTION DATABASE_URL HERE]
```

**Note:** Use the SAME Supabase connection string as production (from your production service env vars).

#### **JWT Secrets (Use secrets from Step 1):**

```
Key: JWT_SECRET
Value: [PASTE YOUR JWT_SECRET FROM STEP 1]
```

```
Key: REFRESH_SECRET
Value: [PASTE YOUR REFRESH_SECRET FROM STEP 1]
```

#### **API Keys (Copy from Production):**

Get these from your **production** Render service environment variables:

```
Key: ANTHROPIC_API_KEY
Value: [COPY FROM PRODUCTION]
```

```
Key: GOOGLE_CLOUD_PROJECT_ID
Value: [COPY FROM PRODUCTION]
```

```
Key: GOOGLE_CLOUD_CLIENT_EMAIL
Value: [COPY FROM PRODUCTION]
```

```
Key: GOOGLE_CLOUD_PRIVATE_KEY
Value: [COPY FROM PRODUCTION]
```

**Important:** For `GOOGLE_CLOUD_PRIVATE_KEY`, make sure to include the entire value with quotes if it has newlines.

#### **CORS Configuration:**

```
Key: ALLOWED_ORIGINS
Value: https://staging.aperae.com,https://staging-api.aperae.com,https://api.aperae.com
```

#### **Feature Flags:**

```
Key: ENABLE_V7_PROMPT
Value: true
```

```
Key: ENABLE_ENHANCED_PROMPT
Value: false
```

#### **Rate Limiting:**

```
Key: RATE_LIMIT_MAX_REQUESTS
Value: 100
```

```
Key: RATE_LIMIT_WINDOW_MS
Value: 900000
```

### **3.3 Save and Deploy**

1. After adding all variables, click **"Save Changes"**
2. Render will automatically restart and redeploy
3. Watch the **"Logs"** tab for deployment progress
4. Wait for "Your service is live 🎉" message

---

## 📋 **STEP 4: Configure DNS** (5 minutes)

### **4.1 Get Render Service URL**

1. In Render dashboard, go to your staging service
2. Go to **"Settings"** tab
3. Find **"Auto-Deploy URL"** - it looks like: `aperae-backend-staging-xxxx.onrender.com`
4. **Copy this URL** (you'll need it)

### **4.2 Add DNS Record in Cloudflare**

1. Go to [Cloudflare Dashboard](https://dash.cloudflare.com/)
2. Select your domain (`aperae.com`)
3. Go to **DNS** → **Records**
4. Click **"Add record"**

### **4.3 Configure CNAME Record**

Fill in:

| Field | Value |
|-------|-------|
| **Type** | `CNAME` |
| **Name** | `staging-api` |
| **Target** | `[YOUR_RENDER_SERVICE_URL].onrender.com` |
| **Proxy status** | ✅ **Proxied** (orange cloud) |
| **TTL** | `Auto` |

5. Click **"Save"**

### **4.4 Add Custom Domain in Render**

1. Go back to Render dashboard → Staging service
2. Go to **"Settings"** → **"Custom Domains"**
3. Click **"Add Custom Domain"**
4. Enter: `staging-api.aperae.com`
5. Click **"Add Domain"**
6. Render will provision SSL certificate (takes 5-10 minutes)

---

## 📋 **STEP 5: Wait for SSL Certificate** (5-10 minutes)

1. Wait 5-10 minutes for SSL certificate provisioning
2. Check status in Render dashboard → Settings → Custom Domains
3. When it shows "Certificate issued", proceed to Step 6

---

## 📋 **STEP 6: Verify Deployment** (5 minutes)

**Run these commands to verify:**

### **6.1 Health Check**

```powershell
curl https://staging-api.aperae.com/api/health
```

**Expected:** JSON response with `"status": "ok"`

### **6.2 Test Registration**

```powershell
$timestamp = Get-Date -Format "yyyyMMddHHmmss"
$email = "test-staging-$timestamp@example.com"

curl -X POST https://staging-api.aperae.com/api/auth/register `
  -H "Content-Type: application/json" `
  -d "{`"email`": `"$email`", `"password`": `"Test1234!Test`"}"
```

**Expected:** JSON response with user object and tokens

### **6.3 Check Logs**

1. Go to Render dashboard → Staging service → **"Logs"** tab
2. Verify:
   - ✅ "Session cleanup completed" (database connected)
   - ✅ "Your service is live 🎉"
   - ✅ No critical errors

---

## ✅ **Success Checklist**

- [ ] JWT secrets generated
- [ ] Render service created
- [ ] All environment variables added
- [ ] DNS record added in Cloudflare
- [ ] Custom domain added in Render
- [ ] SSL certificate issued
- [ ] Health endpoint responds
- [ ] Registration endpoint works
- [ ] Logs show no errors

---

## 🚨 **Troubleshooting**

### **Issue: Build Fails**

**Check:**
- All environment variables are set correctly
- DATABASE_URL format is correct (includes `?pgbouncer=true&connection_limit=5`)
- Check logs for specific error

### **Issue: DNS Not Resolving**

**Solution:**
- Wait 5-10 minutes for DNS propagation
- Verify CNAME target is correct
- Check Cloudflare proxy is enabled (orange cloud)

### **Issue: SSL Certificate Failed**

**Solution:**
- Wait 10-15 minutes
- Verify DNS is pointing to Render
- Check custom domain is added in Render

### **Issue: CORS Errors**

**Solution:**
- Verify `ALLOWED_ORIGINS` includes staging domains
- Check `backend/server.js` has staging domains in CORS

---

## 📊 **What's Next?**

After staging is deployed:

1. ✅ Test all API endpoints on staging
2. 🟡 Set up CI/CD pipeline (next priority)
3. 🟡 Configure production logging
4. 🟡 Test features on staging before production

---

**Ready to begin? Start with STEP 1!** 🚀

