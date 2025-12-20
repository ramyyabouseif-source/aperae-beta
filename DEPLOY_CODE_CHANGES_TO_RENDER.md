# Deploy Code Changes to Render

**Date:** December 15, 2025  
**Issue:** Render is still running old code with raw SQL inserts  
**Fix:** Deploy updated code and regenerate Prisma client

---

## 🔍 **Problem**

The logs show Render is still using:
- ❌ `prisma.$executeRaw()` (old code)
- ❌ "malformed array literal" errors

But locally, the code correctly uses:
- ✅ `prisma.wineRecommendation.create()` (new code)
- ✅ Prisma handles arrays automatically

**This means the code changes haven't been deployed to Render yet.**

---

## 🚀 **Deployment Steps**

### **Step 1: Commit and Push Code Changes**

Make sure all changes are committed and pushed to your repository:

```bash
# Check what files have changed
git status

# Add changed files
git add backend/prisma/schema.prisma
git add backend/services/wineRecommendationDatabaseService.js

# Commit
git commit -m "Fix recommendation storage: Use Prisma ORM instead of raw SQL"

# Push to trigger Render deployment
git push origin main
```

**Files that need to be committed:**
- ✅ `backend/prisma/schema.prisma` (added WineRecommendation model)
- ✅ `backend/services/wineRecommendationDatabaseService.js` (fixed to use Prisma)

---

### **Step 2: Update Render Build Command (If Needed)**

Render needs to regenerate the Prisma client after pulling the new schema.

**Option A: If using Docker (recommended)**
The Dockerfile should already handle this, but verify it includes:
```dockerfile
RUN npx prisma generate
```

**Option B: If using Node.js runtime**
Update the Build Command in Render to:
```
npx prisma generate && npm install
```

Or if you have a build script, ensure it runs:
```json
{
  "scripts": {
    "build": "prisma generate",
    "start": "node server.js"
  }
}
```

---

### **Step 3: Wait for Render Deployment**

After pushing:
1. Go to Render Dashboard
2. Your service should automatically start deploying
3. Watch the logs for:
   - ✅ "Building..." 
   - ✅ "Generating Prisma Client..."
   - ✅ "Deploying..."
   - ✅ "Your service is live 🎉"

**Deployment typically takes 2-5 minutes.**

---

### **Step 4: Verify Prisma Client Generation**

Check the build logs to ensure Prisma client was generated:

Look for:
```
✔ Generated Prisma Client (X.XX.XX)
```

If you don't see this, Prisma client wasn't regenerated and the new `WineRecommendation` model won't be available.

---

### **Step 5: Test After Deployment**

After deployment completes, make a test request:

```powershell
$body = @{
    dish = "Grilled Salmon"
} | ConvertTo-Json

Invoke-RestMethod -Method Post -Uri "https://api.aperae.com/api/recommendations" `
    -ContentType "application/json" `
    -Body $body
```

**Expected logs (after fix):**
- ✅ `"Database inserts completed"` with `insertedCount: 3`
- ✅ **NO** `"Failed to insert individual recommendation"` errors
- ✅ **NO** `"malformed array literal"` errors

---

## 🔧 **Troubleshooting**

### **Issue: Still seeing `$executeRaw()` errors after deployment**

**Cause:** Code changes not deployed or cached

**Fix:**
1. Verify code is pushed to repository
2. Check Render is pulling from correct branch
3. Force a manual redeploy in Render Dashboard
4. Clear Render build cache (if option available)

---

### **Issue: "WineRecommendation model not found"**

**Cause:** Prisma client not regenerated

**Fix:**
1. Ensure Build Command includes `npx prisma generate`
2. Check build logs for "Generated Prisma Client"
3. Manually trigger rebuild in Render

---

### **Issue: Deployment fails**

**Check logs for:**
- Database connection errors
- Missing environment variables
- Prisma schema validation errors

---

## ✅ **Verification Checklist**

After deployment:

- [ ] Code pushed to repository
- [ ] Render deployment triggered
- [ ] Build logs show "Generated Prisma Client"
- [ ] Service deployed successfully
- [ ] Test request completes without errors
- [ ] Logs show `insertedCount: 3` (not 0)
- [ ] No "malformed array literal" errors

---

## 📝 **Quick Reference**

**What changed:**
- Replaced `prisma.$executeRaw()` with `prisma.wineRecommendation.create()`
- Prisma now handles arrays and JSONB automatically
- No more manual SQL array formatting

**What's needed:**
- Deploy updated code to Render
- Regenerate Prisma client on Render
- Table already exists (migration completed)

---

**Status:** Ready to deploy - just need to push code and let Render deploy!



