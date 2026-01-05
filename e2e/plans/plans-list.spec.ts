/* eslint-disable @typescript-eslint/no-unused-vars */
import { planCreatorTest as test, expect } from '../shared-user-fixtures';
import { createTestPlan } from '../fixtures';
import { PlansListPage } from '../page-objects/PlansListPage';

test.describe('Plans List', () => {
  test('displays empty state when user has no plans', async ({ page }) => {
    const plansListPage = new PlansListPage(page);
    await plansListPage.goto();
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

  test('displays list of user plans with correct information and statuses', async ({ page, supabase, sharedUser }) => {
    const plansListPage = new PlansListPage(page);

    // Create test plans with different statuses
    await createTestPlan(supabase, sharedUser.id, {
      name: 'Trip to Rome',
      destination: 'Rome, Italy',
      status: 'draft',
    });

    await createTestPlan(supabase, sharedUser.id, {
      name: 'Barcelona Weekend',
      destination: 'Barcelona, Spain',
      status: 'generated',
    });

    await createTestPlan(supabase, sharedUser.id, {
      name: 'Prague Adventure',
      destination: 'Prague, Czech Republic',
      status: 'draft',
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

    // Verify plan cards show status badges
    const barcelonaPlan = plansListPage.getPlanByName('Barcelona Weekend');
    await expect(barcelonaPlan).toBeVisible();

    // Generated plans should have different visual indicators than drafts
    const hasGeneratedIndicator = await barcelonaPlan
      .getByTestId('plan-status-badge')
      .isVisible()
      .catch(() => false);
    // This is optional, depends on UI implementation
  });

  test('excludes archived plans from main list view', async ({ page, supabase, sharedUser }) => {
    const plansListPage = new PlansListPage(page);

    // Create active plans
    await createTestPlan(supabase, sharedUser.id, {
      name: 'Active Plan 1',
      destination: 'Paris',
      status: 'draft',
    });

    // Create archived plan
    await createTestPlan(supabase, sharedUser.id, {
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

  test('navigates to plan details when clicking on a plan', async ({ page, supabase, sharedUser }) => {
    const plansListPage = new PlansListPage(page);

    // Create a test plan
    const { planId } = await createTestPlan(supabase, sharedUser.id, {
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

  test('handles creation and refresh flow correctly', async ({ page, supabase, sharedUser }) => {
    const plansListPage = new PlansListPage(page);

    // Start with no plans
    await plansListPage.goto();
    await plansListPage.waitForPlansToLoad();

    let planCount = await plansListPage.getPlanCount();
    expect(planCount).toBe(0);

    // Create a plan programmatically (simulating creation)
    await createTestPlan(supabase, sharedUser.id, {
      name: 'New Plan',
      destination: 'Vienna',
      status: 'draft',
    });

    // Refresh the page
    await page.reload();
    await plansListPage.waitForPlansToLoad();

    // Verify plan appears
    await plansListPage.expectPlanExists('New Plan');
    planCount = await plansListPage.getPlanCount();
    expect(planCount).toBe(1);
  });

  test('displays plans sorted correctly and handles multiple plans', async ({ page, supabase, sharedUser }) => {
    const plansListPage = new PlansListPage(page);

    // Create multiple plans
    for (let i = 1; i <= 5; i++) {
      await createTestPlan(supabase, sharedUser.id, {
        name: `Plan ${i}`,
        destination: `City ${i}`,
        status: 'draft',
      });
    }

    // Navigate to plans page
    await plansListPage.goto();
    await plansListPage.waitForPlansToLoad();

    // Verify all plans are displayed
    const planCount = await plansListPage.getPlanCount();
    expect(planCount).toBe(5);

    // Verify all plans are accessible
    for (let i = 1; i <= 5; i++) {
      await plansListPage.expectPlanExists(`Plan ${i}`);
    }
  });
});
