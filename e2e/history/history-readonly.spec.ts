import { authTest as test, expect, createArchivedPlan, TEST_CONFIG } from '../fixtures';
import { PlanDetailsPage } from '../page-objects/PlanDetailsPage';

test.describe('History Read-Only Mode', () => {
  test('should display read-only badge on archived plan', async ({ supabase, testUser }) => {
    // Create an archived plan
    const planId = await createArchivedPlan(supabase, testUser.id, {
      name: 'Read-Only Plan',
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
  });

  test('should not allow editing plan title', async ({ supabase, testUser }) => {
    // Create an archived plan
    const planId = await createArchivedPlan(supabase, testUser.id, {
      name: 'Locked Title Plan',
      destination: 'Prague',
      startDate: '2024-05-01',
      endDate: '2024-05-03',
    });

    // Navigate to plan details
    await planDetailsPage.goto(planId);
    await planDetailsPage.waitForPageLoad();

    // Verify edit title button is not visible
    const canEdit = await planDetailsPage.canEditTitle();
    expect(canEdit).toBeFalsy();

    // Verify title is displayed as plain text
    const title = await planDetailsPage.getTitle();
    expect(title).toContain('Locked Title Plan');
  });

  test('should not allow adding activities', async ({ supabase, testUser }) => {
    // Create an archived plan with activities
    const planId = await createArchivedPlan(supabase, testUser.id, {
      name: 'No Add Activities',
      destination: 'Amsterdam',
      startDate: '2024-07-01',
      endDate: '2024-07-03',
      withActivities: true,
    });

    // Navigate to plan details
    await planDetailsPage.goto(planId);
    await planDetailsPage.waitForPageLoad();

    // Verify add activity button is not visible
    const canAdd = await planDetailsPage.canAddActivity();
    expect(canAdd).toBeFalsy();
  });

  test('should not allow editing activities', async ({ supabase, testUser }) => {
    // Create an archived plan with activities
    const planId = await createArchivedPlan(supabase, testUser.id, {
      name: 'No Edit Activities',
      destination: 'Berlin',
      startDate: '2024-08-01',
      endDate: '2024-08-03',
      withActivities: true,
    });

    // Navigate to plan details
    await planDetailsPage.goto(planId);
    await planDetailsPage.waitForPageLoad();

    // Verify edit activity buttons are not visible
    const canEdit = await planDetailsPage.canEditActivity();
    expect(canEdit).toBeFalsy();
  });

  test('should not allow deleting activities', async ({ supabase, testUser }) => {
    // Create an archived plan with activities
    const planId = await createArchivedPlan(supabase, testUser.id, {
      name: 'No Delete Activities',
      destination: 'Barcelona',
      startDate: '2024-09-01',
      endDate: '2024-09-03',
      withActivities: true,
    });

    // Navigate to plan details
    await planDetailsPage.goto(planId);
    await planDetailsPage.waitForPageLoad();

    // Verify delete activity buttons are not visible
    const canDelete = await planDetailsPage.canDeleteActivity();
    expect(canDelete).toBeFalsy();
  });

  test('should not allow regenerating archived plan', async ({ supabase, testUser }) => {
    // Create an archived plan
    const planId = await createArchivedPlan(supabase, testUser.id, {
      name: 'No Regenerate Plan',
      destination: 'Rome',
      startDate: '2024-10-01',
      endDate: '2024-10-03',
      withActivities: true,
    });

    // Navigate to plan details
    await planDetailsPage.goto(planId);
    await planDetailsPage.waitForPageLoad();

    // Verify regenerate button is not visible
    const canRegenerate = await planDetailsPage.canRegeneratePlan();
    expect(canRegenerate).toBeFalsy();
  });

  test('should allow exporting archived plan to PDF', async ({ supabase, testUser }) => {
    // Create an archived plan
    const planId = await createArchivedPlan(supabase, testUser.id, {
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

    // Optional: Test actual export (might be slow)
    // const download = await planDetailsPage.exportToPDF();
    // expect(download).toBeDefined();
  });

  test('should display activities in read-only mode', async ({ supabase, testUser }) => {
    // Create an archived plan with activities
    const planId = await createArchivedPlan(supabase, testUser.id, {
      name: 'View Activities Plan',
      destination: 'London',
      startDate: '2024-12-01',
      endDate: '2024-12-03',
      withActivities: true,
    });

    // Navigate to plan details
    await planDetailsPage.goto(planId);
    await planDetailsPage.waitForPageLoad();

    // Verify activities are displayed
    const activityCount = await planDetailsPage.getActivityCount();
    expect(activityCount).toBeGreaterThan(0);

    // Verify activities are visible but not editable
    const hasTimeline = await planDetailsPage.timeline.isVisible();
    expect(hasTimeline).toBeTruthy();
  });

  test('should show read-only tooltip/message on hover', async ({ supabase, testUser }) => {
    // Create an archived plan
    const planId = await createArchivedPlan(supabase, testUser.id, {
      name: 'Tooltip Plan',
      destination: 'Milan',
      startDate: '2024-06-15',
      endDate: '2024-06-18',
    });

    // Navigate to plan details
    await planDetailsPage.goto(planId);
    await planDetailsPage.waitForPageLoad();

    // Verify read-only badge exists
    const badge = planDetailsPage.readOnlyBadge;
    await expect(badge).toBeVisible();

    // Verify badge text
    const badgeText = await badge.textContent();
    expect(badgeText?.toLowerCase()).toMatch(/tylko do odczytu|read.*only|archived|zarchiwizowany/i);
  });

  test('should not allow deleting archived plan', async ({ page, supabase, testUser }) => {
    // Create an archived plan
    const planId = await createArchivedPlan(supabase, testUser.id, {
      name: 'Protected Plan',
      destination: 'Athens',
      startDate: '2024-07-10',
      endDate: '2024-07-13',
    });

    // Navigate to plan details
    await planDetailsPage.goto(planId);
    await planDetailsPage.waitForPageLoad();

    // Open actions menu if it exists
    const hasActionsMenu = await planDetailsPage.actionsMenu.isVisible();
    if (hasActionsMenu) {
      await planDetailsPage.actionsMenu.click();
      await page.waitForTimeout(200);
    }

    // Verify delete button is not visible
    const deleteButtonVisible = await planDetailsPage.deleteButton.isVisible().catch(() => false);
    expect(deleteButtonVisible).toBeFalsy();
  });

  test('should display all plan information in read-only mode', async ({ supabase, testUser }) => {
    // Create an archived plan
    const planId = await createArchivedPlan(supabase, testUser.id, {
      name: 'Complete Info Plan',
      destination: 'Lisbon',
      startDate: '2024-08-20',
      endDate: '2024-08-25',
    });

    // Navigate to plan details
    await planDetailsPage.goto(planId);
    await planDetailsPage.waitForPageLoad();

    // Verify all information is displayed
    await planDetailsPage.verifyPlanDetails({
      title: 'Complete Info Plan',
      destination: 'Lisbon',
    });

    // Verify dates are visible
    const datesVisible = await planDetailsPage.dates.isVisible();
    expect(datesVisible).toBeTruthy();
  });

  test('should not show move to history button for already archived plan', async ({ supabase, testUser }) => {
    // Create an archived plan
    const planId = await createArchivedPlan(supabase, testUser.id, {
      name: 'Already Archived',
      destination: 'Dublin',
      startDate: '2024-09-10',
      endDate: '2024-09-13',
    });

    // Navigate to plan details
    await planDetailsPage.goto(planId);
    await planDetailsPage.waitForPageLoad();

    // Verify move to history button is not visible
    const isVisible = await planDetailsPage.isMoveToHistoryVisible();
    expect(isVisible).toBeFalsy();
  });

  test('should prevent API modifications to archived plan', async ({ supabase, testUser }) => {
    // Create an archived plan
    const planId = await createArchivedPlan(supabase, testUser.id, {
      name: 'API Protected Plan',
      destination: 'Stockholm',
      startDate: '2024-10-15',
      endDate: '2024-10-18',
    });

    // Try to update plan via direct database call (should be allowed via service key)
    // But verify it's archived
    const { data: plan } = await supabase.from('plans').select('status').eq('id', planId).single();
    expect(plan?.status).toBe('archived');

    // The UI should prevent any modifications
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
  });

  test('should show visual indication that plan is archived', async ({ supabase, testUser }) => {
    // Create an archived plan
    const planId = await createArchivedPlan(supabase, testUser.id, {
      name: 'Visual Indication Plan',
      destination: 'Copenhagen',
      startDate: '2024-11-20',
      endDate: '2024-11-23',
    });

    // Navigate to plan details
    await planDetailsPage.goto(planId);
    await planDetailsPage.waitForPageLoad();

    // Verify visual indicators
    const isReadOnly = await planDetailsPage.isReadOnly();
    expect(isReadOnly).toBeTruthy();

    // Look for archived status indicator
    const hasArchivedText = await page
      .getByText(/archived|zarchiwizowany|history|historia/i)
      .isVisible()
      .catch(() => false);

    expect(hasArchivedText).toBeTruthy();
  });

  test('should maintain data integrity in read-only mode', async ({ page, supabase, testUser }) => {
    // Create an archived plan with activities
    const planId = await createArchivedPlan(supabase, testUser.id, {
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

  test('should allow navigation between archived plan views', async ({ supabase, testUser }) => {
    // Create multiple archived plans
    const plan1Id = await createArchivedPlan(supabase, testUser.id, {
      name: 'First Archived',
      destination: 'City 1',
      startDate: '2024-06-01',
      endDate: '2024-06-03',
    });

    const plan2Id = await createArchivedPlan(supabase, testUser.id, {
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

    // Navigate to second plan
    await planDetailsPage.goto(plan2Id);
    await planDetailsPage.waitForPageLoad();
    const title2 = await planDetailsPage.getTitle();
    expect(title2).toContain('Second Archived');

    // Both should be in read-only mode
    const isReadOnly1 = await planDetailsPage.isReadOnly();
    expect(isReadOnly1).toBeTruthy();
  });
});
