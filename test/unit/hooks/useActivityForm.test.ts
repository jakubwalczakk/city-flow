import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useActivityForm } from '@/hooks/useActivityForm';
import { convertTo24Hour } from '@/lib/utils/timeFormatters';
import type { TimelineItem } from '@/types';

// Mock time formatters
vi.mock('@/lib/utils/timeFormatters', () => ({
  convertTo24Hour: vi.fn((time: string) => {
    if (time.includes('PM')) {
      const hour = parseInt(time.split(':')[0]);
      const minutes = time.split(':')[1]?.split(' ')[0] || '00';
      const newHour = hour === 12 ? 12 : hour + 12;
      return `${newHour}:${minutes}`;
    }
    if (time.includes('AM')) {
      const hour = parseInt(time.split(':')[0]);
      const minutes = time.split(':')[1]?.split(' ')[0] || '00';
      const newHour = hour === 12 ? 0 : hour;
      return `${String(newHour).padStart(2, '0')}:${minutes}`;
    }
    return time;
  }),
}));

describe('useActivityForm', () => {
  let onSubmit: ReturnType<typeof vi.fn>;
  let onClose: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    onSubmit = vi.fn().mockResolvedValue(undefined);
    onClose = vi.fn();
    vi.clearAllMocks();
  });

  describe('initialization', () => {
    it('should initialize form with default values when no initialData', () => {
      const { result } = renderHook(() =>
        useActivityForm({
          isOpen: true,
          onSubmit,
          onClose,
        })
      );

      const formValues = result.current.form.getValues();
      expect(formValues.title).toBe('');
      expect(formValues.time).toBe('');
      expect(formValues.category).toBe('other');
      expect(formValues.location).toBe('');
      expect(formValues.description).toBe('');
      expect(formValues.estimated_price).toBe('');
      expect(formValues.estimated_duration).toBe('');
    });

    it('should provide isSubmitting state', () => {
      const { result } = renderHook(() =>
        useActivityForm({
          isOpen: true,
          onSubmit,
          onClose,
        })
      );

      expect(result.current.isSubmitting).toBe(false);
    });

    it('should provide submitHandler', () => {
      const { result } = renderHook(() =>
        useActivityForm({
          isOpen: true,
          onSubmit,
          onClose,
        })
      );

      expect(result.current.submitHandler).toBeInstanceOf(Function);
    });
  });

  describe('form reset on open', () => {
    it('should reset form with initial data when dialog opens', () => {
      const initialData: Partial<TimelineItem> = {
        title: 'Visit Museum',
        time: '10:00',
        category: 'culture',
        location: 'Museum Street',
        description: 'Explore ancient artifacts',
        estimated_price: '25',
        estimated_duration: '120 min',
      };

      const { result } = renderHook(() =>
        useActivityForm({
          isOpen: true,
          initialData,
          onSubmit,
          onClose,
        })
      );

      const formValues = result.current.form.getValues();
      expect(formValues.title).toBe('Visit Museum');
      expect(formValues.time).toBe('10:00');
      expect(formValues.category).toBe('culture');
      expect(formValues.location).toBe('Museum Street');
      expect(formValues.description).toBe('Explore ancient artifacts');
      expect(formValues.estimated_price).toBe('25');
      expect(formValues.estimated_duration).toBe('120'); // Parsed from "120 min"
    });

    it('should not reset form when dialog is closed', () => {
      const { result, rerender } = renderHook(
        (props: Parameters<typeof useActivityForm>[0]) => useActivityForm(props),
        {
          initialProps: {
            isOpen: false,
            initialData: undefined as Parameters<typeof useActivityForm>[0]['initialData'],
            onSubmit,
            onClose,
          },
        }
      );

      // Set some values
      act(() => {
        result.current.form.setValue('title', 'My Activity');
      });

      expect(result.current.form.getValues().title).toBe('My Activity');

      // Rerender with isOpen still false
      rerender({
        isOpen: false,
        initialData: { title: 'Different Activity' },
        onSubmit,
        onClose,
      });

      // Should not reset
      expect(result.current.form.getValues().title).toBe('My Activity');
    });

    it('should reset to defaults when opening without initial data', () => {
      const { result, rerender } = renderHook(
        (props: Parameters<typeof useActivityForm>[0]) => useActivityForm(props),
        {
          initialProps: {
            isOpen: false,
            onSubmit,
            onClose,
          },
        }
      );

      // Set some values
      act(() => {
        result.current.form.setValue('title', 'My Activity');
        result.current.form.setValue('category', 'food');
      });

      // Open dialog without initial data
      rerender({
        isOpen: true,
        onSubmit,
        onClose,
      });

      const formValues = result.current.form.getValues();
      expect(formValues.title).toBe('');
      expect(formValues.category).toBe('other'); // Back to default
    });
  });

  describe('time format conversion', () => {
    it('should convert 12-hour PM time to 24-hour format', () => {
      const initialData: Partial<TimelineItem> = {
        title: 'Lunch',
        time: '2:30 PM',
      };

      const { result } = renderHook(() =>
        useActivityForm({
          isOpen: true,
          initialData,
          onSubmit,
          onClose,
        })
      );

      expect(convertTo24Hour).toHaveBeenCalledWith('2:30 PM');
      expect(result.current.form.getValues().time).toBe('14:30');
    });

    it('should convert 12-hour AM time to 24-hour format', () => {
      const initialData: Partial<TimelineItem> = {
        title: 'Breakfast',
        time: '9:00 AM',
      };

      const { result } = renderHook(() =>
        useActivityForm({
          isOpen: true,
          initialData,
          onSubmit,
          onClose,
        })
      );

      expect(convertTo24Hour).toHaveBeenCalledWith('9:00 AM');
      expect(result.current.form.getValues().time).toBe('09:00');
    });

    it('should not convert time already in 24-hour format', () => {
      const initialData: Partial<TimelineItem> = {
        title: 'Lunch',
        time: '14:30',
      };

      const { result } = renderHook(() =>
        useActivityForm({
          isOpen: true,
          initialData,
          onSubmit,
          onClose,
        })
      );

      expect(result.current.form.getValues().time).toBe('14:30');
    });

    it('should handle empty time', () => {
      const initialData: Partial<TimelineItem> = {
        title: 'Activity',
        time: '',
      };

      const { result } = renderHook(() =>
        useActivityForm({
          isOpen: true,
          initialData,
          onSubmit,
          onClose,
        })
      );

      expect(result.current.form.getValues().time).toBe('');
    });
  });

  describe('duration parsing', () => {
    it('should parse duration with "min" suffix', () => {
      const initialData: Partial<TimelineItem> = {
        title: 'Activity',
        estimated_duration: '90 min',
      };

      const { result } = renderHook(() =>
        useActivityForm({
          isOpen: true,
          initialData,
          onSubmit,
          onClose,
        })
      );

      expect(result.current.form.getValues().estimated_duration).toBe('90');
    });

    it('should parse duration with mixed text', () => {
      const initialData: Partial<TimelineItem> = {
        title: 'Activity',
        estimated_duration: '2 hours',
      };

      const { result } = renderHook(() =>
        useActivityForm({
          isOpen: true,
          initialData,
          onSubmit,
          onClose,
        })
      );

      expect(result.current.form.getValues().estimated_duration).toBe('2');
    });

    it('should handle duration without suffix', () => {
      const initialData: Partial<TimelineItem> = {
        title: 'Activity',
        estimated_duration: '60',
      };

      const { result } = renderHook(() =>
        useActivityForm({
          isOpen: true,
          initialData,
          onSubmit,
          onClose,
        })
      );

      expect(result.current.form.getValues().estimated_duration).toBe('60');
    });

    it('should handle empty duration', () => {
      const initialData: Partial<TimelineItem> = {
        title: 'Activity',
        estimated_duration: '',
      };

      const { result } = renderHook(() =>
        useActivityForm({
          isOpen: true,
          initialData,
          onSubmit,
          onClose,
        })
      );

      expect(result.current.form.getValues().estimated_duration).toBe('');
    });
  });

  describe('form submission', () => {
    it('should submit form with transformed data', async () => {
      const { result } = renderHook(() =>
        useActivityForm({
          isOpen: true,
          onSubmit,
          onClose,
        })
      );

      act(() => {
        result.current.form.setValue('title', 'New Activity');
        result.current.form.setValue('time', '14:30');
        result.current.form.setValue('category', 'food');
        result.current.form.setValue('location', 'Restaurant');
        result.current.form.setValue('description', 'Lunch');
        result.current.form.setValue('estimated_price', '30');
        result.current.form.setValue('estimated_duration', '60');
      });

      await act(async () => {
        await result.current.submitHandler();
      });

      expect(onSubmit).toHaveBeenCalledWith({
        title: 'New Activity',
        time: '14:30',
        category: 'food',
        location: 'Restaurant',
        description: 'Lunch',
        estimated_price: '30',
        estimated_duration: '60 min', // Transformed
        duration: 60, // Parsed as number
      });
      expect(onClose).toHaveBeenCalled();
    });

    it('should handle optional fields correctly', async () => {
      const { result } = renderHook(() =>
        useActivityForm({
          isOpen: true,
          onSubmit,
          onClose,
        })
      );

      act(() => {
        result.current.form.setValue('title', 'Minimal Activity');
        result.current.form.setValue('category', 'other');
        // Leave optional fields empty
      });

      await act(async () => {
        await result.current.submitHandler();
      });

      expect(onSubmit).toHaveBeenCalledWith({
        title: 'Minimal Activity',
        time: undefined,
        category: 'other',
        location: undefined,
        description: undefined,
        estimated_price: undefined,
        estimated_duration: undefined,
        duration: undefined,
      });
      expect(onClose).toHaveBeenCalled();
    });

    it('should not call onClose if submission fails', async () => {
      onSubmit.mockRejectedValueOnce(new Error('Submission failed'));

      const { result } = renderHook(() =>
        useActivityForm({
          isOpen: true,
          onSubmit,
          onClose,
        })
      );

      act(() => {
        result.current.form.setValue('title', 'Activity');
        result.current.form.setValue('category', 'other');
      });

      await act(async () => {
        await result.current.submitHandler();
      });

      expect(onSubmit).toHaveBeenCalled();
      expect(onClose).not.toHaveBeenCalled();
    });

    it('should not submit if validation fails', async () => {
      const { result } = renderHook(() =>
        useActivityForm({
          isOpen: true,
          onSubmit,
          onClose,
        })
      );

      // Don't set required field (title)
      act(() => {
        result.current.form.setValue('category', 'other');
      });

      await act(async () => {
        await result.current.submitHandler();
      });

      // Should not call callbacks due to validation failure
      expect(onSubmit).not.toHaveBeenCalled();
      expect(onClose).not.toHaveBeenCalled();
    });
  });

  describe('category handling', () => {
    it('should use provided category', () => {
      const initialData: Partial<TimelineItem> = {
        title: 'Activity',
        category: 'history',
      };

      const { result } = renderHook(() =>
        useActivityForm({
          isOpen: true,
          initialData,
          onSubmit,
          onClose,
        })
      );

      expect(result.current.form.getValues().category).toBe('history');
    });

    it('should default to "other" if no category provided', () => {
      const initialData: Partial<TimelineItem> = {
        title: 'Activity',
        // No category
      };

      const { result } = renderHook(() =>
        useActivityForm({
          isOpen: true,
          initialData,
          onSubmit,
          onClose,
        })
      );

      expect(result.current.form.getValues().category).toBe('other');
    });
  });

  describe('form state updates', () => {
    it('should update form values on change', () => {
      const { result } = renderHook(() =>
        useActivityForm({
          isOpen: true,
          onSubmit,
          onClose,
        })
      );

      act(() => {
        result.current.form.setValue('title', 'Updated Title');
      });

      expect(result.current.form.getValues().title).toBe('Updated Title');
    });

    it('should reset when initialData changes', () => {
      const { result, rerender } = renderHook(
        (props: Parameters<typeof useActivityForm>[0]) => useActivityForm(props),
        {
          initialProps: {
            isOpen: true,
            initialData: { title: 'First Activity' },
            onSubmit,
            onClose,
          },
        }
      );

      expect(result.current.form.getValues().title).toBe('First Activity');

      // Change initialData
      rerender({
        isOpen: true,
        initialData: { title: 'Second Activity' },
        onSubmit,
        onClose,
      });

      expect(result.current.form.getValues().title).toBe('Second Activity');
    });
  });
});
