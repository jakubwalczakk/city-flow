import { useState } from 'react';
import { AuthService } from '@/lib/services/auth.client.service';
import { getAuthErrorMessage } from '@/lib/constants/authErrors';
import type { LoginFormData, RegisterFormData } from '@/lib/schemas/auth.schema';

/**
 * Custom hook for authentication operations
 * Provides a clean interface for login, register, and other auth operations
 * Handles loading states and error messages
 */
export function useAuth() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  /**
   * Login user with email and password
   */
  const login = async (credentials: LoginFormData) => {
    setIsLoading(true);
    setError(null);
    setSuccess(null);

    try {
      await AuthService.login(credentials);
      setSuccess('Logowanie pomyślne! Przekierowywanie...');

      // Use replace to force full page reload with new cookies
      setTimeout(() => {
        window.location.replace('/plans');
      }, 500);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Wystąpił błąd';
      setError(getAuthErrorMessage(message));
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Register new user
   */
  const register = async (credentials: RegisterFormData) => {
    setIsLoading(true);
    setError(null);
    setSuccess(null);

    try {
      await AuthService.register(credentials);
      setSuccess('Konto zostało utworzone! Przekierowywanie...');

      // Use replace to force full page reload with new cookies
      setTimeout(() => {
        window.location.replace('/plans');
      }, 500);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Wystąpił błąd';
      setError(getAuthErrorMessage(message));
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Send password reset email
   */
  const resetPassword = async (email: string) => {
    setIsLoading(true);
    setError(null);
    setSuccess(null);

    try {
      await AuthService.resetPassword(email);
      setSuccess('Email resetujący hasło został wysłany');
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Wystąpił błąd';
      setError(getAuthErrorMessage(message));
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Update user password
   */
  const updatePassword = async (newPassword: string) => {
    setIsLoading(true);
    setError(null);
    setSuccess(null);

    try {
      await AuthService.updatePassword(newPassword);
      setSuccess('Hasło zostało zaktualizowane');
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Wystąpił błąd';
      setError(getAuthErrorMessage(message));
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Clear error message
   */
  const clearError = () => setError(null);

  /**
   * Clear success message
   */
  const clearSuccess = () => setSuccess(null);

  return {
    login,
    register,
    resetPassword,
    updatePassword,
    isLoading,
    error,
    success,
    clearError,
    clearSuccess,
  };
}
