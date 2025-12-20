import { useState, useMemo, useCallback } from 'react';
import { usePlans } from '@/hooks/usePlans';
import type { PlansDashboardViewModel, PlanListItemDto } from '@/types';

const ITEMS_PER_PAGE = 12;

/**
 * Custom hook for managing PlansDashboard state and logic.
 * Handles tabs, pagination, modal state, and plan operations.
 */
export function usePlansDashboard() {
  const [activeTab, setActiveTab] = useState<PlansDashboardViewModel['activeTab']>('my-plans');
  const [currentPage, setCurrentPage] = useState(1);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPlan, setEditingPlan] = useState<PlanListItemDto | null>(null);

  const offset = (currentPage - 1) * ITEMS_PER_PAGE;

  // Determine status filter based on active tab
  const status = useMemo<('draft' | 'generated' | 'archived')[]>(
    () => (activeTab === 'my-plans' ? ['draft', 'generated'] : ['archived']),
    [activeTab]
  );

  // Fetch plans using custom hook
  const {
    data,
    isLoading,
    error,
    refetch: refetchPlans,
  } = usePlans({
    status,
    limit: ITEMS_PER_PAGE,
    offset,
    sortBy: 'created_at',
    order: 'desc',
  });

  // Memoized handlers to prevent unnecessary re-renders
  const handleTabChange = useCallback((value: string) => {
    setActiveTab(value as PlansDashboardViewModel['activeTab']);
    setCurrentPage(1);
  }, []);

  const handlePageChange = useCallback((newPage: number) => {
    setCurrentPage(newPage);
  }, []);

  const handleModalClose = useCallback(() => {
    setIsModalOpen(false);
    setEditingPlan(null);
    refetchPlans();
  }, [refetchPlans]);

  const handleCreatePlan = useCallback(() => {
    setEditingPlan(null);
    setIsModalOpen(true);
  }, []);

  const handlePlanClick = useCallback((plan: PlanListItemDto) => {
    if (plan.status === 'draft') {
      setEditingPlan(plan);
      setIsModalOpen(true);
    } else {
      window.location.href = `/plans/${plan.id}`;
    }
  }, []);

  const handlePlanDelete = useCallback(
    async (planId: string) => {
      try {
        const response = await fetch(`/api/plans/${planId}`, {
          method: 'DELETE',
        });

        if (!response.ok) {
          throw new Error('Failed to delete plan');
        }

        refetchPlans();
      } catch {
        // Error handling: could add a toast notification here
      }
    },
    [refetchPlans]
  );

  const plans = data?.data ?? [];
  const pagination = data?.pagination;
  const showPagination = pagination && pagination.total > ITEMS_PER_PAGE;

  return {
    // State
    activeTab,
    currentPage,
    isModalOpen,
    editingPlan,
    plans,
    pagination,
    isLoading,
    error,
    showPagination,

    // Handlers
    handleTabChange,
    handlePageChange,
    handleModalClose,
    handleCreatePlan,
    handlePlanClick,
    handlePlanDelete,
    setIsModalOpen,
    setEditingPlan,
  };
}
