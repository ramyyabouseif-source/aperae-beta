# Fix: UserConsent Schema Column Mapping

## Problem
The `user_consents` table was created with snake_case column names (`user_id`, `device_id_hash`, `consent_type`, etc.), but the Prisma schema was missing `@map()` directives to map camelCase field names to these snake_case columns.

**Error from logs:**
```
Invalid `prisma.userConsent.create()` invocation:
The column `userId` does not exist in the current database.
```

## Root Cause
- SQL migration created columns in snake_case (standard PostgreSQL practice)
- Prisma schema used camelCase field names without `@map()` directives
- Prisma Client was looking for camelCase columns that don't exist

## Solution
Added `@map()` directives to the Prisma schema to map camelCase fields to snake_case columns:

```prisma
model UserConsent {
  id String @id @default(uuid())

  userId       String? @db.Uuid @map("user_id")
  deviceIdHash String? @map("device_id_hash")
  consentType  String  @map("consent_type")
  accepted     Boolean
  version      String?
  acceptedAt   DateTime  @default(now()) @map("accepted_at")
  anonymizedAt DateTime? @map("anonymized_at")

  user User? @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@index([userId])
  @@index([deviceIdHash])
  @@index([consentType])
  @@index([acceptedAt])
  @@map("user_consents")
}
```

## Deployment Steps

### 1. Regenerate Prisma Client (Local)
```bash
cd backend
npx prisma generate
```

### 2. Deploy to Production
- Commit and push the schema change
- Render will automatically regenerate Prisma Client during build (if build command includes `npx prisma generate`)
- Or manually regenerate on production if needed

### 3. Verify
```powershell
.\backend\TEST_CONSENT_ENDPOINT.ps1
```

Should now return success instead of 500 error.

## Database Schema (Already Correct)
The database table structure is correct - no changes needed:
- `user_id` UUID (nullable)
- `device_id_hash` TEXT (nullable)
- `consent_type` TEXT (NOT NULL)
- `accepted` BOOLEAN (NOT NULL)
- `version` TEXT (nullable)
- `accepted_at` TIMESTAMP (NOT NULL)
- `anonymized_at` TIMESTAMP (nullable)

## Files Changed
- `backend/prisma/schema.prisma` - Added `@map()` directives to UserConsent model

