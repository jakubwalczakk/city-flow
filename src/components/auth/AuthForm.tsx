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
      // TODO: Implement Supabase authentication
      // For login: await supabase.auth.signInWithPassword({ email, password })
      // For register: await supabase.auth.signUp({ email, password })

      console.log("Auth form submitted:", { mode, data });

      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Mock success
      if (isLogin) {
        setSuccess("Logowanie pomyślne! Przekierowywanie...");
        // TODO: Redirect to /dashboard
        setTimeout(() => {
          window.location.href = "/plans";
        }, 1500);
      } else {
        setSuccess(
          "Konto zostało utworzone! Sprawdź swoją skrzynkę email w celu weryfikacji."
        );
        // TODO: Optionally redirect to /dashboard or show verification message
      }

      onSuccess?.();
    } catch (err) {
      // TODO: Handle Supabase errors properly
      setError(
        err instanceof Error
          ? err.message
          : "Wystąpił błąd podczas przetwarzania żądania"
      );
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

