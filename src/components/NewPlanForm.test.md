# NewPlanForm - Dokumentacja Testów Jednostkowych

## Przegląd

Plik testowy `NewPlanForm.test.tsx` zawiera kompleksowy zestaw testów jednostkowych dla komponentu `NewPlanForm`, który jest kluczowym elementem procesu tworzenia i edycji planów podróży w aplikacji CityFlow.

## Strategia Testowania

### Mockowanie Zależności

Testy wykorzystują mockowanie na dwóch poziomach:

1. **Custom Hook (`useNewPlanForm`)**: Główna logika biznesowa jest zamockowana, co pozwala na testowanie komponentu w izolacji
2. **Komponenty potomne**: Wszystkie komponenty potomne (StepIndicator, BasicInfoStep, FixedPointsStep, SummaryStep, PlanGenerationLoading) są zamockowane, aby skupić się na logice renderowania i przekazywania propsów

### Struktura Testów

Testy są zorganizowane według wzorca **Arrange-Act-Assert** i pogrupowane w następujące kategorie:

## Grupy Testów

### 1. Rendering (4 testy)
Testuje podstawowe renderowanie komponentu i jego elementów składowych.

**Pokryte scenariusze:**
- Renderowanie wskaźnika kroków (StepIndicator)
- Renderowanie odpowiedniego komponentu kroku w zależności od `currentStep`
- Renderowanie komponentu Card opakowującego kroki

### 2. Generation Loading State (3 testy)
Testuje stan ładowania podczas generowania planu przez AI.

**Pokryte scenariusze:**
- Wyświetlanie animacji ładowania gdy `isGenerating = true`
- Używanie nazwy destynacji jako fallback gdy nazwa planu jest pusta
- Ukrywanie wskaźnika kroków i karty podczas generowania

### 3. Callback Handling (2 testy)
Testuje obsługę funkcji callback `onFinished`.

**Pokryte scenariusze:**
- Wywoływanie callbacku `onFinished` gdy jest dostarczony
- Brak błędów gdy callback nie jest dostarczony

### 4. Editing Mode (2 testy)
Testuje tryb edycji istniejącego planu.

**Pokryte scenariusze:**
- Przekazywanie `editingPlan` do hooka `useNewPlanForm`
- Działanie w trybie tworzenia gdy `editingPlan` jest null

### 5. Step Navigation (3 testy)
Testuje nawigację między krokami formularza.

**Pokryte scenariusze:**
- Przekazywanie funkcji `nextStep` do BasicInfoStep
- Przekazywanie funkcji `prevStep` do FixedPointsStep
- Przekazywanie funkcji `handleSubmit` do SummaryStep

### 6. Data Management (2 testy)
Testuje zarządzanie danymi formularza.

**Pokryte scenariusze:**
- Przekazywanie `formData` do wszystkich komponentów kroków
- Przekazywanie funkcji aktualizujących dane (updateBasicInfo, addFixedPoint, etc.)

### 7. Loading and Error States (2 testy)
Testuje stany ładowania i błędów.

**Pokryte scenariusze:**
- Przekazywanie stanu `isLoading` do komponentów kroków
- Przekazywanie stanu `error` do komponentów kroków

### 8. Draft Saving (2 testy)
Testuje funkcjonalność zapisywania szkiców.

**Pokryte scenariusze:**
- Przekazywanie funkcji `saveDraft` do BasicInfoStep
- Przekazywanie funkcji `saveDraft` do FixedPointsStep

### 9. Integration (2 testy)
Testuje integrację między różnymi częściami komponentu.

**Pokryte scenariusze:**
- Utrzymywanie stanu formularza podczas przejść między krokami
- Kompletny workflow od kroku 1 do generowania planu

### 10. Edge Cases (4 testy)
Testuje przypadki brzegowe i nietypowe scenariusze.

**Pokryte scenariusze:**
- Obsługa undefined `onFinished`
- Obsługa pustych danych formularza
- Obsługa nieprawidłowego numeru kroku (poza zakresem)

## Statystyki Testów

- **Łączna liczba testów**: 26
- **Czas wykonania**: ~276ms
- **Pokrycie**: Wszystkie kluczowe funkcjonalności komponentu

## Kluczowe Funkcjonalności Przetestowane

1. ✅ Wieloetapowy formularz (3 kroki)
2. ✅ Nawigacja między krokami
3. ✅ Stan generowania planu przez AI
4. ✅ Tryb edycji istniejącego planu
5. ✅ Zapisywanie szkiców
6. ✅ Obsługa błędów i stanów ładowania
7. ✅ Przekazywanie danych między komponentami
8. ✅ Callbacki po zakończeniu procesu

## Uruchamianie Testów

### Uruchomienie wszystkich testów dla NewPlanForm:
```bash
npm run test:unit -- NewPlanForm.test.tsx
```

### Uruchomienie w trybie watch:
```bash
npm run test:unit -- NewPlanForm.test.tsx --watch
```

### Uruchomienie z interfejsem UI:
```bash
npm run test:unit:ui
```

### Uruchomienie z pokryciem kodu:
```bash
npx vitest run src/components/NewPlanForm.test.tsx --coverage
```

## Najlepsze Praktyki Zastosowane

1. **Mockowanie na odpowiednim poziomie**: Hook i komponenty potomne są zamockowane, co pozwala na testowanie w izolacji
2. **Wzorzec AAA**: Wszystkie testy używają wzorca Arrange-Act-Assert dla czytelności
3. **Opisowe nazwy testów**: Każdy test ma jasną nazwę opisującą co testuje
4. **Grupowanie logiczne**: Testy są pogrupowane w describe blocks według funkcjonalności
5. **Czyszczenie mocków**: `beforeEach` zapewnia czysty stan przed każdym testem
6. **Type safety**: Wykorzystanie TypeScript dla mocków i typów

## Możliwe Rozszerzenia

Potencjalne obszary do rozszerzenia testów w przyszłości:

1. Testy integracyjne z prawdziwym hookiem `useNewPlanForm`
2. Testy wydajności dla dużych formularzy z wieloma fixed points
3. Testy accessibility (a11y)
4. Testy snapshot dla struktury UI
5. Testy interakcji użytkownika z prawdziwymi komponentami potomnymi

## Zależności Testowe

- `vitest`: Framework testowy
- `@testing-library/react`: Narzędzia do testowania komponentów React
- `@testing-library/user-event`: Symulacja interakcji użytkownika
- `@testing-library/jest-dom`: Dodatkowe matchery dla DOM

## Uwagi Techniczne

- Testy używają `jsdom` jako środowiska testowego
- Wszystkie mocki są resetowane przed każdym testem
- Testy nie wymagają rzeczywistego API ani bazy danych
- Komponenty UI (Card, CardContent) są również zamockowane dla uproszczenia

