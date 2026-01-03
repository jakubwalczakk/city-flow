import { authTest as test, expect, createPlanWithActivities, getActivityByTitle, TEST_CONFIG } from '../fixtures';
import { PlanTimelinePage } from '../page-objects/PlanTimelinePage';
import { ActivityFormModal } from '../page-objects/ActivityFormModal';
import { mockOpenRouterAPI } from '../test-setup';

test.describe('Edit Activity', () => {
    activityFormModal = new ActivityFormModal(page);

    // Create a plan with activities
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
              location: 'Rue de Rivoli, Paris',
              description: 'Wizyta w słynnym muzeum',
            },
            {
              title: 'Lunch w kawiarni',
              time: '13:00',
              duration: '1 godzina',
              category: 'food',
              location: 'Rue de la Paix',
            },
          ],
        },
      ],
    });

    // Login
    await loginPage.goto();
    await loginPage.login(TEST_USER_EMAIL, TEST_USER_PASSWORD);
  });

  test('should edit AI-generated activity', async ({ supabase }) => {
    // Navigate to plan
    await planTimelinePage.goto(planId);

    // Expand day
    await planTimelinePage.expandDay(1);

    // Open edit form for "Muzeum Luwr"
    await planTimelinePage.editActivity('Muzeum Luwr');

    // Wait for modal to load with existing data
    await activityFormModal.waitForModal();

    // Change time and duration
    await activityFormModal.fillForm({
      title: 'Muzeum Luwr',
      time: '09:00',
      duration: 180,
      description: 'Wizyta w słynnym muzeum. Kupić bilety online wcześniej.',
    });

    // Save
    await activityFormModal.save();

    // Verify toast
    await planTimelinePage.waitForToast('Aktywność zaktualizowana');

    // Verify the activity still exists
    await expect(planTimelinePage.getActivity('Muzeum Luwr')).toBeVisible();

    // Verify time was updated in the database
    const activity = await getActivityByTitle(supabase, planId, 'Muzeum Luwr');
    expect(activity).toBeTruthy();
    expect((activity as { time: string }).time).toBe('09:00');
  });

  test('should edit custom activity', async () => {
    // Navigate to plan
    await planTimelinePage.goto(planId);

    // Expand day
    await planTimelinePage.expandDay(1);

    // Edit "Lunch w kawiarni"
    await planTimelinePage.editActivity('Lunch w kawiarni');

    // Change title and location
    await activityFormModal.fillForm({
      title: 'Lunch w Le Marais',
      location: 'Dzielnica Le Marais, Paryż',
    });

    // Save
    await activityFormModal.save();

    // Verify new title is visible
    await expect(planTimelinePage.getActivity('Lunch w Le Marais')).toBeVisible();

    // Verify old title is not visible
    await expect(planTimelinePage.getActivity('Lunch w kawiarni')).not.toBeVisible();
  });

  test('should change activity category', async () => {
    // Navigate to plan
    await planTimelinePage.goto(planId);

    // Expand day
    await planTimelinePage.expandDay(1);

    // Edit activity
    await planTimelinePage.editActivity('Lunch w kawiarni');

    // Change category
    await activityFormModal.fillForm({
      title: 'Lunch w kawiarni',
      category: 'Kultura',
    });

    // Save
    await activityFormModal.save();

    // Verify activity still visible
    await expect(planTimelinePage.getActivity('Lunch w kawiarni')).toBeVisible();
  });

  test('should cancel editing with Cancel button', async ({ supabase }) => {
    // Navigate to plan
    await planTimelinePage.goto(planId);

    // Expand day
    await planTimelinePage.expandDay(1);

    // Get original activity data
    const originalActivity = await getActivityByTitle(supabase, planId, 'Muzeum Luwr');

    // Open edit form
    await planTimelinePage.editActivity('Muzeum Luwr');

    // Make changes
    await activityFormModal.fillForm({
      title: 'Changed Title',
      time: '15:00',
    });

    // Cancel
    await activityFormModal.cancel();

    // Verify modal closed
    expect(await activityFormModal.isVisible()).toBe(false);

    // Verify original data unchanged
    const currentActivity = await getActivityByTitle(supabase, planId, 'Muzeum Luwr');
    expect(currentActivity).toEqual(originalActivity);

    // Verify original title still visible
    await expect(planTimelinePage.getActivity('Muzeum Luwr')).toBeVisible();
    await expect(planTimelinePage.getActivity('Changed Title')).not.toBeVisible();
  });

  test('should cancel editing with Escape key', async () => {
    // Navigate to plan
    await planTimelinePage.goto(planId);

    // Expand day
    await planTimelinePage.expandDay(1);

    // Open edit form
    await planTimelinePage.editActivity('Muzeum Luwr');

    // Make some changes
    await activityFormModal.fillForm({
      title: 'Changed Title',
    });

    // Press Escape
    await activityFormModal.closeWithEscape();

    // Verify modal closed
    expect(await activityFormModal.isVisible()).toBe(false);

    // Verify original title still visible
    await expect(planTimelinePage.getActivity('Muzeum Luwr')).toBeVisible();
  });

  test('should edit multiple fields at once', async ({ supabase }) => {
    // Navigate to plan
    await planTimelinePage.goto(planId);

    // Expand day
    await planTimelinePage.expandDay(1);

    // Edit activity with multiple changes
    await planTimelinePage.editActivity('Muzeum Luwr');

    await activityFormModal.fillForm({
      title: 'Muzeum Orsay',
      location: "Rue de la Légion d'Honneur, Paris",
      time: '11:00',
      duration: 150,
      category: 'Kultura',
      description: 'Muzeum sztuki impresjonistycznej',
      estimatedPrice: '15 EUR',
    });

    // Save
    await activityFormModal.save();

    // Verify new title visible
    await expect(planTimelinePage.getActivity('Muzeum Orsay')).toBeVisible();

    // Verify data in database
    const activity = await getActivityByTitle(supabase, planId, 'Muzeum Orsay');
    expect(activity).toBeTruthy();
    expect((activity as { time: string }).time).toBe('11:00');
    expect((activity as { location: string }).location).toContain('Légion');
  });
});
