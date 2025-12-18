# How to Verify Indexes in Supabase

## Method 1: SQL Query (Easiest & Most Reliable)

1. **Go to SQL Editor**
   - In left sidebar, click **"SQL Editor"**
   - Click **"+ New query"**

2. **Run This Query:**

```sql
SELECT 
  indexname,
  indexdef
FROM 
  pg_indexes
WHERE 
  tablename = 'wine_recommendations'
ORDER BY 
  indexname;
```

3. **Expected Result:**
   You should see **7 rows** (6 custom indexes + 1 primary key index):
   - `idx_wine_recommendations_confidence_score`
   - `idx_wine_recommendations_created_at`
   - `idx_wine_recommendations_dish`
   - `idx_wine_recommendations_request_id`
   - `idx_wine_recommendations_tier_label`
   - `idx_wine_recommendations_wine_name`
   - `wine_recommendations_pkey` (primary key index - automatically created)

---

## Method 2: Table Editor View

1. **Go to Table Editor**
   - In left sidebar, click **"Table Editor"**
   - Click on **`wine_recommendations`** table

2. **View Indexes**
   - Look for an **"Indexes"** tab or section
   - Some Supabase versions show indexes in a separate tab
   - You may need to scroll down past the columns

**Note:** This method may not always show all indexes clearly, so Method 1 is more reliable.

---

## Method 3: Database Structure Query

Run this more detailed query to see all index information:

```sql
SELECT 
  i.relname AS index_name,
  a.attname AS column_name,
  ix.indisunique AS is_unique,
  ix.indisprimary AS is_primary
FROM 
  pg_class t,
  pg_class i,
  pg_index ix,
  pg_attribute a
WHERE 
  t.oid = ix.indrelid
  AND i.oid = ix.indexrelid
  AND a.attrelid = t.oid
  AND a.attnum = ANY(ix.indkey)
  AND t.relkind = 'r'
  AND t.relname = 'wine_recommendations'
ORDER BY 
  i.relname, a.attnum;
```

This shows which columns each index covers.

---

## Quick Verification Query

To quickly count how many indexes you have:

```sql
SELECT COUNT(*) AS total_indexes
FROM pg_indexes
WHERE tablename = 'wine_recommendations';
```

**Expected:** Should return `7` (6 custom + 1 primary key)

---

## If Indexes Are Missing

If you don't see all 6 indexes, you can create them individually:

```sql
-- Run each one separately if needed

CREATE INDEX IF NOT EXISTS idx_wine_recommendations_request_id 
  ON wine_recommendations(request_id);

CREATE INDEX IF NOT EXISTS idx_wine_recommendations_dish 
  ON wine_recommendations(dish);

CREATE INDEX IF NOT EXISTS idx_wine_recommendations_created_at 
  ON wine_recommendations(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_wine_recommendations_tier_label 
  ON wine_recommendations(tier_label);

CREATE INDEX IF NOT EXISTS idx_wine_recommendations_wine_name 
  ON wine_recommendations(wine_name);

CREATE INDEX IF NOT EXISTS idx_wine_recommendations_confidence_score 
  ON wine_recommendations(confidence_score);
```

---

## Expected Index List

You should see these 7 indexes total:

1. ✅ `wine_recommendations_pkey` - Primary key (auto-created)
2. ✅ `idx_wine_recommendations_confidence_score` - On confidence_score
3. ✅ `idx_wine_recommendations_created_at` - On created_at DESC
4. ✅ `idx_wine_recommendations_dish` - On dish
5. ✅ `idx_wine_recommendations_request_id` - On request_id
6. ✅ `idx_wine_recommendations_tier_label` - On tier_label
7. ✅ `idx_wine_recommendations_wine_name` - On wine_name

---

**Use Method 1 (SQL Query) for the most reliable verification!**









