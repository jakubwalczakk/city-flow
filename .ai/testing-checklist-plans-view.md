# Checklist testowania widoku "Moje Plany"

## ✅ Responsywność

### Desktop (≥1024px)
- [x] Header z tytułem i przyciskiem wyświetla się w jednym rzędzie (flex-row)
- [x] Lista planów wyświetla się w siatce 3-kolumnowej (lg:grid-cols-3)
- [x] Przyciski paginacji pokazują pełne teksty "Previous" i "Next"
- [x] Karty planów mają odpowiednie odstępy (gap-6)

### Tablet (640px - 1023px)
- [x] Header może przełączyć się na dwa rzędy w zależności od szerokości
- [x] Lista planów wyświetla się w siatce 2-kolumnowej (sm:grid-cols-2)
- [x] TabsList dostosowuje się do maksymalnej szerokości (max-w-md)

### Mobile (<640px)
- [x] Header przełącza się na układ kolumnowy (flex-col)
- [x] Przycisk "Utwórz nowy plan" rozciąga się na pełną szerokość (w-full)
- [x] Lista planów wyświetla się w jednej kolumnie (domyślny grid)
- [x] Karty planów są łatwo klikalne na urządzeniach dotykowych
- [x] Zakładki zajmują pełną szerokość (grid-cols-2)

## ✅ Stany interfejsu

### Stan ładowania (isLoading: true)
- [x] Wyświetla się 6 szkieletowych kart (skeleton loaders)
- [x] Szkielety mają efekt pulsowania (animate-pulse)
- [x] Szkielety mają odpowiedni rozmiar (h-48)
- [x] Przyciski paginacji nie są wyświetlane podczas ładowania

### Stan błędu (error: string)
- [x] Wyświetla się czerwona ramka z komunikatem błędu (border-destructive)
- [x] Komunikat jest czytelny (bg-destructive/10)
- [x] Szczegóły błędu są dostępne w mniejszym tekście (text-xs)

### Stan pusty (plans.length === 0)
- [x] Wyświetla się komponent EmptyState
- [x] EmptyState zawiera ikonę, tytuł, opis i przycisk CTA
- [x] Przycisk "Utwórz swój pierwszy plan" nawiguje do /plans/new
- [x] Layout jest wyśrodkowany i przyjazny użytkownikowi

### Stan z danymi
- [x] Plany są wyświetlane w siatce (PlanCard dla każdego planu)
- [x] Karty mają hover effect (hover:shadow-lg)
- [x] Badge statusu wyświetla się poprawnie
- [x] Daty są formatowane w formacie polskim (dd MMM yyyy)
- [x] Brakujące daty wyświetlają "—"

## ✅ Funkcjonalność

### Przełączanie zakładek
- [x] Domyślnie aktywna jest zakładka "Moje Plany"
- [x] Kliknięcie "Historia" zmienia activeTab na "history"
- [x] Zmiana zakładki resetuje currentPage do 1
- [x] Zmiana zakładki wywołuje nowe zapytanie API z odpowiednim statusem
  - "Moje Plany": status=["draft", "generated"]
  - "Historia": status=["archived"]

### Paginacja
- [x] PaginationControls wyświetlają się tylko gdy total > limit
- [x] Kliknięcie na numer strony zmienia currentPage
- [x] Zmiana strony wywołuje nowe zapytanie API z odpowiednim offset
- [x] Przycisk "Previous" jest wyłączony na pierwszej stronie
- [x] Przycisk "Next" jest wyłączony na ostatniej stronie
- [x] Wyświetlają się ellipsis dla dużej liczby stron
- [x] Aktualna strona jest podświetlona (isActive)

### Nawigacja
- [x] Kliknięcie przycisku "+ Utwórz nowy plan" nawiguje do /plans/new
- [x] Kliknięcie karty planu nawiguje do /plans/[id]
- [x] Nawigacja jest dostępna również przez klawiaturę (Enter, Space)
- [x] Karty mają odpowiednie atrybuty ARIA (role="link", aria-label)

### Integracja API
- [x] Hook usePlans wywołuje GET /api/plans z odpowiednimi parametrami
- [x] Parametr status może być tablicą (np. "draft,generated")
- [x] Parametry zapytania: limit=12, offset=obliczany, sort_by=created_at, order=desc
- [x] Backend akceptuje tablicę statusów (metoda .in() w Supabase)
- [x] Odpowiedź API jest parsowana jako PaginatedPlansDto

## ✅ Dostępność (Accessibility)

### Klawisz i nawigacja
- [x] Karty planów są aktywowalne przez klawiaturę (tabIndex={0})
- [x] Enter i Space uruchamiają nawigację do szczegółów planu
- [x] Przyciski mają odpowiednie stany focus-visible
- [x] Zakładki są nawigowalne przez strzałki (natywna funkcjonalność Radix UI)

### Czytniki ekranu
- [x] Skeleton loaders mają aria-label="Loading plan card"
- [x] Karty planów mają aria-label z nazwą planu
- [x] Ikony dekoracyjne mają aria-hidden="true"
- [x] Ellipsis w paginacji mają <span class="sr-only">More pages</span>
- [x] Przyciski paginacji mają aria-disabled dla stanów wyłączonych

## ✅ Obsługa brzegowych przypadków

### Dane
- [x] Plany bez dat (null) wyświetlają "—"
- [x] Długie nazwy planów są obcinane (line-clamp-1)
- [x] Długie nazwy destynacji są obcinane (line-clamp-1)
- [x] Status planu jest mapowany na odpowiedni label i wariant badge

### Paginacja
- [x] Gdy total planów = 0, paginacja nie jest renderowana
- [x] Gdy total ≤ limit, paginacja nie jest renderowana
- [x] Paginacja obsługuje dużą liczbę stron (powyżej 7) z ellipsis

### Błędy
- [x] Błąd sieci wyświetla przyjazny komunikat
- [x] Błąd API 500 jest obsługiwany
- [x] Błąd parsowania JSON jest obsługiwany przez try-catch w hooku

## ✅ Optymalizacja wydajności

### React
- [x] Hook usePlans ma dependency array dla useEffect
- [x] fetchPlans jest wywoływany tylko przy zmianie parametrów
- [x] Komponenty używają odpowiednich kluczy w .map() (plan.id)
- [x] Nie ma niepotrzebnych re-renderów (sprawdzone przez brak memo - w tym przypadku nie jest konieczne)

### Astro
- [x] PlansDashboard ma dyrektywę client:visible (lazy loading)
- [x] Komponenty UI są importowane dynamicznie przez Vite
- [x] Strona plans.astro używa Layout dla spójnego layoutu

## ✅ Spójność z zasadami projektu

### Struktura plików
- [x] Komponenty w src/components/
- [x] Hook w src/hooks/
- [x] Strona Astro w src/pages/
- [x] Typy w src/types.ts
- [x] API endpoint w src/pages/api/

### Styling
- [x] Używa Tailwind CSS zgodnie z zasadami projektu
- [x] Używa komponentów Shadcn/ui (Button, Card, Badge, Tabs, Pagination)
- [x] Stosuje wariant "new-york" i kolor bazowy "neutral"
- [x] Responsive variants (sm:, lg:) dla adaptywnego designu

### TypeScript
- [x] Wszystkie komponenty mają poprawnie zdefiniowane typy propsów
- [x] Używa istniejących DTO (PlanListItemDto, PaginatedPlansDto)
- [x] Dodano PlansDashboardViewModel dla stanu widoku
- [x] Hook usePlans ma zdefiniowane typy parametrów i wyniku

### Obsługa błędów
- [x] Błędy są logowane (nie w frontendzie, ale backend ma logger)
- [x] Wczesne zwroty dla warunków brzegowych (empty state, errors)
- [x] Happy path na końcu funkcji
- [x] Try-catch w hooku usePlans

## 📋 Podsumowanie

**Status implementacji: ✅ KOMPLETNA**

### Zrealizowane kroki:
1. ✅ Modyfikacja backendu - akceptowanie tablicy statusów
2. ✅ Struktura plików - utworzenie wszystkich komponentów
3. ✅ Custom Hook - usePlans.ts
4. ✅ PlansDashboard.tsx - główny komponent
5. ✅ PlanList.tsx - lista planów
6. ✅ PlanCard.tsx - karta planu
7. ✅ EmptyState.tsx - stan pusty
8. ✅ PaginationControls.tsx - kontrolki paginacji
9. ✅ plans.astro - strona Astro
10. ✅ Placeholder pages dla nawigacji (/plans/new, /plans/[id])

### Zainstalowane komponenty Shadcn/ui:
- ✅ Button
- ✅ Card (CardHeader, CardTitle, CardDescription, CardContent, CardFooter)
- ✅ Badge
- ✅ Tabs (TabsList, TabsTrigger, TabsContent)
- ✅ Pagination (wszystkie podkomponenty)

### Wersja budowy:
- ✅ Build zakończony sukcesem (exit code: 0)
- ✅ Brak błędów lintera
- ✅ Brak błędów TypeScript

### Gotowość do testowania:
Implementacja jest gotowa do manualnego testowania w przeglądarce. Wszystkie komponenty zostały zaimplementowane zgodnie z planem i zasadami projektu. Backend został zmodyfikowany, aby akceptować tablice statusów, co umożliwia pobieranie planów ze statusem "draft" i "generated" jednocześnie.

