# History E2E Tests

This directory contains E2E tests for the plan history and archiving functionality.

## Test Files

### move-to-history.spec.ts

Tests for manually moving plans to history:

- Move plan to history from plans list
- Move plan to history from plan details page
- Cancel moving plan to history
- Verify move to history button only shows for generated plans
- Confirmation modal validation
- Rapid move operations
- Data preservation after archiving

### auto-archive.spec.ts

Tests for automatic archiving of expired plans:

- Auto-archive plan after end date passes
- Don't archive plans before end date
- Don't auto-archive draft plans
- Batch archive multiple expired plans
- Handle mixed plan statuses
- Timezone edge cases
- RLS respect during archiving
- Data preservation after auto-archiving

### view-history.spec.ts

Tests for viewing history page:

- Display empty state when no archived plans
- Display list of archived plans
- Sort plans by end date (newest first)
- Navigate to plan details from history
- Display archived status badges
- Show plan information (destination, dates)
- Handle large number of archived plans
- RLS enforcement (only show user's plans)
- Scroll position maintenance
- Page navigation

### history-readonly.spec.ts

Tests for read-only mode of archived plans:

- Display read-only badge
- Prevent editing plan title
- Prevent adding activities
- Prevent editing activities
- Prevent deleting activities
- Prevent regenerating plan
- Allow exporting to PDF
- Display activities in read-only mode
- Prevent deleting archived plans
- Show visual indicators
- Maintain data integrity
- Navigation between archived plans

## Required Implementation

Before these tests can pass, the following needs to be implemented in the application:

### 1. Database Changes

- Ensure `plans.status` enum includes `'archived'`
- Create `archive_expired_plans()` database function (optional for auto-archiving)

### 2. UI Components & Routes

#### /history Page

Create a new page at `src/pages/history.astro` that displays archived plans.

**Required data-testid attributes:**

- `data-testid="history-plan-card"` - Each archived plan card
- `data-testid="history-empty-state"` - Empty state message
- `data-testid="history-filter"` - Filter dropdown (optional)
- `data-testid="filter-year-{year}"` - Year filter options (optional)
- `data-testid="plan-name"` - Plan name in card
- `data-testid="plan-end-date"` - End date in card
- `data-testid="archived-badge"` - Archived status badge

#### Plans List Page Updates

Add move to history functionality to plan cards and details.

**Required data-testid attributes:**

- `data-testid="move-to-history-action"` - Move to history menu item
- `data-testid="confirm-archive"` - Confirm button in archive modal
- `data-testid="cancel-archive"` - Cancel button in archive modal

#### Plan Details Page Updates

Show read-only mode for archived plans.

**Required data-testid attributes:**

- `data-testid="move-to-history"` - Move to history button
- `data-testid="readonly-badge"` - Read-only badge
- `data-testid="add-activity-button"` - Add activity button
- `data-testid="edit-activity-button"` - Edit activity buttons
- `data-testid="delete-activity-button"` - Delete activity buttons

### 3. Business Logic

#### Manual Archiving

- API endpoint: `POST /api/plans/{id}/archive` or similar
- Update plan status to `'archived'`
- Remove from active plans list
- Show in history page
- Show confirmation modal with read-only warning

#### Auto-Archiving (Optional)

Two approaches:

**Option A: Supabase Function + Vercel Cron**

```sql
CREATE OR REPLACE FUNCTION archive_expired_plans()
RETURNS TABLE (archived_count INT) AS $$
BEGIN
  UPDATE plans
  SET status = 'archived'
  WHERE end_date < CURRENT_DATE
    AND status = 'generated';

  GET DIAGNOSTICS archived_count = ROW_COUNT;
  RETURN QUERY SELECT archived_count;
END;
$$ LANGUAGE plpgsql;
```

Add to `vercel.json`:

```json
{
  "crons": [
    {
      "path": "/api/cron/archive-plans",
      "schedule": "0 0 * * *"
    }
  ]
}
```

Create `/api/cron/archive-plans.ts`:

```typescript
export async function GET(request: Request) {
  const authHeader = request.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return new Response('Unauthorized', { status: 401 });
  }

  const supabase = createClient();
  const { data, error } = await supabase.rpc('archive_expired_plans');

  if (error) {
    return new Response(JSON.stringify({ error }), { status: 500 });
  }

  return new Response(JSON.stringify({ archived: data }), { status: 200 });
}
```

**Option B: Client-side check**
Check on page load if user has plans with past end dates and prompt to archive them.

#### Read-Only Mode

For plans with `status = 'archived'`:

- Hide/disable edit title button
- Hide add activity button
- Hide edit activity buttons
- Hide delete activity buttons
- Hide regenerate button
- Hide delete plan button (or add extra confirmation)
- Show read-only badge
- Keep export to PDF enabled

### 4. RLS Policies

Ensure Row Level Security policies respect archived status:

- Users can only view their own archived plans
- Archived plans can be read but not modified (optional)

## Running the Tests

```bash
# Run all history tests
npm run test:e2e -- e2e/history/

# Run specific test file
npm run test:e2e -- e2e/history/move-to-history.spec.ts

# Run specific test
npm run test:e2e -- e2e/history/move-to-history.spec.ts:43
```

## Test Status

⏳ **Pending Implementation** - All tests will pass once the history functionality is implemented.

## Notes

- Tests use the same authentication and fixtures as other E2E tests
- Database is cleaned before and after each test
- All tests respect RLS (Row Level Security)
- Tests are designed to be idempotent and can run in any order
- Mock data is used for consistency across test runs
