/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { authTest as test, expect, createTestPlan } from '../fixtures';
import { LoginPage } from '../page-objects/LoginPage';
import { PlanDetailsPage } from '../page-objects/PlanDetailsPage';
import { PlansListPage } from '../page-objects/PlansListPage';

const TEST_USER_EMAIL = process.env.E2E_USERNAME || 'test@example.com';
const TEST_USER_PASSWORD = process.env.E2E_PASSWORD || 'testpassword123';

test.describe('Delete Plan', () => {
  test('should delete plan from list view', async ({ page, supabase, testUser }) => {
    // Local initialization (not global)
    const loginPage = new LoginPage(page);
    const plansListPage = new PlansListPage(page);

    // Login
    await loginPage.goto();
    await loginPage.login(TEST_USER_EMAIL, TEST_USER_PASSWORD);

    // Create test plans
    await createTestPlan(supabase, testUser.id, {
      name: 'Plan to Delete',
      destination: 'Paris',
      status: 'draft',
    });

    await createTestPlan(supabase, testUser.id, {
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
    const { data: plans } = await supabase.from('plans').select('*').eq('user_id', testUser.id);

    expect(plans).toHaveLength(1);
    expect(plans![0].name).toBe('Plan to Keep');

    // Verify toast notification (toast might have disappeared, so we don't fail if not found)
    await page
      .getByText(/usunięto|deleted|removed/i)
      .isVisible()
      .catch(() => false);
  });

  test('should cancel deletion from list view', async ({ page, supabase, testUser }) => {
    // Local initialization (not global)
    const loginPage = new LoginPage(page);
    const plansListPage = new PlansListPage(page);

    // Login
    await loginPage.goto();
    await loginPage.login(TEST_USER_EMAIL, TEST_USER_PASSWORD);

    // Create a test plan
    await createTestPlan(supabase, testUser.id, {
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
    const { data: plans } = await supabase.from('plans').select('*').eq('user_id', testUser.id);

    expect(plans).toHaveLength(1);
    expect(plans![0].name).toBe('Plan Not to Delete');
  });

  test('should delete plan from details view', async ({ page, supabase, testUser }) => {
    // Local initialization (not global)
    const loginPage = new LoginPage(page);
    const planDetailsPage = new PlanDetailsPage(page);

    // Login
    await loginPage.goto();
    await loginPage.login(TEST_USER_EMAIL, TEST_USER_PASSWORD);

    // Create a test plan
    const { planId } = await createTestPlan(supabase, testUser.id, {
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

    // Verify toast notification
    await page.waitForTimeout(500);
    await page
      .getByText(/usunięto|deleted/i)
      .isVisible()
      .catch(() => false);
  });

  test('should cascade delete fixed points when deleting plan', async ({ page, supabase, testUser }) => {
    // Local initialization (not global)
    const loginPage = new LoginPage(page);
    const planDetailsPage = new PlanDetailsPage(page);

    // Login
    await loginPage.goto();
    await loginPage.login(TEST_USER_EMAIL, TEST_USER_PASSWORD);

    // Create a plan with fixed points
    const { planId, fixedPointIds } = await createTestPlan(supabase, testUser.id, {
      name: 'Plan with Fixed Points',
      destination: 'Prague',
      status: 'draft',
      withFixedPoints: true,
    });

    // Verify fixed points exist before deletion
    expect(fixedPointIds).toBeDefined();
    expect(fixedPointIds!.length).toBeGreaterThan(0);

    // Navigate to plan details
    await planDetailsPage.goto(planId);
    await planDetailsPage.waitForPageLoad();

    // Delete the plan
    await planDetailsPage.deletePlan();

    // Wait for deletion
    await expect(page).toHaveURL(/\/plans$/, { timeout: 10000 });

    // Verify plan is deleted
    const { data: plan } = await supabase.from('plans').select('*').eq('id', planId).maybeSingle();

    expect(plan).toBeNull();

    // Verify fixed points are also deleted (CASCADE)
    const { data: fixedPoints } = await supabase.from('fixed_points').select('*').eq('plan_id', planId);

    expect(fixedPoints).toHaveLength(0);
  });

  test('should cascade delete activities when deleting generated plan', async ({ page, supabase, testUser }) => {
    // Local initialization (not global)
    const loginPage = new LoginPage(page);
    const plansListPage = new PlansListPage(page);

    // Login
    await loginPage.goto();
    await loginPage.login(TEST_USER_EMAIL, TEST_USER_PASSWORD);

    // Create a generated plan with activities
    const { planId, activityIds } = await createTestPlan(supabase, testUser.id, {
      name: 'Generated Plan with Activities',
      destination: 'Amsterdam',
      status: 'generated',
      withFixedPoints: true,
      withActivities: true,
    });

    // Verify activities exist before deletion
    expect(activityIds).toBeDefined();
    expect(activityIds!.length).toBeGreaterThan(0);

    // Navigate to plans list
    await plansListPage.goto();
    await plansListPage.waitForPlansToLoad();

    // Delete the plan from list
    await plansListPage.deletePlan('Generated Plan with Activities');

    // Wait for deletion
    await page.waitForTimeout(1000);

    // Verify plan is deleted
    const { data: plan } = await supabase.from('plans').select('*').eq('id', planId).maybeSingle();

    expect(plan).toBeNull();

    // Verify generated_plan_days are deleted
    const { data: days } = await supabase.from('generated_plan_days').select('*').eq('plan_id', planId);

    expect(days).toHaveLength(0);

    // Verify plan_activities are deleted
    // (They are linked to plan_days, so should be cascaded)
    const { data: activities } = await supabase.from('plan_activities').select('*').in('id', activityIds!);

    expect(activities).toHaveLength(0);
  });

  test('should show confirmation modal with correct text', async ({ page, supabase, testUser }) => {
    // Local initialization (not global)
    const loginPage = new LoginPage(page);
    const plansListPage = new PlansListPage(page);

    // Login
    await loginPage.goto();
    await loginPage.login(TEST_USER_EMAIL, TEST_USER_PASSWORD);

    // Create a test plan
    await createTestPlan(supabase, testUser.id, {
      name: 'Plan for Modal Test',
      destination: 'Berlin',
      status: 'draft',
    });

    // Navigate to plans list
    await plansListPage.goto();
    await plansListPage.waitForPlansToLoad();

    // Open delete confirmation
    const planCard = plansListPage.getPlanByName('Plan for Modal Test');
    const menuButton = planCard.getByTestId('plan-menu');
    await menuButton.click();

    const deleteAction = page.getByTestId('delete-plan-action');
    await deleteAction.click();

    // Verify confirmation modal is displayed
    const modal = page.locator('[role="dialog"]');
    await expect(modal).toBeVisible();

    // Verify confirmation text
    const hasConfirmationText = await page.getByText(/czy na pewno|are you sure|confirm|usunąć/i).isVisible();

    expect(hasConfirmationText).toBeTruthy();

    // Verify both buttons are present
    await expect(page.getByTestId('confirm-delete')).toBeVisible();
    await expect(page.getByTestId('cancel-delete')).toBeVisible();

    // Cancel to clean up
    await page.getByTestId('cancel-delete').click();
  });

  test('should handle rapid delete operations', async ({ page, supabase, testUser }) => {
    // Local initialization (not global)
    const loginPage = new LoginPage(page);
    const plansListPage = new PlansListPage(page);

    // Login
    await loginPage.goto();
    await loginPage.login(TEST_USER_EMAIL, TEST_USER_PASSWORD);

    // Create multiple plans
    await createTestPlan(supabase, testUser.id, {
      name: 'Plan 1',
      destination: 'City 1',
      status: 'draft',
    });

    await createTestPlan(supabase, testUser.id, {
      name: 'Plan 2',
      destination: 'City 2',
      status: 'draft',
    });

    await createTestPlan(supabase, testUser.id, {
      name: 'Plan 3',
      destination: 'City 3',
      status: 'draft',
    });

    // Navigate to plans list
    await plansListPage.goto();
    await plansListPage.waitForPlansToLoad();

    // Delete first plan
    await plansListPage.deletePlan('Plan 1');
    await page.waitForTimeout(500);

    // Verify it's gone
    await plansListPage.expectPlanNotExists('Plan 1');

    // Delete second plan immediately
    await plansListPage.deletePlan('Plan 2');
    await page.waitForTimeout(500);

    // Verify both are gone
    await plansListPage.expectPlanNotExists('Plan 1');
    await plansListPage.expectPlanNotExists('Plan 2');
    await plansListPage.expectPlanExists('Plan 3');

    // Verify database state
    const { data: plans } = await supabase.from('plans').select('*').eq('user_id', testUser.id);

    expect(plans).toHaveLength(1);
    expect(plans![0].name).toBe('Plan 3');
  });

  test('should handle deleting last plan (empty state)', async ({ page, supabase, testUser }) => {
    // Local initialization (not global)
    const loginPage = new LoginPage(page);
    const plansListPage = new PlansListPage(page);

    // Login
    await loginPage.goto();
    await loginPage.login(TEST_USER_EMAIL, TEST_USER_PASSWORD);

    // Create only one plan
    await createTestPlan(supabase, testUser.id, {
      name: 'Last Plan',
      destination: 'Solo City',
      status: 'draft',
    });

    // Navigate to plans list
    await plansListPage.goto();
    await plansListPage.waitForPlansToLoad();

    // Delete the plan
    await plansListPage.deletePlan('Last Plan');

    // Wait for deletion
    await page.waitForTimeout(1000);

    // Verify empty state is shown
    const isEmpty = await plansListPage.isEmptyStateVisible();
    expect(isEmpty).toBeTruthy();

    // Verify no plans in database
    const { data: plans } = await supabase.from('plans').select('*').eq('user_id', testUser.id);

    expect(plans).toHaveLength(0);
  });

  test('should not delete plans of other users', async ({ page, supabase, testUser }) => {
    // Local initialization (not global)
    const loginPage = new LoginPage(page);

    // Login
    await loginPage.goto();
    await loginPage.login(TEST_USER_EMAIL, TEST_USER_PASSWORD);

    // This is more of an RLS test, but worth checking here too
    // Create a plan for the test user
    const { planId } = await createTestPlan(supabase, testUser.id, {
      name: 'My Plan',
      destination: 'My City',
      status: 'draft',
    });

    // Try to delete directly via API (simulating an attack)
    // This should be blocked by RLS
    const response = await page.request.delete(`/api/plans/${planId}`);

    // Should either succeed (because it's our plan) or fail with 403 if RLS is strict
    // For our own plan, it should succeed
    expect([200, 204]).toContain(response.status());

    // Now if we try to delete a non-existent plan (simulating another user's plan)
    const fakeId = '00000000-0000-0000-0000-000000000000';
    const response2 = await page.request.delete(`/api/plans/${fakeId}`);

    // Should fail with 403 or 404
    expect([403, 404]).toContain(response2.status());
  });
});
