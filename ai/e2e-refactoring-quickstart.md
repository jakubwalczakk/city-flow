# Quick Start Guide - Refaktoryzacja E2E

## 🚀 Szybki Start (15 minut)

### Krok 1: Przygotowanie (5 min)

```bash
# 1. Stwórz branch
cd /Users/jakubwalczak/Projects/city-flow
git checkout -b refactor/e2e-centralization

# 2. Stwórz backup tag
git tag backup-before-e2e-refactor

# 3. Upewnij się że testy działają
npm run test:e2e

# 4. Sprawdź linting (będzie błąd, to OK)
npm run lint 2>&1 | head -50
```

### Krok 2: Stwórz Nowe Pliki (5 min)

```bash
# Stwórz test-utils.ts
touch e2e/test-utils.ts
```

Skopiuj zawartość z `ai/e2e-refactoring-examples.md` sekcja "test-utils.ts"

### Krok 3: Zaktualizuj fixtures.ts (5 min)

Dodaj na końcu pliku `e2e/fixtures.ts`:

```typescript
// ============================================================================
// AUTHENTICATED TEST FIXTURES
// ============================================================================

export const TEST_CONFIG = {
  USER_EMAIL: process.env.E2E_USERNAME || 'test@example.com',
  USER_PASSWORD: process.env.E2E_PASSWORD || 'testpassword123',
} as const;

export const authTest = test.extend<{
  authenticatedPage: Page;
}>({
  page: async ({ page, supabase, testUser }, use) => {
    await cleanDatabase(supabase, testUser.id);
    await setupCommonMocks(page);
    await use(page);
    await cleanDatabase(supabase, testUser.id);
  },

  authenticatedPage: async ({ page }, use) => {
    const loginPage = new LoginPage(page);
    await loginPage.goto();
    await loginPage.login(TEST_CONFIG.USER_EMAIL, TEST_CONFIG.USER_PASSWORD);

    const onboardingModal = new OnboardingModal(page);
    const isVisible = await onboardingModal.isVisible();
    if (isVisible) {
      await onboardingModal.skip();
    }

    await use(page);
  },
});

export const cleanTest = test.extend({
  page: async ({ page, supabase, testUser }, use) => {
    await cleanDatabase(supabase, testUser.id);
    await setupCommonMocks(page);
    await use(page);
    await cleanDatabase(supabase, testUser.id);
  },
});
```

Dodaj importy na górze pliku:

```typescript
import { LoginPage } from './page-objects/LoginPage';
import { OnboardingModal } from './page-objects/OnboardingModal';
```

---

## 📋 Kolejność Implementacji

### Dzień 1: Test Fixtures ✅

**Cel**: Działające fixtures authTest i cleanTest

1. ✅ Stwórz test-utils.ts
2. ✅ Zaktualizuj fixtures.ts
3. 🔄 Przetestuj na jednym pliku testowym

**Test migracji**:

```bash
# Skopiuj jeden test jako backup
cp e2e/auth/login.spec.ts e2e/auth/login.spec.ts.backup

# Edytuj login.spec.ts
# Zmień pierwszą linię z:
import { test, expect } from '../fixtures';
# Na:
import { cleanTest as test, expect } from '../fixtures';

# Usuń beforeEach i afterEach (fixture to obsługuje)

# Uruchom test
npm run test:e2e -- e2e/auth/login.spec.ts

# Jeśli działa, commituj
git add e2e/fixtures.ts e2e/test-utils.ts e2e/auth/login.spec.ts
git commit -m "feat(e2e): add authTest and cleanTest fixtures"
```

### Dzień 2-3: Pierwsze data-testid w UI 🎯

**Cel**: Dodać data-testid do komponentów auth

**Priorytet 1: LoginForm**

```tsx
// src/components/auth/LoginForm.tsx

// Znajdź nagłówek i dodaj:
<h1 data-testid="auth-heading">Witaj ponownie</h1>

// Znajdź linki i dodaj:
<a href="/forgot-password" data-testid="forgot-password-link">
  Zapomniałeś hasła?
</a>

<a href="/register" data-testid="register-link">
  Zarejestruj się
</a>
```

**Priorytet 2: RegisterForm**

```tsx
// src/components/auth/RegisterForm.tsx

<h1 data-testid="auth-heading">Stwórz konto</h1>
<a href="/login" data-testid="login-link">Masz już konto?</a>
```

**Priorytet 3: Toast i Alert**

```tsx
// src/components/ui/Toast.tsx
<div data-testid="toast-notification" role="alert">
  {message}
</div>

// src/components/ui/ErrorAlert.tsx
<div data-testid="error-alert" role="alert">
  {message}
</div>

// src/components/ui/SuccessAlert.tsx
<div data-testid="success-alert" role="alert">
  {message}
</div>
```

**Test po zmianach**:

```bash
# Uruchom testy auth
npm run test:e2e -- e2e/auth/

# Commituj
git add src/components/auth/ src/components/ui/
git commit -m "feat(ui): add data-testid to auth components"
```

### Dzień 4: Migracja LoginPage 🔄

**Cel**: Zmigrować LoginPage.ts na data-testid

```typescript
// e2e/page-objects/LoginPage.ts

// PRZED:
await expect(this.page.getByRole('heading', { name: 'Witaj ponownie' })).toBeVisible();

// PO:
const heading = this.page.getByTestId('auth-heading');
await expect(heading).toBeVisible();
await expect(heading).toHaveText('Witaj ponownie');
```

**Test**:

```bash
npm run test:e2e -- e2e/auth/login.spec.ts

git add e2e/page-objects/LoginPage.ts
git commit -m "refactor(e2e): migrate LoginPage to data-testid"
```

### Dzień 5: Migracja Testów Auth 🎯

**Cel**: Zmigrować wszystkie testy auth na nowe fixtures

**Dla każdego pliku w e2e/auth/**:

1. Zmień import:

```typescript
// PRZED:
import { test, expect } from '../fixtures';

// PO:
import { cleanTest as test, expect } from '../fixtures';
```

2. Usuń beforeEach/afterEach:

```typescript
// USUŃ:
test.beforeEach(async ({ page, supabase, testUser }) => {
  await cleanDatabase(supabase, testUser.id);
  await setupCommonMocks(page);
  loginPage = new LoginPage(page);
});

test.afterEach(async ({ supabase, testUser }) => {
  await cleanDatabase(supabase, testUser.id);
});
```

3. Przenieś inicjalizację Page Object do testów:

```typescript
// PRZED (w beforeEach):
loginPage = new LoginPage(page);

// PO (w każdym teście):
test('should login', async ({ page }) => {
  const loginPage = new LoginPage(page);
  // ...
});
```

**Test**:

```bash
npm run test:e2e -- e2e/auth/

git add e2e/auth/
git commit -m "refactor(e2e): migrate auth tests to cleanTest fixture"
```

---

## 🎯 Pierwsze 5 Dni - Szczegółowy Plan

### Dzień 1: Setup ✅

- [ ] Stwórz branch i backup
- [ ] Dodaj test-utils.ts
- [ ] Zaktualizuj fixtures.ts
- [ ] Przetestuj na login.spec.ts
- [ ] Commit

### Dzień 2: UI Auth 🎨

- [ ] LoginForm - dodaj data-testid
- [ ] RegisterForm - dodaj data-testid
- [ ] ForgotPasswordForm - dodaj data-testid
- [ ] Toast/Alert - dodaj data-testid
- [ ] Test auth tests
- [ ] Commit

### Dzień 3: UI Plans (część 1) 🎨

- [ ] PlansDashboard - dodaj data-testid
- [ ] PlanCard - dodaj data-testid
- [ ] EmptyState - dodaj data-testid
- [ ] Test plans tests
- [ ] Commit

### Dzień 4: Migracja Page Objects (Auth) 🔄

- [ ] LoginPage.ts
- [ ] RegisterPage.ts
- [ ] ForgotPasswordPage.ts
- [ ] Test
- [ ] Commit

### Dzień 5: Migracja Testów (Auth) 🔄

- [ ] login.spec.ts
- [ ] register.spec.ts
- [ ] logout.spec.ts
- [ ] onboarding.spec.ts
- [ ] password-recovery.spec.ts
- [ ] Test wszystkie
- [ ] Commit

---

## 🔍 Jak Znaleźć Co Zmienić?

### Znajdź komponenty wymagające data-testid:

```bash
# Znajdź wszystkie getByLabel w testach
grep -r "getByLabel" e2e/

# Znajdź wszystkie getByText w testach
grep -r "getByText" e2e/

# Znajdź wszystkie getByRole z name w testach
grep -r "getByRole.*name:" e2e/
```

### Znajdź komponenty UI:

```bash
# Znajdź wszystkie formularze
find src/components -name "*Form*.tsx"

# Znajdź wszystkie modale
find src/components -name "*Modal*.tsx"

# Znajdź wszystkie komponenty UI
ls src/components/ui/
```

---

## ✅ Checklist Pierwszego Tygodnia

### Setup (Dzień 1)

- [ ] Branch stworzony
- [ ] Backup tag stworzony
- [ ] test-utils.ts stworzony
- [ ] fixtures.ts zaktualizowany
- [ ] Pierwszy test zmigrowany
- [ ] Commit: "feat(e2e): add authTest and cleanTest fixtures"

### UI Components (Dzień 2-3)

- [ ] LoginForm ma data-testid
- [ ] RegisterForm ma data-testid
- [ ] ForgotPasswordForm ma data-testid
- [ ] Toast ma data-testid
- [ ] ErrorAlert ma data-testid
- [ ] SuccessAlert ma data-testid
- [ ] Commit: "feat(ui): add data-testid to auth and common components"

### Page Objects (Dzień 4)

- [ ] LoginPage zmigrowany
- [ ] RegisterPage zmigrowany
- [ ] ForgotPasswordPage zmigrowany
- [ ] Commit: "refactor(e2e): migrate auth page objects to data-testid"

### Tests (Dzień 5)

- [ ] login.spec.ts zmigrowany
- [ ] register.spec.ts zmigrowany
- [ ] logout.spec.ts zmigrowany
- [ ] onboarding.spec.ts zmigrowany
- [ ] password-recovery.spec.ts zmigrowany
- [ ] Wszystkie testy auth przechodzą
- [ ] Commit: "refactor(e2e): migrate auth tests to new fixtures"

---

## 🚨 Częste Problemy i Rozwiązania

### Problem 1: Test nie znajduje elementu po data-testid

**Objaw**:

```
Error: Locator.click: Timeout 30000ms exceeded.
=========================== logs ===========================
waiting for getByTestId('auth-heading')
```

**Rozwiązanie**:

1. Sprawdź czy data-testid został dodany do komponentu
2. Sprawdź czy nazwa jest poprawna (bez literówek)
3. Sprawdź czy komponent się renderuje (użyj `page.screenshot()`)

### Problem 2: Fixture nie działa

**Objaw**:

```
Error: cleanDatabase is not defined
```

**Rozwiązanie**:

1. Sprawdź import w fixtures.ts
2. Sprawdź czy funkcje są wyeksportowane
3. Sprawdź czy test importuje z '../fixtures'

### Problem 3: Testy są wolniejsze

**Objaw**: Testy trwają dłużej niż wcześniej

**Rozwiązanie**:

1. Usuń zbędne `page.waitForTimeout()`
2. Użyj `expect().toBeVisible()` zamiast timeout
3. Sprawdź czy cleanup nie jest wywoływany za często

---

## 📞 Pomoc

### Dokumentacja

- [Plan Implementacji](./e2e-refactoring-implementation-plan.md)
- [Przykłady](./e2e-refactoring-examples.md)
- [Checklist](./e2e-refactoring-checklist.md)

### Przydatne Komendy

```bash
# Uruchom jeden test
npm run test:e2e -- e2e/auth/login.spec.ts

# Uruchom testy w debug mode
npx playwright test --debug e2e/auth/login.spec.ts

# Uruchom testy z UI
npx playwright test --ui

# Zobacz trace
npx playwright show-trace trace.zip

# Sprawdź linting
npm run lint

# Napraw linting
npm run lint -- --fix
```

---

## 🎉 Po Pierwszym Tygodniu

Jeśli ukończyłeś pierwsze 5 dni:

1. ✅ Masz działające fixtures
2. ✅ Masz zmigrowane komponenty auth
3. ✅ Masz zmigrowane Page Objects auth
4. ✅ Masz zmigrowane testy auth
5. ✅ Wszystko działa i przechodzi

**Następny krok**: Kontynuuj z komponentami Plans (Dzień 6-10)

---

**Dokument**: Quick Start Guide
**Stworzony**: 3 stycznia 2026
**Czas pierwszego tygodnia**: 5 dni
**Cel**: Zmigrować moduł Auth jako proof of concept
