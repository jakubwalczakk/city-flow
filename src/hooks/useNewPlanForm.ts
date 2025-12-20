import { useState, useEffect } from 'react';
import type {
  NewPlanViewModel,
  CreatePlanCommand,
  CreateFixedPointCommand,
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
          // Convert FixedPointDto to CreateFixedPointCommand format (without id/plan_id)
          const fixedPointCommands = fixedPoints.map((fp) => ({
            location: fp.location,
            event_at: fp.event_at,
            event_duration: fp.event_duration,
            description: fp.description,
          }));
          setFormData((prev) => ({ ...prev, fixedPoints: fixedPointCommands }));
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

  const addFixedPoint = (point: CreateFixedPointCommand) => {
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

  const updateFixedPoint = (index: number, point: CreateFixedPointCommand) => {
    setFormData((prev) => ({
      ...prev,
      fixedPoints: prev.fixedPoints.map((p, i) => (i === index ? point : p)),
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

    // First, delete all existing fixed points for this plan
    // This ensures we don't create duplicates when editing an existing draft
    try {
      const existingPointsResponse = await fetch(`/api/plans/${currentPlanId}/fixed-points`);
      if (existingPointsResponse.ok) {
        const existingPoints = (await existingPointsResponse.json()) as FixedPointDto[];

        // Delete all existing fixed points
        const deletePromises = existingPoints.map((point) =>
          fetch(`/api/plans/${currentPlanId}/fixed-points/${point.id}`, {
            method: 'DELETE',
          })
        );
        await Promise.all(deletePromises);
      }
    } catch {
      // Continue anyway - we'll try to create the new ones
    }

    // Now create all fixed points from the form
    // TODO: This should be a bulk update, not a series of individual requests
    if (formData.fixedPoints.length > 0) {
      const fixedPointPromises = formData.fixedPoints.map((point) =>
        fetch(`/api/plans/${currentPlanId}/fixed-points`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(point),
        })
      );

      const results = await Promise.allSettled(fixedPointPromises);
      const failedPoints = results.filter((r) => r.status === 'rejected');

      if (failedPoints.length > 0) {
        setError('Some fixed points failed to save.');
      }
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
