# Database Migration Guidance - UserConsent Table

## Current Situation
- Database has existing tables and data (production/staging database)
- Prisma detects "drift" because migrations weren't used to create the database
- Need to add new `user_consents` table safely

## Option 1: Use `prisma db push` (Recommended for Now)
**Safest option if you have production data**

```bash
cd backend
npx prisma db push
```

This will:
- ✅ Apply schema changes (add user_consents table) WITHOUT deleting data
- ✅ Not create migration files (good for syncing with existing manual migrations)
- ✅ Safe for production (only adds new table, doesn't touch existing data)
- ⚠️ Doesn't create migration history (okay since you're using manual SQL migrations)

## Option 2: Create Baseline Migration (For Production History)
If you want proper migration history going forward:

1. First, create a baseline migration that matches current database state:
```bash
cd backend
npx prisma migrate diff \
  --from-empty \
  --to-schema-datamodel prisma/schema.prisma \
  --script > prisma/migrations/0000_baseline/migration.sql
```

2. Mark it as applied (without running it, since DB already has these tables):
```bash
npx prisma migrate resolve --applied 0000_baseline
```

3. Then create the new migration for user_consents:
```bash
npx prisma migrate dev --name add_user_consent
```

## Option 3: Manual SQL Migration (Matches Your Current Approach)
If you prefer to continue using manual SQL migrations (like your existing ones):

1. Generate the SQL for the new table:
```bash
npx prisma migrate diff \
  --from-schema-datamodel prisma/schema.prisma \
  --to-schema-datasource prisma/schema.prisma \
  --script
```

2. Create a file: `backend/prisma/migrations/manual_add_user_consent_table.sql`

3. Run the SQL manually on your database

## Recommendation
**Use Option 1 (`prisma db push`)** because:
- ✅ Safest (no data loss risk)
- ✅ Matches your current workflow (you have manual SQL migrations)
- ✅ Quick and simple
- ✅ Can switch to proper migrations later if needed

## After Adding the Table
After successfully adding the table, regenerate Prisma Client:
```bash
npx prisma generate
```

## Verifying the Table Was Created
```bash
npx prisma studio
```
Or check in your Supabase dashboard - you should see the `user_consents` table.



