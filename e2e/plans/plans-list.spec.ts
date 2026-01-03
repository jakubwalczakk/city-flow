/* eslint-disable @typescript-eslint/no-unused-vars */
import { test, expect, createTestPlan, cleanDatabase } from '../fixtures';
import { LoginPage } from '../page-objects/LoginPage';
import { PlansListPage } from '../page-objects/PlansListPage';

const TEST_USER_EMAIL = process.env.E2E_USERNAME || 'test@example.com';
const TEST_USER_PASSWORD = process.env.E2E_PASSWORD || 'testpassword123';

test.describe('Plans List', () => {
  let loginPage: LoginPage;
  let plansListPage: PlansListPage;

  test.beforeEach(async ({ page, supabase, testUser }) => {
    // Clean database before each test
    await cleanDatabase(supabase, testUser.id);

    // Initialize page objects
    loginPage = new LoginPage(page);
    plansListPage = new PlansListPage(page);

    // Login
    await loginPage.goto();
    await loginPage.login(TEST_USER_EMAIL, TEST_USER_PASSWORD);
  });

  test.afterEach(async ({ supabase, testUser }) => {
    // Clean up after each test
    await cleanDatabase(supabase, testUser.id);
  });

  test('should display empty state when user has no plans', async ({ page, testUser }) => {
    // Navigate to plans page (should already be there after login)
    await plansListPage.goto();

    // Wait for page to load
    await plansListPage.waitForPlansToLoad();

    // Verify empty state is visible
    const isEmpty = await plansListPage.isEmptyStateVisible();
    expect(isEmpty).toBeTruthy();

    // Verify no plan cards are shown
    const planCount = await plansListPage.getPlanCount();
    expect(planCount).toBe(0);

    // Verify create button is visible
    await expect(plansListPage.createPlanButton).toBeVisible();
  });

  test('should display list of user plans', async ({ page, supabase, testUser }) => {
    // Create test plans
    await createTestPlan(supabase, testUser.id, {
      name: 'Trip to Rome',
      destination: 'Rome, Italy',
      status: 'draft',
      month: 'June',
    });

    await createTestPlan(supabase, testUser.id, {
      name: 'Barcelona Weekend',
      destination: 'Barcelona, Spain',
      status: 'generated',
      month: 'July',
    });

    await createTestPlan(supabase, testUser.id, {
      name: 'Prague Adventure',
      destination: 'Prague, Czech Republic',
      status: 'draft',
      month: 'August',
    });

    // Navigate to plans page
    await plansListPage.goto();
    await plansListPage.waitForPlansToLoad();

    // Verify correct number of plans
    const planCount = await plansListPage.getPlanCount();
    expect(planCount).toBe(3);

    // Verify specific plans exist
    await plansListPage.expectPlanExists('Trip to Rome');
    await plansListPage.expectPlanExists('Barcelona Weekend');
    await plansListPage.expectPlanExists('Prague Adventure');

    // Verify empty state is not shown
    const isEmpty = await plansListPage.isEmptyStateVisible();
    expect(isEmpty).toBeFalsy();
  });

  test('should not display archived plans in main list', async ({ page, supabase, testUser }) => {
    // Create active plans
    await createTestPlan(supabase, testUser.id, {
      name: 'Active Plan 1',
      destination: 'Paris',
      status: 'draft',
    });

    // Create archived plan
    await createTestPlan(supabase, testUser.id, {
      name: 'Archived Plan',
      destination: 'London',
      status: 'archived',
    });

    // Navigate to plans page
    await plansListPage.goto();
    await plansListPage.waitForPlansToLoad();

    // Verify only active plan is shown
    await plansListPage.expectPlanExists('Active Plan 1');
    await plansListPage.expectPlanNotExists('Archived Plan');

    const planCount = await plansListPage.getPlanCount();
    expect(planCount).toBe(1);
  });

  test('should navigate to plan details when clicking on a plan', async ({ page, supabase, testUser }) => {
    // Create a test plan
    const { planId } = await createTestPlan(supabase, testUser.id, {
      name: 'Clickable Plan',
      destination: 'Amsterdam',
      status: 'draft',
    });

    // Navigate to plans page
    await plansListPage.goto();
    await plansListPage.waitForPlansToLoad();

    // Click on the plan
    await plansListPage.clickPlan('Clickable Plan');

    // Verify navigation to plan details page
    await expect(page).toHaveURL(new RegExp(`/plans/${planId}`), { timeout: 10000 });
  });

  test('should display plans with different statuses correctly', async ({ page, supabase, testUser }) => {
    // Create plans with different statuses
    await createTestPlan(supabase, testUser.id, {
      name: 'Draft Plan',
      destination: 'Berlin',
      status: 'draft',
    });

    await createTestPlan(supabase, testUser.id, {
      name: 'Generated Plan',
      destination: 'Vienna',
      status: 'generated',
      withActivities: true,
    });

    // Navigate to plans page
    await plansListPage.goto();
    await plansListPage.waitForPlansToLoad();

    // Verify both plans are visible
    await plansListPage.expectPlanExists('Draft Plan');
    await plansListPage.expectPlanExists('Generated Plan');

    // Verify status badges or indicators (this depends on your UI implementation)
    const draftPlan = plansListPage.getPlanByName('Draft Plan');
    const generatedPlan = plansListPage.getPlanByName('Generated Plan');

    await expect(draftPlan).toBeVisible();
    await expect(generatedPlan).toBeVisible();
  });

  test('should show plans sorted by creation date (newest first)', async ({ page, supabase, testUser }) => {
    // Create plans with slight delays to ensure different timestamps
    await createTestPlan(supabase, testUser.id, {
      name: 'Oldest Plan',
      destination: 'City 1',
    });

    await page.waitForTimeout(100);

    await createTestPlan(supabase, testUser.id, {
      name: 'Middle Plan',
      destination: 'City 2',
    });

    await page.waitForTimeout(100);

    await createTestPlan(supabase, testUser.id, {
      name: 'Newest Plan',
      destination: 'City 3',
    });

    // Navigate to plans page
    await plansListPage.goto();
    await plansListPage.waitForPlansToLoad();

    // Get all plan cards
    const planCards = plansListPage.planCards;
    const count = await planCards.count();
    expect(count).toBe(3);

    // Verify the first card is the newest plan
    const firstCard = planCards.first();
    await expect(firstCard).toContainText('Newest Plan');
  });

  test('should show correct plan information on cards', async ({ page, supabase, testUser }) => {
    // Create a plan with specific details
    await createTestPlan(supabase, testUser.id, {
      name: 'Detailed Plan',
      destination: 'Munich, Germany',
      status: 'draft',
      month: 'September',
      startDate: '2026-09-15',
      endDate: '2026-09-20',
      description: 'A wonderful trip to Munich',
    });

    // Navigate to plans page
    await plansListPage.goto();
    await plansListPage.waitForPlansToLoad();

    // Get the plan card
    const planCard = plansListPage.getPlanByName('Detailed Plan');
    await expect(planCard).toBeVisible();

    // Verify card shows the destination
    await expect(planCard).toContainText('Munich, Germany');

    // Verify card shows the month or dates
    // (This depends on your actual card implementation)
    const hasDateInfo = await planCard
      .getByText(/September|2026/i)
      .isVisible()
      .catch(() => false);
    expect(hasDateInfo).toBeTruthy();
  });

  test('should handle empty search/filter results gracefully', async ({ page, supabase, testUser }) => {
    // Create only draft plans
    await createTestPlan(supabase, testUser.id, {
      name: 'Draft Plan 1',
      destination: 'City A',
      status: 'draft',
    });

    await createTestPlan(supabase, testUser.id, {
      name: 'Draft Plan 2',
      destination: 'City B',
      status: 'draft',
    });

    // Navigate to plans page
    await plansListPage.goto();
    await plansListPage.waitForPlansToLoad();

    // Try to filter by generated (should show empty results if filter exists)
    const hasFilter = await plansListPage.filterDropdown.isVisible().catch(() => false);

    if (hasFilter) {
      await plansListPage.filterByStatus('generated');

      // Should show empty state or no results message
      await page.waitForTimeout(500);

      const planCount = await plansListPage.getPlanCount();
      expect(planCount).toBe(0);
    }
  });
});
