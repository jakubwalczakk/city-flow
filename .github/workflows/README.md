# CI/CD Documentation

## 🚀 Overview

Ten projekt wykorzystuje GitHub Actions do automatycznego testowania, budowania i wdrażania aplikacji. Dostępne są dwa główne workflow:

1. **Pull Request Pipeline** - Pełna walidacja kodu dla PR (z testami E2E)
2. **Master Pipeline** - Deployment na Vercel po merge do master (bez testów E2E)

## 📋 Workflows

### 1. Pull Request Pipeline

Plik: `.github/workflows/pull-request.yml`

**Cel**: Walidacja kodu przed merge do master

**Dokumentacja**: Zobacz ten plik dla szczegółów

### 2. Master Pipeline (Production Deployment)

Plik: `.github/workflows/master.yml`

**Cel**: Automatyczny deployment na Vercel po merge do master

**Dokumentacja**: Zobacz [README_MASTER.md](./README_MASTER.md) dla szczegółów

---

## 📋 Workflow: Pull Request Pipeline

Plik: `.github/workflows/pull-request.yml`

### Triggery

- **Push do master/main**: Automatyczne uruchomienie przy każdym push
- **Manual trigger**: Możliwość ręcznego uruchomienia z zakładki "Actions" w GitHub

### Etapy

#### 1. **Test & Build** (Job: `test-and-build`)

Ten job wykonuje podstawowe testy i buduje aplikację:

- ✅ Checkout kodu
- ✅ Setup Node.js (wersja z `.nvmrc`) z cache dla npm
- ✅ Instalacja zależności (`npm ci` - deterministyczna instalacja)
- ✅ Linting kodu (`npm run lint`)
- ✅ Testy jednostkowe (`npm run test:unit`)
- ✅ Build produkcyjny (`npm run build`)
- ✅ Upload artifacts buildu (zachowane przez 7 dni)

#### 2. **E2E Tests** (Job: `e2e-tests`)

Ten job uruchamia testy end-to-end z Playwright:

- ✅ Checkout kodu
- ✅ Setup Node.js (wersja z `.nvmrc`) z cache dla npm
- ✅ Instalacja zależności (`npm ci` - deterministyczna instalacja)
- ✅ Instalacja przeglądarek Playwright (tylko Chromium + deps)
- ✅ Utworzenie pliku `.env.test` ze zmiennymi środowiskowymi
- ✅ Uruchomienie testów E2E (`npm run test:e2e`)
- ✅ Upload raportów Playwright (tylko przy błędach)
- ✅ Upload wyników testów (zawsze)

### Optymalizacje

- **Concurrency**: Anulowanie poprzednich uruchomień dla tej samej gałęzi
- **Cache**: npm dependencies są cache'owane dla szybszego buildu
- **Timeout**: 15 min dla buildu, 20 min dla E2E testów
- **Artifacts**: Automatyczne usuwanie po 7 dniach

## 🔐 Wymagane GitHub Secrets

Aby workflow działał poprawnie w CI/CD, należy skonfigurować następujące sekrety w repozytorium GitHub:

1. Przejdź do: **Settings** → **Secrets and variables** → **Actions**
2. Dodaj następujące sekrety:

### Opcjonalne (jeśli nie są publiczne):

- `SUPABASE_URL`: URL instancji Supabase
- `SUPABASE_KEY`: Klucz anon Supabase (publiczny)
- `SUPABASE_URL`: URL instancji Supabase (server-side)
- `SUPABASE_KEY`: Klucz anon Supabase (server-side)
- `OPENROUTER_API_KEY`: Klucz API OpenRouter

### Jak dodać sekrety do workflow:

W pliku `.github/workflows/pull-request.yml`, w sekcji `env` każdego stepu, dodaj:

```yaml
env:
  SUPABASE_URL: ${{ secrets.SUPABASE_URL }}
  SUPABASE_KEY: ${{ secrets.SUPABASE_KEY }}
  SUPABASE_URL: ${{ secrets.SUPABASE_URL }}
  SUPABASE_KEY: ${{ secrets.SUPABASE_KEY }}
  OPENROUTER_API_KEY: ${{ secrets.OPENROUTER_API_KEY }}
  PUBLIC_SITE_URL: 'http://localhost:3000'
```

## 🧪 Testowanie Lokalnie

Aby uruchomić testy lokalnie w sposób zbliżony do CI:

### Testy jednostkowe

```bash
npm run test:unit -- --run
```

### Build produkcyjny

```bash
npm run build
```

### Testy E2E

```bash
# 1. Upewnij się, że masz .env.test (skopiuj z .env.test.example)
cp .env.test.example .env.test

# 2. Uruchom lokalne Supabase (jeśli potrzebne)
supabase start

# 3. Uruchom testy E2E
npm run test:e2e
```

## 📊 Monitorowanie

### Gdzie zobaczyć wyniki:

1. **GitHub Actions**: Zakładka "Actions" w repozytorium
2. **Artifacts**: Dostępne przy każdym uruchomieniu (build output, raporty testów)
3. **Status Badge**: Możesz dodać badge do README:

```markdown
[![CI/CD Pipeline](https://github.com/YOUR_USERNAME/city-flow/actions/workflows/pull-request.yml/badge.svg)](https://github.com/YOUR_USERNAME/city-flow/actions/workflows/pull-request.yml)
```

## 🔧 Troubleshooting

### Problem: E2E testy kończą się timeout

**Rozwiązanie**: Zwiększ `timeout-minutes` w job `e2e-tests`

### Problem: Brak zmiennych środowiskowych

**Rozwiązanie**: Sprawdź czy sekrety są skonfigurowane w Settings → Secrets

### Problem: Playwright nie może uruchomić przeglądarki

**Rozwiązanie**: Workflow instaluje wszystkie zależności systemowe przez `--with-deps`, ale możesz spróbować:

```yaml
- name: Install Playwright browsers
  run: npx playwright install-deps chromium && npx playwright install chromium
```

## 🚀 Rozszerzenia

### Dodanie deployment:

Po `e2e-tests` możesz dodać job `deploy`:

```yaml
deploy:
  name: Deploy to Production
  runs-on: ubuntu-latest
  needs: e2e-tests
  if: github.ref == 'refs/heads/main'
  steps:
    - name: Deploy
      # Dodaj swoje kroki deploymentu
```

### Dodanie notification:

```yaml
- name: Notify on success
  if: success()
  run: echo "All tests passed! 🎉"
```

## 📚 Dodatkowe zasoby

- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [Playwright CI Guide](https://playwright.dev/docs/ci)
- [Vitest CI Guide](https://vitest.dev/guide/ci.html)
