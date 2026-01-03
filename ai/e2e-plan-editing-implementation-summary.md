# E2E Plan Editing Tests - Implementation Summary

## ✅ Completed Implementation

### 1. Data-testids Added to Components

#### EventTimeline Component (`src/components/EventTimeline.tsx`)

- `data-testid="plan-timeline"` - Main timeline container
- `data-testid="confirm-delete"` - Delete confirmation button
- `data-testid="cancel-delete"` - Cancel delete button

#### TimelineItem Component (`src/components/timeline/TimelineItem.tsx`)

- `data-testid="activity-item"` - Individual activity item
- `data-testid="activity-time"` - Activity time badge
- `data-testid="edit-activity"` - Edit dropdown menu item
- `data-testid="delete-activity"` - Delete dropdown menu item

#### DailyItinerary Component (`src/components/generated-plan/DailyItinerary.tsx`)

- `data-testid="plan-day"` - Day accordion item
- `data-testid="add-activity-button"` - Add activity button

#### ActivityForm Component (`src/components/ActivityForm.tsx`)

- `data-testid="activity-form-modal"` - Modal container
- `data-testid="save-activity"` - Save button
- `data-testid="cancel-activity"` - Cancel button

### 2. Page Objects Created

#### PlanTimelinePage (`e2e/page-objects/PlanTimelinePage.ts`)

**Purpose**: Interact with plan timeline and activities

**Methods**:

- `goto(planId)` - Navigate to plan details page
- `expandDay(dayNumber)` - Open day accordion
- `addActivityToDay(dayNumber)` - Click "Add Activity" button
- `getActivity(title)` - Find activity by title
- `editActivity(title)` - Open edit form for activity
- `deleteActivity(title)` - Delete activity with confirmation
- `getActivitiesCount()` - Count total activities
- `getActivitiesByDay(dayNumber)` - Count activities for specific day
- `getActivityTime(title)` - Get time display for activity
- `isActivityVisible(title)` - Check if activity is visible
- `waitForToast(message)` - Wait for toast notification

#### ActivityFormModal (`e2e/page-objects/ActivityFormModal.ts`)

**Purpose**: Interact with activity form modal

**Methods**:

- `waitForModal()` - Wait for modal to be visible
- `fillForm(data)` - Fill form with activity data
- `save()` - Save and close form
- `cancel()` - Cancel and close form
- `closeWithEscape()` - Close form with Escape key
- `getErrorMessage()` - Get validation error
- `isVisible()` - Check if modal is visible
- `isSaveButtonEnabled()` - Check if save button is enabled

### 3. Fixtures Extended (`e2e/fixtures.ts`)

#### New Helper Functions:

- `createPlanWithActivities()` - Creates a plan with generated content containing activities
- `getActivityByTitle()` - Retrieves an activity from a plan's generated content
- `countActivities()` - Counts total activities in a plan
- `createDraftPlan()` - Creates a simple draft plan for testing

#### Removed:

- Unused `pdf-parse` and `fs` imports that were causing test failures

### 4. Test Files Created

#### `e2e/plan-editing/add-activity.spec.ts`

**Tests**:

1. ✅ Add custom activity to empty day
2. ✅ Add activity between existing activities
3. ✅ Add activity with minimal form (only required fields)
4. ✅ Cancel adding activity
5. ✅ Close form with Escape key

#### `e2e/plan-editing/edit-activity.spec.ts`

**Tests**:

1. ✅ Edit AI-generated activity
2. ✅ Edit custom activity
3. ✅ Change activity category
4. ✅ Cancel editing with Cancel button
5. ✅ Cancel editing with Escape key
6. ✅ Edit multiple fields at once

#### `e2e/plan-editing/delete-activity.spec.ts`

**Tests**:

1. ✅ Delete AI-generated activity with confirmation
2. ✅ Cancel deletion when clicking Cancel in confirmation dialog
3. ✅ Delete first activity in timeline
4. ✅ Delete last activity in timeline
5. ✅ Delete all activities from a day
6. ✅ Delete multiple activities in sequence

#### `e2e/plan-editing/activity-validation.spec.ts`

**Tests**:

1. ✅ Show error when title is empty
2. ✅ Show error when duration is zero or negative
3. ✅ Accept negative duration values but show warning
4. ✅ Allow saving with valid minimum data
5. ✅ Handle very long activity titles
6. ✅ Handle special characters in fields
7. ✅ Accept activities at midnight (00:00)
8. ✅ Accept activities late in the evening
9. ✅ Handle activities with very long duration
10. ✅ Allow optional fields to be empty
11. ✅ Preserve form data when reopening after cancel

### 5. Documentation Created

#### `e2e/plan-editing/README.md`

- Overview of all test files
- Description of page objects
- Available fixtures
- Running instructions
- Notes about test database and mocking

## Testing Strategy

### Database Management

- Each test uses `cleanDatabase()` in `beforeEach` to ensure isolation
- Tests use the real Supabase test database (configured in `.env.test`)
- Plans and activities are created using fixtures for consistency

### API Mocking

- **OpenRouter API**: Mocked to avoid actual AI API calls
- **Activity Management API**: NOT mocked - tests use real endpoints to ensure full E2E coverage

### Test User

- Tests use credentials from `.env.test`
- User must exist in the test database with appropriate permissions

## Test Execution

All tests have been created and are ready to run:

```bash
# Run all plan editing tests
npm run test:e2e -- e2e/plan-editing

# Run specific test suite
npm run test:e2e -- e2e/plan-editing/add-activity.spec.ts

# Run in headed mode for debugging
npm run test:e2e -- e2e/plan-editing --headed

# Run with specific reporter
npm run test:e2e -- e2e/plan-editing --reporter=list
```

## Coverage

The tests cover all user stories from the implementation plan:

- **US-041**: Add custom activities ✅
- **US-042**: Edit activities (AI and custom) ✅
- **US-040**: Delete activities ✅
- **Validation**: Form validation and edge cases ✅

## Known Issues & Notes

1. **Test Discovery**: The unused `pdf-parse` import was causing test discovery to fail - this has been fixed.

2. **Page Object Improvements**: The `goto()` method now uses `networkidle` instead of checking for headings to avoid strict mode violations.

3. **Accordion Expansion**: The `expandDay()` method has been improved to handle accordion state properly.

4. **Database Cleanup**: Each test properly cleans up after itself to prevent interference between tests.

## Next Steps

1. Run tests to identify any remaining issues with selectors or timing
2. Add visual regression tests if needed
3. Consider adding tests for drag-and-drop reordering (if that feature exists)
4. Add tests for activity time conflict warnings (if implemented)

## Conformance to Implementation Plan

This implementation follows the plan defined in `ai/e2e-plan-editing-implementation-plan.md`:

- ✅ All test cases from the plan are implemented
- ✅ Page objects match the specification
- ✅ Fixtures provide the required helper functions
- ✅ Data-testids are added to all required components
- ✅ Tests are organized by feature (add, edit, delete, validation)
- ✅ Test database is cleaned between tests
- ✅ OpenRouter API is mocked

## Files Modified

### Components

- `src/components/EventTimeline.tsx`
- `src/components/timeline/TimelineItem.tsx`
- `src/components/generated-plan/DailyItinerary.tsx`
- `src/components/ActivityForm.tsx`

### E2E Infrastructure

- `e2e/fixtures.ts` (extended with new helpers)
- `e2e/page-objects/PlanTimelinePage.ts` (created)
- `e2e/page-objects/ActivityFormModal.ts` (created)

### Test Files

- `e2e/plan-editing/add-activity.spec.ts` (created)
- `e2e/plan-editing/edit-activity.spec.ts` (created)
- `e2e/plan-editing/delete-activity.spec.ts` (created)
- `e2e/plan-editing/activity-validation.spec.ts` (created)
- `e2e/plan-editing/README.md` (created)

Total: **28 test cases** implemented across 4 test files.
