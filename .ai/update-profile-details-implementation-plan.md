# API Endpoint Implementation Plan: Update Profile

## 1. Przegląd punktu końcowego

Ten punkt końcowy umożliwia zautentyfikowanemu użytkownikowi aktualizację jego profilu. Jest używany zarówno do regularnych aktualizacji, jak i do ukończenia procesu onboardingu. Punkt końcowy akceptuje częściowe aktualizacje, co jest zgodne z metodą `PATCH`.

## 2. Szczegóły żądania

-   **Metoda HTTP**: `PATCH`
-   **Struktura URL**: `/api/profiles`
-   **Request Body**:
    ```json
    {
      "preferences": ["Art & Museums", "Local Food", "Nightlife"],
      "travel_pace": "intensive",
      "onboarding_completed": true
    }
    ```
-   **Parametry**:
    -   Wszystkie pola w ciele żądania są opcjonalne.
    -   `preferences`: `string[]` (musi zawierać od 2 do 5 elementów, jeśli podane)
    -   `travel_pace`: `"slow" | "moderate" | "intensive"`
    -   `onboarding_completed`: `boolean`

## 3. Wykorzystywane typy

### Modele komend i schematy walidacji

-   **Command Model**: `UpdateProfileCommand` (z `src/types.ts`) będzie używany do typowania danych przychodzących.
-   **Schemat Walidacji (Zod)**: Nowy schemat `updateProfileSchema` zostanie utworzony w `src/lib/schemas/profile.schema.ts` w celu walidacji ciała żądania.
    ```typescript
    import { z } from "zod";

    export const updateProfileSchema = z.object({
      preferences: z.array(z.string()).min(2, "Must have at least 2 items.").max(5, "Must have at most 5 items.").optional(),
      travel_pace: z.enum(["slow", "moderate", "intensive"]).optional(),
      onboarding_completed: z.boolean().optional(),
    });
    ```

### Obiekty transferu danych (DTO)

-   **DTO odpowiedzi**: `ProfileDto` (z `src/types.ts`) zostanie użyty do sformatowania odpowiedzi.

## 4. Szczegóły odpowiedzi

-   **Odpowiedź sukcesu (200 OK)**:
    ```json
    {
      "id": "user-uuid",
      "preferences": ["Art & Museums", "Local Food", "Nightlife"],
      "travel_pace": "intensive",
      "generations_remaining": 5,
      "onboarding_completed": true,
      "updated_at": "2025-11-10T10:00:00.000Z"
    }
    ```
-   **Odpowiedzi błędów**:
    -   **400 Bad Request**: Walidacja danych wejściowych nie powiodła się.
        ```json
        { "error": "Validation failed.", "details": { "preferences": "Must have between 2 and 5 items." } }
        ```
    -   **401 Unauthorized**: Użytkownik nie jest zautentykowany.
    -   **500 Internal Server Error**: Wystąpił błąd serwera (np. błąd bazy danych).

## 5. Przepływ danych

1.  Żądanie `PATCH` trafia do punktu końcowego Astro `/api/profiles`.
2.  Middleware Astro (`src/middleware/index.ts`) weryfikuje token JWT i dołącza sesję użytkownika do `Astro.locals`.
3.  Handler `PATCH` w `src/pages/api/profiles.ts` jest wywoływany.
4.  Handler sprawdza, czy `Astro.locals.user` istnieje. Jeśli nie, zwraca `401 Unauthorized`.
5.  Ciało żądania jest parsowane i walidowane przy użyciu schematu `updateProfileSchema`. W przypadku niepowodzenia walidacji, zwracany jest błąd `400 Bad Request` ze szczegółami.
6.  Handler wywołuje nową funkcję `updateProfile(userId, validatedData)` z nowo utworzonego serwisu `ProfileService` (`src/lib/services/profile.service.ts`).
7.  `ProfileService` używa klienta Supabase do aktualizacji rekordu w tabeli `profiles`, gdzie `id` odpowiada `userId`.
8.  Serwis zwraca zaktualizowany profil lub rzuca błąd w przypadku niepowodzenia operacji na bazie danych.
9.  Handler endpointa przechwytuje zwrócone dane, mapuje je na `ProfileDto` i wysyła odpowiedź `200 OK`. Błędy z serwisu są obsługiwane przez globalny `errorHandler` i skutkują odpowiedzią `500 Internal Server Error`.

## 6. Względy bezpieczeństwa

-   **Uwierzytelnianie**: Wszystkie żądania do tego punktu końcowego muszą zawierać prawidłowy token JWT. Middleware Supabase jest odpowiedzialne za weryfikację tokenu.
-   **Autoryzacja**: Logika biznesowa musi zapewnić, że użytkownik może aktualizować tylko swój własny profil. Jest to osiągane poprzez pobranie ID użytkownika z `Astro.locals.user` i użycie go w klauzuli `WHERE` zapytania `UPDATE`.
-   **Walidacja danych wejściowych**: Użycie Zod do ścisłej walidacji danych wejściowych zapobiega zapisywaniu w bazie danych nieprawidłowych lub potencjalnie szkodliwych danych.

## 7. Rozważania dotyczące wydajności

-   Operacja jest prostym zapytaniem `UPDATE` do bazy danych, indeksowanym przez klucz główny (`id`), więc nie przewiduje się problemów z wydajnością.
-   Zapytanie powinno aktualizować i zwracać tylko zaktualizowany wiersz, aby zminimalizować transfer danych.

## 8. Etapy wdrożenia

1.  **Utworzenie schematu walidacji**:
    -   Utwórz nowy plik `src/lib/schemas/profile.schema.ts`.
    -   Zdefiniuj i wyeksportuj schemat Zod `updateProfileSchema` zgodnie z sekcją 3.

2.  **Utworzenie serwisu profilu**:
    -   Utwórz nowy plik `src/lib/services/profile.service.ts`.
    -   Zaimplementuj klasę `ProfileService` z metodą `updateProfile`.
    -   Metoda `updateProfile` powinna przyjmować `userId: string` i `data: UpdateProfileCommand` jako argumenty.
    -   Wewnątrz metody, użyj klienta Supabase, aby zaktualizować profil użytkownika w tabeli `profiles`.
    -   Obsłuż potencjalne błędy z bazy danych i zwróć zaktualizowany profil.

3.  **Implementacja punktu końcowego API**:
    -   Utwórz nowy plik `src/pages/api/profiles.ts`.
    -   Zaimplementuj handler `PATCH` dla tego endpointa (`export async function PATCH({ request, locals }: APIContext)`).
    -   Ustaw `export const prerender = false;`.
    -   Pobierz użytkownika z `locals.user`. Jeśli nie istnieje, zwróć `401`.
    -   Sparsuj i zwaliduj ciało żądania za pomocą `updateProfileSchema`.
    -   Wywołaj metodę `ProfileService.updateProfile`.
    -   Zwróć odpowiedź `200 OK` z zaktualizowanymi danymi profilu lub odpowiedni kod błędu w przypadku niepowodzenia.
    -   Użyj globalnego `errorHandler` do obsługi nieprzechwyconych wyjątków.
