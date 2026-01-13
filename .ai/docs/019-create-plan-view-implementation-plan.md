# Plan implementacji widoku Tworzenia Planu

## 1. Przegląd

Widok "Tworzenia Planu" to wieloetapowy formularz, który umożliwia użytkownikom tworzenie nowego szkicu planu podróży. Proces został podzielony na kroki, aby uprościć wprowadzanie danych: od podstawowych informacji o podróży, przez dodawanie kluczowych, stałych punktów (np. rezerwacji), aż po podsumowanie. Celem jest zebranie wszystkich niezbędnych danych, które posłużą później do wygenerowania szczegółowego harmonogramu przez AI.

## 2. Routing widoku

Widok będzie dostępny pod następującą ścieżką:

- `/plans/new`

## 3. Struktura komponentów

Główna strona `NewPlanPage.astro` będzie renderować komponent React `NewPlanForm`, który zarządza całym procesem.

```
/src/pages/plans/new.astro
└── /src/components/NewPlanForm.tsx (client:load)
    ├── /src/components/StepIndicator.tsx
    ├── Krok 1: /src/components/BasicInfoStep.tsx
    │   ├── ui/Input (Nazwa planu)
    │   ├── ui/Input (Cel podróży)
    │   ├── ui/DatePicker (Data początkowa)
    │   ├── ui/DatePicker (Data końcowa)
    │   └── ui/Textarea (Notatki)
    ├── Krok 2: /src/components/FixedPointsStep.tsx
    │   ├── FixedPointItem.tsx (Lista dodanych punktów)
    │   └── FixedPointForm.tsx (Formularz dodawania nowego punktu)
    ├── Krok 3: /src/components/SummaryStep.tsx
    │   └── Wyświetlanie danych z poprzednich kroków
    └── Przyciski nawigacyjne (Wstecz, Dalej, Zapisz szkic)
```

## 4. Szczegóły komponentów

### `NewPlanForm.tsx`

- **Opis komponentu**: Główny komponent kontenerowy, zarządzający logiką wieloetapowego formularza. Odpowiada za przechowywanie stanu całego formularza, obsługę przejść między krokami oraz finalne wysłanie danych do API.
- **Główne elementy**: `StepIndicator`, `BasicInfoStep`, `FixedPointsStep`, `SummaryStep`, `Button`.
- **Obsługiwane interakcje**: Nawigacja "Wstecz" / "Dalej", finalne zatwierdzenie formularza.
- **Typy**: `NewPlanViewModel`.
- **Propsy**: Brak.

### `StepIndicator.tsx`

- **Opis komponentu**: Wizualny wskaźnik postępu, pokazujący, na którym etapie tworzenia planu znajduje się użytkownik.
- **Główne elementy**: Lista kroków (np. `div` lub `li`).
- **Obsługiwane interakcje**: Brak.
- **Typy**: `currentStep: number`, `steps: string[]`.
- **Propsy**: `currentStep`, `steps`.

### `BasicInfoStep.tsx`

- **Opis komponentu**: Formularz do zbierania podstawowych informacji o planie.
- **Główne elementy**: `Input`, `DatePicker` (z biblioteki Shadcn/ui), `Textarea`.
- **Obsługiwane interakcje**: Wprowadzanie danych w pola formularza.
- **Obsługiwana walidacja**:
  - `name`: Pole wymagane, nie może być puste.
  - `destination`: Pole wymagane, nie może być puste.
  - `end_date`: Musi być późniejsza lub równa `start_date`, jeśli obie daty są podane.
- **Typy**: `CreatePlanCommand` (częściowo).
- **Propsy**: `formData`, `updateFormData`, `goToNextStep`.

### `FixedPointsStep.tsx`

- **Opis komponentu**: Interfejs do dodawania, wyświetlania i usuwania "stałych punktów" planu, takich jak rezerwacje lotów czy biletów na wydarzenia.
- **Główne elementy**: Formularz do dodawania nowego punktu (`FixedPointForm`), lista dodanych punktów (`FixedPointItem`), przyciski "Dodaj" i "Usuń".
- **Obsługiwane interakcje**: Dodawanie nowego punktu, usuwanie istniejącego punktu.
- **Obsługiwana walidacja**: Dla każdego punktu pola `location`, `event_at` (data i czas) są wymagane.
- **Typy**: `CreateFixedPointCommand[]`.
- **Propsy**: `fixedPoints`, `addFixedPoint`, `removeFixedPoint`.

### `SummaryStep.tsx`

- **Opis komponentu**: Ostatni krok, prezentujący wszystkie wprowadzone przez użytkownika dane w formie tylko do odczytu, w celu ostatecznej weryfikacji przed zapisaniem.
- **Główne elementy**: Sekcje wyświetlające dane podstawowe i listę stałych punktów.
- **Obsługiwane interakcje**: Brak.
- **Typy**: `NewPlanViewModel`.
- **Propsy**: `formData`.

## 5. Typy

Do implementacji widoku potrzebny będzie nowy ViewModel do zarządzania stanem formularza po stronie klienta.

```typescript
// src/types.ts (lub w komponencie)

/**
 * ViewModel for the new plan creation form.
 * Holds the entire state of the multi-step form on the client-side.
 */
export type NewPlanViewModel = {
  basicInfo: {
    name: string;
    destination: string;
    start_date: Date | null;
    end_date: Date | null;
    notes: string;
  };
  fixedPoints: CreateFixedPointCommand[];
};
```

Pozostałe typy, takie jak `CreatePlanCommand` i `CreateFixedPointCommand`, są już zdefiniowane w `src/types.ts`.

## 6. Zarządzanie stanem

Logika i stan formularza zostaną scentralizowane w niestandardowym hooku `useNewPlanForm`.

**`useNewPlanForm` hook:**

- **Cel**: Zarządzanie stanem całego formularza (`formData`), aktualnym krokiem (`currentStep`), stanem ładowania (`isLoading`) i błędami (`error`).
- **Stan**:
  - `currentStep: number`
  - `formData: NewPlanViewModel`
  - `isLoading: boolean`
  - `error: string | null`
- **Funkcje**:
  - `nextStep()`: Waliduje bieżący krok i przechodzi do następnego.
  - `prevStep()`: Wraca do poprzedniego kroku.
  - `updateBasicInfo(data: Partial<NewPlanViewModel['basicInfo']>)`: Aktualizuje dane podstawowe.
  - `addFixedPoint(point: CreateFixedPointCommand)`: Dodaje stały punkt.
  - `removeFixedPoint(index: number)`: Usuwa stały punkt.
  - `handleSubmit()`: Orkiestruje wysyłanie danych do API.

## 7. Integracja API

Interakcja z backendem będzie dwuetapowa, realizowana w funkcji `handleSubmit` hooka `useNewPlanForm`.

1.  **Tworzenie szkicu planu**:
    - **Endpoint**: `POST /api/plans`
    - **Request Body**: `CreatePlanCommand` (mapowany z `formData.basicInfo`).
    - **Opis**: Po pomyślnym przesłaniu danych podstawowych, API zwraca nowo utworzony obiekt planu wraz z jego `id`.

2.  **Dodawanie stałych punktów**:
    - **Endpoint**: `POST /api/plans/{planId}/fixed-points`
    - **Request Body**: `CreateFixedPointCommand`.
    - **Opis**: Po uzyskaniu `planId` z poprzedniego kroku, aplikacja wysyła serię żądań (po jednym dla każdego stałego punktu) w celu powiązania ich z utworzonym szkicem.

Po pomyślnym zakończeniu obu operacji, użytkownik zostanie przekierowany do widoku szczegółów nowego planu.

## 8. Interakcje użytkownika

- **Wypełnianie formularza**: Stan komponentu jest aktualizowany na bieżąco przy każdej zmianie w polach.
- **Nawigacja między krokami**: Przyciski "Wstecz" i "Dalej" zmieniają `currentStep` w stanie, co powoduje renderowanie odpowiedniego komponentu kroku.
- **Zapisywanie szkicu**: Kliknięcie "Zapisz szkic" na ostatnim etapie uruchamia funkcję `handleSubmit`, która rozpoczyna komunikację z API. Przycisk jest nieaktywny podczas trwania operacji.

## 9. Warunki i walidacja

Walidacja będzie realizowana po stronie klienta przy użyciu biblioteki `zod`, aby zapewnić spójność z walidacją backendową.

- **Krok 1 (Dane podstawowe)**: Przycisk "Dalej" jest nieaktywny, dopóki wymagane pola (`name`, `destination`) nie zostaną poprawnie wypełnione. Komunikaty o błędach (np. "To pole jest wymagane") wyświetlają się pod odpowiednimi polami.
- **Krok 2 (Stałe punkty)**: Przycisk "Dodaj punkt" jest nieaktywny, dopóki formularz dodawania punktu nie jest poprawnie wypełniony (wymagane `location` i `event_at`).

## 10. Obsługa błędów

- **Błędy walidacji**: Komunikaty o błędach są wyświetlane bezpośrednio pod polami formularza, których dotyczą.
- **Błędy API**:
  - W przypadku niepowodzenia przy tworzeniu szkicu (`POST /api/plans`), zostanie wyświetlony globalny komunikat (np. w formie tosta): "Nie udało się utworzyć szkicu planu. Spróbuj ponownie."
  - W przypadku niepowodzenia przy dodawaniu stałych punktów, komunikat poinformuje o częściowym sukcesie: "Szkic został zapisany, ale wystąpił błąd podczas dodawania stałych punktów."
- **Błędy sieciowe**: Generyczny komunikat o problemie z połączeniem.

## 11. Kroki implementacji

1.  Utworzenie pliku strony `/src/pages/plans/new.astro`.
2.  Stworzenie szkieletu głównego komponentu `/src/components/NewPlanForm.tsx` oraz hooka `useNewPlanForm`.
3.  Implementacja komponentu `StepIndicator.tsx`.
4.  Implementacja komponentu pierwszego kroku `BasicInfoStep.tsx` wraz z polami formularza i logiką walidacji.
5.  Implementacja komponentu drugiego kroku `FixedPointsStep.tsx`, w tym formularza dodawania i listy punktów.
6.  Implementacja komponentu `SummaryStep.tsx` do wyświetlania podsumowania.
7.  Zintegrowanie kroków w `NewPlanForm.tsx` i obsługa nawigacji.
8.  Implementacja logiki `handleSubmit` w `useNewPlanForm` w celu obsługi wywołań API.
9.  Dodanie obsługi stanu ładowania i błędów (np. wyświetlanie spinnera i komunikatów).
10. Ostylowanie wszystkich komponentów zgodnie z systemem designu (Tailwind, Shadcn/ui).
11. Zapewnienie responsywności widoku na urządzeniach mobilnych.
