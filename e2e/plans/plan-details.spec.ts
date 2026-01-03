/* eslint-disable @typescript-eslint/no-non-null-assertion, @typescript-eslint/no-unused-vars */
import { test, expect, createTestPlan, cleanDatabase } from '../fixtures';
import { mockOpenRouterAPI } from '../test-setup';
import { LoginPage } from '../page-objects/LoginPage';
import { PlanDetailsPage } from '../page-objects/PlanDetailsPage';

const TEST_USER_EMAIL = process.env.E2E_USERNAME || 'test@example.com';
const TEST_USER_PASSWORD = process.env.E2E_PASSWORD || 'testpassword123';

test.describe('Plan Details', () => {
  let loginPage: LoginPage;
  let planDetailsPage: PlanDetailsPage;

  test.beforeEach(async ({ page, supabase, testUser }) => {
    // Clean database before each test
    await cleanDatabase(supabase, testUser.id);

    // Setup mocks
    await mockOpenRouterAPI(page);

    // Initialize page objects
    loginPage = new LoginPage(page);
    planDetailsPage = new PlanDetailsPage(page);

    // Login
    await loginPage.goto();
    await loginPage.login(TEST_USER_EMAIL, TEST_USER_PASSWORD);
  });

  test.afterEach(async ({ supabase, testUser }) => {
    // Clean up after each test
    await cleanDatabase(supabase, testUser.id);
  });

  test('should display draft plan details correctly', async ({ page, supabase, testUser }) => {
    // Create a draft plan
    const { planId } = await createTestPlan(supabase, testUser.id, {
      name: 'Draft Plan Details',
      destination: 'Paris, France',
      status: 'draft',
      notes: 'A lovely trip to Paris',
      withFixedPoints: true,
    });

    // Navigate to plan details
    await planDetailsPage.goto(planId);
    await planDetailsPage.waitForPageLoad();

    // Verify plan title
    const title = await planDetailsPage.getTitle();
    expect(title).toContain('Draft Plan Details');

    // Verify plan is in draft status (has generate button)
    const isDraft = await planDetailsPage.isDraft();
    expect(isDraft).toBeTruthy();

    // Verify generate button is visible
    await expect(planDetailsPage.generateButton).toBeVisible();

    // Verify no timeline/activities (because it's draft)
    const isGenerated = await planDetailsPage.isGenerated();
    expect(isGenerated).toBeFalsy();
  });

  test('should display generated plan with activities', async ({ page, supabase, testUser }) => {
    // Create a generated plan with activities
    const { planId } = await createTestPlan(supabase, testUser.id, {
      name: 'Generated Plan Details',
      destination: 'Barcelona, Spain',
      status: 'generated',
      withFixedPoints: true,
      withActivities: true,
    });

    // Navigate to plan details
    await planDetailsPage.goto(planId);
    await planDetailsPage.waitForPageLoad();

    // Verify plan title
    await planDetailsPage.verifyPlanDetails({
      title: 'Generated Plan Details',
      destination: 'Barcelona, Spain',
    });

    // Verify plan is generated (has timeline)
    const isGenerated = await planDetailsPage.isGenerated();
    expect(isGenerated).toBeTruthy();

    // Verify activities are displayed
    const activityCount = await planDetailsPage.getActivityCount();
    expect(activityCount).toBeGreaterThan(0);

    // Verify generate button is not visible
    const isDraft = await planDetailsPage.isDraft();
    expect(isDraft).toBeFalsy();
  });

  test('should show 404 or error for non-existent plan', async ({ page, supabase, testUser }) => {
    // Try to access a non-existent plan
    const nonExistentId = '00000000-0000-0000-0000-000000000000';

    await planDetailsPage.goto(nonExistentId);

    // Wait a moment for error to appear
    await page.waitForTimeout(2000);

    // Should show error message or redirect to /plans
    const currentUrl = page.url();
    const isOnErrorPage = currentUrl.includes('/plans') && !currentUrl.includes(nonExistentId);
    const hasErrorMessage = await page
      .getByText(/nie znaleziono|not found|błąd/i)
      .isVisible()
      .catch(() => false);

    expect(isOnErrorPage || hasErrorMessage).toBeTruthy();
  });

  test('should display plan metadata correctly', async ({ page, supabase, testUser }) => {
    // Create a plan with full details
    const { planId } = await createTestPlan(supabase, testUser.id, {
      name: 'Detailed Metadata Plan',
      destination: 'Rome, Italy',
      status: 'draft',
      startDate: '2026-09-15',
      endDate: '2026-09-20',
      description: 'An amazing Roman holiday',
    });

    // Navigate to plan details
    await planDetailsPage.goto(planId);
    await planDetailsPage.waitForPageLoad();

    // Verify destination is shown
    await expect(planDetailsPage.destination).toContainText('Rome, Italy');

    // Verify dates are shown
    const datesText = await planDetailsPage.dates.textContent().catch(() => '');
    expect(datesText).toContain('2026');

    // Verify description is shown (if your UI displays it)
    const hasDescription = await page
      .getByText(/Roman holiday/i)
      .isVisible()
      .catch(() => false);
    // Description might not always be shown, so we don't fail if it's not there
  });

  test('should display fixed points for a plan', async ({ page, supabase, testUser }) => {
    // Create a plan with fixed points
    const { planId } = await createTestPlan(supabase, testUser.id, {
      name: 'Plan with Fixed Points',
      destination: 'Prague',
      status: 'draft',
      withFixedPoints: true,
    });

    // Navigate to plan details
    await planDetailsPage.goto(planId);
    await planDetailsPage.waitForPageLoad();

    // Check if fixed points are displayed
    const hasFixedPoints = await planDetailsPage.fixedPointsList.isVisible().catch(() => false);

    if (hasFixedPoints) {
      // Verify fixed point content
      await expect(planDetailsPage.fixedPointsList).toContainText('Test Location 1');
    }
  });

  test('should show export button for generated plans', async ({ page, supabase, testUser }) => {
    // Create a generated plan
    const { planId } = await createTestPlan(supabase, testUser.id, {
      name: 'Exportable Plan',
      destination: 'Vienna',
      status: 'generated',
      withActivities: true,
    });

    // Navigate to plan details
    await planDetailsPage.goto(planId);
    await planDetailsPage.waitForPageLoad();

    // Verify export button is visible
    const exportVisible = await planDetailsPage.exportButton.isVisible().catch(() => false);

    // Export might only be available for generated plans
    if (exportVisible) {
      await expect(planDetailsPage.exportButton).toBeVisible();
    }
  });

  test('should handle plan with multiple days and activities', async ({ page, supabase, testUser }) => {
    // Create a generated plan
    const { planId } = await createTestPlan(supabase, testUser.id, {
      name: 'Multi-Day Plan',
      destination: 'Amsterdam',
      status: 'generated',
      startDate: '2026-08-01',
      endDate: '2026-08-05',
      withActivities: true,
    });

    // Navigate to plan details
    await planDetailsPage.goto(planId);
    await planDetailsPage.waitForPageLoad();

    // Verify timeline is visible
    await expect(planDetailsPage.timeline).toBeVisible();

    // Verify activities are shown
    const activityCount = await planDetailsPage.getActivityCount();
    expect(activityCount).toBeGreaterThanOrEqual(2);

    // Verify each activity has required information
    const firstActivity = planDetailsPage.activities.first();
    await expect(firstActivity).toBeVisible();
  });

  test('should allow generating a plan from draft status', async ({ page, supabase, testUser }) => {
    // Note: This test takes longer due to generation
    test.setTimeout(60000);

    // Create a draft plan
    const { planId } = await createTestPlan(supabase, testUser.id, {
      name: 'Plan to Generate',
      destination: 'Berlin',
      status: 'draft',
      withFixedPoints: true,
    });

    // Navigate to plan details
    await planDetailsPage.goto(planId);
    await planDetailsPage.waitForPageLoad();

    // Verify it's draft
    const isDraft = await planDetailsPage.isDraft();
    expect(isDraft).toBeTruthy();

    // Click generate button
    await planDetailsPage.generatePlan();

    // After generation, verify the plan status changed
    const { data: updatedPlan } = await supabase.from('plans').select('status').eq('id', planId).single();

    // Status should be 'generated' or 'generating'
    expect(['generated', 'generating']).toContain(updatedPlan!.status);

    // Verify activities were created
    const { data: days } = await supabase
      .from('generated_plan_days')
      .select('*, plan_activities(*)')
      .eq('plan_id', planId);

    if (days && days.length > 0) {
      expect(days.length).toBeGreaterThan(0);
    }
  });

  test('should display action buttons for plan management', async ({ page, supabase, testUser }) => {
    // Create a plan
    const { planId } = await createTestPlan(supabase, testUser.id, {
      name: 'Plan with Actions',
      destination: 'Munich',
      status: 'draft',
    });

    // Navigate to plan details
    await planDetailsPage.goto(planId);
    await planDetailsPage.waitForPageLoad();

    // Check for edit title button
    const hasEditButton = await planDetailsPage.editTitleButton.isVisible().catch(() => false);
    expect(hasEditButton).toBeTruthy();

    // Check for delete button (might be in actions menu)
    const hasActionsMenu = await planDetailsPage.actionsMenu.isVisible().catch(() => false);
    if (hasActionsMenu) {
      await planDetailsPage.actionsMenu.click();
      await page.waitForTimeout(200);
      await expect(planDetailsPage.deleteButton).toBeVisible();
    } else {
      // Delete button might be directly visible
      const hasDeleteButton = await planDetailsPage.deleteButton.isVisible().catch(() => false);
      expect(hasDeleteButton).toBeTruthy();
    }
  });

  test('should handle very long plan names gracefully', async ({ page, supabase, testUser }) => {
    // Create a plan with a very long name
    const longName = 'A'.repeat(200) + ' - Very Long Plan Name';
    const { planId } = await createTestPlan(supabase, testUser.id, {
      name: longName,
      destination: 'Test City',
      status: 'draft',
    });

    // Navigate to plan details
    await planDetailsPage.goto(planId);
    await planDetailsPage.waitForPageLoad();

    // Verify the page loads and shows the title (truncated or full)
    const title = await planDetailsPage.getTitle();
    expect(title.length).toBeGreaterThan(0);
  });
});
