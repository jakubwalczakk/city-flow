# Plan implementacji widoku "Moje Plany"

## 1. Przegląd

Widok "Moje Plany" jest głównym pulpitem nawigacyjnym dla zalogowanego użytkownika. Jego celem jest wyświetlenie listy wszystkich aktywnych planów podróży (`draft` i `generated`), umożliwienie nawigacji do ich szczegółów oraz zapewnienie łatwego dostępu do tworzenia nowych planów. Widok zawiera również zakładkę "Historia" do przeglądania zarchiwizowanych planów.

## 2. Routing widoku

Widok będzie dostępny pod główną ścieżką po zalogowaniu:

- **Ścieżka:** `/plans`

## 3. Struktura komponentów

Hierarchia komponentów dla widoku `/plans` będzie następująca:

```
- src/pages/plans.astro
  - src/layouts/Layout.astro
    - src/components/PlansDashboard.tsx (client:visible)
      - h1 ("Moje Plany")
      - Button (z Shadcn/ui, "+ Utwórz nowy plan")
      - Tabs (z Shadcn/ui)
        - TabsList
          - TabsTrigger ("Moje Plany")
          - TabsTrigger ("Historia")
        - TabsContent ("Moje Plany")
          - PlanList.tsx
            - if (isLoading) => Spinner/Skeleton Loader
            - if (error) => ErrorMessage.tsx
            - if (plans.length > 0)
              - PlanCard.tsx (mapowanie po liście planów)
            - else
              - EmptyState.tsx
          - PaginationControls.tsx
        - TabsContent ("Historia")
          - (Analogiczna struktura dla planów zarchiwizowanych)
```

## 4. Szczegóły komponentów

### `PlansDashboard.tsx`

- **Opis:** Główny komponent React, który zarządza stanem całego widoku, w tym aktywną zakładką, paginacją oraz danymi planów pobranymi z API.
- **Główne elementy:** `h1`, `Button`, `Tabs` z `Shadcn/ui`. Renderuje `PlanList` i `PaginationControls` wewnątrz zawartości zakładek.
- **Obsługiwane interakcje:**
  - Zmiana aktywnej zakładki (Moje Plany / Historia).
  - Nawigacja do strony tworzenia nowego planu.
- **Typy:** `PlansDashboardViewModel`.
- **Propsy:** Brak.

### `PlanList.tsx`

- **Opis:** Komponent odpowiedzialny za renderowanie siatki planów. Wyświetla stan ładowania, błędu lub pusty, w zależności od otrzymanych propsów.
- **Główne elementy:** `div` jako kontener siatki (grid), który mapuje dane planów do komponentów `PlanCard`. Warunkowo renderuje komponenty `EmptyState`, `ErrorMessage` lub wskaźnik ładowania.
- **Obsługiwane interakcje:** Brak.
- **Typy:** `PlanListItemDto[]`.
- **Propsy:**
  - `plans: PlanListItemDto[]`
  - `isLoading: boolean`
  - `error: string | null`

### `PlanCard.tsx`

- **Opis:** Karta wyświetlająca podsumowanie pojedynczego planu. Zawiera nazwę, cel podróży, daty i status. Cała karta jest linkiem do widoku szczegółowego planu.
- **Główne elementy:** Komponent `Card` z `Shadcn/ui` (`CardHeader`, `CardTitle`, `CardDescription`, `CardContent`, `CardFooter`). W stopce karty znajduje się `Badge` (z Shadcn/ui) do wyświetlania statusu.
- **Obsługiwane interakcje:** Kliknięcie na kartę nawiguje do `/plans/[id]`.
- **Typy:** `PlanListItemDto`.
- **Propsy:**
  - `plan: PlanListItemDto`

### `EmptyState.tsx`

- **Opis:** Komponent wyświetlany, gdy użytkownik nie ma żadnych planów w danej zakładce. Zawiera zachętę do działania.
- **Główne elementy:** Grafika wektorowa (ikona), nagłówek (np. "Nie masz jeszcze żadnych planów") oraz przycisk `Button` (z Shadcn/ui) "Utwórz swój pierwszy plan", który nawiguje do strony tworzenia planu.
- **Obsługiwane interakcje:** Kliknięcie przycisku.
- **Propsy:** Brak.

### `PaginationControls.tsx`

- **Opis:** Komponent do nawigacji między stronami listy planów.
- **Główne elementy:** Komponent `Pagination` z `Shadcn/ui`.
- **Obsługiwane interakcje:** Zmiana strony.
- **Typy:** Obiekt `pagination` z `PaginatedPlansDto`.
- **Propsy:**
  - `pagination: { total: number; limit: number; offset: number; }`
  - `onPageChange: (newPage: number) => void`

## 5. Typy

Do implementacji widoku wykorzystane zostaną istniejące typy DTO. Dodatkowo, zdefiniujemy ViewModel dla stanu komponentu `PlansDashboard`.

- **`PlanListItemDto` (istniejący):** Używany do przekazywania danych pojedynczego planu do komponentu `PlanCard`.
- **`PaginatedPlansDto` (istniejący):** Reprezentuje strukturę odpowiedzi z API.

- **`PlansDashboardViewModel` (nowy):** Reprezentuje kompletny stan widoku zarządzany w `PlansDashboard.tsx`.

  ```typescript
  export type PlansDashboardViewModel = {
    isLoading: boolean;
    error: string | null;
    plansData: PaginatedPlansDto | null;
    activeTab: "my-plans" | "history";
    currentPage: number;
  };
  ```

  - `isLoading`: `boolean` - flaga informująca o stanie ładowania danych.
  - `error`: `string | null` - przechowuje komunikat błędu, jeśli wystąpił.
  - `plansData`: `PaginatedPlansDto | null` - przechowuje dane z API.
  - `activeTab`: `'my-plans' | 'history'` - określa, która zakładka jest aktywna.
  - `currentPage`: `number` - aktualnie wybrana strona paginacji.

## 6. Zarządzanie stanem

Stan będzie zarządzany lokalnie w komponencie `PlansDashboard.tsx` przy użyciu hooka `useState` i `useEffect`. Zalecane jest stworzenie dedykowanego customowego hooka `usePlans`, aby hermetyzować logikę pobierania danych, obsługi ładowania i błędów.

- **Custom Hook `usePlans.ts`:**
  - Będzie przyjmował parametry takie jak `status`, `limit`, `offset`.
  - Będzie zarządzał stanami `isLoading`, `error` i `data`.
  - Będzie automatycznie pobierał dane przy zmianie parametrów.
  - Zwraca `{ data, isLoading, error }`.

- **Stan w `PlansDashboard.tsx`:**
  - `activeTab`: kontrolowany przez komponent `Tabs`.
  - `currentPage`: kontrolowany przez `PaginationControls`.
  - Zmiana `activeTab` lub `currentPage` spowoduje ponowne wywołanie hooka `usePlans` z nowymi parametrami.

## 7. Integracja API

Komponenty będą komunikować się z backendem poprzez endpoint API.

- **Endpoint:** `GET /api/plans`
- **Akcja:** Pobranie listy planów użytkownika.
- **Parametry zapytania:**
  - `statuses`: `string[]`. Dla zakładki "Moje Plany" potrzebne będą statusy `draft` i `generated`. Dla "Historii" - `archived`. **Uwaga: Wymaga to modyfikacji backendu (`plan.service.ts`), aby akceptował tablicę statusów (metoda `in` zamiast `eq` w Supabase).**
  - `limit`: `number` (np. 12) - liczba planów na stronę.
  - `offset`: `number` - obliczany jako `(currentPage - 1) * limit`.
  - `sort_by`: `string` (np. `created_at`).
  - `order`: `string` (np. `desc`).
- **Typ odpowiedzi:** `PaginatedPlansDto`.

## 8. Interakcje użytkownika

- **Ładowanie widoku:** Domyślnie aktywna jest zakładka "Moje Plany". Aplikacja wysyła zapytanie do API o plany ze statusem `draft` i `generated`. W trakcie ładowania wyświetlany jest loader (np. szkielety kart).
- **Przełączanie zakładek:** Kliknięcie na zakładkę "Historia" zmienia stan `activeTab`, co uruchamia nowe zapytanie do API o plany ze statusem `archived`.
- **Zmiana strony:** Kliknięcie na numer strony w `PaginationControls` zmienia stan `currentPage`, co uruchamia nowe zapytanie do API z odpowiednim `offset`.
- **Tworzenie planu:** Kliknięcie przycisku "+ Utwórz nowy plan" przekierowuje użytkownika na stronę `/plans/new`.
- **Przeglądanie szczegółów:** Kliknięcie na dowolną kartę `PlanCard` przekierowuje użytkownika na stronę `/plans/[id]`.

## 9. Warunki i walidacja

Ten widok jest tylko do odczytu danych, więc nie ma walidacji formularzy. Warunki dotyczą głównie stanu interfejsu:

- Przycisk "Utwórz nowy plan" jest zawsze aktywny.
- Komponent `PaginationControls` jest widoczny tylko wtedy, gdy `total` planów jest większe niż `limit` na stronę.
- Komponent `EmptyState` jest wyświetlany, gdy `isLoading` jest `false`, `error` jest `null` i tablica `plans` jest pusta.

## 10. Obsługa błędów

- **Błąd API:** Jeśli zapytanie do `/api/plans` zakończy się niepowodzeniem (np. błąd 500, problem z siecią), hook `usePlans` ustawi stan `error`. Komponent `PlanList` wyświetli wtedy komunikat o błędzie (np. "Wystąpił błąd podczas pobierania planów. Spróbuj odświeżyć stronę.") zamiast listy planów.
- **Brak autoryzacji (401):** Globalny mechanizm obsługi zapytań powinien przechwycić ten błąd i przekierować użytkownika na stronę logowania.

## 11. Kroki implementacji

1.  **Modyfikacja backendu:** Zaktualizuj funkcję `getPlans` w `src/lib/services/plan.service.ts` oraz endpoint w `src/pages/api/plans.ts`, aby parametr `status` mógł przyjmować tablicę wartości.
2.  **Struktura plików:** Utwórz nowe pliki komponentów: `src/components/PlansDashboard.tsx`, `src/components/PlanList.tsx`, `src/components/PlanCard.tsx`, `src/components/EmptyState.tsx` i `src/components/PaginationControls.tsx`.
3.  **Strona Astro:** Utwórz stronę `src/pages/plans.astro` i osadź w niej komponent `PlansDashboard.tsx` z dyrektywą `client:visible`.
4.  **Custom Hook:** Zaimplementuj logikę pobierania danych w customowym hooku `src/lib/hooks/usePlans.ts`.
5.  **Komponenty:** Zaimplementuj każdy z komponentów zgodnie z opisem w sekcji 4, wykorzystując komponenty z `Shadcn/ui` (Card, Button, Tabs, Badge, Pagination) i stylując je za pomocą Tailwind CSS.
6.  **Zarządzanie stanem:** Połącz wszystko w `PlansDashboard.tsx`, zarządzając stanem `activeTab` i `currentPage` oraz przekazując dane i propsy do komponentów podrzędnych.
7.  **Routing:** Zaimplementuj nawigację do tworzenia nowego planu i do szczegółów istniejącego planu za pomocą tagów `<a>`.
8.  **Testowanie responsywności:** Upewnij się, że widok poprawnie wyświetla się na różnych rozmiarach ekranu, zwłaszcza na urządzeniach mobilnych (układ jednokolumnowy).
9.  **Obsługa przypadków brzegowych:** Sprawdź działanie wskaźników ładowania, komunikatów o błędach i stanu pustego.
