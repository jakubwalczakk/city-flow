/*
 * Migration: Create fixed_points table with RLS policies
 * 
 * Purpose: Store immutable, priority points in travel plans (e.g., reservations)
 * 
 * Tables affected: fixed_points (created)
 * 
 * Special notes:
 * - Fixed points are constraints for AI plan generation
 * - event_duration stored in minutes for precision
 * - RLS enforces access through plan ownership
 * - Cascades deletion when parent plan is deleted
 */

-- Create fixed_points table
CREATE TABLE fixed_points (
    -- Primary key
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Reference to parent plan (cascades on plan deletion)
    plan_id UUID NOT NULL REFERENCES plans(id) ON DELETE CASCADE,
    
    -- Event details
    location TEXT NOT NULL,
    event_at TIMESTAMPTZ NOT NULL,
    event_duration INTEGER NOT NULL CHECK (event_duration > 0),
    
    -- Optional user notes
    description TEXT,
    
    -- Audit timestamps
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

COMMENT ON TABLE fixed_points IS 'Immutable priority points in travel plans (reservations, scheduled events)';
COMMENT ON COLUMN fixed_points.plan_id IS 'Parent plan reference (cascades deletion)';
COMMENT ON COLUMN fixed_points.location IS 'Event location or attraction name';
COMMENT ON COLUMN fixed_points.event_at IS 'Event date and time';
COMMENT ON COLUMN fixed_points.event_duration IS 'Event duration in minutes (must be positive)';
COMMENT ON COLUMN fixed_points.description IS 'Optional user notes about the event';

-- Create index on plan_id for efficient plan-based queries
CREATE INDEX idx_fixed_points_plan_id ON fixed_points(plan_id);

COMMENT ON INDEX idx_fixed_points_plan_id IS 'Optimize queries retrieving fixed points for a specific plan';

-- Create index on event_at for temporal queries
CREATE INDEX idx_fixed_points_event_at ON fixed_points(event_at);

COMMENT ON INDEX idx_fixed_points_event_at IS 'Optimize queries filtering or sorting fixed points by date/time';

-- Create composite index for plan + event_at queries
CREATE INDEX idx_fixed_points_plan_event ON fixed_points(plan_id, event_at);

COMMENT ON INDEX idx_fixed_points_plan_event IS 'Optimize chronological retrieval of fixed points within a plan';

-- Create trigger to auto-update updated_at timestamp
CREATE TRIGGER update_fixed_points_updated_at
    BEFORE UPDATE ON fixed_points
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security
ALTER TABLE fixed_points ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Users can view fixed points of their own plans
CREATE POLICY "fixed_points_select_own"
    ON fixed_points
    FOR SELECT
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM plans
            WHERE plans.id = fixed_points.plan_id
            AND plans.user_id = auth.uid()
        )
    );

COMMENT ON POLICY "fixed_points_select_own" ON fixed_points IS 'Authenticated users can view fixed points only from their own plans';

-- RLS Policy: Users can insert fixed points only to their own plans
CREATE POLICY "fixed_points_insert_own"
    ON fixed_points
    FOR INSERT
    TO authenticated
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM plans
            WHERE plans.id = fixed_points.plan_id
            AND plans.user_id = auth.uid()
        )
    );

COMMENT ON POLICY "fixed_points_insert_own" ON fixed_points IS 'Authenticated users can create fixed points only in their own plans';

-- RLS Policy: Users can update fixed points only in their own plans
CREATE POLICY "fixed_points_update_own"
    ON fixed_points
    FOR UPDATE
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM plans
            WHERE plans.id = fixed_points.plan_id
            AND plans.user_id = auth.uid()
        )
    )
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM plans
            WHERE plans.id = fixed_points.plan_id
            AND plans.user_id = auth.uid()
        )
    );

COMMENT ON POLICY "fixed_points_update_own" ON fixed_points IS 'Authenticated users can update fixed points only in their own plans';

-- RLS Policy: Users can delete fixed points only from their own plans
CREATE POLICY "fixed_points_delete_own"
    ON fixed_points
    FOR DELETE
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM plans
            WHERE plans.id = fixed_points.plan_id
            AND plans.user_id = auth.uid()
        )
    );

COMMENT ON POLICY "fixed_points_delete_own" ON fixed_points IS 'Authenticated users can delete fixed points only from their own plans';


