import { useState } from "react";
import type { PlanDetailsDto, UpdatePlanCommand } from "@/types";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

interface DraftPlanViewProps {
  plan: PlanDetailsDto;
}

/**
 * Displays the draft plan view with an editable form.
 * This view is shown when the plan status is 'draft'.
 */
export default function DraftPlanView({ plan }: DraftPlanViewProps) {
  const [notes, setNotes] = useState(plan.notes || "");
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const handleSave = async () => {
    setIsSaving(true);
    setSaveMessage(null);

    try {
      const command: UpdatePlanCommand = { notes };

      const response = await fetch(`/api/plans/${plan.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(command),
      });

      if (!response.ok) {
        throw new Error("Failed to save changes");
      }

      setSaveMessage({ type: "success", text: "Changes saved successfully!" });

      // Clear success message after 3 seconds
      setTimeout(() => setSaveMessage(null), 3000);
    } catch {
      setSaveMessage({
        type: "error",
        text: "Failed to save changes. Please try again.",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const hasChanges = notes !== (plan.notes || "");

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Plan w wersji roboczej</CardTitle>
          <CardDescription>
            Ten plan jest w statusie roboczym. Dodaj swoje notatki i preferencje, a następnie wygeneruj spersonalizowany
            plan podróży.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label className="text-base font-medium">Miejsce docelowe</Label>
            </div>
            <div className="rounded-md bg-muted p-3">
              <p className="text-sm">{plan.destination}</p>
            </div>
            <p className="text-xs text-muted-foreground">Miejsca docelowego nie można zmienić po utworzeniu planu.</p>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="notes" className="text-base font-medium">
                Notatki i preferencje podróży
              </Label>
            </div>
            <Textarea
              id="notes"
              placeholder="Dodaj notatki o swoim stylu podróżowania, zainteresowaniach, budżecie, ograniczeniach dietetycznych lub czymkolwiek innym, co pomoże stworzyć idealny plan..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={8}
              className="resize-none"
            />
            <p className="text-xs text-muted-foreground">
              Podziel się swoimi preferencjami, aby pomóc nam stworzyć spersonalizowany plan podróży. Uwzględnij takie
              rzeczy jak: obowiązkowe atrakcje, preferencje żywieniowe, poziom aktywności, kwestie budżetowe lub inne
              specjalne wymagania.
            </p>
          </div>

          {saveMessage && (
            <div
              className={`rounded-md p-3 text-sm ${
                saveMessage.type === "success"
                  ? "bg-green-50 text-green-800 border border-green-200"
                  : "bg-red-50 text-red-800 border border-red-200"
              }`}
            >
              {saveMessage.text}
            </div>
          )}

          <div className="flex items-center justify-between pt-4">
            <Button onClick={handleSave} disabled={!hasChanges || isSaving} variant="outline">
              {isSaving ? "Zapisywanie..." : "Zapisz zmiany"}
            </Button>

            <Button
              onClick={() => {
                // TODO: Implement plan generation
                alert("Plan generation will be implemented in a future step");
              }}
              size="lg"
            >
              Wygeneruj plan
              <svg className="ml-2 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Daty i godziny podróży</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-3 text-sm">
            <div className="flex items-center gap-2">
              <svg className="h-4 w-4 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
              <div className="flex flex-col">
                <span className="text-xs text-muted-foreground">Początek</span>
                <span className="font-medium">
                  {new Date(plan.start_date).toLocaleString("pl-PL", {
                    month: "long",
                    day: "numeric",
                    year: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                    hour12: false,
                  })}
                </span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <svg className="h-4 w-4 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
              <div className="flex flex-col">
                <span className="text-xs text-muted-foreground">Koniec</span>
                <span className="font-medium">
                  {new Date(plan.end_date).toLocaleString("pl-PL", {
                    month: "long",
                    day: "numeric",
                    year: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                    hour12: false,
                  })}
                </span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
