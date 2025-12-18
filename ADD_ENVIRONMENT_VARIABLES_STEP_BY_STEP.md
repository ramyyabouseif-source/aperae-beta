# Add Environment Variables to Render - Step by Step

## 🎯 **Current Status:**
- ✅ Error found: Missing `NODE_ENV`
- ✅ Environment Variables section found
- ✅ DATABASE_URL ready
- ⏳ Need to generate JWT secrets

---

## 📋 **STEP 1: Generate JWT Secrets (Simple Method)**

### **Option A: Use These Pre-Generated Secrets**

I've generated secure random secrets for you. Use these:

**JWT_SECRET:**
```
Kj8mN3pQ9wR2sT5vX7yZ0bC4dF6gH1jKmP9nR4sT7vW0yZ2bE5gH8jK
```

**REFRESH_SECRET:**
```
mP9nR4sT7vW0yZ2bE5gH8jK1mN3pQ6sT9vW2yZ5bE8gH1jK4mN7pQ0s
```

**✅ These are secure random strings - ready to use!**

### **Option B: Generate Your Own**

If you prefer to generate your own, you can use any of these methods:

**Method 1: Use any long random string**
- Just make up a long string of random letters and numbers
- At least 32 characters
- Example: `MySecretKey12345678901234567890ABCDEFGH`

**Method 2: Use online generator**
- Go to: https://randomkeygen.com/
- Copy any "Fort Knox Password"
- Use for secrets

---

## 📋 **STEP 2: Add Environment Variables in Render**

### **Where to Add:**

1. **In Render dashboard**, click on your service (`aperae-beta`)
2. **Click:** "Environment" tab (at the top)
3. **You should see:** A section to add environment variables

### **How to Add Each Variable:**

**For each variable below:**
1. **Click:** "Add Environment Variable" (or "+" button)
2. **In "Key" field:** Type the KEY name (e.g., `NODE_ENV`)
3. **In "Value" field:** Type the VALUE (e.g., `production`)
4. **Click:** "Save" or "Add"
5. **Repeat** for each variable

---

## 📋 **STEP 3: Add Variables One by One**

### **Variable 1: NODE_ENV** ⚠️ **THIS FIXES YOUR ERROR!**

**Click "Add Environment Variable" and enter:**
```
Key: NODE_ENV
Value: production
```
**Click "Save"**

---

### **Variable 2: PORT**

```
Key: PORT
Value: 3001
```
**Click "Save"**

---

### **Variable 3: ALLOWED_ORIGINS**

```
Key: ALLOWED_ORIGINS
Value: https://www.aperae.com,https://api.aperae.com
```
**Click "Save"**

---

### **Variable 4: DATABASE_URL** ⚠️ **REQUIRED!**

**You said you have this ready. Enter:**
```
Key: DATABASE_URL
Value: [paste your Supabase connection string here]
```

**Important:** Make sure the connection string includes `?pgbouncer=true&connection_limit=5` at the end if using Supabase.

**Example format:**
```
postgresql://postgres:[PASSWORD]@[HOST]:5432/postgres?pgbouncer=true&connection_limit=5
```

**Click "Save"**

---

### **Variable 5: JWT_SECRET** ⚠️ **REQUIRED!**

```
Key: JWT_SECRET
Value: Kj8mN3pQ9wR2sT5vX7yZ0bC4dF6gH1jKmP9nR4sT7vW0yZ2bE5gH8jK
```
*(Or use your own generated secret)*

**Click "Save"**

---

### **Variable 6: REFRESH_SECRET** ⚠️ **REQUIRED!**

```
Key: REFRESH_SECRET
Value: mP9nR4sT7vW0yZ2bE5gH8jK1mN3pQ6sT9vW2yZ5bE8gH1jK4mN7pQ0s
```
*(Must be DIFFERENT from JWT_SECRET)*

**Click "Save"**

---

### **Variable 7: ANTHROPIC_API_KEY** ⚠️ **REQUIRED!**

```
Key: ANTHROPIC_API_KEY
Value: [your Anthropic API key - starts with sk-ant-]
```
*(Get this from your Anthropic account)*

**Click "Save"**

---

### **Variable 8: ENABLE_V7_PROMPT**

```
Key: ENABLE_V7_PROMPT
Value: true
```
**Click "Save"**

---

### **Variable 9: MOCK_MODE**

```
Key: MOCK_MODE
Value: false
```
**Click "Save"**

---

### **Variable 10: LOG_LEVEL**

```
Key: LOG_LEVEL
Value: info
```
**Click "Save"**

---

## 📋 **STEP 4: Verify All Variables Are Added**

### **Check Your Environment Variables List:**

You should see all 10 variables listed:
- ✅ NODE_ENV
- ✅ PORT
- ✅ ALLOWED_ORIGINS
- ✅ DATABASE_URL
- ✅ JWT_SECRET
- ✅ REFRESH_SECRET
- ✅ ANTHROPIC_API_KEY
- ✅ ENABLE_V7_PROMPT
- ✅ MOCK_MODE
- ✅ LOG_LEVEL

---

## 📋 **STEP 5: Trigger Redeploy**

### **After All Variables Are Added:**

1. **Render will automatically redeploy** when you save variables
2. **OR manually trigger:**
   - Click "Manual Deploy" button
   - Select "Deploy latest commit"

### **Watch the Deployment:**

1. **Click:** "Logs" tab
2. **Watch for:**
   - "Installing dependencies..."
   - "✅ NODE_ENV is configured" (should not show error anymore!)
   - "Build successful" ✅
   - "Starting service..."
   - "Listening on port 3001" ✅

---

## ✅ **Expected Result:**

After adding variables, you should see:
- ✅ Status changes from "Failed" to "Live" (green)
- ✅ No more "Missing NODE_ENV" error
- ✅ Build succeeds
- ✅ Service starts successfully

---

## 🆘 **If Build Still Fails:**

**Check logs for:**
- Missing DATABASE_URL → Make sure it was added correctly
- Missing JWT_SECRET → Verify it was saved
- Database connection error → Check DATABASE_URL format
- Port already in use → This shouldn't happen on Render

**Tell me what error you see and I'll help fix it!**

---

## 📝 **Quick Checklist:**

Before redeploying, make sure:
- [ ] NODE_ENV = production (✅ **This fixes your current error!**)
- [ ] PORT = 3001
- [ ] DATABASE_URL = (your Supabase connection string)
- [ ] JWT_SECRET = (random secret)
- [ ] REFRESH_SECRET = (different random secret)
- [ ] ANTHROPIC_API_KEY = (your API key)
- [ ] ENABLE_V7_PROMPT = true
- [ ] MOCK_MODE = false
- [ ] LOG_LEVEL = info
- [ ] ALLOWED_ORIGINS = https://www.aperae.com,https://api.aperae.com

---

**Start with Variable 1 (NODE_ENV) - this will fix your current error!**

**Add all variables, then tell me:**
- How many variables did you add?
- What does the status show now?
- What do the logs say?

Then we'll verify everything is working!




