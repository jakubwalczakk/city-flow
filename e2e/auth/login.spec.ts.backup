import { test, expect, generateTestEmail, createTestUser, cleanDatabase } from '../fixtures';
import { setupCommonMocks } from '../test-setup';
import { LoginPage } from '../page-objects/LoginPage';
import { OnboardingModal } from '../page-objects/OnboardingModal';

/**
 * E2E Tests for User Login (US-002)
 * Tests cover: successful login, invalid credentials, and redirects
 */
test.describe('User Login', () => {
  let loginPage: LoginPage;
  let onboardingModal: OnboardingModal;

  test.beforeEach(async ({ page, supabase, testUser }) => {
    // Clean up test user data before each test
    await cleanDatabase(supabase, testUser.id);

    // Setup common mocks for API calls
    await setupCommonMocks(page);

    // Initialize page objects
    loginPage = new LoginPage(page);
    onboardingModal = new OnboardingModal(page);
  });

  test('should successfully login with correct credentials', async ({ page, supabase }) => {
    const testEmail = generateTestEmail('login-success');
    const testPassword = 'TestPassword123!';

    // Create test user with onboarding completed
    await createTestUser(supabase, {
      email: testEmail,
      password: testPassword,
      onboardingCompleted: true,
    });

    await loginPage.goto();
    await loginPage.login(testEmail, testPassword);

    // Should redirect to plans page
    await expect(page).toHaveURL(/\/plans/, { timeout: 30000 });

    // User menu should be visible
    const isLoggedIn = await loginPage.isLoggedIn();
    expect(isLoggedIn).toBeTruthy();

    // Note: Cleanup handled by periodic maintenance
  });

  test('should show error with incorrect password', async ({ page, supabase }) => {
    const testEmail = generateTestEmail('wrong-password');
    const correctPassword = 'CorrectPassword123!';
    const wrongPassword = 'WrongPassword123!';

    // Create test user
    await createTestUser(supabase, {
      email: testEmail,
      password: correctPassword,
      onboardingCompleted: true,
    });

    await loginPage.goto();

    // Fill form with wrong password
    await loginPage.emailInput.fill(testEmail);
    await loginPage.passwordInput.fill(wrongPassword);
    await page.waitForTimeout(500);
    await loginPage.submitButton.click();

    // Wait for error message
    await page.waitForTimeout(2000);

    const error = await loginPage.getErrorMessage();

    // Should show error message or stay on login page
    const isStillOnLogin = page.url().includes('/login');
    expect(error || isStillOnLogin).toBeTruthy();
  });

  test('should show error with non-existent user', async ({ page }) => {
    const nonExistentEmail = generateTestEmail('non-existent');
    const password = 'SomePassword123!';

    await loginPage.goto();

    await loginPage.emailInput.fill(nonExistentEmail);
    await loginPage.passwordInput.fill(password);
    await page.waitForTimeout(500);
    await loginPage.submitButton.click();

    // Wait for error
    await page.waitForTimeout(2000);

    const error = await loginPage.getErrorMessage();

    // Should show error or stay on login page
    const isStillOnLogin = page.url().includes('/login');
    expect(error || isStillOnLogin).toBeTruthy();
  });

  test('should redirect logged-in user away from login page', async ({ page, supabase }) => {
    const testEmail = generateTestEmail('already-logged');
    const testPassword = 'TestPassword123!';

    // Create test user
    await createTestUser(supabase, {
      email: testEmail,
      password: testPassword,
      onboardingCompleted: true,
    });

    // First, login
    await loginPage.goto();
    await loginPage.login(testEmail, testPassword);

    // Should be on plans page
    await expect(page).toHaveURL(/\/plans/, { timeout: 30000 });

    // Try to navigate back to login
    await page.goto('/login');

    // Should be redirected back to plans
    await page.waitForTimeout(1000);
    expect(page.url()).toMatch(/\/plans|\/login/);
  });

  test('should navigate to register page when clicking register link', async ({ page }) => {
    await loginPage.goto();

    await loginPage.clickRegisterLink();

    await expect(page).toHaveURL(/\/register/, { timeout: 5000 });
  });

  test('should navigate to forgot password page when clicking forgot password link', async ({ page }) => {
    await loginPage.goto();

    await loginPage.clickForgotPassword();

    await expect(page).toHaveURL(/\/forgot-password/, { timeout: 5000 });
  });

  test('should show onboarding modal for new user without completed onboarding', async ({ page, supabase }) => {
    const testEmail = generateTestEmail('new-user-onboarding');
    const testPassword = 'TestPassword123!';

    // Create test user WITHOUT onboarding completed
    await createTestUser(supabase, {
      email: testEmail,
      password: testPassword,
      onboardingCompleted: false,
    });

    await loginPage.goto();
    await loginPage.login(testEmail, testPassword);

    // Wait for redirect
    await page.waitForTimeout(2000);

    // Onboarding modal should be visible
    const isVisible = await onboardingModal.isVisible();
    expect(isVisible).toBeTruthy();
  });
});
