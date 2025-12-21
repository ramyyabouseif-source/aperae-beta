-- Migration: Add wine_recommendations table
-- Created: 2025-12-15
-- Purpose: Store individual wine recommendations from API responses

CREATE TABLE IF NOT EXISTS "wine_recommendations" (
    "id" TEXT NOT NULL,
    "request_id" TEXT NOT NULL,
    "dish" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "user_id" TEXT,
    "prompt_version" TEXT NOT NULL,
    "api_response_time_ms" INTEGER NOT NULL,
    "model_used" TEXT NOT NULL,
    
    -- Dish Analysis
    "dominant_weight" TEXT,
    "fat_content" TEXT,
    "primary_protein" TEXT,
    "dominant_flavors" TEXT[],
    "spice_level" TEXT,
    "acidity_level" TEXT,
    "applicable_principles" TEXT[],
    "key_challenge" TEXT,
    
    -- Extracted/Inferred Fields
    "cooking_method" TEXT,
    "cooking_method_impact" TEXT,
    "sauce" TEXT,
    "sauce_characteristic" TEXT,
    "sauce_priority" TEXT,
    "max_abv" DOUBLE PRECISION,
    
    -- Ideal Profile
    "ideal_acidity" TEXT,
    "ideal_acid_type" TEXT,
    "ideal_tannin" TEXT,
    "ideal_body" TEXT,
    "ideal_sweetness" TEXT,
    "ideal_notes" TEXT,
    
    -- Wine Recommendation Data
    "tier_label" TEXT,
    "tier_rationale" TEXT,
    "tier_fallback_applied" BOOLEAN NOT NULL DEFAULT false,
    "wine_name" TEXT,
    "producer" TEXT,
    "region" TEXT,
    "vintage" TEXT,
    "grape" TEXT,
    
    -- Pairing Rationale
    "rationale" TEXT,
    "pairing_principles_applied" TEXT[],
    
    -- Tasting Notes
    "aromas" TEXT[],
    "palate" TEXT,
    "finish" TEXT,
    
    -- Serving Guidance
    "serving_temperature" TEXT,
    "serving_glassware" TEXT,
    "serving_decanting" TEXT,
    
    -- Confidence Scoring
    "confidence_score" INTEGER,
    "confidence_pairing_science" INTEGER,
    "confidence_wine_knowledge" INTEGER,
    "confidence_complexity_handling" INTEGER,
    "confidence_rationale" TEXT,
    
    -- Additional Fields
    "vintage_rationale" TEXT,
    "story" TEXT,
    "expert_rating" TEXT,
    "price_point" TEXT,
    "category" TEXT,
    "retailer_suggestion" TEXT,
    "image_url" TEXT,
    
    -- Full Response Data
    "full_response_json" JSONB,
    
    -- Avoid Data
    "avoid_types" TEXT[],
    "avoid_reason" TEXT,
    
    -- Closing Narrative
    "closing_narrative" TEXT,

    CONSTRAINT "wine_recommendations_pkey" PRIMARY KEY ("id")
);

-- Create indexes
CREATE INDEX IF NOT EXISTS "wine_recommendations_request_id_idx" ON "wine_recommendations"("request_id");
CREATE INDEX IF NOT EXISTS "wine_recommendations_dish_idx" ON "wine_recommendations"("dish");
CREATE INDEX IF NOT EXISTS "wine_recommendations_created_at_idx" ON "wine_recommendations"("created_at");





