# Render - Create Staging Service - Complete Step-by-Step Guide

**Service Name:** `aperae-backend-staging-1`  
**Date:** December 12, 2025

---

## 🚀 **Step 1: Start Creating Service**

1. Go to [Render Dashboard](https://dashboard.render.com/)
2. Click **"New +"** button (top right)
3. Select **"Web Service"**

---

## 📋 **Step 2: Connect Repository**

1. You'll see a list of your GitHub repositories
2. Find and select: `aperae-beta` (or your repository name)
3. Click **"Connect"** button

---

## ⚙️ **Step 3: Configure Service Settings**

Fill in these fields **exactly** as shown:

### **Basic Settings:**

| Field | Value | Notes |
|-------|-------|-------|
| **Name** | `aperae-backend-staging-1` | Service identifier |
| **Region** | `Ohio (US East 2)` | Or same region as production |
| **Branch** | `main` | Git branch to deploy from |

### **Build Settings:**

| Field | Value | Notes |
|-------|-------|-------|
| **Root Directory** | `backend` | Where Dockerfile is located |
| **Runtime** | `Docker` | **CRITICAL: Must be "Docker"** |

**Important for Runtime:**
- Look for a dropdown/selector that says "Runtime" or "Environment"
- Select **"Docker"** from the options
- This is the most important setting!

### **Build & Deploy Commands:**

After selecting "Docker" as Runtime, you might see:

| Field | Value | Notes |
|-------|-------|-------|
| **Build Command** | *(Leave empty if possible)* | If required, use: `echo "Docker build"` |
| **Start Command** | *(Leave empty if possible)* | If required, use: `echo "Docker start"` |

**If fields say "Cannot be blank":**
- **Build Command:** `echo "Docker build"`
- **Start Command:** `echo "Docker start"`

**Note:** When Runtime is "Docker", Render handles the build automatically. These commands are just to satisfy field requirements.

### **Plan:**

| Field | Value |
|-------|-------|
| **Plan** | `Free` |

---

## ✅ **Step 4: Review and Create**

1. Review all settings:
   - ✅ Name: `aperae-backend-staging-1`
   - ✅ Region: `Ohio (US East 2)`
   - ✅ Branch: `main`
   - ✅ Root Directory: `backend`
   - ✅ **Runtime: `Docker`** ← Most important!
   - ✅ Plan: `Free`

2. Click **"Create Web Service"**

3. ⚠️ **WAIT** - Don't add environment variables yet!
   - Render will start building
   - It will likely fail initially (expected - no env vars yet)
   - That's okay - we'll add environment variables next

---

## 🔍 **Step 5: Verify Runtime is Docker**

After creating, immediately check:

1. Go to **Settings** tab
2. Look at **"Build & Deploy"** section
3. Verify **Runtime** shows **"Docker"**
4. If it shows "Node" or something else, you need to fix it (see troubleshooting)

---

## 📝 **Step 6: Add Environment Variables**

Once service is created, go to **"Environment"** tab and add these:

### **Basic Configuration:**

```
NODE_ENV = production
PORT = 3001
```

### **Database:**

```
DATABASE_URL = [Copy from production service - same Supabase connection string]
```

### **JWT Secrets (From Step 1 of deployment guide):**

```
JWT_SECRET = kTVMMOrb+hWk4huSxUoRI4cOWbnzxIKrXYiGsmLOGZo=
REFRESH_SECRET = cLH1F3regIkSnTjqOY+D20uzLxj8Cr+t3x7QO+OijH8=
```

### **API Keys:**

```
ANTHROPIC_API_KEY = [Copy from production service]
```

### **Google Cloud (Optional - for OCR):**

```
GOOGLE_CLOUD_PROJECT_ID = pocketsomm-vision-api
GOOGLE_CLOUD_CLIENT_EMAIL = pocketsomm-vision-service@pocketsomm-vision-api.iam.gserviceaccount.com
GOOGLE_CLOUD_PRIVATE_KEY = [Your full private key from JSON file]
```

### **CORS:**

```
ALLOWED_ORIGINS = https://staging.aperae.com,https://staging-api.aperae.com,https://api.aperae.com
```

### **Feature Flags:**

```
ENABLE_V7_PROMPT = true
ENABLE_ENHANCED_PROMPT = false
```

### **Rate Limiting:**

```
RATE_LIMIT_MAX_REQUESTS = 100
RATE_LIMIT_WINDOW_MS = 900000
```

---

## 🚨 **Troubleshooting**

### **Issue: Can't find "Runtime" field**

**Solution:**
- Look for "Environment" or "Build Environment" dropdown
- Or check if there's a "Dockerfile" option
- If you can't find it, the service might default to Node.js
- You may need to delete and recreate, making sure to select Docker during creation

### **Issue: Runtime shows "Node" after creation**

**Solution:**
- Go to Settings → Build & Deploy
- Look for Runtime/Environment dropdown
- Change to "Docker"
- If you can't change it, delete service and recreate with Docker selected

### **Issue: Build Command/Start Command required but Docker runtime**

**Solution:**
- Use minimal commands: `echo "Docker build"` and `echo "Docker start"`
- Render will still use Dockerfile automatically
- These just satisfy the field requirement

---

## ✅ **Success Indicators**

After creating with Docker runtime, you should see in logs:

```
==> Using Dockerfile backend/Dockerfile
==> Building Docker image...
=> [internal] load build definition from Dockerfile
=> [1/8] FROM node:18-alpine
...
```

**NOT:**
```
==> Using Node.js version 22.16.0
```

---

## 📋 **Quick Checklist**

- [ ] Service name: `aperae-backend-staging-1`
- [ ] Region: `Ohio (US East 2)`
- [ ] Branch: `main`
- [ ] Root Directory: `backend`
- [ ] **Runtime: `Docker`** ← Critical!
- [ ] Build Command: Empty or `echo "Docker build"`
- [ ] Start Command: Empty or `echo "Docker start"`
- [ ] Plan: `Free`
- [ ] Click "Create Web Service"
- [ ] Verify Runtime is "Docker" in Settings
- [ ] Add environment variables

---

**The most important step is selecting "Docker" as Runtime during service creation!** ✅

