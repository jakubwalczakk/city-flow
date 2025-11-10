import { useState } from "react";
import { Button } from "@/components/ui/button";
import { TravelPaceSelector } from "@/components/TravelPaceSelector";
import { PreferencesSelector } from "@/components/PreferencesSelector";
import type { TravelPace, UpdateProfileCommand } from "@/types";

interface PreferencesFormProps {
  initialPreferences: string[] | null;
  initialTravelPace: TravelPace | null;
  onSave: (data: UpdateProfileCommand) => Promise<void>;
  isSaving: boolean;
}

interface FormErrors {
  preferences?: string;
  travelPace?: string;
}

/**
 * Form for editing user preferences: travel pace and tourism tags.
 * Manages local form state, validation, and submission to the API.
 */
export function PreferencesForm({
  initialPreferences,
  initialTravelPace,
  onSave,
  isSaving,
}: PreferencesFormProps) {
  const [preferences, setPreferences] = useState<string[]>(
    initialPreferences || []
  );
  const [travelPace, setTravelPace] = useState<TravelPace | null>(
    initialTravelPace
  );
  const [errors, setErrors] = useState<FormErrors>({});

  /**
   * Validates the form data before submission.
   */
  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    // Validate preferences count
    if (preferences.length < 2) {
      newErrors.preferences = "Wybierz co najmniej 2 preferencje";
    } else if (preferences.length > 5) {
      newErrors.preferences = "Możesz wybrać maksymalnie 5 preferencji";
    }

    // Validate travel pace
    if (!travelPace) {
      newErrors.travelPace = "Wybierz tempo zwiedzania";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  /**
   * Handles form submission.
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Clear previous errors
    setErrors({});

    // Validate form
    if (!validateForm()) {
      return;
    }

    try {
      await onSave({
        preferences,
        travel_pace: travelPace!,
      });
    } catch (error) {
      // Error handling is done in the parent component
      console.error("Failed to save preferences:", error);
    }
  };

  // Check if form has changes
  const hasChanges =
    JSON.stringify(preferences) !== JSON.stringify(initialPreferences || []) ||
    travelPace !== initialTravelPace;

  // Check if form is valid
  const isValid = preferences.length >= 2 && preferences.length <= 5 && travelPace !== null;

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <TravelPaceSelector value={travelPace} onChange={setTravelPace} />
      {errors.travelPace && (
        <p className="text-sm text-destructive -mt-2">{errors.travelPace}</p>
      )}

      <PreferencesSelector
        value={preferences}
        onChange={setPreferences}
        error={errors.preferences}
      />

      <Button
        type="submit"
        disabled={!isValid || !hasChanges || isSaving}
        className="w-full sm:w-auto"
      >
        {isSaving ? "Zapisywanie..." : "Zapisz zmiany"}
      </Button>
    </form>
  );
}

