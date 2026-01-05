import { expect, type Page } from '@playwright/test';

/**
 * Common timeouts for E2E tests
 */
export const TIMEOUTS = {
  SHORT: 5000,
  MEDIUM: 10000,
  LONG: 30000,
  GENERATION: 60000,
} as const;

/**
 * Wait for toast notification and optionally verify its content
 */
export async function waitForToast(
  page: Page,
  options?: {
    expectedText?: string;
    timeout?: number;
  }
): Promise<void> {
  const toast = page.getByTestId('toast-notification');
  await toast.waitFor({
    state: 'visible',
    timeout: options?.timeout || TIMEOUTS.SHORT,
  });

  if (options?.expectedText) {
    await expect(toast).toContainText(options.expectedText);
  }

  // Wait for toast to disappear
  await toast.waitFor({
    state: 'hidden',
    timeout: TIMEOUTS.MEDIUM,
  });
}

/**
 * Wait for any loading state to complete
 */
export async function waitForLoading(
  page: Page,
  options?: {
    timeout?: number;
  }
): Promise<void> {
  const loader = page.getByTestId('loading-spinner');
  const isVisible = await loader.isVisible().catch(() => false);

  if (isVisible) {
    await loader.waitFor({
      state: 'hidden',
      timeout: options?.timeout || TIMEOUTS.LONG,
    });
  }
}

/**
 * Verify error message is displayed
 */
export async function expectErrorMessage(page: Page, expectedText: string): Promise<void> {
  const errorAlert = page.getByTestId('error-alert');
  await expect(errorAlert).toBeVisible({ timeout: TIMEOUTS.SHORT });
  await expect(errorAlert).toContainText(expectedText);
}

/**
 * Verify success message is displayed
 */
export async function expectSuccessMessage(page: Page, expectedText: string): Promise<void> {
  const successAlert = page.getByTestId('success-alert');
  await expect(successAlert).toBeVisible({ timeout: TIMEOUTS.SHORT });
  await expect(successAlert).toContainText(expectedText);
}

/**
 * Dismiss modal by pressing Escape
 */
export async function dismissModal(page: Page): Promise<void> {
  await page.keyboard.press('Escape');
  await page.waitForTimeout(500);

  // Verify modal is closed
  const modal = page.locator('[role="dialog"]');
  await expect(modal).not.toBeVisible();
}

/**
 * Confirm action in confirmation dialog
 */
export async function confirmAction(page: Page): Promise<void> {
  const confirmButton = page.getByTestId('confirm-dialog-confirm');
  await expect(confirmButton).toBeVisible({ timeout: TIMEOUTS.SHORT });
  await confirmButton.click();

  // Wait for dialog to close
  const dialog = page.getByTestId('confirm-dialog');
  await expect(dialog).not.toBeVisible({ timeout: TIMEOUTS.MEDIUM });
}

/**
 * Cancel action in confirmation dialog
 */
export async function cancelAction(page: Page): Promise<void> {
  const cancelButton = page.getByTestId('confirm-dialog-cancel');
  await expect(cancelButton).toBeVisible({ timeout: TIMEOUTS.SHORT });
  await cancelButton.click();

  // Wait for dialog to close
  const dialog = page.getByTestId('confirm-dialog');
  await expect(dialog).not.toBeVisible({ timeout: TIMEOUTS.MEDIUM });
}

/**
 * Fill input field with delay (for React Hook Form)
 */
export async function fillInput(
  page: Page,
  testId: string,
  value: string,
  options?: {
    delay?: number;
    clear?: boolean;
  }
): Promise<void> {
  const input = page.getByTestId(testId);
  await expect(input).toBeVisible();
  await expect(input).toBeEnabled();

  if (options?.clear !== false) {
    await input.clear();
  }

  await input.fill(value);

  // Wait for React Hook Form validation
  await page.waitForTimeout(300);
}

/**
 * Select option from dropdown
 */
export async function selectOption(page: Page, testId: string, optionText: string): Promise<void> {
  const select = page.getByTestId(testId);
  await expect(select).toBeVisible();
  await expect(select).toBeEnabled();

  await select.click();
  await page.waitForTimeout(200);

  const option = page.getByRole('option', { name: optionText });
  await option.click();
  await page.waitForTimeout(200);
}

/**
 * Wait for navigation to complete
 */
export async function waitForNavigation(page: Page, expectedUrl: string | RegExp): Promise<void> {
  await expect(page).toHaveURL(expectedUrl, { timeout: TIMEOUTS.LONG });
  await page.waitForLoadState('networkidle');
}

/**
 * Logs in a user programmatically without using the UI.
 * Faster than going through the login page for tests that need authentication.
 */
export async function loginProgrammatically(page: Page, email: string, password: string): Promise<void> {
  // Navigate to login page first to establish session
  await page.goto('/login');

  // Use page.evaluate to call Supabase directly in browser context
  await page.evaluate(
    async ({ email: userEmail, password: userPassword }) => {
      const { createClient } = await import('@supabase/supabase-js');
      const supabase = createClient(import.meta.env.PUBLIC_SUPABASE_URL, import.meta.env.PUBLIC_SUPABASE_ANON_KEY);

      const { error } = await supabase.auth.signInWithPassword({
        email: userEmail,
        password: userPassword,
      });

      if (error) {
        throw new Error(`Login failed: ${error.message}`);
      }
    },
    { email, password }
  );

  // Wait for auth state to be set
  await page.waitForTimeout(1000);

  // Navigate to a protected page to verify login
  await page.goto('/plans');
  await page.waitForLoadState('networkidle');
}

/**
 * Seeds test data for a user.
 * Useful for setting up complex test scenarios.
 */
export async function seedUserTestData(
  page: Page,
  options: {
    plansCount?: number;
    activePlans?: number;
    archivedPlans?: number;
    feedbackCount?: number;
  }
): Promise<void> {
  // This would use fixtures to create test data
  // Implementation depends on specific test needs
  const { plansCount = 0, activePlans = 0, archivedPlans = 0, feedbackCount = 0 } = options;

  // Placeholder for now - would call appropriate fixture functions
  await page.waitForTimeout(100);

  // Seeding test data (options available for future use)
  void plansCount;
  void activePlans;
  void archivedPlans;
  void feedbackCount;
}
