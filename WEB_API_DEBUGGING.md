# Web API Debugging Guide

## Issue
POST requests to `/api/recommendations` and `/api/dish-recommendations` are failing on www.aperae.com. Only OPTIONS (preflight) requests succeed - POST requests never reach the server.

## Symptoms
- ✅ OPTIONS requests succeed (visible in backend logs)
- ❌ POST requests fail immediately (not visible in backend logs)
- Wine recommendations show fallback/mock data
- Dish recommendations show "Something went wrong"

## Debugging Steps

### 1. Check Browser Console
Open browser DevTools (F12) and check the Console tab for errors. Look for:
- `[CertificatePinning]` logs
- `[SecureHttpClient]` logs
- `Making secure request to:` logs
- Any error messages

### 2. Check Network Tab
In DevTools Network tab:
- Filter by "XHR" or "Fetch"
- Look for POST requests to `/api/recommendations` or `/api/dish-recommendations`
- Check request status (failed, cancelled, pending)
- Check request headers and payload
- Check response (if any)

### 3. Common Issues

#### A. Certificate Pinning Validation
If you see `[CertificatePinning]` logs showing validation failure, the URL security check is blocking the request.

**Expected log:**
```
[CertificatePinning] URL security validation passed: https://api.aperae.com/api/recommendations
```

**If failing, you'll see:**
```
[CertificatePinning] Insecure protocol detected: ...
```
or
```
[CertificatePinning] Suspicious hostname pattern detected: ...
```

#### B. Request Not Being Sent
If you don't see `Making secure request to:` in console, the request is failing before the fetch call.

#### C. CORS Error
If you see CORS errors in console, check backend CORS configuration.

### 4. Quick Test
Open browser console on www.aperae.com and run:

```javascript
fetch('https://api.aperae.com/api/recommendations', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'X-Requested-With': 'PocketSomm'
  },
  body: JSON.stringify({ dish: 'test' })
})
  .then(r => r.json())
  .then(d => console.log('Success:', d))
  .catch(e => console.error('Error:', e));
```

This will help determine if the issue is with:
- The fetch request itself (CORS, network, etc.)
- Our service code (certificate pinning, request construction, etc.)

## Expected Console Logs (if working)
```
[SecureHttpClient] Validating URL security for: https://api.aperae.com/api/recommendations
[CertificatePinning] URL security validation passed: https://api.aperae.com/api/recommendations
[SecureHttpClient] URL security validation result: true
Making secure request to: https://api.aperae.com/api/recommendations
Secure request successful: https://api.aperae.com/api/recommendations
```

## Next Steps
1. Check browser console for errors
2. Check Network tab for POST requests
3. Share console errors and network request details
4. Run the quick test above to isolate the issue

