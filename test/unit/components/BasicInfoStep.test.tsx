import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { BasicInfoStep } from '@/components/BasicInfoStep';
import * as useBasicInfoStepModule from '@/hooks/useBasicInfoStep';

vi.mock('@/hooks/useBasicInfoStep');
vi.mock('@/components/ui/form', () => ({
  Form: ({ children }: { children: React.ReactNode }) => children,
  FormField: () => null,
}));
vi.mock('@/components/ui/form-fields', () => ({
  FormTextField: () => null,
  FormTextareaField: () => null,
  FormSelectField: () => null,
}));
vi.mock('@/components/ui/date-time-picker-field', () => ({
  DateTimePickerField: () => null,
}));

describe('BasicInfoStep', () => {
  beforeEach(() => {
    vi.mocked(useBasicInfoStepModule.useBasicInfoStep).mockReturnValue({
      form: {
        control: {},
        formState: {
          isDirty: false,
          dirtyFields: {},
          isSubmitted: false,
          isSubmitSuccessful: false,
          isSubmitting: false,
          isLoading: false,
          isValid: true,
          submitCount: 0,
          errors: {},
          touchedFields: {},
          validatingFields: {},
          isValidating: false,
        },
        handleSubmit: vi.fn((fn) => fn),
        reset: vi.fn(),
        watch: vi.fn(),
      },
      isStartOpen: false,
      setIsStartOpen: vi.fn(),
      isEndOpen: false,
      setIsEndOpen: vi.fn(),
      handleDateSelect: vi.fn(),
      handleTimeChange: vi.fn(),
      dateToTime: vi.fn(),
      handleNext: vi.fn(),
      handleSave: vi.fn(),
      syncToParent: vi.fn(),
    });
  });

  it('should render form fields', () => {
    const formData = { name: '', destination: '', start_date: '', end_date: '', notes: '' };
    render(
      <BasicInfoStep
        formData={formData}
        updateFormData={vi.fn()}
        goToNextStep={vi.fn()}
        onCancel={vi.fn()}
        isLoading={false}
        error={null}
        onSave={vi.fn()}
      />
    );
    // Component renders without crashing
    expect(screen.getByTestId('basic-info-next-button')).toBeInTheDocument();
  });
});
