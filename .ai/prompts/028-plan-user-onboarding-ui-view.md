Jako starszy programista frontendu Twoim zadaniem jest stworzenie szczegółowego planu wdrożenia nowego widoku w aplikacji internetowej. Plan ten powinien być kompleksowy i wystarczająco jasny dla innego programisty frontendowego, aby mógł poprawnie i wydajnie wdrożyć widok.

Najpierw przejrzyj następujące informacje:

1. Product Requirements Document (PRD):
   <prd>
   @prd.md
   </prd>

2. Opis widoku:
   <view_description>

### 2. Widok Onboardingu

- **Ścieżka widoku:** Wyświetlany jako modal po pierwszym zalogowaniu.
- **Główny cel:** Zebranie od nowego użytkownika podstawowych preferencji podróżniczych w celu personalizacji generowanych planów.
- **Kluczowe informacje do wyświetlenia:** Wybór tempa zwiedzania, wybór zainteresowań (tagów), informacja o limicie darmowych generacji.
- **Kluczowe komponenty widoku:** `Dialog` (Modal), `RadioGroup` (dla tempa), `ToggleGroup` lub `Checkbox` (dla zainteresowań), `Button`.
- **UX, dostępność i względy bezpieczeństwa:** Proces jest "miękko-wymagany" z dostępną opcją pominięcia. Wizualne wskazanie wybranych opcji.

## 3. Mapa podróży użytkownika

Główna ścieżka użytkownika (happy path) obejmuje stworzenie i wygenerowanie planu:

1.  **Rejestracja/Logowanie**: Użytkownik trafia na stronę `/login` i loguje się na swoje konto.
2.  **Onboarding**: Jeśli to pierwsze logowanie, pojawia się modal onboardingu, w którym użytkownik ustawia swoje preferencje.
3.  **Dashboard**: Użytkownik ląduje w widoku `Moje Plany` (`/plans`). Widzi pusty stan i klika "Stwórz nowy plan".
    </view_description>

4.  User Stories:
    <user_stories>

### 5.1. Uwierzytelnianie i Onboarding

- ID: US-001
- Tytuł: Rejestracja konta przez e-mail
- Opis: Jako nowy użytkownik, chcę móc zarejestrować się w aplikacji przy użyciu mojego adresu e-mail i hasła, aby utworzyć konto.
- Kryteria akceptacji:
  1.  Użytkownik może wprowadzić e-mail i hasło (z potwierdzeniem) w formularzu rejestracji.
  2.  Po pomyślnej rejestracji użytkownik jest automatycznie zalogowany i przekierowany do onboardingu.
  3.  Wprowadzenie niepoprawnego formatu e-maila lub niespełniającego wymagań hasła skutkuje wyświetleniem komunikatu o błędzie.
  4.  System zapobiega rejestracji na już istniejący adres e-mail.

- ID: US-005
- Tytuł: Onboarding - Ustawienie preferencji
- Opis: Jako nowy użytkownik, tuż po rejestracji chcę zostać poproszony o ustawienie moich podstawowych preferencji podróżniczych, aby AI mogło tworzyć lepsze plany.
- Kryteria akceptacji:
  1.  Po pierwszej rejestracji użytkownik widzi ekran onboardingu.
  2.  Ekran informuje o limicie 5 darmowych planów.
  3.  Ekran prosi o wybranie "Tempa zwiedzania" (np. Wolne, Umiarkowane, Intensywne).
  4.  Ekran prosi o wybranie 2-5 tagów preferencji (np. "Sztuka", "Jedzenie", "Natura").
  5.  Użytkownik może zapisać preferencje (i jest to "miękko-wymagane", tzn. mocno sugerowane, ale możliwe do pominięcia).
      </user_stories>

4. Endpoint Description:
   <endpoint_description>

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
