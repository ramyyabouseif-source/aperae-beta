-- =============================================================================
-- DISH RECOMMENDATIONS TABLE
-- Stores individual dish recommendations with full wine analysis data
-- One row per recommendation (3 rows per request - Complex/Moderate/Simple)
-- =============================================================================

CREATE TABLE IF NOT EXISTS dish_recommendations (
  -- Primary Key
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Request Metadata
  request_id VARCHAR(255) NOT NULL,
  wine TEXT NOT NULL, -- The wine input (e.g., "2016 Clos de Oro Malbec Reserva")
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  -- User Information (NULL for anonymous storage)
  user_id UUID, -- Will link to users table in future, NULL for now
  
  -- Prompt & API Metadata
  prompt_version VARCHAR(50), -- 'master-chef-v1.0' or future versions
  api_response_time_ms INTEGER, -- Time in milliseconds
  model_used VARCHAR(100) DEFAULT 'claude-sonnet-4-5-20250929',
  
  -- Wine Analysis (from wineAnalysis object)
  wine_producer VARCHAR(255), -- 'unknown' if not available
  wine_region VARCHAR(255), -- 'unknown' if not available
  wine_vintage VARCHAR(50), -- YYYY or NV or 'unknown'
  wine_vintage_age VARCHAR(50), -- e.g., "9 years" or 'unknown'
  wine_color VARCHAR(50), -- red/white/rosé/sparkling/fortified
  
  -- Wine Structure
  wine_body VARCHAR(50), -- light/light-medium/medium/medium-full/full
  wine_acidity VARCHAR(50), -- low/medium/medium-high/high
  wine_acid_type VARCHAR(50), -- malic/tartaric/balanced
  wine_tannin VARCHAR(50), -- none/low/low-medium/medium/medium-high/high
  wine_tannin_character VARCHAR(50), -- soft/silky/fine-grained/polished/firm/structured/grippy
  wine_sweetness VARCHAR(50), -- dry/off-dry/sweet
  wine_abv VARCHAR(20), -- e.g., "14.5%"
  
  -- Wine Aromatic Profile
  wine_primary_aromas TEXT[], -- Array of primary aroma descriptors
  wine_secondary_aromas TEXT[], -- Array of secondary aromas (oak, toast, etc.)
  wine_tertiary_aromas TEXT[], -- Array of tertiary aromas (earthy, forest floor, etc.)
  wine_dominant_compounds TEXT[], -- Array of compound names
  
  -- Wine Analysis Summary
  wine_key_strength TEXT, -- What wine does best (2-3 sentences)
  wine_ideal_dish_profile TEXT, -- Required dish characteristics (2-3 sentences)
  
  -- Wine Serving Guidance
  serving_temperature TEXT, -- e.g., "58-62°F (14-17°C)"
  serving_glassware TEXT, -- e.g., "Bordeaux or Universal red wine glass"
  serving_decanting TEXT, -- e.g., "30 minutes recommended" or "No decant needed"
  
  -- Dish Recommendation Data (one row per recommendation)
  complexity_label VARCHAR(100), -- Complex Pairing / Moderate Pairing / Simple Pairing
  dish_name TEXT,
  pairing_rationale TEXT, -- 2-3 sentences: strategy, principles, bridge, wine characteristic
  pairing_principles_applied TEXT[], -- Array of principle names
  
  -- Recipe Ingredients
  ingredients_protein TEXT[], -- Array of protein ingredients with quantities
  ingredients_sauce TEXT[], -- Array of sauce ingredients with quantities (nullable)
  ingredients_sides TEXT[], -- Array of side dish ingredients with quantities (nullable)
  
  -- Recipe Steps
  recipe_steps TEXT[], -- Array of numbered recipe steps
  
  -- Cook Time
  cook_time_prep VARCHAR(50), -- e.g., "15 minutes"
  cook_time_cook VARCHAR(50), -- e.g., "45 minutes"
  cook_time_total VARCHAR(50), -- e.g., "60 minutes"
  
  -- Serving Suggestion
  serving_suggestion TEXT, -- Optional plating/garnish guidance
  
  -- Confidence Scoring
  confidence_score INTEGER, -- 0-100 (must be ≥85)
  confidence_pairing_science INTEGER, -- 0-50
  confidence_wine_knowledge INTEGER, -- 0-30
  confidence_recipe_quality INTEGER, -- 0-20
  confidence_rationale TEXT, -- Scoring breakdown explanation (2-3 sentences)
  
  -- Full Response Data (for debugging/analysis)
  full_response_json JSONB -- Complete recommendation object as JSON
);

-- =============================================================================
-- CREATE INDEXES FOR PERFORMANCE
-- =============================================================================

CREATE INDEX IF NOT EXISTS idx_dish_recommendations_request_id 
  ON dish_recommendations(request_id);

CREATE INDEX IF NOT EXISTS idx_dish_recommendations_wine 
  ON dish_recommendations(wine);

CREATE INDEX IF NOT EXISTS idx_dish_recommendations_created_at 
  ON dish_recommendations(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_dish_recommendations_complexity_label 
  ON dish_recommendations(complexity_label);

CREATE INDEX IF NOT EXISTS idx_dish_recommendations_dish_name 
  ON dish_recommendations(dish_name);

CREATE INDEX IF NOT EXISTS idx_dish_recommendations_confidence_score 
  ON dish_recommendations(confidence_score);

CREATE INDEX IF NOT EXISTS idx_dish_recommendations_wine_producer 
  ON dish_recommendations(wine_producer);

CREATE INDEX IF NOT EXISTS idx_dish_recommendations_wine_region 
  ON dish_recommendations(wine_region);

-- =============================================================================
-- ADD TABLE COMMENT
-- =============================================================================

COMMENT ON TABLE dish_recommendations IS 
  'Stores individual dish recommendations with full wine analysis data for quality evaluation. One row per recommendation (3 rows per request: Complex, Moderate, Simple).';










