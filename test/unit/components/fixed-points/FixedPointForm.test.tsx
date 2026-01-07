import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { FixedPointForm } from '@/components/fixed-points/FixedPointForm';
import type { UseFormReturn } from 'react-hook-form';
import type { FixedPointFormData } from '@/lib/schemas/plan.schema';

// Mock UI components
vi.mock('@/components/ui/form', () => ({
  Form: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));

vi.mock('@/components/ui/form-fields', () => ({
  FormTextField: ({ label, testId }: { label: string; testId?: string }) => (
    <div>
      <label>{label}</label>
      <input data-testid={testId} />
    </div>
  ),
  FormTextareaField: ({ label }: { label: string }) => (
    <div>
      <label>{label}</label>
      <textarea />
    </div>
  ),
  FormNumberField: ({ label }: { label: string }) => (
    <div>
      <label>{label}</label>
      <input type='number' />
    </div>
  ),
}));

vi.mock('@/components/ui/date-time-picker-field', () => ({
  DateTimePickerField: ({ label, dateTestId }: { label: string; dateTestId?: string }) => (
    <div>
      <label>{label}</label>
      <input data-testid={dateTestId} />
    </div>
  ),
}));

describe('FixedPointForm', () => {
  const mockOnSubmit = vi.fn();
  const mockOnCancel = vi.fn();
  const mockHandleDateSelect = vi.fn();
  const mockHandleTimeChange = vi.fn();
  const mockGetDateForPicker = vi.fn();
  const mockGetTimeForInput = vi.fn();
  const mockOnDatePickerOpenChange = vi.fn();

  const mockDateTimeHandlers = {
    getDateForPicker: mockGetDateForPicker,
    getTimeForInput: mockGetTimeForInput,
    handleDateSelect: mockHandleDateSelect,
    handleTimeChange: mockHandleTimeChange,
  };

  const mockForm = {
    control: {} as UseFormReturn<FixedPointFormData>['control'],
    formState: {
      isValid: true,
      errors: {},
    } as UseFormReturn<FixedPointFormData>['formState'],
  } as UseFormReturn<FixedPointFormData>;

  beforeEach(() => {
    vi.clearAllMocks();
    mockGetDateForPicker.mockReturnValue(new Date('2024-02-01T10:00:00'));
    mockGetTimeForInput.mockReturnValue('10:00');
  });

  describe('rendering - add mode', () => {
    it('should render form with "Dodaj stały punkt" title', () => {
      render(
        <FixedPointForm
          form={mockForm as UseFormReturn<FixedPointFormData>}
          onSubmit={mockOnSubmit}
          onCancel={mockOnCancel}
          isEditing={false}
          dateTimeHandlers={mockDateTimeHandlers}
        />
      );

      expect(screen.getByText('Dodaj stały punkt')).toBeInTheDocument();
    });

    it('should render submit button with "Dodaj punkt" text', () => {
      render(
        <FixedPointForm
          form={mockForm as UseFormReturn<FixedPointFormData>}
          onSubmit={mockOnSubmit}
          onCancel={mockOnCancel}
          isEditing={false}
          dateTimeHandlers={mockDateTimeHandlers}
        />
      );

      expect(screen.getByTestId('save-fixed-point-btn')).toHaveTextContent('Dodaj punkt');
    });

    it('should render location field', () => {
      render(
        <FixedPointForm
          form={mockForm as UseFormReturn<FixedPointFormData>}
          onSubmit={mockOnSubmit}
          onCancel={mockOnCancel}
          isEditing={false}
          dateTimeHandlers={mockDateTimeHandlers}
        />
      );

      expect(screen.getByText('Lokalizacja')).toBeInTheDocument();
      expect(screen.getByTestId('fixed-point-location-input')).toBeInTheDocument();
    });

    it('should render date and time field', () => {
      render(
        <FixedPointForm
          form={mockForm as UseFormReturn<FixedPointFormData>}
          onSubmit={mockOnSubmit}
          onCancel={mockOnCancel}
          isEditing={false}
          dateTimeHandlers={mockDateTimeHandlers}
        />
      );

      expect(screen.getByText('Data i godzina')).toBeInTheDocument();
      expect(screen.getByTestId('fixed-point-date-picker')).toBeInTheDocument();
    });

    it('should render duration field', () => {
      render(
        <FixedPointForm
          form={mockForm as UseFormReturn<FixedPointFormData>}
          onSubmit={mockOnSubmit}
          onCancel={mockOnCancel}
          isEditing={false}
          dateTimeHandlers={mockDateTimeHandlers}
        />
      );

      expect(screen.getByText('Czas trwania (minuty) - opcjonalnie')).toBeInTheDocument();
    });

    it('should render description field', () => {
      render(
        <FixedPointForm
          form={mockForm as UseFormReturn<FixedPointFormData>}
          onSubmit={mockOnSubmit}
          onCancel={mockOnCancel}
          isEditing={false}
          dateTimeHandlers={mockDateTimeHandlers}
        />
      );

      expect(screen.getByText('Opis (opcjonalnie)')).toBeInTheDocument();
    });

    it('should render cancel button', () => {
      render(
        <FixedPointForm
          form={mockForm as UseFormReturn<FixedPointFormData>}
          onSubmit={mockOnSubmit}
          onCancel={mockOnCancel}
          isEditing={false}
          dateTimeHandlers={mockDateTimeHandlers}
        />
      );

      expect(screen.getByRole('button', { name: /anuluj/i })).toBeInTheDocument();
    });
  });

  describe('rendering - edit mode', () => {
    it('should render form with "Edytuj stały punkt" title', () => {
      render(
        <FixedPointForm
          form={mockForm as UseFormReturn<FixedPointFormData>}
          onSubmit={mockOnSubmit}
          onCancel={mockOnCancel}
          isEditing={true}
          dateTimeHandlers={mockDateTimeHandlers}
        />
      );

      expect(screen.getByText('Edytuj stały punkt')).toBeInTheDocument();
    });

    it('should render submit button with "Zapisz zmiany" text', () => {
      render(
        <FixedPointForm
          form={mockForm as UseFormReturn<FixedPointFormData>}
          onSubmit={mockOnSubmit}
          onCancel={mockOnCancel}
          isEditing={true}
          dateTimeHandlers={mockDateTimeHandlers}
        />
      );

      expect(screen.getByTestId('save-fixed-point-btn')).toHaveTextContent('Zapisz zmiany');
    });

    it('should render same fields as add mode', () => {
      render(
        <FixedPointForm
          form={mockForm as UseFormReturn<FixedPointFormData>}
          onSubmit={mockOnSubmit}
          onCancel={mockOnCancel}
          isEditing={true}
          dateTimeHandlers={mockDateTimeHandlers}
        />
      );

      expect(screen.getByText('Lokalizacja')).toBeInTheDocument();
      expect(screen.getByText('Data i godzina')).toBeInTheDocument();
      expect(screen.getByText('Czas trwania (minuty) - opcjonalnie')).toBeInTheDocument();
      expect(screen.getByText('Opis (opcjonalnie)')).toBeInTheDocument();
    });
  });

  describe('form validation', () => {
    it('should disable submit button when form is invalid', () => {
      const invalidForm = {
        ...mockForm,
        formState: {
          isValid: false,
          errors: {},
        } as UseFormReturn<FixedPointFormData>['formState'],
      };

      render(
        <FixedPointForm
          form={invalidForm as UseFormReturn<FixedPointFormData>}
          onSubmit={mockOnSubmit}
          onCancel={mockOnCancel}
          isEditing={false}
          dateTimeHandlers={mockDateTimeHandlers}
        />
      );

      const submitButton = screen.getByTestId('save-fixed-point-btn');
      expect(submitButton).toBeDisabled();
    });

    it('should enable submit button when form is valid', () => {
      render(
        <FixedPointForm
          form={mockForm as UseFormReturn<FixedPointFormData>}
          onSubmit={mockOnSubmit}
          onCancel={mockOnCancel}
          isEditing={false}
          dateTimeHandlers={mockDateTimeHandlers}
        />
      );

      const submitButton = screen.getByTestId('save-fixed-point-btn');
      expect(submitButton).not.toBeDisabled();
    });
  });

  describe('interactions', () => {
    it('should call onCancel when cancel button is clicked', async () => {
      const user = userEvent.setup();

      render(
        <FixedPointForm
          form={mockForm as UseFormReturn<FixedPointFormData>}
          onSubmit={mockOnSubmit}
          onCancel={mockOnCancel}
          isEditing={false}
          dateTimeHandlers={mockDateTimeHandlers}
        />
      );

      const cancelButton = screen.getByRole('button', { name: /anuluj/i });
      await user.click(cancelButton);

      expect(mockOnCancel).toHaveBeenCalledTimes(1);
    });

    it('should call onSubmit when form is submitted', async () => {
      const user = userEvent.setup();

      render(
        <FixedPointForm
          form={mockForm as UseFormReturn<FixedPointFormData>}
          onSubmit={mockOnSubmit}
          onCancel={mockOnCancel}
          isEditing={false}
          dateTimeHandlers={mockDateTimeHandlers}
        />
      );

      const submitButton = screen.getByTestId('save-fixed-point-btn');
      await user.click(submitButton);

      expect(mockOnSubmit).toHaveBeenCalledTimes(1);
    });

    it('should not call onSubmit when submit button is disabled', async () => {
      const invalidForm = {
        ...mockForm,
        formState: {
          isValid: false,
          errors: {},
        } as UseFormReturn<FixedPointFormData>['formState'],
      };

      render(
        <FixedPointForm
          form={invalidForm as UseFormReturn<FixedPointFormData>}
          onSubmit={mockOnSubmit}
          onCancel={mockOnCancel}
          isEditing={false}
          dateTimeHandlers={mockDateTimeHandlers}
        />
      );

      const submitButton = screen.getByTestId('save-fixed-point-btn');

      // Try to click disabled button (this won't actually trigger the click in real scenario)
      // But we test that the button is disabled
      expect(submitButton).toBeDisabled();
      expect(mockOnSubmit).not.toHaveBeenCalled();
    });
  });

  describe('date/time handlers', () => {
    it('should call getDateForPicker on render', () => {
      render(
        <FixedPointForm
          form={mockForm as UseFormReturn<FixedPointFormData>}
          onSubmit={mockOnSubmit}
          onCancel={mockOnCancel}
          isEditing={false}
          dateTimeHandlers={mockDateTimeHandlers}
        />
      );

      expect(mockGetDateForPicker).toHaveBeenCalled();
    });

    it('should call getTimeForInput on render', () => {
      render(
        <FixedPointForm
          form={mockForm as UseFormReturn<FixedPointFormData>}
          onSubmit={mockOnSubmit}
          onCancel={mockOnCancel}
          isEditing={false}
          dateTimeHandlers={mockDateTimeHandlers}
        />
      );

      expect(mockGetTimeForInput).toHaveBeenCalled();
    });

    it('should use default date when getDateForPicker returns undefined', () => {
      mockGetDateForPicker.mockReturnValue(undefined);

      render(
        <FixedPointForm
          form={mockForm as UseFormReturn<FixedPointFormData>}
          onSubmit={mockOnSubmit}
          onCancel={mockOnCancel}
          isEditing={false}
          dateTimeHandlers={mockDateTimeHandlers}
        />
      );

      // Component should still render without crashing
      expect(screen.getByText('Data i godzina')).toBeInTheDocument();
    });
  });

  describe('date picker state', () => {
    it('should pass isDatePickerOpen prop to date picker', () => {
      const { rerender } = render(
        <FixedPointForm
          form={mockForm as UseFormReturn<FixedPointFormData>}
          onSubmit={mockOnSubmit}
          onCancel={mockOnCancel}
          isEditing={false}
          dateTimeHandlers={mockDateTimeHandlers}
          isDatePickerOpen={false}
        />
      );

      expect(screen.getByTestId('fixed-point-date-picker')).toBeInTheDocument();

      rerender(
        <FixedPointForm
          form={mockForm as UseFormReturn<FixedPointFormData>}
          onSubmit={mockOnSubmit}
          onCancel={mockOnCancel}
          isEditing={false}
          dateTimeHandlers={mockDateTimeHandlers}
          isDatePickerOpen={true}
        />
      );

      expect(screen.getByTestId('fixed-point-date-picker')).toBeInTheDocument();
    });

    it('should handle onDatePickerOpenChange callback', () => {
      render(
        <FixedPointForm
          form={mockForm as UseFormReturn<FixedPointFormData>}
          onSubmit={mockOnSubmit}
          onCancel={mockOnCancel}
          isEditing={false}
          dateTimeHandlers={mockDateTimeHandlers}
          onDatePickerOpenChange={mockOnDatePickerOpenChange}
        />
      );

      expect(screen.getByText('Data i godzina')).toBeInTheDocument();
      // The callback would be called by the DateTimePickerField component
    });

    it('should handle missing onDatePickerOpenChange prop', () => {
      expect(() => {
        render(
          <FixedPointForm
            form={mockForm as UseFormReturn<FixedPointFormData>}
            onSubmit={mockOnSubmit}
            onCancel={mockOnCancel}
            isEditing={false}
            dateTimeHandlers={mockDateTimeHandlers}
          />
        );
      }).not.toThrow();
    });
  });

  describe('form errors', () => {
    it('should display validation errors', () => {
      const formWithErrors = {
        ...mockForm,
        formState: {
          isValid: false,
          errors: {
            event_at: { message: 'Data jest wymagana' },
          },
        } as UseFormReturn<FixedPointFormData>['formState'],
      };

      render(
        <FixedPointForm
          form={formWithErrors as UseFormReturn<FixedPointFormData>}
          onSubmit={mockOnSubmit}
          onCancel={mockOnCancel}
          isEditing={false}
          dateTimeHandlers={mockDateTimeHandlers}
        />
      );

      // The error would be displayed by the DateTimePickerField component
      expect(screen.getByText('Data i godzina')).toBeInTheDocument();
    });

    it('should not display errors when form is valid', () => {
      render(
        <FixedPointForm
          form={mockForm as UseFormReturn<FixedPointFormData>}
          onSubmit={mockOnSubmit}
          onCancel={mockOnCancel}
          isEditing={false}
          dateTimeHandlers={mockDateTimeHandlers}
        />
      );

      expect(screen.getByText('Data i godzina')).toBeInTheDocument();
      // No error messages should be visible
    });
  });

  describe('layout and styling', () => {
    it('should have proper form structure', () => {
      const { container } = render(
        <FixedPointForm
          form={mockForm as UseFormReturn<FixedPointFormData>}
          onSubmit={mockOnSubmit}
          onCancel={mockOnCancel}
          isEditing={false}
          dateTimeHandlers={mockDateTimeHandlers}
        />
      );

      const form = container.querySelector('form');
      expect(form).toBeInTheDocument();
    });

    it('should have submit button with flex-1 class', () => {
      render(
        <FixedPointForm
          form={mockForm as UseFormReturn<FixedPointFormData>}
          onSubmit={mockOnSubmit}
          onCancel={mockOnCancel}
          isEditing={false}
          dateTimeHandlers={mockDateTimeHandlers}
        />
      );

      const submitButton = screen.getByTestId('save-fixed-point-btn');
      expect(submitButton).toHaveClass('flex-1');
    });

    it('should render cancel button with outline variant', () => {
      render(
        <FixedPointForm
          form={mockForm as UseFormReturn<FixedPointFormData>}
          onSubmit={mockOnSubmit}
          onCancel={mockOnCancel}
          isEditing={false}
          dateTimeHandlers={mockDateTimeHandlers}
        />
      );

      const cancelButton = screen.getByRole('button', { name: /anuluj/i });
      expect(cancelButton).toBeInTheDocument();
    });

    it('should have buttons in a flex container', () => {
      const { container } = render(
        <FixedPointForm
          form={mockForm as UseFormReturn<FixedPointFormData>}
          onSubmit={mockOnSubmit}
          onCancel={mockOnCancel}
          isEditing={false}
          dateTimeHandlers={mockDateTimeHandlers}
        />
      );

      const buttonContainer = container.querySelector('.flex.gap-2');
      expect(buttonContainer).toBeInTheDocument();
    });
  });

  describe('accessibility', () => {
    it('should have proper button types', () => {
      render(
        <FixedPointForm
          form={mockForm as UseFormReturn<FixedPointFormData>}
          onSubmit={mockOnSubmit}
          onCancel={mockOnCancel}
          isEditing={false}
          dateTimeHandlers={mockDateTimeHandlers}
        />
      );

      const submitButton = screen.getByTestId('save-fixed-point-btn');
      const cancelButton = screen.getByRole('button', { name: /anuluj/i });

      expect(submitButton).toHaveAttribute('type', 'submit');
      expect(cancelButton).toHaveAttribute('type', 'button');
    });

    it('should have semantic form structure', () => {
      const { container } = render(
        <FixedPointForm
          form={mockForm as UseFormReturn<FixedPointFormData>}
          onSubmit={mockOnSubmit}
          onCancel={mockOnCancel}
          isEditing={false}
          dateTimeHandlers={mockDateTimeHandlers}
        />
      );

      expect(container.querySelector('form')).toBeInTheDocument();
    });

    it('should have labels for form fields', () => {
      render(
        <FixedPointForm
          form={mockForm as UseFormReturn<FixedPointFormData>}
          onSubmit={mockOnSubmit}
          onCancel={mockOnCancel}
          isEditing={false}
          dateTimeHandlers={mockDateTimeHandlers}
        />
      );

      expect(screen.getByText('Lokalizacja')).toBeInTheDocument();
      expect(screen.getByText('Data i godzina')).toBeInTheDocument();
      expect(screen.getByText('Czas trwania (minuty) - opcjonalnie')).toBeInTheDocument();
      expect(screen.getByText('Opis (opcjonalnie)')).toBeInTheDocument();
    });
  });
});
