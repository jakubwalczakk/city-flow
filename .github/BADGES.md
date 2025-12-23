# 📛 GitHub Actions Badges

## Podstawowy Badge CI/CD

Dodaj ten badge do `README.md` aby pokazać status workflow:

### Markdown:

```markdown
[![CI/CD Pipeline](https://github.com/YOUR_USERNAME/city-flow/actions/workflows/ci.yml/badge.svg)](https://github.com/YOUR_USERNAME/city-flow/actions/workflows/ci.yml)
```

### HTML:

```html
<a href="https://github.com/YOUR_USERNAME/city-flow/actions/workflows/ci.yml">
  <img src="https://github.com/YOUR_USERNAME/city-flow/actions/workflows/ci.yml/badge.svg" alt="CI/CD Pipeline" />
</a>
```

### Przykład w README:

```markdown
# CityFlow

[![CI/CD Pipeline](https://github.com/YOUR_USERNAME/city-flow/actions/workflows/ci.yml/badge.svg)](https://github.com/YOUR_USERNAME/city-flow/actions/workflows/ci.yml)

An AI-powered web application designed to simplify the process of planning short city breaks...
```

## Badge z konkretną gałęzią

Pokaż status tylko dla main/master:

```markdown
[![CI/CD Pipeline](https://github.com/YOUR_USERNAME/city-flow/actions/workflows/ci.yml/badge.svg?branch=main)](https://github.com/YOUR_USERNAME/city-flow/actions/workflows/ci.yml)
```

## Badge z custom stylem

### Flat style:

```markdown
[![CI/CD Pipeline](https://img.shields.io/github/actions/workflow/status/YOUR_USERNAME/city-flow/ci.yml?style=flat&label=CI%2FCD)](https://github.com/YOUR_USERNAME/city-flow/actions/workflows/ci.yml)
```

### Flat-square style:

```markdown
[![CI/CD Pipeline](https://img.shields.io/github/actions/workflow/status/YOUR_USERNAME/city-flow/ci.yml?style=flat-square&label=CI%2FCD)](https://github.com/YOUR_USERNAME/city-flow/actions/workflows/ci.yml)
```

### For-the-badge style:

```markdown
[![CI/CD Pipeline](https://img.shields.io/github/actions/workflow/status/YOUR_USERNAME/city-flow/ci.yml?style=for-the-badge&label=CI%2FCD)](https://github.com/YOUR_USERNAME/city-flow/actions/workflows/ci.yml)
```

## Dodatkowe Badges

### Node.js version:

```markdown
![Node.js](https://img.shields.io/badge/node-20.x-brightgreen)
```

### TypeScript:

```markdown
![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue)
```

### Astro:

```markdown
![Astro](https://img.shields.io/badge/Astro-5.x-FF5D01?logo=astro)
```

### React:

```markdown
![React](https://img.shields.io/badge/React-19.x-61DAFB?logo=react)
```

### Tailwind CSS:

```markdown
![Tailwind CSS](https://img.shields.io/badge/Tailwind-4.x-38B2AC?logo=tailwind-css)
```

### License:

```markdown
![License](https://img.shields.io/badge/license-MIT-green)
```

### Supabase:

```markdown
![Supabase](https://img.shields.io/badge/Supabase-BaaS-3ECF8E?logo=supabase)
```

## Kompletny Przykład README Header

```markdown
# CityFlow

<div align="center">

[![CI/CD Pipeline](https://github.com/YOUR_USERNAME/city-flow/actions/workflows/ci.yml/badge.svg)](https://github.com/YOUR_USERNAME/city-flow/actions/workflows/ci.yml)
![Node.js](https://img.shields.io/badge/node-20.x-brightgreen)
![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue)
![Astro](https://img.shields.io/badge/Astro-5.x-FF5D01?logo=astro)
![React](https://img.shields.io/badge/React-19.x-61DAFB?logo=react)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-4.x-38B2AC?logo=tailwind-css)
![License](https://img.shields.io/badge/license-MIT-green)

</div>

An AI-powered web application designed to simplify the process of planning short city breaks...
```

## Badges w jednej linii

```markdown
# CityFlow

[![CI/CD](https://github.com/YOUR_USERNAME/city-flow/actions/workflows/ci.yml/badge.svg)](https://github.com/YOUR_USERNAME/city-flow/actions) ![Node](https://img.shields.io/badge/node-20.x-brightgreen) ![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue) ![License](https://img.shields.io/badge/license-MIT-green)
```

## Custom Badge Colors

### Success (zielony):

```markdown
![Status](https://img.shields.io/badge/status-passing-success)
```

### Warning (żółty):

```markdown
![Status](https://img.shields.io/badge/status-warning-yellow)
```

### Error (czerwony):

```markdown
![Status](https://img.shields.io/badge/status-failing-critical)
```

### Info (niebieski):

```markdown
![Status](https://img.shields.io/badge/status-info-blue)
```

## Dynamiczne Badges (shields.io)

### Test Coverage (wymaga codecov):

```markdown
[![codecov](https://codecov.io/gh/YOUR_USERNAME/city-flow/branch/main/graph/badge.svg)](https://codecov.io/gh/YOUR_USERNAME/city-flow)
```

### Last Commit:

```markdown
![Last Commit](https://img.shields.io/github/last-commit/YOUR_USERNAME/city-flow)
```

### Repo Size:

```markdown
![Repo Size](https://img.shields.io/github/repo-size/YOUR_USERNAME/city-flow)
```

### Issues:

```markdown
![Issues](https://img.shields.io/github/issues/YOUR_USERNAME/city-flow)
```

### Pull Requests:

```markdown
![PRs](https://img.shields.io/github/issues-pr/YOUR_USERNAME/city-flow)
```

### Stars:

```markdown
![Stars](https://img.shields.io/github/stars/YOUR_USERNAME/city-flow?style=social)
```

## Sekcja Status w README

Dodaj dedykowaną sekcję status:

```markdown
## 📊 Project Status

| Category    | Status                                                                                                                                        |
| ----------- | --------------------------------------------------------------------------------------------------------------------------------------------- |
| CI/CD       | [![CI/CD](https://github.com/YOUR_USERNAME/city-flow/actions/workflows/ci.yml/badge.svg)](https://github.com/YOUR_USERNAME/city-flow/actions) |
| Node.js     | ![Node](https://img.shields.io/badge/node-20.x-brightgreen)                                                                                   |
| TypeScript  | ![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue)                                                                               |
| License     | ![License](https://img.shields.io/badge/license-MIT-green)                                                                                    |
| Last Commit | ![Last Commit](https://img.shields.io/github/last-commit/YOUR_USERNAME/city-flow)                                                             |
```

## Instrukcje Dodania

### Krok 1: Zamień YOUR_USERNAME

Zamień `YOUR_USERNAME` na swoją nazwę użytkownika GitHub:

```markdown
# Przed:

[![CI/CD](https://github.com/YOUR_USERNAME/city-flow/actions/workflows/ci.yml/badge.svg)]

# Po (przykład):

[![CI/CD](https://github.com/jakubwalczak/city-flow/actions/workflows/ci.yml/badge.svg)]
```

### Krok 2: Dodaj do README.md

Otwórz `README.md` i dodaj badge(s) w odpowiednim miejscu (zazwyczaj pod tytułem).

### Krok 3: Commit i Push

```bash
git add README.md
git commit -m "docs: add CI/CD status badge"
git push origin main
```

### Krok 4: Sprawdź

Odśwież stronę repozytorium na GitHub i zobacz badge w akcji!

## Przykłady z Prawdziwych Projektów

### Minimalistyczny:

```markdown
# Project Name

[![CI](https://github.com/user/repo/actions/workflows/ci.yml/badge.svg)](https://github.com/user/repo/actions)
```

### Średni:

```markdown
# Project Name

[![CI](https://github.com/user/repo/actions/workflows/ci.yml/badge.svg)](https://github.com/user/repo/actions)
![Node](https://img.shields.io/badge/node-20.x-brightgreen)
![License](https://img.shields.io/badge/license-MIT-green)
```

### Rozbudowany:

```markdown
# Project Name

<p align="center">
  <a href="https://github.com/user/repo/actions">
    <img src="https://github.com/user/repo/actions/workflows/ci.yml/badge.svg" alt="CI">
  </a>
  <img src="https://img.shields.io/badge/node-20.x-brightgreen" alt="Node">
  <img src="https://img.shields.io/badge/TypeScript-5.x-blue" alt="TypeScript">
  <img src="https://img.shields.io/badge/Astro-5.x-FF5D01" alt="Astro">
  <img src="https://img.shields.io/badge/license-MIT-green" alt="License">
</p>
```

## 🎨 Customizacja

Możesz dostosować badges na [shields.io](https://shields.io/):

1. Wejdź na https://shields.io/
2. Wybierz typ badge
3. Dostosuj kolory, tekst, styl
4. Skopiuj wygenerowany kod
5. Dodaj do README

## 📚 Więcej Informacji

- [GitHub Actions Badge Documentation](https://docs.github.com/en/actions/monitoring-and-troubleshooting-workflows/adding-a-workflow-status-badge)
- [Shields.io Documentation](https://shields.io/)
- [Badge Examples Gallery](https://github.com/badges/shields)

---

**Pro tip**: Badge zawsze pokazuje status ostatniego workflow run. Jeśli workflow failuje, badge będzie czerwony!
