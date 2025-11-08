import { useState } from "react";
import type {
  NewPlanViewModel,
  CreatePlanCommand,
  CreateFixedPointCommand,
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

export function useNewPlanForm() {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<NewPlanViewModel>(INITIAL_FORM_DATA);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

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

  const nextStep = () => {
    setError(null);
    setCurrentStep((prev) => Math.min(prev + 1, 3));
  };

  const prevStep = () => {
    setError(null);
    setCurrentStep((prev) => Math.max(prev - 1, 1));
  };

  const handleSubmit = async () => {
    setIsLoading(true);
    setError(null);

    try {
      // Step 1: Create the plan draft
      const planCommand: CreatePlanCommand = {
        name: formData.basicInfo.name || `${formData.basicInfo.destination} trip`,
        destination: formData.basicInfo.destination,
        start_date: formData.basicInfo.start_date.toISOString(),
        end_date: formData.basicInfo.end_date.toISOString(),
        notes: formData.basicInfo.notes || null,
      };

      const planResponse = await fetch("/api/plans", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(planCommand),
      });

      if (!planResponse.ok) {
        const errorData = await planResponse.json();
        throw new Error(errorData.error || "Failed to create plan");
      }

      const createdPlan = await planResponse.json();
      const planId = createdPlan.id;

      // Step 2: Add fixed points if any
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
          // Non-fatal error, we can still proceed to generation
          setError("Plan draft created, but some fixed points failed to save.");
        }
      }

      // Step 3: Trigger the AI generation
      const generationResponse = await fetch(`/api/plans/${planId}/generate`, {
        method: "POST",
      });

      if (!generationResponse.ok) {
        const errorData = await generationResponse.json();
        throw new Error(errorData.error || "Failed to generate the plan itinerary.");
      }

      // Success! Redirect to the newly generated plan details page
      window.location.href = `/plans/${planId}`;
    } catch (err) {
      setError(err instanceof Error ? err.message : "An unexpected error occurred");
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
    nextStep,
    prevStep,
    handleSubmit,
  };
}

