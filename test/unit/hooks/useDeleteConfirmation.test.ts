import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useDeleteConfirmation } from '@/hooks/useDeleteConfirmation';

type TestItem = {
  id: string;
  name: string;
};

describe('useDeleteConfirmation', () => {
  let mockOnConfirm: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    mockOnConfirm = vi.fn();
  });

  describe('initialization', () => {
    it('should initialize with closed state', () => {
      const { result } = renderHook(() =>
        useDeleteConfirmation<TestItem>({
          onConfirm: mockOnConfirm,
        })
      );

      expect(result.current.isOpen).toBe(false);
      expect(result.current.itemToDelete).toBeNull();
    });
  });

  describe('opening dialog', () => {
    it('should open dialog with item', () => {
      const { result } = renderHook(() =>
        useDeleteConfirmation<TestItem>({
          onConfirm: mockOnConfirm,
        })
      );

      const testItem: TestItem = { id: '1', name: 'Test Item' };

      act(() => {
        result.current.openDialog(testItem);
      });

      expect(result.current.isOpen).toBe(true);
      expect(result.current.itemToDelete).toEqual(testItem);
    });

    it('should open dialog by item ID', () => {
      const { result } = renderHook(() =>
        useDeleteConfirmation<TestItem>({
          onConfirm: mockOnConfirm,
        })
      );

      const items: TestItem[] = [
        { id: '1', name: 'Item 1' },
        { id: '2', name: 'Item 2' },
        { id: '3', name: 'Item 3' },
      ];

      act(() => {
        result.current.openDialogById(items, '2');
      });

      expect(result.current.isOpen).toBe(true);
      expect(result.current.itemToDelete).toEqual({ id: '2', name: 'Item 2' });
    });

    it('should not open dialog if item ID not found', () => {
      const { result } = renderHook(() =>
        useDeleteConfirmation<TestItem>({
          onConfirm: mockOnConfirm,
        })
      );

      const items: TestItem[] = [{ id: '1', name: 'Item 1' }];

      act(() => {
        result.current.openDialogById(items, 'non-existent');
      });

      expect(result.current.isOpen).toBe(false);
      expect(result.current.itemToDelete).toBeNull();
    });

    it('should handle empty items array', () => {
      const { result } = renderHook(() =>
        useDeleteConfirmation<TestItem>({
          onConfirm: mockOnConfirm,
        })
      );

      act(() => {
        result.current.openDialogById([], '1');
      });

      expect(result.current.isOpen).toBe(false);
      expect(result.current.itemToDelete).toBeNull();
    });
  });

  describe('closing dialog', () => {
    it('should close dialog and clear item', () => {
      const { result } = renderHook(() =>
        useDeleteConfirmation<TestItem>({
          onConfirm: mockOnConfirm,
        })
      );

      const testItem: TestItem = { id: '1', name: 'Test Item' };

      act(() => {
        result.current.openDialog(testItem);
      });

      act(() => {
        result.current.closeDialog();
      });

      expect(result.current.isOpen).toBe(false);
      expect(result.current.itemToDelete).toBeNull();
    });

    it('should be safe to close when already closed', () => {
      const { result } = renderHook(() =>
        useDeleteConfirmation<TestItem>({
          onConfirm: mockOnConfirm,
        })
      );

      act(() => {
        result.current.closeDialog();
      });

      expect(result.current.isOpen).toBe(false);
      expect(result.current.itemToDelete).toBeNull();
    });
  });

  describe('confirming deletion', () => {
    it('should call onConfirm with item and close dialog', () => {
      const { result } = renderHook(() =>
        useDeleteConfirmation<TestItem>({
          onConfirm: mockOnConfirm,
        })
      );

      const testItem: TestItem = { id: '1', name: 'Test Item' };

      act(() => {
        result.current.openDialog(testItem);
      });

      act(() => {
        result.current.confirmDelete();
      });

      expect(mockOnConfirm).toHaveBeenCalledWith(testItem);
      expect(result.current.isOpen).toBe(false);
      expect(result.current.itemToDelete).toBeNull();
    });

    it('should not call onConfirm if no item is set', () => {
      const { result } = renderHook(() =>
        useDeleteConfirmation<TestItem>({
          onConfirm: mockOnConfirm,
        })
      );

      act(() => {
        result.current.confirmDelete();
      });

      expect(mockOnConfirm).not.toHaveBeenCalled();
    });

    it('should handle multiple confirmations', () => {
      const { result } = renderHook(() =>
        useDeleteConfirmation<TestItem>({
          onConfirm: mockOnConfirm,
        })
      );

      const item1: TestItem = { id: '1', name: 'Item 1' };
      const item2: TestItem = { id: '2', name: 'Item 2' };

      act(() => {
        result.current.openDialog(item1);
      });

      act(() => {
        result.current.confirmDelete();
      });

      act(() => {
        result.current.openDialog(item2);
      });

      act(() => {
        result.current.confirmDelete();
      });

      expect(mockOnConfirm).toHaveBeenCalledTimes(2);
      expect(mockOnConfirm).toHaveBeenNthCalledWith(1, item1);
      expect(mockOnConfirm).toHaveBeenNthCalledWith(2, item2);
    });
  });

  describe('workflow scenarios', () => {
    it('should support open -> cancel workflow', () => {
      const { result } = renderHook(() =>
        useDeleteConfirmation<TestItem>({
          onConfirm: mockOnConfirm,
        })
      );

      const testItem: TestItem = { id: '1', name: 'Test Item' };

      act(() => {
        result.current.openDialog(testItem);
      });

      act(() => {
        result.current.closeDialog();
      });

      expect(mockOnConfirm).not.toHaveBeenCalled();
      expect(result.current.isOpen).toBe(false);
    });

    it('should support open -> confirm workflow', () => {
      const { result } = renderHook(() =>
        useDeleteConfirmation<TestItem>({
          onConfirm: mockOnConfirm,
        })
      );

      const testItem: TestItem = { id: '1', name: 'Test Item' };

      act(() => {
        result.current.openDialog(testItem);
      });

      act(() => {
        result.current.confirmDelete();
      });

      expect(mockOnConfirm).toHaveBeenCalledWith(testItem);
      expect(result.current.isOpen).toBe(false);
    });

    it('should support openById -> confirm workflow', () => {
      const { result } = renderHook(() =>
        useDeleteConfirmation<TestItem>({
          onConfirm: mockOnConfirm,
        })
      );

      const items: TestItem[] = [
        { id: '1', name: 'Item 1' },
        { id: '2', name: 'Item 2' },
      ];

      act(() => {
        result.current.openDialogById(items, '1');
      });

      act(() => {
        result.current.confirmDelete();
      });

      expect(mockOnConfirm).toHaveBeenCalledWith({ id: '1', name: 'Item 1' });
    });
  });

  describe('edge cases', () => {
    it('should handle items with additional properties', () => {
      type ExtendedItem = TestItem & { description: string };

      const { result } = renderHook(() =>
        useDeleteConfirmation<ExtendedItem>({
          onConfirm: mockOnConfirm,
        })
      );

      const item: ExtendedItem = {
        id: '1',
        name: 'Test',
        description: 'Description',
      };

      act(() => {
        result.current.openDialog(item);
      });

      act(() => {
        result.current.confirmDelete();
      });

      expect(mockOnConfirm).toHaveBeenCalledWith(item);
    });

    it('should handle rapid open/close cycles', () => {
      const { result } = renderHook(() =>
        useDeleteConfirmation<TestItem>({
          onConfirm: mockOnConfirm,
        })
      );

      const item: TestItem = { id: '1', name: 'Test' };

      act(() => {
        result.current.openDialog(item);
        result.current.closeDialog();
        result.current.openDialog(item);
        result.current.closeDialog();
      });

      expect(result.current.isOpen).toBe(false);
      expect(mockOnConfirm).not.toHaveBeenCalled();
    });
  });
});
