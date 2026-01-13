Jesteś doświadczonym menedżerem produktu, którego zadaniem jest stworzenie kompleksowego dokumentu wymagań produktu (PRD) w oparciu o poniższe opisy:

<project_description>

# Aplikacja - CityFlow (MVP)

### Główny problem

Planowanie interesujących city-breaków to złożony proces, który wymaga połączenia wielu elementów w spójną całość: lotów, planu zwiedzania, transportu oraz gastronomii.
Dzięki wykorzystaniu potencjału, kreatywności i wiedzy AI, w CityFlow możesz zamieniać uproszczone notatki o miejscach i celach podróży na konkretne plany.

### Najmniejszy zestaw funkcjonalności

- Zapisywanie, odczytywanie, przeglądanie i usuwanie notatek o przyszłych wycieczkach
- Prosty system kont użytkowników do powiązania użytkownika z notatkami
- Strona profilu użytkownika służąca do zapisywania preferencji turystycznych
- Integracja z AI umożliwiająca konwersję notatek w szczegółowe plany, biorące pod uwagę preferencje, czas, liczbę osób oraz potencjalne miejsca i atrakcje
- Historia odbytych wycieczek dla każdego użytkownika

### Co NIE wchodzi w zakres MVP

- Współdzielenie planów wycieczkowych między kontami
- Bogata obsługa i analiza multimediów (np. zdjęć miejsc do odwiedzenia)
- Integracja z zewnętrznymi serwisami rezerwacyjnymi (loty, hotele itp.)
- Zaawansowane funkcje społecznościowe (np. komentarze, oceny planów)
- Aplikacja mobilna (MVP będzie dostępne tylko jako aplikacja webowa)

### Kryteria sukcesu

- 80% użytkowników posiada wypełnione preferencje turystyczne w swoim profilu
- 75% użytkowników generuje 2 lub więcej planów wycieczek na rok
  </project_description>

<project_details>
<conversation_summary> <decisions>

Model AI i Dane: AI będzie generować plany na podstawie notatek, stałych punktów i preferencji. AI nie będzie integrować się z zewnętrznymi API (np. Google Places) w wersji MVP. Wszelkie dane (ceny) są szacunkowe, a sugestie (np. restauracje) będą dotyczyć obszarów/dzielnic, a nie konkretnych miejsc.

Priorytetyzacja AI: Logika AI będzie ściśle przestrzegać hierarchii: 1. Stałe punkty planu (nienaruszalne) > 2. Informacje z notatki > 3. Ogólne preferencje z profilu.

Obsługa Planów Niemożliwych: Jeśli żądanie jest nierealistyczne, AI w pierwszej kolejności spróbuje zmieścić punkty obowiązkowe. Jeśli to niemożliwe, usunie punkt najbardziej kolidujący (czas/geografia) i poinformuje o tym użytkownika, podając kontekst (np. "Usunięto X, aby plan był realistyczny").

Limity MVP: Użytkownicy otrzymają 5 darmowych generacji planów miesięcznie. Każda nowa generacja (ale nie "przebudowanie" istniejącego planu) zużywa jeden limit.

Status Planu: Plan jest sugestią. Aplikacja będzie transparentnie komunikować (w UI i PDF), że użytkownik musi samodzielnie zweryfikować szczegóły (np. godziny otwarcia, ceny).

Edycja Planu: MVP pozwoli na "prostą edycję": usuwanie punktów oraz "przebudowanie dnia" (co optymalizuje trasę dla pozostałych punktów, bez dodawania nowych).

Eksport: Główną korzyścią dla użytkownika jest eksport gotowego planu do PDF. PDF będzie zawierał listę godzinową, miejsca i szacunkowe ceny, bez zdjęć.

Onboarding: Proces będzie obejmował rejestrację (przez Google/BaaS), informację o limitach oraz "soft-required" konfigurację profilu (tempo zwiedzania i 5-6 tagów preferencji, np. Sztuka i Muzea, Lokalne Jedzenie itp.).

Interfejs Notatek: Oprócz pola na luźne notatki, dostępna będzie opcja "+ Dodaj stały punkt" (Miejsce, Data, Godzina). Każdy plan musi mieć przypisane daty oraz miejsce.

Zapisywanie i Historia: Plany będą zapisywane automatycznie po wygenerowaniu (z domyślną nazwą, np. "Rzym 10-12.05"), a użytkownik będzie mógł je dowolnie nazywać. Przeniesienie do "Historii" będzie hybrydowe (manualny przycisk + automatyzacja po dacie zakończenia). Plany w historii są "read-only".

Feedback: Pod każdym planem znajdzie się moduł oceny (kciuk w górę/dół) oraz opcjonalne pole "Co można poprawić?". Dane będą zapisywane w bazie. Po wyczerpaniu limitu 5 planów użytkownik zobaczy prośbę o feedback (ankietę).

Technologia: MVP będzie aplikacją webową. Zostanie wykorzystane rozwiązanie BaaS (np. Supabase) do autentykacji (w tym Google OAuth) i bazy danych. Responsywność (RWD) zostanie wdrożona, jeśli nie zwiększy znacząco złożoności.

</decisions>

<matched_recommendations>

Struktura preferencji: Zdecydowano się na wdrożenie prostej listy 5-6 tagów (Sztuka i Muzea, Lokalne Jedzenie itp.) oraz oddzielnej opcji wyboru "Tempa zwiedzania", co ułatwi AI personalizację.

Priorytetyzacja danych: Przyjęto zalecenie, że dane wejściowe z "Notatki" i "Stałych punktów" zawsze mają wyższy priorytet niż ogólne "Preferencje" z profilu użytkownika.

Obsługa danych AI: Przyjęto kluczowe zalecenie, aby w MVP nie integrować się z zewnętrznymi API (np. Google Places). Zamiast podawać nieaktualne dane, AI będzie sugerować ogólne obszary (np. "szukaj restauracji na Zatybrzu").

Logika "Przebuduj": Zaakceptowano rekomendację, że funkcja "przebuduj dzień" będzie jedynie optymalizować trasę dla pozostałych punktów, bez dodawania nowych, aby zachować prostotę i przewidywalność.

Limity i koszty: Zgodzono się, że "przebudowanie" planu nie będzie zużywać dodatkowego limitu (z 5 darmowych), aby zachęcić do dopracowywania planów.

Transparentność: Zdecydowano się na wdrożenie wyraźnych komunikatów w UI i PDF, informujących, że plan jest sugestią AI, a dane (ceny, godziny) wymagają finalnej weryfikacji przez użytkownika.

Wydajność: Ustalono mierzalny cel wydajnościowy: czas generowania 90% planów (P90) powinien wynosić poniżej 20 sekund, z wyświetlaniem animacji ładowania w trakcie.

Obsługa błędów: Przyjęto zalecenie, że w przypadku błędu technicznego API (niedostępność usługi AI) użytkownik zobaczy jasny komunikat, a jego limit darmowych planów nie zostanie zmniejszony.

Uproszczenie MVP: Zrezygnowano ze zdjęć w PDF oraz z "opcjonalnych szczegółów" podczas onboardingu, aby skupić się na kluczowej funkcjonalności i przyspieszyć wdrożenie.

Feedback: Wdrożone zostaną mechanizmy zbierania feedbacku (kciuki/komentarze pod planem oraz ankieta po wyczerpaniu limitu) w celu walidacji MVP. </matched_recommendations>

<prd_planning_summary>

Podsumowanie dla PRD: CityFlow (MVP)

1. Główne Wymagania Funkcjonalne
   System Kont Użytkowników:

Uwierzytelnianie przez e-mail/hasło oraz Google OAuth (poprzez Supabase).

Prosty profil użytkownika przechowujący:

Preferencje (tagi, np. Sztuka i Muzea, Lokalne Jedzenie, Aktywny Wypoczynek, Miejsca z Instagrama, Spokojne Zwiedzanie).

Tempo zwiedzania (np. Wolne, Umiarkowane, Intensywne).

Licznik pozostałych darmowych generacji (z 5).

Logika Generowania Planu (AI):

Silnik AI konwertuje dane wejściowe na godzinowy plan podróży.

Dane wejściowe: 1. Luźne notatki (tekst), 2. Stałe punkty planu (UI: Miejsce, Data, Godzina), 3. Preferencje i Tempo (z profilu).

Każdy plan musi mieć przypisaną datę.

Wydajność: P90 < 20 sekund.

Limity: 5 darmowych generacji na użytkownika miesięcznie.

Obsługa Przypadków Brzegowych AI:

Plany niemożliwe: AI informuje użytkownika o usunięciu nierealistycznego punktu wraz z podaniem przyczyny (np. brak czasu, odległość).

Plany ogólne: (np. "Rzym, pizza") AI generuje plan "dla początkujących" (np. Koloseum, Fontanna di Trevi) i wplata sugestie (np. "pizza na Zatybrzu").

Jakość danych: AI nie korzysta z zewnętrznych API. Ceny są szacunkowe, sugestie restauracji/hoteli dotyczą dzielnic, nie konkretnych miejsc.

Zarządzanie Planami:

Plany są automatycznie zapisywane po wygenerowaniu (z domyślną nazwą opartą na mieście/datach).

Użytkownik może zmieniać nazwy planów.

Użytkownik może usuwać plany.

Edycja i Interakcja:

Użytkownik może usunąć punkt z planu.

Użytkownik może kliknąć "Przebuduj dzień" (co optymalizuje resztę dnia, nie zużywa limitu).

Eksport i Historia:

Funkcja eksportu planu do PDF (tylko tekst: harmonogram, miejsca, szacunkowe ceny).

Funkcja "Historii odbytych wycieczek". Plany trafiają tam manualnie lub automatycznie po dacie zakończenia.

Plany w historii są "read-only".

Zbieranie Feedbacku:

Moduł "kciuk góra/dół" + pole komentarza pod każdym planem (zapis do bazy).

Po wyczerpaniu limitu 5 planów, użytkownik widzi prośbę o wypełnienie ankiety (np. Google Forms/Tally).

Platforma: Aplikacja webowa. Responsywność (RWD) jest pożądana, jeśli nie skomplikuje znacząco wdrożenia.

2. Kluczowe Historie Użytkownika i Ścieżki Korzystania
   Onboarding i Pierwszy Plan:

Jako nowy użytkownik, chcę zarejestrować się przez Google, aby szybko założyć konto.

Chcę od razu zostać poinformowany o limicie 5 darmowych planów, aby rozumieć zasady MVP.

Chcę móc wybrać 2-3 tagi (np. Sztuka, Jedzenie) i tempo zwiedzania, aby AI mogło stworzyć lepszy plan.

Chcę od razu móc wpisać notatkę (np. "Paryż, 2 dni") i wygenerować swój pierwszy plan.

Planowanie Zaawansowane:

Jako użytkownik planujący, chcę dodać "stały punkt" (np. "Bilet do Luwru, 15.05, 11:00"), aby AI zbudowało plan wokół tego wydarzenia.

Chcę, aby AI uwzględniło moje preferencje (np. Lokalne Jedzenie) i zaproponowało dzielnicę na lunch blisko Luwru.

Chcę, aby AI poinformowało mnie, jeśli próba dodania Wieży Eiffla tego samego dnia jest nierealistyczna.

Dopracowanie i Eksport:

Jako użytkownik, chcę móc usunąć sugestię AI (np. "Spacer po Polach Marsowych") i kliknąć "Przebuduj dzień", aby zoptymalizować czas, nie zużywając limitu.

Chcę móc zmienić nazwę planu na "Weekend w Paryżu".

Chcę wyeksportować finalny plan do PDF, aby mieć go offline na telefonie.

Archiwizacja i Feedback:

Jako użytkownik po podróży, chcę kliknąć "Przenieś do historii", aby zapisać plan jako wspomnienie (read-only).

Jako użytkownik, chcę móc ocenić plan (kciuk w dół) i napisać "trasa była nielogiczna", aby pomóc ulepszyć produkt.

3. Kryteria Sukcesu i Mierniki (MVP)
   Główne Kryterium (Oryginalne):

80% użytkowników ma wypełnione preferencje (weryfikowane przez "soft-required" onboarding).

75% użytkowników generuje 2 lub więcej planów na rok.

Definicja Użytkownika (MVP):

Aktywny Użytkownik: Osoba, która wygenerowała co najmniej 1 plan w ciągu ostatnich 3 miesięcy.

Kluczowe Wskaźniki Walidacyjne (Miesiąc 1):

Wskaźnik Aktywacji: 25% zarejestrowanych użytkowników wygenerowało co najmniej 1 plan.

Wskaźnik Wartości: 25% wygenerowanych planów zostało wyeksportowanych do formatu PDF.

Mierniki Jakościowe:

Analiza stosunku ocen (kciuk w górę/dół) dla generowanych planów.

Analiza treści komentarzy zwrotnych oraz odpowiedzi z ankiet po wyczerpaniu limitu. </prd_planning_summary>

<unresolved_issues>

- Responsywność (RWD): Decyzja o wdrożeniu RWD jest warunkowa ("jeśli będzie to łatwe"). Wymaga to natychmiastowej oceny technicznej. Pominięcie RWD drastycznie obniży użyteczność aplikacji na urządzeniach mobilnych, co jest kluczowe dla produktu turystycznego (dostęp do planu w trakcie podróży). Należy podjąć twardą decyzję: czy akceptujemy ryzyko słabego UX na mobile, czy zwiększamy zakres MVP.
  -- Zróbmy RWD, niech będzie przyjemnie korzystać z aplikacji na urządzeniach mobilnych.
- Wymagalność Daty Planu: Ustalono, że "każdy plan musi mieć datę", aby umożliwić automatyczne archiwizowanie. Należy precyzyjnie zdefiniować, jak interfejs będzie tego wymagał.
  Czy użytkownik może stworzyć plan "kiedyś w przyszłości"? Jeśli tak, jak wpłynie to na funkcję auto-archiwizacji?
  Jeśli nie, czy nie ograniczamy przypadków użycia (np. luźne planowanie "bucket list")?
  -- Nie, niech wygenerowanie takiego planu wymaga podania terminu chociaż "z grubsza" typu: listopadowy weekend w Walencji, 4 dni w Rzymie w czerwcu itp.

</unresolved_issues>

</conversation_summary>
</project_details>

Wykonaj następujące kroki, aby stworzyć kompleksowy i dobrze zorganizowany dokument:

1. Podziel PRD na następujące sekcje:
   a. Przegląd projektu
   b. Problem użytkownika
   c. Wymagania funkcjonalne
   d. Granice projektu
   e. Historie użytkownika
   f. Metryki sukcesu

2. W każdej sekcji należy podać szczegółowe i istotne informacje w oparciu o opis projektu i odpowiedzi na pytania wyjaśniające. Upewnij się, że:
   - Używasz jasnego i zwięzłego języka
   - W razie potrzeby podajesz konkretne szczegóły i dane
   - Zachowujesz spójność w całym dokumencie
   - Odnosisz się do wszystkich punktów wymienionych w każdej sekcji

3. Podczas tworzenia historyjek użytkownika i kryteriów akceptacji
   - Wymień WSZYSTKIE niezbędne historyjki użytkownika, w tym scenariusze podstawowe, alternatywne i skrajne.
   - Przypisz unikalny identyfikator wymagań (np. US-001) do każdej historyjki użytkownika w celu bezpośredniej identyfikowalności.
   - Uwzględnij co najmniej jedną historię użytkownika specjalnie dla bezpiecznego dostępu lub uwierzytelniania, jeśli aplikacja wymaga identyfikacji użytkownika lub ograniczeń dostępu.
   - Upewnij się, że żadna potencjalna interakcja użytkownika nie została pominięta.
   - Upewnij się, że każda historia użytkownika jest testowalna.

Użyj następującej struktury dla każdej historii użytkownika:

- ID
- Tytuł
- Opis
- Kryteria akceptacji

4. Po ukończeniu PRD przejrzyj go pod kątem tej listy kontrolnej:
   - Czy każdą historię użytkownika można przetestować?
   - Czy kryteria akceptacji są jasne i konkretne?
   - Czy mamy wystarczająco dużo historyjek użytkownika, aby zbudować w pełni funkcjonalną aplikację?
   - Czy uwzględniliśmy wymagania dotyczące uwierzytelniania i autoryzacji (jeśli dotyczy)?

5. Formatowanie PRD:
   - Zachowaj spójne formatowanie i numerację.
   - Nie używaj pogrubionego formatowania w markdown ( \*\* ).
   - Wymień WSZYSTKIE historyjki użytkownika.
   - Sformatuj PRD w poprawnym markdown.

Przygotuj PRD z następującą strukturą:

```markdown
# Dokument wymagań produktu (PRD) - CityFlow

## 1. Przegląd produktu

## 2. Problem użytkownika

## 3. Wymagania funkcjonalne

## 4. Granice produktu

## 5. Historyjki użytkowników

## 6. Metryki sukcesu
```

Pamiętaj, aby wypełnić każdą sekcję szczegółowymi, istotnymi informacjami w oparciu o opis projektu i nasze pytania wyjaśniające. Upewnij się, że PRD jest wyczerpujący, jasny i zawiera wszystkie istotne informacje potrzebne do dalszej pracy nad produktem.

Ostateczny wynik powinien składać się wyłącznie z PRD zgodnego ze wskazanym formatem w markdown.
