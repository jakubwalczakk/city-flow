import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ActivityForm } from '@/components/ActivityForm';
import * as useActivityFormModule from '@/hooks/useActivityForm';

vi.mock('@/hooks/useActivityForm');
vi.mock('@/components/ui/form', () => ({
  Form: ({ children }: { children: React.ReactNode }) => children,
  FormField: () => null,
}));
vi.mock('@/components/ui/form-fields', () => ({
  FormTextField: () => null,
  FormTextareaField: () => null,
  FormSelectField: () => null,
}));

describe('ActivityForm', () => {
  beforeEach(() => {
    vi.mocked(useActivityFormModule.useActivityForm).mockReturnValue({
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
      submitHandler: vi.fn(),
      isSubmitting: false,
    });
  });

  it('should render form', () => {
    render(<ActivityForm isOpen={true} onClose={vi.fn()} onSubmit={vi.fn()} initialData={undefined} mode='add' />);
    expect(screen.getByTestId('activity-form-modal')).toBeInTheDocument();
  });
});
