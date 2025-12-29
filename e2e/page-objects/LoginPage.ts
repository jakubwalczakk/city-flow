import { expect } from '@playwright/test';
import type { Page, Locator } from '@playwright/test';

export class LoginPage {
  readonly page: Page;
  readonly emailInput: Locator;
  readonly passwordInput: Locator;
  readonly submitButton: Locator;

  constructor(page: Page) {
    this.page = page;
    // Use data-testid selectors for reliability
    this.emailInput = page.getByTestId('auth-email-input');
    this.passwordInput = page.getByTestId('auth-password-input');
    this.submitButton = page.getByTestId('auth-submit-btn');
  }

  async goto() {
    await this.page.goto('/login');
    // Wait for the page to load by checking for heading
    await expect(this.page.getByRole('heading', { name: 'Witaj ponownie' })).toBeVisible();
  }

  async login(email: string, password: string) {
    // Wait for form to be ready
    await expect(this.emailInput).toBeVisible();
    await expect(this.passwordInput).toBeVisible();
    await expect(this.submitButton).toBeVisible();
    await expect(this.submitButton).toBeEnabled();

    // Wait for React hydration to complete
    await this.page.waitForTimeout(1000);

    // Fill email field - use pressSequentially for better reliability
    await this.emailInput.click();
    await this.emailInput.fill('');
    await this.emailInput.pressSequentially(email, { delay: 50 });

    // Fill password field
    await this.passwordInput.click();
    await this.passwordInput.fill('');
    await this.passwordInput.pressSequentially(password, { delay: 50 });

    // Wait for React Hook Form validation to complete
    await this.page.waitForTimeout(500);

    // Verify both fields are filled before submitting
    await expect(this.emailInput).toHaveValue(email, { timeout: 5000 });
    await expect(this.passwordInput).toHaveValue(password, { timeout: 5000 });

    // Click submit button
    await this.submitButton.click();

    // Wait for successful login redirect
    await expect(this.page).toHaveURL(/\/plans/, { timeout: 30000 });
  }
}
