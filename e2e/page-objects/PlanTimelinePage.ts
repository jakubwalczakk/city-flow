import { expect } from '@playwright/test';
import type { Page, Locator } from '@playwright/test';

/**
 * Page Object for interacting with plan timeline and activities.
 * Used for testing add, edit, and delete operations on activities.
 */
export class PlanTimelinePage {
  readonly page: Page;
  readonly timeline: Locator;
  readonly days: Locator;
  readonly activities: Locator;

  constructor(page: Page) {
    this.page = page;
    this.timeline = page.getByTestId('plan-timeline');
    this.days = page.getByTestId('plan-day');
    this.activities = page.getByTestId('activity-item');
  }

  async goto(planId: string) {
    await this.page.goto(`/plans/${planId}`);
    // Wait for the page to load by checking for the timeline or a day element
    await this.page.waitForLoadState('networkidle');
    await this.page.waitForTimeout(1000); // Give the page time to render
  }

  /**
   * Opens the accordion for a specific day to view its activities
   */
  async expandDay(dayNumber: number) {
    const day = this.days.nth(dayNumber - 1);
    await expect(day).toBeVisible({ timeout: 5000 });

    const trigger = day.locator('button[role="button"]').first();
    await expect(trigger).toBeVisible();

    const isExpanded = (await trigger.getAttribute('data-state')) === 'open';

    if (!isExpanded) {
      await trigger.click();
      await this.page.waitForTimeout(500); // Wait for accordion animation
    }
  }

  /**
   * Clicks the "Add Activity" button for a specific day
   */
  async addActivityToDay(dayNumber: number) {
    await this.expandDay(dayNumber);
    const day = this.days.nth(dayNumber - 1);
    const addButton = day.getByTestId('add-activity-button');
    await expect(addButton).toBeVisible();
    await addButton.click();
    // Wait for modal to open
    await this.page.waitForTimeout(500);
  }

  /**
   * Gets an activity element by its title
   */
  async getActivity(title: string): Promise<Locator> {
    return this.activities.filter({ hasText: title });
  }

  /**
   * Opens the edit menu for an activity and clicks Edit
   */
  async editActivity(title: string) {
    const activity = await this.getActivity(title);
    await expect(activity).toBeVisible();

    // Open dropdown menu
    const menuButton = activity.getByRole('button', { name: 'Otwórz menu' });
    await menuButton.click();
    await this.page.waitForTimeout(300);

    // Click edit option
    const editOption = this.page.getByTestId('edit-activity');
    await editOption.click();
    // Wait for modal to open
    await this.page.waitForTimeout(500);
  }

  /**
   * Opens the delete menu for an activity and confirms deletion
   */
  async deleteActivity(title: string) {
    const activity = await this.getActivity(title);
    await expect(activity).toBeVisible();

    // Open dropdown menu
    const menuButton = activity.getByRole('button', { name: 'Otwórz menu' });
    await menuButton.click();
    await this.page.waitForTimeout(300);

    // Click delete option
    const deleteOption = this.page.getByTestId('delete-activity');
    await deleteOption.click();

    // Wait for confirmation dialog
    await this.page.waitForTimeout(300);

    // Confirm deletion
    const confirmButton = this.page.getByTestId('confirm-delete');
    await expect(confirmButton).toBeVisible();
    await confirmButton.click();

    // Wait for the activity to be removed
    await this.page.waitForTimeout(500);
  }

  /**
   * Gets the total count of activities across all days
   */
  async getActivitiesCount(): Promise<number> {
    return await this.activities.count();
  }

  /**
   * Gets the count of activities for a specific day
   */
  async getActivitiesByDay(dayNumber: number): Promise<number> {
    await this.expandDay(dayNumber);
    const day = this.days.nth(dayNumber - 1);
    return await day.getByTestId('activity-item').count();
  }

  /**
   * Gets the time display for a specific activity
   */
  async getActivityTime(title: string): Promise<string> {
    const activity = await this.getActivity(title);
    const timeElement = activity.getByTestId('activity-time');
    return (await timeElement.textContent()) || '';
  }

  /**
   * Checks if an activity is visible
   */
  async isActivityVisible(title: string): Promise<boolean> {
    const activity = await this.getActivity(title);
    return await activity.isVisible();
  }

  /**
   * Waits for toast message to appear
   */
  async waitForToast(message?: string) {
    const toast = message
      ? this.page.locator('[role="status"]', { hasText: message })
      : this.page.locator('[role="status"]');
    await expect(toast).toBeVisible({ timeout: 5000 });
  }
}
