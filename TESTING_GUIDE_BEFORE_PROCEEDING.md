# Testing Guide - Before Proceeding

**Date:** December 13, 2025  
**Purpose:** Verify mobile app and API still work after infrastructure changes  
**Required Tool:** Windows PowerShell (not Command Prompt, not Git Bash)

---

## ✅ **Why We're Testing**

**Recent Changes:**
- Staging environment deployed (`staging-api.aperae.com`)
- DNS configured for both environments
- CI/CD workflows updated
- Production service running (`api.aperae.com`)

**Risk:** These changes could affect:
- Mobile app API connections
- Production API availability
- Environment configurations

**✅ Testing is the smart move before proceeding!**

---

## 📋 **Prerequisites**

### **Required Application:**
- **Windows PowerShell** (Windows 10/11 built-in)
  - Open by pressing `Windows Key + X` and selecting "Windows PowerShell" or "Terminal"
  - OR search "PowerShell" in Start Menu
  - **Do NOT use:** Command Prompt (cmd), Git Bash, or WSL

### **Current Working Directory:**
```
C:\Users\ramyy\Production\Aperae
```

### **Verify You're in the Right Place:**
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

If you're not in this directory, navigate there:
```powershell
cd C:\Users\ramyy\Production\Aperae
```

---

## 🔍 **TEST 1: Production API Health Check (2 minutes)**

### **Step 1: Open Windows PowerShell**
1. Press `Windows Key + X`
2. Select "Windows PowerShell" or "Terminal"
3. Verify you're in: `C:\Users\ramyy\Production\Aperae`

### **Step 2: Run Health Check Command**
Copy and paste this exact command:

```powershell
Invoke-RestMethod -Uri "https://api.aperae.com/api/health" -Method Get
```

### **Expected Result:**
You should see JSON output similar to:
```json
status       : healthy
errorRate    : 0
uptime       : 12345.67
requests     : 10
errors       : 0
mockMode     : False
timestamp    : 2025-12-13T12:00:00.000Z
dependencies : @{database=; redis=; anthropic=; googleVision=}
```

**OR** you might see it formatted as a single-line JSON string:
```json
{"status":"healthy","errorRate":0,"uptime":12345.67,"requests":10,"errors":0,"mockMode":false,"timestamp":"2025-12-13T12:00:00.000Z","dependencies":{...}}
```

### **✅ What to Check:**
- [ ] Command runs without errors
- [ ] You get JSON response (not an error)
- [ ] Status shows "healthy" or "degraded" (both are OK - degraded just means dependencies)
- [ ] Timestamp is recent (current date/time)

### **❌ If It Fails:**
- **Error:** "The remote name could not be resolved"
  - **Meaning:** DNS issue or internet connection problem
  - **Action:** Check internet connection, verify DNS

- **Error:** "The underlying connection was closed"
  - **Meaning:** SSL/certificate issue
  - **Action:** Check if service is running in Render

- **Error:** "404 Not Found"
  - **Meaning:** Wrong URL path
  - **Action:** Verify URL is correct: `https://api.aperae.com/api/health`

**Test Result:** ✅ **PASS**  
**Test Date:** December 13, 2025  
**Notes:** Production API returned healthy status with mockMode: False. All dependencies accessible. Response received without errors.

---

## 🔍 **TEST 2: Staging API Health Check (2 minutes)**

### **Step 1: Run Health Check Command**
Copy and paste this exact command in PowerShell:

```powershell
Invoke-RestMethod -Uri "https://staging-api.aperae.com/api/health" -Method Get
```

### **Expected Result:**
Same format as production API - JSON with status, uptime, etc.

### **✅ What to Check:**
- [ ] Command runs without errors
- [ ] You get JSON response
- [ ] Status shows "healthy" or "degraded"

**Test Result:** ✅ **PASS**  
**Test Date:** December 13, 2025  
**Notes:** Staging API returned healthy status with mockMode: True (expected for staging environment). All checks passed.

---

## 🍷 **TEST 3: Wine Recommendation API Test (5 minutes)**

### **Step 1: Run Wine Recommendation Command**
Copy and paste this exact command in PowerShell:

```powershell
$body = @{
    dish = "Grilled Salmon"
} | ConvertTo-Json

Invoke-RestMethod -Uri "https://api.aperae.com/api/recommendations" `
    -Method Post `
    -ContentType "application/json" `
    -Body $body
```

**Note:** The backtick (`) at the end of lines is PowerShell's line continuation character. Make sure each line ends with a backtick before the next line.

### **Expected Result:**
You should see JSON output with wine recommendations, including:
- `dish`: "Grilled Salmon"
- `recommendations`: Array of 3 wines (Premium, Moderate, Budget-Friendly)
- Each wine should have: `wineName`, `producer`, `vintage`, `pricePoint`, `rationale`, etc.

**Example (first few lines):**
```
dish           : Grilled Salmon
recommendations : {@{tierLabel=Premium Selection; wineName=...; producer=...; ...}}
```
### **✅ What to Check:**
- [ ] Command runs without errors
- [ ] You get recommendations (array of 3 wines)
- [ ] Each recommendation has wine details
- [ ] Response takes 30-60 seconds (normal for AI API calls)

### **❌ If It Fails:**
- **Error:** "401 Unauthorized"
  - **Meaning:** API key issue
  - **Action:** Check Render environment variables

- **Error:** "Timeout" or takes too long
  - **Meaning:** API might be slow or overloaded
  - **Action:** Try again, check Render logs

**Test Result:** ✅ **PASS**  
**Test Date:** December 13, 2025  
**Notes:** Successfully received full wine recommendations response for "Grilled Salmon" with complete dishAnalysis, 3 recommendations (Premium Selection: Chablis Premier Cru, Moderate Selection: Sancerre, Budget Selection: Albariño). All wine details present including producer, vintage, rationale, tasting notes, serving guidance, and confidence scores. Response indicates Claude API is working correctly (not using fallback data).

---

## 👤 **TEST 4: User Registration API Test (3 minutes)**

### **Step 1: Generate Unique Test Email**
We'll use a timestamp to make each test email unique. Run this in PowerShell:

```powershell
$timestamp = Get-Date -Format "yyyyMMddHHmmss"
$testEmail = "test-$timestamp@example.com"
Write-Host "Test email: $testEmail"
```

### **Step 2: Run Registration Command**
Copy and paste this exact command (use the email from Step 1):

```powershell
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

### **Expected Result:**
You should see JSON output with:
- `success`: true
- `user`: Object with user details (id, email, etc.)
- `accessToken`: Long string (JWT token)
- `refreshToken`: Long string (refresh token)

**Example:**
```
success       : True
user          : @{id=...; email=test-...@example.com; ...}
accessToken   : eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
refreshToken  : eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### **✅ What to Check:**
- [ ] Command runs without errors
- [ ] You get `success: True`
- [ ] You get both `accessToken` and `refreshToken`
- [ ] User object has email and id

### **❌ If It Fails:**
- **Error:** "400 Bad Request" with "Email already exists"
  - **Meaning:** Test email already registered
  - **Action:** Use different timestamp, try again

- **Error:** "500 Internal Server Error"
  - **Meaning:** Server error, check database connection
  - **Action:** Check Render logs

**Test Result:** ✅ **PASS**  
**Test Date:** December 13, 2025  
**Test Email Used:** test-20251213112231@example.com  
**Notes:** User registration successful. Received success: True, user object with ID (744e571a-995f-4aa5-ae43-2dcf55a44877), email, and role. Both accessToken and refreshToken returned successfully. User account created in database.

---

## 🔐 **TEST 5: User Login API Test (3 minutes)**

### **Step 1: Use Same Email from Registration**
If you just registered, use that same email. Otherwise, use an existing test account.

### **Step 2: Run Login Command**
Copy and paste this exact command (replace email with your test email):

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

**Note:** Replace `test-20251213120000@example.com` with the actual email you used in registration.

### **Expected Result:**
Same format as registration - JSON with:
- `success`: true
- `user`: User object
- `accessToken`: JWT token
- `refreshToken`: Refresh token

### **✅ What to Check:**
- [ ] Command runs without errors
- [ ] You get `success: True`
- [ ] You get both tokens

**Test Result:** ✅ **PASS**  
**Test Date:** December 13, 2025  
**Test Email Used:** test-20251213112231@example.com  
**Notes:** User login successful using the registered test account. Received success: True, user object, accessToken, and refreshToken. Authentication working correctly.

---

## 📱 **TEST 6: Mobile App API Connection (10 minutes)**

### **Step 1: Check Mobile App Configuration File**

**File Path:**
```
C:\Users\ramyy\Production\Aperae\src\utils\api.ts
```

**How to Check:**
1. Open file in your code editor (VS Code, etc.)
2. Look at the `getApiBaseUrl()` function (lines 17-63)
3. Verify the production URL is: `https://api.aperae.com/api`

**Expected Code (lines 35-37):**
```typescript
if (env === 'production') {
    // Production: use api.aperae.com
    return 'https://api.aperae.com/api';
}
```

### **Step 2: Check Environment Variables**

**File Path:**
```
C:\Users\ramyy\Production\Aperae\.env
```

**OR if using Expo:**
```
C:\Users\ramyy\Production\Aperae\.env.local
```

**What to Check:**
- If you want to use production API, you should have:
  ```
  EXPO_PUBLIC_ENV=production
  ```
  OR
  ```
  EXPO_PUBLIC_API_URL=https://api.aperae.com/api
  ```

- If you want to use staging API, you should have:
  ```
  EXPO_PUBLIC_ENV=staging
  ```
  OR
  ```
  EXPO_PUBLIC_API_URL=https://staging-api.aperae.com/api
  ```

- If file doesn't exist or has neither, app defaults to localhost (development mode)

### **Step 3: Start Mobile App**

**Open PowerShell in project root:**
```powershell
cd C:\Users\ramyy\Production\Aperae
```

**Start Expo:**
```powershell
npm start
```

**OR if using Expo CLI directly:**
```powershell
npx expo start
```

### **Step 4: Check Console Logs for API URL**

When the app starts, look in the PowerShell console for output like:
```
API_BASE_URL: https://api.aperae.com/api
Making secure request to: https://api.aperae.com/api/recommendations
```

**✅ What to Check:**
- [ ] Console shows the correct API URL
- [ ] URL matches what you configured (production or staging)
- [ ] No errors about "cannot connect" or "network failed"

### **Step 5: Test Wine Recommendation in App**

1. Open the app on your device/simulator
2. Navigate to home screen
3. Enter a dish (e.g., "Grilled Salmon")
4. Request wine recommendation
5. Wait for response (30-60 seconds is normal)

**✅ What to Check:**
- [ ] App successfully connects to API
- [ ] Wine recommendations appear
- [ ] No error messages about connection failures

**Test Result:** ✅ **PASS** (Both Steps 4 & 5)  
**Test Date:** December 15, 2025  
**Step 4 Notes:** App correctly connected to production API. Console logs confirmed: `API_BASE_URL: https://api.aperae.com/api` and `Making secure request to: https://api.aperae.com/api/recommendations`. Connection successful (200 OK).  
**Step 5 Notes:** Successfully received real AI-generated wine recommendations. Response time: 61 seconds (confirms real Claude API processing, not mock data). Requested "Pomegranate glazed salmon with honey, soy sauce, and garlic" and received appropriate white wine recommendations (Spätlese, Vouvray Demi-Sec, Riesling Kabinett) with correct dish name in response. All recommendations include proper tasting notes, producer names, vintages, and confidence scores. Avoid section correctly identifies red wines to avoid. Full functionality verified!

---

## 📊 **Test Results - December 13, 2025**

### Test 1: Production API Health Check
- ✅ **PASS**
- Response: Status "healthy", mockMode: False, errorRate: 0, uptime: 21.25 seconds
- Notes: Production API responding correctly. All dependencies accessible.

### Test 2: Staging API Health Check
- ✅ **PASS**
- Response: Status "healthy", mockMode: True, errorRate: 0, uptime: 21.30 seconds
- Notes: Staging API responding correctly. Mock mode enabled (expected for staging).

### Test 3: Wine Recommendation API
- ✅ **PASS**
- Response Time: ~30 seconds (normal for AI API calls)
- Notes: Successfully received full recommendations for "Grilled Salmon" with 3 wines:
  - Premium: Chablis Premier Cru Montée de Tonnerre (William Fèvre, 2020)
  - Moderate: Sancerre (Pascal Jolivet, 2022)
  - Budget: Albariño (Martín Códax, 2023-2024)
  Complete dishAnalysis and all wine details present. Claude API working correctly (not fallback).

### Test 4: User Registration
- ✅ **PASS**
- Test Email Used: test-20251213112231@example.com
- Notes: User successfully created with ID: 744e571a-995f-4aa5-ae43-2dcf55a44877. Both accessToken and refreshToken returned.

### Test 5: User Login
- ✅ **PASS**
- Test Email Used: test-20251213112231@example.com
- Notes: Successfully authenticated with registered account. Both tokens returned.

### Test 6: Mobile App Connection
- ✅ **PASS** - Full functionality test successful with production API
- API URL Used: https://api.aperae.com/api (Production)
- Step 4 (API URL Check): ✅ PASS - Correctly using production API URL
- Step 5 (Wine Recommendation): ✅ PASS - Real AI recommendations received successfully
- Test Date: December 15, 2025
- Notes: 
  - **Step 4 PASSED**: App correctly connected to production API. Console logs confirmed: `API_BASE_URL: https://api.aperae.com/api`
  - **Step 5 PASSED**: Successfully received real AI-generated wine recommendations:
    - Requested dish: "Pomegranate glazed salmon with honey, soy sauce, and garlic"
    - Response time: 61 seconds (normal for Claude API, confirms real AI processing)
    - Received correct dish name in response (matches request)
    - Received 3 white wine recommendations (appropriate for salmon):
      1. Spätlese (Joh. Jos. Prüm, 2018) - Confidence: 92
      2. Vouvray Demi-Sec (Domaine Huet, 2019) - Confidence: 90
      3. Riesling Kabinett (Dr. Loosen, 2022) - Confidence: 88
    - Avoid section correctly identifies "Red wines" to avoid (appropriate for salmon)
    - Response includes proper tasting notes, producer names, vintages
    - **NOT** fallback/mock data (response time and wine selection confirm real AI)

### Overall Status
- ✅ **ALL TESTS PASS (1-6)** - Complete functionality verified
- ✅ Mobile app successfully connects to production API and receives real AI recommendations
- ✅ All core API endpoints functioning correctly
- ✅ End-to-end flow validated: Mobile app → Production API → Claude AI → Wine recommendations

### Issues Found
- None - All tests passed successfully. Initial Test 6 issue (staging mock mode) was resolved by switching to production API for full functionality testing.

---

## 📊 **Complete Test Results Template**

Copy this template and fill it out for future test runs:

```
## Test Results - [FILL IN DATE/TIME]

### Test 1: Production API Health Check
- [ ] PASS / [ ] FAIL
- Response: [PASTE RESPONSE OR NOTE IF FAILED]
- Notes: _________________________________

### Test 2: Staging API Health Check
- [ ] PASS / [ ] FAIL
- Response: [PASTE RESPONSE OR NOTE IF FAILED]
- Notes: _________________________________

### Test 3: Wine Recommendation API
- [ ] PASS / [ ] FAIL
- Response Time: _____ seconds
- Notes: _________________________________

### Test 4: User Registration
- [ ] PASS / [ ] FAIL
- Test Email Used: _______________________
- Notes: _________________________________

### Test 5: User Login
- [ ] PASS / [ ] FAIL
- Notes: _________________________________

### Test 6: Mobile App Connection
- [ ] PASS / [ ] FAIL
- API URL Used: _________________________
- Wine Recommendation Works: [ ] YES / [ ] NO
- Notes: _________________________________

### Overall Status
- [ ] ✅ ALL TESTS PASS - Safe to proceed
- [ ] ⚠️ SOME TESTS FAIL - Review issues before proceeding
- [ ] 🔴 CRITICAL TESTS FAIL - Fix before proceeding

### Issues Found
[List any issues discovered]
________________________________________
________________________________________
```

---

## 🚨 **Troubleshooting Common Issues**

### **Issue: "Invoke-RestMethod : The remote name could not be resolved"**
**Cause:** DNS issue or no internet connection  
**Fix:**
1. Check internet connection
2. Try: `ping api.aperae.com` in PowerShell
3. If ping fails, DNS issue - check network settings

### **Issue: "Invoke-RestMethod : The underlying connection was closed"**
**Cause:** SSL/certificate issue or service down  
**Fix:**
1. Check Render dashboard to see if service is running
2. Try the command again
3. Check Render logs for errors

### **Issue: "401 Unauthorized"**
**Cause:** API key missing or invalid  
**Fix:**
1. Check Render environment variables
2. Verify `ANTHROPIC_API_KEY` is set
3. Check API key is valid

### **Issue: "500 Internal Server Error"**
**Cause:** Server error  
**Fix:**
1. Check Render logs for detailed error
2. Verify database connection
3. Check environment variables are all set

### **Issue: Mobile App Can't Connect**
**Cause:** Wrong API URL or CORS issue  
**Fix:**
1. Verify `.env` file has correct `EXPO_PUBLIC_ENV` or `EXPO_PUBLIC_API_URL`
2. Check console logs for actual URL being used
3. Verify CORS settings in `backend/server.js` include your origin

---

## ✅ **Next Steps After Testing**

### **If All Tests Pass:**
1. ✅ Document results in template above
2. ✅ Proceed with production readiness tasks
3. ✅ Continue with roadmap

### **If Some Tests Fail:**
1. 🔧 Identify root cause
2. 🔧 Fix issues
3. 🔄 Re-run failed tests
4. ✅ Verify fixes work
5. ✅ Then proceed

### **If Critical Tests Fail:**
1. 🔴 STOP immediately
2. 🔴 Fix production API if down
3. 🔴 Fix mobile app if broken
4. 🔄 Re-test everything
5. ✅ Don't proceed until all critical tests pass

---

## ⏱️ **Time Estimate**

- **Test 1 (Production Health):** 2 minutes
- **Test 2 (Staging Health):** 2 minutes
- **Test 3 (Wine Recommendation):** 5 minutes
- **Test 4 (Registration):** 3 minutes
- **Test 5 (Login):** 3 minutes
- **Test 6 (Mobile App):** 10 minutes
- **Documentation:** 5 minutes

**Total: ~30 minutes**

---

## ✅ **Summary**

**Tool Required:** Windows PowerShell  
**Working Directory:** `C:\Users\ramyy\Production\Aperae`  
**Time Required:** ~30 minutes  
**Critical Tests:** 1, 2, 3, 6 (API health and mobile app)

**Let's test, document results, then proceed based on outcomes!**
