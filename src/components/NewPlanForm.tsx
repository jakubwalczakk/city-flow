import { useNewPlanForm } from "@/hooks/useNewPlanForm";
import { StepIndicator } from "@/components/StepIndicator";
import { BasicInfoStep } from "@/components/BasicInfoStep";
import { FixedPointsStep } from "@/components/FixedPointsStep";
import { SummaryStep } from "@/components/SummaryStep";
import { Card, CardContent } from "@/components/ui/card";

const STEPS = ["Basic Info", "Fixed Points", "Review"];

export default function NewPlanForm() {
  const {
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
  } = useNewPlanForm();

  return (
    <div className="w-full">
      <StepIndicator currentStep={currentStep} steps={STEPS} />
      
      <Card>
        <CardContent className="pt-6">
          {currentStep === 1 && (
            <BasicInfoStep
              formData={formData.basicInfo}
              updateFormData={updateBasicInfo}
              goToNextStep={nextStep}
            />
          )}

          {currentStep === 2 && (
            <FixedPointsStep
              fixedPoints={formData.fixedPoints}
              addFixedPoint={addFixedPoint}
              removeFixedPoint={removeFixedPoint}
              goToNextStep={nextStep}
              goToPrevStep={prevStep}
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
    </div>
  );
}

