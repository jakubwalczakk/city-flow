# Przegląd Tras Autentykacji

## Mapa Routingu

```
/
├── / (index)                    → PlansDashboard (wymaga auth w przyszłości)
├── /plans                       → PlansDashboard (wymaga auth w przyszłości)
├── /plans/:id                   → PlanDetailsView (wymaga auth w przyszłości)
├── /profile                     → ProfileView (wymaga auth w przyszłości)
│
├── /login                       → Strona logowania (publiczna)
├── /register                    → Strona rejestracji (publiczna)
├── /forgot-password             → Strona zapomnienia hasła (publiczna)
└── /update-password             → Strona ustawiania nowego hasła (półpubliczna)
```

## Przepływ Użytkownika (User Flow)

### 1. Rejestracja Nowego Użytkownika

```
START
  ↓
/register
  ↓
[Wypełnienie formularza]
  ↓
[Kliknięcie "Zarejestruj się"]
  ↓
[Supabase: signUp()] → Email weryfikacyjny
  ↓
/plans (po weryfikacji)
```

**Alternatywnie - Google OAuth:**
```
/register
  ↓
[Kliknięcie "Zarejestruj się przez Google"]
  ↓
[Supabase: OAuth Google]
  ↓
/plans
```

### 2. Logowanie Istniejącego Użytkownika

```
START
  ↓
/login
  ↓
[Wypełnienie formularza]
  ↓
[Kliknięcie "Zaloguj się"]
  ↓
[Supabase: signInWithPassword()]
  ↓
/plans
```

**Alternatywnie - Google OAuth:**
```
/login
  ↓
[Kliknięcie "Zaloguj się przez Google"]
  ↓
[Supabase: OAuth Google]
  ↓
/plans
```

### 3. Odzyskiwanie Hasła

```
START
  ↓
/login
  ↓
[Kliknięcie "Zapomniałeś hasła?"]
  ↓
/forgot-password
  ↓
[Wprowadzenie emaila]
  ↓
[Kliknięcie "Wyślij link resetujący"]
  ↓
[Supabase: resetPasswordForEmail()]
  ↓
[Email z linkiem]
  ↓
/update-password (z tokenem w URL)
  ↓
[Wprowadzenie nowego hasła]
  ↓
[Kliknięcie "Ustaw nowe hasło"]
  ↓
[Supabase: updateUser()]
  ↓
/login (przekierowanie)
```

### 4. Wylogowanie

```
Dowolna strona (zalogowany)
  ↓
[Header → UserMenu → "Wyloguj się"]
  ↓
[Supabase: signOut()]
  ↓
/ (strona główna)
```

## Stan Nawigacji

### Niezalogowany Użytkownik

```
+--------------------------------------------------+
|  CityFlow                 [Zaloguj się] [Zarejestruj się]  |
+--------------------------------------------------+
```

### Zalogowany Użytkownik

```
+--------------------------------------------------+
|  CityFlow                                   [🧑 Avatar ▼]  |
|                                             ├─ Profil      |
|                                             └─ Wyloguj się |
+--------------------------------------------------+
```

## Komponenty na Poszczególnych Stronach

### `/login`
- **Layout**: Layout.astro (bez headera)
- **Komponenty**:
  - AuthForm (mode="login")
  - GoogleAuthButton (mode="login")
  - Linki: → /register, → /, → /forgot-password

### `/register`
- **Layout**: Layout.astro (bez headera)
- **Komponenty**:
  - AuthForm (mode="register")
  - GoogleAuthButton (mode="register")
  - Linki: → /login, → /
  - Informacja o regulaminie

### `/forgot-password`
- **Layout**: Layout.astro (bez headera)
- **Komponenty**:
  - ForgotPasswordForm
  - Linki: → /login, → /

### `/update-password`
- **Layout**: Layout.astro (bez headera)
- **Komponenty**:
  - UpdatePasswordForm
  - Link: → /

### `/plans` (dashboard)
- **Layout**: MainLayout.astro (z headerem)
- **Komponenty**:
  - PlansDashboard
  - UserMenu (w headerze, tylko dla zalogowanych)

### `/profile`
- **Layout**: MainLayout.astro (z headerem)
- **Komponenty**:
  - ProfileView
  - UserMenu (w headerze, tylko dla zalogowanych)

## Przyszłe Zmiany (Po Implementacji Backend)

### Middleware (`src/middleware/index.ts`)

Będzie chroniło następujące trasy:
- ✅ `/plans` → wymaga autentykacji
- ✅ `/plans/:id` → wymaga autentykacji
- ✅ `/profile` → wymaga autentykacji

Przekierowania:
- Jeśli niezalogowany → `/login`
- Jeśli zalogowany i na `/login` lub `/register` → `/plans`

### Warunkowe Renderowanie w MainLayout

```typescript
const user = Astro.locals.user; // z middleware
const isAuthenticated = !!user;
```

Jeśli `isAuthenticated === true`:
- Pokazuj UserMenu z emailem użytkownika

Jeśli `isAuthenticated === false`:
- Pokazuj przyciski "Zaloguj się" i "Zarejestruj się"

## Zmienne Środowiskowe

Po implementacji backend, potrzebne będą:

```env
PUBLIC_SUPABASE_URL=https://xxx.supabase.co
PUBLIC_SUPABASE_ANON_KEY=eyJxxx...
SUPABASE_SERVICE_ROLE_KEY=eyJxxx...
```

## Konfiguracja Supabase

### Google OAuth
1. Dodać Google jako providera w Supabase Dashboard
2. Skonfigurować Redirect URLs:
   - `http://localhost:4321/auth/callback` (dev)
   - `https://your-domain.com/auth/callback` (prod)

### Email Templates
Dostosować szablony emaili w Supabase Dashboard:
- Email weryfikacyjny (sign up)
- Email resetujący hasło (password recovery)

### Auth Settings
- Email Confirmation: włączone/wyłączone (MVP może być wyłączone)
- Password Requirements: min. 8 znaków (zgodne ze schematem)

