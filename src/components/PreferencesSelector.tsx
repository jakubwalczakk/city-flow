import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { AVAILABLE_PREFERENCES, PREFERENCE_LABELS, type TravelPreference } from "@/types";

interface PreferencesSelectorProps {
  value: string[];
  onChange: (value: string[]) => void;
  error?: string | null;
}

/**
 * Component for selecting 2-5 travel preferences from a predefined list.
 * Displays preferences as clickable badges that can be activated/deactivated.
 * Uses English keys internally but displays Polish labels.
 */
export function PreferencesSelector({
  value,
  onChange,
  error,
}: PreferencesSelectorProps) {
  const maxPreferences = 5;
  const minPreferences = 2;

  const handleTogglePreference = (preference: TravelPreference) => {
    if (value.includes(preference)) {
      // Remove preference
      onChange(value.filter((p) => p !== preference));
    } else {
      // Add preference if limit not reached
      if (value.length < maxPreferences) {
        onChange([...value, preference]);
      }
    }
  };

  const isSelected = (preference: TravelPreference) => value.includes(preference);
  const isMaxReached = value.length >= maxPreferences;

  return (
    <div className="space-y-3">
      <div>
        <Label>Preferencje turystyczne</Label>
        <p className="text-sm text-muted-foreground mt-1">
          Wybierz od {minPreferences} do {maxPreferences} preferencji
        </p>
      </div>

      <div className="flex flex-wrap gap-2">
        {AVAILABLE_PREFERENCES.map((preference) => {
          const selected = isSelected(preference);
          const disabled = !selected && isMaxReached;

          return (
            <Badge
              key={preference}
              variant={selected ? "default" : "outline"}
              className={`cursor-pointer transition-all ${
                disabled ? "opacity-50 cursor-not-allowed" : "hover:scale-105"
              }`}
              onClick={() => !disabled && handleTogglePreference(preference)}
            >
              {PREFERENCE_LABELS[preference]}
            </Badge>
          );
        })}
      </div>

      {error && <p className="text-sm text-destructive">{error}</p>}

      <p className="text-xs text-muted-foreground">
        Wybrano: {value.length}/{maxPreferences}
      </p>
    </div>
  );
}

