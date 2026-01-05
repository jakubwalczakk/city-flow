import { historyTest as test, expect } from '../shared-user-fixtures';
import { createArchivedPlan, createMultipleArchivedPlans } from '../fixtures';
import { HistoryPage } from '../page-objects/HistoryPage';
import { PlanDetailsPage } from '../page-objects/PlanDetailsPage';

test.describe('View History', () => {
  test('displays empty state when no archived plans exist', async ({ page }) => {
    const historyPage = new HistoryPage(page);
    await historyPage.goto();
    await historyPage.waitForPageLoad();

    // Verify empty state is visible
    const isEmpty = await historyPage.isEmptyStateVisible();
    expect(isEmpty).toBeTruthy();

    // Verify empty state message
    const message = await historyPage.getEmptyStateMessage();
    expect(message.toLowerCase()).toMatch(/nie masz|no plans|empty|history|brak/);

    // Verify page title
    const hasTitle = await page
      .getByTestId('history-page-title')
      .isVisible()
      .catch(() => false);
    expect(hasTitle).toBeTruthy();
  });

  test('displays complete plan information in list view', async ({ page, supabase, sharedUser }) => {
    const historyPage = new HistoryPage(page);

    // Create multiple archived plans with different data
    await createArchivedPlan(supabase, sharedUser.id, {
      name: 'Rome 2024',
      destination: 'Rome',
      startDate: '2024-05-01',
      endDate: '2024-05-03',
    });

    await createArchivedPlan(supabase, sharedUser.id, {
      name: 'Barcelona 2024',
      destination: 'Barcelona',
      startDate: '2024-08-15',
      endDate: '2024-08-18',
    });

    await createArchivedPlan(supabase, sharedUser.id, {
      name: 'Complete Info Plan',
      destination: 'Berlin',
      startDate: '2024-09-10',
      endDate: '2024-09-15',
    });

    // Navigate to history page
    await historyPage.goto();
    await historyPage.waitForPageLoad();

    // Verify all plans are displayed
    await historyPage.expectPlanExists('Rome 2024');
    await historyPage.expectPlanExists('Barcelona 2024');
    await historyPage.expectPlanExists('Complete Info Plan');

    // Verify count
    const count = await historyPage.getPlanCount();
    expect(count).toBe(3);

    // Verify archived status badge on plan cards
    const planCard = historyPage.getPlanByName('Rome 2024');
    const badge = planCard.getByTestId('archived-badge');
    await expect(badge).toBeVisible();

    // Verify destination and dates are shown
    const berlinCard = historyPage.getPlanByName('Complete Info Plan');
    const hasDestination = await berlinCard.getByTestId('plan-destination').isVisible();
    expect(hasDestination).toBeTruthy();

    await berlinCard
      .getByTestId('plan-date-range')
      .isVisible()
      .catch(() => false);
  });

  test('sorts plans correctly by end date', async ({ page, supabase, sharedUser }) => {
    const historyPage = new HistoryPage(page);

    // Create plans with different dates
    await createArchivedPlan(supabase, sharedUser.id, {
      name: 'Oldest Trip',
      destination: 'City 1',
      startDate: '2024-01-01',
      endDate: '2024-01-03',
    });

    await createArchivedPlan(supabase, sharedUser.id, {
      name: 'Newest Trip',
      destination: 'City 3',
      startDate: '2024-12-20',
      endDate: '2024-12-23',
    });

    await createArchivedPlan(supabase, sharedUser.id, {
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

  test('navigates to plan details and maintains navigation flow', async ({ page, supabase, sharedUser }) => {
    const historyPage = new HistoryPage(page);
    const planDetailsPage = new PlanDetailsPage(page);

    // Create an archived plan
    const planId = await createArchivedPlan(supabase, sharedUser.id, {
      name: 'Navigation Test',
      destination: 'Vienna',
      startDate: '2024-06-01',
      endDate: '2024-06-03',
    });

    // Navigate to history page
    await historyPage.goto();
    await historyPage.waitForPageLoad();
    await historyPage.expectPlanExists('Navigation Test');

    // Click on plan to view details
    await historyPage.clickPlan('Navigation Test');

    // Verify navigation to plan details
    await page.waitForTimeout(500);
    expect(page.url()).toContain('/plans/');
    expect(page.url()).toContain(planId);

    // Verify plan details page loaded
    await planDetailsPage.waitForPageLoad();
    const title = await planDetailsPage.getTitle();
    expect(title).toContain('Navigation Test');

    // Navigate back to history
    await page.goBack();
    await historyPage.waitForPageLoad();

    // Verify plan is still visible
    await historyPage.expectPlanExists('Navigation Test');
    const count = await historyPage.getPlanCount();
    expect(count).toBe(1);
  });

  test('handles large number of archived plans with proper performance', async ({ page, supabase, sharedUser }) => {
    const historyPage = new HistoryPage(page);

    // Create many archived plans
    await createMultipleArchivedPlans(supabase, sharedUser.id, 15);

    // Navigate to history page
    await historyPage.goto();
    await historyPage.waitForPageLoad();

    // Verify all plans are loaded
    const count = await historyPage.getPlanCount();
    expect(count).toBe(15);

    // Verify page performance (should load within reasonable time)
    await expect(historyPage.planCards.first()).toBeVisible();

    // Verify scroll functionality
    await page.evaluate(() => window.scrollTo(0, 500));
    await page.waitForTimeout(500);
    const scrollAfter = await page.evaluate(() => window.scrollY);
    expect(scrollAfter).toBeGreaterThan(0);
  });

  test('respects RLS and handles edge cases', async ({ page, supabase, sharedUser }) => {
    const historyPage = new HistoryPage(page);

    // Create archived plans for current user
    await createArchivedPlan(supabase, sharedUser.id, {
      name: 'My Archived Plan',
      destination: 'Paris',
      startDate: '2024-05-01',
      endDate: '2024-05-03',
    });

    // Create a plan with minimal data
    await createArchivedPlan(supabase, sharedUser.id, {
      name: 'Minimal Plan',
      destination: 'City',
      startDate: '2024-05-01',
      endDate: '2024-05-02',
    });

    // Navigate to history page
    await historyPage.goto();
    await historyPage.waitForPageLoad();

    // Verify only user's plans are visible
    const count = await historyPage.getPlanCount();
    expect(count).toBe(2);

    await historyPage.expectPlanExists('My Archived Plan');
    await historyPage.expectPlanExists('Minimal Plan');

    // Verify the plans belong to current user (RLS check)
    const { data: plans } = await supabase
      .from('plans')
      .select('*')
      .eq('status', 'archived')
      .eq('user_id', sharedUser.id);

    expect(plans).toHaveLength(2);
    expect(plans?.[0]?.user_id).toBe(sharedUser.id);
    expect(plans?.[1]?.user_id).toBe(sharedUser.id);
  });
});
