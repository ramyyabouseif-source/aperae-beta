# Environment Variables Guide

## Overview

This guide explains all environment variables needed for different environments (development, staging, production).

---

## 📁 **Environment Files**

### **Development**
- **File:** `.env` (in project root)
- **File:** `backend/.env` (for backend-specific vars)
- **Status:** ✅ Already configured for localhost

### **Staging**
- **File:** `.env.staging` (create when ready)
- **File:** `backend/.env.staging` (create when ready)
- **Status:** ⏳ Create when deploying to staging

### **Production**
- **File:** `.env.production` (create when ready)
- **File:** `backend/.env.production` (create when ready)
- **Status:** ⏳ Create when deploying to production

**⚠️ IMPORTANT:** Never commit `.env`, `.env.staging`, or `.env.production` files to git!

---

## 🔧 **Required Environment Variables**

### **Backend Environment Variables**

#### **Server Configuration**
```bash
NODE_ENV=production          # or 'development' or 'staging'
PORT=3001                    # Server port
```

#### **Domain Configuration**
```bash
# Development
ALLOWED_ORIGINS=http://localhost:3000,http://localhost:19006

# Staging
ALLOWED_ORIGINS=https://staging.aperae.com,https://staging-api.aperae.com

# Production
ALLOWED_ORIGINS=https://www.aperae.com,https://api.aperae.com
```

#### **Database Configuration**
```bash
# Supabase PostgreSQL connection string
DATABASE_URL=postgresql://user:password@host:5432/database?pgbouncer=true&connection_limit=5
```

#### **JWT Secrets (REQUIRED)**
```bash
# Generate with: openssl rand -base64 32
JWT_SECRET=your-secure-jwt-secret-minimum-32-characters
REFRESH_SECRET=your-secure-refresh-secret-minimum-32-characters
```

#### **API Keys**
```bash
# Anthropic Claude API Key
ANTHROPIC_API_KEY=sk-ant-your-api-key-here

# Google Cloud Vision API (choose one method)
# Method 1: Environment variables
GOOGLE_CLOUD_PROJECT_ID=your-project-id
GOOGLE_CLOUD_CLIENT_EMAIL=your-service-account@project.iam.gserviceaccount.com
GOOGLE_CLOUD_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
# Method 2: Credentials file
GOOGLE_APPLICATION_CREDENTIALS=/path/to/credentials.json
```

#### **Feature Flags**
```bash
ENABLE_V7_PROMPT=true        # Enable V7.0 prompt with caching
ENABLE_ENHANCED_PROMPT=false
MOCK_MODE=false             # Set to true only for testing
```

#### **Logging & Monitoring**
```bash
LOG_LEVEL=info              # debug, info, warn, error
```

#### **Security Settings**
```bash
RATE_LIMIT_MAX_REQUESTS=100
RATE_LIMIT_WINDOW_MS=900000  # 15 minutes in milliseconds
```

---

### **Frontend Environment Variables**

#### **API Configuration**
```bash
# Development (defaults to localhost)
EXPO_PUBLIC_API_URL=http://localhost:3001/api

# Staging
EXPO_PUBLIC_ENV=staging
EXPO_PUBLIC_API_URL=https://staging-api.aperae.com/api

# Production
EXPO_PUBLIC_ENV=production
EXPO_PUBLIC_API_URL=https://api.aperae.com/api
```

**Note:** If `EXPO_PUBLIC_ENV` is set to `production` or `staging`, the API URL is automatically selected. You can override with `EXPO_PUBLIC_API_URL` if needed.

---

## 📋 **Environment Setup Checklist**

### **Development (Local)**
- [x] `.env` file exists (already configured)
- [x] `backend/.env` file exists (already configured)
- [x] All required variables set
- [x] Using localhost URLs

### **Staging**
- [ ] Create `.env.staging` file
- [ ] Create `backend/.env.staging` file
- [ ] Set `NODE_ENV=staging`
- [ ] Set `ALLOWED_ORIGINS` to staging domains
- [ ] Set `DATABASE_URL` to staging database
- [ ] Generate new JWT secrets (different from production!)
- [ ] Set `EXPO_PUBLIC_ENV=staging` in frontend

### **Production**
- [ ] Create `.env.production` file
- [ ] Create `backend/.env.production` file
- [ ] Set `NODE_ENV=production`
- [ ] Set `ALLOWED_ORIGINS` to production domains
- [ ] Set `DATABASE_URL` to production database
- [ ] Generate new JWT secrets (different from staging!)
- [ ] Set `EXPO_PUBLIC_ENV=production` in frontend
- [ ] Enable `ENABLE_V7_PROMPT=true`
- [ ] Set `MOCK_MODE=false`

---

## 🔐 **Security Best Practices**

1. **Never commit `.env` files** - They contain secrets!
2. **Use different JWT secrets** for each environment
3. **Rotate secrets regularly** - Especially if compromised
4. **Use strong secrets** - Minimum 32 characters, random
5. **Limit access** - Only team members who need it
6. **Use environment-specific databases** - Don't share databases

---

## 🚀 **Quick Start**

### **For Development:**
Already configured! Just run:
```bash
npm start
cd backend && npm start
```

### **For Staging/Production:**
1. Copy environment template files
2. Fill in your actual values
3. Set environment variables in your hosting provider
4. Deploy!

---

## 📝 **Example Files**

See:
- `env.example` - Frontend environment template
- `backend-env-example.txt` - Backend environment template

**Note:** These are templates only. Create actual `.env` files with your real values.


