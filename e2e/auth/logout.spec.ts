import { cleanTest as test, expect, generateTestEmail, createTestUser } from '../fixtures';
import { LoginPage } from '../page-objects/LoginPage';

/**
 * E2E Tests for User Logout (US-004)
 * Tests cover: successful logout and session cleanup
 */
test.describe('User Logout', () => {
  test('should successfully logout from user menu', async ({ page, supabase }) => {
    const testEmail = generateTestEmail('logout-test');
    const testPassword = 'TestPassword123!';
    const loginPage = new LoginPage(page);

    // Create test user
    await createTestUser(supabase, {
      email: testEmail,
      password: testPassword,
      onboardingCompleted: true,
    });

    // Login first
    await loginPage.goto();
    await loginPage.login(testEmail, testPassword);

    // Verify logged in
    await expect(page).toHaveURL(/\/plans/, { timeout: 30000 });

    // Open user menu and logout
    await page.locator('[data-testid="user-menu-trigger"]').click();

    // Wait for the logout button to be visible in the dropdown
    const logoutButton = page.locator('[data-testid="logout-button"]');
    await logoutButton.waitFor({ state: 'visible', timeout: 10000 });
    await logoutButton.click();

    // Should redirect to home page
    await expect(page).toHaveURL(/\/$/, { timeout: 10000 });

    // User menu should not be visible
    const userMenuVisible = await page
      .locator('[data-testid="user-menu-trigger"]')
      .isVisible()
      .catch(() => false);
    expect(userMenuVisible).toBe(false);

    // Try to access protected page - should redirect to login
    await page.goto('/plans');
    await page.waitForTimeout(1000);

    // Should be redirected to login
    expect(page.url()).toMatch(/\/login|\/$/);
  });

  test('should clear session after logout', async ({ page, supabase, context }) => {
    const testEmail = generateTestEmail('session-clear');
    const testPassword = 'TestPassword123!';
    const loginPage = new LoginPage(page);

    // Create test user
    await createTestUser(supabase, {
      email: testEmail,
      password: testPassword,
      onboardingCompleted: true,
    });

    // Login
    await loginPage.goto();
    await loginPage.login(testEmail, testPassword);

    // Verify logged in
    await expect(page).toHaveURL(/\/plans/, { timeout: 30000 });

    // Get cookies before logout
    const cookiesBeforeLogout = await context.cookies();
    const sessionCookieBefore = cookiesBeforeLogout.find((c) => c.name.includes('auth'));

    // Logout
    await page.locator('[data-testid="user-menu-trigger"]').click();

    // Wait for the logout button to be visible in the dropdown
    const logoutButton = page.locator('[data-testid="logout-button"]');
    await logoutButton.waitFor({ state: 'visible', timeout: 10000 });
    await logoutButton.click();

    // Wait for redirect
    await expect(page).toHaveURL(/\/$/, { timeout: 10000 });

    // Verify session cookie is cleared or changed
    const cookiesAfterLogout = await context.cookies();
    const sessionCookieAfter = cookiesAfterLogout.find((c) => c.name.includes('auth'));

    // Session should be cleared
    expect(sessionCookieAfter?.value).not.toBe(sessionCookieBefore?.value);
  });

  test('should not allow access to protected routes after logout', async ({ page, supabase }) => {
    const testEmail = generateTestEmail('protected-route');
    const testPassword = 'TestPassword123!';
    const loginPage = new LoginPage(page);

    // Create test user
    await createTestUser(supabase, {
      email: testEmail,
      password: testPassword,
      onboardingCompleted: true,
    });

    // Login
    await loginPage.goto();
    await loginPage.login(testEmail, testPassword);
    await expect(page).toHaveURL(/\/plans/, { timeout: 30000 });

    // Logout
    await page.locator('[data-testid="user-menu-trigger"]').click();

    // Wait for the logout button to be visible in the dropdown
    const logoutButton = page.locator('[data-testid="logout-button"]');
    await logoutButton.waitFor({ state: 'visible', timeout: 10000 });
    await logoutButton.click();
    await expect(page).toHaveURL(/\/$/, { timeout: 10000 });

    // Try to access protected routes
    const protectedRoutes = ['/plans', '/profile'];

    for (const route of protectedRoutes) {
      await page.goto(route);
      await page.waitForTimeout(1000);

      // Should be redirected away from protected route
      const currentUrl = page.url();
      expect(currentUrl).toMatch(/\/login|\/$/);
    }
  });

  test('should be able to login again after logout', async ({ page, supabase }) => {
    const testEmail = generateTestEmail('login-after-logout');
    const testPassword = 'TestPassword123!';
    const loginPage = new LoginPage(page);

    // Create test user
    await createTestUser(supabase, {
      email: testEmail,
      password: testPassword,
      onboardingCompleted: true,
    });

    // Login
    await loginPage.goto();
    await loginPage.login(testEmail, testPassword);
    await expect(page).toHaveURL(/\/plans/, { timeout: 30000 });

    // Logout
    await page.locator('[data-testid="user-menu-trigger"]').click();

    // Wait for the logout button to be visible in the dropdown
    const logoutButton = page.locator('[data-testid="logout-button"]');
    await logoutButton.waitFor({ state: 'visible', timeout: 10000 });
    await logoutButton.click();
    await expect(page).toHaveURL(/\/$/, { timeout: 10000 });

    // Login again
    await loginPage.goto();
    await loginPage.login(testEmail, testPassword);

    // Should successfully login again
    await expect(page).toHaveURL(/\/plans/, { timeout: 30000 });

    const isLoggedIn = await loginPage.isLoggedIn();
    expect(isLoggedIn).toBeTruthy();
  });
});
