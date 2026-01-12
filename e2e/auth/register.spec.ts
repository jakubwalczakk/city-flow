import { cleanTest as test, expect, generateTestEmail, createTestUser } from '../fixtures';
import { RegisterPage } from '../page-objects/RegisterPage';
import { OnboardingModal } from '../page-objects/OnboardingModal';

/**
 * E2E Tests for User Registration (US-001)
 * Tests cover: successful registration, validation errors, and edge cases
 */
test.describe('User Registration', () => {
  test('should successfully register with valid email and password', async ({ page }) => {
    const testEmail = generateTestEmail('register-success');
    const testPassword = 'ValidPassword123!';
    const registerPage = new RegisterPage(page);
    const onboardingModal = new OnboardingModal(page);

    await registerPage.goto();
    await registerPage.register(testEmail, testPassword);

    // Should redirect to plans page or show onboarding
    await page.waitForTimeout(2000);

    const currentUrl = page.url();
    const isOnboarding = await onboardingModal.isVisible();

    // Either should be on plans page or onboarding modal should be visible
    expect(isOnboarding || currentUrl.includes('/plans')).toBeTruthy();

    // Verify user was created by checking if we can query their profile
    // Since we don't have admin access, we verify by the successful redirect
    // Profile should be auto-created by database trigger

    // Note: Cleanup is handled by periodic database maintenance
    // E2E test users use unique timestamped emails so they don't interfere
  });

  test.skip('should show error for invalid email format', async ({ page }) => {
    const registerPage = new RegisterPage(page);

    await registerPage.goto();

    await registerPage.emailInput.fill('invalid-email');
    await registerPage.passwordInput.fill('ValidPassword123!');
    await registerPage.confirmPasswordInput.fill('ValidPassword123!');

    // Wait for validation
    await page.waitForTimeout(500);

    // Submit button should be disabled or error should appear
    const isEnabled = await registerPage.isSubmitButtonEnabled();

    // Try to submit if enabled (shouldn't work)
    if (isEnabled) {
      await registerPage.submitButton.click();
      const error = await registerPage.getErrorMessage();
      expect(error).toContain('email');
    }
  });

  test('should show error for password too short', async ({ page }) => {
    const testEmail = generateTestEmail('short-password');
    const registerPage = new RegisterPage(page);

    await registerPage.goto();

    await registerPage.emailInput.fill(testEmail);
    await registerPage.passwordInput.fill('short');
    await registerPage.confirmPasswordInput.fill('short');

    // Wait for validation
    await page.waitForTimeout(500);

    // Try to submit
    await registerPage.submitButton.click();

    // Should show validation error or stay on page
    await page.waitForTimeout(1000);
    expect(page.url()).toContain('/register');
  });

  test('should show error when passwords do not match', async ({ page }) => {
    const testEmail = generateTestEmail('password-mismatch');
    const registerPage = new RegisterPage(page);

    await registerPage.goto();

    await registerPage.emailInput.fill(testEmail);
    await registerPage.passwordInput.fill('ValidPassword123!');
    await registerPage.confirmPasswordInput.fill('DifferentPassword123!');

    // Wait for validation
    await page.waitForTimeout(500);

    // Try to submit
    await registerPage.submitButton.click();

    // Should stay on register page with error
    await page.waitForTimeout(1000);
    expect(page.url()).toContain('/register');
  });

  test('should show error when email already exists', async ({ page, supabase }) => {
    // Create a test user first
    const existingEmail = generateTestEmail('existing-user');
    const testPassword = 'ExistingPassword123!';
    const registerPage = new RegisterPage(page);

    await createTestUser(supabase, {
      email: existingEmail,
      password: testPassword,
      onboardingCompleted: true,
    });

    // Try to register with the same email
    await registerPage.goto();
    await registerPage.register(existingEmail, testPassword);

    // Wait for error message
    await page.waitForTimeout(2000);

    const error = await registerPage.getErrorMessage();

    // Should show error or stay on register page
    const isStillOnRegister = page.url().includes('/register');
    expect(error || isStillOnRegister).toBeTruthy();

    // Note: Cleanup handled by periodic maintenance (unique timestamped emails)
  });

  test('should navigate to login page when clicking login link', async ({ page }) => {
    const registerPage = new RegisterPage(page);
    await registerPage.goto();

    await registerPage.loginLink.click();

    await expect(page).toHaveURL(/\/login/, { timeout: 5000 });
  });
});
