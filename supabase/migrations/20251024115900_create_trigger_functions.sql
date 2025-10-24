/*
 * Migration: Create reusable trigger functions
 * 
 * Purpose: Define shared trigger functions used across multiple tables
 * 
 * Tables affected: None (creates functions)
 * 
 * Special notes:
 * - These functions are created first to be referenced by subsequent table migrations
 * - Centralizing trigger functions improves maintainability
 */

-- Create trigger function to auto-update updated_at timestamp
-- This function will be used by all tables with an updated_at column
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION update_updated_at_column IS 'Trigger function to automatically update updated_at timestamp on record modification';


