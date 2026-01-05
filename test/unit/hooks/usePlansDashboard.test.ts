import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { usePlansDashboard } from '@/hooks/usePlansDashboard';
import * as usePlansModule from '@/hooks/usePlans';
import type { PlanListItemDto } from '@/types';

// Mock usePlans hook
vi.mock('@/hooks/usePlans');

// Mock window.location.href
Object.defineProperty(window, 'location', {
  value: { href: '' },
  writable: true,
});

describe('usePlansDashboard', () => {
  const mockPlans: PlanListItemDto[] = [
    {
      id: 'plan-1',
      name: 'Paris Trip',
      destination: 'Paris',
      status: 'draft' as const,
      created_at: '2024-01-15',
    },
    {
      id: 'plan-2',
      name: 'London Trip',
      destination: 'London',
      status: 'generated' as const,
      created_at: '2024-01-10',
    },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(usePlansModule.usePlans).mockReturnValue({
      data: {
        data: mockPlans,
        pagination: {
          total: 25,
          limit: 12,
          offset: 0,
        },
      },
      isLoading: false,
      error: null,
      refetch: vi.fn(),
    } as ReturnType<typeof usePlansModule.usePlans>);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('initialization', () => {
    it('should initialize with correct default state', () => {
      const { result } = renderHook(() => usePlansDashboard());

      expect(result.current.activeTab).toBe('my-plans');
      expect(result.current.currentPage).toBe(1);
      expect(result.current.isModalOpen).toBe(false);
      expect(result.current.editingPlan).toBeNull();
    });

    it('should have plans from usePlans hook', () => {
      const { result } = renderHook(() => usePlansDashboard());

      expect(result.current.plans).toEqual(mockPlans);
    });
  });

  describe('tab management', () => {
    it('should switch to archived tab', () => {
      const { result } = renderHook(() => usePlansDashboard());

      expect(result.current.activeTab).toBe('my-plans');

      act(() => {
        result.current.handleTabChange('archived');
      });

      expect(result.current.activeTab).toBe('archived');
    });

    it('should reset page when changing tabs', () => {
      const { result } = renderHook(() => usePlansDashboard());

      act(() => {
        result.current.handlePageChange(3);
      });

      expect(result.current.currentPage).toBe(3);

      act(() => {
        result.current.handleTabChange('archived');
      });

      expect(result.current.currentPage).toBe(1);
    });
  });

  describe('pagination', () => {
    it('should change page', () => {
      const { result } = renderHook(() => usePlansDashboard());

      expect(result.current.currentPage).toBe(1);

      act(() => {
        result.current.handlePageChange(2);
      });

      expect(result.current.currentPage).toBe(2);
    });

    it('should show pagination when needed', () => {
      const { result } = renderHook(() => usePlansDashboard());

      expect(result.current.showPagination).toBe(true);
    });

    it('should not show pagination when total <= limit', () => {
      vi.mocked(usePlansModule.usePlans).mockReturnValue({
        data: {
          data: mockPlans,
          pagination: {
            total: 10,
            limit: 12,
            offset: 0,
          },
        },
        isLoading: false,
        error: null,
        refetch: vi.fn(),
      } as ReturnType<typeof usePlansModule.usePlans>);

      const { result } = renderHook(() => usePlansDashboard());

      expect(result.current.showPagination).toBe(false);
    });
  });

  describe('modal management', () => {
    it('should open modal for creating new plan', () => {
      const { result } = renderHook(() => usePlansDashboard());

      expect(result.current.isModalOpen).toBe(false);

      act(() => {
        result.current.handleCreatePlan();
      });

      expect(result.current.isModalOpen).toBe(true);
      expect(result.current.editingPlan).toBeNull();
    });

    it('should open modal with plan for editing draft', () => {
      const { result } = renderHook(() => usePlansDashboard());

      const draftPlan = mockPlans[0];

      act(() => {
        result.current.handlePlanClick(draftPlan);
      });

      expect(result.current.isModalOpen).toBe(true);
      expect(result.current.editingPlan).toEqual(draftPlan);
    });

    it('should navigate to plan details for generated plans', () => {
      const { result } = renderHook(() => usePlansDashboard());

      const generatedPlan = mockPlans[1];

      act(() => {
        result.current.handlePlanClick(generatedPlan);
      });

      expect(window.location.href).toBe(`/plans/${generatedPlan.id}`);
    });

    it('should close modal and reset state', () => {
      const mockRefetch = vi.fn();
      vi.mocked(usePlansModule.usePlans).mockReturnValue({
        data: {
          data: mockPlans,
          pagination: {
            total: 25,
            limit: 12,
            offset: 0,
          },
        },
        isLoading: false,
        error: null,
        refetch: mockRefetch,
      } as ReturnType<typeof usePlansModule.usePlans>);

      const { result } = renderHook(() => usePlansDashboard());

      act(() => {
        result.current.handleCreatePlan();
      });

      expect(result.current.isModalOpen).toBe(true);

      act(() => {
        result.current.handleModalClose();
      });

      expect(result.current.isModalOpen).toBe(false);
      expect(result.current.editingPlan).toBeNull();
      expect(mockRefetch).toHaveBeenCalled();
    });
  });

  describe('plan deletion', () => {
    it('should delete plan and refetch', async () => {
      const mockFetch = vi.fn().mockResolvedValue({ ok: true });
      global.fetch = mockFetch;

      const mockRefetch = vi.fn();
      vi.mocked(usePlansModule.usePlans).mockReturnValue({
        data: {
          data: mockPlans,
          pagination: {
            total: 25,
            limit: 12,
            offset: 0,
          },
        },
        isLoading: false,
        error: null,
        refetch: mockRefetch,
      } as ReturnType<typeof usePlansModule.usePlans>);

      const { result } = renderHook(() => usePlansDashboard());

      await act(async () => {
        await result.current.handlePlanDelete('plan-1');
      });

      expect(mockFetch).toHaveBeenCalledWith('/api/plans/plan-1', { method: 'DELETE' });
      expect(mockRefetch).toHaveBeenCalled();
    });

    it('should handle deletion errors gracefully', async () => {
      const mockFetch = vi.fn().mockResolvedValue({ ok: false });
      global.fetch = mockFetch;

      const mockRefetch = vi.fn();
      vi.mocked(usePlansModule.usePlans).mockReturnValue({
        data: {
          data: mockPlans,
          pagination: {
            total: 25,
            limit: 12,
            offset: 0,
          },
        },
        isLoading: false,
        error: null,
        refetch: mockRefetch,
      } as ReturnType<typeof usePlansModule.usePlans>);

      const { result } = renderHook(() => usePlansDashboard());

      await act(async () => {
        await result.current.handlePlanDelete('plan-1');
      });

      // Should not throw and should still attempt refetch
      expect(mockFetch).toHaveBeenCalled();
    });
  });

  describe('state setters', () => {
    it('should allow direct modal state manipulation', () => {
      const { result } = renderHook(() => usePlansDashboard());

      act(() => {
        result.current.setIsModalOpen(true);
      });

      expect(result.current.isModalOpen).toBe(true);
    });

    it('should allow setting editing plan directly', () => {
      const { result } = renderHook(() => usePlansDashboard());

      const plan = mockPlans[0];

      act(() => {
        result.current.setEditingPlan(plan);
      });

      expect(result.current.editingPlan).toEqual(plan);
    });
  });
});
