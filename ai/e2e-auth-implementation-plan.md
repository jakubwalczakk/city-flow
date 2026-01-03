# Plan Implementacji Testów E2E - Autentykacja i Onboarding

## 1. Zakres testów

Testy E2E pokrywające pełny cykl życia autentykacji użytkownika:

- Rejestracja (email/hasło)
- Logowanie (przypadki pozytywne i negatywne)
- OAuth Google
- Wylogowanie
- Resetowanie hasła
- Onboarding (ustawienie preferencji po rejestracji)

## 2. Struktura plików

```
e2e/
├── auth/
│   ├── register.spec.ts           # US-001
│   ├── login.spec.ts               # US-002
│   ├── google-oauth.spec.ts        # US-003
│   ├── logout.spec.ts              # US-004
│   ├── password-recovery.spec.ts   # Resetowanie hasła
│   └── onboarding.spec.ts          # US-005
├── page-objects/
│   ├── RegisterPage.ts             # Nowy
│   ├── LoginPage.ts                # Istniejący - do rozszerzenia
│   ├── OnboardingModal.ts          # Nowy
│   ├── ProfilePage.ts              # Nowy
│   └── ForgotPasswordPage.ts       # Nowy
└── fixtures.ts                     # Rozszerzenie o nowe helpery
```

## 3. Przypadki testowe

### 3.1. Rejestracja (register.spec.ts)

#### Test 1: Pomyślna rejestracja z poprawnym email i hasłem

**Kroki:**

1. Przejdź do `/register`
2. Wypełnij email (unikalny, np. `test-${timestamp}@example.com`)
3. Wypełnij hasło (min. 8 znaków)
4. Potwierdź hasło
5. Kliknij "Zarejestruj się"

**Oczekiwany rezultat:**

- Użytkownik zostaje automatycznie zalogowany
- Przekierowanie do onboardingu lub `/plans`
- W Supabase utworzony nowy użytkownik
- W tabeli `profiles` utworzony nowy profil

#### Test 2: Błąd - niepoprawny format email

**Kroki:**

1. Przejdź do `/register`
2. Wypełnij email: `invalid-email`
3. Wypełnij hasło: `ValidPass123`
4. Potwierdź hasło

**Oczekiwany rezultat:**

- Wyświetlenie błędu walidacji: "Nieprawidłowy adres email"
- Przycisk "Zarejestruj się" nieaktywny lub blokuje submit

#### Test 3: Błąd - hasło zbyt krótkie

**Kroki:**

1. Przejdź do `/register`
2. Wypełnij email: `valid@example.com`
3. Wypełnij hasło: `short`
4. Potwierdź hasło

**Oczekiwany rezultat:**

- Wyświetlenie błędu: "Hasło musi mieć minimum 8 znaków"

#### Test 4: Błąd - hasła nie pasują

**Kroki:**

1. Przejdź do `/register`
2. Wypełnij email: `valid@example.com`
3. Wypełnij hasło: `ValidPass123`
4. Potwierdź hasło: `DifferentPass123`

**Oczekiwany rezultat:**

- Wyświetlenie błędu: "Hasła nie są identyczne"

#### Test 5: Błąd - email już istnieje

**Kroki:**

1. Utwórz użytkownika testowego (w beforeEach)
2. Przejdź do `/register`
3. Wypełnij ten sam email
4. Wypełnij hasło
5. Kliknij "Zarejestruj się"

**Oczekiwany rezultat:**

- Wyświetlenie błędu: "Użytkownik z tym adresem email już istnieje"

---

### 3.2. Logowanie (login.spec.ts)

#### Test 1: Pomyślne logowanie z poprawnymi danymi

**Kroki:**

1. Utwórz użytkownika testowego (fixture)
2. Przejdź do `/login`
3. Wypełnij email i hasło
4. Kliknij "Zaloguj się"

**Oczekiwany rezultat:**

- Przekierowanie do `/plans`
- W nagłówku widoczne menu użytkownika z emailem
- Session cookie ustawione

#### Test 2: Błąd - niepoprawne hasło

**Kroki:**

1. Utwórz użytkownika testowego
2. Przejdź do `/login`
3. Wypełnij poprawny email
4. Wypełnij niepoprawne hasło
5. Kliknij "Zaloguj się"

**Oczekiwany rezultat:**

- Wyświetlenie błędu: "Nieprawidłowy email lub hasło"
- Pozostanie na stronie logowania

#### Test 3: Błąd - nieistniejący użytkownik

**Kroki:**

1. Przejdź do `/login`
2. Wypełnij email nieistniejącego użytkownika
3. Wypełnij dowolne hasło
4. Kliknij "Zaloguj się"

**Oczekiwany rezultat:**

- Wyświetlenie błędu: "Nieprawidłowy email lub hasło"

#### Test 4: Przekierowanie zalogowanego użytkownika

**Kroki:**

1. Zaloguj się
2. Spróbuj przejść do `/login`

**Oczekiwany rezultat:**

- Automatyczne przekierowanie do `/plans`

---

### 3.3. Logowanie przez Google (google-oauth.spec.ts)

#### Test 1: Pomyślne logowanie przez Google (nowy użytkownik)

**Kroki:**

1. Przejdź do `/login`
2. Kliknij "Zaloguj się przez Google"
3. Symuluj pomyślny flow OAuth (mock OAuth response)

**Oczekiwany rezultat:**

- Utworzenie nowego użytkownika w Supabase
- Utworzenie profilu w tabeli `profiles`
- Przekierowanie do onboardingu (pierwszy raz)

**Uwaga:** OAuth wymaga mockowania lub użycia rzeczywistego konta testowego Google.

#### Test 2: Pomyślne logowanie przez Google (istniejący użytkownik)

**Kroki:**

1. Utwórz użytkownika przez OAuth (fixture)
2. Przejdź do `/login`
3. Kliknij "Zaloguj się przez Google"
4. Symuluj pomyślny flow OAuth

**Oczekiwany rezultat:**

- Logowanie do istniejącego konta
- Przekierowanie do `/plans`

#### Test 3: Błąd OAuth - użytkownik anulował

**Kroki:**

1. Przejdź do `/login`
2. Kliknij "Zaloguj się przez Google"
3. Symuluj anulowanie przez użytkownika

**Oczekiwany rezultat:**

- Pozostanie na stronie logowania
- Wyświetlenie komunikatu (opcjonalnie)

---

### 3.4. Wylogowanie (logout.spec.ts)

#### Test 1: Pomyślne wylogowanie

**Kroki:**

1. Zaloguj się
2. Kliknij ikonę użytkownika w nagłówku
3. Kliknij "Wyloguj się"

**Oczekiwany rezultat:**

- Przekierowanie do strony głównej `/`
- Menu użytkownika nie jest widoczne
- Session cookie usunięte
- Próba dostępu do `/plans` przekierowuje do `/login`

---

### 3.5. Onboarding (onboarding.spec.ts)

#### Test 1: Ukończenie onboardingu po rejestracji

**Kroki:**

1. Zarejestruj nowego użytkownika
2. Modal onboardingu wyświetlany automatycznie
3. Wybierz tempo zwiedzania: "Umiarkowane"
4. Wybierz 3 preferencje: "Sztuka i Muzea", "Lokalne Jedzenie", "Natura"
5. Kliknij "Zapisz preferencje"

**Oczekiwany rezultat:**

- Modal zamyka się
- Przekierowanie do `/plans`
- W bazie: `profiles.onboarding_completed = true`
- W bazie: `profiles.travel_pace = 'moderate'`
- W bazie: `profiles.preferences` zawiera wybrane tagi

#### Test 2: Pominięcie onboardingu (skip)

**Kroki:**

1. Zarejestruj nowego użytkownika
2. W modalu onboardingu kliknij "Pomiń" lub zamknij modal

**Oczekiwany rezultat:**

- Modal zamyka się
- Przekierowanie do `/plans`
- W bazie: `profiles.onboarding_completed = true`
- Preferencje pozostają puste lub domyślne

#### Test 3: Brak wyświetlania onboardingu dla użytkownika, który już go ukończył

**Kroki:**

1. Użyj użytkownika z `onboarding_completed = true`
2. Zaloguj się

**Oczekiwany rezultat:**

- Modal onboardingu NIE jest wyświetlany
- Bezpośrednie przekierowanie do `/plans`

---

### 3.6. Resetowanie hasła (password-recovery.spec.ts)

#### Test 1: Wysłanie linku resetującego

**Kroki:**

1. Przejdź do `/forgot-password`
2. Wypełnij email istniejącego użytkownika
3. Kliknij "Wyślij link"

**Oczekiwany rezultat:**

- Wyświetlenie komunikatu: "Link do resetowania hasła został wysłany na twój email"
- Email z linkiem resetującym wysłany (weryfikacja w Supabase lub mock email service)

#### Test 2: Błąd - nieistniejący email

**Kroki:**

1. Przejdź do `/forgot-password`
2. Wypełnij nieistniejący email
3. Kliknij "Wyślij link"

**Oczekiwany rezultat:**

- Ze względów bezpieczeństwa: taki sam komunikat jak dla istniejącego użytkownika
- Alternatywnie: "Jeśli email istnieje w systemie, link został wysłany"

#### Test 3: Zmiana hasła przez link

**Kroki:**

1. Wygeneruj token resetowania hasła (fixture/API)
2. Przejdź do `/update-password?token=...`
3. Wprowadź nowe hasło
4. Potwierdź hasło
5. Kliknij "Zmień hasło"

**Oczekiwany rezultat:**

- Hasło zmienione w bazie
- Przekierowanie do `/login`
- Możliwość zalogowania się nowym hasłem

---

## 4. Page Objects do implementacji

### 4.1. RegisterPage.ts

```typescript
export class RegisterPage {
  readonly page: Page;
  readonly emailInput: Locator;
  readonly passwordInput: Locator;
  readonly confirmPasswordInput: Locator;
  readonly submitButton: Locator;
  readonly errorMessage: Locator;

  constructor(page: Page) {
    this.page = page;
    this.emailInput = page.locator('[name="email"]');
    this.passwordInput = page.locator('[name="password"]');
    this.confirmPasswordInput = page.locator('[name="confirmPassword"]');
    this.submitButton = page.locator('button[type="submit"]');
    this.errorMessage = page.locator('[role="alert"]');
  }

  async goto() {
    await this.page.goto('/register');
  }

  async register(email: string, password: string, confirmPassword?: string) {
    await this.emailInput.fill(email);
    await this.passwordInput.fill(password);
    await this.confirmPasswordInput.fill(confirmPassword || password);
    await this.submitButton.click();
  }

  async getErrorMessage(): Promise<string> {
    return (await this.errorMessage.textContent()) || '';
  }
}
```

### 4.2. LoginPage.ts (rozszerzenie istniejącego)

Dodać metody:

- `async clickGoogleLogin()`
- `async getErrorMessage()`
- `async isLoggedIn()` - sprawdza obecność menu użytkownika

### 4.3. OnboardingModal.ts

```typescript
export class OnboardingModal {
  readonly page: Page;
  readonly modal: Locator;
  readonly travelPaceOptions: Locator;
  readonly preferenceTags: Locator;
  readonly saveButton: Locator;
  readonly skipButton: Locator;

  constructor(page: Page) {
    this.page = page;
    this.modal = page.locator('[data-testid="onboarding-modal"]');
    this.travelPaceOptions = this.modal.locator('[data-testid^="travel-pace-"]');
    this.preferenceTags = this.modal.locator('[data-testid^="preference-tag-"]');
    this.saveButton = this.modal.locator('button:has-text("Zapisz")');
    this.skipButton = this.modal.locator('button:has-text("Pomiń")');
  }

  async isVisible(): Promise<boolean> {
    return await this.modal.isVisible();
  }

  async selectTravelPace(pace: 'slow' | 'moderate' | 'fast') {
    await this.page.locator(`[data-testid="travel-pace-${pace}"]`).click();
  }

  async selectPreferences(preferences: string[]) {
    for (const pref of preferences) {
      await this.page.locator(`[data-testid="preference-tag-${pref}"]`).click();
    }
  }

  async save() {
    await this.saveButton.click();
    await this.modal.waitFor({ state: 'hidden' });
  }

  async skip() {
    await this.skipButton.click();
    await this.modal.waitFor({ state: 'hidden' });
  }
}
```

### 4.4. ForgotPasswordPage.ts

```typescript
export class ForgotPasswordPage {
  readonly page: Page;
  readonly emailInput: Locator;
  readonly submitButton: Locator;
  readonly successMessage: Locator;

  constructor(page: Page) {
    this.page = page;
    this.emailInput = page.locator('[name="email"]');
    this.submitButton = page.locator('button[type="submit"]');
    this.successMessage = page.locator('[data-testid="success-message"]');
  }

  async goto() {
    await this.page.goto('/forgot-password');
  }

  async requestReset(email: string) {
    await this.emailInput.fill(email);
    await this.submitButton.click();
  }

  async getSuccessMessage(): Promise<string> {
    return (await this.successMessage.textContent()) || '';
  }
}
```

### 4.5. ProfilePage.ts

```typescript
export class ProfilePage {
  readonly page: Page;
  readonly userEmail: Locator;
  readonly logoutButton: Locator;
  readonly travelPaceDisplay: Locator;
  readonly preferencesDisplay: Locator;

  constructor(page: Page) {
    this.page = page;
    this.userEmail = page.locator('[data-testid="user-email"]');
    this.logoutButton = page.locator('button:has-text("Wyloguj")');
    this.travelPaceDisplay = page.locator('[data-testid="travel-pace"]');
    this.preferencesDisplay = page.locator('[data-testid="preferences"]');
  }

  async goto() {
    await this.page.goto('/profile');
  }

  async logout() {
    await this.logoutButton.click();
  }
}
```

---

## 5. Rozszerzenie fixtures.ts

### Nowe helpery:

```typescript
// Helper do tworzenia użytkownika testowego
export async function createTestUser(
  supabase: SupabaseClient,
  email: string,
  password: string,
  options?: {
    onboardingCompleted?: boolean;
    travelPace?: string;
    preferences?: string[];
  }
) {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
  });

  if (error) throw error;

  // Aktualizacja profilu
  if (options && data.user) {
    await supabase
      .from('profiles')
      .update({
        onboarding_completed: options.onboardingCompleted ?? false,
        travel_pace: options.travelPace,
        preferences: options.preferences,
      })
      .eq('id', data.user.id);
  }

  return data.user;
}

// Helper do generowania unikalnego emaila
export function generateTestEmail(): string {
  return `test-${Date.now()}-${Math.random().toString(36).substring(7)}@example.com`;
}

// Helper do czyszczenia użytkownika po teście
export async function deleteTestUser(supabase: SupabaseClient, userId: string) {
  // Supabase nie pozwala na bezpośrednie usuwanie użytkowników z poziomu klienta
  // Trzeba to zrobić przez Admin API lub SQL
  // Alternatywnie: pozostaw czyszczenie użytkowników na poziomie bazy
}
```

---

## 6. Konfiguracja testów

### playwright.config.ts (dodatkowe opcje)

```typescript
{
  use: {
    // Nagrywanie wideo tylko dla failed testów
    video: 'retain-on-failure',

    // Screenshot tylko dla failed testów
    screenshot: 'only-on-failure',

    // Base URL
    baseURL: process.env.BASE_URL || 'http://localhost:4321',
  },

  // Timeout dla testów auth (mogą być wolniejsze przez OAuth)
  timeout: 60000,
}
```

---

## 7. Kolejność implementacji

### Etap 1: Podstawy (1-2 dni)

1. ✅ Rozszerzyć `fixtures.ts` o helpery dla użytkowników
2. ✅ Utworzyć `RegisterPage.ts`
3. ✅ Rozszerzyć `LoginPage.ts`
4. ✅ Implementacja: `register.spec.ts` (wszystkie przypadki)
5. ✅ Implementacja: `login.spec.ts` (przypadki pozytywne i negatywne)

### Etap 2: Onboarding (1 dzień)

6. ✅ Utworzyć `OnboardingModal.ts`
7. ✅ Implementacja: `onboarding.spec.ts`
8. ✅ Dodać data-testid do komponentu onboardingu w aplikacji

### Etap 3: Wylogowanie (0.5 dnia)

9. ✅ Utworzyć `ProfilePage.ts` lub rozszerzyć `UserMenu.ts`
10. ✅ Implementacja: `logout.spec.ts`

### Etap 4: Resetowanie hasła (1 dzień)

11. ✅ Utworzyć `ForgotPasswordPage.ts`
12. ✅ Implementacja: `password-recovery.spec.ts`
13. ✅ Mockować wysyłkę emaili (jeśli potrzebne)

### Etap 5: OAuth (1-2 dni - opcjonalnie)

14. ✅ Badanie możliwości mockowania OAuth
15. ✅ Implementacja: `google-oauth.spec.ts`

- Opcja A: Mockowanie OAuth response
- Opcja B: Użycie prawdziwego konta testowego Google
- Opcja C: Pominięcie w E2E, pokrycie w testach integracyjnych

---

## 8. Wymagane zmiany w aplikacji

### Dodać data-testid w komponentach:

1. **RegisterForm** (`src/components/auth/RegisterForm.tsx`):
   - `data-testid="register-form"`
   - `data-testid="email-input"`
   - `data-testid="password-input"`
   - `data-testid="confirm-password-input"`
   - `data-testid="submit-button"`
   - `data-testid="error-message"`

2. **LoginForm** (`src/components/auth/LoginForm.tsx`):
   - `data-testid="google-login-button"`
   - `data-testid="error-message"`

3. **OnboardingModal** (nowy komponent lub istniejący):
   - `data-testid="onboarding-modal"`
   - `data-testid="travel-pace-slow"`
   - `data-testid="travel-pace-moderate"`
   - `data-testid="travel-pace-fast"`
   - `data-testid="preference-tag-art"`
   - `data-testid="preference-tag-food"`
   - etc.

4. **UserMenu** (`src/components/layout/UserMenu.tsx`):
   - `data-testid="user-menu"`
   - `data-testid="user-email"`
   - `data-testid="logout-button"`

---

## 9. Metryki sukcesu

- ✅ Wszystkie testy przechodzą lokalnie
- ✅ Wszystkie testy przechodzą w CI/CD
- ✅ Code coverage dla auth flow > 80%
- ✅ Czas wykonania testów auth < 2 minuty
- ✅ Testy są stabilne (flakiness < 1%)

---

## 10. Potencjalne problemy i rozwiązania

### Problem 1: OAuth trudny do testowania

**Rozwiązanie:**

- Mockować OAuth provider response
- Lub użyć dedykowanego konta testowego Google
- Lub przetestować tylko UI flow (kliknięcie przycisku)

### Problem 2: Emaile resetowania hasła

**Rozwiązanie:**

- Mockować email service
- Lub użyć testowego inbox (np. Ethereal Email, Mailtrap)
- Lub bezpośrednio generować tokeny przez Supabase Admin API

### Problem 3: Czyszczenie użytkowników testowych

**Rozwiązanie:**

- Używać unikalnych emaili z timestampem
- Okresowe czyszczenie przez SQL script
- Lub użyć dedykowanej bazy testowej resetowanej między run'ami

### Problem 4: Rate limiting przy wielu testach

**Rozwiązanie:**

- Zwiększyć limity dla środowiska testowego
- Dodać opóźnienia między testami
- Używać osobnych projektów Supabase dla testów

---

## 11. Checklist przed rozpoczęciem

- [ ] Przegląd istniejących komponentów auth
- [ ] Dodanie data-testid do formularzy
- [ ] Konfiguracja zmiennych środowiskowych dla testów
- [ ] Utworzenie testowej bazy danych Supabase
- [ ] Sprawdzenie dostępności Supabase Admin API dla czyszczenia danych
- [ ] Decyzja o strategii testowania OAuth
- [ ] Decyzja o strategii testowania emaili

---

## 12. Dokumentacja do konsultacji

- [Playwright Authentication](https://playwright.dev/docs/auth)
- [Supabase Auth Testing](https://supabase.com/docs/guides/auth/testing)
- [Vitest Fixtures](https://vitest.dev/guide/test-context.html)
