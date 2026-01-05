# Unit Tests - CityFlow

## Overview

This directory contains unit tests for the CityFlow application using **Vitest** and **React Testing Library**.

## Running Tests

```bash
# Run all unit tests
npm run test:unit

# Run tests in watch mode
npm run test:unit:watch

# Run tests with UI
npm run test:unit:ui

# Run tests with coverage
npm run test:coverage
```

## Test Structure

```
test/unit/
├── lib/
│   ├── utils/              # Utility functions tests
│   │   ├── dateFormatters.test.ts
│   │   ├── timeFormatters.test.ts
│   │   ├── formDateHelpers.test.ts
│   │   ├── planFormHelpers.test.ts
│   │   ├── auth.test.ts
│   │   ├── error-handler.test.ts
│   │   └── logger.test.ts
│   ├── services/           # Service layer tests
│   │   └── planContentParser.test.ts
│   ├── errors/             # Error classes tests
│   │   └── app-error.test.ts
│   ├── constants/          # Constants tests
│   │   └── authErrors.test.ts
│   └── schemas/            # Zod schemas tests (TODO)
├── hooks/                  # React hooks tests (TODO)
├── components/             # React components tests (TODO)
└── setup.ts               # Test setup and configuration
```

## Current Coverage (FAZA 1 Complete)

| Category                           | Coverage | Goal | Status |
| ---------------------------------- | -------- | ---- | ------ |
| **lib/utils**                      | 94.56%   | 90%+ | ✅     |
| **lib/errors**                     | 98.27%   | 90%+ | ✅     |
| **lib/services/planContentParser** | 100%     | 90%+ | ✅     |
| **lib/constants/authErrors**       | 100%     | 90%+ | ✅     |

### Test Statistics

- **Total Test Files**: 11
- **Total Tests**: 281
- **All Tests Passing**: ✅

## Implementation Status

### ✅ FAZA 1: Core Utilities (COMPLETED)

#### Utils (8 files) - 94.56% coverage

- ✅ `dateFormatters.test.ts` - 42 tests
- ✅ `timeFormatters.test.ts` - 36 tests
- ✅ `formDateHelpers.test.ts` - 22 tests
- ✅ `planFormHelpers.test.ts` - 19 tests
- ✅ `auth.test.ts` - 16 tests
- ✅ `error-handler.test.ts` - 19 tests
- ✅ `logger.test.ts` - 17 tests

#### Services (1 file) - 100% coverage

- ✅ `planContentParser.test.ts` - 23 tests

#### Errors (1 file) - 98.27% coverage

- ✅ `app-error.test.ts` - 47 tests

#### Constants (1 file) - 100% coverage

- ✅ `authErrors.test.ts` - 24 tests

### 🔄 FAZA 2: Schemas & Low-Level Hooks (TODO)

- ⬜ Zod schemas (7 files)
- ⬜ Low-level hooks (8 files)

### 🔄 FAZA 3: API Hooks (TODO)

- ⬜ Hooks with API dependencies (12 files)

### 🔄 FAZA 4: Components (TODO)

- ⬜ UI components (20+ files)

## Testing Patterns

### 1. Pure Functions (Utils)

```typescript
import { describe, it, expect } from 'vitest';
import { formatDateRange } from '@/lib/utils/dateFormatters';

describe('formatDateRange', () => {
  it('should format complete date range', () => {
    const result = formatDateRange('2024-01-01', '2024-01-05');
    expect(result).toContain('sty');
    expect(result).toContain('2024');
  });
});
```

### 2. Error Classes

```typescript
import { ValidationError } from '@/lib/errors/app-error';

describe('ValidationError', () => {
  it('should have status 400', () => {
    const error = new ValidationError('Invalid data');
    expect(error.statusCode).toBe(400);
  });
});
```

### 3. Services with Complex Logic

```typescript
import { parseGeneratedContent } from '@/lib/services/planContentParser';

describe('parseGeneratedContent', () => {
  it('should parse valid content correctly', () => {
    const content = { days: [...] };
    const result = parseGeneratedContent(content);
    expect(result).not.toBeNull();
  });
});
```

## Best Practices

1. **AAA Pattern**: Arrange, Act, Assert
2. **Descriptive Names**: Use `it('should ...')` format
3. **Isolation**: Each test is independent
4. **Mock External Dependencies**: Use `vi.mock()`
5. **Test Edge Cases**: Include error scenarios
6. **Fast Tests**: Each test < 50ms

## Common Issues & Solutions

### Timezone Issues

Use `vi.setSystemTime()` to control time in tests:

```typescript
beforeEach(() => {
  vi.setSystemTime(new Date('2024-01-15T12:00:00Z'));
});

afterEach(() => {
  vi.useRealTimers();
});
```

### Mocking Modules

```typescript
vi.mock('@/lib/utils/logger', () => ({
  logger: {
    debug: vi.fn(),
    error: vi.fn(),
  },
}));
```

## Documentation

For detailed implementation plans and guides, see:

- [Unit Tests Implementation Plan](../../ai/unit-tests-implementation-plan.md)
- [Unit Tests Quick Reference](../../ai/unit-tests-quick-reference.md)
- [Unit Tests Index](../../ai/UNIT-TESTS-INDEX.md)

## Contributing

When adding new tests:

1. Follow existing patterns
2. Maintain high coverage (80%+)
3. Write descriptive test names
4. Test both happy path and edge cases
5. Run tests before committing

## CI/CD Integration

Tests are automatically run in CI/CD pipeline:

- On every push
- On pull requests
- Before deployment

---

**Last Updated**: 2026-01-05  
**Status**: FAZA 1 Complete ✅  
**Next**: FAZA 2 - Schemas & Hooks
