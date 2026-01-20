import { expect } from '@playwright/test';
import type { Page, Locator } from '@playwright/test';

/**
 * Page Object for the Registration page (/register).
 * Encapsulates interactions with the registration form.
 */
export class RegisterPage {
  readonly page: Page;
  readonly emailInput: Locator;
  readonly passwordInput: Locator;
  readonly confirmPasswordInput: Locator;
  readonly submitButton: Locator;
  readonly errorAlert: Locator;
  readonly successAlert: Locator;
  readonly loginLink: Locator;

  constructor(page: Page) {
    this.page = page;
    // Use data-testid selectors for reliability
    this.emailInput = page.getByTestId('auth-email-input');
    this.passwordInput = page.getByTestId('auth-password-input');
    this.confirmPasswordInput = page.getByTestId('auth-confirm-password-input');
    this.submitButton = page.getByTestId('auth-submit-btn');
    this.errorAlert = page.getByTestId('error-alert');
    this.successAlert = page.getByTestId('success-alert');
    this.loginLink = page.getByTestId('login-link');
  }

  async goto() {
    await this.page.goto('/register');
    // Wait for the page to load by checking for heading
    const heading = this.page.getByTestId('auth-heading');
    await expect(heading).toBeVisible();
    await expect(heading).toHaveText('Stwórz konto');
  }

  async register(email: string, password: string, confirmPassword?: string) {
    // Wait for form to be ready
    await expect(this.emailInput).toBeVisible();
    await expect(this.passwordInput).toBeVisible();
    await expect(this.submitButton).toBeVisible();

    // Wait for React hydration
    await this.page.waitForTimeout(1000);

    // Fill email field
    await this.emailInput.click();
    await this.emailInput.fill('');
    await this.emailInput.pressSequentially(email, { delay: 50 });

    // Fill password field
    await this.passwordInput.click();
    await this.passwordInput.fill('');
    await this.passwordInput.pressSequentially(password, { delay: 50 });

    // Fill confirm password field
    await this.confirmPasswordInput.click();
    await this.confirmPasswordInput.fill('');
    await this.confirmPasswordInput.pressSequentially(confirmPassword || password, { delay: 50 });

    // Wait for validation
    await this.page.waitForTimeout(500);

    // Verify fields are filled
    await expect(this.emailInput).toHaveValue(email, { timeout: 5000 });
    await expect(this.passwordInput).toHaveValue(password, { timeout: 5000 });

    // Click submit button
    await this.submitButton.click();
  }

  async getErrorMessage(): Promise<string | null> {
    try {
      await this.errorAlert.waitFor({ state: 'visible', timeout: 5000 });
      return await this.errorAlert.textContent();
    } catch {
      return null;
    }
  }

  async getFieldError(field: 'email' | 'password' | 'confirmPassword'): Promise<string | null> {
    let fieldLocator: Locator;

    if (field === 'email') {
      fieldLocator = this.emailInput;
    } else if (field === 'password') {
      fieldLocator = this.passwordInput;
    } else {
      fieldLocator = this.confirmPasswordInput;
    }

    // Get the form item containing the field
    const formItem = fieldLocator.locator('xpath=ancestor::*[@class and contains(@class, "space-y-2")]');
    const errorMessage = formItem.locator('p.text-destructive, p.text-sm');

    try {
      await errorMessage.waitFor({ state: 'visible', timeout: 2000 });
      return await errorMessage.textContent();
    } catch {
      return null;
    }
  }

  async isSubmitButtonEnabled(): Promise<boolean> {
    return await this.submitButton.isEnabled();
  }

  async waitForRedirect(expectedUrl: string | RegExp) {
    await expect(this.page).toHaveURL(expectedUrl, { timeout: 30000 });
  }
}
