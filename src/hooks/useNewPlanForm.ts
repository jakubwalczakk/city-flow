import { useState } from "react";
import type {
  NewPlanViewModel,
  CreatePlanCommand,
  CreateFixedPointCommand,
} from "@/types";

const INITIAL_FORM_DATA: NewPlanViewModel = {
  basicInfo: {
    name: "",
    destination: "",
    start_date: null,
    end_date: null,
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
        name: formData.basicInfo.name,
        destination: formData.basicInfo.destination,
        start_date: formData.basicInfo.start_date?.toISOString() || null,
        end_date: formData.basicInfo.end_date?.toISOString() || null,
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
          throw new Error(
            "Plan created, but some fixed points failed to save"
          );
        }
      }

      // Success! Redirect to plan details
      window.location.href = `/plans/${planId}`;
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
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

