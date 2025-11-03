import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { DatePicker } from "@/components/ui/date-picker";
import { Button } from "@/components/ui/button";
import { basicInfoSchema, type BasicInfoFormData } from "@/lib/schemas/plan.schema";
import type { NewPlanViewModel } from "@/types";

interface BasicInfoStepProps {
  formData: NewPlanViewModel["basicInfo"];
  updateFormData: (data: Partial<NewPlanViewModel["basicInfo"]>) => void;
  goToNextStep: () => void;
}

export function BasicInfoStep({
  formData,
  updateFormData,
  goToNextStep,
}: BasicInfoStepProps) {
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateAndProceed = () => {
    try {
      basicInfoSchema.parse(formData);
      setErrors({});
      goToNextStep();
    } catch (error) {
      if (error instanceof Error && "errors" in error) {
        const zodError = error as any;
        const newErrors: Record<string, string> = {};
        zodError.errors.forEach((err: any) => {
          const path = err.path[0];
          newErrors[path] = err.message;
        });
        setErrors(newErrors);
      }
    }
  };

  const isFormValid = () => {
    try {
      basicInfoSchema.parse(formData);
      return true;
    } catch {
      return false;
    }
  };

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="name">
          Plan Name <span className="text-destructive">*</span>
        </Label>
        <Input
          id="name"
          placeholder="e.g., Weekend in Paris"
          value={formData.name}
          onChange={(e) => updateFormData({ name: e.target.value })}
          className={errors.name ? "border-destructive" : ""}
        />
        {errors.name && (
          <p className="text-sm text-destructive">{errors.name}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="destination">
          Destination <span className="text-destructive">*</span>
        </Label>
        <Input
          id="destination"
          placeholder="e.g., Paris, France"
          value={formData.destination}
          onChange={(e) => updateFormData({ destination: e.target.value })}
          className={errors.destination ? "border-destructive" : ""}
        />
        {errors.destination && (
          <p className="text-sm text-destructive">{errors.destination}</p>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Start Date</Label>
          <DatePicker
            date={formData.start_date}
            onSelect={(date) => updateFormData({ start_date: date || null })}
            placeholder="Select start date"
          />
          {errors.start_date && (
            <p className="text-sm text-destructive">{errors.start_date}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label>End Date</Label>
          <DatePicker
            date={formData.end_date}
            onSelect={(date) => updateFormData({ end_date: date || null })}
            placeholder="Select end date"
            minDate={formData.start_date || undefined}
          />
          {errors.end_date && (
            <p className="text-sm text-destructive">{errors.end_date}</p>
          )}
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="notes">Notes</Label>
        <Textarea
          id="notes"
          placeholder="Add any additional notes or preferences for your trip..."
          value={formData.notes}
          onChange={(e) => updateFormData({ notes: e.target.value })}
          rows={4}
        />
        <p className="text-sm text-muted-foreground">
          Include any preferences, special requirements, or ideas you have for
          this trip.
        </p>
      </div>

      <div className="flex justify-end pt-4">
        <Button onClick={validateAndProceed} disabled={!isFormValid()}>
          Next
        </Button>
      </div>
    </div>
  );
}

