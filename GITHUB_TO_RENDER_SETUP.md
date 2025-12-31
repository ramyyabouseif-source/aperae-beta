# GitHub to Render Setup - Complete Guide

## 🎯 Overview

This guide ensures your PocketSomm code is properly saved to GitHub and ready to connect to Render.

---

## 📋 **STEP 1: Verify Your Code is Ready**

### **Step 1.1: Check Current Status**

First, let's see what's in your repository:

1. **Open PowerShell** (or Terminal)
2. **Navigate to your project:**
   ```powershell
   cd C:\Users\ramyy\Production\Aperae
   ```

3. **Check git status:**
   ```powershell
   git status
   ```

**What you should see:**
- ✅ If it says "nothing to commit, working tree clean" → Your code is saved
- ⚠️ If it shows files listed → You need to commit them

---

## 📋 **STEP 2: Commit Your Code (If Needed)**

### **Step 2.1: Check What Needs to be Committed**

If `git status` shows files, you need to commit them:

**Files that SHOULD be committed:**
- ✅ All `.js`, `.ts`, `.tsx` files (your code)
- ✅ `package.json` files
- ✅ `README.md`
- ✅ `.gitignore` (already committed)
- ✅ Configuration files

**Files that SHOULD NOT be committed:**
- ❌ `.env` files (secrets!)
- ❌ `node_modules/` (dependencies)
- ❌ `.expo/` (build files)

### **Step 2.2: Add Files to Git**

**If you have uncommitted changes:**

1. **Add all files:**
   ```powershell
   git add .
   ```

2. **Check what will be committed:**
   ```powershell
   git status
   ```
   - Make sure `.env` files are NOT listed
   - Make sure `node_modules/` is NOT listed

3. **Commit the changes:**
   ```powershell
   git commit -m "Prepare for Render deployment"
   ```

---

## 📋 **STEP 3: Ensure GitHub Repository Exists**

### **Step 3.1: Check if Repository is Connected**

1. **Check remote repository:**
   ```powershell
   git remote -v
   ```

**What you should see:**
- ✅ If it shows a GitHub URL → Repository is connected
- ⚠️ If it shows nothing → You need to create/connect a repository

### **Step 3.2: Create GitHub Repository (If Needed)**

**If you don't have a GitHub repository yet:**

1. **Go to GitHub:** https://github.com
2. **Click:** "+" icon (top right) → "New repository"
3. **Repository settings:**
   - **Name:** `pocketsomm` (or `aperae` or your choice)
   - **Description:** "PocketSomm - AI Wine Recommendation App"
   - **Visibility:** Private (recommended) or Public
   - **DO NOT** check "Initialize with README" (you already have code)
   - **DO NOT** add .gitignore (you already have one)
   - **DO NOT** add license (unless you want to)
4. **Click:** "Create repository"

### **Step 3.3: Connect Local Code to GitHub**

**If repository is new or not connected:**

1. **Copy the repository URL** from GitHub (looks like: `https://github.com/yourusername/pocketsomm.git`)

2. **Add remote (if not connected):**
   ```powershell
   git remote add origin https://github.com/yourusername/pocketsomm.git
   ```
   *(Replace with your actual repository URL)*

3. **Verify connection:**
   ```powershell
   git remote -v
   ```
   Should show your GitHub URL

---

## 📋 **STEP 4: Push Code to GitHub**

### **Step 4.1: Push Your Code**

1. **Push to GitHub:**
   ```powershell
   git push -u origin main
   ```
   *(If your branch is called `master` instead of `main`, use `master`)*

2. **If prompted for credentials:**
   - Use your GitHub username
   - Use a Personal Access Token (not password)
   - See "GitHub Authentication" section below if needed

3. **Wait for upload** (may take a few minutes)

### **Step 4.2: Verify Code is on GitHub**

1. **Go to your GitHub repository:** `https://github.com/yourusername/pocketsomm`
2. **Verify you see:**
   - ✅ `backend/` folder
   - ✅ `src/` folder
   - ✅ `package.json` files
   - ✅ `.gitignore` file
   - ❌ NO `.env` files (should be hidden)
   - ❌ NO `node_modules/` (should be hidden)

---

## 📋 **STEP 5: Connect Repository to Render**

### **Step 5.1: Start Render Service Creation**

1. **Log in to Render:** https://dashboard.render.com
2. **Click:** "New +" → "Web Service"
3. **You'll see:** "Connect a repository" screen

### **Step 5.2: Connect GitHub Account (First Time Only)**

**If you haven't connected GitHub to Render:**

1. **Click:** "Connect GitHub" or "Connect account"
2. **You'll be redirected to GitHub**
3. **Authorize Render:**
   - Click "Authorize render"
   - Choose which repositories to allow:
     - **Option A:** "Only select repositories" → Choose `pocketsomm`
     - **Option B:** "All repositories" (if you trust Render)
4. **Click:** "Install & Authorize"
5. **You'll be redirected back to Render**

### **Step 5.3: Select Your Repository**

**After GitHub is connected:**

1. **In Render, you'll see:** List of your repositories
2. **Find:** `pocketsomm` (or whatever you named it)
3. **Click:** On your repository name
4. **Render will show:** Repository details

**What Render will show:**
- ✅ Repository name
- ✅ Branch selector (should show `main` or `master`)
- ✅ Recent commits

### **Step 5.4: Verify Repository Details**

**Before clicking "Continue", verify:**

- ✅ **Repository:** Shows correct name (`pocketsomm`)
- ✅ **Branch:** Shows `main` (or `master`)
- ✅ **Recent commits:** Shows your latest commits
- ✅ **Root Directory:** Should be empty or show `/` (we'll set this to `backend` next)

**If everything looks correct:**
- ✅ **Click:** "Connect" or "Continue"

---

## 📋 **STEP 6: Configure Service Settings**

### **Step 6.1: Basic Settings**

After connecting repository, you'll see configuration form:

1. **Name:**
   - Enter: `pocketsomm-backend`
   - This is what Render will call your service

2. **Region:**
   - Select: Closest to you (e.g., "Oregon (US West)", "Ohio (US East)")

3. **Branch:**
   - Should already show: `main` (or `master`)
   - Leave as-is

### **Step 6.2: Root Directory (CRITICAL!)**

**This is the most important setting:**

1. **Find:** "Root Directory" field
2. **Enter:** `backend`
3. **Why:** This tells Render where your backend code is located

**Without this:** Render will look for `package.json` in the root folder (frontend) instead of `backend/` folder (backend)

### **Step 6.3: Build & Start Commands**

**Render may auto-detect these, but verify:**

- **Build Command:** Should be `npm ci` or `npm install` (auto-detected)
- **Start Command:** Should be `npm start` (auto-detected from `backend/package.json`)

**If these fields exist and are empty:**
- **Build Command:** `npm ci`
- **Start Command:** `npm start`

**If these fields don't exist:** Don't worry - Render will auto-detect from your `package.json`

---

## 📋 **STEP 7: Add Environment Variables**

### **Step 7.1: Find Environment Variables Section**

After basic settings, look for:
- "Environment" tab
- "Environment Variables" section
- "Env Vars" button

### **Step 7.2: Add Variables**

**For each variable:**

1. **Click:** "Add Environment Variable" (or "+" button)
2. **Box 1 (NAME):** Enter variable name (e.g., `NODE_ENV`)
3. **Box 2 (VALUE):** Enter variable value (e.g., `production`)
4. **Click:** "Add" or "Save"

**Repeat for all variables** (see list in previous guide)

---

## 📋 **STEP 8: Deploy**

### **Step 8.1: Create Service**

1. **Review all settings:**
   - ✅ Name: `pocketsomm-backend`
   - ✅ Root Directory: `backend`
   - ✅ Branch: `main`
   - ✅ Environment variables: All added

2. **Click:** "Create Web Service" (or "Deploy")

### **Step 8.2: Monitor Deployment**

Render will:
1. Clone your repository
2. Install dependencies (`npm ci` in `backend/` folder)
3. Build your application
4. Start your server (`npm start`)

**Watch the logs:**
- Click "Logs" tab to see progress
- Look for: "Build successful" or "Deploy successful"
- Look for: "Listening on port 3001" or similar

**Deployment takes:** 2-5 minutes typically

---

## 🔐 **GitHub Authentication (If Needed)**

### **If Git Push Asks for Password:**

GitHub no longer accepts passwords. You need a Personal Access Token:

1. **Go to GitHub:** https://github.com/settings/tokens
2. **Click:** "Generate new token" → "Generate new token (classic)"
3. **Settings:**
   - **Note:** "Render Deployment"
   - **Expiration:** 90 days (or your choice)
   - **Scopes:** Check `repo` (full control of private repositories)
4. **Click:** "Generate token"
5. **Copy the token** (you won't see it again!)
6. **Use it as password** when Git asks for credentials

---

## ✅ **Verification Checklist**

### **Before Connecting to Render:**

- [ ] Code is committed locally (`git status` shows clean)
- [ ] Code is pushed to GitHub (can see it on GitHub.com)
- [ ] `.env` files are NOT in repository (check `.gitignore`)
- [ ] `node_modules/` is NOT in repository
- [ ] `backend/` folder exists in GitHub repository
- [ ] `backend/package.json` exists in GitHub repository

### **In Render:**

- [ ] Correct repository selected
- [ ] Correct branch selected (`main`)
- [ ] Root Directory set to `backend`
- [ ] All environment variables added
- [ ] Service name is clear (`pocketsomm-backend`)

---

## 🆘 **Troubleshooting**

### **"Repository not found" in Render:**
- Make sure GitHub account is connected
- Make sure repository is not private (or Render has access)
- Try refreshing Render page

### **"Build failed" in Render:**
- Check Root Directory is `backend`
- Check logs for specific error
- Verify `backend/package.json` exists

### **"Service won't start":**
- Check PORT environment variable (should be 3001)
- Check logs for startup errors
- Verify `npm start` script exists in `backend/package.json`

---

## 📝 **Quick Command Reference**

```powershell
# Check status
git status

# Add all files
git add .

# Commit changes
git commit -m "Your commit message"

# Check remote
git remote -v

# Add remote (if needed)
git remote add origin https://github.com/yourusername/pocketsomm.git

# Push to GitHub
git push -u origin main
```

---

**Ready to proceed? Start with Step 1.1 - check your git status!**









