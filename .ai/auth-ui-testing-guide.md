# Przewodnik Testowania UI Autentykacji

## Zainstalowane Zależności

Wszystkie wymagane pakiety zostały zainstalowane:

✅ `@radix-ui/react-avatar` - komponenty avatara
✅ `react-hook-form` - zarządzanie formularzami
✅ `@hookform/resolvers` - integracja zod z react-hook-form

## Jak Przetestować UI

### 1. Uruchom Serwer Deweloperski

```bash
npm run dev
```

### 2. Odwiedź Strony Autentykacji

Otwórz przeglądarkę i przejdź do:

#### Strona Logowania
```
http://localhost:4321/login
```

**Co zobaczysz:**
- Formularz z polami: Email, Hasło
- Link "Zapomniałeś hasła?"
- Przycisk "Zaloguj się"
- Przycisk "Zaloguj się przez Google"
- Link do rejestracji

**Testuj:**
- ✅ Walidacja w czasie rzeczywistym (spróbuj wpisać nieprawidłowy email)
- ✅ Komunikaty błędów pod polami
- ✅ Stan loading po kliknięciu "Zaloguj się"
- ✅ Symulowane przekierowanie do /plans po 1.5s

#### Strona Rejestracji
```
http://localhost:4321/register
```

**Co zobaczysz:**
- Formularz z polami: Email, Hasło, Potwierdź hasło
- Wymagania hasła (min. 8 znaków, wielka/mała litera, cyfra)
- Przycisk "Zarejestruj się"
- Przycisk "Zarejestruj się przez Google"
- Link do logowania
- Informacja o regulaminie

**Testuj:**
- ✅ Walidacja hasła (spróbuj słabe hasło)
- ✅ Walidacja potwierdzenia hasła (wpisz różne hasła)
- ✅ Stan loading po kliknięciu
- ✅ Komunikat sukcesu z informacją o emailu weryfikacyjnym

#### Strona Zapomnienia Hasła
```
http://localhost:4321/forgot-password
```

**Co zobaczysz:**
- Pole Email
- Przycisk "Wyślij link resetujący"
- Link do logowania

**Testuj:**
- ✅ Walidacja emaila
- ✅ Stan loading
- ✅ Ekran sukcesu z instrukcjami
- ✅ Możliwość "Spróbuj ponownie"

#### Strona Ustawiania Nowego Hasła
```
http://localhost:4321/update-password
```

**Co zobaczysz:**
- Stan weryfikacji sesji (loader)
- Formularz z polami: Nowe hasło, Potwierdź nowe hasło
- Przycisk "Ustaw nowe hasło"

**Testuj:**
- ✅ Walidacja hasła
- ✅ Walidacja potwierdzenia
- ✅ Stan loading
- ✅ Komunikat sukcesu z auto-przekierowaniem

### 3. Przetestuj Nawigację

#### Strony z Headerem (MainLayout)

Odwiedź dowolną z tych stron:
```
http://localhost:4321/
http://localhost:4321/plans
http://localhost:4321/profile
```

**Co zobaczysz w headerze:**
- Logo "CityFlow" (link do strony głównej)
- Po prawej: Przyciski "Zaloguj się" i "Zarejestruj się"

**Uwaga:** Obecnie header zawsze pokazuje stan niezalogowany, ponieważ:
```typescript
const user = null; // Mock: będzie pochodzić z Astro.locals.user po implementacji middleware
```

#### Po implementacji backend (przyszłość)

Header będzie pokazywać:
- **Dla niezalogowanych:** Przyciski logowania/rejestracji
- **Dla zalogowanych:** Avatar użytkownika z menu dropdown:
  - Email użytkownika
  - Link "Profil"
  - Przycisk "Wyloguj się"

## Weryfikacja Stylowania

### Sprawdź Responsywność

Przetestuj na różnych rozmiarach ekranu:
- ✅ Mobile (320px-640px)
- ✅ Tablet (640px-1024px)
- ✅ Desktop (1024px+)

### Sprawdź Komponenty

Wszystkie komponenty powinny:
- ✅ Mieć spójny design z PlansDashboard i ProfileView
- ✅ Używać kolorów z Tailwind theme
- ✅ Mieć odpowiednie stany (hover, focus, disabled)
- ✅ Wyświetlać ikony z lucide-react

## Ważne Uwagi

### Mock Behavior

**Obecnie wszystkie formularze działają w trybie mock:**

1. **AuthForm (login/register)**
   - Symuluje delay 1s
   - Zawsze kończy się sukcesem
   - Loguje dane do console

2. **GoogleAuthButton**
   - Symuluje delay 1s
   - Nie przekierowuje do Google (brak konfiguracji)
   - Loguje do console

3. **ForgotPasswordForm**
   - Symuluje delay 1s
   - Zawsze pokazuje sukces
   - Nie wysyła prawdziwego emaila

4. **UpdatePasswordForm**
   - Symuluje weryfikację sesji (500ms)
   - Zawsze uznaje sesję za valid
   - Symuluje zmianę hasła (1s)
   - Przekierowuje do /login po 2s

### Sprawdź Console

Otwórz DevTools → Console podczas testowania, aby zobaczyć logi z formularzy.

## Następne Kroki (Backend Implementation)

Po przetestowaniu UI, następne zadania to:

1. **Konfiguracja Supabase**
   - Utworzenie projektu Supabase
   - Dodanie zmiennych środowiskowych
   - Konfiguracja Google OAuth

2. **Implementacja Middleware**
   - Weryfikacja sesji
   - Ochrona chronionych tras
   - Przekierowania

3. **Integracja Supabase Auth**
   - Podmiana mock calls na prawdziwe API calls
   - Obsługa błędów Supabase
   - Zarządzanie sesją

4. **Testowanie End-to-End**
   - Rejestracja prawdziwego użytkownika
   - Logowanie
   - Odzyskiwanie hasła
   - Wylogowanie

## Znane Ograniczenia (Mock UI)

- ❌ Nie ma prawdziwej autentykacji
- ❌ Nie ma trwałej sesji (refresh powoduje "wylogowanie")
- ❌ Nie ma komunikacji z backendem
- ❌ Header zawsze pokazuje stan niezalogowany
- ❌ Przyciski Google OAuth nie działają
- ❌ Email weryfikacyjny nie jest wysyłany
- ❌ Email resetujący hasło nie jest wysyłany

Wszystkie powyższe zostaną naprawione po implementacji backend.

## Zgłaszanie Problemów

Jeśli znajdziesz problemy z UI (nie związane z backend):
- Błędy stylowania
- Problemy z responsywnością
- Błędy walidacji formularzy
- Problemy z komponentami shadcn/ui
- Błędy TypeScript/linting

Zgłoś je, aby mogły zostać naprawione przed implementacją backend.

