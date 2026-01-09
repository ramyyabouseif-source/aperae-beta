# Fix Apex Domain (aperae.com) - Cloudflare + Vercel Configuration

## ✅ Your Current Setup

Based on your configuration:
- **DNS Management:** Cloudflare (nameservers: `ns1.cloudflare.com`, `ns2.cloudflare.com`)
- **Frontend Hosting:** Vercel (`www.aperae.com` working)
- **Backend Hosting:** Render (`api.aperae.com`)
- **Domain Registrar:** GoDaddy

## 🎯 Recommended Solution: Add Apex Domain CNAME in Cloudflare

Since you're already using **Cloudflare for DNS**, the best solution is to add a DNS record in Cloudflare to point the apex domain (`aperae.com`) to Vercel.

### Why This Solution?
1. ✅ You're already using Cloudflare - no need to change anything
2. ✅ Cloudflare supports CNAME flattening (CNAME at apex)
3. ✅ Works seamlessly with your existing setup
4. ✅ No redirects needed - both domains work directly
5. ✅ Maintains all your existing DNS records (api.aperae.com, etc.)

---

## 📋 Step-by-Step Instructions

### Step 1: Get Vercel CNAME Target

1. **In Vercel Dashboard:**
   - Go to your project: https://vercel.com/dashboard
   - Navigate to **Settings** → **Domains**
   - Add `aperae.com` as a domain (if not already added)
   - Vercel will show you a **CNAME target** like:
     - `cname.vercel-dns.com`
     - Or something like: `d579b741f5d536c1.vercel-dns-017.com.`
   - **Copy this CNAME target** - you'll need it in the next step

### Step 2: Add CNAME Record in Cloudflare

1. **Log into Cloudflare:**
   - Go to: https://dash.cloudflare.com
   - Log in with your Cloudflare account

2. **Select Your Domain:**
   - In the Cloudflare dashboard, click on `aperae.com`
   - You'll see the Cloudflare dashboard for your domain

3. **Go to DNS Settings:**
   - Click on **DNS** in the left sidebar (or **DNS** → **Records**)

4. **Add CNAME Record for Apex Domain:**
   - Click **Add record**
   - Configure as follows:
     - **Type:** `CNAME`
     - **Name:** `@` (this represents the apex domain `aperae.com`)
     - **Target:** Paste the CNAME target from Vercel (e.g., `cname.vercel-dns.com` or the specific one Vercel provided)
     - **Proxy status:** 
       - **Gray cloud (DNS only)** - Recommended for Vercel
       - Or **Orange cloud (Proxied)** if you want Cloudflare CDN (usually fine for Vercel)
     - **TTL:** Auto (or 3600)
   - Click **Save**

   **Important Notes:**
   - Cloudflare automatically handles CNAME flattening for apex domains
   - The `@` symbol represents the root/apex domain
   - If Cloudflare shows an error about CNAME at apex, it should automatically flatten it

### Step 3: Verify Domain in Vercel

1. **In Vercel Dashboard:**
   - Go to **Settings** → **Domains**
   - Make sure `aperae.com` is listed
   - Wait for Vercel to verify the DNS record (can take a few minutes)
   - You should see a green checkmark or "Valid Configuration"

### Step 4: Wait for DNS Propagation

- DNS changes typically take **5-60 minutes** to propagate globally
- You can check propagation status:
  - https://www.whatsmydns.net/#CNAME/aperae.com
  - https://dnschecker.org/#CNAME/aperae.com

### Step 5: Test

Once DNS has propagated:
- Visit `https://aperae.com` - should load your Vercel site
- Visit `https://www.aperae.com` - should still work
- Both should work without redirects!

---

## 🔍 Alternative: If CNAME Doesn't Work

If Cloudflare gives you an error about CNAME at apex (though it should handle it automatically), you have two options:

### Option A: Use Cloudflare Page Rules (Redirect)

1. **In Cloudflare Dashboard:**
   - Go to **Rules** → **Page Rules** (or **Redirect Rules** in newer accounts)
   - Click **Create rule**
   - Configure:
     - **URL:** `aperae.com/*`
     - **Setting:** Forwarding URL
     - **Status Code:** 301 - Permanent Redirect
     - **Destination URL:** `https://www.aperae.com/$1`
   - Save

**Pros:** Works immediately, no DNS propagation wait
**Cons:** Browser shows redirect, URL changes to www.aperae.com

### Option B: Use A Record (Not Recommended)

You could add an A record pointing to Vercel's IP, but:
- ⚠️ Vercel doesn't provide static IPs
- ⚠️ IPs can change, breaking your site
- ⚠️ Not officially supported by Vercel

**Not recommended** - use Option A if CNAME doesn't work.

---

## ✅ Expected DNS Records in Cloudflare

After setup, you should have these DNS records:

| Type  | Name           | Target/Value                          | Proxy | Notes                    |
|-------|----------------|---------------------------------------|-------|--------------------------|
| CNAME | @              | `cname.vercel-dns.com` (or Vercel's) | Gray  | Apex domain → Vercel     |
| CNAME | www            | `cname.vercel-dns.com` (or Vercel's) | Gray  | www → Vercel             |
| CNAME | api            | `your-render-service.onrender.com`    | Gray  | API → Render             |
| CNAME | staging-api    | `your-staging-service.onrender.com`   | Gray  | Staging API → Render     |

**Note:** Gray cloud (DNS only) is recommended for Vercel and Render. Orange cloud (Proxied) can also work but may require additional SSL configuration.

---

## 🎯 Why This Is the Best Solution for You

1. **No Infrastructure Changes:**
   - Keep using Cloudflare (already set up)
   - Keep using Vercel (already working)
   - No need to change nameservers

2. **Maintains Existing Setup:**
   - Your `api.aperae.com` DNS record stays unchanged
   - All other DNS records remain intact
   - No risk of breaking existing services

3. **Best Performance:**
   - Both apex and www work directly (no redirect)
   - SSL certificates handled automatically by Vercel
   - Fast DNS resolution through Cloudflare

4. **Easy to Manage:**
   - All DNS in one place (Cloudflare)
   - Easy to update if needed
   - Clear visibility of all records

---

## 🚨 Troubleshooting

### Issue: "CNAME record already exists for @"

**Solution:** Edit the existing record instead of creating a new one.

1. In Cloudflare DNS → Records
2. Find the existing `@` record
3. Click **Edit**
4. Update the Target to the Vercel CNAME
5. Save

### Issue: Vercel shows "Invalid Configuration"

**Possible Causes:**
- DNS record not yet propagated (wait 5-60 minutes)
- Wrong CNAME target (double-check in Vercel)
- Cloudflare proxy interfering (try gray cloud/DNS only)

**Solution:**
- Wait 10-15 minutes and check again
- Verify CNAME target matches exactly what Vercel shows
- Try disabling Cloudflare proxy (gray cloud) temporarily

### Issue: Domain still goes to GoDaddy landing page

**Possible Causes:**
- DNS not propagated yet
- Cached DNS on your computer
- Wrong DNS record configuration

**Solution:**
- Wait 15-30 minutes for propagation
- Clear DNS cache: `ipconfig /flushdns` (Windows) or `sudo dscacheutil -flushcache` (Mac)
- Verify DNS record in Cloudflare matches Vercel's CNAME target exactly

---

## ✅ Verification Checklist

- [ ] Added `aperae.com` domain in Vercel dashboard
- [ ] Got CNAME target from Vercel
- [ ] Added CNAME record in Cloudflare (`@` → Vercel CNAME)
- [ ] Set proxy to gray cloud (DNS only) or orange (Proxied)
- [ ] Vercel shows "Valid Configuration" for apex domain
- [ ] Waited 15-30 minutes for DNS propagation
- [ ] Tested `https://aperae.com` - loads Vercel site
- [ ] Tested `https://www.aperae.com` - still works

---

## 📞 Need Help?

If you encounter issues:
1. Check Vercel domain status: https://vercel.com/dashboard → Settings → Domains
2. Check Cloudflare DNS records: https://dash.cloudflare.com → aperae.com → DNS
3. Verify DNS propagation: https://dnschecker.org/#CNAME/aperae.com
4. Check Vercel documentation: https://vercel.com/docs/concepts/projects/domains

---

**Summary:** Since you're already using Cloudflare, simply add a CNAME record for `@` pointing to Vercel's CNAME target. This is the cleanest, most maintainable solution that works with your existing infrastructure! 🚀

