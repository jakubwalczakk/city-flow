# Plan wdrożenia kategoryzacji atrakcji

Celem jest dodanie kategoryzacji do każdego punktu w wygenerowanym planie podróży, aby ułatwić użytkownikom wizualne rozróżnianie typów aktywności.

## 1. Zdefiniowanie kategorii

Na podstawie Twojej prośby i analizy `prd.md`, zdefiniowano następujące kategorie:

-   `history`: Zabytki historyczne
-   `food`: Jedzenie i gastronomia
-   `sport`: Aktywności sportowe
-   `nature`: Atrakcje związane z naturą
-   `culture`: Kultura i sztuka (np. muzea, teatry, oceanaria)
-   `transport`: Logistyka i transport (np. lot, pociąg, autobus)
-   `accommodation`: Zakwaterowanie (np. zameldowanie w hotelu)
-   `other`: Inne

Dodałem kategorię `accommodation`, która wydaje się przydatna w kontekście planowania podróży.

## 2. Aktualizacja dokumentacji

### 2.1. Aktualizacja schematu bazy danych (`.ai/db-plan.md`)

-   W strukturze `generated_content` (JSONB) w tabeli `plans`, do każdego obiektu w tablicy `items` zostanie dodane pole `category` typu `TEXT`.
-   Zostanie dodana sekcja opisująca zdefiniowane kategorie.

### 2.2. Aktualizacja dokumentu wymagań produktu (`.ai/prd.md`)

-   Do sekcji `5.4. Generowanie planu (AI Core)` zostanie dodana nowa historyjka użytkownika (`US-037`) opisująca wymaganie wyświetlania kategorii (i ikon) dla punktów planu.

## 3. Aktualizacja kodu źródłowego

### 3.1. Aktualizacja typów TypeScript (`src/types.ts`)

-   Zostanie zdefiniowany nowy typ `TimelineItemCategory` jako unia literałów tekstowych dla zdefiniowanych kategorii.
-   Do interfejsu `TimelineItem` zostanie dodane pole `category: TimelineItemCategory`.

### 3.2. Modyfikacja logiki generowania planu (backend)

-   Należy zaktualizować prompt wysyłany do AI (w `openrouter.service.ts` lub podobnym), aby w odpowiedzi JSON dla każdego punktu planu zawierał pole `category` z jedną ze zdefiniowanych wartości. To jest kluczowy krok, aby dane faktycznie pojawiały się w systemie.

### 3.3. Aktualizacja komponentów UI (frontend)

-   Komponenty odpowiedzialne za wyświetlanie planu (np. `GeneratedPlanView.tsx` i `EventTimeline.tsx`) będą musiały zostać zaktualizowane, aby odczytywać nowe pole `category`.
-   Należy przygotować zestaw ikon odpowiadających każdej kategorii i wyświetlać je obok nazwy atrakcji.

## 4. Planowane kroki

1.  **Krok 1:** Zapisanie tego planu w pliku `.ai/improve-activities-categorization-implementation-plan.md`.
2.  **Krok 2:** Zmodyfikowanie pliku `.ai/db-plan.md` w celu odzwierciedlenia zmian w schemacie bazy danych.
3.  **Krok 3:** Zmodyfikowanie pliku `src/types.ts` w celu dodania nowych typów i aktualizacji istniejących.
4.  **Krok 4:** Zmodyfikowanie pliku `.ai/prd.md` w celu dodania nowej historyjki użytkownika.
5.  **Krok 5:** Poinformowanie Cię o zakończonych zmianach w dokumentacji i kodzie oraz o dalszych krokach, które należy podjąć (aktualizacja logiki AI i UI).
