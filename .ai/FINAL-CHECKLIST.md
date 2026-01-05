# ✅ FINALNE CHECKLIST - Ostatnie 13% Pracy

**Data**: 5 stycznia 2026  
**Status**: 🏁 Finisz! Tylko 13% pozostało  
**Estymacja**: Pół dnia - 1 dzień pracy

---

## 📋 TESTY DO MIGRACJI (9 testów)

### Grupa 1: Generation Tests (3 testy) - PRIORYTET 1

```
⏰ Estymacja: 30-45 minut

[ ] e2e/generation/generate-plan.spec.ts
    Status: Sprawdzić czy ma authTest import
    Akcja: Jeśli nie, zmienić test na authTest i usunąć beforeEach/afterEach

[ ] e2e/generation/generation-limits.spec.ts
    Status: Sprawdzić czy ma authTest import
    Akcja: Jeśli nie, zmienić test na authTest i usunąć beforeEach/afterEach

[ ] e2e/generation/generation-priorities.spec.ts
    Status: Sprawdzić czy ma authTest import
    Akcja: Jeśli nie, zmienić test na authTest i usunąć beforeEach/afterEach
```

### Grupa 2: History Tests (2 testy) - PRIORYTET 2

```
⏰ Estymacja: 20 minut

[ ] e2e/history/move-to-history.spec.ts
    Status: Sprawdzić czy ma authTest import
    Akcja: Jeśli nie, zmienić test na authTest i usunąć beforeEach/afterEach

[ ] e2e/history/auto-archive.spec.ts
    Status: Sprawdzić czy ma authTest import
    Akcja: Jeśli nie, zmienić test na authTest i usunąć beforeEach/afterEach
```

### Grupa 3: Plans Tests (4 testy) - PRIORYTET 3

```
⏰ Estymacja: 40-50 minut

[ ] e2e/plans/create-plan-full.spec.ts
    Status: Sprawdzić czy ma authTest import
    Akcja: Jeśli nie, zmienić test na authTest i usunąć beforeEach/afterEach

[ ] e2e/plans/edit-plan-name.spec.ts
    Status: Sprawdzić czy ma authTest import
    Akcja: Jeśli nie, zmienić test na authTest i usunąć beforeEach/afterEach

[ ] e2e/plans/delete-plan.spec.ts
    Status: Sprawdzić czy ma authTest import
    Akcja: Jeśli nie, zmienić test na authTest i usunąć beforeEach/afterEach

[ ] e2e/plans/plan-rls.spec.ts
    Status: Sprawdzić czy ma authTest import
    Akcja: Jeśli nie, zmienić test na authTest i usunąć beforeEach/afterEach
```

---

## 🎨 KOMPONENTY UI - data-testid (11-15 komponentów)

### Grupa 1: History Components (1 komponent) - PRIORYTET 1

```
⏰ Estymacja: 15-20 minut

[ ] src/components/HistoryPage.tsx (lub history component)
    Gdzie: Na górze strony
    Co dodać:
      - data-testid='history-filters'      (filter container)
      - data-testid='history-search'       (search input)
      - data-testid='history-sort'         (sort dropdown)
      - data-testid='archived-plans-list'  (list container)

    Jeśli komponent ma inne nazwy:
      grep -r "HistoryPage\|history-page" src/components/
```

### Grupa 2: Plan/List Components (2-3 komponentów) - PRIORYTET 2

```
⏰ Estymacja: 15-20 minut

[ ] src/components/PlanList.tsx (jeśli istnieje)
    Co dodać:
      - data-testid='plans-list-container'
      - data-testid='empty-plans-state' (jeśli jest empty state)

[ ] src/components/GenerationsCounter.tsx
    Co dodać:
      - data-testid='generations-counter'
      - data-testid='generations-count'  (liczba)

[ ] src/components/PlanGenerationLoading.tsx
    Co dodać:
      - data-testid='generation-status'
      - data-testid='generation-progress' (progress bar)
```

### Grupa 3: Remaining Components (5-10 komponentów) - PRIORYTET 3

```
⏰ Estymacja: 15-30 minut

Szukaj komponentów, które:
- Brakuje data-testid
- Używane w testach
- Mają elementy interaktywne (przyciski, input, etc)

Komendy do sprawdzenia:
grep -r "getByRole\|getByText" e2e/ --include="*.ts" | head -20
# Dla każdego wyniku, sprawdź czy komponent ma data-testid

Przykładowe komponenty:
[ ] src/components/DraftPlanView.tsx      (jeśli brakuje)
[ ] src/components/GeneratedPlanView.tsx  (jeśli brakuje)
[ ] src/components/EventTimeline.tsx      (jeśli brakuje)
[ ] src/components/TimelineItem.tsx       (jeśli brakuje)
```

---

## 🚀 SZYBKA PROCEDURA MIGRACJI TESTU

```typescript
// TEMPLATE - Skopiuj i dostosuj dla każdego testu

// ❌ STARY WZÓR:
import { test, expect } from '../fixtures';

test.describe('Feature', () => {
  test.beforeEach(async ({ page, supabase, testUser }) => {
    // cleanup
  });

  test.afterEach(async ({ supabase, testUser }) => {
    // cleanup
  });

  test('should do something', async ({ page }) => {
    // test
  });
});

// ✅ NOWY WZÓR:
import { authTest as test, expect, ...helpers } from '../fixtures';

test.describe('Feature', () => {
  test('should do something', async ({ page, supabase, testUser }) => {
    // Cleanup już w fixture!
    // test
  });
});
```

---

## 🎨 SZYBKA PROCEDURA DODAWANIA data-testid

```typescript
// SZUKAJ:
<div className='...'>{content}</div>           // ← Generalna
<button onClick={...}>Click</button>            // ← Interaktywne
<input placeholder='...' />                    // ← Formularze
<select><option>...</option></select>          // ← Selekty

// DODAJ:
<div data-testid='unique-id' className='...'>{content}</div>
<button data-testid='action-button' onClick={...}>Click</button>
<input data-testid='search-input' placeholder='...' />
<select data-testid='filter-select'><option>...</option></select>

// SPRAWDŹ:
1. Czy ID jest unikalny w komponencie?
2. Czy ID jest opisowy (nie "container-1")?
3. Czy jest czytelny dla testu?
4. Czy eslint happy? npm run lint
```

---

## ✅ WORKFLOW - Krok Po Kroku

### DZIEŃ 1 (Dzisiaj - 5 Stycznia)

#### RANO (1 godzina)

```
1. [ ] Przeczytaj ten checklist (5 minut)
2. [ ] Migracja Generation tests (3x) - 30 minut
   grep -n "test.beforeEach\|test.afterEach" e2e/generation/*.ts
   # Powinno być 0 matches
3. [ ] Migracja History tests (2x) - 20 minut
4. [ ] Commit: "refactor(e2e): migrate generation and history tests"
```

#### POPOŁUDNIE (1.5 godziny)

```
5. [ ] Migracja Plans tests (4x) - 40 minut
   grep -n "test.beforeEach\|test.afterEach" e2e/plans/*.ts
   # Powinno być 0 matches
6. [ ] Dodaj data-testid do HistoryPage - 20 minut
7. [ ] Dodaj data-testid do PlanList - 15 minut
8. [ ] Commit: "refactor(e2e): migrate plans tests and add data-testid"
```

#### WIECZOREM (1 godzina)

```
9. [ ] Dodaj data-testid do pozostałych (5-7 komponentów) - 30 minut
10. [ ] Uruchom wszystkie testy: npm run test:e2e
11. [ ] Uruchom linting: npm run lint
12. [ ] Final commit: "refactor(e2e): complete migration and add data-testid"
13. [ ] 🎉 GOTOWE!
```

**RAZEM**: ~3.5 godziny = Pół dnia pracy

### JEŚLI CHCESZ ROZŁOŻYĆ NA 2 DNI

#### DZIEŃ 1 (Gen + History tests)

```
[ ] Generation tests (3x) - 30 minut
[ ] History tests (2x) - 20 minut
[ ] HistoryPage data-testid - 15 minut
[ ] Commit
RAZEM: ~1.5 godziny
```

#### DZIEŃ 2 (Plans tests + UI)

```
[ ] Plans tests (4x) - 40 minut
[ ] PlanList, GenerationsCounter - 30 minut
[ ] Pozostałe komponenty - 30 minut
[ ] Testing + Final commit
RAZEM: ~2 godziny
```

---

## 🔍 VERIFICATION CHECKLIST

Po każdej grunie zmian - SPRAWDŹ:

```bash
# 1. Czy wszystkie testy zielone?
npm run test:e2e
# ✅ Powinno być: Passed: X, Failed: 0

# 2. Czy linting czysty?
npm run lint
# ✅ Powinno być: 0 errors

# 3. Czy nie ma afterEach w testach?
grep -r "test.afterEach" e2e/
# ✅ Powinno być: No matches (0)

# 4. Czy nie ma getByRole bez testid fallback?
grep -r "getByRole.*name:" e2e/ | wc -l
# ✅ Powinno być: < 5 (tylko edge cases)

# 5. Czy nie ma globalnych zmiennych?
grep -B5 "test.describe" e2e/*/\*.spec.ts | grep "let " | wc -l
# ✅ Powinno być: 0 (wszystkie zmienne w testach)
```

---

## 🎯 FINAL TARGETS

Gdy wszystko będzie gotowe:

```
✅ Data-testid coverage:     79% → 95%+
✅ Migracja testów:          85% → 100%
✅ Linting errors:           0 → 0
✅ Duplikacja kodu:          <1% → <1%
✅ Page Objects:             100% → 100%
✅ Brak afterEach w testach: 0 → 0
✅ Wszystkie testy zielone:  ~95% → 100%

RAZEM: ~87% → 100% ✅ COMPLETE!
```

---

## 💡 TIPS & TRICKS

### Szybka Migracja Testu

```bash
# Użyj Find & Replace w edytorze:
# Find:    import { test, expect } from '../fixtures';
# Replace: import { authTest as test, expect } from '../fixtures';

# Potem usuń wszystkie beforeEach/afterEach (Select + Delete)
```

### Szybkie Dodawanie data-testid

```bash
# Jeśli komponent ma wiele elementów, dodaj stepami:
# 1. Main container
# 2. Inputs/Buttons
# 3. Other elements
```

### Testowanie Zmian

```bash
# Po każdej migr testu:
npm run test:e2e -- e2e/FOLDER/FILE.spec.ts

# Powinno przejść GREEN!
```

---

## 📞 PROBLEMY?

Jeśli coś pójdzie nie tak - przeczytaj `e2e-debug-guide.md`:

```
1. "Cannot find locator" - Element brakuje data-testid
2. "Test timeout" - Element nie widoczny lub usunięty
3. "page is not defined" - Kod poza testem (jak w add-activity)
4. "ReferenceError" - Import problem lub zmienna globalna
```

---

## 🎉 SUCCESS CRITERIA

Gdy ukończysz ALL z tego checklisty:

- ✅ Wszystkie 27 testów zmigrowanych
- ✅ Ponad 120+ data-testid w komponentach
- ✅ 0 błędów lintingu
- ✅ 0 afterEach w testach
- ✅ 0 zmiennych globalnych
- ✅ Wszystkie testy przechodzą
- ✅ Dokumentacja zaktualizowana
- ✅ **MIGRACJA UKOŃCZONA** 🎊

---

**Checklist**: Finalne 13% pracy  
**Estymacja**: 1-1.5 dnia  
**Status**: 🟢 READY TO GO  
**Następny Krok**: Zacznij od Grupy 1 - Generation Tests
