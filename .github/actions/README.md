# Composite Actions

Ten katalog zawiera reużywalne Composite Actions używane w workflow CI/CD projektu CityFlow.

## 📋 Spis treści

- [Setup Node Dependencies](#setup-node-dependencies)
- [Lint and Format](#lint-and-format)
- [Run Unit Tests](#run-unit-tests)
- [Run E2E Tests](#run-e2e-tests)
- [Verify Build](#verify-build)

## 🔧 Setup Node Dependencies

**Lokalizacja:** `.github/actions/setup-node-dependencies/action.yml`

**Opis:** Wykonuje checkout repozytorium, konfiguruje Node.js z wersji określonej w `.nvmrc` i instaluje zależności npm z wykorzystaniem cache.

**Użycie:**

```yaml
- name: Setup Node.js and dependencies
  uses: ./.github/actions/setup-node-dependencies
```

**Parametry:** Brak

**Przykład zastosowania:**

- Pierwszy krok w każdym job CI/CD
- Przygotowuje środowisko do dalszych kroków

---

## 🔍 Lint and Format

**Lokalizacja:** `.github/actions/lint-and-format/action.yml`

**Opis:** Uruchamia ESLint i sprawdza formatowanie kodu za pomocą Prettier.

**Użycie:**

```yaml
- name: Run lint and format checks
  uses: ./.github/actions/lint-and-format
```

**Parametry:** Brak

**Uwagi:**

- Wymaga wcześniejszego uruchomienia `setup-node-dependencies`
- Kończy się niepowodzeniem, jeśli kod nie spełnia standardów

---

## 🧪 Run Unit Tests

**Lokalizacja:** `.github/actions/run-unit-tests/action.yml`

**Opis:** Uruchamia testy jednostkowe z pokryciem kodu, wyświetla podsumowanie i uploaduje artefakty z raportem pokrycia.

**Użycie:**

```yaml
- name: Run unit tests
  uses: ./.github/actions/run-unit-tests
  with:
    artifact-name: unit-test-coverage
    retention-days: 30
    coverage-threshold: 80
```

**Parametry:**

| Parametr             | Wymagany | Domyślna wartość     | Opis                                     |
| -------------------- | -------- | -------------------- | ---------------------------------------- |
| `artifact-name`      | ✅       | `unit-test-coverage` | Nazwa artefaktu z raportem pokrycia      |
| `retention-days`     | ❌       | `30`                 | Liczba dni przechowywania artefaktu      |
| `coverage-threshold` | ❌       | `0`                  | Minimalny wymagany procent pokrycia kodu |

**Przykłady:**

Master branch:

```yaml
- uses: ./.github/actions/run-unit-tests
  with:
    artifact-name: unit-test-coverage
    retention-days: 30
    coverage-threshold: 0
```

Pull Request:

```yaml
- uses: ./.github/actions/run-unit-tests
  with:
    artifact-name: pr-${{ github.event.pull_request.number }}-unit-coverage
    retention-days: 14
    coverage-threshold: 0
```

---

## 🎭 Run E2E Tests

**Lokalizacja:** `.github/actions/run-e2e-tests/action.yml`

**Opis:** Instaluje przeglądarki Playwright, uruchamia testy E2E i uploaduje artefakty z raportami.

**Użycie:**

```yaml
- name: Run E2E tests
  uses: ./.github/actions/run-e2e-tests
  with:
    artifact-prefix: pr-123
    retention-days-report: 14
    retention-days-results: 7
    validate-secrets: true
    supabase-url: ${{ secrets.SUPABASE_TEST_URL }}
    supabase-key: ${{ secrets.SUPABASE_TEST_KEY }}
    e2e-user-id: ${{ secrets.E2E_USER_ID }}
    e2e-username: ${{ secrets.E2E_USERNAME }}
    e2e-password: ${{ secrets.E2E_PASSWORD }}
```

**Parametry:**

| Parametr                 | Wymagany | Domyślna wartość | Opis                                                |
| ------------------------ | -------- | ---------------- | --------------------------------------------------- |
| `artifact-prefix`        | ❌       | `''`             | Prefiks dla nazw artefaktów (np. `pr-123`)          |
| `retention-days-report`  | ❌       | `30`             | Liczba dni przechowywania raportu Playwright        |
| `retention-days-results` | ❌       | `7`              | Liczba dni przechowywania wyników testów            |
| `validate-secrets`       | ❌       | `false`          | Czy walidować obecność sekretów przed uruchomieniem |
| `supabase-url`           | ✅       | -                | URL testowej bazy Supabase                          |
| `supabase-key`           | ✅       | -                | Klucz testowej bazy Supabase                        |
| `e2e-user-id`            | ✅       | -                | ID użytkownika testowego                            |
| `e2e-username`           | ✅       | -                | Nazwa użytkownika testowego                         |
| `e2e-password`           | ✅       | -                | Hasło użytkownika testowego                         |

**⚠️ WAŻNE:** Używaj TYLKO testowej bazy danych (nigdy produkcyjnej)!

**Przykłady:**

Master branch (bez walidacji sekretów):

```yaml
- uses: ./.github/actions/run-e2e-tests
  with:
    artifact-prefix: ''
    retention-days-report: 30
    retention-days-results: 7
    validate-secrets: false
    supabase-url: ${{ secrets.SUPABASE_TEST_URL }}
    supabase-key: ${{ secrets.SUPABASE_TEST_KEY }}
    e2e-user-id: ${{ secrets.E2E_USER_ID }}
    e2e-username: ${{ secrets.E2E_USERNAME }}
    e2e-password: ${{ secrets.E2E_PASSWORD }}
```

Pull Request (z walidacją sekretów):

```yaml
- uses: ./.github/actions/run-e2e-tests
  with:
    artifact-prefix: pr-${{ github.event.pull_request.number }}
    retention-days-report: 14
    retention-days-results: 7
    validate-secrets: true
    supabase-url: ${{ secrets.SUPABASE_TEST_URL }}
    supabase-key: ${{ secrets.SUPABASE_TEST_KEY }}
    e2e-user-id: ${{ secrets.E2E_USER_ID }}
    e2e-username: ${{ secrets.E2E_USERNAME }}
    e2e-password: ${{ secrets.E2E_PASSWORD }}
```

---

## 🔨 Verify Build

**Lokalizacja:** `.github/actions/verify-build/action.yml`

**Opis:** Buduje aplikację dla środowiska produkcyjnego i weryfikuje poprawność wyjścia.

**Użycie:**

```yaml
- name: Verify production build
  uses: ./.github/actions/verify-build
  with:
    supabase-url: ${{ secrets.SUPABASE_TEST_URL }}
    supabase-key: ${{ secrets.SUPABASE_TEST_KEY }}
    artifact-name: production-build
    retention-days: 7
    upload-artifact: true
```

**Parametry:**

| Parametr          | Wymagany | Domyślna wartość   | Opis                                |
| ----------------- | -------- | ------------------ | ----------------------------------- |
| `supabase-url`    | ✅       | -                  | URL Supabase do użycia w buildzie   |
| `supabase-key`    | ✅       | -                  | Klucz Supabase do użycia w buildzie |
| `artifact-name`   | ❌       | `production-build` | Nazwa artefaktu z buildem           |
| `retention-days`  | ❌       | `7`                | Liczba dni przechowywania artefaktu |
| `upload-artifact` | ❌       | `true`             | Czy uploadować artefakt z buildem   |

**Przykłady:**

Master branch (z uploadem artefaktu):

```yaml
- uses: ./.github/actions/verify-build
  with:
    supabase-url: ${{ secrets.SUPABASE_TEST_URL || 'https://placeholder.supabase.co' }}
    supabase-key: ${{ secrets.SUPABASE_TEST_KEY || 'placeholder-key' }}
    artifact-name: production-build
    retention-days: 7
    upload-artifact: true
```

Pull Request (bez uploadu artefaktu):

```yaml
- uses: ./.github/actions/verify-build
  with:
    supabase-url: ${{ secrets.SUPABASE_TEST_URL || 'https://placeholder.supabase.co' }}
    supabase-key: ${{ secrets.SUPABASE_TEST_KEY || 'placeholder-key' }}
    upload-artifact: false
```

---

## 📚 Dodatkowe informacje

### Korzyści z używania Composite Actions

1. **DRY (Don't Repeat Yourself)** - Eliminacja duplikacji kodu między workflow
2. **Łatwość utrzymania** - Zmiany w jednym miejscu propagują się do wszystkich workflow
3. **Spójność** - Gwarancja identycznego działania w różnych kontekstach
4. **Testowalność** - Łatwiejsze testowanie i debugowanie izolowanych kroków
5. **Dokumentacja** - Centralne miejsce dla dokumentacji poszczególnych kroków

### Wzorzec użycia w workflow

Typowy job w workflow wygląda następująco:

```yaml
job-name:
  name: Job Display Name
  runs-on: ubuntu-latest
  timeout-minutes: 15
  needs: [dependency-jobs]

  steps:
    # 1. Setup środowiska
    - name: Setup Node.js and dependencies
      uses: ./.github/actions/setup-node-dependencies

    # 2. Wykonanie głównego zadania
    - name: Run specific action
      uses: ./.github/actions/specific-action
      with:
        param1: value1
        param2: value2
```

### Rozwój i rozszerzanie

Dodając nową composite action:

1. Stwórz katalog `.github/actions/nazwa-action/`
2. Utwórz plik `action.yml` z definicją
3. Dodaj dokumentację do tego pliku README
4. Użyj w odpowiednich workflow
5. Przetestuj w PR przed mergem do master

### Wsparcie

W razie pytań lub problemów:

- Sprawdź logi workflow w zakładce Actions
- Przeczytaj dokumentację GitHub: [Creating a composite action](https://docs.github.com/en/actions/tutorials/create-actions/create-a-composite-action)
- Zgłoś issue w repozytorium projektu
