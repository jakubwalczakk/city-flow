# Przykłady Implementacji - Refaktoryzacja E2E

## 📚 Spis Treści

1. [Przykłady Nowych Fixtures](#przykłady-nowych-fixtures)
2. [Przykłady Migracji Page Objects](#przykłady-migracji-page-objects)
3. [Przykłady Migracji Testów](#przykłady-migracji-testów)
4. [Przykłady Dodawania data-testid](#przykłady-dodawania-data-testid)

---

## 1. Przykłady Nowych Fixtures

### fixtures.ts - Nowe Fixtures

````typescript
// ============================================================================
// AUTHENTICATED TEST FIXTURES
// ============================================================================

/**
 * Test configuration constants
 */
export const TEST_CONFIG = {
  USER_EMAIL: process.env.E2E_USERNAME || 'test@example.com',
  USER_PASSWORD: process.env.E2E_PASSWORD || 'testpassword123',
} as const;

/**
 * Extended test with automatic authentication.
 * Use this for tests that require a logged-in user.
 *
 * @example
 * ```typescript
 * import { authTest as test } from '../fixtures';
 *
 * test('should create a plan', async ({ page }) => {
 *   // User is already logged in
 *   await page.goto('/plans');
 *   // ... test logic
 * });
 * ```
 */
export const authTest = test.extend<{
  authenticatedPage: Page;
}>({
  // Auto-cleanup before test
  page: async ({ page, supabase, testUser }, use) => {
    await cleanDatabase(supabase, testUser.id);
    await setupCommonMocks(page);
    await use(page);
    await cleanDatabase(supabase, testUser.id);
  },

  // Auto-login
  authenticatedPage: async ({ page }, use) => {
    const loginPage = new LoginPage(page);
    await loginPage.goto();
    await loginPage.login(TEST_CONFIG.USER_EMAIL, TEST_CONFIG.USER_PASSWORD);

    // Handle onboarding if it appears
    const onboardingModal = new OnboardingModal(page);
    const isVisible = await onboardingModal.isVisible();
    if (isVisible) {
      await onboardingModal.skip();
    }

    await use(page);
  },
});

/**
 * Test with automatic cleanup but no authentication.
 * Use this for auth-related tests (login, register, etc.)
 *
 * @example
 * ```typescript
 * import { cleanTest as test } from '../fixtures';
 *
 * test('should login successfully', async ({ page }) => {
 *   // Database is cleaned, but user is not logged in
 *   const loginPage = new LoginPage(page);
 *   await loginPage.goto();
 *   // ... test logic
 * });
 * ```
 */
export const cleanTest = test.extend({
  page: async ({ page, supabase, testUser }, use) => {
    await cleanDatabase(supabase, testUser.id);
    await setupCommonMocks(page);
    await use(page);
    await cleanDatabase(supabase, testUser.id);
  },
});

// Export both test and expect for convenience
export { expect } from '@playwright/test';
````

### test-utils.ts - Nowe Utility Functions

```typescript
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
```

---

## 2. Przykłady Migracji Page Objects

### LoginPage.ts - Przed i Po

#### PRZED (używa getByRole z tekstem)

```typescript
async goto() {
  await this.page.goto('/login');
  // ❌ Problem: Zależy od tekstu nagłówka
  await expect(this.page.getByRole('heading', { name: 'Witaj ponownie' })).toBeVisible();
}
```

#### PO (używa data-testid)

```typescript
async goto() {
  await this.page.goto('/login');
  // ✅ Stabilny selektor
  const heading = this.page.getByTestId('auth-heading');
  await expect(heading).toBeVisible();
  // Opcjonalnie: weryfikacja treści
  await expect(heading).toHaveText('Witaj ponownie');
}
```

### ActivityFormModal.ts - Przed i Po

#### PRZED (używa getByLabel)

```typescript
export class ActivityFormModal {
  readonly page: Page;
  readonly titleInput: Locator;
  readonly locationInput: Locator;
  readonly timeInput: Locator;

  constructor(page: Page) {
    this.page = page;
    // ❌ Problem: Zależy od tekstu labelek
    this.titleInput = page.getByLabel('Tytuł');
    this.locationInput = page.getByLabel('Lokalizacja');
    this.timeInput = page.getByLabel('Godzina');
  }
}
```

#### PO (używa data-testid)

```typescript
export class ActivityFormModal {
  readonly page: Page;
  readonly titleInput: Locator;
  readonly locationInput: Locator;
  readonly timeInput: Locator;

  constructor(page: Page) {
    this.page = page;
    // ✅ Stabilne selektory
    this.titleInput = page.getByTestId('activity-title-input');
    this.locationInput = page.getByTestId('activity-location-input');
    this.timeInput = page.getByTestId('activity-time-input');
  }
}
```

### PlanDetailsPage.ts - Przed i Po

#### PRZED (używa getByText z regex)

```typescript
async verifyAccessDenied(): Promise<boolean> {
  // ❌ Problem: Kruchy regex, zależy od tekstów błędów
  const hasErrorMessage = await this.page
    .getByText(/brak dostępu|nie znaleziono|access denied|not found/i)
    .isVisible()
    .catch(() => false);

  return hasErrorMessage;
}
```

#### PO (używa data-testid)

```typescript
async verifyAccessDenied(): Promise<boolean> {
  // ✅ Stabilny selektor
  const errorAlert = this.page.getByTestId('error-alert');
  const isVisible = await errorAlert.isVisible().catch(() => false);

  if (isVisible) {
    // Opcjonalnie: weryfikacja treści błędu
    const text = await errorAlert.textContent();
    return text?.toLowerCase().includes('dostęp') ||
           text?.toLowerCase().includes('nie znaleziono') || false;
  }

  return false;
}
```

---

## 3. Przykłady Migracji Testów

### Test Auth - Przed i Po

#### PRZED (duplikacja setupu)

```typescript
import { test, expect } from '../fixtures';

test.describe('User Login', () => {
  let loginPage: LoginPage;

  test.beforeEach(async ({ page, supabase, testUser }) => {
    // ❌ Duplikacja: każdy test ma ten sam setup
    await cleanDatabase(supabase, testUser.id);
    await setupCommonMocks(page);
    loginPage = new LoginPage(page);
  });

  test.afterEach(async ({ supabase, testUser }) => {
    await cleanDatabase(supabase, testUser.id);
  });

  test('should login successfully', async ({ page }) => {
    await loginPage.goto();
    await loginPage.login('test@example.com', 'password123');
    await expect(page).toHaveURL(/\/plans/);
  });
});
```

#### PO (używa cleanTest fixture)

```typescript
import { cleanTest as test, expect } from '../fixtures';

test.describe('User Login', () => {
  // ✅ Brak duplikacji - fixture obsługuje cleanup

  test('should login successfully', async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.goto();
    await loginPage.login('test@example.com', 'password123');
    await expect(page).toHaveURL(/\/plans/);
  });
});
```

### Test Plans - Przed i Po

#### PRZED (duplikacja logowania)

```typescript
import { test, expect } from '../fixtures';

const TEST_USER_EMAIL = process.env.E2E_USERNAME || 'test@example.com';
const TEST_USER_PASSWORD = process.env.E2E_PASSWORD || 'testpassword123';

test.describe('Plans List', () => {
  let loginPage: LoginPage;
  let plansListPage: PlansListPage;

  test.beforeEach(async ({ page, supabase, testUser }) => {
    // ❌ Duplikacja: logowanie w każdym teście
    await cleanDatabase(supabase, testUser.id);
    loginPage = new LoginPage(page);
    plansListPage = new PlansListPage(page);

    await loginPage.goto();
    await loginPage.login(TEST_USER_EMAIL, TEST_USER_PASSWORD);
  });

  test('should display empty state', async ({ page }) => {
    await plansListPage.goto();
    const isEmpty = await plansListPage.isEmptyStateVisible();
    expect(isEmpty).toBeTruthy();
  });
});
```

#### PO (używa authTest fixture)

```typescript
import { authTest as test, expect } from '../fixtures';

test.describe('Plans List', () => {
  // ✅ Brak duplikacji - fixture obsługuje logowanie i cleanup

  test('should display empty state', async ({ page }) => {
    // User jest już zalogowany
    await page.goto('/plans');

    const plansListPage = new PlansListPage(page);
    const isEmpty = await plansListPage.isEmptyStateVisible();
    expect(isEmpty).toBeTruthy();
  });
});
```

### Test z Utilities - Przed i Po

#### PRZED (ręczne czekanie na toast)

```typescript
test('should delete plan', async ({ page }) => {
  await plansListPage.deletePlan('Test Plan');

  // ❌ Problem: ręczne czekanie, brak weryfikacji
  await page.waitForTimeout(2000);

  // ❌ Problem: kruchy selektor
  await page
    .getByText(/usunięto|deleted/i)
    .isVisible()
    .catch(() => false);
});
```

#### PO (używa utility functions)

```typescript
import { waitForToast } from '../test-utils';

test('should delete plan', async ({ page }) => {
  await plansListPage.deletePlan('Test Plan');

  // ✅ Czysty, reużywalny kod
  await waitForToast(page, { expectedText: 'Plan został usunięty' });
});
```

---

## 4. Przykłady Dodawania data-testid

### Komponent Auth - LoginForm

#### PRZED

```tsx
export function LoginForm() {
  return (
    <form onSubmit={handleSubmit}>
      <h1 className='text-2xl font-bold'>Witaj ponownie</h1>

      <input type='email' placeholder='Email' {...register('email')} />

      <input type='password' placeholder='Hasło' {...register('password')} />

      <button type='submit'>Zaloguj się</button>

      <a href='/forgot-password'>Zapomniałeś hasła?</a>
      <a href='/register'>Zarejestruj się</a>
    </form>
  );
}
```

#### PO

```tsx
export function LoginForm() {
  return (
    <form onSubmit={handleSubmit}>
      {/* ✅ Dodano data-testid */}
      <h1 className='text-2xl font-bold' data-testid='auth-heading'>
        Witaj ponownie
      </h1>

      {/* ✅ Już istnieje */}
      <input type='email' placeholder='Email' data-testid='auth-email-input' {...register('email')} />

      {/* ✅ Już istnieje */}
      <input type='password' placeholder='Hasło' data-testid='auth-password-input' {...register('password')} />

      {/* ✅ Już istnieje */}
      <button type='submit' data-testid='auth-submit-btn'>
        Zaloguj się
      </button>

      {/* ✅ Dodano data-testid */}
      <a href='/forgot-password' data-testid='forgot-password-link'>
        Zapomniałeś hasła?
      </a>

      {/* ✅ Dodano data-testid */}
      <a href='/register' data-testid='register-link'>
        Zarejestruj się
      </a>
    </form>
  );
}
```

### Komponent Plans - ActivityFormModal

#### PRZED

```tsx
export function ActivityFormModal({ isOpen, onClose, onSave }) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogTitle>Dodaj aktywność</DialogTitle>

        <form onSubmit={handleSubmit}>
          <label>
            Tytuł
            <input type='text' {...register('title')} />
          </label>

          <label>
            Lokalizacja
            <input type='text' {...register('location')} />
          </label>

          <label>
            Godzina
            <input type='time' {...register('time')} />
          </label>

          <label>
            Kategoria
            <select {...register('category')}>
              <option value='sightseeing'>Zwiedzanie</option>
              <option value='food'>Jedzenie</option>
            </select>
          </label>

          <button type='submit'>Zapisz</button>
          <button type='button' onClick={onClose}>
            Anuluj
          </button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
```

#### PO

```tsx
export function ActivityFormModal({ isOpen, onClose, onSave }) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      {/* ✅ Dodano data-testid */}
      <DialogContent data-testid='activity-form-modal'>
        <DialogTitle>Dodaj aktywność</DialogTitle>

        <form onSubmit={handleSubmit}>
          <label>
            Tytuł
            {/* ✅ Dodano data-testid */}
            <input type='text' data-testid='activity-title-input' {...register('title')} />
          </label>

          <label>
            Lokalizacja
            {/* ✅ Dodano data-testid */}
            <input type='text' data-testid='activity-location-input' {...register('location')} />
          </label>

          <label>
            Godzina
            {/* ✅ Dodano data-testid */}
            <input type='time' data-testid='activity-time-input' {...register('time')} />
          </label>

          <label>
            Kategoria
            {/* ✅ Dodano data-testid */}
            <select data-testid='activity-category-select' {...register('category')}>
              <option value='sightseeing'>Zwiedzanie</option>
              <option value='food'>Jedzenie</option>
            </select>
          </label>

          {/* ✅ Już istnieje */}
          <button type='submit' data-testid='save-activity'>
            Zapisz
          </button>

          {/* ✅ Już istnieje */}
          <button type='button' onClick={onClose} data-testid='cancel-activity'>
            Anuluj
          </button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
```

### Komponent UI - Toast Notification

#### PRZED

```tsx
export function Toast({ message, type }: ToastProps) {
  return <div className={cn('toast', type)}>{message}</div>;
}
```

#### PO

```tsx
export function Toast({ message, type }: ToastProps) {
  return (
    <div className={cn('toast', type)} data-testid='toast-notification' role='alert'>
      {message}
    </div>
  );
}
```

### Komponent UI - Confirm Dialog

#### PRZED

```tsx
export function ConfirmDialog({ isOpen, title, description, onConfirm, onCancel }: ConfirmDialogProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onCancel}>
      <DialogContent>
        <DialogTitle>{title}</DialogTitle>
        <DialogDescription>{description}</DialogDescription>

        <div className='flex gap-2'>
          <button onClick={onConfirm}>Potwierdź</button>
          <button onClick={onCancel}>Anuluj</button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
```

#### PO

```tsx
export function ConfirmDialog({ isOpen, title, description, onConfirm, onCancel }: ConfirmDialogProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onCancel}>
      {/* ✅ Dodano data-testid */}
      <DialogContent data-testid='confirm-dialog'>
        {/* ✅ Dodano data-testid */}
        <DialogTitle data-testid='confirm-dialog-title'>{title}</DialogTitle>

        {/* ✅ Dodano data-testid */}
        <DialogDescription data-testid='confirm-dialog-description'>{description}</DialogDescription>

        <div className='flex gap-2'>
          {/* ✅ Dodano data-testid */}
          <button onClick={onConfirm} data-testid='confirm-dialog-confirm'>
            Potwierdź
          </button>

          {/* ✅ Dodano data-testid */}
          <button onClick={onCancel} data-testid='confirm-dialog-cancel'>
            Anuluj
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
```

---

## 📝 Najlepsze Praktyki

### 1. Nazewnictwo data-testid

**Dobre**:

```tsx
data-testid="auth-email-input"
data-testid="plan-name-input"
data-testid="activity-title-input"
data-testid="confirm-dialog-confirm"
```

**Złe**:

```tsx
data-testid="input1"
data-testid="btn"
data-testid="modal"
data-testid="text"
```

### 2. Struktura data-testid

Format: `{context}-{element}-{type}`

- `context`: auth, plan, activity, feedback, etc.
- `element`: email, name, title, etc.
- `type`: input, button, modal, etc.

### 3. Dynamiczne data-testid

Dla list elementów:

```tsx
{
  plans.map((plan) => (
    <div key={plan.id} data-testid='plan-card' data-plan-id={plan.id}>
      {/* ... */}
    </div>
  ));
}
```

Użycie w teście:

```typescript
const planCard = page.locator('[data-testid="plan-card"][data-plan-id="123"]');
```

### 4. Unikaj Duplikacji

**Złe**:

```typescript
test('test 1', async ({ page }) => {
  await page.getByTestId('auth-email-input').fill('test@example.com');
  await page.getByTestId('auth-password-input').fill('password');
  await page.getByTestId('auth-submit-btn').click();
});

test('test 2', async ({ page }) => {
  await page.getByTestId('auth-email-input').fill('test@example.com');
  await page.getByTestId('auth-password-input').fill('password');
  await page.getByTestId('auth-submit-btn').click();
});
```

**Dobre**:

```typescript
// Użyj Page Object lub fixture
test('test 1', async ({ page }) => {
  const loginPage = new LoginPage(page);
  await loginPage.login('test@example.com', 'password');
});

test('test 2', async ({ page }) => {
  const loginPage = new LoginPage(page);
  await loginPage.login('test@example.com', 'password');
});
```

---

**Dokument pomocniczy dla**: e2e-refactoring-implementation-plan.md
**Stworzony**: 3 stycznia 2026
