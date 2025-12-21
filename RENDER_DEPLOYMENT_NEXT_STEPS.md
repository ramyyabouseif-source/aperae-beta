# Render Deployment - Next Steps After Creating Service

## ✅ **What Just Happened**

You've created a Web Service in Render and deployment has started. Now we need to:

1. ⏳ **Wait for initial deployment** (may fail - that's okay, we need to add environment variables)
2. ✅ **Add environment variables** (required for service to work)
3. ✅ **Verify deployment** (check logs and health endpoint)
4. ✅ **Get Render URL** (for DNS configuration)

---

## 📋 **STEP 1: Check Deployment Status**

### **What You Should See:**

In Render dashboard, you should see:
- **Service name:** `pocketsomm-backend` (or whatever you named it)
- **Status:** "Building" or "Deploying" or "Live" or "Build Failed"
- **URL:** Something like `https://pocketsomm-backend.onrender.com`

### **If Status Shows "Build Failed":**
- ✅ **This is normal!** We haven't added environment variables yet
- ✅ **Don't worry** - we'll fix this in the next step

### **If Status Shows "Live":**
- ✅ Great! But we still need to add environment variables
- ✅ Service may not work correctly until variables are added

---

## 📋 **STEP 2: Add Environment Variables (CRITICAL!)**

### **Where to Find Environment Variables:**

1. **In Render dashboard**, click on your service (`pocketsomm-backend`)
2. **Look for:** "Environment" tab (in the top menu)
3. **OR:** "Environment Variables" section (in the sidebar)
4. **OR:** "Env" button

### **How to Add Variables:**

**For each variable:**
1. **Click:** "Add Environment Variable" (or "+" button)
2. **Box 1 (KEY/NAME):** Enter variable name (e.g., `NODE_ENV`)
3. **Box 2 (VALUE):** Enter variable value (e.g., `production`)
4. **Click:** "Save" or "Add"

### **Complete List of Variables to Add:**

Add these **one by one**:

#### **1. Server Configuration:**
```
KEY: NODE_ENV
VALUE: production
```

```
KEY: PORT
VALUE: 3001
```

```
KEY: ALLOWED_ORIGINS
VALUE: https://www.aperae.com,https://api.aperae.com
```

#### **2. Database (REQUIRED):**
```
KEY: DATABASE_URL
VALUE: [Your Supabase connection string]
```
*(Get this from Supabase → Settings → Database → Connection String)*

**How to get DATABASE_URL:**
1. Go to Supabase dashboard
2. Click on your project
3. Go to: Settings → Database
4. Find: "Connection string" section
5. Copy the "URI" connection string
6. It looks like: `postgresql://postgres:[PASSWORD]@[HOST]:5432/postgres`
7. Paste into Render's VALUE box

#### **3. JWT Secrets (REQUIRED - Generate First!):**

**Generate secrets in PowerShell:**
```powershell
# Generate JWT_SECRET
openssl rand -base64 32

# Copy the output, then run again for REFRESH_SECRET
openssl rand -base64 32
```

```
KEY: JWT_SECRET
VALUE: [paste first generated secret]
```

```
KEY: REFRESH_SECRET
VALUE: [paste second generated secret]
```

#### **4. API Keys:**
```
KEY: ANTHROPIC_API_KEY
VALUE: sk-ant-your-anthropic-api-key-here
```

#### **5. Google Cloud Vision (if using):**

**Option A: Use environment variables (recommended):**
```
KEY: GOOGLE_CLOUD_PROJECT_ID
VALUE: your-project-id
```

```
KEY: GOOGLE_CLOUD_CLIENT_EMAIL
VALUE: your-service-account@project.iam.gserviceaccount.com
```

```
KEY: GOOGLE_CLOUD_PRIVATE_KEY
VALUE: "-----BEGIN PRIVATE KEY-----\nYour key here\n-----END PRIVATE KEY-----\n"
```
*(Keep the quotes and \n characters)*

**Option B: Use credentials file (if you prefer):**
```
KEY: GOOGLE_APPLICATION_CREDENTIALS
VALUE: /opt/render/project/src/backend/google-credentials.json
```
*(Then upload the file separately - more complex)*

#### **6. Feature Flags:**
```
KEY: ENABLE_V7_PROMPT
VALUE: true
```

```
KEY: MOCK_MODE
VALUE: false
```

#### **7. Logging:**
```
KEY: LOG_LEVEL
VALUE: info
```

---

## 📋 **STEP 3: Save and Redeploy**

### **After Adding All Variables:**

1. **Click:** "Save Changes" (if there's a save button)
2. **Render will automatically:**
   - Save environment variables
   - Trigger a new deployment
   - Rebuild with the new variables

### **Watch the Deployment:**

1. **Click:** "Logs" tab
2. **Watch for:**
   - "Installing dependencies..."
   - "Build successful"
   - "Starting service..."
   - "Listening on port 3001" (or similar)

---

## 📋 **STEP 4: Verify Deployment**

### **Check Service Status:**

1. **In Render dashboard**, your service should show:
   - **Status:** "Live" (green)
   - **URL:** `https://pocketsomm-backend.onrender.com` (or similar)

### **Test Health Endpoint:**

1. **Copy your Render URL** (from dashboard)
2. **Open browser** and go to: `https://your-service.onrender.com/api/health`
3. **You should see:** JSON response like `{"status":"ok"}` or similar

### **If Health Endpoint Works:**
- ✅ **Deployment successful!**
- ✅ **Service is running!**
- ✅ **Ready for DNS configuration!**

### **If Health Endpoint Fails:**
- ⚠️ Check logs in Render
- ⚠️ Verify all environment variables are set
- ⚠️ Check for error messages

---

## 📋 **STEP 5: Get Your Render URL**

### **What You Need:**

1. **In Render dashboard**, find your service
2. **Copy the URL:** It looks like `https://pocketsomm-backend.onrender.com`
3. **Save this URL** - you'll need it for DNS configuration

**Important:** This is the URL we'll use to create the CNAME record in Cloudflare.

---

## 🆘 **Troubleshooting**

### **Build Failed:**
- **Check:** Root Directory is set to `backend`
- **Check:** All required environment variables are added
- **Check:** Logs for specific error messages

### **Service Won't Start:**
- **Check:** PORT environment variable is set to `3001`
- **Check:** DATABASE_URL is correct
- **Check:** JWT_SECRET and REFRESH_SECRET are set
- **Check:** Logs for startup errors

### **Health Endpoint Returns Error:**
- **Check:** All environment variables are saved
- **Check:** Service status is "Live"
- **Check:** Logs for runtime errors

---

## ✅ **Next Steps After Deployment Works:**

1. ✅ **Get Render URL** (for DNS)
2. ⏳ **Configure DNS in Cloudflare** (create CNAME record)
3. ⏳ **Add custom domain in Render** (api.aperae.com)
4. ⏳ **Verify SSL is working** (automatic with Cloudflare)

---

**Tell me:**
1. **What status do you see** in Render? (Building, Live, Failed?)
2. **Do you see the Environment Variables section?**
3. **What's your Render service URL?**

Then I'll help you add the environment variables!







