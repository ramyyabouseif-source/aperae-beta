# Fix Render Docker Build Error

**Error:** `docker: command not found`  
**Cause:** Build Command is set when it should be empty for Docker runtime  
**Fix:** Remove the Build Command (leave it empty/default)

---

## 🔧 **Quick Fix**

### **Step 1: Remove Build Command**

1. Go to [Render Dashboard](https://dashboard.render.com/)
2. Open your **staging service** (`aperae-backend-staging`)
3. Go to **"Settings"** tab
4. Scroll down to **"Build & Deploy"** section
5. Find **"Build Command"** field
6. **Clear/Delete the value** - make it empty
7. Click **"Save Changes"**

### **Step 2: Verify Start Command**

1. In the same **"Build & Deploy"** section
2. Find **"Start Command"** field
3. **Clear/Delete the value** - make it empty (if you set one)
4. Click **"Save Changes"**

### **Step 3: Redeploy**

Render will automatically trigger a new deployment. Watch the logs to verify it builds correctly.

---

## ✅ **Correct Configuration**

For **Docker** runtime, these should be:

- **Runtime:** `Docker` ✅
- **Root Directory:** `backend` ✅
- **Build Command:** *(Empty/Default)* ✅
- **Start Command:** *(Empty/Default)* ✅

Render automatically:
- Detects `Dockerfile` in Root Directory
- Runs `docker build` for you
- Uses Dockerfile's `CMD` instruction to start

---

## 🎯 **What Should Happen**

After removing the build command, you should see in logs:

```
==> Cloning from https://github.com/...
==> Using Dockerfile backend/Dockerfile
==> Building Docker image...
==> Docker build successful
==> Starting container...
```

**Not:**
```
==> Running build command 'docker build -t app .'
bash: line 1: docker: command not found
```

---

**This should fix the build error!** ✅

