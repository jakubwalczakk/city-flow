# 📚 CI/CD Documentation Index

Kompletna dokumentacja setupu CI/CD dla projektu CityFlow.

## 🚀 Szybki Start

**Nowy użytkownik? Zacznij tutaj:**

1. 📖 [**QUICK_START.md**](./QUICK_START.md) - 5-minutowy setup (START HERE!)
2. 🔐 [**ENV_TEST_SETUP.md**](./ENV_TEST_SETUP.md) - Konfiguracja zmiennych środowiskowych
3. ✅ Commit i push do master/main
4. 🎉 Zobacz workflow w akcji w zakładce "Actions"

## 📋 Dokumentacja

### Dla Początkujących

| Dokument                                 | Opis                                     | Czas czytania |
| ---------------------------------------- | ---------------------------------------- | ------------- |
| [QUICK_START.md](./QUICK_START.md)       | Najszybsza ścieżka do uruchomienia CI/CD | 5 min         |
| [ENV_TEST_SETUP.md](./ENV_TEST_SETUP.md) | Jak skonfigurować zmienne środowiskowe   | 10 min        |
| [LOCAL_TESTING.md](./LOCAL_TESTING.md)   | Jak testować lokalnie przed push         | 15 min        |

### Dla Zaawansowanych

| Dokument                                               | Opis                               | Czas czytania |
| ------------------------------------------------------ | ---------------------------------- | ------------- |
| [README.md](./workflows/README.md)                     | Pełna dokumentacja workflow        | 20 min        |
| [CI_CD_SETUP_SUMMARY.md](./CI_CD_SETUP_SUMMARY.md)     | Kompletne podsumowanie setupu      | 15 min        |
| [WORKFLOW_DIAGRAM.md](./WORKFLOW_DIAGRAM.md)           | Wizualizacje i diagramy            | 10 min        |
| [WORKFLOW_IMPROVEMENTS.md](./WORKFLOW_IMPROVEMENTS.md) | Ulepszenia zgodne z best practices | 10 min        |
| [BADGES.md](./BADGES.md)                               | Jak dodać status badges do README  | 5 min         |

## 🎯 Szybkie Linki

### Najczęściej Potrzebne

- ⚡ **Szybki test lokalny**: `npm run lint && npm run test:unit -- --run && npm run build`
- 🔐 **Konfiguracja Secrets**: GitHub → Settings → Secrets and variables → Actions
- 📊 **Zobacz workflow**: GitHub → Actions → CI/CD Pipeline
- 📦 **Pobierz artifacts**: Actions → workflow run → scroll down → Download

### Komendy

```bash
# Minimal check (2-3 min)
npm run lint && npm run test:unit -- --run && npm run build

# Full check (5-10 min)
npm run lint:fix && npm run format && npm run test:unit -- --run --coverage && npm run build && npm run test:e2e

# Setup .env.test
cp .env.test.example .env.test
# Edit .env.test with your values
```

## 📊 Struktura Workflow

```
CI/CD Pipeline
│
├─► Job 1: Test & Build (15 min timeout)
│   ├─ Linting
│   ├─ Unit Tests
│   └─ Production Build
│
└─► Job 2: E2E Tests (20 min timeout)
    ├─ Playwright Setup
    └─ E2E Tests
```

**Triggery:**

- ✅ Automatyczny: Push do `master` lub `main`
- ✅ Manualny: GitHub Actions → Run workflow

**Czas wykonania:** ~8-12 minut (typowo)

## 🔐 Wymagane GitHub Secrets

| Secret               | Opis                   | Gdzie znaleźć                       |
| -------------------- | ---------------------- | ----------------------------------- |
| `SUPABASE_URL`       | URL instancji Supabase | Supabase Dashboard → Settings → API |
| `SUPABASE_KEY`       | Klucz anon Supabase    | Supabase Dashboard → Settings → API |
| `OPENROUTER_API_KEY` | Klucz API OpenRouter   | openrouter.ai → Keys                |

**Jak dodać:** GitHub → Settings → Secrets and variables → Actions → New repository secret

## 🧪 Testowanie

### Lokalne

```bash
# 1. Setup Supabase
supabase start

# 2. Utwórz .env.test (zobacz ENV_TEST_SETUP.md)
cat > .env.test << 'EOF'
SUPABASE_URL=http://127.0.0.1:54321
SUPABASE_KEY=your_anon_key
OPENROUTER_API_KEY=your_key
PUBLIC_SITE_URL=http://localhost:3000
EOF

# 3. Uruchom testy
npm run test:e2e
```

### CI/CD

1. Push do master/main
2. GitHub → Actions
3. Zobacz "CI/CD Pipeline" w akcji
4. ✅ Zielony = sukces, ❌ Czerwony = błąd

## 🐛 Troubleshooting

| Problem                    | Rozwiązanie                  | Dokument                                                             |
| -------------------------- | ---------------------------- | -------------------------------------------------------------------- |
| Workflow nie uruchamia się | Sprawdź uprawnienia Actions  | [README.md](./workflows/README.md#troubleshooting)                   |
| E2E testy failują          | Sprawdź secrets i logi       | [ENV_TEST_SETUP.md](./ENV_TEST_SETUP.md#debugging)                   |
| Build kończy się błędem    | Sprawdź zmienne środowiskowe | [CI_CD_SETUP_SUMMARY.md](./CI_CD_SETUP_SUMMARY.md#troubleshooting)   |
| Testy lokalne nie działają | Sprawdź .env.test i Supabase | [LOCAL_TESTING.md](./LOCAL_TESTING.md#troubleshooting-common-issues) |

## 📈 Rozszerzenia

### Planowane

- [ ] Code coverage reporting (Codecov)
- [ ] Security scanning (Snyk)
- [ ] Performance testing (Lighthouse CI)
- [ ] Automatic deployment (Vercel/Netlify)
- [ ] Slack/Discord notifications

### Jak dodać

Zobacz sekcję "Rozszerzenia" w [README.md](./workflows/README.md#rozszerzenia)

## 📚 Zewnętrzne Zasoby

### Dokumentacja

- [GitHub Actions](https://docs.github.com/en/actions)
- [Playwright CI](https://playwright.dev/docs/ci)
- [Vitest CI](https://vitest.dev/guide/ci.html)
- [Astro Deployment](https://docs.astro.build/en/guides/deploy/)

### Narzędzia

- [Shields.io](https://shields.io/) - Badge generator
- [Act](https://github.com/nektos/act) - Run GitHub Actions locally
- [Workflow Visualizer](https://github.com/githubocto/repo-visualizer) - Visualize your workflow

## 🎓 Nauka

### Dla Początkujących

1. Przeczytaj [QUICK_START.md](./QUICK_START.md)
2. Skonfiguruj secrets według [ENV_TEST_SETUP.md](./ENV_TEST_SETUP.md)
3. Przetestuj lokalnie według [LOCAL_TESTING.md](./LOCAL_TESTING.md)
4. Push i zobacz workflow w akcji

### Dla Zaawansowanych

1. Przeczytaj [README.md](./workflows/README.md) dla szczegółów
2. Zobacz [WORKFLOW_DIAGRAM.md](./WORKFLOW_DIAGRAM.md) dla wizualizacji
3. Przeczytaj [CI_CD_SETUP_SUMMARY.md](./CI_CD_SETUP_SUMMARY.md) dla pełnego obrazu
4. Rozważ rozszerzenia z sekcji "Rozszerzenia"

## 🔄 Workflow Lifecycle

```
1. Developer commits code
   ↓
2. Push to master/main
   ↓
3. GitHub Actions triggered
   ↓
4. Job 1: Test & Build
   ├─ Lint ✅
   ├─ Unit tests ✅
   └─ Build ✅
   ↓
5. Job 2: E2E Tests
   └─ Playwright tests ✅
   ↓
6. Workflow complete ✅
   ↓
7. [Future] Deploy to production
```

## 📞 Pomoc

### Gdzie szukać pomocy:

1. **Dokumentacja** - Przeczytaj odpowiedni dokument z listy powyżej
2. **GitHub Issues** - Sprawdź czy ktoś miał podobny problem
3. **Logi** - GitHub Actions → workflow run → kliknij na failed step
4. **Artifacts** - Pobierz playwright-report lub test-results
5. **Lokalne testy** - Odtwórz problem lokalnie (łatwiej debugować)

### Najczęstsze Pytania

**Q: Jak uruchomić workflow ręcznie?**  
A: GitHub → Actions → CI/CD Pipeline → Run workflow

**Q: Gdzie są logi z testów?**  
A: Actions → workflow run → kliknij na job → kliknij na step

**Q: Jak pobrać artifacts?**  
A: Actions → workflow run → scroll down → Download

**Q: Jak dodać nowy test?**  
A: Dodaj plik `*.spec.ts` w `e2e/` lub `*.test.tsx` w `src/`

**Q: Jak pominąć workflow?**  
A: Dodaj `[skip ci]` do commit message

**Q: Jak zmienić timeout?**  
A: Edytuj `timeout-minutes` w `.github/workflows/pull-request.yml`

## 📝 Checklist

### Przed pierwszym użyciem:

- [ ] Przeczytaj [QUICK_START.md](./QUICK_START.md)
- [ ] Skonfiguruj GitHub Secrets
- [ ] Utwórz `.env.test` lokalnie
- [ ] Przetestuj lokalnie
- [ ] Push do master/main
- [ ] Sprawdź workflow w Actions
- [ ] Dodaj badge do README (opcjonalnie)

### Przed każdym commit:

- [ ] `npm run lint`
- [ ] `npm run test:unit -- --run`
- [ ] `npm run build` (opcjonalnie)

### Przed każdym merge:

- [ ] Pull latest changes
- [ ] Uruchom pełny test suite
- [ ] Manual testing
- [ ] Check CI status
- [ ] Merge

## 🎉 Gotowe!

Twój CI/CD setup jest kompletny i gotowy do użycia. Powodzenia! 🚀

---

**Pytania?** Sprawdź [CI_CD_SETUP_SUMMARY.md](./CI_CD_SETUP_SUMMARY.md) lub [README.md](./workflows/README.md)

**Wersja dokumentacji**: 1.0  
**Data utworzenia**: 23 grudnia 2025  
**Ostatnia aktualizacja**: 23 grudnia 2025
