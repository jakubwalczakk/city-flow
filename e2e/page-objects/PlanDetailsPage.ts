import { expect } from '@playwright/test';
import type { Page, Locator, Download } from '@playwright/test';
import { FeedbackModule } from './FeedbackModule';

/**
 * Page Object for the Plan Details page (/plans/[id])
 * Handles interactions with individual plan view, editing, and actions.
 */
export class PlanDetailsPage {
  readonly page: Page;
  readonly planTitle: Locator;
  readonly editTitleButton: Locator;
  readonly titleInput: Locator;
  readonly destination: Locator;
  readonly dates: Locator;
  readonly description: Locator;
  readonly timeline: Locator;
  readonly activities: Locator;
  readonly generateButton: Locator;
  readonly generateAgainButton: Locator;
  readonly exportButton: Locator;
  readonly deleteButton: Locator;
  readonly actionsMenu: Locator;
  readonly fixedPointsList: Locator;
  readonly preferencesList: Locator;
  readonly generationsCounter: Locator;
  readonly generationWarning: Locator;
  readonly generationLoader: Locator;
  readonly moveToHistoryButton: Locator;
  readonly readOnlyBadge: Locator;
  readonly addActivityButton: Locator;
  readonly editActivityButton: Locator;
  readonly deleteActivityButton: Locator;
  readonly feedbackModule: FeedbackModule;

  constructor(page: Page) {
    this.page = page;
    this.planTitle = page.getByRole('heading', { level: 1 });
    this.editTitleButton = page.getByRole('button', { name: /edytuj nazwę planu/i });
    this.titleInput = page.getByTestId('title-input');
    this.destination = page.getByTestId('plan-destination');
    this.dates = page.getByTestId('plan-dates');
    this.description = page.getByTestId('plan-description');
    this.timeline = page.getByTestId('plan-timeline');
    this.activities = page.getByTestId('activity-item');
    this.generateButton = page.getByTestId('generate-plan-button');
    this.generateAgainButton = page.getByTestId('generate-again-button');
    this.exportButton = page.getByTestId('export-pdf-button');
    this.deleteButton = page.getByTestId('delete-plan-button');
    this.actionsMenu = page.getByTestId('plan-actions-menu');
    this.fixedPointsList = page.getByTestId('fixed-points-list');
    this.preferencesList = page.getByTestId('preferences-list');
    this.generationsCounter = page.getByTestId('generations-counter');
    this.generationWarning = page.getByTestId('generation-warning');
    this.generationLoader = page.getByTestId('generation-loader');
    this.moveToHistoryButton = page.getByTestId('move-to-history');
    this.readOnlyBadge = page.getByTestId('readonly-badge');
    this.addActivityButton = page.getByTestId('add-activity-button');
    this.editActivityButton = page.getByTestId('edit-activity-button');
    this.deleteActivityButton = page.getByTestId('delete-activity-button');
    this.feedbackModule = new FeedbackModule(page);
  }

  /**
   * Navigate to a specific plan details page
   */
  async goto(planId: string): Promise<void> {
    await this.page.goto(`/plans/${planId}`, { waitUntil: 'domcontentloaded' });
  }

  /**
   * Get the current plan title text
   */
  async getTitle(): Promise<string> {
    return (await this.planTitle.textContent()) || '';
  }

  /**
   * Edit the plan title using inline editing
   */
  async editTitle(newTitle: string): Promise<void> {
    // Click edit button to enter edit mode
    await expect(this.editTitleButton).toBeVisible();
    await this.editTitleButton.click();

    // Wait for input to appear
    await expect(this.titleInput).toBeVisible();

    // Clear and type new title
    await this.titleInput.fill('');
    await this.titleInput.fill(newTitle);

    // Save by pressing Enter
    await this.titleInput.press('Enter');

    // Wait for save to complete
    await this.page.waitForTimeout(500);
  }

  /**
   * Start editing the title but cancel with Escape
   */
  async cancelTitleEdit(): Promise<void> {
    await this.editTitleButton.click();
    await expect(this.titleInput).toBeVisible();
    await this.titleInput.press('Escape');
    await this.page.waitForTimeout(300);
  }

  /**
   * Get the count of activities in the plan
   */
  async getActivityCount(): Promise<number> {
    try {
      return await this.activities.count();
    } catch {
      return 0;
    }
  }

  /**
   * Delete the current plan
   */
  async deletePlan(): Promise<void> {
    // Open actions menu if it exists
    const hasActionsMenu = await this.actionsMenu.isVisible();
    if (hasActionsMenu) {
      await this.actionsMenu.click();
      await this.page.waitForTimeout(200);
    }

    // Click delete button
    await expect(this.deleteButton).toBeVisible();
    await this.deleteButton.click();

    // Confirm deletion in modal
    const confirmButton = this.page.getByTestId('confirm-delete');
    await expect(confirmButton).toBeVisible();
    await confirmButton.click();

    // Wait for navigation away from this page
    await this.page.waitForURL(/\/plans$/, { timeout: 10000 });
  }

  /**
   * Generate a plan (for draft plans)
   */
  async generatePlan(): Promise<void> {
    await expect(this.generateButton).toBeVisible();
    await expect(this.generateButton).toBeEnabled();
    await this.generateButton.click();

    // Wait for generation to start (loader should appear)
    const loader = this.page.getByTestId('generation-loader');
    await expect(loader).toBeVisible({ timeout: 5000 });

    // Wait for generation to complete (loader disappears)
    await expect(loader).not.toBeVisible({ timeout: 30000 });

    // Wait for page to update
    await this.page.waitForTimeout(1000);
  }

  /**
   * Export plan to PDF and return the Download object
   */
  async exportToPDF(): Promise<Download> {
    // Wait for button to be visible and enabled
    await expect(this.exportButton).toBeVisible({ timeout: 15000 });
    await expect(this.exportButton).toBeEnabled();

    // Start listening for download BEFORE clicking
    const downloadPromise = this.page.waitForEvent('download', { timeout: 60000 });

    // Click the button
    await this.exportButton.click();

    // Wait for and return the download
    return await downloadPromise;
  }

  /**
   * Get the generations counter text (e.g., "3/5")
   */
  async getGenerationsCount(): Promise<string> {
    try {
      return (await this.generationsCounter.textContent()) || '';
    } catch {
      return '';
    }
  }

  /**
   * Get generation warning message if present
   */
  async getGenerationWarning(): Promise<string> {
    try {
      return (await this.generationWarning.textContent()) || '';
    } catch {
      return '';
    }
  }

  /**
   * Check if generation warning is visible
   */
  async hasGenerationWarning(): Promise<boolean> {
    try {
      return await this.generationWarning.isVisible();
    } catch {
      return false;
    }
  }

  /**
   * Regenerate an existing plan
   */
  async regeneratePlan(): Promise<void> {
    await expect(this.generateAgainButton).toBeVisible();
    await expect(this.generateAgainButton).toBeEnabled();
    await this.generateAgainButton.click();

    // Confirm regeneration in modal (if present)
    const confirmButton = this.page.getByTestId('confirm-regenerate');
    const isConfirmVisible = await confirmButton.isVisible({ timeout: 2000 }).catch(() => false);
    if (isConfirmVisible) {
      await confirmButton.click();
    }

    // Wait for generation to start
    await expect(this.generationLoader).toBeVisible({ timeout: 5000 });

    // Wait for generation to complete
    await expect(this.generationLoader).not.toBeVisible({ timeout: 40000 });

    // Wait for page to update
    await this.page.waitForTimeout(1000);
  }

  /**
   * Check if the export button is enabled
   */
  async isExportEnabled(): Promise<boolean> {
    try {
      const isVisible = await this.exportButton.isVisible();
      if (!isVisible) return false;
      return await this.exportButton.isEnabled();
    } catch {
      return false;
    }
  }

  /**
   * Verify that fixed point exists in the timeline
   */
  async hasActivityWithTitle(title: string): Promise<boolean> {
    try {
      const activity = this.page.locator('[data-testid="activity-item"]').filter({ hasText: title });
      return (await activity.count()) > 0;
    } catch {
      return false;
    }
  }

  /**
   * Get all activity titles from the timeline
   */
  async getActivityTitles(): Promise<string[]> {
    try {
      const activityElements = await this.activities.all();
      const titles: string[] = [];
      for (const element of activityElements) {
        const titleElement = element.locator('[data-testid="activity-title"]');
        const title = await titleElement.textContent();
        if (title) titles.push(title.trim());
      }
      return titles;
    } catch {
      return [];
    }
  }

  /**
   * Check if the plan is in draft status (has generate button)
   */
  async isDraft(): Promise<boolean> {
    return await this.generateButton.isVisible();
  }

  /**
   * Check if the plan is generated (has timeline/activities)
   */
  async isGenerated(): Promise<boolean> {
    return await this.timeline.isVisible();
  }

  /**
   * Verify the plan details are displayed correctly
   */
  async verifyPlanDetails(expected: { title?: string; destination?: string }): Promise<void> {
    if (expected.title) {
      await expect(this.planTitle).toContainText(expected.title);
    }
    if (expected.destination) {
      await expect(this.destination).toContainText(expected.destination);
    }
  }

  /**
   * Wait for the plan details page to load completely
   */
  async waitForPageLoad(): Promise<void> {
    // Wait for network idle first (page loaded)
    await this.page.waitForLoadState('networkidle');

    // Wait for React to hydrate
    await this.page.waitForTimeout(1000);

    // Wait for either the plan header to appear (success) or error/not found message
    // Use Promise.race to wait for any one of these conditions
    await Promise.race([
      // Success case: plan header loaded
      this.page.waitForSelector('[data-testid="plan-header"]', {
        state: 'visible',
        timeout: 30000,
      }),
      // Error case: error view
      this.page.waitForSelector('[data-testid="error-view"]', {
        state: 'visible',
        timeout: 30000,
      }),
      // Not found case
      this.page.waitForSelector('[data-testid="not-found-view"]', {
        state: 'visible',
        timeout: 30000,
      }),
    ]);

    // Additional wait for React to fully render child components
    await this.page.waitForTimeout(500);
  }

  /**
   * Check if plan is accessible (for RLS testing)
   * Returns true if the plan loads successfully, false if access is denied
   */
  async isPlanAccessible(): Promise<boolean> {
    try {
      await this.waitForPageLoad();
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Verify error message is shown (for unauthorized access)
   */
  async expectAccessDenied(): Promise<void> {
    // Check for 403/404 error or redirect to plans list
    const is403or404 = this.page.url().includes('/plans') && !this.page.url().match(/\/plans\/[^/]+$/);
    const hasErrorMessage = await this.page
      .getByTestId('plans-list-error')
      .isVisible()
      .catch(() => false);

    expect(is403or404 || hasErrorMessage).toBeTruthy();
  }

  /**
   * Move plan to history/archive
   */
  async moveToHistory(): Promise<void> {
    // Open actions menu if needed
    const hasActionsMenu = await this.actionsMenu.isVisible();
    if (hasActionsMenu) {
      await this.actionsMenu.click();
      await this.page.waitForTimeout(200);
    }

    // Click move to history button
    await expect(this.moveToHistoryButton).toBeVisible();
    await this.moveToHistoryButton.click();

    // Confirm in modal
    const confirmButton = this.page.getByTestId('confirm-archive');
    await expect(confirmButton).toBeVisible();
    await confirmButton.click();

    // Wait for action to complete
    await this.page.waitForTimeout(500);
  }

  /**
   * Cancel moving plan to history
   */
  async cancelMoveToHistory(): Promise<void> {
    // Open actions menu if needed
    const hasActionsMenu = await this.actionsMenu.isVisible();
    if (hasActionsMenu) {
      await this.actionsMenu.click();
      await this.page.waitForTimeout(200);
    }

    // Click move to history button
    await expect(this.moveToHistoryButton).toBeVisible();
    await this.moveToHistoryButton.click();

    // Cancel in modal
    const cancelButton = this.page.getByTestId('cancel-archive');
    await expect(cancelButton).toBeVisible();
    await cancelButton.click();

    // Wait for modal to close
    await this.page.waitForTimeout(300);
  }

  /**
   * Check if plan is in read-only mode (archived)
   */
  async isReadOnly(): Promise<boolean> {
    try {
      return await this.readOnlyBadge.isVisible();
    } catch {
      return false;
    }
  }

  /**
   * Check if the title can be edited
   */
  async canEditTitle(): Promise<boolean> {
    try {
      return await this.editTitleButton.isVisible();
    } catch {
      return false;
    }
  }

  /**
   * Check if activities can be added
   */
  async canAddActivity(): Promise<boolean> {
    try {
      return await this.addActivityButton.isVisible();
    } catch {
      return false;
    }
  }

  /**
   * Check if activities can be edited
   */
  async canEditActivity(): Promise<boolean> {
    try {
      const editButtons = await this.editActivityButton.count();
      return editButtons > 0;
    } catch {
      return false;
    }
  }

  /**
   * Check if activities can be deleted
   */
  async canDeleteActivity(): Promise<boolean> {
    try {
      const deleteButtons = await this.deleteActivityButton.count();
      return deleteButtons > 0;
    } catch {
      return false;
    }
  }

  /**
   * Check if move to history button is visible
   */
  async isMoveToHistoryVisible(): Promise<boolean> {
    try {
      // Open actions menu if needed
      const hasActionsMenu = await this.actionsMenu.isVisible();
      if (hasActionsMenu) {
        await this.actionsMenu.click();
        await this.page.waitForTimeout(200);
      }

      return await this.moveToHistoryButton.isVisible();
    } catch {
      return false;
    }
  }

  /**
   * Check if regenerate button is visible
   */
  async canRegeneratePlan(): Promise<boolean> {
    try {
      return await this.generateAgainButton.isVisible();
    } catch {
      return false;
    }
  }

  /**
   * Scroll to feedback module
   */
  async scrollToFeedback(): Promise<void> {
    await this.feedbackModule.scrollIntoView();
  }

  /**
   * Check if feedback module is visible
   */
  async isFeedbackVisible(): Promise<boolean> {
    return await this.feedbackModule.isVisible();
  }
}
