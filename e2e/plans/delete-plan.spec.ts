/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { planEditorTest as test, expect } from '../shared-user-fixtures';
import { createTestPlan } from '../fixtures';
import { PlanDetailsPage } from '../page-objects/PlanDetailsPage';
import { PlansListPage } from '../page-objects/PlansListPage';

test.describe('Delete Plan', () => {
  test('deletes plan from list view and removes from database', async ({ page, supabase, sharedUser }) => {
    const plansListPage = new PlansListPage(page);

    // Create test plans
    await createTestPlan(supabase, sharedUser.id, {
      name: 'Plan to Delete',
      destination: 'Paris',
      status: 'draft',
    });

    await createTestPlan(supabase, sharedUser.id, {
      name: 'Plan to Keep',
      destination: 'Rome',
      status: 'draft',
    });

    // Navigate to plans list
    await plansListPage.goto();
    await plansListPage.waitForPlansToLoad();

    // Verify both plans exist
    await plansListPage.expectPlanExists('Plan to Delete');
    await plansListPage.expectPlanExists('Plan to Keep');

    // Delete the first plan
    await plansListPage.deletePlan('Plan to Delete');

    // Wait for deletion to complete
    await page.waitForTimeout(1000);

    // Verify plan is removed from list
    await plansListPage.expectPlanNotExists('Plan to Delete');
    await plansListPage.expectPlanExists('Plan to Keep');

    // Verify plan is deleted from database
    const { data: plans } = await supabase.from('plans').select('*').eq('user_id', sharedUser.id);

    expect(plans).toHaveLength(1);
    expect(plans![0].name).toBe('Plan to Keep');
  });

  test('deletes plan from details view and redirects correctly', async ({ page, supabase, sharedUser }) => {
    const planDetailsPage = new PlanDetailsPage(page);

    // Create a test plan
    const { planId } = await createTestPlan(supabase, sharedUser.id, {
      name: 'Plan to Delete from Details',
      destination: 'Vienna',
      status: 'draft',
    });

    // Navigate to plan details
    await planDetailsPage.goto(planId);
    await planDetailsPage.waitForPageLoad();

    // Delete the plan
    await planDetailsPage.deletePlan();

    // Should redirect to plans list
    await expect(page).toHaveURL(/\/plans$/, { timeout: 10000 });

    // Verify plan is deleted from database
    const { data: plan } = await supabase.from('plans').select('*').eq('id', planId).maybeSingle();

    expect(plan).toBeNull();
  });

  test('cancels deletion when user dismisses confirmation modal', async ({ page, supabase, sharedUser }) => {
    const plansListPage = new PlansListPage(page);

    // Create a test plan
    await createTestPlan(supabase, sharedUser.id, {
      name: 'Plan Not to Delete',
      destination: 'Barcelona',
      status: 'draft',
    });

    // Navigate to plans list
    await plansListPage.goto();
    await plansListPage.waitForPlansToLoad();

    // Open delete confirmation but cancel
    const planCard = plansListPage.getPlanByName('Plan Not to Delete');
    await expect(planCard).toBeVisible();

    // Click menu
    const menuButton = planCard.getByTestId('plan-menu');
    await menuButton.click();

    // Click delete action
    const deleteAction = page.getByTestId('delete-plan-action');
    await expect(deleteAction).toBeVisible();
    await deleteAction.click();

    // Cancel in modal
    const cancelButton = page.getByTestId('cancel-delete');
    await expect(cancelButton).toBeVisible();
    await cancelButton.click();

    // Wait for modal to close
    await page.waitForTimeout(500);

    // Verify plan still exists
    await plansListPage.expectPlanExists('Plan Not to Delete');

    // Verify plan is still in database
    const { data: plans } = await supabase.from('plans').select('*').eq('user_id', sharedUser.id);

    expect(plans).toHaveLength(1);
    expect(plans![0].name).toBe('Plan Not to Delete');
  });

  test('cascades deletion to related data (fixed points, activities)', async ({ page, supabase, sharedUser }) => {
    const planDetailsPage = new PlanDetailsPage(page);

    // Create a plan with fixed points and activities
    const { planId, fixedPointIds } = await createTestPlan(supabase, sharedUser.id, {
      name: 'Plan with Related Data',
      destination: 'Prague',
      status: 'generated',
      withFixedPoints: true,
      withActivities: true,
    });

    // Verify fixed points exist before deletion
    expect(fixedPointIds).toBeDefined();
    expect(fixedPointIds!.length).toBeGreaterThan(0);

    const fixedPointId = fixedPointIds![0];
    const { data: fpBefore } = await supabase.from('fixed_points').select('*').eq('id', fixedPointId).maybeSingle();
    expect(fpBefore).not.toBeNull();

    // Verify activities exist before deletion
    const { data: daysBefore } = await supabase.from('generated_plan_days').select('*').eq('plan_id', planId);
    expect(daysBefore).toBeDefined();
    expect(daysBefore!.length).toBeGreaterThan(0);

    // Navigate to plan details and delete
    await planDetailsPage.goto(planId);
    await planDetailsPage.waitForPageLoad();
    await planDetailsPage.deletePlan();

    // Wait for deletion
    await page.waitForTimeout(1000);

    // Verify plan is deleted
    const { data: plan } = await supabase.from('plans').select('*').eq('id', planId).maybeSingle();
    expect(plan).toBeNull();

    // Verify fixed points are cascade deleted
    const { data: fpAfter } = await supabase.from('fixed_points').select('*').eq('id', fixedPointId).maybeSingle();
    expect(fpAfter).toBeNull();

    // Verify activities are cascade deleted
    const { data: daysAfter } = await supabase.from('generated_plan_days').select('*').eq('plan_id', planId);
    expect(daysAfter).toHaveLength(0);
  });

  test('shows confirmation modal with correct warning message', async ({ page, supabase, sharedUser }) => {
    const plansListPage = new PlansListPage(page);

    // Create a test plan
    await createTestPlan(supabase, sharedUser.id, {
      name: 'Confirmation Test Plan',
      destination: 'London',
      status: 'draft',
    });

    // Navigate to plans list
    await plansListPage.goto();
    await plansListPage.waitForPlansToLoad();

    // Open delete confirmation
    const planCard = plansListPage.getPlanByName('Confirmation Test Plan');
    const menuButton = planCard.getByTestId('plan-menu');
    await menuButton.click();

    const deleteAction = page.getByTestId('delete-plan-action');
    await deleteAction.click();

    // Verify modal is visible
    const modal = page.locator('[role="dialog"]');
    await expect(modal).toBeVisible();

    // Verify warning message

    // Verify warning message by checking for alert dialog content
    const alertTitle = modal.locator('[role="heading"]');
    const alertText = modal.locator('text=/usuń|delete|nieodwracalna/i');

    const hasWarning = await Promise.all([
      alertTitle.isVisible().catch(() => false),
      alertText.isVisible().catch(() => false),
    ]).then((results) => results.some((r) => r));
    expect(hasWarning).toBeTruthy();

    // Verify both buttons are present
    await expect(page.getByTestId('confirm-delete')).toBeVisible();
    await expect(page.getByTestId('cancel-delete')).toBeVisible();

    // Cancel to clean up
    await page.getByTestId('cancel-delete').click();
  });

  test('handles deletion of last plan gracefully', async ({ page, supabase, sharedUser }) => {
    const plansListPage = new PlansListPage(page);

    // Create only one plan
    await createTestPlan(supabase, sharedUser.id, {
      name: 'Last Plan',
      destination: 'Amsterdam',
      status: 'draft',
    });

    // Navigate to plans list
    await plansListPage.goto();
    await plansListPage.waitForPlansToLoad();

    // Delete the plan
    await plansListPage.deletePlan('Last Plan');
    await page.waitForTimeout(1000);

    // Should show empty state
    const isEmpty = await plansListPage.isEmptyStateVisible();
    expect(isEmpty).toBeTruthy();

    // Verify no plans in database
    const { data: plans } = await supabase.from('plans').select('*').eq('user_id', sharedUser.id);
    expect(plans).toHaveLength(0);
  });
});
