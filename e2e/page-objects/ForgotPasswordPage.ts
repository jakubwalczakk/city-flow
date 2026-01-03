import { expect } from '@playwright/test';
import type { Page, Locator } from '@playwright/test';

/**
 * Page Object for the Forgot Password page (/forgot-password).
 * Handles password reset request flow.
 */
export class ForgotPasswordPage {
  readonly page: Page;
  readonly emailInput: Locator;
  readonly submitButton: Locator;
  readonly successAlert: Locator;
  readonly errorAlert: Locator;
  readonly loginLink: Locator;
  readonly tryAgainButton: Locator;

  constructor(page: Page) {
    this.page = page;
    this.emailInput = page.getByTestId('forgot-password-email-input');
    this.submitButton = page.getByTestId('forgot-password-submit-btn');
    this.successAlert = page.getByTestId('success-alert');
    this.errorAlert = page.getByTestId('error-alert');
    this.loginLink = page.getByTestId('login-link');
    this.tryAgainButton = page.locator('button').filter({ hasText: /Spróbuj ponownie/i });
  }

  async goto() {
    await this.page.goto('/forgot-password');
    // Wait for page to load
    const heading = this.page.getByTestId('auth-heading');
    await expect(heading).toBeVisible();
    await expect(heading).toHaveText('Resetuj hasło');
  }

  async requestReset(email: string) {
    await this.emailInput.fill(email);
    await this.submitButton.click();
  }

  async getSuccessMessage(): Promise<string | null> {
    try {
      await this.successAlert.waitFor({ state: 'visible', timeout: 5000 });
      return await this.successAlert.textContent();
    } catch {
      return null;
    }
  }

  async getErrorMessage(): Promise<string | null> {
    try {
      await this.errorAlert.waitFor({ state: 'visible', timeout: 5000 });
      return await this.errorAlert.textContent();
    } catch {
      return null;
    }
  }

  async isSuccessMessageVisible(): Promise<boolean> {
    try {
      await this.successAlert.waitFor({ state: 'visible', timeout: 5000 });
      return true;
    } catch {
      return false;
    }
  }

  async clickTryAgain() {
    await this.tryAgainButton.click();
  }
}
