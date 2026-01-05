# CityFlow E2E Tests

End-to-end tests for CityFlow application using Playwright.

## 📊 Test Statistics

- **Total tests:** ~149
- **Test categories:** 7
- **Average run time:** ~13 minutes
- **Shared test users:** 10

## 🏗️ Structure

```
e2e/
├── auth/              # Authentication flows (31 tests)
├── export/            # PDF export functionality (8 tests)
├── feedback/          # User feedback system (22 tests)
├── generation/        # AI plan generation (22 tests)
├── history/           # Plan history & archiving (25 tests)
├── plans/             # Plan CRUD operations (30 tests)
├── plan-editing/      # Activity management (11 tests)
├── page-objects/      # Page Object Models
├── fixtures.ts        # Test fixtures & shared users
├── test-utils.ts      # Helper functions
└── test-setup.ts      # Test configuration
```

## 🚀 Quick Start

### Run all tests

```bash
npm run test:e2e
```

### Run specific category

```bash
npm run test:e2e -- history/
npm run test:e2e -- plans/
```

### Run in UI mode

```bash
npm run test:e2e:ui
```

### Run with debugging

```bash
npm run test:e2e:debug
```

## 🔧 Shared Test Users System

To optimize performance and reduce database load, tests use a pool of shared users instead of creating new users for each test.

### Available Shared Users

```typescript
SHARED_TEST_USERS = {
  BASIC_USER: 'e2e-basic-user@test.com',
  PLAN_CREATOR: 'e2e-plan-creator@test.com',
  FEEDBACK_USER: 'e2e-feedback-user@test.com',
  HISTORY_USER: 'e2e-history-user@test.com',
  EXPORT_USER: 'e2e-export-user@test.com',
  RLS_USER_1: 'e2e-rls-user-1@test.com',
  RLS_USER_2: 'e2e-rls-user-2@test.com',
  PLAN_VIEWER: 'e2e-plan-viewer@test.com',
  PLAN_EDITOR: 'e2e-plan-editor@test.com',
  TEMP_USER: 'e2e-temp-user@test.com',
};
```

### Using Shared Users in Tests

```typescript
import { test, expect, getOrCreateSharedUser, cleanupUserData } from '../fixtures';

test.describe('My Feature', () => {
  let sharedUser: { email: string; password: string; userId: string };
  let supabase: SupabaseClient<Database>;

  // Get or create shared user once for all tests
  test.beforeAll(async ({ browser }) => {
    const page = await browser.newPage();
    const context = page.context();
    supabase = (context as any).supabase;

    sharedUser = await getOrCreateSharedUser(supabase, 'BASIC_USER');
    await page.close();
  });

  // Clean user data before each test
  test.beforeEach(async ({ page, supabase: testSupabase }) => {
    await cleanupUserData(testSupabase, sharedUser.userId, { keepUser: true });

    // Login
    const loginPage = new LoginPage(page);
    await loginPage.goto();
    await loginPage.login(sharedUser.email, sharedUser.password);
    await page.waitForTimeout(500);
  });

  test('should do something', async ({ page, supabase }) => {
    // Test logic here
    // User is already logged in and data is clean
  });
});
```

### Benefits

- ✅ **-78% fewer user creations** - from ~45 to ~10 per test run
- ✅ **-64% fewer database operations** - faster execution
- ✅ **Better test stability** - consistent user state
- ✅ **Lower Supabase costs** - fewer Auth API calls

### When NOT to Use Shared Users

- **Register tests** - Must create new users
- **RLS tests** - Need multiple distinct users
- **User-specific state** - When isolation is critical

For these cases, use `createTestUser()` as before.

## 📝 Writing New Tests

### Basic Test Template

```typescript
import { test, expect } from '../fixtures';
import { MyPage } from '../page-objects/MyPage';

test.describe('Feature Name', () => {
  test('should do something', async ({ page }) => {
    const myPage = new MyPage(page);

    await myPage.goto();
    await myPage.doAction();

    await expect(myPage.result).toBeVisible();
  });
});
```

### Test with Shared User

```typescript
import { test, expect, getOrCreateSharedUser, cleanupUserData } from '../fixtures';

test.describe('Feature with Auth', () => {
  let sharedUser: { email: string; password: string; userId: string };
  let supabase: SupabaseClient<Database>;

  test.beforeAll(async ({ browser }) => {
    const page = await browser.newPage();
    const context = page.context();
    supabase = (context as any).supabase;
    sharedUser = await getOrCreateSharedUser(supabase, 'BASIC_USER');
    await page.close();
  });

  test.beforeEach(async ({ page, supabase: testSupabase }) => {
    await cleanupUserData(testSupabase, sharedUser.userId, { keepUser: true });
    // Login logic here
  });

  test('my test', async ({ page }) => {
    // Test with authenticated user
  });
});
```

### Comprehensive Test Pattern

Merge similar tests to reduce duplication:

```typescript
// ✅ GOOD - One comprehensive test
test('validates all form constraints', async ({ page }) => {
  // Test multiple scenarios in one test
  await testEmptyField();
  await testTooShort();
  await testTooLong();
  await testSpecialChars();
});

// ❌ BAD - Multiple similar tests
test('validates empty field');
test('validates too short');
test('validates too long');
test('validates special chars');
```

## 🧪 Test Categories

### 1. Authentication (`auth/`)

- User registration
- Login/logout flows
- Password recovery
- Onboarding

### 2. Plans (`plans/`)

- Create, read, update, delete plans
- Plan details view
- Plans list with filtering
- Row-level security

### 3. Plan Editing (`plan-editing/`)

- Add/edit/delete activities
- Activity form validation
- Timeline management

### 4. History (`history/`)

- View archived plans
- Auto-archiving after end date
- Move plans to history
- Read-only mode for archived plans

### 5. Generation (`generation/`)

- AI plan generation
- Generation limits
- Error handling
- Priority system

### 6. Feedback (`feedback/`)

- Submit feedback
- Rate plans
- Feedback persistence

### 7. Export (`export/`)

- PDF export functionality
- Export content validation

## 🔍 Page Objects

All page interactions should use Page Object Models:

```typescript
// page-objects/MyPage.ts
export class MyPage {
  constructor(private page: Page) {}

  // Locators
  get submitButton() {
    return this.page.getByTestId('submit-button');
  }

  // Actions
  async goto() {
    await this.page.goto('/my-page');
  }

  async submit() {
    await this.submitButton.click();
  }

  // Assertions
  async expectSuccess() {
    await expect(this.page.getByText('Success')).toBeVisible();
  }
}
```

## 🛠️ Available Fixtures & Utilities

### User Management

- `getOrCreateSharedUser(supabase, userKey)` - Get shared user
- `cleanupUserData(supabase, userId, options)` - Clean user data
- `createTestUser(supabase, options)` - Create new user (when needed)
- `deleteTestUser(supabase, userId)` - Delete user completely

### Plan Management

- `createTestPlan(supabase, userId, options)` - Create test plan
- `createPlanWithActivities(supabase, userId, options)` - Plan with activities
- `createDraftPlan(supabase, userId, options)` - Draft plan
- `createArchivedPlan(supabase, userId, options)` - Archived plan

### Generation Helpers

- `setGenerationLimit(supabase, userId, used)` - Set generation count
- `getGenerationCount(supabase, userId)` - Get generation count
- `verifyPlanGenerated(supabase, planId)` - Verify generation

### History Helpers

- `verifyPlanIsArchived(supabase, planId)` - Check if archived
- `runArchivingJob(supabase)` - Manually run archiving
- `getArchivedPlanCount(supabase, userId)` - Count archived plans

### Feedback Helpers

- `createFeedback(supabase, userId, planId, rating, comment)` - Create feedback
- `getFeedback(supabase, userId, planId)` - Get feedback
- `updateFeedback(supabase, feedbackId, updates)` - Update feedback

### UI Utilities

- `waitForToast(page, options)` - Wait for toast notification
- `waitForLoading(page, options)` - Wait for loading state
- `expectErrorMessage(page, text)` - Verify error
- `expectSuccessMessage(page, text)` - Verify success
- `fillInput(page, testId, value, options)` - Fill form input

## 🐛 Debugging

### Debug Single Test

```bash
npm run test:e2e:debug -- --grep "test name"
```

### Show Browser

```bash
npm run test:e2e -- --headed
```

### Slow Motion

```bash
npm run test:e2e -- --headed --slow-mo=1000
```

### Screenshots on Failure

Screenshots are automatically saved to `test-results/` on failure.

### Trace Viewer

```bash
npx playwright show-trace trace.zip
```

## 📊 Best Practices

### ✅ DO

- Use shared users for most tests
- Clean user data between tests
- Use Page Object Models
- Merge similar tests when possible
- Use descriptive test names
- Handle loading states explicitly
- Test critical paths thoroughly

### ❌ DON'T

- Create new users unnecessarily
- Test implementation details
- Duplicate similar tests
- Skip cleanup in beforeEach
- Use hardcoded waits (use waitFor instead)
- Mix test data between tests

## 🔄 CI/CD

Tests run automatically on:

- Pull requests to `main`
- Pushes to `main`
- Manual workflow dispatch

### Environment Variables

Required in CI:

- `SUPABASE_URL`
- `SUPABASE_KEY`
- `E2E_USERNAME`
- `E2E_PASSWORD`
- `E2E_USER_ID`

## 📈 Performance Metrics

### Current Stats

- **Total tests:** ~149
- **Execution time:** ~13 minutes
- **User creations:** ~10 per run
- **Database operations:** ~180 per run

### Optimization History

- **Jan 2026:** Implemented shared users system
  - Reduced tests by 29% (210 → 149)
  - Reduced user creations by 78% (45 → 10)
  - Reduced execution time by 28% (18min → 13min)

## 🤝 Contributing

When adding new tests:

1. Use shared users when possible
2. Follow Page Object pattern
3. Merge similar test cases
4. Clean up data in beforeEach
5. Update this README if adding new patterns

## 📚 Additional Resources

- [Playwright Documentation](https://playwright.dev)
- [Optimization Plan](../ai/e2e-optimization-implementation-plan.md)
- [Optimization Results](../ai/e2e-optimization-final-summary.md)
- [Cursor Testing Rules](../.cursor/rules/playwright-e2e-testing.mdc)

---

**Last Updated:** January 5, 2026  
**Test Framework:** Playwright 1.40+  
**Node Version:** 18+
