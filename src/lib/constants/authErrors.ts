/**
 * Mapping of Supabase authentication error messages to user-friendly Polish messages
 */
export const AUTH_ERROR_MESSAGES: Record<string, string> = {
  'Invalid login credentials': 'Nieprawidłowy email lub hasło',
  'User already registered': 'Użytkownik z tym adresem email już istnieje',
  'Email not confirmed': 'Potwierdź swój adres email przed zalogowaniem',
  'Password should be at least 8 characters': 'Hasło musi mieć minimum 8 znaków',
  'Unable to validate email address': 'Nieprawidłowy format adresu email',
  'Email rate limit exceeded': 'Przekroczono limit wysyłanych emaili. Spróbuj ponownie później',
  'Invalid email': 'Nieprawidłowy adres email',
  'Signup disabled': 'Rejestracja jest obecnie wyłączona',
  'Authentication failed': 'Uwierzytelnienie nie powiodło się',
  'Registration failed': 'Rejestracja nie powiodła się',
} as const;

/**
 * Get user-friendly error message for authentication errors
 * @param error - Error message from Supabase or error string
 * @returns User-friendly error message in Polish
 */
export function getAuthErrorMessage(error: string): string {
  // Check for exact match
  if (error in AUTH_ERROR_MESSAGES) {
    return AUTH_ERROR_MESSAGES[error];
  }

  // Check for partial matches
  for (const [key, value] of Object.entries(AUTH_ERROR_MESSAGES)) {
    if (error.includes(key)) {
      return value;
    }
  }

  // Default error message
  return 'Wystąpił nieoczekiwany błąd podczas uwierzytelniania';
}
