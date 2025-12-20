import { useState, useEffect } from 'react';
import type {
  NewPlanViewModel,
  CreatePlanCommand,
  FixedPointFormItem,
  PlanDetailsDto,
  PlanListItemDto,
  FixedPointDto,
} from '@/types';

// Helper function to create default start date (tomorrow at 9:00 AM)
const getDefaultStartDate = (): Date => {
  const date = new Date();
  date.setDate(date.getDate() + 1);
  date.setHours(9, 0, 0, 0);
  return date;
};

// Helper function to create default end date (3 days from tomorrow at 18:00)
const getDefaultEndDate = (): Date => {
  const date = new Date();
  date.setDate(date.getDate() + 4);
  date.setHours(18, 0, 0, 0);
  return date;
};

const INITIAL_FORM_DATA: NewPlanViewModel = {
  basicInfo: {
    name: '',
    destination: '',
    start_date: getDefaultStartDate(),
    end_date: getDefaultEndDate(),
    notes: '',
  },
  fixedPoints: [],
};

export function useNewPlanForm({
  onFinished,
  editingPlan,
}: { onFinished?: () => void; editingPlan?: PlanListItemDto | null } = {}) {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<NewPlanViewModel>(INITIAL_FORM_DATA);
  const [isLoading, setIsLoading] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [planId, setPlanId] = useState<string | null>(editingPlan ? editingPlan.id : null);

  // Determine the starting step based on what's already filled in
  const determineStartingStep = (plan: PlanDetailsDto): number => {
    // Check if basic info (step 1) is complete
    const hasBasicInfo = plan.name && plan.destination && plan.start_date && plan.end_date;

    if (!hasBasicInfo) {
      return 1; // Start from the beginning
    }

    // If basic info is complete, start from step 2 (fixed points)
    return 2;
  };

  useEffect(() => {
    if (editingPlan) {
      setIsLoading(true);
      const fetchPlanDetails = async () => {
        try {
          const response = await fetch(`/api/plans/${editingPlan.id}`);
          if (!response.ok) {
            throw new Error('Failed to fetch plan details for editing.');
          }
          const planDetails: PlanDetailsDto = await response.json();
          setPlanId(planDetails.id);
          setFormData({
            basicInfo: {
              name: planDetails.name,
              destination: planDetails.destination,
              start_date: new Date(planDetails.start_date),
              end_date: new Date(planDetails.end_date),
              notes: planDetails.notes || '',
            },
            fixedPoints: [], // These will be fetched next
          });

          // Set the starting step based on what's already filled
          const startingStep = determineStartingStep(planDetails);
          setCurrentStep(startingStep);
        } catch (err) {
          setError(err instanceof Error ? err.message : 'Could not load plan details');
        } finally {
          setIsLoading(false);
        }
      };

      const fetchFixedPoints = async () => {
        try {
          const response = await fetch(`/api/plans/${editingPlan.id}/fixed-points`);
          if (!response.ok) {
            throw new Error('Failed to fetch fixed points');
          }
          const fixedPoints = (await response.json()) as FixedPointDto[];
          // Convert FixedPointDto to FixedPointFormItem format (preserve id for updates)
          const fixedPointItems: FixedPointFormItem[] = fixedPoints.map((fp) => ({
            id: fp.id, // Preserve ID for PATCH updates
            location: fp.location,
            event_at: fp.event_at,
            event_duration: fp.event_duration,
            description: fp.description,
          }));
          setFormData((prev) => ({ ...prev, fixedPoints: fixedPointItems }));
        } catch (err) {
          setError(err instanceof Error ? err.message : 'Could not load draft details');
        }
      };

      const loadDataForEditing = async () => {
        await fetchPlanDetails();
        await fetchFixedPoints();
      };

      loadDataForEditing();
    }
  }, [editingPlan]);

  const updateBasicInfo = (data: Partial<NewPlanViewModel['basicInfo']>) => {
    setFormData((prev) => ({
      ...prev,
      basicInfo: { ...prev.basicInfo, ...data },
    }));
  };

  const addFixedPoint = (point: FixedPointFormItem) => {
    setFormData((prev) => ({
      ...prev,
      fixedPoints: [...prev.fixedPoints, point],
    }));
  };

  const removeFixedPoint = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      fixedPoints: prev.fixedPoints.filter((_, i) => i !== index),
    }));
  };

  const updateFixedPoint = (index: number, point: FixedPointFormItem) => {
    setFormData((prev) => ({
      ...prev,
      // Preserve the ID from the existing point when updating
      fixedPoints: prev.fixedPoints.map((p, i) => (i === index ? { ...point, id: p.id } : p)),
    }));
  };

  const saveStep1 = async (): Promise<string> => {
    if (planId) {
      // Update existing plan - only send allowed fields for PATCH
      const updateCommand = {
        name: formData.basicInfo.name || `${formData.basicInfo.destination} trip`,
        start_date: formData.basicInfo.start_date.toISOString(),
        end_date: formData.basicInfo.end_date.toISOString(),
        notes: formData.basicInfo.notes || null,
      };

      const response = await fetch(`/api/plans/${planId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updateCommand),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update plan');
      }

      return planId;
    } else {
      // Create new plan
      const createCommand: CreatePlanCommand = {
        name: formData.basicInfo.name || `${formData.basicInfo.destination} trip`,
        destination: formData.basicInfo.destination,
        start_date: formData.basicInfo.start_date.toISOString(),
        end_date: formData.basicInfo.end_date.toISOString(),
        notes: formData.basicInfo.notes || null,
      };

      const response = await fetch('/api/plans', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(createCommand),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create plan');
      }

      const createdPlan: PlanDetailsDto = await response.json();
      setPlanId(createdPlan.id);
      return createdPlan.id;
    }
  };

  const saveStep2 = async (currentPlanId: string) => {
    if (!currentPlanId) return;

    // Step 1: Get existing fixed points from the database
    let existingPointIds: string[] = [];
    try {
      const existingPointsResponse = await fetch(`/api/plans/${currentPlanId}/fixed-points`);
      if (existingPointsResponse.ok) {
        const existingPoints = (await existingPointsResponse.json()) as FixedPointDto[];
        existingPointIds = existingPoints.map((point) => point.id);
      }
    } catch {
      // If we can't fetch existing points, continue
    }

    // Step 2: Separate points into existing (PATCH) and new (POST)
    const pointsToUpdate = formData.fixedPoints.filter((p) => p.id);
    const pointsToCreate = formData.fixedPoints.filter((p) => !p.id);
    const formPointIds = formData.fixedPoints.map((p) => p.id).filter(Boolean) as string[];
    const pointsToDelete = existingPointIds.filter((id) => !formPointIds.includes(id));

    const failedResults: string[] = [];

    // Helper function to check response and collect errors
    const checkResponse = async (result: PromiseSettledResult<Response>, operation: string) => {
      if (result.status === 'rejected') {
        failedResults.push(`${operation}: ${result.reason?.message || 'Network error'}`);
      } else if (!result.value.ok) {
        try {
          const errorData = await result.value.json();
          let errorMessage = errorData.error || `HTTP ${result.value.status}`;
          if (errorData.details?.fieldErrors) {
            const fieldMessages = Object.entries(errorData.details.fieldErrors)
              .map(([field, messages]) => `${field}: ${(messages as string[]).join(', ')}`)
              .join('; ');
            errorMessage += ` (${fieldMessages})`;
          }
          console.error(`${operation} error:`, errorData);
          failedResults.push(errorMessage);
        } catch {
          failedResults.push(`${operation}: HTTP ${result.value.status}`);
        }
      }
    };

    // Helper to normalize date to ISO 8601 format with Z suffix
    const normalizeEventAt = (eventAt: string): string => {
      if (!eventAt) return eventAt;
      try {
        return new Date(eventAt).toISOString();
      } catch {
        return eventAt;
      }
    };

    // Step 3: Update existing points (PATCH)
    if (pointsToUpdate.length > 0) {
      const updatePromises = pointsToUpdate.map((point) =>
        fetch(`/api/plans/${currentPlanId}/fixed-points/${point.id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            location: point.location,
            event_at: normalizeEventAt(point.event_at),
            event_duration: point.event_duration,
            description: point.description,
          }),
        })
      );

      const updateResults = await Promise.allSettled(updatePromises);
      for (const result of updateResults) {
        await checkResponse(result, 'Update');
      }
    }

    // Step 4: Create new points (POST)
    if (pointsToCreate.length > 0) {
      const createPromises = pointsToCreate.map((point) =>
        fetch(`/api/plans/${currentPlanId}/fixed-points`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            location: point.location,
            event_at: normalizeEventAt(point.event_at),
            event_duration: point.event_duration,
            description: point.description,
          }),
        })
      );

      const createResults = await Promise.allSettled(createPromises);
      for (const result of createResults) {
        await checkResponse(result, 'Create');
      }
    }

    // Step 5: Delete removed points (only after updates/creates succeed)
    if (failedResults.length === 0 && pointsToDelete.length > 0) {
      const deletePromises = pointsToDelete.map((pointId) =>
        fetch(`/api/plans/${currentPlanId}/fixed-points/${pointId}`, {
          method: 'DELETE',
        })
      );
      // We don't throw on delete failure - updates/creates are already saved
      await Promise.allSettled(deletePromises);
    }

    if (failedResults.length > 0) {
      console.error('Failed to save fixed points:', failedResults);
      throw new Error(`Failed to save fixed point(s): ${failedResults[0]}`);
    }
  };

  const saveDraft = async () => {
    setError(null);
    setIsLoading(true);
    try {
      if (currentStep === 1) {
        await saveStep1();
      } else if (currentStep === 2) {
        // First ensure step 1 is saved (if not already)
        const currentPlanId = planId || (await saveStep1());
        if (!currentPlanId) {
          throw new Error('Failed to create plan');
        }
        // Now save step 2
        await saveStep2(currentPlanId);
      }
      if (onFinished) {
        onFinished();
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unexpected error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const nextStep = () => {
    setError(null);
    setCurrentStep((prev) => Math.min(prev + 1, 3));
  };

  const prevStep = () => {
    setError(null);
    setCurrentStep((prev) => Math.max(prev - 1, 1));
  };

  const goToStep = (step: number) => {
    setError(null);
    // Only allow navigation to step 1 and current or previous steps
    if (step >= 1 && step <= currentStep) {
      setCurrentStep(step);
    }
  };

  const handleSubmit = async () => {
    setIsLoading(true);
    setError(null);

    try {
      // Save the plan first if it hasn't been saved yet, and get the plan ID
      let currentPlanId = planId;
      if (!currentPlanId) {
        currentPlanId = await saveStep1();
      }

      // Save fixed points if any exist
      if (currentPlanId && formData.fixedPoints.length > 0) {
        await saveStep2(currentPlanId);
      }

      // Ensure we have a planId after saving
      if (!currentPlanId) {
        throw new Error('Failed to save the plan. Please try again.');
      }

      // Switch to generating state to show the loading animation
      setIsLoading(false);
      setIsGenerating(true);

      // Trigger the AI generation
      const generationResponse = await fetch(`/api/plans/${currentPlanId}/generate`, {
        method: 'POST',
      });

      if (!generationResponse.ok) {
        const errorData = await generationResponse.json();
        // Prepend a user-friendly message to the error from the AI
        const message = errorData.error
          ? `The plan could not be generated: ${errorData.error}`
          : 'An unknown error occurred during plan generation.';
        throw new Error(message);
      }

      if (onFinished) {
        onFinished();
      } else {
        window.location.href = `/plans/${currentPlanId}`;
      }
    } catch (err) {
      setIsGenerating(false);
      setError(err instanceof Error ? err.message : 'An unexpected error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  return {
    currentStep,
    formData,
    isLoading,
    isGenerating,
    error,
    updateBasicInfo,
    addFixedPoint,
    removeFixedPoint,
    updateFixedPoint,
    nextStep,
    prevStep,
    goToStep,
    handleSubmit,
    saveDraft,
  };
}
