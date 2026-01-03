import { test, expect, cleanDatabase, createPlanWithActivities, countActivities } from '../fixtures';
import { LoginPage } from '../page-objects/LoginPage';
import { PlanTimelinePage } from '../page-objects/PlanTimelinePage';
import { mockOpenRouterAPI } from '../test-setup';

const TEST_USER_EMAIL = process.env.E2E_USERNAME || 'test@example.com';
const TEST_USER_PASSWORD = process.env.E2E_PASSWORD || 'testpassword123';

test.describe('Delete Activity', () => {
  let loginPage: LoginPage;
  let planTimelinePage: PlanTimelinePage;
  let planId: string;

  test.beforeEach(async ({ page, supabase, testUser }) => {
    // Clean database before each test
    await cleanDatabase(supabase, testUser.id);

    // Mock OpenRouter API
    await mockOpenRouterAPI(page);

    // Initialize page objects
    loginPage = new LoginPage(page);
    planTimelinePage = new PlanTimelinePage(page);

    // Create a plan with multiple activities
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
              time: '09:00',
              duration: '2 godziny',
              category: 'culture',
            },
            {
              title: 'Lunch w kawiarni',
              time: '13:00',
              duration: '1 godzina',
              category: 'food',
            },
            {
              title: 'Wieża Eiffla',
              time: '15:00',
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
  });

  test('should delete AI-generated activity with confirmation', async ({ supabase }) => {
    // Navigate to plan
    await planTimelinePage.goto(planId);

    // Expand day
    await planTimelinePage.expandDay(1);

    // Get initial count
    const initialCount = await planTimelinePage.getActivitiesCount();
    expect(initialCount).toBe(3);

    // Delete second activity
    await planTimelinePage.deleteActivity('Lunch w kawiarni');

    // Verify toast
    await planTimelinePage.waitForToast('Aktywność usunięta');

    // Verify activity count decreased
    const finalCount = await planTimelinePage.getActivitiesCount();
    expect(finalCount).toBe(2);

    // Verify specific activity is gone
    await expect(planTimelinePage.getActivity('Lunch w kawiarni')).not.toBeVisible();

    // Verify other activities still visible
    await expect(planTimelinePage.getActivity('Muzeum Luwr')).toBeVisible();
    await expect(planTimelinePage.getActivity('Wieża Eiffla')).toBeVisible();

    // Verify database
    const dbCount = await countActivities(supabase, planId);
    expect(dbCount).toBe(2);
  });

  test('should cancel deletion when clicking Cancel in confirmation dialog', async ({ page, supabase }) => {
    // Navigate to plan
    await planTimelinePage.goto(planId);

    // Expand day
    await planTimelinePage.expandDay(1);

    // Get initial count
    const initialCount = await planTimelinePage.getActivitiesCount();

    // Open delete dialog but cancel
    const activity = await planTimelinePage.getActivity('Lunch w kawiarni');
    await expect(activity).toBeVisible();

    // Open dropdown menu
    const menuButton = activity.getByRole('button', { name: 'Otwórz menu' });
    await menuButton.click();
    await page.waitForTimeout(300);

    // Click delete option
    const deleteOption = page.getByTestId('delete-activity');
    await deleteOption.click();

    // Wait for confirmation dialog
    await page.waitForTimeout(300);

    // Click Cancel instead of Confirm
    const cancelButton = page.getByTestId('cancel-delete');
    await expect(cancelButton).toBeVisible();
    await cancelButton.click();

    // Verify activity still exists
    await expect(planTimelinePage.getActivity('Lunch w kawiarni')).toBeVisible();

    // Verify count unchanged
    const finalCount = await planTimelinePage.getActivitiesCount();
    expect(finalCount).toBe(initialCount);

    // Verify database unchanged
    const dbCount = await countActivities(supabase, planId);
    expect(dbCount).toBe(initialCount);
  });

  test('should delete first activity in timeline', async () => {
    // Navigate to plan
    await planTimelinePage.goto(planId);

    // Expand day
    await planTimelinePage.expandDay(1);

    // Delete first activity
    await planTimelinePage.deleteActivity('Muzeum Luwr');

    // Verify it's gone
    await expect(planTimelinePage.getActivity('Muzeum Luwr')).not.toBeVisible();

    // Verify others still exist
    await expect(planTimelinePage.getActivity('Lunch w kawiarni')).toBeVisible();
    await expect(planTimelinePage.getActivity('Wieża Eiffla')).toBeVisible();

    // Verify count
    const count = await planTimelinePage.getActivitiesCount();
    expect(count).toBe(2);
  });

  test('should delete last activity in timeline', async () => {
    // Navigate to plan
    await planTimelinePage.goto(planId);

    // Expand day
    await planTimelinePage.expandDay(1);

    // Delete last activity
    await planTimelinePage.deleteActivity('Wieża Eiffla');

    // Verify it's gone
    await expect(planTimelinePage.getActivity('Wieża Eiffla')).not.toBeVisible();

    // Verify others still exist
    await expect(planTimelinePage.getActivity('Muzeum Luwr')).toBeVisible();
    await expect(planTimelinePage.getActivity('Lunch w kawiarni')).toBeVisible();

    // Verify count
    const count = await planTimelinePage.getActivitiesCount();
    expect(count).toBe(2);
  });

  test('should delete all activities from a day', async ({ page, supabase }) => {
    // Navigate to plan
    await planTimelinePage.goto(planId);

    // Expand day
    await planTimelinePage.expandDay(1);

    // Delete all activities one by one
    await planTimelinePage.deleteActivity('Muzeum Luwr');
    await page.waitForTimeout(500);

    await planTimelinePage.deleteActivity('Lunch w kawiarni');
    await page.waitForTimeout(500);

    await planTimelinePage.deleteActivity('Wieża Eiffla');
    await page.waitForTimeout(500);

    // Verify all activities are gone
    const count = await planTimelinePage.getActivitiesCount();
    expect(count).toBe(0);

    // Verify empty state message is shown
    await expect(page.getByText('Brak zaplanowanych aktywności na ten dzień')).toBeVisible();

    // Verify database
    const dbCount = await countActivities(supabase, planId);
    expect(dbCount).toBe(0);

    // Verify "Add activity" button is still available
    await expect(page.getByTestId('add-activity-button')).toBeVisible();
  });

  test('should delete multiple activities in sequence', async ({ supabase }) => {
    // Navigate to plan
    await planTimelinePage.goto(planId);

    // Expand day
    await planTimelinePage.expandDay(1);

    // Delete first activity
    await planTimelinePage.deleteActivity('Muzeum Luwr');
    await page.waitForTimeout(500);

    // Delete another activity
    await planTimelinePage.deleteActivity('Wieża Eiffla');
    await page.waitForTimeout(500);

    // Verify only one activity remains
    const count = await planTimelinePage.getActivitiesCount();
    expect(count).toBe(1);

    // Verify the remaining activity
    await expect(planTimelinePage.getActivity('Lunch w kawiarni')).toBeVisible();

    // Verify database
    const dbCount = await countActivities(supabase, planId);
    expect(dbCount).toBe(1);
  });
});
