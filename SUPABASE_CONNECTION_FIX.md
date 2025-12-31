# Supabase Database Connection Fix

## 🔍 **Issues Identified from Render Logs:**

1. **Database Connection Failure:**
   ```
   Can't reach database server at `db.andzllkyflcdtrfrqwes.supabase.co:5432`
   ```

2. **Session Cleanup Failing on Startup:**
   - Session cleanup runs immediately on server start
   - Fails if database isn't ready or connection string is incorrect

## ✅ **Fixes Applied:**

### **1. Made Session Cleanup More Resilient**
- Added `DATABASE_URL` check before attempting cleanup
- Added connection test before running queries
- Changed initial cleanup failure from `error` to `warning` (won't crash server)
- Connection errors are now logged as warnings, not errors

### **2. Connection String Requirements**

**For Supabase, your `DATABASE_URL` must include SSL parameters:**

```bash
# ❌ WRONG (will fail)
DATABASE_URL=postgresql://user:password@db.xxx.supabase.co:5432/database

# ✅ CORRECT - Direct connection with SSL
DATABASE_URL=postgresql://user:password@db.xxx.supabase.co:5432/database?sslmode=require

# ✅ CORRECT - Pooled connection (recommended for Render/serverless)
DATABASE_URL=postgresql://user:password@db.xxx.supabase.co:6543/database?pgbouncer=true&connection_limit=5
```

## 🔧 **Action Required - Update DATABASE_URL in Render:**

### **Step 1: Get Your Supabase Connection String**

1. Go to your Supabase dashboard
2. Navigate to: **Project Settings** → **Database**
3. Find the **Connection String** section
4. Choose **Connection pooling** mode (recommended for serverless)
5. Copy the connection string

### **Step 2: Verify Connection String Format**

Your connection string should look like:
```
postgresql://postgres:[YOUR-PASSWORD]@db.andzllkyflcdtrfrqwes.supabase.co:6543/postgres?pgbouncer=true&connection_limit=5
```

**Key requirements:**
- ✅ Port `6543` (pooled) OR port `5432` with `?sslmode=require`
- ✅ `pgbouncer=true` parameter (for pooled connections)
- ✅ `connection_limit=5` parameter (prevents connection exhaustion)
- ✅ Password URL-encoded if it contains special characters

### **Step 3: Update Render Environment Variable**

1. Go to your Render dashboard
2. Navigate to your service
3. Go to **Environment** tab
4. Find `DATABASE_URL`
5. Update it with the correct Supabase connection string (from Step 1)
6. Click **Save Changes**
7. Service will auto-redeploy

## 📋 **Connection String Formats:**

### **Option 1: Pooled Connection (Recommended)**
```
postgresql://postgres:password@db.xxx.supabase.co:6543/postgres?pgbouncer=true&connection_limit=5
```
- **Port:** 6543 (Supabase connection pooler)
- **Best for:** Serverless, Render, production environments
- **Benefits:** Better connection management, fewer connection limits

### **Option 2: Direct Connection with SSL**
```
postgresql://postgres:password@db.xxx.supabase.co:5432/postgres?sslmode=require
```
- **Port:** 5432 (Direct PostgreSQL)
- **Best for:** Development, long-running connections
- **Note:** Has connection limits (max ~100 concurrent)

### **Option 3: Direct with Pooling Parameters**
```
postgresql://postgres:password@db.xxx.supabase.co:5432/postgres?sslmode=require&pgbouncer=true&connection_limit=5
```
- **Port:** 5432 with pooling parameters
- **Works for:** Both direct and pooled scenarios

## ⚠️ **Important Notes:**

1. **Password Encoding:** If your password contains special characters (`@`, `#`, `%`, etc.), URL-encode them:
   - `@` → `%40`
   - `#` → `%23`
   - `%` → `%25`
   - etc.

2. **Test Connection:** After updating, check Render logs for:
   - ✅ "Session cleanup completed" (success)
   - ✅ No "Can't reach database server" errors
   - ✅ Server starts without database connection errors

3. **If Still Failing:**
   - Verify Supabase database is running (check Supabase dashboard)
   - Check if IP is whitelisted (Supabase → Settings → Database → Connection Pooling)
   - Try both connection string formats (pooled vs direct)
   - Check Supabase connection limits

## ✅ **Expected Behavior After Fix:**

- ✅ Server starts successfully even if DB connection takes time
- ✅ Session cleanup runs gracefully (warns instead of errors on connection issues)
- ✅ Periodic cleanup retries automatically
- ✅ Database connections work once `DATABASE_URL` is correct

---

**Next Step:** Update `DATABASE_URL` in Render with the correct Supabase connection string format.








