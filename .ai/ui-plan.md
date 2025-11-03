# Architektura UI dla CityFlow

## 1. Przegląd struktury UI

Architektura interfejsu użytkownika (UI) CityFlow została zaprojektowana w celu zapewnienia płynnego i intuicyjnego doświadczenia w planowaniu podróży. Opiera się na układzie z panelem bocznym (sidebar) do nawigacji, który na urządzeniach mobilnych zwija się do menu hamburgerowego. Główne widoki aplikacji są odseparowane logicznie, aby prowadzić użytkownika przez proces tworzenia, generowania i zarządzania planami podróży.

Aplikacja wita użytkownika pulpitem z listą jego planów, zachęcając do działania. Proces tworzenia nowego planu jest podzielony na etapy (stepper), co upraszcza wprowadzanie danych. Wygenerowany plan jest prezentowany w czytelnej formie osi czasu wewnątrz akordeonu, co ułatwia przeglądanie poszczególnych dni. Architektura kładzie nacisk na responsywność (RWD), spójne zarządzanie stanem po stronie klienta i klarowną komunikację z użytkownikiem poprzez toasty i komunikaty modalne, zwłaszcza w kontekście operacji asynchronicznych, takich jak generowanie planu przez AI.

## 2. Lista widoków

### 1. Widok Logowania / Rejestracji
- **Ścieżka widoku:** `/login`, `/register`
- **Główny cel:** Umożliwienie nowym użytkownikom rejestracji, a powracającym zalogowania się na swoje konto.
- **Kluczowe informacje do wyświetlenia:** Formularze z polami na e-mail i hasło, przyciski do logowania przez Google.
- **Kluczowe komponenty widoku:** `Card`, `Input`, `Button`, `Form`.
- **UX, dostępność i względy bezpieczeństwa:** Jasne komunikaty o błędach walidacji (np. "Nieprawidłowy e-mail"). Zabezpieczenie przesyłania danych. Widoczne linki do polityki prywatności i odzyskiwania hasła.

### 2. Widok Onboardingu
- **Ścieżka widoku:** Wyświetlany jako modal po pierwszym zalogowaniu.
- **Główny cel:** Zebranie od nowego użytkownika podstawowych preferencji podróżniczych w celu personalizacji generowanych planów.
- **Kluczowe informacje do wyświetlenia:** Wybór tempa zwiedzania, wybór zainteresowań (tagów), informacja o limicie darmowych generacji.
- **Kluczowe komponenty widoku:** `Dialog` (Modal), `RadioGroup` (dla tempa), `ToggleGroup` lub `Checkbox` (dla zainteresowań), `Button`.
- **UX, dostępność i względy bezpieczeństwa:** Proces jest "miękko-wymagany" z dostępną opcją pominięcia. Wizualne wskazanie wybranych opcji.

### 3. Widok "Moje Plany" (Dashboard)
- **Ścieżka widoku:** `/plans` (domyślny widok po zalogowaniu)
- **Główny cel:** Wyświetlenie listy wszystkich aktywnych planów użytkownika (szkiców i wygenerowanych) oraz umożliwienie tworzenia nowych.
- **Kluczowe informacje do wyświetlenia:** Lista planów w formie kart, przycisk do tworzenia nowego planu. W przypadku braku planów, wyświetlany jest stan pusty.
- **Kluczowe komponenty widoku:** `Tabs` ("Moje Plany", "Historia"), `PlanCard`, `EmptyState`, `Button`.
- **UX, dostępność i względy bezpieczeństwa:** Każda karta planu ma jasny status ("Szkic", "Wygenerowany") i odpowiednie wezwanie do działania (CTA). Widok jest w pełni responsywny.

### 4. Widok Historii Planów
- **Ścieżka widoku:** `/plans?status=archived` (dostępny jako zakładka w widoku "Moje Plany")
- **Główny cel:** Umożliwienie przeglądania zarchiwizowanych, historycznych planów w trybie tylko do odczytu.
- **Kluczowe informacje do wyświetlenia:** Lista zarchiwizowanych planów w formie kart.
- **Kluczowe komponenty widoku:** `Tabs`, `PlanCard` (wariant "read-only"), `EmptyState`.
- **UX, dostępność i względy bezpieczeństwa:** Plany w historii są wyraźnie oznaczone i nie posiadają akcji edycyjnych.

### 5. Widok Tworzenia Planu
- **Ścieżka widoku:** `/plans/new`
- **Główny cel:** Przeprowadzenie użytkownika przez proces tworzenia nowego szkicu planu.
- **Kluczowe informacje do wyświetlenia:** Kroki procesu (dane podstawowe, stałe punkty, podsumowanie), formularze do wprowadzania danych.
- **Kluczowe komponenty widoku:** `Stepper`, `Form`, `Input`, `Textarea`, `DatePicker`, `Button`.
- **UX, dostępność i względy bezpieczeństwa:** Podział na kroki zmniejsza obciążenie poznawcze. Walidacja danych na każdym etapie. Jasne instrukcje i etykiety pól.

### 6. Widok Szczegółów Planu
- **Ścieżka widoku:** `/plans/[id]`
- **Główny cel:** Wyświetlanie szczegółów planu. Widok jest dynamiczny i renderuje inną zawartość w zależności od statusu planu (`draft` vs `generated`).
- **Kluczowe informacje do wyświetlenia:**
    - Dla `draft`: Formularz edycji danych planu.
    - Dla `generated`: Godzinowa oś czasu dla każdego dnia, opcje edycji (usuwanie, przebudowa dnia), przyciski akcji (eksport, archiwizacja), moduł feedbacku.
- **Kluczowe komponenty widoku:** `Accordion` (dla dni), `Timeline`, `Button`, `DropdownMenu`, `FeedbackModule`.
- **UX, dostępność i względy bezpieczeństwa:** Czytelna prezentacja planu. Interakcje (usuwanie, przebudowa) mają natychmiastowe wizualne potwierdzenie. Wyraźne ostrzeżenie, że plan jest sugestią AI.

### 7. Widok Profilu
- **Ścieżka widoku:** `/profile`
- **Główny cel:** Umożliwienie użytkownikowi zarządzania preferencjami, danymi konta i sprawdzania limitu generacji.
- **Kluczowe informacje do wyświetlenia:** Formularz edycji preferencji, wskaźnik pozostałych generacji, formularz zmiany hasła.
- **Kluczowe komponenty widoku:** `Form`, `RadioGroup`, `ToggleGroup`, `Progress`, `Input`, `Button`.
- **UX, dostępność i względy bezpieczeństwa:** Zmiany są zapisywane dopiero po kliknięciu przycisku "Zapisz". Informacje są logicznie pogrupowane w sekcje.

## 3. Mapa podróży użytkownika

Główna ścieżka użytkownika (happy path) obejmuje stworzenie i wygenerowanie planu:

1.  **Rejestracja/Logowanie**: Użytkownik trafia na stronę `/login` i loguje się na swoje konto.
2.  **Onboarding**: Jeśli to pierwsze logowanie, pojawia się modal onboardingu, w którym użytkownik ustawia swoje preferencje.
3.  **Dashboard**: Użytkownik ląduje w widoku `Moje Plany` (`/plans`). Widzi pusty stan i klika "Stwórz nowy plan".
4.  **Tworzenie Planu**: Przechodzi do widoku `/plans/new`. Wypełnia 3 kroki w stepperze:
    a.  **Krok 1**: Wprowadza miejsce docelowe, daty i notatki.
    b.  **Krok 2**: Opcjonalnie dodaje stałe punkty (np. rezerwację w restauracji).
    c.  **Krok 3**: Przegląda podsumowanie i klika "Generuj plan".
5.  **Generowanie**: Na ekranie pojawia się nakładka z animacją ładowania i komunikatami o postępie.
6.  **Przeglądanie Planu**: Po zakończeniu generowania, użytkownik jest przekierowywany do widoku szczegółów (`/plans/[id]`), gdzie widzi wygenerowany plan w formie osi czasu.
7.  **Interakcja**: Użytkownik usuwa jeden z punktów planu. W nagłówku danego dnia pojawia się przycisk "Przebuduj dzień", który klika, aby zoptymalizować resztę dnia.
8.  **Finalizacja**: Zadowolony z planu, użytkownik klika "Eksportuj do PDF", aby pobrać plik.
9.  **Powrót do Dashboardu**: Użytkownik wraca do widoku `Moje Plany`, gdzie widzi nowo utworzony plan z etykietą "Wygenerowany".

## 4. Układ i struktura nawigacji

- **Główny układ:** Aplikacja wykorzystuje stały układ z panelem bocznym po lewej stronie i obszarem na główną treść po prawej.
- **Panel boczny (Sidebar):** Zawiera główne linki nawigacyjne:
    - **Moje Plany** (`/plans`)
    - **Historia** (`/plans?status=archived`)
    - **Profil** (`/profile`)
- **Przycisk Wyloguj:** Umieszczony na dole panelu bocznego.
- **Responsywność:** Na urządzeniach mobilnych (poniżej zdefiniowanego breakpointu), panel boczny zwija się do ikony "hamburgera", która otwiera menu nawigacyjne.
- **Przekierowania:**
    - Niezalogowani użytkownicy próbujący uzyskać dostęp do chronionych tras są przekierowywani do `/login`.
    - Po zalogowaniu użytkownik jest przekierowywany do `/plans`.

## 5. Kluczowe komponenty

Poniżej znajduje się lista kluczowych, reużywalnych komponentów, które będą używane w całej aplikacji. Wiele z nich będzie bazować na bibliotece `shadcn/ui`.

- **`Layout`**: Główny komponent otaczający każdą stronę, zawierający `Sidebar` i obszar na treść.
- **`Sidebar`**: Komponent nawigacyjny z linkami do głównych widoków.
- **`PlanCard`**: Karta wyświetlająca podsumowanie pojedynczego planu na listach "Moje Plany" i "Historia". Posiada warianty w zależności od statusu planu.
- **`EmptyState`**: Komponent wyświetlany, gdy lista (np. planów) jest pusta, zawierający grafikę, komunikat i przycisk CTA.
- **`Stepper`**: Komponent wizualizujący postęp w wieloetapowym procesie, używany przy tworzeniu planu.
- **`LoadingOverlay`**: Pełnoekranowa nakładka z animacją i komunikatami, używana podczas generowania planu przez AI.
- **`Accordion`**: Używany w widoku szczegółów planu do zwijania i rozwijania poszczególnych dni.
- **`Timeline`**: Komponent wizualizujący godzinowy harmonogram dnia w wygenerowanym planie.
- **`FeedbackModule`**: Komponent na dole wygenerowanego planu, umożliwiający ocenę (kciuk w górę/dół) i dodanie opcjonalnego komentarza.
- **`Toast`**: Komponent do wyświetlania nieinwazyjnych powiadomień o sukcesie lub błędzie operacji.
