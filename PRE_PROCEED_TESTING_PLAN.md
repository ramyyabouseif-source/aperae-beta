# Pre-Proceed Testing Plan

**Date:** December 13, 2025  
**Purpose:** Comprehensive testing plan to verify mobile app and API still work after infrastructure changes  
**Required Tool:** Windows PowerShell  
**Working Directory:** `C:\Users\ramyy\Production\Aperae`

---

## 🎯 **Why We Need Testing**

**Recent Changes Made:**
- ✅ Staging environment deployed (`staging-api.aperae.com`)
- ✅ DNS configured for both environments
- ✅ CI/CD workflows updated
- ✅ Production service running (`api.aperae.com`)

**Risk:** Changes to infrastructure could have broken:
- API connectivity
- Mobile app connections
- Web components
- Environment configurations

**✅ Testing BEFORE proceeding is the smart move!**

---

## 📋 **Testing Environment Setup**

### **Required Application:**
- **Windows PowerShell** (Windows 10/11 built-in)
  - **How to Open:**
    1. Press `Windows Key + X`
    2. Select "Windows PowerShell" or "Terminal"
    3. OR search "PowerShell" in Start Menu
  - **Do NOT use:** Command Prompt (cmd), Git Bash, or WSL

### **Verify Working Directory:**
Open PowerShell and run:
```powershell
pwd
```

**Expected Output:**
```
Path
----
C:\Users\ramyy\Production\Aperae
```

**If not in correct directory, navigate there:**
```powershell
cd C:\Users\ramyy\Production\Aperae
```

---

## 📋 **Complete Testing Checklist**

### **1. Production API Testing** ⚠️ CRITICAL

#### **1.1 Basic Connectivity**
- **Test Command:**
  ```powershell
  Invoke-RestMethod -Uri "https://api.aperae.com/api/health" -Method Get
  ```
  
- **Expected Result:**
  ```json
  {
    "status": "healthy" or "degraded",
    "uptime": 12345.67,
    "requests": 10,
    "errors": 0,
    "mockMode": false,
    "timestamp": "2025-12-13T12:00:00.000Z"
  }
  ```
  
- **File Path:** N/A (API endpoint test)
- **Application:** Windows PowerShell
- **Status:** [ ] PASS / [ ] FAIL

#### **1.2 Wine Recommendation Endpoint**
- **Test Command:**
  ```powershell
  $body = @{
      dish = "Grilled Salmon"
  } | ConvertTo-Json

  Invoke-RestMethod -Uri "https://api.aperae.com/api/recommendations" `
      -Method Post `
      -ContentType "application/json" `
      -Body $body
  ```
  
- **Expected Result:**
  JSON response with:
  - `dish`: "Grilled Salmon"
  - `recommendations`: Array of 3 wines
  - Response time: 30-60 seconds (normal for AI)
  
- **File Path:** N/A (API endpoint test)
- **Application:** Windows PowerShell
- **Status:** [ ] PASS / [ ] FAIL

#### **1.3 Authentication Endpoints**
- **Registration Test Command:**
  ```powershell
  $timestamp = Get-Date -Format "yyyyMMddHHmmss"
  $body = @{
      email = "test-$timestamp@example.com"
      password = "Test1234!"
      firstName = "Test"
      lastName = "User"
  } | ConvertTo-Json

  Invoke-RestMethod -Uri "https://api.aperae.com/api/auth/register" `
      -Method Post `
      -ContentType "application/json" `
      -Body $body
  ```
  
- **Expected Result:**
  ```json
  {
    "success": true,
    "user": { "id": "...", "email": "..." },
    "accessToken": "eyJhbGciOi...",
    "refreshToken": "eyJhbGciOi..."
  }
  ```
  
- **Login Test Command:**
  ```powershell
  $body = @{
      email = "test-20251213120000@example.com"
      password = "Test1234!"
  } | ConvertTo-Json

  Invoke-RestMethod -Uri "https://api.aperae.com/api/auth/login" `
      -Method Post `
      -ContentType "application/json" `
      -Body $body
  ```
  
- **Expected Result:** Same format as registration
  
- **File Path:** N/A (API endpoint test)
- **Application:** Windows PowerShell
- **Status:** [ ] PASS / [ ] FAIL

---

### **2. Staging API Testing** ⚠️ IMPORTANT

#### **2.1 Basic Connectivity**
- **Test Command:**
  ```powershell
  Invoke-RestMethod -Uri "https://staging-api.aperae.com/api/health" -Method Get
  ```
  
- **Expected Result:** Same format as production health check
  
- **File Path:** N/A (API endpoint test)
- **Application:** Windows PowerShell
- **Status:** [ ] PASS / [ ] FAIL

#### **2.2 Core Functionality**
- **Test Command:** Same as production tests, but use `staging-api.aperae.com` instead of `api.aperae.com`
  
- **Expected Result:** Should work identically to production
  
- **File Path:** N/A (API endpoint test)
- **Application:** Windows PowerShell
- **Status:** [ ] PASS / [ ] FAIL

---

### **3. Mobile App Testing** ⚠️ CRITICAL

#### **3.1 API URL Configuration Check**
- **File Path:**
  ```
  C:\Users\ramyy\Production\Aperae\src\utils\api.ts
  ```
  
- **What to Check:**
  1. Open file in code editor (VS Code, etc.)
  2. Look at `getApiBaseUrl()` function (lines 17-63)
  3. Verify production URL: `https://api.aperae.com/api` (line 37)
  4. Verify staging URL: `https://staging-api.aperae.com/api` (line 42)
  
- **Expected Code:**
  ```typescript
  if (env === 'production') {
      return 'https://api.aperae.com/api';
  }
  
  if (env === 'staging') {
      return 'https://staging-api.aperae.com/api';
  }
  ```
  
- **Application:** Code Editor (VS Code, etc.)
- **Status:** [ ] PASS / [ ] FAIL

#### **3.2 Environment Variables Check**
- **File Paths to Check:**
  ```
  C:\Users\ramyy\Production\Aperae\.env
  C:\Users\ramyy\Production\Aperae\.env.local
  ```
  
- **What to Check:**
  - For production: `EXPO_PUBLIC_ENV=production` OR `EXPO_PUBLIC_API_URL=https://api.aperae.com/api`
  - For staging: `EXPO_PUBLIC_ENV=staging` OR `EXPO_PUBLIC_API_URL=https://staging-api.aperae.com/api`
  - If neither file exists or no variables set, app defaults to localhost
  
- **Application:** Code Editor or Notepad
- **Status:** [ ] PASS / [ ] FAIL

#### **3.3 Mobile App API Connection Test**
- **Step 1: Start Expo**
  - **Working Directory:** `C:\Users\ramyy\Production\Aperae`
  - **Command:**
    ```powershell
    npm start
    ```
    OR
    ```powershell
    npx expo start
    ```
  
- **Step 2: Check Console Logs**
  - **Application:** PowerShell (where you ran `npm start`)
  - **What to Look For:**
    ```
    API_BASE_URL: https://api.aperae.com/api
    Making secure request to: https://api.aperae.com/api/recommendations
    ```
  
- **Step 3: Test in App**
  - **Application:** Mobile App (iOS/Android simulator or device)
  - **Actions:**
    1. Open app
    2. Navigate to home screen
    3. Enter dish: "Grilled Salmon"
    4. Request wine recommendation
    5. Wait for response (30-60 seconds)
  
- **Expected Result:**
  - App connects to API successfully
  - Wine recommendations appear
  - No connection errors
  
- **Status:** [ ] PASS / [ ] FAIL

#### **3.4 User Authentication in App**
- **Application:** Mobile App
- **Actions:**
  1. Test registration (create new account)
  2. Test login (use existing account)
  
- **Expected Result:**
  - Registration creates account successfully
  - Login authenticates successfully
  - User stays logged in
  
- **Status:** [ ] PASS / [ ] FAIL

#### **3.5 Menu OCR Test** (if implemented)
- **Application:** Mobile App
- **Actions:**
  1. Take/upload menu photo
  2. Request pairing recommendations
  
- **Expected Result:**
  - OCR extracts menu items
  - Recommendations appear
  
- **Status:** [ ] PASS / [ ] FAIL / [ ] N/A (not implemented)

---

### **4. Configuration Files Verification**

#### **4.1 Backend CORS Configuration**
- **File Path:**
  ```
  C:\Users\ramyy\Production\Aperae\backend\server.js
  ```
  
- **Lines to Check:** 116-131
- **What to Verify:**
  - Production domains included: `https://www.aperae.com`, `https://api.aperae.com`
  - Staging domains included: `https://staging.aperae.com`, `https://staging-api.aperae.com`
  
- **Expected Code:**
  ```javascript
  const defaults = [
      'https://www.aperae.com',
      'https://api.aperae.com',
      'https://staging.aperae.com',
      'https://staging-api.aperae.com'
  ];
  ```
  
- **Application:** Code Editor
- **Status:** [ ] PASS / [ ] FAIL

---

## 🔧 **Quick Test Script (All-in-One)**

Create a PowerShell script to run all API tests at once:

**File Path to Create:**
```
C:\Users\ramyy\Production\Aperae\test-production-api.ps1
```

**Script Content:**
```powershell
# Production API Testing Script
# Run from: C:\Users\ramyy\Production\Aperae

Write-Host "=== Production API Testing ===" -ForegroundColor Cyan
Write-Host ""

# Test 1: Health Check
Write-Host "[1/4] Testing Health Check..." -ForegroundColor Yellow
try {
    $health = Invoke-RestMethod -Uri "https://api.aperae.com/api/health" -Method Get
    Write-Host "✅ Health Check PASSED" -ForegroundColor Green
    Write-Host "   Status: $($health.status)" -ForegroundColor Gray
} catch {
    Write-Host "❌ Health Check FAILED: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host ""

# Test 2: Wine Recommendation
Write-Host "[2/4] Testing Wine Recommendation..." -ForegroundColor Yellow
try {
    $body = @{ dish = "Grilled Salmon" } | ConvertTo-Json
    $recommendations = Invoke-RestMethod -Uri "https://api.aperae.com/api/recommendations" `
        -Method Post `
        -ContentType "application/json" `
        -Body $body
    Write-Host "✅ Wine Recommendation PASSED" -ForegroundColor Green
    Write-Host "   Recommendations: $($recommendations.recommendations.Count)" -ForegroundColor Gray
} catch {
    Write-Host "❌ Wine Recommendation FAILED: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host ""

# Test 3: User Registration
Write-Host "[3/4] Testing User Registration..." -ForegroundColor Yellow
try {
    $timestamp = Get-Date -Format "yyyyMMddHHmmss"
    $body = @{
        email = "test-$timestamp@example.com"
        password = "Test1234!"
        firstName = "Test"
        lastName = "User"
    } | ConvertTo-Json
    
    $register = Invoke-RestMethod -Uri "https://api.aperae.com/api/auth/register" `
        -Method Post `
        -ContentType "application/json" `
        -Body $body
    
    if ($register.success) {
        Write-Host "✅ User Registration PASSED" -ForegroundColor Green
        Write-Host "   User ID: $($register.user.id)" -ForegroundColor Gray
        $testEmail = "test-$timestamp@example.com"
    } else {
        Write-Host "❌ User Registration FAILED: Success was false" -ForegroundColor Red
    }
} catch {
    Write-Host "❌ User Registration FAILED: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host ""

# Test 4: Staging Health Check
Write-Host "[4/4] Testing Staging API Health Check..." -ForegroundColor Yellow
try {
    $stagingHealth = Invoke-RestMethod -Uri "https://staging-api.aperae.com/api/health" -Method Get
    Write-Host "✅ Staging Health Check PASSED" -ForegroundColor Green
    Write-Host "   Status: $($stagingHealth.status)" -ForegroundColor Gray
} catch {
    Write-Host "❌ Staging Health Check FAILED: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host ""
Write-Host "=== Testing Complete ===" -ForegroundColor Cyan
```

**How to Run:**
1. Save script to: `C:\Users\ramyy\Production\Aperae\test-production-api.ps1`
2. Open PowerShell in: `C:\Users\ramyy\Production\Aperae`
3. Run:
   ```powershell
   .\test-production-api.ps1
   ```

---

## 📊 **Testing Priority**

### **🔴 CRITICAL (Must Test First - 10 minutes)**
1. Production API health check
2. Mobile app API connection
3. Wine recommendation feature
4. User authentication

### **🟡 IMPORTANT (Should Test - 10 minutes)**
5. Staging API health check
6. Menu OCR (if implemented)
7. Error handling
8. CORS configuration

### **🟢 NICE TO HAVE (Can Test Later)**
9. Web components (if applicable)
10. Advanced features
11. Edge cases

---

## ✅ **Testing Outcomes**

### **If All Tests Pass:**
✅ **Proceed with confidence!**
- Continue with production readiness tasks
- Infrastructure changes are safe
- No regressions found

### **If Some Tests Fail:**
⚠️ **Fix before proceeding!**
- Identify root cause
- Fix broken functionality
- Re-test before continuing

### **If Critical Tests Fail:**
🔴 **STOP and fix immediately!**
- Production API down? → Fix immediately
- Mobile app broken? → Fix immediately
- Don't proceed until critical issues resolved

---

## 📝 **Test Results Documentation Template**

```
## Test Results - [DATE/TIME]

### Production API
- [ ] Health Check: PASS / FAIL
  - Response: [PASTE RESPONSE]
  - Notes: _______________________
  
- [ ] Wine Recommendation: PASS / FAIL
  - Response Time: _____ seconds
  - Notes: _______________________
  
- [ ] Authentication: PASS / FAIL
  - Register: PASS / FAIL
  - Login: PASS / FAIL
  - Notes: _______________________

### Staging API
- [ ] Health Check: PASS / FAIL
  - Notes: _______________________

### Mobile App
- [ ] API URL Configuration: PASS / FAIL
  - File: src\utils\api.ts
  - Notes: _______________________
  
- [ ] Environment Variables: PASS / FAIL
  - File: .env or .env.local
  - Notes: _______________________
  
- [ ] API Connection: PASS / FAIL
  - API URL Used: _______________________
  - Notes: _______________________
  
- [ ] Wine Recommendation: PASS / FAIL
  - Notes: _______________________
  
- [ ] Authentication: PASS / FAIL
  - Register: PASS / FAIL
  - Login: PASS / FAIL
  - Notes: _______________________

### Overall Status
- [ ] ✅ ALL TESTS PASS - Safe to proceed
- [ ] ⚠️ SOME TESTS FAIL - Review issues before proceeding
- [ ] 🔴 CRITICAL TESTS FAIL - Fix before proceeding

### Issues Found
________________________________________
________________________________________
```

---

## 🚀 **Recommended Testing Order**

1. **API Health Checks** (5 minutes)
   - Production health
   - Staging health
   - Quick verification everything is up

2. **API Endpoint Tests** (10-15 minutes)
   - Wine recommendation
   - User registration
   - User login

3. **Mobile App Tests** (15-20 minutes)
   - Configuration check
   - API connection
   - Core features

4. **Document Results** (5 minutes)
   - Fill out template
   - Note any issues

**Total Testing Time: ~35-45 minutes**

---

## 💡 **Why This Testing Matters**

1. **Catch Issues Early:** Better to find problems now than in production
2. **Verify Infrastructure:** Ensure DNS/SSL changes didn't break anything
3. **User Confidence:** Mobile app working = happy users
4. **Risk Reduction:** Know what works before adding more complexity

---

## ✅ **Summary**

**Tool:** Windows PowerShell  
**Working Directory:** `C:\Users\ramyy\Production\Aperae`  
**Time Required:** ~35-45 minutes  
**Critical Tests:** Production API, Mobile App Connection

**Recommendation: Run these tests, document results, then proceed based on outcomes.**
