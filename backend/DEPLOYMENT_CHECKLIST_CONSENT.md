# Deployment Checklist for Consent Storage Fix

## Issue
Backend returning 500 errors when storing consent records from www.aperae.com

## Root Causes Identified
1. ✅ **Table exists** - Confirmed by user
2. ⚠️ **CSRF protection** - Fixed (added www.aperae.com to allowed origins)
3. ⚠️ **Prisma Client** - Needs verification on production server

## Deployment Steps

### 1. Deploy Code Changes ✅
Code changes have been pushed to GitHub:
- CSRF protection fix (allows www.aperae.com origin)
- Improved error logging

**Action:** Deploy latest code to production backend server

### 2. Verify Prisma Client is Regenerated ⚠️ CRITICAL
The Prisma Client MUST be regenerated on the production server after the schema change.

**On Production Server:**
```bash
cd backend
npx prisma generate
```

**Then restart backend server:**
```bash
# If using PM2:
pm2 restart backend

# If using Docker:
docker-compose restart backend

# If using systemd:
sudo systemctl restart backend
```

### 3. Verify Table Structure
Confirm the table has all required columns:

```sql
-- Run in Supabase SQL Editor
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'user_consents'
ORDER BY ordinal_position;
```

**Expected columns:**
- id (text, NOT NULL)
- user_id (uuid, nullable)
- device_id_hash (text, nullable)
- consent_type (text, NOT NULL)
- accepted (boolean, NOT NULL)
- version (text, nullable)
- accepted_at (timestamp, NOT NULL)
- anonymized_at (timestamp, nullable)

### 4. Test the Endpoint

**From Browser (www.aperae.com):**
- Open Developer Tools (F12) → Console
- Complete consent screens
- Check for `[ConsentApiService]` log messages
- Verify no 500 errors

**From PowerShell (for manual testing):**
```powershell
$headers = @{
    "Content-Type" = "application/json"
    "X-Requested-With" = "XMLHttpRequest"
}
$body = @{
    consentType = "age_verification"
    accepted = $true
    deviceId = "test-123"
} | ConvertTo-Json

Invoke-WebRequest -Uri "https://api.aperae.com/api/consent" -Method POST -Headers $headers -Body $body
```

### 5. Check Backend Logs
After deploying, check backend logs for detailed errors:

```bash
# PM2
pm2 logs backend --lines 100

# Docker
docker logs backend --tail 100

# Systemd
journalctl -u backend -n 100
```

**Look for:**
- "Consent stored" success messages
- Database errors (e.g., "relation user_consents does not exist")
- Prisma errors (e.g., "Unknown arg `userConsent`")
- CSRF errors (should be fixed now)

### 6. Verify Database Records
After testing, verify records are being stored:

```sql
-- Check recent consent records
SELECT * FROM user_consents 
ORDER BY accepted_at DESC 
LIMIT 10;

-- Verify device IDs are hashed (should be 64-char hex strings)
SELECT 
    id,
    consent_type,
    accepted,
    LENGTH(device_id_hash) as hash_length,
    CASE 
        WHEN device_id_hash ~ '^[a-f0-9]{64}$' THEN 'Valid SHA-256'
        ELSE 'Invalid format'
    END as hash_status
FROM user_consents
ORDER BY accepted_at DESC
LIMIT 10;
```

## Expected Behavior After Fix

1. ✅ **Browser requests** (from www.aperae.com):
   - Should pass CSRF check (origin matches)
   - Should store consent successfully
   - Should return 200 status

2. ✅ **Backend logs**:
   - Should show "Consent stored" messages
   - Should NOT show database errors
   - Should NOT show Prisma client errors

3. ✅ **Database**:
   - Should contain new consent records
   - Device IDs should be hashed (64-char hex)
   - Timestamps should be correct

## Troubleshooting

### Still Getting 500 Errors?

1. **Check Prisma Client:**
   ```bash
   cd backend
   npx prisma generate
   ```
   If this fails, there may be a schema mismatch.

2. **Check Database Connection:**
   ```bash
   cd backend
   npx prisma db pull
   ```
   This will sync the schema with the database.

3. **Check Backend Logs:**
   The improved error logging should show the exact database error. Look for:
   - "Error storing consent" messages
   - Stack traces
   - Database error details

### Still Getting 403 Errors?

1. **Check CSRF Configuration:**
   Verify `backend/csrfProtection.js` includes www.aperae.com in allowed origins

2. **Check CORS Configuration:**
   Verify `backend/server.js` CORS config includes www.aperae.com

3. **Check Request Headers:**
   Browser requests should include:
   - `Origin: https://www.aperae.com`
   - `X-Requested-With: XMLHttpRequest`

## Success Criteria

- ✅ No 500 errors in browser console
- ✅ No 403 errors in browser console
- ✅ Backend logs show "Consent stored" messages
- ✅ Database contains consent records
- ✅ Device IDs are properly hashed
- ✅ All three consent types work (age_verification, terms, privacy_policy)




