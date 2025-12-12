# Domain Strategy: www.aperae.com

## 🎯 **Should You Use It Now? YES, But Strategically**

**Short Answer:** Yes, you should start using `www.aperae.com` for **production/preview environments** and some development use cases, but **keep localhost for active development**.

---

## ✅ **Benefits of Using Your Domain NOW**

### 1. **Professional Branding** 🎨
- ✅ Replace temporary URLs (localhost, ngrok, IP addresses)
- ✅ Build brand recognition
- ✅ Professional appearance for demos/testers
- ✅ Marketing materials can reference the real domain

### 2. **Stable API Endpoints** 🔒
- ✅ No more changing ngrok URLs
- ✅ Consistent URLs for mobile app builds
- ✅ Easier for team members/testers
- ✅ Better for documentation

### 3. **SSL/HTTPS** 🔐
- ✅ Security best practice (required for production)
- ✅ Trust indicators in browsers
- ✅ Required for certain mobile app features
- ✅ Better SEO (if you have a website)

### 4. **Email & Marketing** 📧
- ✅ Professional email addresses: `support@aperae.com`, `hello@aperae.com`
- ✅ Email verification links can use your domain
- ✅ Marketing campaigns have branded links

### 5. **Production Readiness** 🚀
- ✅ Test production-like environment
- ✅ Preview/staging deployments
- ✅ Demo environments for stakeholders

---

## ⚠️ **What You Should NOT Use It For (Yet)**

### ❌ **Active Development**
- Keep using `localhost` for daily coding
- Faster feedback loop
- No DNS/SSL complexity during debugging
- No external dependencies

### ❌ **Before Security is Complete**
- Wait until session storage is fixed (critical blocker)
- Ensure HTTPS is properly configured
- Complete security audit

---

## 🎯 **Recommended Strategy: Phased Approach**

### **Phase 1: NOW - Basic Setup (This Week)**

**What to Do:**
1. ✅ **Point domain to staging server**
   - Set up subdomain: `api.aperae.com` (or `api-staging.aperae.com`)
   - Point `www.aperae.com` to frontend (if you have web version)
   
2. ✅ **SSL Certificate Setup**
   - Use Let's Encrypt (free) or Cloudflare (free SSL)
   - Configure HTTPS for both frontend and API

3. ✅ **Update Environment Variables**
   - Add production API URL config
   - Keep localhost as default for development

4. ✅ **Configure CORS**
   - Add `https://www.aperae.com` to allowed origins
   - Add `https://api.aperae.com` if separate subdomain

### **Phase 2: Preview/Staging (Next 2 Weeks)**

**What to Do:**
1. ✅ **Deploy to staging environment**
   - Use `staging.aperae.com` or `preview.aperae.com`
   - Test with real domain/SSL
   - Share with beta testers

2. ✅ **Update Mobile App**
   - Add production API URL option
   - Keep localhost as dev default

### **Phase 3: Production (After Critical Fixes)**

**What to Do:**
1. ✅ **Fix session storage** (critical blocker)
2. ✅ **Complete security audit**
3. ✅ **Set up monitoring**
4. ✅ **Deploy to production domain**

---

## 🔧 **How to Configure Your Domain**

### **Option 1: Single Domain with Paths** (Simpler)

**Setup:**
- `www.aperae.com` → Frontend (if web version exists)
- `www.aperae.com/api` → Backend API (via reverse proxy)

**Pros:**
- ✅ Simpler DNS setup
- ✅ Single SSL certificate
- ✅ One domain to manage

**Cons:**
- ⚠️ Requires reverse proxy (Nginx)
- ⚠️ Slightly more complex routing

### **Option 2: Subdomains** (Recommended)

**Setup:**
- `www.aperae.com` → Frontend/web
- `api.aperae.com` → Backend API
- `staging.aperae.com` → Staging environment
- `admin.aperae.com` → Admin panel (future)

**Pros:**
- ✅ Clean separation
- ✅ Easy to scale
- ✅ Independent SSL certs
- ✅ Better for mobile apps

**Cons:**
- ⚠️ More DNS records
- ⚠️ Multiple SSL certs (but free with Let's Encrypt)

---

## 📋 **Implementation Checklist**

### **Immediate (This Week)**
- [ ] **DNS Setup**
  - [ ] Point `api.aperae.com` → Your server IP
  - [ ] Point `www.aperae.com` → Your frontend (or placeholder)
  - [ ] Set up `staging.aperae.com` if needed

- [ ] **SSL Certificates**
  - [ ] Set up Let's Encrypt OR use Cloudflare (free SSL)
  - [ ] Configure HTTPS for API
  - [ ] Configure HTTPS for frontend

- [ ] **Backend Configuration**
  - [ ] Update CORS to allow `https://www.aperae.com`
  - [ ] Add domain to `ALLOWED_ORIGINS` environment variable
  - [ ] Update Swagger docs with production URL

- [ ] **Frontend Configuration**
  - [ ] Add production API URL option
  - [ ] Update `src/utils/api.ts` to support production domain
  - [ ] Keep localhost as development default

### **This Month**
- [ ] **Deploy Staging Environment**
  - [ ] Set up staging server
  - [ ] Deploy backend to staging
  - [ ] Configure staging database
  - [ ] Test with real domain

- [ ] **Update Documentation**
  - [ ] Update README with domain info
  - [ ] Update API documentation
  - [ ] Create deployment guide

### **Before Production**
- [ ] **Fix Critical Issues**
  - [ ] Session storage in database
  - [ ] Complete security audit
  - [ ] Set up monitoring

- [ ] **Production Setup**
  - [ ] Production server deployment
  - [ ] Production database
  - [ ] CDN for static assets (optional)
  - [ ] Monitoring and alerting

---

## 🔧 **Code Changes Needed**

### **1. Update Backend CORS (`backend/server.js`)**

```javascript
const allowedOrigins = (() => {
  const env = (process.env.ALLOWED_ORIGINS || '').split(',').map(s => s.trim()).filter(Boolean);
  const defaults = [
    'http://localhost:3000',
    'http://localhost:19006',
    'https://localhost:3000',
    'https://localhost:19006',
    // Add production domains
    'https://www.aperae.com',
    'https://api.aperae.com',
    'https://staging.aperae.com',
    // Expo development
    'exp://127.0.0.1:8081',
    'exp://localhost:8081'
  ];
  return env.length ? env : defaults;
})();
```

### **2. Update Frontend API Config (`src/utils/api.ts`)**

```typescript
const getApiBaseUrl = (): string => {
  // Production/Staging
  if (process.env.EXPO_PUBLIC_ENV === 'production') {
    return 'https://api.aperae.com/api';
  }
  
  if (process.env.EXPO_PUBLIC_ENV === 'staging') {
    return 'https://staging-api.aperae.com/api';
  }
  
  // Development - use localhost
  const envUrl = (process.env.EXPO_PUBLIC_API_URL || '').trim();
  if (envUrl) {
    return envUrl;
  }
  
  // Default: localhost for development
  return 'http://localhost:3001/api';
};
```

### **3. Update Environment Variables**

**`.env` (Development):**
```bash
NODE_ENV=development
ALLOWED_ORIGINS=http://localhost:3000,http://localhost:19006,https://www.aperae.com
```

**`.env.production`:**
```bash
NODE_ENV=production
ALLOWED_ORIGINS=https://www.aperae.com,https://api.aperae.com
```

---

## 🌐 **Hosting Options**

### **Option 1: VPS/Cloud Server** (Recommended for API)
- **Providers:** DigitalOcean, AWS, Google Cloud, Azure
- **Cost:** $5-20/month
- **Control:** Full control, good for Node.js apps
- **SSL:** Let's Encrypt (free)

### **Option 2: Platform-as-a-Service**
- **Providers:** Vercel, Netlify, Railway, Render
- **Cost:** Free tier available, $10-20/month for production
- **Control:** Less control, but easier deployment
- **SSL:** Included automatically

### **Option 3: Serverless**
- **Providers:** AWS Lambda, Vercel Functions
- **Cost:** Pay per request (cheap for low traffic)
- **Control:** Limited, but scales automatically
- **SSL:** Included automatically

---

## 📊 **Cost-Benefit Analysis**

### **Costs:**
- Domain: ✅ Already purchased
- SSL: FREE (Let's Encrypt or Cloudflare)
- Hosting: $5-20/month (depends on traffic)
- **Total: ~$5-20/month**

### **Benefits:**
- ✅ Professional branding
- ✅ Stable URLs
- ✅ Security (HTTPS)
- ✅ Better user trust
- ✅ Marketing-ready
- ✅ Production-ready

**ROI: HIGH** - Very low cost for significant benefits

---

## 🎯 **Recommendation**

### **Use Your Domain NOW for:**
1. ✅ **Staging/Preview Environment** - Test with real domain
2. ✅ **API Endpoints** - Stable URLs for mobile app
3. ✅ **Demos** - Professional appearance
4. ✅ **Marketing** - Branded links in materials

### **Wait for Production Until:**
1. ⏳ Session storage is fixed (critical blocker)
2. ⏳ Security audit complete
3. ⏳ Monitoring set up

### **Action Plan:**
1. **This Week:** Set up DNS, SSL, configure CORS
2. **Next Week:** Deploy staging environment
3. **This Month:** Test with beta users
4. **After Fixes:** Deploy to production

---

## 🚀 **Next Steps**

1. **Choose hosting provider** (DigitalOcean, AWS, etc.)
2. **Set up DNS records** (point domain to server)
3. **Configure SSL** (Let's Encrypt or Cloudflare)
4. **Update code** (CORS, API URLs)
5. **Deploy staging** (test with real domain)
6. **Share with testers** (get feedback)

**Want help setting this up? I can guide you through DNS, SSL, and code changes!**





