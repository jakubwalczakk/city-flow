# Plan implementacji widoku Profilu

## 1. Przegląd

Widok Profilu to strona umożliwiająca użytkownikowi zarządzanie swoimi preferencjami podróżniczymi, danymi konta oraz monitorowanie limitu generacji planów. Użytkownik może w tym widoku edytować swoje preferencje turystyczne (tagi), tempo zwiedzania oraz sprawdzić liczbę pozostałych darmowych generacji planów w bieżącym miesiącu. Widok jest kluczowy dla personalizacji doświadczenia użytkownika, ponieważ ustawione tutaj preferencje wpływają na jakość generowanych przez AI planów podróży.

## 2. Routing widoku

Widok powinien być dostępny pod ścieżką: `/profile`

Strona powinna być zaimplementowana jako plik Astro: `src/pages/profile.astro`

## 3. Struktura komponentów

```
profile.astro (Astro page)
└── Layout
    └── ProfileView (React, client:load)
        ├── ProfileHeader
        ├── Card (Shadcn/ui)
        │   └── GenerationsCounter
        │       └── Progress (Shadcn/ui)
        ├── Card (Shadcn/ui)
        │   └── PreferencesForm
        │       ├── Label (Shadcn/ui)
        │       ├── TravelPaceSelector
        │       │   └── Select (Shadcn/ui)
        │       ├── PreferencesSelector
        │       │   └── Badge (Shadcn/ui) - wielokrotnie
        │       └── Button (Shadcn/ui)
        └── ToasterWrapper (dla powiadomień)
```

## 4. Szczegóły komponentów

### ProfileView (główny komponent widoku)

- **Opis komponentu**: Główny kontener widoku profilu, zarządzający stanem całego formularza i komunikacją z API. Odpowiada za pobieranie danych profilu, zarządzanie edycją oraz zapisywanie zmian.
- **Główne elementy**: 
  - Nagłówek strony (`ProfileHeader`)
  - Sekcja licznika generacji (`GenerationsCounter`) w komponencie `Card`
  - Sekcja formularza preferencji (`PreferencesForm`) w komponencie `Card`
  - System powiadomień toast
- **Obsługiwane interakcje**:
  - Inicjalne pobranie danych profilu przy montowaniu komponentu
  - Obsługa błędów ładowania danych
  - Koordynacja zapisywania zmian z formularza
- **Obsługiwana walidacja**: Brak bezpośredniej walidacji (delegowana do `PreferencesForm`)
- **Typy**: `ProfileDto`, `ProfileViewModel`, `UpdateProfileCommand`
- **Propsy**: Brak (komponent główny)

### ProfileHeader

- **Opis komponentu**: Prosty komponent nagłówkowy wyświetlający tytuł strony i opcjonalny opis.
- **Główne elementy**: 
  - `<h1>` z tytułem "Profil"
  - `<p>` z opisem "Zarządzaj swoimi preferencjami i danymi konta"
- **Obsługiwane interakcje**: Brak
- **Obsługiwana walidacja**: Brak
- **Typy**: Brak
- **Propsy**: Brak

### GenerationsCounter

- **Opis komponentu**: Wyświetla użytkownikowi liczbę pozostałych darmowych generacji planów w bieżącym miesiącu. Komponent wizualizuje limit za pomocą paska postępu oraz tekstowej informacji.
- **Główne elementy**:
  - Nagłówek sekcji "Limit generacji"
  - Tekst informacyjny: "Pozostało planów: X/5"
  - Komponent `Progress` (Shadcn/ui) pokazujący wizualnie wykorzystanie limitu
  - Informacja o dacie resetu: "Limit odnowi się 1. dnia przyszłego miesiąca"
- **Obsługiwane interakcje**: Brak (komponent tylko do odczytu)
- **Obsługiwana walidacja**: Brak
- **Typy**: Brak specyficznych typów (otrzymuje `generations_remaining: number`)
- **Propsy**:
  ```typescript
  interface GenerationsCounterProps {
    generationsRemaining: number;
  }
  ```

### PreferencesForm

- **Opis komponentu**: Formularz umożliwiający edycję preferencji użytkownika: tempa zwiedzania i tagów preferencji turystycznych. Komponent zarządza lokalnym stanem formularza, walidacją oraz wysyłaniem danych do API.
- **Główne elementy**:
  - `<form>` jako kontener
  - Sekcja "Tempo zwiedzania" z komponentem `TravelPaceSelector`
  - Sekcja "Preferencje turystyczne" z komponentem `PreferencesSelector`
  - Przycisk "Zapisz zmiany" (Shadcn/ui `Button`)
  - Komunikaty walidacji (wyświetlane pod polami)
- **Obsługiwane interakcje**:
  - Zmiana tempa zwiedzania
  - Dodawanie/usuwanie tagów preferencji
  - Wysłanie formularza (kliknięcie "Zapisz")
  - Obsługa stanu ładowania podczas zapisywania
- **Obsługiwana walidacja**:
  - Preferencje: muszą zawierać od 2 do 5 elementów (zgodnie z API)
  - Tempo zwiedzania: musi być jedną z wartości: "slow", "moderate", "intensive"
  - Walidacja odbywa się przed wysłaniem żądania do API
  - W przypadku błędu walidacji, wyświetlany jest komunikat pod odpowiednim polem
- **Typy**: `UpdateProfileCommand`, `TravelPace`, `ProfileDto`
- **Propsy**:
  ```typescript
  interface PreferencesFormProps {
    initialPreferences: string[] | null;
    initialTravelPace: TravelPace | null;
    onSave: (data: UpdateProfileCommand) => Promise<void>;
  }
  ```

### TravelPaceSelector

- **Opis komponentu**: Komponent wyboru tempa zwiedzania z trzech predefiniowanych opcji. Wykorzystuje komponent `Select` z Shadcn/ui.
- **Główne elementy**:
  - `Label` z tekstem "Tempo zwiedzania"
  - `Select` (Shadcn/ui) z trzema opcjami:
    - "Wolne" (wartość: "slow")
    - "Umiarkowane" (wartość: "moderate")
    - "Intensywne" (wartość: "intensive")
- **Obsługiwane interakcje**:
  - Wybór jednej z trzech opcji tempa
  - Wywołanie callbacku `onChange` przy zmianie wartości
- **Obsługiwana walidacja**: Brak (wartość zawsze jest poprawna, jeśli wybrana)
- **Typy**: `TravelPace`
- **Propsy**:
  ```typescript
  interface TravelPaceSelectorProps {
    value: TravelPace | null;
    onChange: (value: TravelPace) => void;
  }
  ```

### PreferencesSelector

- **Opis komponentu**: Komponent umożliwiający wybór 2-5 tagów preferencji turystycznych z predefiniowanej listy. Wyświetla dostępne tagi jako przyciski typu "badge", które użytkownik może aktywować/dezaktywować.
- **Główne elementy**:
  - `Label` z tekstem "Preferencje turystyczne"
  - Opis: "Wybierz od 2 do 5 preferencji"
  - Siatka przycisków-badge'ów reprezentujących dostępne tagi:
    - "Sztuka i Muzea"
    - "Lokalne Jedzenie"
    - "Aktywny Wypoczynek"
    - "Natura i Parki"
    - "Życie Nocne"
    - "Historia i Kultura"
  - Komunikat walidacji (jeśli wybrano niewłaściwą liczbę tagów)
- **Obsługiwane interakcje**:
  - Kliknięcie na badge dodaje/usuwa tag z listy wybranych
  - Wizualne rozróżnienie wybranych i niewybranych tagów (różne style badge'a)
  - Blokada możliwości wyboru kolejnych tagów po osiągnięciu limitu 5
- **Obsługiwana walidacja**:
  - Minimalna liczba wybranych tagów: 2
  - Maksymalna liczba wybranych tagów: 5
  - Wyświetlenie komunikatu błędu, jeśli warunek nie jest spełniony
- **Typy**: `string[]` (tablica wybranych preferencji)
- **Propsy**:
  ```typescript
  interface PreferencesSelectorProps {
    value: string[];
    onChange: (value: string[]) => void;
    error?: string | null;
  }
  ```

## 5. Typy

### Istniejące typy (z `types.ts`)

```typescript
// DTO dla odpowiedzi GET /profiles
export type ProfileDto = {
  id: string;
  preferences: string[] | null;
  travel_pace: TravelPace | null;
  generations_remaining: number;
  onboarding_completed: boolean;
  updated_at: string;
};

// Komenda dla PATCH /profiles
export type UpdateProfileCommand = {
  preferences?: string[];
  travel_pace?: TravelPace;
  onboarding_completed?: boolean;
};

// Enum dla tempa podróży
export type TravelPace = "slow" | "moderate" | "intensive";
```

### Nowe typy (do dodania w pliku komponentu lub w `types.ts`)

```typescript
/**
 * ViewModel dla widoku profilu.
 * Zarządza stanem całego widoku, w tym danymi profilu, 
 * stanem ładowania i błędami.
 */
export type ProfileViewModel = {
  isLoading: boolean;
  isSaving: boolean;
  error: string | null;
  profile: ProfileDto | null;
};

/**
 * Stałe: Lista dostępnych preferencji turystycznych.
 * Używana w komponencie PreferencesSelector.
 */
export const AVAILABLE_PREFERENCES = [
  "Sztuka i Muzea",
  "Lokalne Jedzenie",
  "Aktywny Wypoczynek",
  "Natura i Parki",
  "Życie Nocne",
  "Historia i Kultura",
] as const;

/**
 * Stałe: Mapowanie wartości TravelPace na czytelne etykiety.
 */
export const TRAVEL_PACE_LABELS: Record<TravelPace, string> = {
  slow: "Wolne",
  moderate: "Umiarkowane",
  intensive: "Intensywne",
};
```

## 6. Zarządzanie stanem

### Custom Hook: `useProfile`

Widok będzie wykorzystywał dedykowany custom hook `useProfile`, który enkapsuluje całą logikę zarządzania stanem profilu.

**Lokalizacja**: `src/hooks/useProfile.ts`

**Odpowiedzialności**:
- Pobieranie danych profilu z API przy montowaniu komponentu
- Zarządzanie stanem ładowania i błędów
- Obsługa zapisywania zmian profilu
- Optymistyczne aktualizacje UI (opcjonalnie)

**Struktura hooka**:

```typescript
export function useProfile() {
  const [viewModel, setViewModel] = useState<ProfileViewModel>({
    isLoading: true,
    isSaving: false,
    error: null,
    profile: null,
  });

  // Pobranie profilu przy montowaniu
  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    // Implementacja pobierania danych z GET /api/profiles
  };

  const updateProfile = async (data: UpdateProfileCommand) => {
    // Implementacja aktualizacji przez PATCH /api/profiles
  };

  return {
    ...viewModel,
    updateProfile,
    refetch: fetchProfile,
  };
}
```

**Zwracane wartości**:
- `isLoading: boolean` - czy trwa ładowanie danych profilu
- `isSaving: boolean` - czy trwa zapisywanie zmian
- `error: string | null` - komunikat błędu (jeśli wystąpił)
- `profile: ProfileDto | null` - dane profilu użytkownika
- `updateProfile: (data: UpdateProfileCommand) => Promise<void>` - funkcja do zapisywania zmian
- `refetch: () => Promise<void>` - funkcja do ponownego pobrania danych

## 7. Integracja API

### Endpoint: GET /api/profiles

**Cel**: Pobranie danych profilu użytkownika przy inicjalizacji widoku.

**Typ żądania**: Brak body (GET request)

**Typ odpowiedzi**: `ProfileDto`

```typescript
{
  id: string;
  preferences: string[] | null;
  travel_pace: TravelPace | null;
  generations_remaining: number;
  onboarding_completed: boolean;
  updated_at: string;
}
```

**Obsługa błędów**:
- `404 Not Found`: Profil nie istnieje (nowy użytkownik) - wyświetlić komunikat z sugestią wypełnienia profilu
- `401 Unauthorized`: Użytkownik niezalogowany - przekierowanie do strony logowania
- `500 Internal Server Error`: Błąd serwera - wyświetlić ogólny komunikat błędu

### Endpoint: PATCH /api/profiles

**Cel**: Aktualizacja preferencji użytkownika.

**Typ żądania**: `UpdateProfileCommand`

```typescript
{
  preferences?: string[];
  travel_pace?: TravelPace;
  onboarding_completed?: boolean;
}
```

**Typ odpowiedzi**: `ProfileDto` (zaktualizowany profil)

**Obsługa błędów**:
- `400 Bad Request`: Błąd walidacji (np. niewłaściwa liczba preferencji) - wyświetlić szczegóły błędu pod odpowiednimi polami formularza
- `401 Unauthorized`: Użytkownik niezalogowany - przekierowanie do strony logowania
- `500 Internal Server Error`: Błąd serwera - wyświetlić komunikat błędu i umożliwić ponowną próbę

**Przykład wywołania**:

```typescript
const response = await fetch('/api/profiles', {
  method: 'PATCH',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`,
  },
  body: JSON.stringify({
    preferences: ["Sztuka i Muzea", "Lokalne Jedzenie", "Historia i Kultura"],
    travel_pace: "moderate",
  }),
});

if (!response.ok) {
  const error = await response.json();
  throw new Error(error.error || 'Failed to update profile');
}

const updatedProfile: ProfileDto = await response.json();
```

## 8. Interakcje użytkownika

### 1. Wejście na stronę profilu

**Akcja użytkownika**: Użytkownik klika "Profil" w nawigacji

**Oczekiwany wynik**:
1. Przekierowanie do `/profile`
2. Wyświetlenie stanu ładowania (spinner lub skeleton)
3. Wykonanie żądania GET /api/profiles
4. Po otrzymaniu danych: wyświetlenie formularza z aktualnymi wartościami
5. W przypadku błędu: wyświetlenie komunikatu błędu

### 2. Zmiana tempa zwiedzania

**Akcja użytkownika**: Użytkownik otwiera dropdown "Tempo zwiedzania" i wybiera opcję

**Oczekiwany wynik**:
1. Dropdown rozwija się, pokazując 3 opcje
2. Po wyborze opcji, dropdown się zamyka
3. Wybrana wartość jest wyświetlana w polu
4. Stan formularza jest aktualizowany (lokalnie, bez zapisu do API)
5. Przycisk "Zapisz zmiany" staje się aktywny (jeśli była zmiana)

### 3. Dodawanie/usuwanie tagów preferencji

**Akcja użytkownika**: Użytkownik klika na badge preferencji

**Oczekiwany wynik**:
- **Jeśli tag nie był wybrany**:
  1. Tag zostaje dodany do listy wybranych
  2. Badge zmienia wygląd na "aktywny" (np. inny kolor tła)
  3. Jeśli wybrano już 5 tagów, pozostałe nieaktywne badge'e są zablokowane
  4. Stan formularza jest aktualizowany lokalnie
  
- **Jeśli tag był wybrany**:
  1. Tag zostaje usunięty z listy wybranych
  2. Badge wraca do wyglądu "nieaktywnego"
  3. Jeśli wcześniej osiągnięto limit 5, inne badge'e zostają odblokowane
  4. Stan formularza jest aktualizowany lokalnie

### 4. Zapisywanie zmian

**Akcja użytkownika**: Użytkownik klika przycisk "Zapisz zmiany"

**Oczekiwany wynik**:
1. Walidacja formularza po stronie klienta:
   - Sprawdzenie, czy wybrano 2-5 preferencji
   - Sprawdzenie, czy wybrano tempo zwiedzania
2. Jeśli walidacja nie przejdzie:
   - Wyświetlenie komunikatów błędów pod odpowiednimi polami
   - Przycisk pozostaje aktywny
3. Jeśli walidacja przejdzie:
   - Przycisk zmienia stan na "ładowanie" (spinner + tekst "Zapisywanie...")
   - Wykonanie żądania PATCH /api/profiles
   - Po sukcesie:
     - Wyświetlenie powiadomienia toast: "Profil został zaktualizowany"
     - Aktualizacja lokalnego stanu z odpowiedzią API
     - Przycisk wraca do stanu normalnego
   - Po błędzie:
     - Wyświetlenie powiadomienia toast z komunikatem błędu
     - Przycisk wraca do stanu normalnego
     - Użytkownik może spróbować ponownie

### 5. Obsługa błędów walidacji z API

**Akcja użytkownika**: Użytkownik zapisuje formularz, ale API zwraca błąd 400 (walidacja)

**Oczekiwany wynik**:
1. Parsowanie szczegółów błędu z odpowiedzi API
2. Wyświetlenie komunikatów błędów pod odpowiednimi polami formularza
3. Wyświetlenie ogólnego powiadomienia toast: "Nie udało się zapisać zmian"
4. Użytkownik może poprawić dane i spróbować ponownie

## 9. Warunki i walidacja

### Walidacja po stronie klienta (przed wysłaniem do API)

#### 1. Preferencje turystyczne

**Warunek**: Liczba wybranych preferencji musi być między 2 a 5 (włącznie)

**Komponenty, których dotyczy**: `PreferencesSelector`, `PreferencesForm`

**Wpływ na UI**:
- Jeśli wybrano < 2 preferencji: wyświetlenie komunikatu błędu "Wybierz co najmniej 2 preferencje"
- Jeśli wybrano > 5 preferencji: niemożliwe (zablokowane w UI)
- Podczas wybierania: licznik "Wybrano X/5" (opcjonalnie)
- Przycisk "Zapisz" jest nieaktywny, jeśli warunek nie jest spełniony

**Implementacja**:
```typescript
const validatePreferences = (preferences: string[]): string | null => {
  if (preferences.length < 2) {
    return "Wybierz co najmniej 2 preferencje";
  }
  if (preferences.length > 5) {
    return "Możesz wybrać maksymalnie 5 preferencji";
  }
  return null;
};
```

#### 2. Tempo zwiedzania

**Warunek**: Wartość musi być jedną z: "slow", "moderate", "intensive"

**Komponenty, których dotyczy**: `TravelPaceSelector`, `PreferencesForm`

**Wpływ na UI**:
- Warunek zawsze spełniony, jeśli użytkownik wybierze opcję z dropdownu
- Jeśli wartość jest null (nie wybrano): wyświetlenie komunikatu "Wybierz tempo zwiedzania"
- Przycisk "Zapisz" jest nieaktywny, jeśli tempo nie zostało wybrane

**Implementacja**:
```typescript
const validateTravelPace = (pace: TravelPace | null): string | null => {
  if (!pace) {
    return "Wybierz tempo zwiedzania";
  }
  return null;
};
```

### Walidacja po stronie serwera (API)

API wykonuje dodatkową walidację i może zwrócić błąd `400 Bad Request` z szczegółami:

```json
{
  "error": "Validation failed.",
  "details": {
    "preferences": "Must have between 2 and 5 items."
  }
}
```

**Obsługa w UI**:
1. Parsowanie obiektu `details` z odpowiedzi
2. Mapowanie kluczy (`preferences`, `travel_pace`) na odpowiednie pola formularza
3. Wyświetlenie komunikatów błędów pod polami
4. Wyświetlenie ogólnego toasta z informacją o błędzie

### Stan formularza

**Przycisk "Zapisz zmiany" jest aktywny tylko wtedy, gdy**:
1. Formularz przeszedł walidację kliencką
2. Nastąpiła zmiana w stosunku do początkowych wartości (opcjonalnie, dla lepszego UX)
3. Nie trwa obecnie zapisywanie (`isSaving === false`)

## 10. Obsługa błędów

### 1. Błąd ładowania profilu (GET /api/profiles)

**Scenariusz**: Nie udało się pobrać danych profilu przy inicjalizacji widoku

**Przyczyny**:
- Błąd sieci
- Błąd serwera (500)
- Użytkownik niezalogowany (401)
- Profil nie istnieje (404)

**Obsługa**:
- **401 Unauthorized**: Automatyczne przekierowanie do strony logowania
- **404 Not Found**: Wyświetlenie komunikatu "Nie znaleziono profilu. Uzupełnij swoje preferencje poniżej." + pokazanie pustego formularza
- **500 / błąd sieci**: Wyświetlenie komunikatu błędu z przyciskiem "Spróbuj ponownie", który ponownie wywołuje `fetchProfile()`

**UI**:
```
┌─────────────────────────────────────┐
│  ⚠️  Nie udało się załadować profilu │
│                                     │
│  [Spróbuj ponownie]                 │
└─────────────────────────────────────┘
```

### 2. Błąd zapisywania profilu (PATCH /api/profiles)

**Scenariusz**: Nie udało się zapisać zmian w profilu

**Przyczyny**:
- Błąd walidacji (400)
- Błąd sieci
- Błąd serwera (500)
- Użytkownik niezalogowany (401)

**Obsługa**:
- **400 Bad Request**: 
  - Parsowanie szczegółów błędu z `response.details`
  - Wyświetlenie komunikatów pod odpowiednimi polami formularza
  - Toast: "Popraw błędy w formularzu"
  
- **401 Unauthorized**: 
  - Przekierowanie do strony logowania
  - Toast: "Sesja wygasła. Zaloguj się ponownie."
  
- **500 / błąd sieci**: 
  - Toast: "Nie udało się zapisać zmian. Spróbuj ponownie."
  - Formularz pozostaje wypełniony, użytkownik może ponowić próbę

**UI**:
- Komunikaty błędów inline pod polami formularza
- Toast notification w prawym górnym rogu
- Przycisk "Zapisz" wraca do stanu aktywnego po błędzie

### 3. Brak danych profilu dla nowego użytkownika

**Scenariusz**: Użytkownik dopiero się zarejestrował i nie ma jeszcze profilu (404)

**Obsługa**:
- Wyświetlenie komunikatu informacyjnego: "Witaj! Uzupełnij swój profil, aby AI mogło tworzyć lepsze plany."
- Pokazanie formularza z pustymi wartościami
- Po zapisaniu: ustawienie `onboarding_completed: true`

### 4. Utrata połączenia podczas zapisywania

**Scenariusz**: Użytkownik traci połączenie z internetem podczas zapisywania

**Obsługa**:
- Wykrycie błędu sieci (network error)
- Toast: "Brak połączenia z internetem. Sprawdź połączenie i spróbuj ponownie."
- Dane w formularzu pozostają nietknięte
- Użytkownik może ponowić próbę po przywróceniu połączenia

### 5. Timeout żądania

**Scenariusz**: Żądanie do API trwa zbyt długo (> 30s)

**Obsługa**:
- Anulowanie żądania po przekroczeniu timeoutu
- Toast: "Żądanie trwało zbyt długo. Spróbuj ponownie."
- Przycisk wraca do stanu aktywnego

## 11. Kroki implementacji

### Krok 1: Przygotowanie struktury plików

1. Utworzyć plik strony: `src/pages/profile.astro`
2. Utworzyć główny komponent: `src/components/ProfileView.tsx`
3. Utworzyć custom hook: `src/hooks/useProfile.ts`
4. Dodać nowe typy do `src/types.ts` (jeśli potrzebne)

### Krok 2: Implementacja custom hooka `useProfile`

1. Zaimplementować funkcję `fetchProfile()`:
   - Wywołanie GET /api/profiles
   - Obsługa stanów ładowania i błędów
   - Parsowanie odpowiedzi do `ProfileDto`
2. Zaimplementować funkcję `updateProfile()`:
   - Walidacja danych przed wysłaniem
   - Wywołanie PATCH /api/profiles
   - Obsługa stanów zapisywania i błędów
   - Aktualizacja lokalnego stanu po sukcesie
3. Dodać `useEffect` do automatycznego pobierania danych przy montowaniu
4. Przetestować hook w izolacji

### Krok 3: Implementacja komponentu `GenerationsCounter`

1. Utworzyć komponent w `src/components/GenerationsCounter.tsx`
2. Zaimplementować UI:
   - Nagłówek sekcji
   - Tekst "Pozostało planów: X/5"
   - Komponent `Progress` z Shadcn/ui
   - Informacja o resecie limitu
3. Obliczyć wartość procentową dla paska postępu: `(generationsRemaining / 5) * 100`
4. Stylować komponent zgodnie z designem aplikacji

### Krok 4: Implementacja komponentu `TravelPaceSelector`

1. Utworzyć komponent w `src/components/TravelPaceSelector.tsx`
2. Zdefiniować stałą `TRAVEL_PACE_OPTIONS` z mapowaniem wartości na etykiety
3. Zaimplementować UI używając `Select` z Shadcn/ui:
   - Label "Tempo zwiedzania"
   - Opcje: Wolne, Umiarkowane, Intensywne
4. Obsłużyć zdarzenie `onChange` i przekazać wartość do rodzica
5. Obsłużyć stan, gdy wartość jest `null` (placeholder: "Wybierz tempo")

### Krok 5: Implementacja komponentu `PreferencesSelector`

1. Utworzyć komponent w `src/components/PreferencesSelector.tsx`
2. Zdefiniować stałą `AVAILABLE_PREFERENCES` z listą dostępnych tagów
3. Zaimplementować UI:
   - Label "Preferencje turystyczne"
   - Opis "Wybierz od 2 do 5 preferencji"
   - Siatka badge'ów (używając `Badge` z Shadcn/ui)
4. Zaimplementować logikę wyboru/odznaczenia:
   - Kliknięcie na badge dodaje/usuwa tag z listy
   - Blokada wyboru po osiągnięciu limitu 5
   - Wizualne rozróżnienie wybranych/niewybranych tagów
5. Wyświetlić komunikat błędu walidacji (jeśli przekazany przez props)

### Krok 6: Implementacja komponentu `PreferencesForm`

1. Utworzyć komponent w `src/components/PreferencesForm.tsx`
2. Zaimplementować lokalny stan formularza:
   ```typescript
   const [preferences, setPreferences] = useState<string[]>(initialPreferences || []);
   const [travelPace, setTravelPace] = useState<TravelPace | null>(initialTravelPace);
   const [errors, setErrors] = useState<{ preferences?: string; travelPace?: string }>({});
   ```
3. Zaimplementować funkcję walidacji formularza
4. Zaimplementować handler `handleSubmit`:
   - Walidacja danych
   - Wywołanie `onSave` z propsów
   - Obsługa błędów
5. Zbudować UI formularza:
   - Sekcja z `TravelPaceSelector`
   - Sekcja z `PreferencesSelector`
   - Przycisk "Zapisz zmiany" (z obsługą stanu ładowania)
6. Przekazać handlery i wartości do komponentów dzieci

### Krok 7: Implementacja głównego komponentu `ProfileView`

1. Utworzyć komponent w `src/components/ProfileView.tsx`
2. Zaimportować i użyć hooka `useProfile()`
3. Zaimplementować obsługę stanów:
   - **Loading**: Wyświetlić spinner lub skeleton
   - **Error**: Wyświetlić komunikat błędu z przyciskiem retry
   - **Success**: Wyświetlić pełny widok profilu
4. Zbudować strukturę UI:
   - `ProfileHeader`
   - `Card` z `GenerationsCounter`
   - `Card` z `PreferencesForm`
5. Zaimplementować handler `handleSave`:
   - Wywołanie `updateProfile` z hooka
   - Wyświetlenie toasta po sukcesie/błędzie
6. Dodać `ToasterWrapper` dla powiadomień

### Krok 8: Implementacja strony Astro `profile.astro`

1. Utworzyć plik `src/pages/profile.astro`
2. Zaimportować `Layout` i `ProfileView`
3. Dodać middleware sprawdzający autentykację (jeśli nie jest globalny)
4. Osadzić komponent `ProfileView` z dyrektywą `client:load`:
   ```astro
   <Layout title="Profil">
     <ProfileView client:load />
   </Layout>
   ```

### Krok 9: Dodanie linku do nawigacji

1. Otworzyć komponent nawigacji (np. `src/components/Navigation.astro`)
2. Dodać link do `/profile` z ikoną i tekstem "Profil"
3. Upewnić się, że link jest widoczny tylko dla zalogowanych użytkowników

### Krok 10: Testowanie i poprawki

1. Przetestować pełny flow:
   - Wejście na stronę profilu
   - Ładowanie danych
   - Edycja preferencji
   - Zapisywanie zmian
   - Obsługa błędów
2. Przetestować walidację:
   - Próba zapisania < 2 preferencji
   - Próba zapisania bez wyboru tempa
   - Obsługa błędów z API
3. Przetestować responsywność na urządzeniach mobilnych
4. Sprawdzić dostępność (a11y):
   - Nawigacja klawiaturą
   - Screen readery
   - Kontrast kolorów
5. Poprawić błędy wykryte podczas testowania

### Krok 11: Optymalizacja i finalizacja

1. Dodać loading skeletony dla lepszego UX
2. Zoptymalizować wydajność (React.memo, jeśli potrzebne)
3. Dodać animacje przejść (opcjonalnie)
4. Upewnić się, że wszystkie komunikaty są w języku polskim
5. Sprawdzić zgodność z wytycznymi stylistycznymi projektu
6. Zaktualizować dokumentację (jeśli wymagane)

### Krok 12: Code review i deployment

1. Utworzyć pull request z implementacją
2. Przeprowadzić code review
3. Poprawić uwagi z review
4. Zmergować do głównej gałęzi
5. Wdrożyć na środowisko produkcyjne
6. Zweryfikować działanie na produkcji

