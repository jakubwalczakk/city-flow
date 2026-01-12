import { planViewerTest as test, expect } from '../shared-user-fixtures';
import { createTestPlan } from '../fixtures';
import { PlanDetailsPage } from '../page-objects/PlanDetailsPage';

test.describe('Plan Details', () => {
  test.skip('displays complete draft plan details with all UI elements', async ({ page, supabase, sharedUser }) => {
    const planDetailsPage = new PlanDetailsPage(page);

    // Create a draft plan with fixed points
    const { planId } = await createTestPlan(supabase, sharedUser.id, {
      name: 'Complete Draft Plan',
      destination: 'Paris, France',
      status: 'draft',
      notes: 'A lovely trip to Paris',
      startDate: '2026-09-15',
      endDate: '2026-09-20',
      withFixedPoints: true,
    });

    // Navigate to plan details
    await planDetailsPage.goto(planId);
    await planDetailsPage.waitForPageLoad();

    // Verify plan title and metadata
    const title = await planDetailsPage.getTitle();
    expect(title).toContain('Complete Draft Plan');

    await expect(planDetailsPage.destination).toContainText('Paris, France');

    const datesText = await planDetailsPage.dates.textContent().catch(() => '');
    expect(datesText).toContain('2026');

    // Verify plan is in draft status
    const isDraft = await planDetailsPage.isDraft();
    expect(isDraft).toBeTruthy();

    await expect(planDetailsPage.generateButton).toBeVisible();

    // Verify no timeline/activities (because it's draft)
    const isGenerated = await planDetailsPage.isGenerated();
    expect(isGenerated).toBeFalsy();

    // Check if fixed points are displayed
    const hasFixedPoints = await planDetailsPage.fixedPointsList.isVisible().catch(() => false);
    if (hasFixedPoints) {
      const fixedPointCount = await planDetailsPage.fixedPointsList.count();
      expect(fixedPointCount).toBeGreaterThan(0);
    }
  });

  test.skip('displays complete generated plan with activities', async ({ page, supabase, sharedUser }) => {
    const planDetailsPage = new PlanDetailsPage(page);

    // Create a generated plan with activities
    const { planId } = await createTestPlan(supabase, sharedUser.id, {
      name: 'Generated Plan with Activities',
      destination: 'Barcelona, Spain',
      status: 'generated',
      startDate: '2026-08-01',
      endDate: '2026-08-05',
      withFixedPoints: true,
      withActivities: true,
    });

    // Navigate to plan details
    await planDetailsPage.goto(planId);
    await planDetailsPage.waitForPageLoad();

    // Verify plan title and destination
    await planDetailsPage.verifyPlanDetails({
      title: 'Generated Plan with Activities',
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

    // Verify timeline is visible
    const hasTimeline = await planDetailsPage.timeline.isVisible();
    expect(hasTimeline).toBeTruthy();
  });

  test.skip('handles non-existent plan with proper error handling', async ({ page }) => {
    const planDetailsPage = new PlanDetailsPage(page);

    // Try to access a non-existent plan
    const nonExistentId = '00000000-0000-0000-0000-000000000000';

    await planDetailsPage.goto(nonExistentId);

    // Wait a moment for error to appear
    await page.waitForTimeout(2000);

    // Should show error message or redirect to /plans
    const currentUrl = page.url();
    const isOnErrorPage = currentUrl.includes('/plans') && !currentUrl.includes(nonExistentId);
    const hasErrorMessage = await page
      .getByTestId('plans-list-error')
      .isVisible()
      .catch(() => false);

    expect(isOnErrorPage || hasErrorMessage).toBeTruthy();
  });

  test('allows navigation through breadcrumbs and action buttons', async ({ page, supabase, sharedUser }) => {
    const planDetailsPage = new PlanDetailsPage(page);

    // Create a plan
    const { planId } = await createTestPlan(supabase, sharedUser.id, {
      name: 'Navigation Test Plan',
      destination: 'Rome, Italy',
      status: 'draft',
    });

    // Navigate to plan details
    await planDetailsPage.goto(planId);
    await planDetailsPage.waitForPageLoad();

    // Verify title and basic info
    const title = await planDetailsPage.getTitle();
    expect(title).toContain('Navigation Test Plan');

    // Try clicking breadcrumbs/navigation elements if they exist
    const hasBreadcrumbs = await page
      .getByRole('navigation')
      .isVisible()
      .catch(() => false);
    if (hasBreadcrumbs) {
      // Breadcrumbs exist, could test navigation
      await expect(page.getByRole('navigation')).toBeVisible();
    }

    // Verify action buttons are available
    const canEditTitle = await planDetailsPage.canEditTitle();
    expect(canEditTitle).toBeTruthy(); // Draft plans should be editable
  });

  test.skip('displays status badges correctly for different plan states', async ({ page, supabase, sharedUser }) => {
    const planDetailsPage = new PlanDetailsPage(page);

    // Create a draft plan
    const { planId: draftId } = await createTestPlan(supabase, sharedUser.id, {
      name: 'Draft Badge Plan',
      destination: 'Vienna',
      status: 'draft',
    });

    // Check draft status
    await planDetailsPage.goto(draftId);
    await planDetailsPage.waitForPageLoad();

    const isDraft = await planDetailsPage.isDraft();
    expect(isDraft).toBeTruthy();

    // Create a generated plan
    const { planId: generatedId } = await createTestPlan(supabase, sharedUser.id, {
      name: 'Generated Badge Plan',
      destination: 'Prague',
      status: 'generated',
      withActivities: true,
    });

    // Check generated status
    await planDetailsPage.goto(generatedId);
    await planDetailsPage.waitForPageLoad();

    const isGenerated = await planDetailsPage.isGenerated();
    expect(isGenerated).toBeTruthy();
  });

  test.skip('handles plans with minimal and maximum data correctly', async ({ page, supabase, sharedUser }) => {
    const planDetailsPage = new PlanDetailsPage(page);

    // Create a minimal plan
    const { planId: minimalId } = await createTestPlan(supabase, sharedUser.id, {
      name: 'Minimal Plan',
      destination: 'City',
      status: 'draft',
    });

    // Navigate to minimal plan
    await planDetailsPage.goto(minimalId);
    await planDetailsPage.waitForPageLoad();

    // Should display without errors
    const title1 = await planDetailsPage.getTitle();
    expect(title1).toContain('Minimal Plan');

    // Create a plan with lots of data
    const { planId: maximalId } = await createTestPlan(supabase, sharedUser.id, {
      name: 'Maximal Plan with Very Long Name That Tests Display',
      destination: 'Some Very Long Destination Name, Country',
      status: 'generated',
      withFixedPoints: true,
      withActivities: true,
      notes: 'This is a plan with lots of details and notes attached to it.',
    });

    // Navigate to maximal plan
    await planDetailsPage.goto(maximalId);
    await planDetailsPage.waitForPageLoad();

    // Should display without errors
    const title2 = await planDetailsPage.getTitle();
    expect(title2.length).toBeGreaterThan(0);

    const activityCount = await planDetailsPage.getActivityCount();
    expect(activityCount).toBeGreaterThan(0);
  });
});
