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
    // Wait for React hydration - the form should have the onSubmit handler attached
    await expect(this.submitButton).toBeVisible();
    await expect(this.submitButton).toBeEnabled();

    // Wait for hydration - check that React has mounted
    await this.page.waitForSelector('[data-testid="auth-email-input"]', { state: 'visible' });

    // Additional wait for React to fully hydrate the form handlers
    await this.page.waitForTimeout(1000);

    // Fill email
    await this.emailInput.click();
    await this.emailInput.fill(email);

    // Verify email was filled
    await expect(this.emailInput).toHaveValue(email);

    // Fill password
    await this.passwordInput.click();
    await this.passwordInput.fill(password);

    // Verify password was filled
    await expect(this.passwordInput).toHaveValue(password);

    // Submit form using keyboard Enter
    await this.passwordInput.press('Enter');

    // Wait for successful login - either redirect to /plans or success message
    // The app shows "Logowanie pomyślne! Przekierowywanie..." and then redirects after 500ms
    await expect(this.page).toHaveURL(/\/plans/, { timeout: 30000 });
  }
}
