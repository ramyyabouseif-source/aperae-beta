# 🌐 Web Deployment Guide for www.aperae.com

This guide explains how to deploy PocketSomm as a web application to www.aperae.com, making it accessible via browser without requiring the iOS App Store.

## 📋 Prerequisites

1. **Domain Setup**: You already have `aperae.com` domain purchased
2. **Backend API**: Backend is deployed at `https://api.aperae.com/api` (already configured)
3. **Hosting Provider**: Choose one of the following:
   - **Vercel** (Recommended - Free tier, excellent for React/Expo apps)
   - **Netlify** (Free tier, easy deployment)
   - **Cloudflare Pages** (Free tier, fast CDN)
   - **Render** (Static site hosting - Free tier available)
   - **Your own server** (Nginx, Apache, etc.)

## 🚀 Quick Start

### Option 1: Deploy to Vercel (Recommended)

**📖 For detailed step-by-step instructions, see [VERCEL_SETUP_GUIDE.md](./VERCEL_SETUP_GUIDE.md)**

Quick steps:

1. **Build the web app**:
   ```bash
   npm run web:build:production
   ```
   This creates a `web-build` folder with static files.

2. **Deploy via Dashboard** (Easiest for first time):
   - Go to [vercel.com/dashboard](https://vercel.com/dashboard)
   - Click "Add New..." → "Project"
   - Import your GitHub repo OR upload the `web-build` folder
   - Configure build settings:
     - Build Command: `npm run web:build:production`
     - Output Directory: `web-build`
   - Click "Deploy"

3. **Add Custom Domain**:
   - In Vercel dashboard → Your Project → Settings → Domains
   - Click "Add" and enter `www.aperae.com`
   - Follow DNS instructions to add CNAME record pointing to `cname.vercel-dns.com`
   - Wait for DNS propagation (5-30 minutes)

**See [VERCEL_SETUP_GUIDE.md](./VERCEL_SETUP_GUIDE.md) for complete detailed instructions.**

### Option 2: Deploy to Netlify

1. **Build the web app**:
   ```bash
   npm run web:build:production
   ```

2. **Deploy**:
   - Drag and drop the `web-build` folder to Netlify, OR
   - Use Netlify CLI: `netlify deploy --prod --dir=web-build`

3. **Configure Custom Domain**:
   - In Netlify dashboard → Site settings → Domain management
   - Add `www.aperae.com` and follow DNS setup instructions

### Option 3: Deploy to Cloudflare Pages

1. **Build the web app**:
   ```bash
   npm run web:build:production
   ```

2. **Connect GitHub repo** to Cloudflare Pages
3. **Build settings**:
   - Build command: `npm run web:build:production`
   - Output directory: `web-build`
   - Root directory: `/`

4. **Configure Custom Domain**:
   - In Cloudflare Pages → Custom domains
   - Add `www.aperae.com`

### Option 4: Deploy to Your Own Server

1. **Build the web app**:
   ```bash
   npm run web:build:production
   ```

2. **Upload files**:
   - Upload all files from `web-build` folder to your web server
   - Recommended location: `/var/www/aperae.com` or similar

3. **Configure Nginx** (example):
   ```nginx
   server {
       listen 80;
       server_name www.aperae.com aperae.com;
       
       # Redirect HTTP to HTTPS
       return 301 https://$server_name$request_uri;
   }
   
   server {
       listen 443 ssl http2;
       server_name www.aperae.com aperae.com;
       
       ssl_certificate /path/to/ssl/cert.pem;
       ssl_certificate_key /path/to/ssl/key.pem;
       
       root /var/www/aperae.com;
       index index.html;
       
       # SPA routing - serve index.html for all routes
       location / {
           try_files $uri $uri/ /index.html;
       }
       
       # Cache static assets
       location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
           expires 1y;
           add_header Cache-Control "public, immutable";
       }
       
       # Security headers
       add_header X-Frame-Options "SAMEORIGIN" always;
       add_header X-Content-Type-Options "nosniff" always;
       add_header X-XSS-Protection "1; mode=block" always;
   }
   ```

## 🔧 Configuration

### Environment Variables

For production web deployment, set these environment variables:

```bash
EXPO_PUBLIC_ENV=production
EXPO_PUBLIC_API_URL=https://api.aperae.com/api
```

These are automatically set when you run `npm run web:build:production`.

### Backend CORS Configuration

The backend is already configured to allow requests from:
- `https://www.aperae.com`
- `https://aperae.com`

If you need to update CORS settings, edit `backend/server.js` and update the `allowedOrigins` array.

## 📱 Mobile-Friendly Features

The web app is already mobile-responsive:
- ✅ Responsive design using React Native Web
- ✅ Touch-friendly UI elements
- ✅ File upload for menu photos (works on mobile browsers)
- ✅ Optimized for mobile viewports
- ✅ PWA-ready (can be installed as app on mobile devices)

### Testing Mobile Experience

1. **Local testing**:
   ```bash
   npm run web
   ```
   Then open `http://localhost:19006` on your mobile device (same network)

2. **Production testing**:
   - Visit `https://www.aperae.com` on your mobile device
   - Test all features: dish recommendations, menu analysis, favorites

## 🎨 Assets Setup

### Favicon

Create a favicon file at `assets/favicon.png` (recommended size: 512x512px).

If you don't have one yet, you can:
1. Use a wine-themed icon
2. Generate one using online tools (e.g., favicon.io)
3. The app will work without it, but it's recommended for a professional look

## 🔄 Continuous Deployment

### GitHub Actions (Recommended)

Create `.github/workflows/web-deploy.yml`:

```yaml
name: Deploy Web to Production

on:
  push:
    branches:
      - main

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Build web app
        run: npm run web:build:production
        env:
          EXPO_PUBLIC_ENV: production
      
      - name: Deploy to Vercel
        uses: amondnet/vercel-action@v20
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
          vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}
          vercel-args: '--prod'
```

## 🧪 Testing Before Deployment

1. **Build locally**:
   ```bash
   npm run web:build:production
   ```

2. **Test the build**:
   ```bash
   cd web-build
   npx serve -s .
   ```
   Visit `http://localhost:3000` and test all features.

3. **Test on mobile**:
   - Use your phone's browser to access the local server
   - Test camera/file upload functionality
   - Verify responsive design

## 📊 Monitoring

After deployment, monitor:
- **Error tracking**: Set up Sentry or similar
- **Analytics**: Google Analytics or Plausible
- **Performance**: Lighthouse scores
- **Uptime**: UptimeRobot or similar

## 🔒 Security Checklist

- [x] HTTPS enabled (required for production)
- [x] CORS configured correctly
- [x] Security headers set (via hosting provider or Nginx)
- [x] API endpoints secured
- [ ] Rate limiting on backend (already configured)
- [ ] Error messages don't expose sensitive info

## 🐛 Troubleshooting

### Build Errors

If you encounter build errors:
```bash
# Clear cache and rebuild
rm -rf node_modules .expo web-build
npm install
npm run web:build:production
```

### CORS Errors

If you see CORS errors:
1. Check backend logs for rejected origins
2. Verify `www.aperae.com` is in `backend/server.js` allowedOrigins
3. Check browser console for exact error message

### File Upload Not Working

- On web, file upload uses HTML5 file input
- Test in different browsers (Chrome, Safari, Firefox)
- Check browser console for errors

## 📝 Next Steps

1. **Deploy the web app** using one of the methods above
2. **Configure DNS** to point `www.aperae.com` to your hosting provider
3. **Set up SSL certificate** (automatic with Vercel/Netlify/Cloudflare)
4. **Test thoroughly** on desktop and mobile browsers
5. **Monitor performance** and user feedback

## 🎉 Benefits of Web Deployment

- ✅ **No App Store fees** - Free to deploy and update
- ✅ **Instant updates** - No app review process
- ✅ **Cross-platform** - Works on iOS, Android, Desktop
- ✅ **Easy sharing** - Just send a URL
- ✅ **SEO friendly** - Can be indexed by search engines
- ✅ **Lower barrier to entry** - Users don't need to download an app

## 📞 Support

If you encounter issues:
1. Check the troubleshooting section above
2. Review backend logs at `https://api.aperae.com/api/health`
3. Check browser console for frontend errors
4. Verify DNS propagation with `dig www.aperae.com`

---

**Ready to deploy?** Start with Option 1 (Vercel) for the easiest setup! 🚀

