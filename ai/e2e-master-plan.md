# Master Plan - Implementacja Testów E2E dla CityFlow

## 📋 Przegląd

Ten dokument stanowi centralny punkt odniesienia dla całego projektu implementacji testów E2E aplikacji CityFlow. Zawiera podsumowanie wszystkich szczegółowych planów, priorytety, harmonogram i checklisty.

## 📚 Dokumenty szczegółowe

1. **[e2e-auth-implementation-plan.md](./e2e-auth-implementation-plan.md)** - Autentykacja i Onboarding
2. **[e2e-plan-management-implementation-plan.md](./e2e-plan-management-implementation-plan.md)** - Zarządzanie planami (CRUD)
3. **[e2e-plan-editing-implementation-plan.md](./e2e-plan-editing-implementation-plan.md)** - Edycja planu
4. **[e2e-generation-export-implementation-plan.md](./e2e-generation-export-implementation-plan.md)** - Generowanie i Eksport
5. **[e2e-history-implementation-plan.md](./e2e-history-implementation-plan.md)** - Historia planów
6. **[e2e-feedback-implementation-plan.md](./e2e-feedback-implementation-plan.md)** - Feedback i oceny

## 🎯 Cele projektu

### Cele biznesowe

- Zwiększenie pewności jakości kodu przed wdrożeniem na produkcję
- Automatyzacja testowania krytycznych ścieżek użytkownika
- Zmniejszenie liczby bugów w produkcji o min. 70%
- Umożliwienie szybszego developmentu dzięki szybkiemu feedbackowi

### Cele techniczne

- Code coverage > 80% dla krytycznej logiki biznesowej
- Wszystkie kluczowe user stories pokryte testami E2E
- Pipeline CI/CD z automatycznymi testami
- Czas wykonania testów < 10 minut
- Stabilność testów (flakiness < 1%)

## 📊 Podsumowanie zakresów

| Zakres                | Plików testowych | Page Objects | Szacowany czas | Priorytet    |
| --------------------- | ---------------- | ------------ | -------------- | ------------ |
| Autentykacja          | 6                | 5            | 5-6 dni        | 🔴 Krytyczny |
| Zarządzanie planami   | 6                | 3            | 4-5 dni        | 🔴 Krytyczny |
| Edycja planu          | 4                | 2            | 3-4 dni        | 🟡 Wysoki    |
| Generowanie & Eksport | 5                | 2            | 5-6 dni        | 🔴 Krytyczny |
| Historia              | 4                | 1            | 3 dni          | 🟢 Średni    |
| Feedback              | 3                | 1            | 2-3 dni        | 🟢 Średni    |
| **SUMA**              | **28**           | **14**       | **22-28 dni**  |              |

## 🗓️ Harmonogram implementacji

### Faza 1: Fundament (Tydzień 1-2) - Priorytet: KRYTYCZNY

**Cel:** Podstawowa infrastruktura testów i krytyczne ścieżki

#### Tydzień 1

- [ ] **Setup i konfiguracja** (1 dzień)
  - Konfiguracja Playwright z Supabase
  - Fixtures i helpery bazowe
  - CI/CD pipeline setup
  - Testowa baza danych Supabase

- [ ] **Autentykacja - Podstawy** (2 dni)
  - `register.spec.ts` - Rejestracja (US-001)
  - `login.spec.ts` - Logowanie (US-002)
  - `logout.spec.ts` - Wylogowanie (US-004)
  - Page Objects: RegisterPage, LoginPage (rozszerzenie)

- [ ] **Zarządzanie planami - Podstawy** (2 dni)
  - `create-plan-full.spec.ts` - Tworzenie bez mocków (US-020, US-021)
  - `plans-list.spec.ts` - Lista planów (US-022)
  - Page Objects: PlansListPage, NewPlanPage (refactor)

#### Tydzień 2

- [ ] **Autentykacja - Rozszerzenie** (2 dni)
  - `onboarding.spec.ts` - Onboarding (US-005)
  - `password-recovery.spec.ts` - Reset hasła
  - Page Objects: OnboardingModal, ForgotPasswordPage

- [ ] **Zarządzanie planami - CRUD** (2 dni)
  - `plan-details.spec.ts` - Szczegóły planu
  - `edit-plan-name.spec.ts` - Edycja nazwy (US-023)
  - `delete-plan.spec.ts` - Usuwanie (US-024)
  - Page Objects: PlanDetailsPage

- [ ] **RLS Testing** (1 dzień)
  - `plan-rls.spec.ts` - Row Level Security
  - Testy bezpieczeństwa dostępu do planów

### Faza 2: Funkcje kluczowe (Tydzień 3-4) - Priorytet: KRYTYCZNY

#### Tydzień 3

- [ ] **Generowanie planów** (3 dni)
  - `generate-plan.spec.ts` - Podstawowe generowanie (US-030)
  - `generation-priorities.spec.ts` - Hierarchia priorytetów (US-033, US-034)
  - `generation-errors.spec.ts` - Obsługa błędów (US-036)
  - Page Objects: GenerationLoadingPage

- [ ] **Limity generacji** (1 dzień)
  - `generation-limits.spec.ts` - Limitowanie (US-060)
  - Integracja z licznikiem

- [ ] **Code review i refactoring** (1 dzień)
  - Przegląd kodu testów z Fazy 1
  - Optymalizacja fixtures i helpers
  - Eliminacja duplikacji

#### Tydzień 4

- [ ] **Eksport PDF** (2 dni)
  - `export-pdf.spec.ts` - Eksport do PDF (US-050)
  - Instalacja pdf-parse
  - Helpers do weryfikacji PDF

- [ ] **Edycja planu - Podstawy** (2 dni)
  - `add-activity.spec.ts` - Dodawanie aktywności (US-041)
  - `edit-activity.spec.ts` - Edycja (US-042)
  - Page Objects: ActivityFormModal, PlanTimelinePage

- [ ] **Stabilizacja Fazy 2** (1 dzień)
  - Fixing flaky tests
  - Dokumentacja
  - Pierwsze testy w CI/CD

### Faza 3: Funkcje dodatkowe (Tydzień 5-6) - Priorytet: WYSOKI/ŚREDNI

#### Tydzień 5

- [ ] **Edycja planu - Rozszerzenie** (2 dni)
  - `delete-activity.spec.ts` - Usuwanie aktywności (US-040)
  - `activity-validation.spec.ts` - Walidacja i konflikty

- [ ] **Historia planów** (2 dni)
  - `move-to-history.spec.ts` - Ręczne archiwizowanie (US-051)
  - `view-history.spec.ts` - Przeglądanie historii (US-053)
  - Page Objects: HistoryPage

- [ ] **Auto-archiving** (1 dzień)
  - `auto-archive.spec.ts` - Automatyczne archiwizowanie (US-052)
  - Implementacja cron job
  - Helpery do testowania cron

#### Tydzień 6

- [ ] **Historia - Read-only** (1 dzień)
  - `history-readonly.spec.ts` - Tryb tylko do odczytu

- [ ] **Feedback** (2 dni)
  - `rate-plan.spec.ts` - Oceny (US-061)
  - `submit-feedback.spec.ts` - Komentarze (US-062)
  - `feedback-persistence.spec.ts` - Persystencja
  - Page Objects: FeedbackModule

- [ ] **OAuth (opcjonalnie)** (1 dzień)
  - `google-oauth.spec.ts` - Logowanie Google (US-003)
  - Mockowanie OAuth lub pomijamy

- [ ] **Finalizacja** (1 dzień)
  - Code review całości
  - Dokumentacja końcowa
  - Metryki i raporty

## ✅ Globalna Checklist - Przed rozpoczęciem

### Infrastruktura

- [ ] Playwright zainstalowany i skonfigurowany
- [ ] Projekt Supabase testowy utworzony
- [ ] `.env.test` z credentials testowymi
- [ ] CI/CD pipeline (GitHub Actions / Vercel)
- [ ] Secrets w CI/CD skonfigurowane

### Baza danych

- [ ] Schema bazy danych przejrzany
- [ ] RLS policies zweryfikowane
- [ ] Testowe seedy przygotowane
- [ ] Cleanup scripts gotowe

### Aplikacja

- [ ] Przegląd wszystkich komponentów do testowania
- [ ] Lista data-testid do dodania
- [ ] API endpoints zidentyfikowane
- [ ] Decyzja: mockować AI API czy używać prawdziwego?

### Zespół

- [ ] Przydział zadań do deweloperów
- [ ] Kod review process ustalony
- [ ] Daily standupy / weekly sync
- [ ] Kanban board (Jira, Trello, GitHub Projects)

## 🏗️ Struktura katalogów (docelowa)

```
e2e/
├── auth/                      # Autentykacja
│   ├── register.spec.ts
│   ├── login.spec.ts
│   ├── logout.spec.ts
│   ├── onboarding.spec.ts
│   ├── password-recovery.spec.ts
│   └── google-oauth.spec.ts
├── plans/                     # Zarządzanie planami
│   ├── create-plan-full.spec.ts
│   ├── plans-list.spec.ts
│   ├── plan-details.spec.ts
│   ├── edit-plan-name.spec.ts
│   ├── delete-plan.spec.ts
│   └── plan-rls.spec.ts
├── plan-editing/              # Edycja aktywności
│   ├── add-activity.spec.ts
│   ├── edit-activity.spec.ts
│   ├── delete-activity.spec.ts
│   └── activity-validation.spec.ts
├── generation/                # Generowanie planów
│   ├── generate-plan.spec.ts
│   ├── generation-priorities.spec.ts
│   ├── generation-errors.spec.ts
│   └── generation-limits.spec.ts
├── export/                    # Eksport
│   └── export-pdf.spec.ts
├── history/                   # Historia
│   ├── move-to-history.spec.ts
│   ├── auto-archive.spec.ts
│   ├── view-history.spec.ts
│   └── history-readonly.spec.ts
├── feedback/                  # Feedback
│   ├── rate-plan.spec.ts
│   ├── submit-feedback.spec.ts
│   └── feedback-persistence.spec.ts
├── page-objects/              # Page Objects
│   ├── RegisterPage.ts
│   ├── LoginPage.ts
│   ├── OnboardingModal.ts
│   ├── ForgotPasswordPage.ts
│   ├── ProfilePage.ts
│   ├── PlansListPage.ts
│   ├── PlanDetailsPage.ts
│   ├── NewPlanPage.ts
│   ├── PlanTimelinePage.ts
│   ├── ActivityFormModal.ts
│   ├── GenerationLoadingPage.ts
│   ├── HistoryPage.ts
│   └── FeedbackModule.ts
├── fixtures.ts                # Fixtures i helpery
└── playwright.config.ts       # Konfiguracja
```

## 📈 Metryki i KPI

### Code Coverage

- [ ] Auth flow: > 80%
- [ ] Plan management: > 80%
- [ ] Generation: > 70% (bez external API)
- [ ] Overall: > 75%

### Test Execution

- [ ] Czas wykonania wszystkich testów: < 10 min
- [ ] Pass rate: > 95%
- [ ] Flakiness: < 1%

### User Stories Coverage

- [ ] Krytyczne (Priority 1): 100%
- [ ] Wysokie (Priority 2): > 90%
- [ ] Średnie (Priority 3): > 70%

## 🚨 Ryzyka i mitigacja

| Ryzyko                      | Prawdopodobieństwo | Impact | Mitigacja                        |
| --------------------------- | ------------------ | ------ | -------------------------------- |
| API OpenRouter wolne/drogie | Wysokie            | Wysoki | Mockowanie dla większości testów |
| OAuth trudny do testowania  | Średnie            | Średni | Mockowanie lub pominięcie        |
| Flaky tests (timing issues) | Wysokie            | Średni | Proper waitFor, nie sleep()      |
| Cleanup bazy między testami | Średnie            | Wysoki | Transakcje lub dedykowana baza   |
| CI/CD timeouty              | Średnie            | Wysoki | Parallel execution, sharding     |
| Koszt Supabase test DB      | Niskie             | Niski  | Free tier wystarczy              |

## 🔧 Narzędzia i technologie

### Core

- **Test Runner:** Playwright
- **Assertions:** Playwright Test
- **Browser:** Chromium (+ Firefox, WebKit opcjonalnie)

### Utilities

- **PDF parsing:** pdf-parse lub pdfjs-dist
- **Mocking:** Playwright route mocking
- **Fixtures:** Custom fixtures w Playwright
- **Database:** Supabase Client

### CI/CD

- **Platform:** GitHub Actions
- **Environments:** Development, Staging
- **Secrets:** GitHub Secrets
- **Caching:** npm cache, Playwright browsers cache

### Reporting

- **HTML Report:** Playwright HTML Reporter
- **Allure:** (opcjonalnie)
- **Coverage:** Istanbul/nyc (integracja z Vitest)

## 📝 Konwencje kodowania

### Nazewnictwo testów

```typescript
test('should successfully register with valid email and password', async ({ page }) => {
  // Test implementation
});
```

### Struktura testu (AAA)

```typescript
test('test description', async ({ page }) => {
  // 1. ARRANGE - Setup
  await loginPage.goto();

  // 2. ACT - Execute action
  await loginPage.login(email, password);

  // 3. ASSERT - Verify
  await expect(page).toHaveURL('/plans');
});
```

### Page Objects

```typescript
export class PageName {
  readonly page: Page;
  readonly element: Locator;

  constructor(page: Page) {
    this.page = page;
    this.element = page.locator('[data-testid="element"]');
  }

  async action() {
    // Implementation
  }
}
```

## 🎓 Best Practices

### 1. Selektory

- ✅ Używaj `data-testid` jako primary selector
- ✅ Backup: role-based selectors (`page.getByRole('button')`)
- ❌ Unikaj: CSS classes, XPath

### 2. Waiting

- ✅ `await page.waitForSelector()`
- ✅ `await element.waitFor({ state: 'visible' })`
- ❌ `await page.waitForTimeout()` - tylko w ostateczności

### 3. Assertions

- ✅ Playwright assertions (auto-retry)
- ✅ `await expect(element).toBeVisible()`
- ❌ `expect(await element.isVisible()).toBe(true)` - nie retry

### 4. Fixtures

- ✅ Używaj fixtures do setup/cleanup
- ✅ Izolacja testów (jeden test = jeden user)
- ❌ Shared state między testami

### 5. Flakiness

- ✅ Czekaj na konkretne elementy/stany
- ✅ Używaj `waitForLoadState('networkidle')`
- ❌ Fixed timeouts, race conditions

## 🐛 Debugging

### Lokalne debugowanie

```bash
# Run with headed mode
npx playwright test --headed

# Run with debug mode (step-by-step)
npx playwright test --debug

# Run specific test
npx playwright test auth/login.spec.ts

# Run with trace
npx playwright test --trace on
```

### CI/CD debugowanie

- Screenshots automatyczne dla failed tests
- Videos (retain-on-failure)
- Playwright trace viewer
- Artifacts w GitHub Actions

## 📞 Kontakt i wsparcie

### Odpowiedzialni

- **Tech Lead:** [Nazwa]
- **QA Lead:** [Nazwa]
- **DevOps:** [Nazwa]

### Kanały komunikacji

- **Daily standups:** Zoom / Google Meet
- **Code reviews:** GitHub Pull Requests
- **Issues/Bugs:** GitHub Issues
- **Chat:** Slack #e2e-tests channel

## 🔄 Proces aktualizacji planów

Plany są żywymi dokumentami i powinny być aktualizowane:

- Po code review
- Po odkryciu nowych edge cases
- Po zmianach w aplikacji
- Co tydzień - retrospektywa

### Version control

Wszystkie plany w Git. Każda zmiana przez Pull Request.

---

## 📊 Status Dashboard (do aktualizacji)

### Faza 1: Fundament

- [ ] Setup (0/1)
- [ ] Auth Podstawy (0/3)
- [ ] Plans Podstawy (0/2)
- [ ] Auth Rozszerzenie (0/2)
- [ ] Plans CRUD (0/3)
- [ ] RLS (0/1)

**Progress: 0/12 (0%)**

### Faza 2: Funkcje kluczowe

- [ ] Generowanie (0/3)
- [ ] Limity (0/1)
- [ ] Eksport (0/1)
- [ ] Edycja podstawy (0/2)

**Progress: 0/7 (0%)**

### Faza 3: Funkcje dodatkowe

- [ ] Edycja rozszerzenie (0/2)
- [ ] Historia (0/3)
- [ ] Feedback (0/3)
- [ ] OAuth (0/1)

**Progress: 0/9 (0%)**

---

**Ogólny progress: 0/28 (0%)**

**Ostatnia aktualizacja:** 2026-01-03
**Next review:** Po zakończeniu Fazy 1
