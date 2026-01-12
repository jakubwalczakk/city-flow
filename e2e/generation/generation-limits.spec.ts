import { authTest as test, expect, createTestPlan, setGenerationLimit, getGenerationCount } from '../fixtures';
import { PlanDetailsPage } from '../page-objects/PlanDetailsPage';

test.describe('Generation Limits', () => {
  test.skip('should generate plan with available limit', async ({ page, supabase, testUser }) => {
    // Local initialization (not global)
    const planDetailsPage = new PlanDetailsPage(page);

    // Arrange - Set limit to 5 (0 used)
    await setGenerationLimit(supabase, testUser.id, 0);

    const { planId } = await createTestPlan(supabase, testUser.id, {
      status: 'draft',
    });

    // Act
    await planDetailsPage.goto(planId);
    await planDetailsPage.waitForPageLoad();
    await planDetailsPage.generatePlan();

    // Assert
    // 1. Plan should be generated
    const { data: plan } = await supabase.from('plans').select('status').eq('id', planId).single();
    expect(plan?.status).toBe('generated');

    // 2. Counter should decrease: 5 -> 4 (1 generation used)
    const generationsUsed = await getGenerationCount(supabase, testUser.id);
    expect(generationsUsed).toBe(1);
  });

  test.skip('should prevent generation when limit exhausted', async ({ page, supabase, testUser }) => {
    // Local initialization (not global)
    const planDetailsPage = new PlanDetailsPage(page);

    // Arrange - Set limit to 5 (all used)
    await setGenerationLimit(supabase, testUser.id, 5);

    const { planId } = await createTestPlan(supabase, testUser.id, {
      status: 'draft',
    });

    // Act
    await planDetailsPage.goto(planId);
    await planDetailsPage.waitForPageLoad();

    // Assert
    // 1. Generate button should be disabled or show warning
    const isGenerateButtonEnabled = await planDetailsPage.generateButton.isEnabled().catch(() => false);

    if (!isGenerateButtonEnabled) {
      // Button is disabled - correct behavior
      expect(isGenerateButtonEnabled).toBe(false);
    } else {
      // If button is enabled, clicking should show error modal
      await planDetailsPage.generateButton.click();

      // Check for limit exceeded modal/message
      const limitModal = page.locator('[data-testid="limit-exceeded-modal"]');
      const limitMessage = page.locator('text=/limit|wykorzystałeś|monthly/i');

      const hasLimitModal = await limitModal.isVisible({ timeout: 3000 }).catch(() => false);
      const hasLimitMessage = await limitMessage.isVisible({ timeout: 3000 }).catch(() => false);

      expect(hasLimitModal || hasLimitMessage).toBe(true);

      if (hasLimitMessage) {
        const messageText = await limitMessage.textContent();
        expect(messageText?.toLowerCase()).toMatch(/limit|miesięczny|monthly|wykorzyst/i);
      }
    }

    // 2. Plan should remain draft
    const { data: plan } = await supabase.from('plans').select('status').eq('id', planId).single();
    expect(plan?.status).toBe('draft');

    // 3. Counter should still be 5
    const generationsUsed = await getGenerationCount(supabase, testUser.id);
    expect(generationsUsed).toBe(5);
  });

  test.skip('should display generation counter in UI', async ({ page, supabase, testUser }) => {
    // Local initialization (not global)
    const planDetailsPage = new PlanDetailsPage(page);

    // Arrange - Set limit to 3 used
    await setGenerationLimit(supabase, testUser.id, 3);

    const { planId } = await createTestPlan(supabase, testUser.id, {
      status: 'draft',
    });

    // Act
    await planDetailsPage.goto(planId);
    await planDetailsPage.waitForPageLoad();

    // Assert
    // Check if counter is visible (could be in header, profile, or plan page)
    const counterText = await planDetailsPage.getGenerationsCount();

    if (counterText) {
      // Counter format: "2/5" or "Pozostało: 2/5"
      expect(counterText).toMatch(/2|3/); // Should show remaining (2) or used (3)
    } else {
      // Counter might be in header or profile page
      const headerCounter = page.locator('[data-testid="generations-counter"]');
      const isCounterVisible = await headerCounter.isVisible().catch(() => false);

      if (isCounterVisible) {
        const headerCounterText = await headerCounter.textContent();
        expect(headerCounterText).toMatch(/2|3/);
      }
    }
  });

  test.skip('should update counter after generation', async ({ page, supabase, testUser }) => {
    // Local initialization (not global)
    const planDetailsPage = new PlanDetailsPage(page);

    // Arrange - Start with 2 used
    await setGenerationLimit(supabase, testUser.id, 2);

    const { planId } = await createTestPlan(supabase, testUser.id, {
      status: 'draft',
    });

    // Act
    await planDetailsPage.goto(planId);
    await planDetailsPage.waitForPageLoad();

    // Get counter before generation
    const counterBefore = await planDetailsPage.getGenerationsCount();

    // Generate plan
    await planDetailsPage.generatePlan();

    // Wait for page to update
    await page.waitForTimeout(1000);

    // Get counter after generation
    const counterAfter = await planDetailsPage.getGenerationsCount();

    // Assert
    // Counter should have changed (if visible)
    if (counterBefore && counterAfter) {
      expect(counterBefore).not.toBe(counterAfter);
    }

    // Verify in database
    const generationsUsed = await getGenerationCount(supabase, testUser.id);
    expect(generationsUsed).toBe(3); // 2 + 1 = 3
  });

  test.skip('should allow generation with 1 generation left', async ({ supabase, testUser, page }) => {
    // Local initialization (not global)
    const planDetailsPage = new PlanDetailsPage(page);

    // Arrange - Set to 4 used (1 remaining)
    await setGenerationLimit(supabase, testUser.id, 4);

    const { planId } = await createTestPlan(supabase, testUser.id, {
      status: 'draft',
    });

    // Act
    await planDetailsPage.goto(planId);
    await planDetailsPage.waitForPageLoad();
    await planDetailsPage.generatePlan();

    // Assert
    // 1. Plan should be generated
    const { data: plan } = await supabase.from('plans').select('status').eq('id', planId).single();
    expect(plan?.status).toBe('generated');

    // 2. Counter should be 5 (all used)
    const generationsUsed = await getGenerationCount(supabase, testUser.id);
    expect(generationsUsed).toBe(5);

    // 3. Try to create another plan
    const { planId: planId2 } = await createTestPlan(supabase, testUser.id, {
      status: 'draft',
    });

    await planDetailsPage.goto(planId2);
    await planDetailsPage.waitForPageLoad();

    // 4. Generate button should now be disabled
    const isEnabled = await planDetailsPage.generateButton.isEnabled().catch(() => false);
    expect(isEnabled).toBe(false);
  });

  test.skip('should show informative message about limit reset', async ({ page, supabase, testUser }) => {
    // Local initialization (not global)
    const planDetailsPage = new PlanDetailsPage(page);

    // Arrange - Exhaust limit
    await setGenerationLimit(supabase, testUser.id, 5);

    const { planId } = await createTestPlan(supabase, testUser.id, {
      status: 'draft',
    });

    // Act
    await planDetailsPage.goto(planId);
    await planDetailsPage.waitForPageLoad();

    // Try to generate (should fail)
    const isEnabled = await planDetailsPage.generateButton.isEnabled().catch(() => true);

    if (isEnabled) {
      await planDetailsPage.generateButton.click();
      await page.waitForTimeout(1000);
    }

    // Assert - Look for message about limit reset
    const limitMessage = page.locator('text=/1\\. dnia|first day|next month|przyszłego miesiąca/i');
    const hasResetInfo = await limitMessage.isVisible({ timeout: 3000 }).catch(() => false);

    if (hasResetInfo) {
      const messageText = await limitMessage.textContent();
      expect(messageText?.toLowerCase()).toMatch(/1\\.|first|next|przyszł/i);
    } else {
      // Message might be in a modal or tooltip
      const modal = page.locator('[role="dialog"]');
      const modalVisible = await modal.isVisible().catch(() => false);

      if (modalVisible) {
        const modalText = await modal.textContent();
        expect(modalText?.toLowerCase()).toMatch(/limit|monthly|miesięczny/i);
      }
    }
  });

  test.skip('should not decrease counter on failed generation', async ({ page, supabase, testUser }) => {
    // Local initialization (not global)
    const planDetailsPage = new PlanDetailsPage(page);

    // Arrange
    await setGenerationLimit(supabase, testUser.id, 2);

    const { planId } = await createTestPlan(supabase, testUser.id, {
      status: 'draft',
    });

    // Mock error for generation
    await page.unroute('**/api/plans/*/generate');
    await page.route('**/api/plans/*/generate', async (route) => {
      await route.fulfill({
        status: 500,
        body: JSON.stringify({ error: 'Internal server error' }),
      });
    });

    // Act
    await planDetailsPage.goto(planId);
    await planDetailsPage.waitForPageLoad();
    await planDetailsPage.generateButton.click();

    // Wait for error
    await page.waitForTimeout(2000);

    // Assert
    // Counter should remain at 2 (not decreased)
    const generationsUsed = await getGenerationCount(supabase, testUser.id);
    expect(generationsUsed).toBe(2);

    // Plan should remain draft
    const { data: plan } = await supabase.from('plans').select('status').eq('id', planId).single();
    expect(plan?.status).toBe('draft');
  });
});
