# Przewodnik migracji do prawdziwej autoryzacji Supabase

## Przegląd

Ten dokument opisuje jak przeprowadzić migrację z obecnego systemu używającego `DEFAULT_USER_ID` do pełnej autoryzacji opartej na JWT tokenach Supabase.

## Status obecny

### Co jest już zaimplementowane

1. **Auth Helper** (`src/lib/utils/auth.ts`):
   - Funkcja `getAuthenticatedUser()` - główna funkcja do pobierania użytkownika
   - Funkcja `getUserId()` - shorthand do pobierania tylko ID użytkownika
   - Funkcja `tryGetAuthenticatedUser()` - opcjonalna autoryzacja bez rzucania błędu
   - Automatyczne przełączanie między trybem deweloperskim (DEFAULT_USER_ID) a produkcyjnym (JWT)

2. **Zrefaktorowany endpoint profili** (`src/pages/api/profiles/index.ts`):
   - GET i PATCH używają już `getAuthenticatedUser()`
   - Gotowe do pracy z JWT tokenami w produkcji

3. **Obsługa błędów**:
   - `UnauthorizedError` dla problemów z autentykacją
   - Centralna obsługa błędów przez `handleApiError`

### Co wymaga migracji

Wszystkie pozostałe endpointy API, które obecnie używają wzorca:

```typescript
const user = { id: DEFAULT_USER_ID };
```

## Kroki migracji

### Krok 1: Aktualizacja middleware Astro

Obecnie middleware tylko dodaje klienta Supabase do `locals`. Aby obsługiwać JWT, middleware powinien:

1. Wyciągać token z cookie lub Authorization header
2. Walidować token za pomocą Supabase
3. Dodawać sesję użytkownika do `locals`

**Plik do zmiany:** `src/middleware/index.ts`

**Obecna implementacja:**

```typescript
import { defineMiddleware } from 'astro:middleware';
import { supabaseClient } from '../db/supabase.client';

export const onRequest = defineMiddleware((context, next) => {
  context.locals.supabase = supabaseClient;
  return next();
});
```

**Docelowa implementacja:**

```typescript
import { defineMiddleware } from 'astro:middleware';
import { supabaseClient } from '../db/supabase.client';
import { logger } from '../lib/utils/logger';

export const onRequest = defineMiddleware(async (context, next) => {
  context.locals.supabase = supabaseClient;

  // Skip authentication for public routes
  const publicRoutes = ['/login', '/register', '/'];
  if (publicRoutes.some((route) => context.url.pathname.startsWith(route))) {
    return next();
  }

  // Try to get the session from cookies or Authorization header
  const authHeader = context.request.headers.get('Authorization');
  let token: string | null = null;

  if (authHeader?.startsWith('Bearer ')) {
    token = authHeader.substring(7);
  } else {
    // Try to get token from cookies (for SSR pages)
    const cookies = context.cookies;
    token = cookies.get('sb-access-token')?.value || null;
  }

  if (token) {
    try {
      const {
        data: { user },
        error,
      } = await supabaseClient.auth.getUser(token);

      if (user && !error) {
        context.locals.user = user;
        logger.debug('User authenticated via middleware', { userId: user.id });
      }
    } catch (error) {
      logger.warn('Failed to authenticate user in middleware', { error });
    }
  }

  return next();
});
```

**Wymagane typy** (dodać do `src/env.d.ts`):

```typescript
declare namespace App {
  interface Locals {
    supabase: SupabaseClient;
    user?: {
      id: string;
      email?: string;
    };
  }
}
```

### Krok 2: Aktualizacja pozostałych endpointów

Każdy endpoint powinien zostać zaktualizowany, aby używał `getAuthenticatedUser()`.

**Przed:**

```typescript
import { DEFAULT_USER_ID } from '@/db/supabase.client';

export const GET: APIRoute = async ({ locals }) => {
  const user = { id: DEFAULT_USER_ID };
  // ... rest of the code
};
```

**Po:**

```typescript
import { getAuthenticatedUser } from '@/lib/utils/auth';

export const GET: APIRoute = async (context) => {
  const user = await getAuthenticatedUser(context);
  // ... rest of the code
};
```

**Lista endpointów do zaktualizowania:**

1. ✅ `src/pages/api/profiles/index.ts` - **GOTOWE**
2. ❌ `src/pages/api/plans.ts` - wymaga aktualizacji
3. ❌ `src/pages/api/plans/[planId].ts` - wymaga aktualizacji
4. ❌ `src/pages/api/plans/[planId]/generate.ts` - wymaga aktualizacji
5. ❌ `src/pages/api/plans/[planId]/export.ts` - wymaga aktualizacji
6. ❌ `src/pages/api/plans/[planId]/feedback.ts` - wymaga aktualizacji
7. ❌ `src/pages/api/plans/[planId]/fixed-points.ts` - wymaga aktualizacji
8. ❌ `src/pages/api/plans/[planId]/fixed-points/[id].ts` - wymaga aktualizacji
9. ❌ `src/pages/api/plans/[planId]/days/[date]/items.ts` - wymaga aktualizacji
10. ❌ `src/pages/api/plans/[planId]/days/[date]/items/[itemId].ts` - wymaga aktualizacji

### Krok 3: Aktualizacja frontendu

Frontend będzie musiał:

1. **Przechowywać token JWT** po logowaniu
2. **Wysyłać token w każdym zapytaniu API**
3. **Obsługiwać wygaśnięcie tokenu** i odświeżanie

**Przykład: Interceptor dla fetch**

```typescript
// src/lib/utils/api-client.ts
export async function authenticatedFetch(url: string, options: RequestInit = {}): Promise<Response> {
  const token = getStoredToken(); // z localStorage lub cookies

  const headers = new Headers(options.headers);
  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }
  headers.set('Content-Type', 'application/json');

  const response = await fetch(url, {
    ...options,
    headers,
  });

  // Handle 401 - token expired
  if (response.status === 401) {
    // Try to refresh token
    const refreshed = await refreshToken();
    if (refreshed) {
      // Retry the request with new token
      return authenticatedFetch(url, options);
    } else {
      // Redirect to login
      window.location.href = '/login';
    }
  }

  return response;
}
```

**Przykład użycia w komponencie:**

```typescript
// src/components/ProfileForm.tsx
import { authenticatedFetch } from '@/lib/utils/api-client';

async function updateProfile(data: UpdateProfileCommand) {
  const response = await authenticatedFetch('/api/profiles', {
    method: 'PATCH',
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message);
  }

  return await response.json();
}
```

### Krok 4: Konfiguracja Supabase Auth

1. **Włącz Email Auth** w Supabase Dashboard:
   - Settings → Authentication → Providers
   - Włącz Email provider

2. **Skonfiguruj redirect URLs**:
   - Settings → Authentication → URL Configuration
   - Dodaj dozwolone redirect URLs (np. `http://localhost:3000/auth/callback`, `https://yourdomain.com/auth/callback`)

3. **Utwórz strony auth**:
   - `src/pages/login.astro` - strona logowania
   - `src/pages/register.astro` - strona rejestracji
   - `src/pages/auth/callback.astro` - callback po logowaniu

### Krok 5: Implementacja onboarding flow

Po rejestracji, użytkownik powinien:

1. Być przekierowany na stronę onboardingu
2. Wypełnić swoje preferencje
3. Wywołać `PATCH /api/profiles` z `onboarding_completed: true`

**Przykład strony onboarding:**

```typescript
// src/pages/onboarding.astro
---
import OnboardingForm from '@/components/OnboardingForm';
---

<OnboardingForm client:load />
```

```typescript
// src/components/OnboardingForm.tsx
import { authenticatedFetch } from '@/lib/utils/api-client';

export default function OnboardingForm() {
  const handleSubmit = async (data) => {
    await authenticatedFetch('/api/profiles', {
      method: 'PATCH',
      body: JSON.stringify({
        preferences: data.preferences,
        travel_pace: data.travel_pace,
        onboarding_completed: true,
      }),
    });

    // Redirect to dashboard
    window.location.href = '/dashboard';
  };

  // ... form implementation
}
```

### Krok 6: Testowanie migracji

#### Test 1: Tryb deweloperski (obecny)

```bash
# DEV=true (domyślnie w dev mode)
npm run dev

# Wszystkie endpointy powinny działać z DEFAULT_USER_ID
curl http://localhost:3000/api/profiles
```

#### Test 2: Tryb produkcyjny z JWT

```bash
# Ustaw NODE_ENV=production
export NODE_ENV=production
npm run build
npm run preview

# Test bez tokenu (powinien zwrócić 401)
curl http://localhost:4321/api/profiles
# Expected: {"error": "Missing or invalid authorization token"}

# Test z prawidłowym tokenem
curl http://localhost:4321/api/profiles \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
# Expected: Profil użytkownika
```

#### Test 3: End-to-end flow

1. Zarejestruj nowego użytkownika
2. Zaloguj się
3. Ukończ onboarding
4. Przetestuj wszystkie endpointy API

### Krok 7: Deployment checklist

Przed wdrożeniem na produkcję:

- [ ] Wszystkie endpointy używają `getAuthenticatedUser()`
- [ ] Middleware jest zaktualizowany
- [ ] Frontend wysyła JWT tokeny
- [ ] Supabase Auth jest skonfigurowany
- [ ] Strony logowania/rejestracji są gotowe
- [ ] Onboarding flow działa
- [ ] Zmienne środowiskowe są ustawione (SUPABASE_URL, SUPABASE_KEY)
- [ ] Redirect URLs są skonfigurowane w Supabase
- [ ] Testy E2E przeszły pomyślnie
- [ ] Dokumentacja jest zaktualizowana

## Dodatkowe uwagi

### Row Level Security (RLS)

Rozważ włączenie RLS w Supabase dla dodatkowej warstwy bezpieczeństwa:

```sql
-- Enable RLS on profiles table
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Policy: Users can only read their own profile
CREATE POLICY "Users can read own profile"
ON profiles FOR SELECT
USING (auth.uid() = id);

-- Policy: Users can only update their own profile
CREATE POLICY "Users can update own profile"
ON profiles FOR UPDATE
USING (auth.uid() = id);
```

Podobne polityki można utworzyć dla tabel `plans`, `fixed_points`, `feedback`.

### Refresh tokens

Supabase automatycznie obsługuje refresh tokeny. Upewnij się, że:

- Refresh token jest przechowywany w bezpiecznym miejscu (httpOnly cookie)
- Frontend automatycznie odświeża token przed wygaśnięciem

### Monitoring i logging

Po wdrożeniu, monitoruj:

- Liczbę błędów 401 (problemy z autentykacją)
- Czas odpowiedzi endpointów (czy walidacja JWT nie spowalnia)
- Nieudane próby logowania (bezpieczeństwo)

## Zasoby

- [Supabase Auth Documentation](https://supabase.com/docs/guides/auth)
- [JWT Best Practices](https://auth0.com/blog/jwt-handbook/)
- [Astro Middleware Documentation](https://docs.astro.build/en/guides/middleware/)

## Wsparcie

W przypadku problemów:

1. Sprawdź logi serwera (`logger.debug/error`)
2. Sprawdź Supabase Dashboard → Authentication → Users
3. Zweryfikuj token JWT na [jwt.io](https://jwt.io)
4. Sprawdź czy zmienne środowiskowe są poprawnie ustawione
