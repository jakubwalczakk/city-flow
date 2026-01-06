import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useBasicInfoStep } from '@/hooks/useBasicInfoStep';
import type { NewPlanViewModel } from '@/types';

describe('useBasicInfoStep', () => {
  let mockFormData: NewPlanViewModel['basicInfo'];
  let updateFormData: ReturnType<typeof vi.fn>;
  let goToNextStep: ReturnType<typeof vi.fn>;
  let onSave: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    mockFormData = {
      name: 'Test Trip',
      destination: 'Paris',
      start_date: new Date('2024-06-01T10:00:00.000Z'),
      end_date: new Date('2024-06-08T18:00:00.000Z'),
      notes: 'Some notes',
    };

    updateFormData = vi.fn();
    goToNextStep = vi.fn();
    onSave = vi.fn().mockResolvedValue(undefined);

    vi.clearAllMocks();
  });

  describe('initialization', () => {
    it('should initialize form with provided data', () => {
      const { result } = renderHook(() =>
        useBasicInfoStep({
          formData: mockFormData,
          updateFormData,
          goToNextStep,
          onSave,
        })
      );

      const formValues = result.current.form.getValues();
      expect(formValues.name).toBe('Test Trip');
      expect(formValues.destination).toBe('Paris');
      expect(formValues.start_date).toEqual(mockFormData.start_date);
      expect(formValues.end_date).toEqual(mockFormData.end_date);
      expect(formValues.notes).toBe('Some notes');
    });

    it('should initialize date pickers as closed', () => {
      const { result } = renderHook(() =>
        useBasicInfoStep({
          formData: mockFormData,
          updateFormData,
          goToNextStep,
          onSave,
        })
      );

      expect(result.current.isStartOpen).toBe(false);
      expect(result.current.isEndOpen).toBe(false);
    });

    it('should handle empty notes', () => {
      const dataWithEmptyNotes = { ...mockFormData, notes: '' };

      const { result } = renderHook(() =>
        useBasicInfoStep({
          formData: dataWithEmptyNotes,
          updateFormData,
          goToNextStep,
          onSave,
        })
      );

      const formValues = result.current.form.getValues();
      expect(formValues.notes).toBe('');
    });
  });

  describe('date picker state management', () => {
    it('should open start date picker', () => {
      const { result } = renderHook(() =>
        useBasicInfoStep({
          formData: mockFormData,
          updateFormData,
          goToNextStep,
          onSave,
        })
      );

      act(() => {
        result.current.setIsStartOpen(true);
      });

      expect(result.current.isStartOpen).toBe(true);
    });

    it('should open end date picker', () => {
      const { result } = renderHook(() =>
        useBasicInfoStep({
          formData: mockFormData,
          updateFormData,
          goToNextStep,
          onSave,
        })
      );

      act(() => {
        result.current.setIsEndOpen(true);
      });

      expect(result.current.isEndOpen).toBe(true);
    });
  });

  describe('handleDateSelect', () => {
    it('should update start date and preserve time', () => {
      const { result } = renderHook(() =>
        useBasicInfoStep({
          formData: mockFormData,
          updateFormData,
          goToNextStep,
          onSave,
        })
      );

      const newDate = new Date('2024-06-15T00:00:00.000Z');
      const originalHours = mockFormData.start_date.getHours();
      const originalMinutes = mockFormData.start_date.getMinutes();

      act(() => {
        result.current.handleDateSelect('start_date', newDate);
      });

      const formValue = result.current.form.getValues().start_date;
      expect(formValue.getFullYear()).toBe(2024);
      expect(formValue.getMonth()).toBe(5); // June (0-indexed)
      expect(formValue.getDate()).toBe(15);
      expect(formValue.getHours()).toBe(originalHours); // Preserved from original
      expect(formValue.getMinutes()).toBe(originalMinutes); // Preserved from original
    });

    it('should update end date and preserve time', () => {
      const { result } = renderHook(() =>
        useBasicInfoStep({
          formData: mockFormData,
          updateFormData,
          goToNextStep,
          onSave,
        })
      );

      const newDate = new Date('2024-06-20T00:00:00.000Z');
      const originalHours = mockFormData.end_date.getHours();
      const originalMinutes = mockFormData.end_date.getMinutes();

      act(() => {
        result.current.handleDateSelect('end_date', newDate);
      });

      const formValue = result.current.form.getValues().end_date;
      expect(formValue.getDate()).toBe(20);
      expect(formValue.getHours()).toBe(originalHours); // Preserved from original
      expect(formValue.getMinutes()).toBe(originalMinutes); // Preserved from original
    });

    it('should call updateFormData when selecting date', () => {
      const { result } = renderHook(() =>
        useBasicInfoStep({
          formData: mockFormData,
          updateFormData,
          goToNextStep,
          onSave,
        })
      );

      const newDate = new Date('2024-06-15T00:00:00.000Z');

      act(() => {
        result.current.handleDateSelect('start_date', newDate);
      });

      expect(updateFormData).toHaveBeenCalledWith({
        start_date: expect.any(Date),
      });
    });

    it('should close start picker and open end picker after selecting start date', () => {
      const { result } = renderHook(() =>
        useBasicInfoStep({
          formData: mockFormData,
          updateFormData,
          goToNextStep,
          onSave,
        })
      );

      act(() => {
        result.current.setIsStartOpen(true);
      });

      expect(result.current.isStartOpen).toBe(true);

      const newDate = new Date('2024-06-15T00:00:00.000Z');

      act(() => {
        result.current.handleDateSelect('start_date', newDate);
      });

      expect(result.current.isStartOpen).toBe(false);
      expect(result.current.isEndOpen).toBe(true); // Auto-opened for UX
    });

    it('should close end picker after selecting end date', () => {
      const { result } = renderHook(() =>
        useBasicInfoStep({
          formData: mockFormData,
          updateFormData,
          goToNextStep,
          onSave,
        })
      );

      act(() => {
        result.current.setIsEndOpen(true);
      });

      const newDate = new Date('2024-06-20T00:00:00.000Z');

      act(() => {
        result.current.handleDateSelect('end_date', newDate);
      });

      expect(result.current.isEndOpen).toBe(false);
    });

    it('should not update when date is undefined', () => {
      const { result } = renderHook(() =>
        useBasicInfoStep({
          formData: mockFormData,
          updateFormData,
          goToNextStep,
          onSave,
        })
      );

      const originalValue = result.current.form.getValues().start_date;

      act(() => {
        result.current.handleDateSelect('start_date', undefined);
      });

      expect(result.current.form.getValues().start_date).toEqual(originalValue);
      expect(updateFormData).not.toHaveBeenCalled();
    });
  });

  describe('handleTimeChange', () => {
    it('should update start time and preserve date', () => {
      const { result } = renderHook(() =>
        useBasicInfoStep({
          formData: mockFormData,
          updateFormData,
          goToNextStep,
          onSave,
        })
      );

      act(() => {
        result.current.handleTimeChange('start_date', '14:30');
      });

      const formValue = result.current.form.getValues().start_date;
      expect(formValue.getDate()).toBe(1); // Original date preserved
      expect(formValue.getMonth()).toBe(5); // June
      expect(formValue.getHours()).toBe(14); // Updated
      expect(formValue.getMinutes()).toBe(30); // Updated
    });

    it('should update end time and preserve date', () => {
      const { result } = renderHook(() =>
        useBasicInfoStep({
          formData: mockFormData,
          updateFormData,
          goToNextStep,
          onSave,
        })
      );

      act(() => {
        result.current.handleTimeChange('end_date', '20:45');
      });

      const formValue = result.current.form.getValues().end_date;
      expect(formValue.getDate()).toBe(8); // Original date preserved
      expect(formValue.getHours()).toBe(20); // Updated
      expect(formValue.getMinutes()).toBe(45); // Updated
    });

    it('should call updateFormData when changing time', () => {
      const { result } = renderHook(() =>
        useBasicInfoStep({
          formData: mockFormData,
          updateFormData,
          goToNextStep,
          onSave,
        })
      );

      act(() => {
        result.current.handleTimeChange('start_date', '14:30');
      });

      expect(updateFormData).toHaveBeenCalledWith({
        start_date: expect.any(Date),
      });
    });

    it('should not update when time string is empty', () => {
      const { result } = renderHook(() =>
        useBasicInfoStep({
          formData: mockFormData,
          updateFormData,
          goToNextStep,
          onSave,
        })
      );

      const originalValue = result.current.form.getValues().start_date;

      act(() => {
        result.current.handleTimeChange('start_date', '');
      });

      expect(result.current.form.getValues().start_date).toEqual(originalValue);
      expect(updateFormData).not.toHaveBeenCalled();
    });
  });

  describe('dateToTime', () => {
    it('should convert date to time string format', () => {
      const { result } = renderHook(() =>
        useBasicInfoStep({
          formData: mockFormData,
          updateFormData,
          goToNextStep,
          onSave,
        })
      );

      // Use local time instead of UTC
      const date = new Date(2024, 5, 1, 14, 30); // June 1, 2024, 14:30 local time
      const timeString = result.current.dateToTime(date);

      expect(timeString).toBe('14:30');
    });

    it('should pad single digit hours and minutes', () => {
      const { result } = renderHook(() =>
        useBasicInfoStep({
          formData: mockFormData,
          updateFormData,
          goToNextStep,
          onSave,
        })
      );

      // Use local time with single digits
      const date = new Date(2024, 5, 1, 9, 5); // June 1, 2024, 09:05 local time
      const timeString = result.current.dateToTime(date);

      expect(timeString).toBe('09:05');
    });
  });

  describe('syncToParent', () => {
    it('should sync all form values to parent', () => {
      const { result } = renderHook(() =>
        useBasicInfoStep({
          formData: mockFormData,
          updateFormData,
          goToNextStep,
          onSave,
        })
      );

      // Modify some values
      act(() => {
        result.current.form.setValue('name', 'Updated Trip');
        result.current.form.setValue('destination', 'Rome');
      });

      act(() => {
        result.current.syncToParent();
      });

      expect(updateFormData).toHaveBeenCalledWith(
        expect.objectContaining({
          name: 'Updated Trip',
          destination: 'Rome',
        })
      );
    });
  });

  describe('handleNext', () => {
    it('should sync data and go to next step on valid form', async () => {
      const { result } = renderHook(() =>
        useBasicInfoStep({
          formData: mockFormData,
          updateFormData,
          goToNextStep,
          onSave,
        })
      );

      await act(async () => {
        await result.current.handleNext();
      });

      expect(updateFormData).toHaveBeenCalled();
      expect(goToNextStep).toHaveBeenCalled();
    });

    it('should not proceed with invalid form', async () => {
      const invalidData = { ...mockFormData, destination: '' };

      const { result } = renderHook(() =>
        useBasicInfoStep({
          formData: invalidData,
          updateFormData,
          goToNextStep,
          onSave,
        })
      );

      await act(async () => {
        await result.current.handleNext();
      });

      // Should not call goToNextStep due to validation failure
      expect(goToNextStep).not.toHaveBeenCalled();
    });
  });

  describe('handleSave', () => {
    it('should sync data and call onSave on valid form', async () => {
      const { result } = renderHook(() =>
        useBasicInfoStep({
          formData: mockFormData,
          updateFormData,
          goToNextStep,
          onSave,
        })
      );

      await act(async () => {
        await result.current.handleSave();
      });

      expect(updateFormData).toHaveBeenCalled();
      expect(onSave).toHaveBeenCalled();
    });

    it('should not save with invalid form', async () => {
      const invalidData = { ...mockFormData, destination: '' };

      const { result } = renderHook(() =>
        useBasicInfoStep({
          formData: invalidData,
          updateFormData,
          goToNextStep,
          onSave,
        })
      );

      await act(async () => {
        await result.current.handleSave();
      });

      // Should not call onSave due to validation failure
      expect(onSave).not.toHaveBeenCalled();
    });

    it('should propagate onSave errors', async () => {
      const errorOnSave = vi.fn().mockRejectedValue(new Error('Save failed'));

      const { result } = renderHook(() =>
        useBasicInfoStep({
          formData: mockFormData,
          updateFormData,
          goToNextStep,
          onSave: errorOnSave,
        })
      );

      // handleSave does not catch errors, so they propagate
      try {
        await act(async () => {
          await result.current.handleSave();
        });
        expect.fail('Should have thrown an error');
      } catch (error) {
        expect(error).toBeInstanceOf(Error);
        expect((error as Error).message).toBe('Save failed');
      }

      expect(errorOnSave).toHaveBeenCalled();
    });
  });

  describe('form updates', () => {
    it('should update name field', () => {
      const { result } = renderHook(() =>
        useBasicInfoStep({
          formData: mockFormData,
          updateFormData,
          goToNextStep,
          onSave,
        })
      );

      act(() => {
        result.current.form.setValue('name', 'New Trip Name');
      });

      expect(result.current.form.getValues().name).toBe('New Trip Name');
    });

    it('should update destination field', () => {
      const { result } = renderHook(() =>
        useBasicInfoStep({
          formData: mockFormData,
          updateFormData,
          goToNextStep,
          onSave,
        })
      );

      act(() => {
        result.current.form.setValue('destination', 'Tokyo');
      });

      expect(result.current.form.getValues().destination).toBe('Tokyo');
    });

    it('should update notes field', () => {
      const { result } = renderHook(() =>
        useBasicInfoStep({
          formData: mockFormData,
          updateFormData,
          goToNextStep,
          onSave,
        })
      );

      act(() => {
        result.current.form.setValue('notes', 'Updated notes');
      });

      expect(result.current.form.getValues().notes).toBe('Updated notes');
    });
  });
});
