import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ActivityForm } from '@/components/ActivityForm';
import * as useActivityFormModule from '@/hooks/useActivityForm';
import type { UseFormReturn } from 'react-hook-form';
import type { ActivityFormData } from '@/lib/schemas/activity.schema';

vi.mock('@/hooks/useActivityForm');

describe('ActivityForm', () => {
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
  } as unknown as UseFormReturn<ActivityFormData>;

  beforeEach(() => {
    vi.mocked(useActivityFormModule.useActivityForm).mockReturnValue({
      form: mockForm,
      onSubmit: vi.fn(),
      isSubmitting: false,
    });
  });

  it('should render form', () => {
    render(<ActivityForm dayNumber={1} onSubmit={vi.fn()} onCancel={vi.fn()} />);
    expect(screen.getByText(/aktywn/i)).toBeInTheDocument();
  });
});
