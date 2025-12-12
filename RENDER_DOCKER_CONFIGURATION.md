# Render Docker Configuration Guide

**Updated:** December 12, 2025  
**For:** Staging deployment on Render

---

## 🐳 **How Render Handles Docker**

When you select **"Docker"** as the runtime in Render:

1. **Automatic Dockerfile Detection**
   - Render looks for `Dockerfile` in the **Root Directory** you specify
   - If Root Directory is `backend`, it looks for `backend/Dockerfile`
   - No need to specify Dockerfile path separately

2. **Build Process**
   - Render automatically runs: `docker build` in the Root Directory
   - Uses the Dockerfile found there
   - Build Command field is optional (can be left default/empty)

3. **Start Process**
   - Render uses the `CMD` or `ENTRYPOINT` from your Dockerfile
   - Start Command field is optional (can be left default/empty)
   - Your Dockerfile has: `CMD ["node", "server.js"]`

---

## ✅ **Correct Configuration for Staging**

### **Service Settings:**

| Field | Value | Notes |
|-------|-------|-------|
| **Name** | `aperae-backend-staging` | Service identifier |
| **Region** | `Ohio (US East 2)` | Same as production |
| **Branch** | `main` | Git branch to deploy |
| **Root Directory** | `backend` | Where Dockerfile is located |
| **Runtime** | `Docker` | Tells Render to use Docker |

### **Build & Deploy Settings:**

| Field | Value | Notes |
|-------|-------|-------|
| **Build Command** | *(Default/Empty)* | Render auto-detects Dockerfile |
| **Start Command** | *(Default/Empty)* | Dockerfile CMD is used |
| **Plan** | `Free` | Same as production |

---

## 🔧 **If Fields Are Required (Can't Leave Empty)**

Some Render UI versions require values. Use these as fallbacks:

### **Option 1: Use Defaults (Recommended)**
- **Build Command:** Leave as Render's default (usually empty or auto-detected)
- **Start Command:** Leave as Render's default (usually empty or auto-detected)

### **Option 2: Explicit Values (If Required)**
- **Build Command:** `docker build -t app .`
  - This is what Render does automatically anyway
  - The `.` means "current directory" (Root Directory)
  
- **Start Command:** `node server.js`
  - This matches your Dockerfile's CMD
  - Render will use this if Dockerfile CMD isn't detected

**Note:** Even if you provide these, Render will still use your Dockerfile's instructions primarily.

---

## 📋 **Step-by-Step in Render UI**

1. **Select Runtime:**
   - Choose **"Docker"** from the Runtime dropdown
   - This enables Docker mode

2. **Set Root Directory:**
   - Enter: `backend`
   - This tells Render where your Dockerfile is

3. **Build Command:**
   - If you see a field, try leaving it empty first
   - If it requires a value, use: `docker build -t app .`
   - Or use Render's suggested default

4. **Start Command:**
   - If you see a field, try leaving it empty first
   - If it requires a value, use: `node server.js`
   - Or use Render's suggested default

5. **Plan:**
   - Select **"Free"**

---

## ✅ **Verification**

After creating the service, check the build logs:

1. Go to your service → **"Logs"** tab
2. Look for build output:
   ```
   => [internal] load build definition from Dockerfile
   => => transferring dockerfile: ...
   => [1/8] FROM node:18-alpine
   ...
   ```
3. If you see Docker build steps, it's working correctly!

---

## 🚨 **Troubleshooting**

### **Issue: "Dockerfile not found"**

**Solution:**
- Verify Root Directory is `backend` (not `backend/` or `/backend`)
- Check that `backend/Dockerfile` exists in your repository
- Ensure the branch (`main`) has the Dockerfile

### **Issue: Build fails**

**Solution:**
- Check build logs for specific error
- Verify all files are in the repository
- Ensure Dockerfile syntax is correct

### **Issue: Service won't start**

**Solution:**
- Check Start Command matches Dockerfile CMD
- Verify environment variables are set
- Check logs for startup errors

---

## 📝 **Summary**

**Key Points:**
- ✅ Root Directory = `backend` (where Dockerfile is)
- ✅ Runtime = `Docker` (enables Docker mode)
- ✅ Build/Start Commands = Default/Empty (Render auto-detects)
- ✅ If required, use fallback values above

**Your Dockerfile handles everything:**
- Build steps (installing dependencies, etc.)
- Start command (`CMD ["node", "server.js"]`)
- Port exposure (`EXPOSE 3001`)

Render just needs to know:
- Where the Dockerfile is (Root Directory)
- That you want to use Docker (Runtime)

---

**This should resolve the configuration issues!** ✅

