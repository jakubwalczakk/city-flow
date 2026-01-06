import { useState, useEffect } from 'react';
import type { NewPlanViewModel, CreatePlanCommand, FixedPointFormItem, PlanListItemDto } from '@/types';
import { PlanFormApiService } from '@/lib/services/planFormApi.service';
import {
  getDefaultStartDate,
  getDefaultEndDate,
  determineStartingStep,
  convertFixedPointsToFormItems,
  generateDefaultPlanName,
} from '@/lib/utils/planFormHelpers';

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
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState<NewPlanViewModel>(INITIAL_FORM_DATA);
  const [isLoading, setIsLoading] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [planId, setPlanId] = useState<string | null>(editingPlan ? editingPlan.id : null);

  // Load plan data when editing
  useEffect(() => {
    if (!editingPlan) return;

    const loadPlanData = async () => {
      setIsLoading(true);
      try {
        // Fetch plan details and fixed points in parallel
        const [planDetails, fixedPoints] = await Promise.all([
          PlanFormApiService.fetchPlanDetails(editingPlan.id),
          PlanFormApiService.fetchFixedPoints(editingPlan.id),
        ]);

        setPlanId(planDetails.id);
        setFormData({
          basicInfo: {
            name: planDetails.name,
            destination: planDetails.destination,
            start_date: new Date(planDetails.start_date),
            end_date: new Date(planDetails.end_date),
            notes: planDetails.notes || '',
          },
          fixedPoints: convertFixedPointsToFormItems(fixedPoints),
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

    loadPlanData();
  }, [editingPlan]);

  // Form data update methods
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

  // Step 1: Save or update basic plan info
  const saveBasicInfo = async (): Promise<string> => {
    const planName = formData.basicInfo.name || generateDefaultPlanName(formData.basicInfo.destination);

    if (planId) {
      // Update existing plan
      await PlanFormApiService.updatePlan(planId, {
        name: planName,
        start_date: formData.basicInfo.start_date.toISOString(),
        end_date: formData.basicInfo.end_date.toISOString(),
        notes: formData.basicInfo.notes || null,
      });
      return planId;
    } else {
      // Create new plan
      const createCommand: CreatePlanCommand = {
        name: planName,
        destination: formData.basicInfo.destination,
        start_date: formData.basicInfo.start_date.toISOString(),
        end_date: formData.basicInfo.end_date.toISOString(),
        notes: formData.basicInfo.notes || null,
      };

      const createdPlan = await PlanFormApiService.createPlan(createCommand);
      setPlanId(createdPlan.id);
      return createdPlan.id;
    }
  };

  // Step 2: Sync fixed points with server
  const saveFixedPoints = async (currentPlanId: string) => {
    if (!currentPlanId) return;

    const result = await PlanFormApiService.syncFixedPoints(currentPlanId, formData.fixedPoints);

    if (!result.success) {
      throw new Error(`Failed to save fixed point(s): ${result.errors[0]}`);
    }
  };

  // Save draft (called from "Save as draft" button)
  const saveDraft = async () => {
    setError(null);
    setIsLoading(true);

    try {
      if (currentStep === 0) {
        await saveBasicInfo();
      } else if (currentStep === 1) {
        // Ensure step 0 is saved first
        const currentPlanId = planId || (await saveBasicInfo());

        if (!currentPlanId) {
          throw new Error('Failed to create plan');
        }

        // Save fixed points
        await saveFixedPoints(currentPlanId);
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

  // Navigation methods
  const nextStep = () => {
    setError(null);
    setCurrentStep((prev) => Math.min(prev + 1, 2));
  };

  const prevStep = () => {
    setError(null);
    setCurrentStep((prev) => Math.max(prev - 1, 0));
  };

  const goToStep = (step: number) => {
    setError(null);
    // Only allow navigation to step 0 and current or previous steps
    if (step >= 0 && step <= currentStep) {
      setCurrentStep(step);
    }
  };

  // Submit and generate plan
  const handleSubmit = async () => {
    setIsLoading(true);
    setError(null);

    try {
      // Ensure the plan is saved
      let currentPlanId = planId;
      if (!currentPlanId) {
        currentPlanId = await saveBasicInfo();
      }

      // Save fixed points if any exist
      if (currentPlanId && formData.fixedPoints.length > 0) {
        await saveFixedPoints(currentPlanId);
      }

      // Ensure we have a planId after saving
      if (!currentPlanId) {
        throw new Error('Failed to save the plan. Please try again.');
      }

      // Switch to generating state
      setIsLoading(false);
      setIsGenerating(true);

      // Trigger AI generation
      await PlanFormApiService.generatePlan(currentPlanId);

      // Navigate or callback
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
