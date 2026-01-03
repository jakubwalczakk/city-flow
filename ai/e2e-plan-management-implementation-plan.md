# Plan Implementacji Testów E2E - Zarządzanie Planami (CRUD)

## 1. Zakres testów

Testy E2E pokrywające pełny cykl życia planu podróży:

- Tworzenie nowego planu (pełny flow bez mocków)
- Przeglądanie listy planów
- Wyświetlanie szczegółów planu
- Edycja nazwy planu
- Usuwanie planu
- RLS - próba dostępu do planu innego użytkownika

## 2. Struktura plików

```
e2e/
├── plans/
│   ├── create-plan-full.spec.ts    # US-020, US-021 (bez mocków)
│   ├── plans-list.spec.ts          # US-022
│   ├── plan-details.spec.ts        # Wyświetlanie szczegółów
│   ├── edit-plan-name.spec.ts      # US-023
│   ├── delete-plan.spec.ts         # US-024
│   └── plan-rls.spec.ts            # Row Level Security
├── page-objects/
│   ├── PlansListPage.ts            # Nowy
│   ├── PlanDetailsPage.ts          # Nowy
│   └── NewPlanPage.ts              # Istniejący - do poprawy (usunąć mocki)
└── fixtures.ts                     # Rozszerzenie
```

## 3. Przypadki testowe

### 3.1. Tworzenie planu - pełny flow (create-plan-full.spec.ts)

#### Test 1: Utworzenie planu draft (bez generowania)

**Kroki:**

1. Zaloguj się jako użytkownik testowy
2. Przejdź do `/plans`
3. Kliknij "Utwórz nowy plan"
4. **Krok 1 - Basic Info:**
   - Wypełnij nazwę: "Wycieczka do Paryża"
   - Wypełnij cel: "Paryż, Francja"
   - Wybierz miesiąc: "Czerwiec"
   - Wypełnij opis: "3-dniowy weekend, zwiedzanie i jedzenie"
   - Kliknij "Dalej"
5. **Krok 2 - Fixed Points:**
   - Kliknij "Dodaj stały punkt"
   - Miejsce: "Muzeum Luwr"
   - Data: "15.06.2026"
   - Godzina: "10:00"
   - Zapisz punkt
   - Kliknij "Dalej"
6. **Krok 3 - Preferences:**
   - Wybierz preferencje: "Sztuka", "Jedzenie"
   - Wybierz tempo: "Umiarkowane"
   - Kliknij "Dalej"
7. **Krok 4 - Summary:**
   - Weryfikuj podsumowanie
   - Kliknij "Zapisz jako draft" (bez generowania)

**Oczekiwany rezultat:**

- Plan zapisany w bazie z `status = 'draft'`
- Przekierowanie do listy planów
- Nowy plan widoczny na liście ze statusem "Roboczy"
- Fixed point zapisany w tabeli `fixed_points`

#### Test 2: Utworzenie i wygenerowanie planu (pełny flow)

**Kroki:**
1-7. Jak w Test 1 8. **Krok 4 - Summary:**

- Kliknij "Generuj plan"
- Czekaj na loader (maks 20s)

**Oczekiwany rezultat:**

- Wyświetlenie loadera z animacją
- Wywołanie API `/api/plans/[id]/generate` BEZ mockowania
- Po sukcesie: przekierowanie do `/plans/[id]`
- Plan ma `status = 'generated'`
- Tabela `generated_plan_days` zawiera wygenerowane dni
- Tabela `plan_activities` zawiera aktywności
- Licznik generacji zmniejszony o 1

#### Test 3: Walidacja formularza - brak wymaganych pól

**Kroki:**

1. Zaloguj się
2. Otwórz modal tworzenia planu
3. Kliknij "Dalej" bez wypełnienia pól

**Oczekiwany rezultat:**

- Wyświetlenie błędów walidacji
- Niemożność przejścia do następnego kroku
- Komunikaty: "Cel podróży jest wymagany", "Miesiąc jest wymagany"

#### Test 4: Walidacja - data fixed point poza zakresem planu

**Kroki:**

1. Zaloguj się
2. Utwórz plan na czerwiec 2026
3. W kroku Fixed Points dodaj punkt z datą: "01.08.2026"

**Oczekiwany rezultat:**

- Wyświetlenie błędu: "Data punktu musi być w zakresie dat planu"
- Niemożność zapisania punktu

#### Test 5: Anulowanie tworzenia planu

**Kroki:**

1. Zaloguj się
2. Otwórz modal tworzenia planu
3. Wypełnij część formularza
4. Kliknij "Anuluj" lub zamknij modal

**Oczekiwany rezultat:**

- Modal zamyka się
- Dane NIE są zapisane w bazie
- Pozostanie na `/plans`

---

### 3.2. Lista planów (plans-list.spec.ts)

#### Test 1: Wyświetlanie pustej listy planów

**Kroki:**

1. Zaloguj się jako nowy użytkownik (bez planów)
2. Przejdź do `/plans`

**Oczekiwany rezultat:**

- Wyświetlenie empty state
- Komunikat: "Nie masz jeszcze żadnych planów"
- Przycisk "Utwórz pierwszy plan" widoczny

#### Test 2: Wyświetlanie listy planów użytkownika

**Kroki:**

1. Utwórz użytkownika z 3 planami (fixture):
   - Plan 1: draft, "Rzym"
   - Plan 2: generated, "Barcelona"
   - Plan 3: archived, "Praga"
2. Zaloguj się
3. Przejdź do `/plans`

**Oczekiwany rezultat:**

- Lista zawiera 2 plany (Rzym, Barcelona)
- Archived nie jest wyświetlony (jest w historii)
- Każdy plan pokazuje: nazwę, cel, daty, status
- Plany posortowane: najnowsze na górze

#### Test 3: Filtrowanie planów (jeśli zaimplementowane)

**Kroki:**

1. Użytkownik z 5 planami: 3 draft, 2 generated
2. Zaloguj się
3. Filtruj po statusie: "Wygenerowane"

**Oczekiwany rezultat:**

- Lista pokazuje tylko 2 plany generated

#### Test 4: Kliknięcie w plan przekierowuje do szczegółów

**Kroki:**

1. Użytkownik z planami
2. Zaloguj się
3. Kliknij na plan z listy

**Oczekiwany rezultat:**

- Przekierowanie do `/plans/[id]`
- Wyświetlenie szczegółów planu

---

### 3.3. Szczegóły planu (plan-details.spec.ts)

#### Test 1: Wyświetlanie szczegółów planu draft

**Kroki:**

1. Utwórz plan draft (fixture)
2. Zaloguj się
3. Przejdź do `/plans/[id]`

**Oczekiwany rezultat:**

- Wyświetlenie nagłówka z nazwą planu
- Wyświetlenie podstawowych info: cel, daty, opis
- Wyświetlenie fixed points (jeśli są)
- Wyświetlenie preferencji
- Przycisk "Generuj plan" widoczny
- Brak wygenerowanego harmonogramu (bo draft)

#### Test 2: Wyświetlanie szczegółów planu generated

**Kroki:**

1. Utwórz plan generated z aktywnościami (fixture)
2. Zaloguj się
3. Przejdź do `/plans/[id]`

**Oczekiwany rezultat:**

- Wyświetlenie nagłówka z nazwą planu
- Wyświetlenie harmonogramu (timeline)
- Każdy dzień widoczny z aktywnościami
- Aktywności pokazują: nazwę, czas, lokalizację, kategorię
- Przyciski akcji: "Edytuj", "Usuń", "Eksportuj do PDF"

#### Test 3: Próba dostępu do nieistniejącego planu

**Kroki:**

1. Zaloguj się
2. Przejdź do `/plans/non-existent-id`

**Oczekiwany rezultat:**

- Wyświetlenie błędu 404
- Lub przekierowanie do `/plans` z komunikatem błędu

---

### 3.4. Edycja nazwy planu (edit-plan-name.spec.ts)

#### Test 1: Zmiana nazwy planu (inline editing)

**Kroki:**

1. Utwórz plan z nazwą "Wycieczka do Paryża"
2. Zaloguj się
3. Przejdź do `/plans/[id]`
4. Kliknij ikonę edycji obok nazwy
5. Zmień nazwę na "Romantyczny weekend w Paryżu"
6. Zapisz (Enter lub kliknij poza pole)

**Oczekiwany rezultat:**

- Nazwa planu zaktualizowana w bazie
- Nowa nazwa widoczna w nagłówku
- Nowa nazwa widoczna na liście planów
- Toast notification: "Nazwa planu zaktualizowana"

#### Test 2: Anulowanie edycji nazwy (Escape)

**Kroki:**

1. Utwórz plan
2. Przejdź do szczegółów
3. Kliknij edycję nazwy
4. Zmień nazwę
5. Naciśnij Escape

**Oczekiwany rezultat:**

- Edycja anulowana
- Oryginalna nazwa przywrócona
- Brak zmian w bazie

#### Test 3: Walidacja - pusta nazwa

**Kroki:**

1. Utwórz plan
2. Przejdź do szczegółów
3. Kliknij edycję nazwy
4. Usuń całą nazwę (zostaw puste)
5. Próbuj zapisać

**Oczekiwany rezultat:**

- Wyświetlenie błędu: "Nazwa nie może być pusta"
- Nazwa NIE jest zapisana
- Przywrócenie oryginalnej nazwy

---

### 3.5. Usuwanie planu (delete-plan.spec.ts)

#### Test 1: Usunięcie planu z listy

**Kroki:**

1. Utwórz plan
2. Zaloguj się
3. Przejdź do `/plans`
4. Kliknij menu akcji (⋮) przy planie
5. Wybierz "Usuń"
6. W modalu potwierdzenia kliknij "Usuń"

**Oczekiwany rezultat:**

- Modal potwierdzenia wyświetlony z tekstem: "Czy na pewno chcesz usunąć ten plan?"
- Po potwierdzeniu: plan usunięty z bazy
- Plan znika z listy
- Toast notification: "Plan usunięty"

#### Test 2: Anulowanie usunięcia

**Kroki:**
1-5. Jak w Test 1 6. W modalu kliknij "Anuluj"

**Oczekiwany rezultat:**

- Modal zamyka się
- Plan NIE jest usunięty
- Plan nadal widoczny na liście

#### Test 3: Usunięcie planu ze szczegółów

**Kroki:**

1. Utwórz plan
2. Przejdź do `/plans/[id]`
3. Kliknij menu akcji w nagłówku
4. Wybierz "Usuń plan"
5. Potwierdź w modalu

**Oczekiwany rezultat:**

- Plan usunięty z bazy
- Przekierowanie do `/plans`
- Toast notification: "Plan usunięty"

#### Test 4: Usunięcie planu z fixed points i aktywnościami (kaskadowe)

**Kroki:**

1. Utwórz plan generated z fixed points i aktywnościami
2. Usuń plan

**Oczekiwany rezultat:**

- Plan usunięty
- Wszystkie powiązane fixed_points usunięte (CASCADE)
- Wszystkie powiązane generated_plan_days usunięte
- Wszystkie powiązane plan_activities usunięte
- Weryfikacja w bazie: `SELECT COUNT(*)` = 0 dla tych tabel

---

### 3.6. Row Level Security (plan-rls.spec.ts)

#### Test 1: Użytkownik widzi tylko swoje plany na liście

**Kroki:**

1. Utwórz User A z planem "Plan A"
2. Utwórz User B z planem "Plan B"
3. Zaloguj się jako User A
4. Przejdź do `/plans`

**Oczekiwany rezultat:**

- Lista zawiera tylko "Plan A"
- "Plan B" NIE jest widoczny

#### Test 2: Próba dostępu do planu innego użytkownika (URL manipulation)

**Kroki:**

1. Utwórz User A z planem (plan_id_A)
2. Utwórz User B z planem (plan_id_B)
3. Zaloguj się jako User A
4. Ręcznie przejdź do `/plans/{plan_id_B}` (plan User B)

**Oczekiwany rezultat:**

- Wyświetlenie błędu 403 Forbidden lub 404
- Lub przekierowanie do `/plans` z komunikatem: "Brak dostępu do tego planu"
- API zwraca 403

#### Test 3: Próba edycji nazwy planu innego użytkownika (API call)

**Kroki:**

1. Utwórz User A
2. Utwórz User B z planem (plan_id_B)
3. Zaloguj się jako User A
4. Bezpośrednie wywołanie API: `PATCH /api/plans/{plan_id_B}` z nową nazwą

**Oczekiwany rezultat:**

- API zwraca 403 Forbidden
- Plan NIE jest zaktualizowany w bazie
- RLS blokuje operację

#### Test 4: Próba usunięcia planu innego użytkownika (API call)

**Kroki:**

1. Utwórz User A
2. Utwórz User B z planem (plan_id_B)
3. Zaloguj się jako User A
4. Bezpośrednie wywołanie API: `DELETE /api/plans/{plan_id_B}`

**Oczekiwany rezultat:**

- API zwraca 403 Forbidden
- Plan NIE jest usunięty
- RLS blokuje operację

---

## 4. Page Objects do implementacji

### 4.1. PlansListPage.ts

```typescript
export class PlansListPage {
  readonly page: Page;
  readonly createPlanButton: Locator;
  readonly planCards: Locator;
  readonly emptyState: Locator;
  readonly filterDropdown: Locator;

  constructor(page: Page) {
    this.page = page;
    this.createPlanButton = page.locator('[data-testid="create-plan-button"]');
    this.planCards = page.locator('[data-testid="plan-card"]');
    this.emptyState = page.locator('[data-testid="empty-state"]');
    this.filterDropdown = page.locator('[data-testid="filter-dropdown"]');
  }

  async goto() {
    await this.page.goto('/plans');
  }

  async getPlanCount(): Promise<number> {
    return await this.planCards.count();
  }

  async getPlanByName(name: string): Locator {
    return this.page.locator(`[data-testid="plan-card"]:has-text("${name}")`);
  }

  async clickPlan(name: string) {
    await this.getPlanByName(name).click();
  }

  async deletePlan(planName: string) {
    const planCard = this.getPlanByName(planName);
    await planCard.locator('[data-testid="plan-menu"]').click();
    await this.page.locator('[data-testid="delete-plan-action"]').click();
    // Confirm in modal
    await this.page.locator('[data-testid="confirm-delete"]').click();
  }

  async isEmptyStateVisible(): Promise<boolean> {
    return await this.emptyState.isVisible();
  }

  async filterByStatus(status: 'draft' | 'generated') {
    await this.filterDropdown.click();
    await this.page.locator(`[data-testid="filter-${status}"]`).click();
  }
}
```

### 4.2. PlanDetailsPage.ts

```typescript
export class PlanDetailsPage {
  readonly page: Page;
  readonly planTitle: Locator;
  readonly editTitleButton: Locator;
  readonly titleInput: Locator;
  readonly destination: Locator;
  readonly dates: Locator;
  readonly timeline: Locator;
  readonly activities: Locator;
  readonly generateButton: Locator;
  readonly exportButton: Locator;
  readonly deleteButton: Locator;

  constructor(page: Page) {
    this.page = page;
    this.planTitle = page.locator('[data-testid="plan-title"]');
    this.editTitleButton = page.locator('[data-testid="edit-title-button"]');
    this.titleInput = page.locator('[data-testid="title-input"]');
    this.destination = page.locator('[data-testid="plan-destination"]');
    this.dates = page.locator('[data-testid="plan-dates"]');
    this.timeline = page.locator('[data-testid="plan-timeline"]');
    this.activities = page.locator('[data-testid="activity-item"]');
    this.generateButton = page.locator('[data-testid="generate-plan-button"]');
    this.exportButton = page.locator('[data-testid="export-pdf-button"]');
    this.deleteButton = page.locator('[data-testid="delete-plan-button"]');
  }

  async goto(planId: string) {
    await this.page.goto(`/plans/${planId}`);
  }

  async editTitle(newTitle: string) {
    await this.editTitleButton.click();
    await this.titleInput.fill(newTitle);
    await this.titleInput.press('Enter');
  }

  async cancelTitleEdit() {
    await this.editTitleButton.click();
    await this.titleInput.press('Escape');
  }

  async getTitle(): Promise<string> {
    return (await this.planTitle.textContent()) || '';
  }

  async getActivityCount(): Promise<number> {
    return await this.activities.count();
  }

  async deletePlan() {
    await this.deleteButton.click();
    await this.page.locator('[data-testid="confirm-delete"]').click();
  }

  async generatePlan() {
    await this.generateButton.click();
    // Wait for generation to complete (loader disappears)
    await this.page.locator('[data-testid="generation-loader"]').waitFor({ state: 'hidden', timeout: 30000 });
  }
}
```

### 4.3. NewPlanPage.ts (refaktoryzacja - bez mocków)

```typescript
export class NewPlanPage {
  readonly page: Page;
  readonly createNewPlanButton: Locator;
  readonly modal: Locator;

  // Step 1: Basic Info
  readonly nameInput: Locator;
  readonly destinationInput: Locator;
  readonly monthSelect: Locator;
  readonly descriptionTextarea: Locator;
  readonly nextButton: Locator;

  // Step 2: Fixed Points
  readonly addFixedPointButton: Locator;
  readonly fixedPointLocationInput: Locator;
  readonly fixedPointDateInput: Locator;
  readonly fixedPointTimeInput: Locator;
  readonly saveFixedPointButton: Locator;

  // Step 3: Preferences
  readonly preferenceCheckboxes: Locator;
  readonly travelPaceRadios: Locator;

  // Step 4: Summary
  readonly saveDraftButton: Locator;
  readonly generateButton: Locator;
  readonly cancelButton: Locator;

  constructor(page: Page) {
    this.page = page;
    this.createNewPlanButton = page.locator('[data-testid="create-new-plan-button"]');
    this.modal = page.locator('[data-testid="new-plan-modal"]');

    // Basic Info
    this.nameInput = page.locator('[name="name"]');
    this.destinationInput = page.locator('[name="destination"]');
    this.monthSelect = page.locator('[name="month"]');
    this.descriptionTextarea = page.locator('[name="description"]');
    this.nextButton = page.locator('button:has-text("Dalej")');

    // Fixed Points
    this.addFixedPointButton = page.locator('[data-testid="add-fixed-point"]');
    this.fixedPointLocationInput = page.locator('[name="fixedpoint-location"]');
    this.fixedPointDateInput = page.locator('[name="fixedpoint-date"]');
    this.fixedPointTimeInput = page.locator('[name="fixedpoint-time"]');
    this.saveFixedPointButton = page.locator('[data-testid="save-fixed-point"]');

    // Preferences
    this.preferenceCheckboxes = page.locator('[data-testid^="preference-"]');
    this.travelPaceRadios = page.locator('[name="travel-pace"]');

    // Summary
    this.saveDraftButton = page.locator('[data-testid="save-draft"]');
    this.generateButton = page.locator('[data-testid="generate-plan"]');
    this.cancelButton = page.locator('[data-testid="cancel-plan"]');
  }

  async openNewPlanModal() {
    await this.createNewPlanButton.click();
    await this.modal.waitFor({ state: 'visible' });
  }

  async fillBasicInfo(name: string, destination: string, month?: string, description?: string) {
    await this.nameInput.fill(name);
    await this.destinationInput.fill(destination);
    if (month) {
      await this.monthSelect.selectOption(month);
    }
    if (description) {
      await this.descriptionTextarea.fill(description);
    }
  }

  async goToNextStep() {
    await this.nextButton.click();
  }

  async addFixedPoint(location: string, date: string, time: string) {
    await this.addFixedPointButton.click();
    await this.fixedPointLocationInput.fill(location);
    await this.fixedPointDateInput.fill(date);
    await this.fixedPointTimeInput.fill(time);
    await this.saveFixedPointButton.click();
  }

  async selectPreferences(preferences: string[]) {
    for (const pref of preferences) {
      await this.page.locator(`[data-testid="preference-${pref}"]`).check();
    }
  }

  async selectTravelPace(pace: 'slow' | 'moderate' | 'fast') {
    await this.page.locator(`[value="${pace}"]`).check();
  }

  async saveDraft() {
    await this.saveDraftButton.click();
    await this.modal.waitFor({ state: 'hidden' });
  }

  async generatePlan() {
    await this.generateButton.click();
    // Wait for modal to close and navigation
    await this.modal.waitFor({ state: 'hidden', timeout: 30000 });
  }

  async cancel() {
    await this.cancelButton.click();
    await this.modal.waitFor({ state: 'hidden' });
  }
}
```

---

## 5. Rozszerzenie fixtures.ts

### Nowe helpery:

```typescript
// Helper do tworzenia planu testowego
export async function createTestPlan(
  supabase: SupabaseClient,
  userId: string,
  options: {
    name?: string;
    destination?: string;
    status?: 'draft' | 'generated' | 'archived';
    month?: string;
    withFixedPoints?: boolean;
    withActivities?: boolean;
  }
): Promise<{ planId: string; fixedPointIds?: string[]; activityIds?: string[] }> {
  const { data: plan, error } = await supabase
    .from('plans')
    .insert({
      user_id: userId,
      name: options.name || 'Test Plan',
      destination: options.destination || 'Test City',
      status: options.status || 'draft',
      month: options.month || 'June',
      description: 'Test plan description',
    })
    .select()
    .single();

  if (error) throw error;

  const result: any = { planId: plan.id };

  // Add fixed points if requested
  if (options.withFixedPoints) {
    const { data: fixedPoints } = await supabase
      .from('fixed_points')
      .insert([
        {
          plan_id: plan.id,
          location: 'Test Location 1',
          date: '2026-06-15',
          time: '10:00',
        },
      ])
      .select();
    result.fixedPointIds = fixedPoints?.map((fp) => fp.id) || [];
  }

  // Add activities if requested (requires generated status)
  if (options.withActivities && options.status === 'generated') {
    const { data: day } = await supabase
      .from('generated_plan_days')
      .insert({
        plan_id: plan.id,
        day_number: 1,
        date: '2026-06-15',
      })
      .select()
      .single();

    const { data: activities } = await supabase
      .from('plan_activities')
      .insert([
        {
          plan_day_id: day.id,
          title: 'Activity 1',
          start_time: '09:00',
          duration_minutes: 120,
          category: 'sightseeing',
        },
      ])
      .select();
    result.activityIds = activities?.map((a) => a.id) || [];
  }

  return result;
}

// Helper do czyszczenia planów
export async function cleanUserPlans(supabase: SupabaseClient, userId: string) {
  // Cascade delete will handle related records
  await supabase.from('plans').delete().eq('user_id', userId);
}

// Helper do weryfikacji RLS
export async function verifyPlanNotAccessible(supabase: SupabaseClient, planId: string): Promise<boolean> {
  const { data, error } = await supabase.from('plans').select('*').eq('id', planId).single();

  return error !== null || data === null;
}
```

---

## 6. Kolejność implementacji

### Etap 1: Tworzenie planów (1-2 dni)

1. ✅ Refaktoryzacja `NewPlanPage.ts` - usunięcie mocków
2. ✅ Implementacja `create-plan-full.spec.ts` - wszystkie przypadki
3. ✅ Testy walidacji formularza

### Etap 2: Lista i szczegóły (1 dzień)

4. ✅ Utworzenie `PlansListPage.ts`
5. ✅ Implementacja `plans-list.spec.ts`
6. ✅ Utworzenie `PlanDetailsPage.ts`
7. ✅ Implementacja `plan-details.spec.ts`

### Etap 3: Edycja i usuwanie (1 dzień)

8. ✅ Implementacja `edit-plan-name.spec.ts`
9. ✅ Implementacja `delete-plan.spec.ts`

### Etap 4: RLS (1 dzień)

10. ✅ Implementacja `plan-rls.spec.ts`
11. ✅ Helpery do tworzenia wielu użytkowników w fixtures

---

## 7. Wymagane zmiany w aplikacji

### Dodać data-testid w komponentach:

1. **PlansListPage** (`src/pages/plans.astro` + `PlansDashboard.tsx`):
   - `data-testid="create-plan-button"`
   - `data-testid="plan-card"`
   - `data-testid="empty-state"`
   - `data-testid="filter-dropdown"`
   - `data-testid="plan-menu"`
   - `data-testid="delete-plan-action"`

2. **PlanDetailsView** (`src/components/PlanDetailsView.tsx`):
   - `data-testid="plan-title"`
   - `data-testid="edit-title-button"`
   - `data-testid="title-input"`
   - `data-testid="plan-destination"`
   - `data-testid="plan-dates"`
   - `data-testid="plan-timeline"`
   - `data-testid="activity-item"`
   - `data-testid="generate-plan-button"`
   - `data-testid="export-pdf-button"`
   - `data-testid="delete-plan-button"`

3. **NewPlanForm** (rozszerzenie istniejących):
   - `data-testid="new-plan-modal"`
   - `data-testid="save-draft"`
   - `data-testid="generate-plan"`
   - `data-testid="cancel-plan"`

4. **ConfirmDialog** (dla usuwania):
   - `data-testid="confirm-delete"`
   - `data-testid="cancel-delete"`

---

## 8. Konfiguracja testów

### Supabase test helpers

```typescript
// Test helper do bezpośrednich zapytań SQL dla RLS testing
export async function executeSQL(supabase: SupabaseClient, query: string) {
  const { data, error } = await supabase.rpc('execute_sql', { query });
  if (error) throw error;
  return data;
}
```

---

## 9. Metryki sukcesu

- ✅ Wszystkie testy przechodzą bez mocków API
- ✅ RLS poprawnie blokuje nieautoryzowany dostęp
- ✅ Cascade delete działa poprawnie
- ✅ Walidacja formularzy pokryta testami
- ✅ Czas wykonania < 3 minuty

---

## 10. Potencjalne problemy i rozwiązania

### Problem 1: Generowanie planu zajmuje > 20s

**Rozwiązanie:**

- Zwiększyć timeout dla tego konkretnego testu
- Mockować OpenRouter API tylko dla testów wydajnościowych
- Używać mniejszych planów (1 dzień zamiast 3)

### Problem 2: Flaky tests przez timing

**Rozwiązanie:**

- Używać `waitFor` zamiast `sleep`
- Czekać na konkretne elementy DOM
- Używać `page.waitForResponse()` dla API calls

### Problem 3: Cleanup między testami

**Rozwiązanie:**

- Używać transakcji (rollback po teście)
- Lub czyścić bazę w `afterEach`
- Lub używać unikalnych user_id dla każdego testu

---

## 11. Checklist przed rozpoczęciem

- [ ] Sprawdzenie istniejących API endpoints dla planów
- [ ] Weryfikacja polityk RLS w Supabase
- [ ] Dodanie data-testid do komponentów
- [ ] Utworzenie fixtures dla planów i użytkowników
- [ ] Konfiguracja timeoutów dla długich operacji
- [ ] Decyzja: mockować OpenRouter czy używać prawdziwego API?
