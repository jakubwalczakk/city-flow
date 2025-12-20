-- Migration to handle any existing travel_pace values if the enum was changed
-- This migration ensures backward compatibility

-- Note: The travel_pace_enum was defined with values: 'slow', 'moderate', 'intensive'
-- If there were any old values like 'relaxed' or 'fast', this migration would handle them.
-- However, based on the schema, the enum was always 'slow', 'moderate', 'intensive'.

-- This is a safety migration in case any data was manually inserted with incorrect values.
-- Since PostgreSQL enforces enum constraints strictly, any incorrect values would have
-- already caused errors. This migration serves as documentation.

-- Verify all travel_pace values are valid
DO $$
BEGIN
  -- Check if there are any NULL values (which are allowed)
  IF EXISTS (
    SELECT 1 FROM profiles 
    WHERE travel_pace IS NOT NULL 
    AND travel_pace::text NOT IN ('slow', 'moderate', 'intensive')
  ) THEN
    RAISE EXCEPTION 'Found invalid travel_pace values in profiles table. Please correct them manually.';
  END IF;
  
  RAISE NOTICE 'All travel_pace values are valid or NULL.';
END $$;

-- Add comment for clarity
COMMENT ON COLUMN profiles.travel_pace IS 'Preferred travel pace: slow (relaxed pace), moderate (balanced), or intensive (fast-paced)';
