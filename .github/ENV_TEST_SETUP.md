# Konfiguracja Zmiennych Środowiskowych dla Testów

## 📋 Plik .env.test

Testy E2E (Playwright) wymagają pliku `.env.test` w głównym katalogu projektu. Ten plik zawiera zmienne środowiskowe używane podczas uruchamiania testów.

## 🔧 Jak skonfigurować lokalnie

1. **Utwórz plik `.env.test` w katalogu głównym projektu**:

```bash
touch .env.test
```

2. **Dodaj następujące zmienne**:

```env
# Supabase Configuration
SUPABASE_URL=http://127.0.0.1:54321
SUPABASE_KEY=your_supabase_anon_key_here

# OpenRouter API (for AI features)
OPENROUTER_API_KEY=your_openrouter_api_key_here

# Site Configuration
PUBLIC_SITE_URL=http://localhost:3000
```

3. **Uzyskaj klucze Supabase**:

Jeśli używasz lokalnego Supabase:

```bash
# Uruchom lokalną instancję Supabase
supabase start

# Wyświetli:
# - API URL: http://127.0.0.1:54321
# - anon key: eyJhbGc... (użyj tego jako SUPABASE_KEY)
```

4. **Uzyskaj klucz OpenRouter**:

- Zarejestruj się na [OpenRouter.ai](https://openrouter.ai/)
- Wygeneruj API key w panelu użytkownika
- Dodaj go jako `OPENROUTER_API_KEY`

## 🔐 GitHub Secrets (dla CI/CD)

Aby workflow GitHub Actions działał poprawnie, skonfiguruj następujące sekrety:

### Krok 1: Przejdź do Settings

1. Otwórz repozytorium na GitHub
2. Kliknij **Settings** → **Secrets and variables** → **Actions**
3. Kliknij **New repository secret**

### Krok 2: Dodaj sekrety

Dodaj każdy z poniższych sekretów:

| Nazwa sekretu        | Opis                   | Przykład                  |
| -------------------- | ---------------------- | ------------------------- |
| `SUPABASE_URL`       | URL instancji Supabase | `https://xxx.supabase.co` |
| `SUPABASE_KEY`       | Klucz anon Supabase    | `eyJhbGc...`              |
| `OPENROUTER_API_KEY` | Klucz API OpenRouter   | `sk-or-v1-...`            |

### Krok 3: Weryfikacja

Workflow automatycznie użyje tych sekretów. Jeśli sekrety nie są ustawione, zostaną użyte wartości domyślne (mock keys), które mogą nie działać dla wszystkich testów.

## 🧪 Testowanie

### Sprawdź czy wszystko działa:

```bash
# 1. Upewnij się, że .env.test istnieje i jest poprawnie skonfigurowany
cat .env.test

# 2. Uruchom lokalne Supabase (jeśli używasz)
supabase start

# 3. Uruchom testy E2E
npm run test:e2e
```

### Debugging:

Jeśli testy nie działają, sprawdź:

1. ✅ Czy plik `.env.test` istnieje w głównym katalogu
2. ✅ Czy wszystkie zmienne są ustawione
3. ✅ Czy lokalne Supabase jest uruchomione (`supabase status`)
4. ✅ Czy port 3000 jest wolny (aplikacja testowa będzie go używać)

## 📚 Więcej informacji

- Zobacz konfigurację Playwright: `playwright.config.ts`
- Zobacz dokumentację CI/CD: `.github/workflows/README.md`
- Zobacz główną dokumentację: `README.md`

## ⚠️ Bezpieczeństwo

- **NIGDY** nie commituj pliku `.env.test` do repozytorium
- Plik `.env.test` jest automatycznie ignorowany przez `.gitignore`
- Używaj GitHub Secrets dla wartości wrażliwych w CI/CD
- Klucze `anon` Supabase są bezpieczne do użycia po stronie klienta (są publiczne)
- Klucze `service_role` NIE POWINNY być używane w testach ani commitowane
