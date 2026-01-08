import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useDraftPlan } from '@/hooks/useDraftPlan';
import type { PlanDetailsDto, FixedPointDto } from '@/types';
import type { UseQueryOptions, UseMutationOptions } from '@tanstack/react-query';
import * as ReactQuery from '@tanstack/react-query';

// Mock fetch
const mockFetch = vi.fn();
global.fetch = mockFetch;

// Create mock functions that we can control
const mockUseQuery = vi.fn();
const mockUseMutation = vi.fn();
const mockInvalidateQueries = vi.fn();
const mockQueryClient = {
  invalidateQueries: mockInvalidateQueries,
  setQueryData: vi.fn(),
};

// Type for React Query options
type QueryOptions = UseQueryOptions<FixedPointDto[], Error, FixedPointDto[], readonly unknown[]>;
type SaveMutationOptions = UseMutationOptions<PlanDetailsDto, Error, { notes: string }, unknown>;
type GenerateMutationOptions = UseMutationOptions<PlanDetailsDto, Error, undefined, unknown>;
type MutationOptions = SaveMutationOptions | GenerateMutationOptions;

// Mock React Query
vi.mock('@tanstack/react-query', () => ({
  useQuery: (options: QueryOptions) => mockUseQuery(options),
  useMutation: (options: MutationOptions) => mockUseMutation(options),
  useQueryClient: () => mockQueryClient,
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

  const mockFixedPoints: FixedPointDto[] = [
    {
      id: 'fp-1',
      plan_id: 'plan-1',
      location: 'Eiffel Tower',
      event_at: '2024-02-02T14:00:00Z',
      event_duration: 2,
      description: 'Visit the landmark',
    },
  ];

  // Default mock implementations
  let mockSaveMutateAsync: ReturnType<typeof vi.fn>;
  let mockGenerateMutateAsync: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    vi.clearAllMocks();
    mockFetch.mockClear();

    // Setup default successful save mutation
    mockSaveMutateAsync = vi.fn().mockResolvedValue({ ...mockPlan });
    mockGenerateMutateAsync = vi.fn().mockResolvedValue({ ...mockPlan, status: 'generated' });

    mockUseMutation.mockImplementation((options: MutationOptions) => {
      // Check if this is the save or generate mutation
      const isSaveMutation = options.mutationFn?.toString().includes('PATCH');

      if (isSaveMutation) {
        return {
          mutateAsync: mockSaveMutateAsync,
          isPending: false,
          error: null,
          isSuccess: false,
        };
      } else {
        // Generate mutation
        return {
          mutateAsync: mockGenerateMutateAsync,
          isPending: false,
          error: null,
          isSuccess: false,
        };
      }
    });

    // Setup default successful query
    mockUseQuery.mockReturnValue({
      data: [],
      isLoading: false,
      error: null,
    });
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

  describe('fetching fixed points', () => {
    it('should fetch fixed points on mount', () => {
      renderHook(() => useDraftPlan({ plan: mockPlan }));

      expect(mockUseQuery).toHaveBeenCalledWith(
        expect.objectContaining({
          queryKey: ['fixedPoints', 'plan-1'],
          queryFn: expect.any(Function),
        })
      );
    });

    it('should return fixed points data when available', () => {
      mockUseQuery.mockReturnValue({
        data: mockFixedPoints,
        isLoading: false,
        error: null,
      });

      const { result } = renderHook(() => useDraftPlan({ plan: mockPlan }));

      expect(result.current.fixedPoints).toEqual(mockFixedPoints);
      expect(result.current.isLoadingFixedPoints).toBe(false);
    });

    it('should handle loading state for fixed points', () => {
      mockUseQuery.mockReturnValue({
        data: undefined,
        isLoading: true,
        error: null,
      });

      const { result } = renderHook(() => useDraftPlan({ plan: mockPlan }));

      expect(result.current.isLoadingFixedPoints).toBe(true);
      expect(result.current.fixedPoints).toEqual([]);
    });

    it('should handle error state for fixed points', () => {
      const error = new Error('Failed to fetch');
      mockUseQuery.mockReturnValue({
        data: undefined,
        isLoading: false,
        error,
      });

      const { result } = renderHook(() => useDraftPlan({ plan: mockPlan }));

      expect(result.current.fixedPointsError).toEqual(error);
      expect(result.current.fixedPoints).toEqual([]);
    });

    it('should use default empty array for fixed points when data is undefined', () => {
      mockUseQuery.mockReturnValue({
        data: undefined,
        isLoading: false,
        error: null,
      });

      const { result } = renderHook(() => useDraftPlan({ plan: mockPlan }));

      expect(result.current.fixedPoints).toEqual([]);
    });
  });

  describe('handleSave', () => {
    it('should call save mutation with updated notes', async () => {
      const { result } = renderHook(() => useDraftPlan({ plan: mockPlan }));

      act(() => {
        result.current.setNotes('Updated notes');
      });

      await act(async () => {
        await result.current.handleSave();
      });

      expect(mockSaveMutateAsync).toHaveBeenCalledWith({ notes: 'Updated notes' });
    });

    it('should handle save success', async () => {
      mockUseMutation.mockImplementation((options: MutationOptions) => {
        const isSaveMutation = options.mutationFn?.toString().includes('PATCH');
        if (isSaveMutation) {
          return {
            mutateAsync: mockSaveMutateAsync,
            isPending: false,
            error: null,
            isSuccess: true,
          };
        }
        return {
          mutateAsync: vi.fn(),
          isPending: false,
          error: null,
          isSuccess: false,
        };
      });

      const { result } = renderHook(() => useDraftPlan({ plan: mockPlan }));

      expect(result.current.saveSuccess).toBe(true);
    });

    it('should show saving state during mutation', () => {
      mockUseMutation.mockImplementation((options: MutationOptions) => {
        const isSaveMutation = options.mutationFn?.toString().includes('PATCH');
        if (isSaveMutation) {
          return {
            mutateAsync: mockSaveMutateAsync,
            isPending: true,
            error: null,
            isSuccess: false,
          };
        }
        return {
          mutateAsync: vi.fn(),
          isPending: false,
          error: null,
          isSuccess: false,
        };
      });

      const { result } = renderHook(() => useDraftPlan({ plan: mockPlan }));

      expect(result.current.isSaving).toBe(true);
    });

    it('should invalidate queries on successful save', async () => {
      let onSuccessCallback: SaveMutationOptions['onSuccess'];

      mockUseMutation.mockImplementation((options: MutationOptions) => {
        const isSaveMutation = options.mutationFn?.toString().includes('PATCH');
        if (isSaveMutation) {
          onSuccessCallback = (options as SaveMutationOptions).onSuccess;
          return {
            mutateAsync: mockSaveMutateAsync,
            isPending: false,
            error: null,
            isSuccess: false,
          };
        }
        return {
          mutateAsync: vi.fn(),
          isPending: false,
          error: null,
          isSuccess: false,
        };
      });

      renderHook(() => useDraftPlan({ plan: mockPlan }));

      // Trigger onSuccess callback
      if (onSuccessCallback) {
        onSuccessCallback(mockPlan, { notes: 'test' }, undefined, { client: mockQueryClient as never, meta: {} });
      }

      expect(mockInvalidateQueries).toHaveBeenCalledWith({ queryKey: ['plan', 'plan-1'] });
    });
  });

  describe('handleGenerate', () => {
    it('should call generate mutation when notes unchanged', async () => {
      const { result } = renderHook(() => useDraftPlan({ plan: mockPlan }));

      await act(async () => {
        await result.current.handleGenerate();
      });

      expect(mockGenerateMutateAsync).toHaveBeenCalled();
      expect(mockSaveMutateAsync).not.toHaveBeenCalled();
    });

    it('should auto-save before generating when notes changed', async () => {
      const { result } = renderHook(() => useDraftPlan({ plan: mockPlan }));

      act(() => {
        result.current.setNotes('Changed notes');
      });

      await act(async () => {
        await result.current.handleGenerate();
      });

      expect(mockSaveMutateAsync).toHaveBeenCalledWith({ notes: 'Changed notes' });
      expect(mockGenerateMutateAsync).toHaveBeenCalled();
    });

    it('should auto-save before generating when plan has no notes', async () => {
      const planWithoutNotes = { ...mockPlan, notes: null };
      const { result } = renderHook(() => useDraftPlan({ plan: planWithoutNotes }));

      act(() => {
        result.current.setNotes('New notes');
      });

      await act(async () => {
        await result.current.handleGenerate();
      });

      expect(mockSaveMutateAsync).toHaveBeenCalledWith({ notes: 'New notes' });
      expect(mockGenerateMutateAsync).toHaveBeenCalled();
    });

    it('should show generating state during mutation', () => {
      mockUseMutation.mockImplementation((options: MutationOptions) => {
        const isSaveMutation = options.mutationFn?.toString().includes('PATCH');
        if (isSaveMutation) {
          return {
            mutateAsync: mockSaveMutateAsync,
            isPending: false,
            error: null,
            isSuccess: false,
          };
        }
        return {
          mutateAsync: mockGenerateMutateAsync,
          isPending: true,
          error: null,
          isSuccess: false,
        };
      });

      const { result } = renderHook(() => useDraftPlan({ plan: mockPlan }));

      expect(result.current.isGenerating).toBe(true);
    });

    it('should invalidate queries on successful generation', async () => {
      let onSuccessCallback: GenerateMutationOptions['onSuccess'];

      mockUseMutation.mockImplementation((options: MutationOptions) => {
        const isSaveMutation = options.mutationFn?.toString().includes('PATCH');
        if (!isSaveMutation) {
          onSuccessCallback = (options as GenerateMutationOptions).onSuccess;
          return {
            mutateAsync: mockGenerateMutateAsync,
            isPending: false,
            error: null,
            isSuccess: false,
          };
        }
        return {
          mutateAsync: mockSaveMutateAsync,
          isPending: false,
          error: null,
          isSuccess: false,
        };
      });

      renderHook(() => useDraftPlan({ plan: mockPlan }));

      // Trigger onSuccess callback
      if (onSuccessCallback) {
        onSuccessCallback(mockPlan, undefined, undefined, { client: mockQueryClient as never, meta: {} });
      }

      expect(mockInvalidateQueries).toHaveBeenCalledWith({ queryKey: ['plan', 'plan-1'] });
    });
  });

  describe('hasChanges computed value', () => {
    it('should be false when notes match original', () => {
      const { result } = renderHook(() => useDraftPlan({ plan: mockPlan }));

      expect(result.current.hasChanges).toBe(false);
    });

    it('should be true when notes differ from original', () => {
      const { result } = renderHook(() => useDraftPlan({ plan: mockPlan }));

      act(() => {
        result.current.setNotes('Different notes');
      });

      expect(result.current.hasChanges).toBe(true);
    });

    it('should be false when notes are set back to original', () => {
      const { result } = renderHook(() => useDraftPlan({ plan: mockPlan }));

      act(() => {
        result.current.setNotes('Changed');
      });

      expect(result.current.hasChanges).toBe(true);

      act(() => {
        result.current.setNotes(mockPlan.notes || '');
      });

      expect(result.current.hasChanges).toBe(false);
    });

    it('should handle empty string comparison correctly', () => {
      const planWithoutNotes = { ...mockPlan, notes: null };
      const { result } = renderHook(() => useDraftPlan({ plan: planWithoutNotes }));

      expect(result.current.hasChanges).toBe(false);

      act(() => {
        result.current.setNotes('Some notes');
      });

      expect(result.current.hasChanges).toBe(true);
    });
  });

  describe('error states', () => {
    it('should expose save error', () => {
      const saveError = new Error('Save failed');
      mockUseMutation.mockImplementation((options: MutationOptions) => {
        const isSaveMutation = options.mutationFn?.toString().includes('PATCH');
        if (isSaveMutation) {
          return {
            mutateAsync: mockSaveMutateAsync,
            isPending: false,
            error: saveError,
            isSuccess: false,
          };
        }
        return {
          mutateAsync: mockGenerateMutateAsync,
          isPending: false,
          error: null,
          isSuccess: false,
        };
      });

      const { result } = renderHook(() => useDraftPlan({ plan: mockPlan }));

      expect(result.current.saveError).toEqual(saveError);
    });

    it('should expose generate error', () => {
      const generateError = new Error('Generation failed');
      mockUseMutation.mockImplementation((options: MutationOptions) => {
        const isSaveMutation = options.mutationFn?.toString().includes('PATCH');
        if (!isSaveMutation) {
          return {
            mutateAsync: mockGenerateMutateAsync,
            isPending: false,
            error: generateError,
            isSuccess: false,
          };
        }
        return {
          mutateAsync: mockSaveMutateAsync,
          isPending: false,
          error: null,
          isSuccess: false,
        };
      });

      const { result } = renderHook(() => useDraftPlan({ plan: mockPlan }));

      expect(result.current.generateError).toEqual(generateError);
    });
  });

  describe('React Query integration', () => {
    it('should use correct query key for fixed points', () => {
      renderHook(() => useDraftPlan({ plan: mockPlan }));

      const queryCall = mockUseQuery.mock.calls[0][0];
      expect(queryCall.queryKey).toEqual(['fixedPoints', 'plan-1']);
    });

    it('should use different plan IDs in query keys', () => {
      const differentPlan = { ...mockPlan, id: 'plan-999' };
      renderHook(() => useDraftPlan({ plan: differentPlan }));

      const queryCall = mockUseQuery.mock.calls[0][0];
      expect(queryCall.queryKey).toEqual(['fixedPoints', 'plan-999']);
    });

    it('should call useQueryClient', () => {
      renderHook(() => useDraftPlan({ plan: mockPlan }));

      expect(ReactQuery.useQueryClient).toBeDefined();
    });
  });

  describe('edge cases', () => {
    it('should handle plan with empty string notes', () => {
      const planWithEmptyNotes = { ...mockPlan, notes: '' };
      const { result } = renderHook(() => useDraftPlan({ plan: planWithEmptyNotes }));

      expect(result.current.notes).toBe('');
      expect(result.current.hasChanges).toBe(false);

      act(() => {
        result.current.setNotes('New');
      });

      expect(result.current.hasChanges).toBe(true);
    });

    it('should handle whitespace-only notes', () => {
      const { result } = renderHook(() => useDraftPlan({ plan: mockPlan }));

      act(() => {
        result.current.setNotes('   ');
      });

      expect(result.current.notes).toBe('   ');
      expect(result.current.hasChanges).toBe(true);
    });

    it('should handle very long notes', () => {
      const longNotes = 'A'.repeat(10000);
      const { result } = renderHook(() => useDraftPlan({ plan: mockPlan }));

      act(() => {
        result.current.setNotes(longNotes);
      });

      expect(result.current.notes).toBe(longNotes);
      expect(result.current.hasChanges).toBe(true);
    });

    it('should handle special characters in notes', () => {
      const specialNotes = 'Notes with émojis 🎉 and symbols @#$%';
      const { result } = renderHook(() => useDraftPlan({ plan: mockPlan }));

      act(() => {
        result.current.setNotes(specialNotes);
      });

      expect(result.current.notes).toBe(specialNotes);
    });
  });
});
