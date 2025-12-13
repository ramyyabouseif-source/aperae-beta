# Pre-Proceed Testing Plan

**Date:** December 13, 2025  
**Purpose:** Verify mobile app and web components still work after recent infrastructure changes

---

## 🎯 **Why We Need Testing**

**Recent Changes Made:**
- ✅ Staging environment deployed
- ✅ DNS configured for both environments
- ✅ CI/CD workflows updated
- ✅ Production service running

**Risk:** Changes to infrastructure could have broken:
- API connectivity
- Mobile app connections
- Web components
- Environment configurations

**✅ Testing BEFORE proceeding is the smart move!**

---

## 📋 **Testing Checklist**

### **1. Production API Testing** ⚠️ CRITICAL

#### **1.1 Basic Connectivity**
- [ ] Test: `curl https://api.aperae.com/api/health`
- [ ] Expected: Returns health status JSON
- [ ] Status: ⏳ Pending

#### **1.2 Core Endpoints**
- [ ] Test: Wine recommendation endpoint
- [ ] Test: Authentication endpoints (register/login)
- [ ] Test: Menu OCR endpoint (if applicable)
- [ ] Expected: All endpoints respond correctly
- [ ] Status: ⏳ Pending

#### **1.3 Database Connectivity**
- [ ] Test: User registration
- [ ] Test: Login and session creation
- [ ] Test: Token refresh
- [ ] Expected: All database operations work
- [ ] Status: ⏳ Pending

---

### **2. Staging API Testing** ⚠️ IMPORTANT

#### **2.1 Basic Connectivity**
- [ ] Test: `curl https://staging-api.aperae.com/api/health`
- [ ] Expected: Returns health status JSON
- [ ] Status: ⏳ Pending

#### **2.2 Core Functionality**
- [ ] Test: Same endpoints as production
- [ ] Expected: Should work identically to production
- [ ] Status: ⏳ Pending

---

### **3. Mobile App Testing** ⚠️ CRITICAL

#### **3.1 API Connection**
- [ ] Test: App can connect to production API
- [ ] Test: App can connect to staging API (if configured)
- [ ] Expected: Successful API calls
- [ ] Status: ⏳ Pending

#### **3.2 Core Features**
- [ ] Test: Wine recommendation flow
- [ ] Test: User authentication (login/register)
- [ ] Test: Menu OCR (if implemented)
- [ ] Test: Favorites/My Cellar (if implemented)
- [ ] Expected: All features work as before
- [ ] Status: ⏳ Pending

#### **3.3 Error Handling**
- [ ] Test: Network errors handled gracefully
- [ ] Test: API errors display correctly
- [ ] Expected: User-friendly error messages
- [ ] Status: ⏳ Pending

---

### **4. Web Components Testing** (if applicable)

#### **4.1 API Connection**
- [ ] Test: Web app can connect to API
- [ ] Expected: Successful connections
- [ ] Status: ⏳ Pending

#### **4.2 Functionality**
- [ ] Test: All web features work
- [ ] Expected: No regressions
- [ ] Status: ⏳ Pending

---

### **5. Environment Configuration Testing**

#### **5.1 API URL Configuration**
- [ ] Verify: Production API URL is correct
- [ ] Verify: Staging API URL is correct (if used)
- [ ] Expected: Correct endpoints configured
- [ ] Status: ⏳ Pending

#### **5.2 CORS Configuration**
- [ ] Test: CORS allows mobile app requests
- [ ] Test: CORS allows web app requests (if applicable)
- [ ] Expected: All requests allowed from authorized origins
- [ ] Status: ⏳ Pending

---

## 🔧 **Quick Test Scripts**

### **Production API Health Check**
```bash
curl https://api.aperae.com/api/health
```

### **Staging API Health Check**
```bash
curl https://staging-api.aperae.com/api/health
```

### **Test Wine Recommendation (Production)**
```bash
curl -X POST https://api.aperae.com/api/recommendations \
  -H "Content-Type: application/json" \
  -d '{"dish": "Grilled Salmon"}'
```

### **Test Authentication (Production)**
```bash
# Register
curl -X POST https://api.aperae.com/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"Test1234!","firstName":"Test","lastName":"User"}'
```

---

## 📊 **Testing Priority**

### **🔴 CRITICAL (Must Test First)**
1. Production API health check
2. Mobile app API connection
3. Core wine recommendation feature
4. User authentication

### **🟡 IMPORTANT (Should Test)**
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

## 🎯 **Recommended Testing Order**

1. **Start with API Health Checks** (5 minutes)
   - Quick verification everything is up

2. **Test Production API Endpoints** (10-15 minutes)
   - Core functionality verification

3. **Test Mobile App** (15-20 minutes)
   - Most important user-facing component
   - Test critical user flows

4. **Test Staging** (5-10 minutes)
   - Verify staging works for future testing

**Total Testing Time: ~30-50 minutes**

---

## 📝 **Test Results Template**

```
## Test Results - [DATE]

### Production API
- [ ] Health Check: PASS/FAIL
- [ ] Wine Recommendations: PASS/FAIL
- [ ] Authentication: PASS/FAIL
- Notes: [Any issues found]

### Staging API
- [ ] Health Check: PASS/FAIL
- [ ] Core Functionality: PASS/FAIL
- Notes: [Any issues found]

### Mobile App
- [ ] API Connection: PASS/FAIL
- [ ] Wine Recommendations: PASS/FAIL
- [ ] Authentication: PASS/FAIL
- Notes: [Any issues found]

### Overall Status: ✅ PASS / ⚠️ ISSUES FOUND / 🔴 CRITICAL FAILURES
```

---

## 🚀 **Next Steps After Testing**

### **If All Tests Pass:**
1. ✅ Document test results
2. ✅ Proceed with production readiness tasks
3. ✅ Continue with remaining roadmap items

### **If Issues Found:**
1. 🔧 Fix identified issues
2. 🔄 Re-run tests
3. ✅ Verify fixes work
4. ✅ Then proceed with roadmap

---

## 💡 **Why This Testing Matters**

1. **Catch Issues Early:** Better to find problems now than in production
2. **Verify Infrastructure:** Ensure DNS/SSL changes didn't break anything
3. **User Confidence:** Mobile app working = happy users
4. **Risk Reduction:** Know what works before adding more complexity

---

## ✅ **Conclusion**

**Agreed: Testing before proceeding is the right call!**

- Recent infrastructure changes could have affected connectivity
- Mobile app is the primary user interface
- Better to catch issues early
- Only takes 30-50 minutes to verify

**Recommendation: Run these tests, document results, then proceed based on outcomes.**

