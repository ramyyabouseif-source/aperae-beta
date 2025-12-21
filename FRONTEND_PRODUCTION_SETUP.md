# Frontend Production Setup - Environment Variables

## ✅ **API Test Results**

### **Health Endpoint:**
- ✅ **URL:** `https://api.aperae.com/api/health`
- ✅ **Status:** Responding correctly
- ✅ **Core Services:** Anthropic & Google Vision healthy

### **Recommendations Endpoint:**
- ✅ **URL:** `https://api.aperae.com/api/recommendations`
- ✅ **Status:** Working perfectly
- ✅ **Response:** Full wine recommendations with proper JSON structure

---

## 📋 **Frontend Configuration**

### **Current Setup:**
The frontend is already configured to use environment variables via `src/utils/api.ts`:
- **Priority 1:** `EXPO_PUBLIC_API_URL` (explicit override)
- **Priority 2:** `EXPO_PUBLIC_ENV` (production/staging/development)
- **Priority 3:** Localhost (development default)

### **Production URL:**
When `EXPO_PUBLIC_ENV=production`, the frontend automatically uses:
- `https://api.aperae.com/api`

---

## 🚀 **How to Configure for Production**

### **Method 1: Using Environment Variables (Recommended)**

#### **For Development (local testing):**
Create a `.env` file in the project root (optional, defaults to localhost):
```env
EXPO_PUBLIC_ENV=development
EXPO_PUBLIC_API_URL=http://localhost:3001/api
```

#### **For Production Build:**
Set environment variables when building:

**Option A: EAS Build (Recommended for Expo)**
1. Go to: https://expo.dev → Your Project → Secrets
2. Add environment variables:
   - `EXPO_PUBLIC_ENV` = `production`
   - `EXPO_PUBLIC_API_URL` = `https://api.aperae.com/api` (optional, defaults based on ENV)

**Option B: Local Build with Environment Variables**
```bash
# Windows PowerShell
$env:EXPO_PUBLIC_ENV="production"
npx expo build:android

# Or for iOS
$env:EXPO_PUBLIC_ENV="production"
npx expo build:ios
```

---

## 📝 **Environment Variables Reference**

### **Frontend Environment Variables:**

| Variable | Description | Example | Required |
|----------|-------------|---------|----------|
| `EXPO_PUBLIC_ENV` | Environment mode | `production`, `staging`, `development` | No (defaults to development) |
| `EXPO_PUBLIC_API_URL` | Explicit API URL override | `https://api.aperae.com/api` | No (uses ENV-based selection) |

### **How They Work:**

1. **If `EXPO_PUBLIC_API_URL` is set:**
   - Uses that URL directly (highest priority)

2. **If `EXPO_PUBLIC_ENV=production`:**
   - Automatically uses: `https://api.aperae.com/api`

3. **If `EXPO_PUBLIC_ENV=staging`:**
   - Automatically uses: `https://staging-api.aperae.com/api`

4. **Otherwise (development):**
   - Uses: `http://localhost:3001/api`

---

## 🧪 **Testing the Production API**

### **Test from Frontend:**

1. **Set environment variable:**
   ```bash
   # Windows PowerShell
   $env:EXPO_PUBLIC_ENV="production"
   ```

2. **Start Expo:**
   ```bash
   npx expo start
   ```

3. **Verify in app:**
   - Open the app
   - Check network requests in debugger
   - Should see requests to `https://api.aperae.com/api/...`

### **Verify API URL in Code:**

Add a console log to verify:
```typescript
import { getApiBaseUrl } from './utils/api';
console.log('API Base URL:', getApiBaseUrl());
```

---

## 📋 **Production Build Checklist**

### **Before Building for Production:**

- [ ] Set `EXPO_PUBLIC_ENV=production` in EAS Secrets or build command
- [ ] Verify `ALLOWED_ORIGINS` in Render includes your app's domain
- [ ] Test API endpoints from production URL
- [ ] Verify SSL certificate is working (`https://api.aperae.com/api/health`)

### **After Building:**

- [ ] Test app connects to production API
- [ ] Verify wine recommendations work
- [ ] Check authentication endpoints (if using)
- [ ] Monitor error logs in Render

---

## 🔧 **Troubleshooting**

### **App Can't Connect to API:**

1. **Check environment variable:**
   ```typescript
   console.log('API URL:', getApiBaseUrl());
   ```

2. **Verify CORS:**
   - Check `ALLOWED_ORIGINS` in Render includes your app's origin
   - For Expo Go, add `exp://` URLs if needed

3. **Check network:**
   - Ensure device/emulator can reach internet
   - Try `https://api.aperae.com/api/health` in browser

### **Wrong API URL Being Used:**

1. **Clear Expo cache:**
   ```bash
   npx expo start -c
   ```

2. **Verify environment variable:**
   ```bash
   # PowerShell
   echo $env:EXPO_PUBLIC_ENV
   echo $env:EXPO_PUBLIC_API_URL
   ```

3. **Check `src/utils/api.ts`:**
   - Verify logic matches expected behavior

---

## ✅ **Current Status:**

- ✅ **Production API:** `https://api.aperae.com/api` - **WORKING**
- ✅ **Health Endpoint:** Responding correctly
- ✅ **Recommendations Endpoint:** Working perfectly
- ✅ **Frontend Code:** Already configured for production
- ⏳ **Next Step:** Set `EXPO_PUBLIC_ENV=production` when building

---

## 🎯 **Next Actions:**

1. **For Development:**
   - Continue using localhost (default)
   - API URL automatically uses `http://localhost:3001/api`

2. **For Production Build:**
   - Set `EXPO_PUBLIC_ENV=production` in EAS Secrets
   - Or pass as environment variable during build
   - Frontend will automatically use `https://api.aperae.com/api`

---

**Your frontend is ready for production! Just set the environment variable when building.** 🚀







