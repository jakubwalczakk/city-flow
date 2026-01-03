import { test, expect, cleanDatabase, createPlanWithActivities } from '../fixtures';
import { LoginPage } from '../page-objects/LoginPage';
import { PlanTimelinePage } from '../page-objects/PlanTimelinePage';
import { ActivityFormModal } from '../page-objects/ActivityFormModal';
import { mockOpenRouterAPI } from '../test-setup';

const TEST_USER_EMAIL = process.env.E2E_USERNAME || 'test@example.com';
const TEST_USER_PASSWORD = process.env.E2E_PASSWORD || 'testpassword123';

test.describe('Add Activity to Plan', () => {
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

    // Create a plan with one day and one existing activity
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
              location: 'Rue de Rivoli, Paris',
              description: 'Wizyta w słynnym muzeum',
            },
          ],
        },
      ],
    });

    // Login
    await loginPage.goto();
    await loginPage.login(TEST_USER_EMAIL, TEST_USER_PASSWORD);
  });

  test('should add custom activity to empty day', async ({ supabase, testUser }) => {
    // Create a plan with one empty day
    await cleanDatabase(supabase, testUser.id);
    planId = await createPlanWithActivities(supabase, testUser.id, {
      name: 'Paris Trip',
      destination: 'Paris',
      startDate: '2026-06-15',
      days: [
        {
          date: '2026-06-15',
          activities: [],
        },
      ],
    });

    // Navigate to plan
    await planTimelinePage.goto(planId);

    // Open add activity form for Day 1
    await planTimelinePage.addActivityToDay(1);

    // Fill form
    await activityFormModal.fillForm({
      title: 'Lunch w restauracji Le Marais',
      location: 'Dzielnica Le Marais, Paryż',
      time: '12:30',
      duration: 90,
      category: 'Jedzenie',
      description: 'Lunch w lokalnej restauracji',
    });

    // Save
    await activityFormModal.save();

    // Verify activity was added
    await expect(planTimelinePage.getActivity('Lunch w restauracji Le Marais')).toBeVisible();

    // Verify toast message
    await planTimelinePage.waitForToast('Aktywność dodana');
  });

  test('should add activity between existing activities', async ({ supabase, testUser }) => {
    // Create plan with activities at 9:00 and 14:00
    await cleanDatabase(supabase, testUser.id);
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
              title: 'Wieża Eiffla',
              time: '14:00',
              duration: '2 godziny',
              category: 'culture',
            },
          ],
        },
      ],
    });

    // Navigate to plan
    await planTimelinePage.goto(planId);

    // Expand day to see activities
    await planTimelinePage.expandDay(1);

    // Add activity between them
    await planTimelinePage.addActivityToDay(1);

    await activityFormModal.fillForm({
      title: 'Lunch',
      time: '12:00',
      duration: 60,
      category: 'Jedzenie',
    });

    await activityFormModal.save();

    // Verify all 3 activities are visible
    const count = await planTimelinePage.getActivitiesCount();
    expect(count).toBe(3);

    // Verify the new activity is visible
    await expect(planTimelinePage.getActivity('Lunch')).toBeVisible();
  });

  test('should add activity with minimal form (only required fields)', async () => {
    // Navigate to plan
    await planTimelinePage.goto(planId);

    // Open add form
    await planTimelinePage.addActivityToDay(1);

    // Fill only required field (title)
    await activityFormModal.fillForm({
      title: 'Spacer po Montmartre',
      time: '16:00',
    });

    // Save
    await activityFormModal.save();

    // Verify activity was added
    await expect(planTimelinePage.getActivity('Spacer po Montmartre')).toBeVisible();
  });

  test('should cancel adding activity', async () => {
    // Navigate to plan
    await planTimelinePage.goto(planId);

    // Get initial activity count
    await planTimelinePage.expandDay(1);
    const initialCount = await planTimelinePage.getActivitiesCount();

    // Open add form
    await planTimelinePage.addActivityToDay(1);

    // Fill form
    await activityFormModal.fillForm({
      title: 'Test Activity',
      time: '15:00',
    });

    // Cancel
    await activityFormModal.cancel();

    // Verify modal is closed
    expect(await activityFormModal.isVisible()).toBe(false);

    // Verify activity count unchanged
    const finalCount = await planTimelinePage.getActivitiesCount();
    expect(finalCount).toBe(initialCount);

    // Verify activity not visible
    await expect(planTimelinePage.getActivity('Test Activity')).not.toBeVisible();
  });

  test('should close form with Escape key', async () => {
    // Navigate to plan
    await planTimelinePage.goto(planId);

    // Open add form
    await planTimelinePage.addActivityToDay(1);

    // Fill some data
    await activityFormModal.fillForm({
      title: 'Test Activity',
    });

    // Press Escape
    await activityFormModal.closeWithEscape();

    // Verify modal is closed
    expect(await activityFormModal.isVisible()).toBe(false);
  });
});
