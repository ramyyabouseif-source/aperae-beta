-- Migration: Add menu_wines table
-- Created: 2025-12-22
-- Purpose: Store parsed menu wines from OCR before AI recommendations are generated
-- Links to wine_recommendations via request_id

CREATE TABLE IF NOT EXISTS "menu_wines" (
    "id" TEXT NOT NULL,
    "request_id" TEXT NOT NULL,
    "dish" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    
    -- Parsed Wine Data (from OCR)
    "wine_name" TEXT NOT NULL,
    "producer" TEXT,
    "vintage" TEXT,
    "grape" TEXT,
    "region" TEXT,
    "price" TEXT,
    
    -- Additional Metadata
    "category" TEXT,
    "serving_style" TEXT,
    "description" TEXT,
    "ocr_confidence" DOUBLE PRECISION,
    
    -- Full OCR line for debugging/analysis
    "raw_ocr_line" TEXT,
    
    CONSTRAINT "menu_wines_pkey" PRIMARY KEY ("id")
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS "menu_wines_request_id_idx" ON "menu_wines"("request_id");
CREATE INDEX IF NOT EXISTS "menu_wines_dish_idx" ON "menu_wines"("dish");
CREATE INDEX IF NOT EXISTS "menu_wines_created_at_idx" ON "menu_wines"("created_at");
CREATE INDEX IF NOT EXISTS "menu_wines_wine_name_idx" ON "menu_wines"("wine_name");
CREATE INDEX IF NOT EXISTS "menu_wines_producer_idx" ON "menu_wines"("producer");

-- Add comments for documentation
COMMENT ON TABLE "menu_wines" IS 'Stores parsed wine list data from OCR before AI recommendations are generated. Links to wine_recommendations via request_id.';
COMMENT ON COLUMN "menu_wines"."request_id" IS 'Links to the same request_id as wine_recommendations table';
COMMENT ON COLUMN "menu_wines"."price" IS 'Price as extracted from OCR (preserve original format)';
COMMENT ON COLUMN "menu_wines"."raw_ocr_line" IS 'Original OCR line text for debugging/analysis';


