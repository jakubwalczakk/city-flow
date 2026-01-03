# Plan Implementacji Testów E2E - Edycja Planu

## 1. Zakres testów

Testy E2E pokrywające edycję wygenerowanego planu:

- Dodawanie własnych aktywności
- Edycja istniejących aktywności (AI i własnych)
- Usuwanie aktywności z planu
- Zmiana kolejności aktywności
- Walidacja czasu i konfliktów

## 2. Struktura plików

```
e2e/
├── plan-editing/
│   ├── add-activity.spec.ts        # US-041
│   ├── edit-activity.spec.ts       # US-042
│   ├── delete-activity.spec.ts     # US-040
│   └── activity-validation.spec.ts # Walidacja i konflikty
├── page-objects/
│   ├── PlanTimelinePage.ts         # Nowy
│   ├── ActivityFormModal.ts        # Nowy
│   └── PlanDetailsPage.ts          # Rozszerzenie
└── fixtures.ts                     # Rozszerzenie
```

## 3. Przypadki testowe

### 3.1. Dodawanie aktywności (add-activity.spec.ts)

#### Test 1: Dodanie własnej aktywności do pustego dnia

**Kroki:**

1. Utwórz plan generated z 1 dniem bez aktywności
2. Zaloguj się
3. Przejdź do `/plans/[id]`
4. Kliknij "Dodaj aktywność" dla Dnia 1
5. Wypełnij formularz:
   - Tytuł: "Lunch w restauracji Le Marais"
   - Lokalizacja: "Dzielnica Le Marais, Paryż"
   - Godzina rozpoczęcia: "12:30"
   - Czas trwania: "90 minut"
   - Kategoria: "Jedzenie"
   - Opis: "Lunch w lokalnej restauracji"
6. Kliknij "Dodaj"

**Oczekiwany rezultat:**

- Aktywność zapisana w bazie (`plan_activities`)
- Aktywność widoczna na timeline
- Aktywność posortowana chronologicznie (12:30)
- Toast: "Aktywność dodana"
- Modal zamknięty

#### Test 2: Dodanie aktywności między istniejącymi

**Kroki:**

1. Utwórz plan z aktywnościami:
   - 09:00-11:00: "Muzeum Luwr"
   - 14:00-16:00: "Wieża Eiffla"
2. Dodaj aktywność:
   - 12:00-13:00: "Lunch"

**Oczekiwany rezultat:**

- 3 aktywności widoczne na timeline
- Kolejność chronologiczna: Luwr → Lunch → Wieża
- Lunch wyświetlany między dwoma istniejącymi

#### Test 3: Dodanie aktywności z minimalnym formularzem

**Kroki:**

1. Otwórz formularz dodawania
2. Wypełnij tylko wymagane pola:
   - Tytuł: "Spacer po Montmartre"
   - Godzina: "16:00"
3. Kliknij "Dodaj"

**Oczekiwany rezultat:**

- Aktywność dodana z domyślnymi wartościami:
  - Czas trwania: 60 minut (domyślny)
  - Kategoria: "inne" (domyślna)
  - Lokalizacja: pusta (opcjonalna)

#### Test 4: Anulowanie dodawania aktywności

**Kroki:**

1. Kliknij "Dodaj aktywność"
2. Wypełnij formularz
3. Kliknij "Anuluj" lub zamknij modal

**Oczekiwany rezultat:**

- Modal zamknięty
- Aktywność NIE jest zapisana
- Timeline bez zmian

---

### 3.2. Edycja aktywności (edit-activity.spec.ts)

#### Test 1: Edycja aktywności wygenerowanej przez AI

**Kroki:**

1. Utwórz plan z aktywością AI:
   - "Wizyta w Muzeum Luwr", 10:00, 120 min
2. Kliknij ikonę edycji przy aktywności
3. Zmień dane:
   - Godzina: 09:00
   - Czas trwania: 180 min
   - Dodaj notatkę: "Kupić bilety online wcześniej"
4. Zapisz

**Oczekiwany rezultat:**

- Aktywność zaktualizowana w bazie
- Nowe dane widoczne na timeline
- Aktywność przesunięta chronologicznie (jeśli zmienił się czas)
- Toast: "Aktywność zaktualizowana"

#### Test 2: Edycja własnej aktywności

**Kroki:**

1. Dodaj własną aktywność
2. Edytuj ją (zmień tytuł i lokalizację)
3. Zapisz

**Oczekiwany rezultat:**

- Wszystkie zmiany zapisane
- Brak utraty danych

#### Test 3: Zmiana kategorii aktywności

**Kroki:**

1. Aktywność z kategorią "jedzenie"
2. Edytuj: zmień kategorię na "kultura"

**Oczekiwany rezultat:**

- Kategoria zaktualizowana
- Ikona kategorii zmieniona na timeline
- Kolor/styl aktywności odzwierciedla nową kategorię

#### Test 4: Anulowanie edycji (Escape)

**Kroki:**

1. Otwórz edycję aktywności
2. Zmień dane
3. Naciśnij Escape

**Oczekiwany rezultat:**

- Modal zamknięty
- Zmiany NIE są zapisane
- Oryginalne dane pozostają

---

### 3.3. Usuwanie aktywności (delete-activity.spec.ts)

#### Test 1: Usunięcie aktywności wygenerowanej przez AI

**Kroki:**

1. Plan z 3 aktywnościami AI
2. Kliknij ikonę kosza przy drugiej aktywności
3. Potwierdź w modalu

**Oczekiwany rezultat:**

- Modal potwierdzenia: "Czy na pewno chcesz usunąć tę aktywność?"
- Aktywność usunięta z bazy
- Timeline pokazuje 2 aktywności
- Toast: "Aktywność usunięta"

#### Test 2: Usunięcie własnej aktywności

**Kroki:**

1. Dodaj własną aktywność
2. Usuń ją

**Oczekiwany rezultat:**

- Identyczne działanie jak w Test 1

#### Test 3: Anulowanie usunięcia

**Kroki:**

1. Kliknij usuwanie
2. W modalu kliknij "Anuluj"

**Oczekiwany rezultat:**

- Modal zamknięty
- Aktywność NIE jest usunięta

#### Test 4: Usunięcie wszystkich aktywności z dnia

**Kroki:**

1. Dzień z 3 aktywnościami
2. Usuń wszystkie po kolei

**Oczekiwany rezultat:**

- Wszystkie aktywności usunięte
- Dzień wciąż widoczny (ale pusty)
- Możliwość dodania nowych aktywności
- Komunikat: "Brak aktywności w tym dniu" lub przycisk "Dodaj pierwszą aktywność"

---

### 3.4. Walidacja i konflikty (activity-validation.spec.ts)

#### Test 1: Walidacja - pusta nazwa

**Kroki:**

1. Otwórz formularz dodawania
2. Pozostaw tytuł pusty
3. Wypełnij resztę
4. Próbuj zapisać

**Oczekiwany rezultat:**

- Błąd walidacji: "Tytuł jest wymagany"
- Niemożność zapisania
- Focus na polu tytułu

#### Test 2: Walidacja - czas trwania <= 0

**Kroki:**

1. Otwórz formularz
2. Czas trwania: "-10" lub "0"
3. Próbuj zapisać

**Oczekiwany rezultat:**

- Błąd: "Czas trwania musi być większy niż 0"

#### Test 3: Walidacja - niepoprawny format godziny

**Kroki:**

1. Otwórz formularz
2. Godzina: "25:00" lub "abc"
3. Próbuj zapisać

**Oczekiwany rezultat:**

- Błąd: "Niepoprawny format godziny"
- Lub niemożność wprowadzenia (input type="time")

#### Test 4: Ostrzeżenie o nakładaniu się aktywności

**Kroki:**

1. Plan z aktywnością: 10:00-12:00 "Muzeum"
2. Dodaj nową: 11:00-13:00 "Lunch"
3. Próbuj zapisać

**Oczekiwany rezultat:**

- Wyświetlenie ostrzeżenia (nie błędu!): "Ta aktywność nakłada się z: Muzeum (10:00-12:00)"
- Możliwość zapisania mimo ostrzeżenia (użytkownik decyduje)
- Lub: automatyczna sugestia zmienionego czasu

#### Test 5: Aktywność wykraczająca poza dzień (po północy)

**Kroki:**

1. Dzień 1 (15 czerwca)
2. Dodaj aktywność: 23:00, czas trwania 180 min (kończy się 02:00 następnego dnia)

**Oczekiwany rezultat:**

- Opcja A: Ostrzeżenie: "Aktywność kończy się następnego dnia"
- Opcja B: Automatyczne przycięcie do 23:59
- Opcja C: Możliwość zapisania (użytkownik ma świadomość)

#### Test 6: Aktywność zaczyna się przed początkiem dnia

**Kroki:**

1. Dodaj aktywność z godziną "00:00" lub bardzo wczesną (04:00)

**Oczekiwany rezultat:**

- Aktywność zapisana (jeśli to świadoma decyzja użytkownika)
- Lub ostrzeżenie: "Bardzo wczesna godzina"

---

## 4. Page Objects do implementacji

### 4.1. PlanTimelinePage.ts

```typescript
export class PlanTimelinePage {
  readonly page: Page;
  readonly timeline: Locator;
  readonly days: Locator;
  readonly activities: Locator;

  constructor(page: Page) {
    this.page = page;
    this.timeline = page.locator('[data-testid="plan-timeline"]');
    this.days = page.locator('[data-testid="plan-day"]');
    this.activities = page.locator('[data-testid="activity-item"]');
  }

  async goto(planId: string) {
    await this.page.goto(`/plans/${planId}`);
  }

  async addActivityToDay(dayNumber: number) {
    const day = this.days.nth(dayNumber - 1);
    await day.locator('[data-testid="add-activity-button"]').click();
  }

  async getActivity(title: string): Promise<Locator> {
    return this.activities.filter({ hasText: title });
  }

  async editActivity(title: string) {
    const activity = await this.getActivity(title);
    await activity.locator('[data-testid="edit-activity"]').click();
  }

  async deleteActivity(title: string) {
    const activity = await this.getActivity(title);
    await activity.locator('[data-testid="delete-activity"]').click();
    // Confirm deletion
    await this.page.locator('[data-testid="confirm-delete"]').click();
  }

  async getActivitiesCount(): Promise<number> {
    return await this.activities.count();
  }

  async getActivitiesByDay(dayNumber: number): Promise<number> {
    const day = this.days.nth(dayNumber - 1);
    return await day.locator('[data-testid="activity-item"]').count();
  }

  async getActivityTime(title: string): Promise<string> {
    const activity = await this.getActivity(title);
    return (await activity.locator('[data-testid="activity-time"]').textContent()) || '';
  }

  async isActivityVisible(title: string): Promise<boolean> {
    const activity = await this.getActivity(title);
    return await activity.isVisible();
  }
}
```

### 4.2. ActivityFormModal.ts

```typescript
export class ActivityFormModal {
  readonly page: Page;
  readonly modal: Locator;
  readonly titleInput: Locator;
  readonly locationInput: Locator;
  readonly startTimeInput: Locator;
  readonly durationInput: Locator;
  readonly categorySelect: Locator;
  readonly descriptionTextarea: Locator;
  readonly saveButton: Locator;
  readonly cancelButton: Locator;
  readonly errorMessages: Locator;
  readonly warningMessages: Locator;

  constructor(page: Page) {
    this.page = page;
    this.modal = page.locator('[data-testid="activity-form-modal"]');
    this.titleInput = page.locator('[name="title"]');
    this.locationInput = page.locator('[name="location"]');
    this.startTimeInput = page.locator('[name="start_time"]');
    this.durationInput = page.locator('[name="duration"]');
    this.categorySelect = page.locator('[name="category"]');
    this.descriptionTextarea = page.locator('[name="description"]');
    this.saveButton = page.locator('[data-testid="save-activity"]');
    this.cancelButton = page.locator('[data-testid="cancel-activity"]');
    this.errorMessages = page.locator('[role="alert"]');
    this.warningMessages = page.locator('[data-testid="warning"]');
  }

  async fillForm(data: {
    title: string;
    location?: string;
    startTime: string;
    duration?: number;
    category?: string;
    description?: string;
  }) {
    await this.titleInput.fill(data.title);
    if (data.location) {
      await this.locationInput.fill(data.location);
    }
    await this.startTimeInput.fill(data.startTime);
    if (data.duration) {
      await this.durationInput.fill(data.duration.toString());
    }
    if (data.category) {
      await this.categorySelect.selectOption(data.category);
    }
    if (data.description) {
      await this.descriptionTextarea.fill(data.description);
    }
  }

  async save() {
    await this.saveButton.click();
    await this.modal.waitFor({ state: 'hidden' });
  }

  async cancel() {
    await this.cancelButton.click();
    await this.modal.waitFor({ state: 'hidden' });
  }

  async getErrorMessage(): Promise<string> {
    return (await this.errorMessages.first().textContent()) || '';
  }

  async getWarningMessage(): Promise<string> {
    return (await this.warningMessages.first().textContent()) || '';
  }

  async isVisible(): Promise<boolean> {
    return await this.modal.isVisible();
  }
}
```

---

## 5. Rozszerzenie fixtures.ts

### Nowe helpery:

```typescript
// Helper do tworzenia planu z aktywnościami
export async function createPlanWithActivities(
  supabase: SupabaseClient,
  userId: string,
  activities: Array<{
    dayNumber: number;
    title: string;
    startTime: string;
    duration: number;
    category?: string;
    location?: string;
  }>
): Promise<string> {
  // Create plan
  const { data: plan } = await supabase
    .from('plans')
    .insert({
      user_id: userId,
      name: 'Test Plan',
      destination: 'Paris',
      status: 'generated',
      month: 'June',
    })
    .select()
    .single();

  // Group activities by day
  const dayNumbers = [...new Set(activities.map((a) => a.dayNumber))];

  for (const dayNum of dayNumbers) {
    const { data: day } = await supabase
      .from('generated_plan_days')
      .insert({
        plan_id: plan.id,
        day_number: dayNum,
        date: `2026-06-${14 + dayNum}`,
      })
      .select()
      .single();

    const dayActivities = activities.filter((a) => a.dayNumber === dayNum);

    for (const activity of dayActivities) {
      await supabase.from('plan_activities').insert({
        plan_day_id: day.id,
        title: activity.title,
        start_time: activity.startTime,
        duration_minutes: activity.duration,
        category: activity.category || 'other',
        location: activity.location,
      });
    }
  }

  return plan.id;
}

// Helper do weryfikacji aktywności
export async function getActivityByTitle(supabase: SupabaseClient, planId: string, title: string) {
  const { data } = await supabase
    .from('plan_activities')
    .select('*, plan_day:generated_plan_days!inner(plan_id)')
    .eq('plan_day.plan_id', planId)
    .eq('title', title)
    .single();

  return data;
}

// Helper do liczenia aktywności w planie
export async function countActivities(supabase: SupabaseClient, planId: string): Promise<number> {
  const { count } = await supabase
    .from('plan_activities')
    .select('*, plan_day:generated_plan_days!inner(plan_id)', { count: 'exact', head: true })
    .eq('plan_day.plan_id', planId);

  return count || 0;
}
```

---

## 6. Kolejność implementacji

### Etap 1: Dodawanie aktywności (1-2 dni)

1. ✅ Utworzenie `ActivityFormModal.ts`
2. ✅ Utworzenie `PlanTimelinePage.ts`
3. ✅ Implementacja `add-activity.spec.ts`
4. ✅ Helpery w fixtures

### Etap 2: Edycja aktywności (1 dzień)

5. ✅ Rozszerzenie `ActivityFormModal` o tryb edycji
6. ✅ Implementacja `edit-activity.spec.ts`

### Etap 3: Usuwanie aktywności (0.5 dnia)

7. ✅ Implementacja `delete-activity.spec.ts`

### Etap 4: Walidacja (1 dzień)

8. ✅ Implementacja `activity-validation.spec.ts`
9. ✅ Testy nakładania się aktywności

---

## 7. Wymagane zmiany w aplikacji

### Dodać data-testid w komponentach:

1. **EventTimeline** (`src/components/EventTimeline.tsx`):
   - `data-testid="plan-timeline"`
   - `data-testid="plan-day"`
   - `data-testid="activity-item"`
   - `data-testid="add-activity-button"`
   - `data-testid="activity-time"`
   - `data-testid="edit-activity"`
   - `data-testid="delete-activity"`

2. **ActivityForm** (`src/components/ActivityForm.tsx`):
   - `data-testid="activity-form-modal"`
   - `data-testid="save-activity"`
   - `data-testid="cancel-activity"`
   - `data-testid="warning"` (dla ostrzeżeń o konfliktach)

3. **ConfirmDialog** (dla usuwania):
   - `data-testid="confirm-delete"`
   - `data-testid="cancel-delete"`

---

## 8. Logika walidacji do implementacji

### Frontend validation (ActivityForm):

```typescript
// Walidacja czasu trwania
if (duration <= 0) {
  setError('duration', 'Czas trwania musi być większy niż 0');
}

// Walidacja tytułu
if (!title.trim()) {
  setError('title', 'Tytuł jest wymagany');
}

// Detekcja nakładania się
const conflictingActivities = existingActivities.filter((activity) => {
  const activityStart = parseTime(activity.start_time);
  const activityEnd = activityStart + activity.duration_minutes;
  const newStart = parseTime(startTime);
  const newEnd = newStart + duration;

  return (
    (newStart >= activityStart && newStart < activityEnd) ||
    (newEnd > activityStart && newEnd <= activityEnd) ||
    (newStart <= activityStart && newEnd >= activityEnd)
  );
});

if (conflictingActivities.length > 0) {
  setWarning(`Nakłada się z: ${conflictingActivities[0].title}`);
  // Allow user to continue
}
```

---

## 9. Metryki sukcesu

- ✅ Wszystkie operacje CRUD na aktywnościach działają
- ✅ Walidacja formularza poprawnie blokuje nieprawidłowe dane
- ✅ Ostrzeżenia o konfliktach wyświetlane, ale nie blokują
- ✅ Timeline aktualizuje się w czasie rzeczywistym
- ✅ Brak race conditions przy szybkich edycjach

---

## 10. Potencjalne problemy i rozwiązania

### Problem 1: Race conditions przy szybkiej edycji

**Rozwiązanie:**

- Debouncing zapisów
- Optymistic updates w UI
- Proper loading states

### Problem 2: Sortowanie aktywności po zmianach

**Rozwiązanie:**

- Auto-sort po każdej zmianie (frontend)
- ORDER BY w query (backend)
- useEffect dependency na activities array

### Problem 3: Konflikt czasu - złożona logika

**Rozwiązanie:**

- Przenieść detekcję do custom hooka
- Testować edge cases (północ, długie aktywności)
- Wizualne wskazanie nakładających się aktywności na timeline

---

## 11. Checklist przed rozpoczęciem

- [ ] Przegląd komponentu EventTimeline
- [ ] Przegląd ActivityForm i jego hooka
- [ ] Dodanie data-testid do timeline i aktywności
- [ ] Implementacja logiki detekcji konfliktów
- [ ] Utworzenie fixtures dla planów z aktywnościami
- [ ] Konfiguracja testów z większymi timeoutami (generowanie)
