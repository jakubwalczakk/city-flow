import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { usePreferencesForm } from '@/hooks/usePreferencesForm';
import type { UpdateProfileCommand } from '@/types';

describe('usePreferencesForm', () => {
  const mockOnSave = vi.fn<[UpdateProfileCommand], Promise<void>>();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('initialization', () => {
    it('should initialize with provided preferences and travel pace', () => {
      const { result } = renderHook(() =>
        usePreferencesForm({
          initialPreferences: ['culture', 'food'],
          initialTravelPace: 'moderate',
          onSave: mockOnSave,
        })
      );

      expect(result.current.form.getValues('preferences')).toEqual(['culture', 'food']);
      expect(result.current.form.getValues('travel_pace')).toBe('moderate');
    });

    it('should initialize with empty array when preferences is null', () => {
      const { result } = renderHook(() =>
        usePreferencesForm({
          initialPreferences: null,
          initialTravelPace: 'slow',
          onSave: mockOnSave,
        })
      );

      expect(result.current.form.getValues('preferences')).toEqual([]);
      expect(result.current.form.getValues('travel_pace')).toBe('slow');
    });

    it('should initialize with undefined travel_pace when null', () => {
      const { result } = renderHook(() =>
        usePreferencesForm({
          initialPreferences: ['culture', 'food'],
          initialTravelPace: null,
          onSave: mockOnSave,
        })
      );

      expect(result.current.form.getValues('preferences')).toEqual(['culture', 'food']);
      expect(result.current.form.getValues('travel_pace')).toBeUndefined();
    });
  });

  describe('change detection', () => {
    it('should detect no changes when form matches initial values', () => {
      const { result } = renderHook(() =>
        usePreferencesForm({
          initialPreferences: ['culture', 'food'],
          initialTravelPace: 'moderate',
          onSave: mockOnSave,
        })
      );

      expect(result.current.hasChanges).toBe(false);
    });

    it('should detect changes when preferences are modified', async () => {
      const { result } = renderHook(() =>
        usePreferencesForm({
          initialPreferences: ['culture', 'food'],
          initialTravelPace: 'moderate',
          onSave: mockOnSave,
        })
      );

      act(() => {
        result.current.form.setValue('preferences', ['culture', 'food', 'nature']);
      });

      await waitFor(() => {
        expect(result.current.hasChanges).toBe(true);
      });
    });

    it('should detect changes when travel_pace is modified', async () => {
      const { result } = renderHook(() =>
        usePreferencesForm({
          initialPreferences: ['culture', 'food'],
          initialTravelPace: 'moderate',
          onSave: mockOnSave,
        })
      );

      act(() => {
        result.current.form.setValue('travel_pace', 'intensive');
      });

      await waitFor(() => {
        expect(result.current.hasChanges).toBe(true);
      });
    });

    it('should not detect changes when preference order differs but content is same', async () => {
      const { result } = renderHook(() =>
        usePreferencesForm({
          initialPreferences: ['culture', 'food'],
          initialTravelPace: 'moderate',
          onSave: mockOnSave,
        })
      );

      act(() => {
        result.current.form.setValue('preferences', ['food', 'culture']);
      });

      await waitFor(() => {
        expect(result.current.hasChanges).toBe(false);
      });
    });

    it('should detect changes when adding a preference', async () => {
      const { result } = renderHook(() =>
        usePreferencesForm({
          initialPreferences: ['culture', 'food'],
          initialTravelPace: 'moderate',
          onSave: mockOnSave,
        })
      );

      act(() => {
        result.current.form.setValue('preferences', ['culture', 'food', 'nightlife']);
      });

      await waitFor(() => {
        expect(result.current.hasChanges).toBe(true);
      });
    });

    it('should detect changes when removing a preference', async () => {
      const { result } = renderHook(() =>
        usePreferencesForm({
          initialPreferences: ['culture', 'food', 'nightlife'],
          initialTravelPace: 'moderate',
          onSave: mockOnSave,
        })
      );

      act(() => {
        result.current.form.setValue('preferences', ['culture', 'food']);
      });

      await waitFor(() => {
        expect(result.current.hasChanges).toBe(true);
      });
    });
  });

  describe('form validation', () => {
    it('should be invalid with less than 2 preferences', async () => {
      const { result } = renderHook(() =>
        usePreferencesForm({
          initialPreferences: null,
          initialTravelPace: null,
          onSave: mockOnSave,
        })
      );

      act(() => {
        result.current.form.setValue('preferences', ['culture']);
        result.current.form.setValue('travel_pace', 'moderate');
      });

      await waitFor(() => {
        expect(result.current.isValid).toBe(false);
      });
    });

    it('should be invalid with more than 5 preferences', async () => {
      const { result } = renderHook(() =>
        usePreferencesForm({
          initialPreferences: null,
          initialTravelPace: null,
          onSave: mockOnSave,
        })
      );

      act(() => {
        result.current.form.setValue('preferences', ['culture', 'food', 'nature', 'nightlife', 'shopping', 'sports']);
        result.current.form.setValue('travel_pace', 'moderate');
      });

      await waitFor(() => {
        expect(result.current.isValid).toBe(false);
      });
    });

    it('should be valid with 2 preferences and travel_pace', async () => {
      const { result } = renderHook(() =>
        usePreferencesForm({
          initialPreferences: null,
          initialTravelPace: null,
          onSave: mockOnSave,
        })
      );

      await act(async () => {
        result.current.form.setValue('preferences', ['culture', 'food']);
        result.current.form.setValue('travel_pace', 'moderate');
        await result.current.form.trigger();
      });

      await waitFor(() => {
        expect(result.current.isValid).toBe(true);
      });
    });

    it('should be valid with 5 preferences and travel_pace', async () => {
      const { result } = renderHook(() =>
        usePreferencesForm({
          initialPreferences: null,
          initialTravelPace: null,
          onSave: mockOnSave,
        })
      );

      await act(async () => {
        result.current.form.setValue('preferences', ['culture', 'food', 'nature', 'nightlife', 'shopping']);
        result.current.form.setValue('travel_pace', 'intensive');
        await result.current.form.trigger();
      });

      await waitFor(() => {
        expect(result.current.isValid).toBe(true);
      });
    });

    it('should be invalid without travel_pace', async () => {
      const { result } = renderHook(() =>
        usePreferencesForm({
          initialPreferences: null,
          initialTravelPace: null,
          onSave: mockOnSave,
        })
      );

      act(() => {
        result.current.form.setValue('preferences', ['culture', 'food']);
      });

      await waitFor(() => {
        expect(result.current.isValid).toBe(false);
      });
    });

    it('should accept slow as travel_pace', async () => {
      const { result } = renderHook(() =>
        usePreferencesForm({
          initialPreferences: ['culture', 'food'],
          initialTravelPace: null,
          onSave: mockOnSave,
        })
      );

      await act(async () => {
        result.current.form.setValue('travel_pace', 'slow');
        await result.current.form.trigger();
      });

      await waitFor(() => {
        expect(result.current.isValid).toBe(true);
      });
    });

    it('should accept moderate as travel_pace', async () => {
      const { result } = renderHook(() =>
        usePreferencesForm({
          initialPreferences: ['culture', 'food'],
          initialTravelPace: null,
          onSave: mockOnSave,
        })
      );

      await act(async () => {
        result.current.form.setValue('travel_pace', 'moderate');
        await result.current.form.trigger();
      });

      await waitFor(() => {
        expect(result.current.isValid).toBe(true);
      });
    });

    it('should accept intensive as travel_pace', async () => {
      const { result } = renderHook(() =>
        usePreferencesForm({
          initialPreferences: ['culture', 'food'],
          initialTravelPace: null,
          onSave: mockOnSave,
        })
      );

      await act(async () => {
        result.current.form.setValue('travel_pace', 'intensive');
        await result.current.form.trigger();
      });

      await waitFor(() => {
        expect(result.current.isValid).toBe(true);
      });
    });
  });

  describe('form submission', () => {
    it('should call onSave with form data on valid submission', async () => {
      mockOnSave.mockResolvedValue(undefined);

      const { result } = renderHook(() =>
        usePreferencesForm({
          initialPreferences: ['culture', 'food'],
          initialTravelPace: 'moderate',
          onSave: mockOnSave,
        })
      );

      await act(async () => {
        await result.current.handleSubmit();
      });

      expect(mockOnSave).toHaveBeenCalledWith({
        preferences: ['culture', 'food'],
        travel_pace: 'moderate',
      });
    });

    it('should call onSave with updated data', async () => {
      mockOnSave.mockResolvedValue(undefined);

      const { result } = renderHook(() =>
        usePreferencesForm({
          initialPreferences: ['culture', 'food'],
          initialTravelPace: 'moderate',
          onSave: mockOnSave,
        })
      );

      act(() => {
        result.current.form.setValue('preferences', ['nature', 'sports', 'adventure']);
        result.current.form.setValue('travel_pace', 'intensive');
      });

      await act(async () => {
        await result.current.handleSubmit();
      });

      expect(mockOnSave).toHaveBeenCalledWith({
        preferences: ['nature', 'sports', 'adventure'],
        travel_pace: 'intensive',
      });
    });

    it('should handle onSave errors gracefully', async () => {
      mockOnSave.mockRejectedValue(new Error('Save failed'));

      const { result } = renderHook(() =>
        usePreferencesForm({
          initialPreferences: ['culture', 'food'],
          initialTravelPace: 'moderate',
          onSave: mockOnSave,
        })
      );

      // handleSubmit returns a function that should be called with an event
      // Calling it directly will trigger form validation and submission
      const submitEvent = { preventDefault: vi.fn() } as React.FormEvent<HTMLFormElement>;

      // Should not throw even when onSave rejects
      await act(async () => {
        await result.current.handleSubmit(submitEvent);
      });

      expect(mockOnSave).toHaveBeenCalled();
    });

    it('should not call onSave with invalid data', async () => {
      const { result } = renderHook(() =>
        usePreferencesForm({
          initialPreferences: ['culture'],
          initialTravelPace: null,
          onSave: mockOnSave,
        })
      );

      await act(async () => {
        await result.current.handleSubmit();
      });

      // Should not be called because form is invalid (< 2 preferences, no travel_pace)
      expect(mockOnSave).not.toHaveBeenCalled();
    });
  });

  describe('form state', () => {
    it('should provide form instance', () => {
      const { result } = renderHook(() =>
        usePreferencesForm({
          initialPreferences: ['culture', 'food'],
          initialTravelPace: 'moderate',
          onSave: mockOnSave,
        })
      );

      expect(result.current.form).toBeDefined();
      expect(result.current.form.control).toBeDefined();
      expect(result.current.form.getValues).toBeTypeOf('function');
      expect(result.current.form.setValue).toBeTypeOf('function');
    });

    it('should provide handleSubmit function', () => {
      const { result } = renderHook(() =>
        usePreferencesForm({
          initialPreferences: ['culture', 'food'],
          initialTravelPace: 'moderate',
          onSave: mockOnSave,
        })
      );

      expect(result.current.handleSubmit).toBeTypeOf('function');
    });

    it('should provide hasChanges boolean', () => {
      const { result } = renderHook(() =>
        usePreferencesForm({
          initialPreferences: ['culture', 'food'],
          initialTravelPace: 'moderate',
          onSave: mockOnSave,
        })
      );

      expect(typeof result.current.hasChanges).toBe('boolean');
    });

    it('should provide isValid boolean', () => {
      const { result } = renderHook(() =>
        usePreferencesForm({
          initialPreferences: ['culture', 'food'],
          initialTravelPace: 'moderate',
          onSave: mockOnSave,
        })
      );

      expect(typeof result.current.isValid).toBe('boolean');
    });
  });
});
