# Seed Data Guide

## Overview

The `seed.sql` file automatically creates a default development user whenever you reset or initialize your local Supabase database. This ensures you always have a test user available for development.

## Default Development User

### Credentials

- **User ID**: `17555d06-2387-4f0b-b4f8-0887177cadc1`
- **Email**: `dev@cityflow.local`
- **Password**: `password123`

### Important Notes

⚠️ **This user is for DEVELOPMENT ONLY!**

- The user ID matches `DEFAULT_USER_ID` in `src/db/supabase.client.ts`
- This ensures all API endpoints work correctly in development mode
- Never use these credentials in production or staging environments

## When Does Seeding Occur?

The seed file runs automatically when you:

```bash
# Reset the entire database
supabase db reset

# Start Supabase for the first time
supabase start
```

## What Gets Created?

### 1. Auth User (`auth.users`)

- Creates a user in Supabase Auth with the specified ID
- Email: `dev@cityflow.local`
- Password: `password123` (hashed)

### 2. Auth Identity (`auth.identities`)

- Links the user to the email provider
- Required for email/password authentication

### 3. User Profile (`profiles`)

- Creates a profile with test preferences:
  - Preferences: Art & Museums, Local Food, History
  - Travel Pace: Moderate
  - Generations Remaining: 5
  - Onboarding Completed: true

## Modifying the Default User

If you need to change the default user ID:

1. Update `DEFAULT_USER_ID` in `src/db/supabase.client.ts`
2. Update the UUID in `supabase/seed.sql` (appears in multiple places)
3. Run `supabase db reset` to apply changes

### Example:

```typescript
// src/db/supabase.client.ts
export const DEFAULT_USER_ID = 'your-new-uuid-here';
```

```sql
-- supabase/seed.sql
-- Update all occurrences of the UUID
'your-new-uuid-here'::uuid
```

## Troubleshooting

### Foreign Key Constraint Violations

If you see errors like:

```
violates foreign key constraint "plans_user_id_fkey"
```

This means the default user doesn't exist. Solution:

```bash
supabase db reset
```

This will recreate the database and run the seed file.

### User Already Exists

The seed file uses `ON CONFLICT DO NOTHING` and `WHERE NOT EXISTS` clauses, so it's safe to run multiple times. It won't create duplicate users.

### Checking if User Exists

You can verify the user was created:

```sql
-- Check auth user
SELECT id, email FROM auth.users
WHERE id = '17555d06-2387-4f0b-b4f8-0887177cadc1';

-- Check profile
SELECT id, preferences, travel_pace, generations_remaining
FROM profiles
WHERE id = '17555d06-2387-4f0b-b4f8-0887177cadc1';
```

## Production Considerations

⚠️ **CRITICAL**: The seed file should NEVER run in production!

Supabase automatically handles this:

- Seed files only run in local development
- They are NOT deployed to hosted Supabase projects
- Production users are created through your authentication flow

## Adding More Seed Data

To add additional test data (plans, fixed points, etc.), add them to `seed.sql` after the user creation:

```sql
-- Example: Add a test plan
INSERT INTO plans (
    id,
    user_id,
    name,
    destination,
    start_date,
    end_date,
    status,
    notes
)
VALUES (
    gen_random_uuid(),
    '17555d06-2387-4f0b-b4f8-0887177cadc1'::uuid,
    'Test Trip to Paris',
    'Paris, France',
    now() + interval '1 week',
    now() + interval '10 days',
    'draft',
    'Test plan for development'
)
ON CONFLICT DO NOTHING;
```

## Related Files

- `src/db/supabase.client.ts` - Contains `DEFAULT_USER_ID` constant
- `supabase/seed.sql` - The seed file itself
- `supabase/migrations/20251024120600_disable_rls_for_development.sql` - Disables RLS for easy testing

## Summary

The seed file ensures you always have a working test user in development. It:

- ✅ Matches the `DEFAULT_USER_ID` constant
- ✅ Runs automatically on database reset
- ✅ Is safe to run multiple times
- ✅ Only affects local development
- ✅ Includes a complete user profile with test data
