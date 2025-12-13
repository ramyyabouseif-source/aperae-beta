# How to Get Google Cloud Credentials

**For:** Staging deployment setup  
**Status:** These are OPTIONAL - only needed if you use OCR/menu scanning features

---

## 📍 **Where to Get These Values**

**If your production service doesn't have these variables**, you have two options:

### **Option 1: Get from Google Cloud Console (If you have a project)**
### **Option 2: Skip them (Use MOCK_MODE for staging)**

---

## 🔍 **Step-by-Step: Get Values from Production**

### **1. Go to Production Render Service**

1. Open [Render Dashboard](https://dashboard.render.com/)
2. Find your **production service** (the one running `api.aperae.com`)
3. Click on the service name to open it

### **2. Open Environment Variables**

1. In your production service, click the **"Environment"** tab
2. You'll see a list of all environment variables

### **3. Find These Three Variables**

Look for and copy these exact variable names:

| Variable Name | What It Contains |
|---------------|------------------|
| `GOOGLE_CLOUD_PROJECT_ID` | Your Google Cloud project ID (e.g., `pocketsomm-vision-api`) |
| `GOOGLE_CLOUD_CLIENT_EMAIL` | Service account email (e.g., `xxx@pocketsomm-vision-api.iam.gserviceaccount.com`) |
| `GOOGLE_CLOUD_PRIVATE_KEY` | Private key (starts with `-----BEGIN PRIVATE KEY-----`) |

### **4. Copy the Values**

For each variable:
1. Click on the variable name or value
2. Copy the **entire value** (especially important for `GOOGLE_CLOUD_PRIVATE_KEY`)
3. Paste it into your staging service environment variables

---

## ⚠️ **Important Notes**

### **For GOOGLE_CLOUD_PRIVATE_KEY:**

The private key is a multi-line value that looks like:
```
-----BEGIN PRIVATE KEY-----
MIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQC...
(many lines of encoded text)
...
-----END PRIVATE KEY-----
```

**When copying to staging:**
- Copy the **ENTIRE** value including `-----BEGIN PRIVATE KEY-----` and `-----END PRIVATE KEY-----`
- Keep all the newlines (`\n`) - Render will handle this automatically
- Don't add extra quotes unless Render shows them in production

---

## 📋 **Quick Checklist**

- [ ] Open production Render service
- [ ] Go to "Environment" tab
- [ ] Find `GOOGLE_CLOUD_PROJECT_ID` → Copy value
- [ ] Find `GOOGLE_CLOUD_CLIENT_EMAIL` → Copy value
- [ ] Find `GOOGLE_CLOUD_PRIVATE_KEY` → Copy **entire** value (all lines)
- [ ] Paste all three into staging service environment variables

---

## ✅ **Option 2: Skip for Staging (Recommended)**

**If OCR/menu scanning isn't critical for staging testing:**

You can **skip** these three Google Cloud variables entirely. The service will:
- ✅ Run normally for all other features
- ✅ Use mock data for OCR/menu scanning (returns sample data)
- ✅ Still work for wine recommendations, authentication, etc.

**To skip:**
- Simply don't add `GOOGLE_CLOUD_PROJECT_ID`, `GOOGLE_CLOUD_CLIENT_EMAIL`, or `GOOGLE_CLOUD_PRIVATE_KEY`
- The service will automatically use mock mode for OCR features
- You can add these later when you need real OCR functionality

**This is perfectly fine for staging!** You can test everything except actual menu OCR scanning.

---

## ✅ **Verification**

After adding to staging, verify:
- All three variables are present
- `GOOGLE_CLOUD_PRIVATE_KEY` includes the full key (begin and end markers)
- No extra spaces or quotes added

---

**These are the same credentials used in production - you're just copying them to staging!** ✅

