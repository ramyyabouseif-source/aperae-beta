# Database Migration Instructions: Add WineRecommendation Table

**Date:** December 15, 2025  
**Purpose:** Create the `wine_recommendations` table to store individual wine recommendations

---

## ✅ **Changes Made**

1. ✅ **Added `WineRecommendation` model** to `backend/prisma/schema.prisma`
2. ✅ **Refactored storage service** to use Prisma instead of raw SQL (fixes array insertion issues)

---

## 🚀 **Migration Steps**

### **Step 1: Generate Prisma Client**

Generate the Prisma client with the new model:

```bash
cd backend
npx prisma generate
```

**Expected output:**
```
✔ Generated Prisma Client (X.XX.XX)
```

---

### **Step 2: Create and Apply Migration**

Create a new migration for the `WineRecommendation` table:

```bash
npx prisma migrate dev --name add_wine_recommendations_table
```

**What this does:**
- Creates a migration file in `backend/prisma/migrations/`
- Applies the migration to your database
- Generates the Prisma client

**Expected output:**
```
✔ The following migration(s) have been created and applied from new schema changes:

migrations/
  └─ YYYYMMDDHHMMSS_add_wine_recommendations_table/
    └─ migration.sql

✔ Generated Prisma Client (X.XX.XX)
```

---

### **Step 3: Verify Table Creation**

#### **Option A: Using Prisma Studio (Visual)**

```bash
npx prisma studio
```

This opens a browser interface where you can:
- See the new `WineRecommendation` table
- View/query data
- Verify structure

#### **Option B: Using SQL Query**

Connect to your Supabase database and run:

```sql
-- Check if table exists
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
  AND table_name = 'wine_recommendations';

-- View table structure
\d wine_recommendations

-- Or using SQL
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'wine_recommendations'
ORDER BY ordinal_position;
```

#### **Option C: Using Prisma Query**

Create a test script or use Node.js REPL:

```javascript
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Count records (should be 0 initially)
prisma.wineRecommendation.count().then(count => {
  console.log(`WineRecommendation records: ${count}`);
});
```

---

### **Step 4: Deploy to Production (Render)**

If you're running locally, skip this. For production:

1. **Commit changes:**
   ```bash
   git add backend/prisma/schema.prisma
   git add backend/services/wineRecommendationDatabaseService.js
   git commit -m "Add WineRecommendation table and fix storage service"
   git push
   ```

2. **Run migration on Render:**
   - Go to Render Dashboard
   - Open your service
   - Go to "Shell" or use "Manual Deploy"
   - Run: `cd backend && npx prisma migrate deploy`
   - Or add to your build command: `npx prisma generate && npx prisma migrate deploy`

**Note:** For production, use `prisma migrate deploy` (not `migrate dev`) to apply migrations without creating new ones.

---

## ✅ **Verification Checklist**

After migration:

- [ ] Prisma client generated successfully
- [ ] Migration file created in `backend/prisma/migrations/`
- [ ] `wine_recommendations` table exists in database
- [ ] Table has all expected columns (check with `\d wine_recommendations`)
- [ ] No errors in Prisma Studio or SQL queries
- [ ] Code changes deployed (if applicable)

---

## 🧪 **Test Recommendation Storage**

After migration, test that recommendations are being stored:

### **1. Make a Test Request**

```powershell
$body = @{
    dish = "Grilled Salmon"
} | ConvertTo-Json

Invoke-RestMethod -Method Post -Uri "https://api.aperae.com/api/recommendations" `
    -ContentType "application/json" `
    -Body $body
```

### **2. Check Render Logs**

Look for:
- ✅ `"Database inserts completed"` with `insertedCount: 3`
- ✅ **NO** `"Failed to insert individual recommendation"` errors

### **3. Verify Database Records**

```sql
-- Count total recommendations
SELECT COUNT(*) FROM wine_recommendations;

-- View latest recommendations
SELECT 
  request_id,
  dish,
  wine_name,
  producer,
  tier_label,
  confidence_score,
  created_at
FROM wine_recommendations
ORDER BY created_at DESC
LIMIT 10;

-- Check array fields are stored correctly
SELECT 
  wine_name,
  dominant_flavors,
  applicable_principles,
  aromas,
  pairing_principles_applied
FROM wine_recommendations
LIMIT 3;
```

**Expected:**
- Count > 0 (3 records per test request)
- All fields populated correctly
- Array fields show as PostgreSQL arrays (not JSON strings)

---

## 🔧 **Troubleshooting**

### **Error: "Table does not exist"**

**Cause:** Migration didn't run or failed

**Fix:**
```bash
# Check migration status
npx prisma migrate status

# Apply pending migrations
npx prisma migrate deploy
```

---

### **Error: "Column does not exist"**

**Cause:** Schema mismatch

**Fix:**
```bash
# Reset database (⚠️ WARNING: Deletes all data)
npx prisma migrate reset

# Or create a new migration
npx prisma migrate dev --name fix_schema
```

---

### **Error: "Array type mismatch"**

**Cause:** Old raw SQL code still in use

**Fix:**
- ✅ Already fixed - code now uses Prisma which handles arrays automatically
- Verify you're using the updated `wineRecommendationDatabaseService.js`

---

### **Error: "Connection refused" or "DATABASE_URL not set"**

**Cause:** Database connection issue

**Fix:**
1. Check `DATABASE_URL` environment variable is set
2. Verify connection string format (should include `?pgbouncer=true&connection_limit=5` for Neon)
3. Test connection: `npx prisma db pull` (should succeed)

---

## 📊 **Expected Table Structure**

The `wine_recommendations` table should have:

- **Primary Key:** `id` (UUID)
- **Indexes:** `request_id`, `dish`, `created_at`
- **Array Columns:** `dominant_flavors`, `applicable_principles`, `pairing_principles_applied`, `aromas`, `avoid_types` (all `text[]`)
- **JSON Column:** `full_response_json` (JSONB)
- **Text Columns:** Many string fields, some with `@db.Text` for long content
- **Numeric Columns:** `api_response_time_ms`, confidence scores, `max_abv`

---

## 🎯 **Success Criteria**

✅ Migration completed successfully  
✅ Table exists in database  
✅ Test request creates 3 records  
✅ No errors in logs  
✅ Array fields stored correctly  
✅ All data visible in queries  

---

**Status:** Ready to migrate! Follow steps 1-4 above.







