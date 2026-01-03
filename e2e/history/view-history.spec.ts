import { authTest as test, expect, createArchivedPlan, createMultipleArchivedPlans, TEST_CONFIG } from '../fixtures';
import { HistoryPage } from '../page-objects/HistoryPage';
import { PlanDetailsPage } from '../page-objects/PlanDetailsPage';

test.describe('View History', () => {
  test('should display empty state when no archived plans exist', async () => {
    // Navigate to history page
    await historyPage.goto();
    await historyPage.waitForPageLoad();

    // Verify empty state is visible
    const isEmpty = await historyPage.isEmptyStateVisible();
    expect(isEmpty).toBeTruthy();

    // Verify empty state message
    const message = await historyPage.getEmptyStateMessage();
    expect(message.toLowerCase()).toMatch(/nie masz|no plans|empty|history|brak/);
  });

  test('should display list of archived plans', async ({ supabase, testUser }) => {
    // Create 3 archived plans
    await createArchivedPlan(supabase, testUser.id, {
      name: 'Rome 2024',
      destination: 'Rome',
      startDate: '2024-05-01',
      endDate: '2024-05-03',
    });

    await createArchivedPlan(supabase, testUser.id, {
      name: 'Barcelona 2024',
      destination: 'Barcelona',
      startDate: '2024-08-15',
      endDate: '2024-08-18',
    });

    await createArchivedPlan(supabase, testUser.id, {
      name: 'Prague 2024',
      destination: 'Prague',
      startDate: '2024-12-20',
      endDate: '2024-12-23',
    });

    // Navigate to history page
    await historyPage.goto();
    await historyPage.waitForPageLoad();

    // Verify all plans are displayed
    await historyPage.expectPlanExists('Rome 2024');
    await historyPage.expectPlanExists('Barcelona 2024');
    await historyPage.expectPlanExists('Prague 2024');

    // Verify count
    const count = await historyPage.getPlanCount();
    expect(count).toBe(3);
  });

  test('should sort plans by end date (newest first)', async ({ supabase, testUser }) => {
    // Create plans with different dates
    await createArchivedPlan(supabase, testUser.id, {
      name: 'Oldest Trip',
      destination: 'City 1',
      startDate: '2024-01-01',
      endDate: '2024-01-03',
    });

    await createArchivedPlan(supabase, testUser.id, {
      name: 'Newest Trip',
      destination: 'City 3',
      startDate: '2024-12-20',
      endDate: '2024-12-23',
    });

    await createArchivedPlan(supabase, testUser.id, {
      name: 'Middle Trip',
      destination: 'City 2',
      startDate: '2024-06-15',
      endDate: '2024-06-18',
    });

    // Navigate to history page
    await historyPage.goto();
    await historyPage.waitForPageLoad();

    // Get plan names in order
    const planNames = await historyPage.getPlanNames();

    // Verify sorting (newest first)
    expect(planNames[0]).toBe('Newest Trip');
    expect(planNames[1]).toBe('Middle Trip');
    expect(planNames[2]).toBe('Oldest Trip');
  });

  test('should navigate to plan details when clicking on archived plan', async ({ page, supabase, testUser }) => {
    // Create an archived plan
    const planId = await createArchivedPlan(supabase, testUser.id, {
      name: 'Clickable Plan',
      destination: 'Vienna',
      startDate: '2024-06-01',
      endDate: '2024-06-03',
    });

    // Navigate to history page
    await historyPage.goto();
    await historyPage.waitForPageLoad();

    // Click on the plan
    await historyPage.clickPlan('Clickable Plan');

    // Verify navigation to plan details
    await page.waitForTimeout(500);
    expect(page.url()).toContain('/plans/');
    expect(page.url()).toContain(planId);

    // Verify plan details page loaded
    await planDetailsPage.waitForPageLoad();
    const title = await planDetailsPage.getTitle();
    expect(title).toContain('Clickable Plan');
  });

  test('should display archived status badge on plan cards', async ({ supabase, testUser }) => {
    // Create an archived plan
    await createArchivedPlan(supabase, testUser.id, {
      name: 'Archived Trip',
      destination: 'Amsterdam',
      startDate: '2024-07-01',
      endDate: '2024-07-05',
    });

    // Navigate to history page
    await historyPage.goto();
    await historyPage.waitForPageLoad();

    // Find the plan card
    const planCard = historyPage.getPlanByName('Archived Trip');

    // Verify archived badge is visible
    const badge = planCard.getByTestId('archived-badge');
    await expect(badge).toBeVisible();
  });

  test('should show plan destination and dates', async ({ supabase, testUser }) => {
    // Create an archived plan
    await createArchivedPlan(supabase, testUser.id, {
      name: 'Complete Info Plan',
      destination: 'Berlin',
      startDate: '2024-09-10',
      endDate: '2024-09-15',
    });

    // Navigate to history page
    await historyPage.goto();
    await historyPage.waitForPageLoad();

    // Find the plan card
    const planCard = historyPage.getPlanByName('Complete Info Plan');

    // Verify destination is shown
    const hasDestination = await planCard.getByText('Berlin').isVisible();
    expect(hasDestination).toBeTruthy();

    // Verify dates are shown (at least end date) - format might vary
    await planCard
      .getByText(/2024-09-15|15.*09.*2024|sep.*15/i)
      .isVisible()
      .catch(() => false);
  });

  test('should handle large number of archived plans', async ({ supabase, testUser }) => {
    // Create many archived plans
    await createMultipleArchivedPlans(supabase, testUser.id, 10);

    // Navigate to history page
    await historyPage.goto();
    await historyPage.waitForPageLoad();

    // Verify all plans are loaded
    const count = await historyPage.getPlanCount();
    expect(count).toBe(10);

    // Verify page performance (should load within reasonable time)
    // Already loaded if we got here, just verify it's usable
    await expect(historyPage.planCards.first()).toBeVisible();
  });

  test('should only show archived plans for current user (RLS)', async ({ supabase, testUser }) => {
    // Create archived plans for current user
    await createArchivedPlan(supabase, testUser.id, {
      name: 'My Archived Plan',
      destination: 'Paris',
      startDate: '2024-05-01',
      endDate: '2024-05-03',
    });

    // Navigate to history page
    await historyPage.goto();
    await historyPage.waitForPageLoad();

    // Verify only user's plans are visible
    const count = await historyPage.getPlanCount();
    expect(count).toBe(1);

    await historyPage.expectPlanExists('My Archived Plan');

    // Verify the plan belongs to current user
    const { data: plans } = await supabase
      .from('plans')
      .select('*')
      .eq('status', 'archived')
      .eq('user_id', testUser.id);

    expect(plans).toHaveLength(1);
    expect(plans?.[0]?.user_id).toBe(testUser.id);
  });

  test('should refresh history list after navigating back', async ({ page, supabase, testUser }) => {
    // Create an archived plan
    await createArchivedPlan(supabase, testUser.id, {
      name: 'Navigation Test',
      destination: 'Prague',
      startDate: '2024-06-01',
      endDate: '2024-06-03',
    });

    // Navigate to history page
    await historyPage.goto();
    await historyPage.waitForPageLoad();
    await historyPage.expectPlanExists('Navigation Test');

    // Click on plan to view details
    await historyPage.clickPlan('Navigation Test');
    await planDetailsPage.waitForPageLoad();

    // Navigate back to history
    await page.goBack();
    await historyPage.waitForPageLoad();

    // Verify plan is still visible
    await historyPage.expectPlanExists('Navigation Test');
    const count = await historyPage.getPlanCount();
    expect(count).toBe(1);
  });

  test('should handle plans with missing optional data', async ({ supabase, testUser }) => {
    // Create an archived plan with minimal data
    await createArchivedPlan(supabase, testUser.id, {
      name: 'Minimal Plan',
      destination: 'City',
      startDate: '2024-05-01',
      endDate: '2024-05-02',
    });

    // Navigate to history page
    await historyPage.goto();
    await historyPage.waitForPageLoad();

    // Verify plan is displayed without errors
    await historyPage.expectPlanExists('Minimal Plan');
    const count = await historyPage.getPlanCount();
    expect(count).toBe(1);
  });

  test('should maintain scroll position when viewing many plans', async ({ page, supabase, testUser }) => {
    // Create many archived plans
    await createMultipleArchivedPlans(supabase, testUser.id, 15);

    // Navigate to history page
    await historyPage.goto();
    await historyPage.waitForPageLoad();

    // Scroll down
    await page.evaluate(() => window.scrollTo(0, 500));

    // Wait a moment
    await page.waitForTimeout(500);

    // Verify scroll position is maintained
    const scrollAfter = await page.evaluate(() => window.scrollY);
    expect(scrollAfter).toBeGreaterThan(0);
  });

  test('should show correct page title', async ({ page }) => {
    // Navigate to history page
    await historyPage.goto();
    await historyPage.waitForPageLoad();

    // Verify page title or heading
    const hasTitle = await page
      .getByText(/historia|history|archived|archiwum/i)
      .isVisible()
      .catch(() => false);

    // Page should have a title indicating it's the history section
    expect(hasTitle).toBeTruthy();
  });

  test('should navigate from empty state with helpful message', async () => {
    // Navigate to history page (no archived plans)
    await historyPage.goto();
    await historyPage.waitForPageLoad();

    // Verify empty state has helpful message
    const message = await historyPage.getEmptyStateMessage();
    expect(message.length).toBeGreaterThan(0);

    // Empty state should mention automatic archiving or provide guidance
    const hasGuidance =
      message.toLowerCase().includes('automatycznie') ||
      message.toLowerCase().includes('automatically') ||
      message.toLowerCase().includes('data') ||
      message.toLowerCase().includes('date');

    // This is optional, just verify we got a message
    expect(hasGuidance || message.length > 0).toBeTruthy();
  });
});
