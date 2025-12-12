# Quick Fix for OCR - Two Options

## ✅ Option 1: Test with Mock Mode (Quickest)

This lets you test the entire OCR flow without Google Vision credentials:

1. **Edit `backend/.env` file** and add/update:
   ```
   MOCK_MODE=true
   ```

2. **Restart the backend server**

3. **Run the test again**:
   ```bash
   node test-ocr-complete.js
   ```

You should see:
- ✅ OCR endpoint working
- ✅ Returns mock data (text: "Mock OCR Text - Please configure Google Vision API credentials")
- ✅ Full flow works end-to-end

## 🔑 Option 2: Fix Google Vision Credentials (For Real OCR)

### If you have `google-vision-key.json` file:

1. **Edit `backend/.env` file** and add:
   ```
   GOOGLE_APPLICATION_CREDENTIALS=./google-vision-key.json
   ```

2. **Restart backend**

3. **Test again**

### If you have credentials in environment variables:

1. **Edit `backend/.env` file** and add:
   ```
   GOOGLE_CLOUD_PROJECT_ID=your-actual-project-id
   GOOGLE_CLOUD_CLIENT_EMAIL=your-service-account@project.iam.gserviceaccount.com
   GOOGLE_CLOUD_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...your key...\n-----END PRIVATE KEY-----\n"
   ```

2. **Restart backend**

3. **Test again**

## 🧪 After Fix, Test:

```bash
# From project root directory:
node test-ocr-complete.js
```

## 📱 Then Test Frontend:

1. Make sure frontend `.env` has:
   ```
   EXPO_PUBLIC_API_URL=http://localhost:3001
   ```

2. Test the menu screen OCR functionality



