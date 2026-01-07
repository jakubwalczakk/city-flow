import { describe, it, expect } from 'vitest';
import { getAuthErrorMessage, AUTH_ERROR_MESSAGES } from '@/lib/constants/authErrors';

describe('authErrors', () => {
  describe('getAuthErrorMessage', () => {
    describe('exact matches', () => {
      it('should return mapped message for "Invalid login credentials"', () => {
        const result = getAuthErrorMessage('Invalid login credentials');
        expect(result).toBe('Nieprawidłowy email lub hasło');
      });

      it('should return mapped message for "User already registered"', () => {
        const result = getAuthErrorMessage('User already registered');
        expect(result).toBe('Użytkownik z tym adresem email już istnieje');
      });

      it('should return mapped message for "Email not confirmed"', () => {
        const result = getAuthErrorMessage('Email not confirmed');
        expect(result).toBe('Potwierdź swój adres email przed zalogowaniem');
      });

      it('should return mapped message for "Password should be at least 8 characters"', () => {
        const result = getAuthErrorMessage('Password should be at least 8 characters');
        expect(result).toBe('Hasło musi mieć minimum 8 znaków');
      });

      it('should return mapped message for "Unable to validate email address"', () => {
        const result = getAuthErrorMessage('Unable to validate email address');
        expect(result).toBe('Nieprawidłowy format adresu email');
      });

      it('should return mapped message for "Email rate limit exceeded"', () => {
        const result = getAuthErrorMessage('Email rate limit exceeded');
        expect(result).toBe('Przekroczono limit wysyłanych emaili. Spróbuj ponownie później');
      });

      it('should return mapped message for "Invalid email"', () => {
        const result = getAuthErrorMessage('Invalid email');
        expect(result).toBe('Nieprawidłowy adres email');
      });

      it('should return mapped message for "Signup disabled"', () => {
        const result = getAuthErrorMessage('Signup disabled');
        expect(result).toBe('Rejestracja jest obecnie wyłączona');
      });

      it('should return mapped message for "Authentication failed"', () => {
        const result = getAuthErrorMessage('Authentication failed');
        expect(result).toBe('Uwierzytelnienie nie powiodło się');
      });

      it('should return mapped message for "Registration failed"', () => {
        const result = getAuthErrorMessage('Registration failed');
        expect(result).toBe('Rejestracja nie powiodła się');
      });
    });

    describe('partial matches', () => {
      it('should return mapped message for partial match - "User already registered in the system"', () => {
        const result = getAuthErrorMessage('User already registered in the system');
        expect(result).toBe('Użytkownik z tym adresem email już istnieje');
      });

      it('should return mapped message for partial match - "Invalid login credentials provided"', () => {
        const result = getAuthErrorMessage('Invalid login credentials provided');
        expect(result).toBe('Nieprawidłowy email lub hasło');
      });

      it('should return mapped message for partial match - "Password should be at least 8 characters long"', () => {
        const result = getAuthErrorMessage('Password should be at least 8 characters long');
        expect(result).toBe('Hasło musi mieć minimum 8 znaków');
      });

      it('should return mapped message for partial match - "Email rate limit exceeded, try again later"', () => {
        const result = getAuthErrorMessage('Email rate limit exceeded, try again later');
        expect(result).toBe('Przekroczono limit wysyłanych emaili. Spróbuj ponownie później');
      });
    });

    describe('unknown errors', () => {
      it('should return default message for unknown error', () => {
        const result = getAuthErrorMessage('Unknown error');
        expect(result).toBe('Wystąpił nieoczekiwany błąd podczas uwierzytelniania');
      });

      it('should return default message for empty string', () => {
        const result = getAuthErrorMessage('');
        expect(result).toBe('Wystąpił nieoczekiwany błąd podczas uwierzytelniania');
      });

      it('should return default message for random string', () => {
        const result = getAuthErrorMessage('Some random error message');
        expect(result).toBe('Wystąpił nieoczekiwany błąd podczas uwierzytelniania');
      });

      it('should return default message for network error', () => {
        const result = getAuthErrorMessage('Network request failed');
        expect(result).toBe('Wystąpił nieoczekiwany błąd podczas uwierzytelniania');
      });
    });

    describe('edge cases', () => {
      it('should handle case-sensitive matching', () => {
        // Should not match because it's case-sensitive
        const result = getAuthErrorMessage('invalid login credentials');
        expect(result).toBe('Wystąpił nieoczekiwany błąd podczas uwierzytelniania');
      });

      it('should handle errors with extra whitespace', () => {
        const result = getAuthErrorMessage('  Invalid login credentials  ');
        expect(result).toBe('Nieprawidłowy email lub hasło');
      });
    });
  });

  describe('AUTH_ERROR_MESSAGES constant', () => {
    it('should be defined', () => {
      expect(AUTH_ERROR_MESSAGES).toBeDefined();
    });

    it('should be an object', () => {
      expect(typeof AUTH_ERROR_MESSAGES).toBe('object');
    });

    it('should have expected keys', () => {
      const keys = Object.keys(AUTH_ERROR_MESSAGES);
      expect(keys).toContain('Invalid login credentials');
      expect(keys).toContain('User already registered');
      expect(keys).toContain('Email not confirmed');
    });

    it('should have Polish error messages as values', () => {
      const values = Object.values(AUTH_ERROR_MESSAGES);
      expect(values.every((v) => typeof v === 'string')).toBe(true);
      expect(values.some((v) => v.includes('ł') || v.includes('ą') || v.includes('ę'))).toBe(true);
    });
  });
});
