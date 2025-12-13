# Fix Render Docker Runtime Configuration

**Issue:** Service is using Node.js runtime instead of Docker runtime  
**Symptom:** Logs show "Using Node.js version..." instead of Docker build  
**Fix:** Verify and correctly set Runtime to "Docker"

---

## 🚨 **The Problem**

Your logs show:
```
==> Using Node.js version 22.16.0 (default)
==> Running build command 'echo "Building with Dockerfile"'
```

This means Render is **NOT** using Docker runtime - it's using Node.js runtime instead!

---

## ✅ **Solution: Verify Runtime Setting**

### **Step 1: Check Current Runtime**

1. Go to [Render Dashboard](https://dashboard.render.com/)
2. Open your **staging service** (`aperae-backend-staging`)
3. Go to **"Settings"** tab
4. Look for **"Runtime"** or **"Environment"** section
5. Check what it says - it should be **"Docker"**

### **Step 2: Change to Docker (If Not Already Set)**

If Runtime is NOT set to "Docker":

1. In **Settings** → **Build & Deploy** section
2. Find **"Runtime"** dropdown/selector
3. Select **"Docker"** from the dropdown
4. **Clear Build Command and Start Command** (they should auto-populate or become optional)
5. Save changes

**Important:** When Runtime is correctly set to "Docker":
- Render should automatically detect your Dockerfile
- Build Command and Start Command might become optional or auto-filled
- If they're still required, they might auto-populate with Docker-specific values
- The build process will use Docker instead of Node.js

**If you can't find Runtime setting:**
- Some Render services might not allow changing runtime after creation
- You may need to delete and recreate the service with Docker selected during creation

### **Step 3: If Runtime Setting Doesn't Exist or Can't Change**

Some Render services don't have a visible "Runtime" selector. Try this:

**Option A: Delete and Recreate Service**
1. Note down all your environment variables
2. Delete the current staging service
3. Create a new Web Service
4. When creating, make sure to select **"Docker"** as the runtime option (if available)
5. Re-add all environment variables

**Option B: Check if There's a Different Docker Option**

Look for:
- **"Dockerfile"** as a runtime option (instead of "Docker")
- **"Container"** as a runtime option
- Any option that mentions Docker or containers

---

## 🔍 **Alternative: Check How Production is Configured**

If your production service works, check how it's configured:

1. Go to **production service** in Render
2. Go to **Settings** tab
3. Check what **Runtime** it uses
4. Copy that exact configuration for staging

---

## 🎯 **What Should Happen with Docker Runtime**

When Runtime is correctly set to "Docker", you should see logs like:

```
==> Cloning from https://github.com/...
==> Using Dockerfile backend/Dockerfile
==> Building Docker image...
=> [internal] load build definition from Dockerfile
=> [1/8] FROM node:18-alpine
...
==> Docker build successful
==> Starting container...
```

**NOT:**
```
==> Using Node.js version 22.16.0
==> Running build command 'echo...'
```

---

## 📋 **Quick Fix Steps**

1. **Go to Settings** → Check Runtime value
2. **If not "Docker"**: Change to "Docker"
3. **If no Runtime option**: Check production service configuration
4. **If still issues**: Delete and recreate service with Docker runtime selected during creation

---

**The key issue is that Runtime needs to be set to "Docker" - check your Settings tab!** ✅

