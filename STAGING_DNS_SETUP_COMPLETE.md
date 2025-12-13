# Staging DNS Setup - Complete Guide

**Service:** `aperae-backend-staging-1`  
**Current URL:** `aperae-backend-staging-1.onrender.com`  
**Target URL:** `staging-api.aperae.com`

---

## ✅ **What We Need to Do:**

1. **Add DNS record in Cloudflare** - Point `staging-api.aperae.com` to Render service
2. **Add custom domain in Render** - Tell Render about `staging-api.aperae.com`
3. **Wait for SSL certificate** - Render provisions SSL automatically (5-10 minutes)
4. **Verify it works** - Test access at the custom domain

---

## 📋 **Step 1: Get Render Service URL**

1. Go to [Render Dashboard](https://dashboard.render.com/)
2. Open your staging service: `aperae-backend-staging-1`
3. Go to **"Settings"** tab
4. Find **"Auto-Deploy URL"** - It should be: `aperae-backend-staging-1.onrender.com`
5. **Copy this URL** - you'll need it for Step 2

---

## 📋 **Step 2: Add DNS Record in Cloudflare**

### **2.1 Go to Cloudflare Dashboard**

1. Go to [Cloudflare Dashboard](https://dash.cloudflare.com/)
2. Select your domain: `aperae.com`
3. Go to **"DNS"** → **"Records"**

### **2.2 Add CNAME Record**

Click **"Add record"** and fill in:

| Field | Value |
|-------|-------|
| **Type** | `CNAME` |
| **Name** | `staging-api` |
| **Target** | `aperae-backend-staging-1.onrender.com` |
| **Proxy status** | ✅ **Proxied** (orange cloud) |
| **TTL** | `Auto` |

**Important:**
- Name: `staging-api` (this creates `staging-api.aperae.com`)
- Target: The Render auto-deploy URL from Step 1
- Proxy: **Must be Proxied** (orange cloud) - this enables Cloudflare features

### **2.3 Save the Record**

Click **"Save"**

**Note:** DNS propagation can take 1-5 minutes.

---

## 📋 **Step 3: Add Custom Domain in Render**

### **3.1 Go to Render Settings**

1. Go back to [Render Dashboard](https://dashboard.render.com/)
2. Open staging service: `aperae-backend-staging-1`
3. Go to **"Settings"** tab
4. Scroll to **"Custom Domains"** section

### **3.2 Add Custom Domain**

1. Click **"Add Custom Domain"**
2. Enter: `staging-api.aperae.com`
3. Click **"Add Domain"** or **"Save"**

### **3.3 Wait for SSL Certificate**

- Render will automatically provision an SSL certificate
- This usually takes **5-10 minutes**
- You'll see status update from "Pending" to "Issued"
- **Wait for this to complete before testing**

---

## 📋 **Step 4: Verify DNS Setup**

### **4.1 Check DNS Propagation (Optional)**

Wait 2-5 minutes, then verify DNS is working:

```powershell
# Check DNS resolution
nslookup staging-api.aperae.com
```

**Expected:** Should resolve to a Cloudflare IP (if proxied) or Render IP

### **4.2 Check Render Custom Domain Status**

1. In Render dashboard → Settings → Custom Domains
2. Verify `staging-api.aperae.com` shows:
   - Status: **"Issued"** or **"Active"** (not "Pending")
   - Certificate is provisioned

### **4.3 Test the Custom Domain**

Once SSL is issued, test:

```powershell
# Test health endpoint
curl https://staging-api.aperae.com/api/health
```

**Expected:** JSON response with `"status": "ok"` or `"status": "healthy"`

---

## ✅ **Success Checklist**

- [ ] DNS record added in Cloudflare (`staging-api` → Render URL)
- [ ] DNS record is **Proxied** (orange cloud)
- [ ] Custom domain added in Render (`staging-api.aperae.com`)
- [ ] SSL certificate status shows "Issued" or "Active"
- [ ] Health endpoint responds at `https://staging-api.aperae.com/api/health`
- [ ] Can access staging API at custom domain

---

## 🚨 **Troubleshooting**

### **Issue: DNS not resolving**

**Solution:**
- Wait 5-10 minutes for DNS propagation
- Verify Cloudflare DNS record is correct
- Check that record is saved in Cloudflare

### **Issue: SSL certificate not issued**

**Solution:**
- Wait 10-15 minutes (can take time)
- Verify DNS record is correct in Cloudflare
- Verify custom domain is added correctly in Render
- Check Render logs for SSL errors

### **Issue: 502 Bad Gateway or connection error**

**Solution:**
- Verify Render service is running (check logs)
- Verify DNS target is correct (should be `aperae-backend-staging-1.onrender.com`)
- Check that Cloudflare proxy is enabled (orange cloud)
- Wait a few minutes and try again

### **Issue: Certificate shows "Pending" for long time**

**Solution:**
- This is normal - can take up to 15 minutes
- Verify DNS is propagating correctly
- Check that domain is correctly added in Render
- If stuck > 30 minutes, remove and re-add custom domain

---

## 📊 **What This Accomplishes**

After completing these steps:

- ✅ Staging accessible at friendly URL: `staging-api.aperae.com`
- ✅ SSL certificate automatically provisioned (HTTPS)
- ✅ Protected by Cloudflare (DDoS protection, CDN)
- ✅ Matches production URL pattern (`api.aperae.com` vs `staging-api.aperae.com`)

---

## 🎯 **Comparison: Production vs Staging URLs**

| Environment | Current URL | Custom Domain |
|-------------|-------------|---------------|
| **Production** | `[service-name].onrender.com` | `api.aperae.com` ✅ |
| **Staging** | `aperae-backend-staging-1.onrender.com` | `staging-api.aperae.com` ⏳ |

After setup, both will have custom domains matching your brand!

---

**Ready to complete the DNS setup? Follow the steps above!** ✅

