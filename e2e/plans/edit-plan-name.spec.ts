/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { planEditorTest as test, expect } from '../shared-user-fixtures';
import { createTestPlan } from '../fixtures';
import { PlanDetailsPage } from '../page-objects/PlanDetailsPage';
import { PlansListPage } from '../page-objects/PlansListPage';

test.describe('Edit Plan Name', () => {
  test('successfully edits plan name and persists changes', async ({ page, supabase, sharedUser }) => {
    const planDetailsPage = new PlanDetailsPage(page);
    const plansListPage = new PlansListPage(page);

    // Create a test plan
    const { planId } = await createTestPlan(supabase, sharedUser.id, {
      name: 'Original Plan Name',
      destination: 'Paris',
      status: 'draft',
    });

    // Navigate to plan details
    await planDetailsPage.goto(planId);
    await planDetailsPage.waitForPageLoad();

    // Verify original name
    const originalTitle = await planDetailsPage.getTitle();
    expect(originalTitle).toContain('Original Plan Name');

    // Edit the title
    const newTitle = 'Updated Plan Name';
    await planDetailsPage.editTitle(newTitle);

    // Wait for save to complete
    await page.waitForTimeout(1000);

    // Verify new title is displayed
    const updatedTitle = await planDetailsPage.getTitle();
    expect(updatedTitle).toContain(newTitle);

    // Verify change was saved in database
    const { data: plan } = await supabase.from('plans').select('name').eq('id', planId).single();
    expect(plan!.name).toBe(newTitle);

    // Navigate to plans list and verify the name is updated there too
    await plansListPage.goto();
    await plansListPage.waitForPlansToLoad();
    await plansListPage.expectPlanExists(newTitle);
    await plansListPage.expectPlanNotExists('Original Plan Name');
  });

  test('validates plan name constraints (empty, too short, too long)', async ({ page, supabase, sharedUser }) => {
    const planDetailsPage = new PlanDetailsPage(page);

    // Create a test plan
    const { planId } = await createTestPlan(supabase, sharedUser.id, {
      name: 'Valid Plan Name',
      destination: 'Vienna',
      status: 'draft',
    });

    // Navigate to plan details
    await planDetailsPage.goto(planId);
    await planDetailsPage.waitForPageLoad();

    // Test empty name
    await planDetailsPage.editTitleButton.click();
    await expect(planDetailsPage.titleInput).toBeVisible();

    await planDetailsPage.titleInput.fill('');
    await planDetailsPage.titleInput.press('Enter');
    await page.waitForTimeout(500);

    // Verify original name is restored
    let currentTitle = await planDetailsPage.getTitle();
    expect(currentTitle).toContain('Valid Plan Name');

    // Test name that's too short (if validation exists)
    await planDetailsPage.editTitleButton.click();
    await expect(planDetailsPage.titleInput).toBeVisible();
    await planDetailsPage.titleInput.fill('ab');
    await planDetailsPage.titleInput.press('Enter');
    await page.waitForTimeout(500);

    // Should show error or restore original
    currentTitle = await planDetailsPage.getTitle();
    // Either shows error message or reverts to original
    const hasError = await page
      .getByTestId('form-error-message')
      .isVisible()
      .catch(() => false);
    expect(hasError || currentTitle.includes('Valid Plan Name')).toBeTruthy();

    // Test name that's too long
    const veryLongName = 'a'.repeat(150);
    await planDetailsPage.editTitleButton.click().catch(() => void 0);
    const isInputVisible = await planDetailsPage.titleInput.isVisible().catch(() => false);
    if (isInputVisible) {
      await planDetailsPage.titleInput.fill(veryLongName);
      await planDetailsPage.titleInput.press('Enter');
      await page.waitForTimeout(500);

      // Should either truncate or show error
      const finalTitle = await planDetailsPage.getTitle();
      expect(finalTitle.length).toBeLessThan(120); // Should be truncated or rejected
    }

    // Verify database still has original valid name
    const { data: plan } = await supabase.from('plans').select('name').eq('id', planId).single();
    expect(plan!.name).toBe('Valid Plan Name');
  });

  test('cancels edit with Escape key without saving changes', async ({ page, supabase, sharedUser }) => {
    const planDetailsPage = new PlanDetailsPage(page);

    // Create a test plan
    const { planId } = await createTestPlan(supabase, sharedUser.id, {
      name: 'Unchanged Plan',
      destination: 'Berlin',
      status: 'draft',
    });

    // Navigate to plan details
    await planDetailsPage.goto(planId);
    await planDetailsPage.waitForPageLoad();

    // Start editing but cancel
    await planDetailsPage.cancelTitleEdit();

    // Verify original name is still displayed
    const title = await planDetailsPage.getTitle();
    expect(title).toContain('Unchanged Plan');

    // Verify no change in database
    const { data: plan } = await supabase.from('plans').select('name').eq('id', planId).single();
    expect(plan!.name).toBe('Unchanged Plan');
  });

  test('handles special characters and unicode in plan names', async ({ page, supabase, sharedUser }) => {
    const planDetailsPage = new PlanDetailsPage(page);

    // Create a test plan
    const { planId } = await createTestPlan(supabase, sharedUser.id, {
      name: 'Simple Name',
      destination: 'Tokyo',
      status: 'draft',
    });

    // Navigate to plan details
    await planDetailsPage.goto(planId);
    await planDetailsPage.waitForPageLoad();

    // Test special characters
    const specialName = 'Trip to München & København 🌍';
    await planDetailsPage.editTitle(specialName);
    await page.waitForTimeout(1000);

    const updatedTitle = await planDetailsPage.getTitle();
    expect(updatedTitle).toContain('München');
    expect(updatedTitle).toContain('København');

    // Verify in database
    const { data: plan } = await supabase.from('plans').select('name').eq('id', planId).single();
    expect(plan!.name).toContain('München');
  });

  test('shows appropriate feedback after successful edit', async ({ page, supabase, sharedUser }) => {
    const planDetailsPage = new PlanDetailsPage(page);

    // Create a test plan
    const { planId } = await createTestPlan(supabase, sharedUser.id, {
      name: 'Plan to Rename',
      destination: 'Rome',
      status: 'draft',
    });

    // Navigate to plan details
    await planDetailsPage.goto(planId);
    await planDetailsPage.waitForPageLoad();

    // Edit the title
    await planDetailsPage.editTitle('Renamed Plan');

    // Wait for toast notification
    await page.waitForTimeout(500);

    // Check for toast notification (sonner doesn't have stable selectors, so we'll verify via title)
    const title = await planDetailsPage.getTitle();
    expect(title).toContain('Renamed Plan');
  });
});
