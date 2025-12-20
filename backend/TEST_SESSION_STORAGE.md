# Testing Session Storage - Step by Step Guide

## Prerequisites

✅ All three tables created (`users`, `user_preferences`, `sessions`)  
✅ Backend server running (`npm start` or `npm run dev`)  
✅ Database connection working (`DATABASE_URL` in `.env`)

---

## Test 1: User Registration

### Using cURL

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

### Expected Response

```json
{
  "success": true,
  "user": {
    "id": "uuid-here",
    "email": "test@example.com",
    "role": "user",
    "isEmailVerified": false,
    "createdAt": "2025-12-02T...",
    "lastLogin": null
  },
  "accessToken": "jwt-token-here",
  "refreshToken": "jwt-refresh-token-here"
}
```

### Verify in Database

```sql
-- Check user was created
SELECT id, email, role, created_at, last_login 
FROM users 
WHERE email = 'test@example.com';

-- Check session was created
SELECT id, user_id, device, ip, created_at, expires_at, revoked_at
FROM sessions
WHERE user_id = (SELECT id FROM users WHERE email = 'test@example.com');
```

**Expected:** 
- ✅ User record exists
- ✅ Session record exists
- ✅ `device` and `ip` are populated
- ✅ `expires_at` is 7 days from now
- ✅ `revoked_at` is NULL

---

## Test 2: User Login

### Using cURL

```bash
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "Test1234!"
  }'
```

### Expected Response

```json
{
  "success": true,
  "user": {
    "id": "uuid-here",
    "email": "test@example.com",
    "role": "user",
    "isEmailVerified": false,
    "lastLogin": "2025-12-02T..."
  },
  "accessToken": "new-jwt-token-here",
  "refreshToken": "new-jwt-refresh-token-here"
}
```

### Verify in Database

```sql
-- Check last_login was updated
SELECT id, email, last_login 
FROM users 
WHERE email = 'test@example.com';

-- Check new session was created (should have 2 sessions now)
SELECT id, user_id, device, created_at, expires_at
FROM sessions
WHERE user_id = (SELECT id FROM users WHERE email = 'test@example.com')
ORDER BY created_at DESC;
```

**Expected:**
- ✅ `last_login` updated to current timestamp
- ✅ New session created (multiple sessions per user allowed)
- ✅ Both sessions have different `id` values

---

## Test 3: Token Refresh

### Using cURL

```bash
# Replace YOUR_REFRESH_TOKEN with the refreshToken from login response
curl -X POST http://localhost:3001/api/auth/refresh \
  -H "Content-Type: application/json" \
  -d '{
    "refreshToken": "YOUR_REFRESH_TOKEN"
  }'
```

### Expected Response

```json
{
  "accessToken": "new-access-token-here",
  "refreshToken": "new-refresh-token-here"
}
```

### Verify in Database

```sql
-- Check last_used was updated
SELECT id, user_id, last_used, expires_at
FROM sessions
WHERE refresh_token_hash = (
  -- Note: We can't easily check the hash, but we can check last_used
  SELECT refresh_token_hash 
  FROM sessions 
  WHERE user_id = (SELECT id FROM users WHERE email = 'test@example.com')
  ORDER BY last_used DESC
  LIMIT 1
);
```

**Expected:**
- ✅ New tokens returned
- ✅ `last_used` timestamp updated in database
- ✅ `refresh_token_hash` updated (old token no longer works)

---

## Test 4: Logout

### Using cURL

```bash
# Replace YOUR_ACCESS_TOKEN with the accessToken from login response
curl -X POST http://localhost:3001/api/auth/logout \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

### Expected Response

```json
{
  "success": true
}
```

### Verify in Database

```sql
-- Check session was revoked
SELECT id, user_id, revoked_at, expires_at
FROM sessions
WHERE user_id = (SELECT id FROM users WHERE email = 'test@example.com')
ORDER BY created_at DESC;
```

**Expected:**
- ✅ Most recent session has `revoked_at` set to current timestamp
- ✅ Revoked session cannot be used for token refresh

---

## Test 5: Session Persistence (Server Restart)

### Steps

1. **Login** (get tokens)
2. **Stop the server** (Ctrl+C)
3. **Start the server** again
4. **Try to refresh token** using the refresh token from step 1

### Using cURL

```bash
# Step 1: Login and save refresh token
REFRESH_TOKEN=$(curl -s -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "Test1234!"
  }' | jq -r '.refreshToken')

echo "Refresh Token: $REFRESH_TOKEN"

# Step 2: Stop server (manually)

# Step 3: Start server (manually)

# Step 4: Try to refresh (should still work!)
curl -X POST http://localhost:3001/api/auth/refresh \
  -H "Content-Type: application/json" \
  -d "{
    \"refreshToken\": \"$REFRESH_TOKEN\"
  }"
```

**Expected:**
- ✅ Token refresh works after server restart
- ✅ Session persisted in database
- ✅ User stays logged in

---

## Test 6: Multiple Sessions (Different Devices)

### Steps

1. Login from "device 1" (save tokens)
2. Login from "device 2" (different user-agent or IP)
3. Check both sessions exist

### Using cURL

```bash
# Device 1 (simulated with User-Agent)
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -H "User-Agent: Mozilla/5.0 (iPhone; CPU iPhone OS 14_0 like Mac OS X)" \
  -d '{
    "email": "test@example.com",
    "password": "Test1234!"
  }'

# Device 2 (simulated with different User-Agent)
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -H "User-Agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64)" \
  -d '{
    "email": "test@example.com",
    "password": "Test1234!"
  }'
```

### Verify in Database

```sql
-- Check multiple sessions exist
SELECT id, user_id, device, ip, created_at
FROM sessions
WHERE user_id = (SELECT id FROM users WHERE email = 'test@example.com')
AND revoked_at IS NULL
ORDER BY created_at DESC;
```

**Expected:**
- ✅ Multiple sessions for same user
- ✅ Different `device` values (mobile vs desktop)
- ✅ Both sessions active (not revoked)

---

## Test 7: Session Cleanup

### Manual Cleanup Test

```sql
-- Manually expire a session for testing
UPDATE sessions
SET expires_at = NOW() - INTERVAL '1 day'
WHERE user_id = (SELECT id FROM users WHERE email = 'test@example.com')
LIMIT 1;

-- Run cleanup (via API or directly)
-- The cleanup service runs automatically every 24 hours
-- Or you can trigger it manually by calling the service
```

### Verify Cleanup

```sql
-- Check expired sessions are gone
SELECT COUNT(*) as expired_sessions
FROM sessions
WHERE expires_at < NOW();
```

**Expected:**
- ✅ Expired sessions deleted
- ✅ Active sessions remain

---

## Test 8: Invalid Token Handling

### Test Invalid Refresh Token

```bash
curl -X POST http://localhost:3001/api/auth/refresh \
  -H "Content-Type: application/json" \
  -d '{
    "refreshToken": "invalid-token-here"
  }'
```

### Expected Response

```json
{
  "error": "Invalid refresh token"
}
```

**Expected:**
- ✅ Error returned
- ✅ No database changes
- ✅ No new tokens issued

---

## Test 9: Revoked Token Handling

### Steps

1. Login and get refresh token
2. Logout (revokes session)
3. Try to refresh with revoked token

```bash
# Step 1: Login
RESPONSE=$(curl -s -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "Test1234!"
  }')

REFRESH_TOKEN=$(echo $RESPONSE | jq -r '.refreshToken')
ACCESS_TOKEN=$(echo $RESPONSE | jq -r '.accessToken')

# Step 2: Logout
curl -X POST http://localhost:3001/api/auth/logout \
  -H "Authorization: Bearer $ACCESS_TOKEN"

# Step 3: Try to refresh (should fail)
curl -X POST http://localhost:3001/api/auth/refresh \
  -H "Content-Type: application/json" \
  -d "{
    \"refreshToken\": \"$REFRESH_TOKEN\"
  }"
```

**Expected:**
- ✅ Refresh fails with "Invalid refresh token"
- ✅ Session marked as revoked in database

---

## Quick Test Script

Save this as `test-sessions.sh`:

```bash
#!/bin/bash

BASE_URL="http://localhost:3001"
EMAIL="test@example.com"
PASSWORD="Test1234!"

echo "=== Testing Session Storage ==="
echo ""

echo "1. Registering user..."
REGISTER_RESPONSE=$(curl -s -X POST $BASE_URL/api/auth/register \
  -H "Content-Type: application/json" \
  -d "{
    \"email\": \"$EMAIL\",
    \"password\": \"$PASSWORD\",
    \"firstName\": \"Test\",
    \"lastName\": \"User\"
  }")

echo "$REGISTER_RESPONSE" | jq '.'
echo ""

REFRESH_TOKEN=$(echo $REGISTER_RESPONSE | jq -r '.refreshToken')
ACCESS_TOKEN=$(echo $REGISTER_RESPONSE | jq -r '.accessToken')

echo "2. Refreshing token..."
REFRESH_RESPONSE=$(curl -s -X POST $BASE_URL/api/auth/refresh \
  -H "Content-Type: application/json" \
  -d "{
    \"refreshToken\": \"$REFRESH_TOKEN\"
  }")

echo "$REFRESH_RESPONSE" | jq '.'
echo ""

echo "3. Logging out..."
LOGOUT_RESPONSE=$(curl -s -X POST $BASE_URL/api/auth/logout \
  -H "Authorization: Bearer $ACCESS_TOKEN")

echo "$LOGOUT_RESPONSE" | jq '.'
echo ""

echo "=== Tests Complete ==="
```

---

## Database Verification Queries

### Check All Active Sessions

```sql
SELECT 
  s.id as session_id,
  u.email,
  s.device,
  s.ip,
  s.created_at,
  s.last_used,
  s.expires_at,
  CASE 
    WHEN s.expires_at < NOW() THEN 'EXPIRED'
    WHEN s.revoked_at IS NOT NULL THEN 'REVOKED'
    ELSE 'ACTIVE'
  END as status
FROM sessions s
JOIN users u ON s.user_id = u.id
ORDER BY s.created_at DESC;
```

### Check Session Counts by User

```sql
SELECT 
  u.email,
  COUNT(*) as total_sessions,
  COUNT(*) FILTER (WHERE s.revoked_at IS NULL AND s.expires_at > NOW()) as active_sessions,
  COUNT(*) FILTER (WHERE s.revoked_at IS NOT NULL) as revoked_sessions,
  COUNT(*) FILTER (WHERE s.expires_at < NOW()) as expired_sessions
FROM users u
LEFT JOIN sessions s ON u.id = s.user_id
GROUP BY u.email
ORDER BY total_sessions DESC;
```

---

## Troubleshooting

### Error: "relation users does not exist"
**Solution:** Tables weren't created. Run `backend/create_all_auth_tables.sql` again.

### Error: "Invalid refresh token" immediately after login
**Solution:** Check that `refresh_token_hash` is being stored correctly. Verify the hash function in `userService.js`.

### Sessions not persisting after restart
**Solution:** 
1. Check `DATABASE_URL` in `.env`
2. Verify database connection
3. Check server logs for errors

### Multiple sessions not working
**Solution:** Ensure `userService.loginUser()` creates a new session each time (not updating existing).

---

## Success Criteria

✅ Registration creates user and session  
✅ Login creates new session (multiple sessions allowed)  
✅ Token refresh updates `last_used` and issues new tokens  
✅ Logout revokes session (`revoked_at` set)  
✅ Sessions persist across server restarts  
✅ Multiple sessions per user work  
✅ Expired sessions are cleaned up  
✅ Invalid/revoked tokens are rejected  

If all tests pass, session storage is working correctly! 🎉






