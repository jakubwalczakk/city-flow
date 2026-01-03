# Plan Editing E2E Tests

This directory contains end-to-end tests for plan editing functionality.

## Test Files

### `add-activity.spec.ts`

Tests for adding new activities to a plan:

- Add activity to an empty day
- Add activity between existing activities
- Add activity with minimal form data
- Cancel adding activity
- Close form with Escape key

### `edit-activity.spec.ts`

Tests for editing existing activities:

- Edit AI-generated activity
- Edit custom activity
- Change activity category
- Cancel editing with Cancel button
- Cancel editing with Escape key
- Edit multiple fields at once

### `delete-activity.spec.ts`

Tests for deleting activities:

- Delete AI-generated activity with confirmation
- Cancel deletion dialog
- Delete first/last activity in timeline
- Delete all activities from a day
- Delete multiple activities in sequence

### `activity-validation.spec.ts`

Tests for form validation:

- Empty title validation
- Invalid duration validation
- Minimum valid data acceptance
- Long titles and special characters
- Activities at edge times (midnight, late evening)
- Optional fields handling

## Page Objects

### `PlanTimelinePage`

Handles interactions with the plan timeline:

- Expanding days
- Adding activities
- Editing activities
- Deleting activities
- Counting activities

### `ActivityFormModal`

Handles interactions with the activity form modal:

- Filling form fields
- Saving/canceling
- Validation error checking
- Form state management

## Fixtures

The following fixtures are available in `../fixtures.ts`:

- `createPlanWithActivities()` - Creates a plan with specified activities
- `getActivityByTitle()` - Gets an activity from a plan by title
- `countActivities()` - Counts total activities in a plan
- `cleanDatabase()` - Cleans test data between tests

## Running Tests

```bash
# Run all plan editing tests
npm run test:e2e -- e2e/plan-editing

# Run specific test file
npm run test:e2e -- e2e/plan-editing/add-activity.spec.ts

# Run in headed mode for debugging
npm run test:e2e -- e2e/plan-editing --headed
```

## Test Database

Tests use the Supabase test database configured in `.env.test`. The database is cleaned before each test to ensure isolation.

## Mocking

- **OpenRouter API**: Mocked to avoid actual AI API calls
- **Activity Management API**: NOT mocked - tests use real endpoints

## Notes

- Tests require a valid test user with credentials in `.env.test`
- All tests clean up after themselves
- Tests are designed to be run in parallel
- Each test is independent and doesn't rely on other tests
