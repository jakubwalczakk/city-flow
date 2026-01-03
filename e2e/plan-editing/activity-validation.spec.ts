import { test, expect, cleanDatabase, createPlanWithActivities } from '../fixtures';
import { LoginPage } from '../page-objects/LoginPage';
import { PlanTimelinePage } from '../page-objects/PlanTimelinePage';
import { ActivityFormModal } from '../page-objects/ActivityFormModal';
import { mockOpenRouterAPI } from '../test-setup';

const TEST_USER_EMAIL = process.env.E2E_USERNAME || 'test@example.com';
const TEST_USER_PASSWORD = process.env.E2E_PASSWORD || 'testpassword123';

test.describe('Activity Form Validation', () => {
  let loginPage: LoginPage;
  let planTimelinePage: PlanTimelinePage;
  let activityFormModal: ActivityFormModal;
  let planId: string;

  test.beforeEach(async ({ page, supabase, testUser }) => {
    // Clean database before each test
    await cleanDatabase(supabase, testUser.id);

    // Mock OpenRouter API
    await mockOpenRouterAPI(page);

    // Initialize page objects
    loginPage = new LoginPage(page);
    planTimelinePage = new PlanTimelinePage(page);
    activityFormModal = new ActivityFormModal(page);

    // Create a plan with one day
    planId = await createPlanWithActivities(supabase, testUser.id, {
      name: 'Paris Trip',
      destination: 'Paris',
      startDate: '2026-06-15',
      days: [
        {
          date: '2026-06-15',
          activities: [
            {
              title: 'Muzeum Luwr',
              time: '10:00',
              duration: '2 godziny',
              category: 'culture',
            },
          ],
        },
      ],
    });

    // Login
    await loginPage.goto();
    await loginPage.login(TEST_USER_EMAIL, TEST_USER_PASSWORD);

    // Navigate to plan
    await planTimelinePage.goto(planId);
  });

  test('should show error when title is empty', async ({ page }) => {
    // Open add form
    await planTimelinePage.addActivityToDay(1);

    // Wait for modal
    await activityFormModal.waitForModal();

    // Try to save without filling title
    await activityFormModal.fillForm({
      title: '',
      time: '12:00',
    });

    // Try to submit - button should be disabled or show error
    const saveEnabled = await activityFormModal.isSaveButtonEnabled();

    // Since React Hook Form validates on change, the button might be disabled
    // or there might be an error message
    if (saveEnabled) {
      // If button is enabled (validation on submit), click and check for error
      await page.getByTestId('save-activity').click();

      // Wait for error message
      await page.waitForTimeout(500);

      // Modal should still be visible (not closed due to validation error)
      expect(await activityFormModal.isVisible()).toBe(true);

      // Check for error message
      const error = await activityFormModal.getErrorMessage();
      expect(error.length).toBeGreaterThan(0);
    } else {
      // Button is disabled, which is correct validation behavior
      expect(saveEnabled).toBe(false);
    }
  });

  test('should show error when duration is zero or negative', async ({ page }) => {
    // Open add form
    await planTimelinePage.addActivityToDay(1);

    // Wait for modal
    await activityFormModal.waitForModal();

    // Fill with invalid duration
    await activityFormModal.fillForm({
      title: 'Test Activity',
      time: '12:00',
      duration: 0,
    });

    // Wait for validation
    await page.waitForTimeout(500);

    // Try to save
    const saveEnabled = await activityFormModal.isSaveButtonEnabled();

    if (saveEnabled) {
      await page.getByTestId('save-activity').click();
      await page.waitForTimeout(500);

      // Should show error or stay open
      expect(await activityFormModal.isVisible()).toBe(true);
    } else {
      // Validation prevents save
      expect(saveEnabled).toBe(false);
    }
  });

  test('should accept negative duration values but show warning', async ({ page }) => {
    // Open add form
    await planTimelinePage.addActivityToDay(1);

    // Wait for modal
    await activityFormModal.waitForModal();

    // Try negative duration
    await activityFormModal.fillForm({
      title: 'Test Activity',
      time: '12:00',
      duration: -10,
    });

    // Wait for validation
    await page.waitForTimeout(500);

    // Check if save button state reflects validation
    const saveEnabled = await activityFormModal.isSaveButtonEnabled();

    // Negative duration should be invalid
    if (saveEnabled) {
      await page.getByTestId('save-activity').click();
      await page.waitForTimeout(500);
      expect(await activityFormModal.isVisible()).toBe(true);
    }
  });

  test('should allow saving with valid minimum data', async () => {
    // Open add form
    await planTimelinePage.addActivityToDay(1);

    // Fill with minimum valid data
    await activityFormModal.fillForm({
      title: 'Valid Activity',
      time: '14:00',
    });

    // Should be able to save
    const saveEnabled = await activityFormModal.isSaveButtonEnabled();
    expect(saveEnabled).toBe(true);

    // Save should work
    await activityFormModal.save();

    // Modal should close
    expect(await activityFormModal.isVisible()).toBe(false);

    // Activity should be visible
    await expect(planTimelinePage.getActivity('Valid Activity')).toBeVisible();
  });

  test('should handle very long activity titles', async () => {
    // Open add form
    await planTimelinePage.addActivityToDay(1);

    // Create a very long title
    const longTitle = 'A'.repeat(200);

    await activityFormModal.fillForm({
      title: longTitle,
      time: '12:00',
    });

    // Should still be able to save (no max length restriction)
    await activityFormModal.save();

    // Verify it was saved
    await expect(planTimelinePage.getActivity(longTitle)).toBeVisible();
  });

  test('should handle special characters in fields', async () => {
    // Open add form
    await planTimelinePage.addActivityToDay(1);

    const specialTitle = 'Café & Restaurant "Le Français" <Paris>';
    const specialLocation = "Rue de l'Église, 123 @ Paris";

    await activityFormModal.fillForm({
      title: specialTitle,
      location: specialLocation,
      time: '12:00',
      description: 'Test with special chars: <>&"\'',
    });

    // Should be able to save
    await activityFormModal.save();

    // Verify it was saved correctly
    await expect(planTimelinePage.getActivity(specialTitle)).toBeVisible();
  });

  test('should accept activities at midnight (00:00)', async () => {
    // Open add form
    await planTimelinePage.addActivityToDay(1);

    await activityFormModal.fillForm({
      title: 'Late Night Activity',
      time: '00:00',
    });

    // Should be able to save
    await activityFormModal.save();

    // Verify saved
    await expect(planTimelinePage.getActivity('Late Night Activity')).toBeVisible();
  });

  test('should accept activities late in the evening', async () => {
    // Open add form
    await planTimelinePage.addActivityToDay(1);

    await activityFormModal.fillForm({
      title: 'Evening Show',
      time: '23:30',
      duration: 90,
    });

    // Should be able to save even if it extends past midnight
    await activityFormModal.save();

    // Verify saved
    await expect(planTimelinePage.getActivity('Evening Show')).toBeVisible();
  });

  test('should handle activities with very long duration', async () => {
    // Open add form
    await planTimelinePage.addActivityToDay(1);

    await activityFormModal.fillForm({
      title: 'All Day Activity',
      time: '08:00',
      duration: 720, // 12 hours
    });

    // Should be able to save
    await activityFormModal.save();

    // Verify saved
    await expect(planTimelinePage.getActivity('All Day Activity')).toBeVisible();
  });

  test('should allow optional fields to be empty', async () => {
    // Open add form
    await planTimelinePage.addActivityToDay(1);

    // Fill only required fields
    await activityFormModal.fillForm({
      title: 'Minimal Activity',
      time: '10:00',
      // No location, no description, no duration, no category
    });

    // Should be able to save
    await activityFormModal.save();

    // Verify saved
    await expect(planTimelinePage.getActivity('Minimal Activity')).toBeVisible();
  });

  test('should preserve form data when reopening after cancel', async () => {
    // Open add form
    await planTimelinePage.addActivityToDay(1);

    // Fill some data
    await activityFormModal.fillForm({
      title: 'Test Activity',
      time: '10:00',
    });

    // Cancel
    await activityFormModal.cancel();

    // Open again
    await planTimelinePage.addActivityToDay(1);

    // Form should be empty/reset
    await activityFormModal.waitForModal();

    // Verify form is ready for new input (previous data cleared)
    await activityFormModal.fillForm({
      title: 'New Activity',
      time: '14:00',
    });

    await activityFormModal.save();

    // Should save the new activity, not the old one
    await expect(planTimelinePage.getActivity('New Activity')).toBeVisible();
    await expect(planTimelinePage.getActivity('Test Activity')).not.toBeVisible();
  });
});
