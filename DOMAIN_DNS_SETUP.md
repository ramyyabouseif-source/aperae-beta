# Domain DNS Configuration Guide

## Issue
`www.aperae.com` works correctly (routes to Vercel), but `aperae.com` (apex domain) goes to the original GoDaddy landing page instead of routing to Vercel.

## Root Cause
The apex domain (`aperae.com`) DNS records are not configured to point to Vercel. Only the `www` subdomain is properly configured.

## Solutions

### Option 1: Use GoDaddy Domain Forwarding (Easiest - Recommended)
This is the simplest solution if you want to keep DNS management in GoDaddy.

**Steps:**
1. Log into your GoDaddy account
2. Go to **My Products** → **Domains** → Select `aperae.com`
3. Scroll down to **Additional Settings** → **Manage DNS**
4. In the DNS records, find or add a record for the apex domain (`@` or `aperae.com`)
5. Go to **Domain Forwarding** (or **Redirects**)
6. Set up a permanent redirect (301) from `aperae.com` to `https://www.aperae.com`
7. Ensure "Forward with masking" is **OFF** (use 301 permanent redirect)
8. Save the changes

**Pros:**
- Simple and quick
- No need to change nameservers
- Works immediately

**Cons:**
- Users see a redirect (minor performance impact)
- Browser address bar changes to `www.aperae.com`

---

### Option 2: Configure A Record in GoDaddy (Not Recommended by Vercel)
⚠️ **Note:** Vercel doesn't recommend this because IP addresses can change, but it can work.

**Steps:**
1. Log into GoDaddy
2. Go to **My Products** → **Domains** → Select `aperae.com`
3. Go to **Manage DNS**
4. Add or edit an **A Record**:
   - **Type:** A
   - **Name:** @ (or leave blank for apex domain)
   - **Value:** `76.76.21.21` (Vercel's IP - but verify this is current)
   - **TTL:** 600 (or default)

**Pros:**
- Apex domain works directly
- No redirect

**Cons:**
- Vercel doesn't guarantee static IPs (IPs can change)
- Requires monitoring and updating if IPs change
- Not officially supported by Vercel

---

### Option 3: Use Vercel's Nameservers (Best Long-term Solution)
Point your domain's nameservers to Vercel, allowing Vercel to manage all DNS records.

**Steps:**
1. **In Vercel:**
   - Go to your project dashboard
   - Navigate to **Settings** → **Domains**
   - Add `aperae.com` as a domain (not just `www.aperae.com`)
   - Vercel will provide nameservers (e.g., `ns1.vercel-dns.com`, `ns2.vercel-dns.com`)

2. **In GoDaddy:**
   - Log into your GoDaddy account
   - Go to **My Products** → **Domains** → Select `aperae.com`
   - Go to **Additional Settings** → **Manage DNS**
   - Scroll to **Nameservers** section
   - Click **Change**
   - Select **Custom** and enter Vercel's nameservers:
     - `ns1.vercel-dns.com`
     - `ns2.vercel-dns.com`
     - (Vercel will provide the exact nameservers)
   - Save changes

3. **DNS Propagation:**
   - Changes can take 24-48 hours to propagate globally
   - You can check propagation status using tools like:
     - https://www.whatsmydns.net/
     - https://dnschecker.org/

**Pros:**
- Vercel manages all DNS records
- Both apex and www work seamlessly
- No redirects needed
- Most reliable long-term solution
- SSL certificates managed automatically

**Cons:**
- DNS changes take time to propagate
- You lose control of DNS records in GoDaddy (but can manage in Vercel)

---

### Option 4: Use Cloudflare (Advanced)
Use Cloudflare as a DNS provider, which supports ALIAS/ANAME records that Vercel recommends.

**Steps:**
1. Sign up for Cloudflare (free tier works)
2. Add your domain to Cloudflare
3. Change nameservers in GoDaddy to Cloudflare's nameservers
4. In Cloudflare, add DNS records:
   - CNAME record: `www` → `cname.vercel-dns.com` (or Vercel's provided CNAME)
   - ALIAS/ANAME record: `@` → `cname.vercel-dns.com` (for apex domain)
5. Configure SSL/TLS settings in Cloudflare

**Pros:**
- Supports ALIAS/ANAME records (Vercel's recommendation)
- Free DNS management
- Additional performance and security features
- Both apex and www work perfectly

**Cons:**
- Requires Cloudflare account
- More complex setup
- Need to manage DNS in Cloudflare instead of GoDaddy

---

## Recommended Approach

**For quick fix:** Use **Option 1** (GoDaddy Domain Forwarding) - works immediately

**For best long-term solution:** Use **Option 3** (Vercel Nameservers) - most reliable and maintainable

## Verify Configuration in Vercel

Before making DNS changes, ensure both domains are added in Vercel:

1. Go to your Vercel project dashboard
2. Navigate to **Settings** → **Domains**
3. Verify both domains are listed:
   - ✅ `www.aperae.com`
   - ✅ `aperae.com` (add this if it's missing)
4. Ensure both domains show as "Valid Configuration"

## Testing After Changes

After making DNS changes:

1. Wait for DNS propagation (can take a few minutes to 48 hours)
2. Test using:
   - `https://aperae.com` - should work (no redirect or with redirect depending on option)
   - `https://www.aperae.com` - should still work
3. Use online tools to verify:
   - https://www.whatsmydns.net/#A/aperae.com
   - https://dnschecker.org/#A/aperae.com

## Additional Notes

- **HTTPS/SSL:** Vercel automatically provisions SSL certificates for both domains once DNS is properly configured
- **CORS:** Your backend CORS configuration already includes both `https://www.aperae.com` and `https://aperae.com` (good!)
- **SEO:** Option 1 (redirect) is fine for SEO - 301 redirects pass link juice to the www version

## Need Help?

If you encounter issues:
1. Check Vercel's domain documentation: https://vercel.com/docs/concepts/projects/domains
2. Verify DNS records using: `dig aperae.com` or `nslookup aperae.com`
3. Check Vercel project logs for domain configuration errors


