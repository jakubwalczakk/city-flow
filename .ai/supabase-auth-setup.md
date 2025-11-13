# Konfiguracja Supabase Auth dla CityFlow

## Wyłączenie weryfikacji email (MVP)

Zgodnie z wymaganiami MVP, weryfikacja email nie jest wymagana. Aby to skonfigurować w Supabase:

### Opcja 1: Przez Supabase Dashboard (Zalecana dla MVP)

1. Przejdź do [Supabase Dashboard](https://app.supabase.com)
2. Wybierz swój projekt CityFlow
3. Przejdź do **Authentication** → **Providers** → **Email**
4. Wyłącz opcję **"Confirm email"**
5. Zapisz zmiany

### Opcja 2: Przez kod (już zaimplementowane)

W komponencie `AuthForm.tsx` podczas rejestracji przekazujemy:

```typescript
await supabaseClient.auth.signUp({
  email: data.email,
  password: data.password,
  options: {
    emailRedirectTo: undefined, // Wyłącza redirect po weryfikacji
  },
});
```

## Konfiguracja Google OAuth

### 1. Konfiguracja w Google Cloud Console

1. Przejdź do [Google Cloud Console](https://console.cloud.google.com)
2. Utwórz nowy projekt lub wybierz istniejący
3. Włącz **Google+ API**
4. Przejdź do **Credentials** → **Create Credentials** → **OAuth 2.0 Client ID**
5. Skonfiguruj OAuth consent screen
6. Dodaj **Authorized redirect URIs**:
   ```
   https://[YOUR-PROJECT-REF].supabase.co/auth/v1/callback
   ```
7. Skopiuj **Client ID** i **Client Secret**

### 2. Konfiguracja w Supabase Dashboard

1. Przejdź do **Authentication** → **Providers** → **Google**
2. Włącz Google provider
3. Wklej **Client ID** i **Client Secret** z Google Cloud Console
4. W polu **Redirect URL** upewnij się, że jest:
   ```
   https://[YOUR-PROJECT-REF].supabase.co/auth/v1/callback
   ```
5. Zapisz zmiany

### 3. Konfiguracja Redirect URL w aplikacji

Redirect URL po autoryzacji Google jest już skonfigurowany w `GoogleAuthButton.tsx`:

```typescript
await supabaseClient.auth.signInWithOAuth({
  provider: "google",
  options: {
    redirectTo: `${window.location.origin}/plans`,
  },
});
```

## Zmienne środowiskowe

Upewnij się, że masz skonfigurowane następujące zmienne w pliku `.env`:

```env
SUPABASE_URL=https://[YOUR-PROJECT-REF].supabase.co
SUPABASE_KEY=[YOUR-ANON-KEY]
```

Klucze znajdziesz w Supabase Dashboard → **Settings** → **API**

## Migracje bazy danych

### Krok 1: Uruchom główną migrację

```bash
# Jeśli używasz Supabase CLI lokalnie
supabase db reset

# Lub zastosuj migracje na produkcji przez Dashboard
# Settings → Database → Migrations
```

Migracja `20251113000000_create_profile_trigger.sql` tworzy funkcję `handle_new_user()`, która automatycznie tworzy profil użytkownika po rejestracji.

### Krok 2: Utwórz trigger ręcznie (WYMAGANE!)

⚠️ **WAŻNE**: Ze względu na uprawnienia, trigger na tabeli `auth.users` musi być utworzony ręcznie w Supabase Dashboard SQL Editor.

1. Otwórz **Supabase Dashboard** → **SQL Editor**
2. Utwórz nowe zapytanie
3. Wklej kod z pliku `supabase/migrations/20251113000001_create_auth_trigger_manual.sql`:

```sql
-- Drop trigger if exists
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Create trigger
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- Verify
SELECT trigger_name, event_object_table 
FROM information_schema.triggers 
WHERE trigger_name = 'on_auth_user_created';
```

4. Kliknij **Run**
5. Sprawdź wynik - powinieneś zobaczyć potwierdzenie utworzenia triggera

## Testowanie

### Test rejestracji email/hasło:
1. Przejdź do `/register`
2. Wprowadź email i hasło
3. Po pomyślnej rejestracji powinieneś być przekierowany do `/plans`
4. Sprawdź w Supabase Dashboard → **Authentication** → **Users**, czy użytkownik został utworzony
5. Sprawdź w **Table Editor** → **profiles**, czy profil został automatycznie utworzony

### Test logowania email/hasło:
1. Przejdź do `/login`
2. Wprowadź dane użytkownika
3. Po pomyślnym logowaniu powinieneś być przekierowany do `/plans`
4. W nagłówku powinieneś zobaczyć UserMenu z awatarem

### Test Google OAuth:
1. Przejdź do `/login` lub `/register`
2. Kliknij "Zaloguj się przez Google"
3. Zostaniesz przekierowany do Google OAuth
4. Po autoryzacji wrócisz do `/plans`
5. Profil zostanie automatycznie utworzony (jeśli to pierwsza rejestracja)

### Test wylogowania:
1. Będąc zalogowanym, kliknij na awatar w prawym górnym rogu
2. Wybierz "Wyloguj się"
3. Powinieneś być przekierowany do strony głównej `/`
4. Przyciski "Zaloguj się" i "Zarejestruj się" powinny być widoczne w nagłówku

## Rozwiązywanie problemów

### Problem: "Invalid login credentials"
- Sprawdź czy użytkownik istnieje w bazie danych
- Upewnij się, że hasło jest poprawne
- Jeśli weryfikacja email jest włączona, sprawdź czy email został potwierdzony

### Problem: "User already registered"
- Użytkownik z tym emailem już istnieje
- Użyj funkcji logowania zamiast rejestracji

### Problem: Google OAuth nie działa
- Sprawdź czy Google provider jest włączony w Supabase Dashboard
- Zweryfikuj Client ID i Client Secret
- Upewnij się, że Authorized redirect URIs są poprawnie skonfigurowane w Google Cloud Console

### Problem: Profil nie został utworzony automatycznie
- Sprawdź czy migracja `20251113000000_create_profile_trigger.sql` została zastosowana
- Sprawdź logi w Supabase Dashboard → **Logs** → **Postgres Logs**
- Ręcznie sprawdź czy trigger istnieje:
  ```sql
  SELECT * FROM pg_trigger WHERE tgname = 'on_auth_user_created';
  ```

## Bezpieczeństwo

### Row Level Security (RLS)
RLS jest włączony na tabeli `profiles`. Użytkownicy mogą:
- Odczytywać tylko swój własny profil
- Aktualizować tylko swój własny profil
- Usuwać tylko swój własny profil

### Cookies
Sesje użytkowników są przechowywane w bezpiecznych cookies z następującymi ustawieniami:
- `httpOnly: true` - Niedostępne dla JavaScript
- `secure: true` - Tylko przez HTTPS
- `sameSite: 'lax'` - Ochrona przed CSRF

### Middleware
Middleware Astro automatycznie:
- Weryfikuje sesję użytkownika na każdym żądaniu
- Przekierowuje niezalogowanych użytkowników do `/login` dla chronionych tras
- Udostępnia dane użytkownika w `Astro.locals.user`

