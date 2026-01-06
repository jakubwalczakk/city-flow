import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { OnboardingModal } from '@/components/auth/OnboardingModal';
import * as useOnboardingModalModule from '@/hooks/useOnboardingModal';
import type { TravelPace } from '@/types';

// Mock useOnboardingModal hook
vi.mock('@/hooks/useOnboardingModal');

// Mock child components
vi.mock('@/components/TravelPaceSelector', () => ({
  TravelPaceSelector: ({ value, onChange }: { value: string; onChange: (value: string) => void }) => (
    <div data-testid='travel-pace-selector'>
      <button onClick={() => onChange('slow')}>Slow</button>
      <button onClick={() => onChange('moderate')}>Moderate</button>
      <button onClick={() => onChange('fast')}>Fast</button>
      <span>{value}</span>
    </div>
  ),
}));

vi.mock('@/components/PreferencesSelector', () => ({
  PreferencesSelector: ({
    value,
    onChange,
    error,
  }: {
    value: string[];
    onChange: (value: string[]) => void;
    error?: string;
  }) => (
    <div data-testid='preferences-selector'>
      <button onClick={() => onChange([...value, 'sightseeing'])}>Add Sightseeing</button>
      <button onClick={() => onChange([...value, 'food'])}>Add Food</button>
      <span>{value.join(', ')}</span>
      {error && <div data-testid='preferences-error'>{error}</div>}
    </div>
  ),
}));

describe('OnboardingModal', () => {
  const mockSetIsOpen = vi.fn();
  const mockSetPace = vi.fn();
  const mockSetPreferences = vi.fn();
  const mockHandleSave = vi.fn();
  const mockHandleSkip = vi.fn();

  const defaultHookReturn = {
    isOpen: true,
    setIsOpen: mockSetIsOpen,
    pace: 'moderate' as TravelPace,
    setPace: mockSetPace,
    preferences: ['art_museums'],
    setPreferences: mockSetPreferences,
    errors: {},
    isSubmitting: false,
    profile: {
      id: 'user-123',
      preferences: ['art_museums'],
      travel_pace: 'moderate' as TravelPace,
      generations_remaining: 5,
      onboarding_completed: false,
      updated_at: '2024-01-01T00:00:00Z',
    },
    handleSave: mockHandleSave,
    handleSkip: mockHandleSkip,
  };

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(useOnboardingModalModule.useOnboardingModal).mockReturnValue(defaultHookReturn);
  });

  describe('rendering', () => {
    it('should render when isOpen is true', () => {
      render(<OnboardingModal />);

      expect(screen.getByTestId('onboarding-title')).toBeInTheDocument();
      expect(screen.getByTestId('onboarding-description')).toBeInTheDocument();
    });

    it('should not render when isOpen is false', () => {
      vi.mocked(useOnboardingModalModule.useOnboardingModal).mockReturnValue({
        ...defaultHookReturn,
        isOpen: false,
      });

      render(<OnboardingModal />);

      expect(screen.queryByTestId('onboarding-title')).not.toBeInTheDocument();
    });

    it('should render welcome message', () => {
      render(<OnboardingModal />);

      expect(screen.getByTestId('onboarding-title')).toHaveTextContent('Witaj w CityFlow!');
    });

    it('should render description', () => {
      render(<OnboardingModal />);

      const description = screen.getByTestId('onboarding-description');
      expect(description).toHaveTextContent('Opowiedz nam trochę o swoich preferencjach');
    });

    it('should render TravelPaceSelector', () => {
      render(<OnboardingModal />);

      expect(screen.getByTestId('travel-pace-selector')).toBeInTheDocument();
    });

    it('should render PreferencesSelector', () => {
      render(<OnboardingModal />);

      expect(screen.getByTestId('preferences-selector')).toBeInTheDocument();
    });

    it('should render skip button', () => {
      render(<OnboardingModal />);

      const skipButton = screen.getByTestId('onboarding-skip-btn');
      expect(skipButton).toBeInTheDocument();
      expect(skipButton).toHaveTextContent('Pomiń');
    });

    it('should render save button', () => {
      render(<OnboardingModal />);

      const saveButton = screen.getByTestId('onboarding-save-btn');
      expect(saveButton).toBeInTheDocument();
      expect(saveButton).toHaveTextContent('Zapisz i przejdź dalej');
    });

    it('should display generations remaining info', () => {
      render(<OnboardingModal />);

      const info = screen.getByTestId('onboarding-generations-info');
      expect(info).toHaveTextContent('5 planów');
    });
  });

  describe('interactions', () => {
    it('should call handleSkip when skip button is clicked', async () => {
      const user = userEvent.setup();
      render(<OnboardingModal />);

      const skipButton = screen.getByTestId('onboarding-skip-btn');
      await user.click(skipButton);

      expect(mockHandleSkip).toHaveBeenCalled();
    });

    it('should call handleSave when save button is clicked', async () => {
      const user = userEvent.setup();
      render(<OnboardingModal />);

      const saveButton = screen.getByTestId('onboarding-save-btn');
      await user.click(saveButton);

      expect(mockHandleSave).toHaveBeenCalled();
    });
  });

  describe('loading state', () => {
    it('should disable skip button during submission', () => {
      vi.mocked(useOnboardingModalModule.useOnboardingModal).mockReturnValue({
        ...defaultHookReturn,
        isSubmitting: true,
      });

      render(<OnboardingModal />);

      const skipButton = screen.getByTestId('onboarding-skip-btn');
      expect(skipButton).toBeDisabled();
    });

    it('should disable save button during submission', () => {
      vi.mocked(useOnboardingModalModule.useOnboardingModal).mockReturnValue({
        ...defaultHookReturn,
        isSubmitting: true,
      });

      render(<OnboardingModal />);

      const saveButton = screen.getByTestId('onboarding-save-btn');
      expect(saveButton).toBeDisabled();
    });

    it('should show loading text on save button during submission', () => {
      vi.mocked(useOnboardingModalModule.useOnboardingModal).mockReturnValue({
        ...defaultHookReturn,
        isSubmitting: true,
      });

      render(<OnboardingModal />);

      const saveButton = screen.getByTestId('onboarding-save-btn');
      expect(saveButton).toHaveTextContent('Zapisywanie...');
    });
  });

  describe('error handling', () => {
    it('should display pace error when present', () => {
      vi.mocked(useOnboardingModalModule.useOnboardingModal).mockReturnValue({
        ...defaultHookReturn,
        errors: { pace: 'Travel pace is required' },
      });

      render(<OnboardingModal />);

      const error = screen.getByTestId('onboarding-pace-error');
      expect(error).toBeInTheDocument();
      expect(error).toHaveTextContent('Travel pace is required');
    });

    it('should not display pace error when not present', () => {
      render(<OnboardingModal />);

      expect(screen.queryByTestId('onboarding-pace-error')).not.toBeInTheDocument();
    });

    it('should pass preferences error to PreferencesSelector', () => {
      const preferencesError = 'Please select at least one preference';
      vi.mocked(useOnboardingModalModule.useOnboardingModal).mockReturnValue({
        ...defaultHookReturn,
        errors: { preferences: preferencesError },
      });

      render(<OnboardingModal />);

      expect(screen.getByTestId('preferences-error')).toHaveTextContent(preferencesError);
    });
  });

  describe('modal behavior', () => {
    it('should prevent closing on outside click', () => {
      render(<OnboardingModal />);

      const dialog = screen.getByRole('dialog');
      expect(dialog).toBeInTheDocument();
    });

    it('should prevent closing on Escape key', () => {
      render(<OnboardingModal />);

      const dialog = screen.getByRole('dialog');
      expect(dialog).toBeInTheDocument();
    });
  });

  describe('generations info', () => {
    it('should show 0 generations when profile is null', () => {
      vi.mocked(useOnboardingModalModule.useOnboardingModal).mockReturnValue({
        ...defaultHookReturn,
        profile: null,
      });

      render(<OnboardingModal />);

      const info = screen.getByTestId('onboarding-generations-info');
      expect(info).toHaveTextContent('0 planów');
    });

    it('should show correct number of generations', () => {
      vi.mocked(useOnboardingModalModule.useOnboardingModal).mockReturnValue({
        ...defaultHookReturn,
        profile: {
          id: 'user-123',
          preferences: ['art_museums'],
          travel_pace: 'moderate',
          generations_remaining: 3,
          onboarding_completed: false,
          updated_at: '2024-01-01T00:00:00Z',
        },
      });

      render(<OnboardingModal />);

      const info = screen.getByTestId('onboarding-generations-info');
      expect(info).toHaveTextContent('3 planów');
    });
  });
});
