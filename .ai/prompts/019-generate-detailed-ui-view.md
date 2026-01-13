Jako starszy programista frontendu Twoim zadaniem jest stworzenie szczegółowego planu wdrożenia nowego widoku w aplikacji internetowej. Plan ten powinien być kompleksowy i wystarczająco jasny dla innego programisty frontendowego, aby mógł poprawnie i wydajnie wdrożyć widok.

Najpierw przejrzyj następujące informacje:

1. Product Requirements Document (PRD):
   <prd>
   @prd.md
   </prd>

2. Opis widoku:
   <view_description>

### 3. Widok "Moje Plany" (Dashboard)

- **Ścieżka widoku:** `/plans` (domyślny widok po zalogowaniu)
- **Główny cel:** Wyświetlenie listy wszystkich aktywnych planów użytkownika (szkiców i wygenerowanych) oraz umożliwienie tworzenia nowych.
- **Kluczowe informacje do wyświetlenia:** Lista planów w formie kart, przycisk do tworzenia nowego planu. W przypadku braku planów, wyświetlany jest stan pusty.
- **Kluczowe komponenty widoku:** `Tabs` ("Moje Plany", "Historia"), `PlanCard`, `EmptyState`, `Button`.
- **UX, dostępność i względy bezpieczeństwa:** Każda karta planu ma jasny status ("Szkic", "Wygenerowany") i odpowiednie wezwanie do działania (CTA). Widok jest w pełni responsywny.
  </view_description>

3. User Stories:
   <user_stories>

### 5.3. Tworzenie i zarządzanie planami

- ID: US-020
- Tytuł: Tworzenie nowej notatki do planu
- Opis: Jako użytkownik, chcę móc utworzyć nową notatkę, podając kluczowe informacje (miejsce, datę, luźne notatki), aby przygotować się do generowania planu.
- Kryteria akceptacji:
  1.  W panelu głównym dostępny jest przycisk "Utwórz nowy plan" (lub analogiczny).
  2.  Użytkownik widzi formularz wymagający podania:
      - Miejsca (miasto/region).
      - Przybliżonych dat (np. "Weekend 10-12 listopada", "Czerwiec 2026, 4 dni").
      - Pola tekstowego na luźne notatki.
  3.  Pola miejsca i daty (wystarczy poadnie miesiąca) są wymagane do rozpoczęcia generowania.

- ID: US-021
- Tytuł: Dodawanie "stałego punktu" do notatki
- Opis: Jako użytkownik, podczas tworzenia notatki chcę mieć możliwość dodania "stałego punktu" (np. rezerwacji biletu), podając miejsce, datę i godzinę, aby AI uwzględniło to jako priorytet.
- Kryteria akceptacji:
  1.  W formularzu notatki dostępny jest przycisk "+ Dodaj stały punkt".
  2.  Po kliknięciu pojawiają się pola: "Miejsce/Atrakcja", "Data", "Godzina".
  3.  Użytkownik może dodać wiele takich punktów.
  4.  Dodane punkty są widoczne podczas edycji notatki.

- ID: US-022
- Tytuł: Przeglądanie listy planów
- Opis: Jako użytkownik, chcę widzieć listę wszystkich moich zapisanych planów (roboczych i wygenerowanych) w jednym miejscu.
- Kryteria akceptacji:
  1.  Panel główny aplikacji wyświetla listę planów użytkownika.
  2.  Każdy element listy pokazuje nazwę planu (np. "Rzym 10-12.05"), daty i status (np. "Roboczy", "Wygenerowany").
  3.  Kliknięcie na plan przenosi do jego widoku szczegółowego.

- ID: US-023
- Tytuł: Zmiana nazwy planu
- Opis: Jako użytkownik, chcę mieć możliwość zmiany domyślnej nazwy planu (np. "Rzym 10-12.05") na własną (np. "Romantyczny weekend z Anią").
- Kryteria akceptacji:
  1.  W widoku szczegółowym planu jego nazwa jest edytowalna (np. po kliknięciu ikony ołówka).
  2.  Użytkownik może wprowadzić nową nazwę i ją zapisać.
  3.  Nowa nazwa jest widoczna na liście planów i w widoku szczegółowym.

- ID: US-024
- Tytuł: Usuwanie planu
- Opis: Jako użytkownik, chcę móc usunąć plan, którego już nie potrzebuję, aby zachować porządek na liście.
- Kryteria akceptacji:
  1.  Na liście planów lub w widoku szczegółowym dostępna jest opcja "Usuń".
  2.  System prosi o potwierdzenie usunięcia (np. "Czy na pewno chcesz usunąć ten plan?").
  3.  Po potwierdzeniu, plan jest trwale usuwany z bazy danych i znika z listy.

### 5.4. Generowanie planu (AI Core)

- ID: US-030
- Tytuł: Generowanie planu
- Opis: Jako użytkownik, po wypełnieniu notatki (miejsce, data, notatki, stałe punkty), chcę kliknąć "Generuj plan", aby AI stworzyło dla mnie szczegółowy harmonogram.
- Kryteria akceptacji:
  1.  Przycisk "Generuj plan" jest aktywny, gdy wymagane pola (miejsce, przybliżona data) są wypełnione.
  2.  Po kliknięciu przycisku zużywany jest 1 limit generacji (jeśli > 0).
  3.  Wyświetlana jest animacja ładowania z informacją (np. "AI tworzy Twój plan...").
  4.  Czas generowania nie przekracza 20 sekund (dla P90).
  5.  Po zakończeniu użytkownik widzi wygenerowany plan (lista godzinowa, miejsca, sugestie).

- ID: US-031
- Tytuł: Automatyczne zapisywanie wygenerowanego planu
- Opis: Jako użytkownik, chcę aby plan był automatycznie zapisywany zaraz po wygenerowaniu, abym nie stracił wyników pracy AI.
- Kryteria akceptacji:
  1.  Po pomyślnym wygenerowaniu planu przez AI, jest on automatycznie zapisywany w bazie danych.
  2.  Plan otrzymuje domyślną nazwę (np. na podstawie miasta i dat).
  3.  Plan pojawia się na liście planów użytkownika.

- ID: US-032
- Tytuł: Wyświetlanie ostrzeżenia o weryfikacji danych
- Opis: Jako użytkownik, przeglądając wygenerowany plan, chcę widzieć jasny komunikat, że wszystkie dane (godziny, ceny) są szacunkowe i muszę je zweryfikować.
- Kryteria akceptacji:
  1.  W widoku wygenerowanego planu (w UI) widoczny jest stały komunikat (np. "Pamiętaj, że plan to sugestia AI. Sprawdź godziny otwarcia i ceny przed wyjazdem.").
  2.  Podobne ostrzeżenie znajduje się również w eksportowanym pliku PDF.

- ID: US-033
- Tytuł: Generowanie planu z priorytetem dla "stałych punktów"
- Opis: Jako użytkownik, który dodał "stały punkt" (np. "Luwr, 15.05, 11:00"), oczekuję, że AI zbuduje resztę planu dnia wokół tego nienaruszalnego wydarzenia.
- Kryteria akceptacji:
  1.  Wygenerowany plan na dzień 15.05 zawiera wizytę w Luwrze o 11:00.
  2.  Atrakcje i sugestie (np. lunch) przed i po 11:00 są logicznie i geograficznie dopasowane do tej wizyty.
  3.  AI nie może usunąć ani przesunąć tego "stałego punktu".

- ID: US-034
- Tytuł: Generowanie planu na podstawie ogólnych preferencji
- Opis: Jako użytkownik, który wpisał tylko "Rzym, 3 dni" i ma w profilu "Lokalne Jedzenie" i "Sztuka", oczekuję planu, który uwzględni te preferencje.
- Kryteria akceptacji:
  1.  Plan zawiera główne atrakcje (np. Koloseum) jako punkty turystyczne.
  2.  Plan zawiera sugestie związane ze sztuką (np. "Wizyta w Muzeach Watykańskich" lub "Spacer po dzielnicy artystów").
  3.  Plan zawiera sugestie gastronomiczne zgodne z preferencją (np. "Poszukaj lokalnej trattorii na Zatybrzu").

- ID: US-035
- Tytuł: Obsługa nierealistycznego żądania
- Opis: Jako użytkownik, który zażądał zbyt wielu rzeczy (np. 10 atrakcji w 1 dniu), chcę zostać poinformowany, że plan został zmodyfikowany, aby był wykonalny.
- Kryteria akceptacji:
  1.  AI generuje plan, który jest logistycznie możliwy.
  2.  Plan zawiera informację zwrotną (np. "Twój plan był zbyt ambitny. Aby go urealnić, usunięto [Nazwa Atrakcji], ponieważ znajduje się zbyt daleko / brakło na nią czasu.").
  3.  "Stałe punkty" mają zawsze najwyższy priorytet i nie są usuwane (chyba że są wzajemnie sprzeczne).

- ID: US-036
- Tytuł: Obsługa błędu generowania (AI API)
- Opis: Jako użytkownik, w przypadku gdy usługa AI jest niedostępna, chcę zobaczyć zrozumiały komunikat o błędzie, a mój limit planów nie powinien zostać zmniejszony.
- Kryteria akceptacji: 1. Jeśli API AI zwróci błąd 5xx lub przekroczy limit czasu, użytkownik widzi komunikat (np. "Wystąpił błąd podczas generowania planu. Spróbuj ponownie za chwilę."). 2. Licznik darmowych generacji użytkownika nie ulega zmianie.
  </user_stories>

4. Endpoint Description:
   <endpoint_description>

#### List Plans

- **Method**: `GET`
- **URL**: `/plans`
- **Description**: Retrieves a list of all plans for the authenticated user.
- **Query Parameters**:
  - `status` (string, optional): Filter by plan status. Accepts `draft`, `generated`, or `archived`.
  - `sort_by` (string, optional): Field to sort by. e.g., `created_at`.
  - `order` (string, optional): `asc` or `desc`. Default is `desc`.
  - `limit` (int, optional): Number of results per page. Default `20`.
  - `offset` (int, optional): Result offset for pagination. Default `0`.
- **Success Response**:
  - **Code**: `200 OK`
  - **Content**:
    ```json
    {
      "data": [
        {
          "id": "uuid-plan-1",
          "name": "Weekend in Rome",
          "destination": "Rome, Italy",
          "start_date": "2025-11-10",
          "end_date": "2025-11-12",
          "status": "generated",
          "created_at": "2025-10-20T10:00:00Z"
        }
      ],
      "pagination": {
        "total": 1,
        "limit": 20,
        "offset": 0
      }
    }
    ```

#### Create Plan (Draft)

</endpoint_description>

5. Endpoint Implementation:
   <endpoint_implementation>
   @plan.service.ts
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
