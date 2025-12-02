# Plan testowania ProfileService

## Przegląd

Ten dokument opisuje plan testowania dla `ProfileService`, który jest odpowiedzialny za operacje na profilach użytkowników w bazie danych.

## Testy jednostkowe

### ProfileService.findProfileByUserId

#### Test 1: Powinien zwrócić profil dla istniejącego użytkownika

```typescript
// Setup
const mockSupabase = createMockSupabaseClient();
const userId = "existing-user-id";
const mockProfile = {
  id: userId,
  preferences: ["Art & Museums", "Local Food"],
  travel_pace: "moderate",
  generations_remaining: 5,
  onboarding_completed: true,
  created_at: "2025-11-10T10:00:00Z",
  updated_at: "2025-11-10T10:00:00Z",
};

mockSupabase.from().select().eq().single.mockResolvedValue({
  data: mockProfile,
  error: null,
});

// Execute
const result = await ProfileService.findProfileByUserId(mockSupabase, userId);

// Assert
expect(result).toEqual(mockProfile);
expect(mockSupabase.from).toHaveBeenCalledWith("profiles");
```

#### Test 2: Powinien zwrócić null dla nieistniejącego użytkownika

```typescript
// Setup
const mockSupabase = createMockSupabaseClient();
const userId = "non-existent-user-id";

mockSupabase
  .from()
  .select()
  .eq()
  .single.mockResolvedValue({
    data: null,
    error: { code: "PGRST116", message: "No rows found" },
  });

// Execute
const result = await ProfileService.findProfileByUserId(mockSupabase, userId);

// Assert
expect(result).toBeNull();
```

#### Test 3: Powinien rzucić błąd dla innych błędów bazy danych

```typescript
// Setup
const mockSupabase = createMockSupabaseClient();
const userId = "user-id";
const dbError = { code: "DB_ERROR", message: "Database connection failed" };

mockSupabase.from().select().eq().single.mockResolvedValue({
  data: null,
  error: dbError,
});

// Execute & Assert
await expect(ProfileService.findProfileByUserId(mockSupabase, userId)).rejects.toThrow();
```

### ProfileService.updateProfile

#### Test 4: Powinien zaktualizować profil z pełnymi danymi

```typescript
// Setup
const mockSupabase = createMockSupabaseClient();
const userId = "user-id";
const updateData = {
  preferences: ["Art & Museums", "Local Food", "Nightlife"],
  travel_pace: "intensive" as const,
  onboarding_completed: true,
};
const mockUpdatedProfile = {
  id: userId,
  ...updateData,
  generations_remaining: 5,
  created_at: "2025-11-10T10:00:00Z",
  updated_at: "2025-11-10T20:00:00Z",
};

mockSupabase.from().update().eq().select().single.mockResolvedValue({
  data: mockUpdatedProfile,
  error: null,
});

// Execute
const result = await ProfileService.updateProfile(mockSupabase, userId, updateData);

// Assert
expect(result).toEqual(mockUpdatedProfile);
expect(mockSupabase.from).toHaveBeenCalledWith("profiles");
expect(mockSupabase.from().update).toHaveBeenCalledWith(
  expect.objectContaining({
    ...updateData,
    updated_at: expect.any(String),
  })
);
```

#### Test 5: Powinien zaktualizować profil z częściowymi danymi (tylko travel_pace)

```typescript
// Setup
const mockSupabase = createMockSupabaseClient();
const userId = "user-id";
const updateData = {
  travel_pace: "slow" as const,
};
const mockUpdatedProfile = {
  id: userId,
  preferences: ["Art & Museums", "Local Food"],
  travel_pace: "slow",
  generations_remaining: 5,
  onboarding_completed: true,
  created_at: "2025-11-10T10:00:00Z",
  updated_at: "2025-11-10T20:00:00Z",
};

mockSupabase.from().update().eq().select().single.mockResolvedValue({
  data: mockUpdatedProfile,
  error: null,
});

// Execute
const result = await ProfileService.updateProfile(mockSupabase, userId, updateData);

// Assert
expect(result).toEqual(mockUpdatedProfile);
expect(mockSupabase.from().update).toHaveBeenCalledWith(
  expect.objectContaining({
    travel_pace: "slow",
    updated_at: expect.any(String),
  })
);
```

#### Test 6: Powinien zaktualizować profil z pustym obiektem danych

```typescript
// Setup
const mockSupabase = createMockSupabaseClient();
const userId = "user-id";
const updateData = {};
const mockUpdatedProfile = {
  id: userId,
  preferences: ["Art & Museums", "Local Food"],
  travel_pace: "moderate",
  generations_remaining: 5,
  onboarding_completed: true,
  created_at: "2025-11-10T10:00:00Z",
  updated_at: "2025-11-10T20:00:00Z",
};

mockSupabase.from().update().eq().select().single.mockResolvedValue({
  data: mockUpdatedProfile,
  error: null,
});

// Execute
const result = await ProfileService.updateProfile(mockSupabase, userId, updateData);

// Assert
expect(result).toEqual(mockUpdatedProfile);
// Tylko updated_at powinien być zaktualizowany
expect(mockSupabase.from().update).toHaveBeenCalledWith({
  updated_at: expect.any(String),
});
```

#### Test 7: Powinien rzucić DatabaseError dla błędu bazy danych

```typescript
// Setup
const mockSupabase = createMockSupabaseClient();
const userId = "user-id";
const updateData = { travel_pace: "intensive" as const };
const dbError = { code: "DB_ERROR", message: "Update failed" };

mockSupabase.from().update().eq().select().single.mockResolvedValue({
  data: null,
  error: dbError,
});

// Execute & Assert
await expect(ProfileService.updateProfile(mockSupabase, userId, updateData)).rejects.toThrow(DatabaseError);
```

#### Test 8: Powinien automatycznie ustawić updated_at na bieżący czas

```typescript
// Setup
const mockSupabase = createMockSupabaseClient();
const userId = "user-id";
const updateData = { travel_pace: "slow" as const };
const beforeUpdate = new Date().toISOString();

// Execute
await ProfileService.updateProfile(mockSupabase, userId, updateData);

// Assert
const updateCall = mockSupabase.from().update.mock.calls[0][0];
expect(updateCall.updated_at).toBeDefined();
expect(new Date(updateCall.updated_at).getTime()).toBeGreaterThanOrEqual(new Date(beforeUpdate).getTime());
```

#### Test 9: Powinien logować operację aktualizacji

```typescript
// Setup
const mockSupabase = createMockSupabaseClient();
const mockLogger = jest.spyOn(logger, "debug");
const userId = "user-id";
const updateData = { travel_pace: "intensive" as const };

// Execute
await ProfileService.updateProfile(mockSupabase, userId, updateData);

// Assert
expect(mockLogger).toHaveBeenCalledWith("Updating profile", { userId, data: updateData });
expect(mockLogger).toHaveBeenCalledWith("Profile updated successfully", { userId });
```

## Testy integracyjne

### Integration Test 1: Pełny cykl aktualizacji profilu

```typescript
// Setup - używa prawdziwej bazy danych testowej
const testUserId = await createTestUser();

// Execute
const updateData = {
  preferences: ["Art & Museums", "Local Food"],
  travel_pace: "moderate" as const,
  onboarding_completed: true,
};

const updatedProfile = await ProfileService.updateProfile(supabase, testUserId, updateData);

// Assert
expect(updatedProfile.preferences).toEqual(updateData.preferences);
expect(updatedProfile.travel_pace).toEqual(updateData.travel_pace);
expect(updatedProfile.onboarding_completed).toBe(true);

// Verify in database
const fetchedProfile = await ProfileService.findProfileByUserId(supabase, testUserId);
expect(fetchedProfile).toEqual(updatedProfile);

// Cleanup
await deleteTestUser(testUserId);
```

### Integration Test 2: Weryfikacja walidacji na poziomie bazy danych

```typescript
// Test sprawdza czy constraints bazy danych są poprawnie obsługiwane
// Na przykład: sprawdzenie czy travel_pace akceptuje tylko dozwolone wartości
```

## Testy E2E dla endpointa

### E2E Test 1: PATCH /api/profiles - sukces z pełnymi danymi

```typescript
const response = await fetch("/api/profiles", {
  method: "PATCH",
  headers: {
    "Content-Type": "application/json",
    Authorization: `Bearer ${validToken}`,
  },
  body: JSON.stringify({
    preferences: ["Art & Museums", "Local Food"],
    travel_pace: "intensive",
    onboarding_completed: true,
  }),
});

expect(response.status).toBe(200);
const data = await response.json();
expect(data.preferences).toEqual(["Art & Museums", "Local Food"]);
expect(data.travel_pace).toBe("intensive");
expect(data.onboarding_completed).toBe(true);
```

### E2E Test 2: PATCH /api/profiles - walidacja (za mało preferencji)

```typescript
const response = await fetch("/api/profiles", {
  method: "PATCH",
  headers: {
    "Content-Type": "application/json",
    Authorization: `Bearer ${validToken}`,
  },
  body: JSON.stringify({
    preferences: ["Art & Museums"], // Tylko 1 element
  }),
});

expect(response.status).toBe(400);
const data = await response.json();
expect(data.error).toBe("Validation failed.");
expect(data.details[0].message).toContain("at least 2 items");
```

### E2E Test 3: PATCH /api/profiles - częściowa aktualizacja

```typescript
const response = await fetch("/api/profiles", {
  method: "PATCH",
  headers: {
    "Content-Type": "application/json",
    Authorization: `Bearer ${validToken}`,
  },
  body: JSON.stringify({
    travel_pace: "slow",
  }),
});

expect(response.status).toBe(200);
const data = await response.json();
expect(data.travel_pace).toBe("slow");
// Inne pola powinny pozostać niezmienione
```

## Konfiguracja środowiska testowego

### Wymagane zależności

```json
{
  "devDependencies": {
    "vitest": "^2.0.0",
    "@vitest/ui": "^2.0.0",
    "@testing-library/react": "^16.0.0",
    "@testing-library/jest-dom": "^6.0.0",
    "msw": "^2.0.0"
  }
}
```

### Plik konfiguracyjny vitest.config.ts

```typescript
import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    globals: true,
    environment: "node",
    setupFiles: ["./tests/setup.ts"],
    coverage: {
      reporter: ["text", "json", "html"],
      exclude: ["node_modules/", "tests/", "**/*.d.ts", "**/*.config.*", "**/dist/**"],
    },
  },
});
```

### Setup file (tests/setup.ts)

```typescript
import { beforeAll, afterAll, afterEach } from "vitest";

// Setup database connection for integration tests
beforeAll(async () => {
  // Initialize test database
});

afterEach(async () => {
  // Clean up test data
});

afterAll(async () => {
  // Close database connections
});
```

## Mock Helpers

### Supabase Client Mock

```typescript
export function createMockSupabaseClient() {
  const mockSingle = jest.fn();
  const mockSelect = jest.fn(() => ({
    eq: jest.fn(() => ({ single: mockSingle })),
  }));
  const mockUpdate = jest.fn(() => ({
    eq: jest.fn(() => ({
      select: jest.fn(() => ({ single: mockSingle })),
    })),
  }));
  const mockFrom = jest.fn(() => ({
    select: mockSelect,
    update: mockUpdate,
  }));

  return {
    from: mockFrom,
  } as any;
}
```

## Pokrycie kodu (Coverage Goals)

- **Linie kodu**: minimum 80%
- **Funkcje**: minimum 90%
- **Gałęzie**: minimum 75%

## Uruchamianie testów

```bash
# Wszystkie testy
npm run test

# Tylko testy jednostkowe
npm run test:unit

# Tylko testy integracyjne
npm run test:integration

# Tylko testy E2E
npm run test:e2e

# Z coverage
npm run test:coverage

# Watch mode
npm run test:watch
```

## Notatki implementacyjne

1. **Mock Supabase Client**: Należy stworzyć pomocnicze funkcje do mockowania klienta Supabase, aby uniknąć wywoływania prawdziwych zapytań do bazy danych w testach jednostkowych.

2. **Test Database**: Dla testów integracyjnych należy użyć osobnej instancji bazy danych testowej lub kontenerów Docker z Supabase.

3. **Logger Mocking**: Logger powinien być mockowany w testach, aby uniknąć zaśmiecania output'u testów.

4. **Izolacja testów**: Każdy test powinien być niezależny i nie powinien wpływać na inne testy. Używaj `beforeEach` i `afterEach` do czyszczenia stanu.

5. **Test Data Builders**: Rozważ utworzenie builderów lub fabryk do tworzenia danych testowych, aby testy były bardziej czytelne.
