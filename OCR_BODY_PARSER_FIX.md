# OCR Body Parser Limit Fix

## Issue Identified

The Menu Screen "Take Photo" option was failing with a 500 error when using the OCR endpoint.

**Error:**
- All 3 OCR attempts returned 500 Internal Server Error
- Request IDs: AD45dXrmhiHG3L0u, mFklUQ_IfJBcBPS_, 5oBnyTQzDiIINZc3

## Root Cause

1. **Image Size:**
   - Camera photo: 3,938,820 bytes (3.9MB base64)
   - Actual image size: ~2.9MB (after base64 decoding)

2. **Body Parser Limit:**
   - Express body parser was configured with a 1MB limit
   - Image was nearly 4x larger than the limit

3. **Result:**
   - Request body was rejected by Express body parser BEFORE reaching the OCR endpoint
   - OCR endpoint never received the request
   - Error handler returned 500 Internal Server Error
   - OCR compression logic (which exists) never ran because request was rejected first

## Fix Applied

**File:** `backend/server.js` (line 305)

**Changed:**
```javascript
// Before
app.use(express.json({ 
  limit: '1mb', // Limit JSON payloads to 1MB
  strict: true
}));

// After
app.use(express.json({ 
  limit: '10mb', // Increased to 10MB to handle large image uploads (OCR endpoint compresses them)
  strict: true
}));
```

## Why 10MB?

- Camera photos can be quite large (3-5MB is common)
- OCR endpoint has compression logic that reduces images to manageable sizes
- But compression happens AFTER body parsing
- 10MB is a safe upper limit that allows:
  - Large camera photos to be uploaded
  - Compression to run successfully
  - Prevents abuse while still being practical

## How It Works Now

1. **Client uploads image:**
   - Image can be up to 10MB (base64)
   - Body parser accepts the request

2. **OCR endpoint receives request:**
   - Checks image size
   - If > 200KB, compresses using Sharp library
   - Resizes to max 800x800px
   - Compresses JPEG quality to 60%

3. **Google Vision API:**
   - Receives compressed image (much smaller)
   - Processes OCR successfully

## Comparison: Upload vs Upload from Gallery

- **Upload from Gallery:** ✅ Works (image was 236KB - within 1MB limit)
- **Take Photo:** ❌ Failed (image was 3.9MB - exceeded 1MB limit)

After this fix, both should work!

## Related Code

- **OCR Endpoint:** `backend/server.js` (line 3185)
- **Compression Function:** `backend/server.js` (line 1646)
- **Body Parser:** `backend/server.js` (line 305)

## Next Steps

1. **Redeploy backend** to Render
2. **Test "Take Photo" option** - should work now
3. **Verify compression works** - check backend logs for compression messages

## Security Considerations

- 10MB limit is reasonable for image uploads
- OCR endpoint compresses images before processing
- No security implications from increasing limit (images are validated and compressed)
- Rate limiting still applies to prevent abuse


