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
    this.emailInput = page.locator('input[type="email"]');
    this.submitButton = page.locator('button[type="submit"]').filter({ hasText: /Wyślij link/i });
    this.successAlert = page.locator('[role="alert"]').filter({ hasText: /Email został wysłany/i });
    this.errorAlert = page.locator('[role="alert"]').filter({ hasText: /błąd|error/i });
    this.loginLink = page.locator('a[href="/login"]');
    this.tryAgainButton = page.locator('button').filter({ hasText: /Spróbuj ponownie/i });
  }

  async goto() {
    await this.page.goto('/forgot-password');
    // Wait for page to load
    await expect(this.page.getByRole('heading', { name: /Zresetuj hasło/i })).toBeVisible();
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
