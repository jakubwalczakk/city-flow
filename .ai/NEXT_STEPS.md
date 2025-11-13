# 🚀 Następne Kroki - Integracja Autentykacji CityFlow

## ✅ Co zostało zrobione

Pełna integracja autentykacji z Supabase została zakończona:
- ✅ SSR client z obsługą cookies
- ✅ Middleware z ochroną tras
- ✅ Komponenty logowania/rejestracji
- ✅ Google OAuth
- ✅ UserMenu dla zalogowanych użytkowników
- ✅ Automatyczne tworzenie profilu (database trigger)

## 📋 Checklist - Co musisz teraz zrobić

### 1. Konfiguracja Supabase Dashboard (5 min)

#### A. Wyłącz weryfikację email
1. Otwórz [Supabase Dashboard](https://app.supabase.com)
2. Wybierz projekt CityFlow
3. Przejdź do **Authentication** → **Providers** → **Email**
4. **Wyłącz** opcję **"Confirm email"**
5. Kliknij **Save**

#### B. Skonfiguruj Google OAuth (opcjonalne, 15 min)
1. Przejdź do [Google Cloud Console](https://console.cloud.google.com)
2. Utwórz/wybierz projekt
3. Włącz **Google+ API**
4. **Credentials** → **Create OAuth 2.0 Client ID**
5. Dodaj Authorized redirect URI:
   ```
   https://[YOUR-PROJECT-REF].supabase.co/auth/v1/callback
   ```
6. Skopiuj **Client ID** i **Client Secret**
7. W Supabase Dashboard → **Authentication** → **Providers** → **Google**:
   - Włącz Google provider
   - Wklej Client ID i Client Secret
   - Zapisz

### 2. Uruchom migracje bazy danych (5 min)

#### Krok 2.1: Uruchom główną migrację

**Opcja A: Supabase CLI (lokalnie)**
```bash
cd /Users/jakubwalczak/Projects/city-flow
supabase db reset
```

**Opcja B: Supabase Dashboard**
1. Przejdź do **Database** → **Migrations**
2. Znajdź migrację `20251113000000_create_profile_trigger.sql`
3. Kliknij **Run migration**

#### Krok 2.2: Utwórz trigger ręcznie (WYMAGANE!)

⚠️ **WAŻNE**: Trigger na `auth.users` musi być utworzony ręcznie w SQL Editor

1. Otwórz **SQL Editor** w Supabase Dashboard
2. Utwórz nowe zapytanie (New query)
3. Skopiuj i wklej zawartość pliku:
   ```
   supabase/migrations/20251113000001_create_auth_trigger_manual.sql
   ```
4. Kliknij **Run** (lub Cmd/Ctrl + Enter)
5. Sprawdź wynik - powinieneś zobaczyć:
   ```
   trigger_name: on_auth_user_created
   event_object_table: users
   ```

**Alternatywnie** możesz wkleić ten kod bezpośrednio:

```sql
-- Drop trigger if exists
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Create trigger
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();
```

### 3. Sprawdź zmienne środowiskowe (1 min)

Upewnij się, że `.env` zawiera:
```env
SUPABASE_URL=https://your-project-ref.supabase.co
SUPABASE_KEY=your-anon-key
OPENROUTER_API_KEY=your-openrouter-api-key
```

Klucze znajdziesz w Supabase Dashboard → **Settings** → **API**

### 4. Testowanie (10 min)

#### Test 1: Rejestracja
```bash
npm run dev
```
1. Otwórz http://localhost:3000/register
2. Wprowadź email i hasło (min. 8 znaków)
3. Kliknij "Zarejestruj się"
4. Powinieneś być przekierowany do `/plans`
5. W prawym górnym rogu powinien być awatar z inicjałami

**Weryfikacja w Supabase:**
- Dashboard → **Authentication** → **Users** (nowy użytkownik)
- Dashboard → **Table Editor** → **profiles** (nowy profil z `generations_remaining: 5`)

#### Test 2: Logowanie
1. Wyloguj się (kliknij awatar → "Wyloguj się")
2. Przejdź do http://localhost:3000/login
3. Wprowadź dane użytkownika z Testu 1
4. Kliknij "Zaloguj się"
5. Powinieneś być przekierowany do `/plans`

#### Test 3: Ochrona tras
1. Wyloguj się
2. Spróbuj otworzyć http://localhost:3000/plans
3. Powinieneś być automatycznie przekierowany do `/login`

#### Test 4: Google OAuth (jeśli skonfigurowane)
1. Przejdź do `/login`
2. Kliknij "Zaloguj się przez Google"
3. Autoryzuj aplikację w Google
4. Powinieneś wrócić do `/plans` jako zalogowany użytkownik

#### Test 5: Wylogowanie
1. Będąc zalogowanym, kliknij awatar w prawym górnym rogu
2. Kliknij "Wyloguj się"
3. Powinieneś być przekierowany do `/`
4. W nagłówku powinny być przyciski "Zaloguj się" i "Zarejestruj się"

## 🐛 Rozwiązywanie problemów

### Problem: "Invalid login credentials"
**Rozwiązanie:**
- Sprawdź czy użytkownik istnieje w Dashboard → Authentication → Users
- Upewnij się, że hasło jest poprawne (min. 8 znaków)
- Jeśli weryfikacja email jest włączona, wyłącz ją (krok 1A)

### Problem: Profil nie został utworzony
**Rozwiązanie:**
```sql
-- Sprawdź czy trigger istnieje
SELECT * FROM pg_trigger WHERE tgname = 'on_auth_user_created';

-- Jeśli nie istnieje, uruchom migrację ponownie
```

### Problem: Redirect loop (ciągłe przekierowania)
**Rozwiązanie:**
- Wyczyść cookies przeglądarki
- Sprawdź czy middleware ma poprawną listę `PUBLIC_PATHS`
- Sprawdź logi w konsoli przeglądarki

### Problem: Google OAuth nie działa
**Rozwiązanie:**
- Sprawdź czy Google provider jest **włączony** w Supabase
- Zweryfikuj Client ID i Client Secret
- Upewnij się, że redirect URI w Google Cloud Console jest identyczny z tym w Supabase

## 📚 Dokumentacja

Szczegółowa dokumentacja znajduje się w:
- `.ai/supabase-auth-setup.md` - Konfiguracja Supabase
- `.ai/auth-implementation-summary.md` - Podsumowanie implementacji
- `.ai/auth-spec.md` - Specyfikacja techniczna

## 🎯 Co dalej?

Po pomyślnym przetestowaniu autentykacji, możesz przejść do:
1. **Implementacji onboardingu** (US-005) - ekran wyboru preferencji po rejestracji
2. **Integracji profilu użytkownika** (US-010, US-011) - edycja preferencji, licznik generacji
3. **Zabezpieczenia API endpoints** - dodanie weryfikacji `Astro.locals.user` w istniejących API
4. **Forgot Password flow** - komponenty już istnieją, trzeba je zintegrować

## ✨ Gratulacje!

Jeśli wszystkie testy przeszły pomyślnie, autentykacja działa poprawnie! 🎉

Masz pytania? Sprawdź dokumentację lub otwórz issue na GitHubie.

