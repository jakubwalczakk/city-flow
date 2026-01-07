import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { useEditableTitle } from '@/hooks/useEditableTitle';

describe('useEditableTitle', () => {
  let mockOnSave: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    mockOnSave = vi.fn().mockResolvedValue(undefined);
  });

  describe('initialization', () => {
    it('should initialize with provided title', () => {
      const { result } = renderHook(() =>
        useEditableTitle({
          title: 'Test Title',
          onSave: mockOnSave,
        })
      );

      expect(result.current.editedName).toBe('Test Title');
      expect(result.current.isEditing).toBe(false);
      expect(result.current.isSaving).toBe(false);
    });

    it('should initialize with empty title', () => {
      const { result } = renderHook(() =>
        useEditableTitle({
          title: '',
          onSave: mockOnSave,
        })
      );

      expect(result.current.editedName).toBe('');
    });

    it('should have canSave true for non-empty title', () => {
      const { result } = renderHook(() =>
        useEditableTitle({
          title: 'Test',
          onSave: mockOnSave,
        })
      );

      expect(result.current.canSave).toBe(true);
    });

    it('should have canSave false for empty title', () => {
      const { result } = renderHook(() =>
        useEditableTitle({
          title: '',
          onSave: mockOnSave,
        })
      );

      expect(result.current.canSave).toBe(false);
    });
  });

  describe('edit mode', () => {
    it('should enter edit mode when startEditing is called', () => {
      const { result } = renderHook(() =>
        useEditableTitle({
          title: 'Test',
          onSave: mockOnSave,
        })
      );

      act(() => {
        result.current.startEditing();
      });

      expect(result.current.isEditing).toBe(true);
    });

    it('should exit edit mode after successful save', async () => {
      const { result } = renderHook(() =>
        useEditableTitle({
          title: 'Old Title',
          onSave: mockOnSave,
        })
      );

      act(() => {
        result.current.startEditing();
      });

      await act(async () => {
        await result.current.handleSave();
      });

      expect(result.current.isEditing).toBe(false);
    });

    it('should exit edit mode when handleCancel is called', () => {
      const { result } = renderHook(() =>
        useEditableTitle({
          title: 'Test',
          onSave: mockOnSave,
        })
      );

      act(() => {
        result.current.startEditing();
      });

      act(() => {
        result.current.handleCancel();
      });

      expect(result.current.isEditing).toBe(false);
    });
  });

  describe('editing title', () => {
    it('should update editedName when setEditedName is called', () => {
      const { result } = renderHook(() =>
        useEditableTitle({
          title: 'Old Title',
          onSave: mockOnSave,
        })
      );

      act(() => {
        result.current.setEditedName('New Title');
      });

      expect(result.current.editedName).toBe('New Title');
    });

    it('should allow empty string', () => {
      const { result } = renderHook(() =>
        useEditableTitle({
          title: 'Test',
          onSave: mockOnSave,
        })
      );

      act(() => {
        result.current.setEditedName('');
      });

      expect(result.current.editedName).toBe('');
      expect(result.current.canSave).toBe(false);
    });

    it('should update canSave when editedName changes', () => {
      const { result } = renderHook(() =>
        useEditableTitle({
          title: 'Test',
          onSave: mockOnSave,
        })
      );

      act(() => {
        result.current.setEditedName('   ');
      });

      expect(result.current.canSave).toBe(false);

      act(() => {
        result.current.setEditedName('Valid Title');
      });

      expect(result.current.canSave).toBe(true);
    });
  });

  describe('saving', () => {
    it('should call onSave with edited title', async () => {
      const { result } = renderHook(() =>
        useEditableTitle({
          title: 'Old Title',
          onSave: mockOnSave,
        })
      );

      act(() => {
        result.current.setEditedName('New Title');
      });

      await act(async () => {
        await result.current.handleSave();
      });

      expect(mockOnSave).toHaveBeenCalledWith('New Title');
    });

    it('should not save empty title', async () => {
      const { result } = renderHook(() =>
        useEditableTitle({
          title: 'Test',
          onSave: mockOnSave,
        })
      );

      act(() => {
        result.current.setEditedName('');
      });

      await act(async () => {
        await result.current.handleSave();
      });

      expect(mockOnSave).not.toHaveBeenCalled();
    });

    it('should not save whitespace-only title', async () => {
      const { result } = renderHook(() =>
        useEditableTitle({
          title: 'Test',
          onSave: mockOnSave,
        })
      );

      act(() => {
        result.current.setEditedName('   ');
      });

      await act(async () => {
        await result.current.handleSave();
      });

      expect(mockOnSave).not.toHaveBeenCalled();
    });

    it('should set isSaving to false after save completes', async () => {
      const { result } = renderHook(() =>
        useEditableTitle({
          title: 'Test',
          onSave: mockOnSave,
        })
      );

      act(() => {
        result.current.setEditedName('New Title');
      });

      await act(async () => {
        await result.current.handleSave();
      });

      // Should not be saving after completion
      expect(result.current.isSaving).toBe(false);
    });

    it('should reset to original title on save error', async () => {
      const errorMock = vi.fn().mockRejectedValue(new Error('Save failed'));

      const { result } = renderHook(() =>
        useEditableTitle({
          title: 'Original Title',
          onSave: errorMock,
        })
      );

      act(() => {
        result.current.setEditedName('New Title');
      });

      await act(async () => {
        try {
          await result.current.handleSave();
        } catch {
          // Expected error
        }
      });

      await waitFor(() => {
        expect(result.current.editedName).toBe('Original Title');
      });
      expect(result.current.isSaving).toBe(false);
    });
  });

  describe('canceling', () => {
    it('should restore original title when canceled', () => {
      const cancelMock = vi.fn().mockResolvedValue(undefined);
      const { result } = renderHook(() =>
        useEditableTitle({
          title: 'Original Title',
          onSave: cancelMock,
        })
      );

      act(() => {
        result.current.setEditedName('Modified Title');
        result.current.handleCancel();
      });

      expect(result.current.editedName).toBe('Original Title');
    });

    it('should not call onSave when canceled', () => {
      const cancelMock = vi.fn().mockResolvedValue(undefined);
      const { result } = renderHook(() =>
        useEditableTitle({
          title: 'Test',
          onSave: cancelMock,
        })
      );

      act(() => {
        result.current.setEditedName('New Title');
        result.current.handleCancel();
      });

      expect(cancelMock).not.toHaveBeenCalled();
    });
  });

  describe('keyboard shortcuts', () => {
    it('should save on Enter key', async () => {
      const keyMock = vi.fn().mockResolvedValue(undefined);
      const { result } = renderHook(() =>
        useEditableTitle({
          title: 'Old Title',
          onSave: keyMock,
        })
      );

      act(() => {
        result.current.setEditedName('New Title');
      });

      await act(async () => {
        result.current.handleKeyDown({ key: 'Enter' } as React.KeyboardEvent);
      });

      await waitFor(() => {
        expect(keyMock).toHaveBeenCalledWith('New Title');
      });
    });

    it('should cancel on Escape key', () => {
      const escMock = vi.fn().mockResolvedValue(undefined);
      const { result } = renderHook(() =>
        useEditableTitle({
          title: 'Original Title',
          onSave: escMock,
        })
      );

      act(() => {
        result.current.setEditedName('Modified Title');
        result.current.handleKeyDown({ key: 'Escape' } as React.KeyboardEvent);
      });

      expect(result.current.editedName).toBe('Original Title');
      expect(escMock).not.toHaveBeenCalled();
    });

    it('should ignore other keys', () => {
      const otherMock = vi.fn().mockResolvedValue(undefined);
      const { result } = renderHook(() =>
        useEditableTitle({
          title: 'Test',
          onSave: otherMock,
        })
      );

      act(() => {
        result.current.handleKeyDown({ key: 'a' } as React.KeyboardEvent);
      });

      expect(otherMock).not.toHaveBeenCalled();
    });
  });

  describe('title prop updates', () => {
    it('should update editedName when title prop changes (not editing)', () => {
      const propMock = vi.fn().mockResolvedValue(undefined);
      const { result, rerender } = renderHook(
        ({ title }) =>
          useEditableTitle({
            title,
            onSave: propMock,
          }),
        {
          initialProps: { title: 'Initial Title' },
        }
      );

      expect(result.current.editedName).toBe('Initial Title');

      rerender({ title: 'Updated Title' });

      waitFor(() => {
        expect(result.current.editedName).toBe('Updated Title');
      });
    });

    it('should not update editedName when title prop changes while editing', () => {
      const editMock = vi.fn().mockResolvedValue(undefined);
      const { result, rerender } = renderHook(
        ({ title }) =>
          useEditableTitle({
            title,
            onSave: editMock,
          }),
        {
          initialProps: { title: 'Initial Title' },
        }
      );

      act(() => {
        result.current.startEditing();
        result.current.setEditedName('Editing Title');
      });

      rerender({ title: 'Updated Title' });

      // Should keep the edited value
      expect(result.current.editedName).toBe('Editing Title');
    });
  });
});
