# Session Storage Setup Guide

## Overview

Session storage has been migrated from in-memory (`Map`) to database (PostgreSQL/Supabase) for persistent authentication across server restarts.

---

## Step 1: Create Authentication Tables

All authentication tables need to be created in your Supabase database. You have two options:

### Option A: Using Supabase SQL Editor (Recommended) ⭐

1. Go to your Supabase project dashboard
2. Navigate to **SQL Editor**
3. Copy and paste the SQL from `backend/create_all_auth_tables.sql` (creates all tables at once)
4. Click **Run** to execute

**This will create:**
- ✅ `users` table (user accounts)
- ✅ `user_preferences` table (user preferences)
- ✅ `sessions` table (authentication sessions)

### Option B: Create Tables Individually

If you prefer to create tables one at a time:

1. **Users table:** Run `backend/create_users_table.sql`
2. **User preferences table:** Run `backend/create_user_preferences_table.sql`
3. **Sessions table:** Run `backend/create_sessions_table.sql`

**Note:** Tables must be created in this order due to foreign key dependencies.

---

## Step 2: Verify Table Creation

Check that all tables exist:

```sql
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('users', 'user_preferences', 'sessions')
ORDER BY table_name;
```

You should see all three tables listed:
- ✅ `sessions`
- ✅ `user_preferences`
- ✅ `users`

---

## Step 3: Test the Implementation

### Test Registration
```bash
curl -X POST http://localhost:3001/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "Test1234!",
    "firstName": "Test",
    "lastName": "User"
  }'
```

### Test Login
```bash
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "Test1234!"
  }'
```

### Test Token Refresh
```bash
curl -X POST http://localhost:3001/api/auth/refresh \
  -H "Content-Type: application/json" \
  -d '{
    "refreshToken": "YOUR_REFRESH_TOKEN_HERE"
  }'
```

### Test Logout
```bash
curl -X POST http://localhost:3001/api/auth/logout \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

---

## Step 4: Verify Sessions in Database

Check that sessions are being stored:

```sql
SELECT 
  id,
  user_id,
  device,
  ip,
  created_at,
  last_used,
  expires_at,
  revoked_at
FROM sessions
ORDER BY created_at DESC
LIMIT 10;
```

---

## What Changed

### Before (In-Memory)
- Sessions stored in JavaScript `Map` objects
- Lost on server restart
- No persistence
- No device tracking
- No session revocation

### After (Database)
- Sessions stored in PostgreSQL database
- Persist across server restarts ✅
- Device and IP tracking ✅
- Session revocation ✅
- Automatic cleanup of expired sessions ✅
- Multiple sessions per user (different devices) ✅

---

## Features Added

### 1. **Persistent Sessions**
Sessions survive server restarts, deployments, and crashes.

### 2. **Device Tracking**
Each session tracks:
- Device type (mobile/tablet/desktop)
- IP address
- Creation time
- Last used time

### 3. **Session Management**
- **Logout**: Revokes current session
- **Logout Everywhere**: Revokes all sessions for a user
- **Get All Sessions**: List all active sessions for a user
- **Revoke Specific Session**: Revoke a session by ID

### 4. **Automatic Cleanup**
- Runs every 24 hours
- Deletes expired sessions
- Deletes revoked sessions older than 30 days
- Started automatically on server startup

---

## API Changes

### Registration & Login
No changes to API endpoints - they now automatically:
- Store sessions in database
- Track device and IP
- Support multiple sessions per user

### New Endpoints (Optional - can be added later)

**Get User Sessions:**
```
GET /api/auth/sessions
Authorization: Bearer <access_token>
```

**Revoke Specific Session:**
```
DELETE /api/auth/sessions/:sessionId
Authorization: Bearer <access_token>
```

---

## Database Schema

```sql
CREATE TABLE sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id VARCHAR(255) NOT NULL,
  refresh_token_hash TEXT NOT NULL,
  device VARCHAR(255),
  ip VARCHAR(45),
  expires_at TIMESTAMPTZ NOT NULL,
  revoked_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  last_used TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX idx_sessions_user_id ON sessions(user_id);
CREATE INDEX idx_sessions_refresh_token_hash ON sessions(refresh_token_hash);
CREATE INDEX idx_sessions_expires_at ON sessions(expires_at);
CREATE INDEX idx_sessions_revoked_at ON sessions(revoked_at) WHERE revoked_at IS NOT NULL;
```

---

## Troubleshooting

### Error: "relation sessions does not exist"
**Solution:** Run the SQL script from `backend/create_sessions_table.sql` in Supabase SQL Editor.

### Error: "foreign key constraint fails"
**Solution:** Ensure all tables are created in the correct order:
1. `users` table first
2. `user_preferences` table second (depends on users)
3. `sessions` table third (depends on users)

Use `backend/create_all_auth_tables.sql` to create them all at once.

### Sessions not persisting
**Check:**
1. Database connection is working (`DATABASE_URL` in `.env`)
2. Sessions table exists
3. No errors in server logs

### Cleanup not running
**Check:**
1. Server logs for cleanup messages
2. `NODE_ENV` is not set to 'test'
3. No errors in `sessionCleanupService.js`

---

## Next Steps

1. ✅ Create sessions table (Step 1)
2. ✅ Test registration/login (Step 3)
3. ⏳ Monitor session storage in database
4. ⏳ Add session management endpoints (optional)
5. ⏳ Migrate existing users to database (if needed)

---

## Files Modified

- ✅ `backend/userService.js` - Complete rewrite to use database
- ✅ `backend/server.js` - Updated to pass `req` object, added cleanup service
- ✅ `backend/services/sessionCleanupService.js` - New cleanup service
- ✅ `backend/create_sessions_table.sql` - SQL script for table creation

---

## Status

✅ **Implementation Complete**  
⏳ **Waiting for:** Sessions table creation in Supabase

Once the table is created, session storage will be fully functional!

