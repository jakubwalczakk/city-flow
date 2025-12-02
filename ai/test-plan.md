# Plan Testów Aplikacji CityFlow

## 1. Przegląd aplikacji

CityFlow to aplikacja internetowa, która umożliwia użytkownikom planowanie podróży miejskich. Główne funkcjonalności aplikacji to:

- **Zarządzanie użytkownikami**: Rejestracja, logowanie, wylogowywanie, odzyskiwanie hasła oraz logowanie za pomocą konta Google.
- **Tworzenie planów podróży**: Użytkownicy mogą tworzyć nowe plany za pomocą wieloetapowego formularza, w którym podają podstawowe informacje (cel, daty), stałe punkty (np. rezerwacje hotelowe, loty) oraz osobiste preferencje.
- **Generowanie planów przez AI**: Na podstawie danych wprowadzonych przez użytkownika, aplikacja wykorzystuje zewnętrzne API (Openrouter.ai) do wygenerowania szczegółowego planu zwiedzania.
- **Zarządzanie planami**: Użytkownicy mogą przeglądać listę swoich planów, wyświetlać ich szczegóły oraz zarządzać nimi.
- **Profil użytkownika**: Każdy użytkownik posiada swój profil, w którym może zarządzać swoimi danymi.

## 2. Zakres testów

### Co będzie testowane (In Scope)

- Pełny cykl życia autentykacji użytkownika (rejestracja, logowanie, wylogowywanie, reset hasła, OAuth).
- Logika biznesowa po stronie serwera (API endpoints w `src/pages/api`).
- Wieloetapowy proces tworzenia nowego planu podróży.
- Integracja z Supabase, w tym poprawność zapytań do bazy danych i działanie polityk RLS (Row Level Security).
- Interaktywne komponenty React, w tym walidacja formularzy i zarządzanie stanem.
- Podstawowe renderowanie stron statycznych przez Astro.
- Poprawność wyświetlania danych na poszczególnych widokach (lista planów, szczegóły planu).

### Co nie będzie testowane (Out of Scope)

- Jakość i merytoryczna poprawność planów generowanych przez zewnętrzne modele AI (Openrouter.ai).
- Testy wydajnościowe i obciążeniowe (na obecnym etapie).
- Szczegółowe testy użyteczności (UX/UI).
- Testy poszczególnych komponentów z biblioteki `shadcn/ui` w izolacji.
- Bezpośrednie testowanie infrastruktury Supabase i Openrouter.ai.

## 3. Typy testów

- **Testy jednostkowe (Unit Tests)**: Testowanie małych, izolowanych fragmentów kodu, takich jak funkcje pomocnicze (`src/lib/utils`), hooki React (`src/hooks`) oraz pojedyncze komponenty UI bez interakcji z zewnętrznymi serwisami.
- **Testy integracyjne (Integration Tests)**: Testowanie współpracy kilku modułów. Przykłady:
  - Testowanie całego formularza tworzenia planu (`NewPlanForm.tsx`) w celu weryfikacji przepływu danych między krokami.
  - Testowanie endpointów API w integracji z testową bazą danych Supabase w celu weryfikacji logiki biznesowej i RLS.
- **Testy End-to-End (E2E)**: Symulacja pełnych scenariuszy z perspektywy użytkownika w przeglądarce. Przykłady:
  - `Rejestracja -> Logowanie -> Stworzenie nowego planu -> Wylogowanie.`
  - `Próba dostępu do planu innego użytkownika.`
- **Testy API**: Bezpośrednie testowanie kontraktów API (`src/pages/api`) w celu weryfikacji poprawności zapytań, odpowiedzi, kodów statusu i obsługi błędów.

## 4. Środowiska testowe

- **Lokalne (Local)**: Środowisko deweloperskie na maszynach programistów. Wymaga lokalnej instancji Supabase (uruchamianej przez Supabase CLI) oraz mockowania usług zewnętrznych (Openrouter.ai).
- **CI/CD (Continuous Integration)**: Automatyczne uruchamianie wszystkich testów (jednostkowych, integracyjnych, E2E) na platformie takiej jak Vercel lub GitHub Actions po każdym pushu do repozytorium.
- **Staging**: Odwzorowanie środowiska produkcyjnego, podłączone do osobnego projektu Supabase. Używane do finalnych testów E2E i weryfikacji manualnej przed wdrożeniem na produkcję.

## 5. Strategia testowania

Strategia opiera się na piramidzie testów, kładąc nacisk na szybkie i tanie testy jednostkowe, a kończąc na mniejszej liczbie kompleksowych, ale wolniejszych testów E2E.

- **Frontend**: Komponenty React będą testowane przy użyciu Vitest i React Testing Library. Krytyczne ścieżki użytkownika zostaną pokryte testami E2E za pomocą Playwright.
- **Backend (API)**: Endpointy Astro będą testowane integracyjnie z wykorzystaniem Vitest i Supertest, z połączeniem do czystej, seedowanej bazy danych przed każdym testem. Zewnętrzne API (Openrouter) będzie mockowane.
- **Baza Danych**: Polityki RLS będą testowane automatycznie, np. za pomocą `pgTAP`, w ramach pipeline'u CI/CD. Każdy test integracyjny będzie działał na transakcji lub na czystej bazie danych, aby zapewnić izolację.
- **Automatyzacja**: Wszystkie testy będą w pełni zautomatyzowane i uruchamiane w ramach pipeline'u CI/CD. Pull requesty z nieprzechodzącymi testami będą blokowane przed mergem.

## 6. Przypadki testowe (przykłady)

### Autentykacja

- Użytkownik może pomyślnie zarejestrować się przy użyciu prawidłowego adresu e-mail i hasła.
- System odrzuca próby rejestracji z niepoprawnym adresem e-mail lub zbyt krótkim hasłem.
- Użytkownik może zalogować się przy użyciu poprawnych danych.
- System blokuje logowanie z niepoprawnymi danymi uwierzytelniającymi.
- Użytkownik może przejść przez proces resetowania hasła.

### Tworzenie i zarządzanie planem

- Użytkownik może pomyślnie przejść przez wszystkie kroki formularza i utworzyć nowy plan.
- Formularz wyświetla błędy walidacji przy próbie wprowadzenia niepoprawnych danych (np. data końcowa wcześniejsza niż początkowa).
- Zalogowany użytkownik widzi na liście wyłącznie swoje plany podróży.
- Próba uzyskania dostępu do szczegółów planu innego użytkownika (np. poprzez bezpośredni URL) kończy się błędem autoryzacji.

### API

- `POST /api/plans` - Zwraca status `201` po poprawnym utworzeniu planu i `400` w przypadku błędnych danych. Wymaga autentykacji (zwraca `401/403` dla niezalogowanych).
- `GET /api/plans` - Zwraca listę planów należących wyłącznie do zalogowanego użytkownika.
- `POST /api/generate-plan` - Poprawnie obsługuje sukces i błąd odpowiedzi z serwisu Openrouter.ai.

## 7. Narzędzia testowe

- **Test Runner**: Vitest
- **Biblioteka do testowania komponentów**: React Testing Library
- **Testy E2E**: Playwright
- **Mockowanie**: Wbudowane `vi.mock` w Vitest
- **Testy API**: Supertest
- **Baza danych**: Supabase CLI, `pgTAP`

## 8. Kryteria akceptacji

- Pokrycie kodu testami (code coverage) na poziomie min. 80% dla krytycznej logiki biznesowej (serwisy, endpointy API).
- Wszystkie testy E2E dla krytycznych ścieżek użytkownika (rejestracja, logowanie, tworzenie planu) muszą zakończyć się sukcesem.
- Brak krytycznych błędów zidentyfikowanych podczas testów na środowisku Staging.
- Pipeline CI/CD przechodzi pomyślnie dla każdej zmiany wprowadzanej do głównej gałęzi.

## 9. Harmonogram

- **Tydzień 1**: Konfiguracja środowiska testowego (Vitest, Playwright) i integracja z CI/CD.
- **Tydzień 2-3**: Implementacja testów jednostkowych i integracyjnych dla istniejących komponentów, serwisów i endpointów API.
- **Tydzień 4**: Stworzenie testów E2E dla kluczowych przepływów użytkownika.
- **Ciągły**: Pisanie testów dla każdej nowej funkcjonalności i poprawki błędów.

## 10. Zasoby

- **Zasoby ludzkie**: 1-2 deweloperów odpowiedzialnych za pisanie i utrzymanie testów automatycznych.
- **Zasoby techniczne**:
  - Platforma CI/CD (np. Vercel, GitHub Actions).
  - Osobny projekt Supabase dla środowiska Staging.
  - Budżet na klucze API Openrouter.ai do testów na środowisku Staging.
