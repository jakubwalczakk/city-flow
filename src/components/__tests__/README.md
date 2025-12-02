# Testy Jednostkowe - Komponenty

## Przegląd

Ten katalog zawiera testy jednostkowe dla komponentów React w aplikacji CityFlow. Testy są napisane z wykorzystaniem Vitest i React Testing Library zgodnie z najlepszymi praktykami opisanymi w `.cursor/rules/vitest-unit-testing.mdc`.

## Dostępne Testy

### NewPlanForm.test.tsx

Kompleksowy zestaw testów dla komponentu `NewPlanForm` - głównego komponentu odpowiedzialnego za tworzenie i edycję planów podróży.

**Pokrycie**: 26 testów
**Lokalizacja**: `src/components/NewPlanForm.test.tsx`
**Dokumentacja**: `src/components/NewPlanForm.test.md`

## Konwencje Testowe

### Struktura Plików

- Testy są umieszczane obok testowanych komponentów z rozszerzeniem `.test.tsx`
- Dokumentacja testów jest w plikach `.test.md`
- Testy pomocnicze i mocki są w katalogu `__tests__/`

### Naming Convention

```typescript
describe("ComponentName", () => {
  describe("Feature Group", () => {
    it("should do something specific", () => {
      // Arrange
      // Act
      // Assert
    });
  });
});
```

### Wzorzec AAA (Arrange-Act-Assert)

Wszystkie testy używają wzorca AAA dla lepszej czytelności:

```typescript
it('should render component', () => {
  // Arrange - przygotowanie danych i mocków
  const props = { ... };

  // Act - wykonanie akcji
  render(<Component {...props} />);

  // Assert - sprawdzenie rezultatu
  expect(screen.getByText('...')).toBeInTheDocument();
});
```

## Uruchamianie Testów

### Wszystkie testy jednostkowe:

```bash
npm run test:unit
```

### Testy w trybie watch:

```bash
npm run test:unit -- --watch
```

### Testy z interfejsem UI:

```bash
npm run test:unit:ui
```

### Konkretny plik testowy:

```bash
npm run test:unit -- NewPlanForm.test.tsx
```

### Z pokryciem kodu:

```bash
npx vitest run --coverage
```

## Konfiguracja

### vitest.config.ts

Główna konfiguracja Vitest znajduje się w `vitest.config.ts` w katalogu głównym projektu.

**Kluczowe ustawienia:**

- Environment: `jsdom`
- Setup file: `test/setup.ts`
- Coverage thresholds: 70% dla wszystkich metryk
- Alias: `@` wskazuje na `./src`

### test/setup.ts

Plik setup importuje `@testing-library/jest-dom/vitest` dla dodatkowych matcherów DOM.

## Mockowanie

### Custom Hooks

```typescript
vi.mock("@/hooks/useCustomHook", () => ({
  useCustomHook: vi.fn(),
}));
```

### Komponenty

```typescript
vi.mock('@/components/ChildComponent', () => ({
  ChildComponent: ({ onClick }: Props) => (
    <button onClick={onClick}>Mocked</button>
  ),
}));
```

### API Calls

```typescript
global.fetch = vi.fn(() =>
  Promise.resolve({
    ok: true,
    json: () => Promise.resolve({ data: "test" }),
  })
) as any;
```

## Najlepsze Praktyki

### 1. Testuj zachowanie, nie implementację

❌ **Źle:**

```typescript
expect(component.state.count).toBe(1);
```

✅ **Dobrze:**

```typescript
expect(screen.getByText("Count: 1")).toBeInTheDocument();
```

### 2. Używaj user-event zamiast fireEvent

❌ **Źle:**

```typescript
fireEvent.click(button);
```

✅ **Dobrze:**

```typescript
const user = userEvent.setup();
await user.click(button);
```

### 3. Mockuj na odpowiednim poziomie

- Mockuj zależności zewnętrzne (API, hooki)
- Nie mockuj wewnętrznej logiki testowanego komponentu
- Mockuj komponenty potomne dla testów jednostkowych

### 4. Czyszczenie po testach

```typescript
beforeEach(() => {
  vi.clearAllMocks();
});

afterEach(() => {
  cleanup();
});
```

### 5. Używaj waitFor dla operacji asynchronicznych

```typescript
await waitFor(() => {
  expect(screen.getByText("Loaded")).toBeInTheDocument();
});
```

### 6. Testuj przypadki brzegowe

- Puste dane
- Wartości null/undefined
- Błędy API
- Stany ładowania
- Walidacja formularzy

## Queries Priority (React Testing Library)

Priorytet używania queries zgodnie z dokumentacją RTL:

1. **Accessible to everyone:**
   - `getByRole`
   - `getByLabelText`
   - `getByPlaceholderText`
   - `getByText`

2. **Semantic queries:**
   - `getByAltText`
   - `getByTitle`

3. **Test IDs (ostateczność):**
   - `getByTestId`

## Coverage

Progi pokrycia kodu są skonfigurowane w `vitest.config.ts`:

- **Lines**: 70%
- **Functions**: 70%
- **Branches**: 70%
- **Statements**: 70%

### Wyłączenia z pokrycia:

- Pliki testowe (`*.test.tsx`, `*.spec.tsx`)
- Pliki definicji typów (`*.d.ts`)
- Komponenty UI z Shadcn (`src/components/ui/**`)

## Debugowanie Testów

### 1. Wyświetl renderowany DOM:

```typescript
import { screen } from "@testing-library/react";
screen.debug();
```

### 2. Użyj UI mode:

```bash
npm run test:unit:ui
```

### 3. Filtruj testy:

```bash
npm run test:unit -- -t "should render"
```

### 4. Verbose output:

```bash
npm run test:unit -- --reporter=verbose
```

## Przykładowy Test

```typescript
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import MyComponent from './MyComponent';

describe('MyComponent', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Rendering', () => {
    it('should render with initial state', () => {
      // Arrange
      const props = { title: 'Test' };

      // Act
      render(<MyComponent {...props} />);

      // Assert
      expect(screen.getByText('Test')).toBeInTheDocument();
    });
  });

  describe('User Interactions', () => {
    it('should handle button click', async () => {
      // Arrange
      const onClickMock = vi.fn();
      const user = userEvent.setup();
      render(<MyComponent onClick={onClickMock} />);

      // Act
      await user.click(screen.getByRole('button'));

      // Assert
      expect(onClickMock).toHaveBeenCalledTimes(1);
    });
  });

  describe('Async Operations', () => {
    it('should load data', async () => {
      // Arrange
      global.fetch = vi.fn(() =>
        Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ data: 'test' }),
        })
      ) as any;

      // Act
      render(<MyComponent />);

      // Assert
      await waitFor(() => {
        expect(screen.getByText('test')).toBeInTheDocument();
      });
    });
  });
});
```

## Zasoby

- [Vitest Documentation](https://vitest.dev/)
- [React Testing Library](https://testing-library.com/react)
- [Testing Library Queries](https://testing-library.com/docs/queries/about)
- [Common Mistakes](https://kentcdodds.com/blog/common-mistakes-with-react-testing-library)
- [Cursor Rules: Vitest](.cursor/rules/vitest-unit-testing.mdc)

## Kontakt

W razie pytań dotyczących testów, sprawdź:

1. Dokumentację w `.cursor/rules/vitest-unit-testing.mdc`
2. Przykłady w `src/components/NewPlanForm.test.tsx`
3. Ten README
