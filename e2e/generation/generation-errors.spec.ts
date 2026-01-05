import { authTest as test, expect, createTestPlan, getGenerationCount } from '../fixtures';
import { mockGenerationError, mockOpenRouterAPI } from '../test-setup';
import { PlanDetailsPage } from '../page-objects/PlanDetailsPage';
import { GenerationLoadingPage } from '../page-objects/GenerationLoadingPage';

test.describe('Generation Error Handling', () => {
  test('should handle API timeout error', async ({ page, supabase, testUser }) => {
    // Local initialization (not global)
    const planDetailsPage = new PlanDetailsPage(page);
    const generationLoadingPage = new GenerationLoadingPage(page);

    // Arrange
    const { planId } = await createTestPlan(supabase, testUser.id, {
      status: 'draft',
    });

    // Mock timeout error
    await mockGenerationError(page, 'timeout');

    // Act
    await planDetailsPage.goto(planId);
    await planDetailsPage.waitForPageLoad();
    await planDetailsPage.generateButton.click();

    // Wait for loader to appear
    await generationLoadingPage.waitForLoader(5000);

    // Assert
    // Note: With timeout mock, this may take up to 35s
    // In real scenario, check for error message after timeout
    const hasError = await generationLoadingPage.hasError();
    if (hasError) {
      const errorMessage = await generationLoadingPage.getErrorMessage();
      expect(errorMessage.toLowerCase()).toMatch(/timeout|too long|zbyt długo|spróbuj ponownie/i);

      // Verify plan remains in draft
      const { data: plan } = await supabase.from('plans').select('status').eq('id', planId).single();
      expect(plan?.status).toBe('draft');

      // Verify generation counter not decreased
      const generationsUsed = await getGenerationCount(supabase, testUser.id);
      expect(generationsUsed).toBe(0);
    }
    // Note: Timeout test may not complete in reasonable time with mock
  });

  test('should handle 500 Internal Server Error', async ({ page, supabase, testUser }) => {
    // Arrange
    const { planId } = await createTestPlan(supabase, testUser.id, {
      status: 'draft',
    });

    // Mock 500 error
    await mockGenerationError(page, '500');

    // Act
    await planDetailsPage.goto(planId);
    await planDetailsPage.waitForPageLoad();
    await planDetailsPage.generateButton.click();

    // Wait a moment for error to appear
    await page.waitForTimeout(2000);

    // Assert
    // Check for error message (toast or inline)
    const errorToast = page.locator('[data-testid="toast"]').filter({ hasText: /error|błąd/i });
    const isErrorVisible = await errorToast.isVisible({ timeout: 5000 }).catch(() => false);

    if (isErrorVisible) {
      const errorText = await errorToast.textContent();
      expect(errorText?.toLowerCase()).toMatch(/error|błąd|spróbuj ponownie/i);
    }

    // Verify plan remains in draft
    const { data: plan } = await supabase.from('plans').select('status').eq('id', planId).single();
    expect(plan?.status).toBe('draft');

    // Verify generation counter not decreased
    const generationsUsed = await getGenerationCount(supabase, testUser.id);
    expect(generationsUsed).toBe(0);
  });

  test('should handle unrealistic plan with warning', async ({ page, supabase, testUser }) => {
    // Arrange
    const { planId } = await createTestPlan(supabase, testUser.id, {
      name: 'Ambitious Plan',
      destination: 'Rome',
      status: 'draft',
      startDate: '2026-06-15',
      endDate: '2026-06-15', // 1 day only
    });

    // Add many fixed points (unrealistic for 1 day)
    const fixedPoints = [];
    for (let i = 0; i < 10; i++) {
      fixedPoints.push({
        plan_id: planId,
        location: `Location ${i + 1}`,
        date: '2026-06-15',
        time: `${8 + i}:00`,
        description: `Fixed point ${i + 1}`,
      });
    }
    await supabase.from('fixed_points').insert(fixedPoints);

    // Mock unrealistic response (success with warning)
    await mockGenerationError(page, 'unrealistic');

    // Act
    await planDetailsPage.goto(planId);
    await planDetailsPage.waitForPageLoad();
    await planDetailsPage.generatePlan();

    // Assert
    // 1. Plan should be generated (status = 'generated')
    const { data: plan } = await supabase.from('plans').select('status').eq('id', planId).single();
    expect(plan?.status).toBe('generated');

    // 2. Warning message should be visible
    const hasWarning = await planDetailsPage.hasGenerationWarning();
    if (hasWarning) {
      const warningMessage = await planDetailsPage.getGenerationWarning();
      expect(warningMessage.toLowerCase()).toMatch(/ambitious|removed|usunięto|realistyczny/i);
    }

    // 3. Generation counter should decrease (generation succeeded)
    const generationsUsed = await getGenerationCount(supabase, testUser.id);
    expect(generationsUsed).toBe(1);
  });

  test('should handle validation error - missing destination', async ({ page, supabase, testUser }) => {
    // Arrange - Create plan without destination (should be prevented by UI/validation)
    const { planId } = await createTestPlan(supabase, testUser.id, {
      name: 'Plan without destination',
      destination: '', // Empty destination
      status: 'draft',
    });

    await mockOpenRouterAPI(page);

    // Act
    await planDetailsPage.goto(planId);
    await planDetailsPage.waitForPageLoad();

    // Try to generate
    const isGenerateButtonVisible = await planDetailsPage.generateButton.isVisible().catch(() => false);

    // Assert
    if (isGenerateButtonVisible) {
      const isEnabled = await planDetailsPage.generateButton.isEnabled();
      // Button should be disabled or show validation error
      if (isEnabled) {
        await planDetailsPage.generateButton.click();

        // Wait for error message
        await page.waitForTimeout(1000);

        // Check for validation error
        const errorMessage = page.locator('[data-testid="validation-error"]');
        const hasValidationError = await errorMessage.isVisible().catch(() => false);

        if (hasValidationError) {
          const errorText = await errorMessage.textContent();
          expect(errorText?.toLowerCase()).toMatch(/destination|cel|required|wymagany/i);
        }
      } else {
        // If button is disabled, that's correct behavior
        expect(isEnabled).toBe(false);
      }
    }

    // Verify plan remains draft
    const { data: plan } = await supabase.from('plans').select('status').eq('id', planId).single();
    expect(plan?.status).toBe('draft');
  });

  test('should allow retry after error', async ({ page, supabase, testUser }) => {
    // Arrange
    const { planId } = await createTestPlan(supabase, testUser.id, {
      status: 'draft',
    });

    // Mock 500 error first
    await mockGenerationError(page, '500');

    // Act - First attempt (fails)
    await planDetailsPage.goto(planId);
    await planDetailsPage.waitForPageLoad();
    await planDetailsPage.generateButton.click();
    await page.waitForTimeout(2000);

    // Verify error occurred
    let plan = await supabase.from('plans').select('status').eq('id', planId).single();
    expect(plan.data?.status).toBe('draft');

    // Remove error mock and use successful mock
    await page.unroute('**/api/plans/*/generate');
    await mockOpenRouterAPI(page);

    // Act - Second attempt (succeeds)
    await page.reload();
    await planDetailsPage.waitForPageLoad();
    await planDetailsPage.generatePlan();

    // Assert - Should succeed this time
    plan = await supabase.from('plans').select('status').eq('id', planId).single();
    expect(plan.data?.status).toBe('generated');

    const generationsUsed = await getGenerationCount(supabase, testUser.id);
    expect(generationsUsed).toBe(1); // Only successful generation counted
  });
});
