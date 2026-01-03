# Plan Implementacji Testów E2E - Feedback i Oceny

## 1. Zakres testów

Testy E2E pokrywające system feedbacku:

- Ocena planu (kciuki w górę/dół)
- Dodawanie komentarza tekstowego
- Zapisywanie feedbacku w bazie
- Edycja wcześniejszej oceny

## 2. Struktura plików

```
e2e/
├── feedback/
│   ├── rate-plan.spec.ts            # US-061
│   ├── submit-feedback.spec.ts      # US-062
│   └── feedback-persistence.spec.ts # Zapisywanie i edycja
├── page-objects/
│   ├── FeedbackModule.ts            # Nowy
│   └── PlanDetailsPage.ts           # Rozszerzenie
└── fixtures.ts                      # Rozszerzenie
```

## 3. Przypadki testowe

### 3.1. Ocena planu - kciuki (rate-plan.spec.ts)

#### Test 1: Ocena pozytywna (kciuk w górę)

**Kroki:**

1. Utwórz plan generated
2. Zaloguj się
3. Przejdź do `/plans/[id]`
4. Przewiń do modułu feedbacku
5. Kliknij "kciuk w górę" 👍

**Oczekiwany rezultat:**

- Kciuk w górę podświetlony/zaznaczony
- Kciuk w dół nieaktywny (szary)
- Feedback zapisany w bazie:
  - `feedback.plan_id = [id]`
  - `feedback.rating = 'positive'`
  - `feedback.user_id = [user_id]`
- Toast (opcjonalnie): "Dziękujemy za opinię!"

#### Test 2: Ocena negatywna (kciuk w dół)

**Kroki:**

1. Utwórz plan generated
2. Kliknij "kciuk w dół" 👎

**Oczekiwany rezultat:**

- Kciuk w dół podświetlony
- Kciuk w górę nieaktywny
- Feedback zapisany: `rating = 'negative'`
- Pole tekstowe "Co można poprawić?" pojawia się (opcjonalnie)

#### Test 3: Zmiana oceny (z pozytywnej na negatywną)

**Kroki:**

1. Oceń plan pozytywnie
2. Kliknij kciuk w dół

**Oczekiwany rezultat:**

- Kciuk w dół teraz podświetlony
- Kciuk w górę nieaktywny
- Feedback w bazie zaktualizowany: `rating = 'negative'`
- Nie tworzy się nowy rekord (UPDATE, nie INSERT)

#### Test 4: Cofnięcie oceny (kliknij ten sam kciuk ponownie)

**Kroki:**

1. Oceń plan pozytywnie (kciuk w górę)
2. Kliknij kciuk w górę ponownie

**Oczekiwany rezultat:**

- Opcja A: Ocena zostaje (nie można cofnąć)
- Opcja B: Ocena usunięta, oba kciuki nieaktywne
- Zalecenie: Opcja A (zachowanie oceny)

#### Test 5: Moduł feedbacku niewidoczny dla draft

**Kroki:**

1. Utwórz plan draft (niezgenerowany)
2. Przejdź do szczegółów

**Oczekiwany rezultat:**

- Moduł feedbacku niewidoczny
- Tylko plany generated mogą być oceniane

---

### 3.2. Komentarz tekstowy (submit-feedback.spec.ts)

#### Test 1: Dodanie komentarza bez oceny

**Kroki:**

1. Utwórz plan generated
2. Przejdź do szczegółów
3. NIE klikaj kciuków
4. Wypełnij pole tekstowe: "Plan był zbyt zagęszczony"
5. Kliknij "Wyślij"

**Oczekiwany rezultat:**

- Feedback zapisany w bazie:
  - `feedback.rating = NULL` (brak oceny kciukami)
  - `feedback.comment = "Plan był zbyt zagęszczony"`
- Toast: "Dziękujemy za opinię!"
- Pole tekstowe wyczyszczone

#### Test 2: Dodanie komentarza z oceną negatywną

**Kroki:**

1. Kliknij kciuk w dół
2. Wypełnij pole: "Zbyt mało czasu na jedzenie"
3. Kliknij "Wyślij"

**Oczekiwany rezultat:**

- Feedback zapisany:
  - `rating = 'negative'`
  - `comment = "Zbyt mało czasu na jedzenie"`
- Jeden rekord zawiera obie informacje

#### Test 3: Dodanie komentarza z oceną pozytywną

**Kroki:**

1. Kliknij kciuk w górę
2. Wypełnij pole: "Świetny plan, wszystko działało!"
3. Wyślij

**Oczekiwany rezultat:**

- Feedback zapisany z pozytywną oceną i komentarzem

#### Test 4: Edycja wcześniejszego komentarza

**Kroki:**

1. Wyślij feedback z komentarzem "Pierwotny komentarz"
2. Zmień tekst na "Zaktualizowany komentarz"
3. Wyślij ponownie

**Oczekiwany rezultat:**

- Feedback zaktualizowany w bazie (UPDATE)
- Nie tworzy się nowy rekord
- Nowy komentarz widoczny

#### Test 5: Walidacja - zbyt długi komentarz

**Kroki:**

1. Wypełnij pole tekstowe 2000 znakami
2. Próbuj wysłać

**Oczekiwany rezultat:**

- Błąd walidacji: "Komentarz może mieć maksymalnie 1000 znaków"
- Lub: Pole textarea ma maxlength="1000"
- Feedback NIE jest wysłany

#### Test 6: Wysłanie pustego komentarza

**Kroki:**

1. Pozostaw pole tekstowe puste
2. Kliknij "Wyślij"

**Oczekiwany rezultat:**

- Opcja A: Przycisk nieaktywny (brak tekstu)
- Opcja B: Feedback zapisany bez komentarza (tylko ocena)
- Zalecenie: Opcja B (dopuszczalne)

---

### 3.3. Persystencja feedbacku (feedback-persistence.spec.ts)

#### Test 1: Feedback zachowany po odświeżeniu strony

**Kroki:**

1. Oceń plan pozytywnie
2. Dodaj komentarz
3. Wyślij
4. Odśwież stronę (F5)

**Oczekiwany rezultat:**

- Kciuk w górę wciąż podświetlony
- Komentarz widoczny w polu (edytowalny)
- Dane załadowane z bazy

#### Test 2: Feedback widoczny po powrocie do planu

**Kroki:**

1. Oceń plan
2. Wróć do listy planów
3. Otwórz ten sam plan ponownie

**Oczekiwany rezultat:**

- Ocena i komentarz zachowane
- UI odzwierciedla wcześniejszy feedback

#### Test 3: Jeden feedback na plan na użytkownika

**Kroki:**

1. Użytkownik A ocenia plan
2. Użytkownik B ocenia ten sam plan

**Oczekiwany rezultat:**

- Dwa osobne rekordy feedbacku w bazie
- Każdy użytkownik widzi tylko swój feedback
- Unique constraint: (user_id, plan_id)

#### Test 4: Feedback nie jest widoczny dla innego użytkownika

**Kroki:**

1. User A ocenia plan User A
2. Zaloguj się jako User B
3. Spróbuj zobaczyć feedback User A

**Oczekiwany rezultat:**

- User B NIE widzi feedbacku User A
- Każdy użytkownik widzi tylko własny feedback dla własnych planów

#### Test 5: Feedback powiązany z parametrami generowania

**Uwaga:** To bardziej test bazy danych/schematu

**Kroki:**

1. Wygeneruj plan z określonymi parametrami (preferencje, fixed points)
2. Oceń plan
3. Sprawdź bazę danych

**Oczekiwany rezultat:**

- Feedback record zawiera (lub ma foreign key do):
  - `plan_id`
  - Parametry użyte do generowania (JSON lub oddzielne pola)
- Umożliwia analizę: "Plany z fixed points mają gorsze oceny"

---

## 4. Page Objects do implementacji

### 4.1. FeedbackModule.ts

```typescript
export class FeedbackModule {
  readonly page: Page;
  readonly module: Locator;
  readonly thumbsUpButton: Locator;
  readonly thumbsDownButton: Locator;
  readonly commentTextarea: Locator;
  readonly submitButton: Locator;
  readonly successMessage: Locator;
  readonly errorMessage: Locator;

  constructor(page: Page) {
    this.page = page;
    this.module = page.locator('[data-testid="feedback-module"]');
    this.thumbsUpButton = page.locator('[data-testid="thumbs-up"]');
    this.thumbsDownButton = page.locator('[data-testid="thumbs-down"]');
    this.commentTextarea = page.locator('[data-testid="feedback-comment"]');
    this.submitButton = page.locator('[data-testid="submit-feedback"]');
    this.successMessage = page.locator('[data-testid="feedback-success"]');
    this.errorMessage = page.locator('[data-testid="feedback-error"]');
  }

  async isVisible(): Promise<boolean> {
    return await this.module.isVisible();
  }

  async ratePositive() {
    await this.thumbsUpButton.click();
  }

  async rateNegative() {
    await this.thumbsDownButton.click();
  }

  async isThumbsUpActive(): Promise<boolean> {
    const className = await this.thumbsUpButton.getAttribute('class');
    return className?.includes('active') || className?.includes('selected') || false;
  }

  async isThumbsDownActive(): Promise<boolean> {
    const className = await this.thumbsDownButton.getAttribute('class');
    return className?.includes('active') || className?.includes('selected') || false;
  }

  async writeComment(text: string) {
    await this.commentTextarea.fill(text);
  }

  async getComment(): Promise<string> {
    return await this.commentTextarea.inputValue();
  }

  async submitFeedback() {
    await this.submitButton.click();
    // Wait for success message
    await this.successMessage.waitFor({ state: 'visible', timeout: 5000 });
  }

  async getSuccessMessage(): Promise<string> {
    return (await this.successMessage.textContent()) || '';
  }

  async getErrorMessage(): Promise<string> {
    return (await this.errorMessage.textContent()) || '';
  }
}
```

### 4.2. PlanDetailsPage.ts (rozszerzenie)

```typescript
// Dodaj do istniejącego:
export class PlanDetailsPage {
  // ... existing code ...

  readonly feedbackModule: FeedbackModule;

  constructor(page: Page) {
    // ... existing code ...
    this.feedbackModule = new FeedbackModule(page);
  }

  async scrollToFeedback() {
    await this.feedbackModule.module.scrollIntoViewIfNeeded();
  }
}
```

---

## 5. Rozszerzenie fixtures.ts

### Nowe helpery:

```typescript
// Helper do tworzenia feedbacku
export async function createFeedback(
  supabase: SupabaseClient,
  userId: string,
  planId: string,
  rating: 'positive' | 'negative' | null,
  comment?: string
) {
  const { data, error } = await supabase
    .from('feedback')
    .insert({
      user_id: userId,
      plan_id: planId,
      rating,
      comment,
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

// Helper do pobierania feedbacku
export async function getFeedback(supabase: SupabaseClient, userId: string, planId: string) {
  const { data } = await supabase
    .from('feedback')
    .select('*')
    .eq('user_id', userId)
    .eq('plan_id', planId)
    .maybeSingle();

  return data;
}

// Helper do aktualizacji feedbacku
export async function updateFeedback(
  supabase: SupabaseClient,
  feedbackId: string,
  updates: {
    rating?: 'positive' | 'negative' | null;
    comment?: string;
  }
) {
  const { data, error } = await supabase.from('feedback').update(updates).eq('id', feedbackId).select().single();

  if (error) throw error;
  return data;
}

// Helper do czyszczenia feedbacku
export async function cleanFeedback(supabase: SupabaseClient, userId: string) {
  await supabase.from('feedback').delete().eq('user_id', userId);
}
```

---

## 6. Kolejność implementacji

### Etap 1: Oceny kciukami (1 dzień)

1. ✅ Utworzenie `FeedbackModule.ts`
2. ✅ Rozszerzenie `PlanDetailsPage.ts`
3. ✅ Implementacja `rate-plan.spec.ts`
4. ✅ Helpery w fixtures

### Etap 2: Komentarze tekstowe (1 dzień)

5. ✅ Implementacja `submit-feedback.spec.ts`
6. ✅ Walidacja długości komentarza

### Etap 3: Persystencja (0.5 dnia)

7. ✅ Implementacja `feedback-persistence.spec.ts`

---

## 7. Wymagane zmiany w aplikacji

### Dodać data-testid w komponentach:

1. **FeedbackModule** (`src/components/FeedbackModule.tsx`):
   - `data-testid="feedback-module"`
   - `data-testid="thumbs-up"`
   - `data-testid="thumbs-down"`
   - `data-testid="feedback-comment"`
   - `data-testid="submit-feedback"`
   - `data-testid="feedback-success"`
   - `data-testid="feedback-error"`

2. Styling dla aktywnych kciuków:
   - Dodać klasy `.active` lub `.selected` do aktywnego kciuka
   - Wyraźne wizualne rozróżnienie (kolor, opacity)

### Schema bazy danych:

```sql
CREATE TABLE feedback (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  plan_id UUID NOT NULL REFERENCES plans(id) ON DELETE CASCADE,
  rating TEXT CHECK (rating IN ('positive', 'negative')),
  comment TEXT CHECK (LENGTH(comment) <= 1000),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, plan_id)
);

-- RLS policies
ALTER TABLE feedback ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can CRUD own feedback"
  ON feedback
  FOR ALL
  USING (auth.uid() = user_id);
```

### API endpoint (opcjonalny - jeśli nie używasz direct Supabase):

```typescript
// /api/feedback.ts
export async function POST(request: Request) {
  const { planId, rating, comment } = await request.json();
  const supabase = createClient(request);

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return new Response('Unauthorized', { status: 401 });
  }

  // Upsert (insert or update)
  const { data, error } = await supabase
    .from('feedback')
    .upsert({
      user_id: user.id,
      plan_id: planId,
      rating,
      comment,
      updated_at: new Date().toISOString(),
    })
    .select()
    .single();

  if (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }

  return new Response(JSON.stringify(data), { status: 200 });
}
```

---

## 8. Frontend logic - useFeedback hook

```typescript
export function useFeedback(planId: string) {
  const [rating, setRating] = useState<'positive' | 'negative' | null>(null);
  const [comment, setComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Load existing feedback
  useEffect(() => {
    async function loadFeedback() {
      const supabase = createClient();
      const { data } = await supabase.from('feedback').select('*').eq('plan_id', planId).maybeSingle();

      if (data) {
        setRating(data.rating);
        setComment(data.comment || '');
      }
    }
    loadFeedback();
  }, [planId]);

  const submitFeedback = async () => {
    setIsSubmitting(true);
    const supabase = createClient();

    const { error } = await supabase.from('feedback').upsert({
      plan_id: planId,
      rating,
      comment: comment.trim() || null,
      updated_at: new Date().toISOString(),
    });

    setIsSubmitting(false);

    if (error) {
      toast.error('Błąd podczas zapisywania opinii');
    } else {
      toast.success('Dziękujemy za opinię!');
    }
  };

  const toggleRating = (newRating: 'positive' | 'negative') => {
    setRating(newRating);
  };

  return {
    rating,
    comment,
    setComment,
    toggleRating,
    submitFeedback,
    isSubmitting,
  };
}
```

---

## 9. Metryki sukcesu

- ✅ Feedback zapisuje się i ładuje poprawnie
- ✅ Zmiana oceny aktualizuje rekord (nie duplikuje)
- ✅ Walidacja komentarza działa
- ✅ RLS chroni feedback innych użytkowników
- ✅ UI wyraźnie pokazuje stan oceny
- ✅ Toast notifications działają

---

## 10. Potencjalne problemy i rozwiązania

### Problem 1: Duplikacja feedbacku (multiple inserts)

**Rozwiązanie:**

- UNIQUE constraint na (user_id, plan_id)
- Używać UPSERT zamiast INSERT
- Sprawdzać istniejący feedback przed submit

### Problem 2: Race conditions przy szybkich kliknięciach

**Rozwiązanie:**

- Debouncing kliknięć kciuków
- Disable buttons podczas submitting
- Optimistic updates w UI

### Problem 3: Feedback dla zarchiwizowanych planów

**Rozwiązanie:**

- Decyzja: czy można oceniać archived?
- Zalecenie: TAK - ocena historyczna też wartościowa
- Lub: Tylko read-only display feedbacku

### Problem 4: Edycja feedbacku - czy pokazać historię zmian?

**Rozwiązanie:**

- MVP: tylko updated_at (data ostatniej zmiany)
- Future: audit log z historią zmian
- Dla testów: sprawdzać tylko aktualny stan

---

## 11. Checklist przed rozpoczęciem

- [ ] Utworzenie tabeli `feedback` w Supabase
- [ ] Skonfigurowanie RLS policies
- [ ] Dodanie data-testid do FeedbackModule
- [ ] Implementacja hooka `useFeedback`
- [ ] Helpery fixtures dla feedbacku
- [ ] Decyzja: czy archived plans mogą być oceniane?
- [ ] Decyzja: czy można cofnąć ocenę?

---

## 12. Analityka i raportowanie (dodatkowe)

### Admin dashboard (poza zakresem E2E):

- Agregacja ocen: % positive vs negative
- Top problemy z komentarzy (sentiment analysis)
- Korelacje: fixed points → oceny, długość planu → oceny
- Trendy czasowe: czy oceny się poprawiają?

### Webhook do Slack/Discord (opcjonalnie):

- Notyfikacja przy każdym negatywnym feedbacku
- Umożliwia szybką reakcję zespołu

### Export feedbacku do CSV:

- Dla analizy zewnętrznej
- Integracja z narzędziami analitycznymi
