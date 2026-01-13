# Dokument wymagań produktu (PRD) - CityFlow

## 1. Przegląd produktu

CityFlow to oparta na sztucznej inteligencji aplikacja internetowa (MVP), zaprojektowana w celu uproszczenia procesu planowania krótkich wyjazdów turystycznych (city-breaków). Aplikacja przekształca luźne notatki użytkowników, cele podróży i zdefiniowane preferencje w szczegółowe, zoptymalizowane plany wycieczek. Główną wartością dla użytkownika jest możliwość szybkiego wygenerowania spójnego planu zwiedzania, uwzględniającego logistykę, czas i osobiste zainteresowania, a następnie wyeksportowania go do formatu PDF.

## 2. Problem użytkownika

Obecnie planowanie nawet krótkiego wyjazdu typu city-break jest procesem złożonym, czasochłonnym i fragmentarycznym. Użytkownicy muszą samodzielnie wyszukiwać informacje i łączyć wiele elementów: atrakcje, logistykę transportu, rezerwacje, opcje gastronomiczne oraz optymalne trasy. Brakuje narzędzia, które potrafiłoby inteligentnie zintegrować te elementy w jeden, spójny i wykonalny plan, bazując na prostych wytycznych i osobistych preferencjach podróżnika.

## 3. Wymagania funkcjonalne

### 3.1. System kont i profil użytkownika

- Uwierzytelnianie: Rejestracja i logowanie użytkowników za pomocą adresu e-mail i hasła.
- Logowanie społeczniościowe: Uwierzytelnianie za pośrednictwem Google OAuth (przy użyciu BaaS, np. Supabase).
- Profil użytkownika: Każdy użytkownik posiada profil przechowujący:
  - Preferencje turystyczne (lista 5-6 tagów do wyboru, np. "Sztuka i Muzea", "Lokalne Jedzenie", "Aktywny Wypoczynek").
  - Tempo zwiedzania (wybór z predefiniowanej listy: "Wolne", "Umiarkowane", "Intensywne").
  - Licznik pozostałych darmowych generacji planów.
- Onboarding: Po pierwszej rejestracji użytkownik jest przeprowadzany przez proces "soft-required" konfiguracji profilu (wybór preferencji i tempa).

### 3.2. Zarządzanie planami (CRUD)

- Tworzenie: Użytkownicy mogą tworzyć nowe "notatki" (które są podstawą do generowania planów).
- Format notatki: Notatka musi zawierać:
  - Miejsce docelowe.
  - Przybliżone daty (np. "Weekend w listopadzie", "4 dni w czerwcu").
  - Pole na luźne notatki tekstowe (np. "chcę zobaczyć Koloseum i zjeść dobrą pizzę").
  - Funkcja "+ Dodaj stały punkt" (Miejsce, Data, Godzina), która określa must-have w planie (np. rezerwacje).
- Odczyt: Panel użytkownika wyświetlający listę wszystkich zapisanych planów (roboczych i wygenerowanych).
- Aktualizacja: Użytkownik może zmieniać nazwy wygenerowanych planów.
- Usuwanie: Użytkownik może trwale usuwać swoje plany.

### 3.3. Logika generowania planu (AI Core)

- Silnik AI: Główna funkcja konwertująca dane wejściowe (notatki, stałe punkty, preferencje, daty) na godzinowy plan podróży.
- Hierarchia priorytetów AI: 1. Stałe punkty planu (nienaruszalne) > 2. Informacje z notatki > 3. Ogólne preferencje z profilu.
- Jakość danych: AI nie integruje się z zewnętrznymi API (np. Google Places).
  - Ceny są szacunkowe (np. "Wstęp: ok. 15 EUR").
  - Sugestie (np. restauracje) dotyczą obszarów/dzielnic (np. "Lunch na Zatybrzu"), a nie konkretnych lokali.
- Transparentność: Interfejs i wygenerowany PDF muszą zawierać wyraźną informację, że plan jest sugestią AI, a szczegóły (godziny otwarcia, ceny, rezerwacje) muszą zostać zweryfikowane przez użytkownika.
- Wydajność: Czas generowania 90% planów (P90) musi wynosić poniżej 20 sekund. W trakcie generowania wyświetlana jest animacja ładowania.

### 3.4. Obsługa przypadków brzegowych AI

- Plany nierealistyczne: Jeśli żądanie użytkownika jest niemożliwe do wykonania (np. zbyt wiele atrakcji w krótkim czasie), AI w pierwszej kolejności próbuje zmieścić punkty obowiązkowe ("stałe punkty"). Jeśli to niemożliwe, usuwa punkt najbardziej kolidujący (czasowo lub geograficznie) i informuje o tym użytkownika w wygenerowanym planie (np. "Usunięto Muzeum X, aby plan był realistyczny/możliwy do zrealizowania").
- Obsługa błędów API: W przypadku błędu technicznego po stronie usługi AI, użytkownik widzi jasny komunikat o błędzie, a jego limit darmowych generacji nie zostaje zmniejszony.

### 3.5. Edycja planu i interakcje

- Elastyczna edycja: Użytkownik może dodawać, edytować i usuwać pojedyncze punkty (np. sugerowane atrakcje) z wygenerowanego planu, aby dostosować go do swoich potrzeb.

### 3.6. Limity i monetyzacja (MVP)

- Limity: Każdy zarejestrowany użytkownik otrzymuje 5 darmowych generacji planów miesięcznie.
- Zużycie: Limit jest zużywany przy każdej _nowej_ generacji planu. Edycja istniejącego planu (dodawanie, edytowanie, usuwanie aktywności) nie zużywa limitu.
- Licznik: Interfejs wyraźnie pokazuje użytkownikowi liczbę pozostałych generacji.

### 3.7. Eksport i historia

- Eksport do PDF: Kluczowa funkcja pozwalająca użytkownikowi pobrać wygenerowany plan jako plik PDF.
- Zawartość PDF: PDF zawiera wyłącznie tekst: harmonogram godzinowy, listę miejsc, szacunkowe ceny i notatki. Nie zawiera zdjęć ani map.
- Historia wycieczek: Oddzielna sekcja "Historia" przechowująca plany odbytych wycieczek.
- Archiwizacja: Plany mogą być przenoszone do historii ręcznie (przycisk "Przenieś do historii") lub automatycznie po upłynięciu daty końcowej planu.
- Tryb "Read-only": Plany w historii są dostępne tylko do odczytu i nie można ich edytować.

### 3.8. Zbieranie informacji zwrotnych

- Ocena planu: Pod każdym wygenerowanym planem znajduje się moduł oceny (kciuk w górę / kciuk w dół) oraz opcjonalne pole tekstowe "Co można poprawić?". Dane są zapisywane w bazie.

### 3.9. Platforma i technologia

- Platforma: Aplikacja internetowa.
- Responsywność (RWD): Aplikacja musi być w pełni responsywna i użyteczna na urządzeniach mobilnych (smartfonach, tabletach).
- Technologia: Backend oparty o rozwiązanie BaaS (np. Supabase) do obsługi bazy danych i uwierzytelniania.

## 4. Granice produktu

Następujące funkcje są celowo wyłączone z zakresu MVP, aby umożliwić szybką walidację kluczowej propozycji wartości:

- Brak aplikacji mobilnych (natywnych). Dostęp mobilny jest realizowany wyłącznie przez responsywną aplikację webową.
- Brak integracji z zewnętrznymi serwisami rezerwacyjnymi (loty, hotele, bilety).
- Brak zaawansowanych funkcji społecznościowych (komentowanie planów innych użytkowników, publiczne udostępnianie, systemy ocen).
- Brak współdzielenia planów między różnymi kontami użytkowników.
- Brak obsługi multimediów (użytkownicy nie mogą przesyłać zdjęć inspiracji, a plany nie zawierają zdjęć miejsc).

## 5. Historyjki użytkowników

### 5.1. Uwierzytelnianie i Onboarding

- ID: US-001
- Tytuł: Rejestracja konta przez e-mail
- Opis: Jako nowy użytkownik, chcę móc zarejestrować się w aplikacji przy użyciu mojego adresu e-mail i hasła, aby utworzyć konto.
- Kryteria akceptacji:
  1.  Użytkownik może wprowadzić e-mail i hasło (z potwierdzeniem) w formularzu rejestracji.
  2.  Po pomyślnej rejestracji użytkownik jest automatycznie zalogowany i przekierowany do onboardingu.
  3.  Wprowadzenie niepoprawnego formatu e-maila lub niespełniającego wymagań hasła skutkuje wyświetleniem komunikatu o błędzie.
  4.  System zapobiega rejestracji na już istniejący adres e-mail.

- ID: US-002
- Tytuł: Logowanie przez e-mail
- Opis: Jako powracający użytkownik, chcę móc zalogować się na swoje konto przy użyciu e-maila i hasła.
- Kryteria akceptacji:
  1.  Użytkownik może wprowadzić e-mail i hasło w formularzu logowania.
  2.  Podanie poprawnych danych loguje użytkownika i przekierowuje go do panelu głównego.
  3.  Podanie niepoprawnych danych skutkuje wyświetleniem błędu "Nieprawidłowy e-mail lub hasło".

- ID: US-003
- Tytuł: Logowanie przez Google (OAuth)
- Opis: Jako nowy lub powracający użytkownik, chcę móc zarejestrować się / zalogować jednym kliknięciem używając mojego konta Google, aby przyspieszyć proces.
- Kryteria akceptacji:
  1.  Na stronie logowania/rejestracji dostępny jest przycisk "Zaloguj się przez Google".
  2.  Kliknięcie przycisku inicjuje proces Google OAuth.
  3.  Po pomyślnym uwierzytelnieniu przez Google, użytkownik jest zalogowany w aplikacji CityFlow.
  4.  Jeśli jest to pierwsze logowanie tym kontem Google, w bazie danych tworzone jest nowe konto użytkownika.

- ID: US-004
- Tytuł: Wylogowanie
- Opis: Jako zalogowany użytkownik, chcę móc się wylogować, aby zabezpieczyć swoje konto na urządzeniu publicznym.
- Kryteria akceptacji:
  1.  W interfejsie (np. w menu profilowym) dostępny jest przycisk "Wyloguj".
  2.  Kliknięcie przycisku kończy sesję użytkownika i przekierowuje go na stronę główną (lub logowania).

- ID: US-005
- Tytuł: Onboarding - Ustawienie preferencji
- Opis: Jako nowy użytkownik, tuż po rejestracji chcę zostać poproszony o ustawienie moich podstawowych preferencji podróżniczych, aby AI mogło tworzyć lepsze plany.
- Kryteria akceptacji:
  1.  Po pierwszej rejestracji użytkownik widzi ekran onboardingu.
  2.  Ekran informuje o limicie 5 darmowych planów.
  3.  Ekran prosi o wybranie "Tempa zwiedzania" (np. Wolne, Umiarkowane, Intensywne).
  4.  Ekran prosi o wybranie 2-5 tagów preferencji (np. "Sztuka", "Jedzenie", "Natura").
  5.  Użytkownik może zapisać preferencje (i jest to "miękko-wymagane", tzn. mocno sugerowane, ale możliwe do pominięcia).

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
- Kryteria akceptacji:
  1.  Licznik (np. "Pozostało planów: 3/5") jest widoczny w interfejsie (np. na stronie profilu lub w panelu głównym).
  2.  Licznik zmniejsza się o 1 po każdej pomyślnej _nowej_ generacji planu.
  3.  Licznik resetuje się do 5 na początku każdego miesiąca kalendarzowego.

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
- Kryteria akceptacji:
  1.  Jeśli API AI zwróci błąd 5xx lub przekroczy limit czasu, użytkownik widzi komunikat (np. "Wystąpił błąd podczas generowania planu. Spróbuj ponownie za chwilę.").
  2.  Licznik darmowych generacji użytkownika nie ulega zmianie.

- ID: US-037
- Tytuł: Wyświetlanie kategorii dla punktów planu
- Opis: Jako użytkownik, przeglądając wygenerowany plan, chcę widzieć kategorie dla każdego punktu (np. "jedzenie", "kultura"), aby szybko zorientować się w charakterze zaplanowanych aktywności.
- Kryteria akceptacji:
  1. Każdy element w wygenerowanym planie posiada przypisaną kategorię.
  2. Obok tytułu każdego punktu w planie wyświetlana jest ikona reprezentująca jego kategorię.
  3. Kategorie są spójne z moimi preferencjami (np. jeśli wybrałem "Sztuka", plan powinien zawierać punkty z kategorią "kultura").

### 5.5. Edycja planu

- ID: US-040
- Tytuł: Usuwanie punktu z planu
- Opis: Jako użytkownik, chcę móc usunąć pojedynczy punkt (np. sugerowaną restaurację lub muzeum) z wygenerowanego harmonogramu dnia.
- Kryteria akceptacji:
  1.  Każdy element na liście harmonogramu ma widoczną opcję "Usuń" (np. ikonę kosza).
  2.  Usunięcie wymaga potwierdzenia w oknie modalnym (np. "Czy na pewno chcesz usunąć ten punkt z planu?").
  3.  Po kliknięciu "Usuń", dany punkt znika z harmonogramu dnia.
  4.  Plan jest automatycznie zapisywany po usunięciu punktu.

- ID: US-041
- Tytuł: Dodawanie własnej aktywności do planu
- Opis: Jako użytkownik, chcę móc dodać własną aktywność do wygenerowanego planu, aby uwzględnić rzeczy, których AI nie zasugerowało.
- Kryteria akceptacji:
  1.  W każdym dniu dostępny jest przycisk "Dodaj aktywność".
  2.  Po kliknięciu otwiera się formularz z polami: tytuł, opis, lokalizacja, godzina rozpoczęcia, czas trwania, kategoria.
  3.  Po zapisaniu, nowa aktywność pojawia się w harmonogramie dnia w odpowiednim miejscu (posortowana chronologicznie).
  4.  Plan jest automatycznie zapisywany po dodaniu aktywności.

- ID: US-042
- Tytuł: Edycja istniejącej aktywności w planie
- Opis: Jako użytkownik, chcę móc edytować szczegóły aktywności w planie (zarówno wygenerowanej przez AI, jak i dodanej przeze mnie), aby dostosować plan do moich potrzeb.
- Kryteria akceptacji:
  1.  Każdy element na liście harmonogramu ma widoczną opcję "Edytuj" (np. ikonę ołówka).
  2.  Po kliknięciu otwiera się formularz z aktualnymi danymi aktywności.
  3.  Użytkownik może zmienić dowolne pola: tytuł, opis, lokalizację, godzinę, czas trwania, kategorię.
  4.  Po zapisaniu zmian, zaktualizowana aktywność jest widoczna w harmonogramie.

5.  Plan jest automatycznie zapisywany po edycji aktywności.

### 5.6. Eksport i Historia

- ID: US-050
- Tytuł: Eksport planu do PDF
- Opis: Jako użytkownik, chcę móc wyeksportować mój finalny plan do pliku PDF, aby mieć do niego dostęp offline na telefonie lub móc go wydrukować.
- Kryteria akceptacji:
  1.  W widoku wygenerowanego planu dostępny jest przycisk "Eksportuj do PDF".
  2.  Po kliknięciu generowany jest plik PDF i rozpoczyna się jego pobieranie.
  3.  PDF zawiera: nazwę planu, daty, harmonogram godzinowy, nazwy miejsc, szacunkowe ceny i notatki.
  4.  PDF zawiera również ostrzeżenie o konieczności weryfikacji danych.
  5.  PDF nie zawiera zdjęć.

- ID: US-051
- Tytuł: Ręczne przenoszenie planu do historii
- Opis: Jako użytkownik, po powrocie z wycieczki chcę móc ręcznie przenieść plan do "Historii", aby zarchiwizować go jako wspomnienie.
- Kryteria akceptacji:
  1.  W widoku planu dostępny jest przycisk "Przenieś do historii".
  2.  Po kliknięciu plan znika z listy "Moje Plany" i pojawia się na liście "Historia".
  3.  Plan w historii staje się "read-only" (nie można go edytować).

- ID: US-052
- Tytuł: Automatyczne przenoszenie planu do historii
- Opis: Jako użytkownik, oczekuję, że plany, których data końcowa minęła, zostaną automatycznie przeniesione do "Historii".
- Kryteria akceptacji:
  1.  System codziennie sprawdza daty końcowe planów.
  2.  Jeśli data końcowa planu jest starsza niż bieżąca data (np. minął 1 dzień po), plan jest automatycznie przenoszony do sekcji "Historia".
  3.  Plan w historii staje się "read-only".

- ID: US-053
- Tytuł: Przeglądanie historii
- Opis: Jako użytkownik, chcę móc wejść do sekcji "Historia" i przeglądać moje stare plany wycieczek.
- Kryteria akceptacji:
  1.  W nawigacji aplikacji dostępna jest zakładka "Historia".
  2.  Sekcja ta wyświetla listę zarchiwizowanych planów.
  3.  Użytkownik może otworzyć dowolny plan z historii, aby go przeczytać (ale nie może go edytować ani ponownie wyeksportować).

### 5.7. Limity i Feedback

- ID: US-060
- Tytuł: Blokada generowania po wyczerpaniu limitu
- Opis: Jako użytkownik, który wykorzystał 5 darmowych generacji, przy próbie wygenerowania kolejnego planu chcę zobaczyć informację o osiągnięciu limitu.
- Kryteria akceptacji:
  1.  Gdy licznik generacji wynosi 0, przycisk "Generuj plan" jest nieaktywny lub jego kliknięcie wyświetla modal.
  2.  Modal informuje: "Wykorzystałeś swój miesięczny limit 5 darmowych planów. Limit odnowi się pierwszego dnia przyszłego miesiąca."

- ID: US-061
- Tytuł: Ocenianie planu (Kciuki)
- Opis: Jako użytkownik, chcę móc szybko ocenić każdy wygenerowany plan (pozytywnie lub negatywnie), aby dać znać twórcom, czy jestem zadowolony z wyniku AI.
- Kryteria akceptacji:
  1.  Pod każdym wygenerowanym planem widoczne są dwie ikony: "kciuk w górę" i "kciuk w dół".
  2.  Użytkownik może kliknąć jedną z ikon.
  3.  Wybór użytkownika jest zapisywany w bazie danych powiązany z danym planem i jego parametrami generowania.

- ID: US-062
- Tytuł: Przesyłanie pisemnego feedbacku do planu
- Opis: Jako użytkownik, który ocenił plan (szczególnie negatywnie), chcę mieć możliwość dodania krótkiego komentarza, dlaczego plan był zły.
- Kryteria akceptacji:
  1.  Obok modułu oceny (kciuków) znajduje się opcjonalne pole tekstowe "Co można poprawić?".
  2.  Użytkownik może wpisać tekst i go przesłać.
  3.  Komentarz jest zapisywany w bazie danych wraz z oceną (kciukiem).

### 5.8. Platforma (RWD)

- ID: US-070
- Tytuł: Używanie aplikacji na telefonie komórkowym
- Opis: Jako użytkownik, chcę móc wygodnie korzystać z aplikacji CityFlow (przeglądać plany, generować nowe) na przeglądarce w moim telefonie.
- Kryteria akceptacji:
  1.  Wszystkie funkcje aplikacji (logowanie, edycja profilu, tworzenie notatek, przeglądanie planów) są dostępne i łatwe w obsłudze na ekranie mobilnym (np. 375px szerokości).
  2.  Nawigacja dostosowuje się do mobilnego widoku (np. menu hamburgerowe).
  3.  Formularze i przyciski są odpowiedniej wielkości, aby można je było łatwo obsługiwać dotykiem.
  4.  Czytelność tekstu jest zachowana.

## 6. Metryki sukcesu

### 6.1. Główne cele biznesowe (Mierniki wynikowe)

- Aktywacja preferencji: 80% zarejestrowanych użytkowników posiada wypełnione preferencje turystyczne (tempo i tagi) w swoim profilu.
- Retencja/Zaangażowanie: 75% aktywnych użytkowników generuje 2 lub więcej unikalnych planów wycieczek w ciągu roku.

### 6.2. Kluczowe wskaźniki walidacji MVP (Mierniki wyprzedzające - Miesiąc 1)

- Wskaźnik aktywacji użytkownika: Co najmniej 25% nowo zarejestrowanych użytkowników wygenerowało co najmniej 1 plan.
- Wskaźnik dostarczenia wartości: Co najmniej 25% wszystkich wygenerowanych planów zostało wyeksportowanych do formatu PDF (co sygnalizuje, że użytkownik uznał plan za wystarczająco wartościowy, by go "zabrać ze sobą").

### 6.3. Mierniki jakościowe

- Stosunek ocen planów: Monitorowanie ogólnego stosunku ocen "kciuk w górę" do "kciuk w dół" dla generowanych planów.
