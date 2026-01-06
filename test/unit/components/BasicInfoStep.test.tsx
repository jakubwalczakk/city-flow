import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { BasicInfoStep } from '@/components/BasicInfoStep';
import * as useBasicInfoStepModule from '@/hooks/useBasicInfoStep';
import type { UseFormReturn } from 'react-hook-form';
import type { BasicInfoFormData } from '@/lib/schemas/plan.schema';

vi.mock('@/hooks/useBasicInfoStep');

describe('BasicInfoStep', () => {
  const mockForm = {
    control: {
      _subjects: { values: { next: vi.fn() }, array: { next: vi.fn() }, state: { next: vi.fn() } },
      _names: { array: new Set(), mount: new Set(), unMount: new Set(), watch: new Set() },
      _formState: {
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
      },
    },
    handleSubmit: vi.fn((fn) => fn),
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
  } as unknown as UseFormReturn<BasicInfoFormData>;

  beforeEach(() => {
    vi.mocked(useBasicInfoStepModule.useBasicInfoStep).mockReturnValue({
      form: mockForm,
      isStartOpen: false,
      setIsStartOpen: vi.fn(),
      isEndOpen: false,
      setIsEndOpen: vi.fn(),
      handleDateSelect: vi.fn(),
      handleTimeChange: vi.fn(),
      dateToTime: vi.fn(),
      onSubmit: vi.fn(),
      isSubmitting: false,
      syncFormToParent: vi.fn(),
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
    expect(screen.getByText(/Podstawowe/i)).toBeInTheDocument();
  });
});
