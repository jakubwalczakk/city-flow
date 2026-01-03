import { expect } from '@playwright/test';
import type { Page, Locator } from '@playwright/test';

/**
 * Page Object for the History page (/history)
 * Handles interactions with archived plans list and history view.
 */
export class HistoryPage {
  readonly page: Page;
  readonly planCards: Locator;
  readonly emptyState: Locator;
  readonly filterDropdown: Locator;
  readonly yearFilters: Locator;
  readonly pageTitle: Locator;

  constructor(page: Page) {
    this.page = page;
    this.planCards = page.getByTestId('history-plan-card');
    this.emptyState = page.getByTestId('history-empty-state');
    this.filterDropdown = page.getByTestId('history-filter');
    this.yearFilters = page.locator('[data-testid^="filter-year-"]');
    this.pageTitle = page.getByTestId('history-page-title');
  }

  /**
   * Navigate to the history page
   */
  async goto(): Promise<void> {
    await this.page.goto('/history');
    await this.page.waitForLoadState('networkidle');
  }

  /**
   * Get the count of archived plan cards
   */
  async getPlanCount(): Promise<number> {
    try {
      return await this.planCards.count();
    } catch {
      return 0;
    }
  }

  /**
   * Get a specific plan card by name
   */
  getPlanByName(name: string): Locator {
    return this.page.locator(`[data-testid="history-plan-card"]:has-text("${name}")`);
  }

  /**
   * Click on a plan to view its details
   */
  async clickPlan(name: string): Promise<void> {
    const planCard = this.getPlanByName(name);
    await expect(planCard).toBeVisible();
    await planCard.click();
    await this.page.waitForLoadState('networkidle');
  }

  /**
   * Check if the empty state is visible (no archived plans)
   */
  async isEmptyStateVisible(): Promise<boolean> {
    try {
      return await this.emptyState.isVisible();
    } catch {
      return false;
    }
  }

  /**
   * Filter archived plans by year
   */
  async filterByYear(year: number): Promise<void> {
    await this.filterDropdown.click();
    await this.page.locator(`[data-testid="filter-year-${year}"]`).click();
    await this.page.waitForTimeout(300);
  }

  /**
   * Verify a plan with given name exists in history
   */
  async expectPlanExists(name: string): Promise<void> {
    await expect(this.getPlanByName(name)).toBeVisible();
  }

  /**
   * Verify a plan with given name does not exist in history
   */
  async expectPlanNotExists(name: string): Promise<void> {
    await expect(this.getPlanByName(name)).not.toBeVisible();
  }

  /**
   * Wait for history page to load
   */
  async waitForPageLoad(): Promise<void> {
    // Wait for either empty state or plan cards to appear
    await Promise.race([
      this.emptyState.waitFor({ state: 'visible', timeout: 5000 }).catch(() => {
        // Ignore if empty state not found
      }),
      this.planCards
        .first()
        .waitFor({ state: 'visible', timeout: 5000 })
        .catch(() => {
          // Ignore if no plans found
        }),
    ]);
  }

  /**
   * Get the empty state message
   */
  async getEmptyStateMessage(): Promise<string> {
    try {
      return (await this.emptyState.textContent()) || '';
    } catch {
      return '';
    }
  }

  /**
   * Get all plan names visible in history
   */
  async getPlanNames(): Promise<string[]> {
    const cards = await this.planCards.all();
    const names: string[] = [];

    for (const card of cards) {
      const nameElement = card.getByTestId('plan-name');
      const name = await nameElement.textContent();
      if (name) names.push(name.trim());
    }

    return names;
  }

  /**
   * Verify plans are sorted by end date (newest first)
   */
  async verifyPlansSortedByDate(): Promise<void> {
    const cards = await this.planCards.all();
    const dates: string[] = [];

    for (const card of cards) {
      const dateElement = card.getByTestId('plan-end-date');
      const date = await dateElement.textContent();
      if (date) dates.push(date.trim());
    }

    // Verify dates are in descending order
    for (let i = 0; i < dates.length - 1; i++) {
      const date1 = new Date(dates[i]);
      const date2 = new Date(dates[i + 1]);
      expect(date1.getTime()).toBeGreaterThanOrEqual(date2.getTime());
    }
  }
}
