# Testing Consent Storage System

## ✅ Setup Complete
- ✅ Database table `user_consents` created in Supabase
- ✅ Prisma Client regenerated with UserConsent model
- ✅ Backend consent service implemented
- ✅ API endpoints created (`POST /api/consent`, `GET /api/consent/user`)
- ✅ Frontend services updated (AgeVerificationService, TermsService, PrivacyPolicyService)
- ✅ Device ID utility for pseudonymization created

## Testing Steps

### 1. Test Backend API Endpoints

**Test 1: Store Age Verification Consent (Anonymous User)**
```bash
curl -X POST http://localhost:3001/api/consent \
  -H "Content-Type: application/json" \
  -d '{
    "consentType": "age_verification",
    "accepted": true,
    "deviceId": "test-device-123"
  }'
```

Expected response:
```json
{
  "success": true,
  "consent": {
    "id": "...",
    "consentType": "age_verification",
    "accepted": true,
    "version": null,
    "acceptedAt": "2025-01-XX..."
  },
  "requestId": "..."
}
```

**Test 2: Store Terms Acceptance**
```bash
curl -X POST http://localhost:3001/api/consent \
  -H "Content-Type: application/json" \
  -d '{
    "consentType": "terms",
    "accepted": true,
    "version": "1.0",
    "deviceId": "test-device-123"
  }'
```

**Test 3: Store Privacy Policy Acceptance**
```bash
curl -X POST http://localhost:3001/api/consent \
  -H "Content-Type: application/json" \
  -d '{
    "consentType": "privacy_policy",
    "accepted": true,
    "version": "1.0",
    "deviceId": "test-device-123"
  }'
```

**Test 4: Get User Consents (Requires Authentication)**
```bash
curl -X GET http://localhost:3001/api/consent/user \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

### 2. Test Frontend Integration

**Test Age Verification Flow:**
1. Launch the app
2. Navigate through age verification screen
3. Select age and verify
4. Check backend logs - should see consent stored
5. Check database - should see record in `user_consents` table

**Test Terms Acceptance:**
1. Navigate to Terms screen
2. Scroll to bottom and accept terms
3. Check backend logs and database

**Test Privacy Policy Acceptance:**
1. Navigate to Privacy Policy screen
2. Scroll to bottom, check box, and accept
3. Check backend logs and database

### 3. Verify Database Records

**Query in Supabase SQL Editor:**
```sql
-- View all consent records
SELECT * FROM user_consents ORDER BY accepted_at DESC;

-- Check device ID hashing (should be hashed, not plain text)
SELECT id, consent_type, accepted, version, accepted_at, 
       device_id_hash IS NOT NULL as has_device_hash,
       user_id IS NULL as is_anonymous
FROM user_consents;

-- Count consents by type
SELECT consent_type, COUNT(*) as count, 
       COUNT(DISTINCT device_id_hash) as unique_devices,
       COUNT(DISTINCT user_id) as unique_users
FROM user_consents 
GROUP BY consent_type;
```

### 4. Verify Privacy Features

✅ **Device ID Pseudonymization:**
- Device IDs should be hashed (SHA-256) in database
- `device_id_hash` field should contain 64-character hex string
- Never see plain device IDs in database

✅ **Anonymous User Support:**
- Consents work without user authentication
- `user_id` should be NULL for anonymous users
- `device_id_hash` used for tracking anonymous users

✅ **Data Minimization:**
- Only consent metadata stored (type, accepted, version, timestamp)
- No PII stored (no IP addresses, user agents, etc.)

### 5. Test Data Export (For Authenticated Users)

1. Authenticate as a user
2. Navigate to Privacy Settings screen
3. Click "Export My Data (GDPR)"
4. Check exported JSON - should include `consents` array with consent records

### 6. Error Handling Tests

**Test Backend Error Handling:**
- Send invalid consentType (should return 400)
- Send missing required fields (should return 400)
- Verify non-blocking errors in frontend (consent storage failures shouldn't break app)

## Expected Behavior

### Success Scenarios:
- ✅ Consents stored in database with hashed device IDs
- ✅ Frontend continues to work even if backend storage fails (graceful degradation)
- ✅ Local storage still works as fallback
- ✅ Data export includes consent records for authenticated users

### Privacy Compliance:
- ✅ Device IDs are hashed (SHA-256) - cannot be reversed
- ✅ No PII stored (no IP addresses, user agents, exact ages)
- ✅ Minimal data collection (only consent metadata)
- ✅ Supports user rights (data export, deletion)

## Monitoring

**Check Backend Logs:**
- Look for "Consent stored" messages
- Check for any errors in consent service
- Verify device ID hashing is working

**Check Database:**
- Records should appear in `user_consents` table
- Device IDs should be hashed (64-char hex strings)
- Timestamps should be accurate

## Next Steps After Testing

1. ✅ Test all consent flows in development
2. ✅ Verify database records are correct
3. ✅ Test data export functionality
4. ✅ Deploy to staging/production
5. ✅ Monitor for any errors in production logs
6. ✅ Update privacy policy documentation if needed



