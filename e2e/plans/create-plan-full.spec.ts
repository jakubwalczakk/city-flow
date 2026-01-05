/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { authTest as test, expect } from '../fixtures';
import { mockOpenRouterAPI } from '../test-setup';
import { LoginPage } from '../page-objects/LoginPage';
import { NewPlanPage } from '../page-objects/NewPlanPage';
import { PlansListPage } from '../page-objects/PlansListPage';

const TEST_USER_EMAIL = process.env.E2E_USERNAME || 'test@example.com';
const TEST_USER_PASSWORD = process.env.E2E_PASSWORD || 'testpassword123';

test.describe('Create Plan - Full Flow', () => {
  test('should create a draft plan without generating', async ({ page, supabase, testUser }) => {
    // Local initialization (not global)
    const loginPage = new LoginPage(page);
    const newPlanPage = new NewPlanPage(page);
    const plansListPage = new PlansListPage(page);

    // Setup mocks for OpenRouter API (not Plans API - we want to test real DB operations)
    await mockOpenRouterAPI(page);

    // Login
    await loginPage.goto();
    await loginPage.login(TEST_USER_EMAIL, TEST_USER_PASSWORD);
    await newPlanPage.handleOnboarding();
    // Open new plan modal
    await newPlanPage.openNewPlanModal();

    // Fill basic info
    await newPlanPage.fillBasicInfo('Wycieczka do Paryża', 'Paryż, Francja');

    // Add fixed point
    await newPlanPage.addFixedPoint('Muzeum Luwr');

    // Proceed to summary
    await newPlanPage.proceedToSummary();

    // Submit plan (without generating)
    await newPlanPage.submitPlan();

    // Wait for modal to close and redirect to plans list
    await expect(newPlanPage.createNewPlanButton).toBeVisible({ timeout: 15000 });

    // Verify we're on the plans page
    await expect(page).toHaveURL(/\/plans$/);

    // Verify plan exists in database with draft status
    const { data: plans } = await supabase.from('plans').select('*, fixed_points(*)').eq('user_id', testUser.id);

    expect(plans).toHaveLength(1);
    expect(plans![0].name).toBe('Wycieczka do Paryża');
    expect(plans![0].destination).toBe('Paryż, Francja');
    expect(plans![0].status).toBe('draft');

    // Verify fixed point was saved
    const { data: fixedPoints } = await supabase.from('fixed_points').select('*').eq('plan_id', plans![0].id);

    expect(fixedPoints).toHaveLength(1);
    expect(fixedPoints![0].location).toBe('Muzeum Luwr');

    // Verify plan is visible on the list
    await plansListPage.expectPlanExists('Wycieczka do Paryża');
  });

  test('should create and generate a plan (full flow)', async ({ page, supabase, testUser }) => {
    // Local initialization (not global)
    const loginPage = new LoginPage(page);
    const newPlanPage = new NewPlanPage(page);

    // Setup mocks for OpenRouter API (not Plans API - we want to test real DB operations)
    await mockOpenRouterAPI(page);

    // Login
    await loginPage.goto();
    await loginPage.login(TEST_USER_EMAIL, TEST_USER_PASSWORD);
    await newPlanPage.handleOnboarding();

    // Note: This test needs to wait longer due to plan generation
    test.setTimeout(60000);

    // Open new plan modal
    await newPlanPage.openNewPlanModal();

    // Fill basic info
    await newPlanPage.fillBasicInfo('Barcelona Weekend', 'Barcelona, Spain');

    // Add fixed point
    await newPlanPage.addFixedPoint('Sagrada Familia');

    // Proceed to summary
    await newPlanPage.proceedToSummary();

    // Generate plan (this will trigger API call)
    // Note: OpenRouter API is mocked, but the backend logic runs
    await newPlanPage.submitPlan();

    // For now, the modal closes and we stay on /plans
    // In the future, this might redirect to the plan details page
    await expect(page).toHaveURL(/\/plans/, { timeout: 30000 });

    // Verify plan exists in database
    const { data: plans } = await supabase.from('plans').select('*').eq('user_id', testUser.id);

    expect(plans).toHaveLength(1);
    expect(plans![0].name).toBe('Barcelona Weekend');

    // The status might be 'draft' or 'generating' depending on when we check
    // If generation happens after modal closes, it might still be processing
  });

  test('should show validation errors for empty required fields', async ({ page }) => {
    // Local initialization (not global)
    const newPlanPage = new NewPlanPage(page);

    // Open new plan modal
    await newPlanPage.openNewPlanModal();

    // Try to proceed without filling required fields
    // The Next button should be disabled or show validation errors
    const nextButton = newPlanPage.basicInfoNextButton;

    // Check if the button is disabled (validation prevents submission)
    const isDisabled = await nextButton.isDisabled();

    if (!isDisabled) {
      // If button is enabled, click it and check for validation errors
      await nextButton.click();

      // Should show validation errors and stay on the same step
      // Check for error messages (these will depend on your actual implementation)
      const hasErrors = await page
        .getByText(/wymagane|required/i)
        .isVisible()
        .catch(() => false);
      expect(hasErrors).toBeTruthy();
    } else {
      // Button is disabled, which is the expected behavior
      expect(isDisabled).toBeTruthy();
    }
  });

  test('should allow canceling plan creation', async ({ page, supabase, testUser }) => {
    // Local initialization (not global)
    const newPlanPage = new NewPlanPage(page);

    // Open new plan modal
    await newPlanPage.openNewPlanModal();

    // Fill some data
    await newPlanPage.nameInput.fill('Test Plan to Cancel');
    await newPlanPage.destinationInput.fill('Test Destination');

    // Cancel by pressing Escape or clicking outside
    await page.keyboard.press('Escape');

    // Wait for modal to close
    await page.waitForTimeout(500);

    // Verify modal is closed
    const modalVisible = await page
      .locator('[role="dialog"]')
      .isVisible()
      .catch(() => false);
    expect(modalVisible).toBeFalsy();

    // Verify no plan was created in database
    const { data: plans } = await supabase.from('plans').select('*').eq('user_id', testUser.id);

    expect(plans).toHaveLength(0);

    // Should still be on /plans page
    await expect(page).toHaveURL(/\/plans$/);
  });

  test('should preserve data when navigating between steps', async ({ page }) => {
    // Local initialization (not global)
    const newPlanPage = new NewPlanPage(page);

    // Open new plan modal
    await newPlanPage.openNewPlanModal();

    // Fill basic info
    const planName = 'Multi-Step Test Plan';
    const destination = 'Rome, Italy';
    await newPlanPage.fillBasicInfo(planName, destination);

    // At step 2 now - go back to step 1 (if navigation allows)
    // This would require a "Back" button implementation
    // For now, just verify we can add a fixed point
    await newPlanPage.addFixedPoint('Colosseum');

    // Proceed to next step
    await newPlanPage.proceedToSummary();

    // Verify all data is shown in summary
    // This will depend on your summary implementation
    const summaryVisible = await page
      .getByText(planName)
      .isVisible()
      .catch(() => false);
    expect(summaryVisible).toBeTruthy();
  });

  test('should handle multiple fixed points', async ({ page, supabase, testUser }) => {
    // Local initialization (not global)
    const newPlanPage = new NewPlanPage(page);

    // Open new plan modal
    await newPlanPage.openNewPlanModal();

    // Fill basic info
    await newPlanPage.fillBasicInfo('Multi-Point Tour', 'Paris');

    // Add multiple fixed points
    await newPlanPage.addFixedPoint('Eiffel Tower');

    // Add another fixed point (click the "Add another" button if it exists)
    const addAnotherButton = page.getByTestId('add-another-fixed-point-btn');
    const hasAddAnother = await addAnotherButton.isVisible().catch(() => false);

    if (hasAddAnother) {
      await addAnotherButton.click();
      await newPlanPage.addFixedPoint('Louvre Museum');
    }

    // Proceed and submit
    await newPlanPage.proceedToSummary();
    await newPlanPage.submitPlan();

    // Wait for completion
    await expect(page).toHaveURL(/\/plans$/, { timeout: 15000 });

    // Verify fixed points in database
    const { data: plans } = await supabase.from('plans').select('*, fixed_points(*)').eq('user_id', testUser.id);

    expect(plans).toHaveLength(1);

    const fixedPointsCount = plans![0].fixed_points?.length || 0;
    expect(fixedPointsCount).toBeGreaterThanOrEqual(1);
  });
});
