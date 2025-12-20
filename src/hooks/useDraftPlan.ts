import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import type { PlanDetailsDto, UpdatePlanCommand, FixedPointDto } from '@/types';

type UseDraftPlanProps = {
  plan: PlanDetailsDto;
};

/**
 * Custom hook for managing draft plan operations
 * Uses React Query for data fetching and mutations
 */
export function useDraftPlan({ plan }: UseDraftPlanProps) {
  const queryClient = useQueryClient();
  const [notes, setNotes] = useState(plan.notes || '');

  // Fetch fixed points
  const {
    data: fixedPoints = [],
    isLoading: isLoadingFixedPoints,
    error: fixedPointsError,
  } = useQuery<FixedPointDto[]>({
    queryKey: ['fixedPoints', plan.id],
    queryFn: async () => {
      const response = await fetch(`/api/plans/${plan.id}/fixed-points`);
      if (!response.ok) {
        throw new Error('Failed to fetch fixed points');
      }
      return response.json();
    },
  });

  // Save plan mutation
  const savePlanMutation = useMutation({
    mutationFn: async (command: UpdatePlanCommand) => {
      const response = await fetch(`/api/plans/${plan.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(command),
      });

      if (!response.ok) {
        throw new Error('Failed to save changes');
      }

      return response.json();
    },
    onSuccess: () => {
      // Invalidate plan queries to refetch
      queryClient.invalidateQueries({ queryKey: ['plan', plan.id] });
    },
  });

  // Generate plan mutation
  const generatePlanMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch(`/api/plans/${plan.id}/generate`, {
        method: 'POST',
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to generate plan');
      }

      return response.json();
    },
    onSuccess: () => {
      // Invalidate plan queries and redirect will happen in component
      queryClient.invalidateQueries({ queryKey: ['plan', plan.id] });
    },
  });

  const handleSave = async () => {
    await savePlanMutation.mutateAsync({ notes });
  };

  const handleGenerate = async () => {
    // Auto-save before generating if there are changes
    if (notes !== (plan.notes || '')) {
      await savePlanMutation.mutateAsync({ notes });
    }
    await generatePlanMutation.mutateAsync();
  };

  const hasChanges = notes !== (plan.notes || '');

  return {
    notes,
    setNotes,
    hasChanges,
    fixedPoints,
    isLoadingFixedPoints,
    fixedPointsError,
    handleSave,
    handleGenerate,
    isSaving: savePlanMutation.isPending,
    isGenerating: generatePlanMutation.isPending,
    saveError: savePlanMutation.error,
    generateError: generatePlanMutation.error,
    saveSuccess: savePlanMutation.isSuccess,
  };
}
