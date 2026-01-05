import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useDraftPlan } from '@/hooks/useDraftPlan';
import type { PlanDetailsDto } from '@/types';

// Mock React Query
vi.mock('@tanstack/react-query', () => ({
  useQuery: vi.fn(() => ({
    data: [],
    isLoading: false,
    error: null,
  })),
  useMutation: vi.fn(() => ({
    mutateAsync: vi.fn().mockResolvedValue({}),
    isPending: false,
    error: null,
    isSuccess: false,
  })),
  useQueryClient: vi.fn(() => ({
    invalidateQueries: vi.fn(),
    setQueryData: vi.fn(),
  })),
}));

describe('useDraftPlan', () => {
  const mockPlan: PlanDetailsDto = {
    id: 'plan-1',
    user_id: 'user-1',
    name: 'Paris Trip',
    destination: 'Paris',
    start_date: '2024-02-01',
    end_date: '2024-02-07',
    status: 'draft',
    notes: 'Spring break',
    created_at: '2024-01-01',
    updated_at: '2024-01-15',
    generated_content: null,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('initialization', () => {
    it('should initialize with plan data', () => {
      const { result } = renderHook(() => useDraftPlan({ plan: mockPlan }));

      expect(result.current.notes).toBe(mockPlan.notes);
      expect(result.current.hasChanges).toBe(false);
    });

    it('should initialize notes as empty string when plan has no notes', () => {
      const planWithoutNotes = { ...mockPlan, notes: null };
      const { result } = renderHook(() => useDraftPlan({ plan: planWithoutNotes }));

      expect(result.current.notes).toBe('');
    });

    it('should have correct initial state', () => {
      const { result } = renderHook(() => useDraftPlan({ plan: mockPlan }));

      expect(result.current.isSaving).toBe(false);
      expect(result.current.isGenerating).toBe(false);
      expect(result.current.fixedPoints).toEqual([]);
    });
  });

  describe('notes management', () => {
    it('should update notes', () => {
      const { result } = renderHook(() => useDraftPlan({ plan: mockPlan }));

      act(() => {
        result.current.setNotes('Updated notes');
      });

      expect(result.current.notes).toBe('Updated notes');
    });

    it('should track changes in notes', () => {
      const { result } = renderHook(() => useDraftPlan({ plan: mockPlan }));

      expect(result.current.hasChanges).toBe(false);

      act(() => {
        result.current.setNotes('New notes');
      });

      expect(result.current.hasChanges).toBe(true);
    });

    it('should track changes when notes differ from original', () => {
      const { result } = renderHook(() => useDraftPlan({ plan: mockPlan }));

      expect(result.current.hasChanges).toBe(false);

      act(() => {
        result.current.setNotes('New notes');
      });

      expect(result.current.hasChanges).toBe(true);
    });
  });

  describe('actions', () => {
    it('should provide handleSave function', () => {
      const { result } = renderHook(() => useDraftPlan({ plan: mockPlan }));

      expect(result.current.handleSave).toBeTypeOf('function');
    });

    it('should provide handleGenerate function', () => {
      const { result } = renderHook(() => useDraftPlan({ plan: mockPlan }));

      expect(result.current.handleGenerate).toBeTypeOf('function');
    });
  });

  describe('query state', () => {
    it('should have fixed points loading state', () => {
      const { result } = renderHook(() => useDraftPlan({ plan: mockPlan }));

      expect(result.current.isLoadingFixedPoints).toBe(false);
    });

    it('should have fixed points error handling', () => {
      const { result } = renderHook(() => useDraftPlan({ plan: mockPlan }));

      expect(result.current.fixedPointsError).toBeNull();
    });

    it('should return mutation states', () => {
      const { result } = renderHook(() => useDraftPlan({ plan: mockPlan }));

      expect(result.current.saveError).toBeDefined();
      expect(result.current.generateError).toBeDefined();
      expect(result.current.saveSuccess).toBe(false);
    });
  });
});
