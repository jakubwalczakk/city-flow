import { expect } from '@playwright/test';
import type { Page, Locator } from '@playwright/test';

/**
 * Page Object for the Plans List page (/plans)
 * Handles interactions with the plans dashboard and list view.
 */
export class PlansListPage {
  readonly page: Page;
  readonly createPlanButton: Locator;
  readonly planCards: Locator;
  readonly emptyState: Locator;
  readonly filterDropdown: Locator;

  constructor(page: Page) {
    this.page = page;
    this.createPlanButton = page.getByTestId('create-new-plan-btn');
    this.planCards = page.getByTestId('plan-card');
    this.emptyState = page.getByTestId('empty-state');
    this.filterDropdown = page.getByTestId('filter-dropdown');
  }

  /**
   * Navigate to the plans list page
   */
  async goto(): Promise<void> {
    await this.page.goto('/plans');
    // Wait for the page to fully load
    await this.page.waitForLoadState('networkidle');
  }

  /**
   * Get the total count of plan cards visible on the page
   */
  async getPlanCount(): Promise<number> {
    return await this.planCards.count();
  }

  /**
   * Get a specific plan card by name
   */
  getPlanByName(name: string): Locator {
    return this.page.locator(`[data-testid="plan-card"]:has-text("${name}")`);
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
   * Delete a plan from the list using the context menu
   */
  async deletePlan(planName: string): Promise<void> {
    const planCard = this.getPlanByName(planName);
    await expect(planCard).toBeVisible();

    // Click the menu button
    const menuButton = planCard.getByTestId('plan-menu');
    await menuButton.click();

    // Click delete action
    const deleteAction = this.page.getByTestId('delete-plan-action');
    await expect(deleteAction).toBeVisible();
    await deleteAction.click();

    // Confirm in modal
    const confirmButton = this.page.getByTestId('confirm-delete');
    await expect(confirmButton).toBeVisible();
    await confirmButton.click();

    // Wait for the modal to close and the plan to be removed
    await this.page.waitForTimeout(500);
  }

  /**
   * Move a plan to history (archive it)
   */
  async moveToHistory(planName: string): Promise<void> {
    const planCard = this.getPlanByName(planName);
    await expect(planCard).toBeVisible();

    // Click the menu button
    const menuButton = planCard.getByTestId('plan-menu');
    await menuButton.click();

    // Click move to history action
    const moveToHistoryAction = this.page.getByTestId('move-to-history-action');
    await expect(moveToHistoryAction).toBeVisible();
    await moveToHistoryAction.click();

    // Confirm in modal
    const confirmButton = this.page.getByTestId('confirm-archive');
    await expect(confirmButton).toBeVisible();
    await confirmButton.click();

    // Wait for the modal to close and the plan to be moved
    await this.page.waitForTimeout(500);
  }

  /**
   * Start moving a plan to history but cancel the action
   */
  async cancelMoveToHistory(planName: string): Promise<void> {
    const planCard = this.getPlanByName(planName);
    await expect(planCard).toBeVisible();

    // Click the menu button
    const menuButton = planCard.getByTestId('plan-menu');
    await menuButton.click();

    // Click move to history action
    const moveToHistoryAction = this.page.getByTestId('move-to-history-action');
    await expect(moveToHistoryAction).toBeVisible();
    await moveToHistoryAction.click();

    // Cancel in modal
    const cancelButton = this.page.getByTestId('cancel-archive');
    await expect(cancelButton).toBeVisible();
    await cancelButton.click();

    // Wait for the modal to close
    await this.page.waitForTimeout(300);
  }

  /**
   * Check if the empty state is visible (no plans)
   */
  async isEmptyStateVisible(): Promise<boolean> {
    return await this.emptyState.isVisible();
  }

  /**
   * Filter plans by status
   */
  async filterByStatus(status: 'draft' | 'generated'): Promise<void> {
    await this.filterDropdown.click();
    await this.page.getByTestId(`filter-${status}`).click();
    await this.page.waitForTimeout(300);
  }

  /**
   * Verify a plan with given name exists in the list
   */
  async expectPlanExists(name: string): Promise<void> {
    await expect(this.getPlanByName(name)).toBeVisible();
  }

  /**
   * Verify a plan with given name does not exist in the list
   */
  async expectPlanNotExists(name: string): Promise<void> {
    await expect(this.getPlanByName(name)).not.toBeVisible();
  }

  /**
   * Wait for plans to load
   */
  async waitForPlansToLoad(): Promise<void> {
    // Wait for either empty state or plan cards to appear
    await Promise.race([
      this.emptyState.waitFor({ state: 'visible', timeout: 5000 }).catch(() => {
        /* Empty state not visible */
      }),
      this.planCards
        .first()
        .waitFor({ state: 'visible', timeout: 5000 })
        .catch(() => {
          /* Plan cards not visible */
        }),
    ]);
  }
}
