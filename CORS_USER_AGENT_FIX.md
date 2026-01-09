# CORS User-Agent Header Fix

## Issue Identified

All API endpoints ("Dish → Wine", "Wine → Dish", and Menu Screen "Dish → Wine") were failing with a CORS error:

```
Request header field User-Agent is not allowed by Access-Control-Allow-Headers.
Fetch API cannot load https://api.aperae.com/api/recommendations due to access control checks.
```

## Root Cause

1. **Client sends User-Agent header:**
   - The `SecureHttpClient` (src/services/secureHttpClient.ts) sets a default header: `'User-Agent': 'PocketSomm/1.0.0'`
   - This header is included in all API requests

2. **Backend CORS configuration:**
   - The backend's CORS configuration (backend/server.js) had `allowedHeaders` that didn't include `User-Agent`
   - The allowed headers were: `['Content-Type', 'Authorization', 'X-Requested-With', 'Accept', 'Origin']`

3. **Result:**
   - Browser blocked the request because `User-Agent` header wasn't in the allowed headers list
   - Request failed immediately with CORS error
   - All 3 retry attempts failed with the same error
   - **Affected endpoints:**
     - `/api/recommendations` (Dish → Wine - Home Screen)
     - `/api/recommendations` (Dish → Wine - Menu Screen)
     - `/api/dish-recommendations` (Wine → Dish - Home Screen)
     - `/api/ocr/extract-text` (OCR - Menu Screen) ✅ Already working
     - Any other endpoint using the same CORS middleware

## Fix Applied

**File:** `backend/server.js` (line 208)

**Changed:**
```javascript
// Before
allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept', 'Origin'],

// After
allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept', 'Origin', 'User-Agent'],
```

## Why This Happened

- The client explicitly sets the `User-Agent` header for identification/tracking purposes
- Browsers automatically include `User-Agent` in requests, but when explicitly set via fetch API, it needs to be in the CORS `allowedHeaders`
- The backend CORS configuration didn't account for this header

## Next Steps

1. **Redeploy backend to Render:**
   - Commit and push the changes
   - Render will automatically redeploy
   - Wait for deployment to complete

2. **Test the pairing assistants:**
   - Try "Dish → Wine" again
   - Try "Wine → Dish" again
   - Both CORS errors should be resolved
   - Requests should proceed normally

3. **Verify fix:**
   - Check that API requests succeed
   - Verify no more CORS errors in console
   - Confirm pairing assistant works correctly

## Expected Behavior After Fix

- ✅ Requests should no longer fail with CORS errors
- ✅ `User-Agent` header will be accepted by the backend
- ✅ API calls should proceed normally
- ✅ **All pairing assistants should work:**
  - "Dish → Wine" - Home Screen (`/api/recommendations`)
  - "Dish → Wine" - Menu Screen (`/api/recommendations`)
  - "Wine → Dish" - Home Screen (`/api/dish-recommendations`)
- ✅ **OCR is already working** - no issues with image upload/processing

## Related Files

- **Backend CORS Config:** `backend/server.js` (line 208)
- **Client HTTP Client:** `src/services/secureHttpClient.ts` (line 18)

## Notes

- This is a common CORS issue when clients send custom headers
- The `User-Agent` header is safe to allow - it's just identifying the client
- No security implications from allowing this header

