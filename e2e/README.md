# E2E Tests - Plans Management

This directory contains end-to-end tests for the CityFlow application's plan management features.

## 📁 Test Structure

```
e2e/
├── plans/                          # Plan management tests
│   ├── create-plan-full.spec.ts   # Plan creation (full flow, no API mocks)
│   ├── plans-list.spec.ts         # Plans list view
│   ├── plan-details.spec.ts       # Plan details view
│   ├── edit-plan-name.spec.ts     # Inline plan name editing
│   ├── delete-plan.spec.ts        # Plan deletion
│   └── plan-rls.spec.ts           # Row Level Security tests
├── page-objects/                   # Page Object Models
│   ├── LoginPage.ts
│   ├── NewPlanPage.ts
│   ├── PlansListPage.ts           # NEW
│   └── PlanDetailsPage.ts         # NEW
├── fixtures.ts                     # Test fixtures and helpers
├── test-setup.ts                   # Common mocks (OpenRouter API)
└── README.md                       # This file
```

## 🎯 Test Coverage

### Plans CRUD Operations (54+ tests)

#### 1. Create Plan (6 tests)

- ✅ Create draft plan without generating
- ✅ Create and generate plan (full flow with mocked AI)
- ✅ Form validation for empty required fields
- ✅ Cancel plan creation
- ✅ Data preservation across steps
- ✅ Multiple fixed points

#### 2. Plans List (9 tests)

- ✅ Empty state for new users
- ✅ Display list of user plans
- ✅ Filter archived plans
- ✅ Navigate to plan details
- ✅ Status badges (draft/generated)
- ✅ Sorting (newest first)
- ✅ Plan card information
- ✅ Empty filter results

#### 3. Plan Details (11 tests)

- ✅ Display draft plan details
- ✅ Display generated plan with activities
- ✅ 404 for non-existent plans
- ✅ Plan metadata display
- ✅ Fixed points display
- ✅ Export button visibility
- ✅ Multiple days and activities
- ✅ Generate from draft status
- ✅ Action buttons
- ✅ Long plan name handling

#### 4. Edit Plan Name (9 tests)

- ✅ Successful inline editing
- ✅ Toast notification
- ✅ Cancel with Escape key
- ✅ Empty name validation
- ✅ Very long name handling
- ✅ RLS - cannot edit other user's plans
- ✅ Special characters preservation
- ✅ Multiple successive edits
- ✅ Whitespace trimming

#### 5. Delete Plan (10 tests)

- ✅ Delete from list view
- ✅ Cancel deletion
- ✅ Delete from details view
- ✅ Cascade delete fixed points
- ✅ Cascade delete activities
- ✅ Confirmation modal
- ✅ Rapid delete operations
- ✅ Delete last plan (empty state)
- ✅ RLS - cannot delete other user's plans

#### 6. Row Level Security - RLS (9 tests)

- ✅ Only show own plans in list
- ✅ Deny access via URL manipulation
- ✅ Deny editing via API
- ✅ Deny deleting via API
- ✅ Deny accessing fixed points
- ✅ Deny plan generation
- ✅ Allow access to own plans
- ✅ Direct database access prevention
- ✅ Deny accessing activities

## 🧪 Test Philosophy

### Database Usage

- **Real Supabase database** - tests use the actual test database
- **No Plan API mocks** - full integration testing for database operations
- **Mocked OpenRouter API** - prevents expensive AI calls during tests
- **Proper cleanup** - database cleaned before and after each test

### Page Object Model

All tests use Page Object Models for maintainability:

- `PlansListPage` - Plans list page interactions
- `PlanDetailsPage` - Plan details page interactions
- `NewPlanPage` - Plan creation flow
- `LoginPage` - Authentication flow

### Fixtures and Helpers

#### Test Fixtures (fixtures.ts)

```typescript
// Create test plans
await createTestPlan(supabase, userId, {
  name: 'Test Plan',
  destination: 'Paris',
  status: 'draft' | 'generated' | 'archived',
  withFixedPoints: true,
  withActivities: true,
});

// Clean database
await cleanDatabase(supabase, userId);

// Create test users
await createTestUser(supabase, options);
```

#### Common Mocks (test-setup.ts)

```typescript
// Mock OpenRouter API to prevent real AI calls
await mockOpenRouterAPI(page);
```

## 🚀 Running Tests

### Run all plan management tests

```bash
npm run test:e2e -- e2e/plans/
```

### Run specific test file

```bash
npm run test:e2e -- e2e/plans/create-plan-full.spec.ts
```

### Run tests in debug mode

```bash
npx playwright test --debug e2e/plans/
```

### Run tests in headed mode (see browser)

```bash
npx playwright test --headed e2e/plans/
```

### Run specific test by name

```bash
npm run test:e2e -- -g "should create a draft plan"
```

## 📝 Test Data Management

### Environment Variables

Tests require the following environment variables in `.env.test`:

```env
# Test User (pre-created in test database)
E2E_USER_ID=uuid-here
E2E_USERNAME=test@example.com
E2E_PASSWORD=testpassword123

# Supabase Test Database
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_KEY=your-anon-key
```

### Database Cleanup

- **Before each test**: Database is cleaned to ensure isolation
- **After each test**: Database is cleaned to remove test data
- **Cascade deletes**: Related records (fixed_points, activities) are automatically deleted

## 🎨 Required UI Changes

To ensure all tests pass, the following `data-testid` attributes must be added to components:

### Plans List (`PlansDashboard.tsx`)

```tsx
data-testid="create-new-plan-btn"     // Create button
data-testid="plan-card"               // Each plan card
data-testid="empty-state"             // Empty state component
data-testid="plan-menu"               // Plan context menu
data-testid="delete-plan-action"      // Delete action in menu
```

### Plan Details (`PlanDetailsView.tsx`)

```tsx
data-testid="plan-title"              // Plan title
data-testid="edit-title-button"       // Edit title button
data-testid="title-input"             // Title input field
data-testid="plan-destination"        // Destination display
data-testid="plan-dates"              // Dates display
data-testid="plan-timeline"           // Timeline component
data-testid="activity-item"           // Each activity item
data-testid="generate-plan-button"    // Generate button
data-testid="export-pdf-button"       // Export button
data-testid="delete-plan-button"      // Delete button
data-testid="plan-actions-menu"       // Actions menu
data-testid="fixed-points-list"       // Fixed points list
data-testid="generation-loader"       // Generation loader
```

### Confirmation Dialogs

```tsx
data-testid="confirm-delete"          // Confirm button
data-testid="cancel-delete"           // Cancel button
```

## 🔒 Security Testing

The `plan-rls.spec.ts` file contains comprehensive Row Level Security tests:

- ✅ Users can only see their own plans
- ✅ URL manipulation is blocked
- ✅ API calls to other users' plans return 403/404
- ✅ Direct database access is prevented via RLS policies
- ✅ All CRUD operations respect user ownership

## 📊 Performance Considerations

### Test Execution Time

- **Fast tests** (~5-10s): List, details, edit, delete tests
- **Slow tests** (~20-30s): Plan generation tests (with mocked AI)
- **RLS tests** (~10-15s): Multiple user creation and cleanup

### Optimization Tips

1. Use `test.setTimeout()` for long-running tests
2. Parallelize independent test files
3. Use database fixtures instead of UI navigation when possible
4. Clean up only necessary data in `afterEach`

## 🐛 Debugging Tips

### View test trace

```bash
npx playwright show-trace trace.zip
```

### Run with console output

```typescript
page.on('console', (msg) => console.log(msg.text()));
```

### Take screenshot on failure

Playwright automatically captures screenshots on test failures in `test-results/`

### Check database state

Use Supabase dashboard to verify database state during test development

## 📚 Best Practices

1. **Use Page Objects** - Keep selectors and actions in page objects
2. **Clean Database** - Always clean before and after tests
3. **Test Isolation** - Each test should be independent
4. **Meaningful Names** - Use descriptive test names
5. **Wait for Elements** - Use `expect().toBeVisible()` instead of `waitForTimeout()`
6. **Mock External Services** - Mock OpenRouter but use real database
7. **Test Edge Cases** - Empty states, long text, special characters
8. **Verify Database** - Check database state after operations
9. **Handle Async** - Always await async operations
10. **Error Messages** - Test validation and error scenarios

## 🔄 CI/CD Integration

Tests are designed to run in CI/CD pipelines:

```yaml
# .github/workflows/e2e-tests.yml
- name: Run E2E Tests
  run: npm run test:e2e -- e2e/plans/
  env:
    E2E_USER_ID: ${{ secrets.E2E_USER_ID }}
    E2E_USERNAME: ${{ secrets.E2E_USERNAME }}
    E2E_PASSWORD: ${{ secrets.E2E_PASSWORD }}
```

## 📖 Additional Resources

- [Playwright Documentation](https://playwright.dev/)
- [Page Object Model Pattern](https://playwright.dev/docs/pom)
- [Supabase Testing Guide](https://supabase.com/docs/guides/database/testing)
- [CityFlow E2E Test Plan](../ai/e2e-plan-management-implementation-plan.md)

## 🎯 Future Enhancements

- [ ] Add visual regression tests
- [ ] Add performance benchmarks
- [ ] Test plan export PDF content
- [ ] Test plan sharing features (when implemented)
- [ ] Add accessibility (a11y) tests
- [ ] Add mobile viewport tests
- [ ] Test offline behavior
- [ ] Add load testing for concurrent users

---

**Generated**: January 2026  
**Test Framework**: Playwright v1.x  
**Coverage**: 54+ tests for Plan Management CRUD operations
