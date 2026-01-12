-- Migration: Single Point of Consent Approach
-- This migration updates the user_consents table to support a single consent record
-- that covers age verification, terms acceptance, and privacy policy acceptance
-- all from the AgeVerificationScreen

-- =============================================================================
-- STEP 1: Add JSONB column to store consent details (if needed)
-- =============================================================================
-- This column will store structured data about the three consents
-- Example: {"age_verification": true, "terms": true, "privacy_policy": true, "terms_version": "1.0", "privacy_version": "1.0"}

ALTER TABLE "user_consents" 
ADD COLUMN IF NOT EXISTS "consent_data" JSONB;

-- =============================================================================
-- STEP 2: Add index on consent_data for querying (optional, for performance)
-- =============================================================================
CREATE INDEX IF NOT EXISTS "user_consents_consent_data_idx" ON "user_consents" USING GIN ("consent_data");

-- =============================================================================
-- STEP 3: Optional - Add a batch_id column to link related consent records
-- =============================================================================
-- This allows you to track when multiple consents were given together
-- (useful if you want to keep individual records but link them)
-- ALTER TABLE "user_consents" ADD COLUMN IF NOT EXISTS "batch_id" TEXT;
-- CREATE INDEX IF NOT EXISTS "user_consents_batch_id_idx" ON "user_consents"("batch_id");

-- =============================================================================
-- NOTES:
-- =============================================================================
-- Option 1: Single Record Approach (Recommended)
--   - Store ONE record with consentType = 'single_point_consent'
--   - Store all three consents in consent_data JSONB field
--   - Example consent_data: {"age_verification": true, "terms": true, "privacy_policy": true, "terms_version": "1.0", "privacy_version": "1.0"}
--
-- Option 2: Three Linked Records Approach
--   - Keep three separate records (one for each consent type)
--   - Use batch_id to link them together
--   - Maintains individual consent tracking but shows they were given together
--
-- Recommendation: Use Option 1 for simplicity and clarity
-- The consent_data JSONB field can store:
-- {
--   "age_verification": true,
--   "terms": true,
--   "privacy_policy": true,
--   "terms_version": "1.0",
--   "privacy_version": "1.0",
--   "accepted_together": true,
--   "source": "age_verification_screen"
-- }
--
-- =============================================================================
-- EXAMPLE QUERIES:
-- =============================================================================
-- Check if user has given single point consent:
-- SELECT * FROM user_consents 
-- WHERE consent_type = 'single_point_consent' 
--   AND user_id = 'user-uuid-here' 
--   AND accepted = true
--   AND consent_data->>'age_verification' = 'true'
--   AND consent_data->>'terms' = 'true'
--   AND consent_data->>'privacy_policy' = 'true';
--
-- Get consent details:
-- SELECT consent_data FROM user_consents 
-- WHERE consent_type = 'single_point_consent' 
--   AND user_id = 'user-uuid-here' 
--   AND accepted = true
-- ORDER BY accepted_at DESC LIMIT 1;

