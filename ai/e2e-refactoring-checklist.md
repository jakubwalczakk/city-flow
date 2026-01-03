# Checklist Refaktoryzacji E2E - Szybki Tracking

## 🎯 Status Ogólny

- [ ] Faza 1: Przygotowanie (0/4)
- [ ] Faza 2: Centralizacja (0/4)
- [ ] Faza 3: data-testid w UI (0/35)
- [ ] Faza 4: Migracja Page Objects (0/14)
- [ ] Faza 5: Migracja Testów (0/28)
- [ ] Faza 6: Usunięcie Duplikatów (0/3)
- [ ] Faza 7: Linting (0/3)
- [ ] Faza 8: Dokumentacja (0/4)

---

## Faza 1: Przygotowanie ⏳

### Backup i Setup

- [ ] Stworzony branch: `refactor/e2e-centralization`
- [ ] Stworzony tag backup: `backup-before-e2e-refactor`
- [ ] Audyt testów zakończony
- [ ] Lista duplikatów stworzona

---

## Faza 2: Centralizacja Konfiguracji ⏳

### fixtures.ts

- [ ] Dodano `authTest` fixture
- [ ] Dodano `cleanTest` fixture
- [ ] Dodano `TEST_CONFIG` export
- [ ] Zweryfikowano działanie fixtures

### test-utils.ts (nowy plik)

- [ ] Stworzono plik
- [ ] Dodano `TIMEOUTS`
- [ ] Dodano `waitForToast()`
- [ ] Dodano `waitForLoading()`
- [ ] Dodano `expectErrorMessage()`
- [ ] Dodano `expectSuccessMessage()`
- [ ] Dodano `dismissModal()`
- [ ] Dodano `confirmAction()`
- [ ] Dodano `cancelAction()`
- [ ] Dodano `fillInput()`
- [ ] Dodano `selectOption()`
- [ ] Dodano `waitForNavigation()`

---

## Faza 3: Dodanie data-testid do Komponentów ⏳

### Auth Components (5 komponentów)

- [ ] `LoginForm.tsx` - auth-heading, register-link, forgot-password-link
- [ ] `RegisterForm.tsx` - wszystkie pola
- [ ] `ForgotPasswordForm.tsx` - wszystkie pola
- [ ] `UpdatePasswordForm.tsx` - wszystkie pola
- [ ] `OnboardingModal.tsx` - wszystkie elementy

### Plans Components (10 komponentów)

- [ ] `PlansDashboard.tsx` - przyciski, empty-state
- [ ] `PlanCard.tsx` - plan-name, plan-destination, plan-dates, plan-status-badge
- [ ] `NewPlanModal.tsx` - modal-close-btn (reszta już jest)
- [ ] `PlanDetailsView.tsx` - plan-title, edit-title-button, etc.
- [ ] `PlanHeader.tsx` - tytuł i akcje
- [ ] `PlanActions.tsx` - wszystkie przyciski
- [ ] `FixedPointsList.tsx` - lista i elementy
- [ ] `GenerationLoader.tsx` - loader i progress
- [ ] `EmptyState.tsx` - komunikaty
- [ ] `PlanMenu.tsx` - menu i akcje

### Timeline/Activities Components (5 komponentów)

- [ ] `PlanTimeline.tsx` - timeline struktura
- [ ] `TimelineDay.tsx` - day-title, day-date, add-activity-btn
- [ ] `ActivityItem.tsx` - wszystkie pola aktywności
- [ ] `ActivityFormModal.tsx` - wszystkie inputy (zamiast getByLabel)
- [ ] `ActivityActions.tsx` - edit-activity-btn, delete-activity-btn

### Feedback Components (2 komponenty)

- [ ] `FeedbackModule.tsx` - thumbs, comment, submit
- [ ] `FeedbackDisplay.tsx` - wyświetlanie oceny

### History Components (2 komponenty)

- [ ] `HistoryPage.tsx` - history-empty-state, history-plan-card
- [ ] `HistoryPlanCard.tsx` - wszystkie elementy karty

### Export Components (1 komponent)

- [ ] `ExportButton.tsx` - export-pdf-btn, loading, messages

### Common UI Components (10 komponentów)

- [ ] `Toast.tsx` - toast-notification
- [ ] `LoadingSpinner.tsx` - loading-spinner
- [ ] `ErrorAlert.tsx` - error-alert
- [ ] `SuccessAlert.tsx` - success-alert
- [ ] `ConfirmDialog.tsx` - wszystkie elementy dialogu
- [ ] `UserMenu.tsx` - user-menu-button, dropdown
- [ ] `Button.tsx` - data-testid jako prop
- [ ] `Input.tsx` - data-testid jako prop
- [ ] `Select.tsx` - data-testid jako prop
- [ ] `Textarea.tsx` - data-testid jako prop

---

## Faza 4: Migracja Page Objects ⏳

### Auth Page Objects (5 plików)

- [ ] `LoginPage.ts` - auth-heading zamiast getByRole
- [ ] `RegisterPage.ts` - wszystkie selektory
- [ ] `ForgotPasswordPage.ts` - wszystkie selektory
- [ ] `UpdatePasswordPage.ts` - wszystkie selektory
- [ ] `OnboardingModal.ts` - wszystkie selektory

### Plans Page Objects (4 pliki)

- [ ] `NewPlanPage.ts` - weryfikacja istniejących
- [ ] `PlansListPage.ts` - wszystkie selektory
- [ ] `PlanDetailsPage.ts` - error messages na data-testid
- [ ] `PlanTimelinePage.ts` - wszystkie selektory

### Activity Page Objects (1 plik)

- [ ] `ActivityFormModal.ts` - wszystkie getByLabel → getByTestId

### Other Page Objects (4 pliki)

- [ ] `HistoryPage.ts` - wszystkie selektory
- [ ] `FeedbackModule.ts` - wszystkie selektory
- [ ] `ProfilePage.ts` - wszystkie selektory
- [ ] `GenerationLoadingPage.ts` - wszystkie selektory

---

## Faza 5: Migracja Testów ⏳

### Auth Tests (5 plików)

- [ ] `auth/login.spec.ts` - cleanTest fixture
- [ ] `auth/logout.spec.ts` - authTest fixture
- [ ] `auth/register.spec.ts` - cleanTest fixture
- [ ] `auth/onboarding.spec.ts` - authTest fixture
- [ ] `auth/password-recovery.spec.ts` - cleanTest fixture

### Plans Tests (6 plików)

- [ ] `plans/create-plan-full.spec.ts` - authTest fixture
- [ ] `plans/plans-list.spec.ts` - authTest fixture
- [ ] `plans/plan-details.spec.ts` - authTest fixture
- [ ] `plans/edit-plan-name.spec.ts` - authTest fixture
- [ ] `plans/delete-plan.spec.ts` - authTest fixture + utilities
- [ ] `plans/plan-rls.spec.ts` - cleanTest fixture

### Plan Editing Tests (4 pliki)

- [ ] `plan-editing/add-activity.spec.ts` - authTest fixture
- [ ] `plan-editing/edit-activity.spec.ts` - authTest fixture
- [ ] `plan-editing/delete-activity.spec.ts` - authTest fixture + utilities
- [ ] `plan-editing/activity-validation.spec.ts` - authTest fixture

### Generation Tests (4 pliki)

- [ ] `generation/generate-plan.spec.ts` - authTest fixture
- [ ] `generation/generation-errors.spec.ts` - authTest fixture
- [ ] `generation/generation-limits.spec.ts` - authTest fixture
- [ ] `generation/generation-priorities.spec.ts` - authTest fixture

### History Tests (4 pliki)

- [ ] `history/view-history.spec.ts` - authTest fixture
- [ ] `history/move-to-history.spec.ts` - authTest fixture + utilities
- [ ] `history/auto-archive.spec.ts` - authTest fixture
- [ ] `history/history-readonly.spec.ts` - authTest fixture

### Feedback Tests (2 pliki)

- [ ] `feedback/rate-plan.spec.ts` - authTest fixture
- [ ] `feedback/submit-feedback.spec.ts` - authTest fixture

### Export Tests (1 plik)

- [ ] `export/export-pdf.spec.ts` - authTest fixture

### Stare Testy (2 pliki - do usunięcia)

- [ ] `create-plan.spec.ts` - USUNĄĆ (duplikat)
- [ ] `example.spec.ts` - USUNĄĆ (przykład)

---

## Faza 6: Usunięcie Duplikatów ⏳

### Pliki do Usunięcia

- [ ] Usunięto `e2e/create-plan.spec.ts`
- [ ] Usunięto `e2e/example.spec.ts`

### Analiza Duplikatów

- [ ] Przeanalizowano `feedback/submit-feedback.spec.ts` vs `feedback/rate-plan.spec.ts`
- [ ] Zmergowano jeśli potrzebne

### Weryfikacja Pokrycia

- [ ] Uruchomiono wszystkie testy
- [ ] Pokrycie nie spadło
- [ ] Wszystkie scenariusze zachowane

---

## Faza 7: Naprawa Lintingu ⏳

### ESLint Config

- [ ] Zaktualizowano `eslint.config.js` dla testów
- [ ] Dodano reguły dla e2e/\*_/_.ts

### Naprawa Błędów

- [ ] Naprawiono wszystkie błędy ESLint
- [ ] Usunięto nieużywane importy
- [ ] Naprawiono @typescript-eslint/no-unused-vars
- [ ] Naprawiono @typescript-eslint/no-non-null-assertion

### Weryfikacja

- [ ] `npm run lint` przechodzi bez błędów
- [ ] CI/CD linting przechodzi

---

## Faza 8: Dokumentacja i Weryfikacja ⏳

### Testy

- [ ] Wszystkie testy przechodzą lokalnie
- [ ] Wszystkie testy przechodzą w CI/CD
- [ ] Performance testów OK (nie wolniejsze)

### Dokumentacja

- [ ] Zaktualizowano `e2e/README.md`
- [ ] Zaktualizowano dokumentację Page Objects
- [ ] Dodano przykłady użycia nowych fixtures
- [ ] Dodano dokumentację test-utils.ts

### Code Review

- [ ] Self-review zakończony
- [ ] PR stworzony
- [ ] Review team zakończony
- [ ] Merge do main

---

## 📊 Metryki Postępu

### Komponenty z data-testid

- Gotowe: 0/35
- Procent: 0%

### Page Objects Zmigrowane

- Gotowe: 0/14
- Procent: 0%

### Testy Zmigrowane

- Gotowe: 0/28
- Procent: 0%

### Linting

- Błędy: ? → 0
- Warnings: ? → 0

---

## 🚨 Blokery i Problemy

### Znane Problemy

_Dodaj tutaj napotkane problemy podczas implementacji_

### Decyzje do Podjęcia

_Dodaj tutaj decyzje wymagające dyskusji_

---

## 📝 Notatki

### Dzień 1

_Dodaj notatki z pierwszego dnia implementacji_

### Dzień 2

_Dodaj notatki z drugiego dnia implementacji_

### Dzień 3

_Dodaj notatki z trzeciego dnia implementacji_

---

**Ostatnia aktualizacja**: 3 stycznia 2026
**Status**: Gotowy do rozpoczęcia
**Szacowany czas**: 15-18 dni
