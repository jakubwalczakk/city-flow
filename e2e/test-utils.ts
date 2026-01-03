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
