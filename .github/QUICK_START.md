# 🚀 CI/CD Quick Start Guide

## Dla nowych użytkowników - 5 minut setup

### Krok 1: Dodaj GitHub Secrets (⏱️ 3 min)

1. Otwórz repozytorium na GitHub
2. Kliknij **Settings** → **Secrets and variables** → **Actions**
3. Dodaj te 5 sekretów (kliknij "New repository secret"):

```
SUPABASE_URL              → Twój URL Supabase
SUPABASE_KEY              → Twój klucz anon Supabase
OPENROUTER_API_KEY        → Twój klucz OpenRouter
```

💡 **Skąd wziąć klucze?**

- Supabase: Dashboard → Settings → API
- OpenRouter: [openrouter.ai](https://openrouter.ai/) → Keys

### Krok 2: Push do master/main (⏱️ 1 min)

```bash
git add .
git commit -m "Add CI/CD"
git push origin main
```

### Krok 3: Sprawdź wynik (⏱️ 1 min)

1. Przejdź do zakładki **Actions** w GitHub
2. Zobacz workflow "CI/CD Pipeline" w akcji
3. ✅ Zielony check = wszystko OK!
4. ❌ Czerwony X = kliknij i zobacz logi

---

## Testowanie lokalne

### Setup pliku .env.test

```bash
# Utwórz plik
cat > .env.test << 'EOF'
SUPABASE_URL=http://127.0.0.1:54321
SUPABASE_KEY=YOUR_LOCAL_KEY
OPENROUTER_API_KEY=YOUR_KEY
PUBLIC_SITE_URL=http://localhost:3000
EOF
```

### Uruchom lokalne Supabase

```bash
supabase start
# Skopiuj "anon key" do .env.test
```

### Uruchom wszystkie testy

```bash
# Linting
npm run lint

# Testy jednostkowe
npm run test:unit -- --run

# Build
npm run build

# E2E (wymaga działającego Supabase)
npm run test:e2e
```

---

## Ręczne uruchomienie workflow

1. GitHub → **Actions**
2. Wybierz **CI/CD Pipeline**
3. Kliknij **Run workflow** → **Run workflow**
4. Poczekaj ~5-10 minut
5. Sprawdź wyniki

---

## 📊 Co robi workflow?

```
✅ Linting           (wykrywa błędy stylu)
✅ Testy jednostkowe (sprawdza komponenty)
✅ Build produkcyjny (weryfikuje możliwość zbudowania)
✅ Testy E2E         (sprawdza całą aplikację)
```

---

## 🆘 Coś nie działa?

### Workflow failuje na "Run linter"

→ Uruchom lokalnie: `npm run lint:fix`

### Workflow failuje na "Run unit tests"

→ Uruchom lokalnie: `npm run test:unit`

### Workflow failuje na "Build production"

→ Sprawdź czy wszystkie zmienne środowiskowe są ustawione w Secrets

### Workflow failuje na "Run E2E tests"

→ Sprawdź logi w artifacts (scroll w dół → "playwright-report")

---

## 📚 Pełna dokumentacja

- **Szczegóły workflow**: `.github/workflows/README.md`
- **Konfiguracja zmiennych**: `.github/ENV_TEST_SETUP.md`
- **Pełne podsumowanie**: `.github/CI_CD_SETUP_SUMMARY.md`

---

## 💡 Pro Tips

1. **Status Badge**: Dodaj do README.md:

   ```markdown
   [![CI/CD](https://github.com/USER/city-flow/actions/workflows/ci.yml/badge.svg)](https://github.com/USER/city-flow/actions/workflows/ci.yml)
   ```

2. **Pomiń workflow**: Dodaj do commit message:

   ```bash
   git commit -m "docs: update README [skip ci]"
   ```

3. **Debug lokalnie**: Przed push zawsze uruchom:

   ```bash
   npm run lint && npm run test:unit -- --run && npm run build
   ```

4. **Zobacz artifacts**: Actions → workflow run → scroll down → Download

---

**Gotowe!** 🎉 Twój CI/CD działa!
