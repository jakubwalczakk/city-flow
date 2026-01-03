import { expect } from '@playwright/test';
import type { Page, Locator } from '@playwright/test';

/**
 * Page Object for the Activity Form Modal.
 * Handles interactions with adding and editing activities.
 */
export class ActivityFormModal {
  readonly page: Page;
  readonly modal: Locator;
  readonly titleInput: Locator;
  readonly locationInput: Locator;
  readonly timeInput: Locator;
  readonly durationInput: Locator;
  readonly categorySelect: Locator;
  readonly descriptionTextarea: Locator;
  readonly estimatedPriceInput: Locator;
  readonly saveButton: Locator;
  readonly cancelButton: Locator;
  readonly errorMessages: Locator;

  constructor(page: Page) {
    this.page = page;
    this.modal = page.getByTestId('activity-form-modal');
    this.titleInput = page.getByTestId('activity-title-input');
    this.locationInput = page.getByTestId('activity-location-input');
    this.timeInput = page.getByTestId('activity-time-input');
    this.durationInput = page.getByTestId('activity-duration-input');
    this.categorySelect = page.getByTestId('activity-category-select');
    this.descriptionTextarea = page.getByTestId('activity-description-input');
    this.estimatedPriceInput = page.getByTestId('activity-price-input');
    this.saveButton = page.getByTestId('save-activity');
    this.cancelButton = page.getByTestId('cancel-activity');
    this.errorMessages = page.locator('[role="alert"]');
  }

  /**
   * Waits for the modal to be visible
   */
  async waitForModal() {
    await expect(this.modal).toBeVisible({ timeout: 5000 });
    await expect(this.titleInput).toBeEnabled({ timeout: 3000 });
    await this.page.waitForTimeout(300);
  }

  /**
   * Fills the activity form with provided data
   */
  async fillForm(data: {
    title: string;
    location?: string;
    time?: string;
    duration?: number;
    category?: string;
    description?: string;
    estimatedPrice?: string;
  }) {
    await this.waitForModal();

    // Title (required)
    await this.titleInput.fill(data.title);

    // Location (optional)
    if (data.location) {
      await this.locationInput.fill(data.location);
    }

    // Time (optional)
    if (data.time) {
      await this.timeInput.fill(data.time);
    }

    // Category (optional)
    if (data.category) {
      await this.categorySelect.click();
      await this.page.waitForTimeout(200);
      // Click on the option
      await this.page.getByRole('option', { name: data.category }).click();
      await this.page.waitForTimeout(200);
    }

    // Duration (optional)
    if (data.duration !== undefined) {
      await this.durationInput.fill(data.duration.toString());
    }

    // Description (optional)
    if (data.description) {
      await this.descriptionTextarea.fill(data.description);
    }

    // Estimated price (optional)
    if (data.estimatedPrice) {
      await this.estimatedPriceInput.fill(data.estimatedPrice);
    }

    // Wait for form validation
    await this.page.waitForTimeout(300);
  }

  /**
   * Saves the form
   */
  async save() {
    await expect(this.saveButton).toBeEnabled({ timeout: 3000 });
    await this.saveButton.click();
    // Wait for modal to close
    await expect(this.modal).not.toBeVisible({ timeout: 5000 });
  }

  /**
   * Cancels the form
   */
  async cancel() {
    await this.cancelButton.click();
    // Wait for modal to close
    await expect(this.modal).not.toBeVisible({ timeout: 5000 });
  }

  /**
   * Closes the form by pressing Escape
   */
  async closeWithEscape() {
    await this.page.keyboard.press('Escape');
    // Wait for modal to close
    await expect(this.modal).not.toBeVisible({ timeout: 5000 });
  }

  /**
   * Gets the first error message displayed
   */
  async getErrorMessage(): Promise<string> {
    const error = this.errorMessages.first();
    if (await error.isVisible()) {
      return (await error.textContent()) || '';
    }
    return '';
  }

  /**
   * Checks if the modal is visible
   */
  async isVisible(): Promise<boolean> {
    return await this.modal.isVisible();
  }

  /**
   * Checks if save button is enabled
   */
  async isSaveButtonEnabled(): Promise<boolean> {
    return await this.saveButton.isEnabled();
  }
}
