# Specyfikacja Techniczna: Moduł Uwierzytelniania Użytkowników

Na podstawie dostarczonych wymagań (`prd.md`, US-001, US-002, US-003, US-004) oraz zdefiniowanego stosu technologicznego, przedstawiam architekturę funkcjonalności rejestracji, logowania i odzyskiwania hasła z wykorzystaniem Supabase Auth w aplikacji Astro.

## 1. Architektura Interfejsu Użytkownika

### 1.1. Zmiany w strukturze stron i layoutów

Wprowadzone zostaną nowe strony oraz zmodyfikowany zostanie główny layout w celu obsługi stanu zalogowanego i niezalogowanego użytkownika.

- **`src/layouts/MainLayout.astro`**: Główny layout aplikacji zostanie rozbudowany o logikę warunkowego renderowania elementów nawigacji.
  - **Tryb non-auth (niezalogowany)**: W nagłówku będą widoczne przyciski/linki "Zaloguj się" i "Zarejestruj się".
  - **Tryb auth (zalogowany)**: Przyciski logowania/rejestracji zostaną ukryte. W ich miejsce pojawi się komponent `UserMenu`, zawierający awatar użytkownika, link do profilu oraz przycisk "Wyloguj".

- **Nowe strony**:
  - **`/login`**: Strona publiczna, zawierająca formularz logowania (e-mail/hasło) oraz opcję logowania przez Google. Wykorzysta komponent `AuthForm.tsx`.
  - **`/register`**: Strona publiczna, zawierająca formularz rejestracji. Również wykorzysta komponent `AuthForm.tsx`.
  - **`/forgot-password`**: Strona do inicjowania procesu odzyskiwania hasła.
  - **`/update-password`**: Strona, na którą trafia użytkownik po kliknięciu linku resetującego hasło z e-maila.

### 1.2. Nowe i zmodyfikowane komponenty React

Interaktywne elementy związane z autentykacją zostaną zaimplementowane jako komponenty React.

- **`src/components/auth/AuthForm.tsx` (Nowy)**:
  - Komponent do obsługi formularzy rejestracji i logowania po stronie klienta.
  - Będzie zarządzał stanem formularza przy użyciu `react-hook-form` i walidacją za pomocą `zod`.
  - Będzie komunikował się bezpośrednio z Supabase JS SDK (`supabase.auth.signUp`, `supabase.auth.signInWithPassword`).
  - Wykorzysta komponenty `Input`, `Button`, `Form`, `Alert` z `shadcn/ui`.

- **`src/components/auth/GoogleAuthButton.tsx` (Nowy)**:
  - Przycisk inicjujący logowanie przez Google za pomocą `supabase.auth.signInWithOAuth({ provider: 'google' })`.

- **`src/components/layout/UserMenu.tsx` (Nowy)**:
  - Komponent `DropdownMenu` z `shadcn/ui`.
  - Wyświetlany w `MainLayout.astro` dla zalogowanych użytkowników w miejscu przycisków "Zaloguj się" / "Zarejestruj się".
  - Zawiera link do `/profile` oraz przycisk "Wyloguj", który wywołuje `supabase.auth.signOut()`.

- **`src/components/PlansDashboard.tsx` (Modyfikacja)**:
  - Dostęp do strony, na której znajduje się ten komponent (`/dashboard`), będzie chroniony przez middleware.
  - Usunięty zostanie istniejący przycisk "Profil" (linie 111-117), ponieważ nawigacja do profilu oraz opcja wylogowania zostaną przeniesione do globalnego komponentu `UserMenu.tsx` w `MainLayout.astro`.

### 1.3. Rozdzielenie odpowiedzialności (Astro vs. React)

- **Astro**: Odpowiada za strukturę HTML, routing, SEO i osadzanie komponentów. Strony `/login`, `/register` będą stronami `.astro`, które importują i renderują komponent `AuthForm` z dyrektywą `client:load`.
- **React**: Odpowiada za całą interaktywność, zarządzanie stanem po stronie klienta i komunikację z API (w tym przypadku Supabase SDK).

### 1.4. Walidacja i obsługa błędów

- Walidacja po stronie klienta będzie realizowana w czasie rzeczywistym w formularzach React z użyciem `zod` i `react-hook-form`.
- Komunikaty o błędach (np. "Nieprawidłowy format e-mail", "Hasło musi mieć min. 8 znaków") będą wyświetlane pod polami formularza.
- Błędy pochodzące z Supabase (np. "User already registered", "Invalid login credentials") będą przechwytywane w bloku `try...catch` i wyświetlane jako ogólny alert w formularzu.

## 2. Logika Backendowa

### 2.1. Ochrona tras i Middleware

Główna logika po stronie serwera będzie zaimplementowana w middleware Astro, a nie w tradycyjnych endpointach API dla autentykacji.

- **`src/middleware/index.ts` (Nowy)**:
  - Middleware będzie uruchamiane dla każdego żądania na serwerze.
  - Będzie wykorzystywać serwerowego klienta Supabase do weryfikacji tokenu JWT z ciasteczek.
  - Dla chronionych tras (np. `/dashboard`, `/profile`):
    - Jeśli sesja jest nieprawidłowa lub jej brak, nastąpi przekierowanie (`Astro.redirect`) do `/login`.
    - Jeśli sesja jest prawidłowa, dane użytkownika zostaną pobrane i umieszczone w `Astro.locals.user`, udostępniając je w kontekście strony.
  - Trasy publiczne (np. `/`, `/login`, `/register`) będą ignorowane przez logikę przekierowania.

### 2.2. Zabezpieczenie istniejących API

Istniejące endpointy API (np. do zarządzania planami) muszą zostać zabezpieczone.

- W każdym endpoincie (np. `src/pages/api/plans/[id].ts`) na początku zostanie dodana weryfikacja: `if (!Astro.locals.user) { return new Response(null, { status: 401 }) }`.
- Identyfikator zalogowanego użytkownika (`Astro.locals.user.id`) będzie używany do filtrowania zapytań do bazy danych, aby zapewnić, że użytkownicy mają dostęp tylko do swoich danych.

### 2.3. Struktura bazy danych

- Supabase Auth automatycznie zarządza tabelą `auth.users`.
- Zostanie utworzona dodatkowa tabela `public.profiles`:
  - `id` (uuid, primary key, foreign key do `auth.users.id`)
  - `email` (text)
  - `created_at` (timestamp with time zone)
  - ... (pozostałe pola profilu, np. `preferences`, `pace`)
- Zostanie skonfigurowany trigger, który po utworzeniu nowego użytkownika w `auth.users` automatycznie stworzy dla niego wiersz w tabeli `public.profiles`.
- Zostaną wdrożone polityki RLS (Row Level Security) na tabelach (`plans`, `profiles`), aby zapewnić, że użytkownicy mogą odczytywać i modyfikować wyłącznie własne dane. Polityki będą bazować na `auth.uid()`.

## 3. System Autentykacji (Supabase + Astro)

### 3.1. Konfiguracja

- W `src/db/supabase.ts` zostanie utworzony i wyeksportowany klient Supabase JS SDK do użytku po stronie klienta.
- W middleware i endpointach API będzie używany oddzielny, serwerowy klient Supabase, inicjowany z kluczem `SERVICE_ROLE_KEY`.
- Zmienne środowiskowe `SUPABASE_URL` i `SUPABASE_ANON_KEY` zostaną dodane do pliku `.env`.

### 3.2. Scenariusze uwierzytelniania

- **Rejestracja (US-001)**: `AuthForm.tsx` wywołuje `supabase.auth.signUp()`. Supabase wysyła e-mail weryfikacyjny (można wyłączyć w ustawieniach Supabase na potrzeby MVP). Po sukcesie, SDK tworzy sesję, a aplikacja przekierowuje do `/onboarding`.
- **Logowanie (US-002)**: `AuthForm.tsx` wywołuje `supabase.auth.signInWithPassword()`. Po sukcesie, SDK tworzy sesję, a aplikacja przekierowuje do `/dashboard`.
- **Logowanie Google (US-003)**: `GoogleAuthButton.tsx` wywołuje `supabase.auth.signInWithOAuth()`. Supabase obsługuje cały proces, a po powrocie do aplikacji SDK finalizuje sesję.
- **Wylogowanie (US-004)**: `UserMenu.tsx` wywołuje `supabase.auth.signOut()`. SDK usuwa sesję i ciasteczka. Aplikacja przekierowuje do strony głównej.
- **Odzyskiwanie hasła**:
  1. Strona `/forgot-password` z formularzem wywołującym `supabase.auth.resetPasswordForEmail()`.
  2. Użytkownik otrzymuje e-mail z linkiem prowadzącym do `/update-password`.
  3. Strona `/update-password` zawiera formularz, który po załadowaniu nasłuchuje na zdarzenie `onAuthStateChange` z eventem `PASSWORD_RECOVERY`. Po wpisaniu nowego hasła, wywoływane jest `supabase.auth.updateUser()`.
