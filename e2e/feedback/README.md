# Feedback E2E Tests

This directory contains E2E tests for the CityFlow feedback system, allowing users to rate plans and provide comments.

## Test Coverage

### 1. rate-plan.spec.ts

Tests for the thumbs up/down rating functionality:

- ✅ Rating plan positively (thumbs up)
- ✅ Rating plan negatively (thumbs down)
- ✅ Changing rating from positive to negative
- ✅ Changing rating from negative to positive
- ✅ Feedback module not visible for draft plans
- ✅ Preserving rating when clicking same thumb again
- ✅ Feedback module visible only for generated plans

### 2. submit-feedback.spec.ts

Tests for submitting text comments:

- ✅ Adding comment without rating
- ✅ Adding comment with positive rating
- ✅ Adding comment with negative rating
- ✅ Updating existing comment
- ✅ Handling empty comment submission
- ✅ Validating maximum comment length
- ✅ Submitting comment after changing rating
- ✅ Preserving comment when changing rating

### 3. feedback-persistence.spec.ts

Tests for feedback data persistence:

- ✅ Preserving feedback after page refresh
- ✅ Preserving feedback when navigating away and back
- ✅ Each user having separate feedback for same plan
- ✅ Not showing other users' feedback
- ✅ Loading existing feedback on page load
- ✅ Updating existing feedback when resubmitting
- ✅ Maintaining feedback integrity across multiple visits

## Prerequisites for Running Tests

Before these tests can pass, the following must be implemented:

### 1. Database Schema

Create the `feedback` table in Supabase:

```sql
CREATE TABLE feedback (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  plan_id UUID NOT NULL REFERENCES plans(id) ON DELETE CASCADE,
  rating TEXT CHECK (rating IN ('positive', 'negative')),
  comment TEXT CHECK (LENGTH(comment) <= 1000),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, plan_id)
);

-- RLS policies
ALTER TABLE feedback ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can CRUD own feedback"
  ON feedback
  FOR ALL
  USING (auth.uid() = user_id);
```

### 2. Frontend Component

Implement `FeedbackModule` component with the following data-testid attributes:

- `data-testid="feedback-module"` - Main container
- `data-testid="thumbs-up"` - Thumbs up button
- `data-testid="thumbs-down"` - Thumbs down button
- `data-testid="feedback-comment"` - Comment textarea
- `data-testid="submit-feedback"` - Submit button
- `data-testid="feedback-success"` - Success message
- `data-testid="feedback-error"` - Error message
- `data-testid="feedback-char-count"` - Character count (optional)

### 3. Component Styling

Active rating buttons should have:

- CSS class `active` or `selected`, OR
- `aria-pressed="true"` attribute

### 4. Integration

The FeedbackModule should:

- Only appear on generated plans (status='generated')
- Not appear on draft plans
- Load existing feedback on component mount
- Use UPSERT to update existing feedback (not create duplicates)
- Enforce unique constraint on (user_id, plan_id)

## Running the Tests

```bash
# Run all feedback tests
npm run test:e2e -- e2e/feedback/

# Run specific test file
npm run test:e2e -- e2e/feedback/rate-plan.spec.ts
npm run test:e2e -- e2e/feedback/submit-feedback.spec.ts
npm run test:e2e -- e2e/feedback/feedback-persistence.spec.ts
```

## Test Dependencies

- **Page Objects**: `FeedbackModule`, `PlanDetailsPage`, `LoginPage`, `PlansListPage`
- **Fixtures**: Feedback helper functions in `e2e/fixtures.ts`
- **Database**: Supabase test database with proper RLS policies

## Notes

- Tests use the test Supabase database configured in `.env.test`
- OpenRouter service is mocked for plan generation
- Database is cleaned before and after each test
- Tests verify both UI state and database state
