/**
 * Simple header component for the profile page.
 * Displays the page title and description.
 */
export function ProfileHeader() {
  return (
    <div className="space-y-2">
      <h1 className="text-3xl font-bold tracking-tight">Profil</h1>
      <p className="text-muted-foreground">Zarządzaj swoimi preferencjami i danymi konta</p>
    </div>
  );
}
