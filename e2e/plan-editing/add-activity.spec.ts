import { planEditorTest as test, expect } from '../shared-user-fixtures';
import { createPlanWithActivities, cleanupUserData } from '../fixtures';
import { PlanTimelinePage } from '../page-objects/PlanTimelinePage';
import { ActivityFormModal } from '../page-objects/ActivityFormModal';

test.describe('Add Activity to Plan', () => {
  test('adds activity with full and minimal form data to various positions', async ({ page, supabase, sharedUser }) => {
    const planTimelinePage = new PlanTimelinePage(page);
    const activityFormModal = new ActivityFormModal(page);

    // Create plan with existing activities
    const planId = await createPlanWithActivities(supabase, sharedUser.id, {
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

    await planTimelinePage.goto(planId);
    await planTimelinePage.expandDay(1);

    // Test 1: Add activity with full form (between existing activities)
    await planTimelinePage.addActivityToDay(1);
    await activityFormModal.fillForm({
      title: 'Lunch w restauracji Le Marais',
      location: 'Dzielnica Le Marais, Paryż',
      time: '12:30',
      duration: 90,
      category: 'Jedzenie',
      description: 'Lunch w lokalnej restauracji',
    });
    await activityFormModal.save();

    await expect(planTimelinePage.getActivity('Lunch w restauracji Le Marais')).toBeVisible();
    await planTimelinePage.waitForToast('Aktywność dodana');

    // Test 2: Add activity with minimal form (only required fields)
    await planTimelinePage.addActivityToDay(1);
    await activityFormModal.fillForm({
      title: 'Spacer po Montmartre',
      time: '16:00',
    });
    await activityFormModal.save();

    await expect(planTimelinePage.getActivity('Spacer po Montmartre')).toBeVisible();

    // Verify all 4 activities are now visible
    let count = await planTimelinePage.getActivitiesCount();
    expect(count).toBe(4);

    // Test 3: Add to empty day
    await cleanupUserData(supabase, sharedUser.id, { keepUser: true });

    const emptyPlanId = await createPlanWithActivities(supabase, sharedUser.id, {
      name: 'Empty Day Plan',
      destination: 'Rome',
      startDate: '2026-07-01',
      days: [
        {
          date: '2026-07-01',
          activities: [],
        },
      ],
    });

    await planTimelinePage.goto(emptyPlanId);
    await planTimelinePage.addActivityToDay(1);
    await activityFormModal.fillForm({
      title: 'Colosseum Visit',
      time: '10:00',
    });
    await activityFormModal.save();

    await expect(planTimelinePage.getActivity('Colosseum Visit')).toBeVisible();
    count = await planTimelinePage.getActivitiesCount();
    expect(count).toBe(1);
  });

  test('cancels adding activity with button and keyboard', async ({ page, supabase, sharedUser }) => {
    const planTimelinePage = new PlanTimelinePage(page);
    const activityFormModal = new ActivityFormModal(page);

    const planId = await createPlanWithActivities(supabase, sharedUser.id, {
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

    await planTimelinePage.goto(planId);
    await planTimelinePage.expandDay(1);
    const initialCount = await planTimelinePage.getActivitiesCount();

    // Test cancel with button
    await planTimelinePage.addActivityToDay(1);
    await activityFormModal.fillForm({
      title: 'Test Activity 1',
      time: '15:00',
    });
    await activityFormModal.cancel();

    expect(await activityFormModal.isVisible()).toBe(false);
    await expect(planTimelinePage.getActivity('Test Activity 1')).not.toBeVisible();

    // Test cancel with Escape key
    await planTimelinePage.addActivityToDay(1);
    await activityFormModal.fillForm({
      title: 'Test Activity 2',
    });
    await activityFormModal.closeWithEscape();

    expect(await activityFormModal.isVisible()).toBe(false);

    // Verify no activities were added
    const finalCount = await planTimelinePage.getActivitiesCount();
    expect(finalCount).toBe(initialCount);
  });
});
