/*
 * Migration: Create ENUM types for CityFlow
 * 
 * Purpose: Define custom ENUM types used across the database schema
 * 
 * Tables affected: None (creates types)
 * 
 * Special notes:
 * - These ENUMs are created first to be referenced by subsequent migrations
 * - ENUM values are immutable after creation; new values can be added but not removed
 */

-- Create ENUM for user's travel pace preference
-- Values: slow, moderate, intensive
CREATE TYPE travel_pace_enum AS ENUM ('slow', 'moderate', 'intensive');

COMMENT ON TYPE travel_pace_enum IS 'User travel pace preference: slow (relaxed), moderate (balanced), intensive (fast-paced)';

-- Create ENUM for plan status lifecycle
-- Values: draft, generated, archived
CREATE TYPE plan_status_enum AS ENUM ('draft', 'generated', 'archived');

COMMENT ON TYPE plan_status_enum IS 'Plan lifecycle status: draft (user notes), generated (AI-created plan), archived (completed trip)';

-- Create ENUM for user feedback rating
-- Values: thumbs_up, thumbs_down
CREATE TYPE feedback_rating_enum AS ENUM ('thumbs_up', 'thumbs_down');

COMMENT ON TYPE feedback_rating_enum IS 'User feedback rating: thumbs_up (positive), thumbs_down (negative)';


