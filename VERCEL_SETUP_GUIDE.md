# 🚀 Complete Vercel Setup Guide for PocketSomm

This guide will walk you through setting up your PocketSomm app on Vercel from start to finish.

## 📋 Prerequisites

- ✅ Vercel account created (you've done this!)
- ✅ GitHub repository with your PocketSomm code
- ✅ Domain: `www.aperae.com` (you already have this)

---

## Step 1: Install Vercel CLI (Optional but Recommended)

While you can deploy via the Vercel dashboard, the CLI makes things easier:

```bash
npm install -g vercel
```

Verify installation:
```bash
vercel --version
```

---

## Step 2: Prepare Your Build

First, let's make sure your app builds correctly:

```bash
# Make sure you're in the project root
cd C:\Users\ramyy\Production\Aperae

# Build the web app for production
npm run web:build:production
```

This will:
- Create a `web-build` folder with your static files
- Set production environment variables
- Optimize the build for production

**Expected output**: You should see a `web-build` folder created with `index.html` and other assets.

---

## Step 3: Deploy to Vercel

You have **two options**: Dashboard (easier) or CLI (faster for future deployments).

### Option A: Deploy via Vercel Dashboard (Recommended for First Time)

1. **Go to Vercel Dashboard**
   - Visit [vercel.com/dashboard](https://vercel.com/dashboard)
   - Log in with your account

2. **Create New Project**
   - Click the **"Add New..."** button (top right)
   - Select **"Project"**

3. **Import Git Repository**
   - If your code is on GitHub, you'll see a list of repositories
   - Find your PocketSomm repository
   - Click **"Import"** next to it
   
   **OR if your code isn't on GitHub yet:**
   - Click **"Deploy"** tab
   - Click **"Browse"** and select your `web-build` folder
   - This will upload directly (manual deployment)

4. **Configure Project Settings**
   
   If importing from GitHub, you'll see configuration options:
   
   - **Framework Preset**: Select **"Other"** (important - don't use auto-detected Expo)
   - **Root Directory**: Leave as `./` (or set to `.` if you see an option)
   - **Build Command**: You may see it pre-filled with `npx expo export:web` - **CHANGE IT TO**:
     ```
     npm run web:build:production
     ```
   - **Output Directory**: Should already be `web-build` (correct) - leave it as is:
     ```
     web-build
     ```
   - **Install Command**: Leave as `npm install` (default)
   
   **⚠️ Important**: If you don't see fields to edit Build Command/Output Directory, click **"Show"** or **"Override"** next to the Framework Preset to reveal advanced options, or select **"Other"** as the framework preset which will allow you to edit all settings.

5. **Environment Variables** (Optional for now)
   - You can skip this for now - the build script sets `EXPO_PUBLIC_ENV=production`
   - Your API URL is already configured in `app.json` as `https://api.aperae.com/api`

6. **Deploy**
   - Click **"Deploy"** button
   - Wait for the build to complete (usually 2-5 minutes)
   - You'll see a success message with a preview URL like `pocketsomm-xyz.vercel.app`

**Congratulations!** Your app is now deployed! 🎉

---

### Option B: Deploy via CLI (Recommended - Bypasses UI Issues)

**💡 If the dashboard UI won't let you edit build settings, use the CLI instead - it automatically uses your `vercel.json` configuration!**

**📖 New to CLI?** See [CLI_DEPLOYMENT_FOR_BEGINNERS.md](./CLI_DEPLOYMENT_FOR_BEGINNERS.md) for a complete beginner-friendly guide with explanations of every step.

**⚡ Just need quick steps?** See [VERCEL_CLI_QUICK_START.md](./VERCEL_CLI_QUICK_START.md) for the essential commands.

Or follow the steps below:

1. **Navigate to your project root**:
   ```bash
   cd C:\Users\ramyy\Production\Aperae
   ```

2. **Login to Vercel**:
   ```bash
   vercel login
   ```
   - This will open your browser to authenticate
   - Follow the prompts to complete login

3. **Deploy**:
   ```bash
   # First deployment (follow prompts)
   vercel
   ```
   
   You'll be asked several questions:
   - **Set up and deploy?** → Type `Y` and press Enter
   - **Which scope?** → Select your account (usually option 1)
   - **Link to existing project?** → Type `N` (for first time)
   - **What's your project's name?** → Type `pocketsomm` (or your preferred name)
   - **In which directory is your code located?** → Type `./` or press Enter
   - **Want to override the settings?** → Type `N` (say NO - this uses your `vercel.json` file which has correct settings!)
   
   **Important:** When asked "Want to override the settings?", say **NO** (`N`) - this tells Vercel to use your `vercel.json` file!

4. **Production Deployment**:
   ```bash
   vercel --prod
   ```
   This deploys to your production URL.

---

## Step 4: Add Custom Domain

Now let's connect `www.aperae.com` to your Vercel deployment:

### 4.1 Add Domain in Vercel Dashboard

1. **Go to Your Project**
   - In Vercel dashboard, click on your project (e.g., "pocketsomm")

2. **Navigate to Settings**
   - Click **"Settings"** tab (top navigation)

3. **Go to Domains Section**
   - Click **"Domains"** in the left sidebar

4. **Add Domain**
   - Click **"Add"** button
   - Enter: `www.aperae.com`
   - Click **"Add"**
   
5. **Add Root Domain (Optional but Recommended)**
   - Click **"Add"** again
   - Enter: `aperae.com`
   - Check the box **"Redirect to www.aperae.com"** (recommended)
   - Click **"Add"**

6. **View DNS Configuration**
   - Vercel will show you DNS records you need to add
   - You'll see something like:
     ```
     Type: CNAME
     Name: www
     Value: cname.vercel-dns.com
     ```
   - **Copy these values** - you'll need them in the next step

---

### 4.2 Configure DNS Records

You need to add DNS records to your domain registrar (where you bought aperae.com):

1. **Log in to Your Domain Registrar**
   - This could be GoDaddy, Namecheap, Google Domains, Cloudflare, etc.
   - Find where you manage DNS settings for `aperae.com`

2. **Add CNAME Record for www**
   - Go to DNS Management / DNS Settings
   - Click **"Add Record"** or **"Create Record"**
   - **Record Type**: Select **CNAME**
   - **Name/Host**: Enter `www` (or `www.aperae.com` depending on your registrar)
   - **Value/Target**: Enter `cname.vercel-dns.com` (or what Vercel showed you)
   - **TTL**: Leave as default (or 3600)
   - Click **"Save"** or **"Add Record"**

3. **Add A Record for Root Domain (if not redirecting)**
   - If you want `aperae.com` (without www) to work:
     - **Record Type**: Select **A**
     - **Name/Host**: Enter `@` (or leave blank, or `aperae.com`)
     - **Value/Target**: Enter the IP address Vercel provides (usually `76.76.21.21`)
     - Click **"Save"**
   - **OR** if you set up redirect in Vercel, you don't need this

4. **Wait for DNS Propagation**
   - DNS changes can take 5 minutes to 48 hours (usually 5-30 minutes)
   - Vercel will show the status in the Domains section
   - When it shows **"Valid Configuration"**, you're good!

---

### 4.3 Verify SSL Certificate

1. **SSL is Automatic**
   - Vercel automatically provisions SSL certificates via Let's Encrypt
   - This usually happens within a few minutes of DNS propagation
   - Check the domain status in Vercel - it should show **"Valid Configuration"** with a green checkmark

2. **Test Your Domain**
   - Once DNS propagates and SSL is ready, visit:
     - `https://www.aperae.com`
   - Your app should load! 🎉

---

## Step 5: Set Up Automatic Deployments (Recommended)

Connect your GitHub repo for automatic deployments on every push:

### 5.1 Connect GitHub Repository

1. **In Vercel Dashboard**
   - Go to your project → Settings → Git

2. **Connect Repository**
   - Click **"Connect Git Repository"**
   - Select your GitHub account
   - Choose your PocketSomm repository
   - Click **"Connect"**

3. **Configure Build Settings** (if prompted)
   - Framework Preset: **Other**
   - Root Directory: `./`
   - Build Command: `npm run web:build:production`
   - Output Directory: `web-build`
   - Install Command: `npm install`

4. **Deploy**
   - Click **"Deploy"**
   - Vercel will automatically deploy on every push to your main branch!

---

### 5.2 Environment Variables (If Needed)

If you need to set environment variables:

1. **Go to Project Settings**
   - Settings → Environment Variables

2. **Add Variables**
   - Variable Name: `EXPO_PUBLIC_ENV`
   - Value: `production`
   - Environments: Select all (Production, Preview, Development)
   - Click **"Save"**

   (Note: You may not need this if your build script handles it)

---

## Step 6: Test Your Deployment

1. **Test the Website**
   - Visit `https://www.aperae.com`
   - Test all features:
     - Home screen wine recommendations
     - Menu screen wine pairing
     - File upload functionality
     - Favorites (if applicable)

2. **Test on Mobile**
   - Open `https://www.aperae.com` on your phone
   - Test file upload (should work!)
   - Verify responsive design

3. **Check Browser Console**
   - Open browser dev tools (F12)
   - Check for any errors
   - Verify API calls are going to `https://api.aperae.com/api`

---

## 🎉 You're Done!

Your PocketSomm app is now live at **www.aperae.com**!

---

## 🔄 Future Updates

### To Update Your App:

**Option 1: Automatic (Recommended)**
- Just push to your GitHub main branch
- Vercel automatically builds and deploys
- Takes 2-5 minutes

**Option 2: Manual CLI**
```bash
# Build locally
npm run web:build:production

# Deploy to production
vercel --prod
```

---

## 🐛 Troubleshooting

### Domain Not Working?

1. **Check DNS Propagation**
   - Use [whatsmydns.net](https://www.whatsmydns.net)
   - Check if `www.aperae.com` resolves to Vercel's servers

2. **Check Vercel Domain Status**
   - Go to Settings → Domains
   - Check if it shows "Valid Configuration"
   - If not, check the error message

3. **Verify DNS Records**
   - Double-check CNAME record points to `cname.vercel-dns.com`
   - Make sure there are no conflicting records

### Build Errors?

1. **Check Build Logs**
   - Go to your project → Deployments
   - Click on the failed deployment
   - Check the build logs for errors

2. **Common Issues**:
   - Missing dependencies: Make sure `package.json` has all required packages
   - Build command wrong: Verify it's `npm run web:build:production`
   - Output directory wrong: Verify it's `web-build`

### App Not Loading?

1. **Check API Connection**
   - Open browser console (F12)
   - Check if API calls are working
   - Verify CORS is configured correctly on backend

2. **Check Backend Status**
   - Visit `https://api.aperae.com/api/health`
   - Make sure backend is running

---

## 📞 Need Help?

- **Vercel Docs**: [vercel.com/docs](https://vercel.com/docs)
- **Vercel Support**: Available in dashboard
- **Community**: [github.com/vercel/vercel/discussions](https://github.com/vercel/vercel/discussions)

---

## ✅ Checklist

- [ ] Vercel account created
- [ ] Project deployed to Vercel
- [ ] Custom domain added (`www.aperae.com`)
- [ ] DNS records configured
- [ ] SSL certificate active
- [ ] Website loads at `https://www.aperae.com`
- [ ] Tested on mobile device
- [ ] All features working
- [ ] GitHub connected for automatic deployments (optional)

**You're all set! 🚀**

