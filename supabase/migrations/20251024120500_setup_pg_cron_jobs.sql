/*
 * Migration: Setup pg_cron scheduled jobs
 * 
 * Purpose: Automate monthly generation limit reset and plan archival
 * 
 * Tables affected: profiles (updated), plans (updated)
 * 
 * Special notes:
 * - Requires pg_cron extension to be enabled
 * - Reset job runs 1st of each month at 00:00 UTC
 * - Archival job runs daily at 01:00 UTC
 * - Jobs run independently of application code for reliability
 * 
 * IMPORTANT: pg_cron extension must be enabled in Supabase dashboard
 * or via SQL: CREATE EXTENSION IF NOT EXISTS pg_cron;
 */

-- Enable pg_cron extension (requires superuser or extension already granted)
-- Note: In Supabase, this may need to be enabled via dashboard
CREATE EXTENSION IF NOT EXISTS pg_cron;

COMMENT ON EXTENSION pg_cron IS 'PostgreSQL job scheduler for automated tasks';

-- Job 1: Reset monthly generation limit
-- Runs on the 1st day of every month at 00:00 UTC
-- This job resets the generations_remaining counter for all users to 5
SELECT cron.schedule(
    'reset_monthly_generations',           -- Job name
    '0 0 1 * *',                          -- Cron schedule (minute hour day month weekday)
    $$
    UPDATE profiles
    SET generations_remaining = 5
    WHERE generations_remaining < 5;
    $$
);

-- Job 2: Auto-archive completed plans
-- Runs daily at 01:00 UTC
-- Archives plans where end_date has passed (allows access on departure day)
SELECT cron.schedule(
    'auto_archive_completed_plans',        -- Job name
    '0 1 * * *',                          -- Cron schedule (runs daily at 01:00 UTC)
    $$
    UPDATE plans
    SET status = 'archived'
    WHERE status != 'archived'
    AND end_date IS NOT NULL
    AND end_date < CURRENT_DATE;
    $$
);

/*
 * Monitoring scheduled jobs:
 * 
 * List all scheduled jobs:
 * SELECT * FROM cron.job;
 * 
 * View job run history:
 * SELECT * FROM cron.job_run_details ORDER BY start_time DESC LIMIT 10;
 * 
 * Unschedule a job:
 * SELECT cron.unschedule('reset_monthly_generations');
 */


