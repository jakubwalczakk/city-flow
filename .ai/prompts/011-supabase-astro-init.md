# Inicjalizacja Supabase w Astro

Ten dokument zawiera powtarzalny przewodnik tworzenia niezbędnej struktury plików do integracji Supabase z projektem Astro.

## Wymagania wstępne

- Twój projekt powinien używać Astro 5, TypeScript 5, React 19 i Tailwind 4.
- Zainstaluj pakiet `@supabase/supabase-js`.
- Upewnij się, że istnieje plik `/supabase/config.toml`
- Upewnij się, że istnieje plik `/src/db/database.types.ts` i zawiera poprawne definicje typów dla Twojej bazy danych.

WAŻNE: Sprawdź wymagania wstępne przed wykonaniem poniższych działań. Jeśli nie są spełnione, zatrzymaj się i zapytaj użytkownika o naprawę.

## Struktura plików i konfiguracja

### 1. Inicjalizacja klienta Supabase

Utwórz plik `/src/db/supabase.client.ts` z następującą zawartością:

```ts
import { createClient } from '@supabase/supabase-js';

import type { Database } from '../db/database.types.ts';

const supabaseUrl = import.meta.env.SUPABASE_URL;
const supabaseAnonKey = import.meta.env.SUPABASE_KEY;

export const supabaseClient = createClient<Database>(supabaseUrl, supabaseAnonKey);
```

Ten plik inicjalizuje klienta Supabase przy użyciu zmiennych środowiskowych `SUPABASE_URL` i `SUPABASE_KEY`.

### 2. Konfiguracja Middleware

Utwórz plik `/src/middleware/index.ts` z następującą zawartością:

```ts
import { defineMiddleware } from 'astro:middleware';

import { supabaseClient } from '../db/supabase.client.ts';

export const onRequest = defineMiddleware((context, next) => {
  context.locals.supabase = supabaseClient;
  return next();
});
```

Ten middleware dodaje klienta Supabase do kontekstu lokalnego Astro, czyniąc go dostępnym w całej aplikacji.

### 3. Definicje środowiska TypeScript

Utwórz plik `src/env.d.ts` z następującą zawartością:

```ts
/// <reference types="astro/client" />

import type { SupabaseClient } from '@supabase/supabase-js';
import type { Database } from './db/database.types.ts';

declare global {
  namespace App {
    interface Locals {
      supabase: SupabaseClient<Database>;
    }
  }
}

interface ImportMetaEnv {
  readonly SUPABASE_URL: string;
  readonly SUPABASE_KEY: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
```

Ten plik rozszerza typy globalne, aby uwzględnić klienta Supabase w obiekcie `App.Locals` Astro, zapewniając odpowiednie typowanie w całej aplikacji.
