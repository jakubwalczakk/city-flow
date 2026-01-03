# 🎨 Wizualny Przewodnik Refaktoryzacji E2E

## 📊 Architektura Przed i Po

### PRZED: Duplikacja i Chaos 😰

```
┌─────────────────────────────────────────────────────────┐
│                    e2e/auth/login.spec.ts               │
├─────────────────────────────────────────────────────────┤
│ beforeEach:                                             │
│   ❌ cleanDatabase(supabase, testUser.id)              │
│   ❌ setupCommonMocks(page)                            │
│   ❌ loginPage = new LoginPage(page)                   │
│   ❌ await loginPage.goto()                            │
│   ❌ await loginPage.login(email, password)            │
│                                                         │
│ afterEach:                                              │
│   ❌ cleanDatabase(supabase, testUser.id)              │
└─────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────┐
│                   e2e/plans/plans-list.spec.ts          │
├─────────────────────────────────────────────────────────┤
│ beforeEach:                                             │
│   ❌ cleanDatabase(supabase, testUser.id)              │
│   ❌ setupCommonMocks(page)                            │
│   ❌ loginPage = new LoginPage(page)                   │
│   ❌ await loginPage.goto()                            │
│   ❌ await loginPage.login(email, password)            │
│                                                         │
│ afterEach:                                              │
│   ❌ cleanDatabase(supabase, testUser.id)              │
└─────────────────────────────────────────────────────────┘
                          ↓
                    ... x26 więcej plików
```

**Problem**: Każdy plik ma identyczny setup! 🔁

---

### PO: Centralizacja i Czystość 🎉

```
┌─────────────────────────────────────────────────────────┐
│                      e2e/fixtures.ts                    │
├─────────────────────────────────────────────────────────┤
│ ✅ authTest fixture:                                    │
│    - Auto cleanup (before & after)                      │
│    - Auto mocks setup                                   │
│    - Auto login                                         │
│    - Auto onboarding handling                           │
│                                                         │
│ ✅ cleanTest fixture:                                   │
│    - Auto cleanup (before & after)                      │
│    - Auto mocks setup                                   │
│    - NO login (for auth tests)                          │
└─────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────┐
│                    e2e/auth/login.spec.ts               │
├─────────────────────────────────────────────────────────┤
│ import { cleanTest as test } from '../fixtures';        │
│                                                         │
│ test('should login', async ({ page }) => {             │
│   ✅ Czysty kod - fixture obsługuje setup              │
│   const loginPage = new LoginPage(page);               │
│   await loginPage.login(email, password);              │
│ });                                                     │
└─────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────┐
│                   e2e/plans/plans-list.spec.ts          │
├─────────────────────────────────────────────────────────┤
│ import { authTest as test } from '../fixtures';         │
│                                                         │
│ test('should show plans', async ({ page }) => {        │
│   ✅ User już zalogowany - fixture to zrobił           │
│   await page.goto('/plans');                           │
│   // ... test logic                                    │
│ });                                                     │
└─────────────────────────────────────────────────────────┘
```

**Korzyść**: Brak duplikacji! DRY principle! 🚀

---

## 🎯 Selektory: Przed i Po

### PRZED: Kruche Selektory 😰

```typescript
┌─────────────────────────────────────────────────────────┐
│                    LoginPage.ts                         │
├─────────────────────────────────────────────────────────┤
│ async goto() {                                          │
│   await this.page.goto('/login');                       │
│   ❌ await this.page                                    │
│       .getByRole('heading', { name: 'Witaj ponownie' }) │
│       .toBeVisible();                                   │
│ }                                                       │
└─────────────────────────────────────────────────────────┘
                          ↓
              Co jeśli zmieni się tekst?
              Co jeśli dodamy tłumaczenia?
              Co jeśli zmieni się struktura HTML?
                          ↓
                    ❌ TEST FAILS
```

```typescript
┌─────────────────────────────────────────────────────────┐
│                 ActivityFormModal.ts                    │
├─────────────────────────────────────────────────────────┤
│ constructor(page: Page) {                               │
│   ❌ this.titleInput = page.getByLabel('Tytuł');       │
│   ❌ this.locationInput = page.getByLabel('Lokalizacja');│
│   ❌ this.timeInput = page.getByLabel('Godzina');      │
│ }                                                       │
└─────────────────────────────────────────────────────────┘
                          ↓
              Co jeśli zmieni się label?
              Co jeśli dodamy tłumaczenia?
                          ↓
                    ❌ TEST FAILS
```

---

### PO: Stabilne Selektory 🎉

```typescript
┌─────────────────────────────────────────────────────────┐
│                    LoginForm.tsx                        │
├─────────────────────────────────────────────────────────┤
│ <h1 data-testid="auth-heading">                         │
│   {t('auth.welcome')}  ✅ Może się zmienić             │
│ </h1>                                                   │
└─────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────┐
│                    LoginPage.ts                         │
├─────────────────────────────────────────────────────────┤
│ async goto() {                                          │
│   await this.page.goto('/login');                       │
│   ✅ const heading = this.page.getByTestId('auth-heading');│
│   await expect(heading).toBeVisible();                  │
│   // Opcjonalnie: weryfikuj treść                      │
│   await expect(heading).toHaveText(/witaj/i);          │
│ }                                                       │
└─────────────────────────────────────────────────────────┘
                          ↓
              Tekst może się zmienić ✅
              Tłumaczenia działają ✅
              Struktura HTML może się zmienić ✅
                          ↓
                    ✅ TEST PASSES
```

```typescript
┌─────────────────────────────────────────────────────────┐
│              ActivityFormModal.tsx                      │
├─────────────────────────────────────────────────────────┤
│ <label>                                                 │
│   {t('activity.title')}  ✅ Może się zmienić           │
│   <input                                                │
│     data-testid="activity-title-input"  ✅ Stabilne    │
│     {...register('title')}                              │
│   />                                                    │
│ </label>                                                │
└─────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────┐
│                 ActivityFormModal.ts                    │
├─────────────────────────────────────────────────────────┤
│ constructor(page: Page) {                               │
│   ✅ this.titleInput = page.getByTestId('activity-title-input');│
│   ✅ this.locationInput = page.getByTestId('activity-location-input');│
│   ✅ this.timeInput = page.getByTestId('activity-time-input');│
│ }                                                       │
└─────────────────────────────────────────────────────────┘
```

---

## 🗂️ Struktura Plików

### Obecna Struktura

```
e2e/
├── fixtures.ts                    ⚠️  897 linii, dużo helpers
├── test-setup.ts                  ⚠️  286 linii, mocks
├── auth/                          ✅  5 testów
│   ├── login.spec.ts              ❌  Duplikacja setupu
│   ├── register.spec.ts           ❌  Duplikacja setupu
│   ├── logout.spec.ts             ❌  Duplikacja setupu
│   ├── onboarding.spec.ts         ❌  Duplikacja setupu
│   └── password-recovery.spec.ts  ❌  Duplikacja setupu
├── plans/                         ✅  6 testów
│   ├── create-plan-full.spec.ts   ❌  Duplikacja setupu
│   ├── plans-list.spec.ts         ❌  Duplikacja setupu
│   ├── plan-details.spec.ts       ❌  Duplikacja setupu
│   ├── edit-plan-name.spec.ts     ❌  Duplikacja setupu
│   ├── delete-plan.spec.ts        ❌  Duplikacja setupu
│   └── plan-rls.spec.ts           ❌  Duplikacja setupu
├── plan-editing/                  ✅  4 testy
├── generation/                    ✅  4 testy
├── history/                       ✅  4 testy
├── feedback/                      ✅  2 testy
├── export/                        ✅  1 test
├── page-objects/                  ⚠️  14 Page Objects
│   ├── LoginPage.ts               ❌  getByRole z tekstem
│   ├── ActivityFormModal.ts       ❌  8x getByLabel
│   └── ...                        ⚠️  Niektóre getByText
├── create-plan.spec.ts            ❌  DUPLIKAT - do usunięcia
└── example.spec.ts                ❌  PRZYKŁAD - do usunięcia
```

### Docelowa Struktura

```
e2e/
├── fixtures.ts                    ✅  ~1100 linii (+ authTest, cleanTest)
├── test-setup.ts                  ✅  ~350 linii (+ utilities)
├── test-utils.ts                  ✅  NOWY! ~200 linii utilities
├── auth/                          ✅  5 testów
│   ├── login.spec.ts              ✅  cleanTest fixture
│   ├── register.spec.ts           ✅  cleanTest fixture
│   ├── logout.spec.ts             ✅  authTest fixture
│   ├── onboarding.spec.ts         ✅  authTest fixture
│   └── password-recovery.spec.ts  ✅  cleanTest fixture
├── plans/                         ✅  6 testów
│   ├── create-plan-full.spec.ts   ✅  authTest fixture
│   ├── plans-list.spec.ts         ✅  authTest fixture
│   ├── plan-details.spec.ts       ✅  authTest fixture
│   ├── edit-plan-name.spec.ts     ✅  authTest fixture
│   ├── delete-plan.spec.ts        ✅  authTest fixture + utilities
│   └── plan-rls.spec.ts           ✅  cleanTest fixture
├── plan-editing/                  ✅  4 testy (authTest)
├── generation/                    ✅  4 testy (authTest)
├── history/                       ✅  4 testy (authTest)
├── feedback/                      ✅  2 testy (authTest)
├── export/                        ✅  1 test (authTest)
└── page-objects/                  ✅  14 Page Objects
    ├── LoginPage.ts               ✅  data-testid only
    ├── ActivityFormModal.ts       ✅  data-testid only
    └── ...                        ✅  data-testid only
```

---

## 📈 Timeline Wizualizacja

```
Tydzień 1: Przygotowanie i Auth
├── Dzień 1: Setup
│   ├── ✅ Branch + backup
│   ├── ✅ test-utils.ts
│   ├── ✅ fixtures.ts update
│   └── ✅ Pierwszy test
│
├── Dzień 2: Auth UI
│   ├── ✅ LoginForm
│   ├── ✅ RegisterForm
│   └── ✅ ForgotPasswordForm
│
├── Dzień 3: Common UI
│   ├── ✅ Toast
│   ├── ✅ Alerts
│   └── ✅ ConfirmDialog
│
├── Dzień 4: Page Objects
│   ├── ✅ LoginPage
│   ├── ✅ RegisterPage
│   └── ✅ ForgotPasswordPage
│
└── Dzień 5: Tests
    ├── ✅ login.spec.ts
    ├── ✅ register.spec.ts
    ├── ✅ logout.spec.ts
    ├── ✅ onboarding.spec.ts
    └── ✅ password-recovery.spec.ts

Tydzień 2: Plans Module
├── Dzień 6-7: Plans UI
│   ├── ✅ PlansDashboard
│   ├── ✅ PlanCard
│   ├── ✅ NewPlanModal
│   └── ✅ PlanDetailsView
│
├── Dzień 8: Plans Page Objects
│   ├── ✅ PlansListPage
│   ├── ✅ PlanDetailsPage
│   └── ✅ NewPlanPage
│
└── Dzień 9-10: Plans Tests
    ├── ✅ 6 plików testowych
    └── ✅ Wszystkie przechodzą

Tydzień 3: Activities & Generation
├── Dzień 11-12: Activities UI
│   ├── ✅ ActivityFormModal
│   ├── ✅ ActivityItem
│   └── ✅ PlanTimeline
│
├── Dzień 13: Activities Tests
│   └── ✅ 4 pliki testowe
│
└── Dzień 14-15: Generation Tests
    └── ✅ 4 pliki testowe

Tydzień 4: Finalizacja
├── Dzień 16: History & Feedback
│   ├── ✅ History UI + Tests (4)
│   └── ✅ Feedback UI + Tests (2)
│
├── Dzień 17: Cleanup
│   ├── ✅ Usunięcie duplikatów
│   └── ✅ Linting
│
└── Dzień 18: Dokumentacja
    ├── ✅ README update
    ├── ✅ Code review
    └── ✅ Merge
```

---

## 🎯 Mapa Zależności

```
┌─────────────────────────────────────────────────────────┐
│                    FIXTURES (Core)                      │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐ │
│  │  authTest    │  │  cleanTest   │  │ test-utils   │ │
│  └──────────────┘  └──────────────┘  └──────────────┘ │
└─────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────┐
│                   PAGE OBJECTS                          │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐ │
│  │  LoginPage   │  │ PlansListPage│  │ ActivityForm │ │
│  └──────────────┘  └──────────────┘  └──────────────┘ │
│           ↑                ↑                ↑           │
│           │                │                │           │
│           └────────────────┴────────────────┘           │
│                  Wymagają data-testid                   │
└─────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────┐
│                   UI COMPONENTS                         │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐ │
│  │  LoginForm   │  │  PlanCard    │  │ActivityModal │ │
│  │ + data-testid│  │ + data-testid│  │ + data-testid│ │
│  └──────────────┘  └──────────────┘  └──────────────┘ │
└─────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────┐
│                      TESTS                              │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐ │
│  │ login.spec   │  │ plans.spec   │  │activity.spec │ │
│  │ (cleanTest)  │  │ (authTest)   │  │ (authTest)   │ │
│  └──────────────┘  └──────────────┘  └──────────────┘ │
└─────────────────────────────────────────────────────────┘
```

**Kolejność implementacji**: Od dołu do góry! ⬆️

1. Najpierw: Fixtures (fundament)
2. Potem: UI Components (data-testid)
3. Następnie: Page Objects (używają data-testid)
4. Na końcu: Tests (używają Page Objects i fixtures)

---

## 📊 Statystyki Wizualne

### Duplikacja Kodu

```
PRZED:
████████████████████████████████████████ 40% duplikacji
████████████████████████████████████████
████████████████████████████████████████
████████████████████████████████████████

PO:
████ 10% duplikacji
```

### Selektory Tekstowe

```
PRZED:
getByText:  ████████████████ 16 wystąpień
getByRole:  █████████ 9 wystąpień
getByLabel: ████ 8 wystąpień
Total:      ████████████████████████████ 33 wystąpienia

PO:
getByTestId: ████████████████████████████████████████ 100%
Total:       0 kruchych selektorów ✅
```

### Linie Kodu

```
fixtures.ts
PRZED: ████████████████████ 897 linii
PO:    ████████████████████████ 1100 linii (+200 utilities)

test-utils.ts (NOWY)
PO:    ████████ 200 linii

test-setup.ts
PRZED: ██████████ 286 linii
PO:    ████████████ 350 linii (+utilities)
```

---

## 🎨 Przykład Transformacji

### PRZED: Typowy Test

```typescript
// ❌ 50 linii kodu, dużo duplikacji
import { test, expect, cleanDatabase } from '../fixtures';
import { setupCommonMocks } from '../test-setup';

const TEST_USER_EMAIL = process.env.E2E_USERNAME || 'test@example.com';
const TEST_USER_PASSWORD = process.env.E2E_PASSWORD || 'testpassword123';

test.describe('Plans List', () => {
  let loginPage: LoginPage;
  let plansListPage: PlansListPage;

  test.beforeEach(async ({ page, supabase, testUser }) => {
    // Cleanup
    await cleanDatabase(supabase, testUser.id);

    // Setup mocks
    await setupCommonMocks(page);

    // Initialize page objects
    loginPage = new LoginPage(page);
    plansListPage = new PlansListPage(page);

    // Login
    await loginPage.goto();
    await loginPage.login(TEST_USER_EMAIL, TEST_USER_PASSWORD);
  });

  test.afterEach(async ({ supabase, testUser }) => {
    await cleanDatabase(supabase, testUser.id);
  });

  test('should display empty state', async ({ page }) => {
    await plansListPage.goto();

    // ❌ Kruchy selektor
    const emptyMessage = await page.getByText(/nie masz|no plans/i);
    await expect(emptyMessage).toBeVisible();
  });
});
```

### PO: Czysty Test

```typescript
// ✅ 15 linii kodu, zero duplikacji
import { authTest as test, expect } from '../fixtures';

test.describe('Plans List', () => {
  // ✅ Brak beforeEach/afterEach - fixture to obsługuje

  test('should display empty state', async ({ page }) => {
    // ✅ User już zalogowany
    await page.goto('/plans');

    const plansListPage = new PlansListPage(page);

    // ✅ Stabilny selektor
    const emptyState = page.getByTestId('empty-state');
    await expect(emptyState).toBeVisible();
  });
});
```

**Redukcja**: 50 linii → 15 linii = **70% mniej kodu!** 🎉

---

## 🚀 Korzyści Wizualizacja

```
┌─────────────────────────────────────────────────────────┐
│                    PRZED                                │
├─────────────────────────────────────────────────────────┤
│ ❌ Duplikacja kodu: 40%                                 │
│ ❌ Kruche selektory: 33                                 │
│ ❌ Błędy lintingu: ?                                    │
│ ❌ Czas pisania testu: 15 min                           │
│ ❌ Czas onboardingu: 2 dni                              │
│ ❌ False positives: Często                              │
└─────────────────────────────────────────────────────────┘
                          ↓
                  REFAKTORYZACJA
                  (15-18 dni)
                          ↓
┌─────────────────────────────────────────────────────────┐
│                     PO                                  │
├─────────────────────────────────────────────────────────┤
│ ✅ Duplikacja kodu: <10%                                │
│ ✅ Kruche selektory: 0                                  │
│ ✅ Błędy lintingu: 0                                    │
│ ✅ Czas pisania testu: 5 min                            │
│ ✅ Czas onboardingu: 0.5 dnia                           │
│ ✅ False positives: Rzadko                              │
└─────────────────────────────────────────────────────────┘
```

---

## 📚 Nawigacja

- **[← Wróć do README](./README.md)**
- **[→ Quick Start Guide](./e2e-refactoring-quickstart.md)**
- **[→ Plan Implementacji](./e2e-refactoring-implementation-plan.md)**
- **[→ Przykłady Kodu](./e2e-refactoring-examples.md)**
- **[→ Checklist](./e2e-refactoring-checklist.md)**
- **[→ Podsumowanie](./e2e-refactoring-summary.md)**

---

**Dokument**: Visual Guide  
**Stworzony**: 3 stycznia 2026  
**Czas czytania**: 10 minut  
**Cel**: Wizualizacja zmian i korzyści
