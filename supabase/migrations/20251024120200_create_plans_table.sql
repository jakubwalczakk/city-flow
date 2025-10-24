/*
 * Migration: Create plans table with RLS policies
 * 
 * Purpose: Central table for managing user notes and AI-generated travel plans
 * 
 * Tables affected: plans (created)
 * 
 * Special notes:
 * - Plans progress through lifecycle: draft -> generated -> archived
 * - generated_content JSONB stores structured AI output
 * - RLS ensures users can only access their own plans
 * - Date constraints ensure end_date is not before start_date
 */

-- Create plans table
CREATE TABLE plans (
    -- Primary key
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Owner reference (cascades on user deletion)
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    
    -- Plan identification and details
    name TEXT NOT NULL,
    destination TEXT NOT NULL,
    start_date DATE,
    end_date DATE CHECK (end_date IS NULL OR end_date >= start_date),
    
    -- User notes (input for AI generation)
    notes TEXT,
    
    -- Plan lifecycle status
    status plan_status_enum NOT NULL DEFAULT 'draft',
    
    -- AI-generated plan structure (JSONB for flexibility)
    generated_content JSONB,
    
    -- Audit timestamps
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

COMMENT ON TABLE plans IS 'User travel plans with notes and AI-generated itineraries';
COMMENT ON COLUMN plans.user_id IS 'Plan owner (references auth.users)';
COMMENT ON COLUMN plans.name IS 'User-editable plan name (default: city + dates)';
COMMENT ON COLUMN plans.destination IS 'Target city or region';
COMMENT ON COLUMN plans.start_date IS 'Trip start date (can be approximate)';
COMMENT ON COLUMN plans.end_date IS 'Trip end date (must be >= start_date)';
COMMENT ON COLUMN plans.notes IS 'User notes about travel goals and ideas (AI input)';
COMMENT ON COLUMN plans.status IS 'Lifecycle: draft (notes), generated (AI plan), archived (completed)';
COMMENT ON COLUMN plans.generated_content IS 'JSONB structure containing AI-generated itinerary with days, items, modifications, and warnings';

-- Create index on user_id for efficient user-based queries
CREATE INDEX idx_plans_user_id ON plans(user_id);

COMMENT ON INDEX idx_plans_user_id IS 'Optimize queries filtering plans by user';

-- Create index on status for filtering plans by lifecycle stage
CREATE INDEX idx_plans_status ON plans(status);

COMMENT ON INDEX idx_plans_status IS 'Optimize queries filtering plans by status (draft, generated, archived)';

-- Create partial index on end_date for non-archived plans (archival automation)
CREATE INDEX idx_plans_end_date_active ON plans(end_date)
    WHERE status != 'archived' AND end_date IS NOT NULL;

COMMENT ON INDEX idx_plans_end_date_active IS 'Optimize automatic archival queries for plans past their end date';

-- Create composite index for user + status queries
CREATE INDEX idx_plans_user_status ON plans(user_id, status);

COMMENT ON INDEX idx_plans_user_status IS 'Optimize queries filtering by both user and status';

-- Create trigger to auto-update updated_at timestamp
CREATE TRIGGER update_plans_updated_at
    BEFORE UPDATE ON plans
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security
ALTER TABLE plans ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Users can view only their own plans
CREATE POLICY "plans_select_own"
    ON plans
    FOR SELECT
    TO authenticated
    USING (auth.uid() = user_id);

COMMENT ON POLICY "plans_select_own" ON plans IS 'Authenticated users can view only their own plans';

-- RLS Policy: Users can insert only plans for themselves
CREATE POLICY "plans_insert_own"
    ON plans
    FOR INSERT
    TO authenticated
    WITH CHECK (auth.uid() = user_id);

COMMENT ON POLICY "plans_insert_own" ON plans IS 'Authenticated users can create plans only for themselves';

-- RLS Policy: Users can update only their own plans
CREATE POLICY "plans_update_own"
    ON plans
    FOR UPDATE
    TO authenticated
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

COMMENT ON POLICY "plans_update_own" ON plans IS 'Authenticated users can update only their own plans';

-- RLS Policy: Users can delete only their own plans
CREATE POLICY "plans_delete_own"
    ON plans
    FOR DELETE
    TO authenticated
    USING (auth.uid() = user_id);

COMMENT ON POLICY "plans_delete_own" ON plans IS 'Authenticated users can delete only their own plans';


