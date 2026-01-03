# Plan Implementacji Testów E2E - Historia Planów

## 1. Zakres testów

Testy E2E pokrywające archiwizację i przeglądanie historii:

- Ręczne przenoszenie planu do historii
- Automatyczne przenoszenie po upływie daty
- Przeglądanie historii
- Tryb read-only dla zarchiwizowanych planów
- Eksport planu z historii

## 2. Struktura plików

```
e2e/
├── history/
│   ├── move-to-history.spec.ts      # US-051
│   ├── auto-archive.spec.ts         # US-052
│   ├── view-history.spec.ts         # US-053
│   └── history-readonly.spec.ts     # Read-only mode
├── page-objects/
│   ├── HistoryPage.ts               # Nowy
│   └── PlanDetailsPage.ts           # Rozszerzenie
└── fixtures.ts                      # Rozszerzenie
```

## 3. Przypadki testowe

### 3.1. Ręczne przenoszenie do historii (move-to-history.spec.ts)

#### Test 1: Przeniesienie planu do historii z listy planów

**Kroki:**

1. Utwórz plan generated "Wycieczka do Rzymu"
2. Zaloguj się
3. Przejdź do `/plans`
4. Kliknij menu akcji (⋮) przy planie
5. Wybierz "Przenieś do historii"
6. Potwierdź w modalu

**Oczekiwany rezultat:**

- Modal potwierdzenia: "Czy chcesz przenieść ten plan do historii? Plan będzie tylko do odczytu."
- Po potwierdzeniu:
  - Plan znika z listy `/plans`
  - Plan ma `status = 'archived'` w bazie
  - Toast: "Plan przeniesiony do historii"

#### Test 2: Przeniesienie planu do historii ze szczegółów planu

**Kroki:**

1. Utwórz plan generated
2. Przejdź do `/plans/[id]`
3. Kliknij menu akcji
4. Wybierz "Przenieś do historii"
5. Potwierdź

**Oczekiwany rezultat:**

- Plan przeniesiony
- Przekierowanie do `/plans` lub `/history`
- Toast: "Plan przeniesiony do historii"

#### Test 3: Anulowanie przenoszenia

**Kroki:**

1. Utwórz plan
2. Rozpocznij przenoszenie do historii
3. W modalu kliknij "Anuluj"

**Oczekiwany rezultat:**

- Modal zamknięty
- Plan NIE jest przeniesiony
- Plan wciąż widoczny na liście aktywnych

#### Test 4: Przycisk "Przenieś do historii" widoczny tylko dla generated

**Kroki:**

1. Utwórz plan draft
2. Przejdź do jego szczegółów

**Oczekiwany rezultat:**

- Przycisk "Przenieś do historii" niewidoczny lub nieaktywny
- Tylko plany generated mogą być archiwizowane

---

### 3.2. Automatyczne archiwizowanie (auto-archive.spec.ts)

#### Test 1: Plan automatycznie przeniesiony po upływie daty końcowej

**Uwaga:** Wymaga manipulacji datą lub cron job trigger

**Kroki:**

1. Utwórz plan z datą końcową: "2024-12-31" (przeszła data)
2. Uruchom cron job archiwizacji (lub poczekaj na automatyczne uruchomienie)

**Oczekiwany rezultat:**

- Plan ma `status = 'archived'`
- Plan NIE jest widoczny na `/plans`
- Plan widoczny na `/history`

#### Test 2: Plan NIE jest archiwizowany przed datą końcową

**Kroki:**

1. Utwórz plan z datą końcową: "2026-12-31" (przyszła data)
2. Uruchom cron job

**Oczekiwany rezultat:**

- Plan pozostaje w `status = 'generated'`
- Plan wciąż widoczny na `/plans`

#### Test 3: Plany draft nie są auto-archiwizowane

**Kroki:**

1. Utwórz plan draft z przeszłą datą
2. Uruchom cron job

**Oczekiwany rezultat:**

- Plan pozostaje `draft`
- NIE jest archiwizowany automatycznie
- Tylko generated plany są auto-archiwizowane

#### Test 4: Batch archiving - wiele planów jednocześnie

**Kroki:**

1. Utwórz 5 planów z przeszłymi datami
2. Uruchom cron job

**Oczekiwany rezultat:**

- Wszystkie 5 planów zarchiwizowanych
- Wszystkie widoczne w `/history`
- Batch operation zakończony sukcesem

---

### 3.3. Przeglądanie historii (view-history.spec.ts)

#### Test 1: Wyświetlanie pustej historii

**Kroki:**

1. Nowy użytkownik bez zarchiwizowanych planów
2. Przejdź do `/history`

**Oczekiwany rezultat:**

- Empty state: "Nie masz jeszcze żadnych planów w historii"
- Komunikat: "Plany automatycznie przenoszą się tutaj po upływie daty końcowej"

#### Test 2: Wyświetlanie listy zarchiwizowanych planów

**Kroki:**

1. Utwórz użytkownika z 3 zarchiwizowanymi planami:
   - "Rzym 2024-05-01"
   - "Barcelona 2024-08-15"
   - "Praga 2024-12-20"
2. Przejdź do `/history`

**Oczekiwany rezultat:**

- Lista zawiera 3 plany
- Każdy plan pokazuje: nazwę, cel, daty, status "Zarchiwizowany"
- Plany posortowane: najnowsze (wg daty końcowej) na górze
- Lub: Praga → Barcelona → Rzym

#### Test 3: Kliknięcie w plan przekierowuje do szczegółów (read-only)

**Kroki:**

1. Użytkownik z zarchiwizowanymi planami
2. Kliknij na plan z historii

**Oczekiwany rezultat:**

- Przekierowanie do `/plans/[id]` lub `/history/[id]`
- Wyświetlenie szczegółów planu
- Tryb read-only (brak możliwości edycji)

#### Test 4: Filtrowanie historii po roku/miesiącu

**Kroki:**

1. Użytkownik z planami z różnych lat: 2023, 2024, 2025
2. Filtruj po roku: 2024

**Oczekiwany rezultat:**

- Lista pokazuje tylko plany z 2024
- Inne ukryte

---

### 3.4. Tryb read-only (history-readonly.spec.ts)

#### Test 1: Brak możliwości edycji nazwy planu

**Kroki:**

1. Otwórz zarchiwizowany plan
2. Spróbuj kliknąć edycję nazwy

**Oczekiwany rezultat:**

- Ikona edycji niewidoczna lub nieaktywna
- Nazwa wyświetlana jako zwykły tekst (nie edytowalny)
- Tooltip (opcjonalnie): "Plan jest tylko do odczytu"

#### Test 2: Brak możliwości dodania aktywności

**Kroki:**

1. Otwórz zarchiwizowany plan
2. Sprawdź timeline

**Oczekiwany rezultat:**

- Przycisk "Dodaj aktywność" niewidoczny
- Brak opcji dodawania nowych elementów

#### Test 3: Brak możliwości edycji aktywności

**Kroki:**

1. Otwórz zarchiwizowany plan z aktywnościami
2. Spróbuj kliknąć edycję aktywności

**Oczekiwany rezultat:**

- Ikona edycji niewidoczna przy każdej aktywności
- Aktywności wyświetlane tylko jako tekst

#### Test 4: Brak możliwości usunięcia aktywności

**Kroki:**

1. Otwórz zarchiwizowany plan
2. Sprawdź opcje aktywności

**Oczekiwany rezultat:**

- Ikona kosza niewidoczna
- Brak możliwości usuwania

#### Test 5: Brak możliwości ponownego generowania

**Kroki:**

1. Otwórz zarchiwizowany plan
2. Sprawdź dostępne akcje

**Oczekiwany rezultat:**

- Przycisk "Generuj ponownie" niewidoczny
- Plan jest "zamknięty" - brak modyfikacji

#### Test 6: Możliwość eksportu do PDF (dozwolone)

**Kroki:**

1. Otwórz zarchiwizowany plan
2. Kliknij "Eksportuj do PDF"

**Oczekiwany rezultat:**

- Eksport działa normalnie
- PDF generuje się poprawnie
- Read-only nie blokuje eksportu (tylko odczytu)

#### Test 7: Brak możliwości usunięcia zarchiwizowanego planu

**Kroki:**

1. Otwórz zarchiwizowany plan
2. Sprawdź menu akcji

**Oczekiwany rezultat:**

- Przycisk "Usuń plan" niewidoczny
- Zarchiwizowane plany są "chronione" przed usunięciem
- Lub: Opcja usunięcia dostępna, ale z dodatkowym potwierdzeniem

#### Test 8: Badge "Tylko do odczytu" widoczny

**Kroki:**

1. Otwórz zarchiwizowany plan

**Oczekiwany rezultat:**

- Badge/etykieta "Tylko do odczytu" lub "Zarchiwizowany" widoczna w nagłówku
- Wyraźne wskazanie trybu read-only

---

## 4. Page Objects do implementacji

### 4.1. HistoryPage.ts

```typescript
export class HistoryPage {
  readonly page: Page;
  readonly planCards: Locator;
  readonly emptyState: Locator;
  readonly filterDropdown: Locator;
  readonly yearFilters: Locator;

  constructor(page: Page) {
    this.page = page;
    this.planCards = page.locator('[data-testid="history-plan-card"]');
    this.emptyState = page.locator('[data-testid="history-empty-state"]');
    this.filterDropdown = page.locator('[data-testid="history-filter"]');
    this.yearFilters = page.locator('[data-testid^="filter-year-"]');
  }

  async goto() {
    await this.page.goto('/history');
  }

  async getPlanCount(): Promise<number> {
    return await this.planCards.count();
  }

  async getPlanByName(name: string): Locator {
    return this.page.locator(`[data-testid="history-plan-card"]:has-text("${name}")`);
  }

  async clickPlan(name: string) {
    await this.getPlanByName(name).click();
  }

  async isEmptyStateVisible(): Promise<boolean> {
    return await this.emptyState.isVisible();
  }

  async filterByYear(year: number) {
    await this.filterDropdown.click();
    await this.page.locator(`[data-testid="filter-year-${year}"]`).click();
  }
}
```

### 4.2. PlanDetailsPage.ts (rozszerzenie)

```typescript
// Dodaj do istniejącego:
export class PlanDetailsPage {
  // ... existing code ...

  readonly moveToHistoryButton: Locator;
  readonly readOnlyBadge: Locator;

  constructor(page: Page) {
    // ... existing code ...
    this.moveToHistoryButton = page.locator('[data-testid="move-to-history"]');
    this.readOnlyBadge = page.locator('[data-testid="readonly-badge"]');
  }

  async moveToHistory() {
    await this.moveToHistoryButton.click();
    // Confirm in modal
    await this.page.locator('[data-testid="confirm-archive"]').click();
  }

  async isReadOnly(): Promise<boolean> {
    return await this.readOnlyBadge.isVisible();
  }

  async canEditTitle(): Promise<boolean> {
    return await this.editTitleButton.isVisible();
  }

  async canAddActivity(): Promise<boolean> {
    const addButton = this.page.locator('[data-testid="add-activity-button"]');
    return await addButton.isVisible();
  }
}
```

---

## 5. Rozszerzenie fixtures.ts

### Nowe helpery:

```typescript
// Helper do tworzenia zarchiwizowanego planu
export async function createArchivedPlan(
  supabase: SupabaseClient,
  userId: string,
  options: {
    name?: string;
    destination?: string;
    endDate?: string; // Przeszła data
  }
): Promise<string> {
  const { data: plan } = await supabase
    .from('plans')
    .insert({
      user_id: userId,
      name: options.name || 'Archived Plan',
      destination: options.destination || 'Rome',
      status: 'archived',
      end_date: options.endDate || '2024-12-31',
    })
    .select()
    .single();

  return plan.id;
}

// Helper do uruchomienia auto-archiving job
export async function runArchivingJob(supabase: SupabaseClient) {
  // Wywołanie Supabase Edge Function lub bezpośrednie SQL
  const { data, error } = await supabase.rpc('archive_expired_plans');
  if (error) throw error;
  return data;
}

// Helper do weryfikacji read-only
export async function verifyPlanIsReadOnly(supabase: SupabaseClient, planId: string): Promise<boolean> {
  const { data } = await supabase.from('plans').select('status').eq('id', planId).single();

  return data?.status === 'archived';
}

// Helper do manipulacji datą planu (dla testów)
export async function setPlanEndDate(supabase: SupabaseClient, planId: string, endDate: string) {
  await supabase.from('plans').update({ end_date: endDate }).eq('id', planId);
}
```

---

## 6. Kolejność implementacji

### Etap 1: Ręczne archiwizowanie (1 dzień)

1. ✅ Utworzenie `HistoryPage.ts`
2. ✅ Rozszerzenie `PlanDetailsPage.ts`
3. ✅ Implementacja `move-to-history.spec.ts`

### Etap 2: Automatyczne archiwizowanie (1 dzień)

4. ✅ Implementacja cron job lub Supabase Function
5. ✅ Helper do uruchamiania archivingu
6. ✅ Implementacja `auto-archive.spec.ts`

### Etap 3: Przeglądanie historii (0.5 dnia)

7. ✅ Implementacja `view-history.spec.ts`

### Etap 4: Read-only mode (1 dzień)

8. ✅ Implementacja `history-readonly.spec.ts`
9. ✅ Testy wszystkich blokad edycji

---

## 7. Wymagane zmiany w aplikacji

### Dodać data-testid w komponentach:

1. **HistoryPage** (`src/pages/history.astro`):
   - `data-testid="history-plan-card"`
   - `data-testid="history-empty-state"`
   - `data-testid="history-filter"`
   - `data-testid="filter-year-{year}"`

2. **PlanDetailsView** (rozszerzenie):
   - `data-testid="move-to-history"`
   - `data-testid="readonly-badge"`
   - `data-testid="confirm-archive"` (w modalu)

3. **PlanCard** (rozszerzenie):
   - `data-testid="move-to-history-action"` (w menu)

### Implementacja funkcji:

1. **Auto-archiving cron job:**
   - Supabase Edge Function: `archive_expired_plans()`
   - Lub: Vercel Cron Job
   - Uruchamiana codziennie o północy
   - SQL: `UPDATE plans SET status = 'archived' WHERE end_date < NOW() AND status = 'generated'`

2. **Read-only logic:**
   - Komponent wrapper: `<ReadOnlyPlanView>`
   - Warunkowe renderowanie przycisków edycji
   - Conditional logic: `const isReadOnly = plan.status === 'archived'`

---

## 8. Baza danych - Supabase Function

### SQL dla auto-archiving:

```sql
CREATE OR REPLACE FUNCTION archive_expired_plans()
RETURNS TABLE (archived_count INT) AS $$
BEGIN
  UPDATE plans
  SET status = 'archived'
  WHERE end_date < CURRENT_DATE
    AND status = 'generated';

  GET DIAGNOSTICS archived_count = ROW_COUNT;
  RETURN QUERY SELECT archived_count;
END;
$$ LANGUAGE plpgsql;
```

### Vercel Cron Job (vercel.json):

```json
{
  "crons": [
    {
      "path": "/api/cron/archive-plans",
      "schedule": "0 0 * * *"
    }
  ]
}
```

### API endpoint (`/api/cron/archive-plans.ts`):

```typescript
export async function GET(request: Request) {
  // Verify cron secret
  const authHeader = request.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return new Response('Unauthorized', { status: 401 });
  }

  const supabase = createClient();
  const { data, error } = await supabase.rpc('archive_expired_plans');

  if (error) {
    return new Response(JSON.stringify({ error }), { status: 500 });
  }

  return new Response(JSON.stringify({ archived: data }), { status: 200 });
}
```

---

## 9. Metryki sukcesu

- ✅ Ręczne archiwizowanie działa z listy i ze szczegółów
- ✅ Auto-archiving poprawnie przenosi plany po dacie
- ✅ Historia wyświetla tylko plany użytkownika (RLS)
- ✅ Read-only mode blokuje wszystkie edycje
- ✅ Eksport PDF działa dla zarchiwizowanych planów
- ✅ Cron job działa niezawodnie

---

## 10. Potencjalne problemy i rozwiązania

### Problem 1: Testowanie cron job w E2E

**Rozwiązanie:**

- Utworzyć helper do ręcznego wywołania funkcji archiving
- Lub bezpośrednie SQL UPDATE dla testów
- Nie polegać na rzeczywistym harmonogramie cron

### Problem 2: Timezone issues

**Rozwiązanie:**

- Używać UTC dla dat w bazie
- Konwertować na lokalny timezone w UI
- Testy używają dat UTC

### Problem 3: Decyzja: czy zarchiwizowane plany można usunąć?

**Rozwiązanie:**

- Opcja A: Blokada usuwania (chronione wspomnienia)
- Opcja B: Dodatkowe potwierdzenie
- Zalecenie: Opcja B dla lepszego UX

### Problem 4: Czy draft może być archiwizowany?

**Rozwiązanie:**

- NIE - tylko generated plany
- Draft nie ma daty końcowej (nie można określić expiration)
- User musi najpierw wygenerować lub usunąć draft

---

## 11. Checklist przed rozpoczęciem

- [ ] Sprawdzenie schematu bazy: czy `plans.status` obsługuje 'archived'
- [ ] Decyzja: Supabase Function vs Vercel Cron
- [ ] Konfiguracja CRON_SECRET w .env
- [ ] Dodanie data-testid do komponentów historii
- [ ] Implementacja read-only logic w PlanDetailsView
- [ ] Utworzenie `/history` page w Astro
- [ ] Helpery fixtures dla zarchiwizowanych planów
- [ ] Decyzja: czy zarchiwizowane plany można "przywrócić"?

---

## 12. Dodatkowe funkcje (Nice to have)

### Przywracanie planu z historii (opcjonalne):

- Przycisk "Przywróć plan" w zarchiwizowanym planie
- Zmienia status z 'archived' na 'generated'
- Plan wraca na listę aktywnych

### Statystyki w historii:

- "Odwiedziłeś 12 miast"
- "Całkowity czas podróży: 45 dni"
- Mapa z odwiedzonymi miejscami

### Eksport całej historii:

- "Eksportuj wszystkie plany do PDF"
- Jeden duży dokument ze wszystkimi wycieczkami
