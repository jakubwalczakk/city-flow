import { useState, useEffect, useCallback } from 'react';
import { useProfile } from '@/hooks/useProfile';
import { toast } from 'sonner';
import type { TravelPace } from '@/types';

type OnboardingErrors = {
  pace?: string;
  preferences?: string;
};

/**
 * Custom hook for managing OnboardingModal state and logic.
 * Handles validation, save/skip actions, and modal visibility.
 *
 * @example
 * const { isOpen, pace, preferences, errors, ... } = useOnboardingModal();
 */
export function useOnboardingModal() {
  const { profile, isLoading: isProfileLoading, updateProfile } = useProfile();

  const [isOpen, setIsOpen] = useState(false);
  const [pace, setPace] = useState<TravelPace | null>(null);
  const [preferences, setPreferences] = useState<string[]>([]);
  const [errors, setErrors] = useState<OnboardingErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Open modal when profile is loaded and onboarding not completed
  useEffect(() => {
    if (!isProfileLoading && profile && !profile.onboarding_completed) {
      setIsOpen(true);
    }
  }, [isProfileLoading, profile]);

  /**
   * Validates the onboarding form data.
   * @returns true if valid, false otherwise
   */
  const validate = useCallback((): boolean => {
    const newErrors: OnboardingErrors = {};
    let isValid = true;

    if (!pace) {
      newErrors.pace = 'Wybierz preferowane tempo zwiedzania.';
      isValid = false;
    }

    if (preferences.length < 2 || preferences.length > 5) {
      newErrors.preferences = 'Wybierz od 2 do 5 preferencji.';
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  }, [pace, preferences.length]);

  /**
   * Handles saving the onboarding preferences.
   */
  const handleSave = useCallback(async () => {
    if (!validate()) return;
    if (!pace) return;

    setIsSubmitting(true);
    try {
      await updateProfile({
        travel_pace: pace,
        preferences: preferences,
        onboarding_completed: true,
      });
      toast.success('Profil zaktualizowany');
      setIsOpen(false);
    } catch {
      toast.error('Wystąpił błąd podczas zapisywania profilu.');
    } finally {
      setIsSubmitting(false);
    }
  }, [validate, pace, preferences, updateProfile]);

  /**
   * Handles skipping the onboarding process.
   */
  const handleSkip = useCallback(async () => {
    setIsSubmitting(true);
    try {
      await updateProfile({
        onboarding_completed: true,
      });
      setIsOpen(false);
    } catch {
      toast.error('Wystąpił błąd.');
    } finally {
      setIsSubmitting(false);
    }
  }, [updateProfile]);

  return {
    // State
    isOpen,
    setIsOpen,
    pace,
    setPace,
    preferences,
    setPreferences,
    errors,
    isSubmitting,
    profile,

    // Actions
    handleSave,
    handleSkip,
  };
}
