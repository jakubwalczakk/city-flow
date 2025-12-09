import { test, expect } from '@playwright/test';
import { LoginPage } from './page-objects/LoginPage';
import { NewPlanPage } from './page-objects/NewPlanPage';

// Test credentials from .env.test
const TEST_USER_EMAIL = process.env.E2E_USERNAME || 'test@example.com';
const TEST_USER_PASSWORD = process.env.E2E_PASSWORD || 'testpassword123';

test.describe('Create New Plan', () => {
  let loginPage: LoginPage;
  let newPlanPage: NewPlanPage;

  test.beforeEach(async ({ page }) => {
    loginPage = new LoginPage(page);
    newPlanPage = new NewPlanPage(page);

    // Mock the Plans API for creation (after login)
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
        console.log(`Browser ${msg.type()}:`, msg.text());
      }
    });

    // 1. Arrange - Login first
    console.log('Step 1: Logging in...');
    await loginPage.goto();
    await loginPage.login(TEST_USER_EMAIL, TEST_USER_PASSWORD);
    console.log('Login successful, now on /plans');

    // Handle Onboarding if present (skip it)
    // Note: Test user has onboarding_completed=true, so modal won't appear
    console.log('Step 2: Waiting for dashboard...');
    await newPlanPage.handleOnboarding();
    console.log('Dashboard ready');

    // 2. Act - Create a new plan
    // Click the create new plan button
    console.log('Step 3: Opening create plan modal...');
    await newPlanPage.createNewPlanButton.click();

    // Wait for modal to actually open by checking for form inputs
    await expect(newPlanPage.nameInput).toBeVisible({ timeout: 10000 });
    console.log('Create plan modal opened');

    // Fill Basic Info (Step 1)
    console.log('Step 4: Filling basic info...');
    await newPlanPage.fillBasicInfo('Wycieczka do Paryża', 'Paryż, Francja');
    console.log('Basic info filled');

    // Add Fixed Point (Step 2) - optional but part of happy path
    console.log('Step 5: Adding fixed point...');
    await newPlanPage.addFixedPoint('Lotnisko Chopina');
    console.log('Fixed point added');

    // Proceed to Summary (Step 3)
    console.log('Step 6: Proceeding to summary...');
    await newPlanPage.proceedToSummary();
    console.log('On summary step');

    // Submit Plan
    console.log('Step 7: Submitting plan...');
    await newPlanPage.submitPlan();
    console.log('Plan submitted');

    // 3. Assert
    // After submitting via modal, the modal closes and we stay on /plans
    // (navigation to plan details only happens when NewPlanForm is used standalone)
    console.log('Step 8: Verifying modal closed and we stay on /plans...');

    // Wait for the modal to close - create plan button should be visible again
    await expect(newPlanPage.createNewPlanButton).toBeVisible({ timeout: 15000 });

    // Verify we're still on /plans page
    await expect(page).toHaveURL(/\/plans$/);

    // Verify modal content is no longer visible
    await expect(newPlanPage.createPlanButton).not.toBeVisible();

    console.log('Test passed!');
  });
});
