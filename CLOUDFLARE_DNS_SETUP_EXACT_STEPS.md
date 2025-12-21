# Cloudflare DNS Setup - Exact Steps

## ✅ **Step 3 Complete!**
You've successfully added `api.aperae.com` in Render. Now configure DNS in Cloudflare.

---

## 📋 **STEP 4: Configure DNS in Cloudflare**

### **What You Need:**
- ✅ Domain: `aperae.com` (registered at GoDaddy)
- ✅ Cloudflare account ready
- ✅ Domain added to Cloudflare
- ✅ CNAME target from Render: `aperae-beta.onrender.com`

---

## 🔍 **STEP 4.1: Access Cloudflare DNS**

### **In Cloudflare Dashboard:**

1. **Login** to Cloudflare: https://dash.cloudflare.com
2. **Select** your domain: `aperae.com`
3. **Click** on "DNS" in the left sidebar (or top navigation)
4. **Click** "Records" (if not already on that page)

---

## 📝 **STEP 4.2: Add CNAME Record**

### **You should see a list of existing DNS records. Now add the new one:**

1. **Click** the blue "Add record" button

2. **Fill in the fields:**

   **Type:**
   - Select: `CNAME` (from the dropdown)

   **Name:**
   - Enter: `api` (just `api`, not `api.aperae.com`)
   - This creates `api.aperae.com`

   **Target:**
   - Enter: `aperae-beta.onrender.com` (the target from Render)
   - **Important:** Include the trailing dot if Render shows it, but usually not needed

   **Proxy status:**
   - **Click the orange cloud to turn it gray** (DNS only)
   - **Critical:** Gray cloud means Cloudflare won't proxy (Render handles SSL)
   - Orange cloud means Cloudflare proxies (can cause issues with Render's SSL)

   **TTL:**
   - Leave as "Auto" (or set to "Automatic")

3. **Click** "Save" button

---

## ✅ **What You Should See:**

**After saving, you should see a new record in your DNS list:**

```
Type    Name    Content                           Proxy    TTL
CNAME   api     aperae-beta.onrender.com          🟡→⚪    Auto
```

**Important:** The cloud icon should be **gray** (⚪), not orange (🟡).

---

## ⏳ **STEP 4.3: Wait for DNS Propagation**

### **How long:**
- **Typically:** 5-15 minutes
- **Sometimes:** Up to 1 hour
- **Rarely:** Up to 24 hours (if DNS was just changed)

### **What happens:**
1. DNS records propagate across the internet
2. Render detects the DNS change
3. Render automatically provisions SSL certificate
4. Status in Render changes to "Active" or "Live"

---

## 🔍 **STEP 4.4: Verify DNS Propagation (Optional)**

### **Method 1: Online DNS Checker**

1. Go to: https://dnschecker.org/
2. Enter: `api.aperae.com`
3. Select: Record type `CNAME`
4. Click "Search"
5. **Expected:** Should show `aperae-beta.onrender.com` across multiple locations

### **Method 2: PowerShell Command**

```powershell
nslookup api.aperae.com
```

**Expected output:**
```
api.aperae.com
    canonical name = aperae-beta.onrender.com
```

### **Method 3: Browser**

Try visiting: `https://api.aperae.com/api/health`

**Note:** Will show SSL error or "not found" until Render provisions SSL (takes a few minutes after DNS propagates).

---

## ✅ **STEP 4.5: Verify in Render**

### **After 5-15 minutes:**

1. **Go back to** Render dashboard → Your service → Settings → Custom Domains
2. **Check the status** of `api.aperae.com`:
   - **Red icon → Green icon** = DNS verified ✅
   - **Status changes** to "Active" or "Live" ✅

### **If Status Doesn't Update:**

1. **Click** "Verify" button in Render
2. **Wait** a few more minutes
3. **Check again**

---

## 🎯 **What Happens Automatically:**

Once DNS is configured and verified:
1. ✅ Render detects DNS record
2. ✅ Render provisions free SSL certificate automatically
3. ✅ Domain becomes "Active" in Render
4. ✅ `https://api.aperae.com` becomes available
5. ✅ SSL certificate auto-renews (no action needed)

---

## ✅ **STEP 5: Test Your Custom Domain**

### **Once status is "Active" in Render:**

**Test health endpoint:**
```
https://api.aperae.com/api/health
```

**Expected response:**
```json
{
  "status": "ok",
  "timestamp": "...",
  "uptime": "..."
}
```

**Or use PowerShell:**
```powershell
Invoke-RestMethod -Uri "https://api.aperae.com/api/health" -Method GET
```

---

## 🆘 **Troubleshooting:**

### **If DNS doesn't propagate:**
- Wait up to 1 hour
- Check Cloudflare: Make sure record is saved correctly
- Verify: Cloud icon is gray (not orange)

### **If Render shows "DNS update needed" after 1 hour:**
- Click "Verify" button in Render
- Double-check CNAME target matches exactly: `aperae-beta.onrender.com`
- Verify cloud icon is gray in Cloudflare

### **If SSL certificate doesn't provision:**
- Wait 10-15 minutes after DNS verification
- SSL provisioning is automatic (no action needed)
- If still not working after 1 hour, contact Render support

---

## 📋 **Summary - What You Need to Do:**

1. ✅ **Step 3:** Add domain in Render - **DONE!**
2. ⏳ **Step 4:** Add CNAME record in Cloudflare - **DO THIS NOW**
   - Type: `CNAME`
   - Name: `api`
   - Target: `aperae-beta.onrender.com`
   - Proxy: **Gray cloud** (DNS only)
3. ⏳ **Wait** 5-15 minutes for DNS propagation
4. ⏳ **Verify** in Render that status changes to "Active"
5. ⏳ **Test** `https://api.aperae.com/api/health`

---

## ✅ **Action:**

**Go to Cloudflare now and add the CNAME record as described above!**

**Tell me:**
- Did you add the CNAME record in Cloudflare?
- Is the cloud icon gray (not orange)?
- What does the record look like?







