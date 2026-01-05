/**
 * Simple header component for the profile page.
 * Displays the page title and description.
 */
export function ProfileHeader() {
  return (
    <div className='space-y-2' data-testid='profile-header'>
      <h1 className='text-3xl font-bold tracking-tight' data-testid='profile-title'>
        Profil
      </h1>
      <p className='text-muted-foreground' data-testid='profile-description'>
        Zarządzaj swoimi preferencjami i danymi konta
      </p>
    </div>
  );
}
