# Verify Google Cloud Credentials - Step by Step

**Your current values:**
- `GOOGLE_CLOUD_PROJECT_ID`: `pocketsomm-vision-service`
- `GOOGLE_CLOUD_CLIENT_EMAIL`: `pocketsomm-vision-service@pocketsomm-vision-api.iam.gserviceaccount.com`

**⚠️ Note:** There's a mismatch - project ID says `pocketsomm-vision-service` but email references `pocketsomm-vision-api`. Let's verify!

---

## 🔍 **Step 1: Verify Project ID**

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Look at the **top bar** - you'll see the current project name
3. Or go to **"IAM & Admin"** → **"Settings"** to see the project ID
4. **Your Project ID should match** the one in your client email

**Expected:** If email is `pocketsomm-vision-service@pocketsomm-vision-api.iam.gserviceaccount.com`, then:
- Project ID should be: `pocketsomm-vision-api` (not `pocketsomm-vision-service`)

---

## ✅ **Step 2: Verify Service Account Email**

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Make sure you're in the **correct project** (check top bar)
3. Go to **"IAM & Admin"** → **"Service Accounts"**
4. Look for your service account in the list
5. **The email should match exactly:**
   - Service account name: `pocketsomm-vision-service`
   - Full email: `pocketsomm-vision-service@[PROJECT-ID].iam.gserviceaccount.com`

**Where PROJECT-ID** is your actual Google Cloud project ID (should be `pocketsomm-vision-api` based on your email)

---

## 🔑 **Step 3: Get/Create Private Key**

### **If you already have a key JSON file:**

1. Open the JSON file you downloaded
2. Look for these fields:
   ```json
   {
     "project_id": "pocketsomm-vision-api",
     "client_email": "pocketsomm-vision-service@pocketsomm-vision-api.iam.gserviceaccount.com",
     "private_key": "-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
   }
   ```
3. Copy the `private_key` value (entire thing including BEGIN/END markers)

### **If you need to create a new key:**

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Make sure you're in the correct project (check top bar)
3. Go to **"IAM & Admin"** → **"Service Accounts"**
4. Click on your service account (`pocketsomm-vision-service`)
5. Go to **"Keys"** tab
6. Click **"Add Key"** → **"Create new key"**
7. Select **"JSON"** format
8. Click **"Create"** - file will download
9. **Important:** Save this file securely (you can't download it again!)

---

## 📋 **Correct Values Format**

Based on your email, here's what the values should be:

### **If project is `pocketsomm-vision-api`:**

```
GOOGLE_CLOUD_PROJECT_ID: pocketsomm-vision-api
GOOGLE_CLOUD_CLIENT_EMAIL: pocketsomm-vision-service@pocketsomm-vision-api.iam.gserviceaccount.com
GOOGLE_CLOUD_PRIVATE_KEY: [From JSON file - private_key field]
```

### **If project is actually `pocketsomm-vision-service`:**

Then your email would be:
```
GOOGLE_CLOUD_CLIENT_EMAIL: pocketsomm-vision-service@pocketsomm-vision-service.iam.gserviceaccount.com
```

---

## ✅ **Verification Checklist**

Verify each value:

- [ ] **Project ID:** Check Google Cloud Console top bar or Settings
  - Should match the project in your service account email
  - If email is `...@pocketsomm-vision-api.iam.gserviceaccount.com`, project ID is `pocketsomm-vision-api`
  
- [ ] **Client Email:** Check in IAM & Admin → Service Accounts
  - Should be: `[service-account-name]@[project-id].iam.gserviceaccount.com`
  - Exact match required
  
- [ ] **Private Key:** From downloaded JSON file
  - Open JSON file
  - Find `private_key` field
  - Copy entire value (starts with `-----BEGIN PRIVATE KEY-----`, ends with `-----END PRIVATE KEY-----`)
  - Includes all newlines (`\n` characters)

---

## 🚨 **Common Issues**

### **Issue 1: Project ID Mismatch**

**Your situation:** 
- Project ID: `pocketsomm-vision-service`
- Email: `...@pocketsomm-vision-api.iam.gserviceaccount.com`

**Solution:**
- Check which project you're actually in
- The email format is `service-account@PROJECT-ID.iam.gserviceaccount.com`
- Project ID in email is the **actual Google Cloud project ID**
- Use that project ID (likely `pocketsomm-vision-api`)

### **Issue 2: Can't Find Private Key**

**Solution:**
- If you have the JSON file, use the `private_key` field
- If you lost it, create a new key:
  1. Service Accounts → Your account → Keys tab
  2. Add Key → Create new key → JSON
  3. Download and extract `private_key` field

---

## 📝 **Where to Check Each Value**

| Value | Where to Check |
|-------|----------------|
| **Project ID** | Google Cloud Console top bar, or IAM & Admin → Settings |
| **Client Email** | IAM & Admin → Service Accounts → Your account name |
| **Private Key** | JSON key file (private_key field), or create new key |

---

## ✅ **Quick Verification Steps**

1. **Open Google Cloud Console**
2. **Check top bar** - note the project name/ID
3. **Go to IAM & Admin → Service Accounts**
4. **Find your service account** (`pocketsomm-vision-service`)
5. **Verify the email** matches format: `name@PROJECT-ID.iam.gserviceaccount.com`
6. **Go to Keys tab** - if no keys, create one (JSON format)
7. **Open JSON file** - extract the three values:
   - `project_id` → `GOOGLE_CLOUD_PROJECT_ID`
   - `client_email` → `GOOGLE_CLOUD_CLIENT_EMAIL`
   - `private_key` → `GOOGLE_CLOUD_PRIVATE_KEY`

---

**Based on your email, your Project ID should be `pocketsomm-vision-api`, not `pocketsomm-vision-service`!** ✅




