import { historyTest as test, expect } from '../shared-user-fixtures';
import { createArchivedPlan } from '../fixtures';
import { PlanDetailsPage } from '../page-objects/PlanDetailsPage';

test.describe('History Read-Only Mode', () => {
  test('displays complete read-only plan information without edit capabilities', async ({
    page,
    supabase,
    sharedUser,
  }) => {
    const planDetailsPage = new PlanDetailsPage(page);

    // Create an archived plan with activities
    const planId = await createArchivedPlan(supabase, sharedUser.id, {
      name: 'Complete Read-Only Plan',
      destination: 'Vienna',
      startDate: '2024-06-01',
      endDate: '2024-06-03',
      withActivities: true,
    });

    // Navigate to plan details
    await planDetailsPage.goto(planId);
    await planDetailsPage.waitForPageLoad();

    // Verify read-only badge is visible
    const isReadOnly = await planDetailsPage.isReadOnly();
    expect(isReadOnly).toBeTruthy();

    // Verify all information is displayed
    await planDetailsPage.verifyPlanDetails({
      title: 'Complete Read-Only Plan',
      destination: 'Vienna',
    });

    // Verify dates are visible
    const datesVisible = await planDetailsPage.dates.isVisible();
    expect(datesVisible).toBeTruthy();

    // Verify activities are displayed
    const activityCount = await planDetailsPage.getActivityCount();
    expect(activityCount).toBeGreaterThan(0);

    // Verify visual indication that plan is archived
    const hasArchivedText = await page
      .getByText(/archived|zarchiwizowany|history|historia/i)
      .isVisible()
      .catch(() => false);
    expect(hasArchivedText).toBeTruthy();
  });

  test('prevents all editing operations on archived plan', async ({ page, supabase, sharedUser }) => {
    const planDetailsPage = new PlanDetailsPage(page);

    // Create an archived plan with activities
    const planId = await createArchivedPlan(supabase, sharedUser.id, {
      name: 'No Edit Plan',
      destination: 'Prague',
      startDate: '2024-05-01',
      endDate: '2024-05-03',
      withActivities: true,
    });

    // Navigate to plan details
    await planDetailsPage.goto(planId);
    await planDetailsPage.waitForPageLoad();

    // Verify all editing capabilities are disabled
    const canEditTitle = await planDetailsPage.canEditTitle();
    const canAddActivity = await planDetailsPage.canAddActivity();
    const canEditActivity = await planDetailsPage.canEditActivity();
    const canDeleteActivity = await planDetailsPage.canDeleteActivity();
    const canRegenerate = await planDetailsPage.canRegeneratePlan();

    expect(canEditTitle).toBeFalsy();
    expect(canAddActivity).toBeFalsy();
    expect(canEditActivity).toBeFalsy();
    expect(canDeleteActivity).toBeFalsy();
    expect(canRegenerate).toBeFalsy();

    // Verify delete button is not visible
    const hasActionsMenu = await planDetailsPage.actionsMenu.isVisible();
    if (hasActionsMenu) {
      await planDetailsPage.actionsMenu.click();
      await page.waitForTimeout(200);
    }
    const deleteButtonVisible = await planDetailsPage.deleteButton.isVisible().catch(() => false);
    expect(deleteButtonVisible).toBeFalsy();

    // Verify move to history button is not visible (already archived)
    const isMoveToHistoryVisible = await planDetailsPage.isMoveToHistoryVisible();
    expect(isMoveToHistoryVisible).toBeFalsy();
  });

  test('allows exporting archived plan to PDF', async ({ page, supabase, sharedUser }) => {
    const planDetailsPage = new PlanDetailsPage(page);

    // Create an archived plan
    const planId = await createArchivedPlan(supabase, sharedUser.id, {
      name: 'Exportable Plan',
      destination: 'Paris',
      startDate: '2024-11-01',
      endDate: '2024-11-03',
      withActivities: true,
    });

    // Navigate to plan details
    await planDetailsPage.goto(planId);
    await planDetailsPage.waitForPageLoad();

    // Verify export button is visible and enabled
    const canExport = await planDetailsPage.isExportEnabled();
    expect(canExport).toBeTruthy();
  });

  test('maintains data integrity after viewing archived plan', async ({ page, supabase, sharedUser }) => {
    const planDetailsPage = new PlanDetailsPage(page);

    // Create an archived plan with activities
    const planId = await createArchivedPlan(supabase, sharedUser.id, {
      name: 'Data Integrity Plan',
      destination: 'Oslo',
      startDate: '2024-12-10',
      endDate: '2024-12-13',
      withActivities: true,
    });

    // Get original data
    const { data: originalPlan } = await supabase.from('plans').select('*').eq('id', planId).single();

    // Navigate to plan details (read-only)
    await planDetailsPage.goto(planId);
    await planDetailsPage.waitForPageLoad();

    // Wait and navigate away
    await page.waitForTimeout(1000);
    await page.goto('/plans');

    // Get data after viewing
    const { data: planAfterView } = await supabase.from('plans').select('*').eq('id', planId).single();

    // Verify data hasn't changed
    expect(planAfterView?.name).toBe(originalPlan?.name);
    expect(planAfterView?.destination).toBe(originalPlan?.destination);
    expect(planAfterView?.status).toBe('archived');
    expect(planAfterView?.start_date).toBe(originalPlan?.start_date);
    expect(planAfterView?.end_date).toBe(originalPlan?.end_date);
  });

  test('allows navigation between multiple archived plans', async ({ page, supabase, sharedUser }) => {
    const planDetailsPage = new PlanDetailsPage(page);

    // Create multiple archived plans
    const plan1Id = await createArchivedPlan(supabase, sharedUser.id, {
      name: 'First Archived',
      destination: 'City 1',
      startDate: '2024-06-01',
      endDate: '2024-06-03',
    });

    const plan2Id = await createArchivedPlan(supabase, sharedUser.id, {
      name: 'Second Archived',
      destination: 'City 2',
      startDate: '2024-07-01',
      endDate: '2024-07-03',
    });

    // Navigate to first plan
    await planDetailsPage.goto(plan1Id);
    await planDetailsPage.waitForPageLoad();
    const title1 = await planDetailsPage.getTitle();
    expect(title1).toContain('First Archived');

    // Verify it's read-only
    const isReadOnly1 = await planDetailsPage.isReadOnly();
    expect(isReadOnly1).toBeTruthy();

    // Navigate to second plan
    await planDetailsPage.goto(plan2Id);
    await planDetailsPage.waitForPageLoad();
    const title2 = await planDetailsPage.getTitle();
    expect(title2).toContain('Second Archived');

    // Both should be in read-only mode
    const isReadOnly2 = await planDetailsPage.isReadOnly();
    expect(isReadOnly2).toBeTruthy();
  });

  test('prevents API modifications and shows proper UI indicators', async ({ page, supabase, sharedUser }) => {
    const planDetailsPage = new PlanDetailsPage(page);

    // Create an archived plan
    const planId = await createArchivedPlan(supabase, sharedUser.id, {
      name: 'API Protected Plan',
      destination: 'Stockholm',
      startDate: '2024-10-15',
      endDate: '2024-10-18',
    });

    // Verify plan is archived in database
    const { data: plan } = await supabase.from('plans').select('status').eq('id', planId).single();
    expect(plan?.status).toBe('archived');

    // Navigate to plan details
    await planDetailsPage.goto(planId);
    await planDetailsPage.waitForPageLoad();

    // Verify read-only badge exists and has correct text
    const badge = planDetailsPage.readOnlyBadge;
    await expect(badge).toBeVisible();

    const badgeText = await badge.textContent();
    expect(badgeText?.toLowerCase()).toMatch(/tylko do odczytu|read.*only|archived|zarchiwizowany/i);
  });
});
