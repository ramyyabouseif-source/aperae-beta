-- Create user_preferences table if it doesn't exist
-- This table stores user preferences as JSON

CREATE TABLE IF NOT EXISTS user_preferences (
  user_id UUID PRIMARY KEY,
  data_json JSONB NOT NULL DEFAULT '{}',
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  -- Foreign key constraint
  CONSTRAINT fk_user_preferences_user FOREIGN KEY (user_id) 
    REFERENCES users(id) ON DELETE CASCADE
);

-- Add comment
COMMENT ON TABLE user_preferences IS 'Stores user preferences as JSON data';

