# Fix Render Deployment Failure

## ✅ **Current Status:**
- **Service Created:** ✅ Yes
- **URL:** https://aperae-beta.onrender.com
- **Status:** Failed Deploy (expected - missing environment variables)
- **Next:** Add environment variables and redeploy

---

## 📋 **STEP 1: Check Build Logs (See Why It Failed)**

### **What to do:**
1. **In Render dashboard**, click on your service (`aperae-beta`)
2. **Click:** "Logs" tab (at the top)
3. **Scroll down** to see the error messages

### **What you'll likely see:**
- Error about missing `DATABASE_URL`
- Error about missing `JWT_SECRET`
- Error about missing `ANTHROPIC_API_KEY`
- Or similar environment variable errors

**This is normal!** We need to add these variables.

---

## 📋 **STEP 2: Add Environment Variables**

### **Where to Find Environment Variables:**

1. **In Render dashboard**, make sure you're viewing your service (`aperae-beta`)
2. **Look for tabs at the top:** "Logs", "Events", **"Environment"**
3. **Click:** "Environment" tab
4. **You should see:** A section to add environment variables

**OR look for:**
- "Environment Variables" section in the sidebar
- "Env" or "Environment" button
- Settings → Environment

### **How to Add Variables:**

**You'll see something like:**
- **Add Environment Variable** button
- OR a form with "Key" and "Value" fields

**For each variable:**
1. **Click:** "Add Environment Variable" (or "+" button)
2. **In the "Key" field:** Enter variable name (e.g., `NODE_ENV`)
3. **In the "Value" field:** Enter variable value (e.g., `production`)
4. **Click:** "Save" or "Add"

---

## 📋 **STEP 3: Add Required Variables (Complete List)**

### **Add these variables ONE BY ONE:**

#### **Variable 1: NODE_ENV**
```
Key: NODE_ENV
Value: production
```

#### **Variable 2: PORT**
```
Key: PORT
Value: 3001
```

#### **Variable 3: ALLOWED_ORIGINS**
```
Key: ALLOWED_ORIGINS
Value: https://www.aperae.com,https://api.aperae.com
```

#### **Variable 4: DATABASE_URL (REQUIRED!)**

**First, get your Supabase connection string:**
1. **Go to:** https://supabase.com/dashboard
2. **Select:** Your project
3. **Go to:** Settings (gear icon) → Database
4. **Find:** "Connection string" section
5. **Under "Connection string"**, find "URI" 
6. **Copy the connection string** (looks like: `postgresql://postgres:[YOUR-PASSWORD]@[HOST]:5432/postgres`)
7. **Replace `[YOUR-PASSWORD]`** with your actual database password

**Then add to Render:**
```
Key: DATABASE_URL
Value: [paste the connection string you copied]
```

#### **Variable 5: JWT_SECRET (REQUIRED!)**

**Generate secret first:**
1. **Open PowerShell** (keep Render open in browser)
2. **Type:**
   ```powershell
   openssl rand -base64 32
   ```
3. **Press:** Enter
4. **Copy the output** (long string of random characters)
5. **Add to Render:**
   ```
   Key: JWT_SECRET
   Value: [paste the secret you just generated]
   ```

#### **Variable 6: REFRESH_SECRET (REQUIRED!)**

**Generate another secret:**
1. **In PowerShell**, type again:
   ```powershell
   openssl rand -base64 32
   ```
2. **Press:** Enter
3. **Copy the NEW output** (different from JWT_SECRET!)
4. **Add to Render:**
   ```
   Key: REFRESH_SECRET
   Value: [paste the NEW secret you just generated]
   ```

#### **Variable 7: ANTHROPIC_API_KEY**
```
Key: ANTHROPIC_API_KEY
Value: [your Anthropic API key - starts with sk-ant-]
```

#### **Variable 8: ENABLE_V7_PROMPT**
```
Key: ENABLE_V7_PROMPT
Value: true
```

#### **Variable 9: MOCK_MODE**
```
Key: MOCK_MODE
Value: false
```

#### **Variable 10: LOG_LEVEL**
```
Key: LOG_LEVEL
Value: info
```

---

## 📋 **STEP 4: Save and Redeploy**

### **After Adding All Variables:**

1. **Make sure all variables are saved** (check they're all listed)
2. **Render will automatically redeploy** when you save variables
3. **OR manually trigger:** Click "Manual Deploy" → "Deploy latest commit"

### **Watch the New Deployment:**

1. **Click:** "Logs" tab
2. **Watch for:**
   - "Installing dependencies..."
   - "Build successful" ✅
   - "Starting service..."
   - "Listening on port 3001" ✅

---

## 📋 **STEP 5: Verify Deployment**

### **Check Status:**
- **Should show:** "Live" (green) instead of "Failed"

### **Test Health Endpoint:**
1. **Open browser**
2. **Go to:** `https://aperae-beta.onrender.com/api/health`
3. **Should see:** JSON response like `{"status":"ok"}` or similar

---

## 🆘 **If You Can't Find Environment Variables Section:**

**Try these locations:**
1. **Top menu tabs:** Look for "Environment" tab
2. **Settings:** Click "Settings" → Look for "Environment Variables"
3. **Left sidebar:** Look for "Environment" or "Env" section
4. **Service overview:** Scroll down on the main service page

**Tell me:** What do you see when you click on your service? I'll help you find the right place.

---

## ✅ **Action Items:**

**Right Now:**
1. ⏳ **Check logs** - See what error caused the failure
2. ⏳ **Find Environment Variables section** - Tell me what you see
3. ⏳ **Get DATABASE_URL** - From Supabase dashboard
4. ⏳ **Generate JWT secrets** - Using PowerShell
5. ⏳ **Add all variables** - One by one
6. ⏳ **Watch redeployment** - Should succeed this time!

**Tell me:**
- Can you see the "Environment" tab or "Environment Variables" section?
- What error do you see in the logs?
- Do you have your Supabase DATABASE_URL ready?

Then I'll guide you through adding each variable step by step!







