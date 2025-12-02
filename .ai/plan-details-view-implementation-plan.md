# Plan implementacji widoku Szczegółów Planu

## 1. Przegląd

Widok szczegółów planu (`/plans/[id]`) jest centralnym miejscem do zarządzania i przeglądania pojedynczego planu podróży. Jego zawartość jest dynamicznie renderowana w zależności od statusu planu. Dla planów w statusie `draft`, widok wyświetla formularz umożliwiający edycję podstawowych danych. Dla planów w statusie `generated`, widok prezentuje szczegółowy, godzinowy harmonogram podróży, wraz z opcjami interakcji, takimi jak edycja nazwy, usuwanie punktów, przebudowa dnia oraz zbieranie opinii.

## 2. Routing widoku

Widok będzie dostępny pod dynamiczną ścieżką: `/plans/[id]`, gdzie `[id]` to unikalny identyfikator planu.

## 3. Struktura komponentów

Komponenty zostaną zorganizowane w następującej hierarchii, z `PlanDetailsPage.astro` jako punktem wejścia, renderującym główny komponent Reactowy.

```
/src/pages/plans/[id].astro
└── /src/components/PlanDetailsView.tsx (Główny komponent kliencki)
    ├── /src/components/PlanHeader.tsx (Nagłówek z edytowalną nazwą i menu akcji)
    |   └── /src/components/PlanActionsMenu.tsx (Dropdown z opcjami "Usuń", "Archiwizuj")
    ├── /src/components/DraftPlanView.tsx (Widok dla planów w wersji roboczej - status 'draft')
    |   └── Formularz edycji...
    └── /src/components/GeneratedPlanView.tsx (Widok dla wygenerowanych planów - status 'generated')
        ├── /src/components/DayAccordion.tsx (Akordeon dla każdego dnia planu)
        |   └── /src/components/EventTimeline.tsx (Oś czasu z wydarzeniami dla danego dnia)
        └── /src/components/FeedbackModule.tsx (Moduł do zbierania opinii)
```

## 4. Szczegóły komponentów

### `PlanDetailsView.tsx`

- **Opis**: Główny komponent React, który pobiera dane planu na podstawie ID z URL, zarządza stanem i renderuje odpowiedni widok (`DraftPlanView` lub `GeneratedPlanView`) w zależności od statusu planu.
- **Główne elementy**: Wykorzystuje `usePlanDetails` do pobierania danych. Zawiera logikę warunkową do renderowania widoku `draft` lub `generated`. Wyświetla komunikaty o ładowaniu i błędach.
- **Obsługiwane zdarzenia**: Brak bezpośrednich interakcji, deleguje je do komponentów dzieci.
- **Typy**: `PlanDetailsViewModel`
- **Propsy**: `planId: string`

### `PlanHeader.tsx`

- **Opis**: Wyświetla nazwę planu oraz daty. Umożliwia edycję nazwy planu po kliknięciu ikony.
- **Główne elementy**: `h1` dla nazwy, `span` dla dat. Po kliknięciu w ikonę edycji, `h1` zmienia się w `Input` z przyciskami "Zapisz" i "Anuluj". Zawiera komponent `PlanActionsMenu`.
- **Obsługiwane interakcje**:
  - Kliknięcie ikony "edytuj": aktywuje tryb edycji nazwy.
  - Kliknięcie "Zapisz": wysyła zaktualizowaną nazwę do API.
  - Kliknięcie "Anuluj": porzuca zmiany i wraca do trybu wyświetlania.
- **Warunki walidacji**: Nazwa planu nie może być pusta.
- **Typy**: `PlanDetailsDto`
- **Propsy**: `plan: PlanDetailsDto`, `onUpdate: (newName: string) => Promise<void>`, `onDelete: () => Promise<void>`

### `GeneratedPlanView.tsx`

- **Opis**: Wyświetla szczegóły wygenerowanego planu, w tym oś czasu dla każdego dnia i moduł opinii.
- **Główne elementy**: `Accordion` (`@/components/ui/accordion`) do zwijania i rozwijania dni. Wewnątrz każdego elementu akordeonu znajduje się `EventTimeline` dla danego dnia. Pod akordeonem znajduje się `FeedbackModule`.
- **Obsługiwane interakcje**: Rozwijanie/zwijanie dni w akordeonie.
- **Typy**: `GeneratedContentViewModel`
- **Propsy**: `plan: PlanDetailsDto`

### `DraftPlanView.tsx`

- **Opis**: Wyświetla formularz do edycji planu, który jest w stanie roboczym.
- **Główne elementy**: Formularz z polami: `Input` dla nazwy i celu podróży, `DatePicker` dla dat, `Textarea` dla notatek. Przycisk "Generuj Plan".
- **Obsługiwane interakcje**: Edycja pól formularza, zapis zmian, inicjacja generowania planu.
- **Warunki walidacji**: Zgodne ze schemą `UpdatePlanCommand`.
- **Typy**: `PlanDetailsDto`
- **Propsy**: `plan: PlanDetailsDto`

## 5. Typy

Do obsługi widoku potrzebne będą następujące struktury danych:

```typescript
// /src/types.ts

/**
 * ViewModel for the plan details view.
 * Manages the entire client-side state of the view.
 */
export type PlanDetailsViewModel = {
  isLoading: boolean;
  error: string | null;
  plan: PlanDetailsDto | null;
};

/**
 * Type definition for a single event/slot in the generated plan's timeline.
 */
export type TimelineEvent = {
  time: string; // e.g., "09:00"
  title: string;
  description: string;
  estimated_cost?: string;
};

/**
 * Type definition for a single day in the generated plan.
 */
export type DayPlan = {
  date: string; // e.g., "2025-12-24"
  title: string;
  events: TimelineEvent[];
};

/**
 * ViewModel for the structured generated_content from a plan.
 */
export type GeneratedContentViewModel = {
  days: DayPlan[];
  summary: string;
};
```

## 6. Zarządzanie stanem

Zarządzanie stanem zostanie zrealizowane przy użyciu customowego hooka `usePlanDetails`, który będzie odpowiedzialny za:

- Pobieranie danych planu z API przy użyciu `planId`.
- Przechowywanie stanu widoku (`isLoading`, `error`, `plan`).
- Udostępnianie metod do interakcji z planem: `updatePlanName`, `deletePlan`.
- Hermetyzację logiki komunikacji z `plan.service.ts`.

Hook zostanie zaimplementowany w pliku `/src/hooks/usePlanDetails.ts`.

## 7. Integracja API

Konieczne będzie rozszerzenie serwisu `plan.service.ts` o nowe funkcje:

1.  **`getPlanById(supabase, planId)`**:
    - Metoda: `GET`
    - Endpoint: `/api/plans/[id]`
    - Odpowiedź sukcesu (200): `PlanDetailsDto`
    - Odpowiedź błędu (404): `{ error: "Plan not found." }`

2.  **`updatePlan(supabase, planId, command)`**:
    - Metoda: `PATCH`
    - Endpoint: `/api/plans/[id]`
    - Ciało żądania: `UpdatePlanCommand`
    - Odpowiedź sukcesu (200): Zaktualizowany `PlanDetailsDto`

3.  **`deletePlan(supabase, planId)`**:
    - Metoda: `DELETE`
    - Endpoint: `/api/plans/[id]`
    - Odpowiedź sukcesu (204): Brak zawartości

Należy również stworzyć odpowiednie endpointy API w `/src/pages/api/plans/[id].ts`, które będą obsługiwać te żądania.

## 8. Interakcje użytkownika

- **Zmiana nazwy planu**: Użytkownik klika ikonę ołówka, nazwa staje się polem edytowalnym. Po wpisaniu nowej nazwy i kliknięciu "Zapisz", wysyłane jest żądanie `PATCH`, a interfejs aktualizuje się po otrzymaniu odpowiedzi.
- **Usuwanie planu**: Użytkownik wybiera opcję "Usuń" z menu. Pojawia się modal z prośbą o potwierdzenie. Po potwierdzeniu wysyłane jest żądanie `DELETE`, a po sukcesie użytkownik jest przekierowywany do listy planów.
- **Przeglądanie planu**: W widoku `generated`, użytkownik może rozwijać i zwijać poszczególne dni w akordeonie, aby zobaczyć lub ukryć oś czasu.

## 9. Warunki i walidacja

- **Renderowanie warunkowe**: Głównym warunkiem jest `plan.status`. Jeśli `status === 'draft'`, renderowany jest `DraftPlanView`. Jeśli `status === 'generated'`, renderowany jest `GeneratedPlanView`.
- **Walidacja nazwy**: Przy zmianie nazwy planu, pole nie może być puste. Przycisk "Zapisz" jest nieaktywny, dopóki warunek nie zostanie spełniony.
- **Potwierdzenie usunięcia**: Operacja usunięcia planu jest krytyczna i wymaga dodatkowego potwierdzenia od użytkownika w oknie modalnym.

## 10. Obsługa błędów

- **Plan nie znaleziony (404)**: Jeśli API zwróci błąd 404, komponent `PlanDetailsView` powinien wyświetlić komunikat "Nie znaleziono planu" i przycisk powrotu do listy planów.
- **Błędy serwera (5xx)**: W przypadku problemów z serwerem podczas pobierania lub aktualizacji danych, zostanie wyświetlony generyczny komunikat o błędzie (np. "Wystąpił błąd. Spróbuj ponownie później.") za pomocą komponentu typu "toast" lub alertu.
- **Błąd walidacji**: Błędy walidacji (np. pusta nazwa) będą wyświetlane bezpośrednio pod odpowiednim polem formularza.

## 11. Kroki implementacji

1.  Utworzenie pliku endpointu API: `src/pages/api/plans/[id].ts` i implementacja obsługi metod `GET`, `PATCH`, `DELETE`.
2.  Rozszerzenie serwisu `plan.service.ts` o funkcje `getPlanById`, `updatePlan` i `deletePlan`.
3.  Implementacja customowego hooka `usePlanDetails.ts` do zarządzania stanem.
4.  Utworzenie strony Astro: `src/pages/plans/[id].astro`.
5.  Implementacja głównego komponentu React: `src/components/PlanDetailsView.tsx`.
6.  Stworzenie komponentów podrzędnych: `PlanHeader.tsx`, `PlanActionsMenu.tsx`, `DraftPlanView.tsx` i `GeneratedPlanView.tsx`.
7.  Implementacja widoku dla wygenerowanego planu (`GeneratedPlanView`), w tym komponentów `DayAccordion.tsx` i `EventTimeline.tsx`.
8.  Połączenie interakcji użytkownika (zmiana nazwy, usuwanie) z metodami z hooka `usePlanDetails`.
9.  Dodanie obsługi stanów ładowania (np. wyświetlanie spinnera) oraz obsługi błędów (wyświetlanie komunikatów).
10. Stylizacja wszystkich komponentów przy użyciu Tailwind CSS i komponentów Shadcn/ui.
