# Plan implementacji widoku Eksportu Planu do PDF

## 1. Przegląd

Celem tej funkcji jest umożliwienie użytkownikom eksportowania wygenerowanego planu podróży do pliku PDF. Funkcjonalność zostanie zrealizowana poprzez dodanie nowego, interaktywnego komponentu React (`ExportPlanButton`) w widoku szczegółów planu. Komponent ten będzie odpowiedzialny za komunikację z istniejącym endpointem API, obsługę stanu ładowania i błędów, a także za inicjowanie pobierania wygenerowanego pliku.

## 2. Routing widoku

Funkcjonalność nie wprowadza nowej ścieżki (route). Komponent eksportu zostanie dodany do istniejącego widoku szczegółów planu, dostępnego pod adresem `/plans/[id]`.

## 3. Struktura komponentów

Nowy komponent zostanie umieszczony w hierarchii widoku szczegółów planu, prawdopodobnie obok innych przycisków akcji.

```
/pages/plans/[id].astro
└── PlanDetailsView.tsx (Wrapper dla dynamicznej zawartości)
    └── PlanHeader.tsx
        └── PlanActions.tsx (Kontener na przyciski akcji)
            ├── ... (Inne przyciski, np. Archiwizuj)
            └── ExportPlanButton.tsx (Nowy komponent)
    └── PlanContent.tsx
        └── ... (Oś czasu z planem dnia)
```

## 4. Szczegóły komponentów

### `ExportPlanButton.tsx`

- **Opis komponentu**: Komponent React renderujący przycisk "Eksportuj do PDF". Po kliknięciu, wysyła żądanie do API, obsługuje odpowiedź w formacie blob (plik PDF) i inicjuje jego pobieranie po stronie przeglądarki. Komponent zarządza swoim stanem wewnętrznym, informując użytkownika o procesie eksportowania (stan ładowania) oraz o ewentualnych błędach (komunikat toast).
- **Główne elementy**:
  - Komponent `<Button>` z biblioteki `shadcn/ui`.
  - Ikona `<DownloadIcon>` wewnątrz przycisku dla lepszej czytelności.
  - W stanie ładowania, wewnątrz przycisku renderowany jest komponent `<Loader2>` (spinner).
- **Obsługiwane interakcje**:
  - `onClick`: Uruchamia asynchroniczną funkcję `handleExport`, która wykonuje żądanie API.
  - `onHover`: Wyświetla podpowiedź (tooltip) "Pobierz plan jako plik PDF".
- **Obsługiwana walidacja**:
  - Przycisk jest nieaktywny (`disabled`), jeśli nie otrzyma `planId` w propsach.
  - Przycisk jest nieaktywny (`disabled`) w trakcie trwania procesu eksportowania (`isLoading === true`).
- **Typy**:
  - `ExportPlanButtonProps` (interfejs propsów).
- **Propsy**:
  - `planId: string`: Identyfikator planu, niezbędny do zbudowania URL-a API.
  - `planName: string`: Nazwa planu, używana jako fallback dla nazwy pobieranego pliku.
  - `className?: string`: Opcjonalne klasy CSS do stylizacji.

## 5. Typy

Nie ma potrzeby tworzenia nowych typów DTO ani ViewModel. Komponent będzie korzystał z istniejących definicji.

```typescript
// Propsy komponentu ExportPlanButton
interface ExportPlanButtonProps {
  planId: string;
  planName: string;
  className?: string;
}
```

## 6. Zarządzanie stanem

Stan będzie zarządzany lokalnie wewnątrz komponentu `ExportPlanButton` przy użyciu haków React.

- **`isLoading: boolean`**: Przechowuje informację o tym, czy proces eksportowania jest w toku. Inicjalizowany jako `false`. Zmiana na `true` powoduje wyświetlenie spinnera i zablokowanie przycisku.
- **`error: string | null`**: Przechowuje komunikat o błędzie w przypadku niepowodzenia eksportu. Inicjalizowany jako `null`. Jego ustawienie może (opcjonalnie) skutkować wyświetleniem komunikatu błędu w UI, np. za pomocą toastu.

## 7. Integracja API

- **Endpoint**: `GET /plans/{id}/export?format=pdf`
- **Proces integracji**:
  1.  Komponent `ExportPlanButton` po kliknięciu wywołuje funkcję `handleExport`.
  2.  Funkcja ta wykonuje żądanie `fetch` na adres `/plans/${props.planId}/export?format=pdf`.
  3.  Oczekiwana odpowiedź sukcesu (status `200 OK`) zawiera `Content-Type: application/pdf` oraz nagłówek `Content-Disposition` z nazwą pliku.
  4.  Odpowiedź jest przetwarzana jako `blob`.
  5.  Z bloba tworzony jest tymczasowy URL obiektu (`URL.createObjectURL`).
  6.  Tworzony jest niewidoczny element `<a>`, którego `href` jest ustawiony na URL obiektu, a atrybut `download` na nazwę pliku (wyekstrahowaną z nagłówka `Content-Disposition` lub z `props.planName`).
  7.  Element `<a>` jest programowo "klikany", co inicjuje pobieranie pliku.
  8.  URL obiektu jest zwalniany z pamięci (`URL.revokeObjectURL`).

## 8. Interakcje użytkownika

- **Użytkownik klika przycisk "Eksportuj do PDF"**:
  - **Wynik**: Przycisk zmienia swój wygląd, aby zasygnalizować ładowanie (np. pojawia się ikona spinnera), i staje się nieaktywny. Po chwili przeglądarka inicjuje pobieranie pliku PDF. Po zakończeniu operacji przycisk wraca do normalnego stanu.
- **Występuje błąd podczas eksportu (np. błąd serwera)**:
  - **Wynik**: Proces ładowania zostaje przerwany, a przycisk wraca do stanu aktywnego. Na ekranie pojawia się komunikat o błędzie (rekomendowane użycie komponentu Toast/Sonner), informujący użytkownika o niepowodzeniu.

## 9. Warunki i walidacja

- **Warunek**: Dostępność `planId`.
- **Walidacja**: Komponent `ExportPlanButton` musi otrzymać `planId` jako prop. Jeśli `planId` jest `undefined` lub `null`, przycisk powinien być nieaktywny, aby uniknąć błędnych wywołań API.

## 10. Obsługa błędów

- **Błąd sieciowy**: `fetch` rzuci wyjątek. Należy go obsłużyć w bloku `catch` i wyświetlić komunikat, np. "Brak połączenia z internetem".
- **Błąd API (status 4xx/5xx)**: Odpowiedź serwera z kodem błędu. Należy odczytać status i (jeśli to możliwe) treść odpowiedzi, a następnie wyświetlić stosowny komunikat, np.:
  - `404 Not Found`: "Nie znaleziono podanego planu."
  - `500 Internal Server Error`: "Wystąpił błąd po stronie serwera. Prosimy spróbować ponownie później."
- **Brak nagłówka `Content-Disposition`**: Aplikacja powinna mieć zaimplementowany mechanizm fallback, który użyje `props.planName` do skonstruowania nazwy pliku (np. `Moja-nazwa-planu.pdf`).

## 11. Kroki implementacji

1.  Utworzenie nowego pliku komponentu: `src/components/plan-actions/ExportPlanButton.tsx`.
2.  Zaimplementowanie szkieletu komponentu `ExportPlanButton`, który przyjmuje `planId` i `planName` jako propsy i renderuje przycisk z `shadcn/ui`.
3.  Dodanie lokalnego stanu (`isLoading`) do komponentu za pomocą haka `useState`.
4.  Zaimplementowanie logiki `handleExport` wewnątrz komponentu, która będzie wywoływana po kliknięciu przycisku.
5.  W funkcji `handleExport`:
    - Ustawienie `isLoading` na `true`.
    - Implementacja wywołania `fetch` do endpointu `/plans/[id]/export?format=pdf`.
    - Dodanie obsługi odpowiedzi typu `blob`.
    - Zaimplementowanie logiki tworzenia linku i inicjowania pobierania pliku.
    - Dodanie obsługi błędów (bloki `try...catch` oraz sprawdzanie `response.ok`).
    - W bloku `finally` ustawienie `isLoading` z powrotem na `false`.
6.  Zintegrowanie komponentu `ExportPlanButton` z widokiem szczegółów planu (`/pages/plans/[id].astro` lub jego podkomponentem React), przekazując do niego wymagane propsy.
7.  Dodanie obsługi wizualnej stanu ładowania (np. zamiana ikony na spinner w przycisku).
8.  (Opcjonalnie) Zaimplementowanie systemu powiadomień (np. `sonner`) do wyświetlania komunikatów o błędach w sposób przyjazny dla użytkownika.
9.  Przetestowanie działania funkcji: poprawny eksport, obsługa błędów API, zachowanie przy braku połączenia z siecią.
