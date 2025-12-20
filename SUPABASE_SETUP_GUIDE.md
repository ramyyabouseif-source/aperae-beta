# Supabase Setup Guide - Step by Step

## Overview

This guide will walk you through setting up the `wine_recommendations` table in your existing Supabase account. We'll create the table, set up indexes, and get your connection string.

---

## Step 1: Access Your Supabase Dashboard

1. **Navigate to Supabase**
   - Go to: https://supabase.com/dashboard
   - Log in with your credentials

2. **Select Your Project**
   - From the project list, select your existing project (or create a new one if needed)
   - You should see your project dashboard

---

## Step 2: Open SQL Editor

1. **Find SQL Editor in Sidebar**
   - Look at the left sidebar menu
   - Find and click on **"SQL Editor"** (usually has a SQL icon `</>` or `{ }`)

2. **Create New Query**
   - Click the **"+ New query"** button (top right, usually green or blue)
   - A new SQL editor tab will open

3. **Name Your Query (Optional but Helpful)**
   - At the top of the query editor, you'll see a text field
   - Enter: `Create Wine Recommendations Table`

---

## Step 3: Create the Wine Recommendations Table

**Copy the entire SQL block below and paste it into the SQL Editor:**

```sql
-- =============================================================================
-- WINE RECOMMENDATIONS TABLE
-- Stores individual wine recommendations with full analysis data
-- One row per recommendation (3 rows per request)
-- =============================================================================

CREATE TABLE IF NOT EXISTS wine_recommendations (
  -- Primary Key
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Request Metadata
  request_id VARCHAR(255) NOT NULL,
  dish TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  -- User Information (NULL for anonymous storage)
  user_id UUID, -- Will link to users table in future, NULL for now
  
  -- Prompt & API Metadata
  prompt_version VARCHAR(50), -- 'v7.0' or 'legacy' or 'enhanced'
  api_response_time_ms INTEGER, -- Time in milliseconds
  model_used VARCHAR(100) DEFAULT 'claude-sonnet-4-5-20250929',
  
  -- Dish Analysis (from dishAnalysis object)
  dominant_weight VARCHAR(50), -- light/medium/medium-heavy/heavy
  fat_content VARCHAR(50), -- none/low/medium/medium-high/high
  primary_protein TEXT, -- type + texture
  dominant_flavors TEXT[], -- Array of flavors
  spice_level VARCHAR(50), -- none/mild/moderate/hot
  acidity_level VARCHAR(50), -- low/medium/medium-high/high
  applicable_principles TEXT[], -- Array of principle names
  key_challenge TEXT, -- Critical pairing constraint
  
  -- Extracted/Inferred Fields (from removed fields)
  cooking_method VARCHAR(100), -- Inferred from primaryProtein
  cooking_method_impact TEXT, -- Derived from cooking method
  sauce VARCHAR(100), -- Inferred from dominantFlavors/fatContent
  sauce_characteristic VARCHAR(100), -- Inferred from dominantFlavors
  sauce_priority TEXT, -- Inferred from dominantFlavors/fatContent
  max_abv VARCHAR(20), -- Only if spiceLevel is 'hot', else NULL
  
  -- Ideal Profile (from idealProfile object)
  ideal_acidity VARCHAR(50),
  ideal_acid_type VARCHAR(50), -- malic/tartaric/balanced
  ideal_tannin VARCHAR(50),
  ideal_body VARCHAR(50),
  ideal_sweetness VARCHAR(50),
  ideal_notes TEXT,
  
  -- Wine Recommendation Data (one row per recommendation)
  tier_label VARCHAR(100), -- Premium Selection / Moderate Choice / Budget-Friendly
  tier_rationale TEXT, -- Extracted if available, otherwise inferred
  tier_fallback_applied BOOLEAN DEFAULT FALSE, -- Inferred from tier classification
  wine_name TEXT,
  producer TEXT,
  region TEXT,
  vintage VARCHAR(50), -- Can be YYYY, NV, YYYY-YYYY, or unknown
  grape TEXT, -- e.g., "Cabernet Sauvignon (Red)"
  
  -- Pairing Rationale
  rationale TEXT, -- Main pairing explanation
  pairing_principles_applied TEXT[], -- Array of principle names
  
  -- Tasting Notes
  aromas TEXT[], -- Array of aroma descriptors
  palate TEXT, -- Palate description
  finish TEXT, -- Finish description
  
  -- Serving Guidance
  serving_temperature TEXT, -- e.g., "58-62°F (14-17°C)"
  serving_glassware TEXT, -- e.g., "Bordeaux glass"
  serving_decanting TEXT, -- e.g., "Decant 30 minutes" or "No decant needed"
  
  -- Confidence Scoring
  confidence_score INTEGER, -- 0-100
  confidence_pairing_science INTEGER, -- 0-50
  confidence_wine_knowledge INTEGER, -- 0-30
  confidence_complexity_handling INTEGER, -- 0-20
  confidence_rationale TEXT, -- Scoring breakdown explanation
  
  -- Vintage Rationale (extracted/inferred)
  vintage_rationale TEXT, -- Why vintage is optimal (extracted from rationale or inferred)
  
  -- Additional Fields
  story TEXT, -- Brief storytelling element
  expert_rating TEXT, -- e.g., "95 - Wine Spectator"
  price_point TEXT, -- e.g., "$65"
  category VARCHAR(100), -- Sparkling/White Wine/Red Wine/Rosé/Dessert
  retailer_suggestion TEXT,
  image_url TEXT,
  
  -- Full Response Data (for debugging/analysis)
  full_response_json JSONB, -- Complete recommendation object as JSON
  
  -- Avoid Data
  avoid_types TEXT[], -- Types to avoid
  avoid_reason TEXT, -- Why to avoid
  
  -- Closing Narrative
  closing_narrative TEXT
);

-- =============================================================================
-- CREATE INDEXES FOR PERFORMANCE
-- =============================================================================

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

-- =============================================================================
-- ADD TABLE COMMENT
-- =============================================================================

COMMENT ON TABLE wine_recommendations IS 
  'Stores individual wine recommendations with full analysis data for quality evaluation. One row per recommendation.';
```

4. **Review the SQL**
   - Make sure the entire SQL block is pasted correctly
   - Check that there are no syntax errors (SQL Editor should highlight errors in red)

5. **Execute the Query**
   - Click the **"Run"** button (usually green, bottom right)
   - OR press **Ctrl+Enter** (Windows) or **Cmd+Enter** (Mac)
   - You should see a success message: "Success. No rows returned"

---

## Step 4: Verify Table Creation

1. **Open Table Editor**
   - In the left sidebar, find and click **"Table Editor"** (usually has a table icon)

2. **Find Your Table**
   - Scroll through the list of tables
   - You should see **`wine_recommendations`** in the list
   - Click on it to view the table structure

3. **Verify Columns**
   - You should see all the columns we created
   - Scroll down to verify they're all there (there are many columns!)

---

## Step 5: Get Your Database Connection String

1. **Navigate to Project Settings**
   - In the left sidebar, click on **"Project Settings"** (gear icon ⚙️)
   - OR click your project name at the top and select "Settings"

2. **Go to Database Section**
   - In the settings menu, click **"Database"** (in the left sidebar of settings)
   - You'll see several database-related options

3. **Find Connection String**
   - Scroll down to find the **"Connection string"** or **"Connection pooler"** section
   - You'll see multiple connection string formats

4. **Copy the Connection String**
   
   **Option A: Connection Pooling (Recommended for Production)**
   - Look for **"Connection pooling"** section
   - Copy the URI that looks like:
     ```
     postgresql://postgres.[PROJECT-REF]:[PASSWORD]@aws-0-[REGION].pooler.supabase.com:6543/postgres?pgbouncer=true
     ```
   - Click the **copy icon** or **"Copy"** button next to it

   **Option B: Direct Connection (For Development)**
   - Look for **"Connection string"** section
   - Copy the URI that looks like:
     ```
     postgresql://postgres:[PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres
     ```
   - You may need to replace `[YOUR-PASSWORD]` with your actual database password

5. **Save Your Connection String**
   - Copy the connection string you prefer
   - You'll need this for your `.env` file

---

## Step 6: Get Your Database Password (If Needed)

If your connection string has `[YOUR-PASSWORD]` placeholder:

1. **Still in Database Settings**
   - Look for **"Database password"** section
   - You may see a masked password or an option to reset it

2. **If You Need to Reset Password**
   - Click **"Reset database password"** button
   - Enter a new secure password
   - **Save this password** - you'll need it for the connection string

3. **Replace in Connection String**
   - Replace `[YOUR-PASSWORD]` with your actual password
   - Make sure to URL-encode special characters if needed

---

## Step 7: Update Your .env File

1. **Open Your `.env` File**
   - Navigate to your project root directory
   - Open the `.env` file (or create it if it doesn't exist)

2. **Add Database Connection**
   
   Add this line to your `.env` file:
   
   ```bash
   DATABASE_URL=postgresql://postgres:[YOUR-PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres
   ```
   
   OR if using connection pooling:
   
   ```bash
   DATABASE_URL=postgresql://postgres.[PROJECT-REF]:[PASSWORD]@aws-0-[REGION].pooler.supabase.com:6543/postgres?pgbouncer=true
   ```
   
   **Important:** Replace `[YOUR-PASSWORD]`, `[PROJECT-REF]`, and `[REGION]` with your actual values from Step 5.

3. **Example of Final Connection String**
   
   Your final `.env` entry should look something like:
   
   ```bash
   DATABASE_URL=postgresql://postgres:MySecurePassword123!@db.abcdefghijklmnop.supabase.co:5432/postgres
   ```

4. **Save the .env File**
   - Make sure to save your changes
   - **Never commit** `.env` to version control (it should be in `.gitignore`)

---

## Step 8: Verify Connection (Optional Test)

You can verify your connection string works by running this in your terminal:

```bash
# Test connection (if you have psql installed)
psql "postgresql://postgres:[PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres" -c "SELECT version();"
```

Or wait until we set up the code - we'll test it then!

---

## Step 9: Optional - Enable Row Level Security (Future-Proofing)

Since you mentioned tracking users in the future, you may want to set up RLS now:

1. **Go Back to SQL Editor**
   - Click **"SQL Editor"** in the sidebar
   - Create a new query

2. **Run This SQL:**

```sql
-- Enable Row Level Security (for future user authentication)
ALTER TABLE wine_recommendations ENABLE ROW LEVEL SECURITY;

-- Policy: Allow anonymous inserts (for now, since we're storing anonymously)
CREATE POLICY "Allow anonymous inserts"
  ON wine_recommendations
  FOR INSERT
  WITH CHECK (true);

-- Policy: Allow service role to do everything (for backend operations)
CREATE POLICY "Service role full access"
  ON wine_recommendations
  FOR ALL
  USING (auth.role() = 'service_role');
```

**Note:** For now, this is optional since you're storing anonymously. You can skip this step if you prefer.

---

## Troubleshooting

### Issue: "Table already exists"
- **Solution:** The `IF NOT EXISTS` clause should prevent this, but if you see an error, you can:
  - Drop the table first: `DROP TABLE IF EXISTS wine_recommendations;`
  - Then run the CREATE TABLE statement again

### Issue: "Permission denied"
- **Solution:** Make sure you're using the correct database user with CREATE privileges
- You should be using the `postgres` superuser by default

### Issue: "Connection string not working"
- **Solution:** 
  - Double-check your password is correct
  - Make sure special characters in password are URL-encoded
  - Try the connection pooling string instead
  - Verify your project is active (not paused)

### Issue: "Cannot find SQL Editor"
- **Solution:**
  - Look in the left sidebar - it might be under a different name
  - Try looking for "Database" → "SQL Editor"
  - Make sure you have the right permissions in your Supabase project

---

## Next Steps

Once you've completed all steps above:

1. ✅ Table created
2. ✅ Indexes set up
3. ✅ Connection string copied to `.env`
4. ✅ Verification complete

**Let me know when you're done!** I'll then create all the code files:
- Enhanced logging service
- Field extraction service
- Database service
- Server integration
- Prisma schema update

---

## Summary Checklist

- [ ] Step 1: Accessed Supabase Dashboard
- [ ] Step 2: Opened SQL Editor
- [ ] Step 3: Created table with SQL (executed successfully)
- [ ] Step 4: Verified table in Table Editor
- [ ] Step 5: Got database connection string
- [ ] Step 6: Got/reset database password (if needed)
- [ ] Step 7: Updated `.env` file with `DATABASE_URL`
- [ ] Step 8: (Optional) Tested connection
- [ ] Step 9: (Optional) Set up RLS policies

Once you check all boxes, we're ready for code implementation! 🚀










