# Plan Implementacji: Refaktoryzacja i Centralizacja Testów E2E

## 📋 Spis Treści

1. [Cel i Zakres](#cel-i-zakres)
2. [Analiza Obecnego Stanu](#analiza-obecnego-stanu)
3. [Identyfikacja Problemów](#identyfikacja-problemów)
4. [Plan Działania](#plan-działania)
5. [Szczegółowe Zadania](#szczegółowe-zadania)
6. [Harmonogram](#harmonogram)
7. [Checklist Implementacji](#checklist-implementacji)

---

## 🎯 Cel i Zakres

### Główne Cele

1. **Centralizacja konfiguracji** - Wspólna konfiguracja dla wszystkich testów E2E
2. **Eliminacja duplikatów** - Zmergowanie identycznych scenariuszy testowych
3. **Migracja na data-testid** - Zastąpienie selektorów tekstowych stabilnymi identyfikatorami
4. **Naprawa błędów lintingu** - Usunięcie wszystkich błędów ESLint
5. **Poprawa maintainability** - Łatwiejsza utrzymywalność i rozszerzalność testów

### Zakres Prac

- **28 plików testowych** (.spec.ts)
- **14 Page Objects**
- **1 plik fixtures** (897 linii)
- **1 plik test-setup** (286 linii)
- **Komponenty UI** wymagające dodania data-testid

---

## 📊 Analiza Obecnego Stanu

### Statystyki

```
Testy E2E: 28 plików
├── auth/          5 plików (login, logout, register, onboarding, password-recovery)
├── plans/         6 plików (CRUD operations, RLS)
├── history/       4 pliki (archiving, viewing, readonly)
├── generation/    4 pliki (generate, errors, limits, priorities)
├── plan-editing/  4 pliki (add, edit, delete, validation)
├── export/        1 plik (PDF export)
└── feedback/      2 pliki (rate, submit)

Page Objects: 14 plików
Fixtures: 897 linii (helpers, database operations)
Test Setup: 286 linii (mocks, utilities)
```

### Użycie Selektorów

- **getByTestId**: 172 wystąpienia (✅ dobrze)
- **getByText/getByRole**: 33 wystąpienia (⚠️ do migracji)
- **getByLabel**: 8 wystąpień w ActivityFormModal (⚠️ do migracji)

### Powtarzalność Kodu

Każdy test zawiera:

```typescript
test.beforeEach(async ({ page, supabase, testUser }) => {
  await cleanDatabase(supabase, testUser.id);
  await setupCommonMocks(page); // Czasem brakuje
  loginPage = new LoginPage(page);
  // ... inicjalizacja page objects
  await loginPage.goto();
  await loginPage.login(TEST_USER_EMAIL, TEST_USER_PASSWORD);
});

test.afterEach(async ({ supabase, testUser }) => {
  await cleanDatabase(supabase, testUser.id);
});
```

---

## 🔍 Identyfikacja Problemów

### 1. Duplikacja Kodu

#### A. Powtarzające się beforeEach/afterEach

**Problem**: Każdy plik testowy zawiera identyczny setup
**Pliki**: Wszystkie 28 plików .spec.ts
**Rozwiązanie**: Centralna konfiguracja w fixtures.ts

#### B. Duplikaty Scenariuszy Testowych

##### Login Flow

- `e2e/auth/login.spec.ts` - główne testy logowania
- `e2e/plans/create-plan-full.spec.ts` - zawiera login w beforeEach
- `e2e/plans/plans-list.spec.ts` - zawiera login w beforeEach
- **Wszystkie testy** - zawierają login w beforeEach

**Duplikaty do usunięcia**:

- Testy logowania są już w `auth/login.spec.ts`
- Inne testy powinny używać wspólnego fixture

##### Empty State Testing

Identyczne testy pustego stanu w:

- `e2e/plans/plans-list.spec.ts:31` - "should display empty state when user has no plans"
- `e2e/history/view-history.spec.ts:33` - "should display empty state when no archived plans exist"

**Rozwiązanie**: Jeden test z parametryzacją lub osobne testy (są OK, bo testują różne widoki)

##### Plan Creation

Duplikaty w:

- `e2e/create-plan.spec.ts` - stary plik
- `e2e/plans/create-plan-full.spec.ts` - nowy plik

**Rozwiązanie**: Usunąć `e2e/create-plan.spec.ts`

### 2. Selektory Tekstowe

#### Problematyczne Miejsca

**LoginPage.ts:29** - używa getByRole z tekstem:

```typescript
await expect(this.page.getByRole('heading', { name: 'Witaj ponownie' })).toBeVisible();
```

**ActivityFormModal.ts:25-31** - używa getByLabel:

```typescript
this.titleInput = page.getByLabel('Tytuł');
this.locationInput = page.getByLabel('Lokalizacja');
this.timeInput = page.getByLabel('Godzina');
// ... etc
```

**Testy z getByText**:

- `e2e/page-objects/PlanDetailsPage.ts:325` - komunikaty błędów
- `e2e/plans/plan-rls.spec.ts:124` - komunikaty błędów
- `e2e/plans/delete-plan.spec.ts:74,148,253` - toasty i potwierdzenia
- `e2e/plans/plans-list.spec.ts:229` - informacje o dacie
- `e2e/plans/create-plan-full.spec.ts:131,191` - walidacja

### 3. Brak Wspólnej Konfiguracji

**Problem**: Każdy test definiuje własne:

- Inicjalizację Page Objects
- Proces logowania
- Cleanup database
- Setup mocks

**Brakujące elementy**:

- Wspólny base test class/fixture
- Automatyczne logowanie dla testów wymagających auth
- Globalne timeouty i retry logic
- Wspólne utility functions

### 4. Błędy Lintingu

**Znalezione problemy**:

- `@typescript-eslint/no-unused-vars` w niektórych plikach
- `@typescript-eslint/no-non-null-assertion` w create-plan-full.spec.ts
- Brak spójności w używaniu `void` dla ignorowanych wartości
- Nieużywane importy

---

## 📋 Plan Działania

### Faza 1: Przygotowanie (2-3 dni)

1. Audyt wszystkich testów i identyfikacja duplikatów
2. Audyt wszystkich komponentów UI i brakujących data-testid
3. Stworzenie listy wszystkich wymaganych data-testid
4. Backup obecnych testów

### Faza 2: Centralizacja Konfiguracji (2-3 dni)

1. Stworzenie wspólnych fixtures
2. Refaktoryzacja test-setup.ts
3. Stworzenie base test utilities
4. Migracja wszystkich testów na nową konfigurację

### Faza 3: Dodanie data-testid do Komponentów (3-4 dni)

1. Dodanie data-testid do komponentów auth
2. Dodanie data-testid do komponentów plans
3. Dodanie data-testid do komponentów timeline/activities
4. Dodanie data-testid do komponentów feedback/history

### Faza 4: Migracja Testów (4-5 dni)

1. Migracja Page Objects na data-testid
2. Migracja testów auth
3. Migracja testów plans
4. Migracja testów plan-editing
5. Migracja testów generation/history/feedback/export

### Faza 5: Usunięcie Duplikatów (1-2 dni)

1. Identyfikacja i usunięcie zduplikowanych testów
2. Zmergowanie podobnych scenariuszy
3. Weryfikacja pokrycia testowego

### Faza 6: Naprawa Lintingu (1 dzień)

1. Naprawa wszystkich błędów ESLint
2. Dodanie reguł lintingu dla testów
3. Weryfikacja w CI/CD

### Faza 7: Weryfikacja i Dokumentacja (1-2 dni)

1. Uruchomienie wszystkich testów
2. Weryfikacja że wszystko działa
3. Aktualizacja dokumentacji
4. Code review

---

## 🔧 Szczegółowe Zadania

### Zadanie 1: Centralna Konfiguracja Fixtures

**Plik**: `e2e/fixtures.ts`

#### 1.1 Dodać Authenticated Test Fixture

```typescript
/**
 * Extended test with automatic authentication.
 * Use this for tests that require a logged-in user.
 */
export const authenticatedTest = test.extend<{
  authenticatedPage: Page;
  loginPage: LoginPage;
}>({
  authenticatedPage: async ({ page, testUser }, use) => {
    const loginPage = new LoginPage(page);
    await loginPage.goto();
    await loginPage.login(process.env.E2E_USERNAME!, process.env.E2E_PASSWORD!);
    await use(page);
  },
});
```

#### 1.2 Dodać Auto-cleanup Fixture

```typescript
/**
 * Automatically cleans database before and after each test.
 */
export const cleanTest = test.extend({
  page: async ({ page, supabase, testUser }, use) => {
    // Clean before
    await cleanDatabase(supabase, testUser.id);

    // Setup common mocks
    await setupCommonMocks(page);

    await use(page);

    // Clean after
    await cleanDatabase(supabase, testUser.id);
  },
});
```

#### 1.3 Dodać Combined Fixture

```typescript
/**
 * Combines authentication and auto-cleanup.
 * This is the recommended fixture for most tests.
 */
export const authTest = cleanTest.extend<{
  authenticatedPage: Page;
}>({
  authenticatedPage: async ({ page, testUser }, use) => {
    const loginPage = new LoginPage(page);
    await loginPage.goto();
    await loginPage.login(process.env.E2E_USERNAME!, process.env.E2E_PASSWORD!);
    await use(page);
  },
});
```

### Zadanie 2: Wspólne Utility Functions

**Plik**: `e2e/test-utils.ts` (nowy)

```typescript
import type { Page } from '@playwright/test';

/**
 * Common test utilities for E2E tests.
 */

/**
 * Environment variables with defaults
 */
export const TEST_CONFIG = {
  USER_EMAIL: process.env.E2E_USERNAME || 'test@example.com',
  USER_PASSWORD: process.env.E2E_PASSWORD || 'testpassword123',
  BASE_URL: process.env.BASE_URL || 'http://localhost:3000',
} as const;

/**
 * Common timeouts
 */
export const TIMEOUTS = {
  SHORT: 5000,
  MEDIUM: 10000,
  LONG: 30000,
  GENERATION: 60000,
} as const;

/**
 * Wait for toast notification to appear and disappear
 */
export async function waitForToast(page: Page, expectedText?: string): Promise<void> {
  const toast = page.getByTestId('toast-notification');
  await toast.waitFor({ state: 'visible', timeout: TIMEOUTS.SHORT });

  if (expectedText) {
    await expect(toast).toContainText(expectedText);
  }

  // Wait for toast to disappear
  await toast.waitFor({ state: 'hidden', timeout: TIMEOUTS.MEDIUM });
}

/**
 * Wait for loading state to complete
 */
export async function waitForLoading(page: Page): Promise<void> {
  const loader = page.getByTestId('loading-spinner');
  const isVisible = await loader.isVisible().catch(() => false);

  if (isVisible) {
    await loader.waitFor({ state: 'hidden', timeout: TIMEOUTS.LONG });
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
 * Dismiss modal by pressing Escape
 */
export async function dismissModal(page: Page): Promise<void> {
  await page.keyboard.press('Escape');
  await page.waitForTimeout(500);
}
```

### Zadanie 3: Lista Wymaganych data-testid

#### 3.1 Komponenty Auth

**Pliki**: `src/components/auth/*`

```typescript
// Login/Register Forms
'auth-email-input'; // ✅ Już istnieje
'auth-password-input'; // ✅ Już istnieje
'auth-submit-btn'; // ✅ Już istnieje
'google-auth-btn'; // ✅ Już istnieje
'auth-heading'; // ❌ Dodać (zamiast getByRole heading)
'register-link'; // ❌ Dodać
'login-link'; // ❌ Dodać
'forgot-password-link'; // ❌ Dodać
'error-alert'; // ❌ Dodać (wspólny dla błędów)

// Password Recovery
'reset-password-email-input';
'reset-password-submit-btn';
'reset-password-success-message';
'new-password-input';
'confirm-password-input';
'update-password-submit-btn';

// Onboarding
'onboarding-modal'; // ✅ Już istnieje
'onboarding-skip-btn'; // ✅ Już istnieje
'onboarding-next-btn';
'onboarding-complete-btn';
'travel-pace-slow';
'travel-pace-moderate';
'travel-pace-intensive';
'preference-checkbox'; // + data-preference-id
```

#### 3.2 Komponenty Plans

**Pliki**: `src/components/plans/*`

```typescript
// Plans List
'create-new-plan-btn'; // ✅ Już istnieje
'plan-card'; // ✅ Już istnieje + data-plan-id
'empty-state'; // ✅ Już istnieje
'plan-menu'; // ✅ Już istnieje
'delete-plan-action'; // ✅ Już istnieje
'archive-plan-action';
'plan-status-badge';
'plan-name'; // W każdym plan-card
'plan-destination'; // W każdym plan-card
'plan-dates'; // W każdym plan-card

// New Plan Modal
'plan-name-input'; // ✅ Już istnieje
'plan-destination-input'; // ✅ Już istnieje
'start-date-picker'; // ✅ Już istnieje
'end-date-picker'; // ✅ Już istnieje
'basic-info-next-button'; // ✅ Już istnieje
'add-fixed-point-btn'; // ✅ Już istnieje
'save-fixed-point-btn'; // ✅ Już istnieje
'fixed-point-location-input'; // ✅ Już istnieje
'fixed-point-date-picker'; // ✅ Już istnieje
'fixed-points-next-button'; // ✅ Już istnieje
'create-plan-button'; // ✅ Już istnieje
'modal-close-btn';

// Plan Details
'plan-title';
'edit-title-button';
'title-input';
'save-title-button';
'cancel-title-edit';
'plan-destination-display';
'plan-dates-display';
'plan-status-display';
'generate-plan-button';
'export-pdf-button';
'delete-plan-button';
'archive-plan-button';
'plan-actions-menu';
'fixed-points-list';
'fixed-point-item'; // + data-point-id
'generation-loader';
'generation-progress';
```

#### 3.3 Komponenty Timeline/Activities

**Pliki**: `src/components/timeline/*`, `src/components/activities/*`

```typescript
// Timeline
'plan-timeline';
'timeline-day'; // + data-day-number
'day-title';
'day-date';
'add-activity-btn'; // + data-day-id
'activity-list';

// Activity Items
'activity-item'; // + data-activity-id
'activity-title';
'activity-time';
'activity-duration';
'activity-location';
'activity-description';
'activity-category';
'activity-price';
'edit-activity-btn';
'delete-activity-btn';
'activity-menu';

// Activity Form Modal
'activity-form-modal'; // ✅ Już istnieje
'activity-title-input'; // ❌ Dodać (zamiast getByLabel)
'activity-location-input'; // ❌ Dodać
'activity-time-input'; // ❌ Dodać
'activity-duration-input'; // ❌ Dodać
'activity-category-select'; // ❌ Dodać
'activity-description-input'; // ❌ Dodać
'activity-price-input'; // ❌ Dodać
'save-activity'; // ✅ Już istnieje
'cancel-activity'; // ✅ Już istnieje
```

#### 3.4 Komponenty Feedback

**Pliki**: `src/components/feedback/*`

```typescript
// Feedback Module
'feedback-module';
'feedback-thumbs-up';
'feedback-thumbs-down';
'feedback-comment-input';
'feedback-submit-btn';
'feedback-cancel-btn';
'feedback-success-message';
'feedback-rating-display'; // Dla już wystawionej oceny
```

#### 3.5 Komponenty History

**Pliki**: `src/components/history/*`

```typescript
// History Page
'history-page';
'history-empty-state';
'history-plan-card'; // + data-plan-id
'history-plan-name';
'history-plan-dates';
'history-plan-destination';
'view-archived-plan-btn';
'back-to-plans-btn';
```

#### 3.6 Komponenty Export

**Pliki**: `src/components/export/*`

```typescript
// Export
'export-pdf-btn';
'export-loading';
'export-success-message';
'export-error-message';
```

#### 3.7 Wspólne Komponenty

**Pliki**: `src/components/ui/*`

```typescript
// Common UI
'toast-notification'; // ❌ Dodać
'loading-spinner'; // ❌ Dodać
'error-alert'; // ❌ Dodać
'success-alert'; // ❌ Dodać
'confirm-dialog'; // ❌ Dodać
'confirm-dialog-title';
'confirm-dialog-description';
'confirm-dialog-confirm';
'confirm-dialog-cancel';
'user-menu-button';
'user-menu-dropdown';
'logout-menu-item';
'profile-menu-item';
```

### Zadanie 4: Migracja Page Objects

#### 4.1 LoginPage.ts

**Przed**:

```typescript
await expect(this.page.getByRole('heading', { name: 'Witaj ponownie' })).toBeVisible();
```

**Po**:

```typescript
const heading = this.page.getByTestId('auth-heading');
await expect(heading).toBeVisible();
await expect(heading).toHaveText('Witaj ponownie');
```

#### 4.2 ActivityFormModal.ts

**Przed**:

```typescript
this.titleInput = page.getByLabel('Tytuł');
this.locationInput = page.getByLabel('Lokalizacja');
this.timeInput = page.getByLabel('Godzina');
this.durationInput = page.getByLabel('Czas trwania (minuty)');
this.categorySelect = page.getByLabel('Kategoria');
this.descriptionTextarea = page.getByLabel('Opis');
this.estimatedPriceInput = page.getByLabel('Szacowany koszt');
```

**Po**:

```typescript
this.titleInput = page.getByTestId('activity-title-input');
this.locationInput = page.getByTestId('activity-location-input');
this.timeInput = page.getByTestId('activity-time-input');
this.durationInput = page.getByTestId('activity-duration-input');
this.categorySelect = page.getByTestId('activity-category-select');
this.descriptionTextarea = page.getByTestId('activity-description-input');
this.estimatedPriceInput = page.getByTestId('activity-price-input');
```

#### 4.3 PlanDetailsPage.ts

**Przed**:

```typescript
const hasErrorMessage = await this.page
  .getByText(/brak dostępu|nie znaleziono|access denied|not found/i)
  .isVisible()
  .catch(() => false);
```

**Po**:

```typescript
const errorAlert = this.page.getByTestId('error-alert');
const hasErrorMessage = await errorAlert.isVisible().catch(() => false);
```

### Zadanie 5: Usunięcie Duplikatów

#### 5.1 Pliki do Usunięcia

```bash
# Stary plik - zastąpiony przez plans/create-plan-full.spec.ts
e2e/create-plan.spec.ts

# Przykładowy plik - nie jest potrzebny
e2e/example.spec.ts
```

#### 5.2 Duplikaty do Zmergowania

**Scenariusz**: Feedback submission

- `e2e/feedback/submit-feedback.spec.ts`
- `e2e/feedback/rate-plan.spec.ts`

**Analiza**: Sprawdzić czy nie testują tego samego. Jeśli tak, zmergować.

### Zadanie 6: Naprawa Lintingu

#### 6.1 Reguły ESLint dla Testów

**Plik**: `eslint.config.js`

Dodać specjalną konfigurację dla testów:

```javascript
{
  files: ['e2e/**/*.ts'],
  rules: {
    '@typescript-eslint/no-non-null-assertion': 'off', // Dozwolone w testach
    '@typescript-eslint/no-unused-vars': ['error', {
      argsIgnorePattern: '^_',
      varsIgnorePattern: '^_',
    }],
  },
}
```

#### 6.2 Naprawa Istniejących Błędów

1. **Usunąć nieużywane importy**
2. **Zastąpić `!` asercjami**: `expect(value).toBeDefined()`
3. **Dodać `void` dla ignorowanych wartości**
4. **Usunąć `@typescript-eslint/no-unused-vars` komentarze**

---

## 📅 Harmonogram

### Tydzień 1: Przygotowanie i Centralizacja (5 dni)

**Dzień 1-2**: Audyt i Przygotowanie

- [ ] Audyt wszystkich testów
- [ ] Stworzenie listy duplikatów
- [ ] Stworzenie listy brakujących data-testid
- [ ] Backup obecnych testów

**Dzień 3-4**: Centralizacja Konfiguracji

- [ ] Implementacja authTest fixture
- [ ] Implementacja cleanTest fixture
- [ ] Stworzenie test-utils.ts
- [ ] Aktualizacja test-setup.ts

**Dzień 5**: Weryfikacja

- [ ] Testy działają z nową konfiguracją
- [ ] Code review fixtures

### Tydzień 2: Dodanie data-testid (5 dni)

**Dzień 1**: Komponenty Auth

- [ ] LoginForm
- [ ] RegisterForm
- [ ] ForgotPasswordForm
- [ ] UpdatePasswordForm
- [ ] OnboardingModal

**Dzień 2**: Komponenty Plans (część 1)

- [ ] PlansDashboard
- [ ] PlanCard
- [ ] NewPlanModal
- [ ] EmptyState

**Dzień 3**: Komponenty Plans (część 2)

- [ ] PlanDetailsView
- [ ] PlanHeader
- [ ] PlanActions
- [ ] FixedPointsList

**Dzień 4**: Komponenty Timeline/Activities

- [ ] PlanTimeline
- [ ] TimelineDay
- [ ] ActivityItem
- [ ] ActivityFormModal
- [ ] ActivityActions

**Dzień 5**: Pozostałe Komponenty

- [ ] FeedbackModule
- [ ] HistoryPage
- [ ] ExportButton
- [ ] Toast/Alert components

### Tydzień 3: Migracja Testów (5 dni)

**Dzień 1**: Page Objects

- [ ] LoginPage
- [ ] RegisterPage
- [ ] ForgotPasswordPage
- [ ] OnboardingModal
- [ ] NewPlanPage

**Dzień 2**: Page Objects (cd.)

- [ ] PlansListPage
- [ ] PlanDetailsPage
- [ ] PlanTimelinePage
- [ ] ActivityFormModal
- [ ] HistoryPage
- [ ] FeedbackModule

**Dzień 3**: Testy Auth i Plans

- [ ] Migracja auth/\*.spec.ts (5 plików)
- [ ] Migracja plans/\*.spec.ts (6 plików)

**Dzień 4**: Testy Plan-Editing i Generation

- [ ] Migracja plan-editing/\*.spec.ts (4 pliki)
- [ ] Migracja generation/\*.spec.ts (4 pliki)

**Dzień 5**: Pozostałe Testy

- [ ] Migracja history/\*.spec.ts (4 pliki)
- [ ] Migracja feedback/\*.spec.ts (2 pliki)
- [ ] Migracja export/\*.spec.ts (1 plik)

### Tydzień 4: Finalizacja (3 dni)

**Dzień 1**: Usunięcie Duplikatów

- [ ] Usunięcie create-plan.spec.ts
- [ ] Usunięcie example.spec.ts
- [ ] Zmergowanie podobnych testów
- [ ] Weryfikacja pokrycia

**Dzień 2**: Naprawa Lintingu

- [ ] Naprawa wszystkich błędów ESLint
- [ ] Aktualizacja eslint.config.js
- [ ] Weryfikacja w CI/CD

**Dzień 3**: Dokumentacja i Weryfikacja

- [ ] Uruchomienie wszystkich testów
- [ ] Aktualizacja README.md
- [ ] Aktualizacja dokumentacji Page Objects
- [ ] Final code review

---

## ✅ Checklist Implementacji

### Przygotowanie

- [ ] Backup obecnych testów (git branch)
- [ ] Audyt wszystkich testów zakończony
- [ ] Lista duplikatów stworzona
- [ ] Lista data-testid stworzona

### Centralizacja

- [ ] authTest fixture zaimplementowany
- [ ] cleanTest fixture zaimplementowany
- [ ] test-utils.ts stworzony
- [ ] TEST_CONFIG wyeksportowany
- [ ] TIMEOUTS wyeksportowane
- [ ] Utility functions zaimplementowane

### data-testid w Komponentach

#### Auth

- [ ] LoginForm - wszystkie pola
- [ ] RegisterForm - wszystkie pola
- [ ] ForgotPasswordForm - wszystkie pola
- [ ] UpdatePasswordForm - wszystkie pola
- [ ] OnboardingModal - wszystkie elementy

#### Plans

- [ ] PlansDashboard - przyciski i lista
- [ ] PlanCard - wszystkie elementy
- [ ] NewPlanModal - wszystkie kroki
- [ ] PlanDetailsView - wszystkie sekcje
- [ ] EmptyState - komunikaty

#### Timeline/Activities

- [ ] PlanTimeline - struktura
- [ ] TimelineDay - elementy dnia
- [ ] ActivityItem - wszystkie pola
- [ ] ActivityFormModal - wszystkie inputy
- [ ] ActivityActions - przyciski

#### Feedback/History/Export

- [ ] FeedbackModule - oceny i komentarze
- [ ] HistoryPage - lista archiwum
- [ ] ExportButton - eksport PDF

#### Wspólne

- [ ] Toast notifications
- [ ] Loading spinners
- [ ] Error alerts
- [ ] Success alerts
- [ ] Confirm dialogs
- [ ] User menu

### Migracja Page Objects

- [ ] LoginPage
- [ ] RegisterPage
- [ ] ForgotPasswordPage
- [ ] UpdatePasswordPage
- [ ] OnboardingModal
- [ ] NewPlanPage
- [ ] PlansListPage
- [ ] PlanDetailsPage
- [ ] PlanTimelinePage
- [ ] ActivityFormModal
- [ ] HistoryPage
- [ ] FeedbackModule
- [ ] ProfilePage
- [ ] GenerationLoadingPage

### Migracja Testów

- [ ] auth/login.spec.ts
- [ ] auth/logout.spec.ts
- [ ] auth/register.spec.ts
- [ ] auth/onboarding.spec.ts
- [ ] auth/password-recovery.spec.ts
- [ ] plans/create-plan-full.spec.ts
- [ ] plans/plans-list.spec.ts
- [ ] plans/plan-details.spec.ts
- [ ] plans/edit-plan-name.spec.ts
- [ ] plans/delete-plan.spec.ts
- [ ] plans/plan-rls.spec.ts
- [ ] plan-editing/add-activity.spec.ts
- [ ] plan-editing/edit-activity.spec.ts
- [ ] plan-editing/delete-activity.spec.ts
- [ ] plan-editing/activity-validation.spec.ts
- [ ] generation/generate-plan.spec.ts
- [ ] generation/generation-errors.spec.ts
- [ ] generation/generation-limits.spec.ts
- [ ] generation/generation-priorities.spec.ts
- [ ] history/view-history.spec.ts
- [ ] history/move-to-history.spec.ts
- [ ] history/auto-archive.spec.ts
- [ ] history/history-readonly.spec.ts
- [ ] feedback/rate-plan.spec.ts
- [ ] feedback/submit-feedback.spec.ts
- [ ] export/export-pdf.spec.ts

### Usunięcie Duplikatów

- [ ] Usunięto create-plan.spec.ts
- [ ] Usunięto example.spec.ts
- [ ] Zmergowano podobne testy
- [ ] Weryfikacja pokrycia testowego

### Linting

- [ ] Wszystkie błędy ESLint naprawione
- [ ] eslint.config.js zaktualizowany
- [ ] Brak warnings w testach
- [ ] CI/CD przechodzi

### Dokumentacja

- [ ] README.md zaktualizowany
- [ ] Page Objects udokumentowane
- [ ] Nowe fixtures udokumentowane
- [ ] test-utils.ts udokumentowany
- [ ] Przykłady użycia dodane

### Weryfikacja

- [ ] Wszystkie testy przechodzą lokalnie
- [ ] Wszystkie testy przechodzą w CI/CD
- [ ] Pokrycie testowe zachowane/poprawione
- [ ] Performance testów OK
- [ ] Code review zakończony

---

## 📈 Metryki Sukcesu

### Przed Refaktoryzacją

- Duplikacja kodu: ~40% (powtarzalny beforeEach/afterEach)
- Selektory tekstowe: 33 wystąpienia
- Błędy lintingu: Nieznana liczba (błąd przy uruchomieniu)
- Pliki testowe: 28
- Linie kodu fixtures: 897
- Linie kodu test-setup: 286

### Po Refaktoryzacji (Cele)

- Duplikacja kodu: <10%
- Selektory tekstowe: 0 (wszystkie na data-testid)
- Błędy lintingu: 0
- Pliki testowe: 26 (usunięto 2 duplikaty)
- Linie kodu fixtures: ~1100 (dodano nowe fixtures)
- Linie kodu test-setup: ~350 (dodano utilities)
- Nowe pliki: test-utils.ts (~200 linii)

### Korzyści

1. **Maintainability**: Łatwiejsza utrzymywalność dzięki centralizacji
2. **Reliability**: Stabilniejsze testy dzięki data-testid
3. **Speed**: Szybsze pisanie nowych testów dzięki fixtures
4. **Quality**: Lepsza jakość kodu dzięki lintingowi
5. **DRY**: Eliminacja duplikacji kodu

---

## 🚀 Rozpoczęcie Implementacji

### Krok 1: Stwórz branch

```bash
git checkout -b refactor/e2e-centralization
```

### Krok 2: Backup

```bash
git tag backup-before-e2e-refactor
```

### Krok 3: Rozpocznij od Fazy 1

Zacznij od audytu i przygotowania, następnie przejdź przez kolejne fazy zgodnie z harmonogramem.

### Krok 4: Testuj na bieżąco

Po każdej znaczącej zmianie uruchamiaj testy:

```bash
npm run test:e2e
```

### Krok 5: Commit często

Commituj małe, atomowe zmiany:

```bash
git commit -m "feat(e2e): add authTest fixture"
git commit -m "feat(e2e): add data-testid to LoginForm"
git commit -m "refactor(e2e): migrate LoginPage to data-testid"
```

---

## 📞 Pytania i Wsparcie

W razie pytań lub problemów podczas implementacji:

1. Sprawdź dokumentację Playwright
2. Sprawdź istniejące testy jako przykłady
3. Uruchom testy w debug mode: `npx playwright test --debug`
4. Sprawdź logi w `test-results/`

---

**Dokument stworzony**: 3 stycznia 2026
**Szacowany czas implementacji**: 15-18 dni roboczych
**Priorytet**: Wysoki
**Status**: Gotowy do implementacji
