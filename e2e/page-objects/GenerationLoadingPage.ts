import { expect } from '@playwright/test';
import type { Page, Locator } from '@playwright/test';

/**
 * Page Object for the Generation Loading state
 * Handles interactions with the loading screen during plan generation
 */
export class GenerationLoadingPage {
  readonly page: Page;
  readonly loader: Locator;
  readonly loaderMessage: Locator;
  readonly cancelButton: Locator;
  readonly errorMessage: Locator;

  constructor(page: Page) {
    this.page = page;
    this.loader = page.getByTestId('generation-loader');
    this.loaderMessage = page.getByTestId('loader-message');
    this.cancelButton = page.getByTestId('cancel-generation');
    this.errorMessage = page.getByTestId('generation-error');
  }

  /**
   * Check if the generation loader is visible
   */
  async isLoaderVisible(): Promise<boolean> {
    try {
      return await this.loader.isVisible();
    } catch {
      return false;
    }
  }

  /**
   * Wait for generation to complete (loader to disappear)
   * @param timeout Maximum time to wait in milliseconds (default: 30s)
   */
  async waitForCompletion(timeout = 30000): Promise<void> {
    await this.loader.waitFor({ state: 'hidden', timeout });
  }

  /**
   * Get the current loader message text
   */
  async getLoaderMessage(): Promise<string> {
    try {
      return (await this.loaderMessage.textContent()) || '';
    } catch {
      return '';
    }
  }

  /**
   * Get error message if generation failed
   */
  async getErrorMessage(): Promise<string> {
    try {
      return (await this.errorMessage.textContent()) || '';
    } catch {
      return '';
    }
  }

  /**
   * Check if error message is displayed
   */
  async hasError(): Promise<boolean> {
    try {
      return await this.errorMessage.isVisible();
    } catch {
      return false;
    }
  }

  /**
   * Cancel generation if cancel button is available
   */
  async cancelGeneration(): Promise<void> {
    const isVisible = await this.cancelButton.isVisible();
    if (isVisible) {
      await this.cancelButton.click();
    }
  }

  /**
   * Wait for loader to appear (useful for verifying generation started)
   */
  async waitForLoader(timeout = 5000): Promise<void> {
    await expect(this.loader).toBeVisible({ timeout });
  }
}
