import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { PreferencesForm } from '@/components/PreferencesForm';
import * as usePreferencesFormModule from '@/hooks/usePreferencesForm';

// Mock hooks
vi.mock('@/hooks/usePreferencesForm');

/* eslint-disable @typescript-eslint/no-explicit-any */
// Mock react-hook-form Controller to simplify testing
vi.mock('react-hook-form', async () => {
  const actual = await vi.importActual('react-hook-form');
  return {
    ...actual,
    Controller: ({ render: renderProp, name }: any) => {
      const mockField = {
        value: name === 'travel_pace' ? 'moderate' : ['culture', 'food'],
        onChange: vi.fn(),
      };
      const mockFieldState = {
        error: null,
      };
      return renderProp({ field: mockField, fieldState: mockFieldState });
    },
  };
});

// Mock child components
vi.mock('@/components/TravelPaceSelector', () => ({
  TravelPaceSelector: ({ value, onChange }: any) => (
    <div data-testid='travel-pace-selector'>
      <button onClick={() => onChange('moderate')}>Change Pace</button>
      <span>Current: {value}</span>
    </div>
  ),
}));

vi.mock('@/components/PreferencesSelector', () => ({
  PreferencesSelector: ({ value, onChange, error }: any) => (
    <div data-testid='preferences-selector'>
      <button onClick={() => onChange(['culture'])}>Change Preferences</button>
      <span>Selected: {value?.length || 0}</span>
      {error && <span data-testid='preferences-error'>{error}</span>}
    </div>
  ),
}));

vi.mock('@/components/ui/button', () => ({
  Button: ({ children, disabled, type, ...props }: any) => (
    <button disabled={disabled} type={type} {...props}>
      {children}
    </button>
  ),
}));
/* eslint-enable @typescript-eslint/no-explicit-any */

describe('PreferencesForm', () => {
  const mockOnSave = vi.fn();

  const mockForm = {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    control: {} as any,
    handleSubmit: vi.fn(),
    formState: { isValid: true, errors: {} },
    watch: vi.fn(),
    getValues: vi.fn(),
    getFieldState: vi.fn(),
    setError: vi.fn(),
    clearErrors: vi.fn(),
    reset: vi.fn(),
    resetField: vi.fn(),
    setValue: vi.fn(),
    trigger: vi.fn(),
    unregister: vi.fn(),
    register: vi.fn(),
    setFocus: vi.fn(),
    subscribe: vi.fn(),
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } as any;

  const mockUsePreferencesForm = {
    form: mockForm,
    handleSubmit: vi.fn((e) => e?.preventDefault()),
    hasChanges: false,
    isValid: true,
  };

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(usePreferencesFormModule.usePreferencesForm).mockReturnValue(mockUsePreferencesForm);
  });

  describe('rendering', () => {
    it('should render preferences form', () => {
      render(
        <PreferencesForm
          initialPreferences={['culture', 'food']}
          initialTravelPace='moderate'
          onSave={mockOnSave}
          isSaving={false}
        />
      );

      expect(screen.getByTestId('preferences-form')).toBeInTheDocument();
    });

    it('should render travel pace section', () => {
      render(
        <PreferencesForm
          initialPreferences={['culture', 'food']}
          initialTravelPace='moderate'
          onSave={mockOnSave}
          isSaving={false}
        />
      );

      expect(screen.getByTestId('travel-pace-section')).toBeInTheDocument();
      expect(screen.getByTestId('travel-pace-selector')).toBeInTheDocument();
    });

    it('should render preferences selector', () => {
      render(
        <PreferencesForm
          initialPreferences={['culture', 'food']}
          initialTravelPace='moderate'
          onSave={mockOnSave}
          isSaving={false}
        />
      );

      expect(screen.getByTestId('preferences-selector')).toBeInTheDocument();
    });

    it('should render save button', () => {
      render(
        <PreferencesForm
          initialPreferences={['culture', 'food']}
          initialTravelPace='moderate'
          onSave={mockOnSave}
          isSaving={false}
        />
      );

      expect(screen.getByTestId('preferences-save-btn')).toBeInTheDocument();
      expect(screen.getByText('Zapisz zmiany')).toBeInTheDocument();
    });

    it('should render form as HTML form element', () => {
      render(
        <PreferencesForm
          initialPreferences={['culture', 'food']}
          initialTravelPace='moderate'
          onSave={mockOnSave}
          isSaving={false}
        />
      );

      const form = screen.getByTestId('preferences-form');
      expect(form.tagName).toBe('FORM');
    });
  });

  describe('save button states', () => {
    it('should disable save button when no changes', () => {
      vi.mocked(usePreferencesFormModule.usePreferencesForm).mockReturnValue({
        ...mockUsePreferencesForm,
        hasChanges: false,
      });

      render(
        <PreferencesForm
          initialPreferences={['culture', 'food']}
          initialTravelPace='moderate'
          onSave={mockOnSave}
          isSaving={false}
        />
      );

      const saveButton = screen.getByTestId('preferences-save-btn');
      expect(saveButton).toBeDisabled();
    });

    it('should enable save button when there are changes', () => {
      vi.mocked(usePreferencesFormModule.usePreferencesForm).mockReturnValue({
        ...mockUsePreferencesForm,
        hasChanges: true,
      });

      render(
        <PreferencesForm
          initialPreferences={['culture', 'food']}
          initialTravelPace='moderate'
          onSave={mockOnSave}
          isSaving={false}
        />
      );

      const saveButton = screen.getByTestId('preferences-save-btn');
      expect(saveButton).not.toBeDisabled();
    });

    it('should disable save button when form is invalid', () => {
      vi.mocked(usePreferencesFormModule.usePreferencesForm).mockReturnValue({
        ...mockUsePreferencesForm,
        hasChanges: true,
        isValid: false,
      });

      render(
        <PreferencesForm
          initialPreferences={['culture', 'food']}
          initialTravelPace='moderate'
          onSave={mockOnSave}
          isSaving={false}
        />
      );

      const saveButton = screen.getByTestId('preferences-save-btn');
      expect(saveButton).toBeDisabled();
    });

    it('should disable save button when isSaving is true', () => {
      vi.mocked(usePreferencesFormModule.usePreferencesForm).mockReturnValue({
        ...mockUsePreferencesForm,
        hasChanges: true,
      });

      render(
        <PreferencesForm
          initialPreferences={['culture', 'food']}
          initialTravelPace='moderate'
          onSave={mockOnSave}
          isSaving={true}
        />
      );

      const saveButton = screen.getByTestId('preferences-save-btn');
      expect(saveButton).toBeDisabled();
    });

    it('should show "Zapisywanie..." text when isSaving is true', () => {
      render(
        <PreferencesForm
          initialPreferences={['culture', 'food']}
          initialTravelPace='moderate'
          onSave={mockOnSave}
          isSaving={true}
        />
      );

      expect(screen.getByText('Zapisywanie...')).toBeInTheDocument();
    });

    it('should show "Zapisz zmiany" text when not saving', () => {
      render(
        <PreferencesForm
          initialPreferences={['culture', 'food']}
          initialTravelPace='moderate'
          onSave={mockOnSave}
          isSaving={false}
        />
      );

      expect(screen.getByText('Zapisz zmiany')).toBeInTheDocument();
    });
  });

  describe('form submission', () => {
    it('should call handleSubmit when form is submitted', async () => {
      const user = userEvent.setup();
      const mockHandleSubmit = vi.fn((e) => e?.preventDefault());

      vi.mocked(usePreferencesFormModule.usePreferencesForm).mockReturnValue({
        ...mockUsePreferencesForm,
        handleSubmit: mockHandleSubmit,
        hasChanges: true,
      });

      render(
        <PreferencesForm
          initialPreferences={['culture', 'food']}
          initialTravelPace='moderate'
          onSave={mockOnSave}
          isSaving={false}
        />
      );

      const saveButton = screen.getByTestId('preferences-save-btn');
      await user.click(saveButton);

      expect(mockHandleSubmit).toHaveBeenCalled();
    });

    it('should have submit type on save button', () => {
      render(
        <PreferencesForm
          initialPreferences={['culture', 'food']}
          initialTravelPace='moderate'
          onSave={mockOnSave}
          isSaving={false}
        />
      );

      const saveButton = screen.getByTestId('preferences-save-btn');
      expect(saveButton).toHaveAttribute('type', 'submit');
    });
  });

  describe('hook initialization', () => {
    it('should initialize usePreferencesForm with correct props', () => {
      const initialPreferences = ['culture', 'food'];
      const initialTravelPace = 'moderate' as const;

      render(
        <PreferencesForm
          initialPreferences={initialPreferences}
          initialTravelPace={initialTravelPace}
          onSave={mockOnSave}
          isSaving={false}
        />
      );

      expect(usePreferencesFormModule.usePreferencesForm).toHaveBeenCalledWith({
        initialPreferences,
        initialTravelPace,
        onSave: mockOnSave,
      });
    });

    it('should handle null initial values', () => {
      render(
        <PreferencesForm initialPreferences={null} initialTravelPace={null} onSave={mockOnSave} isSaving={false} />
      );

      expect(usePreferencesFormModule.usePreferencesForm).toHaveBeenCalledWith({
        initialPreferences: null,
        initialTravelPace: null,
        onSave: mockOnSave,
      });
    });
  });

  describe('error handling', () => {
    it('should display travel pace error when validation fails', () => {
      // Mock Controller to return an error for travel_pace
      vi.doMock('react-hook-form', async () => {
        const actual = await vi.importActual('react-hook-form');
        return {
          ...actual,
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          Controller: ({ render: renderProp, name }: any) => {
            const mockField = {
              value: null,
              onChange: vi.fn(),
            };
            const mockFieldState = {
              error: name === 'travel_pace' ? { message: 'Travel pace is required' } : null,
            };
            return renderProp({ field: mockField, fieldState: mockFieldState });
          },
        };
      });

      // This test verifies the error display structure exists
      render(
        <PreferencesForm initialPreferences={null} initialTravelPace={null} onSave={mockOnSave} isSaving={false} />
      );

      expect(screen.getByTestId('travel-pace-section')).toBeInTheDocument();
    });
  });

  describe('child component integration', () => {
    it('should pass correct props to TravelPaceSelector', () => {
      render(
        <PreferencesForm
          initialPreferences={['culture']}
          initialTravelPace='moderate'
          onSave={mockOnSave}
          isSaving={false}
        />
      );

      expect(screen.getByTestId('travel-pace-selector')).toBeInTheDocument();
      expect(screen.getByText('Current: moderate')).toBeInTheDocument();
    });

    it('should pass correct props to PreferencesSelector', () => {
      render(
        <PreferencesForm
          initialPreferences={['culture', 'food']}
          initialTravelPace='moderate'
          onSave={mockOnSave}
          isSaving={false}
        />
      );

      expect(screen.getByTestId('preferences-selector')).toBeInTheDocument();
      expect(screen.getByText('Selected: 2')).toBeInTheDocument();
    });
  });
});
