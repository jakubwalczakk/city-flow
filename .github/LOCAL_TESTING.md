# 🧪 Local Testing Guide

Przewodnik po testowaniu lokalnym przed push do repozytorium. Uruchom te komendy, aby upewnić się, że CI/CD przejdzie pomyślnie.

## 📋 Quick Check (2-3 minuty)

Minimalne sprawdzenie przed commit:

```bash
# 1. Linting
npm run lint

# 2. Testy jednostkowe (szybkie)
npm run test:unit -- --run

# 3. Build (sprawdź czy się kompiluje)
npm run build
```

Jeśli wszystko przeszło ✅ → możesz commitować!

## 🔍 Full Check (5-10 minut)

Pełne sprawdzenie przed ważnym merge:

```bash
# 1. Wyczyść poprzednie buildy
rm -rf dist/ node_modules/.vite

# 2. Linting z auto-fix
npm run lint:fix

# 3. Format code
npm run format

# 4. Testy jednostkowe z coverage
npm run test:unit -- --run --coverage

# 5. Build produkcyjny
npm run build

# 6. Preview buildu
npm run preview &
# Otwórz http://localhost:4321 i sprawdź ręcznie
# Ctrl+C aby zatrzymać

# 7. E2E testy (wymaga Supabase)
npm run test:e2e
```

## 🗄️ Setup Supabase dla E2E

### Pierwszy raz:

```bash
# 1. Zainstaluj Supabase CLI (jeśli nie masz)
brew install supabase/tap/supabase

# 2. Uruchom lokalną instancję
supabase start

# 3. Zapisz klucze (wyświetlą się w terminalu)
# API URL: http://127.0.0.1:54321
# anon key: eyJhbGc...

# 4. Utwórz .env.test
cat > .env.test << 'EOF'
SUPABASE_URL=http://127.0.0.1:54321
SUPABASE_KEY=PASTE_YOUR_ANON_KEY_HERE
PUBLIC_SUPABASE_URL=http://127.0.0.1:54321
PUBLIC_SUPABASE_KEY=PASTE_YOUR_ANON_KEY_HERE
OPENROUTER_API_KEY=YOUR_OPENROUTER_KEY
PUBLIC_SITE_URL=http://localhost:3000
EOF

# 5. Zastąp PASTE_YOUR_ANON_KEY_HERE prawdziwym kluczem
```

### Kolejne razy:

```bash
# Sprawdź status
supabase status

# Jeśli nie działa, uruchom ponownie
supabase start

# Jeśli potrzebujesz świeżej bazy
supabase db reset
```

## 🎯 Testowanie poszczególnych elementów

### Tylko linting:

```bash
# Sprawdź błędy
npm run lint

# Napraw automatycznie
npm run lint:fix
```

### Tylko testy jednostkowe:

```bash
# Wszystkie testy
npm run test:unit -- --run

# Z UI (interaktywne)
npm run test:unit:ui

# Konkretny plik
npm run test:unit -- --run src/components/NewPlanForm.test.tsx

# Watch mode (automatyczne uruchamianie przy zmianach)
npm run test:unit

# Z coverage
npm run test:unit -- --run --coverage
```

### Tylko build:

```bash
# Build
npm run build

# Preview (serwuj build lokalnie)
npm run preview

# Build z verbose logs
npm run build -- --verbose
```

### Tylko E2E:

```bash
# Wszystkie testy E2E
npm run test:e2e

# Z UI (interaktywne)
npm run test:e2e:ui

# Konkretny plik
npx playwright test e2e/create-plan.spec.ts

# Debug mode (krok po kroku)
npx playwright test --debug

# Headed mode (zobacz przeglądarkę)
npx playwright test --headed

# Konkretny test
npx playwright test -g "should create new plan"
```

## 🐛 Debugging

### Linting errors:

```bash
# Zobacz szczegóły błędów
npm run lint -- --format=verbose

# Napraw automatycznie co się da
npm run lint:fix

# Ignoruj konkretną linię (w kodzie):
// eslint-disable-next-line @typescript-eslint/no-explicit-any
```

### Unit test failures:

```bash
# Uruchom z verbose output
npm run test:unit -- --run --reporter=verbose

# Uruchom tylko failed testy
npm run test:unit -- --run --reporter=verbose --bail=1

# Update snapshots (jeśli używasz)
npm run test:unit -- --run -u

# Zobacz coverage
npm run test:unit -- --run --coverage
open coverage/index.html
```

### Build errors:

```bash
# Wyczyść cache
rm -rf dist/ node_modules/.vite .astro/

# Reinstaluj dependencies
rm -rf node_modules package-lock.json
npm install

# Build z debug
npm run build -- --verbose

# Sprawdź zmienne środowiskowe
echo $PUBLIC_SUPABASE_URL
```

### E2E test failures:

```bash
# Zobacz traces (po failed teście)
npx playwright show-trace test-results/.../trace.zip

# Uruchom z debug
npx playwright test --debug

# Generuj nowy test (record)
npx playwright codegen http://localhost:3000

# Zobacz report
npx playwright show-report

# Sprawdź .env.test
cat .env.test

# Sprawdź czy Supabase działa
supabase status
curl http://127.0.0.1:54321/rest/v1/
```

## 📊 Pre-commit Checklist

Przed każdym commit:

```bash
# ✅ 1. Sprawdź zmiany
git status
git diff

# ✅ 2. Linting
npm run lint

# ✅ 3. Testy jednostkowe
npm run test:unit -- --run

# ✅ 4. Build (opcjonalnie)
npm run build

# ✅ 5. Commit
git add .
git commit -m "feat: add new feature"

# ✅ 6. Push
git push origin your-branch
```

## 🚀 Pre-merge Checklist

Przed merge do master/main:

```bash
# ✅ 1. Pull latest changes
git checkout main
git pull origin main
git checkout your-branch
git merge main

# ✅ 2. Full test suite
npm run lint:fix
npm run format
npm run test:unit -- --run --coverage
npm run build
npm run test:e2e

# ✅ 3. Manual testing
npm run preview
# Test manually in browser

# ✅ 4. Check for console errors
# Open browser DevTools → Console

# ✅ 5. Merge
git checkout main
git merge your-branch
git push origin main
```

## ⚡ Performance Tips

### Szybsze testy:

```bash
# Tylko zmienione pliki (Vitest)
npm run test:unit -- --run --changed

# Parallel execution (Playwright)
npx playwright test --workers=4

# Skip slow tests
npm run test:unit -- --run --testNamePattern="^((?!slow).)*$"
```

### Szybszy build:

```bash
# Bez minification (dev build)
npm run build -- --mode development

# Cache warming
npm run build
# Kolejne buildy będą szybsze
```

### Szybszy npm install:

```bash
# Użyj ci (deterministyczne, szybsze)
npm ci

# Lub pnpm (alternatywa)
pnpm install
```

## 🔧 Troubleshooting Common Issues

### "Cannot find module" error:

```bash
rm -rf node_modules package-lock.json
npm install
```

### "Port 3000 already in use":

```bash
# Znajdź proces
lsof -i :3000

# Zabij proces
kill -9 <PID>

# Lub użyj innego portu
PORT=3001 npm run dev
```

### "Playwright browser not found":

```bash
npx playwright install chromium
npx playwright install-deps chromium
```

### "Supabase not running":

```bash
supabase stop
supabase start
```

### "Out of memory" during build:

```bash
NODE_OPTIONS="--max-old-space-size=4096" npm run build
```

## 📚 Więcej informacji

- **Vitest**: https://vitest.dev/
- **Playwright**: https://playwright.dev/
- **Astro Build**: https://docs.astro.build/en/reference/cli-reference/#astro-build
- **ESLint**: https://eslint.org/docs/latest/

---

**Pro tip**: Dodaj te skrypty do swojego `.bashrc` / `.zshrc`:

```bash
# Quick CI check
alias ci-check='npm run lint && npm run test:unit -- --run && npm run build'

# Full CI check
alias ci-full='npm run lint:fix && npm run format && npm run test:unit -- --run --coverage && npm run build && npm run test:e2e'

# Reset everything
alias ci-reset='rm -rf node_modules package-lock.json dist/ .astro/ && npm install'
```
