# CityFlow - Schemat Bazy Danych PostgreSQL

## 1. Tabele

### 1.1. `profiles`
Tabela przechowująca dane użytkowników specyficzne dla aplikacji - będzie obsługiwana przez Supabase Auth.

| Kolumna | Typ | Ograniczenia | Opis |
|---------|-----|--------------|------|
| `id` | `UUID` | `PRIMARY KEY`, `REFERENCES auth.users(id) ON DELETE CASCADE` | Klucz główny, identyczny z ID użytkownika w Supabase Auth |
| `preferences` | `TEXT[]` | `CHECK (array_length(preferences, 1) BETWEEN 2 AND 5)` | Tablica preferencji turystycznych (2-5 tagów) |
| `travel_pace` | `travel_pace_enum` | | Tempo zwiedzania użytkownika |
| `generations_remaining` | `INTEGER` | `NOT NULL`, `DEFAULT 5`, `CHECK (generations_remaining >= 0)` | Liczba pozostałych darmowych generacji planów w bieżącym miesiącu |
| `onboarding_completed` | `BOOLEAN` | `NOT NULL`, `DEFAULT false` | Status ukończenia procesu onboardingu |
| `created_at` | `TIMESTAMPTZ` | `NOT NULL`, `DEFAULT now()` | Data utworzenia profilu |
| `updated_at` | `TIMESTAMPTZ` | `NOT NULL`, `DEFAULT now()` | Data ostatniej aktualizacji profilu |

### 1.2. `plans`
Centralna tabela zarządzająca notatkami i wygenerowanymi planami podróży.

| Kolumna | Typ | Ograniczenia | Opis |
|---------|-----|--------------|------|
| `id` | `UUID` | `PRIMARY KEY`, `DEFAULT gen_random_uuid()` | Klucz główny |
| `user_id` | `UUID` | `NOT NULL`, `REFERENCES auth.users(id) ON DELETE CASCADE` | ID właściciela planu |
| `name` | `TEXT` | `NOT NULL` | Nazwa planu (domyślnie generowana z miasta i dat, edytowalna przez użytkownika) |
| `destination` | `TEXT` | `NOT NULL` | Miasto/region docelowy |
| `start_date` | `DATE` | | Data rozpoczęcia podróży (może być przybliżona) |
| `end_date` | `DATE` | `CHECK (end_date IS NULL OR end_date >= start_date)` | Data zakończenia podróży |
| `notes` | `TEXT` | | Luźne notatki użytkownika (cele podróży, pomysły) jako input do wygenerowanego planu |
| `status` | `plan_status_enum` | `NOT NULL`, `DEFAULT 'draft'` | Status planu: `draft`, `generated`, `archived` |
| `generated_content` | `JSONB` | | Wygenerowany przez AI szczegółowy plan (struktura opisana poniżej) |
| `created_at` | `TIMESTAMPTZ` | `NOT NULL`, `DEFAULT now()` | Data utworzenia planu |
| `updated_at` | `TIMESTAMPTZ` | `NOT NULL`, `DEFAULT now()` | Data ostatniej aktualizacji planu |

**Struktura `generated_content` (JSONB):**
```json
{
  "days": [
    {
      "date": "2025-05-15",
      "items": [
        {
          "id": "uuid",
          "time": "09:00",
          "type": "activity|meal|transport",
          "title": "Koloseum",
          "description": "Wizyta w starożytnym amfiteatrze",
          "location": "Piazza del Colosseo, 1",
          "estimated_price": "16 EUR",
          "estimated_duration": "2 godziny",
          "notes": "Sprawdź godziny otwarcia"
        }
      ]
    }
  ],
  "modifications": [
    "Usunięto Muzeum X, aby plan był realistyczny"
  ],
  "warnings": [
    "Plan to sugestia AI. Sprawdź godziny otwarcia i ceny przed wyjazdem."
  ]
}
```

### 1.3. `fixed_points`
Tabela przechowująca niezmienne, priorytetowe punkty planu (np. rezerwacje).

| Kolumna | Typ | Ograniczenia | Opis |
|---------|-----|--------------|------|
| `id` | `UUID` | `PRIMARY KEY`, `DEFAULT gen_random_uuid()` | Klucz główny |
| `plan_id` | `UUID` | `NOT NULL`, `REFERENCES plans(id) ON DELETE CASCADE` | ID planu, do którego należy punkt |
| `location` | `TEXT` | `NOT NULL` | Nazwa miejsca/atrakcji |
| `event_at` | `TIMESTAMPTZ` | `NOT NULL` | Data i godzina wizyty |
| `event_duration` | `INTEGER` | `NOT NULL` | Czas trwania wizyty wyrażony w minutach |
| `description` | `TEXT` | | Dodatkowe notatki użytkownika |
| `created_at` | `TIMESTAMPTZ` | `NOT NULL`, `DEFAULT now()` | Data utworzenia stałego punktu |
| `updated_at` | `TIMESTAMPTZ` | `NOT NULL`, `DEFAULT now()` | Data ostatniej aktualizacji |

### 1.4. `feedback`
Tabela zbierająca oceny i komentarze użytkowników na temat wygenerowanych planów.

| Kolumna | Typ | Ograniczenia | Opis |
|---------|-----|--------------|------|
| `id` | `UUID` | `PRIMARY KEY`, `DEFAULT gen_random_uuid()` | Klucz główny |
| `plan_id` | `UUID` | `NOT NULL`, `REFERENCES plans(id) ON DELETE CASCADE` | ID ocenianego planu |
| `user_id` | `UUID` | `NOT NULL`, `REFERENCES auth.users(id) ON DELETE CASCADE` | ID użytkownika wystawiającego ocenę |
| `rating` | `feedback_rating_enum` | `NOT NULL` | Ocena: `thumbs_up` lub `thumbs_down` |
| `comment` | `TEXT` | | Opcjonalny komentarz tekstowy |
| `created_at` | `TIMESTAMPTZ` | `NOT NULL`, `DEFAULT now()` | Data wystawienia opinii |
| `updated_at` | `TIMESTAMPTZ` | `NOT NULL`, `DEFAULT now()` | Data ostatniej aktualizacji opinii |
| `UNIQUE(plan_id, user_id)` | | | Jeden użytkownik może wystawić tylko jedną ocenę dla danego planu |

## 2. Typy wyliczeniowe (ENUM)
### 2.1. `travel_pace_enum` ENUM = ['slow', 'moderate', 'intensive']
### 2.2. `plan_status_enum` ENUM = ['draft', 'generated', 'archived']
### 2.3. `feedback_rating_enum` ENUM = ['thumbs_up', 'thumbs_down']

## 3. Relacje między tabelami

### 3.1. `auth.users` → `profiles` (1:1)
- Jeden użytkownik posiada dokładnie jeden profil
- Klucz obcy: `profiles.id` → `auth.users.id`
- Kaskadowe usuwanie: Usunięcie użytkownika usuwa profil

### 3.2. `auth.users` → `plans` (1:N)
- Jeden użytkownik może mieć wiele planów
- Klucz obcy: `plans.user_id` → `auth.users.id`
- Kaskadowe usuwanie: Usunięcie użytkownika usuwa wszystkie jego plany

### 3.3. `plans` → `fixed_points` (1:N)
- Jeden plan może mieć wiele stałych punktów
- Klucz obcy: `fixed_points.plan_id` → `plans.id`
- Kaskadowe usuwanie: Usunięcie planu usuwa wszystkie jego stałe punkty

### 3.4. `plans` → `feedback` (1:1 per user)
- Jeden plan może mieć wiele opinii (od różnych użytkowników w przyszłości), ale aktualnie każdy użytkownik może wystawić tylko jedną opinię dla danego planu
- Klucz obcy: `feedback.plan_id` → `plans.id`
- Klucz obcy: `feedback.user_id` → `auth.users.id`
- Kaskadowe usuwanie: Usunięcie planu lub użytkownika usuwa powiązane opinie

## 4. Indeksy

### 4.1. Indeksy na kluczach obcych
### 4.2. Indeksy na polach często używanych w filtrach (status, daty)
### 4.3. Indeks GIN na kolumnie tablicowej (optymalizacja wyszukiwania w preferencjach)

## 5. Polityki Row-Level Security)

### 5.1. Włączenie RLS dla wszystkich tabel

### 5.2. Polityki dla tabeli `profiles`
- SELECT: Użytkownik widzi tylko swój profil
- INSERT: Użytkownik może utworzyć tylko swój własny profil
- UPDATE: Użytkownik może aktualizować tylko swój profil
- DELETE: Użytkownik może usunąć tylko swój profil

### 5.3. Polityki dla tabeli `plans`
- SELECT: Użytkownik widzi tylko swoje plany
- INSERT: Użytkownik może tworzyć tylko plany dla siebie
- UPDATE: Użytkownik może aktualizować tylko swoje plany
- DELETE: Użytkownik może usuwać tylko swoje plany

### 5.4. Polityki dla tabeli `fixed_points`
- SELECT: Użytkownik widzi stałe punkty swoich planów
- INSERT: Użytkownik może dodawać stałe punkty do swoich planów
- UPDATE: Użytkownik może aktualizować stałe punkty swoich planów
- DELETE: Użytkownik może usuwać stałe punkty swoich planów

### 5.5. Polityki dla tabeli `feedback`
- SELECT: Użytkownik widzi tylko swoje opinie
- INSERT: Użytkownik może tworzyć opinie tylko dla swoich planów
- UPDATE: Użytkownik może aktualizować tylko swoje opinie
- DELETE: Użytkownik może usuwać tylko swoje opinie

## 7. Zadania pg_cron (wymagają włączenia rozszerzenia `pg_cron`)

- Resetowanie miesięcznego limitu generacji (1. dnia każdego miesiąca o 00:00 UTC)
- Automatyczna archiwizacja planów po upływie daty końcowej (codziennie o 01:00 UTC)

## 8. Uwagi dodatkowe i decyzje projektowe

### 8.1. Struktura JSONB dla `generated_content`
- Zdecydowano się na ustandaryzowaną strukturę JSON dla wygenerowanego planu, co ułatwi jego parsowanie i wyświetlanie w interfejsie
- Każdy element planu (`item`) posiada unikalny `id` (UUID), co umożliwia precyzyjne usuwanie i modyfikację punktów
- Pole `modifications` przechowuje informacje o zmianach dokonanych przez AI (np. usunięte atrakcje)
- Pole `warnings` zawiera ostrzeżenia dla użytkownika o konieczności weryfikacji danych

### 8.2. Separacja notatek i planów w jednej tabeli
- Zamiast dwóch osobnych tabel (`notes` i `plans`), wykorzystano jedną tabelę `plans` z kolumną `status`
- Notatka to plan ze statusem `draft`, wygenerowany plan ma status `generated`, a zakończona podróż `archived`
- Takie rozwiązanie upraszcza zarządzanie danymi i umożliwia łatwą transformację notatki w plan

### 8.3. Bezpieczeństwo i izolacja danych
- Wszystkie tabele mają włączoną funkcję RLS, co zapewnia, że użytkownicy mają dostęp wyłącznie do własnych danych
- Polityki `WITH CHECK` w operacjach `INSERT` i `UPDATE` zapobiegają tworzeniu lub modyfikacji zasobów w imieniu innych użytkowników
- Kaskadowe usuwanie (`ON DELETE CASCADE`) zapewnia spójność danych i automatyczne czyszczenie powiązanych rekordów

### 8.4. Optymalizacja wydajności
- Indeksy na kluczach obcych przyspieszają operacje JOIN
- Indeks GIN na kolumnie `preferences` umożliwia szybkie wyszukiwanie użytkowników po preferencjach
- Częściowy indeks na `end_date` (tylko dla niezarchiwizowanych planów) optymalizuje zadanie automatycznej archiwizacji

### 8.5. Automatyzacja z pg_cron
- Resetowanie limitu generacji odbywa się automatycznie pierwszego dnia miesiąca
- Archiwizacja planów następuje dzień po upływie daty końcowej (aby użytkownik miał dostęp do planu w dniu wyjazdu)
- Zadania pg_cron są niezależne od aplikacji, co zwiększa niezawodność systemu

### 8.6. Audyt i śledzenie zmian
- Kolumny `created_at` i `updated_at` we wszystkich tabelach umożliwiają śledzenie historii zmian
- Triggery automatycznie aktualizują `updated_at` przy każdej modyfikacji rekordu

### 8.7. Rozszerzalność
- Schemat został zaprojektowany z myślą o przyszłych rozszerzeniach (np. współdzielenie planów, komentarze)
- Struktura JSONB dla `generated_content` pozwala na łatwe dodawanie nowych pól bez zmian w schemacie
- Typy ENUM można rozszerzyć o nowe wartości (np. dodatkowe tempa zwiedzania)

### 8.8. Normalizacja
- Schemat jest znormalizowany do 3NF, co minimalizuje redundancję danych
- Jedynym wyjątkiem jest kolumna `generated_content` (JSONB), której denormalizacja jest uzasadniona ze względu na wydajność i elastyczność struktury generowanej przez AI
