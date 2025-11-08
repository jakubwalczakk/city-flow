import { useState, useEffect } from "react";
import type {
  NewPlanViewModel,
  CreatePlanCommand,
  CreateFixedPointCommand,
  PlanDetailsDto,
  PlanListItemDto,
} from "@/types";

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
    name: "",
    destination: "",
    start_date: getDefaultStartDate(),
    end_date: getDefaultEndDate(),
    notes: "",
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
  const [error, setError] = useState<string | null>(null);
  const [planId, setPlanId] = useState<string | null>(
    editingPlan ? editingPlan.id : null
  );

  useEffect(() => {
    if (editingPlan) {
      setIsLoading(true);
      const fetchPlanDetails = async () => {
        try {
          const response = await fetch(`/api/plans/${editingPlan.id}`);
          if (!response.ok) {
            throw new Error("Failed to fetch plan details for editing.");
          }
          const planDetails: PlanDetailsDto = await response.json();
          setPlanId(planDetails.id);
          setFormData({
            basicInfo: {
              name: planDetails.name,
              destination: planDetails.destination,
              start_date: new Date(planDetails.start_date),
              end_date: new Date(planDetails.end_date),
              notes: planDetails.notes || "",
            },
            fixedPoints: [], // These will be fetched next
          });
        } catch (err) {
          setError(
            err instanceof Error ? err.message : "Could not load plan details"
          );
        } finally {
          setIsLoading(false);
        }
      };

      const fetchFixedPoints = async () => {
        try {
          const response = await fetch(`/api/plans/${editingPlan.id}/fixed-points`);
          if (!response.ok) {
            throw new Error("Failed to fetch fixed points");
          }
          const fixedPoints = await response.json();
          setFormData((prev) => ({ ...prev, fixedPoints }));
        } catch (err) {
          setError(
            err instanceof Error ? err.message : "Could not load draft details"
          );
        }
      };

      const loadDataForEditing = async () => {
        await fetchPlanDetails();
        await fetchFixedPoints();
      };

      loadDataForEditing();
    }
  }, [editingPlan]);

  const updateBasicInfo = (
    data: Partial<NewPlanViewModel["basicInfo"]>
  ) => {
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

  const saveStep1 = async () => {
    const planCommand: CreatePlanCommand = {
      name:
        formData.basicInfo.name || `${formData.basicInfo.destination} trip`,
      destination: formData.basicInfo.destination,
      start_date: formData.basicInfo.start_date.toISOString(),
      end_date: formData.basicInfo.end_date.toISOString(),
      notes: formData.basicInfo.notes || null,
    };

    const url = planId ? `/api/plans/${planId}` : "/api/plans";
    const method = planId ? "PUT" : "POST";

    const response = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(planCommand),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || "Failed to save plan");
    }

    if (!planId) {
      const createdPlan: PlanDetailsDto = await response.json();
      setPlanId(createdPlan.id);
    }
  };

  const saveStep2 = async () => {
    if (!planId) return;

    // TODO: This should be a bulk update, not a series of individual requests
    if (formData.fixedPoints.length > 0) {
      const fixedPointPromises = formData.fixedPoints.map((point) =>
        fetch(`/api/plans/${planId}/fixed-points`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(point),
        })
      );

      const results = await Promise.allSettled(fixedPointPromises);
      const failedPoints = results.filter((r) => r.status === "rejected");

      if (failedPoints.length > 0) {
        console.error("Some fixed points failed to save:", failedPoints);
        setError("Some fixed points failed to save.");
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
        await saveStep2();
      }
      if (onFinished) {
        onFinished();
      }
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "An unexpected error occurred"
      );
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

  const handleSubmit = async () => {
    if (!planId) {
      setError("Please save the plan before generating.");
      return;
    }
    setIsLoading(true);
    setError(null);

    try {
      // Trigger the AI generation
      const generationResponse = await fetch(`/api/plans/${planId}/generate`, {
        method: "POST",
      });

      if (!generationResponse.ok) {
        const errorData = await generationResponse.json();
        throw new Error(
          errorData.error || "Failed to generate the plan itinerary."
        );
      }

      if (onFinished) {
        onFinished();
      } else {
        window.location.href = `/plans/${planId}`;
      }
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "An unexpected error occurred"
      );
    } finally {
      setIsLoading(false);
    }
  };

  return {
    currentStep,
    formData,
    isLoading,
    error,
    updateBasicInfo,
    addFixedPoint,
    removeFixedPoint,
    updateFixedPoint,
    nextStep,
    prevStep,
    handleSubmit,
    saveDraft,
  };
}

