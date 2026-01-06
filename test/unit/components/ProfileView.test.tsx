import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ProfileView } from '@/components/ProfileView';
import * as useProfileModule from '@/hooks/useProfile';
import * as sonner from 'sonner';

// Mock hooks
vi.mock('@/hooks/useProfile');

// Mock sonner toast
vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

// Mock lucide-react icons
vi.mock('lucide-react', () => ({
  Loader2: ({ className }: { className?: string }) => <span className={className}>Loading Icon</span>,
}));

/* eslint-disable @typescript-eslint/no-explicit-any */
// Mock child components
vi.mock('@/components/ProfileHeader', () => ({
  ProfileHeader: () => <div data-testid='profile-header'>ProfileHeader</div>,
}));

vi.mock('@/components/GenerationsCounter', () => ({
  GenerationsCounter: ({ generationsRemaining }: { generationsRemaining: number }) => (
    <div data-testid='generations-counter'>Remaining: {generationsRemaining}</div>
  ),
}));

vi.mock('@/components/PreferencesForm', () => ({
  PreferencesForm: ({ onSave, isSaving }: any) => (
    <div data-testid='preferences-form'>
      <button onClick={() => onSave({ preferences: ['culture'], travel_pace: 'moderate' })}>
        {isSaving ? 'Saving...' : 'Save'}
      </button>
    </div>
  ),
}));

vi.mock('@/components/ToasterWrapper', () => ({
  default: () => <div data-testid='toaster-wrapper'>Toaster</div>,
}));

vi.mock('@/components/ui/card', () => ({
  Card: ({ children, ...props }: any) => <div {...props}>{children}</div>,
  CardContent: ({ children, ...props }: any) => <div {...props}>{children}</div>,
  CardHeader: ({ children, ...props }: any) => <div {...props}>{children}</div>,
  CardTitle: ({ children, ...props }: any) => <h3 {...props}>{children}</h3>,
}));

vi.mock('@/components/ui/button', () => ({
  Button: ({ children, onClick, ...props }: any) => (
    <button onClick={onClick} {...props}>
      {children}
    </button>
  ),
}));
/* eslint-enable @typescript-eslint/no-explicit-any */

describe('ProfileView', () => {
  const mockProfile = {
    id: 'user-1',
    user_id: 'user-1',
    preferences: ['culture', 'food'],
    travel_pace: 'moderate' as const,
    generations_remaining: 3,
    onboarding_completed: true,
    created_at: '2024-01-01',
    updated_at: '2024-01-01',
  };

  const mockUpdateProfile = vi.fn();
  const mockRefetch = vi.fn();

  const mockUseProfile = {
    isLoading: false,
    isSaving: false,
    error: null,
    profile: mockProfile,
    updateProfile: mockUpdateProfile,
    refetch: mockRefetch,
  };

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(useProfileModule.useProfile).mockReturnValue(mockUseProfile);
  });

  describe('rendering - loading state', () => {
    it('should show loading spinner when isLoading is true', () => {
      vi.mocked(useProfileModule.useProfile).mockReturnValue({
        ...mockUseProfile,
        isLoading: true,
        profile: null,
      });

      render(<ProfileView />);

      expect(screen.getByText('Loading Icon')).toBeInTheDocument();
      expect(screen.getByText('Ładowanie profilu...')).toBeInTheDocument();
    });

    it('should show toaster wrapper in loading state', () => {
      vi.mocked(useProfileModule.useProfile).mockReturnValue({
        ...mockUseProfile,
        isLoading: true,
        profile: null,
      });

      render(<ProfileView />);

      expect(screen.getByTestId('toaster-wrapper')).toBeInTheDocument();
    });

    it('should not show main content in loading state', () => {
      vi.mocked(useProfileModule.useProfile).mockReturnValue({
        ...mockUseProfile,
        isLoading: true,
        profile: null,
      });

      render(<ProfileView />);

      expect(screen.queryByTestId('profile-view')).not.toBeInTheDocument();
    });
  });

  describe('rendering - error state', () => {
    it('should show error message when error exists and profile is null', () => {
      vi.mocked(useProfileModule.useProfile).mockReturnValue({
        ...mockUseProfile,
        error: 'Failed to load profile',
        profile: null,
      });

      render(<ProfileView />);

      expect(screen.getByText('⚠️ Nie udało się załadować profilu')).toBeInTheDocument();
      expect(screen.getByText('Failed to load profile')).toBeInTheDocument();
    });

    it('should show retry button in error state', () => {
      vi.mocked(useProfileModule.useProfile).mockReturnValue({
        ...mockUseProfile,
        error: 'Failed to load profile',
        profile: null,
      });

      render(<ProfileView />);

      expect(screen.getByText('Spróbuj ponownie')).toBeInTheDocument();
    });

    it('should call refetch when retry button is clicked', async () => {
      const user = userEvent.setup();
      const mockRefetch = vi.fn();

      vi.mocked(useProfileModule.useProfile).mockReturnValue({
        ...mockUseProfile,
        error: 'Failed to load profile',
        profile: null,
        refetch: mockRefetch,
      });

      render(<ProfileView />);

      const retryButton = screen.getByText('Spróbuj ponownie');
      await user.click(retryButton);

      expect(mockRefetch).toHaveBeenCalled();
    });

    it('should show main content when error exists but profile is loaded', () => {
      vi.mocked(useProfileModule.useProfile).mockReturnValue({
        ...mockUseProfile,
        error: 'Some error',
        profile: mockProfile,
      });

      render(<ProfileView />);

      expect(screen.getByTestId('profile-view')).toBeInTheDocument();
    });
  });

  describe('rendering - new user', () => {
    it('should show welcome message for new user', () => {
      vi.mocked(useProfileModule.useProfile).mockReturnValue({
        ...mockUseProfile,
        profile: null,
        error: null,
      });

      render(<ProfileView />);

      expect(screen.getByTestId('profile-welcome-message')).toBeInTheDocument();
      expect(screen.getByText('Witaj! Uzupełnij swój profil, aby AI mogło tworzyć lepsze plany.')).toBeInTheDocument();
    });

    it('should use default generations count for new user', () => {
      vi.mocked(useProfileModule.useProfile).mockReturnValue({
        ...mockUseProfile,
        profile: null,
        error: null,
      });

      render(<ProfileView />);

      expect(screen.getByText('Remaining: 5')).toBeInTheDocument();
    });

    it('should pass null preferences to form for new user', () => {
      vi.mocked(useProfileModule.useProfile).mockReturnValue({
        ...mockUseProfile,
        profile: null,
        error: null,
      });

      render(<ProfileView />);

      expect(screen.getByTestId('preferences-form')).toBeInTheDocument();
    });
  });

  describe('rendering - existing user', () => {
    it('should render profile view', () => {
      render(<ProfileView />);

      expect(screen.getByTestId('profile-view')).toBeInTheDocument();
    });

    it('should render profile header', () => {
      render(<ProfileView />);

      expect(screen.getByTestId('profile-header')).toBeInTheDocument();
    });

    it('should not show welcome message for existing user', () => {
      render(<ProfileView />);

      expect(screen.queryByTestId('profile-welcome-message')).not.toBeInTheDocument();
    });

    it('should render stats card', () => {
      render(<ProfileView />);

      expect(screen.getByTestId('profile-stats-card')).toBeInTheDocument();
      expect(screen.getByText('Twoje statystyki')).toBeInTheDocument();
    });

    it('should render generations counter with correct count', () => {
      render(<ProfileView />);

      expect(screen.getByTestId('generations-counter')).toBeInTheDocument();
      expect(screen.getByText('Remaining: 3')).toBeInTheDocument();
    });

    it('should render preferences card', () => {
      render(<ProfileView />);

      expect(screen.getByTestId('profile-preferences-card')).toBeInTheDocument();
      expect(screen.getByText('Preferencje podróżnicze')).toBeInTheDocument();
    });

    it('should render preferences form', () => {
      render(<ProfileView />);

      expect(screen.getByTestId('preferences-form')).toBeInTheDocument();
    });

    it('should render toaster wrapper', () => {
      render(<ProfileView />);

      expect(screen.getByTestId('toaster-wrapper')).toBeInTheDocument();
    });
  });

  describe('save functionality', () => {
    it('should call updateProfile when form is saved', async () => {
      const user = userEvent.setup();
      const mockUpdateProfile = vi.fn().mockResolvedValue(undefined);

      vi.mocked(useProfileModule.useProfile).mockReturnValue({
        ...mockUseProfile,
        updateProfile: mockUpdateProfile,
      });

      render(<ProfileView />);

      const saveButton = screen.getByText('Save');
      await user.click(saveButton);

      expect(mockUpdateProfile).toHaveBeenCalledWith({
        preferences: ['culture'],
        travel_pace: 'moderate',
      });
    });

    it('should show success toast when save succeeds', async () => {
      const user = userEvent.setup();
      const mockUpdateProfile = vi.fn().mockResolvedValue(undefined);

      vi.mocked(useProfileModule.useProfile).mockReturnValue({
        ...mockUseProfile,
        updateProfile: mockUpdateProfile,
      });

      render(<ProfileView />);

      const saveButton = screen.getByText('Save');
      await user.click(saveButton);

      await vi.waitFor(() => {
        expect(sonner.toast.success).toHaveBeenCalledWith('Profil został zaktualizowany');
      });
    });

    it('should show error toast when save fails', async () => {
      const user = userEvent.setup();
      const mockUpdateProfile = vi.fn().mockRejectedValue(new Error('Save failed'));

      vi.mocked(useProfileModule.useProfile).mockReturnValue({
        ...mockUseProfile,
        updateProfile: mockUpdateProfile,
      });

      render(<ProfileView />);

      const saveButton = screen.getByText('Save');
      await user.click(saveButton);

      await vi.waitFor(() => {
        expect(sonner.toast.error).toHaveBeenCalledWith('Save failed');
      });
    });

    it('should show generic error message when error is not an Error instance', async () => {
      const user = userEvent.setup();
      const mockUpdateProfile = vi.fn().mockRejectedValue('Generic error');

      vi.mocked(useProfileModule.useProfile).mockReturnValue({
        ...mockUseProfile,
        updateProfile: mockUpdateProfile,
      });

      render(<ProfileView />);

      const saveButton = screen.getByText('Save');
      await user.click(saveButton);

      await vi.waitFor(() => {
        expect(sonner.toast.error).toHaveBeenCalledWith('Nie udało się zapisać zmian');
      });
    });

    it('should pass isSaving state to form', () => {
      vi.mocked(useProfileModule.useProfile).mockReturnValue({
        ...mockUseProfile,
        isSaving: true,
      });

      render(<ProfileView />);

      expect(screen.getByText('Saving...')).toBeInTheDocument();
    });
  });

  describe('generations counter values', () => {
    it('should show correct generations count from profile', () => {
      vi.mocked(useProfileModule.useProfile).mockReturnValue({
        ...mockUseProfile,
        profile: { ...mockProfile, generations_remaining: 2 },
      });

      render(<ProfileView />);

      expect(screen.getByText('Remaining: 2')).toBeInTheDocument();
    });

    it('should handle zero generations remaining', () => {
      vi.mocked(useProfileModule.useProfile).mockReturnValue({
        ...mockUseProfile,
        profile: { ...mockProfile, generations_remaining: 0 },
      });

      render(<ProfileView />);

      expect(screen.getByText('Remaining: 0')).toBeInTheDocument();
    });
  });
});
