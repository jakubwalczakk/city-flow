import { authTest as test, expect, createPlanWithActivities } from '../fixtures';
import { PlanTimelinePage } from '../page-objects/PlanTimelinePage';
import { ActivityFormModal } from '../page-objects/ActivityFormModal';

test.describe('Add Activity to Plan', () => {
  test('should add custom activity to empty day', async ({ page, supabase, testUser }) => {
    // Local initialization (not global)
    const planTimelinePage = new PlanTimelinePage(page);
    const activityFormModal = new ActivityFormModal(page);

    // Create a plan with one empty day
    const { planId } = await createPlanWithActivities(supabase, testUser.id, {
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

  test('should add activity between existing activities', async ({ page, supabase, testUser }) => {
    // Local initialization (not global)
    const planTimelinePage = new PlanTimelinePage(page);
    const activityFormModal = new ActivityFormModal(page);

    // Create plan with activities at 9:00 and 14:00
    const { planId } = await createPlanWithActivities(supabase, testUser.id, {
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

  test('should add activity with minimal form (only required fields)', async ({ page, supabase, testUser }) => {
    // Local initialization (not global)
    const planTimelinePage = new PlanTimelinePage(page);
    const activityFormModal = new ActivityFormModal(page);

    // Create a plan first
    const { planId } = await createPlanWithActivities(supabase, testUser.id, {
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

  test('should cancel adding activity', async ({ page, supabase, testUser }) => {
    // Local initialization (not global)
    const planTimelinePage = new PlanTimelinePage(page);
    const activityFormModal = new ActivityFormModal(page);

    // Create a plan first
    const { planId } = await createPlanWithActivities(supabase, testUser.id, {
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

  test('should close form with Escape key', async ({ page, supabase, testUser }) => {
    // Local initialization (not global)
    const planTimelinePage = new PlanTimelinePage(page);
    const activityFormModal = new ActivityFormModal(page);

    // Create a plan first
    const { planId } = await createPlanWithActivities(supabase, testUser.id, {
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
