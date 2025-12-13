# Testing Guide - Before Proceeding

**Date:** December 13, 2025  
**Purpose:** Verify mobile app and API still work after infrastructure changes

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

## 🔍 **Quick API Health Checks (2 minutes)**

### **1. Production API**
```bash
curl https://api.aperae.com/api/health
```

**Expected:** JSON response with status
```json
{
  "status": "healthy" or "degraded",
  "uptime": 123.45,
  "requests": 10,
  "timestamp": "2025-12-13T..."
}
```

### **2. Staging API**
```bash
curl https://staging-api.aperae.com/api/health
```

**Expected:** Same format as production

---

## 📱 **Mobile App Testing Checklist**

### **Prerequisites**
1. **Check API URL Configuration:**
   - Mobile app uses `src/utils/api.ts`
   - Checks `EXPO_PUBLIC_API_URL` first (explicit override)
   - Then `EXPO_PUBLIC_ENV` (production/staging/development)
   - Defaults to localhost for development

2. **Production URL:** `https://api.aperae.com/api`
3. **Staging URL:** `https://staging-api.aperae.com/api`

### **Test 1: Verify API Connection**
- [ ] Open mobile app
- [ ] Check console logs for API URL
- [ ] Verify it shows `https://api.aperae.com/api` (if using production)
- [ ] Status: ⏳ Pending

### **Test 2: Wine Recommendation**
- [ ] Navigate to home screen
- [ ] Enter a dish (e.g., "Grilled Salmon")
- [ ] Request wine recommendation
- [ ] Expected: Recommendations appear
- [ ] Status: ⏳ Pending

### **Test 3: User Authentication**
- [ ] Test registration (new account)
- [ ] Test login (existing account)
- [ ] Expected: Authentication works
- [ ] Status: ⏳ Pending

### **Test 4: Menu OCR** (if implemented)
- [ ] Take/upload menu photo
- [ ] Request pairing
- [ ] Expected: OCR and recommendations work
- [ ] Status: ⏳ Pending

### **Test 5: Error Handling**
- [ ] Test with no internet connection
- [ ] Test with invalid API URL
- [ ] Expected: User-friendly error messages
- [ ] Status: ⏳ Pending

---

## 🔧 **API Endpoint Testing (10 minutes)**

### **Using curl (PowerShell)**

#### **1. Health Check**
```powershell
curl https://api.aperae.com/api/health
```

#### **2. Wine Recommendation**
```powershell
$body = @{
    dish = "Grilled Salmon"
} | ConvertTo-Json

curl -Method Post -Uri "https://api.aperae.com/api/recommendations" `
    -ContentType "application/json" `
    -Body $body
```

#### **3. User Registration**
```powershell
$body = @{
    email = "test@example.com"
    password = "Test1234!"
    firstName = "Test"
    lastName = "User"
} | ConvertTo-Json

curl -Method Post -Uri "https://api.aperae.com/api/auth/register" `
    -ContentType "application/json" `
    -Body $body
```

#### **4. User Login**
```powershell
$body = @{
    email = "test@example.com"
    password = "Test1234!"
} | ConvertTo-Json

curl -Method Post -Uri "https://api.aperae.com/api/auth/login" `
    -ContentType "application/json" `
    -Body $body
```

---

## 📋 **Testing Priority**

### **🔴 CRITICAL (Do First - 10 minutes)**
1. ✅ Production API health check
2. ✅ Mobile app can connect to API
3. ✅ Wine recommendation works
4. ✅ User authentication works

### **🟡 IMPORTANT (Do Second - 10 minutes)**
5. ⚠️ Staging API health check
6. ⚠️ Menu OCR (if implemented)
7. ⚠️ Error handling
8. ⚠️ Token refresh

### **🟢 NICE TO HAVE (Optional)**
9. Advanced features
10. Edge cases
11. Performance testing

---

## 🎯 **How to Test Mobile App API Connection**

### **Method 1: Check Console Logs**
1. Start Expo app
2. Look for console output like:
   ```
   API_BASE_URL: https://api.aperae.com/api
   ```
3. Verify the URL is correct

### **Method 2: Environment Variable Check**
Check your `.env` file (if using Expo):
```bash
# Production
EXPO_PUBLIC_ENV=production
# OR explicit URL
EXPO_PUBLIC_API_URL=https://api.aperae.com/api

# Staging
EXPO_PUBLIC_ENV=staging
# OR explicit URL
EXPO_PUBLIC_API_URL=https://staging-api.aperae.com/api

# Development (localhost)
EXPO_PUBLIC_ENV=development
# OR no env vars (defaults to localhost)
```

### **Method 3: Test Actual API Call**
1. Open app
2. Try to get wine recommendation
3. Check network tab/logs for:
   - Request URL (should be `https://api.aperae.com/api/recommendations`)
   - Response status (should be 200)
   - Response data (should contain recommendations)

---

## 📊 **Test Results Template**

```
## Test Results - [DATE/TIME]

### Production API
- [ ] Health Check: PASS / FAIL
  - Response: [paste JSON or status]
  - Notes: [any issues]
  
- [ ] Wine Recommendation: PASS / FAIL
  - Test: [what you tested]
  - Result: [did it work?]
  
- [ ] Authentication: PASS / FAIL
  - Register: PASS / FAIL
  - Login: PASS / FAIL
  - Notes: [any issues]

### Staging API
- [ ] Health Check: PASS / FAIL
  - Notes: [any issues]

### Mobile App
- [ ] API Connection: PASS / FAIL
  - API URL: [what URL is being used]
  - Connection: [works / doesn't work]
  
- [ ] Wine Recommendation: PASS / FAIL
  - Test: [what you tested]
  - Result: [did it work?]
  
- [ ] Authentication: PASS / FAIL
  - Register: PASS / FAIL
  - Login: PASS / FAIL
  
- [ ] Menu OCR: PASS / FAIL / N/A
  - Notes: [if not implemented, mark N/A]

### Overall Status
- ✅ ALL TESTS PASS - Safe to proceed
- ⚠️ SOME TESTS FAIL - Review issues before proceeding
- 🔴 CRITICAL TESTS FAIL - Fix before proceeding

### Issues Found
[List any issues discovered]
```

---

## 🚨 **What to Do If Tests Fail**

### **If Production API Health Check Fails:**
1. Check Render dashboard
2. Check service logs
3. Verify DNS is correct
4. Don't proceed until fixed

### **If Mobile App Can't Connect:**
1. Check API URL configuration
2. Verify environment variables
3. Check CORS settings
4. Verify SSL certificates

### **If Authentication Fails:**
1. Check database connection
2. Verify JWT secrets
3. Check session storage
4. Review error logs

---

## ✅ **Expected Outcomes**

### **✅ All Tests Pass**
**Action:** Proceed with confidence!
- Continue with production readiness tasks
- Infrastructure changes are safe
- No regressions found

### **⚠️ Some Tests Fail**
**Action:** Review and fix before proceeding
- Identify root cause
- Fix broken functionality
- Re-test before continuing

### **🔴 Critical Tests Fail**
**Action:** STOP and fix immediately
- Production API down? → Fix now
- Mobile app broken? → Fix now
- Don't proceed until critical issues resolved

---

## ⏱️ **Time Estimate**

- **Quick Health Checks:** 2-3 minutes
- **Full API Testing:** 10-15 minutes
- **Mobile App Testing:** 15-20 minutes
- **Total:** ~30-40 minutes

**Worth the time to catch issues early!**

---

## 📝 **Next Steps After Testing**

1. **Document Results:** Fill out test results template
2. **If All Pass:** Proceed with roadmap tasks
3. **If Issues Found:** Fix them first, then re-test
4. **Then Continue:** Production readiness tasks

---

## 💡 **Why This Matters**

- **Catch Issues Early:** Better now than in production
- **Verify Infrastructure:** DNS/SSL changes didn't break anything
- **User Confidence:** Mobile app working = happy users
- **Risk Reduction:** Know what works before adding complexity

---

## ✅ **Agreed: Testing Before Proceeding is Smart!**

This testing will:
- ✅ Verify everything still works
- ✅ Catch any regressions early
- ✅ Give confidence to proceed
- ✅ Only takes 30-40 minutes

**Let's test, document results, then proceed based on outcomes!**

