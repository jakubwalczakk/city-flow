import { useProfile } from '@/hooks/useProfile';
import { ProfileHeader } from '@/components/ProfileHeader';
import { GenerationsCounter } from '@/components/GenerationsCounter';
import { PreferencesForm } from '@/components/PreferencesForm';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import ToasterWrapper from '@/components/ToasterWrapper';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';
import type { UpdateProfileCommand } from '@/types';

/**
 * Main profile view component.
 * Manages the entire profile page state and coordinates all subcomponents.
 */
export function ProfileView() {
  const { isLoading, isSaving, error, profile, updateProfile, refetch } = useProfile();

  /**
   * Handles saving profile changes.
   */
  const handleSave = async (data: UpdateProfileCommand) => {
    try {
      await updateProfile(data);
      toast.success('Profil został zaktualizowany');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Nie udało się zapisać zmian');
    }
  };

  // Loading state
  if (isLoading) {
    return (
      <div className='container mx-auto py-8 px-4'>
        <div className='flex items-center justify-center min-h-[400px]'>
          <div className='flex flex-col items-center gap-4'>
            <Loader2 className='h-8 w-8 animate-spin text-primary' />
            <p className='text-muted-foreground'>Ładowanie profilu...</p>
          </div>
        </div>
        <ToasterWrapper />
      </div>
    );
  }

  // Error state
  if (error && !profile) {
    return (
      <div className='container mx-auto py-8 px-4'>
        <div className='flex items-center justify-center min-h-[400px]'>
          <Card className='max-w-md w-full'>
            <CardHeader>
              <CardTitle className='text-destructive'>⚠️ Nie udało się załadować profilu</CardTitle>
            </CardHeader>
            <CardContent className='space-y-4'>
              <p className='text-muted-foreground'>{error}</p>
              <Button onClick={refetch} className='w-full'>
                Spróbuj ponownie
              </Button>
            </CardContent>
          </Card>
        </div>
        <ToasterWrapper />
      </div>
    );
  }

  // New user without profile (404 case)
  const isNewUser = !profile;
  const welcomeMessage = isNewUser ? 'Witaj! Uzupełnij swój profil, aby AI mogło tworzyć lepsze plany.' : null;

  return (
    <div className='container mx-auto py-8 px-4 max-w-4xl' data-testid='profile-view'>
      <div className='space-y-8'>
        <ProfileHeader />

        {welcomeMessage && (
          <Card className='border-primary/50 bg-primary/5' data-testid='profile-welcome-message'>
            <CardContent className='pt-6'>
              <p className='text-sm'>{welcomeMessage}</p>
            </CardContent>
          </Card>
        )}

        {/* Generations Counter Card */}
        <Card data-testid='profile-stats-card'>
          <CardHeader>
            <CardTitle>Twoje statystyki</CardTitle>
          </CardHeader>
          <CardContent>
            <GenerationsCounter generationsRemaining={profile?.generations_remaining ?? 5} />
          </CardContent>
        </Card>

        {/* Preferences Form Card */}
        <Card data-testid='profile-preferences-card'>
          <CardHeader>
            <CardTitle>Preferencje podróżnicze</CardTitle>
          </CardHeader>
          <CardContent>
            <PreferencesForm
              initialPreferences={profile?.preferences ?? null}
              initialTravelPace={profile?.travel_pace ?? null}
              onSave={handleSave}
              isSaving={isSaving}
            />
          </CardContent>
        </Card>
      </div>

      <ToasterWrapper />
    </div>
  );
}
