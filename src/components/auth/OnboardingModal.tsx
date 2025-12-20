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
import { useOnboardingModal } from '@/hooks/useOnboardingModal';

/**
 * Modal for onboarding new users.
 * Collects travel pace and preferences to personalize AI recommendations.
 * Uses useOnboardingModal hook for state and logic management.
 */
export function OnboardingModal() {
  const {
    isOpen,
    setIsOpen,
    pace,
    setPace,
    preferences,
    setPreferences,
    errors,
    isSubmitting,
    profile,
    handleSave,
    handleSkip,
  } = useOnboardingModal();

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
          <Button variant='outline' onClick={handleSkip} disabled={isSubmitting} data-testid='onboarding-skip-btn'>
            Pomiń
          </Button>
          <Button onClick={handleSave} disabled={isSubmitting} data-testid='onboarding-save-btn'>
            {isSubmitting ? 'Zapisywanie...' : 'Zapisz i przejdź dalej'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
