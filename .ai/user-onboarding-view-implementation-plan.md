# Plan implementacji widoku User Onboarding

## 1. Przegląd
Widok onboardingu ma na celu zebranie od nowego użytkownika kluczowych preferencji podróżniczych (tempo zwiedzania, zainteresowania) bezpośrednio po pierwszym zalogowaniu. Proces ten jest "miękko-wymagany" (sugerowany, ale pomijalny) i ma kluczowe znaczenie dla personalizacji generowanych planów przez AI.

## 2. Routing widoku
Widok nie posiada dedykowanej ścieżki URL (np. `/onboarding`). Zamiast tego jest realizowany jako **Globalny Modal** wyświetlany w głównym układzie aplikacji (`MainLayout`), który aktywuje się automatycznie, gdy zalogowany użytkownik nie ukończył jeszcze procesu onboardingu (flaga `onboarding_completed: false`).

## 3. Struktura komponentów
Głównym kontenerem jest nowy komponent `OnboardingModal`, który będzie osadzony w `MainLayout.astro`. Wykorzystuje on istniejące komponenty UI oraz selektory.

- `MainLayout` (Astro)
  - `OnboardingModal` (React - Client Component)
    - `Dialog` (Shadcn UI)
      - `DialogContent`
        - `DialogHeader` (Tytuł i Opis)
        - `TravelPaceSelector` (istniejący)
        - `PreferencesSelector` (istniejący)
        - `DialogFooter` (Przyciski akcji)

## 4. Szczegóły komponentów

### `OnboardingModal` (`src/components/auth/OnboardingModal.tsx`)
- **Opis:** Komponent zarządzający stanem modala, formularzem preferencji oraz komunikacją z API. Sprawdza stan profilu i decyduje o wyświetleniu.
- **Główne elementy:**
  - `Dialog`, `DialogContent`, `DialogHeader`, `DialogTitle`, `DialogDescription`, `DialogFooter` z `@/components/ui/dialog`.
  - `Button` z `@/components/ui/button`.
  - `TravelPaceSelector`.
  - `PreferencesSelector`.
- **Obsługiwane interakcje:**
  - Zmiana tempa zwiedzania.
  - Wybór/odznaczenie preferencji (tagów).
  - Kliknięcie "Zapisz i przejdź dalej".
  - Kliknięcie "Pomiń".
- **Obsługiwana walidacja:**
  - Walidacja lokalna przed wysyłką (dla akcji "Zapisz").
- **Typy:** `ProfileDto` (do sprawdzenia stanu), `UpdateProfileCommand` (do wysyłki).
- **Propsy:** Brak (komponent samodzielny, pobiera dane przez hooka).

### `TravelPaceSelector` (istniejący)
- Wykorzystywany bez zmian.
- Props: `value: TravelPace | null`, `onChange: (val) => void`.

### `PreferencesSelector` (istniejący)
- Wykorzystywany bez zmian.
- Props: `value: string[]`, `onChange: (val) => void`, `error?: string`.

## 5. Typy
Wykorzystujemy istniejące typy z `src/types.ts`. Nie ma potrzeby tworzenia nowych definicji globalnych.
- `UpdateProfileCommand`: `{ preferences?: string[], travel_pace?: TravelPace, onboarding_completed?: boolean }`
- `TravelPace`: `"slow" | "moderate" | "intensive"`

## 6. Zarządzanie stanem
Stan jest zarządzany lokalnie w komponencie `OnboardingModal` przy użyciu `useState` oraz hooka `useProfile`.

Zmienne stanu:
- `pace`: `TravelPace | null` (domyślnie `null`).
- `preferences`: `string[]` (domyślnie `[]`).
- `errors`: Obiekt `{ pace?: string, preferences?: string }` do obsługi błędów walidacji.
- `isOpen`: `boolean` (sterowane na podstawie `profile?.onboarding_completed`).

Custom Hook `useProfile` (`src/hooks/useProfile.ts`):
- Służy do pobrania profilu przy montowaniu komponentu (`fetchProfile`).
- Służy do aktualizacji profilu (`updateProfile`).

## 7. Integracja API
Integracja odbywa się przez hook `useProfile`, który komunikuje się z istniejącymi endpointami.

- **Pobranie profilu:** `GET /api/profiles` (automatycznie w `useProfile`).
- **Aktualizacja:** `PATCH /api/profiles`.
  - Payload dla "Zapisz":
    ```json
    {
      "travel_pace": "moderate",
      "preferences": ["art_museums", "local_food"],
      "onboarding_completed": true
    }
    ```
  - Payload dla "Pomiń":
    ```json
    {
      "onboarding_completed": true
    }
    ```

## 8. Interakcje użytkownika
1. **Wejście na stronę:** Jeśli użytkownik jest zalogowany i `onboarding_completed === false`, modal pojawia się automatycznie (po załadowaniu profilu).
2. **Wybór tempa:** Użytkownik klika w opcję w `TravelPaceSelector`. Stan `pace` jest aktualizowany.
3. **Wybór preferencji:** Użytkownik klika w tagi w `PreferencesSelector`. Stan `preferences` jest aktualizowany (max 5).
4. **Zapisz:**
   - Walidacja: Czy wybrano tempo? Czy wybrano 2-5 preferencji?
   - Sukces: Wywołanie API, zamknięcie modala, Toast "Profil zaktualizowany".
   - Błąd walidacji: Wyświetlenie komunikatów pod odpowiednimi polami.
5. **Pomiń:**
   - Brak walidacji.
   - Wywołanie API (tylko flaga ukończenia), zamknięcie modala.

## 9. Warunki i walidacja
- **Warunek wyświetlenia:** `!isLoading && profile && !profile.onboarding_completed`.
- **Walidacja formularza (tylko przy zapisie):**
  - `travel_pace`: Musi być wybrane (nie null).
  - `preferences`: Tablica musi mieć długość od 2 do 5 elementów.

## 10. Obsługa błędów
- **Błąd pobierania profilu:** Modal się nie wyświetli (fail-safe).
- **Błąd zapisu API:** Wyświetlenie komunikatu w komponencie (np. nad przyciskami lub przez Toast) i zachowanie stanu formularza, aby użytkownik mógł spróbować ponownie.
- **Błędy walidacji:** Wyświetlane inline pod komponentami (przekazywane do `PreferencesSelector` jako prop `error`).

## 11. Kroki implementacji

1. **Stworzenie komponentu `OnboardingModal.tsx`:**
   - Utworzenie pliku w `src/components/auth/`.
   - Implementacja struktury z `Dialog`.
   - Podpięcie `useProfile`.
   - Implementacja logiki wyświetlania (`useEffect` monitorujący profil).

2. **Integracja formularza:**
   - Dodanie `TravelPaceSelector` i podpięcie stanu.
   - Dodanie `PreferencesSelector` i podpięcie stanu.
   - Dodanie sekcji informacyjnej o limicie planów (zgodnie z PRD).

3. **Implementacja logiki akcji:**
   - Funkcja `handleSave`: Walidacja -> `updateProfile` -> Zamknięcie.
   - Funkcja `handleSkip`: `updateProfile` -> Zamknięcie.

4. **Integracja z Layoutem:**
   - Dodanie `<OnboardingModal client:idle />` do `src/layouts/MainLayout.astro`.
   - Upewnienie się, że jest renderowany tylko dla zalogowanych użytkowników (`isAuthenticated`).

5. **Testy manualne:**
   - Sprawdzenie dla nowego użytkownika (modal powinien się pojawić).
   - Sprawdzenie walidacji (próba zapisu bez danych).
   - Sprawdzenie zapisu (poprawne dane).
   - Sprawdzenie pominięcia.
   - Weryfikacja, czy modal nie pojawia się ponownie po odświeżeniu strony.

