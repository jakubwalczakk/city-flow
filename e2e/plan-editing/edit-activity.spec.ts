import { planEditorTest as test, expect } from '../shared-user-fixtures';
import { createPlanWithActivities, getActivityByTitle } from '../fixtures';
import { PlanTimelinePage } from '../page-objects/PlanTimelinePage';
import { ActivityFormModal } from '../page-objects/ActivityFormModal';

test.describe('Edit Activity', () => {
  test('edits activity with single and multiple field changes', async ({ page, supabase, sharedUser }) => {
    const planTimelinePage = new PlanTimelinePage(page);
    const activityFormModal = new ActivityFormModal(page);

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

    await planTimelinePage.goto(planId);
    await planTimelinePage.expandDay(1);

    // Test 1: Edit with time and description change
    await planTimelinePage.editActivity('Muzeum Luwr');
    await activityFormModal.waitForModal();

    await activityFormModal.fillForm({
      title: 'Muzeum Luwr',
      time: '09:00',
      duration: 180,
      description: 'Wizyta w słynnym muzeum. Kupić bilety online wcześniej.',
    });
    await activityFormModal.save();

    await planTimelinePage.waitForToast('Aktywność zaktualizowana');
    await expect(await planTimelinePage.getActivity('Muzeum Luwr')).toBeVisible();

    const activity1 = await getActivityByTitle(supabase, planId, 'Muzeum Luwr');
    expect(activity1).toBeTruthy();
    expect((activity1 as { time: string }).time).toBe('09:00');

    // Test 2: Edit title and location (custom activity)
    await planTimelinePage.editActivity('Lunch w kawiarni');

    await activityFormModal.fillForm({
      title: 'Lunch w Le Marais',
      location: 'Dzielnica Le Marais, Paryż',
    });
    await activityFormModal.save();

    await expect(await planTimelinePage.getActivity('Lunch w Le Marais')).toBeVisible();
    await expect(await planTimelinePage.getActivity('Lunch w kawiarni')).not.toBeVisible();

    // Test 3: Edit multiple fields at once
    await planTimelinePage.editActivity('Lunch w Le Marais');

    await activityFormModal.fillForm({
      title: 'Muzeum Orsay',
      location: "Rue de la Légion d'Honneur, Paris",
      time: '11:00',
      duration: 150,
      category: 'Kultura',
      description: 'Muzeum sztuki impresjonistycznej',
      estimatedPrice: '15 EUR',
    });
    await activityFormModal.save();

    await expect(await planTimelinePage.getActivity('Muzeum Orsay')).toBeVisible();

    const activity3 = await getActivityByTitle(supabase, planId, 'Muzeum Orsay');
    expect(activity3).toBeTruthy();
    expect((activity3 as { time: string }).time).toBe('11:00');
    expect((activity3 as { location: string }).location).toContain('Légion');
  });

  test('cancels editing with button and keyboard without saving changes', async ({ page, supabase, sharedUser }) => {
    const planTimelinePage = new PlanTimelinePage(page);
    const activityFormModal = new ActivityFormModal(page);

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
              time: '10:00',
              duration: '2 godziny',
              category: 'culture',
            },
          ],
        },
      ],
    });

    const originalActivity = await getActivityByTitle(supabase, planId, 'Muzeum Luwr');

    await planTimelinePage.goto(planId);
    await planTimelinePage.expandDay(1);

    // Test cancel with button
    await planTimelinePage.editActivity('Muzeum Luwr');
    await activityFormModal.fillForm({
      title: 'Changed Title 1',
      time: '15:00',
    });
    await activityFormModal.cancel();

    expect(await activityFormModal.isVisible()).toBe(false);
    await expect(await planTimelinePage.getActivity('Muzeum Luwr')).toBeVisible();
    await expect(await planTimelinePage.getActivity('Changed Title 1')).not.toBeVisible();

    let currentActivity = await getActivityByTitle(supabase, planId, 'Muzeum Luwr');
    expect(currentActivity).toEqual(originalActivity);

    // Test cancel with Escape key
    await planTimelinePage.editActivity('Muzeum Luwr');
    await activityFormModal.fillForm({
      title: 'Changed Title 2',
    });
    await activityFormModal.closeWithEscape();

    expect(await activityFormModal.isVisible()).toBe(false);
    await expect(await planTimelinePage.getActivity('Muzeum Luwr')).toBeVisible();

    currentActivity = await getActivityByTitle(supabase, planId, 'Muzeum Luwr');
    expect(currentActivity).toEqual(originalActivity);
  });

  test('changes activity category successfully', async ({ page, supabase, sharedUser }) => {
    const planTimelinePage = new PlanTimelinePage(page);
    const activityFormModal = new ActivityFormModal(page);

    const planId = await createPlanWithActivities(supabase, sharedUser.id, {
      name: 'Paris Trip',
      destination: 'Paris',
      startDate: '2026-06-15',
      days: [
        {
          date: '2026-06-15',
          activities: [
            {
              title: 'Lunch w kawiarni',
              time: '13:00',
              duration: '1 godzina',
              category: 'food',
            },
          ],
        },
      ],
    });

    await planTimelinePage.goto(planId);
    await planTimelinePage.expandDay(1);

    await planTimelinePage.editActivity('Lunch w kawiarni');
    await activityFormModal.fillForm({
      title: 'Lunch w kawiarni',
      category: 'Kultura',
    });
    await activityFormModal.save();

    await expect(await planTimelinePage.getActivity('Lunch w kawiarni')).toBeVisible();
  });
});
