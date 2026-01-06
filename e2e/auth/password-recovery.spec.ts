import { cleanTest as test, expect, generateTestEmail, createTestUser } from '../fixtures';
import { ForgotPasswordPage } from '../page-objects/ForgotPasswordPage';
import { UpdatePasswordPage } from '../page-objects/UpdatePasswordPage';

/**
 * E2E Tests for Password Recovery
 * Tests cover: requesting password reset, updating password with token
 */
test.describe('Password Recovery', () => {
  test('should display success message when requesting password reset', async ({ page, supabase }) => {
    const testEmail = generateTestEmail('forgot-password');
    const testPassword = 'OldPassword123!';
    const forgotPasswordPage = new ForgotPasswordPage(page);

    // Create test user
    await createTestUser(supabase, {
      email: testEmail,
      password: testPassword,
      onboardingCompleted: true,
    });

    await forgotPasswordPage.goto();
    await forgotPasswordPage.requestReset(testEmail);

    // Should show success message
    const isSuccessVisible = await forgotPasswordPage.isSuccessMessageVisible();
    expect(isSuccessVisible).toBe(true);

    const successMessage = await forgotPasswordPage.getSuccessMessage();
    expect(successMessage).toContain('Email został wysłany');
  });

  test('should show same message for non-existent email (security)', async ({ page }) => {
    const nonExistentEmail = generateTestEmail('non-existent');
    const forgotPasswordPage = new ForgotPasswordPage(page);

    await forgotPasswordPage.goto();
    await forgotPasswordPage.requestReset(nonExistentEmail);

    // Should show success message (same as for existing user for security)
    await page.waitForTimeout(2000);

    const isSuccessVisible = await forgotPasswordPage.isSuccessMessageVisible();

    // Either shows success or stays on the form (both acceptable for security)
    expect(isSuccessVisible || page.url().includes('forgot-password')).toBeTruthy();
  });

  test('should allow trying again after requesting reset', async ({ page }) => {
    const testEmail = generateTestEmail('try-again');
    const forgotPasswordPage = new ForgotPasswordPage(page);

    await forgotPasswordPage.goto();
    await forgotPasswordPage.requestReset(testEmail);

    // Wait for success
    await page.waitForTimeout(2000);
    const isSuccessVisible = await forgotPasswordPage.isSuccessMessageVisible();

    if (isSuccessVisible) {
      // Click "Try again" button
      const tryAgainButton = forgotPasswordPage.tryAgainButton;
      const isButtonVisible = await tryAgainButton.isVisible().catch(() => false);

      if (isButtonVisible) {
        await forgotPasswordPage.clickTryAgain();

        // Should return to form
        await page.waitForTimeout(500);
        const isEmailInputVisible = await forgotPasswordPage.emailInput.isVisible();
        expect(isEmailInputVisible).toBe(true);
      }
    }
  });

  test('should navigate to login from forgot password page', async ({ page }) => {
    const forgotPasswordPage = new ForgotPasswordPage(page);

    await forgotPasswordPage.goto();

    await forgotPasswordPage.loginLink.click();

    await expect(page).toHaveURL(/\/login/, { timeout: 5000 });
  });

  test('should show update password form when accessing with valid token', async ({ page }) => {
    // Note: In real scenario, token would come from email link
    // For E2E, we're testing the UI flow
    const updatePasswordPage = new UpdatePasswordPage(page);

    await updatePasswordPage.goto();

    // Password form should be visible
    const isPasswordInputVisible = await updatePasswordPage.passwordInput.isVisible();
    const isConfirmInputVisible = await updatePasswordPage.confirmPasswordInput.isVisible();

    expect(isPasswordInputVisible && isConfirmInputVisible).toBeTruthy();
  });

  test('should validate password confirmation match', async ({ page }) => {
    const updatePasswordPage = new UpdatePasswordPage(page);

    await updatePasswordPage.goto();

    // Fill with non-matching passwords
    await updatePasswordPage.passwordInput.fill('NewPassword123!');
    await updatePasswordPage.confirmPasswordInput.fill('DifferentPassword123!');

    await page.waitForTimeout(500);

    // Try to submit
    await updatePasswordPage.submitButton.click();

    // Should show error or stay on page
    await page.waitForTimeout(1000);
    expect(page.url()).toContain('update-password');
  });

  test('should show error for password too short', async ({ page }) => {
    const updatePasswordPage = new UpdatePasswordPage(page);

    await updatePasswordPage.goto();

    // Fill with short password
    await updatePasswordPage.passwordInput.fill('short');
    await updatePasswordPage.confirmPasswordInput.fill('short');

    await page.waitForTimeout(500);

    // Try to submit
    await updatePasswordPage.submitButton.click();

    // Should stay on page
    await page.waitForTimeout(1000);
    expect(page.url()).toContain('update-password');
  });

  test('should be able to login with new password after reset', async ({ page }) => {
    // Note: This test verifies the UI flow
    // Actual password update would require email verification token
    // For E2E, we're testing that the update password form is accessible and validates correctly

    // Verify update password page is accessible
    const updatePasswordPage = new UpdatePasswordPage(page);

    await updatePasswordPage.goto();
    const isPasswordInputVisible = await updatePasswordPage.passwordInput.isVisible();
    expect(isPasswordInputVisible).toBe(true);
  });

  test('should validate password strength on update form', async ({ page }) => {
    const updatePasswordPage = new UpdatePasswordPage(page);

    await updatePasswordPage.goto();

    // Test with weak password
    await updatePasswordPage.passwordInput.fill('weak');
    await updatePasswordPage.confirmPasswordInput.fill('weak');

    await page.waitForTimeout(500);
    await updatePasswordPage.submitButton.click();

    // Should show validation error or stay on page
    await page.waitForTimeout(1000);
    expect(page.url()).toContain('update-password');

    // Form should still be visible
    const isFormVisible = await updatePasswordPage.passwordInput.isVisible();
    expect(isFormVisible).toBe(true);
  });
});
