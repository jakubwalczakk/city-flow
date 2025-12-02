import { useNewPlanForm } from "@/hooks/useNewPlanForm";
import { StepIndicator } from "@/components/StepIndicator";
import { BasicInfoStep } from "@/components/BasicInfoStep";
import { FixedPointsStep } from "@/components/FixedPointsStep";
import { SummaryStep } from "@/components/SummaryStep";
import { Card, CardContent } from "@/components/ui/card";
import { PlanGenerationLoading } from "@/components/PlanGenerationLoading";
import type { PlanListItemDto } from "@/types";

const STEPS = ["Basic Info", "Fixed Points", "Review"];

export default function NewPlanForm({
  onFinished,
  editingPlan,
}: {
  onFinished?: () => void;
  editingPlan?: PlanListItemDto | null;
}) {
  const {
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
    handleSubmit,
    saveDraft,
  } = useNewPlanForm({ onFinished, editingPlan });

  return (
    <div className="w-full">
      {/* Show loading animation when generating */}
      {isGenerating ? (
        <PlanGenerationLoading planName={formData.basicInfo.name || `${formData.basicInfo.destination} trip`} />
      ) : (
        <>
          <StepIndicator currentStep={currentStep} steps={STEPS} />

          <Card>
            <CardContent className="pt-6">
              {currentStep === 1 && (
                <BasicInfoStep
                  formData={formData.basicInfo}
                  updateFormData={updateBasicInfo}
                  goToNextStep={nextStep}
                  onCancel={() => onFinished?.()}
                  isLoading={isLoading}
                  error={error}
                  onSave={saveDraft}
                />
              )}

              {currentStep === 2 && (
                <FixedPointsStep
                  fixedPoints={formData.fixedPoints}
                  addFixedPoint={addFixedPoint}
                  removeFixedPoint={removeFixedPoint}
                  updateFixedPoint={updateFixedPoint}
                  goToNextStep={nextStep}
                  goToPrevStep={prevStep}
                  onCancel={() => onFinished?.()}
                  isLoading={isLoading}
                  error={error}
                  onSave={saveDraft}
                />
              )}

              {currentStep === 3 && (
                <SummaryStep
                  formData={formData}
                  goToPrevStep={prevStep}
                  onSubmit={handleSubmit}
                  isLoading={isLoading}
                  error={error}
                />
              )}
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
