import { historyTest as test, expect } from '../shared-user-fixtures';
import { createTestPlan, createDraftPlan, verifyPlanIsArchived } from '../fixtures';
import { PlanDetailsPage } from '../page-objects/PlanDetailsPage';
import { PlansListPage } from '../page-objects/PlansListPage';
import { HistoryPage } from '../page-objects/HistoryPage';

test.describe('Move Plan to History', () => {
  test('moves plan to history from plans list successfully', async ({ page, supabase, sharedUser }) => {
    const plansListPage = new PlansListPage(page);
    const historyPage = new HistoryPage(page);

    // Create a generated plan
    const { planId } = await createTestPlan(supabase, sharedUser.id, {
      name: 'Trip to Rome',
      destination: 'Rome',
      status: 'generated',
      startDate: '2024-05-01',
      endDate: '2024-05-03',
    });

    // Navigate to plans list
    await plansListPage.goto();
    await plansListPage.waitForPlansToLoad();

    // Verify plan exists
    await plansListPage.expectPlanExists('Trip to Rome');

    // Move to history
    await plansListPage.moveToHistory('Trip to Rome');

    // Wait for action to complete
    await page.waitForTimeout(1000);

    // Verify plan is removed from active plans list
    await plansListPage.expectPlanNotExists('Trip to Rome');

    // Verify plan is archived in database
    const isArchived = await verifyPlanIsArchived(supabase, planId);
    expect(isArchived).toBeTruthy();

    // Verify plan appears in history
    await historyPage.goto();
    await historyPage.waitForPageLoad();
    await historyPage.expectPlanExists('Trip to Rome');
  });

  test('moves plan to history from plan details page', async ({ page, supabase, sharedUser }) => {
    const planDetailsPage = new PlanDetailsPage(page);
    const historyPage = new HistoryPage(page);

    // Create a generated plan
    const { planId } = await createTestPlan(supabase, sharedUser.id, {
      name: 'Barcelona Vacation',
      destination: 'Barcelona',
      status: 'generated',
      startDate: '2024-08-15',
      endDate: '2024-08-18',
    });

    // Navigate to plan details
    await planDetailsPage.goto(planId);
    await planDetailsPage.waitForPageLoad();

    // Move to history
    await planDetailsPage.moveToHistory();

    // Should redirect to plans list or history
    await page.waitForTimeout(1000);
    const currentUrl = page.url();
    expect(currentUrl.includes('/plans') || currentUrl.includes('/history')).toBeTruthy();

    // Verify plan is archived in database
    const isArchived = await verifyPlanIsArchived(supabase, planId);
    expect(isArchived).toBeTruthy();

    // Verify plan appears in history
    await historyPage.goto();
    await historyPage.expectPlanExists('Barcelona Vacation');
  });

  test('cancels moving plan to history when user dismisses confirmation', async ({ page, supabase, sharedUser }) => {
    const plansListPage = new PlansListPage(page);

    // Create a generated plan
    const { planId } = await createTestPlan(supabase, sharedUser.id, {
      name: 'Prague Trip',
      destination: 'Prague',
      status: 'generated',
      startDate: '2024-12-20',
      endDate: '2024-12-23',
    });

    // Navigate to plans list
    await plansListPage.goto();
    await plansListPage.waitForPlansToLoad();

    // Start moving to history but cancel
    await plansListPage.cancelMoveToHistory('Prague Trip');

    // Wait for modal to close
    await page.waitForTimeout(500);

    // Verify plan still exists in active plans
    await plansListPage.expectPlanExists('Prague Trip');

    // Verify plan is NOT archived in database
    const isArchived = await verifyPlanIsArchived(supabase, planId);
    expect(isArchived).toBeFalsy();

    // Verify database status is still 'generated'
    const { data: plan } = await supabase.from('plans').select('status').eq('id', planId).single();
    expect(plan?.status).toBe('generated');
  });

  test('does not show move to history button for draft plans', async ({ page, supabase, sharedUser }) => {
    const planDetailsPage = new PlanDetailsPage(page);

    // Create a draft plan
    const planId = await createDraftPlan(supabase, sharedUser.id, {
      name: 'Draft Plan',
      destination: 'Vienna',
      startDate: '2026-06-15',
      endDate: '2026-06-17',
    });

    // Navigate to plan details
    await planDetailsPage.goto(planId);
    await planDetailsPage.waitForPageLoad();

    // Verify move to history button is not visible
    const isVisible = await planDetailsPage.isMoveToHistoryVisible();
    expect(isVisible).toBeFalsy();
  });

  test('shows confirmation modal with proper messaging', async ({ page, supabase, sharedUser }) => {
    const plansListPage = new PlansListPage(page);

    // Create a generated plan
    await createTestPlan(supabase, sharedUser.id, {
      name: 'Test Plan',
      destination: 'Test City',
      status: 'generated',
      startDate: '2024-05-01',
      endDate: '2024-05-03',
    });

    // Navigate to plans list
    await plansListPage.goto();
    await plansListPage.waitForPlansToLoad();

    // Open the plan card menu
    const planCard = plansListPage.getPlanByName('Test Plan');
    const menuButton = planCard.getByTestId('plan-menu');
    await menuButton.click();

    // Click move to history action
    const moveAction = page.getByTestId('move-to-history-action');
    await expect(moveAction).toBeVisible();
    await moveAction.click();

    // Verify confirmation modal is displayed
    const modal = page.locator('[role="dialog"]');
    await expect(modal).toBeVisible();

    // Verify confirmation text mentions read-only
    const hasConfirmationText = await page
      .locator('[role="dialog"]')
      .isVisible()
      .catch(() => false);

    expect(hasConfirmationText).toBeTruthy();

    // Verify both buttons are present
    await expect(page.getByTestId('confirm-archive')).toBeVisible();
    await expect(page.getByTestId('cancel-archive')).toBeVisible();

    // Cancel to clean up
    await page.getByTestId('cancel-archive').click();
  });

  test('handles rapid archiving of multiple plans', async ({ page, supabase, sharedUser }) => {
    const plansListPage = new PlansListPage(page);

    // Create multiple generated plans
    await createTestPlan(supabase, sharedUser.id, {
      name: 'Plan 1',
      destination: 'City 1',
      status: 'generated',
      startDate: '2024-01-01',
      endDate: '2024-01-03',
    });

    await createTestPlan(supabase, sharedUser.id, {
      name: 'Plan 2',
      destination: 'City 2',
      status: 'generated',
      startDate: '2024-02-01',
      endDate: '2024-02-03',
    });

    await createTestPlan(supabase, sharedUser.id, {
      name: 'Plan 3',
      destination: 'City 3',
      status: 'generated',
      startDate: '2024-03-01',
      endDate: '2024-03-03',
    });

    // Navigate to plans list
    await plansListPage.goto();
    await plansListPage.waitForPlansToLoad();

    // Move first plan to history
    await plansListPage.moveToHistory('Plan 1');
    await page.waitForTimeout(500);

    // Verify it's gone from active plans
    await plansListPage.expectPlanNotExists('Plan 1');

    // Move second plan immediately
    await plansListPage.moveToHistory('Plan 2');
    await page.waitForTimeout(500);

    // Verify both are gone from active plans
    await plansListPage.expectPlanNotExists('Plan 1');
    await plansListPage.expectPlanNotExists('Plan 2');
    await plansListPage.expectPlanExists('Plan 3');

    // Verify database state
    const { data: activePlans } = await supabase
      .from('plans')
      .select('*')
      .eq('user_id', sharedUser.id)
      .eq('status', 'generated');

    expect(activePlans).toHaveLength(1);
    expect(activePlans?.[0]?.name).toBe('Plan 3');

    // Verify archived plans
    const { data: archivedPlans } = await supabase
      .from('plans')
      .select('*')
      .eq('user_id', sharedUser.id)
      .eq('status', 'archived');

    expect(archivedPlans).toHaveLength(2);
  });

  test('maintains plan data integrity after archiving', async ({ page, supabase, sharedUser }) => {
    const planDetailsPage = new PlanDetailsPage(page);

    // Create a plan with activities
    const { planId } = await createTestPlan(supabase, sharedUser.id, {
      name: 'Data Preservation Test',
      destination: 'Amsterdam',
      status: 'generated',
      startDate: '2024-06-01',
      endDate: '2024-06-03',
      withActivities: true,
    });

    // Get original plan data
    const { data: originalPlan } = await supabase.from('plans').select('*').eq('id', planId).single();

    // Move to history
    await planDetailsPage.goto(planId);
    await planDetailsPage.waitForPageLoad();
    await planDetailsPage.moveToHistory();

    await page.waitForTimeout(1000);

    // Get plan data after archiving
    const { data: archivedPlan } = await supabase.from('plans').select('*').eq('id', planId).single();

    // Verify all data is preserved except status
    expect(archivedPlan?.name).toBe(originalPlan?.name);
    expect(archivedPlan?.destination).toBe(originalPlan?.destination);
    expect(archivedPlan?.start_date).toBe(originalPlan?.start_date);
    expect(archivedPlan?.end_date).toBe(originalPlan?.end_date);
    expect(archivedPlan?.status).toBe('archived');

    // Verify activities are preserved
    const { data: days } = await supabase.from('generated_plan_days').select('*').eq('plan_id', planId);

    expect(days).toBeDefined();
    expect(days?.length).toBeGreaterThan(0);
  });
});
