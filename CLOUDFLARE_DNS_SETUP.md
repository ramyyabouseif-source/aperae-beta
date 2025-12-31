# 🌐 Add/Update DNS Record in Cloudflare

## ✅ Your DNS is Managed by Cloudflare

Your domain `aperae.com` is using Cloudflare nameservers, so you need to add or update the DNS record in Cloudflare, not GoDaddy.

**⚠️ If you get "CNAME record already exists" error:** See [UPDATE_EXISTING_CLOUDFLARE_DNS.md](./UPDATE_EXISTING_CLOUDFLARE_DNS.md) - you need to **edit** the existing record instead!

---

## 📝 Step-by-Step Instructions

### Step 1: Log Into Cloudflare

1. Go to: https://dash.cloudflare.com
2. Log in with your Cloudflare account
   - **Don't have an account?** Sign up with the same email you use for other services

### Step 2: Select Your Domain

1. In your Cloudflare dashboard, you'll see a list of domains
2. Click on **`aperae.com`**
3. You'll see the Cloudflare dashboard for your domain

### Step 3: Go to DNS Settings

1. In the left sidebar, click **"DNS"**
2. You'll see a section called **"Records"**
3. This is where you'll add your DNS record

### Step 4: Add CNAME Record for www.aperae.com

1. Click the **"Add record"** button
2. Fill in the form:
   
   **Type:**
   - Select **"CNAME"** from the dropdown
   
   **Name:**
   - Enter: `www`
   - (Don't enter `www.aperae.com` - just `www`)
   
   **Target:**
   - Enter: `cname.vercel-dns.com`
   - (Or copy the exact value that Vercel showed you when you added the domain)
   
   **Proxy status:**
   - You'll see an orange cloud ☁️ (Proxied) or gray cloud ☁️ (DNS only)
   - **Either works**, but I recommend:
     - **Gray cloud (DNS only)** = Simpler, direct connection
     - **Orange cloud (Proxied)** = Goes through Cloudflare (can add caching/security)
   - Click the cloud icon to toggle if needed
   
   **TTL:**
   - Leave as "Auto" (default)

3. Click **"Save"** button

### Step 5: Verify the Record

After saving, you should see a new record in the list:
```
Type    Name    Content                    Proxy
CNAME   www     cname.vercel-dns.com       [cloud icon]
```

### Step 6: Wait for DNS Propagation

- DNS changes usually take **5-30 minutes** to propagate
- Sometimes it can take up to 48 hours (but usually much faster)

### Step 7: Check Status in Vercel

1. Go back to Vercel dashboard
2. Go to your project → Settings → Domains
3. Check the status of `www.aperae.com`
4. It should show **"Valid Configuration"** with a green checkmark when DNS is ready

### Step 8: Test Your Domain

Once DNS propagates, visit:
- `https://www.aperae.com`

Your PocketSomm app should load! 🎉

---

## 🔍 Optional: Add Root Domain (aperae.com without www)

If you also want `aperae.com` (without www) to work:

### Option A: Redirect to www (Recommended)

1. In Vercel dashboard → Settings → Domains
2. Add `aperae.com` as a new domain
3. Check the box **"Redirect to www.aperae.com"**
4. In Cloudflare, you don't need to add a DNS record - Vercel handles the redirect

### Option B: Make aperae.com work directly

1. Add `aperae.com` in Vercel (don't check redirect)
2. In Cloudflare, add an **A record**:
   - **Type**: A
   - **Name**: `@` (or leave blank, depending on Cloudflare's interface)
   - **Target**: Enter the IP address Vercel provides (usually `76.76.21.21`)
   - **Proxy**: Your choice (gray or orange cloud)
   - **TTL**: Auto

---

## ❓ Common Questions

### Q: I don't have a Cloudflare account
**A:** 
1. Go to https://dash.cloudflare.com/sign-up
2. Sign up with your email
3. Add your domain `aperae.com`
4. Cloudflare will detect it's already using Cloudflare nameservers
5. Follow the steps above

### Q: I can't find my domain in Cloudflare
**A:**
- Make sure you're logged into the correct account
- Try searching for `aperae.com` in the dashboard
- If it's not there, you may need to add it first

### Q: What if I want to use GoDaddy DNS instead?
**A:**
- This is possible but takes 24-48 hours
- You'd need to change nameservers back to GoDaddy
- Not recommended if Cloudflare is already working
- See "Scenario 3" in DNS_NAMESERVER_FIX.md if you really want to switch

### Q: How do I know DNS is ready?
**A:**
1. Check Vercel dashboard → Domains → should show "Valid Configuration"
2. OR visit https://www.whatsmydns.net/#CNAME/www.aperae.com
3. Should show `cname.vercel-dns.com` when ready

---

## ✅ Quick Checklist

- [ ] Logged into Cloudflare
- [ ] Selected `aperae.com` domain
- [ ] Went to DNS → Records
- [ ] Added CNAME record:
  - Type: CNAME
  - Name: `www`
  - Target: `cname.vercel-dns.com`
- [ ] Saved the record
- [ ] Waited 5-30 minutes
- [ ] Checked Vercel dashboard (should show "Valid Configuration")
- [ ] Tested `https://www.aperae.com`

---

**You've got this!** Once you add the CNAME record in Cloudflare, your domain will be live! 🚀

