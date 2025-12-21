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












