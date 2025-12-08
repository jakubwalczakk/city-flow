import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { OnboardingModal } from './OnboardingModal';
import * as useProfileHook from '@/hooks/useProfile';

// Mock sonner
vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

// Mock ResizeObserver
global.ResizeObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}));

// Mock pointer capture methods for Radix UI
window.HTMLElement.prototype.setPointerCapture = vi.fn();
window.HTMLElement.prototype.releasePointerCapture = vi.fn();
window.HTMLElement.prototype.hasPointerCapture = vi.fn();

describe('OnboardingModal', () => {
  const updateProfileMock = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should not render when profile is loading', () => {
    vi.spyOn(useProfileHook, 'useProfile').mockReturnValue({
      profile: null,
      isLoading: true,
      isSaving: false,
      error: null,
      updateProfile: updateProfileMock,
      refetch: vi.fn(),
    });

    render(<OnboardingModal />);
    expect(screen.queryByText('Witaj w CityFlow!')).not.toBeInTheDocument();
  });

  it('should not render when onboarding is already completed', () => {
    vi.spyOn(useProfileHook, 'useProfile').mockReturnValue({
      profile: {
        id: '1',
        preferences: [],
        travel_pace: null,
        generations_remaining: 5,
        onboarding_completed: true,
        updated_at: '2023-01-01',
      },
      isLoading: false,
      isSaving: false,
      error: null,
      updateProfile: updateProfileMock,
      refetch: vi.fn(),
    });

    render(<OnboardingModal />);
    expect(screen.queryByText('Witaj w CityFlow!')).not.toBeInTheDocument();
  });

  it('should render when onboarding is not completed', async () => {
    vi.spyOn(useProfileHook, 'useProfile').mockReturnValue({
      profile: {
        id: '1',
        preferences: [],
        travel_pace: null,
        generations_remaining: 5,
        onboarding_completed: false,
        updated_at: '2023-01-01',
      },
      isLoading: false,
      isSaving: false,
      error: null,
      updateProfile: updateProfileMock,
      refetch: vi.fn(),
    });

    render(<OnboardingModal />);
    expect(screen.getByText('Witaj w CityFlow!')).toBeInTheDocument();
    expect(screen.getByText(/Twoje konto darmowe pozwala na wygenerowanie/)).toBeInTheDocument();
  });

  it('should show validation error when trying to save without selecting pace', async () => {
    vi.spyOn(useProfileHook, 'useProfile').mockReturnValue({
      profile: {
        id: '1',
        preferences: [],
        travel_pace: null,
        generations_remaining: 5,
        onboarding_completed: false,
        updated_at: '2023-01-01',
      },
      isLoading: false,
      isSaving: false,
      error: null,
      updateProfile: updateProfileMock,
      refetch: vi.fn(),
    });

    render(<OnboardingModal />);

    // Click save
    const saveButton = screen.getByText('Zapisz i przejdź dalej');
    fireEvent.click(saveButton);

    expect(screen.getByText('Wybierz preferowane tempo zwiedzania.')).toBeInTheDocument();
    expect(updateProfileMock).not.toHaveBeenCalled();
  });

  it('should call updateProfile with skipped status when skip is clicked', async () => {
    vi.spyOn(useProfileHook, 'useProfile').mockReturnValue({
      profile: {
        id: '1',
        preferences: [],
        travel_pace: null,
        generations_remaining: 5,
        onboarding_completed: false,
        updated_at: '2023-01-01',
      },
      isLoading: false,
      isSaving: false,
      error: null,
      updateProfile: updateProfileMock,
      refetch: vi.fn(),
    });

    render(<OnboardingModal />);

    const skipButton = screen.getByText('Pomiń');
    fireEvent.click(skipButton);

    await waitFor(() => {
      expect(updateProfileMock).toHaveBeenCalledWith({
        onboarding_completed: true,
      });
    });
  });
});
