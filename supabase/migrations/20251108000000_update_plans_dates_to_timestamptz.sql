/*
 * Migration: Update plans table date columns to TIMESTAMPTZ and make them required
 * 
 * Purpose: Change start_date and end_date from DATE to TIMESTAMPTZ to support both date and time,
 *          and make these fields NOT NULL as they are now required for plan generation.
 * 
 * Tables affected: plans (modified)
 * 
 * Special notes:
 * - Converts existing DATE values to TIMESTAMPTZ (preserving dates, setting time to midnight UTC)
 * - Makes start_date and end_date NOT NULL
 * - Updates the CHECK constraint to work with TIMESTAMPTZ
 */

-- Drop the existing check constraint
ALTER TABLE plans DROP CONSTRAINT IF EXISTS plans_end_date_check;

-- Convert start_date from DATE to TIMESTAMPTZ
-- Existing NULL values will remain NULL temporarily, then we'll handle them
ALTER TABLE plans 
  ALTER COLUMN start_date TYPE TIMESTAMPTZ 
  USING CASE 
    WHEN start_date IS NULL THEN NULL 
    ELSE start_date::TIMESTAMPTZ 
  END;

-- Convert end_date from DATE to TIMESTAMPTZ
ALTER TABLE plans 
  ALTER COLUMN end_date TYPE TIMESTAMPTZ 
  USING CASE 
    WHEN end_date IS NULL THEN NULL 
    ELSE end_date::TIMESTAMPTZ 
  END;

-- For any existing plans with NULL dates, set default values
-- This ensures we can make the columns NOT NULL
UPDATE plans 
SET 
  start_date = COALESCE(start_date, created_at),
  end_date = COALESCE(end_date, created_at + INTERVAL '3 days')
WHERE start_date IS NULL OR end_date IS NULL;

-- Now make the columns NOT NULL
ALTER TABLE plans ALTER COLUMN start_date SET NOT NULL;
ALTER TABLE plans ALTER COLUMN end_date SET NOT NULL;

-- Re-add the check constraint for TIMESTAMPTZ
ALTER TABLE plans 
  ADD CONSTRAINT plans_end_date_check 
  CHECK (end_date >= start_date);

-- Update column comments
COMMENT ON COLUMN plans.start_date IS 'Trip start date and time (required, TIMESTAMPTZ)';
COMMENT ON COLUMN plans.end_date IS 'Trip end date and time (required, must be >= start_date, TIMESTAMPTZ)';

