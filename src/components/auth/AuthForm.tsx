import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, AlertCircle } from "lucide-react";
import {
  loginSchema,
  registerSchema,
  type LoginFormData,
  type RegisterFormData,
} from "@/lib/schemas/auth.schema";
import { supabaseClient } from "@/db/supabase.client";

type AuthFormProps = {
  mode: "login" | "register";
  onSuccess?: () => void;
};

/**
 * Unified authentication form component for login and registration.
 * Handles form validation, submission, and error display.
 */
export function AuthForm({ mode, onSuccess }: AuthFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const isLogin = mode === "login";
  const schema = isLogin ? loginSchema : registerSchema;

  const form = useForm<LoginFormData | RegisterFormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      email: "",
      password: "",
      ...(mode === "register" && { confirmPassword: "" }),
    },
  });

  const onSubmit = async (data: LoginFormData | RegisterFormData) => {
    setIsLoading(true);
    setError(null);
    setSuccess(null);

    try {
      if (isLogin) {
        // Login with email and password
        const { data: authData, error: authError } =
          await supabaseClient.auth.signInWithPassword({
            email: data.email,
            password: data.password,
          });

        if (authError) throw authError;

        if (authData.user) {
          setSuccess("Logowanie pomyślne! Przekierowywanie...");
          // Use replace to force full page reload with new cookies
          setTimeout(() => {
            window.location.replace("/plans");
          }, 500);
        }
      } else {
        // Register new user
        const { data: authData, error: authError } =
          await supabaseClient.auth.signUp({
            email: data.email,
            password: data.password,
            options: {
              // Disable email verification for MVP
              emailRedirectTo: undefined,
              data: {
                email_confirmed: true,
              },
            },
          });

        if (authError) throw authError;

        if (authData.user) {
          setSuccess("Konto zostało utworzone! Przekierowywanie...");
          // Use replace to force full page reload with new cookies
          setTimeout(() => {
            window.location.replace("/plans");
          }, 500);
        }
      }

      onSuccess?.();
    } catch (err) {
      // Handle Supabase authentication errors
      if (err && typeof err === "object" && "message" in err) {
        const errorMessage = err.message as string;
        
        // Provide user-friendly error messages
        if (errorMessage.includes("Invalid login credentials")) {
          setError("Nieprawidłowy email lub hasło");
        } else if (errorMessage.includes("User already registered")) {
          setError("Użytkownik z tym adresem email już istnieje");
        } else if (errorMessage.includes("Email not confirmed")) {
          setError("Potwierdź swój adres email przed zalogowaniem");
        } else {
          setError(errorMessage);
        }
      } else {
        setError("Wystąpił błąd podczas przetwarzania żądania");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md space-y-6">
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {success && (
        <Alert className="border-green-500 bg-green-50 text-green-900">
          <AlertDescription>{success}</AlertDescription>
        </Alert>
      )}

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input
                    type="email"
                    placeholder="twoj.email@example.com"
                    disabled={isLoading}
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Hasło</FormLabel>
                <FormControl>
                  <Input
                    type="password"
                    placeholder={
                      isLogin ? "Wprowadź hasło" : "Minimum 8 znaków"
                    }
                    disabled={isLoading}
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {!isLogin && (
            <FormField
              control={form.control}
              name="confirmPassword"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Potwierdź hasło</FormLabel>
                  <FormControl>
                    <Input
                      type="password"
                      placeholder="Powtórz hasło"
                      disabled={isLoading}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          )}

          {isLogin && (
            <div className="flex justify-end">
              <a
                href="/forgot-password"
                className="text-sm text-primary hover:underline"
              >
                Zapomniałeś hasła?
              </a>
            </div>
          )}

          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {isLogin ? "Zaloguj się" : "Zarejestruj się"}
          </Button>
        </form>
      </Form>

      <div className="text-center text-sm text-muted-foreground">
        {isLogin ? (
          <p>
            Nie masz konta?{" "}
            <a href="/register" className="text-primary hover:underline">
              Zarejestruj się
            </a>
          </p>
        ) : (
          <p>
            Masz już konto?{" "}
            <a href="/login" className="text-primary hover:underline">
              Zaloguj się
            </a>
          </p>
        )}
      </div>
    </div>
  );
}

