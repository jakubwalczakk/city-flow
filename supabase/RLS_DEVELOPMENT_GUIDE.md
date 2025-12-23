# RLS Development Guide

> **🚨 TODO: CRITICAL - ENABLE RLS BEFORE PRODUCTION DEPLOYMENT**
>
> **This is currently in DEVELOPMENT MODE with permissive RLS policies!**
>
> Before deploying to production, you MUST:
>
> 1. Enable production RLS flag in database
> 2. Apply production RLS migration (20251024120700)
> 3. Verify all policies are active
>
> See "Scenario 3: Deploying to Production" below for detailed instructions.

## Overview

Row Level Security (RLS) is essential for production but can be cumbersome during development. This guide explains how to toggle between development and production RLS modes.

---

## ⚠️ IMPORTANT WARNING

**NEVER run the development migration in production or staging environments!**

The development migration grants unrestricted access to all data, which would be a **critical security vulnerability** in production.

---

## Current State

After running all migrations, RLS is in **DEVELOPMENT MODE** by default:

- ✅ All users can read/write all data
- ✅ No authentication required for testing
- ⚠️ **NOT SECURE** - only for local development

---

## Migration Overview

### Development Mode

**Migration:** `20251024120600_disable_rls_for_development.sql`

- Replaces restrictive RLS policies with permissive ones
- Allows `public` role (authenticated + anonymous) full access
- Policies named `*_dev_*_all` indicate development mode
- Useful for: local testing, seeding data, debugging
- **Status:** ✅ Active in development (`.sql` extension)

### Production Mode

**Migration:** `99999999999999_enable_rls_for_production.sql.template`

- Restores secure RLS policies
- Only allows `authenticated` users to access their own data
- Policies named `*_own` indicate production mode
- **REQUIRED** before deploying to production/staging
- **Status:** ⏸️ Disabled in development (`.sql.template` extension)

---

## How to Use

### Scenario 1: Local Development (Current State)

You're currently in **development mode** after running migrations. This is perfect for:

- Testing without authentication
- Seeding test data
- Debugging database queries
- Running integration tests

```bash
# Already applied if you ran all migrations
# Development mode is active ✅
```

**No action needed!** You can work freely without authentication.

---

### Scenario 2: Testing Production Security Locally

You want to test that RLS policies work correctly before deploying:

```bash
# Enable the production RLS migration
mv supabase/migrations/99999999999999_enable_rls_for_production.sql.template \
   supabase/migrations/99999999999999_enable_rls_for_production.sql

# Reset database to apply it
supabase db reset

# Now test your app with authentication
# Users should only see their own data

# When done testing, switch back to dev mode
mv supabase/migrations/99999999999999_enable_rls_for_production.sql \
   supabase/migrations/99999999999999_enable_rls_for_production.sql.template

# Reset again to return to dev mode
supabase db reset
```

---

### Scenario 3: Deploying to Production

**CRITICAL:** You **MUST** enable production RLS before deploying!

```bash
# 1. Enable the production RLS migration
mv supabase/migrations/99999999999999_enable_rls_for_production.sql.template \
   supabase/migrations/99999999999999_enable_rls_for_production.sql

# 2. Verify it's ready:
ls supabase/migrations/ | grep enable_rls_for_production
# Should output: 99999999999999_enable_rls_for_production.sql (NOT .template)

# 3. Commit the change
git add supabase/migrations/99999999999999_enable_rls_for_production.sql
git commit -m "Enable production RLS policies for deployment"

# 4. Deploy all migrations
supabase db push --linked  # or your deployment command
```

After deployment, verify security:

```sql
-- Check that production policies are active
SELECT tablename, policyname
FROM pg_policies
WHERE tablename IN ('profiles', 'plans', 'fixed_points', 'feedback')
ORDER BY tablename, policyname;

-- Expected output should show policies ending with "_own"
-- NOT policies ending with "_dev_*_all"
```

---

### Scenario 4: Separate Local/Production Configurations

**Recommended approach:** Use different migration sets for local vs. production.

#### Option A: Environment-based migration control

Create a `.env` file:

```bash
# .env.local (for development)
ENABLE_DEV_RLS=true

# .env.production
ENABLE_DEV_RLS=false
```

Then manually choose which migrations to run based on environment.

#### Option B: Git branch strategy

```bash
# Development branch includes both migrations
git checkout development
supabase db reset  # Uses all migrations including dev RLS

# Production branch excludes dev migration
git checkout main
# Remove 20251024120600_disable_rls_for_development.sql from this branch
supabase db push --linked  # Only production-secure migrations
```

#### Option C: Use Supabase CLI local development features

```bash
# For local development, you can disable RLS globally
supabase db reset
# Then manually run:
supabase db execute "ALTER TABLE profiles DISABLE ROW LEVEL SECURITY;"
supabase db execute "ALTER TABLE plans DISABLE ROW LEVEL SECURITY;"
supabase db execute "ALTER TABLE fixed_points DISABLE ROW LEVEL SECURITY;"
supabase db execute "ALTER TABLE feedback DISABLE ROW LEVEL SECURITY;"

# WARNING: This approach requires manual re-enabling and doesn't work in Supabase hosted projects
```

---

## Recommended Workflow

### 🏠 Local Development

```bash
# 1. Initialize database with dev migrations
supabase db reset

# 2. Run migrations INCLUDING dev RLS (120600)
supabase migration up

# 3. Work without authentication ✅
# All data accessible for testing
```

### 🧪 Staging/Preview Environment

```bash
# 1. Deploy all migrations EXCEPT dev RLS
# Either:
# - Remove 20251024120600 from migration folder before deploy, OR
# - Ensure 20251024120700 runs after it

# 2. Test with real authentication
# Verify users can only access their own data

# 3. Run security tests
```

### 🚀 Production Environment

```bash
# 1. Deploy migrations WITHOUT dev RLS (120600)
# ONLY include production migrations

# 2. Verify RLS is active:
supabase db execute "
SELECT schemaname, tablename, policyname
FROM pg_policies
WHERE policyname LIKE '%dev%';" --linked

# Should return 0 rows (no dev policies)

# 3. Test in production
# Verify data isolation between users
```

---

## How to Verify Current RLS State

### Check which policies are active:

```sql
-- List all policies
SELECT
    schemaname,
    tablename,
    policyname,
    CASE
        WHEN policyname LIKE '%dev%' THEN '🚧 DEVELOPMENT'
        WHEN policyname LIKE '%own%' THEN '✅ PRODUCTION'
        ELSE '❓ UNKNOWN'
    END AS security_mode
FROM pg_policies
WHERE tablename IN ('profiles', 'plans', 'fixed_points', 'feedback')
ORDER BY tablename, policyname;
```

### Expected Output:

**Development Mode:**

```
 tablename     | policyname              | security_mode
---------------+-------------------------+---------------
 profiles      | profiles_dev_select_all | 🚧 DEVELOPMENT
 profiles      | profiles_dev_insert_all | 🚧 DEVELOPMENT
 ...
```

**Production Mode:**

```
 tablename     | policyname         | security_mode
---------------+--------------------+---------------
 profiles      | profiles_select_own| ✅ PRODUCTION
 profiles      | profiles_insert_own| ✅ PRODUCTION
 ...
```

---

## Testing RLS Policies

### Test Production RLS Locally:

```sql
-- 1. Create test users (using Supabase Auth)
-- 2. Switch to production RLS mode
-- 3. Run these queries as different users:

-- As User A (should only see their own data)
SELECT * FROM profiles WHERE id = auth.uid();  -- ✅ Should return 1 row

SELECT * FROM profiles;  -- ✅ Should return ONLY user A's profile

-- As User B (should NOT see User A's data)
SELECT * FROM plans WHERE user_id = 'user-a-uuid';  -- ✅ Should return 0 rows

-- Try to insert data for another user
INSERT INTO plans (user_id, name, destination)
VALUES ('user-a-uuid', 'Test', 'Paris');  -- ❌ Should FAIL

-- Try to update another user's data
UPDATE profiles SET preferences = ARRAY['test']
WHERE id = 'user-a-uuid';  -- ❌ Should affect 0 rows
```

---

## Quick Reference

| Action                     | Development    | Production   |
| -------------------------- | -------------- | ------------ |
| **View any user's data**   | ✅ Allowed     | ❌ Forbidden |
| **Insert data for others** | ✅ Allowed     | ❌ Forbidden |
| **Update others' data**    | ✅ Allowed     | ❌ Forbidden |
| **Anonymous access**       | ✅ Full access | ❌ No access |
| **Auth required**          | ❌ No          | ✅ Yes       |
| **Security**               | ⚠️ NONE        | ✅ Full      |

---

## Migration File Management

### ✅ Include in version control:

- `20251024120600_disable_rls_for_development.sql` (with clear comments)
- `20251024120700_enable_rls_for_production.sql` (CRITICAL)

### ⚠️ Production deployment strategy:

**Option 1: Include both, rely on order**

- Both migrations in repo
- 120600 runs first (dev mode)
- 120700 runs second (prod mode)
- Final state: Production ✅

**Option 2: Exclude dev migration from production**

- Use `.supabaseignore` or deployment scripts
- Only deploy production-safe migrations
- Cleaner, more explicit

**Option 3: Environment-specific migration folders** (recommended)

```
supabase/migrations/
├── common/              # Always run these
│   ├── 20251024115900_create_trigger_functions.sql
│   ├── 20251024120000_create_enums.sql
│   └── ...
├── development/         # Only for local dev
│   └── 20251024120600_disable_rls_for_development.sql
└── production/          # Only for prod
    └── 20251024120700_enable_rls_for_production.sql
```

---

## Summary

✅ **For local development:** Run migration `120600` (dev mode)  
✅ **For production:** Skip `120600` or ensure `120700` runs after it  
✅ **Before deploying:** Verify production policies are active  
⚠️ **Never:** Deploy dev RLS to production without re-enabling production RLS

**When in doubt:** Check policies with the SQL query above. If you see `*_dev_*` policies in production, **immediately run migration 120700!**
