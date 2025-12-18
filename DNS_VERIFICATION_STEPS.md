# DNS Verification - Next Steps

## ✅ **CNAME Record Added!**

You've successfully added the CNAME record in Cloudflare. Now let's verify everything is working.

---

## ⏳ **STEP 1: Wait for DNS Propagation**

### **Timeline:**
- **Usually:** 5-15 minutes
- **Sometimes:** Up to 1 hour
- **Rarely:** Up to 24 hours (unlikely if DNS was already configured)

### **What's Happening:**
1. Cloudflare is updating DNS records
2. Changes propagate across the internet
3. Render is checking for the DNS record
4. Once detected, Render will provision SSL automatically

---

## 🔍 **STEP 2: Verify DNS Propagation (Optional Check)**

### **Method 1: Online DNS Checker (Easiest)**

1. Go to: **https://dnschecker.org/**
2. Enter: `api.aperae.com`
3. Select record type: `CNAME`
4. Click "Search"
5. **Expected Result:** Should show `aperae-beta.onrender.com` across multiple global locations

### **Method 2: PowerShell Command**

**Open PowerShell and run:**
```powershell
nslookup api.aperae.com
```

**Expected Output:**
```
Non-authoritative answer:
api.aperae.com    canonical name = aperae-beta.onrender.com
```

---

## ✅ **STEP 3: Check Status in Render**

### **After 5-10 minutes:**

1. **Go to:** Render dashboard → Your service → **Settings** → **Custom Domains**
2. **Check the status** of `api.aperae.com`:
   - **Current:** Red icon with "DNS update needed"
   - **Expected:** Green icon with "Active" or "Live" ✅

### **If Status is Still Red:**

1. **Click** the "Verify" button (next to the domain)
2. **Wait** 2-3 minutes
3. **Refresh** the page and check again

---

## 🔐 **STEP 4: SSL Certificate Provisioning**

### **What Happens Automatically:**

Once Render detects the DNS record:
1. ✅ Render verifies domain ownership
2. ✅ Render automatically provisions SSL certificate (FREE)
3. ✅ SSL certificate is valid for `api.aperae.com`
4. ✅ Certificate auto-renews (no action needed)
5. ✅ HTTPS becomes available

### **Timeline:**
- **SSL provisioning:** 5-15 minutes after DNS verification
- **No action required** - it's automatic!

---

## 🧪 **STEP 5: Test Your Custom Domain**

### **Once Render shows "Active" status:**

**Test the health endpoint:**

**URL:** `https://api.aperae.com/api/health`

**Expected Response:**
```json
{
  "status": "ok",
  "timestamp": "...",
  "uptime": "...",
  "mockMode": false
}
```

### **How to Test:**

**Option 1: Browser**
- Open your browser
- Go to: `https://api.aperae.com/api/health`
- You should see JSON response (not an error)

**Option 2: PowerShell**
```powershell
Invoke-RestMethod -Uri "https://api.aperae.com/api/health" -Method GET
```

---

## 📋 **Current Status Checklist:**

- ✅ **Step 1:** Domain added in Render
- ✅ **Step 2:** CNAME record added in Cloudflare
- ⏳ **Step 3:** Waiting for DNS propagation (5-15 min)
- ⏳ **Step 4:** Render verifying DNS (automatic)
- ⏳ **Step 5:** SSL provisioning (automatic, 5-15 min after verification)
- ⏳ **Step 6:** Test custom domain

---

## 🆘 **Troubleshooting:**

### **If DNS doesn't resolve after 30 minutes:**

1. **Verify Cloudflare record:**
   - Go to Cloudflare → DNS → Records
   - Confirm CNAME record exists:
     - Name: `api`
     - Target: `aperae-beta.onrender.com`
     - Proxy: Gray cloud (DNS only)

2. **Verify Cloudflare proxy status:**
   - **Gray cloud = Correct** (DNS only)
   - **Orange cloud = Wrong** (proxy enabled - change to gray!)

3. **Check for typos:**
   - Target must match exactly: `aperae-beta.onrender.com`
   - Name should be just: `api`

### **If Render status doesn't change after 1 hour:**

1. **Click "Verify" button** in Render
2. **Wait** 5-10 minutes
3. **Check again**
4. **If still red:** Verify CNAME target matches exactly

### **If SSL doesn't work:**

- **Wait** 10-15 minutes after DNS verification
- SSL provisioning is automatic
- Try accessing `https://api.aperae.com` (not `http://`)
- Browser may show "Your connection is not private" initially - wait a few more minutes

---

## 📝 **What to Watch For:**

**In Render Custom Domains:**
- Status changes from ❌ "DNS update needed" to ✅ "Active"
- Icon changes from red to green
- SSL certificate automatically appears

**When Testing:**
- `https://api.aperae.com/api/health` returns JSON (not error)
- Browser shows valid SSL certificate (green padlock)
- No SSL warnings or errors

---

## ✅ **Next Actions:**

1. ⏳ **Wait** 5-15 minutes for DNS propagation
2. ⏳ **Check Render status** - should change to "Active"
3. ⏳ **Test** `https://api.aperae.com/api/health` once active
4. ⏳ **Verify SSL** works (green padlock in browser)

---

**Check back in 5-10 minutes and let me know:**
- What does the Render status show now?
- Did it change to "Active"?
- What happens when you test `https://api.aperae.com/api/health`?




