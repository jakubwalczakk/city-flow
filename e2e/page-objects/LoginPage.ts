import { expect } from '@playwright/test';
import type { Page, Locator } from '@playwright/test';

export class LoginPage {
  readonly page: Page;
  readonly emailInput: Locator;
  readonly passwordInput: Locator;
  readonly submitButton: Locator;
  readonly googleAuthButton: Locator;
  readonly errorAlert: Locator;
  readonly forgotPasswordLink: Locator;
  readonly registerLink: Locator;

  constructor(page: Page) {
    this.page = page;
    // Use data-testid selectors for reliability
    this.emailInput = page.getByTestId('auth-email-input');
    this.passwordInput = page.getByTestId('auth-password-input');
    this.submitButton = page.getByTestId('auth-submit-btn');
    this.googleAuthButton = page.getByTestId('google-auth-btn');
    this.errorAlert = page.locator('[role="alert"]').filter({ hasText: /błąd|error|nieprawidłowy/i });
    this.forgotPasswordLink = page.locator('a[href="/forgot-password"]');
    this.registerLink = page.locator('a[href="/register"]');
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

  async getErrorMessage(): Promise<string | null> {
    try {
      await this.errorAlert.waitFor({ state: 'visible', timeout: 5000 });
      return await this.errorAlert.textContent();
    } catch {
      return null;
    }
  }

  async isLoggedIn(): Promise<boolean> {
    // Check if we're on the plans page and user menu is visible
    const isOnPlansPage = this.page.url().includes('/plans');
    const userMenuButton = this.page.locator('button[class*="rounded-full"]');
    const isUserMenuVisible = await userMenuButton.isVisible().catch(() => false);

    return isOnPlansPage && isUserMenuVisible;
  }

  async clickGoogleLogin() {
    await this.googleAuthButton.click();
  }

  async clickForgotPassword() {
    await this.forgotPasswordLink.click();
    await expect(this.page).toHaveURL(/\/forgot-password/, { timeout: 5000 });
  }

  async clickRegisterLink() {
    await this.registerLink.click();
    await expect(this.page).toHaveURL(/\/register/, { timeout: 5000 });
  }
}
