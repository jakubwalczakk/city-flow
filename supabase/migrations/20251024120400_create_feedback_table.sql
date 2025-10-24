/*
 * Migration: Create feedback table with RLS policies
 * 
 * Purpose: Collect user ratings and comments on AI-generated plans
 * 
 * Tables affected: feedback (created)
 * 
 * Special notes:
 * - One user can provide only one feedback per plan (UNIQUE constraint)
 * - Supports thumbs_up/thumbs_down rating with optional comment
 * - RLS ensures users can only manage their own feedback
 * - Future-proofed for sharing features (multiple users rating same plan)
 */

-- Create feedback table
CREATE TABLE feedback (
    -- Primary key
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- References to plan and user (cascade on deletion)
    plan_id UUID NOT NULL REFERENCES plans(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    
    -- Feedback content
    rating feedback_rating_enum NOT NULL,
    comment TEXT,
    
    -- Audit timestamps
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    
    -- Constraint: One feedback per user per plan
    UNIQUE(plan_id, user_id)
);

COMMENT ON TABLE feedback IS 'User feedback and ratings for AI-generated travel plans';
COMMENT ON COLUMN feedback.plan_id IS 'Plan being rated (cascades deletion)';
COMMENT ON COLUMN feedback.user_id IS 'User providing feedback (cascades deletion)';
COMMENT ON COLUMN feedback.rating IS 'Rating: thumbs_up (positive) or thumbs_down (negative)';
COMMENT ON COLUMN feedback.comment IS 'Optional text comment explaining the rating';
COMMENT ON CONSTRAINT feedback_plan_id_user_id_key ON feedback IS 'Ensures each user can provide only one feedback per plan';

-- Create index on plan_id for efficient plan-based queries
CREATE INDEX idx_feedback_plan_id ON feedback(plan_id);

COMMENT ON INDEX idx_feedback_plan_id IS 'Optimize queries retrieving feedback for a specific plan';

-- Create index on user_id for user-based queries
CREATE INDEX idx_feedback_user_id ON feedback(user_id);

COMMENT ON INDEX idx_feedback_user_id IS 'Optimize queries retrieving all feedback from a specific user';

-- Create index on rating for analytics queries
CREATE INDEX idx_feedback_rating ON feedback(rating);

COMMENT ON INDEX idx_feedback_rating IS 'Optimize queries filtering or aggregating by rating type';

-- Create trigger to auto-update updated_at timestamp
CREATE TRIGGER update_feedback_updated_at
    BEFORE UPDATE ON feedback
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security
ALTER TABLE feedback ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Users can view only their own feedback
CREATE POLICY "feedback_select_own"
    ON feedback
    FOR SELECT
    TO authenticated
    USING (auth.uid() = user_id);

COMMENT ON POLICY "feedback_select_own" ON feedback IS 'Authenticated users can view only their own feedback';

-- RLS Policy: Users can insert feedback only for their own plans
CREATE POLICY "feedback_insert_own"
    ON feedback
    FOR INSERT
    TO authenticated
    WITH CHECK (
        auth.uid() = user_id
        AND EXISTS (
            SELECT 1 FROM plans
            WHERE plans.id = feedback.plan_id
            AND plans.user_id = auth.uid()
        )
    );

COMMENT ON POLICY "feedback_insert_own" ON feedback IS 'Authenticated users can create feedback only for their own plans';

-- RLS Policy: Users can update only their own feedback
CREATE POLICY "feedback_update_own"
    ON feedback
    FOR UPDATE
    TO authenticated
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

COMMENT ON POLICY "feedback_update_own" ON feedback IS 'Authenticated users can update only their own feedback';

-- RLS Policy: Users can delete only their own feedback
CREATE POLICY "feedback_delete_own"
    ON feedback
    FOR DELETE
    TO authenticated
    USING (auth.uid() = user_id);

COMMENT ON POLICY "feedback_delete_own" ON feedback IS 'Authenticated users can delete only their own feedback';


