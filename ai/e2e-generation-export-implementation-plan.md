# Plan Implementacji Testów E2E - Generowanie i Eksport

## 1. Zakres testów

Testy E2E pokrywające proces generowania planu przez AI i eksport:

- Generowanie planu (pełny flow bez mocków)
- Obsługa błędów generowania
- Priorytetyzacja stałych punktów
- Eksport do PDF
- Limitowanie generacji

## 2. Struktura plików

```
e2e/
├── generation/
│   ├── generate-plan.spec.ts           # US-030, US-031
│   ├── generation-priorities.spec.ts   # US-033, US-034
│   ├── generation-errors.spec.ts       # US-036
│   └── generation-limits.spec.ts       # US-060
├── export/
│   └── export-pdf.spec.ts              # US-050
├── page-objects/
│   ├── GenerationLoadingPage.ts        # Nowy
│   └── PlanDetailsPage.ts              # Rozszerzenie
└── fixtures.ts                         # Rozszerzenie
```

## 3. Przypadki testowe

### 3.1. Generowanie planu (generate-plan.spec.ts)

#### Test 1: Pomyślne generowanie planu z podstawowych danych

**Kroki:**

1. Zaloguj się (użytkownik z 5 generacjami)
2. Utwórz plan draft:
   - Cel: "Rzym"
   - Miesiąc: "Czerwiec"
   - Opis: "3-dniowy city break, sztuka i jedzenie"
3. Kliknij "Generuj plan"
4. Czekaj na zakończenie generowania

**Oczekiwany rezultat:**

- Wyświetlenie loadera z animacją
- Wywołanie API `/api/plans/[id]/generate` (BEZ mocka)
- Loader widoczny < 20s (P90)
- Po sukcesie:
  - Przekierowanie do `/plans/[id]` lub odświeżenie widoku
  - Plan ma `status = 'generated'`
  - Tabela `generated_plan_days` zawiera dni (3 dni)
  - Tabela `plan_activities` zawiera aktywności (min. 5-10)
  - Timeline wyświetla harmonogram
  - Licznik generacji: 4/5
- Toast: "Plan wygenerowany pomyślnie"

#### Test 2: Generowanie planu ze stałym punktem

**Kroki:**

1. Utwórz plan draft z fixed point:
   - "Koloseum", 15.06.2026, 10:00
2. Generuj plan

**Oczekiwany rezultat:**

- Plan wygenerowany
- Dzień 15 czerwca zawiera aktywność "Koloseum" o 10:00
- Fixed point oznaczony jako "nienaruszalny" (np. ikona przypięcia)
- Inne aktywności zaplanowane wokół fixed point
- Fixed point nie został usunięty ani przesunięty

#### Test 3: Ponowne generowanie istniejącego planu

**Kroki:**

1. Plan już wygenerowany
2. Kliknij "Generuj ponownie" (jeśli dostępne)
3. Potwierdź w modalu

**Oczekiwany rezultat:**

- Modal ostrzeżenia: "To nadpisze istniejący plan. Kontynuować?"
- Po potwierdzeniu:
  - Stary plan nadpisany nowym
  - Licznik generacji zmniejszony o 1
  - Nowe aktywności w bazie (stare usunięte)

#### Test 4: Loader podczas generowania

**Kroki:**

1. Rozpocznij generowanie planu
2. Obserwuj loader

**Oczekiwany rezultat:**

- Loader widoczny z komunikatem "AI tworzy Twój plan..."
- Animacja/spinner aktywny
- Możliwość anulowania (opcjonalnie)
- Po 20s: albo plan gotowy, albo timeout error

---

### 3.2. Priorytety generowania (generation-priorities.spec.ts)

#### Test 1: Priorytet 1 - Stałe punkty (Fixed Points)

**Kroki:**

1. Utwórz plan z 2 fixed points:
   - "Lotnisko - przylot", 14.06, 08:00
   - "Koncert", 16.06, 20:00
2. Brak innych notatek
3. Generuj plan

**Oczekiwany rezultat:**

- Oba fixed points obecne w planie
- Aktywności dnia 14.06 zaplanowane PO 08:00
- Aktywności dnia 16.06 zaplanowane PRZED 20:00
- AI dopasowało resztę planu do tych punktów

#### Test 2: Priorytet 2 - Notatki użytkownika

**Kroki:**

1. Utwórz plan:
   - Notatki: "Chcę zobaczyć Koloseum i Forum Romanum"
   - Brak preferencji w profilu
2. Generuj plan

**Oczekiwany rezultat:**

- Plan zawiera "Koloseum" i "Forum Romanum"
- Obie atrakcje uwzględnione w harmonogramie
- AI zinterpretowało notatki użytkownika

#### Test 3: Priorytet 3 - Preferencje z profilu

**Kroki:**

1. Ustaw preferencje w profilu:
   - "Sztuka i Muzea", "Lokalne Jedzenie"
   - Tempo: "Wolne"
2. Utwórz plan bez notatek:
   - Cel: "Florencja", 2 dni
3. Generuj plan

**Oczekiwany rezultat:**

- Plan zawiera muzea (np. Galeria Uffizi)
- Plan zawiera sugestie gastronomiczne (tratorie, lokalne miejsca)
- Tempo wolne = mniej aktywności, więcej przerw, realistyczne czasy

#### Test 4: Hierarchia priorytetów - wszystkie razem

**Kroki:**

1. Profil: preferencje "Natura"
2. Plan:
   - Fixed point: "Rezerwacja restauracji", 15.06, 19:00
   - Notatki: "Chcę zwiedzić Muzeum Watykańskie"
3. Generuj plan

**Oczekiwany rezultat:**

- Priorytet 1: Fixed point "Restauracja" o 19:00 obecny
- Priorytet 2: "Muzeum Watykańskie" obecne (z notatek)
- Priorytet 3: Opcjonalnie aktywności związane z naturą (jeśli pasują)
- Hierarchia zachowana

---

### 3.3. Obsługa błędów generowania (generation-errors.spec.ts)

#### Test 1: Błąd API - timeout

**Kroki:**

1. Mockuj `/api/generate` by zwrócił timeout (> 30s)
2. Rozpocznij generowanie
3. Czekaj

**Oczekiwany rezultat:**

- Po 30s wyświetlenie błędu: "Generowanie trwa zbyt długo. Spróbuj ponownie."
- Plan pozostaje w statusie `draft`
- Licznik generacji NIE zmniejszony
- Możliwość ponowienia

#### Test 2: Błąd API - 500 Internal Server Error

**Kroki:**

1. Mockuj `/api/generate` by zwrócił 500
2. Rozpocznij generowanie

**Oczekiwany rezultat:**

- Wyświetlenie błędu: "Wystąpił błąd podczas generowania planu. Spróbuj ponownie za chwilę."
- Plan pozostaje `draft`
- Licznik generacji NIE zmniejszony

#### Test 3: Błąd AI - nierealistyczne żądanie (US-035)

**Kroki:**

1. Utwórz plan:
   - 1 dzień
   - 10 fixed points w różnych lokalizacjach (niemożliwe do zrealizowania)
2. Generuj plan

**Oczekiwany rezultat:**

- Plan wygenerowany (sukces)
- Komunikat w planie: "Twój plan był zbyt ambitny. Usunięto niektóre punkty, aby był realistyczny."
- Komunikat wskazuje, które punkty usunięto i dlaczego
- Najważniejsze fixed points zachowane

#### Test 4: Błąd walidacji - brak wymaganego pola

**Kroki:**

1. Utwórz plan draft BEZ celu (destination)
2. Próbuj wygenerować

**Oczekiwany rezultat:**

- Błąd: "Cel podróży jest wymagany do generowania planu"
- Brak wywołania API
- Frontend blokuje submit

---

### 3.4. Limity generacji (generation-limits.spec.ts)

#### Test 1: Generowanie z dostępnym limitem

**Kroki:**

1. Użytkownik z limitem 5/5
2. Wygeneruj plan

**Oczekiwany rezultat:**

- Plan wygenerowany
- Licznik: 4/5
- Baza: `profiles.generations_used = 1`

#### Test 2: Wyczerpanie limitu

**Kroki:**

1. Użytkownik z limitem 1/5
2. Wygeneruj plan (zużyj ostatnią generację)
3. Próbuj wygenerować kolejny plan

**Oczekiwany rezultat:**

- Pierwsza generacja: sukces, licznik 0/5
- Druga próba:
  - Przycisk "Generuj" nieaktywny lub zablokowany
  - Modal: "Wykorzystałeś swój miesięczny limit 5 darmowych planów. Limit odnowi się 1. dnia przyszłego miesiąca."
  - Brak wywołania API

#### Test 3: Wyświetlanie licznika w UI

**Kroki:**

1. Zaloguj się (3/5 generacji)
2. Sprawdź UI

**Oczekiwany rezultat:**

- Licznik widoczny: "Pozostało: 3/5" (w profilu lub headerze)
- Licznik aktualizuje się po każdej generacji

#### Test 4: Reset limitu (na początku miesiąca)

**Uwaga:** Trudny do testowania w E2E, raczej unit/integration test

**Kroki:**

1. Ustaw datę systemową na koniec miesiąca
2. Użytkownik z 0/5
3. Zmień datę na 1. dzień nowego miesiąca
4. Sprawdź licznik

**Oczekiwany rezultat:**

- Licznik zresetowany do 5/5
- `profiles.generations_used = 0`

---

### 3.5. Eksport do PDF (export-pdf.spec.ts)

#### Test 1: Eksport wygenerowanego planu

**Kroki:**

1. Utwórz plan generated z aktywnościami
2. Przejdź do `/plans/[id]`
3. Kliknij "Eksportuj do PDF"

**Oczekiwany rezultat:**

- Rozpoczęcie pobierania pliku PDF
- Nazwa pliku: "Rzym-Jun-2026.pdf" (lub podobna)
- Otwarcie PDF:
  - Zawiera nazwę planu
  - Zawiera cel i daty
  - Zawiera harmonogram godzinowy
  - Zawiera nazwy miejsc, czasy, kategorie
  - Zawiera szacunkowe ceny (jeśli AI je podało)
  - Zawiera ostrzeżenie: "Plan to sugestia AI. Sprawdź dane przed wyjazdem."
  - NIE zawiera zdjęć ani map

#### Test 2: Eksport planu draft (błąd)

**Kroki:**

1. Plan draft (niezgenerowany)
2. Próbuj wyeksportować

**Oczekiwany rezultat:**

- Przycisk "Eksportuj" nieaktywny lub niewidoczny
- Lub komunikat: "Wygeneruj plan, aby móc go wyeksportować"

#### Test 3: Jakość PDF - weryfikacja struktury

**Kroki:**

1. Eksportuj plan z 3 dniami i 15 aktywnościami
2. Otwórz PDF
3. Sprawdź strukturę

**Oczekiwany rezultat:**

- Każdy dzień na osobnej stronie lub w osobnej sekcji
- Czytelna czcionka, odpowiedni rozmiar
- Dane nie nachodzą na siebie
- Wszystkie aktywności widoczne
- Sortowanie chronologiczne

#### Test 4: Ostrzeżenie w PDF

**Kroki:**

1. Eksportuj dowolny plan
2. Otwórz PDF
3. Sprawdź nagłówek lub stopkę

**Oczekiwany rezultat:**

- Widoczne ostrzeżenie (np. na górze pierwszej strony):
  - "Ten plan jest sugestią AI i może zawierać nieścisłości."
  - "Sprawdź godziny otwarcia, ceny i dostępność przed podróżą."

---

## 4. Page Objects do implementacji

### 4.1. GenerationLoadingPage.ts

```typescript
export class GenerationLoadingPage {
  readonly page: Page;
  readonly loader: Locator;
  readonly loaderMessage: Locator;
  readonly cancelButton: Locator;
  readonly errorMessage: Locator;

  constructor(page: Page) {
    this.page = page;
    this.loader = page.locator('[data-testid="generation-loader"]');
    this.loaderMessage = page.locator('[data-testid="loader-message"]');
    this.cancelButton = page.locator('[data-testid="cancel-generation"]');
    this.errorMessage = page.locator('[data-testid="generation-error"]');
  }

  async isLoaderVisible(): Promise<boolean> {
    return await this.loader.isVisible();
  }

  async waitForCompletion(timeout = 30000) {
    await this.loader.waitFor({ state: 'hidden', timeout });
  }

  async getErrorMessage(): Promise<string> {
    return (await this.errorMessage.textContent()) || '';
  }

  async cancelGeneration() {
    if (await this.cancelButton.isVisible()) {
      await this.cancelButton.click();
    }
  }
}
```

### 4.2. PlanDetailsPage.ts (rozszerzenie)

```typescript
// Dodaj do istniejącego:
export class PlanDetailsPage {
  // ... existing code ...

  readonly exportPdfButton: Locator;
  readonly generationsCounter: Locator;
  readonly generationWarning: Locator;

  constructor(page: Page) {
    // ... existing code ...
    this.exportPdfButton = page.locator('[data-testid="export-pdf-button"]');
    this.generationsCounter = page.locator('[data-testid="generations-counter"]');
    this.generationWarning = page.locator('[data-testid="generation-warning"]');
  }

  async exportToPdf(): Promise<Download> {
    const downloadPromise = this.page.waitForEvent('download');
    await this.exportPdfButton.click();
    const download = await downloadPromise;
    return download;
  }

  async getGenerationsCount(): Promise<string> {
    return (await this.generationsCounter.textContent()) || '';
  }

  async getGenerationWarning(): Promise<string> {
    return (await this.generationWarning.textContent()) || '';
  }
}
```

---

## 5. Rozszerzenie fixtures.ts

### Nowe helpery:

```typescript
// Helper do ustawienia limitów generacji
export async function setGenerationLimit(supabase: SupabaseClient, userId: string, used: number) {
  await supabase.from('profiles').update({ generations_used: used }).eq('id', userId);
}

// Helper do mockowania błędów generowania
export async function mockGenerationError(page: Page, errorType: 'timeout' | '500' | 'unrealistic') {
  await page.route('**/api/plans/*/generate', async (route) => {
    if (errorType === 'timeout') {
      // Delay then timeout
      await new Promise((resolve) => setTimeout(resolve, 31000));
      await route.abort('timedout');
    } else if (errorType === '500') {
      await route.fulfill({
        status: 500,
        body: JSON.stringify({ error: 'Internal server error' }),
      });
    } else if (errorType === 'unrealistic') {
      await route.fulfill({
        status: 200,
        body: JSON.stringify({
          success: true,
          warning: 'Plan was too ambitious. Some activities were removed.',
        }),
      });
    }
  });
}

// Helper do weryfikacji PDF
export async function verifyPdfDownload(download: Download, expectedFilename: string): Promise<boolean> {
  const filename = download.suggestedFilename();
  return filename.includes(expectedFilename);
}

// Helper do weryfikacji zawartości PDF (wymaga biblioteki pdf-parse)
import pdf from 'pdf-parse';
import fs from 'fs';

export async function extractPdfText(download: Download): Promise<string> {
  const path = await download.path();
  if (!path) throw new Error('Download path not available');

  const dataBuffer = fs.readFileSync(path);
  const pdfData = await pdf(dataBuffer);
  return pdfData.text;
}

export async function verifyPdfContent(download: Download, expectedTexts: string[]): Promise<boolean> {
  const text = await extractPdfText(download);
  return expectedTexts.every((expected) => text.includes(expected));
}
```

---

## 6. Kolejność implementacji

### Etap 1: Generowanie podstawowe (1-2 dni)

1. ✅ Utworzenie `GenerationLoadingPage.ts`
2. ✅ Rozszerzenie fixtures o generation helpers
3. ✅ Implementacja `generate-plan.spec.ts`

### Etap 2: Priorytety i logika AI (1 dzień)

4. ✅ Implementacja `generation-priorities.spec.ts`
5. ✅ Testy z różnymi kombinacjami priorytetów

### Etap 3: Obsługa błędów (1 dzień)

6. ✅ Mockowanie błędów API
7. ✅ Implementacja `generation-errors.spec.ts`

### Etap 4: Limity (0.5 dnia)

8. ✅ Implementacja `generation-limits.spec.ts`
9. ✅ Helper do manipulacji licznikami

### Etap 5: Eksport PDF (1-2 dni)

10. ✅ Instalacja `pdf-parse` lub `pdfjs-dist`
11. ✅ Implementacja `export-pdf.spec.ts`
12. ✅ Helpery do weryfikacji PDF

---

## 7. Wymagane zmiany w aplikacji

### Dodać data-testid w komponentach:

1. **PlanGenerationLoading** (`src/components/PlanGenerationLoading.tsx`):
   - `data-testid="generation-loader"`
   - `data-testid="loader-message"`
   - `data-testid="cancel-generation"`
   - `data-testid="generation-error"`

2. **GeneratedPlanView** (`src/components/GeneratedPlanView.tsx`):
   - `data-testid="export-pdf-button"`
   - `data-testid="generation-warning"`

3. **GenerationsCounter** (`src/components/GenerationsCounter.tsx`):
   - `data-testid="generations-counter"`

4. **PlanDetailsView**:
   - `data-testid="generate-again-button"` (jeśli istnieje)

---

## 8. Instalacja dodatkowych pakietów

```bash
npm install --save-dev pdf-parse @types/pdf-parse
# lub
npm install --save-dev pdfjs-dist
```

---

## 9. Konfiguracja testów

### playwright.config.ts (aktualizacja)

```typescript
{
  use: {
    // Zwiększ timeout dla generowania (może trwać 20s)
    actionTimeout: 30000,

    // Accept downloads dla testów PDF
    acceptDownloads: true,
  },

  // Timeout dla testów z generowaniem
  timeout: 60000,
}
```

---

## 10. Metryki sukcesu

- ✅ Generowanie planu działa bez mocków (prawdziwe API)
- ✅ Czas generowania < 20s dla 90% przypadków
- ✅ Hierarchia priorytetów zachowana
- ✅ Błędy API obsłużone gracefully
- ✅ Limity poprawnie egzekwowane
- ✅ PDF generuje się i zawiera wszystkie wymagane elementy
- ✅ Ostrzeżenie w PDF widoczne

---

## 11. Potencjalne problemy i rozwiązania

### Problem 1: Generowanie rzeczywiste trwa > 20s

**Rozwiązanie:**

- Zwiększyć timeouty testów do 30-40s
- Optymalizacja promptów dla OpenRouter
- Używanie szybszych modeli dla testów

### Problem 2: Koszt wywołań API OpenRouter

**Rozwiązanie:**

- Dedykowany budżet dla testów
- Ograniczenie liczby testów z prawdziwym API
- Mockowanie dla większości testów, prawdziwe API tylko dla smoke testów

### Problem 3: Generowanie PDF w przeglądarce (client-side vs server-side)

**Rozwiązanie:**

- Sprawdzić implementację: czy PDF generowany client-side (jsPDF) czy server-side
- Dostosować testy do implementacji
- Weryfikować download event niezależnie od implementacji

### Problem 4: Niestabilność AI - różne wyniki

**Rozwiązanie:**

- Testy nie powinny sprawdzać DOKŁADNEJ treści planu
- Sprawdzać strukturę i obecność kluczowych elementów
- Sprawdzać fixed points (te muszą być zawsze)
- Nie sprawdzać konkretnych nazw aktywności AI

---

## 12. Checklist przed rozpoczęciem

- [ ] Sprawdzenie endpoint `/api/plans/[id]/generate`
- [ ] Weryfikacja logiki licznika generacji
- [ ] Dodanie data-testid do loaderów i przycisków
- [ ] Instalacja bibliotek do PDF parsing
- [ ] Konfiguracja timeoutów w Playwright
- [ ] Przygotowanie budżetu API dla testów
- [ ] Decyzja: pełne testy z API czy częściowe mockowanie?
- [ ] Weryfikacja implementacji eksportu PDF (client vs server)
