# Troubleshooting Consent Storage on Production Web

## Issue: No Consent Records in Database

If consent records aren't appearing in the Supabase database when testing on www.aperae.com, check the following:

### 1. Check Browser Console for Errors

Open browser developer tools (F12) and check the Console tab for:
- `[ConsentApiService]` log messages
- Network errors
- CORS errors
- API errors

**Expected logs when consent is stored:**
```
[ConsentApiService] Storing consent: { consentType: 'age_verification', accepted: true, ... }
[ConsentApiService] Response status: 200 OK
[ConsentApiService] Consent stored successfully: { id: '...', ... }
```

**If you see errors:**
- Check the error message for details
- Check Network tab to see if the request is being made
- Check if the request is failing (404, 500, CORS, etc.)

### 2. Verify API URL is Correct

The API URL should be `https://api.aperae.com/api` when on www.aperae.com.

Check in browser console:
```javascript
// Run this in browser console on www.aperae.com
console.log('API URL:', process.env.EXPO_PUBLIC_API_URL || 'https://api.aperae.com/api');
```

### 3. Check Backend Server is Running

Verify the backend server is accessible:
```bash
curl https://api.aperae.com/api/health
```

Should return a health status. If it doesn't, the backend server isn't running or isn't accessible.

### 4. Check CORS Configuration

The backend needs to allow requests from www.aperae.com. Check `backend/server.js` CORS configuration.

### 5. Test API Endpoint Directly

Test the consent endpoint directly:
```bash
curl -X POST https://api.aperae.com/api/consent \
  -H "Content-Type: application/json" \
  -d '{
    "consentType": "age_verification",
    "accepted": true,
    "deviceId": "test-device-123"
  }'
```

Should return:
```json
{
  "success": true,
  "consent": { ... },
  "requestId": "..."
}
```

### 6. Check Database Connection

Verify the backend can connect to the database:
- Check backend logs for database connection errors
- Verify DATABASE_URL environment variable is set correctly
- Test database connection from backend

### 7. Check Backend Logs

Check backend server logs for:
- "Consent stored" messages
- Database errors
- Any errors related to consent storage

### Common Issues

**Issue: CORS Error**
- **Symptom**: Browser console shows CORS error
- **Fix**: Add www.aperae.com to allowed origins in backend CORS config

**Issue: 404 Not Found**
- **Symptom**: API returns 404
- **Fix**: Verify backend is running and accessible at api.aperae.com
- **Fix**: Check that the /api/consent endpoint exists in server.js

**Issue: 500 Internal Server Error**
- **Symptom**: API returns 500
- **Fix**: Check backend logs for detailed error
- **Fix**: Verify database connection and schema

**Issue: Silent Failure (No Errors in Console)**
- **Symptom**: No errors, but no records in database
- **Fix**: Check Network tab to see if request is being made
- **Fix**: Check if errors are being caught silently (should see logs now with updated code)

### Testing Steps

1. **Open www.aperae.com in browser**
2. **Open Developer Tools (F12)**
3. **Go to Console tab**
4. **Complete age verification/terms/privacy policy**
5. **Check for `[ConsentApiService]` log messages**
6. **Check Network tab for `/api/consent` requests**
7. **Verify request status (should be 200)**
8. **Check Supabase database for records**

### Debugging Checklist

- [ ] Browser console shows `[ConsentApiService]` logs
- [ ] Network tab shows POST request to `/api/consent`
- [ ] Request returns 200 status
- [ ] Backend logs show "Consent stored" message
- [ ] Database query shows new records
- [ ] Device IDs are hashed (64-char hex strings)
- [ ] No CORS errors in console
- [ ] No network errors in console



