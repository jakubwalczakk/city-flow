import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { TravelPaceSelector } from '@/components/TravelPaceSelector';
import { PreferencesSelector } from '@/components/PreferencesSelector';
import { useProfile } from '@/hooks/useProfile';
import type { TravelPace } from '@/types';
import { toast } from 'sonner';

export function OnboardingModal() {
  const { profile, isLoading, updateProfile } = useProfile();
  const [isOpen, setIsOpen] = useState(false);
  const [pace, setPace] = useState<TravelPace | null>(null);
  const [preferences, setPreferences] = useState<string[]>([]);
  const [errors, setErrors] = useState<{ pace?: string; preferences?: string }>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!isLoading && profile && !profile.onboarding_completed) {
      setIsOpen(true);
    }
  }, [isLoading, profile]);

  const validate = () => {
    const newErrors: { pace?: string; preferences?: string } = {};
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
  };

  const handleSave = async () => {
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
  };

  const handleSkip = async () => {
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
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent
        className='sm:max-w-[500px]'
        onInteractOutside={(e) => e.preventDefault()}
        onEscapeKeyDown={(e) => e.preventDefault()}
      >
        <DialogHeader>
          <DialogTitle>Witaj w CityFlow!</DialogTitle>
          <DialogDescription>
            Opowiedz nam trochę o swoich preferencjach podróżniczych, abyśmy mogli tworzyć lepsze plany dla Ciebie.
          </DialogDescription>
        </DialogHeader>

        <div className='grid gap-6 py-4'>
          <div className='space-y-2'>
            <TravelPaceSelector value={pace} onChange={setPace} />
            {errors.pace && <p className='text-sm text-destructive'>{errors.pace}</p>}
          </div>

          <PreferencesSelector value={preferences} onChange={setPreferences} error={errors.preferences} />

          <div className='rounded-md bg-muted p-3 text-sm text-muted-foreground'>
            <p>
              Twoje konto darmowe pozwala na wygenerowanie <strong>{profile?.generations_remaining || 0} planów</strong>
              . Wykorzystaj je mądrze!
            </p>
          </div>
        </div>

        <DialogFooter className='flex-col sm:flex-row gap-2'>
          <Button variant='outline' onClick={handleSkip} disabled={isSubmitting}>
            Pomiń
          </Button>
          <Button onClick={handleSave} disabled={isSubmitting}>
            {isSubmitting ? 'Zapisywanie...' : 'Zapisz i przejdź dalej'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
