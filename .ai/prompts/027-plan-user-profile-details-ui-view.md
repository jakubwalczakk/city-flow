Jako starszy programista frontendu Twoim zadaniem jest stworzenie szczegółowego planu wdrożenia nowego widoku w aplikacji internetowej. Plan ten powinien być kompleksowy i wystarczająco jasny dla innego programisty frontendowego, aby mógł poprawnie i wydajnie wdrożyć widok.

Najpierw przejrzyj następujące informacje:

1. Product Requirements Document (PRD):
   <prd>
   @prd.md
   </prd>

2. Opis widoku:
   <view_description>

### 7. Widok Profilu

- **Ścieżka widoku:** `/profile`
- **Główny cel:** Umożliwienie użytkownikowi zarządzania preferencjami, danymi konta i sprawdzania limitu generacji.
- **Kluczowe informacje do wyświetlenia:** Formularz edycji preferencji, wskaźnik pozostałych generacji, formularz zmiany hasła.
- **Kluczowe komponenty widoku:** `Form`, `RadioGroup`, `ToggleGroup`, `Progress`, `Input`, `Button`.
- **UX, dostępność i względy bezpieczeństwa:** Zmiany są zapisywane dopiero po kliknięciu przycisku "Zapisz". Informacje są logicznie pogrupowane w sekcje.
  </view_description>

3. User Stories:
   <user_stories>

### 5.2. Profil użytkownika

- ID: US-010
- Tytuł: Edycja profilu i preferencji
- Opis: Jako użytkownik, chcę móc w dowolnym momencie przejść do strony mojego profilu, aby zaktualizować moje preferencje (tempo i tagi).
- Kryteria akceptacji:
  1.  W nawigacji aplikacji dostępna jest zakładka "Profil".
  2.  Na stronie profilu użytkownik widzi swoje aktualnie zapisane "Tempo zwiedzania" i "Tagi preferencji".
  3.  Użytkownik może zmienić te ustawienia i zapisać zmiany.
  4.  Nowe plany generowane po zapisaniu zmian będą uwzględniać zaktualizowane preferencje.

- ID: US-011
- Tytuł: Podgląd limitu generacji
- Opis: Jako użytkownik, chcę widzieć, ile darmowych generacji planów pozostało mi w tym miesiącu, aby móc zarządzać ich zużyciem.
- Kryteria akceptacji: 1. Licznik (np. "Pozostało planów: 3/5") jest widoczny w interfejsie (np. na stronie profilu lub w panelu głównym). 2. Licznik zmniejsza się o 1 po każdej pomyślnej _nowej_ generacji planu. 3. Licznik resetuje się do 5 na początku każdego miesiąca kalendarzowego.
  </user_stories>

4. Endpoint Description:
   <endpoint_description>

### 2.1. Profiles

The profile is a singleton resource for the currently authenticated user. The user is identified via the JWT token.

#### Get Profile

- **Method**: `GET`
- **URL**: `/profiles`
- **Description**: Retrieves the profile of the currently authenticated user.
- **Request Body**: None
- **Success Response**:
  - **Code**: `200 OK`
  - **Content**:
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
- **Error Response**:
  - **Code**: `404 Not Found`
  - **Content**: `{ "error": "Profile not found." }` (For new users who haven't completed onboarding)

#### Update Profile

- **Method**: `PATCH`
- **URL**: `/profiles`
- **Description**: Updates the profile of the currently authenticated user. Also used for the initial onboarding setup.
- **Request Body**:
  ```json
  {
    "preferences": ["Art & Museums", "Local Food", "Nightlife"],
    "travel_pace": "intensive",
    "onboarding_completed": true
  }
  ```
- **Success Response**:
  - **Code**: `200 OK`
  - **Content**: The updated profile object (same structure as `GET /profiles`).
- **Error Response**:
  - **Code**: `400 Bad Request`
  - **Content**: `{ "error": "Validation failed.", "details": { "preferences": "Must have between 2 and 5 items." } }`

</endpoint_description>

5. Endpoint Implementation:
   <endpoint_implementation>
   @profile.service.ts
   </endpoint_implementation>

6. Type Definitions:
   <type_definitions>
   @types.ts
   </type_definitions>

7. Tech Stack:
   <tech_stack>
   @tech-stack.md
   </tech_stack>

Przed utworzeniem ostatecznego planu wdrożenia przeprowadź analizę i planowanie wewnątrz tagów <implementation_breakdown> w swoim bloku myślenia. Ta sekcja może być dość długa, ponieważ ważne jest, aby być dokładnym.

W swoim podziale implementacji wykonaj następujące kroki:

1. Dla każdej sekcji wejściowej (PRD, User Stories, Endpoint Description, Endpoint Implementation, Type Definitions, Tech Stack):

- Podsumuj kluczowe punkty
- Wymień wszelkie wymagania lub ograniczenia
- Zwróć uwagę na wszelkie potencjalne wyzwania lub ważne kwestie

2. Wyodrębnienie i wypisanie kluczowych wymagań z PRD
3. Wypisanie wszystkich potrzebnych głównych komponentów, wraz z krótkim opisem ich opisu, potrzebnych typów, obsługiwanych zdarzeń i warunków walidacji
4. Stworzenie wysokopoziomowego diagramu drzewa komponentów
5. Zidentyfikuj wymagane DTO i niestandardowe typy ViewModel dla każdego komponentu widoku. Szczegółowo wyjaśnij te nowe typy, dzieląc ich pola i powiązane typy.
6. Zidentyfikuj potencjalne zmienne stanu i niestandardowe hooki, wyjaśniając ich cel i sposób ich użycia
7. Wymień wymagane wywołania API i odpowiadające im akcje frontendowe
8. Zmapuj każdej historii użytkownika do konkretnych szczegółów implementacji, komponentów lub funkcji
9. Wymień interakcje użytkownika i ich oczekiwane wyniki
10. Wymień warunki wymagane przez API i jak je weryfikować na poziomie komponentów
11. Zidentyfikuj potencjalne scenariusze błędów i zasugeruj, jak sobie z nimi poradzić
12. Wymień potencjalne wyzwania związane z wdrożeniem tego widoku i zasugeruj możliwe rozwiązania

Po przeprowadzeniu analizy dostarcz plan wdrożenia w formacie Markdown z następującymi sekcjami:

1. Przegląd: Krótkie podsumowanie widoku i jego celu.
2. Routing widoku: Określenie ścieżki, na której widok powinien być dostępny.
3. Struktura komponentów: Zarys głównych komponentów i ich hierarchii.
4. Szczegóły komponentu: Dla każdego komponentu należy opisać:

- Opis komponentu, jego przeznaczenie i z czego się składa
- Główne elementy HTML i komponenty dzieci, które budują komponent
- Obsługiwane zdarzenia
- Warunki walidacji (szczegółowe warunki, zgodnie z API)
- Typy (DTO i ViewModel) wymagane przez komponent
- Propsy, które komponent przyjmuje od rodzica (interfejs komponentu)

5. Typy: Szczegółowy opis typów wymaganych do implementacji widoku, w tym dokładny podział wszelkich nowych typów lub modeli widoku według pól i typów.
6. Zarządzanie stanem: Szczegółowy opis sposobu zarządzania stanem w widoku, określenie, czy wymagany jest customowy hook.
7. Integracja API: Wyjaśnienie sposobu integracji z dostarczonym punktem końcowym. Precyzyjnie wskazuje typy żądania i odpowiedzi.
8. Interakcje użytkownika: Szczegółowy opis interakcji użytkownika i sposobu ich obsługi.
9. Warunki i walidacja: Opisz jakie warunki są weryfikowane przez interfejs, których komponentów dotyczą i jak wpływają one na stan interfejsu
10. Obsługa błędów: Opis sposobu obsługi potencjalnych błędów lub przypadków brzegowych.
11. Kroki implementacji: Przewodnik krok po kroku dotyczący implementacji widoku.

Upewnij się, że Twój plan jest zgodny z PRD, historyjkami użytkownika i uwzględnia dostarczony stack technologiczny.

Ostateczne wyniki powinny być w języku polskim i zapisane w pliku o nazwie .ai/{view-name}-view-implementation-plan.md. Nie uwzględniaj żadnej analizy i planowania w końcowym wyniku.

Oto przykład tego, jak powinien wyglądać plik wyjściowy (treść jest do zastąpienia):

```markdown
# Plan implementacji widoku [Nazwa widoku]

## 1. Przegląd

[Krótki opis widoku i jego celu]

## 2. Routing widoku

[Ścieżka, na której widok powinien być dostępny]

## 3. Struktura komponentów

[Zarys głównych komponentów i ich hierarchii]

## 4. Szczegóły komponentów

### [Nazwa komponentu 1]

- Opis komponentu [opis]
- Główne elementy: [opis]
- Obsługiwane interakcje: [lista]
- Obsługiwana walidacja: [lista, szczegółowa]
- Typy: [lista]
- Propsy: [lista]

### [Nazwa komponentu 2]

[...]

## 5. Typy

[Szczegółowy opis wymaganych typów]

## 6. Zarządzanie stanem

[Opis zarządzania stanem w widoku]

## 7. Integracja API

[Wyjaśnienie integracji z dostarczonym endpointem, wskazanie typów żądania i odpowiedzi]

## 8. Interakcje użytkownika

[Szczegółowy opis interakcji użytkownika]

## 9. Warunki i walidacja

[Szczegółowy opis warunków i ich walidacji]

## 10. Obsługa błędów

[Opis obsługi potencjalnych błędów]

## 11. Kroki implementacji

1. [Krok 1]
2. [Krok 2]
3. [...]
```

Rozpocznij analizę i planowanie już teraz. Twój ostateczny wynik powinien składać się wyłącznie z planu wdrożenia w języku polskim w formacie markdown, który zapiszesz w pliku .ai/{view-name}-view-implementation-plan.md i nie powinien powielać ani powtarzać żadnej pracy wykonanej w podziale implementacji.
