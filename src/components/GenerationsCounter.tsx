import { Progress } from "@/components/ui/progress";

interface GenerationsCounterProps {
  generationsRemaining: number;
}

/**
 * Displays the number of remaining free plan generations for the current month.
 * Shows a progress bar and information about when the limit resets.
 */
export function GenerationsCounter({ generationsRemaining }: GenerationsCounterProps) {
  const maxGenerations = 5;
  const progressValue = (generationsRemaining / maxGenerations) * 100;

  // Calculate next month's first day
  const today = new Date();
  const nextMonth = new Date(today.getFullYear(), today.getMonth() + 1, 1);
  const resetDate = nextMonth.toLocaleDateString("pl-PL", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-lg font-semibold">Limit generacji</h3>
        <p className="text-sm text-muted-foreground mt-1">
          Pozostało planów: {generationsRemaining}/{maxGenerations}
        </p>
      </div>

      <Progress value={progressValue} className="h-2" />

      <p className="text-xs text-muted-foreground">
        Limit odnowi się {resetDate}
      </p>
    </div>
  );
}

