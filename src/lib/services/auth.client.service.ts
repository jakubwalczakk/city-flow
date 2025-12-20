import { supabaseClient } from '@/db/supabase.client';
import type { LoginFormData, RegisterFormData } from '@/lib/schemas/auth.schema';

/**
 * Authentication service for handling user authentication operations.
 * Centralizes all Supabase auth calls and error handling.
 */
// eslint-disable-next-line @typescript-eslint/no-extraneous-class
export class AuthService {
  /**
   * Authenticate user with email and password
   */
  static async login(credentials: LoginFormData) {
    const { data, error } = await supabaseClient.auth.signInWithPassword({
      email: credentials.email,
      password: credentials.password,
    });

    if (error) {
      throw new AuthError(error.message);
    }

    if (!data.user) {
      throw new AuthError('Authentication failed');
    }

    return data.user;
  }

  /**
   * Register a new user
   */
  static async register(credentials: RegisterFormData) {
    const { data, error } = await supabaseClient.auth.signUp({
      email: credentials.email,
      password: credentials.password,
      options: {
        emailRedirectTo: undefined,
        data: {
          email_confirmed: true,
        },
      },
    });

    if (error) {
      throw new AuthError(error.message);
    }

    if (!data.user) {
      throw new AuthError('Registration failed');
    }

    return data.user;
  }

  /**
   * Send password reset email
   */
  static async resetPassword(email: string) {
    const { error } = await supabaseClient.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/update-password`,
    });

    if (error) {
      throw new AuthError(error.message);
    }
  }

  /**
   * Update user password
   */
  static async updatePassword(newPassword: string) {
    const { error } = await supabaseClient.auth.updateUser({
      password: newPassword,
    });

    if (error) {
      throw new AuthError(error.message);
    }
  }

  /**
   * Sign out current user
   */
  static async signOut() {
    const { error } = await supabaseClient.auth.signOut();

    if (error) {
      throw new AuthError(error.message);
    }
  }
}

/**
 * Custom error class for authentication errors
 */
export class AuthError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'AuthError';
  }
}
