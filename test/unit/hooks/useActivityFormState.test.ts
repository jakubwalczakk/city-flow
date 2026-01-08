import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useActivityFormState } from '@/hooks/useActivityFormState';
import type { TimelineItem } from '@/types';

describe('useActivityFormState', () => {
  let onAddActivity: ReturnType<typeof vi.fn<(date: string, activity: Partial<TimelineItem>) => Promise<void>>>;
  let onUpdateActivity: ReturnType<
    typeof vi.fn<(date: string, itemId: string, activity: Partial<TimelineItem>) => Promise<void>>
  >;
  let onDeleteActivity: ReturnType<typeof vi.fn<(date: string, itemId: string) => Promise<void>>>;
  let mockAlert: ReturnType<typeof vi.fn<() => void>>;

  const mockActivity: TimelineItem = {
    id: 'activity-1',
    time: '10:00',
    title: 'Visit Museum',
    type: 'activity',
    category: 'culture',
    location: 'Museum Street',
    description: 'Explore artifacts',
    estimated_price: '25',
    estimated_duration: '2 hours',
  };

  beforeEach(() => {
    onAddActivity = vi
      .fn<(date: string, activity: Partial<TimelineItem>) => Promise<void>>()
      .mockResolvedValue(undefined);
    onUpdateActivity = vi
      .fn<(date: string, itemId: string, activity: Partial<TimelineItem>) => Promise<void>>()
      .mockResolvedValue(undefined);
    onDeleteActivity = vi.fn<(date: string, itemId: string) => Promise<void>>().mockResolvedValue(undefined);
    mockAlert = vi.fn<() => void>();
    global.alert = mockAlert;
    vi.clearAllMocks();
  });

  describe('initialization', () => {
    it('should initialize with form closed', () => {
      const { result } = renderHook(() => useActivityFormState({ onAddActivity, onUpdateActivity, onDeleteActivity }));

      expect(result.current.formState.isOpen).toBe(false);
      expect(result.current.formState.mode).toBe('add');
      expect(result.current.formState.date).toBeNull();
      expect(result.current.formState.item).toBeNull();
    });
  });

  describe('openAddForm', () => {
    it('should open form in add mode', () => {
      const { result } = renderHook(() => useActivityFormState({ onAddActivity, onUpdateActivity, onDeleteActivity }));

      act(() => {
        result.current.openAddForm('2024-06-01');
      });

      expect(result.current.formState.isOpen).toBe(true);
      expect(result.current.formState.mode).toBe('add');
      expect(result.current.formState.date).toBe('2024-06-01');
      expect(result.current.formState.item).toBeNull();
    });

    it('should update date when called multiple times', () => {
      const { result } = renderHook(() => useActivityFormState({ onAddActivity, onUpdateActivity, onDeleteActivity }));

      act(() => {
        result.current.openAddForm('2024-06-01');
      });

      expect(result.current.formState.date).toBe('2024-06-01');

      act(() => {
        result.current.openAddForm('2024-06-15');
      });

      expect(result.current.formState.date).toBe('2024-06-15');
      expect(result.current.formState.mode).toBe('add');
    });
  });

  describe('openEditForm', () => {
    it('should open form in edit mode with item', () => {
      const { result } = renderHook(() => useActivityFormState({ onAddActivity, onUpdateActivity, onDeleteActivity }));

      act(() => {
        result.current.openEditForm('2024-06-01', mockActivity);
      });

      expect(result.current.formState.isOpen).toBe(true);
      expect(result.current.formState.mode).toBe('edit');
      expect(result.current.formState.date).toBe('2024-06-01');
      expect(result.current.formState.item).toEqual(mockActivity);
    });

    it('should switch from add to edit mode', () => {
      const { result } = renderHook(() => useActivityFormState({ onAddActivity, onUpdateActivity, onDeleteActivity }));

      act(() => {
        result.current.openAddForm('2024-06-01');
      });

      expect(result.current.formState.mode).toBe('add');

      act(() => {
        result.current.openEditForm('2024-06-01', mockActivity);
      });

      expect(result.current.formState.mode).toBe('edit');
      expect(result.current.formState.item).toEqual(mockActivity);
    });
  });

  describe('closeForm', () => {
    it('should reset form state to initial values', () => {
      const { result } = renderHook(() => useActivityFormState({ onAddActivity, onUpdateActivity, onDeleteActivity }));

      act(() => {
        result.current.openEditForm('2024-06-01', mockActivity);
      });

      expect(result.current.formState.isOpen).toBe(true);

      act(() => {
        result.current.closeForm();
      });

      expect(result.current.formState.isOpen).toBe(false);
      expect(result.current.formState.mode).toBe('add');
      expect(result.current.formState.date).toBeNull();
      expect(result.current.formState.item).toBeNull();
    });
  });

  describe('handleFormSubmit', () => {
    it('should call onAddActivity when in add mode', async () => {
      const { result } = renderHook(() => useActivityFormState({ onAddActivity, onUpdateActivity, onDeleteActivity }));

      act(() => {
        result.current.openAddForm('2024-06-01');
      });

      const newActivity: Partial<TimelineItem> = {
        title: 'New Activity',
        time: '14:00',
        category: 'food',
      };

      await act(async () => {
        await result.current.handleFormSubmit(newActivity);
      });

      expect(onAddActivity).toHaveBeenCalledWith('2024-06-01', newActivity);
      expect(onUpdateActivity).not.toHaveBeenCalled();
    });

    it('should call onUpdateActivity when in edit mode', async () => {
      const { result } = renderHook(() => useActivityFormState({ onAddActivity, onUpdateActivity, onDeleteActivity }));

      act(() => {
        result.current.openEditForm('2024-06-01', mockActivity);
      });

      const updatedActivity: Partial<TimelineItem> = {
        title: 'Updated Activity',
        time: '15:00',
      };

      await act(async () => {
        await result.current.handleFormSubmit(updatedActivity);
      });

      expect(onUpdateActivity).toHaveBeenCalledWith('2024-06-01', 'activity-1', updatedActivity);
      expect(onAddActivity).not.toHaveBeenCalled();
    });

    it('should not call callbacks if date is null in add mode', async () => {
      const { result } = renderHook(() => useActivityFormState({ onAddActivity, onUpdateActivity, onDeleteActivity }));

      // Don't open form, so date is null
      const newActivity: Partial<TimelineItem> = {
        title: 'Activity',
      };

      await act(async () => {
        await result.current.handleFormSubmit(newActivity);
      });

      expect(onAddActivity).not.toHaveBeenCalled();
      expect(onUpdateActivity).not.toHaveBeenCalled();
    });

    it('should not call onUpdateActivity if item is null in edit mode', async () => {
      const { result } = renderHook(() => useActivityFormState({ onAddActivity, onUpdateActivity, onDeleteActivity }));

      // Manually set mode to edit but without item (edge case)
      act(() => {
        result.current.openAddForm('2024-06-01');
      });

      // Force edit mode without proper item
      result.current.formState.mode = 'edit';
      result.current.formState.item = null;

      const activity: Partial<TimelineItem> = { title: 'Activity' };

      await act(async () => {
        await result.current.handleFormSubmit(activity);
      });

      expect(onUpdateActivity).not.toHaveBeenCalled();
    });
  });

  describe('handleDelete', () => {
    it('should call onDeleteActivity with correct params', async () => {
      const { result } = renderHook(() => useActivityFormState({ onAddActivity, onUpdateActivity, onDeleteActivity }));

      await act(async () => {
        await result.current.handleDelete('2024-06-01', 'activity-1');
      });

      expect(onDeleteActivity).toHaveBeenCalledWith('2024-06-01', 'activity-1');
    });

    it('should show alert on delete error', async () => {
      onDeleteActivity.mockRejectedValueOnce(new Error('Delete failed'));

      const { result } = renderHook(() => useActivityFormState({ onAddActivity, onUpdateActivity, onDeleteActivity }));

      await act(async () => {
        await result.current.handleDelete('2024-06-01', 'activity-1');
      });

      expect(onDeleteActivity).toHaveBeenCalled();
      expect(mockAlert).toHaveBeenCalledWith('Delete failed');
    });

    it('should show generic alert on non-Error exception', async () => {
      onDeleteActivity.mockRejectedValueOnce('Unknown error');

      const { result } = renderHook(() => useActivityFormState({ onAddActivity, onUpdateActivity, onDeleteActivity }));

      await act(async () => {
        await result.current.handleDelete('2024-06-01', 'activity-1');
      });

      expect(mockAlert).toHaveBeenCalledWith('Nie udało się usunąć aktywności');
    });
  });

  describe('multiple operations', () => {
    it('should handle switching between add and edit forms', () => {
      const { result } = renderHook(() => useActivityFormState({ onAddActivity, onUpdateActivity, onDeleteActivity }));

      act(() => {
        result.current.openAddForm('2024-06-01');
      });

      expect(result.current.formState.mode).toBe('add');
      expect(result.current.formState.item).toBeNull();

      act(() => {
        result.current.openEditForm('2024-06-02', mockActivity);
      });

      expect(result.current.formState.mode).toBe('edit');
      expect(result.current.formState.date).toBe('2024-06-02');
      expect(result.current.formState.item).toEqual(mockActivity);

      act(() => {
        result.current.openAddForm('2024-06-03');
      });

      expect(result.current.formState.mode).toBe('add');
      expect(result.current.formState.date).toBe('2024-06-03');
      expect(result.current.formState.item).toBeNull();
    });

    it('should maintain state through multiple open/close cycles', () => {
      const { result } = renderHook(() => useActivityFormState({ onAddActivity, onUpdateActivity, onDeleteActivity }));

      // Open, close, open again
      act(() => {
        result.current.openAddForm('2024-06-01');
      });

      act(() => {
        result.current.closeForm();
      });

      expect(result.current.formState.isOpen).toBe(false);

      act(() => {
        result.current.openEditForm('2024-06-02', mockActivity);
      });

      expect(result.current.formState.isOpen).toBe(true);
      expect(result.current.formState.mode).toBe('edit');
    });
  });
});
