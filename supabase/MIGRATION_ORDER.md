# CityFlow Database Migration Order

This document explains the dependency chain and execution order of database migrations.

## Migration Execution Order

The migrations **MUST** be executed in this exact order due to dependencies:

### 1. `20251024115900_create_trigger_functions.sql`

**Dependencies:** None  
**Creates:**

- `update_updated_at_column()` function (used by all tables)

**Why first:** All subsequent tables depend on this trigger function.

---

### 2. `20251024120000_create_enums.sql`

**Dependencies:** None  
**Creates:**

- `travel_pace_enum` → used by `profiles` table
- `plan_status_enum` → used by `plans` table
- `feedback_rating_enum` → used by `feedback` table

**Why second:** Tables need these ENUMs to exist before referencing them in column definitions.

---

### 3. `20251024120100_create_profiles_table.sql`

**Dependencies:**

- `travel_pace_enum` (from migration #2)
- `update_updated_at_column()` (from migration #1)

**Creates:**

- `profiles` table
- Trigger on `profiles` using `update_updated_at_column()`
- RLS policies for `profiles`

**Why third:** Independent table, only depends on ENUMs and trigger function.

---

### 4. `20251024120200_create_plans_table.sql`

**Dependencies:**

- `auth.users` (Supabase Auth - pre-existing)
- `plan_status_enum` (from migration #2)
- `update_updated_at_column()` (from migration #1)

**Creates:**

- `plans` table (referenced by `fixed_points` and `feedback`)
- Trigger on `plans` using `update_updated_at_column()`
- RLS policies for `plans`

**Why fourth:** Must exist before `fixed_points` and `feedback` can reference it.

---

### 5. `20251024120250_add_generated_content_validation.sql` _(OPTIONAL)_

**Dependencies:**

- `plans` table (from migration #4)

**Creates:**

- `validate_generated_content()` function
- CHECK constraint on `plans.generated_content` column

**Why fifth:** Adds validation to existing `plans` table. Can be skipped if validation is not desired.

---

### 6. `20251024120300_create_fixed_points_table.sql`

**Dependencies:**

- `plans` table (from migration #4) - **CRITICAL:** Uses `REFERENCES plans(id)`
- `update_updated_at_column()` (from migration #1)

**Creates:**

- `fixed_points` table
- Trigger on `fixed_points` using `update_updated_at_column()`
- RLS policies for `fixed_points` (with EXISTS checks against `plans`)

**Why fifth:** Depends on `plans` table existing.

---

### 7. `20251024120400_create_feedback_table.sql`

**Dependencies:**

- `plans` table (from migration #4) - **CRITICAL:** Uses `REFERENCES plans(id)`
- `auth.users` (Supabase Auth - pre-existing)
- `feedback_rating_enum` (from migration #2)
- `update_updated_at_column()` (from migration #1)

**Creates:**

- `feedback` table
- Trigger on `feedback` using `update_updated_at_column()`
- RLS policies for `feedback` (with EXISTS checks against `plans`)

**Why sixth:** Depends on `plans` table existing.

---

### 8. `20251024120500_setup_pg_cron_jobs.sql`

**Dependencies:**

- `profiles` table (from migration #3) - Updates `generations_remaining`
- `plans` table (from migration #4) - Updates `status` to `archived`

**Creates:**

- `pg_cron` extension
- Scheduled job: `reset_monthly_generations`
- Scheduled job: `auto_archive_completed_plans`

**Why last:** Operates on existing tables, so those must be created first.

---

## Dependency Graph

```
┌─────────────────────────────────┐
│ 1. create_trigger_functions     │ (No dependencies)
└────────────┬────────────────────┘
             │
             ├──────────────────────────────────────────┐
             │                                          │
┌────────────▼────────────┐              ┌─────────────▼────────────┐
│ 2. create_enums         │              │ Used by migrations 3-6   │
└────────┬────────────────┘              └──────────────────────────┘
         │
         ├─────────────┬─────────────┐
         │             │             │
┌────────▼────────┐    │             │
│ 3. profiles     │    │             │
│ (standalone)    │    │             │
└────────┬────────┘    │             │
         │             │             │
         │    ┌────────▼────────┐    │
         │    │ 4. plans        │◄───┘
         │    └────────┬────────┘
         │             │
         │    ┌────────▼──────────────┐
         │    │ 5. validation         │ (OPTIONAL)
         │    │    (adds constraint)  │
         │    └────────┬──────────────┘
         │             │
         │             ├─────────────┬─────────────┐
         │             │             │             │
         │    ┌────────▼────────┐    │             │
         │    │ 6. fixed_points │    │             │
         │    └─────────────────┘    │             │
         │                           │             │
         │                  ┌────────▼────────┐    │
         │                  │ 7. feedback     │◄───┘
         │                  └─────────────────┘
         │                           │
         └───────────────┬───────────┘
                         │
               ┌─────────▼─────────┐
               │ 8. pg_cron_jobs   │
               └───────────────────┘
```

## Foreign Key Relationships

- `profiles.id` → `auth.users.id` (ON DELETE CASCADE)
- `plans.user_id` → `auth.users.id` (ON DELETE CASCADE)
- `fixed_points.plan_id` → `plans.id` (ON DELETE CASCADE)
- `feedback.plan_id` → `plans.id` (ON DELETE CASCADE)
- `feedback.user_id` → `auth.users.id` (ON DELETE CASCADE)

## Running Migrations

### Using Supabase CLI:

```bash
# Apply all pending migrations
supabase db push

# Or apply migrations individually (in order)
supabase migration up
```

### Rollback Strategy:

To rollback migrations, create reverse migrations in **reverse order**:

1. Drop `pg_cron` jobs
2. Drop `feedback` table
3. Drop `fixed_points` table
4. Drop `plans` table
5. Drop `profiles` table
6. Drop ENUMs
7. Drop trigger functions

## Validation Checklist

Before running migrations in production:

- [ ] Verify `auth.users` table exists (Supabase Auth enabled)
- [ ] Verify `pg_cron` extension is available (may require dashboard enable)
- [ ] Review RLS policies match security requirements
- [ ] Test migration order on local/staging environment
- [ ] Verify indexes are created for performance
- [ ] Check all CASCADE delete behaviors are intentional

## Notes

- All migrations use UTC timestamps
- All tables have RLS enabled with granular policies
- Trigger functions are shared across tables for consistency
- pg_cron jobs require the extension to be enabled (may need Supabase dashboard)
