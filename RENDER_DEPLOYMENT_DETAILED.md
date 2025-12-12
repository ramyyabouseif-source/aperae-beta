# Render Deployment - Detailed Step-by-Step Guide

## 📋 **STEP 2.2: Configure Service Settings (Updated for Current Render Interface)**

Render's interface may vary, but here's what you'll actually see:

### **What You'll See in Render:**

1. **Connect Repository:**
   - Select your GitHub repository
   - Choose the branch (usually `main`)

2. **Basic Settings Section:**
   - **Name:** `pocketsomm-backend` (or any name you prefer)
   - **Region:** Choose closest to you (e.g., Oregon, Ohio)
   - **Branch:** `main` (or your default branch)

3. **Build & Deploy Section:**
   - **Root Directory:** `backend` ⚠️ **IMPORTANT!** This tells Render where your backend code is
   - **Environment:** This is where you'll set Node.js version (may be automatic or in a dropdown)
   - **Build Command:** Render may auto-detect, but you can specify: `npm ci`
   - **Start Command:** Render may auto-detect, but you can specify: `npm start`

**Note:** Render is smart and often auto-detects Node.js projects. If you don't see these fields:
- **Root Directory:** Make sure to set this to `backend` (this is critical!)
- **Build/Start Commands:** Render will likely auto-detect from your `package.json` scripts
- **Runtime:** Render automatically detects Node.js from your `package.json`

### **If Fields Are Missing:**

Render may have simplified the interface. Here's what matters:

1. ✅ **Root Directory = `backend`** (This is the most important!)
2. ✅ **Name = `pocketsomm-backend`** (or your choice)
3. ✅ **Branch = `main`** (or your default branch)

Render will automatically:
- Detect Node.js from `backend/package.json`
- Use `npm ci` or `npm install` for build
- Use `npm start` from your package.json scripts

---

## 📋 **STEP 2.3: Environment Variables (Exact Format)**

### **How to Add Environment Variables in Render:**

1. **In the service configuration page**, look for:
   - "Environment" tab/section
   - OR "Environment Variables" section
   - OR "Env Vars" button

2. **Click "Add Environment Variable"** (or similar button)

3. **For each variable, you'll see two boxes:**

   **Box 1 (NAME_OF_VARIABLE):** Enter the variable name
   - Example: `NODE_ENV`
   - Example: `DATABASE_URL`
   - Example: `JWT_SECRET`
   
   **Box 2 (value):** Enter the variable value
   - Example: `production`
   - Example: `postgresql://user:pass@host:5432/db`
   - Example: `your-secret-key-here`

4. **Click "Add" or "Save"** after each variable

### **Complete List of Variables to Add:**

Add these one by one:

#### **1. Server Configuration:**
```
NAME: NODE_ENV
VALUE: production
```

```
NAME: PORT
VALUE: 3001
```

```
NAME: ALLOWED_ORIGINS
VALUE: https://www.aperae.com,https://api.aperae.com
```

#### **2. Database:**
```
NAME: DATABASE_URL
VALUE: your-supabase-connection-string-here
```
*(Get this from Supabase → Settings → Database → Connection String)*

#### **3. JWT Secrets (Generate First!):**

**Generate secrets on your computer:**
```bash
# Open PowerShell or Terminal
openssl rand -base64 32
```
Run this command **twice** to get two different secrets.

```
NAME: JWT_SECRET
VALUE: [paste first generated secret]
```

```
NAME: REFRESH_SECRET
VALUE: [paste second generated secret]
```

#### **4. API Keys:**
```
NAME: ANTHROPIC_API_KEY
VALUE: sk-ant-your-anthropic-api-key-here
```

#### **5. Google Cloud Vision (if using):**
```
NAME: GOOGLE_APPLICATION_CREDENTIALS
VALUE: /opt/render/project/src/backend/google-credentials.json
```
*(OR use environment variables instead - see below)*

**OR use environment variables:**
```
NAME: GOOGLE_CLOUD_PROJECT_ID
VALUE: your-project-id
```

```
NAME: GOOGLE_CLOUD_CLIENT_EMAIL
VALUE: your-service-account@project.iam.gserviceaccount.com
```

```
NAME: GOOGLE_CLOUD_PRIVATE_KEY
VALUE: "-----BEGIN PRIVATE KEY-----\nYour key here\n-----END PRIVATE KEY-----\n"
```
*(Note: Keep the quotes and \n characters for the private key)*

#### **6. Feature Flags:**
```
NAME: ENABLE_V7_PROMPT
VALUE: true
```

```
NAME: MOCK_MODE
VALUE: false
```

#### **7. Logging:**
```
NAME: LOG_LEVEL
VALUE: info
```

---

## 📋 **GITHUB .gitignore Template**

### **Recommended: Node.js Template**

When creating your GitHub repository, choose:
- **Template:** `Node` or `Node.gitignore`

### **Or Use This Complete .gitignore:**

If you want to create/update your `.gitignore` file manually, here's what should be in it:

```gitignore
# Dependencies
node_modules/
npm-debug.log*
yarn-debug.log*
yarn-error.log*
package-lock.json
yarn.lock

# Environment variables (CRITICAL - Never commit these!)
.env
.env.local
.env.development
.env.staging
.env.production
.env.*.local
backend/.env
backend/.env.local
backend/.env.production
backend/.env.staging

# Build outputs
dist/
build/
.next/
out/
*.tsbuildinfo

# Logs
logs/
*.log
npm-debug.log*
yarn-debug.log*
yarn-error.log*
lerna-debug.log*

# OS files
.DS_Store
.DS_Store?
._*
.Spotlight-V100
.Trashes
ehthumbs.db
Thumbs.db

# IDE files
.vscode/
.idea/
*.swp
*.swo
*~
.project
.classpath
.settings/

# Testing
coverage/
.nyc_output/
*.lcov

# Temporary files
*.tmp
*.temp
.cache/

# Prisma
backend/prisma/migrations/

# Google Cloud credentials (if using file-based)
backend/google-credentials.json
*.json.key
*-credentials.json

# Expo
.expo/
.expo-shared/
web-build/

# React Native
*.jks
*.p8
*.p12
*.key
*.mobileprovision
*.orig.*

# Metro bundler
.metro-health-check*

# TypeScript
*.tsbuildinfo

# Optional: Keep these if you want
# !package-lock.json  # Uncomment if you want to commit lock file
```

### **Most Important Parts:**

**CRITICAL - Never commit these:**
- `.env` files (all variations)
- `node_modules/`
- Credentials files
- Private keys

---

## ✅ **Quick Checklist for Render Setup**

### **Before Deploying:**
- [ ] Repository is connected to GitHub
- [ ] Root Directory is set to `backend`
- [ ] All environment variables are added
- [ ] JWT secrets are generated and added
- [ ] DATABASE_URL is set (from Supabase)

### **After Deploying:**
- [ ] Service shows "Live" status
- [ ] Check logs for any errors
- [ ] Test: `https://your-service.onrender.com/api/health`

---

## 🆘 **Troubleshooting**

### **If Build Fails:**
- Check Root Directory is `backend`
- Check that `backend/package.json` exists
- Check logs for specific error messages

### **If Service Won't Start:**
- Check PORT environment variable (should be 3001)
- Check that `npm start` script exists in `backend/package.json`
- Check logs for startup errors

### **If Environment Variables Not Working:**
- Make sure variable names are exact (case-sensitive)
- Make sure values don't have extra spaces
- Check logs to see if variables are being read

---

**Ready to proceed? Let me know if you need help with any specific step!**
