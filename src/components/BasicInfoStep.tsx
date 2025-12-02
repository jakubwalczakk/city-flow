import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { basicInfoSchema } from "@/lib/schemas/plan.schema";
import type { NewPlanViewModel } from "@/types";
import { ZodError } from "zod";

interface BasicInfoStepProps {
  formData: NewPlanViewModel["basicInfo"];
  updateFormData: (data: Partial<NewPlanViewModel["basicInfo"]>) => void;
  goToNextStep: () => void;
  onCancel: () => void;
  isLoading: boolean;
  error: string | null;
  onSave: () => Promise<void>;
}

export function BasicInfoStep({
  formData,
  updateFormData,
  goToNextStep,
  onCancel,
  isLoading,
  error,
  onSave,
}: BasicInfoStepProps) {
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Convert Date to datetime-local string format (YYYY-MM-DDTHH:mm)
  const dateToDateTimeLocal = (date: Date): string => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    const hours = String(date.getHours()).padStart(2, "0");
    const minutes = String(date.getMinutes()).padStart(2, "0");
    return `${year}-${month}-${day}T${hours}:${minutes}`;
  };

  // Convert datetime-local string to Date
  const dateTimeLocalToDate = (dateTimeLocal: string): Date => {
    return new Date(dateTimeLocal);
  };

  const validateAndProceed = () => {
    try {
      basicInfoSchema.parse(formData);
      setErrors({});
      goToNextStep();
    } catch (error) {
      if (error instanceof ZodError) {
        const newErrors: Record<string, string> = {};
        error.errors.forEach((err) => {
          const path = err.path[0];
          if (typeof path === "string") {
            newErrors[path] = err.message;
          }
        });
        setErrors(newErrors);
      }
    }
  };

  const handleSave = () => {
    try {
      basicInfoSchema.parse(formData);
      setErrors({});
      onSave();
    } catch (error) {
      if (error instanceof ZodError) {
        const newErrors: Record<string, string> = {};
        error.errors.forEach((err) => {
          const path = err.path[0];
          if (typeof path === "string") {
            newErrors[path] = err.message;
          }
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
          Nazwa planu <span className="text-destructive">*</span>
        </Label>
        <Input
          id="name"
          placeholder="np. Weekend w Paryżu"
          value={formData.name}
          onChange={(e) => updateFormData({ name: e.target.value })}
          className={errors.name ? "border-destructive" : ""}
        />
        {errors.name && <p className="text-sm text-destructive">{errors.name}</p>}
      </div>

      <div className="space-y-2">
        <Label htmlFor="destination">
          Miejsce docelowe <span className="text-destructive">*</span>
        </Label>
        <Input
          id="destination"
          placeholder="np. Paryż, Francja"
          value={formData.destination}
          onChange={(e) => updateFormData({ destination: e.target.value })}
          className={errors.destination ? "border-destructive" : ""}
        />
        {errors.destination && <p className="text-sm text-destructive">{errors.destination}</p>}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="start_date">
            Data i godzina rozpoczęcia <span className="text-destructive">*</span>
          </Label>
          <Input
            id="start_date"
            type="datetime-local"
            value={dateToDateTimeLocal(formData.start_date)}
            onChange={(e) => updateFormData({ start_date: dateTimeLocalToDate(e.target.value) })}
            className={errors.start_date ? "border-destructive" : ""}
          />
          {errors.start_date && <p className="text-sm text-destructive">{errors.start_date}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="end_date">
            Data i godzina zakończenia <span className="text-destructive">*</span>
          </Label>
          <Input
            id="end_date"
            type="datetime-local"
            value={dateToDateTimeLocal(formData.end_date)}
            onChange={(e) => updateFormData({ end_date: dateTimeLocalToDate(e.target.value) })}
            min={dateToDateTimeLocal(formData.start_date)}
            className={errors.end_date ? "border-destructive" : ""}
          />
          {errors.end_date && <p className="text-sm text-destructive">{errors.end_date}</p>}
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="notes">Notatki</Label>
        <Textarea
          id="notes"
          placeholder="Dodaj dodatkowe notatki lub preferencje dotyczące podróży..."
          value={formData.notes}
          onChange={(e) => updateFormData({ notes: e.target.value })}
          rows={4}
        />
        <p className="text-sm text-muted-foreground">
          Uwzględnij wszelkie preferencje, specjalne wymagania lub pomysły dotyczące tej podróży.
        </p>
      </div>

      {error && <p className="text-sm text-destructive">{error}</p>}

      <div className="flex justify-between pt-4">
        <Button variant="outline" onClick={onCancel}>
          Anuluj
        </Button>
        <div>
          <Button variant="outline" onClick={handleSave} disabled={!isFormValid() || isLoading} className="mr-2">
            {isLoading ? "Zapisywanie..." : "Zapisz jako szkic"}
          </Button>
          <Button onClick={validateAndProceed} disabled={!isFormValid() || isLoading}>
            Dalej
          </Button>
        </div>
      </div>
    </div>
  );
}
