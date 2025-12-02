# API Endpoint Implementation Plan: Get Profile

## 1. Przegląd punktu końcowego

Ten punkt końcowy (`GET /api/profiles`) jest przeznaczony do pobierania danych profilowych dla aktualnie uwierzytelnionego użytkownika. Umożliwia klientowi dostęp do preferencji użytkownika, tempa podróży i innych informacji związanych z kontem. Dostęp jest ograniczony tylko do uwierzytelnionych użytkowników, a użytkownicy mogą pobierać tylko własne dane profilowe.

## 2. Szczegóły żądania

- **Metoda HTTP**: `GET`
- **Struktura URL**: `/api/profiles`
- **Parametry**:
  - **Wymagane**: Brak. Identyfikator użytkownika jest wyodrębniany z sesji po stronie serwera.
  - **Opcjonalne**: Brak.
- **Request Body**: Brak.

## 3. Wykorzystywane typy

- **DTO**: `ProfileDto` z `src/types.ts` zostanie użyty do strukturyzacji odpowiedzi.
  ```typescript
  export type ProfileDto = {
    id: string;
    preferences: string[] | null;
    travel_pace: TravelPace | null;
    generations_remaining: number;
    onboarding_completed: boolean;
    updated_at: string;
  };
  ```

## 4. Szczegóły odpowiedzi

- **Odpowiedź sukcesu (200 OK)**: Zwraca obiekt `ProfileDto` z danymi profilu użytkownika.
  ```json
  {
    "id": "uuid",
    "preferences": ["Art & Museums", "Local Food"],
    "travel_pace": "moderate",
    "generations_remaining": 5,
    "onboarding_completed": true,
    "updated_at": "2025-10-25T10:00:00Z"
  }
  ```
- **Odpowiedź błędu (404 Not Found)**: Zwracana, gdy użytkownik jest uwierzytelniony, ale jego profil nie istnieje w bazie danych (np. nie ukończył onboardingu).
  ```json
  {
    "error": "Profile not found."
  }
  ```

## 5. Przepływ danych

1.  Klient wysyła żądanie `GET` na adres `/api/profiles` z prawidłowym tokenem JWT w nagłówku `Authorization`.
2.  Middleware Astro weryfikuje token JWT i umieszcza informacje o sesji użytkownika w `context.locals`.
3.  Handler endpointa w `src/pages/api/profiles/index.ts` jest wywoływany.
4.  Handler sprawdza, czy `context.locals.session.user` istnieje. Jeśli nie, zwraca odpowiedź `401 Unauthorized`.
5.  Handler wywołuje nową funkcję serwisową `ProfileService.findProfileByUserId(supabase, userId)`.
6.  Funkcja serwisowa wysyła zapytanie do tabeli `profiles` w Supabase, szukając rekordu, gdzie `id` pasuje do `userId`.
7.  Jeśli profil nie zostanie znaleziony, serwis zwraca `null`.
8.  Handler odbiera odpowiedź od serwisu. Jeśli jest to `null`, zwraca odpowiedź `404 Not Found`.
9.  Jeśli dane profilu zostaną zwrócone, handler mapuje je na `ProfileDto` i wysyła odpowiedź `200 OK` z obiektem DTO w formacie JSON.

## 6. Względy bezpieczeństwa

- **Uwierzytelnianie**: Dostęp do punktu końcowego będzie chroniony i dostępny tylko dla użytkowników z ważną sesją (JWT). Middleware Astro będzie odpowiedzialne za walidację tokena.
- **Autoryzacja**: Row Level Security (RLS) w Supabase musi być skonfigurowane dla tabeli `profiles`, aby zapewnić, że użytkownicy mogą odpytywać tylko o swój własny profil (`auth.uid() = id`).

## 7. Obsługa błędów

- **`200 OK`**: Pomyślnie pobrano profil.
- **`401 Unauthorized`**: Użytkownik nie jest uwierzytelniony lub sesja wygasła.
- **`404 Not Found`**: Profil dla uwierzytelnionego użytkownika nie został znaleziony.
- **`500 Internal Server Error`**: Wystąpił nieoczekiwany błąd serwera (np. problem z połączeniem z bazą danych). Błędy te będą logowane za pomocą `loggera` przed zwróceniem ogólnej odpowiedzi o błędzie.

## 8. Rozważania dotyczące wydajności

- Zapytanie do bazy danych jest operacją wyszukiwania klucza podstawowego (`id`), która jest wysoce zoptymalizowana i wydajna.
- Nie przewiduje się żadnych wąskich gardeł wydajnościowych dla tego punktu końcowego.

## 9. Etapy wdrożenia

1.  **Utworzenie pliku serwisu**: Utwórz nowy plik `src/lib/services/profile.service.ts`.
2.  **Implementacja logiki serwisu**: W `profile.service.ts`, zaimplementuj funkcję asynchroniczną `findProfileByUserId(supabase: SupabaseClient, userId: string)`. Ta funkcja powinna:
    - Przyjmować klienta Supabase i `userId` jako argumenty.
    - Wykonywać zapytanie `select()` do tabeli `profiles`, filtrując po `userId`.
    - Zwracać pojedynczy obiekt profilu lub `null`, jeśli nie zostanie znaleziony.
    - Obsługiwać potencjalne błędy zapytania.
3.  **Utworzenie pliku endpointa**: Utwórz nowy plik `src/pages/api/profiles/index.ts`.
4.  **Implementacja handlera GET**: W pliku endpointa, wyeksportuj handler `GET` dla `APIContext`. Handler powinien:
    - Sprawdzić `context.locals.session`. Jeśli jest `null`, zwrócić `401`.
    - Wyodrębnić `id` użytkownika z `context.locals.session.user`.
    - Użyć `try...catch` do obsługi błędów.
    - W bloku `try`, wywołać `findProfileByUserId` z klientem Supabase z `context.locals` i ID użytkownika.
    - Jeśli wynik jest `null`, zwrócić odpowiedź JSON z kodem `404`.
    - Jeśli profil zostanie znaleziony, zwrócić odpowiedź JSON z kodem `200` i danymi profilu.
    - W bloku `catch`, zalogować błąd i zwrócić odpowiedź JSON z kodem `500`.
