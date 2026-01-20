-- Manual migration: Add user_consents table
-- Run this SQL directly on your database to add the UserConsent model
-- This follows the same pattern as your existing manual migrations

-- Create user_consents table
CREATE TABLE IF NOT EXISTS "user_consents" (
    "id" TEXT NOT NULL,
    "user_id" UUID,
    "device_id_hash" TEXT,
    "consent_type" TEXT NOT NULL,
    "accepted" BOOLEAN NOT NULL,
    "version" TEXT,
    "accepted_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "anonymized_at" TIMESTAMP(3),

    CONSTRAINT "user_consents_pkey" PRIMARY KEY ("id")
);

-- Create indexes
CREATE INDEX IF NOT EXISTS "user_consents_user_id_idx" ON "user_consents"("user_id");
CREATE INDEX IF NOT EXISTS "user_consents_device_id_hash_idx" ON "user_consents"("device_id_hash");
CREATE INDEX IF NOT EXISTS "user_consents_consent_type_idx" ON "user_consents"("consent_type");
CREATE INDEX IF NOT EXISTS "user_consents_accepted_at_idx" ON "user_consents"("accepted_at");

-- Add foreign key constraint
ALTER TABLE "user_consents" ADD CONSTRAINT "user_consents_user_id_fkey" 
    FOREIGN KEY ("user_id") REFERENCES "users"("id") 
    ON DELETE CASCADE ON UPDATE CASCADE;




