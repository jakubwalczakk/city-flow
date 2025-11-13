/*
 * Manual Trigger Creation for auth.users
 * 
 * ⚠️ IMPORTANT: This file should be run MANUALLY in Supabase Dashboard SQL Editor
 * 
 * WHY: Regular migrations don't have permissions to create triggers on auth.users
 * 
 * HOW TO RUN:
 * 1. Go to Supabase Dashboard
 * 2. Navigate to SQL Editor
 * 3. Create a new query
 * 4. Copy and paste this entire file
 * 5. Click "Run" or press Cmd/Ctrl + Enter
 * 
 * WHAT IT DOES:
 * - Creates a trigger on auth.users table
 * - Automatically creates a profile when a new user signs up
 * - Uses the handle_new_user() function from previous migration
 */

-- Drop trigger if it already exists (idempotent)
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Create trigger on auth.users table
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- Verify trigger was created
SELECT 
  trigger_name,
  event_manipulation,
  event_object_table,
  action_statement
FROM information_schema.triggers
WHERE trigger_name = 'on_auth_user_created';

