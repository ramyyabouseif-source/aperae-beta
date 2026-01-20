# Troubleshooting Consent 500 Error

## Problem
Backend is returning 500 Internal Server Error when storing consent records.

## Error Symptoms
- POST to `/api/consent` returns 500
- Error message: "Failed to store consent"
- All consent types failing (age_verification, terms, privacy_policy)

## Most Likely Causes

### 1. Database Table Doesn't Exist ⚠️ MOST LIKELY
The `user_consents` table may not have been created in the production database.

**Solution:**
1. Check if table exists in Supabase:
   ```sql
   SELECT * FROM user_consents LIMIT 1;
   ```
   
2. If table doesn't exist, run the SQL migration:
   - Open Supabase Dashboard → SQL Editor
   - Copy contents from `backend/prisma/migrations/manual_add_user_consent_table.sql`
   - Run the SQL

### 2. Prisma Client Not Regenerated ⚠️ LIKELY
Prisma Client may not include the UserConsent model.

**Solution:**
1. SSH into production server
2. Navigate to backend directory
3. Run: `npx prisma generate`
4. Restart backend server

### 3. Database Connection Issue
The backend may not be able to connect to the database.

**Solution:**
1. Check `DATABASE_URL` environment variable is set correctly
2. Test database connection:
   ```bash
   cd backend
   npx prisma db pull
   ```
3. Check backend logs for database connection errors

### 4. Wrong Table Name Mapping
The Prisma model might not match the database table name.

**Check:**
- Prisma schema: `@@map("user_consents")` should be present
- Database table: Should be named `user_consents` (snake_case)

## Immediate Fix Steps

1. **Verify table exists:**
   ```sql
   -- Run in Supabase SQL Editor
   SELECT table_name 
   FROM information_schema.tables 
   WHERE table_schema = 'public' 
   AND table_name = 'user_consents';
   ```

2. **If table doesn't exist, create it:**
   - Copy SQL from `backend/prisma/migrations/manual_add_user_consent_table.sql`
   - Run in Supabase SQL Editor

3. **Regenerate Prisma Client on production:**
   ```bash
   cd backend
   npx prisma generate
   ```

4. **Restart backend server** (if using PM2, Docker, or similar):
   ```bash
   # PM2
   pm2 restart backend
   
   # Docker
   docker-compose restart backend
   ```

5. **Check backend logs** for detailed error:
   ```bash
   # View logs
   pm2 logs backend
   # or
   docker logs backend
   ```

## Verification

After fixing, test the endpoint:
```bash
curl -X POST https://api.aperae.com/api/consent \
  -H "Content-Type: application/json" \
  -d '{
    "consentType": "age_verification",
    "accepted": true,
    "deviceId": "test-123"
  }'
```

Should return 200 with consent object.

## Improved Error Logging

I've updated the error handling to include more detailed error messages in development mode. Check backend logs for the actual database error message which will help identify the exact issue.




