# Date & Time Refactor Summary

## Overview
This refactor makes `start_date` and `end_date` mandatory fields for plans and ensures they capture both date and time information. This is critical for the AI plan generator to create accurate itineraries with proper timing.

## Changes Made

### 1. DateTime Input Pattern
**Approach:** Reused existing pattern from `FixedPointsStep`

- Uses native HTML5 `datetime-local` input with shadcn/ui `Input` component
- Consistent with existing codebase patterns (no reinventing the wheel)
- Features:
  - Native browser datetime picker
  - Built-in validation
  - Min/max constraints via HTML attributes
  - Accessible and keyboard-friendly
  - Works seamlessly with existing styling

### 2. Type Definitions
**File:** `src/types.ts`

Updated the following types to make dates required (non-nullable):

- `CreatePlanCommand`: Changed `start_date` and `end_date` from `string | null` to `string` (required)
- `PlanListItemDto`: Changed `start_date` and `end_date` from `string | null` to `string`
- `PlanDetailsDto`: Changed `start_date` and `end_date` from `string | null` to `string`
- `NewPlanViewModel.basicInfo`: Changed `start_date` and `end_date` from `Date | null` to `Date`

### 3. Validation Schemas
**File:** `src/lib/schemas/plan.schema.ts`

- `createPlanSchema`: Made `start_date` and `end_date` required with `.datetime()` validation
- `basicInfoSchema`: Made `start_date` and `end_date` required Date objects
- Updated refinement logic to always validate date ordering (removed null checks)

### 4. UI Components

#### BasicInfoStep
**File:** `src/components/BasicInfoStep.tsx`

- Replaced `DatePicker` with native `datetime-local` input (consistent with `FixedPointsStep`)
- Added helper functions to convert between Date objects and datetime-local strings
- Added asterisks (*) to indicate required fields
- Updated labels to "Start Date & Time" and "End Date & Time"
- Uses `min` attribute on end date to prevent selecting dates before start date
- Removed null handling since dates are now always present

#### SummaryStep
**File:** `src/components/SummaryStep.tsx`

- Updated to display both date and time for start and end dates
- Changed from conditional rendering to always showing dates
- Improved layout to show start and end separately with labels

#### PlanCard
**File:** `src/components/PlanCard.tsx`

- Updated `formatDate` to `formatDateTime` to include time
- Now displays date and time in plan list cards
- Uses Polish locale (`pl-PL`) for formatting

#### DraftPlanView
**File:** `src/components/DraftPlanView.tsx`

- Removed conditional rendering of dates section (always shown now)
- Updated to display both date and time
- Improved layout with separate start/end sections

### 5. Form Hook
**File:** `src/hooks/useNewPlanForm.ts`

- Added helper functions to generate default dates:
  - `getDefaultStartDate()`: Tomorrow at 9:00 AM
  - `getDefaultEndDate()`: 4 days from now at 18:00 (6:00 PM)
- Updated form initialization to use these defaults
- Removed null handling in `handleSubmit` since dates are always present
- Changed `.toISOString() || null` to `.toISOString()` (always returns a value)

### 6. API Endpoint
**File:** `src/pages/api/plans/[planId]/generate.ts`

- Added validation to ensure both dates are present before generation
- Updated AI prompt to include formatted date and time information
- Improved fixed points display to show date and time
- Better error handling for missing dates

### 7. Database Migration
**File:** `supabase/migrations/20251108000000_update_plans_dates_to_timestamptz.sql`

- Changed `start_date` and `end_date` from `DATE` to `TIMESTAMPTZ`
- Made both columns `NOT NULL` (required)
- Updated check constraint to work with TIMESTAMPTZ
- Handles existing data by setting defaults for any NULL values
- Updated column comments to reflect new requirements

### 8. Seed Data
**File:** `supabase/seed.sql`

- Created seed file to automatically initialize default development user
- User ID matches `DEFAULT_USER_ID` constant in `src/db/supabase.client.ts`
- Prevents foreign key constraint violations after database resets
- Includes:
  - Auth user creation (`auth.users`)
  - Auth identity setup (`auth.identities`)
  - User profile with test preferences
- Runs automatically on `supabase db reset` or `supabase start`
- Safe to run multiple times (uses `ON CONFLICT` and `WHERE NOT EXISTS`)

**Documentation:** `supabase/SEED_DATA_GUIDE.md`

## Benefits

1. **Better AI Generation**: The AI now knows exact start and end times, enabling more accurate itinerary planning
2. **Improved UX**: Users can specify arrival/departure times, which is crucial for travel planning
3. **Data Consistency**: Required fields ensure all plans have complete date information
4. **Type Safety**: TypeScript types now accurately reflect the data model
5. **Validation**: Comprehensive validation at all layers (client, API, database)

## Default Behavior

When creating a new plan, the form now initializes with sensible defaults:
- **Start Date**: Tomorrow at 9:00 AM
- **End Date**: 4 days from tomorrow at 6:00 PM (3-day trip)

Users can easily adjust these defaults using the DateTimePicker component.

## Breaking Changes

⚠️ **This is a breaking change for existing code:**

- Any code expecting `start_date` or `end_date` to be nullable will need updates
- Database schema has changed - existing plans with NULL dates will be given default values during migration
- API responses will always include date values (no more null checks needed)

## Implementation Notes

### Why Native datetime-local?

Instead of creating a custom DateTimePicker component, we reused the existing pattern from `FixedPointsStep` which uses the native HTML5 `datetime-local` input. This approach:

1. **Maintains Consistency**: Follows existing codebase patterns
2. **Reduces Complexity**: No custom component maintenance needed
3. **Better Accessibility**: Native inputs have built-in accessibility features
4. **Cross-browser Support**: Modern browsers handle datetime-local well
5. **Matches Existing Styling**: Works seamlessly with shadcn/ui Input component

### Conversion Pattern

The component uses helper functions to bridge Date objects (used in state) and datetime-local strings (used by the input):

```typescript
// Date → "YYYY-MM-DDTHH:mm"
const dateToDateTimeLocal = (date: Date): string => { ... }

// "YYYY-MM-DDTHH:mm" → Date
const dateTimeLocalToDate = (dateTimeLocal: string): Date => { ... }
```

## Testing Checklist

- [x] Native datetime-local input renders correctly
- [x] Date and time can be selected using browser's native picker
- [x] Form validation enforces required dates
- [x] Default dates are set on form initialization
- [x] Min constraint prevents end date before start date
- [x] Summary step displays date and time correctly
- [x] Plan cards show date and time
- [x] Draft plan view displays date and time
- [x] Database migration runs successfully
- [x] API validation works correctly
- [x] Consistent styling with existing components
- [ ] End-to-end plan creation flow (manual testing needed)
- [ ] AI generation uses date/time information properly (manual testing needed)

## Future Enhancements

1. **Timezone Support**: Consider adding timezone selection for international travel
2. **Duration Display**: Show trip duration in days/hours
3. **Date Validation**: Add business logic to prevent unrealistic date ranges
4. **Calendar Integration**: Allow importing from/exporting to calendar apps

