import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useFixedPointForm } from '@/hooks/useFixedPointForm';
import type { FixedPointFormItem } from '@/types';

// Mock date formatters
vi.mock('@/lib/utils/dateFormatters', () => ({
  updateDateKeepTime: vi.fn((current: string, newDate: Date) => {
    const time = current ? new Date(current).toISOString().split('T')[1] : '00:00:00.000Z';
    return new Date(newDate.toISOString().split('T')[0] + 'T' + time).toISOString();
  }),
  updateTimeKeepDate: vi.fn((current: string, newTime: string) => {
    const date = current ? new Date(current).toISOString().split('T')[0] : '2024-06-01';
    return new Date(`${date}T${newTime}:00.000Z`).toISOString();
  }),
  getDateFromISO: vi.fn((isoString: string) => {
    return isoString ? new Date(isoString) : undefined;
  }),
  getTimeFromISO: vi.fn((isoString: string) => {
    if (!isoString) return '';
    const date = new Date(isoString);
    return `${date.getUTCHours().toString().padStart(2, '0')}:${date.getUTCMinutes().toString().padStart(2, '0')}`;
  }),
}));

describe('useFixedPointForm', () => {
  let onAdd: ReturnType<typeof vi.fn<(point: FixedPointFormItem) => void>>;
  let onUpdate: ReturnType<typeof vi.fn<(index: number, point: FixedPointFormItem) => void>>;

  beforeEach(() => {
    onAdd = vi.fn<(point: FixedPointFormItem) => void>();
    onUpdate = vi.fn<(index: number, point: FixedPointFormItem) => void>();
    vi.clearAllMocks();
  });

  describe('initialization', () => {
    it('should initialize with default values', () => {
      const { result } = renderHook(() => useFixedPointForm({ onAdd, onUpdate }));

      expect(result.current.isAdding).toBe(false);
      expect(result.current.editingIndex).toBeNull();
      expect(result.current.form).toBeDefined();
    });

    it('should initialize form with empty values', () => {
      const { result } = renderHook(() => useFixedPointForm({ onAdd, onUpdate }));

      const formValues = result.current.form.getValues();
      expect(formValues.location).toBe('');
      expect(formValues.event_at).toBe('');
      expect(formValues.event_duration).toBeNull();
      expect(formValues.description).toBe('');
    });
  });

  describe('startAdding', () => {
    it('should set isAdding to true', () => {
      const { result } = renderHook(() => useFixedPointForm({ onAdd, onUpdate }));

      act(() => {
        result.current.startAdding();
      });

      expect(result.current.isAdding).toBe(true);
      expect(result.current.editingIndex).toBeNull();
    });

    it('should reset form when starting to add', () => {
      const { result } = renderHook(() => useFixedPointForm({ onAdd, onUpdate }));

      // Set some values first
      act(() => {
        result.current.form.setValue('location', 'Test Location');
        result.current.form.setValue('description', 'Test Description');
      });

      act(() => {
        result.current.startAdding();
      });

      const formValues = result.current.form.getValues();
      expect(formValues.location).toBe('');
      expect(formValues.description).toBe('');
    });
  });

  describe('startEditing', () => {
    it('should set editingIndex and populate form', () => {
      const { result } = renderHook(() => useFixedPointForm({ onAdd, onUpdate }));

      const mockPoint: FixedPointFormItem = {
        id: 'fp-1',
        location: 'Eiffel Tower',
        event_at: '2024-06-02T14:00:00.000Z',
        event_duration: 120,
        description: 'Visit the tower',
      };

      act(() => {
        result.current.startEditing(0, mockPoint);
      });

      expect(result.current.editingIndex).toBe(0);
      expect(result.current.isAdding).toBe(false);

      const formValues = result.current.form.getValues();
      expect(formValues.location).toBe('Eiffel Tower');
      expect(formValues.event_duration).toBe(120);
      expect(formValues.description).toBe('Visit the tower');
    });

    it('should handle point without optional fields', () => {
      const { result } = renderHook(() => useFixedPointForm({ onAdd, onUpdate }));

      const mockPoint: FixedPointFormItem = {
        location: 'Museum',
        event_at: '2024-06-02T10:00:00.000Z',
        event_duration: undefined,
        description: undefined,
      };

      act(() => {
        result.current.startEditing(1, mockPoint);
      });

      expect(result.current.editingIndex).toBe(1);

      const formValues = result.current.form.getValues();
      expect(formValues.location).toBe('Museum');
      expect(formValues.event_duration).toBeUndefined();
      expect(formValues.description).toBeUndefined();
    });
  });

  describe('resetForm', () => {
    it('should reset form to default values', () => {
      const { result } = renderHook(() => useFixedPointForm({ onAdd, onUpdate }));

      // Set some values
      act(() => {
        result.current.form.setValue('location', 'Test Location');
        result.current.form.setValue('event_at', '2024-06-02T10:00:00.000Z');
        result.current.startAdding();
      });

      expect(result.current.isAdding).toBe(true);

      act(() => {
        result.current.resetForm();
      });

      expect(result.current.isAdding).toBe(false);
      expect(result.current.editingIndex).toBeNull();

      const formValues = result.current.form.getValues();
      expect(formValues.location).toBe('');
      expect(formValues.event_at).toBe('');
    });
  });

  describe('form submission', () => {
    it('should call onAdd when in add mode', async () => {
      const { result } = renderHook(() => useFixedPointForm({ onAdd, onUpdate }));

      act(() => {
        result.current.startAdding();
        result.current.form.setValue('location', 'New Location');
        result.current.form.setValue('event_at', '2024-06-02T10:00:00.000Z');
        result.current.form.setValue('event_duration', 60);
        result.current.form.setValue('description', 'New event');
      });

      await act(async () => {
        await result.current.onSubmit();
      });

      expect(onAdd).toHaveBeenCalledWith({
        location: 'New Location',
        event_at: '2024-06-02T10:00:00.000Z',
        event_duration: 60,
        description: 'New event',
      });
      expect(onUpdate).not.toHaveBeenCalled();
    });

    it('should call onUpdate when in edit mode', async () => {
      const { result } = renderHook(() => useFixedPointForm({ onAdd, onUpdate }));

      const mockPoint: FixedPointFormItem = {
        id: 'fp-1',
        location: 'Original Location',
        event_at: '2024-06-02T10:00:00.000Z',
        event_duration: 60,
        description: 'Original',
      };

      act(() => {
        result.current.startEditing(0, mockPoint);
        result.current.form.setValue('location', 'Updated Location');
      });

      await act(async () => {
        await result.current.onSubmit();
      });

      expect(onUpdate).toHaveBeenCalledWith(0, {
        location: 'Updated Location',
        event_at: '2024-06-02T10:00:00.000Z',
        event_duration: 60,
        description: 'Original',
      });
      expect(onAdd).not.toHaveBeenCalled();
    });

    it('should reset form after successful submission', async () => {
      const { result } = renderHook(() => useFixedPointForm({ onAdd, onUpdate }));

      act(() => {
        result.current.startAdding();
        result.current.form.setValue('location', 'New Location');
        result.current.form.setValue('event_at', '2024-06-02T10:00:00.000Z');
      });

      await act(async () => {
        await result.current.onSubmit();
      });

      expect(result.current.isAdding).toBe(false);
      expect(result.current.editingIndex).toBeNull();

      const formValues = result.current.form.getValues();
      expect(formValues.location).toBe('');
    });

    it('should handle null optional fields', async () => {
      const { result } = renderHook(() => useFixedPointForm({ onAdd, onUpdate }));

      act(() => {
        result.current.startAdding();
        result.current.form.setValue('location', 'Minimal Point');
        result.current.form.setValue('event_at', '2024-06-02T10:00:00.000Z');
        // Leave duration and description as default (empty string for description)
      });

      await act(async () => {
        await result.current.onSubmit();
      });

      expect(onAdd).toHaveBeenCalledWith({
        location: 'Minimal Point',
        event_at: '2024-06-02T10:00:00.000Z',
        event_duration: null,
        description: '', // Form default is empty string, not null
      });
    });
  });

  describe('date/time helpers', () => {
    it('should get date for picker from event_at', () => {
      const { result } = renderHook(() => useFixedPointForm({ onAdd, onUpdate }));

      act(() => {
        result.current.form.setValue('event_at', '2024-06-02T14:00:00.000Z');
      });

      const date = result.current.getDateForPicker();
      expect(date).toBeInstanceOf(Date);
      expect(date?.toISOString()).toBe('2024-06-02T14:00:00.000Z');
    });

    it('should return undefined when event_at is empty', () => {
      const { result } = renderHook(() => useFixedPointForm({ onAdd, onUpdate }));

      const date = result.current.getDateForPicker();
      expect(date).toBeUndefined();
    });

    it('should get time string for input from event_at', () => {
      const { result } = renderHook(() => useFixedPointForm({ onAdd, onUpdate }));

      act(() => {
        result.current.form.setValue('event_at', '2024-06-02T14:30:00.000Z');
      });

      const time = result.current.getTimeForInput();
      expect(time).toBe('14:30');
    });

    it('should return empty string when event_at is empty', () => {
      const { result } = renderHook(() => useFixedPointForm({ onAdd, onUpdate }));

      const time = result.current.getTimeForInput();
      expect(time).toBe('');
    });

    it('should handle date selection', () => {
      const { result } = renderHook(() => useFixedPointForm({ onAdd, onUpdate }));

      act(() => {
        result.current.form.setValue('event_at', '2024-06-01T10:00:00.000Z');
      });

      const newDate = new Date('2024-06-05T00:00:00.000Z');

      act(() => {
        result.current.handleDateSelect(newDate);
      });

      const formValue = result.current.form.getValues().event_at;
      expect(formValue).toContain('2024-06-05');
      expect(formValue).toContain('10:00'); // Time preserved
    });

    it('should not update when date is undefined', () => {
      const { result } = renderHook(() => useFixedPointForm({ onAdd, onUpdate }));

      act(() => {
        result.current.form.setValue('event_at', '2024-06-01T10:00:00.000Z');
      });

      const originalValue = result.current.form.getValues().event_at;

      act(() => {
        result.current.handleDateSelect(undefined);
      });

      expect(result.current.form.getValues().event_at).toBe(originalValue);
    });

    it('should handle time change', () => {
      const { result } = renderHook(() => useFixedPointForm({ onAdd, onUpdate }));

      act(() => {
        result.current.form.setValue('event_at', '2024-06-01T10:00:00.000Z');
      });

      const mockEvent = {
        target: { value: '15:30' },
      } as React.ChangeEvent<HTMLInputElement>;

      act(() => {
        result.current.handleTimeChange(mockEvent);
      });

      const formValue = result.current.form.getValues().event_at;
      expect(formValue).toContain('2024-06-01'); // Date preserved
      expect(formValue).toContain('15:30'); // Time updated
    });
  });

  describe('form validation', () => {
    it('should not submit when location is empty', async () => {
      const { result } = renderHook(() => useFixedPointForm({ onAdd, onUpdate }));

      act(() => {
        result.current.startAdding();
        result.current.form.setValue('event_at', '2024-06-02T10:00:00.000Z');
        result.current.form.setValue('location', '');
      });

      // Try to submit
      await act(async () => {
        await result.current.onSubmit();
      });

      // Should not call onAdd due to validation failure
      expect(onAdd).not.toHaveBeenCalled();
    });

    it('should not submit when event_at is empty', async () => {
      const { result } = renderHook(() => useFixedPointForm({ onAdd, onUpdate }));

      act(() => {
        result.current.startAdding();
        result.current.form.setValue('location', 'Test Location');
        result.current.form.setValue('event_at', '');
      });

      // Try to submit
      await act(async () => {
        await result.current.onSubmit();
      });

      // Should not call onAdd due to validation failure
      expect(onAdd).not.toHaveBeenCalled();
    });

    it('should allow submission with valid required fields only', async () => {
      const { result } = renderHook(() => useFixedPointForm({ onAdd, onUpdate }));

      act(() => {
        result.current.startAdding();
        result.current.form.setValue('location', 'Valid Location');
        result.current.form.setValue('event_at', '2024-06-02T10:00:00.000Z');
        // Optional fields left empty/null
      });

      await act(async () => {
        await result.current.onSubmit();
      });

      expect(onAdd).toHaveBeenCalled();
    });
  });

  describe('mode transitions', () => {
    it('should switch from edit mode to add mode', () => {
      const { result } = renderHook(() => useFixedPointForm({ onAdd, onUpdate }));

      const mockPoint: FixedPointFormItem = {
        location: 'Point 1',
        event_at: '2024-06-02T10:00:00.000Z',
        event_duration: undefined,
        description: undefined,
      };

      act(() => {
        result.current.startEditing(0, mockPoint);
      });

      expect(result.current.editingIndex).toBe(0);
      expect(result.current.isAdding).toBe(false);

      act(() => {
        result.current.startAdding();
      });

      expect(result.current.editingIndex).toBeNull();
      expect(result.current.isAdding).toBe(true);
    });

    it('should switch from add mode to edit mode', () => {
      const { result } = renderHook(() => useFixedPointForm({ onAdd, onUpdate }));

      act(() => {
        result.current.startAdding();
      });

      expect(result.current.isAdding).toBe(true);

      const mockPoint: FixedPointFormItem = {
        location: 'Point 1',
        event_at: '2024-06-02T10:00:00.000Z',
        event_duration: undefined,
        description: undefined,
      };

      act(() => {
        result.current.startEditing(1, mockPoint);
      });

      expect(result.current.isAdding).toBe(false);
      expect(result.current.editingIndex).toBe(1);
    });
  });
});
