# OCR Troubleshooting Guide - Step by Step

## Step 1: Verify Backend is Running
```bash
# Check if backend is accessible
curl http://localhost:3001/api/health
# OR open in browser: http://localhost:3001/api/health
```

## Step 2: Check Google Vision Configuration

### Option A: Check Backend Health Endpoint
The health endpoint should show:
- `dependencies.googleVision.status`: Should be "healthy" or "skipped"
- `dependencies.googleVision.message`: Should indicate status

### Option B: Check Environment Variables
Backend needs one of these configurations:

**Option 1: Environment Variables**
```bash
GOOGLE_CLOUD_PROJECT_ID=your-project-id
GOOGLE_CLOUD_CLIENT_EMAIL=your-service-account@project.iam.gserviceaccount.com
GOOGLE_CLOUD_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
```

**Option 2: Credentials File**
```bash
GOOGLE_APPLICATION_CREDENTIALS=/path/to/google-credentials.json
```

**Option 3: Mock Mode (for testing)**
```bash
MOCK_MODE=true
```

## Step 3: Test OCR Endpoint Directly

### Test Script
```bash
node test-ocr-simple.js
```

This will:
1. Check if backend is running
2. Test the OCR endpoint
3. Show if it's using mock data or real Google Vision API

## Step 4: Check Backend Logs

The backend should log:
- `Google Vision client initialized successfully` - ✅ Good
- `Failed to initialize Google Vision client` - ❌ Check credentials
- `OCR processing failed` - ❌ Check the error details in logs

## Step 5: Test Frontend Image Conversion

The frontend needs to convert images to base64. Test this separately:

1. **Check if image is captured correctly**
   - Take a photo using the camera
   - Check console logs for image URI

2. **Check base64 conversion**
   - The `convertImageToBase64` function should log:
     - `Converting image to base64...`
     - `Base64 conversion completed, length: X`

3. **Check API call**
   - Should see: `Sending OCR request to backend...`
   - Should see: `OCR endpoint: http://...`

## Common Issues

### Issue 1: "OCR processing failed" with 500 error
**Cause**: Google Vision API call is failing
**Solution**: 
- Check backend logs for actual error
- Verify Google Cloud credentials are correct
- Check if Google Vision API is enabled in Google Cloud Console

### Issue 2: Backend returns mock data
**Cause**: Google Vision client not initialized
**Solution**:
- Check environment variables
- Check backend startup logs
- Enable MOCK_MODE for testing without credentials

### Issue 3: Frontend can't convert image
**Cause**: Image URI format or fetch API issue
**Solution**:
- Check image URI format (should be `file://...` or `http://...`)
- Check console for conversion errors
- Verify React Native fetch API is working

### Issue 4: Network/CORS errors
**Cause**: Backend URL is wrong or CORS not configured
**Solution**:
- Check `EXPO_PUBLIC_API_URL` in frontend
- Verify backend CORS settings
- Check if backend is accessible from device/emulator

## Next Steps

1. **If backend test fails**: Fix Google Vision API configuration
2. **If backend test works but frontend fails**: Check image conversion and API URL
3. **If everything works but OCR returns empty**: Image might not have text, or text is not clear enough



