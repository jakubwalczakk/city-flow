import { planEditorTest as test, expect } from '../shared-user-fixtures';
import { createPlanWithActivities, countActivities } from '../fixtures';
import { PlanTimelinePage } from '../page-objects/PlanTimelinePage';

test.describe('Delete Activity', () => {
  test('deletes activities from any position (first, middle, last) with confirmation', async ({
    page,
    supabase,
    sharedUser,
  }) => {
    const planTimelinePage = new PlanTimelinePage(page);

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

    await planTimelinePage.goto(planId);
    await planTimelinePage.expandDay(1);

    const initialCount = await planTimelinePage.getActivitiesCount();
    expect(initialCount).toBe(3);

    // Delete from middle
    await planTimelinePage.deleteActivity('Lunch w kawiarni');
    await planTimelinePage.waitForToast('Aktywność usunięta');

    let currentCount = await planTimelinePage.getActivitiesCount();
    expect(currentCount).toBe(2);
    await expect(planTimelinePage.getActivity('Lunch w kawiarni')).not.toBeVisible();
    await expect(planTimelinePage.getActivity('Muzeum Luwr')).toBeVisible();
    await expect(planTimelinePage.getActivity('Wieża Eiffla')).toBeVisible();

    // Delete from beginning
    await planTimelinePage.deleteActivity('Muzeum Luwr');
    await page.waitForTimeout(500);

    currentCount = await planTimelinePage.getActivitiesCount();
    expect(currentCount).toBe(1);
    await expect(planTimelinePage.getActivity('Muzeum Luwr')).not.toBeVisible();
    await expect(planTimelinePage.getActivity('Wieża Eiffla')).toBeVisible();

    // Delete last remaining (from end)
    await planTimelinePage.deleteActivity('Wieża Eiffla');
    await page.waitForTimeout(500);

    currentCount = await planTimelinePage.getActivitiesCount();
    expect(currentCount).toBe(0);
    await expect(planTimelinePage.getActivity('Wieża Eiffla')).not.toBeVisible();

    // Verify database
    const dbCount = await countActivities(supabase, planId);
    expect(dbCount).toBe(0);

    // Verify empty state
    await expect(page.getByText('Brak zaplanowanych aktywności na ten dzień')).toBeVisible();
    await expect(page.getByTestId('add-activity-button')).toBeVisible();
  });

  test('cancels deletion and deletes multiple activities in sequence', async ({ page, supabase, sharedUser }) => {
    const planTimelinePage = new PlanTimelinePage(page);

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

    await planTimelinePage.goto(planId);
    await planTimelinePage.expandDay(1);

    const initialCount = await planTimelinePage.getActivitiesCount();

    // Test cancel deletion
    const activity = await planTimelinePage.getActivity('Lunch w kawiarni');
    await expect(activity).toBeVisible();

    const menuButton = activity.getByRole('button', { name: 'Otwórz menu' });
    await menuButton.click();
    await page.waitForTimeout(300);

    const deleteOption = page.getByTestId('delete-activity');
    await deleteOption.click();
    await page.waitForTimeout(300);

    const cancelButton = page.getByTestId('cancel-delete');
    await expect(cancelButton).toBeVisible();
    await cancelButton.click();

    // Verify nothing changed
    await expect(planTimelinePage.getActivity('Lunch w kawiarni')).toBeVisible();
    let currentCount = await planTimelinePage.getActivitiesCount();
    expect(currentCount).toBe(initialCount);

    // Test sequential deletion
    await planTimelinePage.deleteActivity('Muzeum Luwr');
    await page.waitForTimeout(500);

    await planTimelinePage.deleteActivity('Wieża Eiffla');
    await page.waitForTimeout(500);

    // Verify only one remains
    currentCount = await planTimelinePage.getActivitiesCount();
    expect(currentCount).toBe(1);
    await expect(planTimelinePage.getActivity('Lunch w kawiarni')).toBeVisible();

    const dbCount = await countActivities(supabase, planId);
    expect(dbCount).toBe(1);
  });
});
