# Phase 2 Implementation Plan: Enhanced Logging & Database

## Overview

This document provides step-by-step instructions for implementing Phase 2 components:
1. Enhanced logging for quality evaluation
2. Database schema and automated insertion
3. Field extraction/inference from existing data

---

## Part 1: Supabase Database Setup

### Step 1: Access Supabase SQL Editor

1. **Log into Supabase Dashboard**
   - Go to: https://supabase.com/dashboard
   - Select your project (or create a new one if needed)

2. **Navigate to SQL Editor**
   - In the left sidebar, click **"SQL Editor"**
   - Click **"New query"** button

3. **Verify Database Connection**
   - Your project should show the database URL format:
   - `postgresql://postgres:[YOUR-PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres`

---

### Step 2: Create the Wine Recommendations Table

**Copy and paste this SQL into the SQL Editor:**

```sql
-- Create wine_recommendations table for storing all recommendation data
CREATE TABLE IF NOT EXISTS wine_recommendations (
  -- Primary Key
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Request Metadata
  request_id VARCHAR(255) NOT NULL,
  dish TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  -- User Information (optional - can be NULL for anonymous)
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  
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
  
  -- User Preferences (if provided)
  user_preferences JSONB, -- Store full preferences object as JSON
  
  -- Full Response Data (for debugging/analysis)
  full_response_json JSONB, -- Complete recommendation object as JSON
  
  -- Avoid Data
  avoid_types TEXT[], -- Types to avoid
  avoid_reason TEXT, -- Why to avoid
  
  -- Closing Narrative
  closing_narrative TEXT
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_wine_recommendations_request_id ON wine_recommendations(request_id);
CREATE INDEX IF NOT EXISTS idx_wine_recommendations_dish ON wine_recommendations(dish);
CREATE INDEX IF NOT EXISTS idx_wine_recommendations_created_at ON wine_recommendations(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_wine_recommendations_user_id ON wine_recommendations(user_id);
CREATE INDEX IF NOT EXISTS idx_wine_recommendations_tier_label ON wine_recommendations(tier_label);
CREATE INDEX IF NOT EXISTS idx_wine_recommendations_wine_name ON wine_recommendations(wine_name);
CREATE INDEX IF NOT EXISTS idx_wine_recommendations_confidence_score ON wine_recommendations(confidence_score);

-- Add comment to table
COMMENT ON TABLE wine_recommendations IS 'Stores individual wine recommendations with full analysis data for quality evaluation';
```

4. **Execute the SQL**
   - Click the **"Run"** button (or press Ctrl+Enter / Cmd+Enter)
   - You should see: "Success. No rows returned"

5. **Verify Table Creation**
   - In the left sidebar, click **"Table Editor"**
   - You should see `wine_recommendations` in the list
   - Click on it to view the table structure

---

### Step 3: Set Up Row Level Security (RLS) - Optional but Recommended

**For Security (if you have user authentication):**

```sql
-- Enable RLS on the table
ALTER TABLE wine_recommendations ENABLE ROW LEVEL SECURITY;

-- Policy: Users can only see their own recommendations
CREATE POLICY "Users can view own recommendations"
  ON wine_recommendations
  FOR SELECT
  USING (auth.uid() = user_id OR user_id IS NULL);

-- Policy: Service role can insert/update/delete (for backend)
CREATE POLICY "Service role can manage all recommendations"
  ON wine_recommendations
  FOR ALL
  USING (auth.role() = 'service_role');
```

**Note:** If you want to allow anonymous inserts from your backend, you can skip RLS for now or create a more permissive policy.

---

### Step 4: Get Database Connection String

1. **Go to Project Settings**
   - In left sidebar, click **"Project Settings"** (gear icon)
   - Click **"Database"** tab

2. **Find Connection String**
   - Scroll down to **"Connection string"** section
   - Copy the **"Connection pooling"** string (looks like):
     ```
     postgresql://postgres.[PROJECT-REF]:[PASSWORD]@aws-0-[REGION].pooler.supabase.com:6543/postgres?pgbouncer=true
     ```
   - Or copy the **"URI"** connection string:
     ```
     postgresql://postgres:[PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres
     ```

3. **Add to Your .env File**
   ```bash
   DATABASE_URL=postgresql://postgres:[YOUR-PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres
   # OR use connection pooling:
   # DATABASE_URL=postgresql://postgres.[PROJECT-REF]:[PASSWORD]@aws-0-[REGION].pooler.supabase.com:6543/postgres?pgbouncer=true
   ```

---

## Part 2: Code Implementation

The following files will be created/updated:

1. **Enhanced Logging Service** (`backend/services/recommendationLogger.js`)
2. **Field Extraction Service** (`backend/services/fieldExtractor.js`)
3. **Database Service** (`backend/services/databaseService.js`)
4. **Prisma Schema Update** (`backend/prisma/schema.prisma`)
5. **Server Integration** (`backend/server.js`)

---

## Part 3: Implementation Steps

### Step 1: Install Dependencies

Run this command in your backend directory:

```bash
npm install @prisma/client pg
```

### Step 2: Update Prisma Schema

The Prisma schema will be updated to match the SQL table structure.

### Step 3: Generate Prisma Client

```bash
cd backend
npx prisma generate
```

### Step 4: Create Database Service Files

All service files will be created with comprehensive field extraction logic.

### Step 5: Integrate into Server

The server.js will be updated to automatically insert recommendations after rendering.

---

## Next Steps

After you complete the Supabase setup (Steps 1-4 above), let me know and I'll:

1. Create all the service files
2. Update the Prisma schema
3. Integrate database insertion into server.js
4. Test the implementation

---

## Questions?

Before I create the code files, please confirm:

1. ✅ **Database structure**: One row per recommendation (3 rows per request) - **CONFIRMED**
2. ✅ **User identification**: Store user_id if available, allow NULL for anonymous - **CONFIRMED**
3. ✅ **User preferences**: Store full preferences JSON object - **CONFIRMED**
4. ✅ **Request metadata**: Track requestId, timestamp, response time, prompt version - **CONFIRMED**
5. ✅ **Field extraction**: Derive text for removed fields from existing data - **CONFIRMED**

Ready to proceed with code implementation once Supabase setup is complete!






