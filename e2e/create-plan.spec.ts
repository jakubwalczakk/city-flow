import { test, expect, cleanDatabase } from './fixtures';
import { LoginPage } from './page-objects/LoginPage';
import { NewPlanPage } from './page-objects/NewPlanPage';

// Test credentials from .env.test
const TEST_USER_EMAIL = process.env.E2E_USERNAME || 'test@example.com';
const TEST_USER_PASSWORD = process.env.E2E_PASSWORD || 'testpassword123';

test.describe('Create New Plan', () => {
  let loginPage: LoginPage;
  let newPlanPage: NewPlanPage;

  // Clean database between tests - cleans plans, fixed_points, feedback tables
  // Preserves profiles and auth tables needed for test user
  test.beforeEach(async ({ page, supabase, testUser }) => {
    // Clean test data before each test
    await cleanDatabase(supabase, testUser.id);

    loginPage = new LoginPage(page);
    newPlanPage = new NewPlanPage(page);

    // Mock the Plans API for creation (after login)
    // NOTE: Mocking API calls means the actual API route code won't be covered
    // by E2E coverage. For full coverage, consider integration tests without mocks.
    await page.route('**/api/plans', async (route) => {
      if (route.request().method() === 'POST') {
        await route.fulfill({
          status: 201,
          contentType: 'application/json',
          body: JSON.stringify({
            id: 'test-plan-id',
            name: 'Test Plan',
            destination: 'Paris',
            start_date: new Date().toISOString(),
            end_date: new Date().toISOString(),
          }),
        });
      } else {
        await route.continue();
      }
    });

    // Mock Fixed Points API
    await page.route('**/api/plans/test-plan-id/fixed-points', async (route) => {
      if (route.request().method() === 'POST') {
        await route.fulfill({
          status: 201,
          contentType: 'application/json',
          body: JSON.stringify({ id: 'fp-1', location: 'Test Location' }),
        });
      } else {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify([]),
        });
      }
    });

    // Mock Generate API
    await page.route('**/api/plans/test-plan-id/generate', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ success: true }),
      });
    });
  });

  test('should successfully create a new plan (Happy Path)', async ({ page }) => {
    // Enable console logging for debugging
    page.on('console', (msg) => {
      if (msg.type() === 'error' || msg.type() === 'warning') {
        // Log browser errors/warnings for debugging
      }
    });

    // 1. Arrange - Login first
    await loginPage.goto();
    await loginPage.login(TEST_USER_EMAIL, TEST_USER_PASSWORD);

    // Handle Onboarding if present (skip it)
    // Note: Test user has onboarding_completed=true, so modal won't appear
    await newPlanPage.handleOnboarding();

    // 2. Act - Create a new plan
    // Open the New Plan modal
    await newPlanPage.openNewPlanModal();

    // Fill Basic Info (Step 1)
    await newPlanPage.fillBasicInfo('Wycieczka do Paryża', 'Paryż, Francja');

    // Add Fixed Point (Step 2) - optional but part of happy path
    await newPlanPage.addFixedPoint('Lotnisko Chopina');

    // Proceed to Summary (Step 3)
    await newPlanPage.proceedToSummary();

    // Submit Plan
    await newPlanPage.submitPlan();

    // 3. Assert
    // After submitting via modal, the modal closes and we stay on /plans
    // (navigation to plan details only happens when NewPlanForm is used standalone)

    // Wait for the modal to close - create plan button should be visible again
    await expect(newPlanPage.createNewPlanButton).toBeVisible({ timeout: 15000 });

    // Verify we're still on /plans page
    await expect(page).toHaveURL(/\/plans$/);

    // Verify modal content is no longer visible
    await expect(newPlanPage.createPlanButton).not.toBeVisible();
  });
});
