import { LoginForm } from '@/components/auth/LoginForm';
import { RegisterForm } from '@/components/auth/RegisterForm';

type AuthFormProps = {
  mode: 'login' | 'register';
  onSuccess?: () => void;
};

/**
 * Unified authentication form component for login and registration.
 * This is a wrapper component that delegates to LoginForm or RegisterForm.
 *
 * @deprecated Use LoginForm or RegisterForm directly for better code splitting
 */
export function AuthForm({ mode, onSuccess }: AuthFormProps) {
  if (mode === 'login') {
    return <LoginForm onSuccess={onSuccess} />;
  }

  return <RegisterForm onSuccess={onSuccess} />;
}
