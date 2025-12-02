# Przewodnik Implementacji Usługi OpenRouter

## 1. Opis usługi

Usługa `OpenRouter` będzie centralnym punktem integracji z API OpenRouter.ai w aplikacji CityFlow. Jej głównym zadaniem jest abstrakcja logiki komunikacji z zewnętrznym API, co pozwoli na łatwe i spójne wykorzystywanie modeli językowych (LLM) w różnych częściach systemu. Usługa będzie odpowiedzialna za tworzenie zapytań, wysyłanie ich do OpenRouter, a także za parsowanie i walidację odpowiedzi, ze szczególnym uwzględnieniem odpowiedzi o ustrukturyzowanej formie (JSON).

Plik usługi powinien znajdować się w lokalizacji: `src/lib/services/openrouter.service.ts`.

## 2. Opis konstruktora

Konstruktor klasy `OpenRouterService` będzie przyjmował obiekt konfiguracyjny, co umożliwi elastyczne zarządzanie ustawieniami usługi.

```typescript
// src/lib/services/openrouter.service.ts

import { z } from "zod";

export interface OpenRouterConfig {
  apiKey: string;
  baseUrl?: string;
  defaultModel?: string;
  defaultParams?: Record<string, any>;
}

export class OpenRouterService {
  private readonly config: OpenRouterConfig;
  private readonly httpClient; // Można zaimplementować dedykowanego klienta HTTP

  constructor(config: OpenRouterConfig) {
    if (!config.apiKey) {
      throw new Error("OpenRouter API key is required.");
    }
    this.config = {
      ...config,
      baseUrl: config.baseUrl || "https://openrouter.ai/api/v1",
    };
    // Inicjalizacja klienta HTTP, np. z domyślnymi nagłówkami
    this.httpClient = {
      post: async (url: string, body: any, headers: any) => {
        const fullUrl = `${this.config.baseUrl}${url}`;
        const response = await fetch(fullUrl, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            ...headers,
          },
          body: JSON.stringify(body),
        });
        if (!response.ok) {
          // Podstawowa obsługa błędów HTTP
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.json();
      },
    };
  }
}
```

**Zarządzanie kluczem API:**
Klucz API musi być przechowywany jako zmienna środowiskowa i nigdy nie powinien być umieszczany bezpośrednio w kodzie. W Astro dostęp do zmiennych środowiskowych po stronie serwera uzyskujemy poprzez `import.meta.env`.

Przykład inicjalizacji usługi w kodzie API (np. w `src/pages/api/plans.ts`):

```typescript
const openRouterService = new OpenRouterService({
  apiKey: import.meta.env.OPENROUTER_API_KEY,
});
```

## 3. Publiczne metody i pola

Główną metodą publiczną będzie `getStructuredResponse`, która pozwoli na uzyskanie odpowiedzi w formacie JSON zgodnym z przekazanym schematem Zod.

```typescript
// Wewnątrz klasy OpenRouterService

export interface GetStructuredResponseOptions<T extends z.ZodTypeAny> {
  systemPrompt: string;
  userPrompt: string;
  responseSchema: T;
  model?: string;
  params?: Record<string, any>;
}

public async getStructuredResponse<T extends z.ZodTypeAny>(
  options: GetStructuredResponseOptions<T>
): Promise<z.infer<T>> {
  // Implementacja zostanie dodana w kolejnych krokach
  // 1. Zbuduj ciało zapytania używając metody prywatnej
  // 2. Wyślij zapytanie do API OpenRouter
  // 3. Sparsuj i zwaliduj odpowiedź przy użyciu schematu Zod
  // 4. Zwróć wynik lub rzuć błąd
  return {} as z.infer<T>; // Placeholder
}
```

## 4. Prywatne metody i pola

Metody prywatne będą zawierały logikę pomocniczą, hermetyzując szczegóły implementacyjne.

```typescript
// Wewnątrz klasy OpenRouterService

private buildRequestBody<T extends z.ZodTypeAny>(
  options: GetStructuredResponseOptions<T>
) {
  const { systemPrompt, userPrompt, responseSchema, model, params } = options;

  // Konwersja schematu Zod do JSON Schema
  // Należy dodać pakiet: `npm install zod-to-json-schema`
  const { zodToJsonSchema } = await import('zod-to-json-schema');
  const jsonSchema = zodToJsonSchema(responseSchema, "responseSchema");

  return {
    model: model || this.config.defaultModel || 'anthropic/claude-3.5-sonnet',
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt },
    ],
    response_format: {
      type: 'json_schema',
      json_schema: {
        name: 'responseSchema',
        strict: true,
        schema: jsonSchema.definitions.responseSchema,
      },
    },
    ...this.config.defaultParams,
    ...params,
  };
}

private async parseAndValidateResponse<T extends z.ZodTypeAny>(
  apiResponse: any,
  schema: T
): Promise<z.infer<T>> {
  const content = apiResponse.choices[0]?.message?.content;
  if (!content) {
    throw new Error('Invalid response structure from OpenRouter API.');
  }

  try {
    const parsedContent = JSON.parse(content);
    return schema.parse(parsedContent);
  } catch (error) {
    // Rzucenie błędu walidacji (np. ZodError) lub customowego błędu aplikacji
    throw new Error('Failed to parse or validate the structured response.');
  }
}
```

## 5. Obsługa błędów

Należy zaimplementować solidny mechanizm obsługi błędów, który będzie zgodny z istniejącą w projekcie strukturą (`src/lib/errors/app-error.ts` i `src/lib/utils/error-handler.ts`).

Potencjalne scenariusze błędów:

1.  **Błędy konfiguracyjne:** Brak klucza API.
2.  **Błędy sieciowe:** Problemy z połączeniem z API OpenRouter.
3.  **Błędy API OpenRouter:**
    - `401 Unauthorized`: Nieprawidłowy klucz API.
    - `429 Too Many Requests`: Przekroczony limit zapytań.
    - `400 Bad Request`: Nieprawidłowe parametry zapytania.
    - `5xx Server Error`: Problemy po stronie OpenRouter.
4.  **Błędy walidacji:** Odpowiedź API nie jest zgodna z oczekiwanym schematem JSON.

Przykład rozbudowanej obsługi błędów w metodzie publicznej:

```typescript
// W metodzie getStructuredResponse

try {
  const requestBody = await this.buildRequestBody(options);

  const apiResponse = await this.httpClient.post("/chat/completions", requestBody, {
    Authorization: `Bearer ${this.config.apiKey}`,
  });

  return await this.parseAndValidateResponse(apiResponse, options.responseSchema);
} catch (error: any) {
  // TODO: Zaimplementować mapowanie błędów na AppError
  // np. na podstawie statusu HTTP lub typu błędu
  console.error("Error interacting with OpenRouter API:", error);
  // throw new AppError('OpenRouterServiceError', '...');
  throw error; // Tymczasowe rzucenie oryginalnego błędu
}
```

## 6. Kwestie bezpieczeństwa

1.  **Zarządzanie kluczem API:** Klucz API musi być przechowywany w zmiennych środowiskowych (`.env`) i nigdy nie być dostępny po stronie klienta. Plik `.env` powinien być dodany do `.gitignore`.
2.  **Walidacja danych wejściowych:** Wszystkie dane pochodzące od użytkownika (np. `userPrompt`) powinny być traktowane jako niezaufane. Chociaż w tym przypadku są one przekazywane do zewnętrznego API, warto być świadomym ryzyka związanego z atakami typu _prompt injection_.
3.  **Ograniczenie uprawnień klucza:** W panelu OpenRouter warto utworzyć dedykowany klucz API dla aplikacji CityFlow z nałożonymi limitami użycia, aby zminimalizować ryzyko nadużyć w przypadku wycieku.

## 7. Plan wdrożenia krok po kroku

1.  **Konfiguracja środowiska:**
    - Dodaj zmienną `OPENROUTER_API_KEY` do pliku `.env` (i `.env.example`).
    - Zainstaluj zależność: `npm install zod-to-json-schema`.

2.  **Utworzenie pliku usługi:**
    - Stwórz plik `src/lib/services/openrouter.service.ts`.

3.  **Implementacja konstruktora i typów:**
    - Zaimplementuj interfejs `OpenRouterConfig` oraz konstruktor klasy `OpenRouterService` zgodnie z punktem 2.

4.  **Implementacja metod prywatnych:**
    - Zaimplementuj metodę `buildRequestBody`, włączając w to logikę konwersji schematu Zod na JSON Schema.
    - Zaimplementuj metodę `parseAndValidateResponse`, która będzie odpowiedzialna za parsowanie i walidację odpowiedzi.

5.  **Implementacja metody publicznej `getStructuredResponse`:**
    - Połącz logikę z metod prywatnych w metodzie `getStructuredResponse`.
    - Dodaj podstawową obsługę błędów `try...catch`.

6.  **Integracja z systemem obsługi błędów:**
    - Rozbuduj blok `catch`, aby mapować błędy `fetch` oraz błędy walidacji Zod na customowe błędy aplikacji, wykorzystując istniejący `ErrorHandler`.

7.  **Testowanie:**
    - Utwórz tymczasowy endpoint API (np. `src/pages/api/test-openrouter.ts`) w celu przetestowania usługi.
    - Zdefiniuj prosty schemat Zod i prompt, aby zweryfikować poprawność działania metody `getStructuredResponse`.

Przykład użycia w endpointcie testowym:

```typescript
// src/pages/api/test-openrouter.ts
import type { APIRoute } from "astro";
import { z } from "zod";
import { OpenRouterService } from "@/lib/services/openrouter.service";

export const GET: APIRoute = async () => {
  try {
    const service = new OpenRouterService({
      apiKey: import.meta.env.OPENROUTER_API_KEY!,
    });

    const travelPlanSchema = z.object({
      destination: z.string().describe("The city of the travel plan."),
      durationDays: z.number().describe("Total duration of the trip in days."),
      activities: z.array(z.string()).describe("A list of recommended activities."),
    });

    const result = await service.getStructuredResponse({
      systemPrompt: "You are a travel planning assistant.",
      userPrompt: "Create a simple travel plan for a 3-day trip to Paris.",
      responseSchema: travelPlanSchema,
    });

    return new Response(JSON.stringify(result, null, 2), { status: 200 });
  } catch (error) {
    console.error(error);
    return new Response("An error occurred.", { status: 500 });
  }
};
```
