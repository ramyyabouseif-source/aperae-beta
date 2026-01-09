# Steps to Add user_consents Table Safely

## ⚠️ DO NOT use `prisma migrate dev` or `prisma db push` 
These commands will try to modify/drop existing tables and cause data loss!

## ✅ Recommended Approach: Manual SQL Migration

Since your database uses manual SQL migrations (like `manual_add_wine_recommendations.sql`), follow the same pattern:

### Step 1: Run the SQL Migration

**Option A: Supabase Dashboard (Easiest)**
1. Open your Supabase dashboard: https://supabase.com/dashboard
2. Navigate to your project
3. Go to **SQL Editor**
4. Copy the contents of `backend/prisma/migrations/manual_add_user_consent_table.sql`
5. Paste and run the SQL

**Option B: Command Line (if you have psql)**
```bash
psql "your-database-connection-string" -f backend/prisma/migrations/manual_add_user_consent_table.sql
```

### Step 2: Verify Table Was Created

Check in Supabase dashboard → Table Editor, or run:
```sql
SELECT * FROM user_consents LIMIT 1;
```

### Step 3: Regenerate Prisma Client

After the table is created, regenerate Prisma Client:
```bash
cd backend
npx prisma generate
```

### Step 4: Test the Implementation

The consent storage system should now work:
- Age verification consent will be stored
- Terms acceptance will be stored  
- Privacy policy acceptance will be stored
- All with privacy-compliant pseudonymization

## What the Migration Does

- Creates `user_consents` table with privacy-compliant fields
- Adds indexes for efficient queries
- Adds foreign key to `users` table (optional - only if user is logged in)
- Safe - only adds new table, doesn't modify existing data

## If You Need to Rollback

To remove the table (if needed):
```sql
DROP TABLE IF EXISTS "user_consents" CASCADE;
```



