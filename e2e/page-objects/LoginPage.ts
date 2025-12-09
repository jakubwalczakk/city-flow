import { Page, Locator, expect } from '@playwright/test';

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

    // Wait for React hydration
    await this.page.waitForTimeout(1000);

    // Clear and fill email field
    await this.emailInput.clear();
    await this.emailInput.fill(email);

    // Clear and fill password field
    await this.passwordInput.clear();
    await this.passwordInput.fill(password);

    // Small delay to let React process the input changes
    await this.page.waitForTimeout(200);

    // Verify both fields are filled before submitting
    await expect(this.emailInput).toHaveValue(email);
    await expect(this.passwordInput).toHaveValue(password);

    // Click submit button
    await this.submitButton.click();

    // Wait for successful login redirect
    await expect(this.page).toHaveURL(/\/plans/, { timeout: 30000 });
  }
}
