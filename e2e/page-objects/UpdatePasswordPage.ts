import { expect } from '@playwright/test';
import type { Page, Locator } from '@playwright/test';

/**
 * Page Object for the Update Password page (/update-password).
 * Handles password reset flow after clicking the email link.
 */
export class UpdatePasswordPage {
  readonly page: Page;
  readonly passwordInput: Locator;
  readonly confirmPasswordInput: Locator;
  readonly submitButton: Locator;
  readonly successMessage: Locator;
  readonly errorAlert: Locator;
  readonly loginLink: Locator;

  constructor(page: Page) {
    this.page = page;
    this.passwordInput = page.locator('input[type="password"]').first();
    this.confirmPasswordInput = page.locator('input[type="password"]').last();
    this.submitButton = page.locator('button[type="submit"]').filter({ hasText: /Ustaw nowe hasło/i });
    this.successMessage = page.locator('text=/Hasło zostało zmienione/i');
    this.errorAlert = page.locator('[role="alert"]').filter({ hasText: /błąd|error/i });
    this.loginLink = page.locator('a[href="/login"]');
  }

  async goto(token?: string) {
    const url = token ? `/update-password?token=${token}` : '/update-password';
    await this.page.goto(url);
  }

  async updatePassword(newPassword: string, confirmPassword?: string) {
    await this.passwordInput.fill(newPassword);
    await this.confirmPasswordInput.fill(confirmPassword || newPassword);
    await this.submitButton.click();
  }

  async isSuccessMessageVisible(): Promise<boolean> {
    try {
      await this.successMessage.waitFor({ state: 'visible', timeout: 5000 });
      return true;
    } catch {
      return false;
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

  async clickLoginLink() {
    await this.loginLink.click();
    await expect(this.page).toHaveURL(/\/login/, { timeout: 5000 });
  }
}
