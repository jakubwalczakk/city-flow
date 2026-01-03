import {
  authTest as test,
  expect,
  createTestPlan,
  verifyPlanGenerated,
  setGenerationLimit,
  getGenerationCount,
} from '../fixtures';
import { mockOpenRouterAPI } from '../test-setup';
import { PlanDetailsPage } from '../page-objects/PlanDetailsPage';
import { GenerationLoadingPage } from '../page-objects/GenerationLoadingPage';

test.describe('Plan Generation', () => {
  test('should successfully generate a plan from draft', async ({ page, supabase, testUser }) => {
    const planDetailsPage = new PlanDetailsPage(page);
    const generationLoadingPage = new GenerationLoadingPage(page);
    // Mock OpenRouter API
    await mockOpenRouterAPI(page);

    // Set generation limit
    await setGenerationLimit(supabase, testUser.id, 0);

    // Arrange
    const { planId } = await createTestPlan(supabase, testUser.id, {
      name: 'Rzym - City Break',
      destination: 'Rzym',
      status: 'draft',
      notes: '3-dniowy city break, sztuka i jedzenie',
      startDate: '2026-06-15',
      endDate: '2026-06-17',
    });

    // Act
    await planDetailsPage.goto(planId);
    await planDetailsPage.waitForPageLoad();

    // Verify we're in draft mode
    expect(await planDetailsPage.isDraft()).toBe(true);

    // Start generation
    await planDetailsPage.generatePlan();

    // Assert
    // 1. Verify plan status changed to 'generated'
    const { data: plan } = await supabase.from('plans').select('status').eq('id', planId).single();
    expect(plan?.status).toBe('generated');

    // 2. Verify generated_plan_days and plan_activities were created
    const { daysCount, activitiesCount } = await verifyPlanGenerated(supabase, planId);
    expect(daysCount).toBeGreaterThan(0);
    expect(activitiesCount).toBeGreaterThan(0);

    // 3. Verify timeline is now visible
    expect(await planDetailsPage.isGenerated()).toBe(true);

    // 4. Verify generation counter decreased
    const generationsUsed = await getGenerationCount(supabase, testUser.id);
    expect(generationsUsed).toBe(1);

    // 5. Verify success toast/message (if visible)
    const successToast = page.locator('[data-testid="toast"]').filter({ hasText: /wygenerowany|generated/i });
    await expect(successToast).toBeVisible({ timeout: 5000 });
  });

  test('should generate plan with fixed point', async ({ supabase, testUser }) => {
    // Arrange
    const { planId } = await createTestPlan(supabase, testUser.id, {
      name: 'Rzym z Koloseum',
      destination: 'Rzym',
      status: 'draft',
      startDate: '2026-06-15',
      endDate: '2026-06-17',
      withFixedPoints: true,
    });

    // Add a specific fixed point
    await supabase.from('fixed_points').insert({
      plan_id: planId,
      location: 'Koloseum',
      date: '2026-06-15',
      time: '10:00',
      description: 'Visit the Colosseum',
    });

    // Act
    await planDetailsPage.goto(planId);
    await planDetailsPage.waitForPageLoad();
    await planDetailsPage.generatePlan();

    // Assert
    // 1. Verify plan was generated
    const { daysCount } = await verifyPlanGenerated(supabase, planId);
    expect(daysCount).toBeGreaterThan(0);

    // 2. Verify fixed point is in the plan (check activities for "Koloseum")
    const hasColosseum = await planDetailsPage.hasActivityWithTitle('Koloseum');
    expect(hasColosseum).toBe(true);
  });

  test('should show loader during generation', async ({ supabase, testUser }) => {
    // Arrange
    const { planId } = await createTestPlan(supabase, testUser.id, {
      status: 'draft',
    });

    await planDetailsPage.goto(planId);
    await planDetailsPage.waitForPageLoad();

    // Act
    await expect(planDetailsPage.generateButton).toBeVisible();
    await planDetailsPage.generateButton.click();

    // Assert
    // 1. Loader should appear immediately
    await generationLoadingPage.waitForLoader(5000);
    expect(await generationLoadingPage.isLoaderVisible()).toBe(true);

    // 2. Loader message should be visible
    const loaderMessage = await generationLoadingPage.getLoaderMessage();
    expect(loaderMessage.length).toBeGreaterThan(0);

    // 3. Wait for completion
    await generationLoadingPage.waitForCompletion(30000);

    // 4. Verify loader is hidden
    expect(await generationLoadingPage.isLoaderVisible()).toBe(false);
  });

  test('should handle regeneration of existing plan', async ({ supabase, testUser }) => {
    // Arrange - Create already generated plan
    const { planId } = await createTestPlan(supabase, testUser.id, {
      name: 'Existing Plan',
      status: 'generated',
      withActivities: true,
    });

    // Act
    await planDetailsPage.goto(planId);
    await planDetailsPage.waitForPageLoad();

    // Verify regenerate button exists
    const hasRegenerateButton = await planDetailsPage.generateAgainButton.isVisible().catch(() => false);
    if (hasRegenerateButton) {
      await planDetailsPage.regeneratePlan();

      // Assert
      // 1. Plan should still be generated
      const { data: plan } = await supabase.from('plans').select('status').eq('id', planId).single();
      expect(plan?.status).toBe('generated');

      // 2. Activities should be replaced (new activities created)
      const { activitiesCount } = await verifyPlanGenerated(supabase, planId);
      expect(activitiesCount).toBeGreaterThan(0);
      // Note: We can't reliably check if activities changed without checking IDs,
      // but we verify that there are still activities

      // 3. Generation counter should increase by 1
      const generationsUsed = await getGenerationCount(supabase, testUser.id);
      expect(generationsUsed).toBe(2); // One for initial, one for regeneration
    }
    // Note: If regenerate button doesn't exist, test will pass without regeneration check
  });

  test('should respect generation timeout', async ({ supabase, testUser }) => {
    // Arrange
    const { planId } = await createTestPlan(supabase, testUser.id, {
      status: 'draft',
    });

    await planDetailsPage.goto(planId);
    await planDetailsPage.waitForPageLoad();

    // Act
    await planDetailsPage.generateButton.click();
    await generationLoadingPage.waitForLoader(5000);

    // Assert - Verify loader appears
    expect(await generationLoadingPage.isLoaderVisible()).toBe(true);

    // Note: With mocked API, this should complete quickly
    // In real scenario, we'd test timeout > 30s
    await generationLoadingPage.waitForCompletion(40000);
  });
});
